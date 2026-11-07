"use client";
import Link from "next/link";
import type { Collection, ContentRecord } from "@/lib/content/model";
import type { LocalDraft } from "./drafts";
import { collectionLabels } from "./labels";

export function RecoveryPanel({
  backups,
  remoteRevision,
  collection,
  onRestore,
  onDiscard,
}: {
  backups: LocalDraft[];
  remoteRevision: string | null;
  collection: Collection;
  onRestore: (backup: LocalDraft) => void;
  onDiscard: (backup: LocalDraft) => void;
}) {
  return (
    <section className="recovery-panel" aria-labelledby="recovery-title">
      <Link href={`/admin?collection=${collection}`}>
        ← {collectionLabels[collection]}
      </Link>
      <h1 id="recovery-title" className="mt-6 font-serif text-3xl">
        Há alterações neste navegador
      </h1>
      <p className="mt-4 max-w-2xl text-ink-700">
        Encontramos uma cópia local que ainda pode não ter sido salva no acervo.
        Escolha o que deseja recuperar antes de continuar.
      </p>
      <div className="mt-7 space-y-6">
        {backups.map((backup) => (
          <article key={backup.storageKey} className="recovery-copy">
            <h2 className="font-serif text-2xl">
              {backup.record.title.pt || "Texto sem título"}
            </h2>
            <p className="mt-2 text-sm text-ink-700">
              Cópia de{" "}
              {new Intl.DateTimeFormat("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              }).format(new Date(backup.savedAt))}
            </p>
            {backup.revision !== remoteRevision && (
              <p className="mt-3 text-sm text-ink-700">
                O acervo pode ter mudado desde esta cópia. Sua versão será
                preservada para comparação antes de gravar.
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                className="button-primary"
                onClick={() => onRestore(backup)}
              >
                Recuperar cópia local
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={() => onDiscard(backup)}
              >
                Descartar esta cópia local
              </button>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-6 max-w-2xl text-sm text-ink-700">
        A cópia é mantida somente neste navegador e não publica o conteúdo.
        Depois de recuperar, salve um rascunho ou publique para guardá-lo no
        acervo.
      </p>
    </section>
  );
}

export function ConflictPanel({
  local,
  remote,
  onResolve,
  onDownload,
}: {
  local: ContentRecord;
  remote: ContentRecord;
  onResolve: (useRemote: boolean) => void;
  onDownload: () => void;
}) {
  return (
    <section className="conflict-panel" aria-labelledby="conflict-title">
      <h2 id="conflict-title" className="font-serif text-2xl">
        Compare as alterações
      </h2>
      <p className="mt-3 text-sm text-ink-700">
        Outra gravação atualizou este registro. Seu texto permanece no
        formulário. Compare as versões e confira também as associações e os
        arquivos antes de continuar.
      </p>
      <div className="conflict-columns mt-5">
        {[
          ["Seu texto neste navegador", local],
          ["Versão atual do acervo", remote],
        ].map(([label, value]) => {
          const record = value as ContentRecord;
          return (
            <div key={String(label)}>
              <h3 className="font-semibold">{String(label)}</h3>
              <p className="mt-3 font-serif text-lg">{record.title.pt}</p>
              <p className="mt-2 text-sm text-ink-700">
                {record.authors.join(", ")}
              </p>
              <p className="conflict-text mt-3">{record.summary.pt}</p>
              <p className="conflict-text mt-3">
                {record.body.pt || "Sem texto em português."}
              </p>
              {record.body.en && (
                <p className="conflict-text mt-3">{record.body.en}</p>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          className="button-primary"
          onClick={() => onResolve(false)}
        >
          Manter meu texto sobre a versão atual
        </button>
        <button
          type="button"
          className="button-secondary"
          onClick={() => onResolve(true)}
        >
          Descartar minhas alterações e usar a versão do acervo
        </button>
        <button
          type="button"
          className="underline text-sm"
          onClick={onDownload}
        >
          Baixar cópia do meu texto
        </button>
      </div>
    </section>
  );
}
