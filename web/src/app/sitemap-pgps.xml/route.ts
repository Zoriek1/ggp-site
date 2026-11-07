import { sitemap } from "@/lib/server/sitemap";
export const dynamic = "force-dynamic";
export async function GET() {
  return sitemap("pgps");
}
