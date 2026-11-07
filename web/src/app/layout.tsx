import type { ReactNode } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { permanentRedirect } from "next/navigation";
import { Inter, Source_Serif_4 } from "next/font/google";
import { HREFLANG, isLang, DEFAULT_LOCALE } from "@/i18n/config";
import "./globals.css";
import { env } from "@/lib/env";
import { canonicalAddress, detailAddress } from "@/lib/content/address";
import { getPublicContent } from "@/lib/server/store";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: "GGP — Ensino de Física · UFG",
    template: "%s · GGP",
  },
  description:
    "Portal do GGP e seus PGPs: acervo, blog, comunicados e guias de estudo.",
  openGraph: {
    type: "website",
    siteName: "GGP",
    title: "GGP — Ensino de Física · UFG",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // O middleware injeta `x-lang` com o idioma resolvido da URL.
  // Só o layout raiz pode renderizar <html>, então lemos o idioma daqui.
  const requestHeaders = await headers();
  const headerLang = requestHeaders.get("x-lang") ?? undefined;
  const lang = isLang(headerLang) ? headerLang : DEFAULT_LOCALE;
  // Resolve historical addresses before any HTML streams, preserving HTTP 308.
  const pathname = requestHeaders.get("x-pathname") || "";
  if (detailAddress(pathname)) {
    const canonical = canonicalAddress(pathname, await getPublicContent());
    if (canonical && canonical !== pathname) permanentRedirect(canonical);
  }

  return (
    <html
      lang={HREFLANG[lang]}
      className={`${inter.variable} ${sourceSerif.variable}`}
    >
      <head>
        {/* Aplica o tema salvo antes da pintura para evitar flash (FOUC). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t);}catch(e){}`,
          }}
        />
      </head>
      <body>
        <a href="#main" className="skip-link">
          {lang === "en" ? "Skip to content" : "Pular para o conteúdo"}
        </a>
        {children}
      </body>
    </html>
  );
}
