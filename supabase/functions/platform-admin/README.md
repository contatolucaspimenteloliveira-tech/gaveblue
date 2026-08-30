# Edge Function `platform-admin`

Publique com autenticação JWT obrigatória:

```bash
supabase functions deploy platform-admin
```

Segredos necessários:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1`
- `APPWRITE_PROJECT_ID=6a68cb3e00312ec0a3fd`
- `APPWRITE_API_KEY` com `users.read` e `users.write`
- `ADMIN_APP_URL=https://gaveblue.com.br/admin/`

A chave `service_role` e a chave do Appwrite ficam somente na Edge Function.
