import { env } from "@/lib/env";
import { LOCALES, HREFLANG } from "@/i18n/config";
import { localizedHref, type RouteKey } from "@/i18n/routes";
import { buildSitemapResponse } from "@/lib/seo/sitemap";

const xmlEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const PAGE_KEYS: ReadonlyArray<RouteKey | "home"> = [
  "home",
  "about",
  "contact",
  "members",
  "pgps",
  "publications",
  "theses",
  "teachingMaterials",
  "media",
  "resources",
  "events",
  "topics",
  "researchAreas",
];

export function GET() {
  const urls = PAGE_KEYS.map((k) => {
    const links = LOCALES.map(
      (l) =>
        `      <xhtml:link rel="alternate" hreflang="${HREFLANG[l]}" href="${xmlEscape(
          `${env.siteUrl}${k === "home" ? `/${l}` : localizedHref(k, l)}`,
        )}"/>`,
    ).join("\n");
    return LOCALES.map(
      (l) =>
        `  <url>\n` +
        `    <loc>${xmlEscape(`${env.siteUrl}${k === "home" ? `/${l}` : localizedHref(k, l)}`)}</loc>\n` +
        links +
        `\n  </url>`,
    ).join("\n");
  }).join("\n");

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    `${urls}\n` +
    `</urlset>\n`;
  return buildSitemapResponse(body);
}
