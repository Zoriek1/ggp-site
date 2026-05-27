import type { Lang } from "@/i18n/config";
import { tField, getDictionary } from "@/i18n/dictionaries";
import { localizedHref } from "@/i18n/routes";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { Pagination } from "@/components/Pagination";
import { Hreflang } from "@/components/Hreflang";
import { sanityFetch } from "@/lib/sanity/client";
import { publicationListQuery } from "@/lib/sanity/queries";
import type { Publication } from "@/lib/sanity/types";
import { slugFor } from "@/lib/slug";
import { resolvePdf } from "@/lib/files";
import { PAGE_SIZE, pageBounds, totalPagesFor } from "@/lib/pagination";
import { segmentFor } from "@/i18n/routes";

export async function PublicationsListPage({ lang, page }: { lang: Lang; page: number }) {
  const { start, end, page: p } = pageBounds(page);
  const data = await sanityFetch<{ items: Publication[]; total: number }>(
    publicationListQuery,
    { start, end },
    { tags: ["publication"] },
  );
  const dict = getDictionary(lang);
  const totalPages = totalPagesFor(data.total);

  return (
    <>
      <Hreflang
        paths={{
          pt: `/${segmentFor("publications", "pt")}`,
          en: `/${segmentFor("publications", "en")}`,
        }}
      />
      <Container className="py-12">
        <h1 className="font-serif text-4xl text-ink-900">{dict.nav.publications}</h1>
        <p className="mt-2 text-ink-500">
          {data.total} {data.total === 1 ? "item" : "itens"}
        </p>

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
        />
      </Container>
    </>
  );
}

PublicationsListPage.pageSize = PAGE_SIZE;
