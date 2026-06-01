import type { ReactNode } from "react";
import { Container } from "./Container";

type Props = {
  /** Texto pequeno acima do título (com risquinho accent). */
  eyebrow?: string;
  title: string;
  /** Subtítulo/descrição opcional. */
  description?: ReactNode;
  /** Rótulo de contagem já formatado (ex.: "21 resultados"). */
  count?: string;
};

/**
 * Cabeçalho padrão das páginas de listagem: faixa sutil da marca, eyebrow com
 * detalhe accent, título serifado grande e contagem. Padroniza o topo de todas
 * as seções internas, espelhando a identidade do hero da home.
 */
export function PageHeader({ eyebrow, title, description, count }: Props) {
  return (
    <section className="border-b border-ink-100 bg-gradient-to-b from-brand-50 to-surface">
      <Container className="py-10 sm:py-14">
        {eyebrow && (
          <p className="mb-2 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-brand-700">
            <span className="h-1 w-5 rounded-full bg-accent-500" aria-hidden="true" />
            {eyebrow}
          </p>
        )}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-serif text-3xl font-semibold leading-tight text-ink-900 sm:text-4xl">
            {title}
          </h1>
          {count && (
            <span className="pb-1 text-sm text-ink-500">{count}</span>
          )}
        </div>
        {description && (
          <p className="mt-3 max-w-2xl text-ink-700">{description}</p>
        )}
      </Container>
    </section>
  );
}
