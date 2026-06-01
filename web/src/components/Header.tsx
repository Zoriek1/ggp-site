import Link from "next/link";
import Image from "next/image";
import type { Lang } from "@/i18n/config";
import { getDictionary, tField } from "@/i18n/dictionaries";
import { localizedHref, type RouteKey } from "@/i18n/routes";
import { Container } from "./Container";
import { LangSwitch } from "./LangSwitch";
import { SearchBox } from "./SearchBox";
import { MobileNav, type MobileNavItem } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";
import { sanityFetch } from "@/lib/sanity/client";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import { PRESETS } from "@/lib/sanity/image";
import type { SiteSettings } from "@/lib/sanity/types";

const NAV: RouteKey[] = [
  "about",
  "members",
  "pgps",
  "publications",
  "theses",
  "teachingMaterials",
  "media",
  "events",
];

export async function Header({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const settings = await sanityFetch<SiteSettings | null>(siteSettingsQuery, {}, {
    tags: ["siteSettings"],
  });

  const siteName = tField(settings?.siteName, lang) || "GGP";
  const tagline = tField(settings?.tagline, lang);
  const logoUrl = settings?.logo ? PRESETS.logo(settings.logo) : null;
  const logoDarkUrl = settings?.logoDark ? PRESETS.logo(settings.logoDark) : null;

  const mobileItems: MobileNavItem[] = NAV.map((key) => ({
    href: localizedHref(key, lang),
    label: dict.nav[key as keyof typeof dict.nav],
  }));

  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/75">
      <Container className="flex items-center justify-between py-4 gap-4 sm:gap-6">
        <Link href={`/${lang}`} className="flex items-center gap-3 no-underline">
          {logoUrl ? (
            <>
              <Image
                src={logoUrl}
                alt={siteName}
                width={48}
                height={48}
                className={`rounded ${logoDarkUrl ? "logo-light" : ""}`}
              />
              {logoDarkUrl && (
                <Image
                  src={logoDarkUrl}
                  alt={siteName}
                  width={48}
                  height={48}
                  className="rounded logo-dark"
                />
              )}
            </>
          ) : (
            <span className="grid h-10 w-10 place-items-center rounded bg-brand-button text-white font-serif">
              G
            </span>
          )}
          <span className="leading-tight">
            <span className="block font-serif text-lg text-ink-900">{siteName}</span>
            {tagline && <span className="hidden text-xs text-ink-500 sm:block">{tagline}</span>}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm" aria-label={dict.common.menu}>
          {NAV.map((key) => (
            <Link
              key={key}
              href={localizedHref(key, lang)}
              className="text-ink-700 hover:text-ink-900 no-underline"
            >
              {dict.nav[key as keyof typeof dict.nav]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <SearchBox
            lang={lang}
            placeholder={dict.common.searchPlaceholder}
            label={dict.common.search}
          />
          <LangSwitch currentLang={lang} />
          <ThemeToggle label={dict.common.toggleTheme} />
          <MobileNav
            items={mobileItems}
            openLabel={dict.common.openMenu}
            closeLabel={dict.common.closeMenu}
            menuLabel={dict.common.menu}
          >
            <SearchBox
              lang={lang}
              placeholder={dict.common.searchPlaceholder}
              label={dict.common.search}
              variant="block"
            />
          </MobileNav>
        </div>
      </Container>
    </header>
  );
}
