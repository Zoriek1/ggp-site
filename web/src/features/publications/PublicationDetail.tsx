import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Lang } from "@/i18n/config";
import { tField, getDictionary, tMissing } from "@/i18n/dictionaries";
import { localizedHref } from "@/i18n/routes";
import { Container } from "@/components/Container";
import { JsonLd } from "@/components/JsonLd";
import { Hreflang } from "@/components/Hreflang";
import { TranslationNotice } from "@/components/TranslationNotice";
import { sanityFetch } from "@/lib/sanity/client";
import { publicationBySlugQuery } from "@/lib/sanity/queries";
import type { Publication } from "@/lib/sanity/types";
import { resolvePdf } from "@/lib/files";
import { publicationJsonLd, scholarMetaTags } from "@/lib/seo/jsonLd";
import { buildMetadataForDetail } from "@/lib/seo/metadata";
import { slugStrict } from "@/lib/slug";

const fetchPub = (slug: string) =>
  sanityFetch<Publication | null>(publicationBySlugQuery, { slug }, { tags: ["publication"] });

export async function publicationMetadata({ lang, slug }: { lang: Lang; slug: string }): Promise<Metadata> {
  const p = await fetchPub(slug);
  if (!p) return {};
  const title = tField(p.title, lang);
  const metadata = buildMetadataForDetail({
    key: "publications",
    lang,
    slugPt: slugStrict(p.slug, "pt"),
    slugEn: slugStrict(p.slug, "en"),
    title,
    description: tField(p.abstract, lang)?.slice(0, 200),
  });
  const scholar = scholarMetaTags(p);
  const other: Record<string, string | string[]> = {};
  for (const t of scholar) {
    const existing = other[t.name];
    if (existing === undefined) other[t.name] = t.content;
    else if (Array.isArray(existing)) existing.push(t.content);
    else other[t.name] = [existing, t.content];
  }
  return { ...metadata, other };
}

export async function PublicationDetail({ lang, slug }: { lang: Lang; slug: string }) {
  const p = await fetchPub(slug);
  if (!p) notFound();

  const dict = getDictionary(lang);
  const titleStr = tField(p.title, lang);
  const abstract = tField(p.abstract, lang);
  const pdf = resolvePdf(p);
  const missingTranslation =
    tMissing(p.title, lang) || (p.abstract ? tMissing(p.abstract, lang) : false);

  return (
    <>
      <Hreflang
        paths={{
          pt: `/${(p.slug.pt?.current || p._id)}`,
          en: `/${(p.slug.en?.current || p.slug.pt?.current || p._id)}`,
        }}
      />
      <JsonLd data={publicationJsonLd(p, lang)} />
      <Container className="py-12 max-w-3xl">
        <Link
          href={localizedHref("publications", lang)}
          className="text-sm text-ink-500 hover:text-ink-900"
        >
          ← {dict.common.backTo} {dict.nav.publications.toLowerCase()}
        </Link>

        <h1 className="mt-4 font-serif text-3xl leading-tight text-ink-900 sm:text-4xl">
          {titleStr}
        </h1>

        <p className="mt-3 text-ink-500">
          {p.year}
          {p.venue && <> · <span>{p.venue}</span></>}
        </p>

        {(p.authors?.length || p.externalAuthors?.length) && (
          <p className="mt-1 text-sm text-ink-700">
            <span className="text-ink-500">{dict.common.authors}: </span>
            {[...(p.authors?.map((a) => a.name) || []), ...(p.externalAuthors || [])].join(", ")}
          </p>
        )}

        <TranslationNotice lang={lang} show={missingTranslation} />

        {abstract && (
          <section className="mt-6">
            <h2 className="text-xs uppercase tracking-wide text-brand-700">
              {dict.common.abstract}
            </h2>
            <p className="mt-2 whitespace-pre-line text-ink-900">{abstract}</p>
          </section>
        )}

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          {pdf && (
            <a
              href={pdf}
              target="_blank"
              rel="noreferrer"
              className="rounded bg-brand-700 px-4 py-2 text-white no-underline hover:bg-brand-900"
            >
              {dict.common.download} PDF
            </a>
          )}
          {p.doi && (
            <a
              href={`https://doi.org/${p.doi}`}
              target="_blank"
              rel="noreferrer"
              className="rounded border border-ink-200 px-4 py-2 text-ink-900 no-underline hover:border-ink-300"
            >
              DOI: {p.doi}
            </a>
          )}
          {p.externalUrl && !p.doi && (
            <a
              href={p.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded border border-ink-200 px-4 py-2 text-ink-900 no-underline hover:border-ink-300"
            >
              {dict.common.openExternal}
            </a>
          )}
        </div>

        {(p.topics?.length || p.tags?.length) ? (
          <dl className="mt-10 space-y-3 border-t border-ink-100 pt-6 text-sm">
            {p.topics?.length ? (
              <div>
                <dt className="text-ink-500">{dict.common.topics}</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {p.topics.map((t) => (
                    <Link
                      key={t._id}
                      href={localizedHref(
                        "topics",
                        lang,
                        (lang === "en" ? t.slug.en?.current : t.slug.pt?.current) || t._id,
                      )}
                      className="rounded bg-ink-100 px-2 py-1 text-ink-900 no-underline hover:bg-ink-200"
                    >
                      {tField(t.name, lang)}
                    </Link>
                  ))}
                </dd>
              </div>
            ) : null}
            {p.tags?.length ? (
              <div>
                <dt className="text-ink-500">{dict.common.tags}</dt>
                <dd className="mt-1 flex flex-wrap gap-2 text-ink-500">
                  {p.tags.map((t) => (
                    <span key={t._id}>#{tField(t.label, lang)}</span>
                  ))}
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </Container>
    </>
  );
}
