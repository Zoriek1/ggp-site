import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import { schemaTypes } from "./schemas";
import { deskStructure } from "./structure/deskStructure";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

if (!projectId) {
  // Aviso em dev: lembrar o usuário de configurar
  // eslint-disable-next-line no-console
  console.warn(
    "[GGP Studio] SANITY_STUDIO_PROJECT_ID não definido. Rode `npx sanity init --env` antes de `npm run dev`.",
  );
}

export default defineConfig({
  name: "ggp",
  title: "GGP — Grande Grupo de Pesquisa (Física/UFG)",
  projectId: projectId || "missing-project-id",
  dataset,
  plugins: [structureTool({ structure: deskStructure }), visionTool()],
  schema: { types: schemaTypes },
});
