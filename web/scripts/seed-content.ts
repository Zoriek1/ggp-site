import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { taxonomyDocs } from "../../legacy/studio/scripts/seed/taxonomy";
import { memberDocs } from "../../legacy/studio/scripts/seed/members";
import { pgpDocs } from "../../legacy/studio/scripts/seed/pgps";
import { publicationDocs } from "../../legacy/studio/scripts/seed/publications";
import { pagesDocs } from "../../legacy/studio/scripts/seed/pages";
import { siteSettingsDoc } from "../../legacy/studio/scripts/seed/siteSettings";
import {
  importSanityDocuments,
  type SanityDocument,
} from "../src/lib/content/sanity-import";
import { serializeRecord } from "../src/lib/content/codec";

const root =
  process.env.CONTENT_ROOT || fileURLToPath(new URL("../../", import.meta.url));
const docs = [
  ...taxonomyDocs,
  ...memberDocs,
  ...pgpDocs,
  ...publicationDocs,
  ...pagesDocs,
  siteSettingsDoc,
] as unknown as SanityDocument[];
const result = importSanityDocuments(docs, "2026-06-01T04:02:33.000Z");
for (const { record, state } of result.records)
  for (const [file, text] of Object.entries(serializeRecord(record, state))) {
    const target = path.join(root, file);
    await mkdir(path.dirname(target), { recursive: true });
    // Never overwrite content changed through the panel.
    await writeFile(target, text, { flag: "wx" }).catch(
      (error: NodeJS.ErrnoException) => {
        if (error.code !== "EEXIST") throw error;
      },
    );
  }
console.log(
  JSON.stringify(
    {
      imported: result.records.length,
      drafts: result.records
        .filter((r) => r.state === "drafts")
        .map((r) => ({ id: r.record.id, reasons: r.reasons })),
      skipped: result.skipped,
    },
    null,
    2,
  ),
);
