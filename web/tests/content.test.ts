import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { field, publishErrors, recordSchema } from "../src/lib/content/model";
import { guideItems, queryRecords } from "../src/lib/content/query";
import { parseSnapshot, serializeRecord } from "../src/lib/content/codec";
import { ContentStore } from "../src/lib/server/store";
import { contentHref } from "../src/i18n/routes";
import { fixtures, MemoryRepository, record } from "./helpers";

test("authors are plain ordered strings and one article has one URL across PGPs", () => {
  const { records, item, pgp, pgp2 } = fixtures();
  assert.deepEqual(recordSchema.parse(item).authors, ["Ana", "Bruno"]);
  assert.equal(
    recordSchema.safeParse({ ...item, authors: [{ id: "account" }] }).success,
    false,
  );
  assert.equal(queryRecords(records, { pgp: pgp.id })[0].id, item.id);
  assert.equal(queryRecords(records, { pgp: pgp2.id })[0].id, item.id);
  assert.equal(contentHref(item, "pt"), "/pt/publicacoes/artigo-a");
  assert.equal(field({ pt: "Português", en: "" }, "en"), "Português");
});
test("guides use OR keywords, pin manually in order, deduplicate and ignore unrelated entries", () => {
  const { item, records } = fixtures();
  const manual = record("items", "manual", {
    kind: "text",
    body: { pt: "Leia", en: "" },
  });
  const unrelated = record("items", "outro");
  const guide = record("guides", "guia", {
    keywordIds: ["astronomia", "ondas"],
    selectedIds: [manual.id, item.id, manual.id],
  });
  assert.deepEqual(
    guideItems(guide, [...records, manual, unrelated]).map((r) => r.id),
    [manual.id, item.id],
  );
  assert.deepEqual(
    guideItems({ ...guide, keywordIds: [], selectedIds: [] }, records),
    [],
  );
  assert.equal(
    guideItems(
      guide,
      records.map((r) => ({ ...r, archived: true })),
    ).length,
    0,
  );
});
test("areas and filters are data driven and search ignores accents", () => {
  const { item } = fixtures();
  const custom = {
    ...item,
    title: { pt: "Óptica na escola", en: "" },
    areaIds: ["literatura"],
  };
  assert.equal(
    queryRecords([custom], { q: "optica", area: "literatura", year: "2026" })
      .length,
    1,
  );
  assert.equal(queryRecords([custom], { area: "matematica" }).length, 0);
});
test("publication validates PGPs, references, images, authors and unique URLs", () => {
  const { item, records } = fixtures();
  assert.deepEqual(publishErrors(item, records), []);
  assert.ok(
    publishErrors(
      {
        ...item,
        pgpIds: [],
        authors: [],
        body: { pt: "![](https://example.com/a.png)", en: "" },
      },
      records,
    ).length >= 3,
  );
  assert.ok(
    publishErrors({ ...item, id: "duplicado" }, records).some((e) =>
      e.includes("Endereço"),
    ),
  );
  assert.equal(
    recordSchema.safeParse({ ...item, externalUrl: "javascript:alert(1)" })
      .success,
    false,
  );
});
test("separate draft survives saves without replacing the public version; publishing is one commit", async () => {
  const { records, item } = fixtures(),
    repository = new MemoryRepository(records),
    store = new ContentStore(repository);
  let entry = store
    .entries(await store.get())
    .find((e) => e.record.id === item.id)!;
  const changed = {
    ...item,
    title: { pt: "Versão nova", en: "New version" },
    body: { pt: "Novo texto", en: "New text" },
  };
  entry = await store.mutate({
    record: changed,
    revision: entry.revision,
    action: "draft",
    actor: "grupo",
  });
  const draftSnapshot = await store.get();
  assert.equal(
    draftSnapshot.published.find((r) => r.id === item.id)?.title.pt,
    item.title.pt,
  );
  assert.equal(draftSnapshot.drafts[0].title.pt, "Versão nova");
  assert.ok(
    queryRecords(draftSnapshot.published, { q: "Versão nova" }).length === 0,
  );
  await store.mutate({
    record: entry.record,
    revision: entry.revision,
    action: "publish",
    actor: "grupo",
  });
  const snapshot = await store.get();
  assert.equal(
    snapshot.published.find((r) => r.id === item.id)?.body.en,
    "New text",
  );
  assert.equal(snapshot.drafts.length, 0);
  assert.equal(repository.writes.length, 2);
  assert.equal(Object.keys(repository.writes[1]).length, 6);
});
test("new published content joins keyword guides immediately", async () => {
  const { records, item } = fixtures(),
    store = new ContentStore(new MemoryRepository(records));
  const newItem = { ...item, id: "novo", slug: { pt: "novo", en: "" } };
  await store.mutate({
    record: newItem,
    revision: null,
    action: "publish",
    actor: "grupo",
  });
  assert.equal(
    guideItems(
      record("guides", "g", { keywordIds: ["astronomia"] }),
      (await store.get()).published,
    ).length,
    2,
  );
});
test("stale edits and edits to either draft or publication produce a conflict", async () => {
  const { records, item } = fixtures(),
    repository = new MemoryRepository(records),
    store = new ContentStore(repository);
  const initial = store
    .entries(await store.get())
    .find((e) => e.record.id === item.id)!;
  await store.mutate({
    record: item,
    revision: initial.revision,
    action: "draft",
    actor: "a",
  });
  await assert.rejects(
    store.mutate({
      record: item,
      revision: initial.revision,
      action: "publish",
      actor: "b",
    }),
    { status: 409 },
  );
  const current = store
    .entries(await store.get())
    .find((e) => e.record.id === item.id)!;
  Object.assign(
    repository.files,
    serializeRecord(
      { ...item, title: { pt: "Alteração externa", en: "" } },
      "published",
    ),
  );
  await assert.rejects(
    store.mutate({
      record: item,
      revision: current.revision,
      action: "publish",
      actor: "b",
    }),
    { status: 409 },
  );
});
test("outage and invalid upstream preserve last valid snapshot and block writes", async () => {
  const { records, item } = fixtures(),
    repository = new MemoryRepository(records),
    store = new ContentStore(repository);
  const initial = await store.get();
  repository.fail = true;
  await assert.rejects(
    store.mutate({ record: item, revision: null, action: "draft", actor: "a" }),
    { status: 503 },
  );
  assert.equal((await store.get()).head, initial.head);
  repository.fail = false;
  Object.assign(
    repository.files,
    serializeRecord({ ...item, pgpIds: [] }, "published"),
  );
  await assert.rejects(store.get(true), /Publicação inválida/);
  assert.equal(
    (await store.get()).published.find((r) => r.id === item.id)?.pgpIds.length,
    2,
  );
});
test("persistent verified cache survives an offline restart", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "ggp-cache-"));
  try {
    const repository = new MemoryRepository(fixtures().records),
      file = path.join(directory, "snapshot.json");
    const first = new ContentStore(repository, file);
    const initial = await first.get();
    repository.fail = true;
    const restarted = new ContentStore(repository, file);
    assert.equal((await restarted.get()).head, initial.head);
    await assert.rejects(restarted.get(true));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
test("unpublishing linked PGP is blocked; archive preserves reference identity", async () => {
  const { records, pgp } = fixtures(),
    store = new ContentStore(new MemoryRepository(records));
  const entry = store
    .entries(await store.get())
    .find((e) => e.record.id === pgp.id)!;
  await assert.rejects(
    store.mutate({
      record: pgp,
      revision: entry.revision,
      action: "unpublish",
      actor: "a",
    }),
    { status: 409 },
  );
  const archived = await store.mutate({
    record: pgp,
    revision: entry.revision,
    action: "archive",
    actor: "a",
  });
  assert.equal(archived.record.archived, true);
  assert.equal(
    (await store.get()).published.some((r) => r.id === pgp.id),
    true,
  );
});
test("snapshot rejects path traversal and orphan Markdown", () => {
  assert.throws(() =>
    parseSnapshot({ "content/published/../../code.ts": "bad" }, "head"),
  );
  assert.throws(
    () =>
      parseSnapshot({ "content/published/items/a/pt.md": "orphan" }, "head"),
    /sem metadados/,
  );
});
