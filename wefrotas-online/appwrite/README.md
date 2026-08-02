# Backend Appwrite do WeFrotas Online

Recursos usados pela cópia `wefrotas-online`, sem modificar o módulo `wefrotas` original.

## Recursos configurados

- Projeto: `6a68cb3e00312ec0a3fd`.
- Endpoint: `https://nyc.cloud.appwrite.io/v1`.
- TablesDB: banco `6a68ce8c000a36a44d98`.
- Tabela: `gaveblue_wefrotas`.
- Bucket privado de comprovantes: `6a6fce300023ca843972`.

## Tabela

A tabela usa segurança por linha e permite `create` para usuários autenticados. Cada linha recebe suas próprias permissões de leitura, atualização e exclusão.

Colunas esperadas:

- `workspaceId`: text, obrigatório.
- `snapshot`: mediumtext, obrigatório.
- `updatedAt`: datetime, obrigatório.
- `updatedBy`: text, opcional.

## Storage

O bucket usa segurança por arquivo e permite `create` para usuários autenticados. Cada arquivo recebe suas próprias permissões.

## Autenticação e frontend

O cadastro público não é exibido. Os usuários são criados no console do Appwrite e entram pelo formulário do WeFrotas Online.

O frontend contém somente endpoint, Project ID e IDs públicos dos recursos. Senhas e API keys nunca devem ser incluídas no repositório.
