# Fluxo de permissões do WeFrotas

## Objetivo

Centralizar autenticação e autorização no backend, sem depender apenas de botões ocultos no frontend. Toda operação protegida deve validar a sessão do Appwrite, identificar o usuário e conferir suas permissões antes de acessar ou alterar dados.

## Perfis e labels

| Perfil exibido | Label no Appwrite |
| --- | --- |
| Administrador | `admin` |
| Gestor | `gestor` |
| Aprovador | `aprovador` |
| Consulta | `consulta` |

Cada usuário deve possuir somente uma label de perfil gerenciada pelo WeFrotas. As labels devem ser strings alfanuméricas, sem espaços, acentos ou símbolos, com 1 a 36 caracteres.

## Matriz inicial de permissões

- **Administrador:** acesso completo, usuários, permissões, configurações, exclusões e auditoria.
- **Gestor:** operação, cadastros, OS e financeiro, sem administrar usuários ou configurações críticas.
- **Aprovador:** consulta e tratamento dos registros da Central, incluindo aprovação, rejeição e auditoria.
- **Consulta:** somente leitura, sem inclusão, alteração, aprovação ou exclusão.

## Autenticação e autorização

1. O frontend envia a sessão ou um JWT atual do Appwrite.
2. A API valida a credencial diretamente no Appwrite.
3. A API identifica o usuário autenticado e lê suas labels atuais.
4. A label é convertida em um perfil interno conhecido.
5. A política do backend verifica se o perfil pode executar a ação solicitada.
6. Somente após a autorização a API consulta ou modifica os dados.

O frontend nunca define a autoridade do usuário. Campos enviados pelo navegador, como `role: admin`, não devem conceder privilégios.

## Ações administrativas previstas

- `users.list`
- `users.create`
- `users.update`
- `users.updateRole`
- `users.updateStatus`
- `users.resetPassword`
- `users.delete`
- `permissions.get`
- `audit.list`

Exemplo de alteração de perfil solicitada pelo frontend:

```json
{
  "action": "users.updateRole",
  "userId": "ID_DO_USUARIO",
  "role": "wefrotas-aprovador"
}
```

A API traduz o perfil interno para o valor aceito pelo Appwrite:

```json
{
  "labels": ["aprovador"]
}
```

Somente administradores podem administrar contas e permissões.

## Operações que devem ser protegidas

- Aprovar, rejeitar e auditar registros.
- Excluir ou estornar despesas.
- Alterar ordens de serviço.
- Criar ou alterar cadastros.
- Enviar notificações.
- Administrar dispositivos.
- Alterar banners e configurações.

A proteção deve existir no backend mesmo que o frontend oculte ações não permitidas.

## Auditoria

Cada ação administrativa relevante deve registrar:

- usuário responsável;
- ação realizada;
- registro afetado;
- valor anterior e valor novo;
- data e hora;
- resultado da operação;
- justificativa, quando exigida.

## Comportamento do frontend

1. Depois do login, o WeFrotas consulta o perfil e as permissões efetivas em `/me`.
2. A interface mostra somente módulos e ações permitidos.
3. Alterações de permissão são recarregadas automaticamente.
4. Acesso revogado limita ou encerra a sessão imediatamente.
5. A estrutura visual não deve mudar de tamanho conforme o perfil.

## Regras adicionais de segurança

- Impedir a remoção do último acesso administrativo.
- Impedir renovação da sessão de usuários inativos.
- Invalidar permissões antigas imediatamente após uma alteração de perfil.
- Aceitar somente labels previamente permitidas e normalizadas.
- Labels desconhecidas nunca concedem acesso.
- Exigir troca de senha temporária no primeiro acesso.
- Exigir confirmação e justificativa em ações críticas.

## Testes obrigatórios

Para cada perfil, validar:

- login e persistência após novo acesso;
- módulos e ações visíveis;
- consultas autorizadas;
- ações autorizadas e bloqueadas pelo backend;
- atualização de página sem perda da permissão;
- alteração de perfil durante uma sessão;
- bloqueio de usuário inativo;
- tentativa de chamada direta à API;
- gravação correta na auditoria.

## Estratégia de implementação

Manter inicialmente uma API administrativa na Function `central-push`, separando internamente autenticação, autorização, usuários e auditoria. Se o módulo crescer, essas responsabilidades podem ser distribuídas entre Functions específicas sem alterar o contrato usado pelo frontend.
