import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Lang } from "@/i18n/config";
import { tField, getDictionary, tMissing } from "@/i18n/dictionaries";
import { localizedHref } from "@/i18n/routes";
import { Container } from "@/components/Container";
import { TranslationNotice } from "@/components/TranslationNotice";
import { sanityFetch } from "@/lib/sanity/client";
import { teachingMaterialBySlugQuery } from "@/lib/sanity/queries";
import type { TeachingMaterial } from "@/lib/sanity/types";
import { PRESETS } from "@/lib/sanity/image";
import { buildMetadataForDetail } from "@/lib/seo/metadata";
import { slugStrict } from "@/lib/slug";

const fetchMat = (slug: string) =>
  sanityFetch<TeachingMaterial | null>(teachingMaterialBySlugQuery, { slug }, {
    tags: ["teachingMaterial"],
  });

export async function teachingMaterialMetadata({ lang, slug }: { lang: Lang; slug: string }): Promise<Metadata> {
  const m = await fetchMat(slug);
  if (!m) return {};
  return buildMetadataForDetail({
    key: "teachingMaterials",
    lang,
    slugPt: slugStrict(m.slug, "pt"),
    slugEn: slugStrict(m.slug, "en"),
    title: tField(m.title, lang),
    description: tField(m.description, lang)?.slice(0, 200),
    ogImage: m.coverImage ? PRESETS.hero(m.coverImage) : null,
  });
}

export async function TeachingMaterialDetail({ lang, slug }: { lang: Lang; slug: string }) {
  const m = await fetchMat(slug);
  if (!m) notFound();

  const dict = getDictionary(lang);
  const title = tField(m.title, lang);
  const desc = tField(m.description, lang);
  const missing = tMissing(m.title, lang) || (m.description ? tMissing(m.description, lang) : false);

  return (
    <Container className="py-12 max-w-3xl">
      <Link href={localizedHref("teachingMaterials", lang)} className="text-sm text-ink-500 hover:text-ink-900">
        ← {dict.common.backTo} {dict.nav.teachingMaterials.toLowerCase()}
      </Link>

      {m.coverImage && (
        <div className="mt-4 overflow-hidden rounded">
          <Image
            src={PRESETS.hero(m.coverImage)}
            alt={(lang === "en" ? m.coverImage.altEn : m.coverImage.alt) || ""}
            width={1280}
            height={720}
            className="h-auto w-full"
          />
        </div>
      )}

      <h1 className="mt-6 font-serif text-3xl leading-tight text-ink-900 sm:text-4xl">{title}</h1>

      {m.level && (
        <p className="mt-2 text-sm text-ink-500">
          {dict.common.level}: {tField(m.level.name, lang)}
        </p>
      )}

      {m.authors?.length ? (
        <p className="mt-1 text-sm text-ink-500">
          {dict.common.authors}: {m.authors.map((a) => a.name).join(", ")}
        </p>
      ) : null}

      <TranslationNotice lang={lang} show={missing} />

      {desc && <p className="mt-6 whitespace-pre-line text-ink-900">{desc}</p>}

      {m.files?.length ? (
        <section className="mt-8">
          <h2 className="text-xs uppercase tracking-wide text-brand-700">
            {lang === "en" ? "Files" : "Arquivos"}
          </h2>
          <ul className="mt-2 space-y-2 text-sm">
            {m.files.map((f, i) => {
              const url = f.url || f.fileUrl;
              if (!url) return null;
              const label = tField(f.label, lang) || url.split("/").pop();
              return (
                <li key={i}>
                  <a href={url} target="_blank" rel="noreferrer">
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </Container>
  );
}
