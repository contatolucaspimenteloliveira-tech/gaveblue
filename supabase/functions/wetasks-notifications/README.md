# Notificações agendadas do WeTasks

Configure os segredos antes de publicar a função:

- `WETASKS_VAPID_PUBLIC_KEY`: ponto público P-256 em Base64 URL.
- `WETASKS_VAPID_PRIVATE_KEY`: JWK privado serializado. Nunca enviar ao navegador.
- `WETASKS_VAPID_SUBJECT`: `mailto:contato@gaveblue.com.br`.
- `WETASKS_CRON_SECRET`: segredo aleatório usado apenas pelo Cron.

Depois de aplicar a migration e publicar a função, crie no Supabase Cron uma chamada a cada minuto para:

`POST https://wkssfugzghwifaddagfr.supabase.co/functions/v1/wetasks-notifications`

Inclua o header `x-wetasks-cron-secret`. Armazene a URL e o segredo no Vault do projeto, nunca no repositório.
