import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { failure } from "@/lib/server/http";
import { maxUpload, saveMedia } from "@/lib/server/media";
import { PortalError } from "@/lib/server/repository";

export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  try {
    await requireUser(req, true);
    const maximum = maxUpload + 65536;
    if (Number(req.headers.get("content-length") || 0) > maximum)
      throw new PortalError("O arquivo deve ter até 20 MB.", 413);
    const reader = req.body?.getReader();
    if (!reader) throw new PortalError("Selecione um arquivo.");
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > maximum) {
        await reader.cancel();
        throw new PortalError("O arquivo deve ter até 20 MB.", 413);
      }
      chunks.push(value);
    }
    const request = new Request(req.url, {
      method: "POST",
      headers: { "content-type": req.headers.get("content-type") || "" },
      body: Buffer.concat(chunks),
    });
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      throw new PortalError("Formulário de arquivo inválido.");
    }
    const file = form.get("file");
    if (!(file instanceof File)) throw new PortalError("Selecione um arquivo.");
    const asset = await saveMedia(
      Buffer.from(await file.arrayBuffer()),
      file.type,
    );
    return NextResponse.json({ ...asset, label: file.name.slice(0, 240) });
  } catch (error) {
    return failure(error);
  }
}
