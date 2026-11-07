import { defineType } from "sanity";
import { CogIcon } from "@sanity/icons";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Configurações do site",
  type: "document",
  icon: CogIcon,
  fields: [
    { name: "siteName", title: "Nome do site", type: "localizedString", validation: (R) => R.required() },
    {
      name: "tagline",
      title: "Subtítulo / slogan",
      type: "localizedString",
    },
    {
      name: "logo",
      title: "Logo (SVG preferencial)",
      type: "image",
      options: { hotspot: false },
    },
    {
      name: "logoDark",
      title: "Logo (variante escura, opcional)",
      type: "image",
    },
    {
      name: "heroIntro",
      title: "Introdução da home",
      type: "localizedBody",
    },
    {
      name: "contactEmail",
      title: "Email de contato",
      type: "string",
      validation: (R) => R.email(),
    },
    {
      name: "social",
      title: "Redes sociais",
      type: "object",
      fields: [
        { name: "instagram", title: "Instagram URL", type: "url" },
        { name: "youtube", title: "YouTube URL", type: "url" },
        { name: "linkedin", title: "LinkedIn URL", type: "url" },
      ],
    },
    {
      name: "organization",
      title: "Organização (JSON-LD)",
      type: "object",
      fields: [
        { name: "legalName", title: "Nome oficial", type: "string", initialValue: "Grande Grupo de Pesquisa em Ensino de Física" },
        { name: "parentOrganization", title: "Organização-mãe", type: "string", initialValue: "Universidade Federal de Goiás" },
        { name: "address", title: "Endereço", type: "text" },
      ],
    },
  ],
  preview: {
    select: { title: "siteName.pt" },
    prepare: ({ title }) => ({ title: title || "Configurações do site" }),
  },
});
