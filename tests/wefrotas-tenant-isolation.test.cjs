const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const { test } = require('node:test');
const source = fs.readFileSync(path.join(__dirname, '../wefrotas/wefrotas-backend.js'), 'utf8');
const ui = fs.readFileSync(path.join(__dirname, '../wefrotas/wefrotas.js'), 'utf8');
const clone = value => JSON.parse(JSON.stringify(value));
const tenant = (name) => ({ id: name, workspaceId: name, appwriteLabel: `org${name}`, appwriteManagerLabels: [`org${name}adm`], role: 'wefrotas-admin', modules: ['wefrotas'] });
const missing = () => Object.assign(new Error('not found'), { code: 404 });

async function harness() {
  const rows = new Map(), writes = [], storageWrites = [], appliedSnapshots = [], local = new Map(), timers = new Map();
  let nextTimer = 0, applied = { vehicles: [{ id: 'COVRE-PRIVATE' }], orders: [{ id: 'COVRE-ORDER' }] };
  let getError, writeError, pendingRead;
  const context = { console, TextEncoder, Uint8Array, crypto: webcrypto,
    setTimeout: fn => { timers.set(++nextTimer, fn); return nextTimer; }, clearTimeout: id => timers.delete(id),
    localStorage: { getItem: k => local.get(k) ?? null, setItem: (k,v) => local.set(k,v), removeItem: k => local.delete(k) },
    WEFROTAS_APPWRITE_CONFIG: { enabled: true, endpoint: 'https://example.test/v1', projectId: 'test', databaseId: 'db', tableId: 'snapshots' },
    Appwrite: {
      Client: class { setEndpoint() { return this; } setProject() { return this; } subscribe() { return () => {}; } },
      Account: class { async get() { return { $id: 'user', email: 'test@example.test', labels: ['admin'] }; } async deleteSession() {} },
      Storage: class {
        async createFile(args) { storageWrites.push(clone({ ...args, file: { type: args.file?.type, size: args.file?.size } })); return { $id: args.fileId }; }
        getFileView({ fileId }) { return `https://files.example.test/${fileId}`; }
      },
      ID: { unique: () => 'test-file-id' },
      TablesDB: class {
        async getRow({ rowId }) { if (pendingRead) await pendingRead; if (getError) throw getError; if (!rows.has(rowId)) throw missing(); return rows.get(rowId); }
        async updateRow(args) { if (writeError) throw writeError; if (!rows.has(args.rowId)) throw missing(); writes.push(clone(args)); rows.set(args.rowId, clone(args.data)); return args.data; }
        async createRow(args) { if (writeError) throw writeError; writes.push(clone(args)); rows.set(args.rowId, clone(args.data)); return args.data; }
      },
      Permission: { read: x => `read:${x}`, update: x => `update:${x}`, delete: x => `delete:${x}` },
      Role: { label: x => x, users: () => 'users', any: () => 'any' }
    }
  };
  context.window = context;
  vm.runInNewContext(source, context);
  const backend = context.WeFrotasBackend;
  await backend.initialize({ getSnapshot: () => applied, applySnapshot: async s => { applied = clone(s); appliedSnapshots.push(clone(s)); },
    persistSnapshot: async (snapshot, workspaceId) => {
      if (writeError) throw writeError;
      const rowId = await seed(workspaceId, snapshot);
      writes.push({ rowId, viaFunction: true, data: rows.get(rowId), permissions: [`read:${backend.getOrganizationContext().appwriteLabel}`] });
      return { ok: true, workspaceId };
    }
  });
  async function seed(name, snapshot) {
    const id = Buffer.from(await webcrypto.subtle.digest('SHA-256', new TextEncoder().encode(name))).toString('hex').slice(0,36);
    rows.set(id, { workspaceId: name, snapshot: JSON.stringify(snapshot) });
    return id;
  }
  return { backend, rows, writes, storageWrites, appliedSnapshots, local, timers, seed, snapshot: () => applied, setSnapshot: value => { applied = clone(value); },
    fail: e => { getError = e; }, failWrites: e => { writeError = e; }, hold: promise => { pendingRead = promise; } };
}

test('new tenant never uploads or adopts the previous company cache', async () => {
  const h = await harness();
  h.backend.setOrganizationContext(tenant('gave-test'));
  const result = await h.backend.adoptRemoteOrUploadLocal();
  assert.equal(result.mode, 'empty-workspace');
  assert.deepEqual(h.snapshot().vehicles, []);
  assert.deepEqual(h.snapshot().orders, []);
  assert.deepEqual(h.snapshot().centralCities, []);
  assert.equal(h.writes.length, 0);
  assert.equal(h.backend.isSnapshotReady(), true);
});

