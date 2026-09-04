(function createWeFrotasSupabaseCore(global) {
  'use strict';

  const ENTITY_TABLES = Object.freeze({
    vehicles: 'wefrotas_vehicles',
    drivers: 'wefrotas_drivers',
    suppliers: 'wefrotas_suppliers',
    centralCities: 'wefrotas_central_cities',
    orders: 'wefrotas_orders',
    finance: 'wefrotas_finance_entries',
    deletedOrders: 'wefrotas_deleted_orders',
    notifications: 'wefrotas_notifications'
  });
  const ENTITY_KEYS = Object.freeze(Object.keys(ENTITY_TABLES));
  const STATE_KEYS = Object.freeze([
    'administrations', 'centralDeviceLinks', 'customLogoEnabled', 'customLogoUrl',
    'customLogoScale', 'managerDisplayName', 'allowManualOrderNumberEditing'
  ]);

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const objectOrEmpty = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const arrayOrEmpty = (value) => Array.isArray(value) ? value : [];
  const entityId = (value) => String(value?.id || '').trim();

  function normalizeSnapshot(value = {}) {
    const source = objectOrEmpty(value);
    const result = {};
    // Never discard a malformed legacy row silently. Validation during diff or
    // import must fail loudly so the source copy remains available for repair.
    ENTITY_KEYS.forEach((key) => { result[key] = arrayOrEmpty(source[key]).map(clone); });
    result.orderCounter = Math.max(1, Number(source.orderCounter) || 1);
    STATE_KEYS.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(source, key)) result[key] = clone(source[key]);
    });
    return result;
  }

  function canonical(value) {
    if (Array.isArray(value)) return value.map(canonical);
    if (!value || typeof value !== 'object') return value;
    return Object.keys(value).sort().reduce((result, key) => {
      result[key] = canonical(value[key]);
      return result;
    }, {});
  }

  function equal(left, right) {
    return JSON.stringify(canonical(left)) === JSON.stringify(canonical(right));
  }

  function mapById(items) {
    const map = new Map();
    for (const item of arrayOrEmpty(items)) {
      const id = entityId(item);
      if (!id) throw new Error('Toda entidade do WeFrotas precisa de um ID.');
      if (map.has(id)) throw new Error(`ID duplicado no snapshot: ${id}`);
      map.set(id, item);
    }
    return map;
  }

  function diffSnapshots(previousValue, nextValue) {
    const previous = normalizeSnapshot(previousValue);
    const next = normalizeSnapshot(nextValue);
    const delta = {};
    for (const key of ENTITY_KEYS) {
      const before = mapById(previous[key]);
      const after = mapById(next[key]);
      const upserts = [];
      const deletes = [];
      for (const [id, item] of after) if (!before.has(id) || !equal(before.get(id), item)) upserts.push(clone(item));
      for (const id of before.keys()) if (!after.has(id)) deletes.push(id);
      delta[key] = { upserts, deletes };
    }
    return delta;
  }

  function hasDelta(delta) {
    return ENTITY_KEYS.some((key) => delta?.[key]?.upserts?.length || delta?.[key]?.deletes?.length);
  }

  function extractState(snapshotValue) {
    const snapshot = normalizeSnapshot(snapshotValue);
    const settings = {};
    STATE_KEYS.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(snapshot, key)) settings[key] = clone(snapshot[key]);
    });
    return { orderCounter: snapshot.orderCounter, settings };
  }

  function applyRealtimeEntity(snapshotValue, key, eventType, row) {
    if (!ENTITY_TABLES[key]) throw new Error(`Entidade desconhecida: ${key}`);
    const snapshot = normalizeSnapshot(snapshotValue);
    const id = String(row?.entity_id || row?.data?.id || '').trim();
    if (!id) return snapshot;
    const items = snapshot[key].filter((item) => entityId(item) !== id);
    if (eventType !== 'DELETE' && row?.data) items.push(clone(row.data));
    snapshot[key] = items;
    return snapshot;
  }

  function countSnapshot(snapshotValue) {
    const snapshot = normalizeSnapshot(snapshotValue);
    return ENTITY_KEYS.reduce((counts, key) => {
      counts[key] = snapshot[key].length;
      return counts;
    }, {});
  }

  global.WeFrotasSupabaseCore = Object.freeze({
    ENTITY_TABLES, ENTITY_KEYS, STATE_KEYS, normalizeSnapshot, diffSnapshots,
    hasDelta, extractState, applyRealtimeEntity, countSnapshot, equal
  });
})(typeof window === 'undefined' ? globalThis : window);
