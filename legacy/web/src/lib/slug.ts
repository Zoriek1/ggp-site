import type { Lang } from "@/i18n/config";
import type { LocalizedSlug } from "@/lib/sanity/types";

/** Slug preferido para o idioma; cai para o outro idioma; cai para _id como último recurso. */
export const slugFor = (
  slug: LocalizedSlug | null | undefined,
  lang: Lang,
  fallback?: string,
): string => {
  const pri = lang === "en" ? slug?.en?.current : slug?.pt?.current;
  const sec = lang === "en" ? slug?.pt?.current : slug?.en?.current;
  return pri || sec || fallback || "";
};

/** Slug "limpo" só do idioma pedido (sem fallback) — usado para hreflang. */
export const slugStrict = (
  slug: LocalizedSlug | null | undefined,
  lang: Lang,
): string | null => (lang === "en" ? slug?.en?.current : slug?.pt?.current) ?? null;
