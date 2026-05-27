import { env } from "@/lib/env";
import { HREFLANG, LOCALES, type Lang } from "@/i18n/config";

/**
 * Renderiza <link rel="alternate" hreflang="...">.
 * `paths` é o caminho equivalente em cada idioma, sem o prefixo do idioma.
 * Ex.: { pt: "/publicacoes/abc", en: "/publications/abc" }
 */
export function Hreflang({ paths }: { paths: Record<Lang, string> }) {
  const base = env.siteUrl.replace(/\/$/, "");
  return (
    <>
      {LOCALES.map((l) => (
        <link
          key={l}
          rel="alternate"
          hrefLang={HREFLANG[l]}
          href={`${base}/${l}${paths[l].startsWith("/") ? paths[l] : `/${paths[l]}`}`}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${base}/pt${paths.pt}`} />
    </>
  );
}
