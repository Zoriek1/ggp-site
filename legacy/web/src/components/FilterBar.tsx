"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Facet } from "@/lib/discovery/filters";

type Props = {
  facets: Facet[];
  clearLabel: string;
  resultsLabel: string;
  filterByLabel: string;
  selectPlaceholder: string;
};

/**
 * Barra de filtros dirigida por URL. Em cada mudança, reescreve a querystring
 * (resetando `page`) e navega — o server component re-renderiza com os novos filtros.
 */
export function FilterBar({
  facets,
  clearLabel,
  resultsLabel,
  filterByLabel,
  selectPlaceholder,
}: Props) {
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
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
      {/* Grupo de filtros */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-ink-100 bg-surface p-2">
        <span className="flex items-center gap-1.5 px-1 text-sm font-medium text-ink-700">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 5h18M6 12h12M10 19h4" strokeLinecap="round" />
          </svg>
          {filterByLabel}
        </span>
        {facets.map((f) => {
          const param = f.param as string;
          const active = !!searchParams.get(param);
          return (
            <select
              key={param}
              aria-label={f.label}
              value={searchParams.get(param) ?? ""}
              onChange={(e) => update(param, e.target.value)}
              className={`rounded-md border px-2.5 py-1.5 text-sm transition ${
                active
                  ? "border-brand-500/50 bg-brand-50 text-brand-900"
                  : "border-ink-200 bg-surface text-ink-900 hover:border-ink-300"
              }`}
            >
              <option value="">{f.label}: {selectPlaceholder}</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          );
        })}

        {hasActive && (
          <button
            type="button"
            onClick={() => router.push(pathname)}
            className="px-2 text-sm font-medium text-brand-700 hover:text-brand-900"
          >
            {clearLabel}
          </button>
        )}
      </div>

      <span className="text-sm text-ink-500">{resultsLabel}</span>
    </div>
  );
}
