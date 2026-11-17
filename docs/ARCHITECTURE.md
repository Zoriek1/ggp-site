# Arquitetura

## Domínio e arquivos

O domínio usa `ContentRecord` (`web/src/lib/content/model.ts`), validado com Zod. `authors` é `string[]`; `pgpIds`, `areaIds`, `keywordIds` e `selectedIds` guardam referências por ID. O identificador e a pasta permanecem estáveis quando o título ou slug mudam. O campo `collection` assume `items` (conteúdos), `pgps`, `areas`, `keywords`, `guides`, `pages` ou `settings`. `kind` classifica `items` em `article`, `text`, `material`, `post` ou `notice`; `pageKind` (`about`, `contact` ou `free`) distingue as páginas. Campos bilíngues são `{ pt, en }`, e `field()` usa o português quando falta o inglês.

```
content/
  published/<collection>/<id>/meta.yaml
  published/<collection>/<id>/pt.md
  published/<collection>/<id>/en.md
  drafts/<collection>/<id>/meta.yaml
  drafts/<collection>/<id>/pt.md
  drafts/<collection>/<id>/en.md
```

Os metadados são compartilhados entre os idiomas; o corpo de cada idioma é Markdown. `codec.ts` serializa e lê esses arquivos; só caminhos que casam com `contentPath` são aceitos, e texto sem `meta.yaml` invalida o snapshot. A gravação de um rascunho mantém os arquivos publicados. Publicar substitui o conjunto publicado e remove seu rascunho no mesmo commit.

O snapshot completo é validado antes de substituir o anterior. Publicações com relações ausentes, endereços repetidos ou dados obrigatórios inválidos impedem a atualização. Rascunhos aceitam os dados editoriais incompletos, mas continuam sujeitos ao formato do schema.

## Rotas e i18n

Idiomas: `pt` (padrão) e `en`. O middleware redireciona caminhos sem prefixo para o idioma de `Accept-Language` e propaga `x-lang` e `x-pathname`; ignora `/_next`, `/api`, `/admin`, `/media`, sitemaps, `robots.txt`, rotas de ícone/OG e arquivos com extensão. Os segmentos são traduzidos em `i18n/routes.ts` (por exemplo `publicacoes`/`publications`, `guias`/`guides`, `palavras-chave`/`keywords`, `sobre`/`about`, `contato`/`contact`, `busca`/`search`, `paginas`/`pages`).

- `/[lang]`: início. `/[lang]/[section]`: listagem (com filtros e paginação de 12 itens), `sobre` e `contato`.
- `/[lang]/[section]/[slug]`: detalhe. `publications` e `blog` leem `items`, separados por `kind`; páginas livres ficam em `paginas`.
- Aliases antigos (`topicos`, `areas-de-pesquisa` e equivalentes em inglês) redirecionam com 308. Em detalhes, um endereço com segmento de outro idioma ou slug antigo redireciona para o canônico; listagens com segmento no idioma errado retornam 404.
- `/admin`, `/admin/login`, `/admin/new/[collection]` e `/admin/edit/[collection]/[id]`; `/media/[name]`; `/api/admin/*`. As páginas públicas e o painel são dinâmicos (`force-dynamic`).
- Textos de interface do portal ficam em `features/portal/copy.ts`; `i18n/pt.json` e `en.json` são usados pelo aviso de tradução e pela paginação.

## SEO

`detailMetadata` e `listMetadata` definem título, canonical, alternates `pt-BR`/`en` e Open Graph. Artigos acrescentam metadados `citation_*` (Google Scholar) e JSON-LD. A busca usa `noindex`. `robots.txt` bloqueia `/admin` e `/api/`. Os sitemaps (`/sitemap.xml`, `sitemap-pages.xml`, `sitemap-pgps.xml`, `sitemap-publicacoes.xml`) são gerados do snapshot público, com `hreflang` e `lastmod`; configurações não entram. `NEXT_PUBLIC_SITE_URL`/`SITE_URL` definem a base absoluta.

## Git e atualização

O adaptador GitHub usa a Git Data API: lê branch, árvore e blobs; cria uma árvore e um commit; atualiza a referência sem `force`. Só aceita caminhos de registros sob `content/`. Um token granular de um repositório fica exclusivamente no servidor.

A revisão enviada pelo editor é um hash das versões publicada e rascunho. A API recusa uma gravação desatualizada com HTTP 409. Operações do processo são serializadas; conflitos com outros processos ou edições diretas são rejeitados pela atualização não forçada da branch. O editor preserva os dados e permite baixar uma cópia.

