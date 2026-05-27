import Link from "next/link";
import type { Lang } from "@/i18n/config";
import { tField, getDictionary } from "@/i18n/dictionaries";
import { localizedHref, segmentFor } from "@/i18n/routes";
import { Container } from "@/components/Container";
import { Hreflang } from "@/components/Hreflang";
import { sanityFetch } from "@/lib/sanity/client";
import { allResearchAreasQuery } from "@/lib/sanity/queries";
import type { ResearchArea } from "@/lib/sanity/types";
import { slugFor } from "@/lib/slug";

export async function ResearchAreasIndexPage({ lang }: { lang: Lang }) {
  const areas = await sanityFetch<ResearchArea[]>(allResearchAreasQuery, {}, {
    tags: ["researchArea"],
  });
  const dict = getDictionary(lang);
  return (
    <>
      <Hreflang
        paths={{
          pt: `/${segmentFor("researchAreas", "pt")}`,
          en: `/${segmentFor("researchAreas", "en")}`,
        }}
      />
      <Container className="py-12">
        <h1 className="font-serif text-4xl text-ink-900">{dict.nav.researchAreas}</h1>
        {areas.length === 0 ? (
          <p className="mt-10 text-ink-500">{dict.common.noResults}</p>
        ) : (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((a) => (
              <li key={a._id}>
                <Link
                  href={localizedHref("researchAreas", lang, slugFor(a.slug, lang, a._id))}
                  className="block rounded border border-ink-100 bg-white px-4 py-3 no-underline hover:border-ink-300"
                >
                  {tField(a.name, lang)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
