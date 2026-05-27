import { defineType } from "sanity";
import { PlayIcon } from "@sanity/icons";

export const media = defineType({
  name: "media",
  title: "Mídia (vídeo / palestra)",
  type: "document",
  icon: PlayIcon,
  fields: [
    { name: "title", title: "Título", type: "localizedString", validation: (R) => R.required() },
    { name: "slug", title: "Slug", type: "localizedSlug", validation: (R) => R.required() },
    {
      name: "type",
      title: "Tipo",
      type: "string",
      options: {
        list: [
          { title: "Vídeo", value: "video" },
          { title: "Palestra", value: "lecture" },
          { title: "Podcast", value: "podcast" },
          { title: "Webinar", value: "webinar" },
        ],
      },
      validation: (R) => R.required(),
    },
    {
      name: "videoUrl",
      title: "URL do vídeo (YouTube / Vimeo)",
      type: "url",
      validation: (R) => R.required(),
    },
    { name: "date", title: "Data", type: "date", validation: (R) => R.required() },
    { name: "description", title: "Descrição", type: "localizedText" },
    {
      name: "speakers",
      title: "Palestrantes (membros)",
      type: "array",
      of: [{ type: "reference", to: [{ type: "member" }] }],
    },
    {
      name: "externalSpeakers",
      title: "Palestrantes externos",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
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
    select: { title: "title.pt", subtitle: "type", date: "date" },
    prepare: ({ title, subtitle, date }) => ({
      title,
      subtitle: [subtitle, date].filter(Boolean).join(" · "),
    }),
  },
});
