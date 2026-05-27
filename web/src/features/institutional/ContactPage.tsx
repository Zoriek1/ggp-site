import type { Lang } from "@/i18n/config";
import { tField } from "@/i18n/dictionaries";
import { Container } from "@/components/Container";
import { PortableBody } from "@/components/PortableBody";
import { Hreflang } from "@/components/Hreflang";
import { sanityFetch } from "@/lib/sanity/client";
import { pageByKindQuery, siteSettingsQuery } from "@/lib/sanity/queries";
import type { Page, SiteSettings } from "@/lib/sanity/types";
import { segmentFor } from "@/i18n/routes";

export async function ContactPage({ lang }: { lang: Lang }) {
  const [page, settings] = await Promise.all([
    sanityFetch<Page | null>(pageByKindQuery, { kind: "contact" }, { tags: ["page"] }),
    sanityFetch<SiteSettings | null>(siteSettingsQuery, {}, { tags: ["siteSettings"] }),
  ]);

  const title = tField(page?.title, lang) || (lang === "en" ? "Contact" : "Contato");
  const body = page?.body?.[lang];

  return (
    <>
      <Hreflang
        paths={{ pt: `/${segmentFor("contact", "pt")}`, en: `/${segmentFor("contact", "en")}` }}
      />
      <Container className="py-12 max-w-3xl">
        <h1 className="font-serif text-4xl text-ink-900">{title}</h1>

        {body ? (
          <div className="mt-6">
            <PortableBody value={body} />
          </div>
        ) : null}

        <dl className="mt-8 space-y-4 text-sm">
          {settings?.contactEmail && (
            <div>
              <dt className="text-ink-500">{lang === "en" ? "Email" : "Email"}</dt>
              <dd>
                <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
              </dd>
            </div>
          )}
          {settings?.organization?.address && (
            <div>
              <dt className="text-ink-500">{lang === "en" ? "Address" : "Endereço"}</dt>
              <dd className="whitespace-pre-line">{settings.organization.address}</dd>
            </div>
          )}
          {settings?.social?.instagram && (
            <div>
              <dt className="text-ink-500">Instagram</dt>
              <dd>
                <a href={settings.social.instagram} target="_blank" rel="noreferrer">
                  {settings.social.instagram}
                </a>
              </dd>
            </div>
          )}
        </dl>
      </Container>
    </>
  );
}
