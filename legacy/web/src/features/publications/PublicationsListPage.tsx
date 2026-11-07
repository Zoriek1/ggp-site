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
import { publicationListQuery } from "@/lib/sanity/queries";
import type { Publication } from "@/lib/sanity/types";
import { slugFor } from "@/lib/slug";
import { resolvePdf } from "@/lib/files";
import { PAGE_SIZE, pageBounds, totalPagesFor } from "@/lib/pagination";
import { buildFacets } from "@/lib/discovery/facets";
import { type Filters, filtersToQuery } from "@/lib/discovery/filters";

export async function PublicationsListPage({
  lang,
  page,
  filters = {},
}: {
  lang: Lang;
  page: number;
  filters?: Filters;
}) {
  const { start, end, page: p } = pageBounds(page);
  const q = publicationListQuery(filters);
  const [data, facets] = await Promise.all([
    sanityFetch<{ items: Publication[]; total: number }>(
      q.query,
      { ...q.params, start, end },
      { tags: ["publication"] },
    ),
    buildFacets(lang, "publication", ["topic", "area", "tag", "year"]),
  ]);
  const dict = getDictionary(lang);
  const totalPages = totalPagesFor(data.total);
  const resultsLabel = `${data.total} ${data.total === 1 ? dict.common.result : dict.common.results}`;

  return (
    <>
      <Hreflang
        paths={{
          pt: `/${segmentFor("publications", "pt")}`,
          en: `/${segmentFor("publications", "en")}`,
        }}
      />
      <PageHeader eyebrow={dict.common.repository} title={dict.nav.publications} />
      <Container className="py-12">
        <FilterBar facets={facets} clearLabel={dict.common.clearFilters} resultsLabel={resultsLabel} filterByLabel={dict.common.filterBy} selectPlaceholder={dict.common.selectPlaceholder} />

        {data.items.length === 0 ? (
          <p className="mt-10 text-ink-500">{dict.common.noResults}</p>
        ) : (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((p) => (
              <li key={p._id}>
                <Card
                  href={localizedHref("publications", lang, slugFor(p.slug, lang, p._id))}
                  title={tField(p.title, lang)}
                  subtitle={`${p.year}${p.venue ? ` · ${p.venue}` : ""}`}
                  description={tField(p.abstract, lang)}
                  meta={
                    resolvePdf(p)
                      ? "PDF"
                      : p.doi
                        ? `DOI: ${p.doi}`
                        : (p.authors?.map((a) => a.name).join(", ") || null)
                  }
                />
              </li>
            ))}
          </ul>
        )}

        <Pagination
          page={p}
          totalPages={totalPages}
          basePath={localizedHref("publications", lang)}
          lang={lang}
          query={filtersToQuery(filters)}
        />
      </Container>
    </>
  );
}

PublicationsListPage.pageSize = PAGE_SIZE;
