# Deploy — Site do GGP

## Ambiente de desenvolvimento (atual)

```powershell
# 1. Instalar dependências
cd web;     npm install
cd ../studio; npm install

# 2. Configurar Sanity (uma vez)
cd studio
npx sanity login                 # autenticar no Sanity (gratuito)
npx sanity init --env            # cria projeto e gera .env

# Copiar PROJECT_ID gerado e preencher web/.env.local:
#   NEXT_PUBLIC_SANITY_PROJECT_ID=<id>
#   NEXT_PUBLIC_SANITY_DATASET=production

# 3. Rodar (em dois terminais)
cd studio; npm run dev   # http://localhost:3333 — painel de edição
cd web;    npm run dev   # http://localhost:3000 — site público
```

## Deploy futuro em `GGP.ufg.br`

Pré-requisitos negociados com o CTI/UFG:

- Servidor Linux com **Node.js 20+**.
- Domínio `ggp.ufg.br` apontando para o servidor.
- Nginx reverse proxy.
- Certificado TLS (Let's Encrypt ou o que a UFG provê).
- Acesso para fazer deploy (Git ou rsync).

### Build do site (Next.js standalone)

`next.config.ts` já está com `output: "standalone"`. Build gera tudo que precisa:

```bash
cd web
npm ci
npm run build
# .next/standalone/ contém o servidor; .next/static/ os assets; public/ os arquivos públicos.
```

### Como rodar no servidor

```bash
# Estrutura mínima no servidor:
#   /var/www/ggp/web/
#     ├─ .next/static/
#     ├─ public/
#     └─ server.js   (vem do standalone)

cd /var/www/ggp/web
NODE_ENV=production \
NEXT_PUBLIC_SANITY_PROJECT_ID=xxx \
NEXT_PUBLIC_SANITY_DATASET=production \
NEXT_PUBLIC_SITE_URL=https://ggp.ufg.br \
PORT=3000 \
node server.js
```

Recomendado rodar via **systemd** (ou PM2). Exemplo de unit:

```ini
# /etc/systemd/system/ggp-web.service
[Unit]
Description=GGP website (Next.js)
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/ggp/web
EnvironmentFile=/var/www/ggp/web/.env.production
ExecStart=/usr/bin/node server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

### Nginx reverse proxy

```nginx
server {
    listen 443 ssl http2;
    server_name ggp.ufg.br;

    ssl_certificate     /etc/letsencrypt/live/ggp.ufg.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ggp.ufg.br/privkey.pem;

    location /_next/static/ {
        alias /var/www/ggp/web/.next/static/;
        access_log off;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name ggp.ufg.br;
    return 301 https://$host$request_uri;
}
```

### Sanity Studio — duas opções

1. **Hospedagem grátis Sanity**: `cd studio && npx sanity deploy` → fica em `ggp.sanity.studio` (ou nome escolhido). Recomendado.
2. **Subdiretório do próprio site**: `cd studio && npm run build` e servir `studio/dist/` em `https://ggp.ufg.br/admin`. Mais trabalho, sem ganho real.

### Webhook de revalidação (ISR on-demand)

No projeto Sanity → Manage → API → Webhooks, criar:

- **URL**: `https://ggp.ufg.br/api/revalidate`
- **Dataset**: `production`
- **Trigger on**: Create, Update, Delete
- **Filter**: `_type in ["publication","thesis","teachingMaterial","media","resource","event","member","page","siteSettings"]`
- **Projection**: `{ _type, "slug": slug.pt.current }`
- **HTTP method**: POST
- **HTTP Headers**: nenhum
- **Secret**: o mesmo valor de `SANITY_REVALIDATE_SECRET` no `.env.production` do site.

Assim conteúdo editado no Studio aparece no site em segundos.

### Por que NÃO usamos `next export`

`next export` (gera site 100% estático) **quebra**:
- ISR (`revalidate`),
- rotas de webhook (`/api/revalidate`),
- sitemap dinâmico,
- alguns recursos de `next/image`.

Como o site é repositório que cresce, ISR é essencial. `output: "standalone"` é o caminho.

## Checklist antes do go-live

- [ ] `NEXT_PUBLIC_SITE_URL` aponta para o domínio final.
- [ ] Webhook de revalidação configurado e testado.
- [ ] `robots.txt` permite indexação (`Allow: /`).
- [ ] Sitemap aparece em `https://ggp.ufg.br/sitemap.xml` e responde 200.
- [ ] Google Search Console: propriedade adicionada e sitemap submetido.
- [ ] Google Scholar: pelo menos uma publicação com `citation_*` tags validada via Scholar Inspector.
- [ ] Lighthouse ≥ 90 em Performance, ≥ 95 em SEO, ≥ 90 em Acessibilidade.
- [ ] Backup do dataset Sanity agendado (`sanity dataset export production backup.tar.gz`, semanal).
