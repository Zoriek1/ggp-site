import type { Lang } from "./config";

/**
 * Chaves canônicas das seções (internas) → segmento por idioma na URL.
 * Roteamento: middleware/page resolve um segmento da URL para uma chave canônica,
 * então o Next.js usa a chave para renderizar o conteúdo correto.
 */
export const ROUTE_KEYS = [
  "about",
  "members",
  "pgps",
  "publications",
  "theses",
  "teachingMaterials",
  "media",
  "resources",
  "events",
  "topics",
  "researchAreas",
  "contact",
] as const;
export type RouteKey = (typeof ROUTE_KEYS)[number];

export const SEGMENTS: Record<RouteKey, Record<Lang, string>> = {
  about:             { pt: "sobre",              en: "about" },
  members:           { pt: "membros",            en: "members" },
  pgps:              { pt: "pgps",               en: "pgps" },
  publications:      { pt: "publicacoes",        en: "publications" },
  theses:            { pt: "teses",              en: "theses" },
  teachingMaterials: { pt: "materiais",          en: "materials" },
  media:             { pt: "midia",              en: "media" },
  resources:         { pt: "recursos",           en: "resources" },
  events:            { pt: "eventos",            en: "events" },
  topics:            { pt: "topicos",            en: "topics" },
  researchAreas:     { pt: "areas-de-pesquisa",  en: "research-areas" },
  contact:           { pt: "contato",            en: "contact" },
};

/** Inverso: segmento (em qualquer idioma) → chave canônica. */
const SEGMENT_TO_KEY = (() => {
  const map = new Map<string, RouteKey>();
  for (const key of ROUTE_KEYS) {
    map.set(SEGMENTS[key].pt, key);
    map.set(SEGMENTS[key].en, key);
  }
  return map;
})();

export const resolveSegment = (segment: string): RouteKey | null =>
  SEGMENT_TO_KEY.get(segment) ?? null;

export const segmentFor = (key: RouteKey, lang: Lang): string => SEGMENTS[key][lang];

/** Constrói href localizado. Use isto em vez de concatenar strings manualmente. */
export const localizedHref = (
  key: RouteKey,
  lang: Lang,
  slug?: string,
  params?: Record<string, string | number>,
): string => {
  const seg = segmentFor(key, lang);
  const base = slug ? `/${lang}/${seg}/${slug}` : `/${lang}/${seg}`;
  if (!params) return base;
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
  return qs ? `${base}?${qs}` : base;
};

/** Mapa de tipo Sanity → chave de rota (para JSON-LD e sitemap). */
export const TYPE_TO_KEY: Record<string, RouteKey> = {
  publication: "publications",
  thesis: "theses",
  teachingMaterial: "teachingMaterials",
  media: "media",
  resource: "resources",
  event: "events",
  member: "members",
  pgp: "pgps",
  physicsTopic: "topics",
  researchArea: "researchAreas",
};
