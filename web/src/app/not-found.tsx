import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-x py-20 text-center">
      <p className="font-serif text-6xl text-ink-300">404</p>
      <h1 className="mt-4 font-serif text-3xl text-ink-900">Página não encontrada</h1>
      <p className="mt-2 text-ink-500">Page not found.</p>
      <p className="mt-8">
        <Link href="/pt" className="text-brand-700">← Início</Link>
        {" · "}
        <Link href="/en" className="text-brand-700">Home →</Link>
      </p>
    </main>
  );
}
