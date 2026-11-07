import { defineType } from "sanity";

export const localizedText = defineType({
  name: "localizedText",
  title: "Texto longo bilíngue (PT/EN)",
  type: "object",
  fields: [
    {
      name: "pt",
      title: "Português",
      type: "text",
      rows: 6,
      validation: (Rule) => Rule.required(),
    },
    {
      name: "en",
      title: "English",
      type: "text",
      rows: 6,
    },
  ],
});
