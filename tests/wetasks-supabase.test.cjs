const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const root = path.join(__dirname, '..');
const migration = fs.readFileSync(path.join(root, 'supabase/migrations/202609010001_wetasks_cloud.sql'), 'utf8');
const cloud = fs.readFileSync(path.join(root, 'wetasks/wetasks-cloud.js'), 'utf8');
const app = fs.readFileSync(path.join(root, 'wetasks/wetasks.js'), 'utf8');
const worker = fs.readFileSync(path.join(root, 'wetasks/wetasks-sw.js'), 'utf8');
const edge = fs.readFileSync(path.join(root, 'supabase/functions/wetasks-notifications/index.ts'), 'utf8');
const index = fs.readFileSync(path.join(root, 'wetasks/index.html'), 'utf8');

test('WeTasks loads Supabase before its cloud adapter and application', () => {
  const supabase = index.indexOf('@supabase/supabase-js@2');
  const adapter = index.indexOf('wetasks-cloud.js');
  const application = index.indexOf('wetasks.js');
  assert.ok(supabase > -1 && supabase < adapter && adapter < application);
});

test('cloud tables are isolated by the authenticated user', () => {
  assert.match(migration, /alter table public\.wetasks_tasks enable row level security/);
  assert.match(migration, /auth\.uid\(\) = user_id/g);
  assert.match(migration, /references auth\.users\(id\) on delete cascade/g);
  assert.match(migration, /revoke all on function public\.claim_due_wetasks_tasks/);
  assert.match(migration, /auth\.role\(\) <> 'service_role'/);
});

test('local mode remains available and changes are synchronized with debounce', () => {
  assert.match(cloud, /signInAnonymously\(\)/);
  assert.match(cloud, /connected: false/);
  assert.match(cloud, /setTimeout\(\(\) => \{/);
  assert.match(app, /window\.WeTasksCloud\?\.scheduleSync\(tasks, notifications\)/);
  assert.match(app, /window\.WeTasksCloud\.start\(\{ tasks, notifications \}\)/);
});

test('scheduled notifications are claimed idempotently and delivered by Web Push', () => {
  assert.match(migration, /for update skip locked/);
  assert.match(migration, /notification_sent_at is null/);
  assert.match(edge, /x-wetasks-cron-secret/);
  assert.match(edge, /jsr:@daaku\/webpush@0\.2\.0/);
  assert.match(edge, /pushError\?\.permanent/);
  assert.match(worker, /self\.addEventListener\('push'/);
  assert.match(worker, /self\.addEventListener\('notificationclick'/);
});

test('private notification keys never ship to the browser bundle', () => {
  assert.doesNotMatch(cloud, /WETASKS_VAPID_PRIVATE_KEY/);
  assert.match(edge, /Deno\.env\.get\('WETASKS_VAPID_PRIVATE_KEY'\)/);
  assert.match(edge, /Deno\.env\.get\('WETASKS_CRON_SECRET'\)/);
});
