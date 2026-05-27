import type { Lang } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export function TranslationNotice({ lang, show }: { lang: Lang; show: boolean }) {
  if (!show || lang !== "en") return null;
  const dict = getDictionary(lang);
  return (
    <p className="mb-4 rounded border border-accent-500/30 bg-accent-500/5 px-3 py-2 text-xs text-ink-700">
      {dict.common.translationPending}
    </p>
  );
}
