import type { Lang } from "@/i18n/config";
import { tField, getDictionary } from "@/i18n/dictionaries";
import { localizedHref, segmentFor } from "@/i18n/routes";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { Pagination } from "@/components/Pagination";
import { FilterBar } from "@/components/FilterBar";
import { Hreflang } from "@/components/Hreflang";
import { sanityFetch } from "@/lib/sanity/client";
import { eventListQuery } from "@/lib/sanity/queries";
import type { EventItem } from "@/lib/sanity/types";
import { slugFor } from "@/lib/slug";
import { PRESETS } from "@/lib/sanity/image";
import { pageBounds, totalPagesFor } from "@/lib/pagination";
import { formatDateRange } from "@/lib/format";
import { buildFacets } from "@/lib/discovery/facets";
import { type Filters, filtersToQuery } from "@/lib/discovery/filters";

export async function EventsListPage({
  lang,
  page,
  filters = {},
}: {
  lang: Lang;
  page: number;
  filters?: Filters;
}) {
  const { start, end, page: p } = pageBounds(page);
  const q = eventListQuery(filters);
  const [data, facets] = await Promise.all([
    sanityFetch<{ items: EventItem[]; total: number }>(
      q.query,
      { ...q.params, start, end },
      { tags: ["event"] },
    ),
    buildFacets(lang, "event", ["topic", "time", "tag"]),
  ]);
  const dict = getDictionary(lang);
  const totalPages = totalPagesFor(data.total);
  const resultsLabel = `${data.total} ${data.total === 1 ? dict.common.result : dict.common.results}`;

  return (
    <>
      <Hreflang
        paths={{ pt: `/${segmentFor("events", "pt")}`, en: `/${segmentFor("events", "en")}` }}
      />
      <Container className="py-12">
        <h1 className="font-serif text-4xl text-ink-900">{dict.nav.events}</h1>

        <FilterBar facets={facets} clearLabel={dict.common.clearFilters} resultsLabel={resultsLabel} />

        {data.items.length === 0 ? (
          <p className="mt-10 text-ink-500">{dict.common.noResults}</p>
        ) : (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((e) => (
              <li key={e._id}>
                <Card
                  href={localizedHref("events", lang, slugFor(e.slug, lang, e._id))}
                  title={tField(e.title, lang)}
                  subtitle={formatDateRange(e.startDate, e.endDate, lang)}
                  meta={e.location || (e.isOnline ? dict.common.online : null)}
                  imageUrl={e.coverImage ? PRESETS.thumb16x9(e.coverImage) : null}
                  imageAlt={(lang === "en" ? e.coverImage?.altEn : e.coverImage?.alt) || ""}
                />
              </li>
            ))}
          </ul>
        )}

        <Pagination
          page={p}
          totalPages={totalPages}
          basePath={localizedHref("events", lang)}
          lang={lang}
          query={filtersToQuery(filters)}
        />
      </Container>
    </>
  );
}
