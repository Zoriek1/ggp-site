import Link from "next/link";
import type { Lang } from "@/i18n/config";
import { getDictionary, tField } from "@/i18n/dictionaries";
import { localizedHref } from "@/i18n/routes";
import { Container } from "./Container";
import { sanityFetch } from "@/lib/sanity/client";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import type { SiteSettings } from "@/lib/sanity/types";

export async function Footer({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const settings = await sanityFetch<SiteSettings | null>(siteSettingsQuery, {}, {
    tags: ["siteSettings"],
  });

  const siteName = tField(settings?.siteName, lang) || "GGP";
  const email = settings?.contactEmail;
  const ig = settings?.social?.instagram;

  return (
    <footer className="mt-16 border-t border-ink-100 bg-white">
      <Container className="py-10 text-sm text-ink-500 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} {siteName}. {dict.footer.rights}
        </p>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href={localizedHref("about", lang)} className="hover:text-ink-900">
            {dict.footer.about}
          </Link>
          <Link href={localizedHref("contact", lang)} className="hover:text-ink-900">
            {dict.footer.contact}
          </Link>
          {email && (
            <a href={`mailto:${email}`} className="hover:text-ink-900">
              {email}
            </a>
          )}
          {ig && (
            <a href={ig} target="_blank" rel="noreferrer" className="hover:text-ink-900">
              Instagram
            </a>
          )}
        </nav>
      </Container>
    </footer>
  );
}
