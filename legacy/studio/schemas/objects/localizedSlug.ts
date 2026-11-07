import { defineType } from "sanity";

const slugify = (input: string) =>
  input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 96);

export const localizedSlug = defineType({
  name: "localizedSlug",
  title: "Slug bilíngue (PT/EN)",
  type: "object",
  fields: [
    {
      name: "pt",
      title: "Slug PT",
      type: "slug",
      options: {
        source: (doc: Record<string, unknown>) => {
          const title = doc.title as { pt?: string } | undefined;
          return title?.pt ?? "";
        },
        slugify,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "en",
      title: "Slug EN",
      type: "slug",
      options: {
        source: (doc: Record<string, unknown>) => {
          const title = doc.title as { en?: string; pt?: string } | undefined;
          return title?.en ?? title?.pt ?? "";
        },
        slugify,
      },
    },
  ],
});
