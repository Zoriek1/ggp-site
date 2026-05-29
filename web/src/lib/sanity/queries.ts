/**
 * GROQ queries reutilizadas em vários lugares.
 * Convenção: cada documento expõe `slugPt` e `slugEn` como strings (mais simples no frontend).
 */

import type { Filters } from "@/lib/discovery/filters";

const slugProjection = `
  slug,
  "slugPt": slug.pt.current,
  "slugEn": slug.en.current,
`;

const topicProjection = `
  topics[]->{ _id, name, slug { pt { current }, en { current } } }
`;
const areaProjection = `
  researchAreas[]->{ _id, name, slug { pt { current }, en { current } } }
`;
const tagProjection = `
  tags[]->{ _id, label, slug { pt { current }, en { current } } }
`;

const memberStub = `
  _id, name, displayName,
  "slugPt": "", "slugEn": ""
`;

// ── Filtros de descoberta (P0) ───────────────────────────────────────────────
// Predicados GROQ por faceta. Taxonomias filtram por slug (pt OU en), sem resolver _id.
const FACET = {
  topic: `($topic in topics[]->slug.pt.current || $topic in topics[]->slug.en.current)`,
  area: `($area in researchAreas[]->slug.pt.current || $area in researchAreas[]->slug.en.current)`,
  tag: `($tag in tags[]->slug.pt.current || $tag in tags[]->slug.en.current)`,
  year: `year == $year`,
  level: `level == $level`,
  eduLevel: `($level in [level->slug.pt.current, level->slug.en.current])`,
  mediaType: `type == $mediaType`,
  category: `category == $category`,
  upcoming: `startDate >= now()`,
  past: `startDate < now()`,
} as const;

export type BuiltQuery = { query: string; params: Record<string, unknown> };

/** Aplica as facetas comuns (tópico/tag sempre; área quando permitido) a um builder. */
function applyCommon(
  f: Filters,
  preds: string[],
  params: Record<string, unknown>,
  allow: { area?: boolean } = {},
): void {
  if (f.topic) { preds.push(FACET.topic); params.topic = f.topic; }
  if (allow.area && f.area) { preds.push(FACET.area); params.area = f.area; }
  if (f.tag) { preds.push(FACET.tag); params.tag = f.tag; }
}

/** Monta `{ items, total }` para uma listagem filtrada. `$start`/`$end` vêm do chamador. */
function buildList(
  type: string,
  projection: string,
  order: string,
  preds: string[],
  params: Record<string, unknown>,
): BuiltQuery {
  const filter = [`_type == "${type}"`, ...preds].join(" && ");
  return {
    query: `{
  "items": *[${filter}] | order(${order}) [$start...$end]{ ${projection} },
  "total": count(*[${filter}])
}`,
    params,
  };
}

// Site
export const siteSettingsQuery = /* groq */ `
*[_type == "siteSettings"][0]{
  siteName, tagline, logo, logoDark, heroIntro, contactEmail, social, organization
}
`;

export const pageByKindQuery = /* groq */ `
*[_type == "page" && kind == $kind][0]{
  _id, title, ${slugProjection} kind, body, seoDescription
}
`;

// Members
export const memberListQuery = /* groq */ `
*[_type == "member"] | order(active desc, name asc){
  _id, name, displayName, photo, role, active,
  "slugPt": coalesce(slug.pt.current, _id),
  "slugEn": coalesce(slug.en.current, _id)
}
`;

export const memberBySlugQuery = /* groq */ `
*[_type == "member" && (_id == $slug || slug.pt.current == $slug || slug.en.current == $slug)][0]{
  _id, name, displayName, photo, role, active, bio,
  email, orcid, lattesUrl, linkedinUrl, personalUrl,
  ${areaProjection},
  ${topicProjection}
}
`;

// Publications
const publicationProjection = `
  _id, title, ${slugProjection} year, publishedDate, venue, doi, externalUrl, featured,
  abstract,
  authors[]->{ ${memberStub} },
  externalAuthors,
  ${topicProjection},
  ${areaProjection},
  ${tagProjection},
  "pdfFileUrl": pdfFile.asset->url,
  pdfUrl
`;

export function publicationListQuery(f: Filters = {}): BuiltQuery {
  const preds: string[] = [];
  const params: Record<string, unknown> = {};
  applyCommon(f, preds, params, { area: true });
  if (f.year) { preds.push(FACET.year); params.year = f.year; }
  return buildList("publication", publicationProjection, "year desc, publishedDate desc", preds, params);
}

export const publicationBySlugQuery = /* groq */ `
*[_type == "publication" && (slug.pt.current == $slug || slug.en.current == $slug)][0]{
  ${publicationProjection}
}
`;

