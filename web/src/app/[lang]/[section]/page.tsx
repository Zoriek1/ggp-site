import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLang, type Lang } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { resolveSegment, segmentFor, isSearchSegment, type RouteKey } from "@/i18n/routes";

import { AboutPage } from "@/features/institutional/AboutPage";
import { ContactPage } from "@/features/institutional/ContactPage";
import { MembersListPage } from "@/features/members/MembersListPage";
import { PgpsListPage } from "@/features/pgps/PgpsListPage";
import { PublicationsListPage } from "@/features/publications/PublicationsListPage";
import { ThesesListPage } from "@/features/theses/ThesesListPage";
import { TeachingMaterialsListPage } from "@/features/teaching-materials/TeachingMaterialsListPage";
import { MediaListPage } from "@/features/media/MediaListPage";
import { ResourcesListPage } from "@/features/resources/ResourcesListPage";
import { EventsListPage } from "@/features/events/EventsListPage";
import { TopicsIndexPage } from "@/features/topics/TopicsIndexPage";
import { ResearchAreasIndexPage } from "@/features/research-areas/ResearchAreasIndexPage";
import { SearchPage } from "@/features/search/SearchPage";
import { buildMetadataForList } from "@/lib/seo/metadata";
import { parseFilters, type RawSearchParams } from "@/lib/discovery/filters";

type RouteParams = { lang: string; section: string };
type SearchParams = RawSearchParams;

// Alguns renderers ignoram `page` — TS aceita passar a prop extra via cast.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ListRenderer = React.ComponentType<any>;

const PAGE_RENDERERS: Record<RouteKey, ListRenderer> = {
  about: AboutPage,
  contact: ContactPage,
  members: MembersListPage,
  pgps: PgpsListPage,
  publications: PublicationsListPage,
  theses: ThesesListPage,
  teachingMaterials: TeachingMaterialsListPage,
  media: MediaListPage,
  resources: ResourcesListPage,
  events: EventsListPage,
  topics: TopicsIndexPage,
  researchAreas: ResearchAreasIndexPage,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { lang, section } = await params;
  if (!isLang(lang)) return {};
  if (isSearchSegment(section, lang)) {
    return { title: getDictionary(lang).common.search, robots: { index: false, follow: false } };
  }
  const key = resolveSegment(section);
  if (!key) return {};
  // hreflang canônico: redireciona o EN para o segmento traduzido se vier no idioma errado
  if (segmentFor(key, lang) !== section) return {};
  return buildMetadataForList({ key, lang });
}

export default async function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<SearchParams>;
}) {
  const { lang, section } = await params;
  const sp = await searchParams;
  if (!isLang(lang)) notFound();

  if (isSearchSegment(section, lang)) {
    const qRaw = Array.isArray(sp.q) ? sp.q[0] : sp.q;
    return <SearchPage lang={lang} q={(qRaw ?? "").trim()} />;
  }

  const key = resolveSegment(section);
  if (!key) notFound();

  // Se o usuário acessar com o segmento do OUTRO idioma (ex.: /pt/publications),
  // 404 (o middleware do switcher emite a URL correta).
  if (segmentFor(key, lang) !== section) notFound();

  const Renderer = PAGE_RENDERERS[key];
  const pageRaw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, parseInt(pageRaw ?? "1", 10) || 1);
  const filters = parseFilters(sp);
  return <Renderer lang={lang} page={page} filters={filters} />;
}
