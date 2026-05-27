import { defineType } from "sanity";
import { UserIcon } from "@sanity/icons";

const ORCID_RE = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;

export const member = defineType({
  name: "member",
  title: "Membro",
  type: "document",
  icon: UserIcon,
  groups: [
    { name: "main", title: "Principal", default: true },
    { name: "academic", title: "Acadêmico" },
    { name: "links", title: "Links" },
  ],
  fields: [
    { name: "name", title: "Nome completo", type: "string", group: "main", validation: (R) => R.required() },
    { name: "displayName", title: "Nome curto (opcional)", type: "string", group: "main" },
    {
      name: "photo",
      title: "Foto (1:1, mín. 600x600)",
      type: "image",
      options: { hotspot: true },
      group: "main",
      fields: [
        { name: "alt", type: "string", title: "Alt (PT)", validation: (R) => R.required() },
        { name: "altEn", type: "string", title: "Alt (EN)" },
      ],
    },
    {
      name: "role",
      title: "Papel no grupo",
      type: "string",
      group: "main",
      options: {
        list: [
          { title: "Coordenador(a)", value: "coordinator" },
          { title: "Pesquisador(a)", value: "researcher" },
          { title: "Pós-doutorando(a)", value: "postdoc" },
          { title: "Doutorando(a)", value: "phd" },
          { title: "Mestrando(a)", value: "msc" },
          { title: "Aluno(a) de graduação", value: "undergrad" },
          { title: "Colaborador(a) externo(a)", value: "collaborator" },
        ],
        layout: "dropdown",
      },
      validation: (R) => R.required(),
    },
    { name: "active", title: "Ativo no grupo", type: "boolean", initialValue: true, group: "main" },
    { name: "bio", title: "Bio", type: "localizedText", group: "main" },

    {
      name: "researchAreas",
      title: "Áreas de pesquisa",
      type: "array",
      of: [{ type: "reference", to: [{ type: "researchArea" }] }],
      group: "academic",
    },
    {
      name: "topics",
      title: "Tópicos de física de interesse",
      type: "array",
      of: [{ type: "reference", to: [{ type: "physicsTopic" }] }],
      group: "academic",
    },

    {
      name: "email",
      title: "Email institucional",
      type: "string",
      group: "links",
      validation: (R) => R.email(),
    },
    {
      name: "orcid",
      title: "ORCID",
      type: "string",
      group: "links",
      description: "Formato: 0000-0000-0000-0000",
      validation: (R) =>
        R.custom((val) => {
          if (!val) return true;
          return ORCID_RE.test(val) || "Formato inválido (use 0000-0000-0000-000X)";
        }),
    },
    { name: "lattesUrl", title: "Currículo Lattes (URL)", type: "url", group: "links" },
    { name: "linkedinUrl", title: "LinkedIn (URL)", type: "url", group: "links" },
    { name: "personalUrl", title: "Site pessoal", type: "url", group: "links" },
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "photo", active: "active" },
    prepare({ title, subtitle, media, active }) {
      const roleLabel: Record<string, string> = {
        coordinator: "Coordenador(a)",
        researcher: "Pesquisador(a)",
        postdoc: "Pós-doutorando(a)",
        phd: "Doutorando(a)",
        msc: "Mestrando(a)",
        undergrad: "Graduação",
        collaborator: "Colaborador(a)",
      };
      const role = (subtitle && roleLabel[subtitle as string]) || subtitle;
      return { title: `${title}${active ? "" : " (inativo)"}`, subtitle: role, media };
    },
  },
});
