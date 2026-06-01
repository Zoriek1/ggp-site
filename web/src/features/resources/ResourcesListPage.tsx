import Link from "next/link";
import type { Lang } from "@/i18n/config";
import { tField, getDictionary } from "@/i18n/dictionaries";
import { localizedHref, segmentFor } from "@/i18n/routes";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { FilterBar } from "@/components/FilterBar";
import { Hreflang } from "@/components/Hreflang";
import { sanityFetch } from "@/lib/sanity/client";
import { resourceListQuery } from "@/lib/sanity/queries";
import type { Resource } from "@/lib/sanity/types";
import { slugFor } from "@/lib/slug";
import { pageBounds, totalPagesFor } from "@/lib/pagination";
import { buildFacets } from "@/lib/discovery/facets";
import { type Filters, filtersToQuery } from "@/lib/discovery/filters";

export async function ResourcesListPage({
  lang,
  page,
  filters = {},
}: {
  lang: Lang;
  page: number;
  filters?: Filters;
}) {
  const { start, end, page: p } = pageBounds(page);
  const q = resourceListQuery(filters);
  const [data, facets] = await Promise.all([
    sanityFetch<{ items: Resource[]; total: number }>(
      q.query,
      { ...q.params, start, end },
      { tags: ["resource"] },
    ),
    buildFacets(lang, "resource", ["topic", "category", "tag"]),
  ]);
  const dict = getDictionary(lang);
  const totalPages = totalPagesFor(data.total);
  const resultsLabel = `${data.total} ${data.total === 1 ? dict.common.result : dict.common.results}`;

  return (
    <>
      <Hreflang
        paths={{ pt: `/${segmentFor("resources", "pt")}`, en: `/${segmentFor("resources", "en")}` }}
      />
      <PageHeader eyebrow={dict.common.repository} title={dict.nav.resources} />
      <Container className="py-12 max-w-4xl">
        <FilterBar facets={facets} clearLabel={dict.common.clearFilters} resultsLabel={resultsLabel} filterByLabel={dict.common.filterBy} selectPlaceholder={dict.common.selectPlaceholder} />

        {data.items.length === 0 ? (
          <p className="mt-10 text-ink-500">{dict.common.noResults}</p>
        ) : (
          <ul className="mt-8 divide-y divide-ink-100">
            {data.items.map((r) => (
              <li key={r._id} className="py-4">
                <Link
                  href={localizedHref("resources", lang, slugFor(r.slug, lang, r._id))}
                  className="block no-underline hover:underline"
                >
                  <p className="text-xs uppercase tracking-wide text-brand-700">
                    {dict.resourceCategory[r.category]}
                  </p>
                  <p className="mt-1 font-serif text-lg text-ink-900">{tField(r.title, lang)}</p>
                  {tField(r.description, lang) && (
                    <p className="text-sm text-ink-700 line-clamp-2">{tField(r.description, lang)}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Pagination
          page={p}
          totalPages={totalPages}
          basePath={localizedHref("resources", lang)}
          lang={lang}
          query={filtersToQuery(filters)}
        />
      </Container>
    </>
  );
}
