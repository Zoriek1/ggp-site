import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Lang } from "@/i18n/config";
import { tField, getDictionary } from "@/i18n/dictionaries";
import { localizedHref } from "@/i18n/routes";
import { Container } from "@/components/Container";
import { sanityFetch } from "@/lib/sanity/client";
import { researchAreaBySlugQuery } from "@/lib/sanity/queries";
import type { ResearchArea } from "@/lib/sanity/types";
import { buildMetadataForDetail } from "@/lib/seo/metadata";
import { slugStrict } from "@/lib/slug";

const relatedQuery = /* groq */ `
{
  "publications": *[_type == "publication" && references($areaId)] | order(year desc) [0...50]{
    _id, title, "slugPt": slug.pt.current, "slugEn": slug.en.current
  },
  "theses": *[_type == "thesis" && references($areaId)] | order(year desc) [0...50]{
    _id, title, "slugPt": slug.pt.current, "slugEn": slug.en.current
  },
  "members": *[_type == "member" && references($areaId)] | order(name asc){
    _id, name, "slugPt": slug.pt.current, "slugEn": slug.en.current
  }
}
`;

type Row = { _id: string; slugPt?: string; slugEn?: string; title?: { pt?: string; en?: string }; name?: string };

export async function researchAreaMetadata({ lang, slug }: { lang: Lang; slug: string }): Promise<Metadata> {
  const a = await sanityFetch<ResearchArea | null>(researchAreaBySlugQuery, { slug }, {
    tags: ["researchArea"],
  });
  if (!a) return {};
  return buildMetadataForDetail({
    key: "researchAreas",
    lang,
    slugPt: slugStrict(a.slug, "pt"),
    slugEn: slugStrict(a.slug, "en"),
    title: tField(a.name, lang),
  });
}

export async function ResearchAreaDetail({ lang, slug }: { lang: Lang; slug: string }) {
  const area = await sanityFetch<
    (ResearchArea & { description?: { pt?: string; en?: string } | null }) | null
  >(researchAreaBySlugQuery, { slug }, { tags: ["researchArea"] });
  if (!area) notFound();

  const related = await sanityFetch<{
    publications: Row[];
    theses: Row[];
    members: Row[];
  }>(relatedQuery, { areaId: area._id }, { tags: ["publication", "thesis", "member"] });

  const dict = getDictionary(lang);

  return (
    <Container className="py-12 max-w-3xl">
      <Link href={localizedHref("researchAreas", lang)} className="text-sm text-ink-500 hover:text-ink-900">
        ← {dict.common.backTo} {dict.nav.researchAreas.toLowerCase()}
      </Link>
      <h1 className="mt-4 font-serif text-4xl text-ink-900">{tField(area.name, lang)}</h1>
      {tField(area.description, lang) && (
        <p className="mt-4 text-ink-700">{tField(area.description, lang)}</p>
      )}

      {related.members.length > 0 && (
        <Section title={dict.nav.members}>
          <ul className="mt-3 flex flex-wrap gap-2">
            {related.members.map((m) => (
              <li key={m._id}>
                <Link
                  href={localizedHref("members", lang, (lang === "en" ? m.slugEn : m.slugPt) || m._id)}
                  className="rounded bg-ink-100 px-2 py-1 text-sm text-ink-900 no-underline hover:bg-ink-200"
                >
                  {m.name}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {related.publications.length > 0 && (
        <Section title={dict.nav.publications}>
          <ul className="mt-3 divide-y divide-ink-100">
            {related.publications.map((p) => (
              <li key={p._id} className="py-2">
                <Link
                  href={localizedHref("publications", lang, (lang === "en" ? p.slugEn : p.slugPt) || p._id)}
                  className="text-ink-900 no-underline hover:underline"
                >
                  {tField(p.title, lang)}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {related.theses.length > 0 && (
        <Section title={dict.nav.theses}>
          <ul className="mt-3 divide-y divide-ink-100">
            {related.theses.map((t) => (
              <li key={t._id} className="py-2">
                <Link
                  href={localizedHref("theses", lang, (lang === "en" ? t.slugEn : t.slugPt) || t._id)}
                  className="text-ink-900 no-underline hover:underline"
                >
                  {tField(t.title, lang)}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </Container>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 border-t border-ink-100 pt-6">
      <h2 className="font-serif text-2xl text-ink-900">{title}</h2>
      {children}
    </section>
  );
}
