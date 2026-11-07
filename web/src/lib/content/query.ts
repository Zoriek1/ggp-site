import { field, type ContentRecord, type Lang } from "./model";

export const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function newest(a: ContentRecord, b: ContentRecord): number {
  return (
    (b.year ?? Number((b.publishedAt || b.updatedAt).slice(0, 4))) -
      (a.year ?? Number((a.publishedAt || a.updatedAt).slice(0, 4))) ||
    (b.publishedAt || b.updatedAt).localeCompare(
      a.publishedAt || a.updatedAt,
    ) ||
    a.id.localeCompare(b.id)
  );
}
export function queryRecords(
  records: ContentRecord[],
  filters: {
    q?: string;
    area?: string;
    keyword?: string;
    pgp?: string;
    year?: string;
    kind?: string;
  } = {},
): ContentRecord[] {
  const terms = normalize(filters.q || "")
    .split(/\s+/)
    .filter(Boolean);
  return records
    .filter(
      (r) =>
        !r.archived &&
        (!filters.area || r.areaIds.includes(filters.area)) &&
        (!filters.keyword || r.keywordIds.includes(filters.keyword)) &&
        (!filters.pgp || r.pgpIds.includes(filters.pgp)) &&
        (!filters.year ||
          String(r.year ?? r.publishedAt?.slice(0, 4)) === filters.year) &&
        (!filters.kind || r.kind === filters.kind) &&
        terms.every((term) =>
          normalize(
            [
              r.title.pt,
              r.title.en,
              r.summary.pt,
              r.summary.en,
              r.body.pt,
              r.body.en,
              ...r.authors,
            ].join(" "),
          ).includes(term),
        ),
    )
    .sort(newest);
}
export function guideItems(
  guide: ContentRecord,
  records: ContentRecord[],
): ContentRecord[] {
  const items = records.filter((r) => r.collection === "items" && !r.archived);
  const selected = [...new Set(guide.selectedIds)]
    .map((id) => items.find((r) => r.id === id))
    .filter((r): r is ContentRecord => !!r);
  const ids = new Set(selected.map((r) => r.id));
  return [
    ...selected,
    ...items
      .filter(
        (r) =>
          !ids.has(r.id) &&
          guide.keywordIds.some((id) => r.keywordIds.includes(id)),
      )
      .sort(newest),
  ];
}
export function bySlug(
  records: ContentRecord[],
  collection: string,
  slug: string,
): ContentRecord | undefined {
  return records.find(
    (r) =>
      r.collection === collection &&
      !r.archived &&
      [r.slug.pt, r.slug.en].includes(slug),
  );
}
export function recordSection(
  record: ContentRecord,
):
  | "publications"
  | "blog"
  | "pgps"
  | "guides"
  | "areas"
  | "keywords"
  | "about"
  | "contact"
  | "pages" {
  if (record.collection === "items")
    return ["post", "notice"].includes(record.kind) ? "blog" : "publications";
  if (record.collection === "pages")
    return record.pageKind === "free"
      ? "pages"
      : record.pageKind === "contact"
        ? "contact"
        : "about";
  return record.collection === "settings"
    ? "about"
    : (record.collection as "pgps" | "guides" | "areas" | "keywords");
}
export const recordSlug = (r: ContentRecord, lang: Lang) => field(r.slug, lang);
