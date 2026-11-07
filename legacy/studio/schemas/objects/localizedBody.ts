import { defineType } from "sanity";

const portableText = {
  type: "array" as const,
  of: [
    { type: "block" },
    {
      type: "image",
      options: { hotspot: true },
      fields: [
        { name: "alt", type: "string", title: "Alt (PT)" },
        { name: "altEn", type: "string", title: "Alt (EN)" },
      ],
    },
  ],
};

export const localizedBody = defineType({
  name: "localizedBody",
  title: "Conteúdo bilíngue (PT/EN)",
  type: "object",
  fields: [
    { name: "pt", title: "Português", ...portableText },
    { name: "en", title: "English", ...portableText },
  ],
});
