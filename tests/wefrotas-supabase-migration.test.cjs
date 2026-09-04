const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const coreSource = fs.readFileSync(path.join(__dirname, '../wefrotas/wefrotas-supabase-core.js'), 'utf8');
const backendSource = fs.readFileSync(path.join(__dirname, '../wefrotas/wefrotas-supabase-backend.js'), 'utf8');
const migration = fs.readFileSync(path.join(__dirname, '../supabase/migrations/202609040001_wefrotas_operational.sql'), 'utf8');
const platformAdminSource = fs.readFileSync(path.join(__dirname, '../supabase/functions/platform-admin/index.ts'), 'utf8');
const wefrotasAdminSource = fs.readFileSync(path.join(__dirname, '../supabase/functions/wefrotas-admin/index.ts'), 'utf8');
const adminHtml = fs.readFileSync(path.join(__dirname, '../admin/index.html'), 'utf8');
const context = { console, JSON, Map, Set };
context.window = context;
vm.runInNewContext(coreSource, context);
const core = context.WeFrotasSupabaseCore;
const clone = (value) => JSON.parse(JSON.stringify(value));

for (const key of core.ENTITY_KEYS) {
  test(`normalize keeps ${key} as an isolated entity array`, () => {
    const input = { [key]: [{ id: `${key}-1`, nested: { value: 1 } }] };
    const result = core.normalizeSnapshot(input);
    assert.deepEqual(clone(result[key]), input[key]);
    input[key][0].nested.value = 9;
    assert.equal(result[key][0].nested.value, 1);
  });

  test(`delta creates one ${key} row`, () => {
    const delta = core.diffSnapshots({}, { [key]: [{ id: 'new', value: 1 }] });
    assert.deepEqual(clone(delta[key]), { upserts: [{ id: 'new', value: 1 }], deletes: [] });
  });

  test(`delta updates only the changed ${key} row`, () => {
    const before = { [key]: [{ id: 'same', value: 1 }, { id: 'changed', value: 1 }] };
    const after = { [key]: [{ id: 'same', value: 1 }, { id: 'changed', value: 2 }] };
    assert.deepEqual(clone(core.diffSnapshots(before, after)[key]), { upserts: [{ id: 'changed', value: 2 }], deletes: [] });
  });

  test(`delta deletes only the removed ${key} row`, () => {
    const before = { [key]: [{ id: 'keep' }, { id: 'remove' }] };
    const after = { [key]: [{ id: 'keep' }] };
    assert.deepEqual(clone(core.diffSnapshots(before, after)[key]), { upserts: [], deletes: ['remove'] });
  });

  test(`realtime upsert changes only ${key}`, () => {
    const original = { [key]: [{ id: 'one', value: 1 }], orders: key === 'orders' ? [{ id: 'one', value: 1 }] : [{ id: 'order-safe' }] };
    const result = core.applyRealtimeEntity(original, key, 'UPDATE', { entity_id: 'one', data: { id: 'one', value: 2 } });
    assert.equal(result[key].find((item) => item.id === 'one').value, 2);
    if (key !== 'orders') assert.deepEqual(clone(result.orders), [{ id: 'order-safe' }]);
  });

  test(`realtime delete removes only ${key}`, () => {
    const result = core.applyRealtimeEntity({ [key]: [{ id: 'one' }, { id: 'two' }] }, key, 'DELETE', { entity_id: 'one' });
    assert.deepEqual(clone(result[key]), [{ id: 'two' }]);
  });
}

for (const key of core.STATE_KEYS) {
  test(`state extraction preserves ${key}`, () => {
    const input = { [key]: key === 'customLogoEnabled' ? true : `${key}-value`, orderCounter: 17 };
    const state = core.extractState(input);
    assert.deepEqual(clone(state.settings[key]), input[key]);
    assert.equal(state.orderCounter, 17);
  });
}

test('normalization rejects entities without an id during diff', () => {
  assert.throws(() => core.diffSnapshots({}, { vehicles: [{ placa: 'AAA0A00' }] }), /precisa de um ID/);
});

test('normalization rejects duplicate IDs during diff', () => {
  assert.throws(() => core.diffSnapshots({}, { orders: [{ id: '1' }, { id: '1' }] }), /ID duplicado/);
});

test('canonical equality ignores object property order', () => {
  assert.equal(core.equal({ b: 2, a: { d: 4, c: 3 } }, { a: { c: 3, d: 4 }, b: 2 }), true);
});

test('hasDelta is false for identical snapshots', () => {
  assert.equal(core.hasDelta(core.diffSnapshots({ orders: [{ id: '1' }] }, { orders: [{ id: '1' }] })), false);
});

test('hasDelta is true for one changed entity', () => {
  assert.equal(core.hasDelta(core.diffSnapshots({}, { finance: [{ id: 'f1' }] })), true);
});

