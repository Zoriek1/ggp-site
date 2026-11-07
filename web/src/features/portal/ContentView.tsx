import Link from "next/link";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { MarkdownBody } from "@/components/MarkdownBody";
import { JsonLd } from "@/components/JsonLd";
import { TranslationNotice } from "@/components/TranslationNotice";
import { field, type ContentRecord, type Lang } from "@/lib/content/model";
import { guideItems, recordSection } from "@/lib/content/query";
import { contentHref, localizedHref } from "@/i18n/routes";
import { itemJsonLd } from "./metadata";
import { sectionNames, kindNames } from "./copy";
export function ContentGrid({
  records,
  lang,
  empty,
}: {
  records: ContentRecord[];
  lang: Lang;
  empty?: string;
}) {
  if (!records.length)
    return (
      <div className="empty-state">
        <p>
          {empty ||
            (lang === "pt"
              ? "Ainda não há conteúdos publicados nesta seleção."
              : "No published content in this selection yet.")}
        </p>
      </div>
    );
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {records.map((record) => (
        <li key={`${record.collection}/${record.id}`}>
          <Card
            href={contentHref(record, lang)}
            title={field(record.title, lang)}
            description={field(record.summary, lang)}
            subtitle={
              record.collection === "items"
                ? kindNames[lang][record.kind]
                : undefined
            }
            meta={
              record.collection === "items"
                ? [record.year || "", record.authors.join(", ")]
                    .filter(Boolean)
                    .join(" · ")
                : record.institution || undefined
            }
          />
        </li>
      ))}
    </ul>
  );
}
export function RecordView({
  record,
  lang,
  records,
  preview = false,
}: {
  record: ContentRecord;
  lang: Lang;
  records: ContentRecord[];
  preview?: boolean;
}) {
  const related =
    record.collection === "guides"
      ? guideItems(record, records)
      : records.filter(
          (r) =>
            r.collection === "items" &&
            (record.collection === "pgps"
              ? r.pgpIds.includes(record.id)
              : record.collection === "areas"
                ? r.areaIds.includes(record.id)
                : record.collection === "keywords"
                  ? r.keywordIds.includes(record.id)
                  : false),
        );
  const section = recordSection(record);
  const showRelated = ["guides", "pgps", "areas", "keywords"].includes(
    record.collection,
  );
  return (
    <Container className="py-12">
      <div className="mx-auto max-w-3xl">
        <Link href={localizedHref(section, lang)} className="text-sm">
          ← {sectionNames[lang][section]}
        </Link>
        <h1 className="mt-6 font-serif text-4xl leading-tight sm:text-5xl">
          {field(record.title, lang)}
        </h1>
        {record.collection === "items" && (
          <p className="mt-4 text-sm text-ink-700">
            {[kindNames[lang][record.kind], record.year || "", record.venue]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
        {record.authors.length > 0 && (
          <p className="mt-3 text-ink-700">{record.authors.join(", ")}</p>
        )}
        {record.institution && (
          <p className="mt-3 text-ink-700">{record.institution}</p>
        )}
        <TranslationNotice
          lang={lang}
          show={
            lang === "en" &&
            (!record.title.en || (!!record.body.pt && !record.body.en))
          }
        />
        {field(record.summary, lang) && (
          <p className="mt-7 text-lg leading-relaxed text-ink-700">
            {field(record.summary, lang)}
          </p>
        )}
        <div className="mt-9">
          <MarkdownBody value={field(record.body, lang)} />
        </div>
        {(record.attachments.length > 0 ||
          record.externalUrl ||
          record.doi) && (
          <section className="mt-9 border-t border-ink-200 pt-6">
            <h2 className="mb-4 font-serif text-2xl">
              {lang === "pt"
                ? "Arquivos e referências"
                : "Files and references"}
            </h2>
            <ul className="space-y-4">
              {record.attachments.map((a, i) => (
                <li key={`${a.url}-${i}`}>
                  {a.type === "image" ? (
                    <figure>
                      <img
                        src={a.url}
                        alt={a.alt}
                        className="h-auto max-w-full rounded-lg"
                        loading="lazy"
                      />
                      <figcaption className="mt-2 text-sm text-ink-700">
                        {a.label}
                      </figcaption>
                    </figure>
                  ) : (
                    <a href={a.url} rel="noopener noreferrer">
                      {a.label ||
                        (lang === "pt" ? "Abrir arquivo" : "Open file")}{" "}
                      ↗
                    </a>
                  )}
                </li>
              ))}
              {record.externalUrl && (
                <li>
                  <a href={record.externalUrl} rel="noopener noreferrer">
                    {lang === "pt"
                      ? "Abrir referência externa"
                      : "Open external reference"}{" "}
                    ↗
                  </a>
                </li>
              )}
              {record.doi && (
                <li>
                  <a href={`https://doi.org/${record.doi}`}>
                    DOI: {record.doi}
                  </a>
                </li>
              )}
            </ul>
          </section>
        )}
        {record.contactEmail && (
          <p className="mt-6">
            <a href={`mailto:${record.contactEmail}`}>{record.contactEmail}</a>
          </p>
        )}
        {record.links.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-4">
            {record.links.map((link) => (
              <li key={link.url}>
                <a href={link.url} rel="noreferrer">
                  {link.label} ↗
                </a>
              </li>
            ))}
          </ul>
        )}
        {(
          [
            [record.pgpIds, "pgps", "PGPs"],
            [record.areaIds, "areas", sectionNames[lang].areas],
            [record.keywordIds, "keywords", sectionNames[lang].keywords],
          ] as const
        ).map(
          ([ids, collection, label]) =>
            ids.length > 0 && (
              <div key={collection} className="mt-7">
                <h2 className="text-sm font-semibold">{label}</h2>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {ids.map((id) => {
                    const linked = records.find(
                      (r) => r.collection === collection && r.id === id,
                    );
                    return linked ? (
                      <li key={id}>
                        <Link
                          href={contentHref(linked, lang)}
                          className="inline-block rounded-md bg-brand-50 px-3 py-2 text-sm"
                        >
                          {field(linked.title, lang)}
                        </Link>
                      </li>
                    ) : null;
                  })}
                </ul>
              </div>
            ),
        )}
      </div>
      {showRelated && (
        <section className="mt-14 border-t border-ink-200 pt-9">
          <h2 className="mb-6 font-serif text-3xl">
            {record.collection === "guides"
              ? lang === "pt"
                ? "Leituras deste guia"
                : "Readings in this guide"
              : lang === "pt"
                ? "Conteúdos relacionados"
                : "Related content"}
          </h2>
          <ContentGrid records={related} lang={lang} />
        </section>
      )}
      {!preview && record.collection === "items" && (
        <JsonLd data={itemJsonLd(record, lang)} />
      )}
    </Container>
  );
}
