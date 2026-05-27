import { defineType } from "sanity";
import { BookIcon } from "@sanity/icons";

export const educationLevel = defineType({
  name: "educationLevel",
  title: "Nível de ensino",
  type: "document",
  icon: BookIcon,
  fields: [
    { name: "name", title: "Nome", type: "localizedString", validation: (R) => R.required() },
    { name: "slug", title: "Slug", type: "localizedSlug", validation: (R) => R.required() },
    {
      name: "order",
      title: "Ordem de exibição",
      type: "number",
      validation: (R) => R.required().integer().min(0),
    },
  ],
  orderings: [
    { name: "order", title: "Ordem", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: { select: { title: "name.pt", subtitle: "name.en", order: "order" } },
});
