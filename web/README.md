# Pacote web

Portal PT/EN, painel `/admin` e APIs do GGP/PGPs (Next.js 15, React 19, TypeScript). Requer Node.js 22.12+. Visão geral do repositório em `../README.md`; modelo e decisões em `../docs/ARCHITECTURE.md`; implantação em `../docs/DEPLOY.md`.

## Scripts

| Comando | Função |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (Turbopack) em `localhost:3000`. |
| `npm run build` / `npm start` | Build `standalone` e execução. |
| `npm run lint` | ESLint em `src`, `scripts` e `tests`, sem avisos. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm test` | Testes unitários (`tsx --test tests/*.test.ts`). |
| `npm run test:e2e` | Playwright (Chromium) contra servidor próprio na porta 3100. |
| `npm run seed:content` | Cria arquivos iniciais ausentes em `content/` a partir de `legacy/studio`, sem sobrescrever. |
| `npm run import:sanity -- arquivo.ndjson [--overwrite]` | Importa uma exportação do Sanity, baixando e reprocessando as mídias. |
| `npm run password:hash` | Gera o hash scrypt de uma senha lida da entrada padrão (ver `../docs/DEPLOY.md`). |
| `npm run package:release -- /destino` | Monta a release a partir de `.next/standalone` (exige `npm run build`); o destino deve estar fora de `web/`. |

`scripts/media-backup.mjs` (`backup MEDIA_DIR BACKUP_DIR` ou `restore ARQUIVO.tar.gz MEDIA_DIR`) é usado pelos serviços de backup em `../deploy/`.

## Mapa de `src/`

- `app/`: rotas do App Router. `[lang]/` (portal), `admin/` (painel), `api/admin/` (login, logout, records, uploads), `media/[name]/`, `sitemap*.xml/`, `robots.ts`, ícones e imagem Open Graph.
- `middleware.ts`: prefixo de idioma e cabeçalhos `x-lang`/`x-pathname`.
- `features/portal/`: páginas do portal (`Portal.tsx`, `ContentView.tsx`), metadados/JSON-LD e textos.
- `features/admin/`: painel e editor (`Workspace`, `RecordEditor`, `useRecordEditor`, `RecoveryPanel`, `drafts.ts` para cópias locais).
- `components/`: componentes compartilhados (cabeçalho, rodapé, cartões, paginação, busca, tema, hreflang).
- `i18n/`: idiomas, segmentos de rota traduzidos e dicionários.
- `lib/content/`: modelo Zod, codec YAML/Markdown, consultas, endereços canônicos e importador do Sanity (sem dependência do servidor).
- `lib/server/`: `store` (snapshot e gravação), `repository` (drivers local e GitHub), `auth`, `media`, `sitemap`, `http`.

## Variáveis de ambiente

Copie `.env.example` para `.env.local`. Nunca versione credenciais.

| Variável | Uso |
| --- | --- |
| `SITE_URL`, `NEXT_PUBLIC_SITE_URL` | URL pública; base de canonical/sitemaps e Origin aceita nas mutações. |
| `CONTENT_DRIVER` | `local` ou `github`. Sem ela, `GITHUB_REPOSITORY` seleciona o GitHub. |
| `CONTENT_ALLOW_LOCAL_WRITES` | `true` permite gravar no driver local; ignorado em produção. |
| `CONTENT_ROOT` | Raiz do projeto para o driver local (padrão: pasta acima de `web/`). |
| `GITHUB_REPOSITORY`, `GITHUB_BRANCH`, `GITHUB_TOKEN` | Repositório `dono/nome`, branch (padrão `main`) e token granular. |
| `MEDIA_DIR` | Diretório persistente de mídias; obrigatório em produção. |
| `CONTENT_CACHE_DIR` | Cópia persistente do snapshot validado (`snapshot.json`). |
| `BACKUP_DIR` | Destino de backups de mídia nas rotinas de implantação. |
| `SESSION_SECRET` | Segredo de sessão com 32+ caracteres. |
| `PANEL_USERS_JSON` | Lista JSON de usuários `{ id, username, passwordHash, active? }`. |
| `NEXT_DIST_DIR` | Pasta de build (usada pelos testes e2e; padrão `.next`). |

## Testes

`tests/*.test.ts` cobrem conteúdo e consultas, endereços e redirecionamentos, snapshot/cache/conflitos, adaptador GitHub, autenticação e mídia, backup, importação do Sanity, recuperação do editor e erros de domínio. `tests/e2e/` (`portal.spec.ts`, `editor.spec.ts`) roda sobre uma cópia de `content/` em `../work/e2e`, iniciada por `tests/start-e2e.ts` com escrita local habilitada e conta de teste; precisa de Chromium (`CHROMIUM_PATH`, padrão `/usr/bin/chromium`).
