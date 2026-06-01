import Link from "next/link";
import type { Metadata } from "next";
import { isLang, type Lang } from "@/i18n/config";
import { notFound } from "next/navigation";
import { getDictionary, tField } from "@/i18n/dictionaries";
import { localizedHref } from "@/i18n/routes";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { Card } from "@/components/Card";
import { Hreflang } from "@/components/Hreflang";
import { JsonLd } from "@/components/JsonLd";
import { sanityFetch } from "@/lib/sanity/client";
import {
  siteSettingsQuery,
  homePublicationsQuery,
  homeStatsQuery,
  upcomingEventsQuery,
  teachingMaterialListQuery,
  thesisListQuery,
} from "@/lib/sanity/queries";
import type {
  SiteSettings,
  Publication,
  EventItem,
  TeachingMaterial,
  Thesis,
} from "@/lib/sanity/types";

type HomeStats = {
  publications: number;
  theses: number;
  teachingMaterials: number;
  media: number;
  events: number;
  members: number;
  pgps: number;
};
import { PortableBody } from "@/components/PortableBody";
import { PRESETS } from "@/lib/sanity/image";
import { resolvePdf } from "@/lib/files";
import { formatDate } from "@/lib/format";
import { env } from "@/lib/env";
import { slugFor } from "@/lib/slug";

type Params = { lang: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const settings = await sanityFetch<SiteSettings | null>(siteSettingsQuery, {}, {
    tags: ["siteSettings"],
  });
  const title = tField(settings?.siteName, lang) || "GGP";
  const description = tField(settings?.tagline, lang) || undefined;
  return {
    title: { default: title, template: `%s · ${title}` },
    description,
    openGraph: { title, description, locale: lang === "en" ? "en_US" : "pt_BR" },
  };
}

