import type { Metadata } from "next";
import type { Lang } from "@/i18n/config";
import { HREFLANG, LOCALES } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localizedHref, type RouteKey } from "@/i18n/routes";
import { env } from "@/lib/env";

const SITE_NAME = "GGP";

export function buildMetadataForList({ key, lang }: { key: RouteKey; lang: Lang }): Metadata {
  const dict = getDictionary(lang);
  const title = dict.nav[key as keyof typeof dict.nav];
  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    languages[HREFLANG[l]] = `${env.siteUrl}${localizedHref(key, l)}`;
  }
  return {
    title,
    alternates: {
      canonical: `${env.siteUrl}${localizedHref(key, lang)}`,
      languages,
    },
    openGraph: {
      title: `${title} · ${SITE_NAME}`,
      locale: lang === "en" ? "en_US" : "pt_BR",
    },
  };
}

export function buildMetadataForDetail({
  key,
  lang,
  slugPt,
  slugEn,
  title,
  description,
  ogImage,
}: {
  key: RouteKey;
  lang: Lang;
  slugPt?: string | null;
  slugEn?: string | null;
  title: string;
  description?: string | null;
  ogImage?: string | null;
}): Metadata {
  const languages: Record<string, string> = {};
  const pt = slugPt || slugEn;
  const en = slugEn || slugPt;
  if (pt) languages[HREFLANG.pt] = `${env.siteUrl}${localizedHref(key, "pt", pt)}`;
  if (en) languages[HREFLANG.en] = `${env.siteUrl}${localizedHref(key, "en", en)}`;
  const canonicalSlug = lang === "en" ? en : pt;
  return {
    title,
    description: description ?? undefined,
    alternates: canonicalSlug
      ? {
          canonical: `${env.siteUrl}${localizedHref(key, lang, canonicalSlug)}`,
          languages,
        }
      : undefined,
    openGraph: {
      title: `${title} · ${SITE_NAME}`,
      description: description ?? undefined,
      locale: lang === "en" ? "en_US" : "pt_BR",
      images: ogImage ? [ogImage] : undefined,
    },
  };
}
