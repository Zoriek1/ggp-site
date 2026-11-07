import test from "node:test";
import assert from "node:assert/strict";
import {
  draftScope,
  fingerprint,
  readLocalDrafts,
  reconcileSaved,
  writeLocalDraft,
  type DraftStorage,
} from "../src/features/admin/drafts";
import { record } from "./helpers";

function storage(): DraftStorage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    key: (i) => [...values.keys()][i] ?? null,
    getItem: (k) => values.get(k) ?? null,
    setItem: (k, v) => {
      values.set(k, v);
    },
    removeItem: (k) => {
      values.delete(k);
    },
  };
}
test("local copies recover unfinished fields and are isolated by account, record and tab", () => {
  const local = storage(),
    scope = draftScope("grupo", "items", "a");
  const incomplete = record("items", "a", {
    title: { pt: "", en: "" },
    slug: { pt: "endereco incompleto ", en: "" },
    authors: ["Ana", "", "x".repeat(241)],
    externalUrl: "https://",
    doi: "10.",
  });
  writeLocalDraft(local, scope, "tab-a", incomplete, "revision-a");
  writeLocalDraft(
    local,
    scope,
    "tab-b",
    { ...incomplete, title: { pt: "Outra aba", en: "" } },
    "revision-b",
  );
  const recovered = readLocalDrafts(local, scope);
  assert.equal(recovered.length, 2);
  assert.deepEqual(
    recovered.find((v) => v.revision === "revision-a")?.record.authors,
    ["Ana", "", "x".repeat(241)],
  );
  assert.equal(
    recovered.find((v) => v.revision === "revision-a")?.record.externalUrl,
    "https://",
  );
  assert.equal(
    readLocalDrafts(local, draftScope("outra-conta", "items", "a")).length,
    0,
  );
  assert.equal(
    readLocalDrafts(local, draftScope("grupo", "items", "b")).length,
    0,
  );
});
test("corrupt local data is ignored without deletion or overwriting server content", () => {
  const local = storage(),
    scope = draftScope("grupo", "items", "a");
  local.setItem(`ggp:editor:v2:${scope}:broken`, "not json");
  assert.deepEqual(readLocalDrafts(local, scope), []);
  assert.equal(local.length, 1);
});
test("server acknowledgement preserves newer typing and adopts the new server revision metadata", () => {
  const submitted = record("items", "a", {
    body: { pt: "Texto enviado", en: "" },
  });
  const current = {
    ...submitted,
    body: { pt: "Texto digitado depois do clique", en: "" },
  };
  const saved = {
    ...submitted,
    updatedAt: "2026-11-07T12:00:00.000Z",
    publishedAt: "2026-11-07T12:00:00.000Z",
  };
  const result = reconcileSaved(current, submitted, saved);
  assert.equal(result.dirty, true);
  assert.equal(result.record.body.pt, "Texto digitado depois do clique");
  assert.equal(result.record.updatedAt, saved.updatedAt);
  assert.equal(reconcileSaved(submitted, submitted, saved).dirty, false);
  assert.equal(fingerprint(submitted), fingerprint(saved));
});
