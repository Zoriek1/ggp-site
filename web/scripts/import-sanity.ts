import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  importSanityDocuments,
  type SanityDocument,
} from "../src/lib/content/sanity-import";
import { serializeRecord } from "../src/lib/content/codec";
import { saveMedia, maxUpload } from "../src/lib/server/media";

const source = process.argv[2];
if (!source)
  throw new Error(
    "Uso: npm run import:sanity -- /caminho/data.ndjson [--overwrite]",
  );
const root =
  process.env.CONTENT_ROOT || fileURLToPath(new URL("../../", import.meta.url));
const raw = await readFile(source, "utf8");
const documents = (
  raw.trim().startsWith("[")
    ? JSON.parse(raw)
    : raw
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => JSON.parse(line))
) as SanityDocument[];
if (
  !Array.isArray(documents) ||
  documents.some(
    (d) => typeof d._id !== "string" || typeof d._type !== "string",
  )
)
  throw new Error("Exportação inválida.");
const assets = new Map<string, string>();
for (const doc of documents.filter((d) =>
  ["sanity.imageAsset", "sanity.fileAsset"].includes(d._type),
)) {
  const url = String(doc.url || "");
  if (!/^https:\/\/cdn\.sanity\.io\//.test(url))
    throw new Error(`Endereço de asset não permitido: ${doc._id}`);
  const response = await fetch(url, {
    redirect: "error",
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok || !response.body)
    throw new Error(`Falha ao baixar asset ${doc._id}`);
  const parts: Uint8Array[] = [];
  let size = 0;
  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > maxUpload) {
      await reader.cancel();
      throw new Error(`Asset acima de 20 MB: ${doc._id}`);
    }
    parts.push(value);
  }
  const media = await saveMedia(
    Buffer.concat(parts),
    (response.headers.get("content-type") || "").split(";")[0],
  );
  assets.set(url, media.url);
  doc.url = media.url;
}
const result = importSanityDocuments(documents);
for (const { record, state } of result.records)
  for (const [file, originalText] of Object.entries(
    serializeRecord(record, state),
  )) {
    let text = originalText;
    for (const [oldUrl, newUrl] of assets)
      text = text.replaceAll(oldUrl, newUrl);
    const target = path.join(root, file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, text, {
      flag: process.argv.includes("--overwrite") ? "w" : "wx",
    });
  }
console.log(
  JSON.stringify(
    {
      imported: result.records.length,
      assets: assets.size,
      drafts: result.records
        .filter((r) => r.state === "drafts")
        .map((r) => ({ id: r.record.id, reasons: r.reasons })),
      skipped: result.skipped,
    },
    null,
    2,
  ),
);
