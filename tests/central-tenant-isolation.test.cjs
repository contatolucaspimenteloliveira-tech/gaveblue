const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const root = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'postoscredenciados-covreecia/app.js'), 'utf8');
const worker = fs.readFileSync(path.join(root, 'postoscredenciados-covreecia/sw.js'), 'utf8');
const push = fs.readFileSync(path.join(root, 'appwrite/functions/central-push/src/main.js'), 'utf8');
const neutralIndex = fs.readFileSync(path.join(root, 'central/index.html'), 'utf8');
const neutralWorker = fs.readFileSync(path.join(root, 'central/sw.js'), 'utf8');
const admin = fs.readFileSync(path.join(root, 'admin/admin.js'), 'utf8');

function organizationHarness(pathname, search = '', stored = '') {
  const storageStart = app.indexOf('function centralTenantStorageKey');
  const storageEnd = app.indexOf("const CENTRAL_APPWRITE_ORIGIN", storageStart);
  const requestStart = app.indexOf('function getRequestedCentralOrganizationSlug');
  const requestEnd = app.indexOf('function applyCentralOrganizationBranding', requestStart);
  const functions = `${app.slice(storageStart, storageEnd)}\n${app.slice(requestStart, requestEnd)}`;
  const context = {
    URLSearchParams,
    CENTRAL_DEFAULT_ORGANIZATION_SLUG: 'covre-e-cia',
    CENTRAL_ORGANIZATION_SLUG_KEY: 'gaveblue:central-organization-slug',
    centralOrganizationContext: { slug: 'covre-e-cia' },
    window: { location: { pathname, search } },
    localStorage: { getItem: () => stored || null }
  };
  vm.createContext(context);
  vm.runInContext(functions, context);
  return context;
}

test('legacy Covre address stays pinned to Covre despite another stored tenant', () => {
  const context = organizationHarness('/postoscredenciados-covreecia/', '?empresa=gave-blue-technologies', 'gave-blue-technologies');
  assert.equal(context.getRequestedCentralOrganizationSlug(), 'covre-e-cia');
  assert.equal(context.centralTenantStorageKey('device'), 'device');
});

test('neutral address resolves query and keeps local data under a tenant suffix', () => {
  const context = organizationHarness('/central/', '?empresa=gave-blue-technologies', 'covre-e-cia');
  assert.equal(context.getRequestedCentralOrganizationSlug(), 'gave-blue-technologies');
  context.centralOrganizationContext.slug = 'gave-blue-technologies';
  assert.equal(context.centralTenantStorageKey('device'), 'device:gave-blue-technologies');
});

test('neutral address can resume its tenant but never silently falls back to Covre', () => {
  assert.equal(organizationHarness('/central/', '', 'gave-blue-technologies').getRequestedCentralOrganizationSlug(), 'gave-blue-technologies');
  assert.equal(organizationHarness('/central/').getRequestedCentralOrganizationSlug(), '');
});

test('tenant is loaded before device state and driver options', () => {
  const flowStart = app.indexOf("window.addEventListener('DOMContentLoaded', async function()", app.indexOf('if (window.elementSdk)'));
  const flowEnd = app.indexOf('let cityImageCards', flowStart);
  const flow = app.slice(flowStart, flowEnd);
  assert.ok(flow.indexOf('await loadCentralOrganizationContext()') < flow.indexOf('await ensureCentralDeviceStateRestored()'));
  assert.ok(flow.indexOf('await ensureCentralDeviceStateRestored()') < flow.indexOf('populateDriverOptions()'));
  const earlyFlow = app.slice(app.indexOf("window.addEventListener('DOMContentLoaded', function()"), flowStart);
  assert.doesNotMatch(earlyFlow, /populateDriverOptions\(\)/);
});

test('offline queue and notification history are filtered by workspace', () => {
  assert.match(app, /workspaceId:\s*centralOrganizationContext\.workspaceId/);
  assert.match(app, /item\?\.workspaceId \|\| CENTRAL_DEFAULT_ORGANIZATION_SLUG\) === centralOrganizationContext\.workspaceId/);
  assert.match(app, /record\?\.workspaceId \|\| CENTRAL_DEFAULT_ORGANIZATION_SLUG\) === centralOrganizationContext\.workspaceId/);
  assert.match(app, /centralTenantStorageKey\(DRIVER_NAMES_STORAGE_KEY\)/);
  assert.match(app, /centralTenantStorageKey\(LAST_FUEL_ENTRY_STORAGE_KEY\)/);
  assert.match(app, /centralTenantStorageKey\(CENTRAL_LAST_SENT_STORAGE_KEY\)/);
});

test('Covre legacy fallback content is never exposed to another tenant', () => {
  assert.match(app, /const tenantDefaults = centralOrganizationContext\.workspaceId === CENTRAL_DEFAULT_ORGANIZATION_SLUG/);
  assert.match(app, /function applyCentralTenantFallbacks\(\)/);
  assert.match(app, /postosPorCidade = \{\};\s*cityImageCards = \[\];/);
  assert.match(app, /if \(!isLegacyTenant\) slidesContainer\.replaceChildren\(\)/);
  assert.match(app, /if \(!isLegacyTenant && carousel\) carousel\.hidden = true/);
});

test('service-worker caches are isolated by scope and push carries workspace', () => {
  assert.match(worker, /CENTRAL_SCOPE_KEY/);
  assert.match(worker, /CACHE_PREFIX = `central-registros-static-\$\{CENTRAL_SCOPE_KEY\}-v`/);
  assert.match(worker, /workspaceId: String\(payload\.workspaceId \|\| 'covre-e-cia'\)/);
  assert.match(push, /workspaceId: String\(document\.workspaceId \|\| WEFROTAS_COMPANY_ID\)/);
  assert.match(push, /String\(document\.endpoint \|\| ''\) === endpoint/);
  assert.match(push, /data: \{ active: false, updatedAt: data\.updatedAt \}/);
  assert.match(neutralWorker, /CENTRAL_ASSET_BASE = '\/postoscredenciados-covreecia\/'/);
  assert.match(neutralWorker, /CENTRAL_SOURCE_SHELL_URL = '\/postoscredenciados-covreecia\/index\.html'/);
});

test('neutral entry reuses the canonical app and admin exposes the tenant link', () => {
  assert.match(neutralIndex, /fetch\('\.\.\/postoscredenciados-covreecia\/index\.html/);
  assert.match(neutralIndex, /<base href="\/postoscredenciados-covreecia\/">/);
  assert.ok(Buffer.byteLength(neutralIndex) < 5000, 'neutral route must remain a thin compatibility loader');
  assert.match(admin, /\/central\/\?empresa=\$\{encodeURIComponent\(org\.slug\)\}/);
  assert.match(admin, /data-copy-central/);
});
