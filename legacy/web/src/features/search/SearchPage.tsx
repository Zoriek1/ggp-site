import Link from "next/link";
import type { Lang } from "@/i18n/config";
import { getDictionary, tField } from "@/i18n/dictionaries";
import { localizedHref, TYPE_TO_KEY, type RouteKey } from "@/i18n/routes";
import { Container } from "@/components/Container";
import { sanityFetch } from "@/lib/sanity/client";
import { searchQuery } from "@/lib/sanity/queries";
import type { LocalizedString } from "@/lib/sanity/types";

type SearchResult = {
  _type: string;
  _id: string;
  title?: LocalizedString | null;
  name?: string | null;
  year?: number | null;
  slugPt?: string | null;
  slugEn?: string | null;
};

const SEARCH_TYPES = [
  "publication",
  "thesis",
  "teachingMaterial",
  "media",
  "resource",
  "event",
  "member",
  "pgp",
];

/** Ordem de exibição dos grupos de resultado. */
const GROUP_ORDER: RouteKey[] = [
  "publications",
  "theses",
  "teachingMaterials",
  "media",
  "resources",
  "events",
  "members",
  "pgps",
];

export async function SearchPage({ lang, q }: { lang: Lang; q: string }) {
  const dict = getDictionary(lang);
  const results = q
    ? await sanityFetch<SearchResult[]>(
        searchQuery,
        { types: SEARCH_TYPES, q: `${q}*` },
        { tags: SEARCH_TYPES },
      )
    : [];

  const groups = new Map<RouteKey, SearchResult[]>();
  for (const r of results) {
    const key = TYPE_TO_KEY[r._type];
    if (!key) continue;
    const arr = groups.get(key);
    if (arr) arr.push(r);
    else groups.set(key, [r]);
  }

  return (
    <Container className="py-12 max-w-3xl">
      <h1 className="font-serif text-4xl text-ink-900">{dict.common.search}</h1>

      {!q ? (
        <p className="mt-6 text-ink-500">{dict.common.noQuery}</p>
      ) : (
        <>
          <p className="mt-2 text-ink-500">
            {dict.common.searchResultsFor} “{q}” · {results.length}{" "}
            {results.length === 1 ? dict.common.result : dict.common.results}
          </p>

          {results.length === 0 ? (
            <p className="mt-10 text-ink-500">{dict.common.noResults}</p>
          ) : (
            GROUP_ORDER.filter((k) => groups.has(k)).map((key) => {
              const items = groups.get(key)!;
              return (
                <section key={key} className="mt-10 border-t border-ink-100 pt-6">
                  <h2 className="font-serif text-2xl text-ink-900">
                    {dict.nav[key as keyof typeof dict.nav]}{" "}
                    <span className="text-base font-normal text-ink-500">({items.length})</span>
                  </h2>
                  <ul className="mt-3 divide-y divide-ink-100">
                    {items.map((r) => {
                      const slug =
                        (lang === "en" ? r.slugEn : r.slugPt) || r.slugPt || r.slugEn || r._id;
                      const label = tField(r.title, lang) || r.name || "—";
                      return (
                        <li key={r._id} className="py-2">
                          <Link
                            href={localizedHref(key, lang, slug)}
                            className="text-ink-900 no-underline hover:underline"
                          >
                            {label}
                            {r.year ? <span className="text-ink-500"> · {r.year}</span> : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })
          )}
        </>
      )}
    </Container>
  );
}
