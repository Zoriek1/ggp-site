import type { Publication, Thesis, Member, EventItem, MediaItem, Pgp } from "@/lib/sanity/types";
import type { Lang } from "@/i18n/config";
import { tField } from "@/i18n/dictionaries";
import { localizedHref } from "@/i18n/routes";
import { env } from "@/lib/env";
import { resolvePdf } from "@/lib/files";

const ABS = (path: string) => `${env.siteUrl}${path}`;

const memberRef = (m: Pick<Member, "name">) => ({ "@type": "Person", name: m.name });

export const publicationJsonLd = (p: Publication, lang: Lang) => ({
  "@context": "https://schema.org",
  "@type": "ScholarlyArticle",
  name: tField(p.title, lang),
  headline: tField(p.title, lang),
  abstract: tField(p.abstract, lang) || undefined,
  datePublished: p.publishedDate ?? `${p.year}-01-01`,
  inLanguage: lang === "en" ? "en" : "pt-BR",
  author: [
    ...(p.authors?.map((a) => memberRef(a)) ?? []),
    ...(p.externalAuthors?.map((n) => ({ "@type": "Person", name: n })) ?? []),
  ],
  isPartOf: p.venue ? { "@type": "Periodical", name: p.venue } : undefined,
  identifier: p.doi
    ? { "@type": "PropertyValue", propertyID: "DOI", value: p.doi }
    : undefined,
  url:
    ABS(
      localizedHref(
        "publications",
        lang,
        (lang === "en" ? p.slug.en?.current : p.slug.pt?.current) || p._id,
      ),
    ),
  sameAs: [p.externalUrl, p.doi ? `https://doi.org/${p.doi}` : null].filter(Boolean),
  encoding: resolvePdf(p)
    ? { "@type": "MediaObject", contentUrl: resolvePdf(p), encodingFormat: "application/pdf" }
    : undefined,
});

export const thesisJsonLd = (t: Thesis, lang: Lang) => ({
  "@context": "https://schema.org",
  "@type": "Thesis",
  name: tField(t.title, lang),
  inSupportOf:
    t.level === "doctorate" ? "Doctorate" : t.level === "masters" ? "Master's" : "Undergraduate",
  datePublished: `${t.year}-01-01`,
  author: t.author ? memberRef(t.author) : t.externalAuthorName ? { "@type": "Person", name: t.externalAuthorName } : undefined,
  reviewedBy: t.advisor ? memberRef(t.advisor) : undefined,
  publisher: t.institution ? { "@type": "Organization", name: t.institution } : undefined,
  abstract: tField(t.summary, lang) || undefined,
  inLanguage: lang === "en" ? "en" : "pt-BR",
  url:
    ABS(
      localizedHref(
        "theses",
        lang,
        (lang === "en" ? t.slug.en?.current : t.slug.pt?.current) || t._id,
      ),
    ),
  encoding: resolvePdf(t)
    ? { "@type": "MediaObject", contentUrl: resolvePdf(t), encodingFormat: "application/pdf" }
    : undefined,
});

export const memberJsonLd = (m: Member, lang: Lang) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  name: m.name,
  alternateName: m.displayName || undefined,
  email: m.email || undefined,
  description: tField(m.bio, lang) || undefined,
  affiliation: {
    "@type": "ResearchOrganization",
    name: "Grande Grupo de Pesquisa em Ensino de Física — UFG",
  },
  sameAs: [
    m.orcid ? `https://orcid.org/${m.orcid}` : null,
    m.lattesUrl,
    m.linkedinUrl,
    m.personalUrl,
  ].filter(Boolean),
});

export const eventJsonLd = (e: EventItem, lang: Lang) => ({
  "@context": "https://schema.org",
  "@type": "Event",
  name: tField(e.title, lang),
  startDate: e.startDate,
  endDate: e.endDate ?? undefined,
  eventAttendanceMode: e.isOnline
    ? "https://schema.org/OnlineEventAttendanceMode"
    : "https://schema.org/OfflineEventAttendanceMode",
  location: e.isOnline
    ? { "@type": "VirtualLocation", url: e.registrationUrl }
    : e.location
      ? { "@type": "Place", name: e.location }
      : undefined,
  url:
    ABS(
      localizedHref(
        "events",
        lang,
        (lang === "en" ? e.slug.en?.current : e.slug.pt?.current) || e._id,
      ),
    ),
});

export const pgpJsonLd = (p: Pgp, lang: Lang) => ({
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: tField(p.longName, lang) || p.name,
  alternateName: p.name,
  description: tField(p.description, lang) || undefined,
  parentOrganization: {
    "@type": "ResearchOrganization",
    name: "Grande Grupo de Pesquisa em Ensino de Física — UFG",
  },
  ...(p.school ? { location: { "@type": "Place", name: p.school } } : {}),
  ...(p.foundedYear ? { foundingDate: String(p.foundedYear) } : {}),
  member: (p.members ?? []).map((m) => ({ "@type": "Person", name: m.name })),
  url:
    ABS(
      localizedHref(
        "pgps",
        lang,
        (lang === "en" ? p.slug.en?.current : p.slug.pt?.current) || p._id,
      ),
    ),
  sameAs: [p.social?.instagram, p.social?.telegram].filter(Boolean),
});

export const mediaJsonLd = (m: MediaItem, lang: Lang) => ({
  "@context": "https://schema.org",
  "@type": m.type === "podcast" ? "PodcastEpisode" : "VideoObject",
  name: tField(m.title, lang),
  description: tField(m.description, lang) || undefined,
  uploadDate: m.date,
  contentUrl: m.videoUrl,
  url:
    ABS(
      localizedHref(
        "media",
        lang,
        (lang === "en" ? m.slug.en?.current : m.slug.pt?.current) || m._id,
      ),
    ),
});

export const scholarMetaTags = (p: Publication) => {
  const tags: Array<{ name: string; content: string }> = [
    { name: "citation_title", content: p.title.pt || p.title.en || "" },
  ];
  for (const a of p.authors ?? []) tags.push({ name: "citation_author", content: a.name });
  for (const a of p.externalAuthors ?? []) tags.push({ name: "citation_author", content: a });
  if (p.publishedDate) tags.push({ name: "citation_publication_date", content: p.publishedDate });
  else tags.push({ name: "citation_publication_date", content: String(p.year) });
  if (p.venue) tags.push({ name: "citation_journal_title", content: p.venue });
  if (p.doi) tags.push({ name: "citation_doi", content: p.doi });
  const pdf = resolvePdf(p);
  if (pdf) tags.push({ name: "citation_pdf_url", content: pdf });
  return tags;
};
