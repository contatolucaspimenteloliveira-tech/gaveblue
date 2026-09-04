(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GaveBlueAudit = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const fields = { name: 'Nome / descrição', plate: 'Placa', number: 'Número', status: 'Status', total: 'Valor', email: 'E-mail', role: 'Perfil', protocol: 'Protocolo', resolucao: 'Resolução', driverId: 'ID do motorista', vehicleId: 'ID do veículo', orderId: 'ID da OS', lancamentoFinanceiroId: 'ID do lançamento', updatedAt: 'Versão no servidor', expectedUpdatedAt: 'Versão enviada', omittedEvents: 'Eventos não detalhados' };
  const entities = { vehicle: 'Veículo', driver: 'Motorista', supplier: 'Fornecedor', order: 'OS', finance: 'Despesa', users: 'Usuário', snapshot: 'Sincronização', central: 'Central', permissions: 'Permissões' };
  Object.assign(fields,{browser:'Navegador',system:'Sistema',startedAt:'Início da conexão',closedAt:'Encerramento confirmado'});
  entities.session = 'Acesso';
  const statuses = { aberta: 'Aberta', fechada: 'Fechada', pendente: 'Pendente', aprovado: 'Aprovado', aprovada: 'Aprovada', rejeitado: 'Rejeitado', rejeitada: 'Rejeitada', distribuido: 'Distribuído', active: 'Ativo', disabled: 'Desativado' };
  const html = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalized = v => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const date = value => { const d = new Date(value); return Number.isNaN(d.getTime()) ? 'Não informado' : new Intl.DateTimeFormat('pt-BR', {dateStyle:'short',timeStyle:'medium',timeZone:'America/Sao_Paulo'}).format(d); };
  function value(v, key) {
    if (v === undefined || v === null || v === '') return 'Não informado';
    if (key === 'total' && Number.isFinite(Number(v))) return Number(v).toLocaleString('pt-BR', {style:'currency',currency:'BRL'});
    if (key === 'status') return statuses[v] || String(v);
    return typeof v === 'object' ? JSON.stringify(v) : String(v);
  }
  function changes(event) {
    const before = event.before || {}, after = event.after || {};
    return Object.keys(fields).filter(k => (k in before || k in after) && JSON.stringify(before[k]) !== JSON.stringify(after[k]))
      .map(k => ({key:k,label:fields[k],before:value(before[k],k),after:value(after[k],k)}));
  }
  function action(event) {
    const a = String(event.action || ''), before = event.before || {}, after = event.after || {};
    const exact = {
      'session.open':'Acessou o WeFrotas (conexão iniciada)', 'session.close':'Encerrou a conexão da tela',
      'central.record.aprovado':'Aprovou registro da Central', 'central.record.aprovada':'Aprovou registro da Central',
      'central.record.rejeitado':'Rejeitou registro da Central', 'central.record.rejeitada':'Rejeitou registro da Central',
      'central.record.pendente':'Retornou registro da Central para pendente', 'central.record.delete':'Excluiu registro da Central',
      'central.device.link':'Vinculou motorista / veículo ao dispositivo', 'snapshot.conflict':'Sincronização bloqueada por conflito',
      'snapshot.bulk-change':'Alteração em lote — detalhamento parcial', 'users.repair':'Reparou acesso do usuário',
      'users.updateWithPassword':'Alterou usuário e redefiniu senha', 'permissions.harden':'Atualizou permissões de acesso'
    };
    if (exact[a]) return exact[a];
    if (a === 'order.update' && before.status !== after.status) {
      if (after.status === 'fechada') return 'Fechou OS';
      if (before.status === 'fechada' && after.status === 'aberta') return 'Reabriu OS';
    }
    if (a === 'finance.update' && before.status !== after.status) {
      if (after.status === 'distribuido') return 'Fechou despesa e alocou em OS';
      if (after.status === 'pendente') return 'Estornou despesa para pendente';
      if (after.status === 'fechada') return 'Fechou despesa';
    }
    const [entity, verb] = a.split('.');
    return {create:'Cadastrou',update:'Alterou',delete:'Excluiu'}[verb] ? `${{create:'Cadastrou',update:'Alterou',delete:'Excluiu'}[verb]} ${entities[entity] || entity}` : (a || 'Operação não identificada');
  }
  function result(event) {
    return {success:'Concluído',blocked:'Bloqueado',error:'Falhou',failed:'Falhou'}[event.result] || 'Não informado';
  }
  function item(event) {
    const v = event.after || event.before || {};
    return [v.number ? `${String(event.action).startsWith('order.') ? 'OS ' : 'Nº '}${v.number}` : '', v.name, v.plate, v.protocol].filter(Boolean).join(' · ') || event.targetId || 'Não informado';
  }
  function details(event) {
    return changes(event).map(c => `${c.label}: ${c.before} → ${c.after}`).join(' | ') || 'O evento não contém diferenças detalhadas nos campos registrados.';
  }
  function filter(events, query = '', outcome = '', entity = '') {
    const terms = normalized(query).trim().split(/\s+/).filter(Boolean);
    return events.filter(e => (!outcome || e.result === outcome || (outcome === 'error' && e.result === 'failed')) && (!entity || String(e.action).split('.')[0] === entity) &&
      terms.every(t => normalized([date(e.at),e.organizationName,e.actorName,e.actorEmail,e.actorId,action(e),e.action,item(e),e.targetId,result(e),details(e),e.justification].join(' ')).includes(t)));
  }
  function csvCell(v) {
    const s = String(v ?? '');
    // Spreadsheet imports must never interpret user-controlled content as formulas.
    return '"' + (/^[\s\u0000-\u001f]*[=+@-]/.test(s) ? "'" + s : s).replace(/"/g, '""') + '"';
  }
  function csv(events) {
    const rows = [['Data e hora (Brasília)','Empresa','Usuário','E-mail','ID do usuário','Alteração realizada','Tipo técnico','Item','ID do item','Resultado','Detalhes (antes → depois)','Justificativa','ID do evento']];
    for (const e of events) rows.push([date(e.at),e.organizationName,e.actorName || '',e.actorEmail,e.actorId,action(e),e.action,item(e),e.targetId,result(e),details(e),e.justification || '',e.id]);
    return '\uFEFF' + rows.map(row => row.map(csvCell).join(';')).join('\r\n');
  }
  function printReport(events, caption) {
    return `<header><p>GAVEBLUE · AUDITORIA OPERACIONAL</p><h1>Relatório de operações</h1><p>${html(caption)}</p><p>Gerado em ${html(date(new Date()))} · ${events.length} eventos · Horário de Brasília</p></header><table><thead><tr><th>Data / empresa / usuário</th><th>Alteração e item</th><th>Detalhamento</th><th>Resultado</th></tr></thead><tbody>${events.map(e => `<tr><td>${html(date(e.at))}<br>${html(e.organizationName)}<br>${html(e.actorName || e.actorEmail || e.actorId)}</td><td><strong>${html(action(e))}</strong><br>${html(item(e))}<br><small>Item: ${html(e.targetId)}<br>Evento: ${html(e.id)}</small></td><td>${html(details(e))}${e.justification ? '<br>Justificativa: ' + html(e.justification) : ''}</td><td>${html(result(e))}</td></tr>`).join('')}</tbody></table>`;
  }
  function sessionStatus(s, now = Date.now()) {
    if (s.closedAt) return 'Encerrada pela tela';
    const last = Date.parse(s.lastSeenAt);
    if (!Number.isFinite(last)) return 'Não informado';
    return now-last <= 180000 && now >= last-5000 ? 'Conectada recentemente' : 'Sem contato';
  }
  function sessionDuration(s) {
    const start=Date.parse(s.startedAt), end=Date.parse(s.closedAt || s.lastSeenAt);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return 'Não informado';
    const minutes=Math.floor(Math.max(0,end-start)/60000);
    return `${Math.floor(minutes/60)}h ${minutes%60}min (até o último contato)`;
  }
  function sessionCsv(sessions, now) {
    const rows = [['Empresa','Nome','E-mail','ID do usuário','ID da conexão','Navegador','Sistema','Entrada (Brasília)','Último contato (Brasília)','Última interação (Brasília)','Encerramento (se confirmado)','Situação estimada','Duração observada']];
    sessions.forEach(s=>rows.push([s.organizationName,s.actorName,s.actorEmail,s.actorId,s.id,s.browser,s.system,date(s.startedAt),date(s.lastSeenAt),s.lastActivityAt?date(s.lastActivityAt):'Não registrada',s.closedAt?date(s.closedAt):'Não confirmado',sessionStatus(s,now),sessionDuration(s)]));
    return '\uFEFF' + rows.map(row=>row.map(csvCell).join(';')).join('\r\n');
  }
  return {html,date,changes,action,result,item,details,filter,csv,printReport,sessionStatus,sessionDuration,sessionCsv};
});
