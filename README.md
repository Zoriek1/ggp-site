# GGP Grande Grupo da Paçoca (Ensino de Física / UFG)

Site institucional + repositório acadêmico do GGP. Substitui o Google Sites atual e centraliza publicações, teses, materiais didáticos, mídia e eventos do grupo. Bilíngue PT/EN.

> Site futuro: `https://ggp.ufg.br`
> Instagram: <https://www.instagram.com/ggp.fisica/>

## Estrutura do repositório

```
.
├─ web/      # Frontend Next.js 15 (App Router, TS, Tailwind v4)
├─ studio/   # Sanity Studio v3 (CMS, schemas bilíngues, taxonomias)
└─ docs/
   ├─ EDITORIAL.md   # Política editorial — LEIA ANTES de cadastrar conteúdo
   └─ DEPLOY.md      # Como rodar localmente e como fazer deploy em ggp.ufg.br
```

## Setup rápido (Windows / PowerShell)

```powershell
# 1) Instalar dependências
cd web;     npm install
cd ..\studio; npm install

# 2) Criar projeto Sanity (uma vez)
cd ..\studio
npx sanity login                  # autentica com sua conta Sanity (grátis)
npx sanity init --env             # cria o projeto, gera studio/.env

# 3) Configurar o frontend
cd ..\web
copy .env.local.example .env.local
# editar .env.local com o PROJECT_ID que o Sanity gerou

# 4) Rodar (em DOIS terminais)
cd ..\studio; npm run dev         # http://localhost:3333  (painel)
cd ..\web;    npm run dev         # http://localhost:3000  (site)
```

Detalhes (variáveis, webhooks, deploy em produção): [docs/DEPLOY.md](docs/DEPLOY.md).

## Como funciona

- **Conteúdo** vive no Sanity. Editores publicam via Studio (`studio/`); o site Next.js (`web/`) consome via GROQ + ISR.
- **Bilíngue de verdade**: cada campo de texto é `{pt, en}` e cada slug tem versão PT e EN. As URLs traduzem os segmentos: `/pt/publicacoes/xxx` ↔ `/en/publications/xxx`.
- **Taxonomias estruturadas** (`physicsTopic`, `researchArea`, `educationLevel`, `tag`) — sem strings livres, sem inconsistência de "Mecânica" vs "mecanica".
- **Páginas de membro** agregam automaticamente publicações, teses orientadas, materiais, mídia e eventos do pesquisador (mini-Lattes).
- **SEO acadêmico**: JSON-LD (`ScholarlyArticle`, `Thesis`, `Person`, `Event`, `ResearchOrganization`), tags `citation_*` para Google Scholar, sitemap segmentado por tipo, `hreflang` PT/EN em tudo.
- **PDFs**: campo `pdfFile` (upload Sanity) hoje, mas todo schema já tem `pdfUrl` opcional para migrar para Cloudflare R2 / servidor UFG sem refatorar.

## Política editorial — não pular

[docs/EDITORIAL.md](docs/EDITORIAL.md) define papéis, workflow, convenções de título, padrões de imagem, tópicos canônicos, e regras de tradução. **É o que impede o site de virar um Google Sites moderno** depois de seis meses.

## Próximas integrações (já preparadas no schema, sem código ainda)

- **Login SIGAA / área privada**: investigar com CTI/UFG; estrutura pronta para adicionar `private: boolean` por documento.
- **ORCID**: campo já validado; futuro botão "importar publicações do autor via ORCID API".
- **DOI autofill**: stub previsto via Crossref API.
- **Busca textual**: quando o acervo passar de ~50 itens, adicionar Pagefind (estático, gratuito).

## Verificar mudanças antes de pedir review

```powershell
cd web
npm run typecheck
npm run lint
npm run build
```

E manualmente: navegar em PT e EN, conferir Lighthouse (Performance ≥ 90, SEO ≥ 95, Acessibilidade ≥ 90), validar JSON-LD em https://search.google.com/test/rich-results.
