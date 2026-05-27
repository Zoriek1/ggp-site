export const LOCALES = ["pt", "en"] as const;
export type Lang = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Lang = "pt";

export const isLang = (v: string | undefined): v is Lang =>
  (LOCALES as readonly string[]).includes(v ?? "");

export const HREFLANG: Record<Lang, string> = {
  pt: "pt-BR",
  en: "en",
};
