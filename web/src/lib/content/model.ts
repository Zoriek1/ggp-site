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
  "Informe um título em português (até 240 caracteres).",
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
export function publishErrors(
  record: ContentRecord,
  published: ContentRecord[],
): string[] {
  const errors: string[] = [];
  const references: [string[], Collection, string][] = [
    [record.pgpIds, "pgps", "PGP"],
    [record.areaIds, "areas", "área"],
    [record.keywordIds, "keywords", "palavra-chave"],
    [record.selectedIds, "items", "leitura"],
  ];
  for (const [ids, collection, label] of references)
    for (const id of ids) {
      if (!published.some((r) => r.collection === collection && r.id === id))
        errors.push(`${label} não publicado: ${id}`);
    }
  if (record.collection === "items") {
    if (record.kind === "article" && !record.pgpIds.length)
      errors.push("Artigos precisam estar associados a pelo menos um PGP.");
    if (!record.authors.length) errors.push("Informe pelo menos um autor.");
    if (!["post", "notice"].includes(record.kind) && !record.areaIds.length)
      errors.push("Selecione pelo menos uma área do conhecimento.");
    if (
      !record.body.pt.trim() &&
      !record.externalUrl &&
      !record.attachments.length
    )
      errors.push("Escreva o texto ou informe um arquivo/link para leitura.");
  }
  if (record.attachments.some((a) => a.type === "image" && !a.alt.trim()))
    errors.push("Imagens precisam de texto alternativo.");
  if (Object.values(record.body).some((body) => /!\[\s*\]\(/.test(body)))
    errors.push("Descreva as imagens no texto alternativo.");
  for (const other of published)
    if (
      keyOf(other) !== keyOf(record) &&
      other.collection === record.collection
    ) {
      if (record.collection === "settings")
        errors.push("O portal já possui um registro de configurações.");
      if (
        record.collection === "pages" &&
        record.pageKind !== "free" &&
        other.pageKind === record.pageKind &&
        !other.archived
      )
        errors.push("Já existe uma página publicada deste tipo.");
      for (const lang of ["pt", "en"] as const)
        if (field(other.slug, lang) === field(record.slug, lang))
          errors.push(`Endereço já usado: ${field(record.slug, lang)}`);
    }
  return [...new Set(errors)];
}
