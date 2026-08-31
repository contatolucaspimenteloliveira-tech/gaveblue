const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'appwrite/functions/central-push/src/main.js'), 'utf8');

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
