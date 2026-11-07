import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/server/auth";
import { Login } from "@/features/admin/Login";

export default async function Page() {
  if (await currentUser()) redirect("/admin");
  return (
    <main id="main" className="login-page">
      <section className="login-intro">
        <Link
          href="/pt"
          className="font-serif text-4xl text-ink-900 no-underline"
        >
          GGP.
        </Link>
        <h1 className="mt-12 max-w-lg font-serif text-4xl leading-tight sm:text-5xl">
          Conhecimento feito em conjunto.
        </h1>
        <p className="mt-6 max-w-md leading-relaxed text-ink-700">
          Um espaço para professores e alunos compartilharem textos, materiais e
          percursos de estudo dos PGPs e do GGP.
        </p>
        <Link href="/pt" className="mt-9 inline-block text-sm">
          ← Voltar ao portal
        </Link>
      </section>
      <section className="login-form">
        <h2 className="font-serif text-3xl">Entrar para publicar</h2>
        <p className="mb-8 mt-3 text-sm text-ink-700">
          Use a conta de acesso fornecida pelo grupo.
        </p>
        <Login />
      </section>
    </main>
  );
}
