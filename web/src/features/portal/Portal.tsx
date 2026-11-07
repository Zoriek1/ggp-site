import { cache } from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { MarkdownBody } from "@/components/MarkdownBody";
import { JsonLd } from "@/components/JsonLd";
import { TranslationNotice } from "@/components/TranslationNotice";
import { field, type ContentRecord, type Lang } from "@/lib/content/model";
import { queryRecords, guideItems, recordSection } from "@/lib/content/query";
import { getPublicContent } from "@/lib/server/store";
import { contentHref, localizedHref, type RouteKey } from "@/i18n/routes";
import { itemJsonLd } from "./metadata";

export const loadPortal = cache(getPublicContent);
export const sectionNames: Record<Lang, Record<RouteKey, string>> = {
  pt: {
    publications: "Acervo",
    blog: "Blog e comunicados",
    pgps: "Pequenos Grupos de Pesquisa",
    guides: "Guias de estudo",
    areas: "Áreas do conhecimento",
    keywords: "Palavras-chave",
    about: "Sobre o GGP",
    contact: "Contato",
    search: "Buscar no portal",
    pages: "Páginas",
  },
  en: {
    publications: "Library",
    blog: "Blog and announcements",
    pgps: "Small Research Groups",
    guides: "Study guides",
    areas: "Knowledge areas",
    keywords: "Keywords",
    about: "About GGP",
    contact: "Contact",
    search: "Search the portal",
    pages: "Pages",
  },
};
export const kindNames = {
  pt: {
    article: "Artigo",
    text: "Texto",
    material: "Material",
    post: "Blog",
    notice: "Comunicado",
  },
  en: {
    article: "Article",
    text: "Text",
    material: "Resource",
    post: "Blog",
    notice: "Announcement",
  },
};

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
function Block({
  title,
  href,
  children,
  lang,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
  lang: Lang;
}) {
  return (
    <section className="mt-16">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-serif text-3xl">{title}</h2>
        <Link href={href} className="text-sm">
          {lang === "pt" ? "Ver todos" : "View all"}{" "}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
      {children}
    </section>
  );
}
export async function Home({ lang }: { lang: Lang }) {
  const records = await loadPortal(),
    settings = records.find((r) => r.collection === "settings");
  const items = queryRecords(records.filter((r) => r.collection === "items"));
  const featured = [
    ...items.filter((r) => r.featured),
    ...items.filter((r) => !r.featured),
  ].slice(0, 6);
  const guides = records.filter((r) => r.collection === "guides").slice(0, 3);
  const pgps = records.filter((r) => r.collection === "pgps");
  return (
    <>
      <section className="hero-band text-white">
        <Container className="py-16 sm:py-24">
          <h1 className="max-w-4xl font-serif text-4xl font-semibold leading-tight sm:text-6xl">
            {settings
              ? field(settings.title, lang)
              : "Grande Grupo de Pesquisa"}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/90">
            {settings
              ? field(settings.summary, lang)
              : lang === "pt"
                ? "Pesquisa, formação e conhecimento compartilhado entre universidade e escola."
                : "Research, education and knowledge shared between university and school."}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href={localizedHref("publications", lang)}
              className="hero-primary-link rounded-md bg-white px-5 py-3 font-medium text-blue-950 no-underline"
            >
              {lang === "pt" ? "Explorar o acervo" : "Explore the library"}
            </Link>
            <Link
              href={localizedHref("guides", lang)}
              className="hero-secondary-link rounded-md border border-white/50 px-5 py-3 text-white no-underline"
            >
              {sectionNames[lang].guides}
            </Link>
          </div>
        </Container>
      </section>
      <Container className="pb-4">
        <div className="portal-intro pt-12">
          <MarkdownBody value={settings ? field(settings.body, lang) : ""} />
        </div>
        <Block
          title={
            lang === "pt" ? "Conhecimento em circulação" : "Shared knowledge"
          }
          href={localizedHref("publications", lang)}
          lang={lang}
        >
          <ContentGrid
            records={featured}
            lang={lang}
            empty={
              lang === "pt"
                ? "O acervo está em preparação. As primeiras leituras aparecerão aqui após a publicação."
                : "The library is being prepared. Published readings will appear here."
            }
          />
        </Block>
        <Block
          title={sectionNames[lang].guides}
          href={localizedHref("guides", lang)}
          lang={lang}
        >
          <ContentGrid records={guides} lang={lang} />
        </Block>
        <Block
          title={sectionNames[lang].pgps}
          href={localizedHref("pgps", lang)}
          lang={lang}
        >
          <div className="divide-y divide-ink-200 border-y border-ink-200">
            {pgps.slice(0, 8).map((pgp) => (
              <Link
                key={pgp.id}
                href={contentHref(pgp, lang)}
                className="flex items-center justify-between gap-4 py-4 text-ink-900 no-underline"
              >
                <span className="font-serif text-xl">
                  {field(pgp.title, lang)}
                </span>
                <span aria-hidden="true" className="text-brand-700">
                  →
                </span>
              </Link>
            ))}
          </div>
        </Block>
      </Container>
    </>
  );
}

