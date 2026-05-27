import type { Lang } from "@/i18n/config";

export const formatDate = (iso: string | null | undefined, lang: Lang): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(lang === "en" ? "en-US" : "pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const formatDateRange = (
  startIso: string,
  endIso: string | null | undefined,
  lang: Lang,
): string => {
  const start = formatDate(startIso, lang);
  if (!endIso) return start;
  const end = formatDate(endIso, lang);
  return start === end ? start : `${start} — ${end}`;
};

/** Extrai videoId do YouTube de várias variantes de URL. Retorna null se não reconhecer. */
export const youtubeId = (url: string | null | undefined): string | null => {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (u.hostname.endsWith("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      if (u.pathname.startsWith("/embed/")) return u.pathname.slice(7) || null;
      if (u.pathname.startsWith("/shorts/")) return u.pathname.slice(8) || null;
    }
  } catch {
    return null;
  }
  return null;
};
