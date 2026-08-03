# WeFrotas Online

Cópia isolada do módulo `wefrotas`, preparada para usar Appwrite sem modificar a versão atual.

## Estado da integração

- A aplicação continua funcionando com IndexedDB como cache local.
- Quando o Appwrite está configurado, exige login e sincroniza os registros remotos.
- Na primeira conexão com um backend vazio, os dados locais são enviados automaticamente.
- Alterações remotas são recebidas em tempo real.
- Comprovantes e logos podem ser enviados ao Storage.
- O cadastro público não é exibido; usuários são criados pelo administrador no Appwrite.

## Ativação

1. Confira os recursos descritos em `appwrite/README.md`.
2. Preencha os valores públicos em `appwrite-config.js`.
3. Altere `enabled` para `true`.
4. Cadastre o primeiro usuário no console do Appwrite.
5. Abra `wefrotas-online/index.html` pelo domínio registrado como plataforma Web.

Nenhuma API key ou senha deve ser incluída neste diretório.
