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
  let currentSnapshotApplier = null;
  let statusListener = null;
  let unsubscribeRealtime = null;
  let syncTimer = null;
  let syncChain = Promise.resolve();
  let remoteApplyTimer = null;
  let lastSerializedSnapshot = '';
  const LOGOUT_PENDING_KEY = 'wefrotas_online_logout_pending';
  const SYNC_PENDING_KEY = 'wefrotas_online_sync_pending';
  const CHUNK_MANIFEST_PREFIX = 'chunked-v1:';
  const SNAPSHOT_CHUNK_SIZE = 600 * 1024;
  const CHUNK_REQUEST_BATCH_SIZE = 4;
  let primaryRowId = '';

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
    try { return localStorage.getItem(SYNC_PENDING_KEY) === '1'; } catch (error) { return false; }
  }

  function setPendingSync(pending) {
    try {
      if (pending) localStorage.setItem(SYNC_PENDING_KEY, '1');
      else localStorage.removeItem(SYNC_PENDING_KEY);
    } catch (error) {
      console.warn('Não foi possível atualizar o estado local da sincronização.', error);
    }
  }

  function describeError(error) {
    if (!error) return 'erro desconhecido';
    const message = String(error.message || error.type || 'erro desconhecido');
    return error.code ? `${message} (código ${error.code})` : message;
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
    const role = config.teamId
      ? Role.team(config.teamId)
      : Role.users();
    return [
      Permission.read(role),
      Permission.update(role),
      Permission.delete(role)
    ];
  }

  async function getPrimaryRowId() {
    if (!primaryRowId) primaryRowId = await digestId(config.companyId);
    return primaryRowId;
  }

  async function getChunkRowId(generation, index) {
    return digestId(`${config.companyId}:snapshot:${generation}:${index}`);
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
    return tablesDB.getRow({
      databaseId: config.databaseId,
      tableId: config.tableId,
      rowId
    });
  }

  async function updateOrCreateRow(rowId, data, permissionsOnCreate = getPermissions()) {
    try {
      return await tablesDB.updateRow({
        databaseId: config.databaseId,
        tableId: config.tableId,
        rowId,
        data
      });
    } catch (error) {
      if (error?.code !== 404 && error?.type !== 'row_not_found') throw error;
      return tablesDB.createRow({
        databaseId: config.databaseId,
        tableId: config.tableId,
        rowId,
        data,
        permissions: permissionsOnCreate
      });
    }
  }

  async function createSnapshotChunk(rowId, data) {
    return tablesDB.createRow({
      databaseId: config.databaseId,
      tableId: config.tableId,
      rowId,
      data,
      permissions: getPermissions()
    });
  }

  async function loadChunkedSnapshot(manifest) {
    const chunks = new Array(manifest.count);
    for (let start = 0; start < manifest.count; start += CHUNK_REQUEST_BATCH_SIZE) {
      const end = Math.min(start + CHUNK_REQUEST_BATCH_SIZE, manifest.count);
      await Promise.all(Array.from({ length: end - start }, async (_, offset) => {
        const index = start + offset;
        const row = await getRow(await getChunkRowId(manifest.generation, index));
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
          await tablesDB.deleteRow({
            databaseId: config.databaseId,
            tableId: config.tableId,
            rowId: await getChunkRowId(manifest.generation, start + offset)
          });
        } catch (error) {
          if (error?.code !== 404 && error?.type !== 'row_not_found') throw error;
        }
      }));
    }
  }

  async function loadRemoteRecord() {
    if (!currentUser) return null;
    const rowId = await getPrimaryRowId();
    try {
      const row = await getRow(rowId);
      const manifest = parseChunkManifest(row?.snapshot);
      return row?.snapshot ? {
        snapshot: manifest ? await loadChunkedSnapshot(manifest) : await decodeSnapshot(row.snapshot),
        updatedAt: row.updatedAt || row.$updatedAt || ''
      } : null;
    } catch (error) {
      if (error?.code === 404 || error?.type === 'row_not_found') return null;
      throw error;
    }
  }

  async function loadRemoteSnapshot() {
    const record = await loadRemoteRecord();
    return record?.snapshot || null;
  }

  async function persistSnapshot(snapshot) {
    if (!currentUser) throw new Error('Entre no WeFrotas antes de sincronizar os dados.');
    emitStatus('syncing', 'Sincronizando dados...');
    const serialized = JSON.stringify(snapshot);
    const storedSnapshot = await encodeSnapshot(serialized);
    const rowId = await getPrimaryRowId();
    let previousManifest = null;
    try {
      previousManifest = parseChunkManifest((await getRow(rowId))?.snapshot);
    } catch (error) {
      if (error?.code !== 404 && error?.type !== 'row_not_found') console.warn('Não foi possível ler o índice anterior.', error);
    }
    const generation = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    const chunks = [];
    for (let offset = 0; offset < storedSnapshot.length; offset += SNAPSHOT_CHUNK_SIZE) {
      chunks.push(storedSnapshot.slice(offset, offset + SNAPSHOT_CHUNK_SIZE));
    }
    const updatedAt = new Date().toISOString();
    for (let start = 0; start < chunks.length; start += CHUNK_REQUEST_BATCH_SIZE) {
      const end = Math.min(start + CHUNK_REQUEST_BATCH_SIZE, chunks.length);
      await Promise.all(Array.from({ length: end - start }, async (_, offset) => {
        const index = start + offset;
        await createSnapshotChunk(await getChunkRowId(generation, index), {
          workspaceId: config.companyId,
          snapshot: chunks[index],
          updatedAt,
          updatedBy: currentUser.$id
        });
      }));
      emitStatus('syncing', `Enviando dados: ${end} de ${chunks.length} blocos...`);
    }
    const manifestValue = `${CHUNK_MANIFEST_PREFIX}${JSON.stringify({
      generation,
      count: chunks.length,
      length: storedSnapshot.length
    })}`;
    const data = {
      workspaceId: config.companyId,
      snapshot: manifestValue,
      updatedAt,
      updatedBy: currentUser.$id
    };
    await updateOrCreateRow(rowId, data);

    lastSerializedSnapshot = serialized;
    setPendingSync(false);
    emitStatus('online', 'Dados sincronizados.');
    if (previousManifest?.generation && previousManifest.generation !== generation) {
      cleanupChunkGeneration(previousManifest).catch((error) => {
        console.warn('Não foi possível remover todos os blocos antigos do snapshot.', error);
      });
    }
  }

  function queueSnapshot(snapshot, delay = 1200) {
    if (!currentUser || !snapshot) return;
    setPendingSync(true);
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      const serialized = JSON.stringify(snapshot);
      if (serialized === lastSerializedSnapshot) return;
      syncChain = syncChain
        .then(() => persistSnapshot(snapshot))
        .catch((error) => {
          console.error('Falha ao sincronizar WeFrotas.', error);
          emitStatus('error', `Falha na sincronização: ${describeError(error)}. Cópia local pendente.`, { error });
        });
    }, delay);
  }

  async function subscribeRealtime() {
    unsubscribeRealtime?.();
    if (!currentUser) return;
    const expectedRowId = await getPrimaryRowId();
    const channel = `tablesdb.${config.databaseId}.tables.${config.tableId}.rows`;
    unsubscribeRealtime = client.subscribe(channel, (event) => {
      if (event?.payload?.workspaceId !== config.companyId) return;
      if (event?.payload?.$id && event.payload.$id !== expectedRowId) return;
      if (hasPendingSync()) return;
      clearTimeout(remoteApplyTimer);
      remoteApplyTimer = setTimeout(async () => {
        try {
          const remoteSnapshot = await loadRemoteSnapshot();
          if (!remoteSnapshot) return;
          const serialized = JSON.stringify(remoteSnapshot);
          if (serialized === lastSerializedSnapshot) return;
          lastSerializedSnapshot = serialized;
          await currentSnapshotApplier?.(remoteSnapshot);
          emitStatus('online', 'Atualização recebida de outro dispositivo.');
        } catch (error) {
          console.warn('Não foi possível aplicar a atualização em tempo real.', error);
        }
      }, 700);
    });
  }

  async function restoreSession() {
    if (!buildServices()) {
      emitStatus('local', 'Modo local: Appwrite ainda não configurado.');
      return null;
    }
    if (hasPendingLogout() && !await clearPendingRemoteSession()) {
      currentUser = null;
      emitStatus('signed-out', 'Logout pendente. Entre novamente quando a conexão for restabelecida.');
      return null;
    }
    try {
      currentUser = await account.get();
      emitStatus('online', `Conectado como ${currentUser.name || currentUser.email}.`);
      subscribeRealtime();
      return currentUser;
    } catch (error) {
      currentUser = null;
      emitStatus('signed-out', 'Entre para acessar os dados online.');
      return null;
    }
  }

  async function signIn(email, password) {
    if (!isConfigured()) throw new Error('Appwrite ainda não foi configurado.');
    if (!account) buildServices();
    if (hasPendingLogout() && !await clearPendingRemoteSession()) {
      throw new Error('Ainda estamos encerrando a sessão anterior. Tente novamente em instantes.');
    }
    try {
      const activeUser = await account.get();
      if (activeUser) {
        const requestedEmail = String(email || '').trim().toLowerCase();
        const activeEmail = String(activeUser.email || '').trim().toLowerCase();
        if (!requestedEmail || requestedEmail === activeEmail) {
          currentUser = activeUser;
          emitStatus('online', `Sessão existente recuperada para ${currentUser.name || currentUser.email}.`);
          subscribeRealtime();
          return currentUser;
        }
        await account.deleteSession({ sessionId: 'current' });
      }
    } catch (error) {
      // Sem sessão recuperável: o login normal continua abaixo.
    }
    try {
      await account.createEmailPasswordSession({ email, password });
    } catch (error) {
      const sessionAlreadyExists = error?.type === 'user_session_already_exists'
        || /session is active|session already exists/i.test(String(error?.message || ''));
      if (!sessionAlreadyExists) throw error;
    }
    currentUser = await account.get();
    emitStatus('online', `Conectado como ${currentUser.name || currentUser.email}.`);
    subscribeRealtime();
    return currentUser;
  }

  async function signOut() {
    const shouldDeleteRemoteSession = Boolean(account && currentUser);
    setPendingLogout(shouldDeleteRemoteSession);
    currentUser = null;
    clearTimeout(syncTimer);
    clearTimeout(remoteApplyTimer);
    unsubscribeRealtime?.();
    unsubscribeRealtime = null;
    emitStatus('signed-out', 'Sessão encerrada. Os dados locais foram preservados.');
    if (!shouldDeleteRemoteSession) {
      setPendingLogout(false);
      return;
    }
    await account.deleteSession({ sessionId: 'current' });
    setPendingLogout(false);
  }

  async function uploadReceipt(file) {
    if (!currentUser) throw new Error('Entre no WeFrotas Online antes de enviar arquivos.');
    if (!file) throw new Error('Selecione um comprovante.');
    const uploaded = await storage.createFile({
      bucketId: config.bucketId,
      fileId: global.Appwrite.ID.unique(),
      file,
      permissions: getPermissions()
    });
    return String(storage.getFileView({ bucketId: config.bucketId, fileId: uploaded.$id }));
  }

  async function initialize(options = {}) {
    currentSnapshotGetter = options.getSnapshot;
    currentSnapshotUpdatedAtGetter = options.getSnapshotUpdatedAt;
    currentSnapshotApplier = options.applySnapshot;
    statusListener = options.onStatus;
    return restoreSession();
  }

  async function adoptRemoteOrUploadLocal() {
    if (!currentUser) return { mode: 'signed-out' };
    const localSnapshot = currentSnapshotGetter?.();
    if (hasPendingSync() && localSnapshot) {
      await persistSnapshot(localSnapshot);
      return { mode: 'uploaded-pending-local', snapshot: localSnapshot };
    }
    const remoteRecord = await loadRemoteRecord();
    if (remoteRecord?.snapshot) {
      const localSerialized = localSnapshot ? JSON.stringify(localSnapshot) : '';
      const remoteSerialized = JSON.stringify(remoteRecord.snapshot);
      if (localSerialized && localSerialized !== remoteSerialized) {
        const localUpdatedAt = Date.parse(currentSnapshotUpdatedAtGetter?.() || '') || 0;
        const remoteUpdatedAt = Date.parse(remoteRecord.updatedAt || '') || 0;
        if (localUpdatedAt > remoteUpdatedAt) {
          setPendingSync(true);
          await persistSnapshot(localSnapshot);
          return { mode: 'uploaded-newer-local', snapshot: localSnapshot };
        }
      }
      lastSerializedSnapshot = remoteSerialized;
      await currentSnapshotApplier?.(remoteRecord.snapshot);
      return { mode: 'remote', snapshot: remoteRecord.snapshot };
    }
    if (localSnapshot) await persistSnapshot(localSnapshot);
    return { mode: 'uploaded-local', snapshot: localSnapshot };
  }

  global.WeFrotasBackend = Object.freeze({
    config,
    isConfigured,
    initialize,
    signIn,
    signOut,
    getUser: () => currentUser,
    loadRemoteSnapshot,
    adoptRemoteOrUploadLocal,
    queueSnapshot,
    syncNow: (snapshot) => {
      const nextSnapshot = snapshot || currentSnapshotGetter?.();
      setPendingSync(true);
      return persistSnapshot(nextSnapshot);
    },
    uploadReceipt
  });
})(window);
