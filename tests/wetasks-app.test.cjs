const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '../wetasks');
const app = fs.readFileSync(path.join(root, 'wetasks.js'), 'utf8');
const shell = fs.readFileSync(path.join(root, 'wetasks-app.js'), 'utf8');
const worker = fs.readFileSync(path.join(root, 'wetasks-sw.js'), 'utf8');

test('header has no brand icon and dock has six actions without search', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'wetasks-app.css'), 'utf8');
  const header = html.slice(html.indexOf('<header'), html.indexOf('</header>'));
  assert.doesNotMatch(header, /<img\b/);
  const items = shell.slice(shell.indexOf('const items = ['), shell.indexOf('items.forEach'));
  assert.doesNotMatch(items, /'search'/);
  assert.equal((items.match(/\['/g) || []).length, 6);
  assert.match(css, /#tutorial-main-tabs[^}]*repeat\(6,/);
  assert.doesNotMatch(app, /target: '#tab-search'/);
  assert.match(html, /rel="apple-touch-icon"/);
});

test('every screen is exclusive, addressable and preserves tasks when navigating', () => {
  const nodes = new Map();
  const node = id => {
    if (!nodes.has(id)) nodes.set(id, { style: {}, attrs: {}, classList: { toggle() {} }, setAttribute(key, value) { this.attrs[key] = value; }, scrollTo() {} });
    return nodes.get(id);
  };
  const tasks = [{ id: 'existing', title: 'Preservar tarefa' }];
  let reads = 0;
  const context = {
    currentTab: 'tasks', tasks, notifications: [{ read: false }],
    document: { getElementById: node },
    window: { location: { hash: '' }, history: { pushState(_state, _title, hash) { context.window.location.hash = hash; } } },
    closeGlobalSearch() {}, renderTasks() {}, renderCalendar() {}, renderDashboard() {},
    updateThemeButtons() {}, updateBrowserNotificationStatus() {}, renderNotifications() {},
    save() { reads++; }, updateNotificationBadge() {}, renderGlobalSearch() {}, updateFabVisibility() {},
  };
  vm.createContext(context);
  vm.runInContext(app.slice(app.indexOf('function switchTab('), app.indexOf('// ===== CALENDAR =====')), context);
  const ids = { tasks: 'view-tasks', calendar: 'view-calendar', dashboard: 'view-dashboard', settings: 'settings-panel', notifications: 'notifications-panel', search: 'view-search' };
  for (const [screen, id] of Object.entries(ids)) {
    context.switchTab(screen);
    assert.equal(context.currentTab, screen);
    assert.equal(context.window.location.hash, `#/${screen}`);
    assert.equal(node(id).style.display, 'block');
    assert.equal(node(`tab-${screen}`).attrs['aria-current'], 'page');
    assert.equal(Object.values(ids).filter(key => node(key).style.display === 'block').length, 1);
    assert.equal(node('settings-overlay').style.display, 'none');
    assert.deepEqual(context.tasks, tasks);
  }
  assert.equal(reads, 1);
  assert.equal(context.notifications[0].read, true);
  context.switchTab('unknown', false);
  assert.equal(context.currentTab, 'tasks');
  assert.equal(context.window.location.hash, '#/search');
});

test('manifest uses the supplied icon and confines app launch to WeTasks', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest')));
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.scope, '/wetasks/');
  assert.equal(manifest.start_url, '/wetasks/#/tasks');
  assert.deepEqual(manifest.icons.map(icon => icon.sizes), ['192x192', '512x512']);
  manifest.icons.forEach(icon => assert.ok(fs.existsSync(path.join(root, icon.src))));
  assert.match(shell, /navigator\.serviceWorker\.register\('\.\/wetasks-sw.js'\)/);
  assert.match(shell, /beforeinstallprompt/);
  assert.match(shell, /Adicionar à Tela de Início/);
  assert.match(shell, /window\.addEventListener\('popstate'/);
});

test('worker keeps push support and provides offline app assets, not API caches', async () => {
  const handlers = {};
  let cachedKey;
  const cache = { match: async key => { cachedKey = key; return { offline: true }; } };
  const context = {
    URL, Set,
    self: { registration: { scope: 'https://example.test/wetasks/' }, location: { origin: 'https://example.test' }, addEventListener: (name, cb) => handlers[name] = cb },
    caches: { open: async () => cache },
    fetch: async () => { throw new Error('offline'); },
  };
  vm.createContext(context);
  vm.runInContext(worker, context);
  assert.ok(handlers.push && handlers.notificationclick && handlers.activate);
  for (const request of [
    { url: 'https://project.supabase.co/rest/v1/wetasks_tasks', method: 'GET' },
    { url: 'https://example.test/wefrotas/', method: 'GET', mode: 'navigate' },
    { url: 'https://example.test/wetasks/private-data', method: 'GET' },
    { url: 'https://example.test/wetasks/', method: 'POST' },
  ]) handlers.fetch({ request, respondWith() { assert.fail('Private or unrelated requests must not be intercepted'); } });
  let response;
  handlers.fetch({ request: { url: 'https://example.test/wetasks/?launch=app', method: 'GET', mode: 'navigate' }, respondWith: promise => response = promise });
  assert.equal((await response).offline, true);
  assert.equal(cachedKey, 'https://example.test/wetasks/');
  const assets = vm.runInContext('APP_ASSETS', context);
  for (const asset of assets) assert.ok(fs.existsSync(path.join(root, asset.split('?')[0])), `Missing precache asset ${asset}`);
});
