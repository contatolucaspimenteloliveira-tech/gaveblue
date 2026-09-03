const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../appwrite/functions/central-push/src/main.js'), 'utf8');
const block = source.slice(source.indexOf('function buildTenantDriverDirectory('), source.indexOf('async function appendApprovedFinanceEntry('));
const snapshot = () => ({ vehicles: [{ id: 'vehicle-a' }], drivers: [{ id: 'driver-a', nome: 'Teste', vehicleIds: ['vehicle-a'], cpf: 'private' }], suppliers: [], orders: [], finance: [] });
function harness(role = 'wefrotas-admin') {
  const writes = [];
  const organization = { id: 'gave', workspaceId: 'gave-workspace', appwriteLabel: 'orggave', modules: ['wefrotas'], limits: { vehicles: 2 } };
  const directoryWrites = [];
  const context = { Buffer, crypto: require('node:crypto'), DATABASE_ID: 'db', WEFROTAS_TABLE_ID: 'snapshots', DRIVER_DIRECTORY_COLLECTION_ID: 'directory', wefrotasSnapshotDocumentId: value => `snapshot-${value}`,
    Query: { equal: (key, values) => ({ key, values }), limit: value => ({ limit: value }), offset: value => ({ offset: value }) },
    tenantManagedPermissions: organization => [`read:${organization.appwriteLabel}`],
    assertOperationalManager: async () => {
      if (!['wefrotas-admin', 'wefrotas-gestor'].includes(role)) throw Object.assign(new Error('Forbidden'), { status: 403 });
      return { userId: 'actor', organization };
    },
    createDatabaseClient: () => ({ getDocument: async () => { throw { code: 404 }; }, updateDocument: async args => { directoryWrites.push(args); }, listDocuments: async () => ({ documents: [] }) }),
    persistWefrotasSnapshot: async (...args) => { writes.push(args); return { updatedAt: 'now' }; },
    getSnapshotAuditEvents: () => [], writeWefrotasAudit: async () => {}
  };
  vm.createContext(context); vm.runInContext(block, context);
  return { ...context, writes, directoryWrites, organization };
}
for (const role of ['wefrotas-admin', 'wefrotas-gestor']) test(`${role} saves only with the server-authorized company`, async () => {
  const h = harness(role);
  const data = snapshot();
  const result = await h.saveTenantOperationalSnapshot({}, { snapshot: data, workspaceId: 'gave-workspace', organization: { workspaceId: 'covre-e-cia' } });
  assert.equal(result.ok, true);
  assert.equal(h.writes[0][3], h.organization);
  assert.equal(h.writes[0][2], 'actor');
  assert.equal(h.writes[0][1], data);
  assert.equal(h.directoryWrites[0].data.workspaceId, 'gave-workspace');
});

