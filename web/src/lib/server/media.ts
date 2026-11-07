import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { PortalError } from "./repository";

export const mediaTypes: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
};
export const mediaName = /^[a-f0-9]{64}\.(jpg|png|webp|pdf)$/;
export const maxUpload = 20 * 1024 * 1024;
export function mediaDirectory(): string {
  if (!process.env.MEDIA_DIR && process.env.NODE_ENV === "production")
    throw new PortalError(
      "Configure MEDIA_DIR para armazenar os arquivos.",
      503,
    );
  return path.resolve(
    process.env.MEDIA_DIR || path.join(process.cwd(), "../.runtime/media"),
  );
}
export async function validateMedia(
  buffer: Buffer,
  mime: string,
): Promise<{ data: Buffer; extension: string }> {
  if (!buffer.length || buffer.length > maxUpload)
    throw new PortalError("O arquivo deve ter até 20 MB.", 413);
  if (
    mime === "application/pdf" &&
    buffer.subarray(0, 5).toString() === "%PDF-" &&
    buffer.subarray(-2048).includes(Buffer.from("%%EOF"))
  )
    return { data: buffer, extension: "pdf" };
  const extension = Object.entries(mediaTypes).find(
    ([, type]) => type === mime && type !== "application/pdf",
  )?.[0];
  if (!extension)
    throw new PortalError(
      "Envie uma imagem JPEG, PNG ou WebP, ou um PDF válido.",
      415,
    );
  try {
    const input = sharp(buffer, { limitInputPixels: 40000000 });
    const metadata = await input.metadata();
    if (metadata.format !== (extension === "jpg" ? "jpeg" : extension))
      throw new Error("format mismatch");
    const data = await input
      .rotate()
      .toFormat(extension === "jpg" ? "jpeg" : (extension as "png" | "webp"))
      .toBuffer();
    return { data, extension };
  } catch {
    throw new PortalError(
      "A imagem está inválida ou é maior que o limite de resolução.",
      415,
    );
  }
}
export async function saveMedia(
  buffer: Buffer,
  mime: string,
): Promise<{ url: string; type: "image" | "pdf" }> {
  const { data, extension } = await validateMedia(buffer, mime);
  const name = `${createHash("sha256").update(data).digest("hex")}.${extension}`;
  const directory = mediaDirectory();
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, name), data, { flag: "wx" }).catch(
    (e: NodeJS.ErrnoException) => {
      if (e.code !== "EEXIST") throw e;
    },
  );
  return { url: `/media/${name}`, type: extension === "pdf" ? "pdf" : "image" };
}
