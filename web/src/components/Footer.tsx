import Link from "next/link";
import { Container } from "./Container";
import { localizedHref } from "@/i18n/routes";
import { field, type Lang } from "@/lib/content/model";
import { getPublicContent } from "@/lib/server/store";

export async function Footer({ lang }: { lang: Lang }) {
  const settings = (await getPublicContent()).find(
    (r) => r.collection === "settings",
  );
  return (
    <footer className="mt-20 border-t border-ink-200">
      <Container className="flex flex-wrap items-start justify-between gap-6 py-10 text-sm">
        <div>
          <p className="font-serif text-lg">
            {settings ? field(settings.title, lang) : "GGP"}
          </p>
          <p className="mt-2 text-ink-700">
            © {new Date().getFullYear()} · Universidade Federal de Goiás
          </p>
        </div>
        <nav className="flex flex-wrap gap-5">
          <Link href={localizedHref("about", lang)}>
            {lang === "pt" ? "Sobre" : "About"}
          </Link>
          <Link href={localizedHref("contact", lang)}>
            {lang === "pt" ? "Contato" : "Contact"}
          </Link>
          <Link href="/admin">
            {lang === "pt" ? "Painel de publicação" : "Publishing dashboard"}
          </Link>
          {settings?.links.map((link) => (
            <a key={link.url} href={link.url} rel="noreferrer">
              {link.label}
            </a>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