export default async function HomePage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const materialsQ = teachingMaterialListQuery();
  const thesesQ = thesisListQuery();
  const [settings, featuredPubs, events, materialsData, thesesData, stats] = await Promise.all([
    sanityFetch<SiteSettings | null>(siteSettingsQuery, {}, { tags: ["siteSettings"] }),
    sanityFetch<Publication[]>(homePublicationsQuery, {}, { tags: ["publication"] }),
    sanityFetch<EventItem[]>(upcomingEventsQuery, {}, { tags: ["event"] }),
    sanityFetch<{ items: TeachingMaterial[]; total: number }>(
      materialsQ.query,
      { ...materialsQ.params, start: 0, end: 6 },
      { tags: ["teachingMaterial"] },
    ),
    sanityFetch<{ items: Thesis[]; total: number }>(
      thesesQ.query,
      { ...thesesQ.params, start: 0, end: 4 },
      { tags: ["thesis"] },
    ),
    sanityFetch<HomeStats>(homeStatsQuery, {}, {
      tags: ["publication", "thesis", "teachingMaterial", "media", "event", "member", "pgp"],
    }),
  ]);

  const dict = getDictionary(lang);
  const siteName = tField(settings?.siteName, lang) || dict.home.heroTitle;
  const tagline = tField(settings?.tagline, lang) || dict.home.heroSubtitle;

  const statItems: Array<{ value: number; label: string; href: string }> = [
    { value: stats?.publications ?? 0, label: dict.nav.publications, href: localizedHref("publications", lang) },
    { value: stats?.members ?? 0, label: dict.nav.members, href: localizedHref("members", lang) },
    { value: stats?.pgps ?? 0, label: dict.nav.pgps, href: localizedHref("pgps", lang) },
    { value: stats?.theses ?? 0, label: dict.nav.theses, href: localizedHref("theses", lang) },
    { value: stats?.teachingMaterials ?? 0, label: dict.nav.teachingMaterials, href: localizedHref("teachingMaterials", lang) },
    { value: stats?.events ?? 0, label: dict.nav.events, href: localizedHref("events", lang) },
  ].filter((s) => s.value > 0);

  return (
    <>
      <Hreflang paths={{ pt: "", en: "" }} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ResearchOrganization",
          name: settings?.organization?.legalName || siteName,
          parentOrganization: settings?.organization?.parentOrganization,
          url: env.siteUrl,
        }}
      />

      <section className="hero-band relative overflow-hidden">
        {/* Brilho radial decorativo sobre a faixa escura da marca */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl"
        />
        <Container className="relative py-16 sm:py-24">
          <p className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.12em] text-white/70">
            <span className="h-1.5 w-6 rounded-full bg-accent-500" aria-hidden="true" />
            {settings?.organization?.parentOrganization || "Universidade Federal de Goiás"}
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold leading-[1.05] text-white sm:text-6xl">
            {siteName}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/90 sm:text-xl">{tagline}</p>
          {settings?.heroIntro && (
            <div className="mt-6 max-w-3xl">
              <PortableBody value={(settings.heroIntro as Record<Lang, unknown>)[lang]} />
            </div>
          )}
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href={localizedHref("publications", lang)}
              className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-brand-900 no-underline shadow-sm transition hover:bg-white/90"
            >
              {dict.nav.publications}
            </Link>
            <Link
              href={localizedHref("members", lang)}
              className="rounded-md border border-white/30 px-5 py-2.5 text-sm font-medium text-white no-underline transition hover:bg-white/10"
            >
              {dict.nav.members}
            </Link>
            <Link
              href={localizedHref("about", lang)}
              className="rounded-md border border-white/30 px-5 py-2.5 text-sm font-medium text-white no-underline transition hover:bg-white/10"
            >
              {dict.nav.about}
            </Link>
          </div>
        </Container>
      </section>

      {statItems.length > 0 && (
        <section className="border-b border-ink-100 bg-surface">
          <Container>
            <dl className="grid grid-cols-2 divide-x divide-y divide-ink-100 sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
              {statItems.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  className="group flex flex-col gap-1 px-4 py-6 no-underline transition hover:bg-brand-50"
                >
                  <dd className="font-serif text-3xl font-semibold text-ink-900 sm:text-4xl">
                    {s.value}
                  </dd>
                  <dt className="text-xs uppercase tracking-wide text-ink-500 group-hover:text-brand-700">
                    {s.label}
                  </dt>
                </Link>
              ))}
            </dl>
          </Container>
        </section>
      )}

      {featuredPubs.length > 0 && (
        <section className="py-12">
          <Container>
            <SectionHeading
              title={dict.home.featuredPublications}
              href={localizedHref("publications", lang)}
              hrefLabel={dict.home.exploreAll}
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPubs.map((p) => (
                <Card
                  key={p._id}
                  href={localizedHref("publications", lang, slugFor(p.slug, lang, p._id))}
                  title={tField(p.title, lang)}
                  subtitle={`${p.year}${p.venue ? ` · ${p.venue}` : ""}`}
                  description={tField(p.abstract, lang)}
                  meta={resolvePdf(p) ? "PDF" : p.doi ? `DOI: ${p.doi}` : null}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {thesesData.items.length > 0 && (
        <section className="border-t border-ink-100 bg-surface py-12">
          <Container>
            <SectionHeading
              title={dict.home.recentTheses}
              href={localizedHref("theses", lang)}
              hrefLabel={dict.home.exploreAll}
            />
            <ul className="divide-y divide-ink-100">
              {thesesData.items.map((t) => (
                <li key={t._id} className="py-4">
                  <Link
                    href={localizedHref("theses", lang, slugFor(t.slug, lang, t._id))}
                    className="block no-underline hover:underline"
                  >
                    <p className="text-xs uppercase tracking-wide text-brand-700">
                      {dict.thesisLevel[t.level]} · {t.year}
                    </p>
                    <p className="font-serif text-lg text-ink-900">{tField(t.title, lang)}</p>
                    <p className="text-sm text-ink-500">
                      {t.author?.name || t.externalAuthorName}
                      {t.advisor && ` · ${dict.common.advisor}: ${t.advisor.name}`}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {materialsData.items.length > 0 && (
        <section className="py-12">
          <Container>
            <SectionHeading
              title={dict.home.teachingMaterials}
              href={localizedHref("teachingMaterials", lang)}
              hrefLabel={dict.home.exploreAll}
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {materialsData.items.map((m) => (
                <Card
                  key={m._id}
                  href={localizedHref("teachingMaterials", lang, slugFor(m.slug, lang, m._id))}
                  title={tField(m.title, lang)}
                  subtitle={tField(m.level?.name, lang)}
                  description={tField(m.description, lang)}
                  imageUrl={m.coverImage ? PRESETS.thumb16x9(m.coverImage) : null}
                  imageAlt={(lang === "en" ? m.coverImage?.altEn : m.coverImage?.alt) || ""}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {events.length > 0 && (
        <section className="border-t border-ink-100 bg-surface py-12">
          <Container>
            <SectionHeading
              title={dict.home.upcomingEvents}
              href={localizedHref("events", lang)}
              hrefLabel={dict.home.exploreAll}
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((e) => (
                <Card
                  key={e._id}
                  href={localizedHref("events", lang, slugFor(e.slug, lang, e._id))}
                  title={tField(e.title, lang)}
                  subtitle={formatDate(e.startDate, lang)}
                  meta={e.location || (e.isOnline ? dict.common.online : null)}
                  imageUrl={e.coverImage ? PRESETS.thumb16x9(e.coverImage) : null}
                  imageAlt={(lang === "en" ? e.coverImage?.altEn : e.coverImage?.alt) || ""}
                />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
