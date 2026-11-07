import { z } from "zod";

export const collections = [
  "items",
  "pgps",
  "areas",
  "keywords",
  "guides",
  "pages",
  "settings",
] as const;
export const collectionSchema = z.enum(collections);
export type Collection = z.infer<typeof collectionSchema>;
export const kinds = ["article", "text", "material", "post", "notice"] as const;
export const idSchema = z
  .string()
  .regex(
    /^[a-z0-9][a-z0-9-]{0,95}$/,
    "Use letras minúsculas, números e hífens.",
  );
export const localizedSchema = z.object({
  pt: z.string().max(500000),
  en: z.string().max(500000).default(""),
});
const localizedTitle = localizedSchema.refine(
  (v) => v.pt.trim().length > 0 && v.pt.length <= 240,
  {
    message: "Informe um título em português (até 240 caracteres).",
    path: ["pt"],
  },
);
const url = z
  .string()
  .max(2048)
  .refine(
    (v) =>
      !v ||
      /^https?:\/\/[^\s]+$/i.test(v) ||
      /^\/media\/[a-f0-9]{64}\.(jpg|png|webp|pdf)$/.test(v),
    "Use uma URL HTTP(S) ou um arquivo enviado pelo painel.",
  );
export const attachmentSchema = z.object({
  url: url.refine((v) => !!v, "Informe a URL do arquivo."),
  label: z.string().max(240),
  alt: z.string().max(500).default(""),
  type: z.enum(["image", "pdf", "link"]).default("link"),
});
export const recordSchema = z.object({
  id: idSchema,
  collection: collectionSchema,
  title: localizedTitle,
  slug: z.object({
    pt: idSchema,
    en: z.union([idSchema, z.literal("")]).default(""),
  }),
  previousSlugs: z
    .object({
      pt: z.array(idSchema).max(1000).default([]),
      en: z.array(idSchema).max(1000).default([]),
    })
    .default({ pt: [], en: [] }),
  summary: localizedSchema.default({ pt: "", en: "" }),
  body: localizedSchema.default({ pt: "", en: "" }),
  kind: z.enum(kinds).default("text"),
  authors: z.array(z.string().trim().min(1).max(240)).max(100).default([]),
  pgpIds: z.array(idSchema).max(200).default([]),
  areaIds: z.array(idSchema).max(200).default([]),
  keywordIds: z.array(idSchema).max(200).default([]),
  selectedIds: z.array(idSchema).max(500).default([]),
  institution: z.string().max(240).default(""),
  year: z.number().int().min(1800).max(2200).optional(),
  venue: z.string().max(500).default(""),
  doi: z
    .string()
    .max(500)
    .refine((v) => !v || /^10\.\d{4,9}\/\S+$/.test(v), "DOI inválido.")
    .default(""),
  externalUrl: url.default(""),
  attachments: z.array(attachmentSchema).max(100).default([]),
  featured: z.boolean().default(false),
  archived: z.boolean().default(false),
  pageKind: z.enum(["about", "contact", "free"]).default("free"),
  contactEmail: z.union([z.email(), z.literal("")]).default(""),
  links: z
    .array(z.object({ label: z.string().max(120), url }))
    .max(30)
    .default([]),
  publishedAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime(),
});
export type ContentRecord = z.infer<typeof recordSchema>;
export type Lang = "pt" | "en";
export type VersionedRecord = {
  record: ContentRecord;
  revision: string | null;
  published: boolean;
  hasDraft: boolean;
  draftRevision?: string | null;
  publishedRecord?: ContentRecord;
};
export type Snapshot = {
  head: string;
  files: Record<string, string>;
  published: ContentRecord[];
  drafts: ContentRecord[];
  loadedAt: number;
};

