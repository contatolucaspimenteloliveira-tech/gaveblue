(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GaveBlueAudit = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const fields = { name: 'Nome / descrição', plate: 'Placa', number: 'Número', status: 'Status', total: 'Valor', email: 'E-mail', role: 'Perfil', protocol: 'Protocolo', resolucao: 'Resolução', driverId: 'ID do motorista', vehicleId: 'ID do veículo', orderId: 'ID da OS', lancamentoFinanceiroId: 'ID do lançamento', updatedAt: 'Versão no servidor', expectedUpdatedAt: 'Versão enviada', omittedEvents: 'Eventos não detalhados' };
  const entities = { vehicle: 'Veículo', driver: 'Motorista', supplier: 'Fornecedor', order: 'OS', finance: 'Despesa', users: 'Usuário', snapshot: 'Sincronização', central: 'Central', permissions: 'Permissões' };
  Object.assign(fields,{browser:'Navegador',system:'Sistema',startedAt:'Início da conexão',closedAt:'Encerramento confirmado'});
  Object.assign(fields,{workflowStatus:'Situação da despesa',closedExpense:'Fechamento confirmado',supplierId:'ID do fornecedor',centralRecordId:'ID do registro da Central',vehicleIds:'Veículos vinculados',driverName:'Motorista',supplierName:'Fornecedor',nf:'Nota fiscal',data:'Data',dataDocumento:'Data do documento',dataVencimento:'Vencimento',observacoes:'Observações',active:'Ativo',km:'Quilometragem'});
  entities.session = 'Acesso';
  Object.assign(entities,{organization:'Empresa',notification:'Notificação'});
  const tableEntities = {
    wefrotas_orders:'order',wefrotas_deleted_orders:'order',wefrotas_finance_entries:'finance',
    wefrotas_vehicles:'vehicle',wefrotas_drivers:'driver',wefrotas_suppliers:'supplier',
    wefrotas_central_records:'central',wefrotas_central_driver_directory:'central',
    wefrotas_central_cities:'central',wefrotas_banners:'central',wefrotas_notifications:'central',
    wefrotas_workspace_state:'snapshot',wefrotas_import_runs:'snapshot',migration:'snapshot',
    wefrotas_session_presence:'session',organization_members:'users',user:'users',member:'users'
  };
  const tableLabels = {wefrotas_central_driver_directory:'vínculo do diretório da Central',wefrotas_central_cities:'cidade da Central',wefrotas_banners:'banner da Central',wefrotas_notifications:'notificação da Central',wefrotas_workspace_state:'configuração de sincronização'};
  const statuses = { aberta: 'Aberta', fechada: 'Fechada', pendente: 'Pendente', aprovado: 'Aprovado', aprovada: 'Aprovada', rejeitado: 'Rejeitado', rejeitada: 'Rejeitada', distribuido: 'Distribuído', active: 'Ativo', disabled: 'Desativado' };
  const html = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalized = v => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const date = value => { const d = new Date(value); return Number.isNaN(d.getTime()) ? 'Não informado' : new Intl.DateTimeFormat('pt-BR', {dateStyle:'short',timeStyle:'medium',timeZone:'America/Sao_Paulo'}).format(d); };
  const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  function snapshot(value) {
    if (!object(value)) return value;
    // Supabase trigger snapshots contain a complete row, unlike the legacy
    // flat audit payload. Only unwrap a recognized row wrapper, not arbitrary
    // business objects with a field named data (which is also Portuguese date).
    const wrapped = object(value.data) && ('entity_id' in value || 'organization_id' in value);
    const out = wrapped ? {...value.data,...Object.fromEntries(Object.entries(value).filter(([k]) => k !== 'data'))} : {...value};
    if (wrapped && value.entity_id !== undefined) out.id = value.entity_id;
    if (wrapped && value.organization_id !== undefined) out.organizationId = value.organization_id;
    if (wrapped && value.updated_at !== undefined) out.updatedAt = value.updated_at;
    const aliases = {name:['nome','descricao','description','modelo'],plate:['placa'],number:['numero','numeroOS','numeroOs'],protocol:['protocolo'],total:['valorNumero','valor'],driverName:['motorista'],supplierName:['fornecedor','posto'],active:['ativo']};
    for (const [key, names] of Object.entries(aliases)) if (out[key] === undefined || out[key] === null) {
      const found = names.find(name => out[name] !== undefined && out[name] !== null);
      if (found) out[key] = out[found];
    }
    return out;
  }
  function normalize(event = {}) {
    const rawAction = String(event.action || '');
    const technicalAction = rawAction.includes('.') || !event.entity_type ? rawAction : `${event.entity_type}.${rawAction}`;
    const parts = technicalAction.split('.');
    const entity = tableEntities[parts[0]] || parts[0];
    const before = event.rawBefore !== undefined ? event.rawBefore : event.before !== undefined ? event.before : event.before_data;
    const after = event.rawAfter !== undefined ? event.rawAfter : event.after !== undefined ? event.after : event.after_data;
    // Keep original action, identifiers, actor and row snapshots for provenance;
    // only display/filter semantics use canonicalAction and flattened copies.
    return {...event,technicalAction,canonicalAction:[entity,...parts.slice(1)].join('.'),entity,
      sourceEntity:parts[0],rawBefore:event.rawBefore ?? before,rawAfter:event.rawAfter ?? after,
      before:snapshot(before),after:snapshot(after),
      at:event.at ?? event.occurred_at,organizationId:event.organizationId ?? event.organization_id,
      actorId:event.actorId ?? event.actor_user_id,actorEmail:event.actorEmail ?? event.actor_email,
      targetId:event.targetId ?? event.entity_id};
  }
  function value(v, key) {
    if (v === undefined || v === null || v === '') return 'Não informado';
    if (key === 'total' && Number.isFinite(Number(v))) return Number(v).toLocaleString('pt-BR', {style:'currency',currency:'BRL'});
    if (key === 'status' || key === 'workflowStatus') return statuses[v] || String(v);
    if (typeof v === 'boolean') return v ? 'Sim' : 'Não';
    return typeof v === 'object' ? JSON.stringify(v) : String(v);
  }
  function changes(event) {
    event = normalize(event);
    const before = event.before || {}, after = event.after || {};
    return Object.keys(fields).filter(k => (k in before || k in after) && JSON.stringify(before[k]) !== JSON.stringify(after[k]))
      .map(k => ({key:k,label:fields[k],before:value(before[k],k),after:value(after[k],k)}));
  }
  function action(event) {
    event = normalize(event);
    const a = event.canonicalAction, before = event.before || {}, after = event.after || {};
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
    if (event.sourceEntity === 'wefrotas_central_records') {
      if (a === 'central.delete') return 'Excluiu registro da Central';
      if (a === 'central.create') return 'Recebeu registro da Central';
      if (a === 'central.update' && before.status !== undefined && before.status !== after.status) {
        if (after.status === 'aprovado') return 'Aprovou registro da Central';
        if (after.status === 'rejeitado') return 'Rejeitou registro da Central';
        if (after.status === 'pendente') return 'Retornou registro da Central para pendente';
      }
    }
    if (event.sourceEntity === 'wefrotas_deleted_orders') {
      return ({create:'Registrou cópia de OS excluída',update:'Alterou cópia de OS excluída',delete:'Removeu cópia de OS excluída'})[a.split('.')[1]] || event.technicalAction;
    }
    if (a === 'order.update' && before.status !== undefined && before.status !== after.status) {
      if (after.status === 'fechada') return 'Fechou OS';
      if (before.status === 'fechada' && after.status === 'aberta') return 'Reabriu OS';
    }
    if (a === 'finance.update' && event.sourceEntity === 'wefrotas_finance_entries') {
      const oldStatus = before.workflowStatus ?? before.status, newStatus = after.workflowStatus ?? after.status;
      const allocated = Boolean(after.orderId) && before.orderId !== after.orderId;
      const closed = after.closedExpense === true && before.closedExpense === false;
      if (allocated && closed) return 'Fechou despesa e alocou em OS';
      if (allocated) return before.orderId ? 'Realocou despesa em outra OS' : 'Alocou despesa em OS';
      if (closed) return 'Fechou despesa';
      if (oldStatus !== undefined && oldStatus !== newStatus && newStatus === 'pendente') return 'Estornou despesa para pendente';
      if (before.closedExpense === true && after.closedExpense === false) return 'Reabriu despesa';
      return 'Alterou Despesa';
    }
    if (a === 'finance.update' && before.status !== after.status) {
      if (after.status === 'distribuido') return 'Fechou despesa e alocou em OS';
      if (after.status === 'pendente') return 'Estornou despesa para pendente';
      if (after.status === 'fechada') return 'Fechou despesa';
    }
    const [entity, verb] = a.split('.');
    return {create:'Cadastrou',update:'Alterou',delete:'Excluiu'}[verb] ? `${{create:'Cadastrou',update:'Alterou',delete:'Excluiu'}[verb]} ${tableLabels[event.sourceEntity] || entities[entity] || entity}` : (event.technicalAction || 'Operação não identificada');
  }
  function result(event) {
    return {success:'Concluído',blocked:'Bloqueado',error:'Falhou',failed:'Falhou'}[event.result] || 'Não informado';
  }
  function item(event) {
    event = normalize(event);
    const v = event.after || event.before || {};
    return [v.number ? `${event.entity === 'order' ? 'OS ' : 'Nº '}${v.number}` : '', v.name, v.plate, v.protocol].filter(Boolean).join(' · ') || event.targetId || 'Não informado';
  }
  function details(event) {
    return changes(event).map(c => `${c.label}: ${c.before} → ${c.after}`).join(' | ') || 'O evento não contém diferenças detalhadas nos campos registrados.';
  }
  function filter(events, query = '', outcome = '', entity = '') {
    const terms = normalized(query).trim().split(/\s+/).filter(Boolean);
    return events.filter(event => {
      const e = normalize(event);
      return (!outcome || e.result === outcome || (outcome === 'error' && e.result === 'failed')) && (!entity || e.entity === entity) &&
        terms.every(t => normalized([date(e.at),e.organizationName,e.actorName,e.actorEmail,e.actorId,action(e),e.technicalAction,item(e),e.targetId,result(e),details(e),e.justification].join(' ')).includes(t));
    });
  }
  function csvCell(v) {
    const s = String(v ?? '');
    // Spreadsheet imports must never interpret user-controlled content as formulas.
    return '"' + (/^[\s\u0000-\u001f]*[=+@-]/.test(s) ? "'" + s : s).replace(/"/g, '""') + '"';
  }
  function csv(events) {
    const rows = [['Data e hora (Brasília)','Empresa','Usuário','E-mail','ID do usuário','Alteração realizada','Tipo técnico','Item','ID do item','Resultado','Detalhes (antes → depois)','Justificativa','ID do evento']];
    for (const event of events) { const e=normalize(event); rows.push([date(e.at),e.organizationName,e.actorName || '',e.actorEmail,e.actorId,action(e),e.technicalAction,item(e),e.targetId,result(e),details(e),e.justification || '',e.id]); }
    return '\uFEFF' + rows.map(row => row.map(csvCell).join(';')).join('\r\n');
  }
  function printReport(events, caption) {
    events = events.map(normalize);
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
  return {html,date,normalize,changes,action,result,item,details,filter,csv,printReport,sessionStatus,sessionDuration,sessionCsv};
});
