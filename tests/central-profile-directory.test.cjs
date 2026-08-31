const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../postoscredenciados-covreecia/app.js'), 'utf8');

test('neutral company never inherits Covre logo, while Covre and custom brands are preserved', () => {
  const images = { 'central-brand-logo': { src: 'covre.png' }, 'central-about-logo': { src: 'covre.png' } };
  const ctx = { CENTRAL_DEFAULT_ORGANIZATION_SLUG: 'covre-e-cia', document: {
    getElementById: id => images[id] || null, querySelector: () => null
  } };
  vm.createContext(ctx);
  vm.runInContext(source.slice(source.indexOf('function applyCentralOrganizationBranding('), source.indexOf('async function loadCentralOrganizationContext(')), ctx);
  ctx.applyCentralOrganizationBranding({ workspaceId: 'covre-e-cia', name: 'Covre' });
  assert.equal(images['central-brand-logo'].src, 'covre.png');
  ctx.applyCentralOrganizationBranding({ workspaceId: 'gave-blue-technologies', name: 'Gave' });
  assert.equal(images['central-brand-logo'].src, 'https://i.imgur.com/Zih5jH8.png');
  assert.equal(images['central-about-logo'].src, 'https://i.imgur.com/Zih5jH8.png');
  ctx.applyCentralOrganizationBranding({ workspaceId: 'other', branding: { logoUrl: 'custom.png' } });
  assert.equal(images['central-brand-logo'].src, 'custom.png');
});

test('confirmed directory hides removed vehicle without erasing driver or onboarding', () => {
  const profile = { driverId: 'd1', name: 'Driver', vehicleId: 'v1', vehicle: 'Old car', plate: 'TEST001', vehicleImageUrl: 'old.jpg' };
  const ctx = { getDriverProfile: () => profile, centralDriverDirectoryVerified: false, centralDriverDirectory: [] };
  vm.createContext(ctx);
  vm.runInContext(source.slice(source.indexOf('function getDriverProfileForDisplay('), source.indexOf('function renderHomeDriverArea(')), ctx);
  assert.equal(ctx.getDriverProfileForDisplay(), profile, 'offline/unverified lookup preserves profile');
  ctx.centralDriverDirectoryVerified = true;
  ctx.centralDriverDirectory = [{ driverId: 'd1', vehicleId: '', driverName: 'Driver' }];
  const display = ctx.getDriverProfileForDisplay();
  assert.equal(display.name, 'Driver');
  assert.equal(display.plate, '');
  assert.equal(display.vehicle, 'Veículo não vinculado');
  assert.equal(display.vehicleImageUrl, '');
  assert.equal(profile.plate, 'TEST001', 'stored identity must not be reset');
  ctx.centralDriverDirectory = [{ driverId: 'other', vehicleId: 'v1', plate: 'OTHER' }];
  assert.equal(ctx.getDriverProfileForDisplay().plate, '', 'another driver cannot authorize vehicle');
  ctx.centralDriverDirectory = [{ driverId: 'd1', vehicleId: 'v1', driverName: 'Driver Updated', vehicleName: 'Current car', plate: 'TEST002', vehicleImageUrl: 'new.jpg' }];
  assert.equal(ctx.getDriverProfileForDisplay().plate, 'TEST002');
  assert.equal(ctx.getDriverProfileForDisplay().name, 'Driver Updated');
});

test('valid empty directory is authoritative and rerenders Home, not stale cache', async () => {
  let cacheWrites = 0, renders = 0;
  const ctx = {
    centralDriverDirectory: [{ driverId: 'old', vehicleId: 'old' }], centralDriverDirectoryLoadedAt: 0,
    centralDriverDirectoryVerified: false, driverDirectoryLoadPromise: null,
    CENTRAL_DRIVER_DIRECTORY_CACHE_KEY: 'test', CENTRAL_DIRECTORY_CACHE_MAX_AGE: 1000,
    centralTenantStorageKey: value => value, executeCentralPushFunction: async () => ({ ok: true, directory: [] }),
    renderHomeDriverArea: () => renders++, console,
    localStorage: { setItem: () => cacheWrites++, getItem: () => { throw new Error('must not read stale cache'); } }
  };
  vm.createContext(ctx);
  const start = source.indexOf('async function ensureDriverDirectoryLoaded(');
  const end = source.indexOf('\nfunction ', start);
  vm.runInContext(source.slice(start, end), ctx);
  assert.equal((await ctx.ensureDriverDirectoryLoaded({ force: true })).length, 0);
  assert.equal(ctx.centralDriverDirectoryVerified, true);
  assert.equal(cacheWrites, 1);
  assert.equal(renders, 1);
});
