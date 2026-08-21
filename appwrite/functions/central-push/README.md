# Função central-push

Backend dos canais geral e individual de notificações da Central de Registros.

## Configuração no Appwrite

Crie uma Function com ID `central-push`, runtime Node.js 22, ponto de entrada `src/main.js` e permissão de execução para `Any`. A própria função bloqueia `stats`, `broadcast` e `notify` para usuários que não estejam em `ADMIN_USER_IDS`, validando o ID e o JWT temporário que o Appwrite encaminha para execuções autenticadas. As ações públicas `subscribe` e `unsubscribe` só registram ou desativam a inscrição técnica enviada pelo próprio aparelho.

Variáveis:

- `DATABASE_ID=6a68ce8c000a36a44d98`
- `COLLECTION_ID=central_push_subscriptions`
- `VAPID_SUBJECT=mailto:adm01@covreecia.com.br`
- `VAPID_PUBLIC_KEY` — mesma chave pública usada na Central
- `VAPID_PRIVATE_KEY` — segredo; nunca colocar no repositório
- `ADMIN_USER_IDS` — IDs Appwrite autorizados, separados por vírgula

Escopos da chave dinâmica: `databases.read`, `databases.write`, `documents.read` e `documents.write`.

## Coleção central_push_subscriptions

Criar no database acima, sem permissões públicas, com Document Security desativada:

| atributo | tipo | tamanho | obrigatório |
| --- | --- | ---: | --- |
| endpoint | string | 2048 | sim |
| p256dh | string | 512 | sim |
| auth | string | 512 | sim |
| userAgent | string | 1024 | não |
| active | boolean | — | sim |
| updatedAt | datetime | — | sim |

O identificador do documento é um hash do endpoint, evitando inscrições duplicadas. Nenhum nome, motorista, placa ou localização é armazenado.

## Vínculo com o registro da Central

A tabela `central_registros_pendentes` possui a coluna de texto opcional `pushSubscriptionId`. Novos registros guardam nela apenas o hash técnico devolvido por `subscribe`. Ao rejeitar um registro, o WeFrotas usa a ação administrativa `notify` para enviar a justificativa exclusivamente ao aparelho de origem. Registros antigos sem esse campo não geram disparo individual.


