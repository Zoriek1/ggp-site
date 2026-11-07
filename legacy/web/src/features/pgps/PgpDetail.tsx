import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Lang } from "@/i18n/config";
import { tField, getDictionary, tMissing } from "@/i18n/dictionaries";
import { localizedHref } from "@/i18n/routes";
import { Container } from "@/components/Container";
import { JsonLd } from "@/components/JsonLd";
import { TranslationNotice } from "@/components/TranslationNotice";
import { sanityFetch } from "@/lib/sanity/client";
import { pgpBySlugQuery } from "@/lib/sanity/queries";
import type { Pgp } from "@/lib/sanity/types";
import { buildMetadataForDetail } from "@/lib/seo/metadata";
import { slugStrict } from "@/lib/slug";
import { PRESETS } from "@/lib/sanity/image";
import { pgpJsonLd } from "@/lib/seo/jsonLd";

const fetchPgp = (slug: string) =>
  sanityFetch<Pgp | null>(pgpBySlugQuery, { slug }, { tags: ["pgp"] });

export async function pgpMetadata({ lang, slug }: { lang: Lang; slug: string }): Promise<Metadata> {
  const p = await fetchPgp(slug);
  if (!p) return {};
  const title = tField(p.longName, lang) || p.name;
  return buildMetadataForDetail({
    key: "pgps",
    lang,
    slugPt: slugStrict(p.slug, "pt"),
    slugEn: slugStrict(p.slug, "en"),
    title,
    description: tField(p.description, lang)?.slice(0, 200) || p.school || null,
  });
}

export async function PgpDetail({ lang, slug }: { lang: Lang; slug: string }) {
  const p = await fetchPgp(slug);
  if (!p) notFound();

  const dict = getDictionary(lang);
  const longName = tField(p.longName, lang);
  const description = tField(p.description, lang);
  const missing = p.description ? tMissing(p.description, lang) : false;

  return (
    <>
      <JsonLd data={pgpJsonLd(p, lang)} />
      <Container className="py-12 max-w-3xl">
        <Link href={localizedHref("pgps", lang)} className="text-sm text-ink-500 hover:text-ink-900">
          ← {dict.common.backTo} {dict.nav.pgps}
        </Link>

        <p className="mt-4 text-xs uppercase tracking-wide text-brand-700">
          {p.status === "active"
            ? dict.pgps.active
            : p.status === "forming"
              ? dict.pgps.forming
              : dict.pgps.inactive}
          {p.foundedYear ? ` · ${p.foundedYear}` : ""}
        </p>
        <h1 className="mt-1 font-serif text-3xl text-ink-900 sm:text-4xl">{p.name}</h1>
        {longName && longName !== p.name && (
          <p className="mt-2 text-ink-500">{longName}</p>
        )}

        {p.school && (
          <p className="mt-3 text-sm text-ink-700">
            <span className="text-ink-500">{dict.pgps.school}: </span>
            {p.school}
          </p>
        )}

        {p.coordinator && (
          <p className="mt-1 text-sm text-ink-700">
            <span className="text-ink-500">{dict.pgps.coordinator}: </span>
            {p.coordinator.name}
          </p>
        )}

        <TranslationNotice lang={lang} show={missing} />

        {description && (
          <p className="mt-6 whitespace-pre-line text-ink-900">{description}</p>
        )}

        {p.social && (p.social.whatsapp || p.social.telegram || p.social.instagram) ? (
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            {p.social.whatsapp && (
              <a
                href={p.social.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="rounded border border-ink-200 px-3 py-1 no-underline hover:border-ink-300"
              >
                WhatsApp
              </a>
            )}
            {p.social.telegram && (
              <a
                href={p.social.telegram}
                target="_blank"
                rel="noreferrer"
                className="rounded border border-ink-200 px-3 py-1 no-underline hover:border-ink-300"
              >
                Telegram
              </a>
            )}
            {p.social.instagram && (
              <a
                href={p.social.instagram}
                target="_blank"
                rel="noreferrer"
                className="rounded border border-ink-200 px-3 py-1 no-underline hover:border-ink-300"
              >
                Instagram
              </a>
            )}
          </div>
        ) : null}

        <section className="mt-10 border-t border-ink-100 pt-8">
          <h2 className="font-serif text-2xl text-ink-900">
            {dict.nav.members}{" "}
            <span className="text-base font-normal text-ink-500">
              ({p.members?.length ?? 0})
            </span>
          </h2>
          {p.members && p.members.length > 0 ? (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {p.members.map((m) => (
                <li key={m._id}>
                  <Link
                    href={localizedHref("members", lang, m._id)}
                    className="flex items-center gap-3 rounded p-2 no-underline hover:bg-ink-100"
                  >
                    <div className="h-12 w-12 flex-none overflow-hidden rounded-full bg-ink-100">
                      {m.photo ? (
                        <Image
                          src={PRESETS.memberThumb(m.photo)}
                          alt={m.name}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center font-serif text-ink-300">
                          {m.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-ink-900">{m.displayName || m.name}</p>
                      <p className="truncate text-xs text-ink-500">
                        {dict.roles[m.role as keyof typeof dict.roles] ?? m.role}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-ink-500">{dict.pgps.noMembers}</p>
          )}
        </section>

        {(p.topics?.length || p.researchAreas?.length) ? (
          <dl className="mt-10 space-y-3 border-t border-ink-100 pt-6 text-sm">
            {p.topics?.length ? (
              <div>
                <dt className="text-ink-500">{dict.common.topics}</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {p.topics.map((t) => (
                    <Link
                      key={t._id}
                      href={localizedHref(
                        "topics",
                        lang,
                        (lang === "en" ? t.slug.en?.current : t.slug.pt?.current) || t._id,
                      )}
                      className="rounded bg-ink-100 px-2 py-1 text-ink-900 no-underline hover:bg-ink-200"
                    >
                      {tField(t.name, lang)}
                    </Link>
                  ))}
                </dd>
              </div>
            ) : null}
            {p.researchAreas?.length ? (
              <div>
                <dt className="text-ink-500">{dict.common.researchAreas}</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {p.researchAreas.map((a) => (
                    <Link
                      key={a._id}
                      href={localizedHref(
                        "researchAreas",
                        lang,
                        (lang === "en" ? a.slug.en?.current : a.slug.pt?.current) || a._id,
                      )}
                      className="rounded bg-ink-100 px-2 py-1 text-ink-900 no-underline hover:bg-ink-200"
                    >
                      {tField(a.name, lang)}
                    </Link>
                  ))}
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </Container>
    </>
  );
}
