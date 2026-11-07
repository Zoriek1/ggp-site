import type { Lang } from "@/i18n/config";
import { tField, tMissing } from "@/i18n/dictionaries";
import { Container } from "@/components/Container";
import { PortableBody } from "@/components/PortableBody";
import { TranslationNotice } from "@/components/TranslationNotice";
import { Hreflang } from "@/components/Hreflang";
import { sanityFetch } from "@/lib/sanity/client";
import { pageByKindQuery } from "@/lib/sanity/queries";
import type { Page } from "@/lib/sanity/types";
import { segmentFor } from "@/i18n/routes";

export async function AboutPage({ lang }: { lang: Lang }) {
  const page = await sanityFetch<Page | null>(
    pageByKindQuery,
    { kind: "about" },
    { tags: ["page"] },
  );

  const title = tField(page?.title, lang) || (lang === "en" ? "About" : "Sobre");
  const body = page?.body?.[lang];
  const missing = !!page?.body && tMissing(
    { pt: page.body.pt ? "x" : null, en: page.body.en ? "x" : null },
    lang,
  );

  return (
    <>
      <Hreflang paths={{ pt: `/${segmentFor("about", "pt")}`, en: `/${segmentFor("about", "en")}` }} />
      <Container className="py-12 max-w-3xl">
        <h1 className="font-serif text-4xl text-ink-900">{title}</h1>
        <div className="mt-6">
          <TranslationNotice lang={lang} show={missing} />
          {body ? (
            <PortableBody value={body} />
          ) : (
            <p className="text-ink-500">
              {lang === "en"
                ? "Content coming soon."
                : "Conteúdo em breve."}
            </p>
          )}
        </div>
      </Container>
    </>
  );
}
