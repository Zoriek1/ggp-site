"use client";
import { createContext, useContext, useId, useState } from "react";
import type { ContentRecord } from "@/lib/content/model";
export const ValidationContext = createContext<Record<string, string>>({});
function fieldError(errors: Record<string, string>, name?: string) {
  return name
    ? errors[name] ||
        Object.entries(errors).find(([path]) =>
          path.startsWith(`${name}.`),
        )?.[1]
    : undefined;
}
export function TextField({
  label,
  value,
  onChange,
  multiline,
  placeholder,
  type = "text",
  required = false,
  help,
  name,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  type?: string;
  required?: boolean;
  help?: string;
  name?: string;
}) {
  const generatedId = useId();
  const id = name ? `field-${name.replaceAll(".", "-")}` : generatedId;
  const errors = useContext(ValidationContext);
  const error = fieldError(errors, name);
  const describedBy =
    [help ? `${id}-help` : "", error ? `${id}-error` : ""]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          id={id}
          aria-describedby={describedBy}
          aria-invalid={!!error || undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          required={required}
        />
      ) : (
        <input
          id={id}
          aria-describedby={describedBy}
          aria-invalid={!!error || undefined}
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
      {error && (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
export function References({
  label,
  records,
  selected,
  onChange,
  name,
}: {
  label: string;
  records: ContentRecord[];
  selected: string[];
  onChange: (ids: string[]) => void;
  name?: string;
}) {
  const [query, setQuery] = useState("");
  const errors = useContext(ValidationContext);
  const error = fieldError(errors, name);
  const id = name ? `field-${name.replaceAll(".", "-")}` : undefined;
  const options = records.filter((r) =>
    r.title.pt.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  return (
    <fieldset
      className="reference-field"
      id={id}
      tabIndex={-1}
      aria-invalid={!!error || undefined}
      aria-describedby={error ? `${id}-error` : undefined}
    >
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
      {error && (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </fieldset>
  );
}
