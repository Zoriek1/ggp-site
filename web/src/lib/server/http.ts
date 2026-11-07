import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { PortalError, isPortalError } from "./repository";

export function failure(error: unknown): NextResponse {
  if (error instanceof ZodError)
    return NextResponse.json(
      {
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
        error: error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join(" "),
      },
      { status: 422 },
    );
  if (isPortalError(error))
    return NextResponse.json(
      { error: error.message, issues: error.issues },
      { status: error.status },
    );
  console.error("[portal] falha interna", {
    name: error instanceof Error ? error.name : "unknown",
  });
  return NextResponse.json(
    {
      error:
        "Não foi possível concluir a operação. Seu texto permanece no editor.",
    },
    { status: 500 },
  );
}
export async function jsonBody(
  req: Request,
  limit = 2000000,
): Promise<unknown> {
  if (Number(req.headers.get("content-length") || 0) > limit)
    throw new PortalError("Conteúdo maior que o limite permitido.", 413);
  const reader = req.body?.getReader();
  if (!reader) throw new PortalError("Envie o conteúdo da requisição.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > limit) {
      await reader.cancel();
      throw new PortalError("Conteúdo maior que o limite permitido.", 413);
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new PortalError("JSON inválido.");
  }
}
