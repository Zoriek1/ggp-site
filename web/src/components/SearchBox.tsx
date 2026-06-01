"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Lang } from "@/i18n/config";
import { SEARCH_SEGMENTS } from "@/i18n/routes";

export function SearchBox({
  lang,
  placeholder,
  label,
  variant = "inline",
}: {
  lang: Lang;
  placeholder: string;
  label: string;
  /** `inline`: campo compacto do header (escondido no mobile). `block`: largura total (menu mobile). */
  variant?: "inline" | "block";
}) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    router.push(`/${lang}/${SEARCH_SEGMENTS[lang]}?q=${encodeURIComponent(term)}`);
  }

  const isBlock = variant === "block";

  return (
    <form
      onSubmit={submit}
      role="search"
      className={isBlock ? "block w-full" : "hidden sm:block"}
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className={
          isBlock
            ? "w-full rounded border border-ink-200 bg-surface px-3 py-2 text-sm text-ink-900"
            : "w-36 rounded border border-ink-200 bg-surface px-3 py-1.5 text-sm text-ink-900 lg:w-56"
        }
      />
    </form>
  );
}
