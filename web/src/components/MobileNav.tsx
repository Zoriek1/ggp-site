"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type MobileNavItem = { href: string; label: string };

type Props = {
  items: MobileNavItem[];
  openLabel: string;
  closeLabel: string;
  menuLabel: string;
  /** Slot opcional (ex.: busca) exibido no topo do painel nas telas menores. */
  children?: ReactNode;
};

/**
 * Navegação mobile (< md): botão hambúrguer que abre um painel acessível.
 * Fecha com Esc, ao navegar, ou clicando fora. Trava o scroll do body aberto.
 */
export function MobileNav({ items, openLabel, closeLabel, menuLabel, children }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Fecha ao trocar de rota.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Esc fecha; trava scroll; foca o primeiro item ao abrir.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstLinkRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? closeLabel : openLabel}
        className="grid h-10 w-10 place-items-center rounded text-ink-700 hover:bg-ink-100 hover:text-ink-900"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-[var(--header-h,4rem)] z-40 bg-ink-900/30"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={panelRef}
            id="mobile-nav-panel"
            role="dialog"
            aria-modal="true"
            aria-label={menuLabel}
            className="fixed inset-x-0 top-[var(--header-h,4rem)] z-50 max-h-[calc(100dvh-var(--header-h,4rem))] overflow-y-auto border-b border-ink-100 bg-surface shadow-lg"
          >
            {children && (
              <div className="container-x border-b border-ink-100 py-3 sm:hidden">{children}</div>
            )}
            <nav className="container-x flex flex-col py-2">
              {items.map((item, i) => (
                <Link
                  key={item.href}
                  ref={i === 0 ? firstLinkRef : undefined}
                  href={item.href}
                  className="border-b border-ink-100 py-3 text-ink-900 no-underline last:border-b-0 hover:text-brand-700"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
