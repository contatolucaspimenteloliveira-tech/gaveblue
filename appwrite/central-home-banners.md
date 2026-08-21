# Banners administráveis da Central

Recurso usado por `wefrotas/` para publicar imagens no carrossel da Home de
`postoscredenciados-covreecia/`.

## Appwrite

- Database: `6a68ce8c000a36a44d98`
- Table: `central_home_banners`
- Storage bucket: `6a6fce300023ca843972`

Colunas da tabela:

| Coluna | Tipo | Obrigatória |
| --- | --- | --- |
| `title` | text | sim |
| `imageUrl` | text | sim |
| `fileId` | text | sim |
| `active` | boolean | sim |
| `sortOrder` | integer | sim |

A tabela permite leitura para `Any`, necessária porque a Central não exige
login. Criação, leitura administrativa, atualização e exclusão ficam disponíveis
para `Users`. A segurança por linha permanece desativada.

Os arquivos do banner recebem leitura pública individual e atualização/exclusão
somente por usuários autenticados. Se não houver banner ativo ou a consulta
falhar, a Central mantém o carrossel local existente como fallback.

## Notificação individual

O destino não usa IP. O aparelho salva a inscrição Web Push e inclui o
`pushSubscriptionId` técnico em cada registro enviado. O WeFrotas usa esse ID
para a ação administrativa `notify` da Function `central-push`. Registros antigos
sem esse vínculo não são usados para tentar adivinhar o destinatário.
