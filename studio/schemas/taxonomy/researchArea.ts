import { defineType } from "sanity";
import { TagIcon } from "@sanity/icons";

export const researchArea = defineType({
  name: "researchArea",
  title: "Área de pesquisa",
  type: "document",
  icon: TagIcon,
  fields: [
    { name: "name", title: "Nome", type: "localizedString", validation: (R) => R.required() },
    { name: "slug", title: "Slug", type: "localizedSlug", validation: (R) => R.required() },
    { name: "description", title: "Descrição", type: "localizedText" },
  ],
  preview: {
    select: { title: "name.pt", subtitle: "name.en" },
  },
});
