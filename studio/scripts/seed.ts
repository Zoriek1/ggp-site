/**
 * Seed do dataset Sanity.
 *
 * Rodar:
 *   1) Configure studio/.env com SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET e SANITY_WRITE_TOKEN.
 *   2) Token: https://sanity.io/manage > projeto > API > Tokens > Add token (role Editor).
 *   3) `cd studio && npm run seed`
 *
 * O script é idempotente: usa createOrReplace com IDs fixos. Pode rodar várias vezes.
 */

import { createClient } from "@sanity/client";
import { siteSettingsDoc } from "./seed/siteSettings";
import { pagesDocs } from "./seed/pages";
import { taxonomyDocs } from "./seed/taxonomy";
import { memberDocs } from "./seed/members";
import { publicationDocs } from "./seed/publications";
import { pgpDocs } from "./seed/pgps";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId) {
  console.error("Falta SANITY_STUDIO_PROJECT_ID em studio/.env");
  process.exit(1);
}
if (!token) {
  console.error(
    "Falta SANITY_WRITE_TOKEN em studio/.env. Gere em https://sanity.io/manage > projeto > API > Tokens (role Editor).",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-12-01",
  token,
  useCdn: false,
});

async function main() {
  // ORDEM IMPORTA: taxonomias antes para que membros/publicações possam referenciá-las
  // dentro da mesma transação (Sanity valida refs no commit).
  const docs = [
    ...taxonomyDocs,
    ...memberDocs,
    ...pgpDocs,
    ...publicationDocs,
    ...pagesDocs,
    siteSettingsDoc,
  ];

  console.log(`Semeando ${docs.length} documentos em ${projectId}/${dataset}...`);

  const tx = client.transaction();
  for (const doc of docs) {
    tx.createOrReplace(doc as unknown as { _id: string; _type: string });
  }

  try {
    const result = await tx.commit();
    console.log(`✓ Commit OK. ${result.results.length} operações.`);
    // Quebra por tipo pra log mais legível
    const byType = docs.reduce<Record<string, number>>((acc, d) => {
      acc[d._type] = (acc[d._type] ?? 0) + 1;
      return acc;
    }, {});
    for (const [type, count] of Object.entries(byType).sort()) {
      console.log(`  • ${type}: ${count}`);
    }
  } catch (err) {
    const msg = (err as Error).message ?? String(err);
    console.error("✗ Commit falhou:", msg);
    process.exit(1);
  }
}

main();
