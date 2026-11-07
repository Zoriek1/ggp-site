import {
  createRecord,
  publishErrors,
  recordSchema,
  slugify,
  type ContentRecord,
  type Collection,
} from "./model";

export type SanityDocument = {
  _id: string;
  _type: string;
  [key: string]: unknown;
};
type Obj = Record<string, unknown>;
const object = (value: unknown): Obj =>
  value && typeof value === "object" ? (value as Obj) : {};
const string = (value: unknown): string =>
  typeof value === "string" ? value : "";
const array = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];
const localized = (value: unknown) =>
  typeof value === "string"
    ? { pt: value, en: "" }
    : { pt: string(object(value).pt), en: string(object(value).en) };
const ids = (value: unknown) =>
  array(value)
    .map((v) => string(object(v)._ref))
    .filter(Boolean);
const supported: Record<string, Collection> = {
  publication: "items",
  pgp: "pgps",
  researchArea: "areas",
  physicsTopic: "keywords",
  tag: "keywords",
  page: "pages",
  siteSettings: "settings",
};

export function portableMarkdown(
  value: unknown,
  assets = new Map<string, string>(),
): string {
  return array(value)
    .map((raw) => {
      const block = object(raw);
      if (block._type === "image") {
        const url = assets.get(string(object(block.asset)._ref));
        return url
          ? `![${string(block.alt).replace(/[\[\]]/g, "")}](${url})`
          : "";
      }
      if (block._type !== "block") return "";
      const definitions = array(block.markDefs).map(object);
      let text = array(block.children)
        .map((rawSpan) => {
          const span = object(rawSpan);
          let result = string(span.text).replace(/([\\`*_[\]<>])/g, "\\$1");
          for (const mark of array(span.marks)) {
            if (mark === "strong") result = `**${result}**`;
            else if (mark === "em") result = `*${result}*`;
            else if (mark === "code") result = `\`${result}\``;
            else {
              const link = definitions.find(
                (d) => d._key === mark && d._type === "link",
              );
              const href = string(link?.href);
              if (/^https?:\/\//.test(href))
                result = `[${result}](${href.replace(/\)/g, "%29")})`;
            }
          }
          return result;
        })
        .join("");
      if (/^h[1-6]$/.test(string(block.style)))
        text = `${"#".repeat(Number(string(block.style).slice(1)))} ${text}`;
      if (block.style === "blockquote") text = `> ${text}`;
      if (block.listItem)
        text = `${"  ".repeat(Math.max(0, Number(block.level || 1) - 1))}${block.listItem === "number" ? "1." : "-"} ${text}`;
      return text;
    })
    .filter(Boolean)
    .join("\n\n");
}

export function importSanityDocuments(
  documents: SanityDocument[],
  now = new Date().toISOString(),
): {
  records: {
    record: ContentRecord;
    state: "published" | "drafts";
    reasons: string[];
  }[];
  skipped: string[];
} {
  const assets = new Map(
    documents
      .filter((d) =>
        ["sanity.imageAsset", "sanity.fileAsset"].includes(d._type),
      )
      .map((d) => [d._id, string(d.url)]),
  );
  const members = new Map(
    documents
      .filter((d) => d._type === "member")
      .map((d) => [d._id, string(d.name)]),
  );
  const converted: { record: ContentRecord; draft: boolean }[] = [];
  const skipped: string[] = [];
  for (const doc of documents) {
    const collection = supported[doc._type];
    if (!collection) {
      if (!doc._type.startsWith("sanity.") && doc._type !== "member")
        skipped.push(`${doc._type}:${doc._id}`);
      continue;
    }
    const id = slugify(doc._id.replace(/^drafts\./, ""));
    const title = localized(doc.title || doc.name || doc.label || doc.siteName);
    const slug = object(doc.slug);
    const record = createRecord(collection, id);
    record.title = title.pt ? title : { pt: id, en: "" };
    record.slug = {
      pt: string(object(slug.pt).current) || slugify(title.pt || id),
      en: string(object(slug.en).current),
    };
    record.summary = localized(
      doc.abstract || doc.description || doc.seoDescription || doc.tagline,
    );
    record.body = {
      pt: portableMarkdown(object(doc.body || doc.heroIntro).pt, assets),
      en: portableMarkdown(object(doc.body || doc.heroIntro).en, assets),
    };
    record.authors = [
      ...ids(doc.authors)
        .map((id) => members.get(id))
        .filter((name): name is string => !!name),
      ...array(doc.externalAuthors).map(string).filter(Boolean),
    ];
    record.areaIds = ids(doc.researchAreas).map(slugify);
    record.keywordIds = [...ids(doc.topics), ...ids(doc.tags)].map(slugify);
    record.pgpIds = ids(doc.pgps).map(slugify);
    record.institution = string(doc.school);
    record.kind = doc._type === "publication" ? "article" : "text";
    record.year = typeof doc.year === "number" ? doc.year : undefined;
    record.venue = string(doc.venue);
    record.doi = string(doc.doi);
    record.externalUrl = string(doc.externalUrl);
    record.featured = doc.featured === true;
    record.pageKind =
      doc.kind === "about"
        ? "about"
        : doc.kind === "contact"
          ? "contact"
          : "free";
    record.contactEmail = string(doc.contactEmail);
    record.links = Object.entries(object(doc.social))
      .filter(([, v]) => typeof v === "string" && /^https?:\/\//.test(v))
      .map(([label, url]) => ({ label, url: string(url) }));
    const pdf =
      string(doc.pdfUrl) ||
      assets.get(string(object(object(doc.pdfFile).asset)._ref));
    if (pdf)
      record.attachments.push({ url: pdf, label: "PDF", type: "pdf", alt: "" });
    record.updatedAt = string(doc._updatedAt) || now;
    record.publishedAt = string(doc.publishedDate)
      ? string(doc.publishedDate).includes("T")
        ? string(doc.publishedDate)
        : `${string(doc.publishedDate)}T00:00:00.000Z`
      : string(doc._createdAt) || undefined;
    converted.push({
      record: recordSchema.parse(record),
      draft: doc._id.startsWith("drafts."),
    });
  }
  // Existing published versions survive when the export also includes their draft.
  const candidates = converted.filter((v) => !v.draft).map((v) => v.record);
  const records = converted.map(({ record, draft }) => {
    const reasons = publishErrors(record, candidates);
    return {
      record,
      state:
        draft || reasons.length ? ("drafts" as const) : ("published" as const),
      reasons,
    };
  });
  // If a linked document could not be published, dependent records remain drafts too.
  let changed = true;
  while (changed) {
    changed = false;
    const published = records
      .filter((v) => v.state === "published")
      .map((v) => v.record);
    for (const entry of records.filter((v) => v.state === "published")) {
      const errors = publishErrors(entry.record, published);
      if (errors.length) {
        entry.state = "drafts";
        entry.reasons.push(...errors);
        changed = true;
      }
    }
  }
  const unique = new Map<string, (typeof records)[number]>();
  records.forEach((entry, index) => {
    const key = `${entry.state}/${entry.record.collection}/${entry.record.id}`;
    if (!unique.has(key) || converted[index].draft) unique.set(key, entry);
  });
  return { records: [...unique.values()], skipped };
}
