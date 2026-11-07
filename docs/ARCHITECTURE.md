# Arquitetura

## Domínio e arquivos

O domínio usa `ContentRecord`, validado com Zod. `authors` é `string[]`; `pgpIds`, `areaIds`, `keywordIds` e `selectedIds` guardam referências por ID. O identificador e a pasta permanecem estáveis quando o título ou slug mudam. O campo `collection` distingue conteúdos, PGPs, áreas, palavras-chave, guias, páginas e configurações. `kind` classifica artigos, textos, materiais, posts e comunicados.

```
content/
  published/<collection>/<id>/meta.yaml
  published/<collection>/<id>/pt.md
  published/<collection>/<id>/en.md
  drafts/<collection>/<id>/meta.yaml
  drafts/<collection>/<id>/pt.md
  drafts/<collection>/<id>/en.md
```

Os metadados são compartilhados entre os idiomas; o corpo de cada idioma é Markdown. A gravação de um rascunho mantém os arquivos publicados. Publicar substitui o conjunto publicado e remove seu rascunho no mesmo commit.

O snapshot completo é validado antes de substituir o anterior. Publicações com relações ausentes, endereços repetidos ou dados obrigatórios inválidos impedem a atualização. Rascunhos aceitam os dados editoriais incompletos, mas continuam sujeitos ao formato do schema.

## Git e atualização

O adaptador GitHub usa a Git Data API: lê branch, árvore e blobs; cria uma árvore e um commit; atualiza a referência sem `force`. Só aceita caminhos de registros sob `content/`. Um token granular de um repositório fica exclusivamente no servidor.

A revisão enviada pelo editor é um hash das versões publicada e rascunho. A API recusa uma gravação desatualizada com HTTP 409. Operações do processo são serializadas; conflitos com outros processos ou edições diretas são rejeitados pela atualização não forçada da branch. O editor preserva os dados e permite baixar uma cópia.

O servidor mantém um snapshot em memória e, quando configurado, uma cópia persistente. Publicações confirmadas atualizam o snapshot imediatamente. Requisições consultam alterações externas após 60 segundos. Falhas preservam o último snapshot válido; gravações exigem leitura atual do Git e não funcionam offline. No primeiro boot, sem snapshot válido nem acesso ao Git, o serviço não inventa um acervo vazio.

O driver local existe para desenvolvimento e testes. Escrita local precisa de configuração explícita e fica desabilitada em produção. Ele não fornece commits nem as garantias de atomicidade remota do adaptador GitHub.

## Painel e autenticação

`/admin` usa autenticação própria, com usuários configurados no servidor. Senhas usam scrypt com salt aleatório. Sessões HS256 têm duração de oito horas, cookie HttpOnly/SameSite e Secure em produção. Alterar/remover a credencial invalida suas sessões. Há limitação de tentativas por usuário e endereço IP. Mutações exigem sessão válida e Origin correspondente a `SITE_URL`.

As rotas `/api/admin/login`, `/logout`, `/records` e `/uploads` atendem o painel; somente o login dispensa sessão. GET de registros é autenticado e não armazenável em cache. POST de registros recebe `{ record, revision, action }`, onde a ação é `draft`, `publish`, `unpublish` ou `archive`. Erros de validação retornam 422, conflito 409, sessão ausente 401 e falhas de integração 503.

O editor visual é carregado apenas no painel. O frontend público interpreta Markdown sem executar HTML/MDX. Autores nunca são referências a contas.

## Mídias e operação

Imagens são verificadas e reprocessadas com Sharp. PDFs precisam de assinatura e marcador de término. O tamanho máximo é 20 MB. Arquivos recebem nome por hash do conteúdo e são servidos em `/media/<hash>.<ext>`, com `nosniff` e cache imutável. Mídias ficam em volume persistente fora da implantação e não entram no Git.

Use uma instância Node para esta configuração inicial. Ao adicionar outras instâncias, compartilhe o volume de mídia e reveja a limitação de tentativas distribuída. Mesmo entre instâncias, a proteção de conflito no Git continua obrigatória.

## Consolidação do editor

O estado do formulário e a confirmação de gravação são separados. Ao receber uma resposta, o editor adota a nova revisão e os metadados do servidor, preservando campos alterados depois do envio. `VersionedRecord.publishedRecord` fornece a versão pública para **Ver publicação** sem depender do slug do rascunho. O payload de erros inclui `issues: [{ path, message }]` para feedback junto aos campos.

Cópias locais usam um envelope versionado, com revisão de base, timestamp e estado parcial do formulário. A chave inclui conta, registro/novo-registro e aba. O schema da cópia local admite campos incompletos; a validação editorial continua obrigatória ao gravar no servidor. Não há gravação automática de rascunhos no Git. Cópias não substituem o backup do acervo. Conflitos conservam o texto local e exigem uma escolha explícita antes de atualizar a revisão de base.

A apresentação da página é compartilhada entre o portal e a prévia do painel, sem consultas privadas dentro do componente de leitura. Guias em prévia usam os mesmos critérios de seleção e deduplicação do portal.

`previousSlugs` tem listas PT/EN opcionais nos arquivos antigos (normalizadas para listas vazias). Na publicação, o servidor preserva o histórico conhecido e acrescenta os slugs substituídos, inclusive quando o inglês usava fallback para português. A busca por endereço reconhece atuais e anteriores e redireciona diretamente para o atual, sem cadeia de redirecionamentos. A validação reserva os endereços entre os idiomas e históricos de registros publicados da mesma coleção. Nenhuma reescrita em massa dos arquivos antigos é necessária.

O middleware propaga o caminho para o layout raiz resolver o endereço canônico antes de enviar HTML, mantendo o status HTTP 308 mesmo com streaming do Next.js. Erros esperados do domínio usam uma marca compartilhada entre bundles do servidor para preservar 409/422/503 ao atravessar o store global e as rotas de API.