test('Covre also saves through the authenticated Function, not browser-assigned ACLs', async () => {
  const h = await harness();
  await h.seed('covre-e-cia', { vehicles: [{ id: 'EXISTING' }] });
  h.backend.setOrganizationContext(tenant('covre-e-cia'));
  await h.backend.adoptRemoteOrUploadLocal();
  await h.backend.syncNow({ vehicles: [{ id: 'EXISTING' }, { id: 'NEW' }] });
  assert.equal(h.writes.length, 1);
  assert.equal(h.writes[0].viaFunction, true);
  assert.equal(h.writes[0].data.workspaceId, 'covre-e-cia');
});

test('a tenant pending local write is recovered before an older remote snapshot can replace it', async () => {
  const h = await harness();
  await h.seed('gave-test', { vehicles: [], drivers: [] });
  h.backend.setOrganizationContext(tenant('gave-test'));
  h.setSnapshot({ vehicles: [{ id: 'GAVE-VEHICLE' }], drivers: [{ id: 'GAVE-DRIVER' }] });
  h.local.set('wefrotas_online_sync_pending:gave-test', '1');
  const result = await h.backend.adoptRemoteOrUploadLocal();
  assert.equal(result.mode, 'recovered-local-pending');
  assert.deepEqual(h.appliedSnapshots.at(-1).vehicles, [{ id: 'GAVE-VEHICLE' }]);
  assert.deepEqual(h.snapshot().vehicles, [{ id: 'GAVE-VEHICLE' }]);
  assert.deepEqual(h.snapshot().drivers, [{ id: 'GAVE-DRIVER' }]);
  assert.equal(h.local.has('wefrotas_online_sync_pending:gave-test'), false);
  assert.equal(h.writes.at(-1).data.workspaceId, 'gave-test');
  assert.equal(h.writes.at(-1).viaFunction, true);
});

test('a pending tenant snapshot remains available when the server is offline', async () => {
  const h = await harness();
  h.backend.setOrganizationContext(tenant('gave-test'));
  h.setSnapshot({ vehicles: [{ id: 'OFFLINE-VEHICLE' }], drivers: [{ id: 'OFFLINE-DRIVER' }] });
  h.local.set('wefrotas_online_sync_pending:gave-test', '1');
  h.failWrites(Object.assign(new Error('Failed to fetch'), { code: 500 }));
  const result = await h.backend.adoptRemoteOrUploadLocal();
  assert.equal(result.mode, 'local-pending');
  assert.deepEqual(h.appliedSnapshots.at(-1).vehicles, [{ id: 'OFFLINE-VEHICLE' }]);
  assert.deepEqual(h.snapshot().vehicles, [{ id: 'OFFLINE-VEHICLE' }]);
  assert.equal(h.local.get('wefrotas_online_sync_pending:gave-test'), '1');
  assert.equal(h.backend.isSnapshotReady(), true);
});

test('switch A → B → A keeps remote business data and permissions separated', async () => {
  const h = await harness();
  await h.seed('covre', { vehicles: [{ id: 'COVRE-PRIVATE' }] });
  h.backend.setOrganizationContext(tenant('covre'));
  await h.backend.adoptRemoteOrUploadLocal();
  h.backend.setOrganizationContext(tenant('gave-test'));
  await h.backend.adoptRemoteOrUploadLocal();
  await h.backend.syncNow({ vehicles: [{ id: 'GAVE-ONLY' }] });
  assert.ok(h.writes.every(w => w.data.workspaceId === 'gave-test'));
  assert.ok(h.writes.every(w => w.permissions.includes('read:orggave-test')));
  h.backend.setOrganizationContext(tenant('covre'));
  await h.backend.adoptRemoteOrUploadLocal();
  assert.deepEqual(h.snapshot().vehicles, [{ id: 'COVRE-PRIVATE' }]);
  h.backend.setOrganizationContext(tenant('gave-test'));
  await h.backend.adoptRemoteOrUploadLocal();
  assert.deepEqual(h.snapshot().vehicles, [{ id: 'GAVE-ONLY' }]);
});

test('queued writes from a previous tenant are cancelled', async () => {
  const h = await harness();
  h.backend.setOrganizationContext(tenant('covre'));
  await h.backend.adoptRemoteOrUploadLocal();
  h.backend.queueSnapshot({ vehicles: [{ id: 'OLD-QUEUE' }] });
  const oldCallbacks = [...h.timers.values()];
  h.backend.setOrganizationContext(tenant('gave-test'));
  await h.backend.adoptRemoteOrUploadLocal();
  for (const cb of oldCallbacks) cb();
  await Promise.resolve();
  assert.equal(h.writes.length, 0);
});

