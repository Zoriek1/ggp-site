/**
 * GROQ queries reutilizadas em vários lugares.
 * Convenção: cada documento expõe `slugPt` e `slugEn` como strings (mais simples no frontend).
 */

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

export const publicationListQuery = /* groq */ `
{
  "items": *[_type == "publication"] | order(year desc, publishedDate desc) [$start...$end]{
    ${publicationProjection}
  },
  "total": count(*[_type == "publication"])
}
`;

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

export const thesisListQuery = /* groq */ `
{
  "items": *[_type == "thesis"] | order(year desc) [$start...$end]{ ${thesisProjection} },
  "total": count(*[_type == "thesis"])
}
`;

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

export const teachingMaterialListQuery = /* groq */ `
{
  "items": *[_type == "teachingMaterial"] | order(publishedDate desc, _createdAt desc) [$start...$end]{
    ${teachingMaterialProjection}
  },
  "total": count(*[_type == "teachingMaterial"])
}
`;

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

export const mediaListQuery = /* groq */ `
{
  "items": *[_type == "media"] | order(date desc) [$start...$end]{ ${mediaProjection} },
  "total": count(*[_type == "media"])
}
`;

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

export const resourceListQuery = /* groq */ `
{
  "items": *[_type == "resource"] | order(_createdAt desc) [$start...$end]{ ${resourceProjection} },
  "total": count(*[_type == "resource"])
}
`;

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

export const eventListQuery = /* groq */ `
{
  "items": *[_type == "event"] | order(startDate desc) [$start...$end]{ ${eventProjection} },
  "total": count(*[_type == "event"])
}
`;

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
