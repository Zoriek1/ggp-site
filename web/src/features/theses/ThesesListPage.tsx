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
import { thesisListQuery } from "@/lib/sanity/queries";
import type { Thesis } from "@/lib/sanity/types";
import { slugFor } from "@/lib/slug";
import { pageBounds, totalPagesFor } from "@/lib/pagination";
import { buildFacets } from "@/lib/discovery/facets";
import { type Filters, filtersToQuery } from "@/lib/discovery/filters";

export async function ThesesListPage({
  lang,
  page,
  filters = {},
}: {
  lang: Lang;
  page: number;
  filters?: Filters;
}) {
  const { start, end, page: p } = pageBounds(page);
  const q = thesisListQuery(filters);
  const [data, facets] = await Promise.all([
    sanityFetch<{ items: Thesis[]; total: number }>(
      q.query,
      { ...q.params, start, end },
      { tags: ["thesis"] },
    ),
    buildFacets(lang, "thesis", ["topic", "area", "tag", "thesisLevel", "year"]),
  ]);
  const dict = getDictionary(lang);
  const totalPages = totalPagesFor(data.total);
  const resultsLabel = `${data.total} ${data.total === 1 ? dict.common.result : dict.common.results}`;

  return (
    <>
      <Hreflang
        paths={{ pt: `/${segmentFor("theses", "pt")}`, en: `/${segmentFor("theses", "en")}` }}
      />
      <PageHeader eyebrow={dict.common.repository} title={dict.nav.theses} />
      <Container className="py-12 max-w-4xl">
        <FilterBar facets={facets} clearLabel={dict.common.clearFilters} resultsLabel={resultsLabel} filterByLabel={dict.common.filterBy} selectPlaceholder={dict.common.selectPlaceholder} />

        {data.items.length === 0 ? (
          <p className="mt-10 text-ink-500">{dict.common.noResults}</p>
        ) : (
          <ul className="mt-8 divide-y divide-ink-100">
            {data.items.map((t) => (
              <li key={t._id} className="py-5">
                <Link
                  href={localizedHref("theses", lang, slugFor(t.slug, lang, t._id))}
                  className="block no-underline hover:underline"
                >
                  <p className="text-xs uppercase tracking-wide text-brand-700">
                    {dict.thesisLevel[t.level]} · {t.year}
                  </p>
                  <p className="mt-1 font-serif text-lg text-ink-900">{tField(t.title, lang)}</p>
                  <p className="text-sm text-ink-500">
                    {t.author?.name || t.externalAuthorName}
                    {t.advisor && ` · ${dict.common.advisor}: ${t.advisor.name}`}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Pagination
          page={p}
          totalPages={totalPages}
          basePath={localizedHref("theses", lang)}
          lang={lang}
          query={filtersToQuery(filters)}
        />
      </Container>
    </>
  );
}
