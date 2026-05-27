import type { Lang } from "@/i18n/config";
import { tField, getDictionary } from "@/i18n/dictionaries";
import { localizedHref, segmentFor } from "@/i18n/routes";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { Pagination } from "@/components/Pagination";
import { Hreflang } from "@/components/Hreflang";
import { sanityFetch } from "@/lib/sanity/client";
import { eventListQuery } from "@/lib/sanity/queries";
import type { EventItem } from "@/lib/sanity/types";
import { slugFor } from "@/lib/slug";
import { PRESETS } from "@/lib/sanity/image";
import { pageBounds, totalPagesFor } from "@/lib/pagination";
import { formatDateRange } from "@/lib/format";

export async function EventsListPage({ lang, page }: { lang: Lang; page: number }) {
  const { start, end, page: p } = pageBounds(page);
  const data = await sanityFetch<{ items: EventItem[]; total: number }>(
    eventListQuery,
    { start, end },
    { tags: ["event"] },
  );
  const dict = getDictionary(lang);
  const totalPages = totalPagesFor(data.total);

  return (
    <>
      <Hreflang
        paths={{ pt: `/${segmentFor("events", "pt")}`, en: `/${segmentFor("events", "en")}` }}
      />
      <Container className="py-12">
        <h1 className="font-serif text-4xl text-ink-900">{dict.nav.events}</h1>

        {data.items.length === 0 ? (
          <p className="mt-10 text-ink-500">{dict.common.noResults}</p>
        ) : (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((e) => (
              <li key={e._id}>
                <Card
                  href={localizedHref("events", lang, slugFor(e.slug, lang, e._id))}
                  title={tField(e.title, lang)}
                  subtitle={formatDateRange(e.startDate, e.endDate, lang)}
                  meta={e.location || (e.isOnline ? dict.common.online : null)}
                  imageUrl={e.coverImage ? PRESETS.thumb16x9(e.coverImage) : null}
                  imageAlt={(lang === "en" ? e.coverImage?.altEn : e.coverImage?.alt) || ""}
                />
              </li>
            ))}
          </ul>
        )}

        <Pagination
          page={p}
          totalPages={totalPages}
          basePath={localizedHref("events", lang)}
          lang={lang}
        />
      </Container>
    </>
  );
}
