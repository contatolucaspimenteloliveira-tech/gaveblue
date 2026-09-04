(() => {
  'use strict';
  const config = window.GAVEBLUE_SUPABASE_CONFIG || {};
  const audit = window.GaveBlueAudit;
  const brandImage = document.querySelector('.brand img');
  const brandFallback = () => { brandImage.hidden = true; document.querySelector('.brand-fallback').hidden = false; };
  brandImage.addEventListener('error', brandFallback);
  if (brandImage.complete && !brandImage.naturalWidth) brandFallback();
  const state = { client: null, session: null, organizations: [], plans: [], query: '', detailOrganizationId: '', auditEvents: [], auditLoaded: false };
  const $ = (selector) => document.querySelector(selector);
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
  const configured = () => {
    const publicKey = String(config.anonKey || '').trim();
    const validPublicKey = publicKey.startsWith('sb_publishable_')
      ? publicKey.length >= 30
      : publicKey.length > 40;
    return /^https:\/\/.+\.supabase\.co$/i.test(config.url || '') && validPublicKey;
  };
  const statusLabel = { active: 'Ativa', trial: 'Em teste', past_due: 'Pagamento pendente', suspended: 'Suspensa', archived: 'Arquivada' };
  const moduleLabel = { wefrotas: 'WeFrotas', central: 'Central' };
  const initials = (value) => String(value || 'GB').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  function show(id) { ['setup-screen', 'login-screen', 'reset-screen', 'app'].forEach((key) => $('#' + key)?.classList.toggle('hidden', key !== id)); }
  function toast(message) { const node = $('#toast'); node.textContent = message; node.classList.remove('hidden'); clearTimeout(toast.timer); toast.timer = setTimeout(() => node.classList.add('hidden'), 3500); }
  async function invoke(action, payload = {}) {
    const { data, error } = await state.client.functions.invoke(config.functionName || 'platform-admin', { body: { action, ...payload } });
    if (error) {
      let message = error.message || 'Falha ao acessar a gestão da plataforma.';
      try {
        const details = await error.context?.json();
        if (details?.error) message = details.error;
      } catch (_) {
        // A resposta pode não ter corpo JSON (proxy ou indisponibilidade de rede).
      }
      throw new Error(message);
    }
    if (!data?.ok) throw new Error(data?.error || 'Operação não concluída.');
    return data;
  }

  async function bootstrap() {
    if (!configured() || !window.supabase?.createClient) { show('setup-screen'); return; }
    state.client = window.supabase.createClient(config.url, config.anonKey, { auth: { persistSession: true, autoRefreshToken: true } });
    state.client.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        state.session = session;
        show('reset-screen');
        setTimeout(() => $('#reset-password')?.focus(), 50);
      }
    });
    const { data } = await state.client.auth.getSession();
    state.session = data.session;
    if (location.hash.includes('type=recovery')) { show('reset-screen'); return; }
    if (!state.session) { show('login-screen'); return; }
    show('app');
    await loadPlatform();
  }

  async function loadPlatform() {
    const refresh = $('#refresh-btn'); refresh.disabled = true;
    try {
      const data = await invoke('bootstrap');
      state.organizations = data.organizations || [];
      state.plans = data.plans || [];
      $('#user-name').textContent = data.user?.email || 'Administrador';
      $('#user-role').textContent = data.adminRole || 'GaveBlue';
      $('#user-avatar').textContent = initials(data.user?.email);
      render();
    } catch (error) { toast(error.message); if (/entre/i.test(error.message)) { await state.client.auth.signOut(); show('login-screen'); } }
    finally { refresh.disabled = false; }
  }

  function subscriptionFor(org) { return Array.isArray(org.organization_subscriptions) ? org.organization_subscriptions[0] : org.organization_subscriptions; }
  function enabledModules(org) { return (org.organization_modules || []).filter((item) => item.enabled).map((item) => item.module_key); }
  function render() {
    const filtered = state.organizations.filter((org) => `${org.name} ${org.legal_name} ${org.document} ${org.slug}`.toLowerCase().includes(state.query.toLowerCase()));
    $('#stat-organizations').textContent = state.organizations.length;
    $('#stat-active').textContent = state.organizations.filter((org) => org.status === 'active').length;
    $('#stat-trial').textContent = state.organizations.filter((org) => org.status === 'trial').length;
    $('#stat-attention').textContent = state.organizations.filter((org) => ['past_due', 'suspended'].includes(org.status)).length;
    $('#organizations-list').innerHTML = filtered.length ? filtered.map((org) => {
      const subscription = subscriptionFor(org); const modules = enabledModules(org); const logo = org.logo_url ? `<img src="${escapeHtml(org.logo_url)}" alt="">` : initials(org.name);
      return `<article class="organization-card" style="--org-primary:${escapeHtml(org.primary_color)};--org-secondary:${escapeHtml(org.secondary_color)}"><div class="org-logo">${logo}</div><div class="org-copy"><strong>${escapeHtml(org.name)}</strong><span>${escapeHtml(org.document || org.slug)}</span></div><div class="modules">${modules.map((key) => `<span class="chip">${moduleLabel[key]}</span>`).join('')}</div><div class="org-meta"><span class="status ${escapeHtml(org.status)}">${statusLabel[org.status] || org.status}</span><div>${escapeHtml(subscription?.plans?.name || 'Sem plano')}</div></div><div class="card-actions"><button data-edit-org="${org.id}" title="Editar">✎</button><button data-open-org="${org.id}" title="Abrir">›</button></div></article>`;
    }).join('') : '<div class="empty"><span>Nenhuma empresa encontrada</span><p>Use “Nova empresa” para cadastrar o primeiro cliente.</p></div>';
    $('#plans-list').innerHTML = state.plans.map((plan) => `<article class="plan-card"><span class="eyebrow">${escapeHtml(plan.code)}</span><h3>${escapeHtml(plan.name)}</h3><p>${escapeHtml(plan.description)}</p><div class="plan-limits"><span>${plan.max_users} usuários</span><span>${plan.max_vehicles} veículos</span><span>${plan.max_devices} dispositivos</span></div></article>`).join('');
    $('#org-plan').innerHTML = '<option value="">Selecione</option>' + state.plans.map((plan) => `<option value="${plan.id}">${escapeHtml(plan.name)}</option>`).join('');
    const currentAuditOrganization = $('#audit-organization')?.value || '';
    document.querySelectorAll('#plans-list .plan-card').forEach(card => card.classList.toggle('hidden', !card.textContent.toLowerCase().includes(state.query.toLowerCase())));
    $('#audit-organization').innerHTML = '<option value="">Todas as empresas</option>' + state.organizations.map((org) => `<option value="${org.id}">${escapeHtml(org.name)}</option>`).join('');
    $('#audit-organization').value = currentAuditOrganization;
  }

  function filteredAudit() { return audit.filter(state.auditEvents, state.view === 'audit' ? state.query : '', $('#audit-result').value, $('#audit-entity').value); }
  function auditExportButtons(disabled) { ['csv','pdf','print'].forEach(key => $(`#audit-${key}-btn`).disabled = disabled); }
  function renderAudit() {
    const body = $('#audit-list');
    if (!body) return;
    const events = filteredAudit();
    body.innerHTML = events.length ? events.map((event) => `<tr><td>${escapeHtml(audit.date(event.at))}<small>Brasília · UTC−3</small></td><td>${escapeHtml(event.organizationName)}</td><td><strong>${escapeHtml(event.actorName || event.actorEmail || 'Não identificado')}</strong>${event.actorName ? `<small>${escapeHtml(event.actorEmail)}</small>` : ''}<small>ID: ${escapeHtml(event.actorId || 'Não registrado')}</small></td><td><strong>${escapeHtml(audit.action(event))}</strong><small>${escapeHtml(event.action)}</small></td><td>${escapeHtml(audit.item(event))}</td><td><span class="status ${event.result === 'success' ? 'active' : ['blocked','error','failed'].includes(event.result) ? 'past_due' : 'unknown'}">${escapeHtml(audit.result(event))}</span></td><td><button class="detail-button" data-audit-detail="${escapeHtml(event.organizationId + ':' + event.id)}" aria-label="Ver detalhes: ${escapeHtml(audit.action(event))}">Ver alteração</button></td></tr>`).join('') : '<tr><td class="audit-empty" colspan="7">Nenhum evento corresponde aos filtros. Tente outro período ou carregue mais eventos.</td></tr>';
    $('#audit-count').textContent = events.length;
    $('#audit-success').textContent = events.filter(e => e.result === 'success').length;
    $('#audit-blocked').textContent = events.filter(e => ['blocked','error','failed'].includes(e.result)).length;
    $('#audit-actors').textContent = new Set(events.map(e => e.actorId).filter(Boolean)).size;
    auditExportButtons(state.auditBusy || state.auditDirty || !events.length);
    $('#audit-more-btn').hidden = !state.auditHasMore;
  }
  function auditRange() {
    const start = $('#audit-date-start').value, end = $('#audit-date-end').value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || start > end) throw new Error('Informe um período válido, com data inicial anterior ou igual à final.');
    return {from: new Date(`${start}T00:00:00-03:00`).toISOString(), to: new Date(`${end}T23:59:59.999-03:00`).toISOString()};
  }
  function auditCaption() {
    const f = state.auditFilters;
    return `${f?.label || 'Período não carregado'} · Busca: ${state.query || 'todas'} · Resultado: ${$('#audit-result').selectedOptions[0].textContent} · Módulo: ${$('#audit-entity').selectedOptions[0].textContent} · ${state.auditHasMore ? 'Relatório parcial: há mais eventos para carregar' : 'Todos os eventos retornados no período'}`;
  }
  async function loadAudit(append = false) {
    const request = (state.auditRequest || 0) + 1; state.auditRequest = request;
    const body = $('#audit-list');
    let filters;
    try { filters = append ? state.auditFilters : { ...auditRange(), organizationId: $('#audit-organization').value, label: `${$('#audit-date-start').value} a ${$('#audit-date-end').value} · ${$('#audit-organization').selectedOptions[0].textContent}` }; }
    catch (error) { $('#audit-message').textContent = error.message; $('#audit-message').classList.add('error'); return; }
    state.auditBusy = true; auditExportButtons(true); $('#audit-more-btn').disabled = true;
    $('#audit-message').classList.remove('error'); $('#audit-message').textContent = 'Consultando eventos no servidor…';
    body.setAttribute('aria-busy','true');
    try {
      const data = await invoke('audit-list', { ...filters, limit: 200, cursors: append ? state.auditCursors : undefined });
      if (request !== state.auditRequest) return;
      // Do not imply that an old deployed API has applied date filtering or pagination.
      if (data.auditVersion !== 2) throw new Error('A atualização da consulta de auditoria ainda precisa ser publicada no servidor. Nenhum relatório será exportado com período incorreto.');
      const unique = new Map((append ? state.auditEvents : []).map(e => [e.organizationId + ':' + e.id,e]));
      (data.events || []).forEach(e => unique.set(e.organizationId + ':' + e.id,e));
      state.auditEvents = [...unique.values()].sort((a,b) => String(b.at).localeCompare(String(a.at)) || String(a.id).localeCompare(String(b.id)));
      state.auditFilters = filters; state.auditCursors = data.cursors; state.auditHasMore = data.hasMore; state.auditDirty = false;
      state.auditLoaded = true;
      $('#audit-message').textContent = `${filters.label} · ${state.auditEvents.length} eventos carregados. ${data.hasMore ? 'Há mais eventos neste período; use Carregar mais. Busca e exportação abrangem apenas os já carregados.' : 'Consulta do período concluída.'}`;
      if (!append) void loadSessions();
    } catch (error) {
      if (request !== state.auditRequest) return;
      state.auditDirty = true;
      $('#audit-message').textContent = error.message || 'Falha ao carregar a auditoria.'; $('#audit-message').classList.add('error');
    } finally {
      if (request === state.auditRequest) { state.auditBusy = false; $('#audit-more-btn').disabled = state.auditDirty; body.removeAttribute('aria-busy'); renderAudit(); }
    }
  }
  function auditDetails(key) {
    const e = state.auditEvents.find(e => e.organizationId + ':' + e.id === key); if (!e) return;
    $('#audit-detail-title').textContent = audit.action(e);
    const meta = { 'Data e hora (Brasília)':audit.date(e.at),'Empresa':e.organizationName,'Usuário':e.actorName || e.actorEmail,'ID do usuário':e.actorId,'Item afetado':audit.item(e),'ID do item':e.targetId,'Tipo técnico':e.action,'Resultado':audit.result(e),'ID do evento':e.id };
    const changes = audit.changes(e);
    $('#audit-detail-content').innerHTML = `<div class="audit-detail-content"><dl>${Object.entries(meta).map(([k,v]) => `<div><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v || 'Não registrado')}</dd></div>`).join('')}</dl>${changes.length ? `<table><thead><tr><th>Campo alterado</th><th>Antes</th><th>Depois</th></tr></thead><tbody>${changes.map(c => `<tr><td>${escapeHtml(c.label)}</td><td>${escapeHtml(c.before)}</td><td>${escapeHtml(c.after)}</td></tr>`).join('')}</tbody></table>` : '<p>Este evento não contém diferenças detalhadas nos campos registrados. Não é possível reconstruir valores que não foram auditados.</p>'}<p><strong>Justificativa</strong><br>${escapeHtml(e.justification || 'Não registrada neste evento.')}</p></div>`;
    $('#audit-detail').showModal();
  }
  function visibleSessions() {
    const normalize = v => String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const terms=normalize(state.query).split(/\s+/).filter(Boolean);
    return (state.sessions || []).filter(s=>terms.every(t=>normalize([s.actorName,s.actorEmail,s.actorId,s.organizationName,s.id,s.browser,s.system].join(' ')).includes(t)));
  }
  function sessionNow() { return Date.parse(state.sessionServerTime) + (Date.now() - state.sessionReceivedAt); }
  function renderSessions() {
    const sessions=visibleSessions();
    $('#sessions-list').innerHTML=sessions.length ? sessions.map(s=>{
      const status=state.sessionError || state.auditDirty ? 'Consulta não atualizada' : audit.sessionStatus(s,sessionNow());
      return `<tr><td><strong>${escapeHtml(s.actorName || s.actorEmail || 'Não identificado')}</strong><small>${escapeHtml(s.actorEmail)}</small><small>${escapeHtml(s.organizationName)}</small></td><td>${escapeHtml(s.browser)} · ${escapeHtml(s.system)}<small>ID: ${escapeHtml(s.id)}</small></td><td>${escapeHtml(audit.date(s.startedAt))}</td><td>${escapeHtml(audit.date(s.lastSeenAt))}</td><td>${escapeHtml(s.lastActivityAt ? audit.date(s.lastActivityAt) : 'Não registrada')}</td><td>${escapeHtml(audit.sessionDuration(s))}</td><td><span class="status ${status === 'Conectada recentemente' ? 'active' : 'unknown'}">${escapeHtml(status)}</span>${s.closedAt ? `<small>${escapeHtml(audit.date(s.closedAt))}</small>` : ''}</td></tr>`;
    }).join('') : '<tr><td class="audit-empty" colspan="7">Nenhum acesso registrado para esta consulta. Abas antigas só começam a informar presença após serem atualizadas.</td></tr>';
    $('#sessions-csv-btn').disabled=!!(state.sessionBusy || state.sessionError || state.auditDirty || !sessions.length);
  }
  async function loadSessions() {
    if (!state.auditFilters || state.auditDirty) return;
    const request=(state.sessionRequest || 0)+1; state.sessionRequest=request; state.sessionBusy=true; $('#sessions-csv-btn').disabled=true;
    const filters=state.auditFilters;
    try {
      const data=await invoke('session-list',filters);
      if(request!==state.sessionRequest) return;
      if(!Array.isArray(data.sessions) || !Number.isFinite(Date.parse(data.serverTime))) throw new Error('O acompanhamento de sessões ainda não foi publicado no servidor.');
      state.sessions=data.sessions; state.sessionServerTime=data.serverTime; state.sessionReceivedAt=Date.now(); state.sessionError=false;
      $('#sessions-message').classList.remove('error');
      $('#sessions-message').textContent=`${filters.label} · Último contato no período · ${data.sessions.length} conexões carregadas · Atualizado em ${audit.date(data.serverTime)}. ${data.limited ? 'Exibindo até 200 conexões recentes por empresa; reduza o período para investigar.' : ''}`;
    } catch(error) {
      if(request!==state.sessionRequest) return;
      state.sessionError=true; $('#sessions-message').classList.add('error'); $('#sessions-message').textContent=error.message;
    } finally {if(request===state.sessionRequest){state.sessionBusy=false;renderSessions();}}
  }
  function exportAudit(format) {
    const events = filteredAudit(); if (state.auditBusy || state.auditDirty || !events.length) return;
    if (format === 'csv') {
      const url = URL.createObjectURL(new Blob([audit.csv(events)],{type:'text/csv;charset=utf-8'}));
      const a = document.createElement('a'); a.href = url; a.download = `auditoria-${$('#audit-date-start').value}-${$('#audit-date-end').value}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(url),10000);
      toast(`Planilha com ${events.length} eventos exportada${state.auditHasMore ? ' (parcial)' : ''}.`);
    } else {
      $('#audit-print-report').innerHTML = audit.printReport(events,auditCaption());
      if (format === 'pdf') toast('Na janela de impressão, escolha “Salvar como PDF”.');
      window.print();
    }
  }
  function updateMenu(close = false) {
    const mobile = window.matchMedia('(max-width:720px)').matches;
    if (mobile) $('.sidebar').classList.toggle('open', !close && !$('.sidebar').classList.contains('open'));
    else if (!close) document.body.classList.toggle('sidebar-collapsed');
    const expanded = mobile ? $('.sidebar').classList.contains('open') : !document.body.classList.contains('sidebar-collapsed');
    $('#menu-btn').setAttribute('aria-expanded',String(expanded)); $('#menu-backdrop').hidden = !mobile || !expanded;
    $('.sidebar').inert = !expanded;
  }

  function openOrganizationForm(org = null) {
    $('#organization-form').reset(); $('#org-id').value = org?.id || ''; $('#org-modal-title').textContent = org ? 'Editar empresa' : 'Nova empresa';
    $('#org-name').value = org?.name || ''; $('#org-slug').value = org?.slug || ''; $('#org-status').value = org?.status || 'trial'; $('#org-legal-name').value = org?.legal_name || ''; $('#org-document').value = org?.document || ''; $('#org-workspace').value = org?.appwrite_workspace_id || ''; $('#org-logo-url').value = org?.logo_url || ''; $('#org-primary-color').value = org?.primary_color || '#2563eb'; $('#org-secondary-color').value = org?.secondary_color || '#7c3aed'; $('#org-address').value = org?.metadata?.address || ''; $('#org-support-email').value = org?.metadata?.supportEmail || ''; $('#org-whatsapp').value = org?.metadata?.whatsapp || ''; $('#org-instagram').value = org?.metadata?.instagramUrl || '';
    const modules = enabledModules(org || {}); $('#org-module-wefrotas').checked = !org || modules.includes('wefrotas'); $('#org-module-central').checked = !org || modules.includes('central'); $('#org-plan').value = subscriptionFor(org || {})?.plan_id || ''; $('#org-form-error').textContent = '';
    $('#organization-modal').classList.remove('hidden'); $('#organization-modal').setAttribute('aria-hidden', 'false'); setTimeout(() => $('#org-name').focus(), 50);
  }
  function closeOrganizationForm() { $('#organization-modal').classList.add('hidden'); $('#organization-modal').setAttribute('aria-hidden', 'true'); }
  function openDetail(org) {
    state.detailOrganizationId = org.id;
    const sub = subscriptionFor(org); const members = org.organization_members || []; $('#detail-title').textContent = org.name;
    const centralUrl = `/central/?empresa=${encodeURIComponent(org.slug)}`;
    const centralLink = (org.organization_modules || []).some((item) => item.module_key === 'central' && item.enabled !== false)
      ? `<div class="detail-links"><a class="secondary" href="${centralUrl}" target="_blank" rel="noopener">Abrir Central desta empresa</a><button type="button" class="secondary" data-copy-central="${escapeHtml(centralUrl)}">Copiar link da Central</button></div>`
      : '';
    $('#detail-content').innerHTML = `<div class="detail-grid"><article><span>Status</span><strong>${statusLabel[org.status] || org.status}</strong></article><article><span>Plano</span><strong>${escapeHtml(sub?.plans?.name || 'Sem plano')}</strong></article><article><span>Identificador</span><strong>${escapeHtml(org.appwrite_workspace_id)}</strong></article><article><span>Usuários</span><strong>${members.filter((m) => m.status === 'active').length}</strong></article><article><span>Veículos permitidos</span><strong>${sub?.max_vehicles || sub?.plans?.max_vehicles || '—'}</strong></article><article><span>Dispositivos permitidos</span><strong>${sub?.max_devices || sub?.plans?.max_devices || '—'}</strong></article></div>${centralLink}<div class="member-list"><div class="member-list-head"><span class="eyebrow">EQUIPE</span><button type="button" class="primary" data-new-member>+ Usuário</button></div>${members.length ? members.map((member) => `<div class="member-row"><strong>${escapeHtml(member.email)}</strong><span>${escapeHtml(member.role)}</span><span><span class="status ${member.status === 'active' ? 'active' : 'archived'}">${escapeHtml(member.status)}</span> <button type="button" class="secondary member-edit" data-edit-member="${member.id}">Editar</button></span></div>`).join('') : '<p>Nenhum usuário vinculado.</p>'}</div>`;
    $('#detail-modal').classList.remove('hidden'); $('#detail-modal').setAttribute('aria-hidden', 'false');
  }

  function openMemberForm(member = null) {
    $('#member-form').reset(); $('#member-organization-id').value = state.detailOrganizationId; $('#member-modal-title').textContent = member ? 'Editar usuário' : 'Adicionar usuário'; $('#member-form-error').textContent = '';
    if (member) { $('#member-email').value = member.email || ''; $('#member-email').readOnly = true; $('#member-role').value = member.role || 'viewer'; $('#member-status').value = member.status || 'active'; }
    else $('#member-email').readOnly = false;
    $('#member-modal').classList.remove('hidden'); $('#member-modal').setAttribute('aria-hidden', 'false'); setTimeout(() => $('#member-email').focus(), 50);
  }
  function closeMemberForm() { $('#member-modal').classList.add('hidden'); $('#member-modal').setAttribute('aria-hidden', 'true'); }

  $('#login-form').addEventListener('submit', async (event) => { event.preventDefault(); const button = event.submitter; button.disabled = true; $('#login-error').textContent = ''; try { const { data, error } = await state.client.auth.signInWithPassword({ email: $('#login-email').value.trim(), password: $('#login-password').value }); if (error) throw error; state.session = data.session; show('app'); await loadPlatform(); } catch (error) { $('#login-error').textContent = error.message; } finally { button.disabled = false; } });
  $('#forgot-password-btn').addEventListener('click', async () => {
    const email = $('#login-email').value.trim().toLowerCase();
    if (!email) { $('#login-error').textContent = 'Informe seu e-mail para receber o link de recuperação.'; $('#login-email').focus(); return; }
    const button = $('#forgot-password-btn'); button.disabled = true; $('#login-error').textContent = '';
    try {
      const redirectTo = `${location.origin}${location.pathname}`;
      const { error } = await state.client.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      $('#login-error').textContent = 'Link enviado. Confira sua caixa de entrada e também o spam.';
      $('#login-error').classList.add('success-message');
    } catch (error) {
      $('#login-error').classList.remove('success-message');
      $('#login-error').textContent = error.message || 'Não foi possível enviar o link de recuperação.';
    } finally { button.disabled = false; }
  });
  $('#reset-password-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = event.submitter; const password = $('#reset-password').value; const confirmation = $('#reset-password-confirm').value;
    $('#reset-password-error').textContent = '';
    if (password.length < 8) { $('#reset-password-error').textContent = 'A senha precisa ter pelo menos 8 caracteres.'; return; }
    if (password !== confirmation) { $('#reset-password-error').textContent = 'As senhas informadas não são iguais.'; return; }
    button.disabled = true;
    try {
      const { error } = await state.client.auth.updateUser({ password });
      if (error) throw error;
      await state.client.auth.signOut();
      history.replaceState({}, document.title, location.pathname);
      $('#login-password').value = '';
      $('#login-error').classList.add('success-message');
      $('#login-error').textContent = 'Senha alterada. Entre com a nova senha.';
      show('login-screen');
    } catch (error) { $('#reset-password-error').textContent = error.message || 'Não foi possível alterar a senha.'; }
    finally { button.disabled = false; }
  });
  $('#organization-form').addEventListener('submit', async (event) => { event.preventDefault(); const button = event.submitter; button.disabled = true; $('#org-form-error').textContent = ''; try { await invoke('organization-save', { id: $('#org-id').value, name: $('#org-name').value, slug: $('#org-slug').value, status: $('#org-status').value, legalName: $('#org-legal-name').value, document: $('#org-document').value, workspaceId: $('#org-workspace').value, logoUrl: $('#org-logo-url').value, primaryColor: $('#org-primary-color').value, secondaryColor: $('#org-secondary-color').value, address: $('#org-address').value, supportEmail: $('#org-support-email').value, whatsapp: $('#org-whatsapp').value, instagramUrl: $('#org-instagram').value, planId: $('#org-plan').value, subscriptionStatus: $('#org-status').value, modules: [$('#org-module-wefrotas').checked && 'wefrotas', $('#org-module-central').checked && 'central'].filter(Boolean) }); closeOrganizationForm(); await loadPlatform(); toast('Empresa salva com sucesso.'); } catch (error) { $('#org-form-error').textContent = error.message; } finally { button.disabled = false; } });
  $('#member-form').addEventListener('submit', async (event) => { event.preventDefault(); const button = event.submitter; button.disabled = true; $('#member-form-error').textContent = ''; try { await invoke('member-save', { organizationId: $('#member-organization-id').value, name: $('#member-name').value, email: $('#member-email').value, role: $('#member-role').value, status: $('#member-status').value, temporaryPassword: $('#member-temporary-password').value }); $('#member-temporary-password').value = ''; closeMemberForm(); await loadPlatform(); const org = state.organizations.find((item) => item.id === state.detailOrganizationId); if (org) openDetail(org); toast('Acesso salvo no Supabase com sucesso.'); } catch (error) { $('#member-form-error').textContent = error.message; } finally { button.disabled = false; } });
  document.addEventListener('click', async (event) => {
    const edit = event.target.closest('[data-edit-org]');
    const open = event.target.closest('[data-open-org]');
    const editMember = event.target.closest('[data-edit-member]');
    const copyCentral = event.target.closest('[data-copy-central]');
    if (edit) openOrganizationForm(state.organizations.find((org) => org.id === edit.dataset.editOrg));
    if (open) openDetail(state.organizations.find((org) => org.id === open.dataset.openOrg));
    if (event.target.closest('[data-new-member]')) openMemberForm();
    if (editMember) {
      const org = state.organizations.find((item) => item.id === state.detailOrganizationId);
      openMemberForm((org?.organization_members || []).find((member) => member.id === editMember.dataset.editMember));
    }
    if (copyCentral) {
      try {
        const absoluteUrl = new URL(copyCentral.dataset.copyCentral, window.location.origin).href;
        await navigator.clipboard.writeText(absoluteUrl);
        toast('Link da Central copiado.');
      } catch (error) {
        toast('Não foi possível copiar o link.');
      }
    }
    if (event.target.closest('[data-close-modal]')) closeOrganizationForm();
    if (event.target.closest('[data-close-member]')) closeMemberForm();
    if (event.target.closest('[data-close-detail]')) $('#detail-modal').classList.add('hidden');
    const auditDetail = event.target.closest('[data-audit-detail]');
    if (auditDetail) auditDetails(auditDetail.dataset.auditDetail);
    const nav = event.target.closest('[data-view]');
    if (nav) {
      document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item === nav));
      document.querySelectorAll('.view').forEach((view) => view.classList.toggle('active', view.id === `${nav.dataset.view}-view`));
      state.view = nav.dataset.view; state.query = ''; $('#search-input').value = '';
      $('#page-title').textContent = {organizations:'Empresas',plans:'Planos',audit:'Auditoria'}[state.view];
      $('#page-description').textContent = state.view === 'audit' ? 'Rastreie operações, alterações e resultados por empresa.' : 'Gerencie empresas, licenças e acessos em um só lugar.';
      $('#search-input').placeholder = state.view === 'audit' ? 'Pesquisar usuário, ação, OS, placa...' : state.view === 'plans' ? 'Pesquisar plano...' : 'Pesquisar empresa...';
      $('#search-input').setAttribute('aria-label', $('#search-input').placeholder);
      $('#new-org-btn').classList.toggle('hidden',state.view !== 'organizations');
      updateMenu(true);
      if (nav.dataset.view === 'audit') loadAudit();
      else render();
    }
  });
  $('#new-org-btn').addEventListener('click', () => openOrganizationForm());
  $('#refresh-btn').addEventListener('click', () => state.view === 'audit' ? loadAudit() : loadPlatform());
  $('#audit-filter-form').addEventListener('submit', event => { event.preventDefault(); loadAudit(); });
  ['audit-date-start','audit-date-end','audit-organization'].forEach(id => $('#' + id).addEventListener('input', () => {
    state.auditRequest = (state.auditRequest || 0) + 1; state.auditBusy = false; state.auditDirty = true; auditExportButtons(true); $('#audit-more-btn').disabled = true; $('#audit-list').removeAttribute('aria-busy');
    $('#audit-message').textContent = 'Período / empresa alterado. Clique em Filtrar para atualizar os dados antes de exportar.';
    state.sessionRequest=(state.sessionRequest || 0)+1; state.sessionBusy=false; renderSessions();
  }));
  ['audit-result','audit-entity'].forEach(id => $('#' + id).addEventListener('change',renderAudit));
  function defaultPeriod() {
    const today = new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    $('#audit-date-end').value = today; $('#audit-date-start').value = today.slice(0,8) + '01';
  }
  defaultPeriod();
  $('#audit-entity').append(new Option('Acessos','session'));
  $('#audit-clear-btn').addEventListener('click', () => { defaultPeriod(); $('#audit-organization').value = ''; $('#audit-result').value = ''; $('#audit-entity').value = ''; state.query = ''; $('#search-input').value = ''; loadAudit(); });
  $('#audit-more-btn').addEventListener('click', () => loadAudit(true));
  ['csv','pdf','print'].forEach(format => $(`#audit-${format}-btn`).addEventListener('click', () => exportAudit(format)));
  $('#audit-detail-close').addEventListener('click', () => $('#audit-detail').close());
  $('#audit-detail').addEventListener('click', e => { if (e.target === $('#audit-detail')) $('#audit-detail').close(); });
  $('#search-input').addEventListener('input', (event) => { state.query = event.target.value; if (state.view === 'audit') {renderAudit();renderSessions();} else render(); });
  $('#sessions-refresh-btn').addEventListener('click',()=>state.auditDirty || !state.auditFilters ? loadAudit() : loadSessions());
  $('#sessions-csv-btn').addEventListener('click',()=>{
    if($('#sessions-csv-btn').disabled) return;
    const url=URL.createObjectURL(new Blob([audit.sessionCsv(visibleSessions(),sessionNow())],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='sessoes-wefrotas.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
  });
  // Presence refresh is a read-only admin query, independent of operational sync.
  setInterval(()=>{if(state.view==='audit' && !document.hidden && !state.sessionBusy) void loadSessions();},300000);
  $('#menu-btn').addEventListener('click', () => updateMenu()); $('#menu-backdrop').addEventListener('click', () => updateMenu(true));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('.sidebar').classList.contains('open')) { updateMenu(true); $('#menu-btn').focus(); } });
  window.matchMedia('(max-width:720px)').addEventListener('change', () => updateMenu(true)); updateMenu(true);
  $('#logout-btn').addEventListener('click', async () => { await state.client.auth.signOut(); state.auditRequest = (state.auditRequest || 0) + 1; state.sessionRequest=(state.sessionRequest || 0)+1; state.sessions=[];state.view='';state.auditEvents = []; $('#audit-print-report').innerHTML = ''; $('#audit-detail').close(); show('login-screen'); });
  bootstrap();
})();
