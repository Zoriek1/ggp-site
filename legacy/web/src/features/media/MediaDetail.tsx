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
import { mediaBySlugQuery } from "@/lib/sanity/queries";
import type { MediaItem } from "@/lib/sanity/types";
import { mediaJsonLd } from "@/lib/seo/jsonLd";
import { buildMetadataForDetail } from "@/lib/seo/metadata";
import { slugStrict } from "@/lib/slug";
import { formatDate, youtubeId } from "@/lib/format";

const fetchMedia = (slug: string) =>
  sanityFetch<MediaItem | null>(mediaBySlugQuery, { slug }, { tags: ["media"] });

export async function mediaMetadata({ lang, slug }: { lang: Lang; slug: string }): Promise<Metadata> {
  const m = await fetchMedia(slug);
  if (!m) return {};
  return buildMetadataForDetail({
    key: "media",
    lang,
    slugPt: slugStrict(m.slug, "pt"),
    slugEn: slugStrict(m.slug, "en"),
    title: tField(m.title, lang),
    description: tField(m.description, lang)?.slice(0, 200),
  });
}

export async function MediaDetail({ lang, slug }: { lang: Lang; slug: string }) {
  const m = await fetchMedia(slug);
  if (!m) notFound();

  const dict = getDictionary(lang);
  const title = tField(m.title, lang);
  const desc = tField(m.description, lang);
  const yid = youtubeId(m.videoUrl);
  const missing = tMissing(m.title, lang) || (m.description ? tMissing(m.description, lang) : false);

  return (
    <>
      <JsonLd data={mediaJsonLd(m, lang)} />
      <Container className="py-12 max-w-3xl">
        <Link href={localizedHref("media", lang)} className="text-sm text-ink-500 hover:text-ink-900">
          ← {dict.common.backTo} {dict.nav.media.toLowerCase()}
        </Link>

        <h1 className="mt-4 font-serif text-3xl leading-tight text-ink-900 sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-ink-500">
          {dict.mediaType[m.type]} · {formatDate(m.date, lang)}
        </p>

        <TranslationNotice lang={lang} show={missing} />

        {yid ? (
          <div className="mt-6 aspect-video w-full overflow-hidden rounded">
            <iframe
              src={`https://www.youtube.com/embed/${yid}`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full border-0"
            />
          </div>
        ) : (
          <a
            href={m.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-block rounded bg-brand-button px-4 py-2 text-sm text-white no-underline hover:bg-brand-button-hover"
          >
            {dict.common.watch}
          </a>
        )}

        {(m.speakers?.length || m.externalSpeakers?.length) ? (
          <p className="mt-6 text-sm text-ink-700">
            <span className="text-ink-500">{dict.common.speakers}: </span>
            {[...(m.speakers?.map((s) => s.name) ?? []), ...(m.externalSpeakers ?? [])].join(", ")}
          </p>
        ) : null}

        {desc && <p className="mt-4 whitespace-pre-line text-ink-900">{desc}</p>}
      </Container>
    </>
  );
}
