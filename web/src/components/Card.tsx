import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

type Props = {
  href: string;
  title: string;
  subtitle?: ReactNode;
  description?: string | null;
  imageUrl?: string | null;
  imageAlt?: string;
  aspect?: "16/9" | "1/1";
  meta?: ReactNode;
};

export function Card({
  href,
  title,
  subtitle,
  description,
  imageUrl,
  imageAlt = "",
  aspect = "16/9",
  meta,
}: Props) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-ink-100 bg-surface shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-md">
      {imageUrl && (
        <Link href={href} className="block overflow-hidden">
          <div
            className={`relative w-full ${aspect === "1/1" ? "aspect-square" : "aspect-video"} bg-ink-100`}
          >
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          </div>
        </Link>
      )}
      <div className="flex flex-1 flex-col gap-2 p-5">
        {subtitle && (
          <div className="text-xs font-medium uppercase tracking-wide text-brand-700">{subtitle}</div>
        )}
        <h3 className="font-serif text-lg leading-snug">
          <Link href={href} className="text-ink-900 no-underline transition-colors group-hover:text-brand-700">
            {title}
          </Link>
        </h3>
        {description && <p className="text-sm text-ink-700 line-clamp-3">{description}</p>}
        {meta && (
          <div className="mt-auto flex items-center gap-1.5 pt-3 text-xs text-ink-500">{meta}</div>
        )}
      </div>
    </article>
  );
}
