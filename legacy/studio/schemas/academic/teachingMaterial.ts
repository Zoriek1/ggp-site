import { defineType } from "sanity";
import { PresentationIcon } from "@sanity/icons";

export const teachingMaterial = defineType({
  name: "teachingMaterial",
  title: "Material didático",
  type: "document",
  icon: PresentationIcon,
  groups: [
    { name: "main", title: "Principal", default: true },
    { name: "taxonomy", title: "Taxonomia" },
    { name: "files", title: "Arquivos" },
  ],
  fields: [
    { name: "title", title: "Título", type: "localizedString", group: "main", validation: (R) => R.required() },
    { name: "slug", title: "Slug", type: "localizedSlug", group: "main", validation: (R) => R.required() },
    { name: "description", title: "Descrição", type: "localizedText", group: "main" },
    {
      name: "coverImage",
      title: "Capa (16:9, mín. 1280x720)",
      type: "image",
      options: { hotspot: true },
      group: "main",
      fields: [
        { name: "alt", type: "string", title: "Alt (PT)" },
        { name: "altEn", type: "string", title: "Alt (EN)" },
      ],
    },
    {
      name: "authors",
      title: "Autores",
      type: "array",
      of: [{ type: "reference", to: [{ type: "member" }] }],
      group: "main",
    },
    { name: "publishedDate", title: "Data de publicação", type: "date", group: "main" },

    {
      name: "level",
      title: "Nível de ensino",
      type: "reference",
      to: [{ type: "educationLevel" }],
      group: "taxonomy",
      validation: (R) => R.required(),
    },
    {
      name: "topics",
      title: "Tópicos de física",
      type: "array",
      of: [{ type: "reference", to: [{ type: "physicsTopic" }] }],
      group: "taxonomy",
      validation: (R) => R.min(1),
    },
    {
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "reference", to: [{ type: "tag" }] }],
      group: "taxonomy",
    },

    {
      name: "files",
      title: "Arquivos",
      type: "array",
      of: [{ type: "externalFile" }],
      group: "files",
    },
  ],
  preview: {
    select: { title: "title.pt", subtitle: "level.name.pt", media: "coverImage" },
  },
});
