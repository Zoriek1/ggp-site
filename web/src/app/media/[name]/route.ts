import { readFile } from "node:fs/promises";
import path from "node:path";
import { mediaDirectory, mediaName, mediaTypes } from "@/lib/server/media";

export const runtime = "nodejs";
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  if (!mediaName.test(name))
    return new Response("Arquivo não encontrado", { status: 404 });
  try {
    const data = await readFile(path.join(mediaDirectory(), name));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": mediaTypes[name.split(".").pop()!],
        "Content-Length": String(data.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    return new Response("Arquivo não encontrado", { status: 404 });
  }
}
