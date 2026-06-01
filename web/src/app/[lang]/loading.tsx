import { Container } from "@/components/Container";

// Skeleton genérico exibido enquanto o GROQ resolve (ISR/streaming).
export default function Loading() {
  return (
    <Container className="py-12">
      <div className="h-9 w-64 max-w-full animate-pulse rounded bg-ink-100" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg border border-ink-100 bg-surface"
          >
            <div className="aspect-video animate-pulse bg-ink-100" />
            <div className="flex flex-col gap-3 p-5">
              <div className="h-3 w-20 animate-pulse rounded bg-ink-100" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-ink-100" />
              <div className="h-4 w-full animate-pulse rounded bg-ink-100" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-ink-100" />
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
