"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  keyOf,
  slugify,
  type Collection,
  type ContentRecord,
  type VersionedRecord,
} from "@/lib/content/model";
import { contentHref } from "@/i18n/routes";
import { RecordView } from "@/features/portal/ContentView";
import { TextField, References, ValidationContext } from "./EditorFields";
import { useRecordEditor } from "./useRecordEditor";
import { RecoveryPanel, ConflictPanel } from "./RecoveryPanel";
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
export type Payload = {
  entries: VersionedRecord[];
  published: ContentRecord[];
  driver: string;
};

export function RecordEditor({
  entry,
  collection,
  data,
  onSaved,
  userId,
}: {
  userId: string;
  entry?: VersionedRecord;
  collection: Collection;
  data: Payload;
  onSaved: (entry: VersionedRecord) => void;
}) {
  const editor = useRecordEditor({ entry, collection, data, userId, onSaved });
  const {
    record,
    editorKey,
    update,
    updateLocale,
    dirty,
    publishedRecord,
    isPublished,
    hasStored,
    lang,
    setLang,
    preview,
    setPreview,
    customSlug,
    setCustomSlug,
    busy,
    error,
    message,
    issues,
    localStatus,
    backups,
    restoreBackup,
    discardBackup,
    save,
    upload,
    downloadCopy,
    conflict,
    resolveConflict,
    focusIssue,
  } = editor;
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
  const fieldErrors = Object.fromEntries(
    issues.map((issue) => [issue.path, issue.message]),
  );
  const isAcademic =
    collection === "items" &&
    (record.kind === "article" ||
      !!record.doi ||
      !!record.venue ||
      !!record.year);
  const previewRecord = {
    ...record,
    title: { ...record.title, pt: record.title.pt || "Sem título" },
    archived: false,
  };
  const previewRecords = [
    ...data.published.filter((r) => keyOf(r) !== keyOf(record) && !r.archived),
    previewRecord,
  ];
  if (backups.length)
    return (
      <RecoveryPanel
        backups={backups}
        remoteRevision={entry?.revision ?? null}
        onRestore={restoreBackup}
        onDiscard={discardBackup}
        collection={collection}
      />
    );
  return (
    <ValidationContext.Provider value={fieldErrors}>
      <Link href={`/admin?collection=${collection}`} className="text-sm">
        ← {collectionLabels[collection]}
      </Link>
      <div className="admin-title-row mt-5">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl">
            {hasStored
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
            href={contentHref(publishedRecord!, "pt")}
            target="_blank"
            rel="noreferrer"
            className="button-secondary"
          >
            Ver publicação
          </a>
        )}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void save("draft");
        }}
        className="editor-form"
        noValidate
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
        {conflict && (
          <ConflictPanel
            remote={conflict.record}
            local={record}
            onResolve={resolveConflict}
            onDownload={downloadCopy}
          />
        )}
        {issues.length > 0 && (
          <ul className="validation-summary" aria-label="Campos para corrigir">
            {issues.map((issue, index) => (
              <li key={`${issue.path}-${index}`}>
                <a
                  href={`#field-${issue.path.replaceAll(".", "-")}`}
                  onClick={(event) => {
                    event.preventDefault();
                    focusIssue(issue);
                  }}
                >
                  {issue.message}
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-sm text-ink-700" role="status">
          {dirty
            ? localStatus || "Preparando cópia local…"
            : hasStored
              ? "Todas as alterações do formulário estão salvas."
              : "Preencha o formulário e salve um rascunho ou publique."}
        </p>
        {message && (
          <p role="status" className="form-success">
            {message}
          </p>
        )}
        {preview ? (
          <div
            className="full-preview"
            onClickCapture={(event) => {
              const anchor = (event.target as Element).closest("a");
              if (anchor) {
                anchor.target = "_blank";
                anchor.rel = "noopener noreferrer";
              }
            }}
          >
            <p className="preview-notice">
              Prévia da página · os links abrem em outra aba. Apenas conteúdos
              publicados entram na agregação automática.
            </p>
            <RecordView
              record={previewRecord}
              lang={lang}
              records={previewRecords}
              preview
            />
          </div>
        ) : (
          <div
            className={`editor-columns ${["areas", "keywords"].includes(collection) ? "editor-simple" : ""}`}
          >
            <div className="space-y-7">
              {collection === "items" && (
                <label className="field">
                  <span>Tipo de conteúdo</span>
                  <select
                    value={record.kind}
                    aria-label="Tipo de conteúdo"
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
                </label>
              )}
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
                name={`title.${lang}`}
                value={record.title[lang]}
                required={lang === "pt"}
                onChange={(value) => {
                  updateLocale("title", value);
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
                name={`summary.${lang}`}
                help="Uma apresentação curta para as listagens. Opcional."
                value={record.summary[lang]}
                onChange={(value) => updateLocale("summary", value)}
                multiline
              />
              {["areas", "keywords"].includes(collection) ? (
                <details className="editor-details">
                  <summary>Descrição longa (opcional)</summary>
                  <div className="mt-4">
                    {" "}
                    <div className="field">
                      <span>
                        {collection === "guides"
                          ? "Introdução do guia"
                          : collection === "pgps"
                            ? "Apresentação do PGP"
                            : "Texto para leitura"}
                      </span>
                      <div
                        id={`field-body-${lang}`}
                        tabIndex={-1}
                        className="markdown-editor"
                        aria-describedby={
                          fieldErrors[`body.${lang}`]
                            ? `body-${lang}-error`
                            : undefined
                        }
                      >
                        <MarkdownEditor
                          key={`${lang}-${editorKey}`}
                          value={record.body[lang]}
                          onChange={(value) => updateLocale("body", value)}
                        />
                      </div>
                      {fieldErrors[`body.${lang}`] && (
                        <p id={`body-${lang}-error`} className="field-error">
                          {fieldErrors[`body.${lang}`]}
                        </p>
                      )}
                    </div>
                  </div>
                </details>
              ) : (
                <>
                  {" "}
                  <div className="field">
                    <span>
                      {collection === "guides"
                        ? "Introdução do guia"
                        : collection === "pgps"
                          ? "Apresentação do PGP"
                          : "Texto para leitura"}
                    </span>
                    <div
                      id={`field-body-${lang}`}
                      tabIndex={-1}
                      className="markdown-editor"
                      aria-describedby={
                        fieldErrors[`body.${lang}`]
                          ? `body-${lang}-error`
                          : undefined
                      }
                    >
                      <MarkdownEditor
                        key={`${lang}-${editorKey}`}
                        value={record.body[lang]}
                        onChange={(value) => updateLocale("body", value)}
                      />
                    </div>
                    {fieldErrors[`body.${lang}`] && (
                      <p id={`body-${lang}-error`} className="field-error">
                        {fieldErrors[`body.${lang}`]}
                      </p>
                    )}
                  </div>
                </>
              )}
              <details
                className="editor-details"
                open={
                  issues.some((issue) => issue.path.startsWith("slug.")) ||
                  undefined
                }
              >
                <summary>Endereço da página e identificação</summary>
                <div className="mt-4 space-y-4">
                  <TextField
                    label={`Endereço (${lang.toUpperCase()})`}
                    name={`slug.${lang}`}
                    value={record.slug[lang]}
                    onChange={(value) => {
                      setCustomSlug(true);
                      updateLocale("slug", value);
                    }}
                    help="Use letras minúsculas, números e hífens. Ao publicar uma mudança, os endereços anteriores continuarão redirecionando para esta página."
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
                    <div key={i} className="attachment-row">
                      <TextField
                        label="Nome do arquivo ou link"
                        name={`attachments.${i}.label`}
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
                        name={`attachments.${i}.url`}
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
                          name={`attachments.${i}.alt`}
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
                      name="externalUrl"
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
                    name="contactEmail"
                    value={record.contactEmail}
                    type="email"
                    onChange={(value) => update("contactEmail", value)}
                  />
                  {record.links.map((link, i) => (
                    <div className="attachment-row" key={i}>
                      <TextField
                        label="Nome do link"
                        name={`links.${i}.label`}
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
                        name={`links.${i}.url`}
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
                  <TextField
                    label="Autores — um por linha"
                    name="authors"
                    value={record.authors.join("\n")}
                    onChange={(value) => update("authors", value.split("\n"))}
                    multiline
                    help="Os nomes são independentes das contas de acesso."
                  />
                  {isAcademic && (
                    <details
                      className="editor-details"
                      open={
                        issues.some((issue) =>
                          ["year", "doi", "venue"].includes(issue.path),
                        ) || undefined
                      }
                    >
                      <summary>Dados acadêmicos (opcionais)</summary>
                      <div className="mt-4 space-y-5">
                        {" "}
                        <TextField
                          label="Ano da publicação"
                          name="year"
                          value={record.year ? String(record.year) : ""}
                          type="number"
                          onChange={(value) =>
                            update("year", value ? Number(value) : undefined)
                          }
                        />
                        <TextField
                          label="Periódico ou veículo"
                          name="venue"
                          value={record.venue}
                          onChange={(value) => update("venue", value)}
                        />
                        <TextField
                          label="DOI"
                          name="doi"
                          value={record.doi}
                          onChange={(value) => update("doi", value)}
                        />
                      </div>
                    </details>
                  )}
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
                    id="field-pageKind"
                    aria-invalid={!!fieldErrors.pageKind || undefined}
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
                  {fieldErrors.pageKind && (
                    <p className="field-error">{fieldErrors.pageKind}</p>
                  )}
                </label>
              )}
              {["items", "pgps"].includes(collection) && (
                <References
                  label="Áreas do conhecimento"
                  name="areaIds"
                  records={related("areas")}
                  selected={record.areaIds}
                  onChange={(ids) => update("areaIds", ids)}
                />
              )}
              {collection === "items" && (
                <References
                  label="PGPs associados"
                  name="pgpIds"
                  records={related("pgps")}
                  selected={record.pgpIds}
                  onChange={(ids) => update("pgpIds", ids)}
                />
              )}
              {["items", "pgps", "guides"].includes(collection) && (
                <References
                  name="keywordIds"
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
                    name="selectedIds"
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
        {hasStored && (
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
    </ValidationContext.Provider>
  );
}
