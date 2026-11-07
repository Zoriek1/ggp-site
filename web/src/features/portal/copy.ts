import type { Lang } from "@/lib/content/model";
import type { RouteKey } from "@/i18n/routes";
export const sectionNames: Record<Lang, Record<RouteKey, string>> = {
  pt: {
    publications: "Acervo",
    blog: "Blog e comunicados",
    pgps: "Pequenos Grupos de Pesquisa",
    guides: "Guias de estudo",
    areas: "Áreas do conhecimento",
    keywords: "Palavras-chave",
    about: "Sobre o GGP",
    contact: "Contato",
    search: "Buscar no portal",
    pages: "Páginas",
  },
  en: {
    publications: "Library",
    blog: "Blog and announcements",
    pgps: "Small Research Groups",
    guides: "Study guides",
    areas: "Knowledge areas",
    keywords: "Keywords",
    about: "About GGP",
    contact: "Contact",
    search: "Search the portal",
    pages: "Pages",
  },
};
export const kindNames = {
  pt: {
    article: "Artigo",
    text: "Texto",
    material: "Material",
    post: "Blog",
    notice: "Comunicado",
  },
  en: {
    article: "Article",
    text: "Text",
    material: "Resource",
    post: "Blog",
    notice: "Announcement",
  },
};
