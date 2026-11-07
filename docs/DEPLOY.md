# Desenvolvimento, implantação e recuperação

## Requisitos

Node.js 22.12+, npm e GNU tar. O pacote mantém Next.js standalone. O destino pode ser UFG ou outro servidor Linux com TLS e Nginx; o repositório não contém credenciais ou uma implantação ativa configurada.

## Preparar a conta

```bash
cd web
npm ci
cp .env.example .env.local
# Em Bash, leia sem ecoar nem colocar a senha no histórico:
read -rsp 'Senha do painel (mínimo 12 caracteres): ' PANEL_PASSWORD
printf '\n'
printf '%s' "$PANEL_PASSWORD" | npm run --silent password:hash
unset PANEL_PASSWORD
node -e 'process.stdout.write(require("node:crypto").randomBytes(32).toString("hex") + "\n")'
```

Copie o hash scrypt para `PANEL_USERS_JSON` e o segredo aleatório para `SESSION_SECRET`. Exemplo de formato, usando o hash real gerado:

```
PANEL_USERS_JSON='[{"id":"grupo","username":"grupo","passwordHash":"scrypt:SALT:HASH"}]'
SESSION_SECRET=SEGREDO_ALEATORIO_GERADO
```

Não use os marcadores acima como credenciais. O painel sem configuração recusa o acesso. Para adicionar contas, acrescente entradas com IDs e nomes únicos ao array; todas têm as mesmas permissões. Reinicie o serviço após mudanças. Remover uma conta, alterar seu hash ou trocar o segredo invalida suas sessões. Não há cadastro público, recuperação de senha por e-mail nem cargos nesta versão.

## Desenvolvimento local

Em `web/.env.local`, use `CONTENT_DRIVER=local`, `CONTENT_ALLOW_LOCAL_WRITES=true` e os valores de acesso gerados. Execute `npm run dev`. O portal abre em `/pt` ou `/en`; o painel em `/admin`.

A escrita local é apenas um recurso de desenvolvimento: não envia commits e é bloqueada com `NODE_ENV=production`. Para validar produção use a integração GitHub em uma branch de homologação. Os arquivos iniciais já estão em `content/`; `npm run seed:content` apenas cria arquivos ausentes.

## Integração GitHub e configuração de produção

Crie um token granular limitado ao repositório escolhido, com **Contents: Read and write**. Ele precisa poder atualizar a branch configurada; regras que exijam PR/aprovação são incompatíveis com publicação direta. Guarde o token exclusivamente no servidor.

Crie `/etc/ggp/portal.env`, legível apenas pelo responsável e pelo usuário do serviço. Configure:

```
SITE_URL=https://ggp.ufg.br
NEXT_PUBLIC_SITE_URL=https://ggp.ufg.br
CONTENT_DRIVER=github
GITHUB_REPOSITORY=Zoriek1/ggp-site
GITHUB_BRANCH=main
GITHUB_TOKEN=TOKEN_REAL
CONTENT_ROOT=/srv/ggp/current
MEDIA_DIR=/var/lib/ggp/media
CONTENT_CACHE_DIR=/var/lib/ggp/cache
BACKUP_DIR=/var/backups/ggp
PANEL_USERS_JSON='[{"id":"grupo","username":"grupo","passwordHash":"HASH_REAL"}]'
SESSION_SECRET=SEGREDO_REAL
```

O domínio acima é o destino previsto no projeto; substitua pelo destino efetivamente disponibilizado. `SITE_URL` é a origem autorizada para gravações e a base das URLs. Passe a mesma URL durante a compilação para as metatags. Use HTTPS em produção, pois o cookie é Secure. Publique os arquivos iniciais e o código na branch antes do primeiro boot. Se o Git não estiver disponível e não houver cache válido, corrija a integração antes de abrir o serviço.

**Os arquivos de rascunho são públicos no Git; uploads também têm URL pública.** Não há garantia de remoção das versões anteriores ao arquivar ou retirar uma publicação.

## Compilar e distribuir

