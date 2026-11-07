/**
 * Filtros de descoberta lidos da URL (camada P0).
 * Valores são crus (slugs de taxonomia / enums), resolvidos em GROQ via `references`-like.
 */

export type Filters = {
  topic?: string;
  area?: string;
  tag?: string;
  year?: number;
  level?: string; // tese: enum (tcc/masters/doctorate) | material: slug de nível de ensino
  mediaType?: string; // video/lecture/podcast/webinar
  category?: string; // link/dataset/tool/text/other
  time?: "upcoming" | "past";
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined): string | undefined => {
  const s = (Array.isArray(v) ? v[0] : v)?.trim();
  return s || undefined;
};

export function parseFilters(sp: RawSearchParams): Filters {
  const year = one(sp.year);
  const time = one(sp.time);
  return {
    topic: one(sp.topic),
    area: one(sp.area),
    tag: one(sp.tag),
    year: year && /^\d{4}$/.test(year) ? Number(year) : undefined,
    level: one(sp.level),
    mediaType: one(sp.mediaType),
    category: one(sp.category),
    time: time === "upcoming" || time === "past" ? time : undefined,
  };
}

/** Filtros → objeto de querystring (sem `page`). Use para montar links de paginação. */
export function filtersToQuery(f: Filters): Record<string, string> {
  const q: Record<string, string> = {};
  if (f.topic) q.topic = f.topic;
  if (f.area) q.area = f.area;
  if (f.tag) q.tag = f.tag;
  if (f.year) q.year = String(f.year);
  if (f.level) q.level = f.level;
  if (f.mediaType) q.mediaType = f.mediaType;
  if (f.category) q.category = f.category;
  if (f.time) q.time = f.time;
  return q;
}

/** Opção de uma faceta, pronta para render no client (sem i18n no client). */
export type FacetOption = { value: string; label: string };

/** Uma faceta exibida no FilterBar. `param` é a chave na querystring. */
export type Facet = {
  param: keyof Filters;
  label: string;
  options: FacetOption[];
};
