# Função central-push

Backend do canal geral de notificações da Central de Registros.

## Configuração no Appwrite

Crie uma Function com ID `central-push`, runtime Node.js 22, ponto de entrada `src/main.js` e permissão de execução para `Any`. A própria função bloqueia `stats` e `broadcast` para usuários que não estejam em `ADMIN_USER_IDS`, validando o ID e o JWT temporário que o Appwrite encaminha para execuções autenticadas.

Variáveis:

- `DATABASE_ID=6a68ce8c000a36a44d98`
- `COLLECTION_ID=central_push_subscriptions`
- `VAPID_SUBJECT=mailto:adm01@covreecia.com.br`
- `VAPID_PUBLIC_KEY` — mesma chave pública usada na Central
- `VAPID_PRIVATE_KEY` — segredo; nunca colocar no repositório
- `ADMIN_USER_IDS` — IDs Appwrite autorizados, separados por vírgula

Escopos da chave dinâmica: `databases.read` e `databases.write`.

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

