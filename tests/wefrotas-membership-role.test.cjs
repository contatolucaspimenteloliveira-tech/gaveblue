const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const source = fs.readFileSync(path.join(__dirname, '../wefrotas/wefrotas.js'), 'utf8');
const start = source.indexOf('    function getAuthenticatedUserRoleLabel(user) {');
const end = source.indexOf('    const wefrotasUiPermissionMatrix', start);
assert(start >= 0 && end > start);

function roleFor(user, role, currentUser = user) {
  const context = {
    window: { WeFrotasBackend: {
      getUser: () => currentUser,
      getOrganizationContext: () => ({ role })
    } }, user
  };
  return vm.runInNewContext(`${source.slice(start, end)}\ngetAuthenticatedUserRoleLabel(user)`, context);
}

test('all server-authorized company roles work without legacy labels', () => {
  const user = { $id: 'existing-user', labels: ['org123456789012345678901234adm'] };
  for (const [role, expected] of Object.entries({
    'wefrotas-admin': 'Administrador', 'wefrotas-gestor': 'Gestor',
    'wefrotas-aprovador': 'Aprovador', 'wefrotas-consulta': 'Consulta'
  })) assert.equal(roleFor(user, role), expected);
});

test('server role overrides stale admin labels and unknown roles fail closed', () => {
  const user = { $id: 'existing-user', labels: ['admin'] };
  assert.equal(roleFor(user, 'wefrotas-consulta'), 'Consulta');
  assert.equal(roleFor(user, 'unknown-role'), 'Consulta');
});

test('another user or an unauthenticated user cannot inherit company admin role', () => {
  assert.equal(roleFor({ $id: 'other-user', labels: [] }, 'wefrotas-admin', { $id: 'current-user' }), 'Consulta');
  assert.equal(roleFor(null, 'wefrotas-admin', null), 'Consulta');
});

test('legacy mode still handles existing labels but does not infer org labels', () => {
  assert.equal(roleFor({ $id: 'legacy', labels: ['admin'] }, ''), 'Administrador');
  assert.equal(roleFor({ $id: 'legacy', labels: ['gestor'] }, ''), 'Gestor');
  assert.equal(roleFor({ $id: 'legacy', labels: ['aprovador'] }, ''), 'Aprovador');
  assert.equal(roleFor({ $id: 'legacy', labels: ['consulta'] }, ''), 'Consulta');
  assert.equal(roleFor({ $id: 'legacy', labels: ['org123456789012345678901234adm'] }, ''), 'Consulta');
});

test('identity UI is reapplied after authorized organization context is set', () => {
  const block = source.slice(source.indexOf('    async function loadAuthorizedOrganizationContext()'), source.indexOf('    const wefrotasRoleDefinitions'));
  assert.match(block, /setOrganizationContext\([\s\S]*?\}\);\s*await activateOrganizationStorage\(result.organization\);\s*updateManagerIdentityUi\(\);/);
});
