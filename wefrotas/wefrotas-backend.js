(function createWeFrotasBackend(global) {
  'use strict';

  const config = global.WEFROTAS_APPWRITE_CONFIG || {};

  let client = null;
  let account = null;
  let tablesDB = null;
  let storage = null;
  let currentUser = null;
  let currentSnapshotGetter = null;
  let currentSnapshotUpdatedAtGetter = null;
  let currentSnapshotPreparer = null;
  let currentSnapshotWriter = null;
  let remoteSnapshotUpdatedAt = '';
  let currentSnapshotApplier = null;
  let statusListener = null;
  let unsubscribeRealtime = null;
  let unsubscribeCentralRealtime = null;
  let centralRecordsListener = null;
  let syncTimer = null;
  let syncChain = Promise.resolve();
  let remoteApplyTimer = null;
  let lastSerializedSnapshot = '';
  const LOGOUT_PENDING_KEY = 'wefrotas_online_logout_pending';
  const SYNC_PENDING_KEY = 'wefrotas_online_sync_pending';
  const SYNC_VERSION_KEY = 'wefrotas_online_sync_version';

  function rememberRemoteVersion(value) {
    remoteSnapshotUpdatedAt = String(value || '');
    if (organizationContext.id) {
      try { localStorage.setItem(`${SYNC_VERSION_KEY}:${organizationContext.id}`, remoteSnapshotUpdatedAt); }
      catch (error) { console.warn('Não foi possível guardar a versão confirmada.', error); }
    }
  }
  const CHUNK_MANIFEST_PREFIX = 'chunked-v1:';
  const SNAPSHOT_CHUNK_SIZE = 600 * 1024;
  const CHUNK_REQUEST_BATCH_SIZE = 4;
  let primaryRowId = '';
  let snapshotReady = false;
  let contextRevision = 0;
  let activeSnapshotWrites = 0;
  let organizationContext = Object.freeze({
    id: '',
    slug: String(config.companyId || 'covre-e-cia'),
    workspaceId: String(config.companyId || 'covre-e-cia'),
    appwriteLabel: '',
    appwriteRoleLabel: '',
    appwriteManagerLabels: [],
    role: '',
    modules: ['wefrotas', 'central'],
    limits: {}
  });

  const ACCESS_ROLE_PERMISSIONS = Object.freeze({
    'wefrotas-admin': new Set(['read', 'syncSnapshot', 'manageOperations', 'approveRecords', 'manageSettings', 'manageUsers', 'manageDevices', 'sendNotifications', 'deleteRecords']),
    'wefrotas-gestor': new Set(['read', 'syncSnapshot', 'manageOperations', 'approveRecords', 'manageSettings']),
    'wefrotas-aprovador': new Set(['read', 'approveRecords']),
    'wefrotas-consulta': new Set(['read'])
  });

  function hasPendingLogout() {
    try { return localStorage.getItem(LOGOUT_PENDING_KEY) === '1'; } catch (error) { return false; }
  }

  function setPendingLogout(pending) {
    try {
      if (pending) localStorage.setItem(LOGOUT_PENDING_KEY, '1');
      else localStorage.removeItem(LOGOUT_PENDING_KEY);
    } catch (error) {
      console.warn('Não foi possível atualizar o estado local do logout.', error);
    }
  }

  function hasPendingSync() {
    try { return organizationContext.id && localStorage.getItem(`${SYNC_PENDING_KEY}:${organizationContext.id}`) === '1'; } catch (error) { return false; }
  }

  function setPendingSync(pending) {
    if (!organizationContext.id) return;
    const key = `${SYNC_PENDING_KEY}:${organizationContext.id}`;
    try {
      if (pending) localStorage.setItem(key, '1');
      else localStorage.removeItem(key);
    } catch (error) {
      console.warn('Não foi possível atualizar o estado local da sincronização.', error);
    }
  }

  function describeError(error) {
    if (!error) return 'erro desconhecido';
    const message = String(error.message || error.type || 'erro desconhecido');
    return error.code ? `${message} (código ${error.code})` : message;
  }

  function getCurrentAccessRole() {
    if (organizationContext.role && ACCESS_ROLE_PERMISSIONS[organizationContext.role]) return organizationContext.role;
    const labels = Array.isArray(currentUser?.labels) ? currentUser.labels.map((label) => String(label).trim().toLowerCase()) : [];
    const roleByLabel = {
      admin: 'wefrotas-admin',
      gestor: 'wefrotas-gestor',
      aprovador: 'wefrotas-aprovador',
      consulta: 'wefrotas-consulta',
      'wefrotas-admin': 'wefrotas-admin',
      'wefrotas-gestor': 'wefrotas-gestor',
      'wefrotas-aprovador': 'wefrotas-aprovador',
      'wefrotas-consulta': 'wefrotas-consulta'
    };
    return labels.map((label) => roleByLabel[label]).find(Boolean) || 'wefrotas-consulta';
  }

  function hasCurrentPermission(permission) {
    return ACCESS_ROLE_PERMISSIONS[getCurrentAccessRole()]?.has(permission) === true;
  }

  function assertPermission(permission, message = 'Seu perfil não possui permissão para esta ação.') {
    if (!currentUser || !organizationContext.id || !organizationContext.appwriteLabel) throw new Error('Aguarde a confirmação da empresa autorizada.');
    if (!hasCurrentPermission(permission)) {
      const error = new Error(message);
      error.code = 403;
      throw error;
    }
  }

  function assertCanWrite() {
    if (!snapshotReady) throw new Error('Os dados desta empresa ainda não foram confirmados. Nenhum dado local será enviado.');
    assertPermission('syncSnapshot', 'Seu perfil não permite sincronizar alterações operacionais.');
  }

  function invalidateOrganizationContext() {
    if (activeSnapshotWrites) throw new Error('Aguarde o envio em andamento antes de trocar de empresa.');
    snapshotReady = false;
    contextRevision += 1;
    clearTimeout(syncTimer); syncTimer = null;
    clearTimeout(remoteApplyTimer); remoteApplyTimer = null;
    unsubscribeRealtime?.(); unsubscribeRealtime = null;
    unsubscribeCentralRealtime?.(); unsubscribeCentralRealtime = null;
    organizationContext = Object.freeze({ id: '', workspaceId: '', role: '', modules: [] });
    primaryRowId = '';
    lastSerializedSnapshot = '';
    remoteSnapshotUpdatedAt = '';
  }

  async function clearPendingRemoteSession() {
    if (!account || !hasPendingLogout()) return true;
    try {
      await account.deleteSession({ sessionId: 'current' });
      setPendingLogout(false);
      return true;
    } catch (error) {
      if (error?.code === 401 || error?.code === 404) {
        setPendingLogout(false);
        return true;
      }
      console.warn('A sessão remota ainda não pôde ser encerrada.', error);
      return false;
    }
  }

  function isConfigured() {
    return config.enabled === true
      && Boolean(config.endpoint)
      && Boolean(config.projectId)
      && !String(config.endpoint).includes('<REGIAO>');
  }

  function emitStatus(state, message, extra = {}) {
    statusListener?.({ state, message, user: currentUser, ...extra });
  }

  function buildServices() {
    if (!isConfigured()) return false;
    if (!global.Appwrite) throw new Error('SDK do Appwrite não foi carregado.');
    client = new global.Appwrite.Client()
      .setEndpoint(config.endpoint)
      .setProject(config.projectId);
    account = new global.Appwrite.Account(client);
    tablesDB = new global.Appwrite.TablesDB(client);
    storage = new global.Appwrite.Storage(client);
    return true;
  }

  async function executeAdministrativeFunction(payload) {
    if (!currentUser || !client) throw new Error('Entre no WeFrotas para continuar.');
    // Use the same SDK client as Account, including its supported session fallback.
    // A separate fetch can authenticate a different cookie session after switching accounts.
    const functions = new global.Appwrite.Functions(client);
    return functions.createExecution({
      functionId: config.pushFunctionId || 'central-push',
      body: JSON.stringify(payload), async: false, method: 'POST', xpath: '/'
    });
  }

  async function digestId(value) {
    const bytes = new TextEncoder().encode(String(value));
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest))
      .map((item) => item.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 36);
  }

  function bytesToBase64(bytes) {
    const chunkSize = 0x8000;
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
    }
    return btoa(binary);
  }

  function base64ToBytes(value) {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  }

  async function encodeSnapshot(serialized) {
    if (!global.CompressionStream) return serialized;
    const stream = new Blob([serialized]).stream().pipeThrough(new CompressionStream('gzip'));
    const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
    const encoded = `gzip-base64:${bytesToBase64(compressed)}`;
    return encoded.length < serialized.length ? encoded : serialized;
  }

  async function decodeSnapshot(storedSnapshot) {
    const value = String(storedSnapshot || '');
    const prefix = 'gzip-base64:';
    if (!value.startsWith(prefix)) return JSON.parse(value);
    if (!global.DecompressionStream) {
      throw new Error('Este navegador não consegue abrir o backup compactado. Atualize o navegador.');
    }
    const bytes = base64ToBytes(value.slice(prefix.length));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const serialized = await new Response(stream).text();
    return JSON.parse(serialized);
  }

  function getPermissions() {
    const { Permission, Role } = global.Appwrite;
    const organizationRole = organizationContext.appwriteLabel ? Role.label(organizationContext.appwriteLabel) : Role.users();
    const managerLabels = getAssignableManagerLabels();
    return [
      Permission.read(organizationRole),
      ...managerLabels.map((label) => Permission.update(Role.label(label))),
      ...managerLabels.map((label) => Permission.delete(Role.label(label)))
    ];
  }

  function getTenantManagedPermissions({ publicRead = false } = {}) {
    const { Permission, Role } = global.Appwrite;
    const managerLabels = getAssignableManagerLabels();
    return [
      Permission.read(publicRead ? Role.any() : (organizationContext.appwriteLabel ? Role.label(organizationContext.appwriteLabel) : Role.users())),
      ...managerLabels.map((label) => Permission.update(Role.label(label))),
      ...managerLabels.map((label) => Permission.delete(Role.label(label)))
    ];
  }

  function getAssignableManagerLabels() {
    const configured = organizationContext.appwriteManagerLabels?.length
      ? organizationContext.appwriteManagerLabels.map((label) => String(label || '').trim()).filter(Boolean)
      : ['admin'];
    const roleLabel = String(organizationContext.appwriteRoleLabel || '').trim();
    // Appwrite only lets a browser grant a label permission that belongs to the
    // authenticated user. The Function assigns this exact role label before the
    // organization context reaches the client, so never grant the sibling role
    // (admin vs. manager) from a browser-side upload.
    if (roleLabel && configured.includes(roleLabel)) return [roleLabel];
    const owned = new Set((Array.isArray(currentUser?.labels) ? currentUser.labels : []).map((label) => String(label || '').trim()));
    const assignable = configured.filter((label) => owned.has(label));
    return assignable.length ? assignable : configured.slice(0, 1);
  }

  function setOrganizationContext(nextContext = {}) {
    const workspaceId = String(nextContext.workspaceId || nextContext.appwriteWorkspaceId || '').trim();
    if (!/^[a-zA-Z0-9_.-]{2,36}$/.test(workspaceId)) throw new Error('A empresa autorizada possui um identificador inválido.');
    if (!nextContext.id || !nextContext.appwriteLabel) throw new Error('A empresa autorizada não foi confirmada pelo servidor.');
    invalidateOrganizationContext();
    organizationContext = Object.freeze({
      id: String(nextContext.id || ''),
      slug: String(nextContext.slug || workspaceId),
      workspaceId,
      appwriteLabel: String(nextContext.appwriteLabel || ''),
      appwriteRoleLabel: String(nextContext.appwriteRoleLabel || ''),
      appwriteManagerLabels: Array.isArray(nextContext.appwriteManagerLabels) ? [...nextContext.appwriteManagerLabels] : [],
      role: String(nextContext.role || ''),
      modules: Array.isArray(nextContext.modules) ? [...nextContext.modules] : [],
      limits: nextContext.limits && typeof nextContext.limits === 'object' ? { ...nextContext.limits } : {}
    });
    primaryRowId = '';
    lastSerializedSnapshot = '';
    return organizationContext;
  }

  async function updateAuthenticatedUserName(name) {
    if (!currentUser || !account) throw new Error('Entre no WeFrotas Online para alterar seu nome.');
    const normalizedName = String(name || '').trim().replace(/\s+/g, ' ');
    if (normalizedName.length < 2) throw new Error('Informe um nome com pelo menos 2 caracteres.');
    if (normalizedName.length > 128) throw new Error('O nome deve ter no máximo 128 caracteres.');
    currentUser = await account.updateName({ name: normalizedName });
    emitStatus('online', `Perfil atualizado para ${currentUser.name || currentUser.email}.`);
    return currentUser;
  }

  async function getPrimaryRowId() {
    if (!primaryRowId) {
      const revision = contextRevision;
      const rowId = await digestId(organizationContext.workspaceId);
      if (revision !== contextRevision) throw new Error('A empresa mudou durante o carregamento.');
      primaryRowId = rowId;
    }
    return primaryRowId;
  }

  async function getChunkRowId(generation, index) {
    return digestId(`${organizationContext.workspaceId}:snapshot:${generation}:${index}`);
  }

  function parseChunkManifest(value) {
    const storedValue = String(value || '');
    if (!storedValue.startsWith(CHUNK_MANIFEST_PREFIX)) return null;
    const manifest = JSON.parse(storedValue.slice(CHUNK_MANIFEST_PREFIX.length));
    if (!manifest?.generation || !Number.isInteger(manifest.count) || manifest.count < 1 || manifest.count > 10000) {
      throw new Error('O índice do backup online está inválido.');
    }
    return manifest;
  }

  async function getRow(rowId) {
    return tablesDB.getRow({ databaseId: config.databaseId, tableId: config.tableId, rowId });
  }

  async function updateOrCreateRow(rowId, data, permissionsOnCreate = getPermissions()) {
    try {
      return await tablesDB.updateRow({ databaseId: config.databaseId, tableId: config.tableId, rowId, data, permissions: permissionsOnCreate });
    } catch (error) {
      if (error?.code !== 404 && error?.type !== 'row_not_found') throw error;
      return tablesDB.createRow({ databaseId: config.databaseId, tableId: config.tableId, rowId, data, permissions: permissionsOnCreate });
    }
  }

  async function createSnapshotChunk(rowId, data) {
    return tablesDB.createRow({ databaseId: config.databaseId, tableId: config.tableId, rowId, data, permissions: getPermissions() });
  }

  async function loadChunkedSnapshot(manifest) {
    const chunks = new Array(manifest.count);
    for (let start = 0; start < manifest.count; start += CHUNK_REQUEST_BATCH_SIZE) {
      const end = Math.min(start + CHUNK_REQUEST_BATCH_SIZE, manifest.count);
      await Promise.all(Array.from({ length: end - start }, async (_, offset) => {
        const index = start + offset;
        const row = await getRow(await getChunkRowId(manifest.generation, index));
        if (row.workspaceId !== organizationContext.workspaceId) throw new Error('Um bloco recebido pertence a outra empresa.');
        chunks[index] = String(row?.snapshot || '');
      }));
    }
    const storedSnapshot = chunks.join('');
    if (manifest.length && storedSnapshot.length !== manifest.length) {
      throw new Error('O backup online está incompleto. Tente sincronizar novamente no dispositivo principal.');
    }
    return decodeSnapshot(storedSnapshot);
  }

  async function cleanupChunkGeneration(manifest) {
    if (!manifest?.generation || !manifest?.count) return;
    for (let start = 0; start < manifest.count; start += CHUNK_REQUEST_BATCH_SIZE) {
      const end = Math.min(start + CHUNK_REQUEST_BATCH_SIZE, manifest.count);
      await Promise.all(Array.from({ length: end - start }, async (_, offset) => {
        try {
          await tablesDB.deleteRow({ databaseId: config.databaseId, tableId: config.tableId, rowId: await getChunkRowId(manifest.generation, start + offset) });
        } catch (error) {
          if (error?.code !== 404 && error?.type !== 'row_not_found') throw error;
        }
      }));
    }
  }

  async function loadRemoteRecord() {
    if (!currentUser || !organizationContext.id) throw new Error('Empresa não confirmada.');
    const rowId = await getPrimaryRowId();
    let row;
    try {
      row = await getRow(rowId);
    } catch (error) {
      if (error?.code === 404 || error?.type === 'row_not_found') return null;
      throw error;
    }
    if (row.workspaceId !== organizationContext.workspaceId) throw new Error('Os dados recebidos pertencem a outra empresa.');
    if (!row.snapshot) throw new Error('O registro da empresa está incompleto. Nenhum dado será sobrescrito.');
    const manifest = parseChunkManifest(row.snapshot);
    // A missing chunk is corruption, NOT an empty company.
    const snapshot = manifest ? await loadChunkedSnapshot(manifest) : await decodeSnapshot(row.snapshot);
    if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) throw new Error('O backup da empresa é inválido. Nenhum dado será sobrescrito.');
    return {
      snapshot,
      updatedAt: row.updatedAt || row.$updatedAt || ''
    };
  }

  async function loadRemoteSnapshot() {
    const record = await loadRemoteRecord();
    return record?.snapshot || null;
  }

  function snapshotsEqual(left, right) {
    if (left === right) return true;
    if (!left || !right || typeof left !== 'object' || typeof right !== 'object') return false;
    if (Array.isArray(left) !== Array.isArray(right)) return false;
    const keys = Object.keys(left);
    return keys.length === Object.keys(right).length && keys.every(key =>
      Object.prototype.hasOwnProperty.call(right, key) && snapshotsEqual(left[key], right[key]));
  }

  async function persistSnapshot(snapshot) {
    if (!currentUser) throw new Error('Entre no WeFrotas antes de sincronizar os dados.');
    assertCanWrite();
    activeSnapshotWrites += 1;
    try {
    emitStatus('syncing', 'Preparando dados para sincronização...');
    const preparedSnapshot = await currentSnapshotPreparer?.(snapshot) || snapshot;
    const maxVehicles = Number(organizationContext.limits?.vehicles || 0);
    const activeVehicles = (Array.isArray(preparedSnapshot.vehicles) ? preparedSnapshot.vehicles : []).filter((vehicle) => vehicle?.ativo !== false && vehicle?.active !== false).length;
    if (maxVehicles > 0 && activeVehicles > maxVehicles) throw new Error(`O plano desta empresa permite até ${maxVehicles} veículos ativos.`);
    const serialized = JSON.stringify(preparedSnapshot);
    // Every authorized company, including Covre, needs the server writer:
    // a browser admin cannot grant another manager's label permissions.
    if (organizationContext.id) {
      if (!currentSnapshotWriter) throw new Error('O serviço de salvamento da empresa não está disponível. Atualize a página.');
      const writeRevision = contextRevision;
      const workspaceId = organizationContext.workspaceId;
      let confirmation;
      try {
        confirmation = await currentSnapshotWriter(preparedSnapshot, workspaceId, remoteSnapshotUpdatedAt);
      } catch (writeError) {
        // A committed write may lose its response or fail in a downstream task.
        // Only an exact read-back can confirm it. Never rebase a differing local
        // snapshot on the newest version: that could erase another user's work.
        let confirmedRecord;
        try { confirmedRecord = await loadRemoteRecord(); } catch (_) { /* Preserve the original write failure. */ }
        if (writeRevision !== contextRevision || !confirmedRecord?.updatedAt
          || !snapshotsEqual(preparedSnapshot, confirmedRecord.snapshot)) throw writeError;
        confirmation = { ok: true, workspaceId, updatedAt: confirmedRecord.updatedAt };
      }
      if (writeRevision !== contextRevision) throw new Error('A empresa mudou durante a sincronização.');
      if (confirmation?.ok !== true || confirmation.workspaceId !== organizationContext.workspaceId) {
        throw new Error('O servidor não confirmou o salvamento desta empresa.');
      }
      lastSerializedSnapshot = serialized;
        rememberRemoteVersion(confirmation.updatedAt || remoteSnapshotUpdatedAt);
      setPendingSync(false);
      emitStatus('online', 'Dados sincronizados.');
      return preparedSnapshot;
    }
    const storedSnapshot = await encodeSnapshot(serialized);
    const rowId = await getPrimaryRowId();
    let previousManifest = null;
    try { previousManifest = parseChunkManifest((await getRow(rowId))?.snapshot); } catch (error) {
      if (error?.code !== 404 && error?.type !== 'row_not_found') console.warn('Não foi possível ler o índice anterior.', error);
    }
    const chunks = [];
    for (let offset = 0; offset < storedSnapshot.length; offset += SNAPSHOT_CHUNK_SIZE) chunks.push(storedSnapshot.slice(offset, offset + SNAPSHOT_CHUNK_SIZE));
    const updatedAt = new Date().toISOString();
    let valueForPrimaryRow = storedSnapshot;
    let generation = '';
    if (chunks.length > 1) {
      generation = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      for (let start = 0; start < chunks.length; start += CHUNK_REQUEST_BATCH_SIZE) {
        const end = Math.min(start + CHUNK_REQUEST_BATCH_SIZE, chunks.length);
        await Promise.all(Array.from({ length: end - start }, async (_, offset) => {
          const index = start + offset;
          await createSnapshotChunk(await getChunkRowId(generation, index), { workspaceId: organizationContext.workspaceId, snapshot: chunks[index], updatedAt, updatedBy: currentUser.$id });
        }));
        emitStatus('syncing', `Enviando dados: ${end} de ${chunks.length} blocos...`);
      }
      valueForPrimaryRow = `${CHUNK_MANIFEST_PREFIX}${JSON.stringify({ generation, count: chunks.length, length: storedSnapshot.length })}`;
    } else {
      emitStatus('syncing', 'Enviando dados otimizados...');
    }
    await updateOrCreateRow(rowId, { workspaceId: organizationContext.workspaceId, snapshot: valueForPrimaryRow, updatedAt, updatedBy: currentUser.$id });
    await syncCentralDriverDirectory(preparedSnapshot).catch((error) => {
      console.warn('Não foi possível atualizar o diretório da Central.', error);
    });
    lastSerializedSnapshot = serialized;
    setPendingSync(false);
    emitStatus('online', 'Dados sincronizados.');
    if (previousManifest?.generation && previousManifest.generation !== generation) await cleanupChunkGeneration(previousManifest).catch(error => console.warn('Não foi possível remover todos os blocos antigos do snapshot.', error));
    return preparedSnapshot;
    } finally { activeSnapshotWrites -= 1; }
  }

  function queueSnapshot(snapshot, delay = 1200) {
    if (!currentUser || !snapshot || !snapshotReady) return;
    if (!hasCurrentPermission('syncSnapshot')) return;
    const revision = contextRevision;
    snapshot = JSON.parse(JSON.stringify(snapshot));
    setPendingSync(true);
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      if (revision !== contextRevision || !snapshotReady) return;
      syncTimer = null;
      const serialized = JSON.stringify(snapshot);
      if (serialized === lastSerializedSnapshot) { setPendingSync(false); return; }
      syncChain = syncChain.then(() => {
        if (revision !== contextRevision || !snapshotReady) return;
        return persistSnapshot(snapshot);
      }).catch(error => {
        console.error('Falha ao sincronizar WeFrotas.', error);
        emitStatus('error', `Falha na sincronização: ${describeError(error)}. Cópia local pendente.`, { error });
      });
    }, delay);
  }

  async function subscribeRealtime() {
    unsubscribeRealtime?.();
    unsubscribeCentralRealtime?.();
    unsubscribeCentralRealtime = null;
    if (!currentUser || !snapshotReady) return;
    const revision = contextRevision;
    const expectedRowId = await getPrimaryRowId();
    if (revision !== contextRevision) return;
    const channel = `tablesdb.${config.databaseId}.tables.${config.tableId}.rows`;
    unsubscribeRealtime = client.subscribe(channel, event => {
      if (revision !== contextRevision || !snapshotReady) return;
      if (event?.payload?.workspaceId !== organizationContext.workspaceId) return;
      if (event?.payload?.$id && event.payload.$id !== expectedRowId) return;
      if (hasPendingSync()) return;
      clearTimeout(remoteApplyTimer);
      remoteApplyTimer = setTimeout(async () => {
        try {
          const remoteRecord = await loadRemoteRecord();
          const remoteSnapshot = remoteRecord?.snapshot || null;
          if (revision !== contextRevision || !snapshotReady || hasPendingSync() || activeSnapshotWrites) return;
          if (!remoteSnapshot) return;
          const serialized = JSON.stringify(remoteSnapshot);
          rememberRemoteVersion(remoteRecord?.updatedAt || remoteSnapshotUpdatedAt);
          if (serialized === lastSerializedSnapshot) return;
          lastSerializedSnapshot = serialized;
          await currentSnapshotApplier?.(remoteSnapshot);
          emitStatus('online', 'Atualização recebida de outro dispositivo.');
        } catch (error) { console.warn('Não foi possível aplicar a atualização em tempo real.', error); }
      }, 700);
    });
    if (config.centralTableId && typeof centralRecordsListener === 'function') {
      const centralChannel = `tablesdb.${config.databaseId}.tables.${config.centralTableId}.rows`;
      unsubscribeCentralRealtime = client.subscribe(centralChannel, event => centralRecordsListener(event));
    }
  }

  async function restoreSession() {
    invalidateOrganizationContext();
    if (!buildServices()) { emitStatus('local', 'Modo local: Appwrite ainda não configurado.'); return null; }
    if (hasPendingLogout() && !await clearPendingRemoteSession()) { currentUser = null; emitStatus('signed-out', 'Logout pendente. Entre novamente quando a conexão for restabelecida.'); return null; }
    try {
      currentUser = await account.get();
      emitStatus('online', `Conectado como ${currentUser.name || currentUser.email}.`);
      return currentUser;
    } catch (error) { currentUser = null; emitStatus('signed-out', 'Entre para acessar os dados online.'); return null; }
  }

  async function signIn(email, password) {
    await syncChain.catch(() => {});
    invalidateOrganizationContext();
    if (!isConfigured()) throw new Error('Appwrite ainda não foi configurado.');
    if (!account) buildServices();
    if (hasPendingLogout() && !await clearPendingRemoteSession()) throw new Error('Ainda estamos encerrando a sessão anterior. Tente novamente em instantes.');
    try {
      const activeUser = await account.get();
      if (activeUser) {
        const requestedEmail = String(email || '').trim().toLowerCase();
        const activeEmail = String(activeUser.email || '').trim().toLowerCase();
        if (!requestedEmail || requestedEmail === activeEmail) { currentUser = activeUser; emitStatus('online', `Sessão existente recuperada para ${currentUser.name || currentUser.email}.`); subscribeRealtime(); return currentUser; }
        await account.deleteSession({ sessionId: 'current' });
      }
    } catch (error) {}
    try { await account.createEmailPasswordSession({ email, password }); } catch (error) {
      const sessionAlreadyExists = error?.type === 'user_session_already_exists' || /session is active|session already exists/i.test(String(error?.message || ''));
      if (!sessionAlreadyExists) throw error;
    }
    currentUser = await account.get();
    emitStatus('online', `Conectado como ${currentUser.name || currentUser.email}.`);
    subscribeRealtime();
    return currentUser;
  }

  async function flushPendingSnapshot() {
    if (!currentUser || !snapshotReady) return;
    clearTimeout(syncTimer); syncTimer = null; await syncChain;
    const snapshot = currentSnapshotGetter?.();
    if (!snapshot) { setPendingSync(false); return; }
    const serialized = JSON.stringify(snapshot);
    if (!hasPendingSync() && serialized === lastSerializedSnapshot) return;
    await persistSnapshot(snapshot);
  }

  async function syncNow(snapshot) {
    if (!currentUser) throw new Error('Entre no WeFrotas antes de sincronizar os dados.');
    assertCanWrite();
    const revision = contextRevision;
    const nextSnapshot = JSON.parse(JSON.stringify(snapshot || currentSnapshotGetter?.() || null));
    if (!nextSnapshot) throw new Error('Não há dados disponíveis para sincronização.');

    // A sincronização imediata substitui qualquer envio agendado do mesmo estado.
    // Mantê-la na mesma fila impede duas gravações concorrentes do snapshot.
    clearTimeout(syncTimer);
    syncTimer = null;
    setPendingSync(true);
    syncChain = syncChain
      .catch(() => undefined)
      .then(() => {
        if (revision !== contextRevision || !snapshotReady) throw new Error('A empresa mudou durante a sincronização.');
        return persistSnapshot(nextSnapshot);
      }).catch(error => {
        if (revision === contextRevision) {
          setPendingSync(true);
          emitStatus('error', `Não confirmado no servidor: ${describeError(error)}. Cópia local pendente.`, { error });
        }
        throw error;
      });
    return syncChain;
  }

  async function signOut() {
    const shouldDeleteRemoteSession = Boolean(account && currentUser);
    if (!shouldDeleteRemoteSession) { setPendingLogout(false); currentUser = null; return; }
    setPendingLogout(true);
    emitStatus('syncing', 'Salvando alterações antes de sair...');
    try { await flushPendingSnapshot(); } catch (error) {
      setPendingLogout(false); setPendingSync(true);
      emitStatus('error', `Não foi possível salvar antes de sair: ${describeError(error)}. Tente novamente.`, { error });
      throw error;
    }
    clearTimeout(remoteApplyTimer); unsubscribeRealtime?.(); unsubscribeRealtime = null;
    unsubscribeCentralRealtime?.(); unsubscribeCentralRealtime = null;
    await account.deleteSession({ sessionId: 'current' });
    currentUser = null; setPendingLogout(false);
    invalidateOrganizationContext();
    emitStatus('signed-out', 'Sessão encerrada. Os dados foram sincronizados e a cópia local foi preservada.');
  }

  async function uploadReceipt(file) {
    if (!currentUser) throw new Error('Entre no WeFrotas Online antes de enviar arquivos.');
    assertPermission('manageOperations', 'Seu perfil não permite enviar comprovantes pelo WeFrotas.');
    if (!file) throw new Error('Selecione um comprovante.');
    const uploaded = await storage.createFile({ bucketId: config.bucketId, fileId: global.Appwrite.ID.unique(), file, permissions: getPermissions() });
    return String(storage.getFileView({ bucketId: config.bucketId, fileId: uploaded.$id }));
  }

  async function uploadVehicleImage(file) {
    if (!currentUser) throw new Error('Entre no WeFrotas Online antes de enviar a foto do veículo.');
    assertPermission('manageOperations', 'Seu perfil não permite alterar fotos de veículos.');
    if (!file) throw new Error('Selecione uma foto do veículo.');
    if (!String(file.type || '').startsWith('image/')) throw new Error('O arquivo selecionado precisa ser uma imagem.');
    if (Number(file.size || 0) > 8 * 1024 * 1024) throw new Error('A foto do veículo deve ter no máximo 8 MB.');
    const uploaded = await storage.createFile({
      bucketId: config.bucketId,
      fileId: global.Appwrite.ID.unique(),
      file,
      permissions: getPublicVehicleFilePermissions()
    });
    return {
      fileId: uploaded.$id,
      imageUrl: String(storage.getFileView({ bucketId: config.bucketId, fileId: uploaded.$id }))
    };
  }

  function isDirectoryEntityActive(entity) {
    return entity?.ativo !== false && entity?.active !== false;
  }

  function buildCentralDriverDirectoryRows(snapshot = {}) {
    const drivers = (Array.isArray(snapshot.drivers) ? snapshot.drivers : []).filter(isDirectoryEntityActive);
    const vehicles = (Array.isArray(snapshot.vehicles) ? snapshot.vehicles : []).filter(isDirectoryEntityActive);
    const updatedAt = new Date().toISOString();
    const rows = [];
    drivers.forEach((driver) => {
      const driverId = String(driver?.id || '').trim();
      const driverName = String(driver?.nome || driver?.name || '').trim();
      if (!driverId || !driverName) return;
      const hasCanonicalLinks = Array.isArray(driver.vehicleIds) || Boolean(driver.vehicleId);
      const linkedIds = new Set((Array.isArray(driver.vehicleIds) ? driver.vehicleIds : driver.vehicleId ? [driver.vehicleId] : []).map(String));
      const linkedVehicles = vehicles.filter((vehicle) => hasCanonicalLinks
        ? linkedIds.has(String(vehicle?.id || ''))
        : String(vehicle?.motoristaId || vehicle?.driverId || '') === driverId);
      const candidates = linkedVehicles.length ? linkedVehicles : [null];
      candidates.forEach((vehicle) => rows.push({
        workspaceId: organizationContext.workspaceId,
        driverId,
        driverName,
        vehicleId: String(vehicle?.id || ''),
        vehicleName: String(vehicle?.modelo || vehicle?.model || ''),
        vehicleImageUrl: String(vehicle?.vehicleImageUrl || vehicle?.imageUrl || ''),
        plate: String(vehicle?.placa || vehicle?.plate || '').toUpperCase(),
        fleetNumber: String(vehicle?.numeroFrota || vehicle?.fleetNumber || ''),
        active: true,
        updatedAt
      }));
    });
    return rows;
  }

  async function syncCentralDriverDirectory(snapshot = {}) {
    if (!currentUser || !config.centralDriverDirectoryTableId) return;
    assertPermission('manageOperations', 'Seu perfil não permite atualizar o diretório de motoristas.');
    const desiredRows = buildCentralDriverDirectoryRows(snapshot);
    const queries = [];
    if (global.Appwrite?.Query?.equal) queries.push(global.Appwrite.Query.equal('workspaceId', [organizationContext.workspaceId]));
    if (global.Appwrite?.Query?.limit) queries.push(global.Appwrite.Query.limit(500));
    const existingResult = await tablesDB.listRows({
      databaseId: config.databaseId,
      tableId: config.centralDriverDirectoryTableId,
      queries
    });
    const existingRows = Array.isArray(existingResult?.rows) ? existingResult.rows : [];
    const desiredIds = new Set();
    for (const data of desiredRows) {
      const rowId = await digestId(`${organizationContext.workspaceId}:central-driver:${data.driverId}:${data.vehicleId || 'without-vehicle'}`);
      desiredIds.add(rowId);
      const current = existingRows.find((row) => row.$id === rowId);
      const changed = !current || ['driverId', 'driverName', 'vehicleId', 'vehicleName', 'vehicleImageUrl', 'plate', 'fleetNumber', 'active']
        .some((key) => String(current?.[key] ?? '') !== String(data[key] ?? ''));
      if (!changed) continue;
      await updateOrCreateDirectoryRow(rowId, data);
    }
    await Promise.all(existingRows
      .filter((row) => !desiredIds.has(row.$id))
      .map((row) => tablesDB.deleteRow({ databaseId: config.databaseId, tableId: config.centralDriverDirectoryTableId, rowId: row.$id })));
  }

  async function updateOrCreateDirectoryRow(rowId, data) {
    try {
      return await tablesDB.updateRow({ databaseId: config.databaseId, tableId: config.centralDriverDirectoryTableId, rowId, data, permissions: getPublicDirectoryPermissions() });
    } catch (error) {
      if (error?.code !== 404 && error?.type !== 'row_not_found') throw error;
      return tablesDB.createRow({ databaseId: config.databaseId, tableId: config.centralDriverDirectoryTableId, rowId, data, permissions: getPublicDirectoryPermissions() });
    }
  }

  function getPublicBannerFilePermissions() {
    return getTenantManagedPermissions({ publicRead: true });
  }

  function getCentralRecordPermissions() {
    const { Permission, Role } = global.Appwrite;
    return [Permission.read(organizationContext.appwriteLabel ? Role.label(organizationContext.appwriteLabel) : Role.users())];
  }

  function getPublicDirectoryPermissions() {
    return getTenantManagedPermissions();
  }

  function getPublicVehicleFilePermissions() {
    return getTenantManagedPermissions({ publicRead: true });
  }

  async function uploadCentralBanner(file) {
    if (!currentUser) throw new Error('Entre no WeFrotas Online antes de enviar banners.');
    assertPermission('manageSettings', 'Seu perfil não permite alterar a comunicação da Central.');
    if (!file) throw new Error('Selecione uma imagem para o banner.');
    if (!String(file.type || '').startsWith('image/')) throw new Error('O arquivo selecionado precisa ser uma imagem.');
    const uploaded = await storage.createFile({
      bucketId: config.bucketId,
      fileId: global.Appwrite.ID.unique(),
      file,
      permissions: getPublicBannerFilePermissions()
    });
    return {
      fileId: uploaded.$id,
      imageUrl: String(storage.getFileView({ bucketId: config.bucketId, fileId: uploaded.$id }))
    };
  }

  async function uploadCentralCityImage(file) {
    if (!currentUser) throw new Error('Entre no WeFrotas Online antes de enviar imagens de cidades.');
    assertPermission('manageSettings', 'Seu perfil não permite alterar as cidades da Central.');
    if (!file || !String(file.type || '').startsWith('image/')) throw new Error('Selecione uma imagem válida para a cidade.');
    const uploaded = await storage.createFile({
      bucketId: config.bucketId,
      fileId: global.Appwrite.ID.unique(),
      file,
      permissions: getPublicBannerFilePermissions()
    });
    return {
      fileId: uploaded.$id,
      imageUrl: String(storage.getFileView({ bucketId: config.bucketId, fileId: uploaded.$id }))
    };
  }

  async function deleteCentralCityImage(fileId) {
    if (!currentUser) throw new Error('Entre no WeFrotas Online para excluir imagens de cidades.');
    assertPermission('manageSettings', 'Seu perfil não permite alterar as cidades da Central.');
    if (!fileId || String(fileId).startsWith('builtin:')) return;
    return storage.deleteFile({ bucketId: config.bucketId, fileId });
  }

  async function deleteCentralBannerFile(fileId) {
    if (!currentUser) throw new Error('Entre no WeFrotas Online para excluir banners.');
    assertPermission('manageSettings', 'Seu perfil não permite excluir banners.');
    if (!fileId || String(fileId).startsWith('builtin:')) return;
    return storage.deleteFile({ bucketId: config.bucketId, fileId });
  }

  async function listCentralHomeBanners() {
    if (!currentUser) throw new Error('Entre no WeFrotas Online para administrar os banners.');
    if (!config.centralBannersTableId) throw new Error('Tabela de banners não configurada.');
    const queries = [];
    if (global.Appwrite?.Query?.equal) queries.push(global.Appwrite.Query.equal('workspaceId', [organizationContext.workspaceId]));
    if (global.Appwrite?.Query?.limit) queries.push(global.Appwrite.Query.limit(100));
    const result = await tablesDB.listRows({ databaseId: config.databaseId, tableId: config.centralBannersTableId, queries });
    return Array.isArray(result?.rows) ? result.rows : [];
  }

  async function createCentralHomeBanner(data) {
    if (!currentUser) throw new Error('Entre no WeFrotas Online para cadastrar banners.');
    assertPermission('manageSettings', 'Seu perfil não permite cadastrar banners.');
    return tablesDB.createRow({
      databaseId: config.databaseId,
      tableId: config.centralBannersTableId,
      rowId: global.Appwrite.ID.unique(),
      data: { ...data, workspaceId: organizationContext.workspaceId },
      permissions: getPublicBannerFilePermissions()
    });
  }

  async function upsertCentralHomeBanner(rowId, data) {
    if (!currentUser) throw new Error('Entre no WeFrotas Online para cadastrar banners.');
    assertPermission('manageSettings', 'Seu perfil não permite alterar banners.');
    try {
      return await tablesDB.updateRow({ databaseId: config.databaseId, tableId: config.centralBannersTableId, rowId, data: { ...data, workspaceId: organizationContext.workspaceId }, permissions: getPublicBannerFilePermissions() });
    } catch (error) {
      if (error?.code !== 404 && error?.type !== 'row_not_found') throw error;
      return tablesDB.createRow({ databaseId: config.databaseId, tableId: config.centralBannersTableId, rowId, data: { ...data, workspaceId: organizationContext.workspaceId }, permissions: getPublicBannerFilePermissions() });
    }
  }

  async function updateCentralHomeBanner(rowId, data) {
    if (!currentUser) throw new Error('Entre no WeFrotas Online para alterar banners.');
    assertPermission('manageSettings', 'Seu perfil não permite alterar banners.');
    return tablesDB.updateRow({ databaseId: config.databaseId, tableId: config.centralBannersTableId, rowId, data: { ...data, workspaceId: organizationContext.workspaceId }, permissions: getPublicBannerFilePermissions() });
  }

  async function deleteCentralHomeBanner(rowId) {
    if (!currentUser) throw new Error('Entre no WeFrotas Online para excluir banners.');
    assertPermission('manageSettings', 'Seu perfil não permite excluir banners.');
    return tablesDB.deleteRow({ databaseId: config.databaseId, tableId: config.centralBannersTableId, rowId });
  }

  async function listCentralPendingRecords(limit = 100) {
    if (!currentUser) throw new Error('Entre no WeFrotas Online para consultar a Central de Registros.');
    if (!tablesDB) throw new Error('Banco de dados do Appwrite não está conectado.');
    if (!config.centralTableId) throw new Error('Tabela da Central de Registros não configurada.');

    const queries = [];
    if (global.Appwrite?.Query?.limit) {
      queries.push(global.Appwrite.Query.limit(Number(limit) || 100));
    }
    if (global.Appwrite?.Query?.equal) queries.push(global.Appwrite.Query.equal('workspaceId', [organizationContext.workspaceId]));

    const result = await tablesDB.listRows({
      databaseId: config.databaseId,
      tableId: config.centralTableId,
      queries
    });

    return {
      total: Number(result?.total || result?.rows?.length || 0),
      rows: Array.isArray(result?.rows) ? result.rows : []
    };
  }

  async function updateCentralPendingRecord(rowId, data = {}) {
    if (!currentUser) throw new Error('Entre no WeFrotas Online para atualizar registros da Central.');
    assertPermission('approveRecords', 'Seu perfil não permite tratar registros da Central.');
    if (!tablesDB) throw new Error('Banco de dados do Appwrite não está conectado.');
    if (!config.centralTableId) throw new Error('Tabela da Central de Registros não configurada.');
    return tablesDB.updateRow({
      databaseId: config.databaseId,
      tableId: config.centralTableId,
      rowId,
      data,
      permissions: getCentralRecordPermissions()
    });
  }

  async function deleteCentralPendingRecord(rowId) {
    if (!currentUser) throw new Error('Entre no WeFrotas Online para excluir registros da Central.');
    assertPermission('deleteRecords', 'Somente administradores podem excluir registros da Central.');
    if (!tablesDB || !config.centralTableId) throw new Error('Tabela da Central de Registros não está disponível.');
    return tablesDB.deleteRow({ databaseId: config.databaseId, tableId: config.centralTableId, rowId });
  }

  async function initialize(options = {}) {
    currentSnapshotGetter = options.getSnapshot;
    currentSnapshotUpdatedAtGetter = options.getSnapshotUpdatedAt;
    currentSnapshotPreparer = options.prepareSnapshot;
    currentSnapshotWriter = options.persistSnapshot;
    currentSnapshotApplier = options.applySnapshot;
    statusListener = options.onStatus;
    centralRecordsListener = options.onCentralRecordsChange;
    return restoreSession();
  }

  async function adoptRemoteOrUploadLocal() {
    if (!currentUser) return { mode: 'signed-out' };
    if (!organizationContext.id) throw new Error('Empresa não confirmada.');
    snapshotReady = false;
    const revision = contextRevision;

    // The Appwrite copy is authoritative whenever it exists. A fresh browser starts
    // with an empty/default local snapshot, and must NEVER upload that snapshot
    // before first downloading the company data.
    // A gravação local pendente pertence à chave isolada da empresa que acabou de
    // ser confirmada. Ela representa uma alteração que o navegador já aceitou,
    // mas que ainda não recebeu confirmação do servidor. Nesse caso tentamos
    // concluir o envio antes até da leitura remota; assim uma queda de conexão não
    // bloqueia o acesso nem permite que uma cópia antiga substitua o dado local.
    if (hasPendingSync()) {
      const localSnapshot = currentSnapshotGetter?.();
      if (localSnapshot && typeof localSnapshot === 'object' && !Array.isArray(localSnapshot)) {
        snapshotReady = true;
        try {
          // Never adopt the CURRENT server version for an older pending local
          // snapshot. Restore only the version this device actually edited.
          remoteSnapshotUpdatedAt = localStorage.getItem(`${SYNC_VERSION_KEY}:${organizationContext.id}`) || '';
          const recoveredSnapshot = await persistSnapshot(localSnapshot);
          if (revision !== contextRevision) throw new Error('A empresa mudou durante a sincronização.');
          await currentSnapshotApplier?.(recoveredSnapshot);
          if (revision !== contextRevision) throw new Error('A empresa mudou durante a sincronização.');
          await subscribeRealtime();
          emitStatus('online', 'Alterações pendentes recuperadas e sincronizadas.');
          return { mode: 'recovered-local-pending', snapshot: recoveredSnapshot };
        } catch (error) {
          if (revision !== contextRevision) throw error;
          await currentSnapshotApplier?.(localSnapshot);
          if (revision !== contextRevision) throw error;
          await subscribeRealtime();
          emitStatus('error', `Alterações preservadas neste dispositivo. Falha ao confirmar no servidor: ${describeError(error)}.`, { error });
          return { mode: 'local-pending', snapshot: localSnapshot, error };
        }
      }
    }

    const remoteRecord = await loadRemoteRecord();
    if (revision !== contextRevision) throw new Error('A empresa mudou durante o carregamento.');

    if (remoteRecord?.snapshot) {
      const remoteSerialized = JSON.stringify(remoteRecord.snapshot);
      lastSerializedSnapshot = remoteSerialized;
      rememberRemoteVersion(remoteRecord.updatedAt);
      setPendingSync(false);
      await currentSnapshotApplier?.(remoteRecord.snapshot);
      if (revision !== contextRevision) throw new Error('A empresa mudou durante o carregamento.');
      snapshotReady = true;
      await subscribeRealtime();
      emitStatus('online', 'Dados da empresa carregados do servidor.');
      return { mode: 'remote-authoritative', snapshot: remoteRecord.snapshot };
    }

    // An empty tenant starts empty. Never bootstrap from an unowned browser cache.
    const emptySnapshot = { vehicles: [], drivers: [], suppliers: [], centralCities: [], orders: [], finance: [], administrations: [], deletedOrders: [], notifications: [], centralDeviceLinks: {}, orderCounter: 1 };
    await currentSnapshotApplier?.(emptySnapshot);
    if (revision !== contextRevision) throw new Error('A empresa mudou durante o carregamento.');
    snapshotReady = true;
    lastSerializedSnapshot = JSON.stringify(currentSnapshotGetter?.() || emptySnapshot);
    rememberRemoteVersion('');
    setPendingSync(false);
    await subscribeRealtime();
    emitStatus('online', 'Empresa nova carregada, sem importar dados de outro cadastro.');
    return { mode: 'empty-workspace', snapshot: emptySnapshot };
  }

  global.WeFrotasBackend = Object.freeze({
    config, isConfigured, initialize, signIn, signOut,
    setOrganizationContext,
    isSnapshotReady: () => snapshotReady,
    getOrganizationContext: () => organizationContext,
    getUser: () => currentUser,
    updateAuthenticatedUserName,
    executeAdministrativeFunction,
    getAccessRole: getCurrentAccessRole,
    hasPermission: hasCurrentPermission,
    loadRemoteSnapshot, adoptRemoteOrUploadLocal, queueSnapshot,
    syncNow,
    uploadReceipt, uploadVehicleImage, listCentralPendingRecords, updateCentralPendingRecord, deleteCentralPendingRecord,
    uploadCentralBanner, deleteCentralBannerFile, uploadCentralCityImage, deleteCentralCityImage, listCentralHomeBanners,
    createCentralHomeBanner, upsertCentralHomeBanner, updateCentralHomeBanner, deleteCentralHomeBanner,
    syncCentralDriverDirectory
  });
})(window);
