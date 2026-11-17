# Legado (Sanity)

Código da versão anterior do portal, quando o conteúdo ficava no Sanity. Foi mantido apenas como referência e como origem da migração para o conteúdo em Git. Não faz parte da aplicação ativa e não deve receber novas funcionalidades.

## Conteúdo

- `studio/`: Sanity Studio (`ggp-studio`, Sanity v3). Schemas em `schemas/` (publicações, teses, materiais didáticos, mídia, recursos, eventos, membros, PGPs, áreas de pesquisa, tópicos de física, tags, níveis de ensino, páginas e configurações do site), estrutura do desk em `structure/` e scripts de seed em `scripts/`. Variáveis em `.env.example` (`SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET` e `SANITY_WRITE_TOKEN`, usado só no seed).
- `web/`: fontes (`src/`) do site Next.js antigo: rotas, componentes e funcionalidades por tipo de documento, sitemaps por tipo, rota `revalidate` (webhook do Sanity) e a integração com o Sanity. É só um trecho de código; não tem `package.json` nem configuração própria e não roda isoladamente.

## Por que está fora da app ativa

O portal ativo fica em `web/` (na raiz do repositório) e lê o conteúdo de `content/` (YAML e Markdown versionados no Git, ver `content/README.md`). O Studio e o site antigo dependem de um projeto Sanity externo, que deixou de ser necessário. A única ligação com a app ativa é `web/scripts/seed-content.ts`, que importa os dados de seed de `legacy/studio/scripts/seed/`.

## Importador

`web/scripts/import-sanity.ts` converte uma exportação do Sanity para `content/`. A conversão em si está em `web/src/lib/content/sanity-import.ts`.

```bash
cd web
npm run import:sanity -- /caminho/data.ndjson [--overwrite]
```

(`data.ndjson` vem de `sanity dataset export`; o script também aceita um array JSON.)

O que o importador faz:

- Mapeia tipos: `publication` para `items`, `pgp` para `pgps`, `researchArea` para `areas`, `physicsTopic` e `tag` para `keywords`, `page` para `pages` e `siteSettings` para `settings`. Os demais tipos (teses, eventos, materiais, mídia, recursos etc.) são ignorados e listados em `skipped`; `member` serve só para resolver nomes de autores.
- Converte o texto rico (Portable Text) em Markdown e gera os IDs com `slugify` a partir do `_id` do Sanity.
- Baixa imagens e arquivos de `cdn.sanity.io` (até 20 MB cada), salva-os como `/media/<sha256>.<ext>` e reescreve as URLs.
- Grava `meta.yaml`, `pt.md` e `en.md` em `content/published/` ou `content/drafts/`. Documentos que eram rascunho no Sanity (`drafts.*`), os que falham na validação de publicação (`publishErrors`) e os que dependem de registros não publicados vão para `drafts/`, com os motivos no resumo impresso.
- Sem `--overwrite`, não sobrescreve arquivos existentes (a escrita falha se o arquivo já existir). A raiz de saída é a raiz do repositório, ou `CONTENT_ROOT` se definida.

## Seed do conteúdo inicial

`npm run seed:content` (em `web/`) usa `web/scripts/seed-content.ts`: lê os documentos de seed em `legacy/studio/scripts/seed/` (taxonomia, membros, PGPs, publicações, páginas e configurações), passa-os por `importSanityDocuments` e grava o resultado em `content/` com `updatedAt` fixo. Os dados atuais de `content/` correspondem a essa saída. Por isso `legacy/studio/scripts/seed/` não pode ser removido enquanto esse script existir.

## Status

Congelado. O importador de exportações (`import-sanity.ts`) só precisa de um arquivo de exportação do dataset; já o `seed:content` depende de `legacy/studio/scripts/seed/`.
