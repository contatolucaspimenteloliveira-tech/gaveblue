# Checklist de testes — WeFrotas e Central de Registros

Use este arquivo antes de cada publicação importante. Marque os itens somente depois de testar com dados controlados.

## Situação da auditoria de 23/08/2026

- [x] Registro de teste de GLEIDSON LAURENTINO DE MELO recebido automaticamente na Central.
- [x] Registro rejeitado com o motivo `Teste de notificação — comprovante recusado.`.
- [x] Status confirmado como **Rejeitado** no WeFrotas.
- [x] Notificação de rejeição recebida no aparelho de teste e exibindo o motivo informado.
- [x] Central verificada sem estouro horizontal em 360, 768 e 1.024 px.
- [x] WeFrotas verificado sem estouro horizontal da página em 390, 768, 910 e 1.440 px.
- [x] Registro Rápido, Registro Completo, Serviços, busca de postos, filtros e seleção por linha abertos sem erro.
- [x] Central → Usuários encontrou 4 aparelhos inscritos.
- [ ] Validar câmera nativa e push com o aplicativo fechado em aparelho físico.

## Melhorias priorizadas encontradas na auditoria

### P0 — integridade financeira

- [x] Criar a coleção `central_approval_locks` para reserva atômica por `centralRecordId`.
- [x] Implantar na Function a reserva administrativa determinística para impedir duas aprovações simultâneas.
- [ ] Validar em produção a aprovação concorrente com duas sessões de gestor antes de considerar a regra concluída.
- [ ] Definir uma ação administrativa de reconciliação para travas que ficarem em `em_aprovacao` após uma falha de rede.
- [ ] Auditar as duas linhas visualmente idênticas de POSTO NATER COOP, veículo 005, data 13/08/2026 e valor R$ 218,43 antes de qualquer exclusão.
- [ ] Criar teste automático de aprovação simultânea e de repetição de clique.

### P1 — publicação e consistência cadastral

- [ ] Publicar o WeFrotas atual e atualizar os tokens de versão/cache dos arquivos estáticos.
- [ ] Confirmar em produção a orientação de banner **1320 × 600 px (2,2:1)**.
- [ ] Substituir as listas fixas de motoristas dos formulários pelo diretório de motoristas ativos do WeFrotas.
- [ ] Corrigir a divergência `ELOI DOS SANTOS` / `ELOIS DOS SANTOS`.
- [ ] Garantir que motorista ou veículo inativo não apareça para novos registros.
- [ ] Adicionar testes de aprovação, rejeição, auditoria e retorno do Financeiro para a Central.

### P2 — experiência, segurança e manutenção

- [x] Compactar o modal vazio de **Meus envios** e manter o botão Atualizar com largura adequada.
- [ ] Tornar mais evidente a rolagem horizontal das tabelas em telas pequenas.
- [ ] Remover a dependência do Tailwind CDN em produção e gerar o CSS no processo de publicação.
- [ ] Configurar domínio próprio do Appwrite para evitar sessão baseada em `localStorage`.
- [ ] Tratar ou silenciar corretamente o erro visual `AbortError: Transition was skipped`.
- [ ] Criar suíte de regressão executada antes de cada merge/publicação.

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