test('countSnapshot counts every operational entity independently', () => {
  const snapshot = Object.fromEntries(core.ENTITY_KEYS.map((key, index) => [key, Array.from({ length: index }, (_, item) => ({ id: `${key}-${item}` }))]));
  assert.deepEqual(clone(core.countSnapshot(snapshot)), Object.fromEntries(core.ENTITY_KEYS.map((key, index) => [key, index])));
});

test('the browser backend contains no Appwrite runtime reference', () => {
  assert.doesNotMatch(backendSource, /global\.Appwrite|new Appwrite|appwrite-sdk|APPWRITE_FUNCTION/);
});

test('the browser backend authenticates with Supabase password auth', () => {
  assert.match(backendSource, /auth\.signInWithPassword/);
  assert.match(backendSource, /auth\.getSession/);
});

test('the browser backend sends atomic revisioned deltas', () => {
  assert.match(backendSource, /wefrotas_apply_snapshot_delta/);
  assert.match(backendSource, /expected_revision:revision/);
  assert.match(backendSource, /WEFROTAS_REVISION_CONFLICT/);
});

test('the browser backend preserves local pending state on failed save', () => {
  const syncBody = backendSource.slice(backendSource.indexOf('async function syncNow'), backendSource.indexOf('function queueSnapshot'));
  assert.match(syncBody, /setPending\(true\)/);
  assert.doesNotMatch(syncBody, /setPending\(false\).*throw error/s);
});

test('the relational migration creates one table per operational entity', () => {
  Object.values(core.ENTITY_TABLES).forEach((table) => assert.match(migration, new RegExp(`create table if not exists public\\.${table}`)));
});

test('the migration has tenant-scoped composite primary keys', () => {
  assert.match(migration, /primary key \(organization_id, entity_id\)/);
});

test('the migration enforces RLS on every operational table through a guarded loop', () => {
  assert.match(migration, /alter table public\.%I enable row level security/);
  assert.match(migration, /public\.wefrotas_can_read\(organization_id\)/);
  assert.match(migration, /public\.wefrotas_can_write\(organization_id\)/);
});

test('the migration import is idempotent and content-addressed', () => {
  assert.match(migration, /unique \(organization_id, import_key\)/);
  assert.match(migration, /snapshot_sha256/);
  assert.match(migration, /'idempotent',true/);
  assert.match(migration, /different content/);
});

test('the migration refuses stale concurrent revisions', () => {
  assert.match(migration, /for update/);
  assert.match(migration, /WEFROTAS_REVISION_CONFLICT/);
});

test('the migration never drops operational tables', () => {
  assert.doesNotMatch(migration, /drop\s+table/i);
  assert.doesNotMatch(migration, /truncate/i);
});

test('the migration creates row-level audit events for create update and delete', () => {
  assert.match(migration, /wefrotas_audit_entity/);
  assert.match(migration, /after insert or update or delete/);
  assert.match(migration, /actor_email/);
});

test('the migration links only pre-authorized active member emails on signup', () => {
  const block = migration.slice(migration.indexOf('wefrotas_link_auth_member'), migration.indexOf('wefrotas_apply_table_delta'));
  assert.match(block, /user_id is null/);
  assert.match(block, /status = 'active'/);
  assert.match(block, /lower\(email\) = lower\(new\.email\)/);
});

test('private assets are tenant-folder protected', () => {
  assert.match(migration, /'wefrotas-assets','wefrotas-assets',false/);
  assert.match(migration, /storage\.foldername\(name\)/);
  assert.match(migration, /wefrotas_can_write/);
});

test('service role is never present in browser files', () => {
  assert.doesNotMatch(coreSource + backendSource, /service_role|SUPABASE_SERVICE_ROLE_KEY/);
});

test('platform administration no longer calls Appwrite', () => {
  assert.doesNotMatch(platformAdminSource, /APPWRITE_ENDPOINT|APPWRITE_API_KEY|x-appwrite|cloud\.appwrite|fetch\([^\n]*appwrite/i);
  assert.match(platformAdminSource, /admin\.auth\.admin\.createUser/);
  assert.match(platformAdminSource, /wefrotas_audit_events/);
  assert.match(platformAdminSource, /wefrotas_session_presence/);
});

test('WeFrotas user administration repairs pre-authorized members in Supabase', () => {
  assert.match(wefrotasAdminSource, /existing\?\.user_id/);
  assert.match(wefrotasAdminSource, /admin\.auth\.admin\.createUser/);
  assert.match(wefrotasAdminSource, /repaired:Boolean\(existing\)/);
  assert.match(wefrotasAdminSource, /roleToDatabase/);
  assert.match(wefrotasAdminSource, /roleToInterface/);
});

test('admin UI does not request an Appwrite user id', () => {
  assert.doesNotMatch(adminHtml, /member-appwrite-id|ID do usuário no Appwrite/);
  assert.match(adminHtml, /primeiro acesso ao Supabase/);
});
