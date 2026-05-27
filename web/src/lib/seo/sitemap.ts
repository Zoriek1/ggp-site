import { env } from "@/lib/env";
import { LOCALES, type Lang, HREFLANG } from "@/i18n/config";
import { localizedHref, type RouteKey } from "@/i18n/routes";

type Entry = {
  // por idioma: slug efetivo (com fallback) — usado para construir o loc
  slug: Record<Lang, string>;
  lastmod?: string;
};

const xmlEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function buildSitemapXml({
  key,
  entries,
}: {
  key: RouteKey;
  entries: Entry[];
}): string {
  const urls = entries
    .map((e) => {
      const links = LOCALES.map(
        (l) =>
          `      <xhtml:link rel="alternate" hreflang="${HREFLANG[l]}" href="${xmlEscape(
            `${env.siteUrl}${localizedHref(key, l, e.slug[l])}`,
          )}"/>`,
      ).join("\n");
      return LOCALES.map(
        (l) =>
          `  <url>\n` +
          `    <loc>${xmlEscape(`${env.siteUrl}${localizedHref(key, l, e.slug[l])}`)}</loc>\n` +
          (e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>\n` : "") +
          links +
          `\n  </url>`,
      ).join("\n");
    })
    .join("\n");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    `${urls}\n` +
    `</urlset>\n`
  );
}

export function buildSitemapResponse(xml: string) {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
