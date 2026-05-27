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
    <article className="group flex flex-col overflow-hidden rounded-lg border border-ink-100 bg-white transition hover:border-ink-300">
      {imageUrl && (
        <Link href={href} className="block">
          <div
            className={`relative w-full ${aspect === "1/1" ? "aspect-square" : "aspect-video"} bg-ink-100`}
          >
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </Link>
      )}
      <div className="flex flex-1 flex-col gap-2 p-5">
        {subtitle && <div className="text-xs uppercase tracking-wide text-brand-700">{subtitle}</div>}
        <h3 className="font-serif text-lg leading-snug">
          <Link href={href} className="text-ink-900 no-underline group-hover:underline">
            {title}
          </Link>
        </h3>
        {description && <p className="text-sm text-ink-500 line-clamp-3">{description}</p>}
        {meta && <div className="mt-auto pt-2 text-xs text-ink-500">{meta}</div>}
      </div>
    </article>
  );
}
