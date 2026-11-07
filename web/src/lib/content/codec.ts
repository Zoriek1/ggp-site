import { createHash } from "node:crypto";
import { parse, stringify } from "yaml";
import {
  recordSchema,
  keyOf,
  publishErrors,
  type ContentRecord,
  type Snapshot,
} from "./model";

export const contentPath =
  /^content\/(published|drafts)\/(items|pgps|areas|keywords|guides|pages|settings)\/[a-z0-9][a-z0-9-]{0,95}\/(meta\.yaml|pt\.md|en\.md)$/;
export function serializeRecord(
  record: ContentRecord,
  state: "published" | "drafts",
): Record<string, string> {
  const { body, ...meta } = recordSchema.parse(record);
  const base = `content/${state}/${keyOf(record)}`;
  return {
    [`${base}/meta.yaml`]: stringify(meta),
    [`${base}/pt.md`]: body.pt,
    [`${base}/en.md`]: body.en,
  };
}
export function recordRevision(
  files: Record<string, string>,
  collection: string,
  id: string,
  state: "published" | "drafts",
): string | null {
  const base = `content/${state}/${collection}/${id}/`;
  const entries = Object.entries(files)
    .filter(([path]) => path.startsWith(base))
    .sort(([a], [b]) => a.localeCompare(b));
  return entries.length
    ? createHash("sha256").update(JSON.stringify(entries)).digest("hex")
    : null;
}
export function parseSnapshot(
  files: Record<string, string>,
  head: string,
): Snapshot {
  const snapshot: Snapshot = {
    files,
    head,
    published: [],
    drafts: [],
    loadedAt: Date.now(),
  };
  for (const [path, yaml] of Object.entries(files)) {
    if (!contentPath.test(path))
      throw new Error(`Arquivo de conteúdo não permitido: ${path}`);
    if (!path.endsWith("/meta.yaml")) {
      if (!files[`${path.slice(0, path.lastIndexOf("/") + 1)}meta.yaml`])
        throw new Error(`Texto sem metadados: ${path}`);
      continue;
    }
    const [, state, collection, id] = path.split("/");
    const base = path.slice(0, -"meta.yaml".length);
    const record = recordSchema.parse({
      ...parse(yaml, { maxAliasCount: 0 }),
      body: {
        pt: files[`${base}pt.md`] ?? "",
        en: files[`${base}en.md`] ?? "",
      },
    });
    if (record.collection !== collection || record.id !== id)
      throw new Error(`Identidade inconsistente: ${path}`);
    snapshot[state === "published" ? "published" : "drafts"].push(record);
  }
  // A published record must not depend on absent/archived entities. Drafts may be incomplete.
  const publishedKeys = new Set(snapshot.published.map(keyOf));
  for (const record of snapshot.published.filter((r) => !r.archived)) {
    const errors = publishErrors(record, snapshot.published);
    if (errors.length)
      throw new Error(
        `Publicação inválida (${record.id}): ${errors.join(" ")}`,
      );
    for (const [collection, ids] of [
      ["pgps", record.pgpIds],
      ["areas", record.areaIds],
      ["keywords", record.keywordIds],
      ["items", record.selectedIds],
    ] as const) {
      for (const id of ids)
        if (!publishedKeys.has(`${collection}/${id}`))
          throw new Error(`Referência ausente em ${record.id}: ${id}`);
    }
  }
  const slugs = new Set<string>();
  for (const record of snapshot.published)
    for (const lang of ["pt", "en"] as const) {
      const slug = `${record.collection}/${lang}/${record.slug[lang] || record.slug.pt}`;
      if (slugs.has(slug)) throw new Error(`Endereço duplicado: ${slug}`);
      slugs.add(slug);
    }
  return snapshot;
}
