import { defineType } from "sanity";
import { ComponentIcon } from "@sanity/icons";

export const physicsTopic = defineType({
  name: "physicsTopic",
  title: "Tópico de física",
  type: "document",
  icon: ComponentIcon,
  fields: [
    { name: "name", title: "Nome", type: "localizedString", validation: (R) => R.required() },
    { name: "slug", title: "Slug", type: "localizedSlug", validation: (R) => R.required() },
    {
      name: "parent",
      title: "Tópico pai (opcional)",
      type: "reference",
      to: [{ type: "physicsTopic" }],
    },
    { name: "description", title: "Descrição", type: "localizedText" },
  ],
  preview: {
    select: { title: "name.pt", subtitle: "name.en", parent: "parent.name.pt" },
    prepare({ title, subtitle, parent }) {
      return { title, subtitle: parent ? `${parent} › ${subtitle ?? ""}` : subtitle };
    },
  },
});
