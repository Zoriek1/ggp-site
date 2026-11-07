import { defineType } from "sanity";
import { PackageIcon } from "@sanity/icons";

export const resource = defineType({
  name: "resource",
  title: "Recurso geral",
  type: "document",
  icon: PackageIcon,
  description: "Material de consumo geral: links úteis, datasets, simuladores, etc.",
  fields: [
    { name: "title", title: "Título", type: "localizedString", validation: (R) => R.required() },
    { name: "slug", title: "Slug", type: "localizedSlug", validation: (R) => R.required() },
    { name: "description", title: "Descrição", type: "localizedText" },
    {
      name: "category",
      title: "Categoria",
      type: "string",
      options: {
        list: [
          { title: "Link útil", value: "link" },
          { title: "Dataset", value: "dataset" },
          { title: "Simulador / Software", value: "tool" },
          { title: "Apostila / Texto livre", value: "text" },
          { title: "Outro", value: "other" },
        ],
      },
      validation: (R) => R.required(),
    },
    { name: "url", title: "URL externa", type: "url" },
    {
      name: "file",
      title: "Arquivo (upload alternativo)",
      type: "file",
    },
    {
      name: "topics",
      title: "Tópicos de física",
      type: "array",
      of: [{ type: "reference", to: [{ type: "physicsTopic" }] }],
    },
    {
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "reference", to: [{ type: "tag" }] }],
    },
  ],
  preview: {
    select: { title: "title.pt", subtitle: "category" },
  },
});
