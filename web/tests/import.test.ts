import test from "node:test";
import assert from "node:assert/strict";
import {
  importSanityDocuments,
  portableMarkdown,
} from "../src/lib/content/sanity-import";
import { detailMetadata } from "../src/features/portal/metadata";
import { fixtures } from "./helpers";

test("Sanity import preserves slugs and ordered names; incomplete articles remain drafts", () => {
  const result = importSanityDocuments([
    { _id: "member-a", _type: "member", name: "Ana" },
    {
      _id: "pub-antiga",
      _type: "publication",
      title: { pt: "Título" },
      slug: {
        pt: { current: "endereco-antigo" },
        en: { current: "old-address" },
      },
      authors: [{ _ref: "member-a" }],
      externalAuthors: ["Bruno"],
    },
  ]);
  assert.equal(result.records[0].state, "drafts");
  assert.equal(result.records[0].record.slug.pt, "endereco-antigo");
  assert.deepEqual(result.records[0].record.authors, ["Ana", "Bruno"]);
  assert.ok(result.records[0].reasons.some((r) => r.includes("PGP")));
});
test("Portable Text converts headings, lists and marks to Markdown", () => {
  const markdown = portableMarkdown([
    { _type: "block", style: "h2", children: [{ text: "Assunto", marks: [] }] },
    {
      _type: "block",
      listItem: "bullet",
      children: [{ text: "Importante", marks: ["strong"] }],
    },
  ]);
  assert.match(markdown, /## Assunto/);
  assert.match(markdown, /- \*\*Importante\*\*/);
});
test("academic metadata uses plain author strings; blog has no Scholar tags", () => {
  const { item } = fixtures();
  const academic = detailMetadata(item, "pt");
  assert.deepEqual(academic.other?.citation_author, ["Ana", "Bruno"]);
  assert.deepEqual(detailMetadata({ ...item, kind: "post" }, "pt").other, {});
});
