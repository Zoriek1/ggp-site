import { defineType } from "sanity";
import { UsersIcon } from "@sanity/icons";

export const pgp = defineType({
  name: "pgp",
  title: "PGP",
  type: "document",
  icon: UsersIcon,
  description:
    "Pequeno Grupo de Pesquisa. Inclui PGPs propriamente ditos, clubes, grupos de estudo, " +
    "grupos editoriais e preparações — tudo é PGP no modelo do GGP.",
  groups: [
    { name: "main", title: "Principal", default: true },
    { name: "people", title: "Pessoas" },
    { name: "context", title: "Contexto" },
    { name: "social", title: "Redes" },
  ],
  fields: [
    {
      name: "name",
      title: "Nome / Sigla",
      type: "string",
      group: "main",
      description: "Ex.: \"PGP - Waldemar Mundim\", \"FISIKEST\", \"CLIF - Clube do Livro\".",
      validation: (R) => R.required().max(120),
    },
    {
      name: "longName",
      title: "Nome estendido (opcional, bilíngue)",
      type: "localizedString",
      group: "main",
    },
    {
      name: "slug",
      title: "Slug",
      type: "localizedSlug",
      group: "main",
      validation: (R) => R.required(),
    },
    {
      name: "description",
      title: "Descrição",
      type: "localizedText",
      group: "main",
    },
    {
      name: "status",
      title: "Status",
      type: "string",
      group: "main",
      options: {
        list: [
          { title: "Ativo", value: "active" },
          { title: "Em formação", value: "forming" },
          { title: "Encerrado", value: "inactive" },
        ],
        layout: "radio",
      },
      initialValue: "active",
      validation: (R) => R.required(),
    },
    {
      name: "foundedYear",
      title: "Ano de início",
      type: "number",
      group: "main",
      validation: (R) => R.integer().min(1980).max(new Date().getFullYear() + 1),
    },

    {
      name: "coordinator",
      title: "Coordenador(a)",
      type: "reference",
      to: [{ type: "member" }],
      group: "people",
    },
    {
      name: "members",
      title: "Membros",
      type: "array",
      of: [{ type: "reference", to: [{ type: "member" }] }],
      group: "people",
    },

    {
      name: "school",
      title: "Escola / instituição",
      type: "string",
      group: "context",
      description: "Ex.: \"Colégio Estadual Waldemar Mundim\".",
    },
    {
      name: "topics",
      title: "Tópicos de física",
      type: "array",
      of: [{ type: "reference", to: [{ type: "physicsTopic" }] }],
      group: "context",
    },
    {
      name: "researchAreas",
      title: "Áreas de pesquisa",
      type: "array",
      of: [{ type: "reference", to: [{ type: "researchArea" }] }],
      group: "context",
    },

    {
      name: "social",
      title: "Redes",
      type: "object",
      group: "social",
      fields: [
        { name: "whatsapp", title: "WhatsApp (URL ou número)", type: "string" },
        { name: "telegram", title: "Telegram (URL)", type: "url" },
        { name: "instagram", title: "Instagram (URL)", type: "url" },
      ],
    },
  ],
  orderings: [
    { name: "nameAsc", title: "Nome A→Z", by: [{ field: "name", direction: "asc" }] },
    { name: "statusName", title: "Status + Nome", by: [{ field: "status", direction: "asc" }, { field: "name", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name", subtitle: "school", status: "status", membersCount: "members" },
    prepare: ({ title, subtitle, status, membersCount }) => {
      const statusLabel: Record<string, string> = {
        active: "ativo",
        forming: "em formação",
        inactive: "encerrado",
      };
      const count = Array.isArray(membersCount) ? membersCount.length : 0;
      return {
        title,
        subtitle: [subtitle, statusLabel[status as string] ?? status, count ? `${count} membros` : null]
          .filter(Boolean)
          .join(" · "),
      };
    },
  },
});
