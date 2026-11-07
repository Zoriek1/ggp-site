import { createClient } from "next-sanity";
import { env, isSanityConfigured } from "../env";

export const sanityClient = isSanityConfigured()
  ? createClient({
      projectId: env.projectId,
      dataset: env.dataset,
      apiVersion: env.apiVersion,
      useCdn: true,
      perspective: "published",
    })
  : null;

type SanityFetchOptions = {
  tags?: string[];
  revalidate?: number | false;
};

/**
 * Resultado vazio "razoável" para o shape mais comum (array, objeto com items, ou null).
 * Antes do Sanity estar conectado, mantém o site renderizando.
 */
function emptyResult<T>(query: string): T {
  const trimmed = query.trim();
  if (trimmed.startsWith("{")) {
    // queries que projetam { items, total } ou múltiplas listas
    return { items: [], total: 0, publications: [], theses: [], materials: [], media: [], members: [] } as unknown as T;
  }
  if (trimmed.startsWith("*[") && /\[0\]/.test(trimmed)) {
    return null as unknown as T;
  }
  return [] as unknown as T;
}

export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  options: SanityFetchOptions = {},
): Promise<T> {
  if (!sanityClient) return emptyResult<T>(query);
  const { tags, revalidate = 60 } = options;
  try {
    return await sanityClient.fetch<T>(query, params, {
      next: { revalidate, tags },
    });
  } catch (err) {
    // Em dev, prefere não derrubar a página inteira por causa de um GROQ — log e segue.
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[sanityFetch] falhou; retornando vazio:", (err as Error).message);
      return emptyResult<T>(query);
    }
    throw err;
  }
}
