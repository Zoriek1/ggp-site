"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collections,
  createRecord,
  field,
  keyOf,
  slugify,
  type Collection,
  type ContentRecord,
  type Lang,
  type VersionedRecord,
} from "@/lib/content/model";
import { contentHref } from "@/i18n/routes";
import { MarkdownBody } from "@/components/MarkdownBody";
import { collectionLabels, singularLabels } from "./labels";

const MarkdownEditor = dynamic(() => import("./MarkdownEditor"), {
  ssr: false,
  loading: () => (
    <div className="editor-loading" role="status">
      Carregando editor…
    </div>
  ),
});
const kindLabels = {
  article: "Artigo",
  text: "Texto",
  material: "Material",
  post: "Post de blog",
  notice: "Comunicado",
};
type Payload = {
  entries: VersionedRecord[];
  published: ContentRecord[];
  driver: string;
};

export function Workspace({
  collection,
  editing,
}: {
  collection?: Collection;
  editing?: string;
}) {
  const [data, setData] = useState<Payload>(),
    [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState(""),
    [status, setStatus] = useState("all");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/records", { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error);
        setData(payload);
        setError("");
      })
      .catch((error) => {
        if (error.name !== "AbortError")
          setError(error.message || "Não foi possível carregar o acervo.");
      });
    return () => controller.abort();
  }, [attempt]);
  if (!data)
    return error ? (
      <div role="alert" className="form-error">
        <p>{error}</p>
        <button
          type="button"
          className="button-secondary mt-4"
          onClick={() => setAttempt((v) => v + 1)}
        >
          Tentar carregar novamente
        </button>
      </div>
    ) : (
      <p role="status" className="py-12 text-ink-700">
        Carregando o acervo…
      </p>
    );
  if (editing && collection) {
    const entry =
      editing === "new"
        ? undefined
        : data.entries.find(
            (e) =>
              e.record.collection === collection && e.record.id === editing,
          );
    if (editing !== "new" && !entry)
      return (
        <div>
          <h1 className="font-serif text-3xl">Registro não encontrado</h1>
          <Link href="/admin" className="mt-5 inline-block">
            Voltar ao acervo
          </Link>
        </div>
      );
    return (
      <RecordEditor
        key={`${collection}/${editing}`}
        entry={entry}
        collection={collection}
        data={data}
        onSaved={(entry) =>
          setData((old) =>
            old
              ? {
                  ...old,
                  entries: [
                    ...old.entries.filter(
                      (e) => keyOf(e.record) !== keyOf(entry.record),
                    ),
                    entry,
                  ],
                }
              : old,
          )
        }
      />
    );
  }
  const matching = data.entries
    .filter(
      (e) =>
        (!collection || e.record.collection === collection) &&
        `${e.record.title.pt} ${e.record.title.en} ${e.record.authors.join(" ")}`
          .toLocaleLowerCase()
          .includes(query.toLocaleLowerCase()) &&
        (status === "all" ||
          (status === "published" && e.published && !e.record.archived) ||
          (status === "draft" && e.hasDraft && !e.record.archived) ||
          (status === "archived" && e.record.archived)),
    )
    .sort((a, b) => b.record.updatedAt.localeCompare(a.record.updatedAt));
  const singleton =
    collection === "settings"
      ? data.entries.find((e) => e.record.collection === "settings")
      : undefined;
  return (
    <>
      <div className="admin-title-row">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl">
            {collection ? collectionLabels[collection] : "Conteúdos do portal"}
          </h1>
          <p className="mt-3 max-w-2xl text-ink-700">
            {collection === "guides"
              ? "Conecte leituras por palavras-chave e escolha os materiais que merecem destaque."
              : "Escreva, organize e compartilhe conhecimento com o GGP e seus grupos."}
          </p>
        </div>
        <Link
          href={
            singleton
              ? `/admin/edit/settings/${singleton.record.id}`
              : `/admin/new/${collection || "items"}`
          }
          className="button-primary shrink-0"
        >
          {singleton
            ? "Editar configuração"
            : `Criar ${singularLabels[collection || "items"]}`}
        </Link>
      </div>
      {data.driver === "local" && (
        <p className="system-notice">
          Modo local: as alterações ficam neste ambiente e não são enviadas ao
          GitHub.
        </p>
      )}
      <div className="mt-8 flex flex-wrap items-end gap-4">
        <TextField
          label="Buscar registros"
          value={query}
          onChange={setQuery}
          placeholder="Título ou autor"
        />
        <label className="field">
          <span>Situação</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Todas</option>
            <option value="published">Publicados</option>
            <option value="draft">Com rascunho</option>
            <option value="archived">Arquivados</option>
          </select>
        </label>
        <p className="pb-3 text-sm text-ink-700">
          {matching.length} registro(s)
        </p>
      </div>
      <div className="record-table-wrap mt-6">
        <table className="record-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Seção</th>
              <th>Situação</th>
              <th>Atualização</th>
              <th>
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {matching.map(({ record, published, hasDraft }) => (
              <tr key={keyOf(record)}>
                <td>
                  <Link
                    href={`/admin/edit/${keyOf(record)}`}
                    className="font-medium text-ink-900"
                  >
                    {record.title.pt}
                  </Link>
                  {record.authors.length > 0 && (
                    <p className="mt-1 text-xs text-ink-700">
                      {record.authors.join(", ")}
                    </p>
                  )}
                </td>
                <td>{collectionLabels[record.collection]}</td>
                <td>
                  <span
                    className={`status-label ${published && !record.archived ? "status-published" : ""}`}
                  >
                    {record.archived
                      ? "Arquivado"
                      : published
                        ? hasDraft
                          ? "Publicado · com rascunho"
                          : "Publicado"
                        : "Rascunho"}
                  </span>
                </td>
                <td className="whitespace-nowrap text-ink-700">
                  {new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "short",
                  }).format(new Date(record.updatedAt))}
                </td>
                <td>
                  <Link href={`/admin/edit/${keyOf(record)}`}>Editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!matching.length && (
          <div className="empty-state">
            <p>Nenhum registro nesta seleção.</p>
            <p className="mt-2 text-sm">
              Crie um novo registro ou ajuste os filtros.
            </p>
          </div>
        )}
      </div>
      {!collection && (
        <div className="mt-9 flex flex-wrap gap-3">
          {collections
            .filter((c) => c !== "items")
            .map((c) => (
              <Link
                key={c}
                href={`/admin?collection=${c}`}
                className="button-secondary"
              >
                {collectionLabels[c]}
              </Link>
            ))}
        </div>
      )}
    </>
  );
}

