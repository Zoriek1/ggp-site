import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { isLang } from "@/i18n/config";
import { contentHref, resolveSegment } from "@/i18n/routes";
import { Detail, loadPortal } from "@/features/portal/Portal";
import { detailMetadata } from "@/features/portal/metadata";
import { bySlug, recordSection } from "@/lib/content/query";
const alias: Record<string, string> = {
  topicos: "keywords",
  topics: "keywords",
  "areas-de-pesquisa": "areas",
  "research-areas": "areas",
};
type Params = { lang: string; section: string; slug: string };
export const dynamic = "force-dynamic";
async function find(params: Params) {
  const section = alias[params.section] || resolveSegment(params.section);
  const collection =
    section === "publications" || section === "blog"
      ? "items"
      : section === "pgps" ||
          section === "guides" ||
          section === "areas" ||
          section === "keywords" ||
          section === "pages"
        ? section
        : null;
  if (!collection) return undefined;
  return bySlug(await loadPortal(), collection, params.slug);
}
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const p = await params;
  if (!isLang(p.lang)) return {};
  const record = await find(p);
  return record ? detailMetadata(record, p.lang) : {};
}
export default async function Page({ params }: { params: Promise<Params> }) {
  const p = await params;
  if (!isLang(p.lang)) notFound();
  const record = await find(p);
  if (!record) notFound();
  if (
    recordSection(record) !== (alias[p.section] || resolveSegment(p.section)) &&
    !["publications", "blog"].includes(resolveSegment(p.section) || "")
  )
    notFound();
  const canonical = contentHref(record, p.lang);
  if (canonical !== `/${p.lang}/${p.section}/${p.slug}`)
    permanentRedirect(canonical);
  return <Detail record={record} lang={p.lang} />;
}
