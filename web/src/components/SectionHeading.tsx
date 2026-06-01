import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  eyebrow?: string;
  description?: ReactNode;
  href?: string;
  hrefLabel?: string;
};

export function SectionHeading({ title, eyebrow, description, href, hrefLabel }: Props) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <div className="mb-1 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-brand-700">
            <span className="h-1 w-5 rounded-full bg-accent-500" aria-hidden="true" />
            {eyebrow}
          </div>
        )}
        <h2 className="font-serif text-2xl font-semibold text-ink-900 sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-ink-700">{description}</p>}
      </div>
      {href && hrefLabel && (
        <Link
          href={href}
          className="group inline-flex items-center gap-1 text-sm font-medium text-brand-700 no-underline hover:text-brand-900"
        >
          {hrefLabel}
          <span className="transition-transform group-hover:translate-x-0.5" aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}
