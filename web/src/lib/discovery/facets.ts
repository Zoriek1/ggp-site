/**
 * Monta as facetas (opções de filtro) já localizadas, no server, para o <FilterBar/>.
 * Busca só as taxonomias necessárias (`kinds`) e rotula via dicionário/tField.
 */
import type { Lang } from "@/i18n/config";
import { getDictionary, tField } from "@/i18n/dictionaries";
import { sanityFetch } from "@/lib/sanity/client";
import {
  allTopicsQuery,
  allResearchAreasQuery,
  allTagsQuery,
  allEducationLevelsQuery,
  yearsForTypeQuery,
} from "@/lib/sanity/queries";
import { slugFor } from "@/lib/slug";
import type { Topic, ResearchArea, Tag, EducationLevel } from "@/lib/sanity/types";
import type { Facet, FacetOption } from "./filters";

export type FacetKind =
  | "topic"
  | "area"
  | "tag"
  | "year"
  | "eduLevel"
  | "thesisLevel"
  | "mediaType"
  | "category"
  | "time";

export async function buildFacets(
  lang: Lang,
  type: string,
  kinds: FacetKind[],
): Promise<Facet[]> {
  const dict = getDictionary(lang);
  const need = (k: FacetKind) => kinds.includes(k);

  const [topics, areas, tags, levels, years] = await Promise.all([
    need("topic")
      ? sanityFetch<Topic[]>(allTopicsQuery, {}, { tags: ["physicsTopic"] })
      : Promise.resolve<Topic[]>([]),
    need("area")
      ? sanityFetch<ResearchArea[]>(allResearchAreasQuery, {}, { tags: ["researchArea"] })
      : Promise.resolve<ResearchArea[]>([]),
    need("tag")
      ? sanityFetch<Tag[]>(allTagsQuery, {}, { tags: ["tag"] })
      : Promise.resolve<Tag[]>([]),
    need("eduLevel")
      ? sanityFetch<EducationLevel[]>(allEducationLevelsQuery, {}, { tags: ["educationLevel"] })
      : Promise.resolve<EducationLevel[]>([]),
    need("year")
      ? sanityFetch<number[]>(yearsForTypeQuery, { type }, { tags: [type] })
      : Promise.resolve<number[]>([]),
  ]);

  const clean = (opts: FacetOption[]) => opts.filter((o) => o.value && o.label);

  const facetFor = (kind: FacetKind): Facet | null => {
    switch (kind) {
      case "topic":
        return {
          param: "topic",
          label: dict.common.topics,
          options: clean(topics.map((t) => ({ value: slugFor(t.slug, lang), label: tField(t.name, lang) }))),
        };
      case "area":
        return {
          param: "area",
          label: dict.common.researchAreas,
          options: clean(areas.map((a) => ({ value: slugFor(a.slug, lang), label: tField(a.name, lang) }))),
        };
      case "tag":
        return {
          param: "tag",
          label: dict.common.tags,
          options: clean(tags.map((t) => ({ value: slugFor(t.slug, lang), label: tField(t.label, lang) }))),
        };
      case "eduLevel":
        return {
          param: "level",
          label: dict.common.level,
          options: clean(levels.map((l) => ({ value: slugFor(l.slug, lang), label: tField(l.name, lang) }))),
        };
      case "thesisLevel":
        return {
          param: "level",
          label: dict.common.level,
          options: (["tcc", "masters", "doctorate"] as const).map((k) => ({ value: k, label: dict.thesisLevel[k] })),
        };
      case "mediaType":
        return {
          param: "mediaType",
          label: dict.common.type,
          options: (["video", "lecture", "podcast", "webinar"] as const).map((k) => ({ value: k, label: dict.mediaType[k] })),
        };
      case "category":
        return {
          param: "category",
          label: dict.common.category,
          options: (["link", "dataset", "tool", "text", "other"] as const).map((k) => ({ value: k, label: dict.resourceCategory[k] })),
        };
      case "year": {
        const uniq = [...new Set(years)].filter((y) => typeof y === "number").sort((a, b) => b - a);
        return { param: "year", label: dict.common.year, options: uniq.map((y) => ({ value: String(y), label: String(y) })) };
      }
      case "time":
        return {
          param: "time",
          label: dict.common.period,
          options: [
            { value: "upcoming", label: dict.common.upcoming },
            { value: "past", label: dict.common.past },
          ],
        };
      default:
        return null;
    }
  };

  const result: Facet[] = [];
  for (const kind of kinds) {
    const f = facetFor(kind);
    // Esconde facetas dinâmicas vazias; mantém as estáticas (enums/tempo) sempre.
    const isStatic = kind === "time" || kind === "thesisLevel" || kind === "mediaType" || kind === "category";
    if (f && (f.options.length > 0 || isStatic)) result.push(f);
  }
  return result;
}
