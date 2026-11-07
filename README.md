# Portal GGP / PGPs

Portal de pesquisa, publicação e estudo do GGP/UFG. O site e o painel usam Next.js 15, React 19 e TypeScript. O conteúdo é formado por arquivos YAML e Markdown versionados no mesmo repositório; o site ativo não depende do Sanity.

## Estrutura

- `web/`: portal PT/EN, painel `/admin`, APIs autenticadas, importadores e testes.
- `content/published/`: versões publicadas, organizadas por entidade e ID.
- `content/drafts/`: rascunhos independentes da versão pública.
- `legacy/`: Studio e módulos da implementação anterior, fora da aplicação ativa.
- `docs/`: operação, publicação e implantação.

Um registro contém `meta.yaml`, `pt.md` e `en.md`. Autores são uma lista ordenada de nomes. PGPs, áreas e palavras-chave são referências por ID; um artigo pode aparecer em vários grupos sem duplicação. Guias combinam leituras manuais com conteúdos de qualquer PGP que correspondam a pelo menos uma palavra-chave selecionada.

## Desenvolvimento

Requisitos: Node.js 22.12+ e npm. Para as rotinas de backup, GNU tar. Chromium é necessário somente para os testes de navegador.

```bash
cd web
npm ci
cp .env.example .env.local
# Configure a conta e SESSION_SECRET seguindo docs/DEPLOY.md.
# Para testar a publicação sem GitHub, use CONTENT_ALLOW_LOCAL_WRITES=true.
npm run dev
```

Portal: `http://localhost:3000/pt`. Painel: `http://localhost:3000/admin`.

Os registros iniciais já estão no repositório: 22 PGPs, taxonomias, página sobre, configuração e sete artigos em rascunho. Os artigos precisam de revisão de autoria, vínculo com PGP e texto/link/arquivo antes de publicar. `npm run seed:content` repõe arquivos iniciais ausentes sem sobrescrever os existentes.

## Verificação

```bash
cd web
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
```

Os testes de navegador usam um acervo e credenciais descartáveis em `work/e2e/`, sem alterar o conteúdo real nem enviar commits. Configure `CHROMIUM_PATH` se Chromium estiver em outro caminho. Os testes Git usam uma API simulada para conferir conflitos, falhas e commits atômicos sem escrever no GitHub.

## Produção

Use `CONTENT_DRIVER=github`, credencial granular com permissão de conteúdo limitada ao repositório, login configurado e diretórios persistentes para mídias e cache. Conteúdo publicado aparece sem recompilar a aplicação. Mudanças feitas diretamente no Git são consultadas a cada 60 segundos, conforme chegam requisições.

**Este repositório é público: os rascunhos e suas versões anteriores também são públicos no Git.** A conta do painel restringe a edição; rascunho significa não listado no portal, não conteúdo confidencial. Arquivos enviados possuem URL pública.

Veja [implantação e recuperação](docs/DEPLOY.md), [política editorial](docs/EDITORIAL.md) e [arquitetura](docs/ARCHITECTURE.md).

## Capturas das telas

Veja [portal, login, painel e editor em desktop e celular](docs/SCREENS.md). As capturas usam dados de teste da validação local.
