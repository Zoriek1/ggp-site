import type { Lang } from "./config";
import pt from "./pt.json";
import en from "./en.json";

const dicts = { pt, en } as const;

export type Dictionary = typeof pt;

export const getDictionary = (lang: Lang): Dictionary => dicts[lang];

/** Helper para acessar um campo bilíngue `{pt, en}` com fallback para PT. */
export const tField = <T extends { pt?: string | null; en?: string | null } | null | undefined>(
  value: T,
  lang: Lang,
): string => {
  if (!value) return "";
  return (lang === "en" ? value.en : value.pt) || value.pt || value.en || "";
};

/** Indica se a versão pedida em `lang` está faltando (frontend mostra aviso discreto). */
export const tMissing = (
  value: { pt?: string | null; en?: string | null } | null | undefined,
  lang: Lang,
): boolean => {
  if (!value) return true;
  const requested = lang === "en" ? value.en : value.pt;
  return !requested;
};