test('directory cleanup cannot deactivate a row belonging to another company', async () => {
  const h = harness(); const changed = [];
  const db = { updateDocument: async args => changed.push(args), listDocuments: async () => ({ documents: [
    { $id: 'stale-own', workspaceId: 'gave-workspace', active: true },
    { $id: 'covre-private', workspaceId: 'covre-e-cia', active: true }
  ] }) };
  await h.syncTenantDriverDirectory(db, { drivers: [], vehicles: [] }, h.organization);
  assert.deepEqual(changed.map(row => row.documentId), ['stale-own']);
});
for (const role of ['wefrotas-consulta', 'wefrotas-aprovador', 'unknown']) test(`${role} cannot save snapshots`, async () => {
  const h = harness(role);
  await assert.rejects(h.saveTenantOperationalSnapshot({}, { snapshot: snapshot(), workspaceId: 'gave-workspace' }));
  assert.equal(h.writes.length, 0);
});
test('cross-company, invalid payload, missing membership/module and plan overflow do not write', async () => {
  const h = harness();
  await assert.rejects(h.saveTenantOperationalSnapshot({}, { snapshot: snapshot(), workspaceId: 'covre-e-cia' }));
  await assert.rejects(h.saveTenantOperationalSnapshot({}, { snapshot: {}, workspaceId: 'gave-workspace' }));
  h.organization.modules = [];
  await assert.rejects(h.saveTenantOperationalSnapshot({}, { snapshot: snapshot(), workspaceId: 'gave-workspace' }));
  h.organization.modules = ['wefrotas'];
  h.organization.id = '';
  await assert.rejects(h.saveTenantOperationalSnapshot({}, { snapshot: snapshot(), workspaceId: 'gave-workspace' }));
  h.organization.id = 'gave';
  const data = snapshot(); data.vehicles.push({ id: 'b' }, { id: 'c' });
  await assert.rejects(h.saveTenantOperationalSnapshot({}, { snapshot: data, workspaceId: 'gave-workspace' }));
  assert.equal(h.writes.length, 0);
});
test('new tenant directory reflects canonical links without exposing private fields', () => {
  const h = harness(); const data = snapshot();
  data.vehicles.push({ id: 'other', motoristaId: 'driver-a' });
  const rows = h.buildTenantDriverDirectory(data);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].vehicleId, 'vehicle-a');
  assert.equal(rows[0].cpf, undefined);
  data.drivers[0].vehicleIds = [];
  assert.equal(h.buildTenantDriverDirectory(data)[0].vehicleId, '');
  data.drivers[0].ativo = false;
  assert.equal(h.buildTenantDriverDirectory(data).length, 0);
});

test('empty new-company directory is allowed, but corruption and wrong company fail closed', async () => {
  const section = source.slice(source.indexOf('async function listDriverDirectory('), source.indexOf('async function listCentralBanners('));
  const h = { WEFROTAS_COMPANY_ID: 'covre-e-cia', DATABASE_ID: 'db', WEFROTAS_TABLE_ID: 'snapshots', wefrotasSnapshotDocumentId: x => x,
    buildTenantDriverDirectory: () => [], decodeWefrotasSnapshot: async () => { throw Object.assign(new Error('Missing chunk'), { code: 404 }); } };
  vm.createContext(h); vm.runInContext(section, h);
  const empty = await h.listDriverDirectory({ getDocument: async () => { throw { code: 404 }; } }, 'gave');
  assert.equal(empty.length, 0);
  await assert.rejects(h.listDriverDirectory({ getDocument: async () => ({ workspaceId: 'covre-e-cia' }) }, 'gave'));
  await assert.rejects(h.listDriverDirectory({ getDocument: async () => ({ workspaceId: 'gave', snapshot: 'broken' }) }, 'gave'), /Missing chunk/);
});

test('server-side banner deletion is tenant-scoped and also removes its uploaded file', async () => {
  const section = source.slice(source.indexOf('async function deleteTenantCentralBanner('), source.indexOf('async function createCentralRecord('));
  const deletedRows = [], deletedFiles = [];
  let document = { $id: 'banner-test', workspaceId: 'gave-workspace', fileId: 'file-test' };
  const context = {
    DATABASE_ID: 'db', CENTRAL_BANNERS_COLLECTION_ID: 'banners', WEFROTAS_BUCKET_ID: 'bucket', console,
    assertOperationalManager: async () => ({ organization: { workspaceId: 'gave-workspace' } }),
    assertCentralRecordId: value => String(value),
    createDatabaseClient: () => ({
      getDocument: async () => document,
      deleteDocument: async args => deletedRows.push(args)
    }),
    createServerClient: () => ({}),
    Storage: class { async deleteFile(args) { deletedFiles.push(args); } }
  };
  vm.createContext(context); vm.runInContext(section, context);
  const result = await context.deleteTenantCentralBanner({}, { rowId: 'banner-test' });
  assert.equal(result.fileDeleted, true);
  assert.equal(deletedRows[0].documentId, 'banner-test');
  assert.equal(deletedFiles[0].fileId, 'file-test');
  document = { ...document, workspaceId: 'covre-e-cia' };
  await assert.rejects(context.deleteTenantCentralBanner({}, { rowId: 'banner-test' }), /outra empresa/);
  assert.equal(deletedRows.length, 1);
});
