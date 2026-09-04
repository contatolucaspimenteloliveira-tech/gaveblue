# wefrotas-admin

Administração sensível do WeFrotas no Supabase. A função valida o JWT do
Supabase, o vínculo multiempresa e o papel do usuário antes de usar a
`SUPABASE_SERVICE_ROLE_KEY`, que permanece somente no ambiente da Edge Function.

Variáveis necessárias: `SUPABASE_URL`, `SUPABASE_ANON_KEY` e
`SUPABASE_SERVICE_ROLE_KEY`.
