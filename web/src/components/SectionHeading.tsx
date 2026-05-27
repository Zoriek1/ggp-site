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
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <div className="text-xs uppercase tracking-wide text-brand-700">{eyebrow}</div>
        )}
        <h2 className="font-serif text-2xl text-ink-900 sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-ink-500">{description}</p>}
      </div>
      {href && hrefLabel && (
        <Link href={href} className="text-sm text-ink-700 hover:text-ink-900">
          {hrefLabel} →
        </Link>
      )}
    </div>
  );
}
