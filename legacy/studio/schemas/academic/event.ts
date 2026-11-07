import { defineType } from "sanity";
import { CalendarIcon } from "@sanity/icons";

export const event = defineType({
  name: "event",
  title: "Evento",
  type: "document",
  icon: CalendarIcon,
  groups: [
    { name: "main", title: "Principal", default: true },
    { name: "when", title: "Quando / onde" },
    { name: "taxonomy", title: "Taxonomia" },
  ],
  fields: [
    { name: "title", title: "Título", type: "localizedString", group: "main", validation: (R) => R.required() },
    { name: "slug", title: "Slug", type: "localizedSlug", group: "main", validation: (R) => R.required() },
    { name: "description", title: "Descrição", type: "localizedBody", group: "main" },
    {
      name: "coverImage",
      title: "Banner (16:9, mín. 1920x1080)",
      type: "image",
      options: { hotspot: true },
      group: "main",
      fields: [
        { name: "alt", type: "string", title: "Alt (PT)" },
        { name: "altEn", type: "string", title: "Alt (EN)" },
      ],
    },

    { name: "startDate", title: "Início", type: "datetime", group: "when", validation: (R) => R.required() },
    { name: "endDate", title: "Fim", type: "datetime", group: "when" },
    { name: "location", title: "Local", type: "string", group: "when" },
    { name: "isOnline", title: "Online?", type: "boolean", group: "when", initialValue: false },
    { name: "registrationUrl", title: "URL de inscrição", type: "url", group: "when" },

    {
      name: "speakers",
      title: "Palestrantes (membros)",
      type: "array",
      of: [{ type: "reference", to: [{ type: "member" }] }],
      group: "main",
    },
    {
      name: "externalSpeakers",
      title: "Palestrantes externos",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      group: "main",
    },

    {
      name: "topics",
      title: "Tópicos de física",
      type: "array",
      of: [{ type: "reference", to: [{ type: "physicsTopic" }] }],
      group: "taxonomy",
    },
    {
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "reference", to: [{ type: "tag" }] }],
      group: "taxonomy",
    },
  ],
  orderings: [
    { name: "startDesc", title: "Mais recentes", by: [{ field: "startDate", direction: "desc" }] },
    { name: "startAsc", title: "Mais antigos", by: [{ field: "startDate", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title.pt", date: "startDate", location: "location", media: "coverImage" },
    prepare: ({ title, date, location, media }) => ({
      title,
      subtitle: [date && new Date(date).toLocaleDateString("pt-BR"), location].filter(Boolean).join(" · "),
      media,
    }),
  },
});
