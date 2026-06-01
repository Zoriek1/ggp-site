import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-x grid min-h-[70vh] place-items-center py-20 text-center">
      <div>
        <p className="font-serif text-7xl font-bold text-brand-700">404</p>
        <h1 className="mt-4 font-serif text-3xl text-ink-900">
          Página não encontrada
        </h1>
        <p className="mt-2 text-ink-500">
          Esta página não existe ou foi movida. · This page doesn&apos;t exist.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/pt"
            className="rounded bg-brand-button px-4 py-2 text-sm text-white no-underline hover:bg-brand-button-hover"
          >
            ← Início
          </Link>
          <Link
            href="/en"
            className="rounded border border-ink-200 px-4 py-2 text-sm text-ink-900 no-underline hover:border-ink-300"
          >
            Home (EN) →
          </Link>
        </div>
      </div>
    </main>
  );
}
