import Link from "next/link";
import type { Lang } from "@/i18n/config";
import { tField, getDictionary } from "@/i18n/dictionaries";
import { localizedHref, segmentFor } from "@/i18n/routes";
import { Container } from "@/components/Container";
import { Pagination } from "@/components/Pagination";
import { Hreflang } from "@/components/Hreflang";
import { sanityFetch } from "@/lib/sanity/client";
import { thesisListQuery } from "@/lib/sanity/queries";
import type { Thesis } from "@/lib/sanity/types";
import { slugFor } from "@/lib/slug";
import { pageBounds, totalPagesFor } from "@/lib/pagination";

export async function ThesesListPage({ lang, page }: { lang: Lang; page: number }) {
  const { start, end, page: p } = pageBounds(page);
  const data = await sanityFetch<{ items: Thesis[]; total: number }>(
    thesisListQuery,
    { start, end },
    { tags: ["thesis"] },
  );
  const dict = getDictionary(lang);
  const totalPages = totalPagesFor(data.total);

  return (
    <>
      <Hreflang
        paths={{ pt: `/${segmentFor("theses", "pt")}`, en: `/${segmentFor("theses", "en")}` }}
      />
      <Container className="py-12 max-w-4xl">
        <h1 className="font-serif text-4xl text-ink-900">{dict.nav.theses}</h1>

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
        />
      </Container>
    </>
  );
}
