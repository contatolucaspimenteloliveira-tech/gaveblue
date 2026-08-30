# Edge Function `platform-admin`

Esta Function valida a sessão internamente com `auth.getUser()`. Por isso,
`supabase/config.toml` mantém `verify_jwt = false`: a verificação legada do
gateway não aceita os tokens emitidos pela configuração moderna de chaves do
projeto e não substitui a autorização feita no código.

Publique com autenticação interna obrigatória (`auth.getUser()` +
`platform_admins`):

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

A chave `service_role` e a chave do Appwrite ficam somente na Edge Function.
