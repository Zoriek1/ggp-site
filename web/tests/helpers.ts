import {
  createRecord,
  type Collection,
  type ContentRecord,
} from "../src/lib/content/model";
import { serializeRecord } from "../src/lib/content/codec";
import {
  PortalError,
  type Repository,
  type Changes,
  type RepositoryState,
} from "../src/lib/server/repository";

export function record(
  collection: Collection,
  id: string,
  overrides: Partial<ContentRecord> = {},
): ContentRecord {
  return {
    ...createRecord(collection, id),
    title: { pt: id, en: "" },
    ...overrides,
  };
}
export function fixtures() {
  const pgp = record("pgps", "pgp-a"),
    pgp2 = record("pgps", "pgp-b"),
    area = record("areas", "fisica"),
    keyword = record("keywords", "astronomia");
  const item = record("items", "artigo-a", {
    kind: "article",
    authors: ["Ana", "Bruno"],
    pgpIds: [pgp.id, pgp2.id],
    areaIds: [area.id],
    keywordIds: [keyword.id],
    body: { pt: "Texto de estudo.", en: "" },
    year: 2026,
  });
  return {
    pgp,
    pgp2,
    area,
    keyword,
    item,
    records: [pgp, pgp2, area, keyword, item],
  };
}
export class MemoryRepository implements Repository {
  files: Record<string, string> = {};
  head = "head-0";
  fail = false;
  writes: Changes[] = [];
  constructor(records: ContentRecord[] = []) {
    for (const r of records)
      Object.assign(this.files, serializeRecord(r, "published"));
  }
  async read(): Promise<RepositoryState> {
    if (this.fail) throw new PortalError("Indisponível", 503);
    return { head: this.head, files: { ...this.files } };
  }
  async write(head: string, changes: Changes): Promise<string> {
    if (this.fail) throw new PortalError("Indisponível", 503);
    if (head !== this.head) throw new PortalError("Conflito", 409);
    this.writes.push(changes);
    for (const [file, text] of Object.entries(changes))
      if (text === null) delete this.files[file];
      else this.files[file] = text;
    this.head = `head-${this.writes.length}`;
    return this.head;
  }
}
