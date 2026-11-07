import test from "node:test";
import assert from "node:assert/strict";
import { ContentStore } from "../src/lib/server/store";
import { bySlug } from "../src/lib/content/query";
import { contentHref } from "../src/i18n/routes";
import { MemoryRepository, fixtures } from "./helpers";
import { canonicalAddress } from "../src/lib/content/address";

test("publishing renamed URLs reserves old PT/EN addresses and resolves directly to the latest version", async () => {
  const { item, records } = fixtures(),
    store = new ContentStore(new MemoryRepository(records));
  let entry = store
    .entries(await store.get())
    .find((e) => e.record.id === item.id)!;
  const renamed = { ...item, slug: { pt: "novo-endereco", en: "new-address" } };
  entry = await store.mutate({
    record: renamed,
    revision: entry.revision,
    action: "publish",
    actor: "grupo",
  });
  assert.ok(entry.record.previousSlugs.pt.includes("artigo-a"));
  assert.ok(entry.record.previousSlugs.en.includes("artigo-a"));
  assert.equal(
    contentHref(
      bySlug((await store.get()).published, "items", "artigo-a")!,
      "pt",
    ),
    "/pt/publicacoes/novo-endereco",
  );
  entry = await store.mutate({
    record: {
      ...entry.record,
      slug: { pt: "terceiro", en: "third" },
      previousSlugs: { pt: [], en: [] },
    },
    revision: entry.revision,
    action: "publish",
    actor: "grupo",
  });
  assert.ok(entry.record.previousSlugs.pt.includes("artigo-a"));
  assert.ok(entry.record.previousSlugs.pt.includes("novo-endereco"));
  assert.ok(entry.record.previousSlugs.en.includes("new-address"));
  assert.equal(
    canonicalAddress("/pt/publicacoes/artigo-a", (await store.get()).published),
    "/pt/publicacoes/terceiro",
  );
  assert.equal(
    canonicalAddress(
      "/en/publications/new-address",
      (await store.get()).published,
    ),
    "/en/publications/third",
  );
  assert.equal(
    contentHref(
      bySlug((await store.get()).published, "items", "novo-endereco")!,
      "pt",
    ),
    "/pt/publicacoes/terceiro",
  );
  await assert.rejects(
    store.mutate({
      record: { ...item, id: "outra-publicacao" },
      revision: null,
      action: "publish",
      actor: "grupo",
    }),
    { status: 422 },
  );
});
test("draft address changes do not change the URL returned by Ver publicação", async () => {
  const { item, records } = fixtures(),
    store = new ContentStore(new MemoryRepository(records));
  const initial = store
    .entries(await store.get())
    .find((e) => e.record.id === item.id)!;
  const draft = await store.mutate({
    record: { ...item, slug: { pt: "so-no-rascunho", en: "" } },
    revision: initial.revision,
    action: "draft",
    actor: "grupo",
  });
  assert.equal(
    contentHref(draft.publishedRecord!, "pt"),
    "/pt/publicacoes/artigo-a",
  );
  assert.equal(
    bySlug((await store.get()).published, "items", "so-no-rascunho"),
    undefined,
  );
  assert.deepEqual(draft.record.previousSlugs, { pt: [], en: [] });
});
test("publications cannot claim an address used in another language", async () => {
  const { item, records } = fixtures();
  const store = new ContentStore(new MemoryRepository(records));
  const initial = store
    .entries(await store.get())
    .find((e) => e.record.id === item.id)!;
  await store.mutate({
    record: { ...item, slug: { pt: item.slug.pt, en: "english-address" } },
    revision: initial.revision,
    action: "publish",
    actor: "grupo",
  });
  await assert.rejects(
    store.mutate({
      record: { ...item, id: "outro", slug: { pt: "english-address", en: "" } },
      revision: null,
      action: "publish",
      actor: "grupo",
    }),
    { status: 422 },
  );
});