for (const code of [401, 403, 500]) test(`remote error ${code} cannot bootstrap local data`, async () => {
  const h = await harness();
  h.backend.setOrganizationContext(tenant('gave-test'));
  h.fail(Object.assign(new Error('remote failed'), { code }));
  await assert.rejects(h.backend.adoptRemoteOrUploadLocal());
  await assert.rejects(h.backend.syncNow({ vehicles: [{ id: 'LEAK' }] }));
  assert.equal(h.writes.length, 0);
  assert.equal(h.backend.isSnapshotReady(), false);
});

test('incomplete chunks and wrong-workspace rows fail closed', async () => {
  const h = await harness();
  const id = await h.seed('gave-test', {});
  h.backend.setOrganizationContext(tenant('gave-test'));
  h.rows.get(id).workspaceId = 'covre';
  await assert.rejects(h.backend.adoptRemoteOrUploadLocal(), /outra empresa/);
  h.rows.set(id, { workspaceId: 'gave-test', snapshot: 'chunked-v1:{"generation":"missing","count":1}' });
  await assert.rejects(h.backend.adoptRemoteOrUploadLocal());
  assert.equal(h.backend.isSnapshotReady(), false);
  assert.equal(h.writes.length, 0);
});

test('without an authorized tenant no upload is allowed, even with legacy admin labels', async () => {
  const h = await harness();
  h.backend.queueSnapshot({ vehicles: [{ id: 'LEAK' }] });
  await assert.rejects(h.backend.syncNow({}));
  assert.equal(h.timers.size, 0);
  assert.equal(h.writes.length, 0);
});

test('vehicle, banner and city uploads grant only the authenticated organization role', async () => {
  const h = await harness();
  h.backend.setOrganizationContext({
    ...tenant('gave-test'),
    appwriteRoleLabel: 'orggave-testadm',
    appwriteManagerLabels: ['orggave-testadm', 'orggave-testmgr']
  });
  await h.seed('gave-test', { vehicles: [] });
  await h.backend.adoptRemoteOrUploadLocal();
  const image = { type: 'image/png', size: 128 };
  await h.backend.uploadVehicleImage(image);
  await h.backend.uploadCentralBanner(image);
  await h.backend.uploadCentralCityImage(image);
  const expected = [
    'read:any',
    'update:orggave-testadm',
    'delete:orggave-testadm'
  ];
  assert.equal(h.storageWrites.length, 3);
  h.storageWrites.forEach((write) => {
    assert.deepEqual(write.permissions, expected);
    assert.ok(write.permissions.every(permission => !permission.includes('orggave-testmgr')));
  });
});

test('a delayed response cannot be applied to a different company', async () => {
  const h = await harness();
  await h.seed('covre', { vehicles: [{ id: 'SECRET' }] });
  h.backend.setOrganizationContext(tenant('covre'));
  let release;
  h.hold(new Promise(resolve => { release = resolve; }));
  const loading = h.backend.adoptRemoteOrUploadLocal();
  h.backend.setOrganizationContext(tenant('gave-test'));
  release();
  await assert.rejects(loading);
  assert.equal(h.writes.length, 0);
});

