import { sanityFetch } from "@/lib/sanity/client";
import { sitemapByTypeQuery } from "@/lib/sanity/queries";
import { buildSitemapXml, buildSitemapResponse } from "@/lib/seo/sitemap";

type Row = { _id: string; _updatedAt: string; slugPt?: string | null; slugEn?: string | null };

export async function GET() {
  const items = await sanityFetch<Row[]>(sitemapByTypeQuery, { type: "publication" }, {
    revalidate: 3600,
    tags: ["publication"],
  });
  const xml = buildSitemapXml({
    key: "publications",
    entries: items.map((r) => ({
      slug: {
        pt: r.slugPt || r.slugEn || r._id,
        en: r.slugEn || r.slugPt || r._id,
      },
      lastmod: r._updatedAt?.slice(0, 10),
    })),
  });
  return buildSitemapResponse(xml);
}