```bash
cd web
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

Execute `npm run package:release -- /caminho/para/nova-release` para gerar uma release completa, incluindo assets, scripts operacionais e exemplos de serviço. O destino deve ser uma pasta nova. O empacotador exclui arquivos de ambiente; configure-os externamente no servidor.

O build inclui a raiz de conteúdo e gera `.next/standalone/web/server.js`. Copie **todo o conteúdo** de `.next/standalone/` para uma pasta de release, preservando a estrutura. Copie também `.next/static/` para `web/.next/static/` dentro dela. Se houver `web/public/`, copie para o mesmo caminho na release. Na montagem manual, inclua também `web/scripts/media-backup.mjs` e os exemplos de `deploy/`. Não coloque mídias ou cache dentro da release.

Execute com o diretório de trabalho `web/` da release:

```bash
NODE_ENV=production HOSTNAME=127.0.0.1 PORT=3000 node server.js
```

Forneça as variáveis ao processo pelo gerenciador de serviço. `npm start` não é o comando da distribuição standalone.

Crie um usuário de serviço `ggp`, os diretórios de mídia/cache com permissão de escrita para ele e o arquivo de ambiente. Garanta que esse usuário consiga ler a release completa (ajuste proprietário/grupo na cópia, incluindo arquivos que chegaram com permissão restrita). Use `deploy/ggp.service` como unit systemd e o trecho de `deploy/nginx.conf` no virtual host TLS. O Node fica restrito a localhost; o Nginx sobrescreve `X-Real-IP`. A configuração inicial considera uma instância Node.

Faça o deploy em pastas de release e use `/srv/ggp/current` como link para a versão ativa. Troque o link somente após a validação e reinicie o serviço. Preserve a release anterior. Alterações editoriais não exigem novo build; mudanças no código exigem nova release.

## Homologação e verificação

```bash
cd web
npm run test:e2e
```

O teste usa Chromium em `/usr/bin/chromium` (ou `CHROMIUM_PATH`), conta descartável e cópia dos dados em `work/e2e/`. Confere login, proteção das APIs, criação de áreas/PGPs, upload, publicação, guia, rascunhos, idiomas e sitemaps. Os testes Git simulam a API sem fazer commits externos; antes de produção, confira uma publicação real em branch de homologação com o token configurado.

Na homologação, valide também atualização feita diretamente no Git após 60 segundos, reinício com GitHub temporariamente indisponível e cache válido, persistência das mídias entre releases e logs do serviço. O diário registra tipo/status da falha sem tokens, senhas ou texto completo dos documentos.

## Importar exportação Sanity

Extraia o arquivo NDJSON da exportação e execute numa cópia de trabalho:

```bash
cd web
MEDIA_DIR=/caminho/persistente/media npm run import:sanity -- /caminho/data.ndjson
```

O importador converte os tipos desta versão, transforma Portable Text em Markdown, resolve autores para nomes e baixa assets do CDN Sanity para o armazenamento de mídias. Registros incompletos ficam em rascunho; tipos adiados aparecem no relatório do terminal. Arquivos existentes interrompem a operação para evitar sobrescrita; use `--overwrite` somente após comparar os dados. A importação é local: revise o diff e só então versione os arquivos. O acervo remoto atual não é consultado automaticamente.

## Backup e restauração

O Git preserva os textos; mantenha também uma cópia independente do repositório. Para mídias:

```bash
cd web
node scripts/media-backup.mjs backup /var/lib/ggp/media /var/backups/ggp
node scripts/media-backup.mjs restore /var/backups/ggp/media-DATA.tar.gz /var/lib/ggp/media-restaurada
```

O backup gera checksum. A restauração valida checksum, caminhos, tipos de entrada e hashes dos arquivos antes de copiá-los. Teste a restauração em outro diretório e aponte temporariamente a homologação para ele. Não apague o armazenamento original durante o teste.

Os exemplos `deploy/ggp-backup.service` e `deploy/ggp-backup.timer` agendam o backup diariamente às 03h de São Paulo, com atraso aleatório de até 15 minutos. Configure `BACKUP_DIR`, crie-o com permissão para o usuário `ggp`, instale as units e habilite `ggp-backup.timer`. Alternativamente use o cron. Copie os arquivos e checksums para um armazenamento independente do host e defina retenção conforme o espaço disponível. Preserve o cache e a configuração secreta separadamente, com acesso restrito. Mídias não são removidas automaticamente ao desvincular um arquivo.

Para reverter código, aponte `current` para a release anterior e reinicie. Para reverter conteúdo, use um commit de reversão dos registros envolvidos; confira as relações e permita que o portal carregue o snapshot validado. Não force a branch. Para imagens/PDFs perdidos, restaure os arquivos com seus nomes originais por hash.
