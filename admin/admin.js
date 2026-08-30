(() => {
  'use strict';
  const config = window.GAVEBLUE_SUPABASE_CONFIG || {};
  const state = { client: null, session: null, organizations: [], plans: [], query: '', detailOrganizationId: '' };
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
    $('#detail-content').innerHTML = `<div class="detail-grid"><article><span>Status</span><strong>${statusLabel[org.status] || org.status}</strong></article><article><span>Plano</span><strong>${escapeHtml(sub?.plans?.name || 'Sem plano')}</strong></article><article><span>Workspace</span><strong>${escapeHtml(org.appwrite_workspace_id)}</strong></article><article><span>Usuários</span><strong>${members.filter((m) => m.status === 'active').length}</strong></article><article><span>Veículos permitidos</span><strong>${sub?.max_vehicles || sub?.plans?.max_vehicles || '—'}</strong></article><article><span>Dispositivos permitidos</span><strong>${sub?.max_devices || sub?.plans?.max_devices || '—'}</strong></article></div><div class="member-list"><div class="member-list-head"><span class="eyebrow">EQUIPE</span><button type="button" class="primary" data-new-member>+ Usuário</button></div>${members.length ? members.map((member) => `<div class="member-row"><strong>${escapeHtml(member.email)}</strong><span>${escapeHtml(member.role)}</span><span><span class="status ${member.status === 'active' ? 'active' : 'archived'}">${escapeHtml(member.status)}</span> <button type="button" class="secondary member-edit" data-edit-member="${member.id}">Editar</button></span></div>`).join('') : '<p>Nenhum usuário vinculado.</p>'}</div>`;
    $('#detail-modal').classList.remove('hidden'); $('#detail-modal').setAttribute('aria-hidden', 'false');
  }

  function openMemberForm(member = null) {
    $('#member-form').reset(); $('#member-organization-id').value = state.detailOrganizationId; $('#member-modal-title').textContent = member ? 'Editar usuário' : 'Adicionar usuário'; $('#member-form-error').textContent = '';
    if (member) { $('#member-email').value = member.email || ''; $('#member-email').readOnly = true; $('#member-role').value = member.role || 'viewer'; $('#member-status').value = member.status || 'active'; $('#member-appwrite-id').value = member.appwrite_user_id || ''; }
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
  $('#organization-form').addEventListener('submit', async (event) => { event.preventDefault(); const button = event.submitter; button.disabled = true; $('#org-form-error').textContent = ''; try { await invoke('organization-save', { id: $('#org-id').value, name: $('#org-name').value, slug: $('#org-slug').value, status: $('#org-status').value, legalName: $('#org-legal-name').value, document: $('#org-document').value, appwriteWorkspaceId: $('#org-workspace').value, logoUrl: $('#org-logo-url').value, primaryColor: $('#org-primary-color').value, secondaryColor: $('#org-secondary-color').value, address: $('#org-address').value, supportEmail: $('#org-support-email').value, whatsapp: $('#org-whatsapp').value, instagramUrl: $('#org-instagram').value, planId: $('#org-plan').value, subscriptionStatus: $('#org-status').value, modules: [$('#org-module-wefrotas').checked && 'wefrotas', $('#org-module-central').checked && 'central'].filter(Boolean) }); closeOrganizationForm(); await loadPlatform(); toast('Empresa salva com sucesso.'); } catch (error) { $('#org-form-error').textContent = error.message; } finally { button.disabled = false; } });
  $('#member-form').addEventListener('submit', async (event) => { event.preventDefault(); const button = event.submitter; button.disabled = true; $('#member-form-error').textContent = ''; try { await invoke('member-save', { organizationId: $('#member-organization-id').value, name: $('#member-name').value, email: $('#member-email').value, role: $('#member-role').value, status: $('#member-status').value, appwriteUserId: $('#member-appwrite-id').value, temporaryPassword: $('#member-temporary-password').value }); $('#member-temporary-password').value = ''; closeMemberForm(); await loadPlatform(); const org = state.organizations.find((item) => item.id === state.detailOrganizationId); if (org) openDetail(org); toast('Acesso salvo com sucesso.'); } catch (error) { $('#member-form-error').textContent = error.message; } finally { button.disabled = false; } });
  document.addEventListener('click', (event) => { const edit = event.target.closest('[data-edit-org]'); const open = event.target.closest('[data-open-org]'); const editMember = event.target.closest('[data-edit-member]'); if (edit) openOrganizationForm(state.organizations.find((org) => org.id === edit.dataset.editOrg)); if (open) openDetail(state.organizations.find((org) => org.id === open.dataset.openOrg)); if (event.target.closest('[data-new-member]')) openMemberForm(); if (editMember) { const org = state.organizations.find((item) => item.id === state.detailOrganizationId); openMemberForm((org?.organization_members || []).find((member) => member.id === editMember.dataset.editMember)); } if (event.target.closest('[data-close-modal]')) closeOrganizationForm(); if (event.target.closest('[data-close-member]')) closeMemberForm(); if (event.target.closest('[data-close-detail]')) $('#detail-modal').classList.add('hidden'); const nav = event.target.closest('[data-view]'); if (nav) { document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item === nav)); document.querySelectorAll('.view').forEach((view) => view.classList.toggle('active', view.id === `${nav.dataset.view}-view`)); $('#page-title').textContent = nav.textContent.trim(); } });
  $('#new-org-btn').addEventListener('click', () => openOrganizationForm()); $('#refresh-btn').addEventListener('click', loadPlatform); $('#search-input').addEventListener('input', (event) => { state.query = event.target.value; render(); }); $('#menu-btn').addEventListener('click', () => $('.sidebar').classList.toggle('open')); $('#logout-btn').addEventListener('click', async () => { await state.client.auth.signOut(); show('login-screen'); });
  bootstrap();
})();
