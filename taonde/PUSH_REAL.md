# Push real do TáOnde

Este projeto agora tem Web Push real para PWA.

## Como publicar

1. Crie um projeto no Supabase.
2. Rode o SQL de `supabase/schema.sql` no SQL Editor.
3. Gere chaves VAPID:

```bash
npm install
npm run generate:vapid
```

4. Configure estas variáveis no servidor/deploy:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@gaveblue.com.br
ADMIN_PUSH_TOKEN=
ALLOWED_ORIGIN=https://gaveblue.com.br
```

5. Publique em um ambiente que rode funções Node em `/api`, como Vercel.

## Como usar no app

- Usuário: abre **Mais** e toca em **Notificações**.
- Admin: abre `#/admin?tab=notificacoes`, informa o token admin e envia.

Sem backend publicado e variáveis configuradas, o navegador não consegue receber push real em outros aparelhos.
