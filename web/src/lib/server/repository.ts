import { createHash } from "node:crypto";
import { readdir, readFile, mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { contentPath } from "../content/codec";

export class PortalError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export type RepositoryState = { head: string; files: Record<string, string> };
export type Changes = Record<string, string | null>;
export interface Repository {
  read(): Promise<RepositoryState>;
  write(head: string, changes: Changes, message: string): Promise<string>;
}
function assertPaths(changes: Changes): void {
  if (
    !Object.keys(changes).length ||
    Object.keys(changes).some((p) => !contentPath.test(p))
  )
    throw new PortalError("Operação fora da pasta de conteúdo.");
}
export class LocalRepository implements Repository {
  constructor(
    private root: string,
    private writable = false,
  ) {}
  async read(): Promise<RepositoryState> {
    const files: Record<string, string> = {};
    const visit = async (dir: string): Promise<void> => {
      for (const entry of await readdir(dir, { withFileTypes: true }).catch(
        (e: NodeJS.ErrnoException) => {
          if (e.code === "ENOENT") return [];
          throw e;
        },
      )) {
        const file = path.join(dir, entry.name);
        if (entry.isDirectory()) await visit(file);
        else if (entry.isFile()) {
          const relative = path
            .relative(this.root, file)
            .split(path.sep)
            .join("/");
          if (contentPath.test(relative))
            files[relative] = await readFile(file, "utf8");
        }
      }
    };
    await visit(path.join(this.root, "content"));
    const ordered = Object.entries(files).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    return {
      head: createHash("sha256").update(JSON.stringify(ordered)).digest("hex"),
      files,
    };
  }
  async write(
    head: string,
    changes: Changes,
    _message: string,
  ): Promise<string> {
    assertPaths(changes);
    if (!this.writable)
      throw new PortalError(
        "Gravação local desativada. Configure a integração GitHub para publicar.",
        503,
      );
    if ((await this.read()).head !== head)
      throw new PortalError("O acervo mudou. Recarregue antes de salvar.", 409);
    for (const [file, value] of Object.entries(changes)) {
      const absolute = path.join(this.root, file);
      await mkdir(path.dirname(absolute), { recursive: true });
      if (value === null)
        await unlink(absolute).catch((e: NodeJS.ErrnoException) => {
          if (e.code !== "ENOENT") throw e;
        });
      else await writeFile(absolute, value);
    }
    return (await this.read()).head;
  }
}

export class GitHubRepository implements Repository {
  private blobs = new Map<string, string>();
  constructor(
    private repo: string,
    private branch: string,
    private token: string,
    private fetcher: typeof fetch = fetch,
  ) {
    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo) || !branch)
      throw new PortalError(
        "Configure GITHUB_REPOSITORY e GITHUB_BRANCH.",
        503,
      );
  }
  private async api<T>(
    endpoint: string,
    method = "GET",
    body?: unknown,
  ): Promise<T> {
    if (!this.token)
      throw new PortalError("A integração GitHub não está configurada.", 503);
    let response: Response;
    try {
      response = await this.fetcher(
        `https://api.github.com/repos/${this.repo}/${endpoint}`,
        {
          method,
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
          },
          body: body === undefined ? undefined : JSON.stringify(body),
          cache: "no-store",
          signal: AbortSignal.timeout(20000),
        },
      );
    } catch {
      throw new PortalError(
        "GitHub indisponível. Seu texto continua no editor; tente salvar novamente.",
        503,
      );
    }
    if (!response.ok) {
      console.error("[git] operação recusada", {
        method,
        status: response.status,
      });
      if (response.status === 409 || response.status === 422)
        throw new PortalError(
          "O acervo mudou durante a gravação. Recarregue para conferir as alterações.",
          409,
        );
      throw new PortalError(
        "Não foi possível acessar o GitHub. Confira a configuração ou tente novamente.",
        503,
      );
    }
    return response.json() as Promise<T>;
  }
  async read(): Promise<RepositoryState> {
    const ref = await this.api<{ object: { sha: string } }>(
      `git/ref/heads/${encodeURIComponent(this.branch)}`,
    );
    const commit = await this.api<{ tree: { sha: string } }>(
      `git/commits/${ref.object.sha}`,
    );
    const tree = await this.api<{
      truncated: boolean;
      tree: { path: string; type: string; sha: string; size?: number }[];
    }>(`git/trees/${commit.tree.sha}?recursive=1`);
    if (tree.truncated)
      throw new PortalError(
        "O índice do repositório excedeu o limite; sincronização interrompida.",
        503,
      );
    const files: Record<string, string> = {};
    const entries = tree.tree.filter(
      (e) => e.type === "blob" && contentPath.test(e.path),
    );
    // Bounded batches avoid flooding GitHub and the host with one request per file.
    for (let offset = 0; offset < entries.length; offset += 8)
      await Promise.all(
        entries.slice(offset, offset + 8).map(async (entry) => {
          if ((entry.size ?? 0) > 2000000)
            throw new PortalError(
              "Arquivo de conteúdo maior que o limite permitido.",
              503,
            );
          let text = this.blobs.get(entry.sha);
          if (text === undefined) {
            const blob = await this.api<{ content: string; encoding: string }>(
              `git/blobs/${entry.sha}`,
            );
            if (blob.encoding !== "base64")
              throw new PortalError("Formato inesperado no repositório.", 503);
            text = Buffer.from(blob.content, "base64").toString("utf8");
            this.blobs.set(entry.sha, text);
          }
          files[entry.path] = text;
        }),
      );
    if (this.blobs.size > 10000) this.blobs.clear();
    return { head: ref.object.sha, files };
  }
  async write(
    head: string,
    changes: Changes,
    message: string,
  ): Promise<string> {
    assertPaths(changes);
    const ref = await this.api<{ object: { sha: string } }>(
      `git/ref/heads/${encodeURIComponent(this.branch)}`,
    );
    if (ref.object.sha !== head)
      throw new PortalError("O acervo mudou. Recarregue antes de salvar.", 409);
    const base = await this.api<{ tree: { sha: string } }>(
      `git/commits/${head}`,
    );
    const tree: {
      path: string;
      mode: string;
      type: string;
      sha?: string | null;
      content?: string;
    }[] = Object.entries(changes).map(([file, value]) =>
      value === null
        ? { path: file, mode: "100644", type: "blob", sha: null }
        : { path: file, mode: "100644", type: "blob", content: value },
    );
    const nextTree = await this.api<{ sha: string }>("git/trees", "POST", {
      base_tree: base.tree.sha,
      tree,
    });
    const commit = await this.api<{ sha: string }>("git/commits", "POST", {
      message,
      tree: nextTree.sha,
      parents: [head],
    });
    // A non-fast-forward update fails if another writer advanced the branch.
    await this.api(
      `git/refs/heads/${encodeURIComponent(this.branch)}`,
      "PATCH",
      { sha: commit.sha, force: false },
    );
    return commit.sha;
  }
}
