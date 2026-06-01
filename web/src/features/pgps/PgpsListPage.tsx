import Link from "next/link";
import type { Lang } from "@/i18n/config";
import { tField, getDictionary } from "@/i18n/dictionaries";
import { localizedHref, segmentFor } from "@/i18n/routes";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { Hreflang } from "@/components/Hreflang";
import { sanityFetch } from "@/lib/sanity/client";
import { pgpListQuery } from "@/lib/sanity/queries";
import type { Pgp } from "@/lib/sanity/types";

type PgpRow = Pgp & { slugPt?: string; slugEn?: string };

export async function PgpsListPage({ lang }: { lang: Lang }) {
  const pgps = await sanityFetch<PgpRow[]>(pgpListQuery, {}, { tags: ["pgp"] });
  const dict = getDictionary(lang);

  const active = pgps.filter((p) => p.status === "active");
  const forming = pgps.filter((p) => p.status === "forming");
  const inactive = pgps.filter((p) => p.status === "inactive");

  return (
    <>
      <Hreflang
        paths={{ pt: `/${segmentFor("pgps", "pt")}`, en: `/${segmentFor("pgps", "en")}` }}
      />
      <PageHeader
        eyebrow={dict.common.repository}
        title={dict.nav.pgps}
        count={`${pgps.length} ${pgps.length === 1 ? "PGP" : "PGPs"}`}
      />
      <Container className="py-12">
        <PgpGroup lang={lang} title={dict.pgps.active} pgps={active} />
        <PgpGroup lang={lang} title={dict.pgps.forming} pgps={forming} />
        <PgpGroup lang={lang} title={dict.pgps.inactive} pgps={inactive} />

        {pgps.length === 0 && (
          <p className="mt-10 text-ink-500">{dict.common.noResults}</p>
        )}
      </Container>
    </>
  );
}

function PgpGroup({ lang, title, pgps }: { lang: Lang; title: string; pgps: PgpRow[] }) {
  const dict = getDictionary(lang);
  if (pgps.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="font-serif text-2xl text-ink-900">{title}</h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pgps.map((p) => {
          const slug = (lang === "en" ? p.slugEn : p.slugPt) || p.slugPt || p._id;
          const count = p.members?.length ?? 0;
          return (
            <li key={p._id}>
              <Link
                href={localizedHref("pgps", lang, slug)}
                className="block h-full rounded-lg border border-ink-100 bg-surface p-5 no-underline transition hover:border-ink-300"
              >
                <p className="font-serif text-lg text-ink-900">{p.name}</p>
                {p.longName && tField(p.longName, lang) && (
                  <p className="mt-1 text-sm text-ink-500">{tField(p.longName, lang)}</p>
                )}
                <p className="mt-3 text-xs text-ink-500">
                  {p.school ? (
                    <>
                      {p.school}
                      {count > 0 && ` · ${count} ${dict.pgps.membersCount}`}
                    </>
                  ) : count > 0 ? (
                    `${count} ${dict.pgps.membersCount}`
                  ) : null}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
