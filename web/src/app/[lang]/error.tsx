"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Container } from "@/components/Container";

// Boundary de erro do grupo [lang]. Bilíngue simples a partir do prefixo da URL.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname() || "/pt";
  const isEn = pathname.startsWith("/en");

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <Container className="py-20 text-center">
      <h1 className="font-serif text-3xl text-ink-900">
        {isEn ? "Something went wrong" : "Algo deu errado"}
      </h1>
      <p className="mt-3 text-ink-500">
        {isEn
          ? "We couldn't load this page. Please try again."
          : "Não foi possível carregar esta página. Tente novamente."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-block rounded bg-brand-button px-4 py-2 text-sm text-white hover:bg-brand-button-hover"
      >
        {isEn ? "Try again" : "Tentar de novo"}
      </button>
    </Container>
  );
}
