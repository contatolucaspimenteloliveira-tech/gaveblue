# Gestão multiempresa no Supabase

O Supabase é a fonte oficial de empresas, contratos, módulos e membros. O Appwrite continua armazenando a operação do WeFrotas/Central, sempre particionada pelo `appwrite_workspace_id` autorizado pelo Supabase.

## Implantação

1. Crie um projeto Supabase da GaveBlue.
2. Execute `migrations/202608300001_platform_multiempresa.sql` no SQL Editor.
3. Crie o primeiro usuário em Authentication e promova-o no SQL Editor:

```sql
insert into public.platform_admins (user_id, role)
select id, 'owner' from auth.users where email = 'SEU_EMAIL';
```

4. Preencha `admin/supabase-config.js` somente com a URL pública e a chave `anon`. Nunca publique `service_role`.
5. Publique a Edge Function `platform-admin` e configure nela os segredos descritos em `functions/platform-admin/README.md`.
6. Antes dos frontends, aplique também a migração descrita em `appwrite/multiempresa-appwrite-migration.md` no Appwrite.

RLS fica habilitado em todas as tabelas. Nenhuma operação administrativa deve usar `service_role` no navegador.
