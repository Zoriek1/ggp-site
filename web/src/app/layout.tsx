import type { ReactNode } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter, Source_Serif_4 } from "next/font/google";
import { HREFLANG, isLang, DEFAULT_LOCALE } from "@/i18n/config";
import "./globals.css";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "GGP — Ensino de Física · UFG",
    template: "%s · GGP",
  },
  description:
    "Repositório acadêmico do GGP: publicações, teses, materiais didáticos, mídia e eventos em Ensino de Física na Universidade Federal de Goiás.",
  openGraph: {
    type: "website",
    siteName: "GGP",
    title: "GGP — Ensino de Física · UFG",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // O middleware injeta `x-lang` com o idioma resolvido da URL.
  // Só o layout raiz pode renderizar <html>, então lemos o idioma daqui.
  const headerLang = (await headers()).get("x-lang") ?? undefined;
  const lang = isLang(headerLang) ? headerLang : DEFAULT_LOCALE;

  return (
    <html lang={HREFLANG[lang]} className={`${inter.variable} ${sourceSerif.variable}`}>
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
