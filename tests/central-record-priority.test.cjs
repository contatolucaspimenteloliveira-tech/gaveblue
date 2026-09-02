const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../wefrotas/wefrotas.js'), 'utf8');

function setup(saved = {}) {
  const context = {
    centralPendingRecords: [], centralPendingFiltersLoaded: false,
    centralPendingStatusFilter: 'todos', centralPendingDateStart: '', centralPendingDateEnd: '',
    centralPendingSearchFilter: '', centralPendingValueFilter: '', centralPendingVehicleFilter: '',
    centralPendingSupplierFilter: '', centralPendingOrderFilter: '', centralPendingNfFilter: '',
    centralPendingDueStart: '', centralPendingDueEnd: '',
    centralPendingSortState: { key: 'date', direction: 'desc' }, CENTRAL_PENDING_FILTERS_KEY: 'filters',
    window: { WeFrotasBackend: { getOrganizationContext: () => ({ workspaceId: 'covre-e-cia' }) } },
    localStorage: { getItem: () => JSON.stringify(saved) },
    document: { getElementById: () => null }, renderCentralPendingDateControls() {},
    normalizeComparableText: value => String(value || '').toLowerCase(),
    centralPendingCalendarIso: value => value || '', parseCentralPendingCalendarDate: value => value || '',
    getCentralRecordIsoDate: record => record.data || '',
  };
  vm.createContext(context);
  vm.runInContext(source.slice(source.indexOf('    function getCentralPendingStatus('), source.indexOf('    function buildCentralPendingMessage(')), context);
  vm.runInContext(source.slice(source.indexOf('    function getCentralPendingSortedRows('), source.indexOf('    function saveCentralPendingFilters(')), context);
  return context;
}

function row(id, status, data, hora = '10:00', workspaceId = 'covre-e-cia') {
  return { id, status, data, hora, workspaceId };
}

test('pending records precede approved records, newest date and time first in each group', () => {
  const context = setup();
  context.centralPendingRecords = [
    row('approved-new', 'aprovado', '2026-09-02'),
    row('pending-old', 'pendente', '2026-08-31'),
    row('rejected', 'rejeitado', '2026-09-03'),
    row('pending-morning', 'pendente', '2026-09-01', '08:00'),
    row('pending-afternoon', undefined, '2026-09-01', '15:00'),
    row('imported', 'importado', '2026-08-30'),
    row('error', 'erro', '2026-09-01'),
  ];
  assert.deepEqual(Array.from(context.getCentralPendingSortedRows(), r => r.id), [
    'pending-afternoon', 'pending-morning', 'pending-old', 'approved-new', 'imported', 'rejected', 'error',
  ]);
  context.centralPendingRecords.find(r => r.id === 'pending-afternoon').status = 'aprovado';
  assert.deepEqual(Array.from(context.getCentralPendingSortedRows(), r => r.id).slice(0, 4), [
    'pending-morning', 'pending-old', 'approved-new', 'pending-afternoon',
  ]);
});

test('priority ordering respects company, status and date filters', () => {
  const context = setup({ status: 'aprovado', start: '2026-09-01', end: '2026-09-02' });
  context.centralPendingRecords = [
    row('foreign', 'aprovado', '2026-09-02', '10:00', 'gave-blue-technologies'),
    row('pending', 'pendente', '2026-09-02'),
    row('old', 'aprovado', '2026-08-31'),
    row('approved', 'aprovado', '2026-09-01'),
    row('imported', 'importado', '2026-09-02'),
  ];
  assert.deepEqual(Array.from(context.getCentralPendingSortedRows(), r => r.id), ['imported', 'approved']);
});

test('legacy sort preferences reset to newest first; new explicit preferences retain pending priority', () => {
  const legacy = setup({ sortKey: 'driver', sortDirection: 'asc' });
  legacy.loadCentralPendingFilters();
  assert.equal(legacy.centralPendingSortState.key, 'date');
  assert.equal(legacy.centralPendingSortState.direction, 'desc');
  const current = setup({ sortVersion: 2, sortKey: 'date', sortDirection: 'asc' });
  current.centralPendingRecords = [row('approved', 'aprovado', '2026-08-01'), row('pending', 'pendente', '2026-09-02')];
  assert.deepEqual(Array.from(current.getCentralPendingSortedRows(), r => r.id), ['pending', 'approved']);
  assert.equal(current.centralPendingSortState.direction, 'asc');
});
