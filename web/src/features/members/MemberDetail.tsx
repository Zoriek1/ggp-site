import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Lang } from "@/i18n/config";
import { tField, getDictionary } from "@/i18n/dictionaries";
import { localizedHref } from "@/i18n/routes";
import { Container } from "@/components/Container";
import { JsonLd } from "@/components/JsonLd";
import { sanityFetch } from "@/lib/sanity/client";
import {
  memberBySlugQuery,
  publicationsByMemberQuery,
  thesesAuthoredByMemberQuery,
  thesesAdvisedByMemberQuery,
  teachingMaterialsByMemberQuery,
  mediaByMemberQuery,
  eventsByMemberQuery,
  pgpsByMemberQuery,
} from "@/lib/sanity/queries";
import type {
  Member,
  Publication,
  Thesis,
  TeachingMaterial,
  MediaItem,
  EventItem,
} from "@/lib/sanity/types";

type PgpRef = { _id: string; name: string; status: string; school?: string | null; slugPt?: string; slugEn?: string };
import { PRESETS } from "@/lib/sanity/image";
import { memberJsonLd } from "@/lib/seo/jsonLd";
import { buildMetadataForDetail } from "@/lib/seo/metadata";
import { slugFor } from "@/lib/slug";

const fetchMember = (slug: string) =>
  sanityFetch<Member | null>(memberBySlugQuery, { slug }, { tags: ["member"] });

export async function memberMetadata({ lang, slug }: { lang: Lang; slug: string }): Promise<Metadata> {
  const m = await fetchMember(slug);
  if (!m) return {};
  return buildMetadataForDetail({
    key: "members",
    lang,
    slugPt: slug,
    slugEn: slug,
    title: m.name,
    description: tField(m.bio, lang)?.slice(0, 200),
    ogImage: m.photo ? PRESETS.memberHero(m.photo) : null,
  });
}

