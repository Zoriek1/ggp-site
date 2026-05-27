import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Lang } from "@/i18n/config";
import { tField, getDictionary, tMissing } from "@/i18n/dictionaries";
import { localizedHref } from "@/i18n/routes";
import { Container } from "@/components/Container";
import { TranslationNotice } from "@/components/TranslationNotice";
import { sanityFetch } from "@/lib/sanity/client";
import { resourceBySlugQuery } from "@/lib/sanity/queries";
import type { Resource } from "@/lib/sanity/types";
import { buildMetadataForDetail } from "@/lib/seo/metadata";
import { slugStrict } from "@/lib/slug";

const fetchRes = (slug: string) =>
  sanityFetch<Resource | null>(resourceBySlugQuery, { slug }, { tags: ["resource"] });

export async function resourceMetadata({ lang, slug }: { lang: Lang; slug: string }): Promise<Metadata> {
  const r = await fetchRes(slug);
  if (!r) return {};
  return buildMetadataForDetail({
    key: "resources",
    lang,
    slugPt: slugStrict(r.slug, "pt"),
    slugEn: slugStrict(r.slug, "en"),
    title: tField(r.title, lang),
    description: tField(r.description, lang)?.slice(0, 200),
  });
}

export async function ResourceDetail({ lang, slug }: { lang: Lang; slug: string }) {
  const r = await fetchRes(slug);
  if (!r) notFound();

  const dict = getDictionary(lang);
  const title = tField(r.title, lang);
  const desc = tField(r.description, lang);
  const missing = tMissing(r.title, lang) || (r.description ? tMissing(r.description, lang) : false);
  const link = r.url || r.fileUrl;

  return (
    <Container className="py-12 max-w-3xl">
      <Link href={localizedHref("resources", lang)} className="text-sm text-ink-500 hover:text-ink-900">
        ← {dict.common.backTo} {dict.nav.resources.toLowerCase()}
      </Link>

      <h1 className="mt-4 font-serif text-3xl leading-tight text-ink-900 sm:text-4xl">{title}</h1>

      <TranslationNotice lang={lang} show={missing} />

      {desc && <p className="mt-4 whitespace-pre-line text-ink-900">{desc}</p>}

      {link && (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-block rounded bg-brand-700 px-4 py-2 text-sm text-white no-underline"
        >
          {dict.common.openExternal}
        </a>
      )}
    </Container>
  );
}
