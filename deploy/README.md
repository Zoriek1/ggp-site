# Arquivos de implantação

Exemplos para um servidor Linux com systemd e Nginx. Os caminhos assumem release ativa em `/srv/ggp/current`, usuário/grupo `ggp` e variáveis em `/etc/ggp/portal.env`; ajuste ao servidor real. O procedimento completo está em [`docs/DEPLOY.md`](../docs/DEPLOY.md).

| Arquivo | Função |
| --- | --- |
| `ggp.service` | Unit do portal: executa `node server.js` (standalone) em `/srv/ggp/current/web`, com `NODE_ENV=production`, `HOSTNAME=127.0.0.1` e `PORT=3000`. Lê `/etc/ggp/portal.env`, reinicia em falha (5 s), usa `UMask=0027`, `NoNewPrivileges` e `PrivateTmp`. |
| `ggp-backup.service` | Serviço `oneshot` que executa `web/scripts/media-backup.mjs backup ${MEDIA_DIR} ${BACKUP_DIR}` como `ggp`, com `UMask=0077`. Exige `MEDIA_DIR` e `BACKUP_DIR` no arquivo de ambiente. |
| `ggp-backup.timer` | Dispara o backup diariamente às 03:00 (`America/Sao_Paulo`), com atraso aleatório de até 15 min e `Persistent=true` (executa backups perdidos com o host desligado). |
| `nginx.conf` | Trecho `location /` para o servidor TLS: proxy para `127.0.0.1:3000`, `client_max_body_size 21m` (uploads de até 20 MB), `Host`, `X-Real-IP` (sobrescrito), `X-Forwarded-For`/`-Proto` e `proxy_read_timeout 180s`. Certificado e redirecionamento HTTP para HTTPS ficam com o servidor. |

## Instalação das units

```bash
sudo cp ggp.service ggp-backup.service ggp-backup.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now ggp.service ggp-backup.timer
```

O diretório de `BACKUP_DIR` deve existir e ser gravável por `ggp`. Verifique o agendamento com `systemctl list-timers ggp-backup.timer`.
