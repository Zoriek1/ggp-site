"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, type Lang } from "@/i18n/config";
import { resolveSegment, segmentFor } from "@/i18n/routes";

/**
 * Switcher de idioma que troca também os segmentos traduzidos da URL.
 * Ex.: /pt/publicacoes/abc → /en/publications/abc
 * (slugs continuam iguais se não houver slug.en; quem garante isso é o frontend nas páginas).
 */
export function LangSwitch({ currentLang }: { currentLang: Lang }) {
  const pathname = usePathname() || "/";

  const buildFor = (target: Lang): string => {
    const parts = pathname.split("/").filter(Boolean);
    // parts[0] = lang, parts[1] = section (traduzível), parts[2..] = restante
    if (parts.length === 0) return `/${target}`;
    const [, section, ...rest] = parts;
    if (!section) return `/${target}`;
    const key = resolveSegment(section);
    const newSegment = key ? segmentFor(key, target) : section;
    return `/${target}/${newSegment}${rest.length ? "/" + rest.join("/") : ""}`;
  };

  return (
    <div className="flex items-center gap-1 text-sm" aria-label="Language switcher">
      {LOCALES.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span className="text-ink-300">/</span>}
          {l === currentLang ? (
            <span className="font-medium text-ink-900 uppercase">{l}</span>
          ) : (
            <Link href={buildFor(l)} className="uppercase text-ink-500 hover:text-ink-900">
              {l}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}
