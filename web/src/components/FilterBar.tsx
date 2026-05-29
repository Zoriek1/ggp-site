"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Facet } from "@/lib/discovery/filters";

type Props = {
  facets: Facet[];
  clearLabel: string;
  resultsLabel: string;
};

/**
 * Barra de filtros dirigida por URL. Em cada mudança, reescreve a querystring
 * (resetando `page`) e navega — o server component re-renderiza com os novos filtros.
 */
export function FilterBar({ facets, clearLabel, resultsLabel }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasActive = facets.some((f) => searchParams.get(f.param as string));

  function update(param: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(param, value);
    else params.delete(param);
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  if (facets.length === 0) {
    return <p className="mt-6 text-sm text-ink-500">{resultsLabel}</p>;
  }

  return (
    <div className="mt-6 flex flex-wrap items-end gap-x-4 gap-y-3">
      {facets.map((f) => {
        const param = f.param as string;
        return (
          <label key={param} className="flex flex-col gap-1 text-xs text-ink-500">
            {f.label}
            <select
              value={searchParams.get(param) ?? ""}
              onChange={(e) => update(param, e.target.value)}
              className="rounded border border-ink-200 bg-white px-2 py-1.5 text-sm text-ink-900"
            >
              <option value="">—</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        );
      })}

      {hasActive && (
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="pb-1.5 text-sm text-brand-700 underline hover:text-brand-900"
        >
          {clearLabel}
        </button>
      )}

      <span className="ml-auto self-end pb-1.5 text-sm text-ink-500">{resultsLabel}</span>
    </div>
  );
}
