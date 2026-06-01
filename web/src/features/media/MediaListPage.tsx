import type { Lang } from "@/i18n/config";
import { tField, getDictionary } from "@/i18n/dictionaries";
import { localizedHref, segmentFor } from "@/i18n/routes";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Pagination } from "@/components/Pagination";
import { FilterBar } from "@/components/FilterBar";
import { Hreflang } from "@/components/Hreflang";
import { sanityFetch } from "@/lib/sanity/client";
import { mediaListQuery } from "@/lib/sanity/queries";
import type { MediaItem } from "@/lib/sanity/types";
import { slugFor } from "@/lib/slug";
import { pageBounds, totalPagesFor } from "@/lib/pagination";
import { formatDate, youtubeId } from "@/lib/format";
import { buildFacets } from "@/lib/discovery/facets";
import { type Filters, filtersToQuery } from "@/lib/discovery/filters";

export async function MediaListPage({
  lang,
  page,
  filters = {},
}: {
  lang: Lang;
  page: number;
  filters?: Filters;
}) {
  const { start, end, page: p } = pageBounds(page);
  const q = mediaListQuery(filters);
  const [data, facets] = await Promise.all([
    sanityFetch<{ items: MediaItem[]; total: number }>(
      q.query,
      { ...q.params, start, end },
      { tags: ["media"] },
    ),
    buildFacets(lang, "media", ["topic", "mediaType", "tag"]),
  ]);
  const dict = getDictionary(lang);
  const totalPages = totalPagesFor(data.total);
  const resultsLabel = `${data.total} ${data.total === 1 ? dict.common.result : dict.common.results}`;

  return (
    <>
      <Hreflang
        paths={{ pt: `/${segmentFor("media", "pt")}`, en: `/${segmentFor("media", "en")}` }}
      />
      <PageHeader eyebrow={dict.common.repository} title={dict.nav.media} />
      <Container className="py-12">
        <FilterBar facets={facets} clearLabel={dict.common.clearFilters} resultsLabel={resultsLabel} filterByLabel={dict.common.filterBy} selectPlaceholder={dict.common.selectPlaceholder} />

        {data.items.length === 0 ? (
          <p className="mt-10 text-ink-500">{dict.common.noResults}</p>
        ) : (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((m) => {
              const yid = youtubeId(m.videoUrl);
              return (
                <li key={m._id}>
                  <Card
                    href={localizedHref("media", lang, slugFor(m.slug, lang, m._id))}
                    title={tField(m.title, lang)}
                    subtitle={`${dict.mediaType[m.type]} · ${formatDate(m.date, lang)}`}
                    description={tField(m.description, lang)}
                    imageUrl={yid ? `https://i.ytimg.com/vi/${yid}/hqdefault.jpg` : null}
                    imageAlt={tField(m.title, lang)}
                  />
                </li>
              );
            })}
          </ul>
        )}

        <Pagination
          page={p}
          totalPages={totalPages}
          basePath={localizedHref("media", lang)}
          lang={lang}
          query={filtersToQuery(filters)}
        />
      </Container>
    </>
  );
}
