import { defineType } from "sanity";
import { DocumentTextIcon } from "@sanity/icons";

const DOI_RE = /^10\.\d{4,9}\/\S+$/;

export const publication = defineType({
  name: "publication",
  title: "Publicação",
  type: "document",
  icon: DocumentTextIcon,
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
      name: "authors",
      title: "Autores (membros do grupo)",
      type: "array",
      of: [{ type: "reference", to: [{ type: "member" }] }],
      group: "main",
    },
    {
      name: "externalAuthors",
      title: "Autores externos",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      group: "main",
    },
    { name: "abstract", title: "Resumo / Abstract", type: "localizedText", group: "main" },
    {
      name: "year",
      title: "Ano",
      type: "number",
      group: "meta",
      validation: (R) => R.required().integer().min(1900).max(new Date().getFullYear() + 1),
    },
    {
      name: "publishedDate",
      title: "Data de publicação (opcional)",
      type: "date",
      group: "meta",
    },
    { name: "venue", title: "Periódico / Conferência / Anais", type: "string", group: "meta" },
    {
      name: "doi",
      title: "DOI",
      type: "string",
      group: "meta",
      description: "Ex.: 10.1590/abc.2024.001",
      validation: (R) =>
        R.custom((val) => {
          if (!val) return true;
          return DOI_RE.test(val) || "Formato inválido (deve começar com 10.)";
        }),
    },
    { name: "externalUrl", title: "URL externa (página do artigo)", type: "url", group: "meta" },
    { name: "featured", title: "Destaque na home", type: "boolean", initialValue: false, group: "meta" },
    {
      name: "topics",
      title: "Tópicos de física",
      type: "array",
      of: [{ type: "reference", to: [{ type: "physicsTopic" }] }],
      group: "taxonomy",
      validation: (R) => R.min(1).error("Selecione ao menos 1 tópico"),
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
    {
      name: "pdfUrl",
      title: "PDF (URL externa)",
      type: "url",
      description: "Preencha quando migrar para R2/servidor UFG. Tem precedência sobre upload.",
      group: "files",
    },
  ],
  orderings: [
    { name: "yearDesc", title: "Ano (mais recente)", by: [{ field: "year", direction: "desc" }] },
  ],
  preview: {
    select: { title: "title.pt", subtitle: "year", venue: "venue" },
    prepare: ({ title, subtitle, venue }) => ({
      title,
      subtitle: [subtitle, venue].filter(Boolean).join(" — "),
    }),
  },
});
