const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'appwrite/functions/central-push/src/main.js'), 'utf8');

test('silent Central refresh preserves rendered rows while syncing or briefly offline', () => {
  const ui = fs.readFileSync(path.join(root, 'wefrotas/wefrotas.js'), 'utf8');
  const list = { innerHTML: '' };
  const context = {
    document: { getElementById: id => id === 'central-pending-list' ? list : null },
    getCentralPendingSortedRows: () => [{ $id: 'record-1', motorista: 'Motorista', comprovanteUrl: '' }],
    getCentralPendingRecordId: record => record.$id,
    selectedCentralPending: new Set(),
    renderCentralPendingSummary() {}, updateCentralPendingSortIndicators() {}, renderCentralPendingDateControls() {},
    getCentralPendingStatus: () => ({ className: 'pending', label: 'Pendente' }),
    getCentralPendingDate: () => '31/08/2026', getCentralPendingRecordType: () => 'Abastecimento',
    getCentralPendingDriverVehicleLabel: record => record.motorista || '-',
    getCentralPendingSupplier: () => 'Posto', getCentralPendingValue: () => 'R$ 10,00',
    escapeHtml: value => String(value),
    centralPendingRecords: [{ $id: 'record-1' }], centralPendingLoading: true,
    centralPendingLoaded: true, centralPendingError: ''
  };
  vm.createContext(context);
  vm.runInContext(ui.slice(ui.indexOf('    function renderCentralPendingRecords('), ui.indexOf('    async function refreshCentralPendingRecords(')), context);

  context.renderCentralPendingRecords();
  assert.match(list.innerHTML, /Motorista/);
  assert.doesNotMatch(list.innerHTML, /Buscando registros/);

  context.centralPendingLoading = false;
  context.centralPendingError = 'Falha temporária';
  context.renderCentralPendingRecords();
  assert.match(list.innerHTML, /Motorista/);
  assert.doesNotMatch(list.innerHTML, /Falha temporária/);

  context.centralPendingLoaded = false;
  context.centralPendingLoading = true;
  context.renderCentralPendingRecords();
  assert.match(list.innerHTML, /Buscando registros/);
});

