import Link from "next/link";
import type { Lang } from "@/i18n/config";
import { tField, getDictionary } from "@/i18n/dictionaries";
import { localizedHref, segmentFor } from "@/i18n/routes";
import { Container } from "@/components/Container";
import { Pagination } from "@/components/Pagination";
import { Hreflang } from "@/components/Hreflang";
import { sanityFetch } from "@/lib/sanity/client";
import { resourceListQuery } from "@/lib/sanity/queries";
import type { Resource } from "@/lib/sanity/types";
import { slugFor } from "@/lib/slug";
import { pageBounds, totalPagesFor } from "@/lib/pagination";

const CATEGORY_LABEL: Record<Resource["category"], { pt: string; en: string }> = {
  link: { pt: "Link útil", en: "Useful link" },
  dataset: { pt: "Dataset", en: "Dataset" },
  tool: { pt: "Simulador / Software", en: "Tool / Software" },
  text: { pt: "Apostila / Texto", en: "Text / Booklet" },
  other: { pt: "Outro", en: "Other" },
};

export async function ResourcesListPage({ lang, page }: { lang: Lang; page: number }) {
  const { start, end, page: p } = pageBounds(page);
  const data = await sanityFetch<{ items: Resource[]; total: number }>(
    resourceListQuery,
    { start, end },
    { tags: ["resource"] },
  );
  const dict = getDictionary(lang);
  const totalPages = totalPagesFor(data.total);

  return (
    <>
      <Hreflang
        paths={{ pt: `/${segmentFor("resources", "pt")}`, en: `/${segmentFor("resources", "en")}` }}
      />
      <Container className="py-12 max-w-4xl">
        <h1 className="font-serif text-4xl text-ink-900">{dict.nav.resources}</h1>

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
                    {CATEGORY_LABEL[r.category][lang]}
                  </p>
                  <p className="mt-1 font-serif text-lg text-ink-900">{tField(r.title, lang)}</p>
                  {tField(r.description, lang) && (
                    <p className="text-sm text-ink-500 line-clamp-2">{tField(r.description, lang)}</p>
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
        />
      </Container>
    </>
  );
}
