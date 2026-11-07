import { z } from "zod";
import { recordSchema, type ContentRecord } from "@/lib/content/model";

// A local copy must preserve partially typed URLs, empty titles and author rows.
const localText = z.object({ pt: z.string(), en: z.string() });
const editingSchema = recordSchema.extend({
  title: localText,
  slug: localText,
  summary: localText,
  body: localText,
  authors: z.array(z.string()),
  institution: z.string(),
  venue: z.string(),
  doi: z.string(),
  externalUrl: z.string(),
  contactEmail: z.string(),
  year: z.number().optional().catch(undefined),
  attachments: z.array(
    z.object({
      url: z.string(),
      label: z.string(),
      alt: z.string(),
      type: z.enum(["image", "pdf", "link"]),
    }),
  ),
  links: z.array(z.object({ label: z.string(), url: z.string() })),
});
const backupSchema = z.object({
  version: z.literal(2),
  scope: z.string(),
  savedAt: z.string().datetime(),
  revision: z.string().nullable(),
  record: editingSchema,
});
export type LocalDraft = z.infer<typeof backupSchema> & { storageKey: string };
export type DraftStorage = Pick<
  Storage,
  "length" | "key" | "getItem" | "setItem" | "removeItem"
>;
export const draftScope = (user: string, collection: string, id?: string) =>
  `${encodeURIComponent(user)}/${collection}/${id || "new"}`;
const prefix = (scope: string) => `ggp:editor:v2:${scope}:`;
export function fingerprint(record: ContentRecord): string {
  return JSON.stringify({
    ...record,
    updatedAt: undefined,
    publishedAt: undefined,
    previousSlugs: undefined,
  });
}
export function writeLocalDraft(
  storage: DraftStorage,
  scope: string,
  tab: string,
  record: ContentRecord,
  revision: string | null,
): LocalDraft {
  const storageKey = `${prefix(scope)}${tab}`;
  const value = {
    version: 2 as const,
    scope,
    record,
    revision,
    savedAt: new Date().toISOString(),
  };
  storage.setItem(storageKey, JSON.stringify(value));
  return { ...value, storageKey };
}
export function readLocalDrafts(
  storage: DraftStorage,
  scope: string,
): LocalDraft[] {
  const drafts: LocalDraft[] = [];
  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index);
    if (!key?.startsWith(prefix(scope))) continue;
    try {
      const result = backupSchema.safeParse(
        JSON.parse(storage.getItem(key) || "null"),
      );
      if (result.success && result.data.scope === scope)
        drafts.push({ ...result.data, storageKey: key });
    } catch {
      /* Leave corrupt entries untouched; never replace server content with them. */
    }
  }
  return drafts.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}
export function removeLocalDraft(
  storage: DraftStorage,
  scope: string,
  tab: string,
): void {
  storage.removeItem(`${prefix(scope)}${tab}`);
}
export function reconcileSaved(
  current: ContentRecord,
  submitted: ContentRecord,
  saved: ContentRecord,
): { record: ContentRecord; dirty: boolean } {
  const dirty =
    fingerprint(prepareRecord(current)) !==
    fingerprint(prepareRecord(submitted));
  return {
    dirty,
    record: dirty
      ? {
          ...current,
          updatedAt: saved.updatedAt,
          publishedAt: saved.publishedAt,
          previousSlugs: saved.previousSlugs,
        }
      : saved,
  };
}
export function prepareRecord(record: ContentRecord): ContentRecord {
  return {
    ...record,
    authors: record.authors.map((a) => a.trim()).filter(Boolean),
    links: record.links.filter((link) => link.label || link.url),
    attachments: record.attachments.filter((a) => a.label || a.url),
  };
}
