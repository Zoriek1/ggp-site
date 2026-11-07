import test from "node:test";
import assert from "node:assert/strict";
import { GitHubRepository } from "../src/lib/server/repository";

test("Git read is restricted to content and decodes blobs", async () => {
  const calls: string[] = [];
  const fetcher: typeof fetch = async (input) => {
    const url = String(input);
    calls.push(url);
    let body: unknown;
    if (url.includes("git/ref/")) body = { object: { sha: "head" } };
    else if (url.includes("git/commits/")) body = { tree: { sha: "tree" } };
    else if (url.includes("git/trees/"))
      body = {
        truncated: false,
        tree: [
          { path: "content/drafts/items/a/pt.md", type: "blob", sha: "body" },
          { path: "web/src/code.ts", type: "blob", sha: "secret" },
        ],
      };
    else
      body = {
        encoding: "base64",
        content: Buffer.from("texto").toString("base64"),
      };
    return Response.json(body);
  };
  const repo = new GitHubRepository(
    "group/portal",
    "main",
    "fixture-token",
    fetcher,
  );
  const result = await repo.read();
  assert.equal(result.files["content/drafts/items/a/pt.md"], "texto");
  assert.equal(
    calls.some((c) => c.endsWith("secret")),
    false,
  );
});
test("Git publication is one commit and never forces the branch", async () => {
  const calls: {
    url: string;
    method?: string;
    body?: Record<string, unknown>;
  }[] = [];
  const fetcher: typeof fetch = async (input, options) => {
    const url = String(input),
      body = options?.body ? JSON.parse(String(options.body)) : undefined;
    calls.push({ url, method: options?.method, body });
    if (url.includes("git/ref/"))
      return Response.json({ object: { sha: "head" } });
    if (url.endsWith("git/commits/head"))
      return Response.json({ tree: { sha: "tree" } });
    return Response.json({
      sha: url.endsWith("git/trees") ? "new-tree" : "new-commit",
    });
  };
  const repo = new GitHubRepository(
    "group/portal",
    "main",
    "fixture-token",
    fetcher,
  );
  const changes = {
    "content/published/items/a/meta.yaml": "id: a",
    "content/published/items/a/pt.md": "PT",
    "content/published/items/a/en.md": "EN",
  };
  assert.equal(await repo.write("head", changes, "publish"), "new-commit");
  assert.equal(
    calls.filter((c) => c.url.endsWith("git/commits") && c.method === "POST")
      .length,
    1,
  );
  assert.equal(calls.at(-1)?.body?.force, false);
  assert.equal(
    (calls.find((c) => c.url.endsWith("git/trees"))?.body?.tree as unknown[])
      .length,
    3,
  );
  await assert.rejects(
    repo.write("head", { "web/src/code.ts": "no" }, "bad"),
    /fora da pasta/,
  );
});
test("Git rejects moved heads, race updates and unavailable service without claiming success", async () => {
  const moved: typeof fetch = async () =>
    Response.json({ object: { sha: "newer" } });
  await assert.rejects(
    new GitHubRepository("group/portal", "main", "token", moved).write(
      "old",
      { "content/drafts/items/a/pt.md": "PT" },
      "save",
    ),
    { status: 409 },
  );
  const offline: typeof fetch = async () => {
    throw new Error("network");
  };
  await assert.rejects(
    new GitHubRepository("group/portal", "main", "token", offline).read(),
    { status: 503 },
  );
  const race: typeof fetch = async (input, options) => {
    if (options?.method === "PATCH")
      return Response.json({ message: "not fast forward" }, { status: 422 });
    if (String(input).includes("git/ref/"))
      return Response.json({ object: { sha: "head" } });
    if (String(input).endsWith("git/commits/head"))
      return Response.json({ tree: { sha: "tree" } });
    return Response.json({ sha: "new" });
  };
  await assert.rejects(
    new GitHubRepository("group/portal", "main", "token", race).write(
      "head",
      { "content/drafts/items/a/pt.md": "PT" },
      "save",
    ),
    { status: 409 },
  );
});
