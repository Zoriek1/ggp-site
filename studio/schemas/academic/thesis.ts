import { defineType } from "sanity";
import { BookIcon } from "@sanity/icons";

export const thesis = defineType({
  name: "thesis",
  title: "Tese ou dissertação",
  type: "document",
  icon: BookIcon,
  groups: [
    { name: "main", title: "Principal", default: true },
    { name: "meta", title: "Metadados" },
    { name: "taxonomy", title: "Taxonomia" },
    { name: "files", title: "Arquivos" },
  ],
  fields: [
    { name: "title", title: "Título", type: "localizedString", group: "main", validation: (R) => R.required() },
    { name: "slug", title: "Slug", type: "localizedSlug", group: "main", validation: (R) => R.required() },
    {
      name: "author",
      title: "Autor(a)",
      type: "reference",
      to: [{ type: "member" }],
      group: "main",
      validation: (R) => R.required(),
    },
    {
      name: "externalAuthorName",
      title: "Nome do autor (se não cadastrado como membro)",
      type: "string",
      group: "main",
      description: "Use só quando o autor não é membro cadastrado.",
    },
    {
      name: "advisor",
      title: "Orientador(a)",
      type: "reference",
      to: [{ type: "member" }],
      group: "main",
      validation: (R) => R.required(),
    },
    {
      name: "coAdvisor",
      title: "Coorientador(a)",
      type: "reference",
      to: [{ type: "member" }],
      group: "main",
    },
    { name: "summary", title: "Resumo", type: "localizedText", group: "main" },

    {
      name: "level",
      title: "Nível",
      type: "string",
      group: "meta",
      options: {
        list: [
          { title: "TCC / Monografia", value: "tcc" },
          { title: "Mestrado", value: "masters" },
          { title: "Doutorado", value: "doctorate" },
        ],
        layout: "radio",
      },
      validation: (R) => R.required(),
    },
    { name: "year", title: "Ano de defesa", type: "number", group: "meta", validation: (R) => R.required().integer().min(1950) },
    { name: "institution", title: "Instituição", type: "string", group: "meta", initialValue: "Universidade Federal de Goiás" },
    { name: "program", title: "Programa de pós-graduação", type: "string", group: "meta" },

    {
      name: "topics",
      title: "Tópicos de física",
      type: "array",
      of: [{ type: "reference", to: [{ type: "physicsTopic" }] }],
      group: "taxonomy",
      validation: (R) => R.min(1),
    },
    {
      name: "researchAreas",
      title: "Áreas de pesquisa",
      type: "array",
      of: [{ type: "reference", to: [{ type: "researchArea" }] }],
      group: "taxonomy",
    },
    {
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "reference", to: [{ type: "tag" }] }],
      group: "taxonomy",
    },

    { name: "pdfFile", title: "PDF (upload)", type: "file", options: { accept: ".pdf" }, group: "files" },
    { name: "pdfUrl", title: "PDF (URL externa)", type: "url", group: "files" },
  ],
  orderings: [
    { name: "yearDesc", title: "Ano (mais recente)", by: [{ field: "year", direction: "desc" }] },
  ],
  preview: {
    select: { title: "title.pt", level: "level", year: "year", authorName: "author.name" },
    prepare: ({ title, level, year, authorName }) => {
      const levelLabel: Record<string, string> = {
        tcc: "TCC",
        masters: "Mestrado",
        doctorate: "Doutorado",
      };
      return {
        title,
        subtitle: [levelLabel[level as string] ?? level, year, authorName].filter(Boolean).join(" · "),
      };
    },
  },
});
