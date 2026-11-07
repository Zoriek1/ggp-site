import type { Lang } from "./config";
import { field, type ContentRecord } from "@/lib/content/model";
import { recordSection } from "@/lib/content/query";

export const SEGMENTS = {
  about: { pt: "sobre", en: "about" },
  contact: { pt: "contato", en: "contact" },
  pgps: { pt: "pgps", en: "pgps" },
  publications: { pt: "publicacoes", en: "publications" },
  blog: { pt: "blog", en: "blog" },
  guides: { pt: "guias", en: "guides" },
  areas: { pt: "areas", en: "areas" },
  keywords: { pt: "palavras-chave", en: "keywords" },
  search: { pt: "busca", en: "search" },
  pages: { pt: "paginas", en: "pages" },
} as const;
export type RouteKey = keyof typeof SEGMENTS;
export const ROUTE_KEYS = Object.keys(SEGMENTS) as RouteKey[];
export const segmentFor = (key: RouteKey, lang: Lang) => SEGMENTS[key][lang];
export const resolveSegment = (segment: string): RouteKey | null =>
  ROUTE_KEYS.find((key) =>
    Object.values(SEGMENTS[key]).some((value) => value === segment),
  ) || null;
export function localizedHref(
  key: RouteKey,
  lang: Lang,
  slug?: string,
  params?: Record<string, string | number>,
): string {
  const base = `/${lang}/${segmentFor(key, lang)}${slug ? `/${slug}` : ""}`;
  const query = new URLSearchParams(
    Object.entries(params || {}).map(([k, v]) => [k, String(v)]),
  ).toString();
  return query ? `${base}?${query}` : base;
}
export function contentHref(record: ContentRecord, lang: Lang): string {
  const section = recordSection(record);
  return localizedHref(
    section,
    lang,
    record.collection === "pages" && record.pageKind !== "free"
      ? undefined
      : field(record.slug, lang),
  );
}

export const SEARCH_SEGMENTS = SEGMENTS.search;