function TextField({
  label,
  value,
  onChange,
  multiline,
  placeholder,
  type = "text",
  required = false,
  help,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  type?: string;
  required?: boolean;
  help?: string;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          id={id}
          aria-describedby={help ? `${id}-help` : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          required={required}
        />
      ) : (
        <input
          id={id}
          aria-describedby={help ? `${id}-help` : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type={type}
          required={required}
        />
      )}
      {help && (
        <small id={`${id}-help`} className="text-ink-700">
          {help}
        </small>
      )}
    </div>
  );
}
function References({
  label,
  records,
  selected,
  onChange,
}: {
  label: string;
  records: ContentRecord[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const options = records.filter((r) =>
    r.title.pt.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  return (
    <fieldset className="reference-field">
      <legend>{label}</legend>
      <input
        aria-label={`Buscar em ${label}`}
        value={query}
        placeholder="Filtrar opções"
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="reference-options">
        {options.map((record) => (
          <label key={record.id}>
            <input
              type="checkbox"
              checked={selected.includes(record.id)}
              onChange={(event) =>
                onChange(
                  event.target.checked
                    ? [...selected, record.id]
                    : selected.filter((id) => id !== record.id),
                )
              }
            />
            <span>
              {record.title.pt}
              {record.archived ? " (arquivado)" : ""}
            </span>
          </label>
        ))}
        {!options.length && (
          <p className="p-3 text-sm text-ink-700">Nenhuma opção publicada.</p>
        )}
      </div>
      <p className="mt-2 text-xs text-ink-700">
        {selected.length} selecionado(s). Cadastre novas opções na seção
        correspondente.
      </p>
    </fieldset>
  );
}

function RecordEditor({
  entry,
  collection,
  data,
  onSaved,
}: {
  entry?: VersionedRecord;
  collection: Collection;
  data: Payload;
  onSaved: (entry: VersionedRecord) => void;
}) {
  const router = useRouter();
  const [record, setRecord] = useState<ContentRecord>(
    () =>
      entry?.record || {
        ...createRecord(collection, `${collection}-${crypto.randomUUID()}`),
        title: { pt: "", en: "" },
      },
  );
  const [revision, setRevision] = useState(entry?.revision ?? null),
    [isPublished, setPublished] = useState(entry?.published || false);
  const [lang, setLang] = useState<Lang>("pt"),
    [preview, setPreview] = useState(false),
    [customSlug, setCustomSlug] = useState(!!entry);
  const [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (!dirty) return;
    const prevent = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", prevent);
    return () => window.removeEventListener("beforeunload", prevent);
  }, [dirty]);
  function update<K extends keyof ContentRecord>(
    key: K,
    value: ContentRecord[K],
  ) {
    setRecord((old) => ({ ...old, [key]: value }));
    setDirty(true);
    setMessage("");
  }
  const related = (c: Collection) =>
    data.published.filter(
      (r) =>
        r.collection === c &&
        (!r.archived ||
          [
            ...record.pgpIds,
            ...record.areaIds,
            ...record.keywordIds,
            ...record.selectedIds,
          ].includes(r.id)),
    );
  async function save(action: "draft" | "publish" | "unpublish" | "archive") {
    setBusy(action);
    setError("");
    setMessage("");
    const prepared = {
      ...record,
      authors: record.authors.map((a) => a.trim()).filter(Boolean),
      links: record.links.filter((l) => l.label || l.url),
      attachments: record.attachments.filter((a) => a.label || a.url),
    };
    try {
      const response = await fetch("/api/admin/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ record: prepared, revision, action }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      const saved: VersionedRecord = result.entry;
      setRecord(saved.record);
      setRevision(saved.revision);
      setPublished(saved.published);
      setDirty(false);
      onSaved(saved);
      const messages = {
        draft: "Rascunho salvo. A versão publicada permanece disponível.",
        publish: "Conteúdo publicado. Já está disponível no portal.",
        unpublish:
          "Publicação retirada. O conteúdo foi preservado como rascunho.",
        archive: "Registro arquivado.",
      };
      setMessage(
        `${messages[action]}${data.driver === "local" ? " Alteração feita somente no ambiente local." : " Alteração confirmada no Git."}`,
      );
      if (!entry) router.replace(`/admin/edit/${keyOf(saved.record)}`);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar. Seu texto continua no editor.",
      );
    } finally {
      setBusy("");
    }
  }
  async function upload(file: File) {
    setBusy("upload");
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: form,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      update("attachments", [
        ...record.attachments,
        { url: result.url, type: result.type, label: result.label, alt: "" },
      ]);
      setMessage(
        "Arquivo enviado. Salve o registro para guardar o vínculo com o conteúdo.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar o arquivo.",
      );
    } finally {
      setBusy("");
    }
  }
  function downloadCopy() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(record, null, 2)], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${record.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
  return (
    <>
      <Link href={`/admin?collection=${collection}`} className="text-sm">
        ← {collectionLabels[collection]}
      </Link>
      <div className="admin-title-row mt-5">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl">
            {entry
              ? `Editar ${singularLabels[collection]}`
              : `Criar ${singularLabels[collection]}`}
          </h1>
          <p className="mt-3 text-sm text-ink-700">
            {isPublished
              ? "Existe uma versão publicada deste registro."
              : "Este registro ainda não está publicado."}
            {dirty ? " Há alterações não salvas." : ""}
          </p>
        </div>
        {isPublished && (
          <a
            href={contentHref(record, "pt")}
            target="_blank"
            rel="noreferrer"
            className="button-secondary"
          >
            Ver publicação ↗
          </a>
        )}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void save("draft");
        }}
        className="editor-form"
      >
        <div className="editor-actions">
          <button type="submit" className="button-secondary" disabled={!!busy}>
            {busy === "draft" ? "Salvando…" : "Salvar rascunho"}
          </button>
          <button
            type="button"
            className="button-primary"
            disabled={!!busy}
            onClick={() => save("publish")}
          >
            {busy === "publish"
              ? "Publicando…"
              : record.archived
                ? "Republicar"
                : "Publicar"}
          </button>
          <button
            type="button"
            className="button-secondary"
            onClick={() => setPreview((v) => !v)}
          >
            {preview ? "Voltar ao editor" : "Pré-visualizar"}
          </button>
        </div>
        {error && (
          <div role="alert" className="form-error">
            <p>{error}</p>
            <p className="mt-2">
              Seu texto permanece no editor. Você pode baixar uma cópia antes de
              recarregar.
            </p>
            <button
              type="button"
              onClick={downloadCopy}
              className="mt-3 underline"
            >
              Baixar cópia das alterações
            </button>
          </div>
        )}
        {message && (
          <p role="status" className="form-success">
            {message}
          </p>
        )}
        {preview ? (
          <article className="preview-pane">
            <h2 className="font-serif text-3xl">
              {field(record.title, lang) || "Sem título"}
            </h2>
            <p className="my-4 text-ink-700">{record.authors.join(", ")}</p>
            <p className="mb-6">{field(record.summary, lang)}</p>
            <MarkdownBody value={field(record.body, lang)} />
            {record.attachments.map((asset, i) => (
              <p key={i} className="mt-4">
                <a href={asset.url}>{asset.label}</a>
              </p>
            ))}
          </article>
        ) : (
          <div className="editor-columns">
            <div className="space-y-7">
              <div
                className="language-tabs"
                role="group"
                aria-label="Idioma da edição"
              >
                <button
                  type="button"
                  aria-pressed={lang === "pt"}
                  onClick={() => setLang("pt")}
                >
                  Português
                </button>
                <button
                  type="button"
                  aria-pressed={lang === "en"}
                  onClick={() => setLang("en")}
                >
                  English · opcional
                </button>
              </div>
              <TextField
                label={
                  lang === "pt" ? "Título em português" : "Título em inglês"
                }
                value={record.title[lang]}
                required={lang === "pt"}
                onChange={(value) => {
                  update("title", { ...record.title, [lang]: value });
                  if (!customSlug)
                    update("slug", {
                      ...record.slug,
                      [lang]: value
                        ? slugify(value)
                        : lang === "en"
                          ? ""
                          : record.id,
                    });
                }}
              />
              <TextField
                label="Resumo ou apresentação"
                value={record.summary[lang]}
                onChange={(value) =>
                  update("summary", { ...record.summary, [lang]: value })
                }
                multiline
              />
              <div className="field">
                <span>Texto para leitura</span>
                <div className="markdown-editor">
                  <MarkdownEditor
                    key={lang}
                    value={record.body[lang]}
                    onChange={(value) =>
                      update("body", { ...record.body, [lang]: value })
                    }
                  />
                </div>
              </div>
              <details className="editor-details">
                <summary>Endereço da página e identificação</summary>
                <div className="mt-4 space-y-4">
                  <TextField
                    label={`Endereço (${lang.toUpperCase()})`}
                    value={record.slug[lang]}
                    onChange={(value) => {
                      setCustomSlug(true);
                      update("slug", { ...record.slug, [lang]: value });
                    }}
                    help="Use letras minúsculas, números e hífens. O ID permanece estável quando o endereço muda."
                  />
                  <p className="text-xs text-ink-700">ID: {record.id}</p>
                </div>
              </details>
              {collection === "items" && (
                <section className="editor-section">
                  <h2>Arquivos e referências</h2>
                  <p className="mb-4 text-sm text-ink-700">
                    Imagens JPEG, PNG e WebP ou PDFs de até 20 MB.
                  </p>
                  <label className="field">
                    <span>Enviar arquivo</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      disabled={!!busy}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void upload(file);
                        event.target.value = "";
                      }}
                    />
                  </label>
                  {busy === "upload" && <p role="status">Enviando arquivo…</p>}
                  {record.attachments.map((asset, i) => (
                    <div key={`${i}-${asset.url}`} className="attachment-row">
                      <TextField
                        label="Nome do arquivo ou link"
                        value={asset.label}
                        onChange={(value) =>
                          update(
                            "attachments",
                            record.attachments.map((a, index) =>
                              index === i ? { ...a, label: value } : a,
                            ),
                          )
                        }
                      />
                      <TextField
                        label="URL do arquivo"
                        value={asset.url}
                        onChange={(value) =>
                          update(
                            "attachments",
                            record.attachments.map((a, index) =>
                              index === i ? { ...a, url: value } : a,
                            ),
                          )
                        }
                      />
                      {asset.type === "image" && (
                        <TextField
                          label="Texto alternativo da imagem"
                          value={asset.alt}
                          required
                          onChange={(value) =>
                            update(
                              "attachments",
                              record.attachments.map((a, index) =>
                                index === i ? { ...a, alt: value } : a,
                              ),
                            )
                          }
                        />
                      )}
                      <button
                        type="button"
                        className="text-sm underline"
                        onClick={() =>
                          update(
                            "attachments",
                            record.attachments.filter(
                              (_, index) => index !== i,
                            ),
                          )
                        }
                      >
                        Remover vínculo do arquivo
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="button-secondary mt-4"
                    onClick={() =>
                      update("attachments", [
                        ...record.attachments,
                        { label: "", url: "", type: "link", alt: "" },
                      ])
                    }
                  >
                    Adicionar link de arquivo
                  </button>
                  <div className="mt-5">
                    <TextField
                      label="Referência externa"
                      value={record.externalUrl}
                      onChange={(value) => update("externalUrl", value)}
                      placeholder="https://…"
                    />
                  </div>
                </section>
              )}
              {["pgps", "pages", "settings"].includes(collection) && (
                <section className="editor-section">
                  <h2>Contato e links</h2>
                  <TextField
                    label="E-mail de contato"
                    value={record.contactEmail}
                    type="email"
                    onChange={(value) => update("contactEmail", value)}
                  />
                  {record.links.map((link, i) => (
                    <div className="attachment-row" key={i}>
                      <TextField
                        label="Nome do link"
                        value={link.label}
                        onChange={(value) =>
                          update(
                            "links",
                            record.links.map((l, index) =>
                              index === i ? { ...l, label: value } : l,
                            ),
                          )
                        }
                      />
                      <TextField
                        label="Endereço do link"
                        value={link.url}
                        onChange={(value) =>
                          update(
                            "links",
                            record.links.map((l, index) =>
                              index === i ? { ...l, url: value } : l,
                            ),
                          )
                        }
                      />
                      <button
                        type="button"
                        className="text-sm underline"
                        onClick={() =>
                          update(
                            "links",
                            record.links.filter((_, index) => index !== i),
                          )
                        }
                      >
                        Remover link
                      </button>
                    </div>
                  ))}
                  <button
                    className="button-secondary mt-4"
                    type="button"
                    onClick={() =>
                      update("links", [...record.links, { label: "", url: "" }])
                    }
                  >
                    Adicionar link
                  </button>
                </section>
              )}
            </div>
            <aside className="editor-sidebar space-y-7">
              {collection === "items" && (
                <>
                  <div className="field">
                    <label htmlFor="content-kind">Tipo de conteúdo</label>
                    <select
                      id="content-kind"
                      value={record.kind}
                      onChange={(event) =>
                        update(
                          "kind",
                          event.target.value as ContentRecord["kind"],
                        )
                      }
                    >
                      {Object.entries(kindLabels).map(([key, label]) => (
                        <option value={key} key={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <TextField
                    label="Autores — um por linha"
                    value={record.authors.join("\n")}
                    onChange={(value) => update("authors", value.split("\n"))}
                    multiline
                    help="Os nomes são independentes das contas de acesso."
                  />
                  <TextField
                    label="Ano da publicação"
                    value={record.year ? String(record.year) : ""}
                    type="number"
                    onChange={(value) =>
                      update("year", value ? Number(value) : undefined)
                    }
                  />
                  <TextField
                    label="Periódico ou veículo"
                    value={record.venue}
                    onChange={(value) => update("venue", value)}
                  />
                  <TextField
                    label="DOI"
                    value={record.doi}
                    onChange={(value) => update("doi", value)}
                  />
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={record.featured}
                      onChange={(e) => update("featured", e.target.checked)}
                    />
                    Destacar na página inicial
                  </label>
                </>
              )}
              {collection === "pgps" && (
                <TextField
                  label="Escola ou instituição"
                  value={record.institution}
                  onChange={(value) => update("institution", value)}
                />
              )}
              {collection === "pages" && (
                <label className="field">
                  <span>Tipo de página</span>
                  <select
                    value={record.pageKind}
                    onChange={(e) =>
                      update(
                        "pageKind",
                        e.target.value as ContentRecord["pageKind"],
                      )
                    }
                  >
                    <option value="about">Sobre</option>
                    <option value="contact">Contato</option>
                    <option value="free">Página livre</option>
                  </select>
                </label>
              )}
              {["items", "pgps"].includes(collection) && (
                <References
                  label="Áreas do conhecimento"
                  records={related("areas")}
                  selected={record.areaIds}
                  onChange={(ids) => update("areaIds", ids)}
                />
              )}
              {collection === "items" && (
                <References
                  label="PGPs associados"
                  records={related("pgps")}
                  selected={record.pgpIds}
                  onChange={(ids) => update("pgpIds", ids)}
                />
              )}
              {["items", "pgps", "guides"].includes(collection) && (
                <References
                  label={
                    collection === "guides"
                      ? "Palavras-chave para agregar leituras"
                      : "Palavras-chave"
                  }
                  records={related("keywords")}
                  selected={record.keywordIds}
                  onChange={(ids) => update("keywordIds", ids)}
                />
              )}
              {collection === "guides" && (
                <>
                  <References
                    label="Leituras selecionadas manualmente"
                    records={related("items")}
                    selected={record.selectedIds}
                    onChange={(ids) => update("selectedIds", ids)}
                  />
                  <ol className="space-y-3">
                    {record.selectedIds.map((id, index) => (
                      <li key={id} className="text-sm">
                        <p>
                          {data.published.find((r) => r.id === id)?.title.pt ||
                            id}
                        </p>
                        <div className="mt-1 flex gap-3">
                          <button
                            type="button"
                            disabled={index === 0}
                            className="underline disabled:opacity-40"
                            onClick={() => {
                              const ids = [...record.selectedIds];
                              [ids[index - 1], ids[index]] = [
                                ids[index],
                                ids[index - 1],
                              ];
                              update("selectedIds", ids);
                            }}
                          >
                            Subir
                          </button>
                          <button
                            type="button"
                            disabled={index === record.selectedIds.length - 1}
                            className="underline disabled:opacity-40"
                            onClick={() => {
                              const ids = [...record.selectedIds];
                              [ids[index + 1], ids[index]] = [
                                ids[index],
                                ids[index + 1],
                              ];
                              update("selectedIds", ids);
                            }}
                          >
                            Descer
                          </button>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <p className="text-sm text-ink-700">
                    As leituras manuais aparecem primeiro. Depois entram os
                    conteúdos com qualquer uma das palavras-chave escolhidas,
                    sem repetição.
                  </p>
                </>
              )}
              <div className="border-t border-ink-200 pt-5 text-sm text-ink-700">
                <p>
                  Os rascunhos não aparecem no portal, mas seus arquivos e
                  histórico são públicos no Git.
                </p>
              </div>
            </aside>
          </div>
        )}
        {entry && (
          <div className="mt-9 flex flex-wrap gap-5 border-t border-ink-200 pt-6">
            {isPublished && (
              <button
                className="text-sm underline"
                type="button"
                disabled={!!busy}
                onClick={() => save("unpublish")}
              >
                Retirar de publicação
              </button>
            )}
            {!record.archived && (
              <button
                type="button"
                disabled={!!busy}
                className="text-sm underline"
                onClick={() => save("archive")}
              >
                Arquivar registro
              </button>
            )}
            <button
              type="button"
              className="text-sm underline"
              onClick={downloadCopy}
            >
              Baixar cópia
            </button>
          </div>
        )}
      </form>
    </>
  );
}
