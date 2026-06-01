import Link from "next/link";
import Image from "next/image";
import type { Lang } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localizedHref, segmentFor } from "@/i18n/routes";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { Hreflang } from "@/components/Hreflang";
import { sanityFetch } from "@/lib/sanity/client";
import { memberListQuery } from "@/lib/sanity/queries";
import type { Member } from "@/lib/sanity/types";
import { PRESETS } from "@/lib/sanity/image";

type MemberRow = Member & { slugPt: string; slugEn: string };

export async function MembersListPage({ lang }: { lang: Lang }) {
  const members = await sanityFetch<MemberRow[]>(memberListQuery, {}, { tags: ["member"] });
  const dict = getDictionary(lang);
  const active = members.filter((m) => m.active);
  const inactive = members.filter((m) => !m.active);

  return (
    <>
      <Hreflang
        paths={{ pt: `/${segmentFor("members", "pt")}`, en: `/${segmentFor("members", "en")}` }}
      />
      <PageHeader
        eyebrow={dict.common.repository}
        title={dict.nav.members}
        count={`${members.length} ${members.length === 1 ? dict.common.result : dict.common.results}`}
      />
      <Container className="py-12">
        <MemberGrid lang={lang} title={dict.members.active} members={active} />
        {inactive.length > 0 && (
          <MemberGrid lang={lang} title={dict.members.inactive} members={inactive} />
        )}

        {members.length === 0 && (
          <p className="mt-10 text-ink-500">{dict.common.noResults}</p>
        )}
      </Container>
    </>
  );
}

function MemberGrid({
  lang,
  title,
  members,
}: {
  lang: Lang;
  title: string;
  members: MemberRow[];
}) {
  const dict = getDictionary(lang);
  if (members.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="font-serif text-2xl text-ink-900">{title}</h2>
      <ul className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {members.map((m) => {
          const slug = (lang === "en" ? m.slugEn : m.slugPt) || m.slugPt || m._id;
          return (
            <li key={m._id}>
              <Link
                href={localizedHref("members", lang, slug)}
                className="group block no-underline"
              >
                <div className="aspect-square overflow-hidden rounded-full bg-ink-100">
                  {m.photo ? (
                    <Image
                      src={PRESETS.memberThumb(m.photo)}
                      alt={(lang === "en" ? m.photo.altEn : m.photo.alt) || m.name}
                      width={400}
                      height={400}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center font-serif text-3xl text-ink-300">
                      {m.name.charAt(0)}
                    </div>
                  )}
                </div>
                <p className="mt-3 text-center font-medium text-ink-900 group-hover:underline">
                  {m.displayName || m.name}
                </p>
                <p className="text-center text-xs text-ink-500">
                  {dict.roles[m.role]}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
