import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Lang } from "@/i18n/config";
import { tField, getDictionary, tMissing } from "@/i18n/dictionaries";
import { localizedHref } from "@/i18n/routes";
import { Container } from "@/components/Container";
import { JsonLd } from "@/components/JsonLd";
import { TranslationNotice } from "@/components/TranslationNotice";
import { PortableBody } from "@/components/PortableBody";
import { sanityFetch } from "@/lib/sanity/client";
import { eventBySlugQuery } from "@/lib/sanity/queries";
import type { EventItem } from "@/lib/sanity/types";
import { eventJsonLd } from "@/lib/seo/jsonLd";
import { buildMetadataForDetail } from "@/lib/seo/metadata";
import { slugStrict } from "@/lib/slug";
import { PRESETS } from "@/lib/sanity/image";
import { formatDateRange } from "@/lib/format";

const fetchEvent = (slug: string) =>
  sanityFetch<EventItem | null>(eventBySlugQuery, { slug }, { tags: ["event"] });

export async function eventMetadata({ lang, slug }: { lang: Lang; slug: string }): Promise<Metadata> {
  const e = await fetchEvent(slug);
  if (!e) return {};
  return buildMetadataForDetail({
    key: "events",
    lang,
    slugPt: slugStrict(e.slug, "pt"),
    slugEn: slugStrict(e.slug, "en"),
    title: tField(e.title, lang),
    ogImage: e.coverImage ? PRESETS.hero(e.coverImage) : null,
  });
}

export async function EventDetail({ lang, slug }: { lang: Lang; slug: string }) {
  const e = await fetchEvent(slug);
  if (!e) notFound();

  const dict = getDictionary(lang);
  const title = tField(e.title, lang);
  const description = (e.description as Record<Lang, unknown> | null | undefined)?.[lang];
  const missing = tMissing(e.title, lang);

  return (
    <>
      <JsonLd data={eventJsonLd(e, lang)} />
      <Container className="py-12 max-w-3xl">
        <Link href={localizedHref("events", lang)} className="text-sm text-ink-500 hover:text-ink-900">
          ← {dict.common.backTo} {dict.nav.events.toLowerCase()}
        </Link>

        {e.coverImage && (
          <div className="mt-4 overflow-hidden rounded">
            <Image
              src={PRESETS.hero(e.coverImage)}
              alt={(lang === "en" ? e.coverImage.altEn : e.coverImage.alt) || ""}
              width={1920}
              height={1080}
              className="h-auto w-full"
            />
          </div>
        )}

        <h1 className="mt-6 font-serif text-3xl leading-tight text-ink-900 sm:text-4xl">{title}</h1>

        <dl className="mt-3 grid gap-2 text-sm text-ink-700 sm:grid-cols-2">
          <div>
            <dt className="text-ink-500">{dict.common.starts}</dt>
            <dd>{formatDateRange(e.startDate, e.endDate, lang)}</dd>
          </div>
          {(e.location || e.isOnline) && (
            <div>
              <dt className="text-ink-500">{dict.common.location}</dt>
              <dd>{e.location || dict.common.online}</dd>
            </div>
          )}
        </dl>

        <TranslationNotice lang={lang} show={missing} />

        {description ? (
          <div className="mt-6">
            <PortableBody value={description} />
          </div>
        ) : null}

        {(e.speakers?.length || e.externalSpeakers?.length) ? (
          <p className="mt-6 text-sm text-ink-700">
            <span className="text-ink-500">{dict.common.speakers}: </span>
            {[...(e.speakers?.map((s) => s.name) ?? []), ...(e.externalSpeakers ?? [])].join(", ")}
          </p>
        ) : null}

        {e.registrationUrl && (
          <a
            href={e.registrationUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-block rounded bg-brand-button px-4 py-2 text-sm text-white no-underline hover:bg-brand-button-hover"
          >
            {dict.common.registrationOpen}
          </a>
        )}
      </Container>
    </>
  );
}