export const publicationsByMemberQuery = /* groq */ `
*[_type == "publication" && references($memberId)] | order(year desc) [0...20]{
  ${publicationProjection}
}
`;

export const featuredPublicationsQuery = /* groq */ `
*[_type == "publication" && featured == true] | order(year desc) [0...6]{
  ${publicationProjection}
}
`;

// Theses
const thesisProjection = `
  _id, title, ${slugProjection} level, year, institution, program, summary,
  author->{ _id, name },
  externalAuthorName,
  advisor->{ _id, name },
  coAdvisor->{ _id, name },
  ${topicProjection},
  ${areaProjection},
  ${tagProjection},
  "pdfFileUrl": pdfFile.asset->url,
  pdfUrl
`;

export function thesisListQuery(f: Filters = {}): BuiltQuery {
  const preds: string[] = [];
  const params: Record<string, unknown> = {};
  applyCommon(f, preds, params, { area: true });
  if (f.year) { preds.push(FACET.year); params.year = f.year; }
  if (f.level) { preds.push(FACET.level); params.level = f.level; }
  return buildList("thesis", thesisProjection, "year desc", preds, params);
}

export const thesisBySlugQuery = /* groq */ `
*[_type == "thesis" && (slug.pt.current == $slug || slug.en.current == $slug)][0]{
  ${thesisProjection}
}
`;

export const thesesAuthoredByMemberQuery = /* groq */ `
*[_type == "thesis" && author._ref == $memberId] | order(year desc){ ${thesisProjection} }
`;

export const thesesAdvisedByMemberQuery = /* groq */ `
*[_type == "thesis" && (advisor._ref == $memberId || coAdvisor._ref == $memberId)] | order(year desc){ ${thesisProjection} }
`;

// Teaching materials
const teachingMaterialProjection = `
  _id, title, ${slugProjection} description, coverImage, publishedDate,
  authors[]->{ ${memberStub} },
  level->{ _id, name, slug { pt { current }, en { current } } },
  ${topicProjection},
  ${tagProjection},
  files[]{ "fileUrl": file.asset->url, url, label }
`;

export function teachingMaterialListQuery(f: Filters = {}): BuiltQuery {
  const preds: string[] = [];
  const params: Record<string, unknown> = {};
  applyCommon(f, preds, params);
  if (f.level) { preds.push(FACET.eduLevel); params.level = f.level; }
  return buildList(
    "teachingMaterial",
    teachingMaterialProjection,
    "publishedDate desc, _createdAt desc",
    preds,
    params,
  );
}

export const teachingMaterialBySlugQuery = /* groq */ `
*[_type == "teachingMaterial" && (slug.pt.current == $slug || slug.en.current == $slug)][0]{
  ${teachingMaterialProjection}
}
`;

export const teachingMaterialsByMemberQuery = /* groq */ `
*[_type == "teachingMaterial" && references($memberId)] | order(publishedDate desc) [0...20]{
  ${teachingMaterialProjection}
}
`;

// Media
const mediaProjection = `
  _id, title, ${slugProjection} type, videoUrl, date, description,
  speakers[]->{ ${memberStub} },
  externalSpeakers,
  ${topicProjection},
  ${tagProjection}
`;

export function mediaListQuery(f: Filters = {}): BuiltQuery {
  const preds: string[] = [];
  const params: Record<string, unknown> = {};
  applyCommon(f, preds, params);
  if (f.mediaType) { preds.push(FACET.mediaType); params.mediaType = f.mediaType; }
  return buildList("media", mediaProjection, "date desc", preds, params);
}

export const mediaBySlugQuery = /* groq */ `
*[_type == "media" && (slug.pt.current == $slug || slug.en.current == $slug)][0]{
  ${mediaProjection}
}
`;

export const mediaByMemberQuery = /* groq */ `
*[_type == "media" && references($memberId)] | order(date desc) [0...20]{
  ${mediaProjection}
}
`;

// Resources
const resourceProjection = `
  _id, title, ${slugProjection} description, category, url,
  "fileUrl": file.asset->url,
  ${topicProjection},
  ${tagProjection}
`;

export function resourceListQuery(f: Filters = {}): BuiltQuery {
  const preds: string[] = [];
  const params: Record<string, unknown> = {};
  applyCommon(f, preds, params);
  if (f.category) { preds.push(FACET.category); params.category = f.category; }
  return buildList("resource", resourceProjection, "_createdAt desc", preds, params);
}

export const resourceBySlugQuery = /* groq */ `
*[_type == "resource" && (slug.pt.current == $slug || slug.en.current == $slug)][0]{
  ${resourceProjection}
}
`;