export async function MemberDetail({ lang, slug }: { lang: Lang; slug: string }) {
  const m = await fetchMember(slug);
  if (!m) notFound();

  const [pubs, thesesOwn, thesesAdvised, materials, mediaItems, events, pgps] = await Promise.all([
    sanityFetch<Publication[]>(publicationsByMemberQuery, { memberId: m._id }, { tags: ["publication"] }),
    sanityFetch<Thesis[]>(thesesAuthoredByMemberQuery, { memberId: m._id }, { tags: ["thesis"] }),
    sanityFetch<Thesis[]>(thesesAdvisedByMemberQuery, { memberId: m._id }, { tags: ["thesis"] }),
    sanityFetch<TeachingMaterial[]>(teachingMaterialsByMemberQuery, { memberId: m._id }, { tags: ["teachingMaterial"] }),
    sanityFetch<MediaItem[]>(mediaByMemberQuery, { memberId: m._id }, { tags: ["media"] }),
    sanityFetch<EventItem[]>(eventsByMemberQuery, { memberId: m._id }, { tags: ["event"] }),
    sanityFetch<PgpRef[]>(pgpsByMemberQuery, { memberId: m._id }, { tags: ["pgp"] }),
  ]);

  const dict = getDictionary(lang);

  return (
    <>
      <JsonLd data={memberJsonLd(m, lang)} />
      <Container className="py-12 max-w-4xl">
        <Link href={localizedHref("members", lang)} className="text-sm text-ink-500 hover:text-ink-900">
          ← {dict.common.backTo} {dict.nav.members.toLowerCase()}
        </Link>

        <header className="mt-6 flex flex-col items-start gap-6 sm:flex-row">
          {m.photo && (
            <Image
              src={PRESETS.memberHero(m.photo)}
              alt={(lang === "en" ? m.photo.altEn : m.photo.alt) || m.name}
              width={240}
              height={240}
              className="h-48 w-48 flex-none rounded-full object-cover"
            />
          )}
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-700">
              {dict.roles[m.role]}
            </p>
            <h1 className="mt-1 font-serif text-3xl text-ink-900 sm:text-4xl">{m.name}</h1>
            {tField(m.bio, lang) && (
              <p className="mt-4 whitespace-pre-line text-ink-700">{tField(m.bio, lang)}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {m.email && <a href={`mailto:${m.email}`}>{m.email}</a>}
              {m.orcid && (
                <a href={`https://orcid.org/${m.orcid}`} target="_blank" rel="noreferrer">
                  ORCID: {m.orcid}
                </a>
              )}
              {m.lattesUrl && (
                <a href={m.lattesUrl} target="_blank" rel="noreferrer">
                  Lattes
                </a>
              )}
              {m.linkedinUrl && (
                <a href={m.linkedinUrl} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              )}
              {m.personalUrl && (
                <a href={m.personalUrl} target="_blank" rel="noreferrer">
                  Site
                </a>
              )}
            </div>
          </div>
        </header>

        <Section title={dict.members.pgps} count={pgps.length}>
          <ul className="flex flex-wrap gap-2">
            {pgps.map((p) => {
              const slug = (lang === "en" ? p.slugEn : p.slugPt) || p._id;
              return (
                <li key={p._id}>
                  <Link
                    href={localizedHref("pgps", lang, slug)}
                    className="inline-flex items-center gap-2 rounded border border-ink-200 px-3 py-1 text-sm text-ink-900 no-underline hover:border-ink-300"
                  >
                    <span>{p.name}</span>
                    {p.school && <span className="text-ink-500">· {p.school}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Section>

        <Section title={dict.members.publications} count={pubs.length}>
          <ul className="divide-y divide-ink-100">
            {pubs.map((p) => (
              <li key={p._id} className="py-3">
                <Link
                  href={localizedHref("publications", lang, slugFor(p.slug, lang, p._id))}
                  className="block no-underline hover:underline"
                >
                  <p className="text-xs text-ink-500">{p.year}{p.venue && ` · ${p.venue}`}</p>
                  <p className="text-ink-900">{tField(p.title, lang)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        <Section title={dict.members.thesesAuthored} count={thesesOwn.length}>
          <ThesisInlineList lang={lang} items={thesesOwn} />
        </Section>

        <Section title={dict.members.thesesAdvised} count={thesesAdvised.length}>
          <ThesisInlineList lang={lang} items={thesesAdvised} />
        </Section>

        <Section title={dict.members.teachingMaterials} count={materials.length}>
          <ul className="divide-y divide-ink-100">
            {materials.map((tm) => (
              <li key={tm._id} className="py-3">
                <Link
                  href={localizedHref("teachingMaterials", lang, slugFor(tm.slug, lang, tm._id))}
                  className="block no-underline hover:underline text-ink-900"
                >
                  {tField(tm.title, lang)}
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        <Section title={dict.members.media} count={mediaItems.length}>
          <ul className="divide-y divide-ink-100">
            {mediaItems.map((mi) => (
              <li key={mi._id} className="py-3">
                <Link
                  href={localizedHref("media", lang, slugFor(mi.slug, lang, mi._id))}
                  className="block no-underline hover:underline text-ink-900"
                >
                  {tField(mi.title, lang)}
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        <Section title={dict.members.events} count={events.length}>
          <ul className="divide-y divide-ink-100">
            {events.map((e) => (
              <li key={e._id} className="py-3">
                <Link
                  href={localizedHref("events", lang, slugFor(e.slug, lang, e._id))}
                  className="block no-underline hover:underline text-ink-900"
                >
                  {tField(e.title, lang)}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      </Container>
    </>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <section className="mt-10 border-t border-ink-100 pt-8">
      <h2 className="font-serif text-2xl text-ink-900">
        {title} <span className="text-base font-normal text-ink-500">({count})</span>
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ThesisInlineList({ lang, items }: { lang: Lang; items: Thesis[] }) {
  const dict = getDictionary(lang);
  return (
    <ul className="divide-y divide-ink-100">
      {items.map((t) => (
        <li key={t._id} className="py-3">
          <Link
            href={localizedHref("theses", lang, slugFor(t.slug, lang, t._id))}
            className="block no-underline hover:underline"
          >
            <p className="text-xs text-ink-500">
              {dict.thesisLevel[t.level]} · {t.year}
            </p>
            <p className="text-ink-900">{tField(t.title, lang)}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
