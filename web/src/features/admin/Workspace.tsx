"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  collections,
  keyOf,
  type Collection,
  type ContentRecord,
  type VersionedRecord,
} from "@/lib/content/model";
import { collectionLabels, singularLabels } from "./labels";

type Payload = {
  entries: VersionedRecord[];
  published: ContentRecord[];
  driver: string;
};

import { TextField } from "./EditorFields";
import { RecordEditor } from "./RecordEditor";

export function Workspace({
  collection,
  editing,
  userId,
}: {
  userId: string;
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
        userId={userId}
        collection={collection}
        data={data}
        onSaved={(entry) =>
          setData((old) =>
            old
              ? {
                  ...old,
                  published: [
                    ...old.published.filter(
                      (record) => keyOf(record) !== keyOf(entry.record),
                    ),
                    ...(entry.publishedRecord ? [entry.publishedRecord] : []),
                  ],
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