export function field(
  value: { pt: string; en?: string } | undefined,
  lang: Lang,
): string {
  return value?.[lang] || value?.pt || "";
}
export function slugify(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 96) || "conteudo"
  );
}
export function createRecord(
  collection: Collection,
  id: string,
): ContentRecord {
  return recordSchema.parse({
    id,
    collection,
    title: { pt: "Sem título", en: "" },
    slug: { pt: id, en: "" },
    updatedAt: new Date().toISOString(),
  });
}
export function keyOf(
  record: Pick<ContentRecord, "collection" | "id">,
): string {
  return `${record.collection}/${record.id}`;
}
export function publicRecords(snapshot: Snapshot): ContentRecord[] {
  return snapshot.published.filter((r) => !r.archived);
}
export function recordSlugs(record: ContentRecord): string[] {
  return [
    ...new Set(
      [
        record.slug.pt,
        record.slug.en,
        ...record.previousSlugs.pt,
        ...record.previousSlugs.en,
      ].filter(Boolean),
    ),
  ];
}
export type FieldIssue = { path: string; message: string };
export function publicationIssues(
  record: ContentRecord,
  published: ContentRecord[],
): FieldIssue[] {
  const issues: FieldIssue[] = [];
  for (const [ids, collection, path, label] of [
    [record.pgpIds, "pgps", "pgpIds", "PGP"],
    [record.areaIds, "areas", "areaIds", "área"],
    [record.keywordIds, "keywords", "keywordIds", "palavra-chave"],
    [record.selectedIds, "items", "selectedIds", "leitura"],
  ] as const)
    for (const id of ids) {
      if (!published.some((r) => r.collection === collection && r.id === id))
        issues.push({ path, message: `${label} não publicado: ${id}` });
    }
  if (record.collection === "items") {
    if (record.kind === "article" && !record.pgpIds.length)
      issues.push({
        path: "pgpIds",
        message: "Associe o artigo a pelo menos um PGP.",
      });
    if (!record.authors.length)
      issues.push({ path: "authors", message: "Informe pelo menos um autor." });
    if (!["post", "notice"].includes(record.kind) && !record.areaIds.length)
      issues.push({
        path: "areaIds",
        message: "Selecione pelo menos uma área do conhecimento.",
      });
    if (
      !record.body.pt.trim() &&
      !record.externalUrl &&
      !record.attachments.length
    )
      issues.push({
        path: "body.pt",
        message: "Escreva o texto ou adicione um arquivo/link para leitura.",
      });
  }
  record.attachments.forEach((attachment, index) => {
    if (attachment.type === "image" && !attachment.alt.trim())
      issues.push({
        path: `attachments.${index}.alt`,
        message: "Descreva a imagem no texto alternativo.",
      });
  });
  for (const lang of ["pt", "en"] as const)
    if (/!\[\s*\]\(/.test(record.body[lang]))
      issues.push({
        path: `body.${lang}`,
        message: "Descreva as imagens no texto alternativo.",
      });
  const reserved = new Set(recordSlugs(record));
  for (const other of published)
    if (
      keyOf(other) !== keyOf(record) &&
      other.collection === record.collection
    ) {
      if (record.collection === "settings")
        issues.push({
          path: "title.pt",
          message: "O portal já possui um registro de configurações.",
        });
      if (
        record.collection === "pages" &&
        record.pageKind !== "free" &&
        other.pageKind === record.pageKind &&
        !other.archived
      )
        issues.push({
          path: "pageKind",
          message: "Já existe uma página publicada deste tipo.",
        });
      for (const slug of recordSlugs(other))
        if (reserved.has(slug))
          issues.push({
            path: record.slug.en === slug ? "slug.en" : "slug.pt",
            message: `Endereço já usado ou reservado por outra publicação: ${slug}`,
          });
    }
  return issues.filter(
    (issue, index, list) =>
      list.findIndex(
        (other) => other.path === issue.path && other.message === issue.message,
      ) === index,
  );
}
export function publishErrors(
  record: ContentRecord,
  published: ContentRecord[],
): string[] {
  return [
    ...new Set(
      publicationIssues(record, published).map((issue) => issue.message),
    ),
  ];
}
