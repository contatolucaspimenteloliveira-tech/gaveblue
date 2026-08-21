# Checklist de testes — WeFrotas e Central de Registros

Use este arquivo antes de cada publicação importante. Marque os itens somente depois de testar com dados controlados.

## 1. Central de Registros — prioridade máxima

- [ ] Enviar um abastecimento pelo aplicativo e confirmar que aparece automaticamente em **Pendentes**.
- [ ] Aprovar uma vez e confirmar que muda para **Aprovado**.
- [ ] Confirmar que a aprovação gera somente uma despesa no Financeiro.
- [ ] Tentar aprovar novamente e confirmar o bloqueio de duplicidade.
- [ ] Repetir aprovação e proteção contra duplicidade com um registro de **serviço/notinha**.
- [ ] Rejeitar um registro informando justificativa.
- [ ] Confirmar que o registro muda para **Rejeitado**.
- [ ] Confirmar que o aparelho de origem recebe a notificação com o motivo.
- [ ] Auditar o registro rejeitado e confirmar que volta para **Pendente**.
- [ ] Excluir uma despesa originada na Central e confirmar que ela volta para Pendentes.

## 2. Notificações e aparelhos

- [ ] Verificar a lista de aparelhos em **Central → Usuários**.
- [ ] Confirmar a associação entre aparelho e motorista.
- [ ] Enviar uma notificação somente para um aparelho e confirmar que os demais não recebem.
- [ ] Testar uma notificação com o aplicativo fechado.
- [ ] Tocar na notificação e conferir a página aberta.
- [ ] Ativar e desativar notificações pela tela Sobre.
- [ ] Confirmar que o convite para ativar não reaparece quando já existe inscrição ativa.
- [ ] Verificar se aparelhos antigos atualizaram o service worker.

## 3. Revisões por KM e vínculo com OS

- [ ] Encontrar um veículo próximo da revisão.
- [ ] Verificar se o sistema sugere uma OS do mesmo veículo.
- [ ] Conferir número e status da OS sugerida.
- [ ] Abrir **Vincular OS**, cancelar e confirmar que nada foi alterado.
- [ ] Repetir e confirmar o vínculo.
- [ ] Testar sugestões com OS aberta, em andamento e fechada.
- [ ] Confirmar que uma OS de outro veículo nunca é sugerida.
- [ ] Confirmar que **Abrir OS** continua funcionando quando não existe candidata.

## 4. Regras do Financeiro e OS

- [ ] Tentar excluir despesa vinculada a OS e confirmar o bloqueio.
- [ ] Estornar despesa vinculada a OS aberta com justificativa.
- [ ] Tentar estornar despesa vinculada a OS finalizada e confirmar o bloqueio.
- [ ] Reabrir a OS e repetir o estorno.
- [ ] Agrupar abastecimentos e conferir valores, veículo e vencimento.
- [ ] Abrir detalhes e conferir motorista, posto, combustível e comprovantes.
- [ ] Confirmar que seleções são limpas após ações e mudanças de filtro.

## 5. Responsividade do WeFrotas

Testar Home, OS, Financeiro, Veículos, Motoristas, Fornecedores, Central e Relatórios em 320–390 px, 768 px, 910–1.213 px, 1.366 px e desktop grande.

- [ ] Nenhum botão oculto.
- [ ] Nenhum texto sobreposto.
- [ ] Nenhuma rolagem horizontal na página inteira.
- [ ] Tabelas com rolagem interna quando necessário.
- [ ] Cabeçalho e barra de ações fixos.
- [ ] Modais dentro da tela e com botão de fechar.
- [ ] Filtros acessíveis em todos os tamanhos.

## 6. Aplicativo da Central

- [ ] Configuração inicial e busca do motorista cadastrado.
- [ ] Sugestão, confirmação e alteração do veículo.
- [ ] Registro Rápido de abastecimento.
- [ ] Registro Completo.
- [ ] Serviço/notinha avulsa.
- [ ] Câmera nativa e retorno da fotografia.
- [ ] Histórico em **Meus envios**.
- [ ] Retorno dos status: Em análise, Aprovado e Recusado.
- [ ] Carrossel administrado em **Central → Configurações → Comunicação**.
- [ ] Botão **Baixar app** visível no navegador e oculto somente dentro do PWA instalado.
