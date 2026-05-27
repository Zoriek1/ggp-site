import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Lang } from "@/i18n/config";
import { tField, getDictionary } from "@/i18n/dictionaries";
import { localizedHref } from "@/i18n/routes";
import { Container } from "@/components/Container";
import { sanityFetch } from "@/lib/sanity/client";
import { topicBySlugQuery } from "@/lib/sanity/queries";
import type { Topic, Publication, Thesis, TeachingMaterial, MediaItem } from "@/lib/sanity/types";
import { buildMetadataForDetail } from "@/lib/seo/metadata";
import { slugStrict } from "@/lib/slug";

const relatedQuery = /* groq */ `
{
  "publications": *[_type == "publication" && references($topicId)] | order(year desc) [0...50]{
    _id, title, "slugPt": slug.pt.current, "slugEn": slug.en.current, year, venue
  },
  "theses": *[_type == "thesis" && references($topicId)] | order(year desc) [0...50]{
    _id, title, "slugPt": slug.pt.current, "slugEn": slug.en.current, year, level
  },
  "materials": *[_type == "teachingMaterial" && references($topicId)] | order(publishedDate desc) [0...50]{
    _id, title, "slugPt": slug.pt.current, "slugEn": slug.en.current
  },
  "media": *[_type == "media" && references($topicId)] | order(date desc) [0...50]{
    _id, title, "slugPt": slug.pt.current, "slugEn": slug.en.current, type, date
  }
}
`;

type RelatedRow<T = unknown> = T & { _id: string; slugPt?: string; slugEn?: string; title: { pt?: string; en?: string } };

export async function topicMetadata({ lang, slug }: { lang: Lang; slug: string }): Promise<Metadata> {
  const t = await sanityFetch<Topic | null>(topicBySlugQuery, { slug }, { tags: ["physicsTopic"] });
  if (!t) return {};
  return buildMetadataForDetail({
    key: "topics",
    lang,
    slugPt: slugStrict(t.slug, "pt"),
    slugEn: slugStrict(t.slug, "en"),
    title: tField(t.name, lang),
  });
}

export async function TopicDetail({ lang, slug }: { lang: Lang; slug: string }) {
  const topic = await sanityFetch<(Topic & { description?: { pt?: string; en?: string } | null }) | null>(
    topicBySlugQuery,
    { slug },
    { tags: ["physicsTopic"] },
  );
  if (!topic) notFound();

  const related = await sanityFetch<{
    publications: RelatedRow<Publication>[];
    theses: RelatedRow<Thesis>[];
    materials: RelatedRow<TeachingMaterial>[];
    media: RelatedRow<MediaItem>[];
  }>(relatedQuery, { topicId: topic._id }, { tags: ["publication", "thesis", "teachingMaterial", "media"] });

  const dict = getDictionary(lang);
  const name = tField(topic.name, lang);

  return (
    <Container className="py-12 max-w-3xl">
      <Link href={localizedHref("topics", lang)} className="text-sm text-ink-500 hover:text-ink-900">
        ← {dict.common.backTo} {dict.nav.topics.toLowerCase()}
      </Link>
      <h1 className="mt-4 font-serif text-4xl text-ink-900">{name}</h1>
      {tField(topic.description, lang) && (
        <p className="mt-4 text-ink-700">{tField(topic.description, lang)}</p>
      )}

      <RelatedSection title={dict.nav.publications} items={related.publications} hrefFor={(r) => localizedHref("publications", lang, (lang === "en" ? r.slugEn : r.slugPt) || r._id)} lang={lang} />
      <RelatedSection title={dict.nav.theses} items={related.theses} hrefFor={(r) => localizedHref("theses", lang, (lang === "en" ? r.slugEn : r.slugPt) || r._id)} lang={lang} />
      <RelatedSection title={dict.nav.teachingMaterials} items={related.materials} hrefFor={(r) => localizedHref("teachingMaterials", lang, (lang === "en" ? r.slugEn : r.slugPt) || r._id)} lang={lang} />
      <RelatedSection title={dict.nav.media} items={related.media} hrefFor={(r) => localizedHref("media", lang, (lang === "en" ? r.slugEn : r.slugPt) || r._id)} lang={lang} />
    </Container>
  );
}

function RelatedSection({
  title,
  items,
  hrefFor,
  lang,
}: {
  title: string;
  items: RelatedRow[];
  hrefFor: (r: RelatedRow) => string;
  lang: Lang;
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-10 border-t border-ink-100 pt-6">
      <h2 className="font-serif text-2xl text-ink-900">
        {title} <span className="text-base font-normal text-ink-500">({items.length})</span>
      </h2>
      <ul className="mt-3 divide-y divide-ink-100">
        {items.map((r) => (
          <li key={r._id} className="py-2">
            <Link href={hrefFor(r)} className="text-ink-900 no-underline hover:underline">
              {tField(r.title, lang)}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

