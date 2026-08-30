# Migração Appwrite para múltiplas empresas

Antes de publicar a versão multiempresa da Function e dos frontends, adicione o
atributo obrigatório `workspaceId` (string, 36 caracteres) nestas tabelas:

- `central_push_subscriptions`
- `central_driver_directory`
- `central_home_banners`

Crie também um índice por `workspaceId` em cada tabela. A tabela
`central_registros_pendentes` e `gaveblue_wefrotas` já usam esse atributo.

## Dados existentes

Preencha `workspaceId = covre-e-cia` em todas as linhas antigas das três tabelas
antes de tornar o atributo obrigatório. A ordem segura é:

1. criar o atributo opcional;
2. aguardar o Appwrite concluir a criação;
3. atualizar as linhas antigas com `covre-e-cia`;
4. criar o índice;
5. publicar a Function e os frontends;
6. depois da validação, tornar o atributo obrigatório.

Cada nova empresa recebe um `appwrite_workspace_id` exclusivo no Supabase. Esse
valor acompanha snapshots, diretório, banners, dispositivos e registros. A
Function nunca aceita o workspace administrativo informado pelo navegador: para
ações autenticadas, ela o resolve pelo vínculo do usuário no Supabase.
