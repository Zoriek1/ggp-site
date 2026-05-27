import type { Lang } from "@/i18n/config";
import { tField, getDictionary } from "@/i18n/dictionaries";
import { localizedHref, segmentFor } from "@/i18n/routes";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { Pagination } from "@/components/Pagination";
import { Hreflang } from "@/components/Hreflang";
import { sanityFetch } from "@/lib/sanity/client";
import { teachingMaterialListQuery } from "@/lib/sanity/queries";
import type { TeachingMaterial } from "@/lib/sanity/types";
import { slugFor } from "@/lib/slug";
import { PRESETS } from "@/lib/sanity/image";
import { pageBounds, totalPagesFor } from "@/lib/pagination";

export async function TeachingMaterialsListPage({ lang, page }: { lang: Lang; page: number }) {
  const { start, end, page: p } = pageBounds(page);
  const data = await sanityFetch<{ items: TeachingMaterial[]; total: number }>(
    teachingMaterialListQuery,
    { start, end },
    { tags: ["teachingMaterial"] },
  );
  const dict = getDictionary(lang);
  const totalPages = totalPagesFor(data.total);

  return (
    <>
      <Hreflang
        paths={{
          pt: `/${segmentFor("teachingMaterials", "pt")}`,
          en: `/${segmentFor("teachingMaterials", "en")}`,
        }}
      />
      <Container className="py-12">
        <h1 className="font-serif text-4xl text-ink-900">{dict.nav.teachingMaterials}</h1>

        {data.items.length === 0 ? (
          <p className="mt-10 text-ink-500">{dict.common.noResults}</p>
        ) : (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((m) => (
              <li key={m._id}>
                <Card
                  href={localizedHref("teachingMaterials", lang, slugFor(m.slug, lang, m._id))}
                  title={tField(m.title, lang)}
                  subtitle={tField(m.level?.name, lang)}
                  description={tField(m.description, lang)}
                  imageUrl={m.coverImage ? PRESETS.thumb16x9(m.coverImage) : null}
                  imageAlt={(lang === "en" ? m.coverImage?.altEn : m.coverImage?.alt) || ""}
                />
              </li>
            ))}
          </ul>
        )}

        <Pagination
          page={p}
          totalPages={totalPages}
          basePath={localizedHref("teachingMaterials", lang)}
          lang={lang}
        />
      </Container>
    </>
  );
}
