(function createWeFrotasBackend(global) {
  'use strict';

  const config = global.WEFROTAS_APPWRITE_CONFIG || {};

  let client = null;
  let account = null;
  let tablesDB = null;
  let storage = null;
  let currentUser = null;
  let currentSnapshotGetter = null;
  let currentSnapshotApplier = null;
  let statusListener = null;
  let unsubscribeRealtime = null;
  let syncTimer = null;
  let syncChain = Promise.resolve();
  let remoteApplyTimer = null;
  let lastSerializedSnapshot = '';
  const LOGOUT_PENDING_KEY = 'wefrotas_online_logout_pending';

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

  async function loadRemoteSnapshot() {
    if (!currentUser) return null;
    const rowId = await digestId(config.companyId);
    try {
      const row = await tablesDB.getRow({
        databaseId: config.databaseId,
        tableId: config.tableId,
        rowId
      });
      return row?.snapshot ? JSON.parse(row.snapshot) : null;
    } catch (error) {
      if (error?.code === 404 || error?.type === 'row_not_found') return null;
      throw error;
    }
  }

  async function persistSnapshot(snapshot) {
    if (!currentUser) throw new Error('Entre no WeFrotas antes de sincronizar os dados.');
    emitStatus('syncing', 'Sincronizando dados...');
    const serialized = JSON.stringify(snapshot);
    const rowId = await digestId(config.companyId);
    await tablesDB.upsertRow({
      databaseId: config.databaseId,
      tableId: config.tableId,
      rowId,
      data: {
        workspaceId: config.companyId,
        snapshot: serialized,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.$id
      },
      permissions: getPermissions()
    });

    lastSerializedSnapshot = serialized;
    emitStatus('online', 'Dados sincronizados.');
  }

  function queueSnapshot(snapshot, delay = 1200) {
    if (!currentUser || !snapshot) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      const serialized = JSON.stringify(snapshot);
      if (serialized === lastSerializedSnapshot) return;
      syncChain = syncChain
        .then(() => persistSnapshot(snapshot))
        .catch((error) => {
          console.error('Falha ao sincronizar WeFrotas.', error);
          emitStatus('error', 'Falha na sincronização. A cópia local foi preservada.', { error });
        });
    }, delay);
  }

  function subscribeRealtime() {
    unsubscribeRealtime?.();
    if (!currentUser) return;
    const channel = `tablesdb.${config.databaseId}.tables.${config.tableId}.rows`;
    unsubscribeRealtime = client.subscribe(channel, (event) => {
      if (event?.payload?.workspaceId !== config.companyId) return;
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
    await account.createEmailPasswordSession({ email, password });
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
    currentSnapshotApplier = options.applySnapshot;
    statusListener = options.onStatus;
    return restoreSession();
  }

  async function adoptRemoteOrUploadLocal() {
    if (!currentUser) return { mode: 'signed-out' };
    const remoteSnapshot = await loadRemoteSnapshot();
    if (remoteSnapshot) {
      lastSerializedSnapshot = JSON.stringify(remoteSnapshot);
      await currentSnapshotApplier?.(remoteSnapshot);
      return { mode: 'remote', snapshot: remoteSnapshot };
    }
    const localSnapshot = currentSnapshotGetter?.();
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
    syncNow: (snapshot) => persistSnapshot(snapshot || currentSnapshotGetter?.()),
    uploadReceipt
  });
})(window);
