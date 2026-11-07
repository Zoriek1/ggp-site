import { getPublicContent } from "./store";
import { contentHref, localizedHref } from "@/i18n/routes";
import { env } from "../env";
const escapeXml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
export async function sitemap(collection?: string) {
  const records = (await getPublicContent()).filter(
    (r) =>
      r.collection !== "settings" &&
      (!collection || r.collection === collection),
  );
  const entries = new Map<
    string,
    { pt: string; en: string; updated?: string }
  >();
  if (!collection || collection === "pages") {
    entries.set("home", { pt: "/pt", en: "/en" });
    for (const section of [
      "publications",
      "blog",
      "pgps",
      "guides",
      "areas",
      "keywords",
      "about",
      "contact",
    ] as const)
      entries.set(section, {
        pt: localizedHref(section, "pt"),
        en: localizedHref(section, "en"),
      });
  }
  for (const r of records)
    entries.set(contentHref(r, "pt"), {
      pt: contentHref(r, "pt"),
      en: contentHref(r, "en"),
      updated: r.updatedAt.slice(0, 10),
    });
  const seen = new Set<string>();
  const urls = [...entries.values()]
    .flatMap((entry) =>
      (["pt", "en"] as const).map((lang) => {
        const loc = `${env.siteUrl}${entry[lang]}`;
        if (seen.has(loc)) return "";
        seen.add(loc);
        return `<url><loc>${escapeXml(loc)}</loc>${entry.updated ? `<lastmod>${entry.updated}</lastmod>` : ""}<xhtml:link rel="alternate" hreflang="pt-BR" href="${escapeXml(`${env.siteUrl}${entry.pt}`)}"/><xhtml:link rel="alternate" hreflang="en" href="${escapeXml(`${env.siteUrl}${entry.en}`)}"/></url>`;
      }),
    )
    .join("\n");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
}
