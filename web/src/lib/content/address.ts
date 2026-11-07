import { isLang } from "@/i18n/config";
import { contentHref, resolveSegment } from "@/i18n/routes";
import { bySlug } from "./query";
import type { ContentRecord } from "./model";

const aliases: Record<string, string> = {
  topicos: "keywords",
  topics: "keywords",
  "areas-de-pesquisa": "areas",
  "research-areas": "areas",
};
export function detailAddress(pathname: string) {
  const parts = pathname.split("/");
  if (parts.length !== 4 || !isLang(parts[1]) || !parts[3]) return;
  const section = aliases[parts[2]] || resolveSegment(parts[2]);
  const collection =
    section === "publications" || section === "blog" ? "items" : section;
  if (
    !collection ||
    !["items", "pgps", "guides", "areas", "keywords", "pages"].includes(
      collection,
    )
  )
    return;
  return { lang: parts[1], collection, slug: parts[3] };
}
export function canonicalAddress(pathname: string, records: ContentRecord[]) {
  const address = detailAddress(pathname);
  if (!address) return;
  const record = bySlug(records, address.collection, address.slug);
  return record ? contentHref(record, address.lang) : undefined;
}
