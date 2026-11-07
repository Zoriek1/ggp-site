import type { Metadata } from "next";
import { field, type ContentRecord, type Lang } from "@/lib/content/model";
import { contentHref, localizedHref, type RouteKey } from "@/i18n/routes";
import { env } from "@/lib/env";

export function detailMetadata(record: ContentRecord, lang: Lang): Metadata {
  const other: Record<string, string | string[]> = {};
  if (record.collection === "items" && record.kind === "article") {
    other.citation_title = field(record.title, lang);
    other.citation_author = record.authors;
    if (record.year) other.citation_publication_date = String(record.year);
    if (record.venue) other.citation_journal_title = record.venue;
    if (record.doi) other.citation_doi = record.doi;
    const pdf = record.attachments.find((a) => a.type === "pdf");
    if (pdf) other.citation_pdf_url = new URL(pdf.url, env.siteUrl).href;
  }
  return {
    title: field(record.title, lang),
    description: field(record.summary, lang) || undefined,
    alternates: {
      canonical: contentHref(record, lang),
      languages: {
        "pt-BR": contentHref(record, "pt"),
        en: contentHref(record, "en"),
      },
    },
    openGraph: {
      title: field(record.title, lang),
      description: field(record.summary, lang),
      url: contentHref(record, lang),
      type: record.collection === "items" ? "article" : "website",
    },
    other,
  };
}
export function listMetadata(
  section: RouteKey,
  title: string,
  lang: Lang,
): Metadata {
  return {
    title,
    alternates: {
      canonical: localizedHref(section, lang),
      languages: {
        "pt-BR": localizedHref(section, "pt"),
        en: localizedHref(section, "en"),
      },
    },
  };
}
export function itemJsonLd(record: ContentRecord, lang: Lang) {
  return {
    "@context": "https://schema.org",
    "@type": record.kind === "article" ? "ScholarlyArticle" : "BlogPosting",
    headline: field(record.title, lang),
    abstract: field(record.summary, lang) || undefined,
    author: record.authors.map((name) => ({ "@type": "Person", name })),
    datePublished: record.publishedAt,
    dateModified: record.updatedAt,
    inLanguage: lang === "pt" ? "pt-BR" : "en",
    url: `${env.siteUrl}${contentHref(record, lang)}`,
    identifier: record.doi || undefined,
  };
}