test('frontend cache has no shared startup key and auth errors stay behind login', () => {
  assert.match(ui, /let wefrotasIndexedDbSnapshotKey = ''/);
  assert.match(ui, /tenant:\$\{organization.id\}:\$\{organization.workspaceId\}/);
  assert.doesNotMatch(ui, /store.get\(['"]current['"]\)/);
  assert.match(ui, /await activateOrganizationStorage\(result.organization\)/);
  const flow = ui.slice(ui.indexOf('async function loginWeFrotasOnline'), ui.indexOf('async function logoutWeFrotasOnline'));
  assert.match(flow, /throw syncError/);
  assert.match(ui, /await persistOperationalDataImmediately\(\)/);
  assert.match(ui, /Veículo cadastrado e sincronizado/);
  assert.match(ui, /Motorista cadastrado e sincronizado/);
});

test('tenant changes clear transient receipt content before applying another company', () => {
  const organizationFlow = ui.slice(
    ui.indexOf('async function loadAuthorizedOrganizationContext'),
    ui.indexOf('const wefrotasRoleDefinitions')
  );
  assert.ok(organizationFlow.indexOf('closeReceiptViewer();') >= 0);
  assert.ok(organizationFlow.indexOf("updateFinanceReceiptPreview('');") >= 0);
  assert.ok(organizationFlow.indexOf('closeReceiptViewer();') < organizationFlow.indexOf("action: 'my-access'"));
  assert.ok(organizationFlow.indexOf("updateFinanceReceiptPreview('');") < organizationFlow.indexOf("action: 'my-access'"));

  const logoutFlow = ui.slice(
    ui.indexOf('async function logoutWeFrotasOnline'),
    ui.indexOf('async function syncWeFrotasOnline')
  );
  assert.match(logoutFlow, /closeReceiptViewer\(\);/);
  assert.match(logoutFlow, /updateFinanceReceiptPreview\(''\);/);
});

function storageHarness(indexedDbAvailable = true) {
  const local = new Map([['wefrotas_vehicles', '[{"id":"LEGACY-COVRE"}]']]);
  const rows = new Map([['current', { key: 'current', value: { vehicles: [{ id: 'LEGACY-COVRE' }] } }]]);
  const context = { console, Promise, JSON, Date,
    wefrotasStorageWorkspace: '', wefrotasIndexedDbSnapshotKey: '',
    wefrotasLocalSnapshotUpdatedAt: '', wefrotasStorageEngine: 'IndexedDB',
    wefrotasStorageQueue: Promise.resolve(), wefrotasIndexedDbStore: 'snapshots',
    localStorage: { getItem: k => local.get(k) ?? null, setItem: (k,v) => local.set(k,v), removeItem: k => local.delete(k) },
    snapshot: {},
    buildStorageSnapshot: () => context.snapshot,
    applyStorageSnapshot: value => { context.snapshot = clone(value); },
    window: { WeFrotasBackend: { isSnapshotReady: () => true, queueSnapshot: () => {} } },
    openWeFrotasIndexedDb: async () => {
      if (!indexedDbAvailable) throw Error('IndexedDB unavailable');
      return { transaction: () => ({ objectStore: () => ({
        get: key => { const req = {}; queueMicrotask(() => { req.result = rows.get(key); req.onsuccess(); }); return req; },
        put: row => { const req = {}; queueMicrotask(() => { rows.set(row.key, clone(row)); req.onsuccess(); }); return req; }
      }) }) };
    }
  };
  const slices = [
    ['    function parseLocalStorageJson(', '    function applyStorageSnapshot('],
    ['    function getLegacyLocalStorageSnapshot(', '    function openWeFrotasIndexedDb('],
    ['    function readWeFrotasIndexedDbSnapshot(', '    async function activateOrganizationStorage(']
  ].map(([a,b]) => ui.slice(ui.indexOf(a), ui.indexOf(b,ui.indexOf(a)))).join('\n');
  vm.createContext(context); vm.runInContext(slices, context);
  function switchTo(name) { context.wefrotasStorageWorkspace = name; context.wefrotasIndexedDbSnapshotKey = `tenant:${name}:${name}`; }
  return { context, local, rows, switchTo };
}

for (const indexed of [true, false]) test(`tenant storage is isolated with ${indexed ? 'IndexedDB' : 'localStorage fallback'}`, async () => {
  const h = storageHarness(indexed);
  await h.context.loadFromStorage();
  assert.deepEqual(h.context.snapshot, { centralCities: [] });
  h.switchTo('covre');
  await h.context.loadFromStorage();
  assert.notEqual(h.context.snapshot.vehicles?.[0]?.id, 'LEGACY-COVRE');
  h.context.snapshot = { vehicles: [{ id: 'A' }] };
  await h.context.saveToLocalStorage();
  h.switchTo('gave-test');
  await h.context.loadFromStorage();
  assert.notEqual(h.context.snapshot.vehicles?.[0]?.id, 'A');
  h.context.snapshot = { vehicles: [{ id: 'B' }] };
  await h.context.saveToLocalStorage();
  h.switchTo('covre');
  await h.context.loadFromStorage();
  assert.deepEqual(h.context.snapshot.vehicles, [{ id: 'A' }]);
  assert.equal(h.local.get('wefrotas_vehicles'), '[{"id":"LEGACY-COVRE"}]');
  assert.equal(h.rows.get('current').value.vehicles[0].id, 'LEGACY-COVRE');
});

test('delayed IndexedDB writes retain the original tenant key and immutable payload', async () => {
  const h = storageHarness();
  h.switchTo('covre');
  const snapshot = { vehicles: [{ id: 'A' }] };
  h.context.snapshot = snapshot;
  const saving = h.context.saveToLocalStorage();
  h.switchTo('gave-test');
  snapshot.vehicles[0].id = 'MUTATED';
  await saving;
  assert.equal(h.rows.get('tenant:covre:covre').value.vehicles[0].id, 'A');
  assert.equal(h.rows.has('tenant:gave-test:gave-test'), false);
});
