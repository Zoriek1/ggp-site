import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLang, type Lang } from "@/i18n/config";
import { resolveSegment, segmentFor, type RouteKey } from "@/i18n/routes";

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
import { buildMetadataForList } from "@/lib/seo/metadata";

type RouteParams = { lang: string; section: string };
type SearchParams = { page?: string };

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

  const key = resolveSegment(section);
  if (!key) notFound();

  // Se o usuário acessar com o segmento do OUTRO idioma (ex.: /pt/publications),
  // 404 (o middleware do switcher emite a URL correta).
  if (segmentFor(key, lang) !== section) notFound();

  const Renderer = PAGE_RENDERERS[key];
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  return <Renderer lang={lang} page={page} />;
}
