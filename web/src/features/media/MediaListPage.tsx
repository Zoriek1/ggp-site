import type { Lang } from "@/i18n/config";
import { tField, getDictionary } from "@/i18n/dictionaries";
import { localizedHref, segmentFor } from "@/i18n/routes";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { Pagination } from "@/components/Pagination";
import { Hreflang } from "@/components/Hreflang";
import { sanityFetch } from "@/lib/sanity/client";
import { mediaListQuery } from "@/lib/sanity/queries";
import type { MediaItem } from "@/lib/sanity/types";
import { slugFor } from "@/lib/slug";
import { pageBounds, totalPagesFor } from "@/lib/pagination";
import { formatDate, youtubeId } from "@/lib/format";

export async function MediaListPage({ lang, page }: { lang: Lang; page: number }) {
  const { start, end, page: p } = pageBounds(page);
  const data = await sanityFetch<{ items: MediaItem[]; total: number }>(
    mediaListQuery,
    { start, end },
    { tags: ["media"] },
  );
  const dict = getDictionary(lang);
  const totalPages = totalPagesFor(data.total);

  return (
    <>
      <Hreflang
        paths={{ pt: `/${segmentFor("media", "pt")}`, en: `/${segmentFor("media", "en")}` }}
      />
      <Container className="py-12">
        <h1 className="font-serif text-4xl text-ink-900">{dict.nav.media}</h1>

        {data.items.length === 0 ? (
          <p className="mt-10 text-ink-500">{dict.common.noResults}</p>
        ) : (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((m) => {
              const yid = youtubeId(m.videoUrl);
              return (
                <li key={m._id}>
                  <Card
                    href={localizedHref("media", lang, slugFor(m.slug, lang, m._id))}
                    title={tField(m.title, lang)}
                    subtitle={`${dict.mediaType[m.type]} · ${formatDate(m.date, lang)}`}
                    description={tField(m.description, lang)}
                    imageUrl={yid ? `https://i.ytimg.com/vi/${yid}/hqdefault.jpg` : null}
                    imageAlt={tField(m.title, lang)}
                  />
                </li>
              );
            })}
          </ul>
        )}

        <Pagination
          page={p}
          totalPages={totalPages}
          basePath={localizedHref("media", lang)}
          lang={lang}
        />
      </Container>
    </>
  );
}
