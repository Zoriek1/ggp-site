import Link from "next/link";
import type { Lang } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

type Props = {
  page: number;
  totalPages: number;
  basePath: string; // ex.: "/pt/publicacoes"
  lang: Lang;
};

export function Pagination({ page, totalPages, basePath, lang }: Props) {
  if (totalPages <= 1) return null;
  const dict = getDictionary(lang);
  const linkFor = (n: number) => (n === 1 ? basePath : `${basePath}?page=${n}`);

  const prev = page > 1 ? linkFor(page - 1) : null;
  const next = page < totalPages ? linkFor(page + 1) : null;

  return (
    <nav className="mt-10 flex items-center justify-between border-t border-ink-100 pt-6 text-sm">
      {prev ? (
        <Link href={prev} rel="prev" className="text-ink-700 hover:text-ink-900">
          ← {dict.common.previous}
        </Link>
      ) : <span />}
      <span className="text-ink-500">
        {dict.common.page} {page} {dict.common.of} {totalPages}
      </span>
      {next ? (
        <Link href={next} rel="next" className="text-ink-700 hover:text-ink-900">
          {dict.common.next} →
        </Link>
      ) : <span />}
    </nav>
  );
}
