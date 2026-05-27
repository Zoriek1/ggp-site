import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Lang } from "@/i18n/config";
import { tField, getDictionary, tMissing } from "@/i18n/dictionaries";
import { localizedHref } from "@/i18n/routes";
import { Container } from "@/components/Container";
import { JsonLd } from "@/components/JsonLd";
import { TranslationNotice } from "@/components/TranslationNotice";
import { sanityFetch } from "@/lib/sanity/client";
import { thesisBySlugQuery } from "@/lib/sanity/queries";
import type { Thesis } from "@/lib/sanity/types";
import { resolvePdf } from "@/lib/files";
import { thesisJsonLd } from "@/lib/seo/jsonLd";
import { buildMetadataForDetail } from "@/lib/seo/metadata";
import { slugStrict } from "@/lib/slug";

const fetchThesis = (slug: string) =>
  sanityFetch<Thesis | null>(thesisBySlugQuery, { slug }, { tags: ["thesis"] });

export async function thesisMetadata({ lang, slug }: { lang: Lang; slug: string }): Promise<Metadata> {
  const t = await fetchThesis(slug);
  if (!t) return {};
  return buildMetadataForDetail({
    key: "theses",
    lang,
    slugPt: slugStrict(t.slug, "pt"),
    slugEn: slugStrict(t.slug, "en"),
    title: tField(t.title, lang),
    description: tField(t.summary, lang)?.slice(0, 200),
  });
}

export async function ThesisDetail({ lang, slug }: { lang: Lang; slug: string }) {
  const t = await fetchThesis(slug);
  if (!t) notFound();

  const dict = getDictionary(lang);
  const title = tField(t.title, lang);
  const summary = tField(t.summary, lang);
  const pdf = resolvePdf(t);
  const missing = tMissing(t.title, lang) || (t.summary ? tMissing(t.summary, lang) : false);

  return (
    <>
      <JsonLd data={thesisJsonLd(t, lang)} />
      <Container className="py-12 max-w-3xl">
        <Link href={localizedHref("theses", lang)} className="text-sm text-ink-500 hover:text-ink-900">
          ← {dict.common.backTo} {dict.nav.theses.toLowerCase()}
        </Link>

        <p className="mt-4 text-xs uppercase tracking-wide text-brand-700">
          {dict.thesisLevel[t.level]} · {t.year}
        </p>

        <h1 className="mt-2 font-serif text-3xl leading-tight text-ink-900 sm:text-4xl">{title}</h1>

        <dl className="mt-4 space-y-1 text-sm text-ink-700">
          <div>
            <dt className="inline text-ink-500">{dict.common.authors}: </dt>
            <dd className="inline">{t.author?.name || t.externalAuthorName}</dd>
          </div>
          {t.advisor && (
            <div>
              <dt className="inline text-ink-500">{dict.common.advisor}: </dt>
              <dd className="inline">{t.advisor.name}</dd>
            </div>
          )}
          {t.coAdvisor && (
            <div>
              <dt className="inline text-ink-500">{dict.common.coAdvisor}: </dt>
              <dd className="inline">{t.coAdvisor.name}</dd>
            </div>
          )}
          {t.institution && (
            <div>
              <dt className="inline text-ink-500">Instituição: </dt>
              <dd className="inline">{t.institution}</dd>
            </div>
          )}
          {t.program && (
            <div>
              <dt className="inline text-ink-500">Programa: </dt>
              <dd className="inline">{t.program}</dd>
            </div>
          )}
        </dl>

        <TranslationNotice lang={lang} show={missing} />

        {summary && (
          <section className="mt-6">
            <h2 className="text-xs uppercase tracking-wide text-brand-700">{dict.common.summary}</h2>
            <p className="mt-2 whitespace-pre-line text-ink-900">{summary}</p>
          </section>
        )}

        {pdf && (
          <div className="mt-8">
            <a
              href={pdf}
              target="_blank"
              rel="noreferrer"
              className="rounded bg-brand-700 px-4 py-2 text-sm text-white no-underline hover:bg-brand-900"
            >
              {dict.common.download} PDF
            </a>
          </div>
        )}
      </Container>
    </>
  );
}
