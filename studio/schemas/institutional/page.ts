import { defineType } from "sanity";
import { DocumentIcon } from "@sanity/icons";

export const page = defineType({
  name: "page",
  title: "Página institucional",
  type: "document",
  icon: DocumentIcon,
  fields: [
    { name: "title", title: "Título", type: "localizedString", validation: (R) => R.required() },
    { name: "slug", title: "Slug", type: "localizedSlug", validation: (R) => R.required() },
    {
      name: "kind",
      title: "Tipo",
      type: "string",
      description: "Identificador estável usado pelo frontend (about, contact, etc).",
      options: {
        list: [
          { title: "Sobre", value: "about" },
          { title: "Contato", value: "contact" },
          { title: "Linhas de pesquisa", value: "research-lines" },
          { title: "Página livre", value: "free" },
        ],
      },
      validation: (R) => R.required(),
    },
    { name: "body", title: "Conteúdo", type: "localizedBody" },
    {
      name: "seoDescription",
      title: "Descrição SEO (meta description)",
      type: "localizedText",
    },
  ],
  preview: { select: { title: "title.pt", subtitle: "kind" } },
});