O servidor mantém um snapshot em memória e, quando configurado, uma cópia persistente. Publicações confirmadas atualizam o snapshot imediatamente. Requisições consultam alterações externas após 60 segundos. Falhas preservam o último snapshot válido; gravações exigem leitura atual do Git e não funcionam offline. No primeiro boot, sem snapshot válido nem acesso ao Git, o serviço não inventa um acervo vazio.

O driver é escolhido por `CONTENT_DRIVER` (`github` ou `local`); sem a variável, `GITHUB_REPOSITORY` presente seleciona o GitHub. O cache persistente é `CONTENT_CACHE_DIR/snapshot.json`, gravado de forma atômica e relido apenas se a sincronização falhar sem snapshot em memória. O `head` do driver local é um hash do conteúdo; o do GitHub é o SHA do commit.

O driver local existe para desenvolvimento e testes. Escrita local precisa de `CONTENT_ALLOW_LOCAL_WRITES=true` e fica desabilitada em produção. Ele não fornece commits nem as garantias de atomicidade remota do adaptador GitHub.

## Painel e autenticação

`/admin` usa autenticação própria, com usuários configurados no servidor. Senhas usam scrypt com salt aleatório. Sessões HS256 têm duração de oito horas, cookie HttpOnly/SameSite e Secure em produção. Alterar/remover a credencial invalida suas sessões. Há limitação de tentativas em memória por usuário (10) e por IP (30) a cada 15 minutos; o IP vem de `X-Real-IP`, definido pelo proxy. Mutações exigem sessão válida e Origin correspondente a `SITE_URL`.

As rotas `/api/admin/login`, `/logout`, `/records` e `/uploads` atendem o painel; login e logout dispensam sessão, mas exigem Origin válida. GET de registros é autenticado e não armazenável em cache. POST de registros recebe `{ record, revision, action }`, onde a ação é `draft`, `publish`, `unpublish` ou `archive`. Erros de validação retornam 422, conflito 409, sessão ausente 401 e falhas de integração 503.

O editor visual é carregado apenas no painel. O frontend público interpreta Markdown sem executar HTML/MDX. Autores nunca são referências a contas.

## Mídias e operação

Imagens JPEG, PNG e WebP são verificadas e reprocessadas com Sharp (limite de 40 megapixels). PDFs precisam de assinatura e marcador de término. O tamanho máximo é 20 MB. `MEDIA_DIR` é obrigatório em produção. Arquivos recebem nome por hash do conteúdo e são servidos em `/media/<hash>.<ext>`, com `nosniff` e cache imutável. Mídias ficam em volume persistente fora da implantação e não entram no Git; `scripts/media-backup.mjs` faz backup e restauração.

Use uma instância Node para esta configuração inicial. Ao adicionar outras instâncias, compartilhe o volume de mídia e reveja a limitação de tentativas distribuída. Mesmo entre instâncias, a proteção de conflito no Git continua obrigatória.

## Consolidação do editor

O estado do formulário e a confirmação de gravação são separados. Ao receber uma resposta, o editor adota a nova revisão e os metadados do servidor, preservando campos alterados depois do envio. `VersionedRecord.publishedRecord` fornece a versão pública para **Ver publicação** sem depender do slug do rascunho. O payload de erros inclui `issues: [{ path, message }]` para feedback junto aos campos.

Cópias locais usam um envelope versionado, com revisão de base, timestamp e estado parcial do formulário. A chave inclui conta, registro/novo-registro e aba. O schema da cópia local admite campos incompletos; a validação editorial continua obrigatória ao gravar no servidor. Não há gravação automática de rascunhos no Git. Cópias não substituem o backup do acervo. Conflitos conservam o texto local e exigem uma escolha explícita antes de atualizar a revisão de base.

A apresentação da página é compartilhada entre o portal e a prévia do painel, sem consultas privadas dentro do componente de leitura. Guias em prévia usam os mesmos critérios de seleção e deduplicação do portal.

`previousSlugs` tem listas PT/EN opcionais nos arquivos antigos (normalizadas para listas vazias). Na publicação, o servidor preserva o histórico conhecido e acrescenta os slugs substituídos, inclusive quando o inglês usava fallback para português. A busca por endereço reconhece atuais e anteriores e redireciona diretamente para o atual, sem cadeia de redirecionamentos. A validação reserva os endereços entre os idiomas e históricos de registros publicados da mesma coleção. Nenhuma reescrita em massa dos arquivos antigos é necessária.

O middleware propaga o caminho para o layout raiz resolver o endereço canônico antes de enviar HTML, mantendo o status HTTP 308 mesmo com streaming do Next.js. Erros esperados do domínio usam uma marca compartilhada entre bundles do servidor para preservar 409/422/503 ao atravessar o store global e as rotas de API.
