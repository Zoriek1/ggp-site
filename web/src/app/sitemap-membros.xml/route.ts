import { sanityFetch } from "@/lib/sanity/client";
import { sitemapMembersQuery } from "@/lib/sanity/queries";
import { buildSitemapXml, buildSitemapResponse } from "@/lib/seo/sitemap";

type Row = { _id: string; _updatedAt: string; name: string };

export async function GET() {
  const items = await sanityFetch<Row[]>(sitemapMembersQuery, {}, {
    revalidate: 3600,
    tags: ["member"],
  });
  const xml = buildSitemapXml({
    key: "members",
    entries: items.map((r) => ({
      slug: { pt: r._id, en: r._id },
      lastmod: r._updatedAt?.slice(0, 10),
    })),
  });
  return buildSitemapResponse(xml);
}
