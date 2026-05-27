import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLang, type Lang } from "@/i18n/config";
import { resolveSegment, segmentFor, type RouteKey } from "@/i18n/routes";

import { MemberDetail, memberMetadata } from "@/features/members/MemberDetail";
import { PgpDetail, pgpMetadata } from "@/features/pgps/PgpDetail";
import { PublicationDetail, publicationMetadata } from "@/features/publications/PublicationDetail";
import { ThesisDetail, thesisMetadata } from "@/features/theses/ThesisDetail";
import { TeachingMaterialDetail, teachingMaterialMetadata } from "@/features/teaching-materials/TeachingMaterialDetail";
import { MediaDetail, mediaMetadata } from "@/features/media/MediaDetail";
import { ResourceDetail, resourceMetadata } from "@/features/resources/ResourceDetail";
import { EventDetail, eventMetadata } from "@/features/events/EventDetail";
import { TopicDetail, topicMetadata } from "@/features/topics/TopicDetail";
import { ResearchAreaDetail, researchAreaMetadata } from "@/features/research-areas/ResearchAreaDetail";

type Params = { lang: string; section: string; slug: string };

type DetailRenderer = React.ComponentType<{ lang: Lang; slug: string }>;
type MetaBuilder = (args: { lang: Lang; slug: string }) => Promise<Metadata>;

const RENDERERS: Partial<Record<RouteKey, { render: DetailRenderer; meta: MetaBuilder }>> = {
  members: { render: MemberDetail, meta: memberMetadata },
  pgps: { render: PgpDetail, meta: pgpMetadata },
  publications: { render: PublicationDetail, meta: publicationMetadata },
  theses: { render: ThesisDetail, meta: thesisMetadata },
  teachingMaterials: { render: TeachingMaterialDetail, meta: teachingMaterialMetadata },
  media: { render: MediaDetail, meta: mediaMetadata },
  resources: { render: ResourceDetail, meta: resourceMetadata },
  events: { render: EventDetail, meta: eventMetadata },
  topics: { render: TopicDetail, meta: topicMetadata },
  researchAreas: { render: ResearchAreaDetail, meta: researchAreaMetadata },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang, section, slug } = await params;
  if (!isLang(lang)) return {};
  const key = resolveSegment(section);
  if (!key || segmentFor(key, lang) !== section) return {};
  const r = RENDERERS[key];
  if (!r) return {};
  return r.meta({ lang, slug });
}

export default async function DetailPage({ params }: { params: Promise<Params> }) {
  const { lang, section, slug } = await params;
  if (!isLang(lang)) notFound();
  const key = resolveSegment(section);
  if (!key || segmentFor(key, lang) !== section) notFound();
  const r = RENDERERS[key];
  if (!r) notFound();
  const Renderer = r.render;
  return <Renderer lang={lang} slug={slug} />;
}
