(function (global) {
  'use strict';
  const TTL = 10 * 60 * 1000;
  let scope = '', data = null, requestedAt = 0, pending = null, lastError = '';
  const node = id => document.getElementById(id);
  function currentScope() {
    const backend = global.WeFrotasBackend;
    const user = backend?.getUser?.();
    const org = backend?.getOrganizationContext?.().id;
    return user && org && !document.body.classList.contains('auth-locked') ? `${user.id || user.$id}:${org}` : '';
  }
  function validate(value) {
    if (!value || value.scope !== 'project' || value.source !== 'pg_database_size'
      || typeof value.usedBytes !== 'number' || !Number.isSafeInteger(value.usedBytes) || value.usedBytes < 0
      || typeof value.limitBytes !== 'number' || !Number.isSafeInteger(value.limitBytes) || value.limitBytes <= 0
      || !Number.isFinite(Date.parse(value.checkedAt)) || Date.parse(value.checkedAt) > Date.now() + 60000) throw new Error('Métrica inválida');
    return value;
  }
  function level(percent) { return percent >= 95 ? 'critical' : percent >= 85 ? 'danger' : percent >= 70 ? 'warning' : 'normal'; }
  function render() {
    const root = node('home-db-capacity');
    if (!root) return;
    root.hidden = !currentScope();
    if (root.hidden) return;
    const stale = data && Date.now() - Date.parse(data.checkedAt) > TTL;
    const percent = data ? data.usedBytes / data.limitBytes * 100 : 0;
    root.dataset.level = data && !stale && !lastError ? level(percent) : 'unknown';
    node('db-capacity-values').hidden = !data;
    node('db-capacity-refresh').disabled = !!pending;
    const copy = {
      normal: 'Uso do banco abaixo do primeiro alerta.',
      warning: 'Atenção: 70% ou mais em uso. Planeje ampliar a capacidade.',
      danger: 'Alerta: 85% ou mais em uso. Providencie mais capacidade.',
      critical: 'Crítico: 95% ou mais em uso. Há risco de restrição de novas gravações.'
    };
    node('db-capacity-status').textContent = lastError || (stale ? 'Consulta desatualizada. Atualize para conferir o uso atual.' : data ? copy[level(percent)] : 'Consultando o tamanho real do banco…');
    if (data) {
      node('db-capacity-used').textContent = `${(data.usedBytes / 1000000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} MB`;
      node('db-capacity-limit').textContent = `de ${(data.limitBytes / 1000000).toLocaleString('pt-BR')} MB`;
      node('db-capacity-percent').textContent = `${percent.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
      node('db-capacity-fill').style.width = `${Math.min(100, percent)}%`;
      node('db-capacity-meter').setAttribute('aria-valuenow', String(Math.min(100, percent)));
      node('db-capacity-updated').textContent = `Consultado em ${new Date(data.checkedAt).toLocaleString('pt-BR')}${stale || lastError ? ' · última leitura, sem confirmação atual' : ' · atualização a cada 10 minutos nesta tela'}`;
    }
  }
  async function refresh(force = false) {
    const next = currentScope();
    if (next !== scope) { scope = next; data = null; requestedAt = 0; pending = null; lastError = ''; }
    if (!next) { render(); return; }
    if (pending || (requestedAt && Date.now() - requestedAt < (force ? 15000 : TTL))) { render(); return; }
    requestedAt = Date.now();
    const request = {};
    pending = request;
    render();
    try {
      if (!global.WeFrotasBackend?.getDatabaseCapacity) throw new Error('Integração indisponível');
      const result = await global.WeFrotasBackend.getDatabaseCapacity();
      if (scope !== next || currentScope() !== next || pending !== request) return;
      data = validate(result); lastError = '';
    } catch (error) {
      if (scope !== next || currentScope() !== next || pending !== request) return;
      lastError = error?.code === '42501'
        ? 'Indicador global disponível apenas à administração da plataforma.'
        : 'Não foi possível consultar o banco. O uso atual não está confirmado.';
    } finally {
      if (pending === request) { pending = null; render(); }
    }
  }
  global.WeFrotasCapacity = Object.freeze({ refresh, validate, level });
  document.addEventListener('DOMContentLoaded', () => {
    new MutationObserver(() => { if (currentScope() !== scope) refresh(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    global.setInterval(() => {
      if (document.visibilityState === 'visible' && node('home-db-capacity')?.getClientRects().length) refresh();
    }, 60000);
    refresh();
  });
})(window);
