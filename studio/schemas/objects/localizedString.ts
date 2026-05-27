import { defineType } from "sanity";

export const localizedString = defineType({
  name: "localizedString",
  title: "Texto bilíngue (PT/EN)",
  type: "object",
  fields: [
    {
      name: "pt",
      title: "Português",
      type: "string",
      validation: (Rule) => Rule.required().max(200),
    },
    {
      name: "en",
      title: "English",
      type: "string",
      validation: (Rule) => Rule.max(200),
    },
  ],
  options: { columns: 2 },
});
