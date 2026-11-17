# Conteúdo

Fonte de verdade do portal: todo o conteúdo editorial vive aqui, em arquivos versionados no Git. O schema é definido em `web/src/lib/content/model.ts` e a leitura/escrita em `web/src/lib/content/codec.ts`. Os arquivos são gravados pelo painel editorial; edição manual é possível, mas passa pela mesma validação.

## Estrutura

```
content/
  published/<coleção>/<id>/   conteúdo público
  drafts/<coleção>/<id>/      rascunhos (nunca aparecem no site)

# cada pasta <id>/ (em published/ e em drafts/) contém:
  meta.yaml                   metadados
  pt.md                       corpo em português
  en.md                       corpo em inglês (pode ficar vazio)
```

- Coleções válidas: `items`, `pgps`, `areas`, `keywords`, `guides`, `pages`, `settings`. Qualquer outro arquivo em `content/` faz o carregamento falhar (`contentPath` em `codec.ts`).
- Cada registro tem os três arquivos; `pt.md`/`en.md` sem `meta.yaml` são rejeitados.
- O corpo (`body`) não fica no `meta.yaml`: vem de `pt.md` e `en.md`.
- Um mesmo `id` pode existir em `published/` e em `drafts/` (rascunho de uma edição de conteúdo já publicado).

## IDs

- Formato: `^[a-z0-9][a-z0-9-]{0,95}$` (minúsculas, números e hífens).
- O `id` é o nome da pasta e deve coincidir com `id` e `collection` do `meta.yaml`; caso contrário o carregamento falha.
- O `id` é estável. O endereço público vem de `slug`, que pode mudar; os slugs antigos ficam em `previousSlugs` e continuam redirecionando para o endereço atual.
- Os IDs atuais seguem prefixos por convenção (`pgp-`, `area-`, `topic-`, `pub-`, `page-`), mas o código só exige o formato acima.

## Referências por ID

Um registro aponta para outros pelo `id`, nunca pelo slug:

| Campo | Coleção referenciada |
| --- | --- |
| `pgpIds` | `pgps` |
| `areaIds` | `areas` |
| `keywordIds` | `keywords` |
| `selectedIds` | `items` (leituras selecionadas) |

Um registro publicado (e não arquivado) só pode referenciar IDs que também estejam em `published/`; do contrário o carregamento falha com "Referência ausente". Rascunhos podem estar incompletos.

## `meta.yaml`

Todas as coleções compartilham o mesmo schema (`recordSchema`); cada coleção usa só parte dos campos. `id`, `collection`, `title.pt`, `slug.pt` e `updatedAt` são obrigatórios; o restante tem valor padrão.

Campos comuns:

| Campo | Tipo | Observações |
| --- | --- | --- |
| `id`, `collection` | string | ver acima |
| `title` | `{pt, en}` | `pt` obrigatório, até 240 caracteres |
| `slug` | `{pt, en}` | `pt` obrigatório; `en` opcional; únicos entre registros publicados |
| `previousSlugs` | `{pt[], en[]}` | slugs antigos reservados para redirecionamento |
| `summary` | `{pt, en}` | resumo |
| `kind` | `article`, `text`, `material`, `post`, `notice` | padrão `text` |
| `archived` | boolean | arquivado sai das listagens públicas |
| `featured` | boolean | destaque |
| `publishedAt` | data ISO | opcional |
| `updatedAt` | data ISO | obrigatório |

Quando `en` está vazio, o site usa o texto em português.

### Por entidade

- **`items`** (publicações, textos, materiais, posts e comunicados): `kind`, `authors`, `pgpIds`, `areaIds`, `keywordIds`, `institution`, `year` (1800 a 2200), `venue`, `doi` (formato `10.xxxx/...`), `externalUrl`, `attachments` (`url`, `label`, `alt`, `type`: `image`, `pdf` ou `link`). Regras de publicação: pelo menos um autor; `article` exige ao menos um PGP; exceto `post` e `notice`, exige ao menos uma área; é preciso ter texto em `pt.md`, `externalUrl` ou anexo; imagens exigem texto alternativo.
- **`pgps`**: `title`, `slug`, `summary` e corpo; usados como destino de `pgpIds`.
- **`areas`** (áreas de conhecimento): `title`, `slug`, `summary`, corpo.
- **`keywords`** (palavras-chave): `title`, `slug`, `summary`, corpo.
- **`pages`**: `pageKind` (`about`, `contact` ou `free`, padrão `free`), `contactEmail` e `links` (`label`, `url`). Só pode haver uma página publicada e não arquivada de cada tipo `about` e `contact`.
- **`settings`**: configurações do portal; só pode existir um registro publicado (hoje `settings/sitesettings`). `title` e `summary` ficam no próprio registro e `links` guarda as redes sociais (`label`, `url`).
- **`guides`**: aceita o mesmo schema e é reconhecida pelo carregador e pelas rotas de detalhe, mas hoje não há conteúdo nessa coleção.

Os campos não usados por uma coleção permanecem no arquivo com o valor padrão (listas vazias, strings vazias, `false`).

### URLs

`url`, `externalUrl` e `attachments[].url` aceitam `http(s)://...` ou um arquivo enviado pelo painel, no formato `/media/<sha256>.<jpg|png|webp|pdf>`.

## Validação

O carregamento do snapshot falha se houver: arquivo fora do padrão, identidade inconsistente, publicação inválida, referência a registro não publicado ou slug duplicado/reservado entre registros da mesma coleção (inclui slugs antigos). Ver `parseSnapshot` em `web/src/lib/content/codec.ts` e `publicationIssues` em `model.ts`.

## Importação e seed

O conteúdo inicial foi gerado por `npm run seed:content` (`web/scripts/seed-content.ts`). Exportações do Sanity são convertidas por `npm run import:sanity` (`web/scripts/import-sanity.ts`). Detalhes em `legacy/README.md`.
