import Link from "next/link";
import { Container } from "./Container";
import { LangSwitch } from "./LangSwitch";
import { ThemeToggle } from "./ThemeToggle";
import { MobileNav } from "./MobileNav";
import { localizedHref, type RouteKey } from "@/i18n/routes";
import { field, type Lang } from "@/lib/content/model";
import { getPublicContent } from "@/lib/server/store";

const labels = {
  pt: {
    publications: "Acervo",
    blog: "Blog",
    guides: "Guias",
    pgps: "PGPs",
    about: "Sobre",
  },
  en: {
    publications: "Library",
    blog: "Blog",
    guides: "Guides",
    pgps: "PGPs",
    about: "About",
  },
};
export async function Header({ lang }: { lang: Lang }) {
  const settings = (await getPublicContent()).find(
    (r) => r.collection === "settings",
  );
  const items = Object.entries(labels[lang]).map(([key, label]) => ({
    label,
    href: localizedHref(key as RouteKey, lang),
  }));
  return (
    <header className="border-b border-ink-200 bg-surface">
      <Container className="flex min-h-20 items-center justify-between gap-4 py-3">
        <Link
          href={`/${lang}`}
          className="brand-lockup text-ink-900 no-underline"
        >
          <span className="font-serif text-3xl font-semibold">
            GGP<span className="text-brand-700">.</span>
          </span>
          <span className="hidden max-w-40 text-xs leading-relaxed text-ink-700 lg:block">
            {settings
              ? field(settings.title, lang)
              : "Grande Grupo de Pesquisa"}
          </span>
        </Link>
        <nav
          className="hidden items-center gap-6 text-sm md:flex"
          aria-label={lang === "pt" ? "Navegação principal" : "Main navigation"}
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-ink-700 no-underline hover:text-brand-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href={localizedHref("search", lang)}
            className="hidden text-sm text-ink-700 sm:block"
          >
            {lang === "pt" ? "Buscar" : "Search"}
          </Link>
          <LangSwitch currentLang={lang} />
          <ThemeToggle
            label={lang === "pt" ? "Alternar tema" : "Toggle theme"}
          />
          <MobileNav
            items={[
              ...items,
              {
                label: lang === "pt" ? "Buscar" : "Search",
                href: localizedHref("search", lang),
              },
            ]}
            openLabel={lang === "pt" ? "Abrir menu" : "Open menu"}
            closeLabel={lang === "pt" ? "Fechar menu" : "Close menu"}
            menuLabel="Menu"
          />
        </div>
      </Container>
    </header>
  );
}
