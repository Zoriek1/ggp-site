import { type NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { parseBody } from "next-sanity/webhook";
import { env } from "@/lib/env";

type Payload = { _type?: string; slug?: string | null };

export async function POST(req: NextRequest) {
  if (!env.revalidateSecret) {
    return NextResponse.json({ error: "Missing SANITY_REVALIDATE_SECRET" }, { status: 500 });
  }

  const { isValidSignature, body } = await parseBody<Payload>(req, env.revalidateSecret);
  if (!isValidSignature || !body) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const type = body._type;
  if (!type) return NextResponse.json({ revalidated: false });

  revalidateTag(type);
  // Settings é singleton — quando ele muda, header/footer revalidam via tag dedicada.
  if (type === "siteSettings") revalidateTag("siteSettings");

  return NextResponse.json({ revalidated: true, tag: type, slug: body.slug ?? null });
}
