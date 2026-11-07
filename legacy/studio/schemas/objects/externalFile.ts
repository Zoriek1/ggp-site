import { defineType } from "sanity";

export const externalFile = defineType({
  name: "externalFile",
  title: "Arquivo (upload ou URL externa)",
  type: "object",
  description:
    "Use upload no Sanity por enquanto. Quando migrarmos para R2/UFG, preencha apenas pdfUrl.",
  fields: [
    {
      name: "file",
      title: "Arquivo (upload)",
      type: "file",
      options: { accept: ".pdf,.zip,.docx,.pptx" },
    },
    {
      name: "url",
      title: "URL externa (R2 / servidor UFG / link público)",
      type: "url",
      validation: (Rule) =>
        Rule.uri({ scheme: ["http", "https"] }).custom((val, ctx) => {
          const parent = ctx.parent as { file?: unknown; url?: string } | undefined;
          if (!val && !parent?.file) return "Forneça upload OU URL externa";
          return true;
        }),
    },
    {
      name: "label",
      title: "Rótulo (opcional)",
      type: "localizedString",
    },
  ],
});
