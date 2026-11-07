"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createRecord,
  keyOf,
  publicationIssues,
  recordSchema,
  type Collection,
  type ContentRecord,
  type FieldIssue,
  type Lang,
  type VersionedRecord,
} from "@/lib/content/model";
import {
  draftScope,
  fingerprint,
  prepareRecord,
  readLocalDrafts,
  reconcileSaved,
  removeLocalDraft,
  writeLocalDraft,
  type LocalDraft,
} from "./drafts";
import type { Payload } from "./RecordEditor";

export function useRecordEditor({
  entry,
  collection,
  data,
  userId,
  onSaved,
}: {
  entry?: VersionedRecord;
  collection: Collection;
  data: Payload;
  userId: string;
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
  const latest = useRef(record),
    revision = useRef(entry?.revision ?? null),
    baseline = useRef(fingerprint(record));
  const [publishedRecord, setPublishedRecord] = useState(
    entry?.publishedRecord ||
      data.published.find(
        (r) =>
          r.id === entry?.record.id &&
          r.collection === collection &&
          !r.archived,
      ),
  );
  const [editorKey, setEditorKey] = useState(0);
  const [lang, setLang] = useState<Lang>("pt"),
    [preview, setPreview] = useState(false),
    [customSlug, setCustomSlug] = useState(!!entry);
  const busyLock = useRef(false);
  const [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const [issues, setIssues] = useState<FieldIssue[]>([]),
    [conflict, setConflict] = useState<VersionedRecord>();
  const [backups, setBackups] = useState<LocalDraft[]>([]),
    [localStatus, setLocalStatus] = useState(""),
    [localReady, setLocalReady] = useState(false);
  const scope = draftScope(userId, collection, entry?.record.id),
    scopeRef = useRef(scope),
    tab = useRef("");
  const pendingRecovery = useRef(false),
    dirtyRef = useRef(false);
  const adoptedBackup = useRef<string | undefined>(undefined);
  const dirty = fingerprint(record) !== baseline.current;
  dirtyRef.current = dirty;

  function replace(next: ContentRecord) {
    latest.current = next;
    setRecord(next);
    dirtyRef.current = fingerprint(next) !== baseline.current;
  }
  function update<K extends keyof ContentRecord>(
    key: K,
    value: ContentRecord[K],
  ) {
    replace({ ...latest.current, [key]: value });
    setMessage("");
    setIssues((current) =>
      current.filter(
        (issue) => issue.path !== key && !issue.path.startsWith(`${key}.`),
      ),
    );
  }
  function updateLocale(
    key: "title" | "summary" | "body" | "slug",
    value: string,
  ) {
    update(key, { ...latest.current[key], [lang]: value });
  }
  const persistRef = useRef<() => void>(() => undefined);
  persistRef.current = () => {
    if (!tab.current || pendingRecovery.current) return;
    try {
      if (dirtyRef.current) {
        writeLocalDraft(
          window.localStorage,
          scopeRef.current,
          tab.current,
          latest.current,
          revision.current,
        );
        setLocalStatus("Cópia local salva neste navegador.");
      } else {
        removeLocalDraft(window.localStorage, scopeRef.current, tab.current);
        setLocalStatus("Sem alterações locais pendentes.");
      }
      if (adoptedBackup.current) {
        window.localStorage.removeItem(adoptedBackup.current);
        adoptedBackup.current = undefined;
      }
    } catch {
      setLocalStatus(
        "Cópia local indisponível neste navegador. Salve um rascunho ou baixe uma cópia.",
      );
    }
  };
  useEffect(() => {
    tab.current = crypto.randomUUID();
    try {
      tab.current =
        window.sessionStorage.getItem("ggp:editor-tab") || crypto.randomUUID();
      window.sessionStorage.setItem("ggp:editor-tab", tab.current);
    } catch {
      /* Local recovery can still work when session storage is blocked. */
    }
    try {
      const saved = readLocalDrafts(
        window.localStorage,
        scopeRef.current,
      ).filter(
        (backup) =>
          backup.record.collection === collection &&
          (!entry || backup.record.id === entry.record.id),
      );
      const recoverable = saved.filter(
        (backup) => fingerprint(backup.record) !== baseline.current,
      );
      pendingRecovery.current = recoverable.length > 0;
      setBackups(recoverable);
    } catch {
      setLocalStatus(
        "Cópia local indisponível neste navegador. Salve um rascunho ou baixe uma cópia.",
      );
    }
    setLocalReady(true);
    const beforeUnload = (event: BeforeUnloadEvent) => {
      persistRef.current();
      if (dirtyRef.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    const visibility = () => {
      if (document.visibilityState === "hidden") persistRef.current();
    };
    const navigation = (event: MouseEvent) => {
      if (
        !dirtyRef.current ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor = (event.target as Element)?.closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (
        !anchor ||
        anchor.closest(".full-preview") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      )
        return;
      const target = new URL(anchor.href, location.href);
      if (
        target.origin === location.origin &&
        target.pathname === location.pathname &&
        target.search === location.search
      )
        return;
      persistRef.current();
      if (
        !window.confirm(
          "Há alterações que ainda não foram salvas no acervo. Deseja sair do editor?",
        )
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("visibilitychange", visibility);
    document.addEventListener("click", navigation, true);
    return () => {
      persistRef.current();
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("click", navigation, true);
    };
    // Each mounted editor owns a stable scope; changing routes remounts it by key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!localReady || pendingRecovery.current) return;
    const timer = setTimeout(() => persistRef.current(), 400);
    return () => clearTimeout(timer);
  }, [record, dirty, localReady]);

  function restoreBackup(backup: LocalDraft) {
    const ownKey = `ggp:editor:v2:${scopeRef.current}:${tab.current}`;
    adoptedBackup.current =
      backup.storageKey !== ownKey ? backup.storageKey : undefined;
    revision.current = backup.revision;
    const remote = data.entries.find(
      (e) => keyOf(e.record) === keyOf(backup.record),
    );
    baseline.current = fingerprint(remote?.record || record);
    setPublishedRecord(
      remote?.publishedRecord ||
        data.published.find(
          (r) => keyOf(r) === keyOf(backup.record) && !r.archived,
        ),
    );
    pendingRecovery.current = false;
    setBackups([]);
    replace(backup.record);
    setEditorKey((key) => key + 1);
    setCustomSlug(true);
    setMessage(
      remote && remote.revision !== backup.revision
        ? "Cópia recuperada. Há uma versão mais recente no acervo; compare as versões antes de salvar."
        : "Cópia recuperada. As alterações ainda precisam ser salvas no acervo.",
    );
    persistRef.current();
  }
  function discardBackup(backup: LocalDraft) {
    try {
      window.localStorage.removeItem(backup.storageKey);
    } catch {
      /* Keep the remote editor usable if browser storage is blocked. */
    }
    const remaining = backups.filter(
      (value) => value.storageKey !== backup.storageKey,
    );
    setBackups(remaining);
    pendingRecovery.current = remaining.length > 0;
  }
  function focusIssue(first?: FieldIssue) {
    if (first?.path.includes(".en")) setLang("en");
    else if (first?.path.includes(".pt")) setLang("pt");
    setPreview(false);
    requestAnimationFrame(() => {
      let path = first?.path || "";
      let target = document.getElementById(
        `field-${path.replaceAll(".", "-")}`,
      );
      while (!target && path.includes(".")) {
        path = path.slice(0, path.lastIndexOf("."));
        target = document.getElementById(`field-${path.replaceAll(".", "-")}`);
      }
      if (target) {
        for (const detail of target.closest("details")
          ? [target.closest("details")!]
          : [])
          detail.open = true;
        target.focus();
        target.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    });
  }
  function showIssues(next: FieldIssue[]) {
    setIssues(next);
    setError("Confira os campos indicados antes de salvar.");
    focusIssue(next[0]);
  }
  async function save(action: "draft" | "publish" | "unpublish" | "archive") {
    if (busyLock.current || pendingRecovery.current) return;
    const submitted = prepareRecord(latest.current);
    const parsed = recordSchema.safeParse(submitted);
    if (!parsed.success) {
      showIssues(
        parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      );
      return;
    }
    if (action === "publish") {
      const invalid = publicationIssues(parsed.data, data.published);
      if (invalid.length) {
        showIssues(invalid);
        return;
      }
    }
    busyLock.current = true;
    setBusy(action);
    setError("");
    setMessage("");
    setIssues([]);
    setConflict(undefined);
    persistRef.current();
    try {
      const response = await fetch("/api/admin/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          record: parsed.data,
          revision: revision.current,
          action,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (result.issues?.length) showIssues(result.issues);
        if (response.status === 409) {
          const current = await fetch("/api/admin/records");
          if (current.ok) {
            const payload: Payload = await current.json();
            const remote = payload.entries.find(
              (e) => keyOf(e.record) === keyOf(submitted),
            );
            if (remote && remote.revision !== revision.current)
              setConflict(remote);
          }
        }
        throw new Error(result.error);
      }
      const saved: VersionedRecord = result.entry;
      const reconciled = reconcileSaved(
        latest.current,
        submitted,
        saved.record,
      );
      revision.current = saved.revision;
      baseline.current = fingerprint(saved.record);
      replace(reconciled.record);
      setPublishedRecord(saved.publishedRecord);
      onSaved(saved);
      const messages = {
        draft: "Rascunho salvo.",
        publish: "Conteúdo publicado.",
        unpublish: "Publicação retirada; o registro permanece como rascunho.",
        archive: "Registro arquivado.",
      };
      setMessage(
        `${messages[action]} ${reconciled.dirty ? "As alterações feitas durante o salvamento foram preservadas e ainda precisam ser salvas." : action === "draft" && saved.published ? "A versão pública anterior permanece disponível." : ""}${data.driver === "local" ? " Alteração feita somente no ambiente local." : " Alteração confirmada no Git."}`,
      );
      persistRef.current();
      if (!entry && !reconciled.dirty)
        router.replace(`/admin/edit/${keyOf(saved.record)}`);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar. Seu texto continua no editor.",
      );
      persistRef.current();
    } finally {
      busyLock.current = false;
      setBusy("");
    }
  }
  async function upload(file: File) {
    if (busyLock.current) return;
    busyLock.current = true;
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
        ...latest.current.attachments,
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
      busyLock.current = false;
      setBusy("");
    }
  }
  function downloadCopy() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(latest.current, null, 2)], {
        type: "application/json",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${latest.current.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
  function resolveConflict(useRemote: boolean) {
    if (!conflict) return;
    revision.current = conflict.revision;
    baseline.current = fingerprint(conflict.record);
    setPublishedRecord(conflict.publishedRecord);
    if (useRemote) {
      replace(conflict.record);
      setEditorKey((key) => key + 1);
    } else replace({ ...latest.current });
    onSaved(conflict);
    setConflict(undefined);
    setError("");
    setIssues([]);
    setMessage(
      useRemote
        ? "Versão do acervo carregada."
        : "Seu texto foi mantido sobre a revisão atual. Confira as alterações e salve novamente.",
    );
    persistRef.current();
  }
  return {
    record,
    editorKey,
    update,
    updateLocale,
    dirty,
    publishedRecord,
    isPublished: !!publishedRecord,
    hasStored: revision.current !== null,
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
  };
}
