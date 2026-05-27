import { defineType } from "sanity";
import { TagIcon } from "@sanity/icons";

export const tag = defineType({
  name: "tag",
  title: "Tag",
  type: "document",
  icon: TagIcon,
  fields: [
    { name: "label", title: "Rótulo", type: "localizedString", validation: (R) => R.required() },
    { name: "slug", title: "Slug", type: "localizedSlug", validation: (R) => R.required() },
  ],
  preview: { select: { title: "label.pt", subtitle: "label.en" } },
});
