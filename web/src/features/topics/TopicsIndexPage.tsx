import Link from "next/link";
import type { Lang } from "@/i18n/config";
import { tField, getDictionary } from "@/i18n/dictionaries";
import { localizedHref, segmentFor } from "@/i18n/routes";
import { Container } from "@/components/Container";
import { Hreflang } from "@/components/Hreflang";
import { sanityFetch } from "@/lib/sanity/client";
import { allTopicsQuery } from "@/lib/sanity/queries";
import type { Topic } from "@/lib/sanity/types";
import { slugFor } from "@/lib/slug";

export async function TopicsIndexPage({ lang }: { lang: Lang }) {
  const topics = await sanityFetch<Topic[]>(allTopicsQuery, {}, { tags: ["physicsTopic"] });
  const dict = getDictionary(lang);
  return (
    <>
      <Hreflang
        paths={{ pt: `/${segmentFor("topics", "pt")}`, en: `/${segmentFor("topics", "en")}` }}
      />
      <Container className="py-12">
        <h1 className="font-serif text-4xl text-ink-900">{dict.nav.topics}</h1>
        {topics.length === 0 ? (
          <p className="mt-10 text-ink-500">{dict.common.noResults}</p>
        ) : (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((t) => (
              <li key={t._id}>
                <Link
                  href={localizedHref("topics", lang, slugFor(t.slug, lang, t._id))}
                  className="block rounded border border-ink-100 bg-white px-4 py-3 no-underline hover:border-ink-300"
                >
                  {tField(t.name, lang)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
