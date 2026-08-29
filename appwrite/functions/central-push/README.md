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
- `CENTRAL_RECORDS_COLLECTION_ID=central_registros_pendentes`
- `DRIVER_DIRECTORY_COLLECTION_ID=central_driver_directory`

Escopos da chave dinâmica: `databases.read`, `databases.write`, `documents.read`, `documents.write`, `users.read` e `users.write`. Os dois últimos são usados exclusivamente pela gestão autenticada de contas do WeFrotas.

## Usuários e perfis do WeFrotas

A área **Central de Registros > Usuários** administra as contas do Appwrite Auth pela própria Function. A senha temporária é enviada somente na criação e nunca é gravada no banco, no frontend ou nos logs.

Os perfis são armazenados como labels alfanuméricas do Auth: `admin`, `gestor`, `aprovador` e `consulta`. A interface continua usando as chaves internas `wefrotas-admin`, `wefrotas-gestor`, `wefrotas-aprovador` e `wefrotas-consulta`, convertidas pela Function antes da gravação. Somente um administrador validado por JWT pode listar, criar, editar, ativar ou desativar contas. IDs mantidos em `ADMIN_USER_IDS` continuam sendo administradores de recuperação, mesmo antes de receberem a label nova.

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

A tabela `central_registros_pendentes` possui as colunas opcionais `pushSubscriptionId` e `deviceId`. O primeiro é o hash técnico devolvido por `subscribe`, usado no push individual. O segundo é um identificador aleatório e persistente criado no aparelho, usado para consultar o histórico mesmo quando a pessoa não habilita notificações. Não há uso de IP ou localização.

As ações públicas da Function são:

- `subscribe` e `unsubscribe`: administram somente a inscrição técnica do próprio aparelho; quando `subscribe` recebe o `deviceId`, ele renova o vínculo dos registros desse aparelho com a inscrição atual;
- `presence`: renova o horário do último contato enquanto a Central está aberta, permitindo ao WeFrotas indicar aparelho online, instável ou offline sem armazenar localização;
- `device-profile-set`: sincroniza com o WeFrotas o motorista e o veículo confirmados no aparelho;
- `device-profile-admin-set`: altera pelo WeFrotas o motorista e o veículo que o aparelho deve utilizar;
- `directory`: retorna apenas os vínculos ativos mínimos de motorista e veículo publicados pelo WeFrotas;
- `history`: retorna os registros vinculados ao `deviceId` ou à inscrição técnica informada.

As ações `stats`, `broadcast` e `notify` continuam administrativas. `stats` retorna somente a identificação técnica, o tipo de navegador e a última atualização dos aparelhos ativos; endpoint e chaves Web Push nunca são enviados ao frontend. Ao aprovar ou rejeitar um registro, o WeFrotas usa `notify` para devolver o resultado exclusivamente ao aparelho de origem. A Function tenta primeiro a inscrição mais recente vinculada ao `deviceId`, usa o identificador salvo no registro como alternativa e repete falhas temporárias do provedor de push sem duplicar o aviso no aparelho.

## Diretório da Central

A tabela `central_driver_directory` não tem permissão pública e é mantida pelo usuário autenticado no WeFrotas. Ela contém somente `driverId`, `driverName`, `vehicleId`, `vehicleName`, `vehicleImageUrl`, `plate`, `fleetNumber`, `active` e `updatedAt`. `vehicleImageUrl` é uma string opcional de até 2048 caracteres. A Central consulta uma versão saneada pela Function, sem acesso direto ao restante do snapshot administrativo.

