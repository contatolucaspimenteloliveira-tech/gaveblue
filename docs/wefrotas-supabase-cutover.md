# Migração operacional do WeFrotas para Supabase

## Estado confirmado em 4 de setembro de 2026

- O gargalo do Appwrite foi `Database Reads` (545,5 mil de 500 mil).
- O cliente consultava registros da Central em polling e relia coleções após
  eventos; o servidor também varria o diretório de motoristas depois de saves
  de entidades sem relação com o diretório.
- A contingência local está publicada e o resgate confirmou uma cópia Covre &
  Cia com 10 veículos, 10 motoristas, 29 fornecedores, 9 cidades, 62 OS, 282
  lançamentos financeiros, 2 OS excluídas e 1 notificação.
- Essa cópia não possui IDs ausentes, IDs duplicados ou referências órfãs entre
  OS, veículos, motoristas e financeiro.
- O usuário informou que ela não é a versão mais recente. Por isso ela pode ser
  importada como base de recuperação, mas o corte final deve permanecer
  bloqueado até comparar qualquer cópia mais nova existente em outro aparelho.

## Arquitetura de destino

Cada entidade possui tabela própria, chave composta por empresa e ID legado,
payload integral para compatibilidade e índices para as consultas reais. A
migration `202609040001_wefrotas_operational.sql` cria:

- estado/revisão do workspace;
- veículos, motoristas, fornecedores e cidades;
- OS, financeiro, exclusões e notificações;
- registros da Central, diretório de motoristas e banners;
- presença de sessões, auditoria e histórico de importações;
- bucket privado de anexos com política por pasta da organização.

Todas as tabelas usam RLS por `organization_members.user_id`. O login final é
Supabase Auth; um trigger liga a conta apenas a um e-mail já autorizado e ativo.
Não existe `service_role` no navegador.

## Persistência e conflito

O navegador calcula apenas as linhas alteradas. A RPC
`wefrotas_apply_snapshot_delta` aplica o delta em transação e compara uma revisão
otimista. Uma revisão divergente gera `WEFROTAS_REVISION_CONFLICT`; a pendência
local não é apagada. Realtime aplica somente a linha recebida.

## Importação

O importador administrativo exige seleção explícita da versão, valida o
workspace, calcula SHA-256 e chama `wefrotas_import_snapshot`. A chave de
importação é única por empresa. Repetir o mesmo arquivo retorna resultado
idempotente; reutilizar a chave com conteúdo diferente é bloqueado. O importador
não apaga linhas ausentes e compara as contagens após a operação.

## Gates do corte

1. Aplicar a migration aditiva no Supabase.
2. Criar/ligar as contas Supabase Auth dos membros existentes.
3. Importar uma versão explicitamente escolhida e conferir todas as contagens.
4. Migrar anexos necessários para o bucket privado.
5. Publicar `wefrotas-admin` e validar administração de usuários.
6. Executar testes reais em dois navegadores: criar, editar, excluir, conflito,
   perda de rede, refresh, Central e isolamento entre empresas.
7. Só então ativar `WEFROTAS_SUPABASE_CONFIG.cutover` e retirar os scripts
   Appwrite da página. O projeto Appwrite deve permanecer intacto como arquivo
   de recuperação até a aceitação formal.

## Rollback

Enquanto o gate 7 não for aprovado, o site continua carregando o backend
Appwrite/contingência atual. A nova estrutura Supabase é aditiva e pode ser
abandonada sem apagar o Appwrite ou as cópias locais. Depois do corte, rollback
é feito publicando novamente o carregador anterior; nunca por exclusão de dados.
