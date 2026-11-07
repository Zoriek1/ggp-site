import Link from "next/link";
import { collections } from "@/lib/content/model";
import { collectionLabels } from "./labels";
import { Logout } from "./Logout";

export function AdminShell({
  children,
  username,
}: {
  children: React.ReactNode;
  username: string;
}) {
  return (
    <div className="admin-shell">
      <header className="admin-header">
        <Link href="/admin" className="brand-lockup text-ink-900 no-underline">
          <span className="font-serif text-3xl font-semibold">
            GGP<span className="text-brand-700">.</span>
          </span>
          <span className="text-sm text-ink-700">Painel de publicação</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/pt">Ver o portal</Link>
          <span className="hidden text-ink-700 sm:inline">{username}</span>
          <Logout />
        </div>
      </header>
      <div className="admin-layout">
        <nav className="admin-nav" aria-label="Seções do painel">
          <Link href="/admin" className="font-semibold">
            Visão geral
          </Link>
          {collections.map((collection) => (
            <Link href={`/admin?collection=${collection}`} key={collection}>
              {collectionLabels[collection]}
            </Link>
          ))}
        </nav>
        <main id="main" className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}
