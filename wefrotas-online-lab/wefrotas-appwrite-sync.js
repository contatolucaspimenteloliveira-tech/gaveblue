import { account, databases } from '../lib/appwrite.js';

const APPWRITE_DATABASE_ID = '6a68ce8c000a36a44d98';
const APPWRITE_SNAPSHOT_COLLECTION_ID = 'gaveblue_wefrotas';
const APPWRITE_WORKSPACE_ID = 'default_workspace';
const APPWRITE_DOCUMENT_ID = APPWRITE_WORKSPACE_ID;

const state = {
  user: null,
  localReady: false,
  busy: false
};

function getNodes() {
  return {
    widget: document.getElementById('appwrite-sync-widget'),
    title: document.getElementById('appwrite-sync-title'),
    status: document.getElementById('appwrite-sync-status'),
    pull: document.getElementById('appwrite-sync-pull'),
    push: document.getElementById('appwrite-sync-push')
  };
}

function setSyncStatus(title, message, tone = 'idle') {
  const { widget, title: titleNode, status } = getNodes();
  if (widget) widget.dataset.state = tone;
  if (titleNode) titleNode.textContent = title;
  if (status) status.textContent = message;
}

function setButtonsEnabled(enabled) {
  const { pull, push } = getNodes();
  if (pull) pull.disabled = !enabled;
  if (push) push.disabled = !enabled;
}

function updateAvailability() {
  const ready = !!state.user && state.localReady && !state.busy;
  setButtonsEnabled(ready);
  if (!state.user) {
    setSyncStatus('Aguardando login', 'Entre para testar sincronizacao online.', 'idle');
    return;
  }
  if (!state.localReady) {
    setSyncStatus('Preparando dados locais', 'Aguardando IndexedDB/localStorage carregar.', 'idle');
    return;
  }
  setSyncStatus('Pronto para sincronizar', `Usuario: ${state.user.email || state.user.name || state.user.$id}`, 'ready');
}

function getBridge() {
  if (!window.wefrotasLocalData) {
    throw new Error('A ponte local do WeFrotas ainda nao esta pronta.');
  }
  return window.wefrotasLocalData;
}

function buildCloudPayload() {
  const bridge = getBridge();
  const snapshot = bridge.getSnapshot();
  return {
    workspaceId: APPWRITE_WORKSPACE_ID,
    snapshot: JSON.stringify(snapshot),
    version: 1,
    updatedAt: new Date().toISOString(),
    updatedBy: state.user?.$id || ''
  };
}

async function getCurrentUser() {
  if (state.user) return state.user;
  state.user = await account.get();
  return state.user;
}

async function getCloudDocument() {
  return databases.getDocument({
    databaseId: APPWRITE_DATABASE_ID,
    collectionId: APPWRITE_SNAPSHOT_COLLECTION_ID,
    documentId: APPWRITE_DOCUMENT_ID
  });
}

async function push() {
  if (state.busy) return;
  state.busy = true;
  setButtonsEnabled(false);
  setSyncStatus('Enviando para nuvem', 'Salvando snapshot atual no Appwrite...', 'idle');

  try {
    await getCurrentUser();
    const payload = buildCloudPayload();
    try {
      await databases.updateDocument({
        databaseId: APPWRITE_DATABASE_ID,
        collectionId: APPWRITE_SNAPSHOT_COLLECTION_ID,
        documentId: APPWRITE_DOCUMENT_ID,
        data: payload
      });
    } catch (error) {
      if (Number(error?.code) !== 404) throw error;
      await databases.createDocument({
        databaseId: APPWRITE_DATABASE_ID,
        collectionId: APPWRITE_SNAPSHOT_COLLECTION_ID,
        documentId: APPWRITE_DOCUMENT_ID,
        data: payload
      });
    }
    window.wefrotasLocalData?.notify?.('Snapshot enviado para o Appwrite.');
    setSyncStatus('Nuvem atualizada', 'Os dados locais foram enviados para o Appwrite.', 'ready');
  } catch (error) {
    console.error('Falha ao enviar snapshot para Appwrite.', error);
    setSyncStatus('Erro ao enviar', error?.message || 'Confira database, collection e permissoes no Appwrite.', 'error');
  } finally {
    state.busy = false;
    updateAvailability();
  }
}

async function pull() {
  if (state.busy) return;
  const shouldContinue = window.confirm('Baixar a nuvem vai substituir os dados locais deste navegador pelo snapshot do Appwrite. Continuar?');
  if (!shouldContinue) return;

  state.busy = true;
  setButtonsEnabled(false);
  setSyncStatus('Baixando da nuvem', 'Carregando snapshot salvo no Appwrite...', 'idle');

  try {
    await getCurrentUser();
    const document = await getCloudDocument();
    const snapshot = JSON.parse(document.snapshot || '{}');
    await getBridge().applySnapshot(snapshot);
    window.wefrotasLocalData?.notify?.('Snapshot da nuvem aplicado neste computador.');
    setSyncStatus('Dados baixados', 'O snapshot do Appwrite foi aplicado localmente.', 'ready');
  } catch (error) {
    console.error('Falha ao baixar snapshot do Appwrite.', error);
    setSyncStatus('Erro ao baixar', error?.message || 'Nenhum snapshot encontrado ou permissao insuficiente.', 'error');
  } finally {
    state.busy = false;
    updateAvailability();
  }
}

window.addEventListener('wefrotas:local-ready', () => {
  state.localReady = true;
  updateAvailability();
});

window.addEventListener('wefrotas:auth-ready', (event) => {
  state.user = event.detail?.user || null;
  updateAvailability();
});

window.addEventListener('wefrotas:auth-locked', () => {
  state.user = null;
  updateAvailability();
});

window.wefrotasCloudSync = {
  push,
  pull,
  config: {
    databaseId: APPWRITE_DATABASE_ID,
    collectionId: APPWRITE_SNAPSHOT_COLLECTION_ID,
    workspaceId: APPWRITE_WORKSPACE_ID,
    documentId: APPWRITE_DOCUMENT_ID
  }
};

updateAvailability();
