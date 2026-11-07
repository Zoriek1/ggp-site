import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang } from "@/i18n/config";
import { Home } from "@/features/portal/Portal";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    title:
      lang === "en"
        ? "GGP · Research and shared knowledge"
        : "GGP · Pesquisa e conhecimento compartilhado",
    alternates: {
      canonical: `/${lang}`,
      languages: { "pt-BR": "/pt", en: "/en" },
    },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <Home lang={lang} />;
}
