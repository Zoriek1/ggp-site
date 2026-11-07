import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import {
  collections,
  keyOf,
  recordSchema,
  publishErrors,
  type Collection,
  type ContentRecord,
  type Snapshot,
  type VersionedRecord,
} from "../content/model";
import {
  parseSnapshot,
  recordRevision,
  serializeRecord,
} from "../content/codec";
import {
  GitHubRepository,
  LocalRepository,
  PortalError,
  type Repository,
  type Changes,
} from "./repository";

export type Action = "draft" | "publish" | "unpublish" | "archive";
export class ContentStore {
  private snapshot?: Snapshot;
  private checkedAt = 0;
  private refreshing?: Promise<Snapshot>;
  private queue: Promise<unknown> = Promise.resolve();
  constructor(
    private repository: Repository,
    private cacheFile?: string,
  ) {}
  private async persist(snapshot: Snapshot): Promise<void> {
    if (!this.cacheFile) return;
    try {
      await mkdir(path.dirname(this.cacheFile), { recursive: true });
      await writeFile(
        `${this.cacheFile}.tmp`,
        JSON.stringify({ files: snapshot.files, head: snapshot.head }),
      );
      await rename(`${this.cacheFile}.tmp`, this.cacheFile);
    } catch {
      console.error("[content] não foi possível persistir o snapshot");
    }
  }
  async get(fresh = false): Promise<Snapshot> {
    if (!fresh && this.snapshot && Date.now() - this.checkedAt < 60000)
      return this.snapshot;
    if (this.refreshing) {
      try {
        return await this.refreshing;
      } catch (error) {
        if (fresh || !this.snapshot) throw error;
        return this.snapshot;
      }
    }
    this.refreshing = (async () => {
      const { files, head } = await this.repository.read();
      const snapshot = parseSnapshot(files, head);
      this.snapshot = snapshot;
      this.checkedAt = Date.now();
      await this.persist(snapshot);
      return snapshot;
    })();
    try {
      return await this.refreshing;
    } catch (error) {
      if (fresh) throw error;
      if (!this.snapshot && this.cacheFile)
        try {
          const cached = JSON.parse(await readFile(this.cacheFile, "utf8"));
          this.snapshot = parseSnapshot(cached.files, cached.head);
        } catch {
          /* No verified snapshot is available. */
        }
      if (this.snapshot) {
        console.error(
          "[content] sincronização indisponível; mantendo snapshot válido",
        );
        this.checkedAt = Date.now();
        return this.snapshot;
      }
      throw error;
    } finally {
      this.refreshing = undefined;
    }
  }
  entries(snapshot: Snapshot): VersionedRecord[] {
    const keys = new Set(
      [...snapshot.published, ...snapshot.drafts].map(keyOf),
    );
    return [...keys].map((key) => {
      const draft = snapshot.drafts.find((r) => keyOf(r) === key);
      const published = snapshot.published.find((r) => keyOf(r) === key);
      const record = draft || published!;
      const draftRevision = recordRevision(
        snapshot.files,
        record.collection,
        record.id,
        "drafts",
      );
      const publishedRevision = recordRevision(
        snapshot.files,
        record.collection,
        record.id,
        "published",
      );
      const revision = createHash("sha256")
        .update(JSON.stringify([publishedRevision, draftRevision]))
        .digest("hex");
      return {
        record,
        published: !!published && !published.archived,
        hasDraft: !!draft,
        revision,
        draftRevision,
      };
    });
  }
  async mutate(input: {
    record: ContentRecord;
    revision: string | null;
    action: Action;
    actor: string;
  }): Promise<VersionedRecord> {
    const execute = async () => {
      const snapshot = await this.get(true); // Writes never use stale/offline snapshots.
      const record = recordSchema.parse(input.record);
      const existing = this.entries(snapshot).find(
        (e) => keyOf(e.record) === keyOf(record),
      );
      if ((existing?.revision ?? null) !== input.revision)
        throw new PortalError(
          "Outra pessoa alterou este registro. Copie seu texto e recarregue para comparar.",
          409,
        );
      const original = snapshot.published.find(
        (r) => keyOf(r) === keyOf(record),
      );
      const changes: Changes = {};
      const remove = (state: "published" | "drafts") => {
        for (const file of Object.keys(snapshot.files))
          if (file.startsWith(`content/${state}/${keyOf(record)}/`))
            changes[file] = null;
      };
      record.updatedAt = new Date().toISOString();
      if (input.action === "draft")
        Object.assign(changes, serializeRecord(record, "drafts"));
      if (input.action === "publish") {
        record.archived = false;
        record.publishedAt =
          original?.publishedAt || record.publishedAt || record.updatedAt;
        const errors = publishErrors(record, snapshot.published);
        if (errors.length) throw new PortalError(errors.join(" "), 422);
        Object.assign(changes, serializeRecord(record, "published"));
        remove("drafts");
      }
      if (input.action === "unpublish") {
        if (!original)
          throw new PortalError("Este registro ainda não está publicado.");
        const referencing = snapshot.published.filter(
          (r) =>
            keyOf(r) !== keyOf(record) &&
            !r.archived &&
            [
              ...r.pgpIds,
              ...r.areaIds,
              ...r.keywordIds,
              ...r.selectedIds,
            ].includes(record.id),
        );
        if (referencing.length)
          throw new PortalError(
            "Há conteúdos publicados associados a este registro. Remova os vínculos antes de retirar a publicação.",
            409,
          );
        Object.assign(changes, serializeRecord(record, "drafts"));
        remove("published");
      }
      if (input.action === "archive") {
        record.archived = true;
        // Archived entities keep their identity so existing links remain resolvable.
        Object.assign(
          changes,
          serializeRecord(
            original
              ? { ...original, archived: true, updatedAt: record.updatedAt }
              : record,
            original ? "published" : "drafts",
          ),
        );
        if (original) remove("drafts");
      }
      const nextFiles = { ...snapshot.files };
      for (const [file, value] of Object.entries(changes)) {
        if (value === null) delete nextFiles[file];
        else nextFiles[file] = value;
      }
      const next = parseSnapshot(nextFiles, "pending");
      const head = await this.repository.write(
        snapshot.head,
        changes,
        `${input.action}: ${record.collection}/${record.id} (${input.actor})`,
      );
      next.head = head;
      this.snapshot = next;
      this.checkedAt = Date.now();
      await this.persist(next);
      return this.entries(next).find((e) => keyOf(e.record) === keyOf(record))!;
    };
    const operation = this.queue.then(execute, execute);
    this.queue = operation.catch(() => undefined);
    return operation;
  }
}