export type SearchParams = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] || "" : value || "";
export function sectionRecords(
  records: ContentRecord[],
  section: RouteKey,
): ContentRecord[] {
  return records.filter(
    (r) => recordSection(r) === section && r.collection !== "settings",
  );
}
export async function Listing({
  lang,
  section,
  params,
}: {
  lang: Lang;
  section: RouteKey;
  params: SearchParams;
}) {
  const records = await loadPortal();
  const searchable = ["publications", "blog", "search"].includes(section);
  const pool =
    section === "search"
      ? records.filter((r) => r.collection !== "settings")
      : sectionRecords(records, section);
  const filters = {
    q: one(params.q),
    area: one(params.area),
    keyword: one(params.keyword) || one(params.topic) || one(params.tag),
    pgp: one(params.pgp),
    year: one(params.year),
    kind: one(params.kind),
  };
  // Accept old taxonomy slugs as well as stable IDs in existing filter links.
  for (const [key, collection] of [
    ["area", "areas"],
    ["keyword", "keywords"],
    ["pgp", "pgps"],
  ] as const) {
    const value = filters[key];
    const record = records.find(
      (r) =>
        r.collection === collection &&
        [r.id, r.slug.pt, r.slug.en].includes(value),
    );
    if (record) filters[key] = record.id;
  }
  const results = queryRecords(pool, filters),
    pages = Math.max(1, Math.ceil(results.length / 12));
  const page = Math.min(
    pages,
    Math.max(1, Number.parseInt(one(params.page), 10) || 1),
  );
  const linkToPage = (p: number) =>
    localizedHref(section, lang, undefined, {
      ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
      page: p,
    });
  return (
    <Container className="py-12">
      <div className="mb-8 max-w-3xl">
        <h1 className="font-serif text-4xl sm:text-5xl">
          {sectionNames[lang][section]}
        </h1>
        <p className="mt-4 text-ink-700">
          {section === "guides"
            ? lang === "pt"
              ? "Percursos de leitura que conectam materiais de todos os grupos por assunto."
              : "Reading paths connecting resources from all groups by subject."
            : section === "pgps"
              ? lang === "pt"
                ? "Escolas, projetos e grupos que constroem o GGP."
                : "Schools, projects and groups that build GGP."
              : lang === "pt"
                ? "Explore os conteúdos compartilhados pelo GGP e seus PGPs."
                : "Explore content shared by GGP and its groups."}
        </p>
      </div>
      <form className="public-filters mb-7" method="get">
        <label className="grow">
          <span>{lang === "pt" ? "Buscar" : "Search"}</span>
          <input
            name="q"
            defaultValue={filters.q}
            placeholder={
              lang === "pt"
                ? "Título, assunto ou autor"
                : "Title, topic or author"
            }
          />
        </label>
        {searchable && (
          <>
            {(
              [
                ["area", "areas", lang === "pt" ? "Área" : "Area"],
                ["pgp", "pgps", "PGP"],
                [
                  "keyword",
                  "keywords",
                  lang === "pt" ? "Palavra-chave" : "Keyword",
                ],
              ] as const
            ).map(([name, collection, label]) => (
              <label key={name}>
                <span>{label}</span>
                <select name={name} defaultValue={filters[name]}>
                  <option value="">{lang === "pt" ? "Todas" : "All"}</option>
                  {records
                    .filter((r) => r.collection === collection)
                    .sort((a, b) =>
                      field(a.title, lang).localeCompare(field(b.title, lang)),
                    )
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {field(r.title, lang)}
                      </option>
                    ))}
                </select>
              </label>
            ))}
            <label>
              <span>{lang === "pt" ? "Ano" : "Year"}</span>
              <input
                type="number"
                name="year"
                min="1800"
                max="2200"
                defaultValue={filters.year}
              />
            </label>
            <label>
              <span>{lang === "pt" ? "Tipo" : "Type"}</span>
              <select name="kind" defaultValue={filters.kind}>
                <option value="">{lang === "pt" ? "Todos" : "All"}</option>
                {Object.entries(kindNames[lang]).map(([kind, label]) => (
                  <option value={kind} key={kind}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
        <button className="button-primary" type="submit">
          {lang === "pt" ? "Filtrar" : "Filter"}
        </button>
        <Link
          href={localizedHref(section, lang)}
          className="self-end py-3 text-sm"
        >
          {lang === "pt" ? "Limpar" : "Clear"}
        </Link>
      </form>
      <p className="mb-5 text-sm text-ink-700" aria-live="polite">
        {results.length} {lang === "pt" ? "resultado(s)" : "result(s)"}
      </p>
      <ContentGrid
        records={results.slice((page - 1) * 12, page * 12)}
        lang={lang}
      />
      {pages > 1 && (
        <nav
          className="mt-8 flex items-center justify-center gap-5"
          aria-label={lang === "pt" ? "Paginação" : "Pagination"}
        >
          {page > 1 && (
            <Link href={linkToPage(page - 1)}>
              {lang === "pt" ? "Anterior" : "Previous"}
            </Link>
          )}
          <span>
            {page} / {pages}
          </span>
          {page < pages && (
            <Link href={linkToPage(page + 1)}>
              {lang === "pt" ? "Próxima" : "Next"}
            </Link>
          )}
        </nav>
      )}
    </Container>
  );
}

export async function Detail({
  record,
  lang,
}: {
  record: ContentRecord;
  lang: Lang;
}) {
  const records = await loadPortal();
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
      {record.collection === "items" && (
        <JsonLd data={itemJsonLd(record, lang)} />
      )}
    </Container>
  );
}
