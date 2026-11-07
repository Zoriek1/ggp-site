import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { isLang } from "@/i18n/config";
import { resolveSegment, segmentFor } from "@/i18n/routes";
import {
  Detail,
  Listing,
  loadPortal,
  sectionNames,
  type SearchParams,
} from "@/features/portal/Portal";
import { detailMetadata, listMetadata } from "@/features/portal/metadata";
import { Container } from "@/components/Container";
const aliases: Record<string, string> = {
  "areas-de-pesquisa": "areas",
  "research-areas": "areas",
  topicos: "palavras-chave",
  topics: "keywords",
};
type Params = { lang: string; section: string };
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang, section } = await params;
  if (!isLang(lang)) return {};
  const key = resolveSegment(section);
  if (!key) return {};
  if (key === "about" || key === "contact") {
    const record = (await loadPortal()).find(
      (r) => r.collection === "pages" && r.pageKind === key,
    );
    if (record) return detailMetadata(record, lang);
  }
  return {
    ...listMetadata(key, sectionNames[lang][key], lang),
    ...(key === "search" ? { robots: { index: false } } : {}),
  };
}
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { lang, section } = await params;
  if (!isLang(lang)) notFound();
  if (aliases[section]) permanentRedirect(`/${lang}/${aliases[section]}`);
  const key = resolveSegment(section);
  if (!key || segmentFor(key, lang) !== section) notFound();
  if (key === "about" || key === "contact") {
    const records = await loadPortal();
    const record = records.find(
      (r) => r.collection === "pages" && r.pageKind === key,
    );
    if (record) return <Detail record={record} lang={lang} />;
    const settings = records.find((r) => r.collection === "settings");
    return (
      <Container className="max-w-3xl py-12">
        <h1 className="font-serif text-4xl">{sectionNames[lang][key]}</h1>
        <div className="mt-7 space-y-4">
          {settings?.contactEmail && (
            <p>
              <a href={`mailto:${settings.contactEmail}`}>
                {settings.contactEmail}
              </a>
            </p>
          )}
          {settings?.links.map((link) => (
            <p key={link.url}>
              <a href={link.url}>{link.label}</a>
            </p>
          ))}
          {!settings?.contactEmail && !settings?.links.length && (
            <p>
              {lang === "pt"
                ? "As informações de contato ainda não foram cadastradas."
                : "Contact information has not been added yet."}
            </p>
          )}
        </div>
      </Container>
    );
  }
  return <Listing lang={lang} section={key} params={await searchParams} />;
}