test('Central uses one global field across record content and ignores legacy hidden filters', () => {
  const ui = fs.readFileSync(path.join(root, 'wefrotas/wefrotas.js'), 'utf8');
  const html = fs.readFileSync(path.join(root, 'wefrotas/index.html'), 'utf8');
  assert.match(html, /input id="global-search-input"/);
  assert.match(html, /button id="central-pending-date-range-button"/);
  assert.match(html, /div id="central-pending-calendar"[^>]+role="dialog"/);
  assert.match(html, /details id="central-pending-status-filter"/);
  assert.match(html, /data-status-value="rejeitado"/);
  assert.match(html, /<col class="central-col-driver">/);
  assert.match(html, />Filtrar<\/button>/);
  assert.doesNotMatch(html, /data-sort-key="type"/);
  assert.doesNotMatch(html, /central-pending-date-start-inline/);
  const css = fs.readFileSync(path.join(root, 'wefrotas/wefrotas.css'), 'utf8');
  assert.match(css, /\.central-pending-table-shell \{[\s\S]*height: clamp\(430px, calc\(100dvh - 250px\), 680px\)/);
  assert.match(css, /\.central-pending-table \{[\s\S]*table-layout: fixed/);
  assert.match(css, /\.central-pending-table-scroll \{[\s\S]*scrollbar-gutter: stable/);
  assert.doesNotMatch(html, /data-filter-module="documentos"/);
  assert.doesNotMatch(html, /central-pending-filter-controls/);
  for (const legacyId of ['central-pending-date-start', 'central-pending-value-filter', 'central-pending-vehicle-filter', 'central-pending-supplier-filter', 'central-pending-order-filter', 'central-pending-nf-filter', 'central-pending-due-start']) {
    assert.doesNotMatch(html, new RegExp(`id="${legacyId}"`));
  }
  assert.match(ui, /centralPendingStatusFilter = 'todos';[\s\S]*centralPendingDateStart = '';[\s\S]*centralPendingValueFilter = '';/);
  assert.match(ui, /centralPendingCalendarSelectingEnd[\s\S]*Agora escolha a data final/);
  assert.match(ui, /setCentralPendingCalendarView\('months'\)/);
  assert.match(ui, /setCentralPendingCalendarView\('years'\)/);
  assert.match(ui, /centralPendingDateStart = centralPendingDraftDateStart/);
  assert.match(ui, /document\.body\.classList\.toggle\('central-calendar-open', open\)/);
  assert.match(ui, /loadCentralPendingFilters\(\);\s*centralPendingStatusFilter = \['todos', 'pendente', 'aprovado', 'rejeitado'\]/);
  assert.match(ui, /getCentralPendingDriverVehicleLabel\(record\)/);
  assert.match(ui, /\^\(\\d\{4\}\)-\(\\d\{2\}\)-\(\\d\{2\}\)\$/);
  assert.match(ui, /getCentralPendingDate\(record\)[\s\S]*getCentralPendingValue\(record\)[\s\S]*getCentralPendingStatus\(record\)\.label/);
  assert.match(ui, /centralPendingSearchFilter\.split\(\/\\s\+\/\)\.map\(normalizeSearchText\)\.filter\(Boolean\)/);
  assert.match(ui, /terms\.every\(term => haystack\.includes\(term\)\)/);
  assert.match(ui, /activeModule === 'central' && activeCentralSection === 'registros'/);
  assert.match(ui, /centralPendingSearchFilter = normalizeComparableText\(value\);[\s\S]*renderCentralPendingRecords\(\)/);
  assert.match(ui, /Pesquisar nos registros da Central\.\.\./);
  const context = {};
  vm.createContext(context);
  vm.runInContext(ui.slice(ui.indexOf('    function normalizeComparableText('), ui.indexOf('    function parseBrazilianDateToIso(')), context);
  const query = context.normalizeComparableText('JOÃO REJEITADO');
  const terms = query.split(/\s+/).map(context.normalizeSearchText).filter(Boolean);
  const haystack = context.normalizeSearchText('26/08/2026 JOAO DOS SANTOS SILVA Rejeitado');
  assert.equal(terms.every(term => haystack.includes(term)), true);

  const calendarContext = { Date, Intl };
  vm.createContext(calendarContext);
  vm.runInContext(ui.slice(ui.indexOf('    function parseCentralPendingCalendarDate('), ui.indexOf('    function updateCentralPendingSortIndicators(')), calendarContext);
  assert.equal(calendarContext.parseCentralPendingCalendarDate('275-05-15'), null);
  assert.equal(calendarContext.parseCentralPendingCalendarDate('2026-02-30'), null);
  assert.equal(calendarContext.centralPendingCalendarIso(calendarContext.parseCentralPendingCalendarDate('2026-08-31')), '2026-08-31');

  const statusContext = { normalizeComparableText: context.normalizeComparableText };
  vm.createContext(statusContext);
  vm.runInContext(ui.slice(ui.indexOf('    function getCentralPendingStatus('), ui.indexOf('    function buildCentralPendingMessage(')), statusContext);
  assert.equal(statusContext.matchesCentralPendingStatus({ status: 'aprovado' }, 'aprovado'), true);
  assert.equal(statusContext.matchesCentralPendingStatus({ status: 'rejeitado' }, 'rejeitado'), true);
  assert.equal(statusContext.matchesCentralPendingStatus({ status: 'pendente' }, 'aprovado'), false);

  const driverContext = {
    allVehicles: [{ id: 'vehicle-1', placa: 'TOJ-1D23', motoristaId: 'driver-1' }],
    allDrivers: [{ id: 'driver-1', nome: 'AMANDA P. BONATTO', vehicleIds: ['vehicle-1'] }],
    normalizeComparableText: context.normalizeComparableText
  };
  vm.createContext(driverContext);
  vm.runInContext(ui.slice(ui.indexOf('    function getCentralPendingDriverVehicleLabel('), ui.indexOf('    function getCentralPendingValue(')), driverContext);
  assert.equal(driverContext.getCentralPendingDriverVehicleLabel({ motorista: 'AMANDA P. BONATTO' }), 'AMANDA - TOJ-1D23');
});

test('Finance, OS and entity modules share contextual search, compact status and period filters', () => {
  const ui = fs.readFileSync(path.join(root, 'wefrotas/wefrotas.js'), 'utf8');
  const html = fs.readFileSync(path.join(root, 'wefrotas/index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'wefrotas/wefrotas.css'), 'utf8');
  for (const module of ['orders', 'financeiro', 'veiculos', 'motoristas', 'fornecedores']) {
    assert.match(ui, new RegExp(`${module}: \\{[\\s\\S]*statusInputId:[\\s\\S]*startInputId:[\\s\\S]*endInputId:`));
  }
  for (const id of [
    'order-filter-status', 'order-filter-start', 'order-filter-end',
    'finance-filter-status', 'finance-filter-start', 'finance-filter-end',
    'vehicle-filter-status', 'vehicle-filter-start', 'vehicle-filter-end',
    'driver-filter-status', 'driver-filter-start', 'driver-filter-end',
    'supplier-filter-status', 'supplier-filter-start', 'supplier-filter-end'
  ]) assert.match(html, new RegExp(`id="${id}"`));
  for (const removedId of ['finance-filter-value', 'finance-filter-vehicle', 'finance-filter-supplier', 'finance-filter-order', 'finance-filter-nf', 'finance-filter-due-start', 'finance-filter-due-end', 'driver-filter-validity']) {
    assert.doesNotMatch(html, new RegExp(`id="${removedId}"`));
  }
  assert.equal((html.match(/contextual-module-filter-source/g) || []).length, 5);
  assert.match(ui, /contextualModuleSearchFields = \{[\s\S]*orders:[\s\S]*financeiro:[\s\S]*veiculos:[\s\S]*motoristas:[\s\S]*fornecedores:/);
  assert.match(ui, /syncContextualModuleSearch\(event\.target\.value, event\.currentTarget\)/);
  assert.match(ui, /input\.dataset\.contextualTargetId = centralRecordsContext \? 'central-records' : \(targetId \|\| ''\)/);
  assert.match(ui, /function getContextualModuleSearchValue\(module, fallbackId\)[\s\S]*globalTargetsModule \? \(globalSearchInputEl\.value \|\| ''\)/);
  for (const module of ['orders', 'financeiro', 'veiculos', 'motoristas', 'fornecedores']) {
    assert.match(ui, new RegExp(`getContextualModuleSearchValue\\('${module}'`));
  }
  assert.match(ui, /document\.getElementById\('finance-filter-search'\)\?\.addEventListener\('input', renderFinance\)/);
  assert.match(ui, /getFinanceEntryStatusLabel\(entry\)[\s\S]*formatCurrency\(total\)/);
  assert.match(ui, /formatDate\(order\.dataInicio\)[\s\S]*formatCurrency\(total\)/);
  assert.match(ui, /module-compact-status-[\s\S]*module-compact-calendar-[\s\S]*applyModuleCompactDateRange/);
  assert.match(ui, /state\.view === 'months'[\s\S]*state\.view === 'years'/);
  assert.match(css, /\.contextual-module-filter-source \{ display: none !important; \}/);
  assert.match(css, /\.module-compact-filters \{[\s\S]*display: inline-flex/);

  const context = {
    Date,
    parseCentralPendingCalendarDate(value) {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
      if (!match) return null;
      const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
      return Number.isNaN(date.getTime()) ? null : date;
    },
    centralPendingCalendarIso(date) { return date instanceof Date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : ''; },
    isEntityActive(entity) { return entity?.ativo !== false; }
  };
  vm.createContext(context);
  vm.runInContext(ui.slice(ui.indexOf('    function getEntityCreatedIsoDate('), ui.indexOf('    function getVisibleVehicles(')), context);
  assert.equal(context.matchesEntityStatus({ ativo: true }, 'ativo'), true);
  assert.equal(context.matchesEntityStatus({ ativo: false }, 'ativo'), false);
  assert.equal(context.matchesIsoDateRange('2026-08-15', '2026-08-01', '2026-08-31'), true);
  assert.equal(context.matchesIsoDateRange('2026-09-01', '2026-08-01', '2026-08-31'), false);
  assert.equal(context.getEntityCreatedIsoDate({ createdAt: '2026-08-31T12:00:00.000Z' }), '2026-08-31');
});

test('deletion success waits for server confirmation and failures remain pending', async () => {
  const ui = fs.readFileSync(path.join(root, 'wefrotas/wefrotas.js'), 'utf8');
  for (const fail of [false, true]) {
    const messages = [];
    let resolve, reject;
    const pending = new Promise((yes, no) => { resolve = yes; reject = no; });
    const context = { renderAll() {}, showToast: message => messages.push(message), persistOperationalDataImmediately: () => pending };
    vm.createContext(context);
    vm.runInContext(ui.slice(ui.indexOf('    async function confirmOperationalDeletion('), ui.indexOf('    function deleteSelectedVehicles(')), context);
    const operation = context.confirmOperationalDeletion('confirmed');
    assert.deepEqual(messages, ['Sincronizando exclusão…']);
    if (fail) reject(new Error('wrong session')); else resolve();
    await operation;
    assert.equal(messages.includes('confirmed'), !fail);
    if (fail) assert.match(messages[1], /pendente de sincronização: wrong session/);
  }
});

test('administrative execution uses the installed SDK session transport and synchronous arguments', async () => {
  const sent = [];
  const context = { URL, URLSearchParams, FormData, Headers,
    setTimeout, clearTimeout,
    window: { localStorage: { getItem: () => 'synthetic-session-for-test-only' } },
    fetch: async (url, options) => {
      sent.push({ url: String(url), ...options });
      return new Response('{"responseBody":"{\\"ok\\":true}"}', { status: 200, headers: { 'content-type': 'application/json' } });
    }
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, 'wefrotas/vendor/appwrite-sdk-26.2.0.js'), 'utf8'), context);
  context.global = context;
  context.currentUser = { $id: 'test-user' };
  context.client = new context.Appwrite.Client().setEndpoint('https://example.test/v1').setProject('test');
  context.config = { pushFunctionId: 'central-push' };
  const backend = fs.readFileSync(path.join(root, 'wefrotas/wefrotas-backend.js'), 'utf8');
  vm.runInContext(backend.slice(backend.indexOf('  async function executeAdministrativeFunction('), backend.indexOf('  async function digestId(')), context);
  const result = await context.executeAdministrativeFunction({ action: 'my-access' });
  assert.equal(JSON.parse(result.responseBody).ok, true);
  assert.equal(sent[0].headers['X-Fallback-Cookies'], 'synthetic-session-for-test-only');
  assert.equal(sent[0].credentials, 'include');
  assert.equal(sent[0].url, 'https://example.test/v1/functions/central-push/executions');
  assert.deepEqual(JSON.parse(sent[0].body), { body: '{"action":"my-access"}', async: false, path: '/', method: 'POST' });
});

test('company transition clears rendered users and ignores obsolete success/error responses', async () => {
  const ui = fs.readFileSync(path.join(root, 'wefrotas/wefrotas.js'), 'utf8');
  for (const rejects of [false, true]) {
    const requests = [], list = { innerHTML: 'previous company users' }, search = { value: 'previous search' };
    const context = {
      window: { clearTimeout() {} },
      document: { getElementById: id => id === 'central-users-search' ? search : list },
      renderWefrotasUsers() { list.innerHTML = JSON.stringify(context.centralManagerUsers); },
      executeCentralPushAdmin: () => new Promise((resolve, reject) => requests.push({ resolve, reject })),
      escapeHtml: value => value,
      centralManagerUsers: [{ id: 'covre' }], centralManagerUsersLoading: false,
      centralManagerUsersGeneration: 0, wefrotasUsersSearchTimer: null
    };
    vm.createContext(context);
    vm.runInContext(ui.slice(ui.indexOf('    function resetWefrotasUsers('), ui.indexOf('    function scheduleWefrotasUsersRefresh(')), context);
    const previous = context.refreshWefrotasUsers();
    context.resetWefrotasUsers();
    assert.equal(list.innerHTML, '[]');
    assert.equal(search.value, '');
    const current = context.refreshWefrotasUsers();
    if (rejects) requests[0].reject(new Error('obsolete error'));
    else requests[0].resolve({ users: [{ id: 'covre' }] });
    await previous;
    assert.equal(context.centralManagerUsersLoading, true);
    assert.equal(list.innerHTML, '[]');
    requests[1].resolve({ users: [{ id: 'gave' }] });
    await current;
    assert.equal(list.innerHTML, '[{"id":"gave"}]');
    assert.equal(context.centralManagerUsersLoading, false);
  }
  const activation = ui.slice(ui.indexOf('    async function activateOrganizationStorage('), ui.indexOf('    async function persistCentralConfigurationImmediately('));
  assert.match(activation, /resetWefrotasUsers\(\)/);
});

function authHarness(userId, workspaceId) {
  let labelWrites = 0;
  const context = {
    process: { env: {} }, WEFROTAS_COMPANY_ID: 'covre-e-cia',
    Client: class { setEndpoint() { return this; } setProject() { return this; } setJWT() { return this; } },
    Account: class { async get() { return { $id: userId }; } },
    parseBody: req => req.bodyJson,
    resolveSupabaseMembership: async () => ({ role: 'wefrotas-admin', organization: { workspaceId } }),
    ensureMembershipAppwriteLabels: async () => { labelWrites++; }
  };
  vm.createContext(context);
  vm.runInContext(source.slice(source.indexOf('async function authenticateManager('), source.indexOf('async function assertAdmin(')), context);
  return { run: bodyJson => context.authenticateManager({ headers: { 'x-appwrite-user-id': userId, 'x-appwrite-user-jwt': 'test-only' }, bodyJson }), writes: () => labelWrites };
}

for (const workspace of ['covre-e-cia', 'gave-blue-technologies']) {
  test(`matching session remains authorized for ${workspace}`, async () => {
    const h = authHarness('current-user', workspace);
    assert.equal((await h.run({ expectedUserId: 'current-user', expectedWorkspaceId: workspace })).organization.workspaceId, workspace);
    assert.equal(h.writes(), 1);
  });
  test(`stale tab cannot act through another user in ${workspace}`, async () => {
    const h = authHarness('new-login', workspace);
    await assert.rejects(h.run({ expectedUserId: 'old-login', expectedWorkspaceId: workspace }), error => error.status === 409);
    assert.equal(h.writes(), 0);
  });
  test(`stale company context is rejected before any label write in ${workspace}`, async () => {
    const h = authHarness('current-user', workspace);
    await assert.rejects(h.run({ expectedUserId: 'current-user', expectedWorkspaceId: workspace === 'covre-e-cia' ? 'gave-blue-technologies' : 'covre-e-cia' }), error => error.status === 409);
    assert.equal(h.writes(), 0);
  });
}

test('initial access and legacy clients still resolve company from membership, not payload', async () => {
  const h = authHarness('current-user', 'gave-blue-technologies');
  assert.equal((await h.run({ action: 'my-access', expectedUserId: 'current-user' })).organization.workspaceId, 'gave-blue-technologies');
  assert.equal((await h.run({ organization: { workspaceId: 'covre-e-cia' } })).organization.workspaceId, 'gave-blue-technologies');
});

test('frontend binds every administrative request to the displayed identity', async () => {
  const ui = fs.readFileSync(path.join(root, 'wefrotas/wefrotas.js'), 'utf8');
  let body;
  const backend = { getUser: () => ({ $id: 'gave-user' }), getOrganizationContext: () => ({ workspaceId: 'gave-blue-technologies' }),
    executeAdministrativeFunction: async payload => { body = payload; return { responseBody: '{"ok":true}' }; } };
  const context = { window: { WeFrotasBackend: backend } };
  vm.createContext(context);
  vm.runInContext(ui.slice(ui.indexOf('    async function executeCentralPushAdmin('), ui.indexOf('    async function loadAuthorizedOrganizationContext(')), context);
  await context.executeCentralPushAdmin({ action: 'central-record-delete', recordId: 'technical-test', expectedUserId: 'forged' });
  assert.equal(body.expectedUserId, 'gave-user');
  assert.equal(body.expectedWorkspaceId, 'gave-blue-technologies');
  await context.executeCentralPushAdmin({ action: 'my-access' });
  assert.equal(body.expectedWorkspaceId, undefined);
});

for (const workspaceId of ['covre-e-cia', 'gave-blue-technologies']) {
  test(`record delete and status update enforce the real owner for ${workspaceId}`, async () => {
    const writes = [], audits = [];
    let record = { $id: 'cr_20260831_test', workspaceId, status: 'pendente' };
    const database = {
      getDocument: async () => record,
      deleteDocument: async args => writes.push({ action: 'delete', ...args }),
      updateDocument: async args => { writes.push({ action: 'update', ...args }); return { ...record, ...args.data }; }
    };
    const context = {
      WEFROTAS_COMPANY_ID: 'covre-e-cia', DATABASE_ID: 'db', CENTRAL_RECORDS_COLLECTION_ID: 'records',
      normalizeTenant: value => value,
      assertCentralRecordId: value => value,
      getCentralRecord: async (db, recordId) => db.getDocument({ documentId: recordId }),
      tenantReadPermissions: organization => [`read:${organization.workspaceId}`],
      writeWefrotasAudit: async (db, entry) => audits.push(entry)
    };
    vm.createContext(context);
    vm.runInContext(source.slice(source.indexOf('async function updateCentralRecordStatus('), source.indexOf('async function migrateCentralStationsToWefrotas(')), context);
    const organization = { workspaceId };
    const payload = { recordId: record.$id, status: 'aprovado' };
    await context.updateCentralRecordStatus(database, 'actor', payload, organization);
    await context.deleteCentralRecord(database, 'actor', payload, organization);
    assert.deepEqual(writes.map(x => x.action), ['update', 'delete']);
    assert.equal(audits.length, 2);
    assert.equal(writes[0].permissions[0], `read:${workspaceId}`);
    record = { ...record, workspaceId: workspaceId === 'covre-e-cia' ? 'gave-blue-technologies' : 'covre-e-cia' };
    await assert.rejects(context.updateCentralRecordStatus(database, 'actor', payload, organization), error => error.status === 403);
    await assert.rejects(context.deleteCentralRecord(database, 'actor', payload, organization), error => error.status === 403);
    assert.equal(writes.length, 2);
    assert.equal(audits.length, 2);
  });
}
