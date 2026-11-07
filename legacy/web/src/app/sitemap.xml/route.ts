import { env } from "@/lib/env";

const SUB = [
  "pages",
  "publicacoes",
  "teses",
  "materiais",
  "midia",
  "eventos",
  "membros",
  "pgps",
  "topicos",
];

export function GET() {
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    SUB.map(
      (name) =>
        `  <sitemap><loc>${env.siteUrl}/sitemap-${name}.xml</loc></sitemap>`,
    ).join("\n") +
    `\n</sitemapindex>\n`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