// Events
const eventProjection = `
  _id, title, ${slugProjection} description, coverImage,
  startDate, endDate, location, isOnline, registrationUrl,
  speakers[]->{ ${memberStub} },
  externalSpeakers,
  ${topicProjection},
  ${tagProjection}
`;

export function eventListQuery(f: Filters = {}): BuiltQuery {
  const preds: string[] = [];
  const params: Record<string, unknown> = {};
  applyCommon(f, preds, params);
  if (f.time === "upcoming") preds.push(FACET.upcoming);
  if (f.time === "past") preds.push(FACET.past);
  return buildList("event", eventProjection, "startDate desc", preds, params);
}

export const eventBySlugQuery = /* groq */ `
*[_type == "event" && (slug.pt.current == $slug || slug.en.current == $slug)][0]{
  ${eventProjection}
}
`;

export const upcomingEventsQuery = /* groq */ `
*[_type == "event" && startDate >= now()] | order(startDate asc) [0...6]{ ${eventProjection} }
`;

export const eventsByMemberQuery = /* groq */ `
*[_type == "event" && references($memberId)] | order(startDate desc) [0...20]{ ${eventProjection} }
`;

// PGPs
const pgpProjection = `
  _id, name, longName, status, foundedYear, school, social,
  "slugPt": slug.pt.current,
  "slugEn": slug.en.current,
  description,
  coordinator->{ _id, name },
  members[]->{ _id, name, displayName, role, photo },
  ${topicProjection},
  ${areaProjection}
`;

export const pgpListQuery = /* groq */ `
*[_type == "pgp"] | order(status asc, name asc){
  ${pgpProjection}
}
`;

export const pgpBySlugQuery = /* groq */ `
*[_type == "pgp" && (_id == $slug || slug.pt.current == $slug || slug.en.current == $slug)][0]{
  ${pgpProjection}
}
`;

export const pgpsByMemberQuery = /* groq */ `
*[_type == "pgp" && references($memberId)] | order(name asc){
  _id, name, status,
  "slugPt": slug.pt.current,
  "slugEn": slug.en.current,
  school
}
`;

// Topics & areas (agregação)
export const topicBySlugQuery = /* groq */ `
*[_type == "physicsTopic" && (slug.pt.current == $slug || slug.en.current == $slug)][0]{
  _id, name, description, slug { pt { current }, en { current } }
}
`;

export const allTopicsQuery = /* groq */ `
*[_type == "physicsTopic"] | order(name.pt asc){
  _id, name, slug { pt { current }, en { current } }
}
`;

export const researchAreaBySlugQuery = /* groq */ `
*[_type == "researchArea" && (slug.pt.current == $slug || slug.en.current == $slug)][0]{
  _id, name, description, slug { pt { current }, en { current } }
}
`;

export const allResearchAreasQuery = /* groq */ `
*[_type == "researchArea"] | order(name.pt asc){
  _id, name, slug { pt { current }, en { current } }
}
`;

export const allTagsQuery = /* groq */ `
*[_type == "tag"] | order(label.pt asc){
  _id, label, slug { pt { current }, en { current } }
}
`;

export const allEducationLevelsQuery = /* groq */ `
*[_type == "educationLevel"] | order(order asc){
  _id, name, slug { pt { current }, en { current } }
}
`;

/** Anos distintos de um tipo (dedup/ordenação feitos no server). */
export const yearsForTypeQuery = /* groq */ `*[_type == $type && defined(year)].year`;

// Busca textual (P0) — match + score em campos {pt,en}, multi-tipo.
export const searchQuery = /* groq */ `
*[
  _type in $types && (
    title.pt match $q || title.en match $q ||
    abstract.pt match $q || abstract.en match $q ||
    summary.pt match $q || summary.en match $q ||
    description.pt match $q || description.en match $q ||
    name match $q || venue match $q
  )
]
| score(
    boost(title.pt match $q || title.en match $q, 3),
    boost(name match $q, 3),
    title.pt match $q, title.en match $q,
    abstract.pt match $q, summary.pt match $q, description.pt match $q
  )
| order(_score desc) [0...50]{
  _type, _id, _score,
  title, name, year,
  "slugPt": slug.pt.current,
  "slugEn": slug.en.current
}
`;

// Sitemap helpers — só slugs e _updatedAt para cada tipo
export const sitemapByTypeQuery = /* groq */ `
*[_type == $type] {
  _id, _updatedAt,
  "slugPt": slug.pt.current,
  "slugEn": slug.en.current
}
`;

export const sitemapMembersQuery = /* groq */ `
*[_type == "member"] { _id, _updatedAt, name }
`;