const globalStore = globalThis as typeof globalThis & {
  ggpContentStore?: ContentStore;
};
export function contentStore(): ContentStore {
  if (!globalStore.ggpContentStore) {
    const root = process.env.CONTENT_ROOT || path.resolve(process.cwd(), "..");
    const github =
      process.env.CONTENT_DRIVER === "github" ||
      (!process.env.CONTENT_DRIVER && !!process.env.GITHUB_REPOSITORY);
    const repository = github
      ? new GitHubRepository(
          process.env.GITHUB_REPOSITORY || "",
          process.env.GITHUB_BRANCH || "main",
          process.env.GITHUB_TOKEN || "",
        )
      : new LocalRepository(
          root,
          process.env.CONTENT_ALLOW_LOCAL_WRITES === "true" &&
            process.env.NODE_ENV !== "production",
        );
    globalStore.ggpContentStore = new ContentStore(
      repository,
      process.env.CONTENT_CACHE_DIR
        ? path.join(process.env.CONTENT_CACHE_DIR, "snapshot.json")
        : undefined,
    );
  }
  return globalStore.ggpContentStore;
}
export async function getPublicContent(): Promise<ContentRecord[]> {
  return (await contentStore().get()).published.filter((r) => !r.archived);
}
export function validCollection(value: string): value is Collection {
  return collections.includes(value as Collection);
}
