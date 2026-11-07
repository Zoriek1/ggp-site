import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { recordSchema } from "@/lib/content/model";
import { requireUser } from "@/lib/server/auth";
import { contentStore } from "@/lib/server/store";
import { failure, jsonBody } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    await requireUser(req);
    const store = contentStore(),
      snapshot = await store.get(true);
    return NextResponse.json(
      {
        entries: store.entries(snapshot),
        published: snapshot.published,
        driver:
          process.env.CONTENT_DRIVER ||
          (process.env.GITHUB_REPOSITORY ? "github" : "local"),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req, true);
    const input = z
      .object({
        record: recordSchema,
        revision: z.string().nullable(),
        action: z.enum(["draft", "publish", "unpublish", "archive"]),
      })
      .parse(await jsonBody(req));
    const entry = await contentStore().mutate({ ...input, actor: user.id });
    return NextResponse.json({ entry });
  } catch (error) {
    return failure(error);
  }
}
