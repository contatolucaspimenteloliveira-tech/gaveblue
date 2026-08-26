const defaultConfig = {
  page_title: 'Postos Credenciados',
  background_color: '#f9fafb',
  card_color: '#ffffff',
  text_color: '#111827',
  primary_action_color: '#3b82f6',
  secondary_action_color: '#10b981',
  font_family: 'Inter',
  font_size: 16
};

let config = { ...defaultConfig };
let currentView = 'welcome';
const CLOUDINARY_CLOUD_NAME = 'anh49kkl';
const CLOUDINARY_UPLOAD_PRESET = 'comprovantes_frota';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
const FUEL_WHATSAPP_NUMBER = '5527999884208';
const CENTRAL_APPWRITE_ENABLED = true;
const CENTRAL_APPWRITE_ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const CENTRAL_APPWRITE_PROJECT_ID = '6a68cb3e00312ec0a3fd';
const CENTRAL_APPWRITE_DATABASE_ID = '6a68ce8c000a36a44d98';
const CENTRAL_APPWRITE_TABLE_ID = 'central_registros_pendentes';
const CENTRAL_APPWRITE_WORKSPACE_ID = 'covre-e-cia';
const CENTRAL_APPWRITE_ORIGIN = 'postoscredenciados-covreecia';
const CENTRAL_APPWRITE_RETRY_KEY = 'postoscredenciados-covreecia:appwrite-pending-record';
const CENTRAL_DRIVER_DIRECTORY_CACHE_KEY = 'postoscredenciados-covreecia:driver-directory-cache-v1';
const CENTRAL_DEVICE_STATE_DB = 'central-registros-device-state-v1';
const CENTRAL_DEVICE_STATE_STORE = 'state';
const CENTRAL_PENDING_UPLOADS_STORE = 'pendingUploads';
const CENTRAL_DEVICE_STATE_RECORD_KEY = 'current-device';
const CENTRAL_DIRECTORY_CACHE_MAX_AGE = 24 * 60 * 60 * 1000;
const MAX_RECEIPT_IMAGE_BYTES = 900 * 1024;
const MAX_RECEIPT_SOURCE_BYTES = 10 * 1024 * 1024;
const COMPRESSED_RECEIPT_MAX_SIZE = 1280;
const COMPRESSED_RECEIPT_QUALITY = 0.72;
const RECEIPT_CAMERA_LABEL_PATTERN = /back|rear|environment|world|traseir|externa|principal/i;
const DRIVER_NAMES_STORAGE_KEY = 'postoscredenciados-covreecia:driver-names';
const LAST_FUEL_ENTRY_STORAGE_KEY = 'postoscredenciados-covreecia:last-fuel-entry';
const DRIVER_PROFILE_STORAGE_KEY = 'postoscredenciados-covreecia:driver-profile-v1';
const CENTRAL_LAST_SENT_STORAGE_KEY = 'postoscredenciados-covreecia:last-sent-record-v1';
const CENTRAL_DEVICE_ID_KEY = 'postoscredenciados-covreecia:device-id-v1';
const DRIVER_ONBOARDING_VERSION_KEY = 'postoscredenciados-covreecia:driver-onboarding-version';
const DRIVER_ONBOARDING_VERSION = '2026-08-managed-onboarding-v3';
const DRIVER_PROFILE_PERMISSION_ERROR = 'Este motorista não tem permissão para realizar registros com este veículo. Se você acredita que isso é um erro, entre em contato com a administração.';
const OTHER_DRIVER_OPTION = 'OUTRO (ESPECIFICAR)';
const PWA_INSTALL_DISMISSED_KEY = 'pwa-install-dismissed';
const PWA_DISMISS_DAYS = 7;
const CENTRAL_PUSH_FUNCTION_ID = 'central-push';
const CENTRAL_PUSH_PUBLIC_KEY = 'BK6Dhnrl6Wr4nO4PtE-ZlnW7ttRe0vtA3b7ssZsa7S9bGdR8gcBBu9SNuNBoMntUkcMBkAOAcgvhMJalNysihgw';
const CENTRAL_PUSH_PROMPT_DISMISSED_KEY = 'central-push-prompt-dismissed';
const CENTRAL_PUSH_SUBSCRIPTION_ID_KEY = 'central-push-subscription-id';
const CENTRAL_NOTIFICATIONS_DB = 'central-registros-notifications-v1';
const CENTRAL_NOTIFICATIONS_STORE = 'notifications';
const REMOVED_DRIVER_NAMES = ['ELOIS DOS SANTOS'];
let centralRequiredOnboardingVersion = DRIVER_ONBOARDING_VERSION;
let centralOnboardingConfigResolved = false;
let centralRetryInProgress = false;
let centralDeviceStateReadyPromise = null;
let centralDeviceStateWritePromise = Promise.resolve();
let centralOfflineSyncInProgress = false;
let centralConnectionDegraded = false;
let centralReconnectTimer = null;
let pendingFuelWhatsAppPayload = null;
let uploadedFuelReceipt = null;
let fuelReceiptUploadPromise = null;
let selectedFuelReceiptFile = null;
let currentFuelFormMode = 'rapido';
let receiptValidationType = 'fuel';
let deferredPwaPrompt = null;
let pwaInstallModalMode = 'android';
let pwaInstallProgressTimer = null;
let pwaManualFallbackTimer = null;
let pwaInstallWaitingForApp = false;
let pwaInstallDismissedThisSession = false;
let uploadedLooseNoteReceipt = null;
let looseNoteReceiptUploadPromise = null;
let selectedLooseNoteReceiptFile = null;
let fuelPreviewObjectUrl = '';
let loosePreviewObjectUrl = '';
let fuelReceiptSelectionId = 0;
let looseReceiptSelectionId = 0;
let activeReceiptCameraStream = null;
let activeReceiptCameraTarget = 'fuel';
let receiptCameraDevices = [];
let receiptCameraDeviceIndex = 0;
let receiptCameraFlashEnabled = false;
let pendingReceiptCameraFile = null;
let pendingReceiptCameraPreviewUrl = '';
let centralDriverDirectory = [];
let selectedDirectoryDriver = null;
let selectedDirectoryVehicles = [];
let selectedDirectoryVehicleIndex = 0;
let centralSubmissionHistory = [];
let centralSubmissionHistoryLoaded = false;
let centralSubmissionHistoryRefreshFailed = false;
let driverDirectoryLoadPromise = null;
let driverDirectorySearchTimer = null;
let driverDirectorySearchSequence = 0;
let vehicleDirectorySearchTimer = null;
let vehicleDirectorySearchSequence = 0;
const optimizedReceiptFiles = new WeakSet();
const DEFAULT_DRIVER_NAMES = [
  'AMANDA P. BONATTO',
  'ALAN CHRISTIE',
  'ITALO P. BONATTO',
  'ELOI DOS SANTOS',
  'JO\u00c3O SILVA',
  'ELICARLOS ZANOTTI',
  'GLEIDSON LAURENTINO',
  'RONI VON',
  'TIAGO COVRE',
  OTHER_DRIVER_OPTION
];

let postosPorCidade = {
  'Boa Esperan\u00e7a': [
    { nome: 'Auto Posto 4 Rodas', endereco: 'Boa Esperan\u00e7a, ES', link: 'https://www.google.com/maps/place/Auto+Posto+4+Rodas/@-18.5404958,-40.2937824,826m/data=!3m2!1e3!4b1!4m6!3m5!1s0xb5956c7feac48d:0xc15be322b9fed420!8m2!3d-18.5404958!4d-40.2912075!16s%2Fg%2F1tfp3pxm' }
  ],
  Pinheiros: [
    { nome: 'Posto Nater Coop - Shell', endereco: 'Pinheiros, ES', link: 'https://www.google.com/maps/place/Posto+Rede+Nater+(Shell)+em+Pinheiros/@-18.4168459,-40.2107607,153m/data=!3m1!1e3!4m6!3m5!1s0xb59b33d7ff34b9:0x82053208dc2a16f8!8m2!3d-18.4163054!4d-40.2110065!16s%2Fg%2F11qpbrwj22' },
    { nome: 'Posto Pinheiros - Ipiranga', endereco: 'Pinheiros, ES', link: 'https://www.google.com/maps/place/Posto+Pinheiros/@-18.413462,-40.2128249,156m/data=!3m1!1e3!4m6!3m5!1s0xb59a1481427d61:0xeba41bb1a2b24a1e!8m2!3d-18.4135384!4d-40.2127649!16s%2Fg%2F1tj7xmm_' },
    { nome: 'Posto Nort\u00e3o - Ale', endereco: 'Pinheiros, ES', link: 'https://www.google.com/maps/place/Posto+Nort%C3%A3o/@-18.4045169,-40.2319949,1969m/data=!3m1!1e3!4m6!3m5!1s0xb59a201628e4ab:0xcd6c4ad08d8fb206!8m2!3d-18.4045175!4d-40.2258587!16s%2Fg%2F11b6yqny3l?entry=ttu&g_ep=EgoyMDI2MDEyNi4wIKXMDSoKLDEwMDc5MjA2OUgBUAM%3D' }
  ],
  'Nova Ven\u00e9cia': [
    { nome: 'Posto Cidade Alta', endereco: 'Nova Ven\u00e9cia, ES', link: 'https://www.google.com/maps/place/Posto+Cidade+Alta/@-18.693836,-40.4136076,2405m/data=!3m1!1e3!4m10!1m2!2m1!1sposto!3m6!1s0xb5db2293e5e22b:0xeb619e2ab30e53b2!8m2!3d-18.693836!4d-40.3997215!15sCgVwb3N0b1oHIgVwb3N0b5IBC2dhc19zdGF0aW9u4AEA!16s%2Fg%2F11k62_1v8g' }
  ],
  Montanha: [
    { nome: 'Auto Posto Servicentro Oliveira Rios - Atl\u00e2ntico', endereco: 'Montanha, ES', link: 'https://www.google.com/maps/place/Posto+Atlantico+Servicentro/@-18.1277285,-40.3620985,1655m/data=!3m1!1e3!4m10!1m2!2m1!1sauto+posto+servicentro+motanha!3m6!1s0xb50c56fe1af699:0xdce102eb786d422d!8m2!3d-18.1277285!4d-40.3525713!15sCh9hdXRvIHBvc3RvIHNlcnZpY2VudHJvIG1vbnRhbmhhkgELZ2FzX3N0YXRpb27gAQA!16s%2Fg%2F11hblk2rbr' }
  ],
  'Pedro Can\u00e1rio': [
    { nome: 'Posto Can\u00e1rio', endereco: 'ES-209, 10 - Centro, Pedro Can\u00e1rio - ES', link: 'https://www.google.com/maps/place/ES-209,+10+-+Centro,+Pedro+Can%C3%A1rio+-+ES,+29970-000/@-18.2990761,-39.9587556,19z/data=!4m6!3m5!1s0xca804b02de6b95:0x50166aeec8735e0f!8m2!3d-18.2991215!4d-39.9579864!16s%2Fg%2F11f613rqzg?hl=pt-BR&entry=ttu&g_ep=EgoyMDI2MDIwMS4wIKXMDSoASAFQAw%3D%3D' }
  ],
  'S\u00e3o Mateus': [
    { nome: 'Posto Diamante Negro', endereco: 'S\u00e3o Mateus, ES', link: 'https://maps.app.goo.gl/caunq78awoUE6Nf96' },
    { nome: 'Posto Damiani', endereco: 'S\u00e3o Mateus, ES', link: 'https://maps.app.goo.gl/LiyUgK2LJwUFPsjm8' }
  ]
};

function hideSuggestions(elementId) {
  const suggestionsEl = document.getElementById(elementId);
  if (suggestionsEl) {
    suggestionsEl.classList.add('hidden');
    suggestionsEl.innerHTML = '';
  }
}

function renderSuggestions(elementId, items, dataAttribute) {
  const suggestionsEl = document.getElementById(elementId);
  if (!suggestionsEl || items.length === 0) {
    hideSuggestions(elementId);
    return;
  }

  suggestionsEl.innerHTML = items
    .map(
      (item) => `
        <button
          type="button"
          class="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-red-50 transition border-b border-gray-100 last:border-b-0"
          ${dataAttribute}="${item.replace(/"/g, '&quot;')}"
        >
          ${item}
        </button>
      `
    )
    .join('');

  suggestionsEl.classList.remove('hidden');
}

document.getElementById('fuel-city').addEventListener('change', function() {
  const selectedCity = this.value;
  const stationSelect = document.getElementById('fuel-station');
  markFuelReceiptUploadDirty();

  stationSelect.innerHTML = '';

  if (selectedCity && postosPorCidade[selectedCity]) {
    stationSelect.innerHTML = '<option value="">Selecione um posto</option>';
    postosPorCidade[selectedCity].forEach((posto) => {
      const option = document.createElement('option');
      option.value = posto.nome;
      option.textContent = posto.nome;
      stationSelect.appendChild(option);
    });
  } else {
    stationSelect.innerHTML = '<option value="">Selecione uma cidade primeiro</option>';
  }
});

document.getElementById('fuel-city').addEventListener('keypress', function(e) {
  if (e.key === 'Enter' && this.value) {
    document.getElementById('fuel-station').focus();
  }
});

document.getElementById('fuel-station').addEventListener('keypress', function(e) {
  if (e.key === 'Enter' && this.value) {
    document.getElementById('driver-name').focus();
  }
});

document.getElementById('fuel-station').addEventListener('change', function() {
  markFuelReceiptUploadDirty();
});

document.getElementById('driver-name').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    document.getElementById('fuel-date').focus();
  }
});

document.getElementById('driver-name').addEventListener('change', function() {
  toggleCustomDriverField();
  markFuelReceiptUploadDirty();
});

document.getElementById('custom-driver-name').addEventListener('input', function() {
  markFuelReceiptUploadDirty();
});

document.getElementById('custom-driver-name').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    document.getElementById('fuel-date').focus();
  }
});

document.getElementById('fuel-date').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    document.getElementById('fuel-km').focus();
  }
});

document.getElementById('fuel-date').addEventListener('change', function() {
  markFuelReceiptUploadDirty();
});

document.getElementById('fuel-km').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    document.getElementById('fuel-photo-camera').click();
  }
});

document.getElementById('fuel-km').addEventListener('input', function() {
  markFuelReceiptUploadDirty();
});

document.getElementById('fuel-value')?.addEventListener('input', function() {
  markFuelReceiptUploadDirty();
});

document.getElementById('fuel-liters')?.addEventListener('input', function() {
  markFuelReceiptUploadDirty();
});

document.getElementById('fuel-type')?.addEventListener('change', function() {
  markFuelReceiptUploadDirty();
});

document.getElementById('loose-driver-name')?.addEventListener('change', function() {
  toggleLooseCustomDriverField();
  markLooseReceiptUploadDirty();
});

document.getElementById('loose-custom-driver-name')?.addEventListener('input', function() {
  markLooseReceiptUploadDirty();
});

['loose-supplier', 'loose-value', 'loose-date', 'loose-km', 'loose-notes'].forEach((id) => {
  document.getElementById(id)?.addEventListener('input', function() {
    markLooseReceiptUploadDirty();
  });
});

document.getElementById('loose-service-type')?.addEventListener('change', function() {
  markLooseReceiptUploadDirty();
});

function toggleMenu() {
  const menu = document.getElementById('menu-dropdown');
  menu.classList.toggle('hidden');
}

function closeMenu() {
  document.getElementById('menu-dropdown').classList.add('hidden');
}

function isMobileViewport() {
  return window.matchMedia('(max-width: 768px)').matches;
}

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent || '');
}

function isRunningStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true
    || document.referrer.startsWith('android-app://');
}

function syncPwaInstallEntries() {
  const installed = isRunningStandalone();
  document.querySelectorAll('[data-pwa-install-entry]').forEach((entry) => {
    entry.classList.toggle('hidden', installed);
    entry.setAttribute('aria-hidden', installed ? 'true' : 'false');
    entry.toggleAttribute('disabled', installed);
  });
  if (installed) hidePwaInstallModal();
}

function wasPwaPromptRecentlyDismissed() {
  if (pwaInstallDismissedThisSession) return true;
  try {
    const dismissedAt = Number(localStorage.getItem(PWA_INSTALL_DISMISSED_KEY) || 0);
    return Boolean(dismissedAt && Date.now() - dismissedAt < PWA_DISMISS_DAYS * 24 * 60 * 60 * 1000);
  } catch (error) {
    return false;
  }
}

function shouldOfferPwaInstall(force = false) {
  return isMobileViewport() && !isRunningStandalone() && (force || !wasPwaPromptRecentlyDismissed());
}

function updatePwaInstallStatus(text, percent) {
  const statusText = document.getElementById('pwa-install-status-text');
  const statusPercent = document.getElementById('pwa-install-status-percent');
  const progressBar = document.getElementById('pwa-install-progress-bar');
  const safePercent = Math.max(0, Math.min(100, Number(percent) || 0));
  if (statusText) statusText.textContent = text;
  if (statusPercent) statusPercent.textContent = `${safePercent}%`;
  if (progressBar) progressBar.style.width = `${safePercent}%`;
}

function setPwaInstallPhase(phase) {
  document.querySelectorAll('[data-pwa-install-phase]').forEach((item) => {
    item.classList.toggle('is-active', item.dataset.pwaInstallPhase === String(phase));
    item.classList.toggle('is-complete', Number(item.dataset.pwaInstallPhase) < Number(phase));
  });
}

function setPwaInstallBusy(isBusy) {
  const primary = document.getElementById('pwa-install-primary');
  const dismiss = document.getElementById('pwa-install-dismiss');
  const backdrop = document.querySelector('#pwa-install-modal .pwa-install-backdrop');
  primary?.toggleAttribute('disabled', isBusy);
  // A instalação é opcional: "Agora não" deve permanecer disponível sempre.
  dismiss?.classList.remove('hidden');
  backdrop?.classList.remove('pwa-install-backdrop--locked');
}

function clearPwaInstallProgress() {
  if (pwaInstallProgressTimer) window.clearInterval(pwaInstallProgressTimer);
  if (pwaManualFallbackTimer) window.clearTimeout(pwaManualFallbackTimer);
  pwaInstallProgressTimer = null;
  pwaManualFallbackTimer = null;
  pwaInstallWaitingForApp = false;
  setPwaInstallBusy(false);
}

function revealPwaManualInstallHelp() {
  if (!pwaInstallWaitingForApp) return;
  if (pwaInstallProgressTimer) window.clearInterval(pwaInstallProgressTimer);
  pwaInstallProgressTimer = null;
  pwaInstallWaitingForApp = false;
  updatePwaInstallStatus('O Chrome ainda não confirmou a instalação', 90);
  setPwaInstallPhase(4);
  setPwaInstallBusy(false);
  document.getElementById('pwa-install-manual-help')?.classList.remove('hidden');
  const primary = document.getElementById('pwa-install-primary');
  if (primary) primary.querySelector('span').textContent = 'Tentar instalar novamente';
  const footnote = document.getElementById('pwa-install-footnote');
  if (footnote) footnote.textContent = 'Se preferir, toque em Agora não e continue normalmente pelo navegador.';
}

function startPwaInstallProgress() {
  const phases = [
    { text: 'Preparando o aplicativo', percent: 18, phase: 1 },
    { text: 'Verificando permissões e segurança', percent: 38, phase: 2 },
    { text: 'Organizando recursos para uso offline', percent: 58, phase: 3 },
    { text: 'Aguardando o Chrome concluir a instalação', percent: 78, phase: 4 }
  ];
  let current = 0;
  clearPwaInstallProgress();
  pwaInstallWaitingForApp = true;
  setPwaInstallBusy(true);
  document.getElementById('pwa-install-manual-help')?.classList.add('hidden');
  updatePwaInstallStatus(phases[current].text, phases[current].percent);
  setPwaInstallPhase(phases[current].phase);
  pwaInstallProgressTimer = window.setInterval(() => {
    if (!pwaInstallWaitingForApp) return;
    current = Math.min(current + 1, phases.length - 1);
    updatePwaInstallStatus(phases[current].text, phases[current].percent);
    setPwaInstallPhase(phases[current].phase);
  }, 2600);
  pwaManualFallbackTimer = window.setTimeout(revealPwaManualInstallHelp, 14500);
}

function setPwaManualInstallFallback() {
  const steps = document.getElementById('pwa-install-steps');
  const footnote = document.getElementById('pwa-install-footnote');
  clearPwaInstallProgress();
  updatePwaInstallStatus('Instalação manual pelo navegador', 90);
  setPwaInstallPhase(4);
  if (steps) {
    steps.innerHTML = `
      <li>Toque no menu do navegador, geralmente os três pontinhos.</li>
      <li>Escolha Instalar app ou Adicionar à tela inicial.</li>
      <li>Confirme e abra pelo novo ícone do celular.</li>`;
  }
  if (footnote) footnote.textContent = 'A instalação é opcional. Toque em Agora não para continuar pelo navegador.';
}

function setPwaInstallModalContent(mode) {
  pwaInstallModalMode = mode === 'ios' ? 'ios' : 'android';
  const platform = document.getElementById('pwa-install-platform');
  const steps = document.getElementById('pwa-install-steps');
  const primary = document.getElementById('pwa-install-primary');
  const footnote = document.getElementById('pwa-install-footnote');
  if (!platform || !steps || !primary || !footnote) return;
  clearPwaInstallProgress();
  document.getElementById('pwa-install-manual-help')?.classList.add('hidden');
  if (pwaInstallModalMode === 'ios') {
    platform.textContent = 'iPhone / iPad';
    steps.innerHTML = `<li>Toque em Compartilhar no Safari.</li><li>Escolha Adicionar à Tela de Início.</li><li>Abra pelo novo ícone do celular.</li>`;
    primary.querySelector('span').textContent = 'Entendi';
    footnote.textContent = 'A instalação é opcional. Toque em Agora não para continuar pelo Safari.';
    return;
  }
  platform.textContent = 'Android';
  steps.innerHTML = `<li>Toque em Instalar aplicativo.</li><li>Confirme quando o Chrome solicitar.</li><li>Abra pelo novo ícone na tela inicial.</li>`;
  primary.querySelector('span').textContent = 'Instalar aplicativo';
  primary.removeAttribute('aria-disabled');
  footnote.textContent = 'A instalação é opcional. Toque em Agora não para continuar pelo navegador.';
}

function showPwaInstallModal(mode = 'android', force = false) {
  if (!shouldOfferPwaInstall(force)) return;
  setPwaInstallModalContent(mode);
  updatePwaInstallStatus(mode === 'ios' ? 'Instalação manual pelo Safari' : 'Pronto para instalar', mode === 'ios' ? 20 : 8);
  const modal = document.getElementById('pwa-install-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  }
}

function openPwaInstallFromMenu() {
  if (isRunningStandalone()) {
    showSuccessMessage('A Central de Registros já está instalada neste aparelho.');
    return;
  }
  if (!isMobileViewport()) {
    showErrorMessage('A instalação do app deve ser feita pelo navegador do celular.');
    return;
  }
  pwaInstallDismissedThisSession = false;
  try {
    localStorage.removeItem(PWA_INSTALL_DISMISSED_KEY);
  } catch (error) {
    // A sugestão continua funcionando mesmo sem armazenamento local.
  }
  showPwaInstallModal(isIosDevice() ? 'ios' : 'android', true);
}

function hidePwaInstallModal() {
  clearPwaInstallProgress();
  const modal = document.getElementById('pwa-install-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
}

function dismissPwaInstallModal() {
  pwaInstallDismissedThisSession = true;
  try {
    localStorage.setItem(PWA_INSTALL_DISMISSED_KEY, String(Date.now()));
  } catch (error) {
    // Fechar a sugestão nunca deve bloquear o uso pelo navegador.
  }
  hidePwaInstallModal();
}

async function handlePwaInstallClick() {
  if (pwaInstallModalMode === 'ios') {
    updatePwaInstallStatus('Siga as instruções no Safari', 40);
    dismissPwaInstallModal();
    return;
  }
  startPwaInstallProgress();
  if (!deferredPwaPrompt) return;
  try {
    const prompt = deferredPwaPrompt;
    deferredPwaPrompt = null;
    await prompt.prompt();
    const result = await prompt.userChoice;
    if (result?.outcome !== 'accepted') {
      clearPwaInstallProgress();
      updatePwaInstallStatus('Instalação não confirmada', 8);
      setPwaInstallPhase(0);
      document.getElementById('pwa-install-manual-help')?.classList.remove('hidden');
    }
  } catch (error) {
    console.warn('O prompt de instalação não foi concluído.', error);
    revealPwaManualInstallHelp();
  }
}

function setupPwaInstallExperience() {
  const primaryButton = document.getElementById('pwa-install-primary');
  const dismissButton = document.getElementById('pwa-install-dismiss');
  const dismissAreas = document.querySelectorAll('[data-pwa-install-dismiss]');
  primaryButton?.addEventListener('click', handlePwaInstallClick);
  if (dismissButton) dismissButton.textContent = 'Agora não';
  dismissButton?.addEventListener('click', dismissPwaInstallModal);
  dismissAreas.forEach((element) => element.addEventListener('click', dismissPwaInstallModal));
  document.getElementById('pwa-install-manual-help')?.addEventListener('click', setPwaManualInstallFallback);
  syncPwaInstallEntries();
  window.matchMedia('(display-mode: standalone)').addEventListener?.('change', syncPwaInstallEntries);
}

function urlBase64ToUint8Array(value) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
}

function waitForCentralRetry(delay) {
  return new Promise((resolve) => window.setTimeout(resolve, delay));
}

function updateCentralConnectivityStatus(options = {}) {
  const state = !navigator.onLine
    ? 'offline'
    : (centralConnectionDegraded || options.syncing ? 'unstable' : 'online');
  const statusCopy = {
    online: { label: 'Conectado', description: 'Conexão online' },
    unstable: { label: 'Conexão instável', description: 'Conexão instável. Tentando sincronizar.' },
    offline: { label: 'Offline', description: 'Modo offline. Os registros serão enviados quando a internet voltar.' }
  }[state];
  let status = document.getElementById('central-connectivity-status');
  if (!status) {
    status = document.createElement('div');
    status.id = 'central-connectivity-status';
    status.className = 'central-connectivity-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    document.querySelector('.home-header-actions')?.prepend(status);
  }
  if (!status) return;
  status.dataset.state = state;
  status.setAttribute('aria-label', statusCopy.description);
  status.setAttribute('title', statusCopy.description);
  status.innerHTML = `<span class="central-connectivity-dot" aria-hidden="true"></span><span class="central-connectivity-label">${statusCopy.label}</span>`;
}

function scheduleCentralReconnect() {
  if (centralReconnectTimer) return;
  centralReconnectTimer = window.setTimeout(() => {
    centralReconnectTimer = null;
    retryPendingCentralRegistro();
    processCentralOfflineSubmissions();
    loadCentralOnboardingConfig();
  }, 20000);
}

async function fetchCentralWithRetry(url, options = {}, retryOptions = {}) {
  const attempts = Math.max(1, Number(retryOptions.attempts || 3));
  const timeoutMs = Math.max(1500, Number(retryOptions.timeoutMs || 12000));
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      if (response.status < 500) {
        centralConnectionDegraded = false;
        if (centralReconnectTimer) {
          window.clearTimeout(centralReconnectTimer);
          centralReconnectTimer = null;
        }
        updateCentralConnectivityStatus();
        return response;
      }
      if (attempt === attempts) {
        centralConnectionDegraded = true;
        updateCentralConnectivityStatus();
        scheduleCentralReconnect();
        return response;
      }
      lastError = new Error(`Serviço temporariamente indisponível (${response.status}).`);
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
    } finally {
      window.clearTimeout(timeoutId);
    }
    await waitForCentralRetry(350 * attempt);
  }

  const unavailable = new Error('Sem conexão com a Central no momento. A nova tentativa será automática.');
  unavailable.cause = lastError;
  unavailable.isNetworkError = true;
  centralConnectionDegraded = true;
  updateCentralConnectivityStatus();
  scheduleCentralReconnect();
  throw unavailable;
}

async function executeCentralPushFunction(payload, retryOptions = {}) {
  const endpoint = CENTRAL_APPWRITE_ENDPOINT + '/functions/' + CENTRAL_PUSH_FUNCTION_ID + '/executions';
  const response = await fetchCentralWithRetry(endpoint, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
      'x-appwrite-project': CENTRAL_APPWRITE_PROJECT_ID
    },
    body: JSON.stringify({
      body: JSON.stringify(payload),
      async: false,
      method: 'POST',
      path: '/',
      headers: { 'content-type': 'application/json' }
    })
  }, retryOptions);

  const execution = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(execution?.message || 'Não foi possível conectar ao serviço de notificações.');
  }

  let result = {};
  try {
    result = JSON.parse(execution.responseBody || '{}');
  } catch (error) {
    result = {};
  }
  if (execution.status === 'failed' || result.ok === false) {
    throw new Error(result.error || execution.errors || 'Não foi possível ativar as notificações.');
  }
  return result;
}

function refreshCentralStationCityOptions() {
  const select = document.getElementById('fuel-city');
  if (!select) return;
  const existing = new Set(Array.from(select.options).map((option) => option.value));
  Object.keys(postosPorCidade).sort((a, b) => a.localeCompare(b, 'pt-BR')).forEach((city) => {
    if (existing.has(city)) return;
    const option = document.createElement('option');
    option.value = city;
    option.textContent = city;
    option.dataset.centralManaged = 'true';
    select.appendChild(option);
  });
}

async function loadManagedCentralStations() {
  try {
    const result = await executeCentralPushFunction({ action: 'stations' });
    const stations = Array.isArray(result?.stations) ? result.stations : [];
    if (!stations.length) return false;

    const nextDirectory = {};
    stations.forEach((station) => {
      const city = String(station?.city || '').trim();
      const name = String(station?.name || '').trim();
      const address = String(station?.address || '').trim();
      if (!city || !name || !address) return;
      if (!nextDirectory[city]) nextDirectory[city] = [];
      nextDirectory[city].push({
        nome: name,
        endereco: address,
        link: /^https:\/\//i.test(String(station?.mapsUrl || '')) ? String(station.mapsUrl) : ''
      });
    });

    if (!Object.keys(nextDirectory).length) return false;
    postosPorCidade = nextDirectory;
    refreshCentralStationCityOptions();
    renderCityImageCards();
    return true;
  } catch (error) {
    console.warn('Não foi possível atualizar os postos administrados pelo WeFrotas.', error);
    return false;
  }
}

function dismissCentralPushPrompt() {
  localStorage.setItem(CENTRAL_PUSH_PROMPT_DISMISSED_KEY, String(Date.now()));
  document.getElementById('central-push-prompt')?.remove();
}

function saveCentralPushSubscriptionId(subscriptionId) {
  const normalizedId = String(subscriptionId || '').trim();
  if (normalizedId) {
    localStorage.setItem(CENTRAL_PUSH_SUBSCRIPTION_ID_KEY, normalizedId);
  } else {
    localStorage.removeItem(CENTRAL_PUSH_SUBSCRIPTION_ID_KEY);
  }
  persistCentralDeviceState();
}

function getCentralPushSubscriptionId() {
  return String(localStorage.getItem(CENTRAL_PUSH_SUBSCRIPTION_ID_KEY) || '').trim();
}

function getCentralDeviceId() {
  let deviceId = String(localStorage.getItem(CENTRAL_DEVICE_ID_KEY) || '').trim();
  if (/^[a-f0-9-]{32,64}$/i.test(deviceId)) return deviceId;
  deviceId = globalThis.crypto?.randomUUID?.() || `${Date.now().toString(16)}-${Array.from(globalThis.crypto?.getRandomValues?.(new Uint8Array(16)) || []).map((value) => value.toString(16).padStart(2, '0')).join('')}`;
  localStorage.setItem(CENTRAL_DEVICE_ID_KEY, deviceId);
  persistCentralDeviceState();
  return deviceId;
}

function shouldShowCentralPushPrompt() {
  // A autorização de notificações pertence ao onboarding e à tela de Configurações.
  // Não exibir convites soltos durante o uso normal do aplicativo.
  return false;
}

function renderCentralPushPrompt() {
  if (!shouldShowCentralPushPrompt() || document.getElementById('central-push-prompt')) {
    return;
  }

  const prompt = document.createElement('section');
  prompt.id = 'central-push-prompt';
  prompt.className = 'central-push-prompt';
  prompt.setAttribute('role', 'dialog');
  prompt.setAttribute('aria-label', 'Ativar notificações');
  prompt.innerHTML = [
    '<button type="button" class="central-push-prompt-close" onclick="dismissCentralPushPrompt()" aria-label="Agora não">&times;</button>',
    '<div class="central-push-prompt-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" stroke-width="2" stroke-linecap="round"/><path d="M10 21h4" stroke-width="2" stroke-linecap="round"/></svg></div>',
    '<div class="central-push-prompt-copy"><strong>Receba avisos da Central</strong><span>Ative para receber comunicados e atualizações importantes no celular.</span></div>',
    '<button id="central-push-enable" type="button" class="central-push-prompt-action" onclick="enableCentralPushNotifications()">Ativar notificações</button>'
  ].join('');
  document.body.appendChild(prompt);
}

async function enableCentralPushNotifications() {
  const button = document.getElementById('central-push-enable');
  if (button) {
    button.disabled = true;
    button.textContent = 'Ativando...';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('A permissão de notificações não foi autorizada.');
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(CENTRAL_PUSH_PUBLIC_KEY)
      });
    }

    const result = await executeCentralPushFunction({
      action: 'subscribe',
      subscription: subscription.toJSON(),
      deviceId: getCentralDeviceId(),
      userAgent: navigator.userAgent
    });

    saveCentralPushSubscriptionId(result.subscriptionId);
    localStorage.removeItem(CENTRAL_PUSH_PROMPT_DISMISSED_KEY);
    document.getElementById('central-push-prompt')?.remove();
    showSuccessMessage('Notificações ativadas neste celular.');
    return true;
  } catch (error) {
    console.error('Falha ao ativar push:', error);
    if (button) {
      button.disabled = false;
      button.textContent = 'Tentar novamente';
    }
    showErrorMessage(error?.message || 'Não foi possível ativar as notificações.');
    return false;
  }
}

function setupCentralPushExperience() {
  const setupDelay = 'Notification' in window && Notification.permission === 'granted' ? 0 : 1800;
  window.setTimeout(async () => {
    if (!('Notification' in window) || !('PushManager' in window) || !('serviceWorker' in navigator)) {
      return;
    }
    if (Notification.permission === 'denied') {
      refreshCentralNotificationSetting();
      return;
    }

    const permissionAlreadyGranted = Notification.permission === 'granted';
    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = permissionAlreadyGranted
        ? await registration.pushManager.getSubscription()
        : null;
      if (permissionAlreadyGranted && !subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(CENTRAL_PUSH_PUBLIC_KEY)
        });
      }
      if (subscription) {
        document.getElementById('central-push-prompt')?.remove();
        refreshCentralNotificationSetting();
        try {
          const result = await executeCentralPushFunction({
            action: 'subscribe',
            subscription: subscription.toJSON(),
            deviceId: getCentralDeviceId(),
            userAgent: navigator.userAgent
          });
          saveCentralPushSubscriptionId(result.subscriptionId);
        } catch (error) {
          // A inscrição local continua válida. Uma falha temporária ao renovar
          // o cadastro no servidor não deve pedir autorização novamente.
          console.warn('Não foi possível renovar a inscrição de push no servidor.', error);
        }
        return;
      }
    } catch (error) {
      console.warn('Não foi possível consultar a inscrição de push.', error);
    }

    if (permissionAlreadyGranted) {
      document.getElementById('central-push-prompt')?.remove();
      refreshCentralNotificationSetting();
      return;
    }
    if (shouldShowCentralPushPrompt()) renderCentralPushPrompt();
    refreshCentralNotificationSetting();
  }, setupDelay);
}

async function getCentralPushSubscription() {
  if (!('Notification' in window) || !('PushManager' in window) || !('serviceWorker' in navigator)) {
    return null;
  }
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

async function refreshCentralNotificationSetting() {
  const toggle = document.getElementById('central-notification-toggle');
  const status = document.getElementById('central-notification-status');
  if (!toggle || !status) return;

  const supported = 'Notification' in window && 'PushManager' in window && 'serviceWorker' in navigator;
  if (!supported) {
    toggle.disabled = true;
    toggle.setAttribute('aria-checked', 'false');
    toggle.classList.remove('is-active');
    status.textContent = 'Este navegador não oferece notificações.';
    return;
  }

  if (Notification.permission === 'denied') {
    toggle.disabled = true;
    toggle.setAttribute('aria-checked', 'false');
    toggle.classList.remove('is-active');
    status.textContent = 'Bloqueadas nas configurações do navegador.';
    return;
  }

  try {
    const subscription = Notification.permission === 'granted' ? await getCentralPushSubscription() : null;
    const enabled = Boolean(subscription);
    toggle.disabled = false;
    toggle.setAttribute('aria-checked', String(enabled));
    toggle.classList.toggle('is-active', enabled);
    status.textContent = enabled ? 'Ativadas neste aparelho.' : 'Desativadas neste aparelho.';
  } catch (error) {
    toggle.disabled = false;
    status.textContent = 'Não foi possível consultar o estado agora.';
  }
}

async function disableCentralPushNotifications() {
  const subscription = await getCentralPushSubscription();
  if (subscription) {
    await executeCentralPushFunction({ action: 'unsubscribe', subscription: subscription.toJSON() });
    await subscription.unsubscribe();
  }
  saveCentralPushSubscriptionId('');
  localStorage.setItem(CENTRAL_PUSH_PROMPT_DISMISSED_KEY, String(Date.now()));
  showSuccessMessage('Notificações desativadas neste celular.');
}

async function toggleCentralPushNotifications() {
  const toggle = document.getElementById('central-notification-toggle');
  if (!toggle || toggle.disabled) return;
  toggle.disabled = true;
  try {
    const subscription = await getCentralPushSubscription();
    if (subscription) {
      await disableCentralPushNotifications();
    } else {
      await enableCentralPushNotifications();
    }
  } catch (error) {
    showErrorMessage(error?.message || 'Não foi possível alterar as notificações.');
  } finally {
    await refreshCentralNotificationSetting();
  }
}

async function getCentralCameraPermissionState() {
  if (!navigator.mediaDevices?.getUserMedia) return 'unsupported';
  if (!navigator.permissions?.query) return 'prompt';
  try {
    const permission = await navigator.permissions.query({ name: 'camera' });
    return permission.state;
  } catch (error) {
    return 'prompt';
  }
}

async function refreshCentralCameraSetting() {
  const toggle = document.getElementById('central-camera-toggle');
  const status = document.getElementById('central-camera-status');
  if (!toggle || !status) return;
  const state = await getCentralCameraPermissionState();
  const enabled = state === 'granted';
  toggle.disabled = state === 'unsupported';
  toggle.setAttribute('aria-checked', String(enabled));
  toggle.classList.toggle('is-active', enabled);
  if (state === 'granted') status.textContent = 'Autorizada neste aparelho.';
  else if (state === 'denied') status.textContent = 'Bloqueada nas configurações do navegador.';
  else if (state === 'unsupported') status.textContent = 'Este navegador não oferece acesso à câmera.';
  else status.textContent = 'Toque para autorizar a câmera.';
}

async function toggleCentralCameraPermission() {
  const toggle = document.getElementById('central-camera-toggle');
  if (!toggle || toggle.disabled) return;
  const state = await getCentralCameraPermissionState();
  if (state === 'granted') {
    showSuccessMessage('A câmera está ativa. Para bloquear, altere a permissão nas configurações do navegador.');
    return;
  }
  if (state === 'denied') {
    showErrorMessage('A câmera está bloqueada. Libere a permissão nas configurações do navegador e tente novamente.');
    return;
  }
  toggle.disabled = true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    stream.getTracks().forEach((track) => track.stop());
    showSuccessMessage('Câmera autorizada neste aparelho.');
  } catch (error) {
    showErrorMessage('Não foi possível autorizar a câmera. Selecione “Permitir durante o uso do app”.');
  } finally {
    toggle.disabled = false;
    await refreshCentralCameraSetting();
  }
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        registration.update();

        if (registration.waiting) {
          registration.waiting.postMessage('SKIP_WAITING');
        }

        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          installingWorker?.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              installingWorker.postMessage('SKIP_WAITING');
            }
          });
        });
      })
      .catch(() => null);
  });
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPwaPrompt = event;
  syncPwaInstallEntries();
});

window.addEventListener('appinstalled', () => {
  deferredPwaPrompt = null;
  pwaInstallDismissedThisSession = false;
  try {
    localStorage.removeItem(PWA_INSTALL_DISMISSED_KEY);
  } catch (error) {
    // A confirmação da instalação não depende do armazenamento local.
  }
  if (pwaInstallProgressTimer) window.clearInterval(pwaInstallProgressTimer);
  pwaInstallProgressTimer = null;
  pwaInstallWaitingForApp = false;
  updatePwaInstallStatus('Aplicativo instalado com sucesso', 100);
  setPwaInstallPhase(5);
  setPwaInstallBusy(true);
  showSuccessMessage('Central de Registros instalada com sucesso.');
  window.setTimeout(() => {
    hidePwaInstallModal();
    syncPwaInstallEntries();
  }, 1500);
});

function getTodayLocalDateString() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function setFuelDateToToday() {
  const dateInput = document.getElementById('fuel-date');
  if (dateInput) {
    dateInput.value = getTodayLocalDateString();
  }
}

async function refreshCentralApplication() {
  const button = document.getElementById('home-refresh-button');
  if (button) {
    button.disabled = true;
    button.classList.add('is-refreshing');
  }
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    await registration?.update();
    registration?.waiting?.postMessage('SKIP_WAITING');
    window.setTimeout(() => window.location.reload(), 240);
  } catch (error) {
    console.warn('Não foi possível procurar atualização do aplicativo.', error);
    window.location.reload();
  }
}

function getStoredDriverNames() {
  try {
    const storedNames = localStorage.getItem(DRIVER_NAMES_STORAGE_KEY);
    const parsedNames = storedNames ? JSON.parse(storedNames) : [];
    const validStoredNames = Array.isArray(parsedNames) ? parsedNames : [];
    return Array.from(new Set([...DEFAULT_DRIVER_NAMES, ...validStoredNames]))
      .filter((name) => !REMOVED_DRIVER_NAMES.includes(String(name || '').trim().toUpperCase()));
  } catch (error) {
    return [...DEFAULT_DRIVER_NAMES];
  }
}

function populateDriverOptions() {
  const driverSelects = [
    document.getElementById('driver-name'),
    document.getElementById('loose-driver-name')
  ].filter(Boolean);

  if (!driverSelects.length) {
    return;
  }

  const driverNames = getStoredDriverNames();
  const profileDriverName = String(getDriverProfile()?.name || '').trim();

  driverSelects.forEach((driverSelect) => {
    const shell = driverSelect.closest('.form-control-shell');
    if (profileDriverName) {
      driverSelect.innerHTML = '';
      const profileOption = document.createElement('option');
      profileOption.value = profileDriverName;
      profileOption.textContent = profileDriverName;
      profileOption.selected = true;
      driverSelect.appendChild(profileOption);
      driverSelect.disabled = true;
      driverSelect.setAttribute('aria-disabled', 'true');
      driverSelect.setAttribute('title', 'Altere o motorista somente em Meu perfil.');
      shell?.classList.add('is-profile-locked');
      return;
    }

    driverSelect.disabled = false;
    driverSelect.removeAttribute('aria-disabled');
    driverSelect.removeAttribute('title');
    shell?.classList.remove('is-profile-locked');
    const currentValue = driverSelect.value;
    driverSelect.innerHTML = '<option value="">Selecione um motorista</option>';

    driverNames.forEach((driverName) => {
      const option = document.createElement('option');
      option.value = driverName;
      option.textContent = driverName;
      driverSelect.appendChild(option);
    });

    if (currentValue && driverNames.includes(currentValue)) {
      driverSelect.value = currentValue;
    }
  });

  toggleCustomDriverField();
  toggleLooseCustomDriverField();
}

function saveDriverNameSuggestion(driverName) {
  const normalizedName = driverName.trim().replace(/\s+/g, ' ');
  if (!normalizedName || normalizedName === OTHER_DRIVER_OPTION) {
    return;
  }

  const existingNames = getStoredDriverNames();
  const filteredNames = existingNames.filter(
    (storedName) => storedName.toLocaleLowerCase('pt-BR') !== normalizedName.toLocaleLowerCase('pt-BR')
  );

  filteredNames.unshift(normalizedName);
  const namesToPersist = filteredNames.slice(0, 25).sort((a, b) => a.localeCompare(b, 'pt-BR'));

  try {
    localStorage.setItem(DRIVER_NAMES_STORAGE_KEY, JSON.stringify(namesToPersist));
  } catch (error) {
    return;
  }
  populateDriverOptions();
}

function getLastFuelEntry() {
  try {
    const storedEntry = localStorage.getItem(LAST_FUEL_ENTRY_STORAGE_KEY);
    const parsedEntry = storedEntry ? JSON.parse(storedEntry) : null;
    return parsedEntry && typeof parsedEntry === 'object' ? parsedEntry : null;
  } catch (error) {
    return null;
  }
}

function saveLastFuelEntry(entry) {
  try {
    localStorage.setItem(
      LAST_FUEL_ENTRY_STORAGE_KEY,
      JSON.stringify({
        motorista: entry.motorista || '',
        cidade: entry.cidade || '',
        posto: entry.posto || ''
      })
    );
  } catch (error) {
    return;
  }
}

function openCentralDeviceStateDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('Armazenamento persistente indisponível.'));
      return;
    }
    const request = indexedDB.open(CENTRAL_DEVICE_STATE_DB, 2);
    let settled = false;
    const timeout = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error('O armazenamento persistente demorou para responder.'));
    }, 5000);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(CENTRAL_DEVICE_STATE_STORE)) {
        database.createObjectStore(CENTRAL_DEVICE_STATE_STORE, { keyPath: 'key' });
      }
      if (!database.objectStoreNames.contains(CENTRAL_PENDING_UPLOADS_STORE)) {
        database.createObjectStore(CENTRAL_PENDING_UPLOADS_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => {
      if (settled) {
        request.result.close();
        return;
      }
      settled = true;
      window.clearTimeout(timeout);
      resolve(request.result);
    };
    request.onerror = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      reject(request.error || new Error('Falha ao abrir o armazenamento persistente.'));
    };
    request.onblocked = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      reject(new Error('O armazenamento persistente está bloqueado por outra versão do aplicativo.'));
    };
  });
}

function getCentralDeviceStateSnapshot() {
  return {
    key: CENTRAL_DEVICE_STATE_RECORD_KEY,
    profile: localStorage.getItem(DRIVER_PROFILE_STORAGE_KEY) || '',
    onboardingVersion: localStorage.getItem(DRIVER_ONBOARDING_VERSION_KEY) || '',
    deviceId: localStorage.getItem(CENTRAL_DEVICE_ID_KEY) || '',
    subscriptionId: localStorage.getItem(CENTRAL_PUSH_SUBSCRIPTION_ID_KEY) || '',
    pendingRecords: localStorage.getItem(CENTRAL_APPWRITE_RETRY_KEY) || '',
    updatedAt: new Date().toISOString()
  };
}

function persistCentralDeviceState() {
  const snapshot = getCentralDeviceStateSnapshot();
  centralDeviceStateWritePromise = centralDeviceStateWritePromise.catch(() => false).then(async () => {
    let database;
    try {
      database = await openCentralDeviceStateDb();
      await new Promise((resolve, reject) => {
        const transaction = database.transaction(CENTRAL_DEVICE_STATE_STORE, 'readwrite');
        const store = transaction.objectStore(CENTRAL_DEVICE_STATE_STORE);
        const request = store.get(CENTRAL_DEVICE_STATE_RECORD_KEY);
        request.onsuccess = () => {
          const previous = request.result || {};
          // Perfil, onboarding e identificador nunca devem ser apagados por uma
          // inicialização parcial. Assinatura e fila podem ser limpas de propósito.
          store.put({
            ...snapshot,
            profile: snapshot.profile || previous.profile || '',
            onboardingVersion: snapshot.onboardingVersion || previous.onboardingVersion || '',
            deviceId: snapshot.deviceId || previous.deviceId || ''
          });
        };
        request.onerror = () => reject(request.error);
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
      });
      return true;
    } catch (error) {
      console.warn('Não foi possível criar a cópia de segurança do perfil neste aparelho.', error);
      return false;
    } finally {
      database?.close();
    }
  });
  return centralDeviceStateWritePromise;
}

async function requestCentralPersistentStorage() {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted?.()) return true;
    return Boolean(await navigator.storage.persist());
  } catch (error) {
    console.warn('O navegador não confirmou armazenamento persistente.', error);
    return false;
  }
}

async function restoreCentralDeviceState() {
  let database;
  try {
    database = await openCentralDeviceStateDb();
    const state = await new Promise((resolve, reject) => {
      const transaction = database.transaction(CENTRAL_DEVICE_STATE_STORE, 'readonly');
      const request = transaction.objectStore(CENTRAL_DEVICE_STATE_STORE).get(CENTRAL_DEVICE_STATE_RECORD_KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
    if (!state) return false;

    const recover = (storageKey, storedValue) => {
      if (!localStorage.getItem(storageKey) && String(storedValue || '').trim()) {
        localStorage.setItem(storageKey, String(storedValue));
      }
    };
    if (!getDriverProfile() && String(state.profile || '').trim()) {
      localStorage.setItem(DRIVER_PROFILE_STORAGE_KEY, String(state.profile));
    }
    recover(DRIVER_ONBOARDING_VERSION_KEY, state.onboardingVersion);
    recover(CENTRAL_DEVICE_ID_KEY, state.deviceId);
    recover(CENTRAL_PUSH_SUBSCRIPTION_ID_KEY, state.subscriptionId);
    recover(CENTRAL_APPWRITE_RETRY_KEY, state.pendingRecords);
    return true;
  } catch (error) {
    console.warn('Não foi possível recuperar a cópia de segurança do perfil.', error);
    return false;
  } finally {
    database?.close();
  }
}

function ensureCentralDeviceStateRestored() {
  if (!centralDeviceStateReadyPromise) {
    // Não avance para a criação de um novo deviceId enquanto a cópia anterior
    // ainda está sendo recuperada. O próprio acesso ao IndexedDB possui timeout.
    centralDeviceStateReadyPromise = restoreCentralDeviceState();
  }
  return centralDeviceStateReadyPromise;
}

async function saveCentralOfflineSubmission(submission) {
  const existingSubmissions = await getCentralOfflineSubmissions();
  if (existingSubmissions.length >= 20 && !existingSubmissions.some((item) => item.id === submission.id)) {
    throw new Error('Limite de 20 registros offline atingido. Conecte o aparelho para sincronizar.');
  }
  const database = await openCentralDeviceStateDb();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(CENTRAL_PENDING_UPLOADS_STORE, 'readwrite');
    transaction.objectStore(CENTRAL_PENDING_UPLOADS_STORE).put(submission);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error('Falha ao guardar o registro offline.'));
  });
  database.close();
}

async function getCentralOfflineSubmissions() {
  const database = await openCentralDeviceStateDb();
  const submissions = await new Promise((resolve, reject) => {
    const transaction = database.transaction(CENTRAL_PENDING_UPLOADS_STORE, 'readonly');
    const request = transaction.objectStore(CENTRAL_PENDING_UPLOADS_STORE).getAll();
    request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return submissions;
}

async function deleteCentralOfflineSubmission(id) {
  const database = await openCentralDeviceStateDb();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(CENTRAL_PENDING_UPLOADS_STORE, 'readwrite');
    transaction.objectStore(CENTRAL_PENDING_UPLOADS_STORE).delete(id);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

function getDriverProfile() {
  try {
    const storedProfile = localStorage.getItem(DRIVER_PROFILE_STORAGE_KEY);
    const profile = storedProfile ? JSON.parse(storedProfile) : null;
    if (!profile || typeof profile !== 'object') return null;

    const name = String(profile.name || '').trim();
    const vehicle = String(profile.vehicle || '').trim();
    const plate = String(profile.plate || '').trim().toUpperCase();
    return name && vehicle && plate ? {
      name,
      vehicle,
      plate,
      vehicleImageUrl: String(profile.vehicleImageUrl || '').trim(),
      driverId: String(profile.driverId || ''),
      vehicleId: String(profile.vehicleId || '')
    } : null;
  } catch (error) {
    return null;
  }
}

function normalizeDirectoryValue(value) {
  return String(value || '').trim().toLocaleUpperCase('pt-BR');
}

function isStoredDriverProfileComplete(profile = getDriverProfile()) {
  return Boolean(profile?.driverId && profile?.vehicleId && profile?.name && profile?.vehicle && profile?.plate);
}

async function requireAuthorizedDriverProfile() {
  const profile = getDriverProfile();
  if (!isStoredDriverProfileComplete(profile)) {
    showErrorMessage('Para enviar um registro, vincule seu perfil e veículo.');
    openDriverProfile('edit');
    return null;
  }

  // O vínculo já foi validado quando o perfil foi salvo. Sem conexão, mantemos
  // o uso do aparelho e repetimos a validação antes da próxima sincronização.
  if (!navigator.onLine) return profile;

  try {
    await ensureDriverDirectoryLoaded();
  } catch (error) {
    if (!navigator.onLine || centralConnectionDegraded) return profile;
    showErrorMessage('Não foi possível validar seu perfil agora. Tente novamente.');
    return null;
  }

  const isAuthorized = centralDriverDirectory.some((row) =>
    String(row?.driverId || '') === profile.driverId &&
    String(row?.vehicleId || '') === profile.vehicleId &&
    normalizeDirectoryValue(row?.plate) === normalizeDirectoryValue(profile.plate)
  );

  if (!isAuthorized) {
    showErrorMessage(DRIVER_PROFILE_PERMISSION_ERROR);
    openDriverProfile('edit');
    return null;
  }

  return profile;
}

function getCentralLastSentRecord() {
  try {
    const storedRecord = localStorage.getItem(CENTRAL_LAST_SENT_STORAGE_KEY);
    const record = storedRecord ? JSON.parse(storedRecord) : null;
    return record && typeof record === 'object' ? record : null;
  } catch (error) {
    return null;
  }
}

function cacheCentralLastSentRecord(record) {
  try {
    if (!record) {
      localStorage.removeItem(CENTRAL_LAST_SENT_STORAGE_KEY);
      return;
    }
    const serialized = JSON.stringify(record);
    if (localStorage.getItem(CENTRAL_LAST_SENT_STORAGE_KEY) !== serialized) {
      localStorage.setItem(CENTRAL_LAST_SENT_STORAGE_KEY, serialized);
    }
  } catch (error) {
    console.warn('N\u00e3o foi poss\u00edvel atualizar o cache do \u00faltimo envio.', error);
  }
}

function saveCentralLastSentRecord(record) {
  cacheCentralLastSentRecord(record);
  centralSubmissionHistory = [record, ...centralSubmissionHistory.filter((item) => String(item?.id || '') !== String(record?.id || ''))];
  centralSubmissionHistoryLoaded = true;
  centralSubmissionHistoryRefreshFailed = false;
  renderHomeDriverArea();
}

function formatHomeSentDate(record) {
  const rawDate = String(record?.date || '');
  const rawTime = String(record?.time || '');
  const dateParts = rawDate.split('-');
  const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : rawDate;
  return [formattedDate, rawTime].filter(Boolean).join(' \u2022 ');
}

function escapeCentralHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getSubmissionStatus(record) {
  const value = String(record?.status || 'pendente').toLowerCase();
  if (value.includes('aprov') || value.includes('import')) return { label: 'Aprovado', className: 'approved' };
  if (value.includes('reje') || value.includes('recus')) return { label: 'Recusado', className: 'rejected' };
  return { label: 'Em análise', className: 'pending' };
}

function getSubmissionType(record) {
  const type = String(record?.type || record?.tipo || '').toLowerCase();
  if (type.includes('servico')) return 'Serviço';
  if (type.includes('rapido')) return 'Abastecimento rápido';
  return record?.type || 'Abastecimento';
}

function getSubmissionValue(record) {
  const numeric = Number(record?.numericValue || 0);
  if (numeric > 0) return numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const raw = String(record?.value || '').trim();
  if (!raw || /não informado/i.test(raw)) return '';
  return /^R\$/i.test(raw) ? raw : `R$ ${raw}`;
}

function getHomeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function renderHomeVehicleImage(imageUrl) {
  const image = document.getElementById('home-vehicle-image');
  const fallback = document.getElementById('home-vehicle-fallback');
  const url = String(imageUrl || '').trim();
  if (!image || !fallback) return;
  const showFallback = () => {
    image.classList.add('hidden');
    fallback.classList.remove('hidden');
  };
  if (!url) {
    image.removeAttribute('src');
    showFallback();
    return;
  }
  image.onload = () => {
    image.classList.remove('hidden');
    fallback.classList.add('hidden');
  };
  image.onerror = showFallback;
  image.src = url;
}

function renderHomeDriverArea() {
  const profile = getDriverProfile();
  const lastSent = centralSubmissionHistoryLoaded ? centralSubmissionHistory[0] || null : getCentralLastSentRecord();
  const name = document.getElementById('home-driver-name');
  const greeting = document.getElementById('home-greeting-prefix');
  const summary = document.getElementById('home-driver-summary');
  const setupButton = document.getElementById('home-profile-setup');
  const vehicleName = document.getElementById('home-vehicle-name');
  const vehiclePlate = document.getElementById('home-vehicle-plate');
  if (greeting) greeting.textContent = getHomeGreeting();

  if (profile) {
    if (name) name.textContent = profile.name.split(/\s+/)[0];
    if (summary) summary.textContent = `${profile.vehicle} \u2022 ${profile.plate}`;
    if (vehicleName) vehicleName.textContent = profile.vehicle;
    if (vehiclePlate) {
      vehiclePlate.textContent = profile.plate;
      vehiclePlate.classList.remove('is-empty');
    }
    renderHomeVehicleImage(profile.vehicleImageUrl);
    setupButton?.classList.add('hidden');
  } else {
    if (name) name.textContent = 'motorista';
    if (summary) summary.textContent = 'Configure seu perfil para agilizar os pr\u00f3ximos registros.';
    if (vehicleName) vehicleName.textContent = 'Nenhum ve\u00edculo configurado';
    if (vehiclePlate) {
      vehiclePlate.textContent = 'SEM PLACA';
      vehiclePlate.classList.add('is-empty');
    }
    renderHomeVehicleImage('');
    setupButton?.classList.remove('hidden');
  }

  const emptyState = document.getElementById('home-last-send-empty');
  const contentState = document.getElementById('home-last-send-content');
  emptyState?.classList.toggle('hidden', Boolean(lastSent));
  contentState?.classList.toggle('hidden', !lastSent);

  if (lastSent) {
    const type = document.getElementById('home-last-send-type');
    const date = document.getElementById('home-last-send-date');
    const status = document.getElementById('home-last-send-status');
    const cachedStatusInfo = getSubmissionStatus(lastSent);
    const statusInfo = !centralSubmissionHistoryLoaded && cachedStatusInfo.className === 'pending'
      ? {
          label: centralSubmissionHistoryRefreshFailed ? 'Sem conex\u00e3o' : 'Atualizando...',
          className: 'syncing'
        }
      : cachedStatusInfo;
    if (type) type.textContent = getSubmissionType(lastSent);
    if (date) date.textContent = formatHomeSentDate(lastSent);
    if (status) {
      status.textContent = statusInfo.label;
      status.className = statusInfo.className;
    }
  }
  renderProfilePage();
}

function renderProfilePageVehicleImage(imageUrl) {
  const image = document.getElementById('profile-page-vehicle-image');
  const fallback = document.getElementById('profile-page-vehicle-fallback');
  if (!image || !fallback) return;
  const url = String(imageUrl || '').trim();
  const showFallback = () => {
    image.classList.add('hidden');
    fallback.classList.remove('hidden');
  };
  if (!url) {
    image.removeAttribute('src');
    showFallback();
    return;
  }
  image.onload = () => {
    image.classList.remove('hidden');
    fallback.classList.add('hidden');
  };
  image.onerror = showFallback;
  image.src = url;
}

function renderProfilePage() {
  const profile = getDriverProfile();
  const driverName = document.getElementById('profile-page-driver-name');
  const driverDetail = document.getElementById('profile-page-driver-detail');
  const vehicleName = document.getElementById('profile-page-vehicle-name');
  const vehiclePlate = document.getElementById('profile-page-vehicle-plate');
  if (profile) {
    if (driverName) driverName.textContent = profile.name;
    if (driverDetail) driverDetail.textContent = `Perfil vinculado a este aparelho • ${profile.plate}`;
    if (vehicleName) vehicleName.textContent = profile.vehicle;
    if (vehiclePlate) {
      vehiclePlate.textContent = profile.plate;
      vehiclePlate.classList.remove('is-empty');
    }
    renderProfilePageVehicleImage(profile.vehicleImageUrl);
  } else {
    if (driverName) driverName.textContent = 'Perfil não configurado';
    if (driverDetail) driverDetail.textContent = 'Vincule seus dados para realizar registros.';
    if (vehicleName) vehicleName.textContent = 'Nenhum veículo';
    if (vehiclePlate) {
      vehiclePlate.textContent = 'SEM PLACA';
      vehiclePlate.classList.add('is-empty');
    }
    renderProfilePageVehicleImage('');
  }

  const list = document.getElementById('profile-page-submissions-list');
  if (!list) return;
  const records = centralSubmissionHistoryLoaded
    ? centralSubmissionHistory.slice(0, 3)
    : [getCentralLastSentRecord()].filter(Boolean);
  if (!records.length) {
    list.innerHTML = '<div class="profile-page-empty">Nenhum envio encontrado neste aparelho.</div>';
    return;
  }
  list.innerHTML = records.map((record) => {
    const status = getSubmissionStatus(record);
    return `<article class="profile-page-submission-item">
      <span class="profile-page-submission-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 22h12M4 9h10M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0V9.8L18 5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      <span><strong>${escapeCentralHtml(getSubmissionType(record))}</strong><small>${escapeCentralHtml(formatHistoryDate(record))}</small></span>
      <span class="submission-status ${status.className}">${escapeCentralHtml(status.label)}</span>
    </article>`;
  }).join('');
}

function shouldOpenDriverOnboarding() {
  const completedVersion = String(localStorage.getItem(DRIVER_ONBOARDING_VERSION_KEY) || '').trim();
  if (!completedVersion) return true;
  // Uma queda na Function não pode invalidar um perfil já concluído. A versão
  // obrigatória só é comparada quando foi realmente recebida do servidor.
  if (!centralOnboardingConfigResolved) return false;
  return completedVersion !== centralRequiredOnboardingVersion;
}

async function loadCentralOnboardingConfig() {
  try {
    const result = await Promise.race([
      executeCentralPushFunction({ action: 'onboarding-config' }, { attempts: 1, timeoutMs: 3000 }),
      new Promise((resolve) => window.setTimeout(() => resolve(null), 3500))
    ]);
    const version = String(result?.version || '').trim();
    if (/^[a-zA-Z0-9._:-]{1,120}$/.test(version)) {
      centralRequiredOnboardingVersion = version;
      centralOnboardingConfigResolved = true;
    }
  } catch (error) {
    console.warn('Não foi possível consultar a versão obrigatória do onboarding.', error);
  }
  return centralRequiredOnboardingVersion;
}

function getDirectoryDrivers() {
  const drivers = new Map();
  centralDriverDirectory.forEach((row) => {
    if (!drivers.has(row.driverId)) drivers.set(row.driverId, { id: row.driverId, name: row.driverName, vehicles: [] });
    if (row.vehicleId && row.vehicleName && row.plate) drivers.get(row.driverId).vehicles.push(row);
  });
  return [...drivers.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

async function ensureDriverDirectoryLoaded() {
  if (centralDriverDirectory.length) return centralDriverDirectory;
  if (!driverDirectoryLoadPromise) {
    driverDirectoryLoadPromise = executeCentralPushFunction(
      { action: 'directory' },
      { attempts: 1, timeoutMs: 4500 }
    )
      .then((result) => {
        centralDriverDirectory = Array.isArray(result?.directory) ? result.directory : [];
        if (!centralDriverDirectory.length) {
          throw new Error('O diretório ainda está vazio. Abra o WeFrotas e sincronize os dados para publicar os vínculos ativos.');
        }
        try {
          localStorage.setItem(CENTRAL_DRIVER_DIRECTORY_CACHE_KEY, JSON.stringify({
            savedAt: Date.now(),
            directory: centralDriverDirectory
          }));
        } catch (error) {
          console.warn('Não foi possível guardar o diretório validado neste aparelho.', error);
        }
        return centralDriverDirectory;
      })
      .catch((error) => {
        try {
          const cached = JSON.parse(localStorage.getItem(CENTRAL_DRIVER_DIRECTORY_CACHE_KEY) || 'null');
          const cacheAge = Date.now() - Number(cached?.savedAt || 0);
          if (Array.isArray(cached?.directory) && cached.directory.length && cacheAge >= 0 && cacheAge <= CENTRAL_DIRECTORY_CACHE_MAX_AGE) {
            centralDriverDirectory = cached.directory;
            console.warn('Usando o último diretório validado enquanto a conexão se recupera.');
            return centralDriverDirectory;
          }
        } catch (cacheError) {
          console.warn('Não foi possível recuperar o diretório validado.', cacheError);
        }
        throw error;
      })
      .finally(() => {
        driverDirectoryLoadPromise = null;
      });
  }
  return driverDirectoryLoadPromise;
}

function getDirectoryVehicles() {
  const vehicles = new Map();
  centralDriverDirectory.forEach((row) => {
    if (!row?.vehicleId || !row?.plate) return;
    if (!vehicles.has(row.vehicleId)) vehicles.set(row.vehicleId, row);
  });
  return [...vehicles.values()].sort((a, b) =>
    String(a.plate || '').localeCompare(String(b.plate || ''), 'pt-BR')
  );
}

function renderVehicleDirectoryResults(queryValue) {
  const results = document.getElementById('driver-vehicle-results');
  if (!results) return;
  const query = String(queryValue ?? document.getElementById('driver-vehicle-search')?.value ?? '')
    .trim()
    .toLocaleLowerCase('pt-BR');

  if (!query) {
    results.innerHTML = '';
    return;
  }

  const vehicles = getDirectoryVehicles().filter((vehicle) => [
    vehicle.plate,
    vehicle.vehicleName,
    vehicle.fleetNumber
  ].some((value) => String(value || '').toLocaleLowerCase('pt-BR').includes(query)));

  results.innerHTML = vehicles.length ? vehicles.map((vehicle) => `
    <button type="button" class="driver-profile-result driver-vehicle-result" data-vehicle-id="${escapeCentralHtml(vehicle.vehicleId)}">
      <span class="driver-profile-result-mark driver-vehicle-result-mark" aria-hidden="true"></span>
      <span><strong>${escapeCentralHtml(vehicle.plate)}</strong><small>${escapeCentralHtml(vehicle.vehicleName || 'Veículo cadastrado')}${vehicle.fleetNumber ? ` • Frota ${escapeCentralHtml(vehicle.fleetNumber)}` : ''}</small></span>
    </button>
  `).join('') : '<div class="driver-directory-message">Nenhum veículo encontrado para esta placa.</div>';

  results.querySelectorAll('[data-vehicle-id]').forEach((button) => button.addEventListener('click', () => selectAlternativeVehicle(button.dataset.vehicleId)));
}

async function runVehicleDirectorySearch(query, sequence) {
  const results = document.getElementById('driver-vehicle-results');
  if (!results) return;
  results.innerHTML = '<div class="driver-search-loading" role="status"><span class="driver-search-spinner" aria-hidden="true"></span><span>Buscando veículos...</span></div>';
  try {
    await Promise.all([
      ensureDriverDirectoryLoaded(),
      new Promise((resolve) => window.setTimeout(resolve, 180))
    ]);
    const currentQuery = String(document.getElementById('driver-vehicle-search')?.value || '').trim().toLocaleLowerCase('pt-BR');
    if (sequence !== vehicleDirectorySearchSequence || currentQuery !== query) return;
    renderVehicleDirectoryResults(query);
  } catch (error) {
    if (sequence !== vehicleDirectorySearchSequence) return;
    results.innerHTML = '<div class="driver-directory-message is-error">Não foi possível consultar os veículos agora.</div>';
  }
}

function filterVehicleDirectory() {
  const results = document.getElementById('driver-vehicle-results');
  const error = document.getElementById('driver-vehicle-permission-error');
  const query = String(document.getElementById('driver-vehicle-search')?.value || '').trim().toLocaleLowerCase('pt-BR');
  window.clearTimeout(vehicleDirectorySearchTimer);
  vehicleDirectorySearchTimer = null;
  const sequence = ++vehicleDirectorySearchSequence;
  error?.classList.add('hidden');
  if (!query) {
    if (results) results.innerHTML = '';
    return;
  }
  const delay = query.length >= 4 ? 0 : 1500;
  if (delay && results) {
    results.innerHTML = '<div class="driver-search-waiting">Continue digitando ou aguarde a busca...</div>';
  }
  vehicleDirectorySearchTimer = window.setTimeout(() => runVehicleDirectorySearch(query, sequence), delay);
}

function showVehicleChangeSearch() {
  if (!selectedDirectoryDriver) return;
  document.getElementById('driver-onboarding-vehicle-step')?.classList.add('hidden');
  document.getElementById('driver-onboarding-vehicle-search-step')?.classList.remove('hidden');
  const error = document.getElementById('driver-vehicle-permission-error');
  error?.classList.add('hidden');
  const search = document.getElementById('driver-vehicle-search');
  if (search) {
    search.value = '';
    window.setTimeout(() => search.focus(), 80);
  }
  window.clearTimeout(vehicleDirectorySearchTimer);
  vehicleDirectorySearchTimer = null;
  vehicleDirectorySearchSequence += 1;
  renderVehicleDirectoryResults('');
}

function setDriverOnboardingStep(stepId) {
  const stepIds = [
    'driver-onboarding-driver-step',
    'driver-onboarding-vehicle-step',
    'driver-onboarding-vehicle-search-step',
    'driver-onboarding-permissions-step',
    'driver-onboarding-camera-step',
    'driver-onboarding-location-step',
    'driver-onboarding-notifications-step',
    'driver-onboarding-ready-step'
  ];
  stepIds.forEach((id) => document.getElementById(id)?.classList.toggle('hidden', id !== stepId));

  const stepConfig = {
    'driver-onboarding-driver-step': { current: 1, kicker: 'CONFIGURAÇÃO INICIAL', title: 'Quem é você?' },
    'driver-onboarding-vehicle-step': { current: 2, kicker: 'SEU VEÍCULO', title: 'Este é o veículo que você dirige?' },
    'driver-onboarding-vehicle-search-step': { current: 2, kicker: 'SEU VEÍCULO', title: 'Escolha o veículo correto' },
    'driver-onboarding-permissions-step': { current: 3, kicker: 'PERMISSÕES DA CENTRAL', title: 'Vamos preparar seu acesso' },
    'driver-onboarding-camera-step': { current: 3, kicker: 'CÂMERA', title: 'Permissão da câmera' },
    'driver-onboarding-location-step': { current: 4, kicker: 'LOCALIZAÇÃO', title: 'Encontre postos próximos' },
    'driver-onboarding-notifications-step': { current: 5, kicker: 'NOTIFICAÇÕES', title: 'Acompanhe seus envios' },
    'driver-onboarding-ready-step': { current: 6, kicker: 'TUDO CERTO', title: 'Seu acesso está pronto!' }
  };
  const config = stepConfig[stepId];
  if (!config || !isGuidedDriverOnboarding()) return;

  const kicker = document.getElementById('driver-profile-kicker');
  const title = document.getElementById('driver-profile-title');
  const progressText = document.getElementById('driver-onboarding-progress-text');
  const progressBar = document.getElementById('driver-onboarding-progress-bar');
  const progress = document.getElementById('driver-onboarding-progress');
  if (kicker) kicker.textContent = config.kicker;
  if (title) title.textContent = config.title;
  if (progressText) progressText.textContent = `Passo ${config.current} de 6`;
  if (progressBar) progressBar.style.width = `${(config.current / 6) * 100}%`;
  progress?.setAttribute('aria-valuenow', String(config.current));
}

function isGuidedDriverOnboarding() {
  return document.getElementById('driver-profile-modal')?.dataset.guided === 'true';
}

function returnToSuggestedVehicle() {
  setDriverOnboardingStep('driver-onboarding-vehicle-step');
}

function selectAlternativeVehicle(vehicleId) {
  const candidate = getDirectoryVehicles().find((vehicle) => String(vehicle.vehicleId) === String(vehicleId));
  const permittedIndex = selectedDirectoryVehicles.findIndex((vehicle) =>
    String(vehicle.vehicleId) === String(vehicleId) &&
    normalizeDirectoryValue(vehicle.plate) === normalizeDirectoryValue(candidate?.plate)
  );
  const error = document.getElementById('driver-vehicle-permission-error');

  if (!candidate || permittedIndex < 0) {
    if (error) {
      error.textContent = DRIVER_PROFILE_PERMISSION_ERROR;
      error.classList.remove('hidden');
    }
    return;
  }

  selectedDirectoryVehicleIndex = permittedIndex;
  returnToSuggestedVehicle();
  renderSuggestedDriverVehicle();
}

function renderDriverDirectoryResults(queryValue) {
  const results = document.getElementById('driver-profile-results');
  if (!results) return;
  const query = String(queryValue ?? document.getElementById('driver-profile-search')?.value ?? '').trim().toLocaleLowerCase('pt-BR');
  if (!query) {
    results.innerHTML = '';
    return;
  }
  const drivers = getDirectoryDrivers().filter((driver) => driver.name.toLocaleLowerCase('pt-BR').includes(query));
  results.innerHTML = drivers.length ? drivers.map((driver) => `
    <button type="button" class="driver-profile-result" data-driver-id="${escapeCentralHtml(driver.id)}">
      <span class="driver-profile-result-mark" aria-hidden="true"></span>
      <span>${escapeCentralHtml(driver.name)}<small>${driver.vehicles.length ? `${driver.vehicles.length} veículo(s) vinculado(s)` : 'Sem veículo ativo vinculado'}</small></span>
    </button>
  `).join('') : '<div class="driver-directory-message">Nenhum motorista encontrado.</div>';
  results.querySelectorAll('[data-driver-id]').forEach((button) => button.addEventListener('click', () => selectDirectoryDriver(button.dataset.driverId)));
}

async function runDriverDirectorySearch(query, sequence) {
  const results = document.getElementById('driver-profile-results');
  if (!results) return;
  results.innerHTML = '<div class="driver-search-loading" role="status"><span class="driver-search-spinner" aria-hidden="true"></span><span>Buscando motoristas...</span></div>';
  try {
    await Promise.all([
      ensureDriverDirectoryLoaded(),
      new Promise((resolve) => window.setTimeout(resolve, 180))
    ]);
    const currentQuery = String(document.getElementById('driver-profile-search')?.value || '').trim().toLocaleLowerCase('pt-BR');
    if (sequence !== driverDirectorySearchSequence || currentQuery !== query) return;
    renderDriverDirectoryResults(query);
  } catch (error) {
    if (sequence !== driverDirectorySearchSequence) return;
    results.innerHTML = `<div class="driver-directory-message is-error">${escapeCentralHtml(error?.message || 'Não foi possível consultar os motoristas agora.')}</div>`;
  }
}

function filterDriverDirectory() {
  const results = document.getElementById('driver-profile-results');
  const query = String(document.getElementById('driver-profile-search')?.value || '').trim().toLocaleLowerCase('pt-BR');
  window.clearTimeout(driverDirectorySearchTimer);
  driverDirectorySearchTimer = null;
  const sequence = ++driverDirectorySearchSequence;
  if (!query) {
    if (results) results.innerHTML = '';
    return;
  }
  const delay = query.length >= 4 ? 0 : 1500;
  if (delay && results) {
    results.innerHTML = '<div class="driver-search-waiting">Continue digitando ou aguarde a busca...</div>';
  }
  driverDirectorySearchTimer = window.setTimeout(() => runDriverDirectorySearch(query, sequence), delay);
}

function selectDirectoryDriver(driverId) {
  selectedDirectoryDriver = getDirectoryDrivers().find((driver) => driver.id === driverId) || null;
  selectedDirectoryVehicles = selectedDirectoryDriver?.vehicles || [];
  selectedDirectoryVehicleIndex = 0;
  if (!selectedDirectoryDriver || !selectedDirectoryVehicles.length) {
    showErrorMessage('Este motorista ainda não possui um veículo ativo vinculado no WeFrotas.');
    return;
  }
  setDriverOnboardingStep('driver-onboarding-vehicle-step');
  renderSuggestedDriverVehicle();
}

function renderSuggestedDriverVehicle() {
  const vehicle = selectedDirectoryVehicles[selectedDirectoryVehicleIndex];
  if (!vehicle) return;
  const fleet = document.getElementById('driver-found-fleet');
  const name = document.getElementById('driver-found-vehicle-name');
  const plate = document.getElementById('driver-found-plate');
  const photo = document.getElementById('driver-found-vehicle-photo');
  const fallback = document.getElementById('driver-found-vehicle-fallback');
  if (fleet) fleet.textContent = vehicle.fleetNumber ? `Frota ${vehicle.fleetNumber}` : '';
  if (name) name.textContent = vehicle.vehicleName;
  if (plate) plate.textContent = vehicle.plate;
  if (photo && fallback) {
    const imageUrl = String(vehicle.vehicleImageUrl || '').trim();
    const showFallback = () => {
      photo.classList.add('hidden');
      fallback.classList.remove('hidden');
    };
    if (imageUrl) {
      photo.onload = () => {
        photo.classList.remove('hidden');
        fallback.classList.add('hidden');
      };
      photo.onerror = showFallback;
      photo.src = imageUrl;
    } else {
      photo.removeAttribute('src');
      showFallback();
    }
  }
}

function cycleSuggestedVehicle() {
  if (selectedDirectoryVehicles.length < 2) return;
  selectedDirectoryVehicleIndex = (selectedDirectoryVehicleIndex + 1) % selectedDirectoryVehicles.length;
  renderSuggestedDriverVehicle();
}

function returnToDriverSelection() {
  selectedDirectoryDriver = null;
  selectedDirectoryVehicles = [];
  setDriverOnboardingStep('driver-onboarding-driver-step');
  document.getElementById('driver-profile-search')?.focus();
}

async function confirmSuggestedDriverVehicle() {
  const vehicle = selectedDirectoryVehicles[selectedDirectoryVehicleIndex];
  if (!selectedDirectoryDriver || !vehicle) return;
  try {
    localStorage.setItem(DRIVER_PROFILE_STORAGE_KEY, JSON.stringify({
      name: selectedDirectoryDriver.name,
      vehicle: vehicle.vehicleName,
      plate: vehicle.plate,
      vehicleImageUrl: String(vehicle.vehicleImageUrl || vehicle.imageUrl || vehicle.photoUrl || ''),
      driverId: selectedDirectoryDriver.id,
      vehicleId: vehicle.vehicleId
    }));
  } catch (error) {
    showErrorMessage('Não foi possível salvar o perfil neste aparelho.');
    return;
  }
  await persistCentralDeviceState();
  requestCentralPersistentStorage();
  saveDriverNameSuggestion(selectedDirectoryDriver.name);
  renderHomeDriverArea();
  if (isGuidedDriverOnboarding()) {
    openOnboardingPermissionsStep();
    return;
  }
  localStorage.setItem(DRIVER_ONBOARDING_VERSION_KEY, centralRequiredOnboardingVersion);
  await persistCentralDeviceState();
  closeDriverProfile();
  showSuccessMessage('Motorista e veículo confirmados.');
}

function openOnboardingPermissionsStep() {
  const title = document.getElementById('driver-profile-title');
  const kicker = document.getElementById('driver-profile-kicker');
  if (kicker) kicker.textContent = 'PERMISSÕES DA CENTRAL';
  if (title) title.textContent = 'Vamos preparar seu acesso';
  document.getElementById('driver-profile-skip')?.classList.add('hidden');
  setDriverOnboardingStep('driver-onboarding-permissions-step');
}
function openOnboardingCameraStep() { setDriverOnboardingStep('driver-onboarding-camera-step'); }

async function requestOnboardingCameraPermission() {
  const status = document.getElementById('driver-onboarding-camera-status');
  const button = document.getElementById('driver-onboarding-camera-enable');
  if (!navigator.mediaDevices?.getUserMedia) {
    if (status) status.textContent = 'Este navegador não consegue abrir a solicitação agora. Você pode continuar e autorizar a câmera ao fotografar.';
    if (button) { button.disabled = false; button.textContent = 'Tentar permitir câmera'; button.onclick = requestOnboardingCameraPermission; }
    return;
  }
  if (button) { button.disabled = true; button.textContent = 'Abrindo permissão...'; }
  if (status) status.textContent = 'Quando aparecer a mensagem do navegador, toque em “Permitir durante o uso do app”.';
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: 'environment' } }
    });
    stream.getTracks().forEach((track) => track.stop());
    if (status) status.textContent = 'Câmera autorizada neste aparelho.';
    if (button) { button.disabled = false; button.textContent = 'Continuar'; button.onclick = openOnboardingLocationStep; }
  } catch (error) {
    console.warn('A câmera não foi autorizada no onboarding.', error);
    let permissionBlocked = false;
    try {
      const permission = await navigator.permissions?.query?.({ name: 'camera' });
      permissionBlocked = permission?.state === 'denied';
    } catch (permissionError) {
      permissionBlocked = error?.name === 'NotAllowedError';
    }
    if (status) {
      status.textContent = permissionBlocked
        ? 'A câmera está bloqueada nas configurações do navegador. Libere o acesso à câmera para este app ou toque em “Permitir depois” para continuar.'
        : 'A permissão não foi concluída. Toque novamente e escolha “Permitir durante o uso do app”.';
    }
    if (button) { button.disabled = false; button.textContent = 'Tentar permitir câmera'; button.onclick = requestOnboardingCameraPermission; }
  }
}

function openOnboardingLocationStep() { setDriverOnboardingStep('driver-onboarding-location-step'); }
function openOnboardingNotificationsStep() { setDriverOnboardingStep('driver-onboarding-notifications-step'); }

async function activateOnboardingNotifications() {
  const status = document.getElementById('driver-onboarding-notification-status');
  const button = document.getElementById('driver-onboarding-notification-enable');
  if (button) { button.disabled = true; button.textContent = 'Ativando...'; }
  if (status) status.textContent = 'Aguardando a confirmação do navegador...';
  const activated = await enableCentralPushNotifications();
  if (activated) return finishGuidedOnboarding();
  if (button) { button.disabled = false; button.textContent = 'Tentar ativar notificações'; }
  if (status) status.textContent = 'Você poderá ativar depois em Configurações.';
}

async function finishGuidedOnboarding(options = {}) {
  if (options.notificationsSkipped) localStorage.setItem(CENTRAL_PUSH_PROMPT_DISMISSED_KEY, String(Date.now()));
  localStorage.setItem(DRIVER_ONBOARDING_VERSION_KEY, centralRequiredOnboardingVersion);
  await persistCentralDeviceState();
  requestCentralPersistentStorage();
  const title = document.getElementById('driver-profile-title');
  const kicker = document.getElementById('driver-profile-kicker');
  if (kicker) kicker.textContent = 'TUDO CERTO';
  if (title) title.textContent = 'Seu acesso está pronto!';
  setDriverOnboardingStep('driver-onboarding-ready-step');
}
function finishGuidedOnboardingAndClose() {
  closeDriverProfile();
  showSuccessMessage('Perfil configurado. Bom trabalho!');
}

async function skipDriverOnboarding() {
  if (!isStoredDriverProfileComplete()) {
    showErrorMessage('Identifique o motorista e o veículo para continuar.');
    return;
  }
  localStorage.setItem(DRIVER_ONBOARDING_VERSION_KEY, centralRequiredOnboardingVersion);
  localStorage.setItem(CENTRAL_PUSH_PROMPT_DISMISSED_KEY, String(Date.now()));
  await persistCentralDeviceState();
  requestCentralPersistentStorage();
  closeDriverProfile();
}

function openDriverProfile(mode = 'profile') {
  const modal = document.getElementById('driver-profile-modal');
  const profile = getDriverProfile();
  const guided = shouldOpenDriverOnboarding();
  document.getElementById('driver-profile-overview')?.classList.add('hidden');
  document.getElementById('driver-directory-loading')?.classList.add('hidden');
  document.getElementById('driver-directory-error')?.classList.add('hidden');
  setDriverOnboardingStep('');
  const search = document.getElementById('driver-profile-search');
  modal?.classList.remove('hidden');
  modal?.setAttribute('aria-hidden', 'false');
  if (modal) modal.dataset.guided = String(guided);
  document.body.classList.add('driver-profile-open');
  if (profile && mode !== 'edit' && !guided) {
    setDriverProfileDismissibility(false);
    const title = document.getElementById('driver-profile-title');
    if (title) title.textContent = 'Meu perfil';
    if (search) search.value = '';
    document.getElementById('driver-overview-name').textContent = profile.name;
    document.getElementById('driver-overview-vehicle').textContent = profile.vehicle;
    document.getElementById('driver-overview-plate').textContent = profile.plate;
    document.getElementById('driver-profile-overview')?.classList.remove('hidden');
    document.getElementById('driver-profile-skip')?.classList.add('hidden');
    return;
  }
  startDriverProfileEditing();
}

async function openDriverVehicleEditor() {
  const profile = getDriverProfile();
  if (!profile?.driverId) {
    openDriverProfile('edit');
    return;
  }
  openDriverProfile('edit');
  const modal = document.getElementById('driver-profile-modal');
  if (modal) modal.dataset.guided = 'false';
  setDriverProfileDismissibility(false);
  document.getElementById('driver-profile-skip')?.classList.add('hidden');
  const title = document.getElementById('driver-profile-title');
  const kicker = document.getElementById('driver-profile-kicker');
  if (title) title.textContent = 'Alterar veículo';
  if (kicker) kicker.textContent = 'VEÍCULO DESTE APARELHO';
  try {
    await ensureDriverDirectoryLoaded();
    selectedDirectoryDriver = getDirectoryDrivers().find((driver) => String(driver.id) === String(profile.driverId)) || null;
    selectedDirectoryVehicles = selectedDirectoryDriver?.vehicles || [];
    selectedDirectoryVehicleIndex = Math.max(0, selectedDirectoryVehicles.findIndex((vehicle) => String(vehicle.vehicleId) === String(profile.vehicleId)));
    if (!selectedDirectoryDriver || !selectedDirectoryVehicles.length) throw new Error('Vínculo do motorista não encontrado.');
    setDriverOnboardingStep('driver-onboarding-vehicle-search-step');
    const search = document.getElementById('driver-vehicle-search');
    const results = document.getElementById('driver-vehicle-results');
    document.getElementById('driver-vehicle-permission-error')?.classList.add('hidden');
    if (search) search.value = '';
    if (results) results.innerHTML = '<div class="driver-search-waiting">Digite a placa do veículo para pesquisar.</div>';
    window.setTimeout(() => search?.focus(), 80);
  } catch (error) {
    closeDriverProfile();
    showErrorMessage(error?.message || 'Não foi possível abrir a alteração de veículo.');
  }
}

function setDriverProfileDismissibility(isOnboarding) {
  document.getElementById('driver-profile-close')?.classList.toggle('hidden', isOnboarding);
  document.getElementById('driver-profile-backdrop')?.classList.toggle('driver-profile-backdrop--locked', isOnboarding);
}

function startDriverProfileEditing() {
  setDriverProfileDismissibility(isGuidedDriverOnboarding());
  document.getElementById('driver-profile-overview')?.classList.add('hidden');
  setDriverOnboardingStep('');
  const title = document.getElementById('driver-profile-title');
  if (title) title.textContent = 'Vamos deixar seus abastecimentos mais rápidos?';
  document.getElementById('driver-profile-skip')?.classList.toggle('hidden', isGuidedDriverOnboarding());
  if (isGuidedDriverOnboarding() && shouldOfferPwaInstall()) {
    window.setTimeout(() => showPwaInstallModal(isIosDevice() ? 'ios' : 'android'), 80);
  }
  selectedDirectoryDriver = null;
  selectedDirectoryVehicles = [];
  selectedDirectoryVehicleIndex = 0;
  window.clearTimeout(driverDirectorySearchTimer);
  driverDirectorySearchTimer = null;
  driverDirectorySearchSequence += 1;
  const search = document.getElementById('driver-profile-search');
  if (search) search.value = '';
  const results = document.getElementById('driver-profile-results');
  if (results) results.innerHTML = '';
  document.getElementById('driver-directory-loading')?.classList.add('hidden');
  document.getElementById('driver-directory-error')?.classList.add('hidden');
  setDriverOnboardingStep('driver-onboarding-driver-step');
  window.setTimeout(() => search?.focus(), 80);
}

function closeDriverProfile() {
  if (isGuidedDriverOnboarding() && !isStoredDriverProfileComplete()) return;
  const modal = document.getElementById('driver-profile-modal');
  modal?.classList.add('hidden');
  modal?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('driver-profile-open');
  window.clearTimeout(driverDirectorySearchTimer);
  driverDirectorySearchTimer = null;
  driverDirectorySearchSequence += 1;
}

function formatHistoryDate(record) {
  return formatHomeSentDate({ date: record?.date || '', time: record?.time || '' });
}

function renderMySubmissions() {
  const list = document.getElementById('my-submissions-list');
  const summary = document.getElementById('my-submissions-summary');
  if (!list || !summary) return;
  const counts = centralSubmissionHistory.reduce((acc, record) => {
    acc[getSubmissionStatus(record).className] += 1;
    return acc;
  }, { pending: 0, approved: 0, rejected: 0 });
  summary.innerHTML = `<span>${counts.pending}<br>Em análise</span><span>${counts.approved}<br>Aprovados</span><span>${counts.rejected}<br>Recusados</span>`;
  summary.classList.toggle('hidden', !centralSubmissionHistory.length);
  if (!centralSubmissionHistory.length) {
    list.innerHTML = '<div class="driver-directory-message">Nenhum envio encontrado para este aparelho.</div>';
    return;
  }
  list.innerHTML = centralSubmissionHistory.map((record) => {
    const status = getSubmissionStatus(record);
    const value = getSubmissionValue(record);
    return `<article class="submission-item">
      <div class="submission-item-head"><span><strong>${escapeCentralHtml(getSubmissionType(record))}</strong><small>${escapeCentralHtml(formatHistoryDate(record))}</small></span><span class="submission-status ${status.className}">${status.label}</span></div>
      <p>${escapeCentralHtml(record.supplier || 'Fornecedor não informado')}${record.protocol ? ` • ${escapeCentralHtml(record.protocol)}` : ''}</p>
      ${status.className === 'rejected' && record.resolution ? `<p><strong>Motivo:</strong> ${escapeCentralHtml(record.resolution)}</p>` : ''}
      <div class="submission-item-foot"><span class="submission-item-value">${escapeCentralHtml(value)}</span>${record.receiptUrl ? `<a class="submission-receipt" href="${escapeCentralHtml(record.receiptUrl)}" target="_blank" rel="noopener">Ver comprovante</a>` : ''}</div>
    </article>`;
  }).join('');
}

async function refreshMySubmissions(options = {}) {
  const { silent = false } = options;
  const list = document.getElementById('my-submissions-list');
  if (!silent && list) list.innerHTML = '<div class="driver-directory-message">Buscando seus envios...</div>';
  centralSubmissionHistoryRefreshFailed = false;
  if (!navigator.onLine || centralConnectionDegraded) {
    centralSubmissionHistory = [getCentralLastSentRecord()].filter(Boolean);
    centralSubmissionHistoryLoaded = true;
    centralSubmissionHistoryRefreshFailed = true;
    renderHomeDriverArea();
    renderMySubmissions();
    return;
  }
  try {
    const result = await executeCentralPushFunction({
      action: 'history',
      deviceId: getCentralDeviceId(),
      subscriptionId: getCentralPushSubscriptionId() || undefined
    });
    centralSubmissionHistory = Array.isArray(result?.records) ? result.records : [];
    centralSubmissionHistoryLoaded = true;
    cacheCentralLastSentRecord(centralSubmissionHistory[0] || null);
    renderHomeDriverArea();
    renderMySubmissions();
  } catch (error) {
    centralSubmissionHistoryRefreshFailed = true;
    renderHomeDriverArea();
    if (!silent && list) list.innerHTML = `<div class="driver-directory-message is-error">${escapeCentralHtml(error?.message || 'Não foi possível consultar seus envios.')}</div>`;
  }
}

function openMySubmissions() {
  const modal = document.getElementById('my-submissions-modal');
  modal?.classList.remove('hidden');
  modal?.setAttribute('aria-hidden', 'false');
  document.body.classList.add('driver-profile-open');
  refreshMySubmissions();
}

function closeMySubmissions() {
  const modal = document.getElementById('my-submissions-modal');
  modal?.classList.add('hidden');
  modal?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('driver-profile-open');
}

function openCentralNotificationsDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('Histórico de notificações indisponível neste navegador.'));
      return;
    }
    const request = indexedDB.open(CENTRAL_NOTIFICATIONS_DB, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(CENTRAL_NOTIFICATIONS_STORE)) {
        const store = database.createObjectStore(CENTRAL_NOTIFICATIONS_STORE, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Não foi possível abrir o histórico de notificações.'));
  });
}

async function getCentralNotifications() {
  const database = await openCentralNotificationsDb();
  try {
    const records = await new Promise((resolve, reject) => {
      const transaction = database.transaction(CENTRAL_NOTIFICATIONS_STORE, 'readonly');
      const request = transaction.objectStore(CENTRAL_NOTIFICATIONS_STORE).getAll();
      request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
      request.onerror = () => reject(request.error);
    });
    return records
      .sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0))
      .slice(0, 100);
  } finally {
    database.close();
  }
}

async function markAllCentralNotificationsRead() {
  const database = await openCentralNotificationsDb();
  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(CENTRAL_NOTIFICATIONS_STORE, 'readwrite');
      const store = transaction.objectStore(CENTRAL_NOTIFICATIONS_STORE);
      const request = store.openCursor();
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return;
        if (!cursor.value.read) cursor.update({ ...cursor.value, read: true });
        cursor.continue();
      };
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

async function deleteAllCentralNotifications() {
  const database = await openCentralNotificationsDb();
  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(CENTRAL_NOTIFICATIONS_STORE, 'readwrite');
      transaction.objectStore(CENTRAL_NOTIFICATIONS_STORE).clear();
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error || new Error('Não foi possível limpar as notificações.'));
      transaction.onabort = () => reject(transaction.error || new Error('A limpeza das notificações foi interrompida.'));
    });
  } finally {
    database.close();
  }
}

async function closeCentralSystemNotifications() {
  if (!navigator.serviceWorker) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    const notifications = await registration.getNotifications();
    notifications.forEach((notification) => notification.close());
  } catch (error) {
    console.warn('Central: não foi possível fechar os avisos visíveis do sistema.', error);
  }
}

async function markCentralNotificationRead(id) {
  if (!id) return;
  const database = await openCentralNotificationsDb();
  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(CENTRAL_NOTIFICATIONS_STORE, 'readwrite');
      const store = transaction.objectStore(CENTRAL_NOTIFICATIONS_STORE);
      const request = store.get(id);
      request.onsuccess = () => {
        if (request.result) store.put({ ...request.result, read: true });
      };
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

function formatCentralNotificationDate(value) {
  const date = new Date(value || 0);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function renderCentralNotifications(records) {
  const list = document.getElementById('central-notifications-list');
  const clearButton = document.getElementById('central-notifications-clear');
  if (clearButton) clearButton.disabled = !records.length;
  if (!list) return;
  if (!records.length) {
    list.innerHTML = `<div class="notification-center-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" stroke-width="2" stroke-linecap="round"/><path d="M10 21h4" stroke-width="2" stroke-linecap="round"/></svg>
      <strong>Nenhum aviso recebido</strong>
      <span>As notificações enviadas pelo WeFrotas aparecerão aqui.</span>
    </div>`;
    return;
  }
  list.innerHTML = records.map((record) => `<button type="button" class="notification-center-item${record.read ? '' : ' is-unread'}" data-notification-id="${escapeCentralHtml(record.id)}">
    <span class="notification-center-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" stroke-width="2" stroke-linecap="round"/><path d="M10 21h4" stroke-width="2" stroke-linecap="round"/></svg></span>
    <span class="notification-center-copy"><strong>${escapeCentralHtml(record.title || 'Central de Registros')}</strong><span>${escapeCentralHtml(record.body || '')}</span><time>${escapeCentralHtml(formatCentralNotificationDate(record.createdAt))}</time></span>
    <span class="notification-center-dot" aria-hidden="true"></span>
  </button>`).join('');
  list.querySelectorAll('[data-notification-id]').forEach((button) => {
    button.addEventListener('click', () => openCentralNotificationItem(button.dataset.notificationId));
  });
}

async function clearCentralNotifications() {
  const records = await getCentralNotifications().catch(() => []);
  if (!records.length) return;
  if (!window.confirm('Limpar todas as notificações deste aparelho?')) return;
  const button = document.getElementById('central-notifications-clear');
  if (button) button.disabled = true;
  try {
    await Promise.all([deleteAllCentralNotifications(), closeCentralSystemNotifications()]);
    renderCentralNotifications([]);
    await refreshCentralNotificationBadge();
    showSuccessMessage('Notificações removidas deste aparelho.');
  } catch (error) {
    if (button) button.disabled = false;
    showErrorMessage(error?.message || 'Não foi possível limpar as notificações.');
  }
}

async function refreshCentralNotificationBadge() {
  const badge = document.getElementById('home-notification-badge');
  if (!badge) return;
  try {
    const records = await getCentralNotifications();
    const unread = records.filter((record) => !record.read).length;
    badge.textContent = unread > 99 ? '99+' : String(unread);
    badge.classList.toggle('hidden', unread === 0);
  } catch (error) {
    badge.classList.add('hidden');
  }
}

async function refreshCentralNotifications() {
  const list = document.getElementById('central-notifications-list');
  if (list) list.innerHTML = '<div class="driver-directory-message">Carregando avisos...</div>';
  try {
    const records = await getCentralNotifications();
    renderCentralNotifications(records);
    if (records.some((record) => !record.read)) await markAllCentralNotificationsRead();
    await refreshCentralNotificationBadge();
  } catch (error) {
    if (list) list.innerHTML = `<div class="driver-directory-message is-error">${escapeCentralHtml(error?.message || 'Não foi possível carregar as notificações.')}</div>`;
  }
}

async function openCentralNotifications() {
  const modal = document.getElementById('central-notifications-modal');
  modal?.classList.remove('hidden');
  modal?.setAttribute('aria-hidden', 'false');
  document.body.classList.add('driver-profile-open');
  await refreshCentralNotifications();
}

function closeCentralNotifications() {
  const modal = document.getElementById('central-notifications-modal');
  modal?.classList.add('hidden');
  modal?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('driver-profile-open');
}

function openNotificationSettingsFromCenter() {
  closeCentralNotifications();
  openCentralNotificationSettings();
}

async function openCentralNotificationItem(id) {
  try {
    const records = await getCentralNotifications();
    const record = records.find((item) => item.id === id);
    await markCentralNotificationRead(id);
    await refreshCentralNotificationBadge();
    if (!record?.url) return;
    const target = new URL(record.url, window.location.href);
    if (target.origin !== window.location.origin) return;
    closeCentralNotifications();
    if (target.href !== window.location.href) window.location.href = target.href;
  } catch (error) {
    console.warn('Central: não foi possível abrir a notificação.', error);
  }
}

function buildFuelReceiptFileName(driverName, dateValue, originalFileName) {
  const normalizedDriverName = driverName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '+')
    .replace(/[^a-z0-9+_-]/g, '');

  const formattedDate = (dateValue || getTodayLocalDateString()).split('-').reverse().join('.');
  const extensionMatch = originalFileName.match(/\.[^.]+$/);
  const extension = extensionMatch ? extensionMatch[0].toLowerCase() : '.jpg';
  const safeDriverName = normalizedDriverName || 'motorista';

  return `${safeDriverName}+${formattedDate}${extension}`;
}

function createRenamedFuelReceiptFile(file, driverName, dateValue) {
  const renamedFileName = buildFuelReceiptFileName(driverName, dateValue, file.name || '');
  return new File([file], renamedFileName, {
    type: file.type || 'image/jpeg',
    lastModified: file.lastModified || Date.now()
  });
}

function buildLooseNoteReceiptFileName(supplierName, originalFileName) {
  const normalizedSupplierName = String(supplierName || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '+')
    .replace(/[^a-z0-9+_-]/g, '');

  const today = getTodayLocalDateString().split('-').reverse().join('.');
  const extensionMatch = String(originalFileName || '').match(/\.[^.]+$/);
  const extension = extensionMatch ? extensionMatch[0].toLowerCase() : '.jpg';
  return `${normalizedSupplierName || 'registro-servicos'}+${today}${extension}`;
}

function createRenamedLooseNoteReceiptFile(file, supplierName) {
  const renamedFileName = buildLooseNoteReceiptFileName(supplierName, file.name || '');
  return new File([file], renamedFileName, {
    type: file.type || 'image/jpeg',
    lastModified: file.lastModified || Date.now()
  });
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      image.src = '';
      reject(new Error('N\u00e3o foi poss\u00edvel ler a imagem selecionada.'));
    };

    image.src = objectUrl;
  });
}

async function createReceiptDrawable(file) {
  if ('createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(file, {
        resizeWidth: COMPRESSED_RECEIPT_MAX_SIZE,
        resizeQuality: 'high',
        imageOrientation: 'from-image'
      });
      return {
        drawable: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close()
      };
    } catch (error) {
      console.warn('Redimensionamento eficiente indispon\u00edvel; usando modo compat\u00edvel.', error);
    }
  }

  const image = await loadImageFromFile(file);
  return {
    drawable: image,
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height,
    release: () => {
      image.src = '';
    }
  };
}

async function compressFuelReceiptIfNeeded(file) {
  if (!file || !String(file.type || '').startsWith('image/')) {
    throw new Error('Selecione uma imagem v\u00e1lida do comprovante.');
  }

  if (optimizedReceiptFiles.has(file)) {
    return file;
  }

  if (file.size > MAX_RECEIPT_SOURCE_BYTES) {
    throw new Error('A foto ultrapassa 10 MB. Tire outra foto ou escolha uma imagem menor.');
  }

  const source = await createReceiptDrawable(file);
  const scale = Math.min(1, COMPRESSED_RECEIPT_MAX_SIZE / Math.max(source.width, source.height));
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { alpha: false });

  if (!context) {
    source.release();
    throw new Error('Este celular n\u00e3o conseguiu preparar a foto. Feche outros aplicativos e tente novamente.');
  }

  canvas.width = width;
  canvas.height = height;
  try {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(source.drawable, 0, 0, width, height);
  } finally {
    source.release();
  }

  try {
    const compressedBlob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('N\u00e3o foi poss\u00edvel otimizar a imagem.'))),
        'image/jpeg',
        COMPRESSED_RECEIPT_QUALITY
      );
    });

    const compressedName = (file.name || 'comprovante.jpg').replace(/\.[^.]+$/, '.jpg');
    const optimizedFile = new File([compressedBlob], compressedName, {
      type: 'image/jpeg',
      lastModified: Date.now()
    });
    optimizedReceiptFiles.add(optimizedFile);
    return optimizedFile;
  } finally {
    context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 1;
    canvas.height = 1;
  }
}

function releaseReceiptPreviewUrl(target) {
  if (target === 'loose') {
    if (loosePreviewObjectUrl) {
      URL.revokeObjectURL(loosePreviewObjectUrl);
      loosePreviewObjectUrl = '';
    }
    return;
  }

  if (fuelPreviewObjectUrl) {
    URL.revokeObjectURL(fuelPreviewObjectUrl);
    fuelPreviewObjectUrl = '';
  }
}

function setReceiptPreviewUrl(target, file) {
  releaseReceiptPreviewUrl(target);
  const objectUrl = URL.createObjectURL(file);

  if (target === 'loose') {
    loosePreviewObjectUrl = objectUrl;
    return objectUrl;
  }

  fuelPreviewObjectUrl = objectUrl;
  return objectUrl;
}

function resetFuelPhotoState() {
  fuelReceiptSelectionId += 1;
  releaseReceiptPreviewUrl('fuel');
  const cameraInput = document.getElementById('fuel-photo-camera');
  const uploadInput = document.getElementById('fuel-photo-upload');
  if (cameraInput) cameraInput.value = '';
  if (uploadInput) uploadInput.value = '';
  document.getElementById('photo-preview-container').classList.add('hidden');
  document.getElementById('photo-buttons').classList.remove('hidden');
  document.getElementById('photo-preview').src = '';
  selectedFuelReceiptFile = null;
  uploadedFuelReceipt = null;
  fuelReceiptUploadPromise = null;
  updateReceiptUploadStatus('Salve o comprovante para deixar o envio pelo WhatsApp mais r\u00e1pido.');
  setFuelActionButtonsVisible(false);
  setSaveReceiptButtonVisible(true);
}

function resetLoosePhotoState() {
  looseReceiptSelectionId += 1;
  releaseReceiptPreviewUrl('loose');
  const cameraInput = document.getElementById('loose-photo-camera');
  const uploadInput = document.getElementById('loose-photo-upload');
  if (cameraInput) cameraInput.value = '';
  if (uploadInput) uploadInput.value = '';
  document.getElementById('loose-photo-preview-container')?.classList.add('hidden');
  document.getElementById('loose-photo-buttons')?.classList.remove('hidden');
  const preview = document.getElementById('loose-photo-preview');
  if (preview) {
    preview.src = '';
  }
  selectedLooseNoteReceiptFile = null;
  uploadedLooseNoteReceipt = null;
  looseNoteReceiptUploadPromise = null;
  updateLooseReceiptUploadStatus('Salve o comprovante para liberar o envio pelo WhatsApp.');
  setLooseActionButtonsVisible(false);
  setSaveLooseReceiptButtonVisible(true);
}

function toggleCustomDriverField() {
  const driverSelect = document.getElementById('driver-name');
  const customContainer = document.getElementById('custom-driver-container');
  const customInput = document.getElementById('custom-driver-name');
  const shouldShowCustomInput = driverSelect?.value === OTHER_DRIVER_OPTION;

  if (!customContainer || !customInput) {
    return;
  }

  customContainer.classList.toggle('hidden', !shouldShowCustomInput);
  customInput.required = shouldShowCustomInput;
  if (!shouldShowCustomInput) {
    customInput.value = '';
  }
}

function toggleLooseCustomDriverField() {
  const driverSelect = document.getElementById('loose-driver-name');
  const customContainer = document.getElementById('loose-custom-driver-container');
  const customInput = document.getElementById('loose-custom-driver-name');
  const shouldShowCustomInput = driverSelect?.value === OTHER_DRIVER_OPTION;

  if (!customContainer || !customInput) {
    return;
  }

  customContainer.classList.toggle('hidden', !shouldShowCustomInput);
  customInput.required = shouldShowCustomInput;
  if (!shouldShowCustomInput) {
    customInput.value = '';
  }
}

function getSelectedDriverName() {
  const driverSelect = document.getElementById('driver-name');
  const customInput = document.getElementById('custom-driver-name');

  if (driverSelect?.value === OTHER_DRIVER_OPTION) {
    return customInput?.value.trim() || '';
  }

  return driverSelect?.value.trim() || '';
}

function getSelectedLooseDriverName() {
  const driverSelect = document.getElementById('loose-driver-name');
  const customInput = document.getElementById('loose-custom-driver-name');

  if (driverSelect?.value === OTHER_DRIVER_OPTION) {
    return customInput?.value.trim() || '';
  }

  return driverSelect?.value.trim() || '';
}

function markFuelReceiptUploadDirty() {
  if (!selectedFuelReceiptFile) {
    return;
  }

  uploadedFuelReceipt = null;
  fuelReceiptUploadPromise = null;
  setSaveReceiptButtonVisible(true);
  setFuelActionButtonsVisible(false);
  updateReceiptUploadStatus('Dados alterados. Salve o comprovante novamente antes de enviar.', 'neutral');
}

function markLooseReceiptUploadDirty() {
  if (!selectedLooseNoteReceiptFile) {
    return;
  }

  uploadedLooseNoteReceipt = null;
  looseNoteReceiptUploadPromise = null;
  setSaveLooseReceiptButtonVisible(true);
  setLooseActionButtonsVisible(false);
  updateLooseReceiptUploadStatus('Dados alterados. Salve o comprovante novamente antes de enviar.', 'neutral');
}

function applyFuelFormMode(mode = 'rapido') {
  currentFuelFormMode = mode === 'completo' ? 'completo' : 'rapido';

  const isComplete = currentFuelFormMode === 'completo';
  const header = document.getElementById('fuel-form-header');
  const title = document.getElementById('fuel-form-title');
  const subtitle = document.getElementById('fuel-form-subtitle');
  const completeFields = document.getElementById('fuel-complete-fields');
  const valueInput = document.getElementById('fuel-value');
  const litersInput = document.getElementById('fuel-liters');
  const fuelTypeInput = document.getElementById('fuel-type');

  header?.classList.toggle('from-red-500', !isComplete);
  header?.classList.toggle('to-red-600', !isComplete);
  header?.classList.toggle('from-amber-500', isComplete);
  header?.classList.toggle('to-orange-600', isComplete);
  header?.classList.toggle('is-complete', isComplete);
  if (title) {
    title.textContent = isComplete ? 'Registro Completo' : 'Registro R\u00e1pido';
  }
  if (subtitle) {
    subtitle.textContent = isComplete
      ? 'Preencha todos os dados do abastecimento.'
      : 'Preenchimento resumido para mais agilidade no seu dia a dia.';
  }

  completeFields?.classList.toggle('hidden', !isComplete);
  [valueInput, litersInput, fuelTypeInput].forEach((input) => {
    if (input) {
      input.required = isComplete;
      if (!isComplete) {
        input.value = '';
      }
    }
  });
}

function prepareFuelForm(options = {}) {
  const { cidade = '', posto = '', useLastEntry = false, mode = 'rapido' } = options;
  const citySelect = document.getElementById('fuel-city');
  const stationSelect = document.getElementById('fuel-station');
  const lastFuelEntry = useLastEntry ? getLastFuelEntry() : null;
  const selectedCity = cidade || lastFuelEntry?.cidade || '';
  const selectedPosto = posto || lastFuelEntry?.posto || '';

  document.getElementById('fuel-form').reset();
  applyFuelFormMode(mode);
  citySelect.value = selectedCity;
  populateDriverOptions();
  toggleCustomDriverField();

  if (selectedCity && postosPorCidade[selectedCity]) {
    stationSelect.innerHTML = '<option value="">Selecione um posto</option>';
    postosPorCidade[selectedCity].forEach((postoItem) => {
      const option = document.createElement('option');
      option.value = postoItem.nome;
      option.textContent = postoItem.nome;
      stationSelect.appendChild(option);
    });
    stationSelect.value = selectedPosto;
  } else {
    stationSelect.innerHTML = '<option value="">Selecione uma cidade primeiro</option>';
  }

  setFuelDateToToday();
  resetFuelPhotoState();
}

function openFuelFormMenu(mode = 'rapido') {
  if (!isStoredDriverProfileComplete()) {
    showErrorMessage('Para enviar um registro, vincule seu perfil e veículo.');
    openDriverProfile('edit');
    return;
  }
  closeOpenFormsSilently();
  setMobileNavActive(mode === 'completo' ? 'complete' : 'fast');
  document.getElementById('fuel-form-modal').classList.remove('hidden');
  prepareFuelForm({ useLastEntry: true, mode });
}

function closeFuelForm() {
  document.getElementById('fuel-form-modal').classList.add('hidden');
  closeReceiptValidationModal();
  document.getElementById('fuel-form').reset();
  resetFuelPhotoState();
  setFuelDateToToday();
  applyFuelFormMode('rapido');
  populateDriverOptions();
  restoreMobileNavForCurrentView();
}

function setLooseDateToToday() {
  const dateInput = document.getElementById('loose-date');
  if (dateInput) {
    dateInput.value = getTodayLocalDateString();
  }
}

function prepareLooseNoteForm() {
  const form = document.getElementById('loose-note-form');
  if (form) {
    form.reset();
  }
  populateDriverOptions();
  setLooseDateToToday();
  resetLoosePhotoState();
  toggleLooseCustomDriverField();
}

function openLooseNoteForm() {
  if (!isStoredDriverProfileComplete()) {
    showErrorMessage('Para enviar um registro, vincule seu perfil e veículo.');
    openDriverProfile('edit');
    return;
  }
  closeOpenFormsSilently();
  setMobileNavActive('services');
  document.getElementById('loose-note-modal')?.classList.remove('hidden');
  prepareLooseNoteForm();
}

async function copyCentralLink() {
  const link = 'https://gaveblue.com.br/postoscredenciados-covreecia/';

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(link);
    } else {
      const input = document.createElement('input');
      input.value = link;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    showSuccessMessage('Link copiado com sucesso.');
  } catch (error) {
    console.error('Erro ao copiar link:', error);
    showSuccessMessage('N\u00e3o foi poss\u00edvel copiar o link. Tente novamente.');
  }
}

async function shareCentralLink() {
  const shareData = {
    title: 'Central de Registros',
    text: 'Acesse a Central de Registros:',
    url: 'https://gaveblue.com.br/postoscredenciados-covreecia/'
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      if (error?.name === 'AbortError') {
        return;
      }
      console.error('Erro ao compartilhar link:', error);
    }
  }

  await copyCentralLink();
}

function closeLooseNoteForm() {
  document.getElementById('loose-note-modal')?.classList.add('hidden');
  document.getElementById('loose-note-form')?.reset();
  resetLoosePhotoState();
  setLooseDateToToday();
  populateDriverOptions();
  restoreMobileNavForCurrentView();
}

function openWhatsAppDirect(numero, mensagem) {
  const webUrl = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

  try {
    const link = document.createElement('a');
    link.href = webUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
    return true;
  } catch (error) {
    showWhatsAppFallbackLink(webUrl);
    return false;
  }
}

function showWhatsAppFallbackLink(url) {
  const existingToast = document.getElementById('whatsapp-fallback-toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.id = 'whatsapp-fallback-toast';
  toast.className = 'fixed inset-x-4 bottom-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 bg-white border border-emerald-200 text-gray-900 px-4 py-4 rounded-2xl shadow-2xl z-[80] animate-fade-in max-w-md mx-auto';
  toast.innerHTML = `
    <p class="text-sm font-bold text-gray-900">O navegador bloqueou a abertura autom\u00e1tica.</p>
    <p class="text-xs text-gray-600 mt-1">Clique no bot\u00e3o abaixo para abrir o WhatsApp em nova aba e validar o comprovante.</p>
    <div class="mt-3 flex gap-2">
      <button type="button" class="flex-1 px-3 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm" data-close-whatsapp-fallback>Fechar</button>
      <a href="${url}" target="_blank" rel="noopener noreferrer" class="flex-1 px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm text-center">Abrir WhatsApp</a>
    </div>
  `;

  toast.querySelector('[data-close-whatsapp-fallback]')?.addEventListener('click', () => {
    toast.remove();
  });

  document.body.appendChild(toast);
}

function parseKmValue(kmValue) {
  const numericValue = String(kmValue || '').replace(/\D/g, '');
  return numericValue ? Number(numericValue) : 0;
}

function formatKmValue(kmValue) {
  return Number(kmValue || 0).toLocaleString('pt-BR');
}

function getRevisionWarningMessage(kmValue) {
  const km = parseKmValue(kmValue);
  if (!km) {
    return '';
  }

  const nextRevisionKm = Math.ceil(km / 10000) * 10000;
  const remainingKm = nextRevisionKm - km;

  if (remainingKm < 0 || remainingKm > 2000) {
    return '';
  }

  if (remainingKm === 0) {
    return `\`\u26a0\ufe0f Ve\u00edculo atingiu a quilometragem de revis\u00e3o (${formatKmValue(nextRevisionKm)} km).\``;
  }

  return `\`\u26a0\ufe0f Ve\u00edculo pr\u00f3ximo de realizar a revis\u00e3o. Faltam ${formatKmValue(remainingKm)} km para ${formatKmValue(nextRevisionKm)} km.\``;
}

function getFuelFormData() {
  const data = document.getElementById('fuel-date').value;
  const dateObj = data ? new Date(`${data}T00:00:00`) : null;
  const now = new Date();

  return {
    motorista: getSelectedDriverName(),
    cidade: document.getElementById('fuel-city').value,
    posto: document.getElementById('fuel-station').value,
    data,
    dataFormatada: dateObj ? dateObj.toLocaleDateString('pt-BR') : '',
    horaFormatada: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    km: document.getElementById('fuel-km').value.trim(),
    valor: document.getElementById('fuel-value')?.value.trim() || '',
    litros: document.getElementById('fuel-liters')?.value.trim() || '',
    tipoCombustivel: document.getElementById('fuel-type')?.value || '',
    file: selectedFuelReceiptFile
  };
}

function getFuelReceiptUploadKey(formData) {
  const file = formData.file;
  if (!file) {
    return '';
  }

  return [
    file.name,
    file.size,
    file.lastModified,
    formData.motorista,
    formData.cidade,
    formData.posto,
    formData.data,
    formData.km,
    formData.valor,
    formData.litros,
    formData.tipoCombustivel,
    currentFuelFormMode
  ].join('|');
}

function getLooseNoteFormData() {
  const data = document.getElementById('loose-date')?.value || '';
  const dateObj = data ? new Date(`${data}T00:00:00`) : null;
  const now = new Date();

  return {
    motorista: getSelectedLooseDriverName(),
    fornecedor: document.getElementById('loose-supplier')?.value.trim() || '',
    tipoServico: document.getElementById('loose-service-type')?.value || '',
    valor: document.getElementById('loose-value')?.value.trim() || '',
    data,
    dataFormatada: dateObj ? dateObj.toLocaleDateString('pt-BR') : '',
    horaFormatada: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    km: document.getElementById('loose-km')?.value.trim() || '',
    observacoes: document.getElementById('loose-notes')?.value.trim() || '',
    file: selectedLooseNoteReceiptFile
  };
}

function getLooseNoteReceiptUploadKey(formData) {
  const file = formData.file;
  if (!file) {
    return '';
  }

  return [
    file.name,
    file.size,
    file.lastModified,
    formData.motorista,
    formData.fornecedor,
    formData.tipoServico,
    formData.valor,
    formData.data,
    formData.km,
    formData.observacoes
  ].join('|');
}

function createCentralProtocol() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timePart = now.toTimeString().slice(0, 8).replace(/:/g, '');
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CR-${datePart}-${timePart}-${randomPart}`;
}

function createCentralRowId(protocol) {
  return String(protocol || createCentralProtocol())
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .slice(0, 36);
}

function parseCentralMoney(value) {
  const rawValue = String(value || '').trim();
  if (!rawValue) return null;

  const normalized = rawValue
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function parseCentralDecimal(value) {
  const rawValue = String(value || '').trim();
  if (!rawValue) return null;

  const sanitized = rawValue.replace(/[^\d,.-]/g, '');
  if (!sanitized) return null;

  const hasComma = sanitized.includes(',');
  const hasDot = sanitized.includes('.');

  let normalized = sanitized;
  if (hasComma && hasDot) {
    const lastComma = sanitized.lastIndexOf(',');
    const lastDot = sanitized.lastIndexOf('.');
    const decimalSeparator = lastComma > lastDot ? ',' : '.';
    const thousandsSeparator = decimalSeparator === ',' ? '.' : ',';
    normalized = sanitized
      .replace(new RegExp(`\\${thousandsSeparator}`, 'g'), '')
      .replace(decimalSeparator, '.');
  } else {
    normalized = sanitized.replace(',', '.');
  }

  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function cleanCentralPayload(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
}

function buildCentralRegistroPayload({ type, formData, receiptUrl, mensagem }) {
  const protocol = createCentralProtocol();
  const now = new Date();
  const basePayload = {
    workspaceId: CENTRAL_APPWRITE_WORKSPACE_ID,
    tipo: type,
    status: 'pendente',
    protocolo: protocol,
    motorista: formData.motorista,
    data: formData.data,
    hora: formData.horaFormatada,
    km: parseKmValue(formData.km) || undefined,
    comprovanteUrl: receiptUrl,
    mensagemWhatsapp: mensagem,
    origem: CENTRAL_APPWRITE_ORIGIN,
    deviceId: getCentralDeviceId(),
    pushSubscriptionId: getCentralPushSubscriptionId() || undefined,
    criadoEm: now.toISOString()
  };

  if (type === 'servico') {
    return {
      rowId: createCentralRowId(protocol),
      data: cleanCentralPayload({
        ...basePayload,
        fornecedor: formData.fornecedor,
        tipoServico: formData.tipoServico,
        valor: formData.valor,
        valorNumero: parseCentralMoney(formData.valor) ?? undefined,
        observacoes: formData.observacoes
      })
    };
  }

  const isCompleteFuel = type === 'abastecimento';
  return {
    rowId: createCentralRowId(protocol),
    data: cleanCentralPayload({
      ...basePayload,
      cidade: formData.cidade,
      posto: formData.posto,
      valor: isCompleteFuel ? formData.valor : undefined,
      valorNumero: isCompleteFuel ? (parseCentralMoney(formData.valor) ?? undefined) : undefined,
      litros: isCompleteFuel ? formData.litros : undefined,
      litrosNumero: isCompleteFuel ? (parseCentralDecimal(formData.litros) ?? undefined) : undefined,
      tipoCombustivel: isCompleteFuel ? formData.tipoCombustivel : undefined
    })
  };
}

async function saveCentralRegistroToAppwrite(payload) {
  if (!CENTRAL_APPWRITE_ENABLED) {
    return { ok: false, skipped: true };
  }

  const url = `${CENTRAL_APPWRITE_ENDPOINT}/tablesdb/${encodeURIComponent(CENTRAL_APPWRITE_DATABASE_ID)}/tables/${encodeURIComponent(CENTRAL_APPWRITE_TABLE_ID)}/rows`;
  const response = await fetchCentralWithRetry(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': CENTRAL_APPWRITE_PROJECT_ID,
      'X-Appwrite-Response-Format': '1.8.0'
    },
    body: JSON.stringify({
      rowId: payload.rowId,
      data: payload.data
    })
  }, { attempts: 3, timeoutMs: 10000 });

  if (response.status === 409) {
    return { alreadyExists: true };
  }

  if (!response.ok) {
    let message = `Erro ${response.status}`;
    try {
      const errorPayload = await response.json();
      message = errorPayload?.message || message;
    } catch (error) {
      message = await response.text().catch(() => message);
    }
    throw new Error(message);
  }

  return response.json();
}

async function saveCentralRetryPayload(payload) {
  try {
    const stored = JSON.parse(localStorage.getItem(CENTRAL_APPWRITE_RETRY_KEY) || '[]');
    const queue = Array.isArray(stored) ? stored : (stored && typeof stored === 'object' ? [stored] : []);
    const nextQueue = queue.filter((item) => String(item?.rowId || '') !== String(payload?.rowId || ''));
    nextQueue.push(payload);
    localStorage.setItem(CENTRAL_APPWRITE_RETRY_KEY, JSON.stringify(nextQueue.slice(-20)));
    await persistCentralDeviceState();
    return true;
  } catch (error) {
    console.warn('Não foi possível guardar o registro pendente para nova tentativa.', error);
    return false;
  }
}

function getCentralRetryPayloads() {
  try {
    const stored = JSON.parse(localStorage.getItem(CENTRAL_APPWRITE_RETRY_KEY) || '[]');
    return Array.isArray(stored) ? stored : (stored && typeof stored === 'object' ? [stored] : []);
  } catch (error) {
    return [];
  }
}

async function clearCentralRetryPayload(rowId = '') {
  try {
    if (!rowId) {
      localStorage.removeItem(CENTRAL_APPWRITE_RETRY_KEY);
      await persistCentralDeviceState();
      return true;
    }
    const nextQueue = getCentralRetryPayloads().filter((item) => String(item?.rowId || '') !== String(rowId));
    if (nextQueue.length) localStorage.setItem(CENTRAL_APPWRITE_RETRY_KEY, JSON.stringify(nextQueue));
    else localStorage.removeItem(CENTRAL_APPWRITE_RETRY_KEY);
    await persistCentralDeviceState();
    return true;
  } catch (error) {
    console.warn('Não foi possível limpar o registro pendente da Central.', error);
    return false;
  }
}

async function saveCentralRegistroWithRetry(payload) {
  const queued = await saveCentralRetryPayload(payload);
  if (!queued) throw new Error('Não foi possível guardar este registro no aparelho antes do envio.');
  const result = await saveCentralRegistroToAppwrite(payload);
  await clearCentralRetryPayload(payload.rowId);
  return result;
}

async function retryPendingCentralRegistro() {
  if (centralRetryInProgress || !navigator.onLine) return;
  const queue = getCentralRetryPayloads();
  if (!queue.length) return;
  centralRetryInProgress = true;
  try {
    for (const payload of queue) {
      try {
        await saveCentralRegistroToAppwrite(payload);
        await clearCentralRetryPayload(payload.rowId);
        console.info('Registro pendente da Central foi salvo no Appwrite.');
      } catch (error) {
        console.warn('Ainda não foi possível reenviar um registro pendente da Central.', error);
      }
    }
  } finally {
    centralRetryInProgress = false;
  }
}

function getCentralAppwriteErrorMessage(error) {
  if (error?.isNetworkError || /failed to fetch|network|sem conexão/i.test(String(error?.message || ''))) {
    return 'A conexão oscilou. O registro ficou salvo neste aparelho e será enviado automaticamente quando a Central reconectar.';
  }
  const message = String(error?.message || 'Erro desconhecido ao gravar na Central.');
  return `O comprovante foi enviado, mas a Central ainda não confirmou o registro: ${message}`;
}

function updateReceiptUploadStatus(message, tone = 'neutral') {
  const statusEl = document.getElementById('receipt-upload-status');
  if (!statusEl) {
    return;
  }

  const toneClasses = {
    neutral: 'text-gray-500',
    progress: 'text-blue-600',
    success: 'text-emerald-700',
    error: 'text-red-600'
  };

  statusEl.classList.remove('text-gray-500', 'text-blue-600', 'text-emerald-700', 'text-red-600');
  statusEl.classList.add(toneClasses[tone] || toneClasses.neutral);
  statusEl.textContent = message;
}

function updateLooseReceiptUploadStatus(message, tone = 'neutral') {
  const statusEl = document.getElementById('loose-receipt-upload-status');
  if (!statusEl) {
    return;
  }

  const toneClasses = {
    neutral: 'text-gray-500',
    progress: 'text-blue-600',
    success: 'text-emerald-700',
    error: 'text-red-600'
  };

  statusEl.classList.remove('text-gray-500', 'text-blue-600', 'text-emerald-700', 'text-red-600');
  statusEl.classList.add(toneClasses[tone] || toneClasses.neutral);
  statusEl.textContent = message;
}

function setSaveReceiptButtonLoading(isLoading) {
  const button = document.getElementById('save-receipt-btn');
  if (!button) {
    return;
  }

  button.disabled = isLoading;
  button.classList.toggle('opacity-70', isLoading);
  button.classList.toggle('cursor-wait', isLoading);
  button.textContent = isLoading ? 'Salvando comprovante...' : 'Salvar comprovante';
}

function setSaveLooseReceiptButtonLoading(isLoading) {
  const button = document.getElementById('save-loose-receipt-btn');
  if (!button) {
    return;
  }

  button.disabled = isLoading;
  button.classList.toggle('opacity-70', isLoading);
  button.classList.toggle('cursor-wait', isLoading);
  button.textContent = isLoading ? 'Salvando comprovante...' : 'Salvar comprovante';
}

function setSaveReceiptButtonVisible(isVisible) {
  const button = document.getElementById('save-receipt-btn');
  if (button) {
    button.classList.toggle('hidden', !isVisible);
  }
}

function setSaveLooseReceiptButtonVisible(isVisible) {
  const button = document.getElementById('save-loose-receipt-btn');
  if (button) {
    button.classList.toggle('hidden', !isVisible);
  }
}

function setFuelActionButtonsVisible(isVisible) {
  const actions = document.getElementById('fuel-action-buttons');
  if (actions) {
    actions.classList.toggle('hidden', !isVisible);
  }
}

function setLooseActionButtonsVisible(isVisible) {
  const actions = document.getElementById('loose-action-buttons');
  if (actions) {
    actions.classList.toggle('hidden', !isVisible);
  }
}

function openReceiptValidationModal(type = 'fuel') {
  receiptValidationType = type === 'loose' ? 'loose' : 'fuel';
  const formModal = document.getElementById(receiptValidationType === 'loose' ? 'loose-note-modal' : 'fuel-form-modal');
  const validationModal = document.getElementById('receipt-validation-modal');
  if (formModal) {
    formModal.classList.add('hidden');
  }
  if (validationModal) {
    validationModal.classList.remove('hidden');
  }
}

function closeReceiptValidationModal() {
  const validationModal = document.getElementById('receipt-validation-modal');
  if (validationModal) {
    validationModal.classList.add('hidden');
  }
}

function cancelReceiptValidationModal() {
  closeReceiptValidationModal();
  const formModal = document.getElementById(receiptValidationType === 'loose' ? 'loose-note-modal' : 'fuel-form-modal');
  if (formModal) {
    formModal.classList.remove('hidden');
  }
}

function confirmReceiptValidationModal() {
  closeReceiptValidationModal();
  const form = document.getElementById(receiptValidationType === 'loose' ? 'loose-note-form' : 'fuel-form');
  if (form?.requestSubmit) {
    form.requestSubmit();
  } else {
    form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  }
}

function validateFuelReceiptUploadFields(formData) {
  const isComplete = currentFuelFormMode === 'completo';
  if (!formData.motorista || !formData.cidade || !formData.posto || !formData.data) {
    showErrorMessage('Preencha motorista, cidade, posto e data antes de salvar o comprovante.');
    return false;
  }

  if (isComplete && (!formData.valor || !formData.litros || !formData.tipoCombustivel)) {
    showErrorMessage('Preencha valor, litros e combust\u00edvel antes de salvar o comprovante completo.');
    return false;
  }

  if (!formData.file) {
    showErrorMessage('Selecione uma foto do comprovante primeiro.');
    return false;
  }

  return true;
}

function validateLooseNoteReceiptUploadFields(formData) {
  if (!formData.motorista || !formData.fornecedor || !formData.tipoServico || !formData.valor || !formData.data) {
    showErrorMessage('Preencha motorista, fornecedor, tipo do servi\u00e7o, valor e data antes de salvar o comprovante.');
    return false;
  }

  if (!formData.file) {
    showErrorMessage('Selecione uma foto do comprovante primeiro.');
    return false;
  }

  return true;
}

async function saveLooseNoteReceiptUpload(options = {}) {
  const { silent = false } = options;
  const formData = getLooseNoteFormData();

  if (!validateLooseNoteReceiptUploadFields(formData)) {
    return null;
  }

  const uploadKey = getLooseNoteReceiptUploadKey(formData);
  if (uploadedLooseNoteReceipt && uploadedLooseNoteReceipt.key === uploadKey) {
    if (!silent) {
      openReceiptValidationModal('loose');
    }
    return uploadedLooseNoteReceipt.result;
  }

  if (looseNoteReceiptUploadPromise) {
    return looseNoteReceiptUploadPromise;
  }

  setSaveLooseReceiptButtonLoading(true);
  updateLooseReceiptUploadStatus('Comprimindo e salvando comprovante na nuvem...', 'progress');
  let preparedOfflineFile = null;

  looseNoteReceiptUploadPromise = (async () => {
    const compressedFile = await compressFuelReceiptIfNeeded(formData.file);
    const renamedFile = createRenamedLooseNoteReceiptFile(compressedFile, formData.fornecedor);
    preparedOfflineFile = renamedFile;
    if (!navigator.onLine) {
      const result = { offline: true, secure_url: '' };
      uploadedLooseNoteReceipt = { key: uploadKey, result, offlineFile: renamedFile };
      updateLooseReceiptUploadStatus('Comprovante guardado neste aparelho. Será enviado quando a conexão voltar.', 'success');
      setSaveLooseReceiptButtonVisible(false);
      setLooseActionButtonsVisible(true);
      if (!silent) openReceiptValidationModal('loose');
      return result;
    }
    const result = await uploadLooseNoteReceiptToCloudinary(renamedFile, {
      motorista: formData.motorista,
      fornecedor: formData.fornecedor,
      tipoServico: formData.tipoServico,
      valor: formData.valor,
      data: formData.dataFormatada,
      km: formData.km
    });

    uploadedLooseNoteReceipt = {
      key: uploadKey,
      result
    };
    updateLooseReceiptUploadStatus('Comprovante salvo. Agora envie pelo WhatsApp para validar.', 'success');
    setSaveLooseReceiptButtonVisible(false);
    setLooseActionButtonsVisible(true);
    if (!silent) {
      openReceiptValidationModal('loose');
    }

    return result;
  })();

  try {
    return await looseNoteReceiptUploadPromise;
  } catch (error) {
    if (preparedOfflineFile && (!navigator.onLine || error instanceof TypeError)) {
      const result = { offline: true, secure_url: '' };
      uploadedLooseNoteReceipt = { key: uploadKey, result, offlineFile: preparedOfflineFile };
      updateLooseReceiptUploadStatus('A conexão caiu, mas o comprovante ficou guardado neste aparelho.', 'success');
      setSaveLooseReceiptButtonVisible(false);
      setLooseActionButtonsVisible(true);
      if (!silent) openReceiptValidationModal('loose');
      return result;
    }
    uploadedLooseNoteReceipt = null;
    updateLooseReceiptUploadStatus('N\u00e3o foi poss\u00edvel salvar. Tente novamente antes de enviar.', 'error');
    if (!silent) {
      showErrorMessage('Erro ao salvar comprovante. Tente novamente.');
      return null;
    }
    throw error;
  } finally {
    looseNoteReceiptUploadPromise = null;
    setSaveLooseReceiptButtonLoading(false);
  }
}

async function saveFuelReceiptUpload(options = {}) {
  const { silent = false } = options;
  const formData = getFuelFormData();

  if (!validateFuelReceiptUploadFields(formData)) {
    return null;
  }

  const uploadKey = getFuelReceiptUploadKey(formData);
  if (uploadedFuelReceipt && uploadedFuelReceipt.key === uploadKey) {
    if (!silent) {
      openReceiptValidationModal();
    }
    return uploadedFuelReceipt.result;
  }

  if (fuelReceiptUploadPromise) {
    return fuelReceiptUploadPromise;
  }

  setSaveReceiptButtonLoading(true);
  updateReceiptUploadStatus('Comprimindo e salvando comprovante na nuvem...', 'progress');
  let preparedOfflineFile = null;

  fuelReceiptUploadPromise = (async () => {
    const compressedFile = await compressFuelReceiptIfNeeded(formData.file);
    const renamedFile = createRenamedFuelReceiptFile(compressedFile, formData.motorista, formData.data);
    preparedOfflineFile = renamedFile;
    if (!navigator.onLine) {
      const result = { offline: true, secure_url: '' };
      uploadedFuelReceipt = { key: uploadKey, result, offlineFile: renamedFile };
      updateReceiptUploadStatus('Comprovante guardado neste aparelho. Será enviado quando a conexão voltar.', 'success');
      setSaveReceiptButtonVisible(false);
      setFuelActionButtonsVisible(true);
      if (!silent) openReceiptValidationModal();
      return result;
    }
    const result = await uploadFuelReceiptToCloudinary(renamedFile, {
      motorista: formData.motorista,
      cidade: formData.cidade,
      posto: formData.posto,
      data: formData.dataFormatada,
      km: formData.km,
      valor: formData.valor,
      litros: formData.litros,
      tipoCombustivel: formData.tipoCombustivel,
      modo: currentFuelFormMode
    });

    uploadedFuelReceipt = {
      key: uploadKey,
      result
    };
    updateReceiptUploadStatus('Comprovante salvo. O envio final pelo WhatsApp \u00e9 obrigat\u00f3rio para validar.', 'success');
    setSaveReceiptButtonVisible(false);
    setFuelActionButtonsVisible(true);
    if (!silent) {
      openReceiptValidationModal();
    }

    return result;
  })();

  try {
    return await fuelReceiptUploadPromise;
  } catch (error) {
    if (preparedOfflineFile && (!navigator.onLine || error instanceof TypeError)) {
      const result = { offline: true, secure_url: '' };
      uploadedFuelReceipt = { key: uploadKey, result, offlineFile: preparedOfflineFile };
      updateReceiptUploadStatus('A conexão caiu, mas o comprovante ficou guardado neste aparelho.', 'success');
      setSaveReceiptButtonVisible(false);
      setFuelActionButtonsVisible(true);
      if (!silent) openReceiptValidationModal();
      return result;
    }
    uploadedFuelReceipt = null;
    updateReceiptUploadStatus('N\u00e3o foi poss\u00edvel salvar. Tente novamente antes de enviar.', 'error');
    if (!silent) {
      showErrorMessage('Erro ao salvar comprovante. Tente novamente.');
      return null;
    }
    throw error;
  } finally {
    fuelReceiptUploadPromise = null;
    setSaveReceiptButtonLoading(false);
  }
}

function hideWhatsAppSendButton() {
  const button = document.getElementById('whatsapp-send-btn');
  const note = document.getElementById('whatsapp-required-note');
  if (!button) {
    return;
  }

  button.classList.add('hidden');
  button.onclick = null;
  if (note) {
    note.classList.add('hidden');
  }
}

function showWhatsAppSendButton() {
  const button = document.getElementById('whatsapp-send-btn');
  const note = document.getElementById('whatsapp-required-note');
  if (!button) {
    return;
  }

  button.classList.remove('hidden');
  button.onclick = handleWhatsAppSendClick;
  if (note) {
    note.classList.remove('hidden');
  }
}

function handleWhatsAppSendClick() {
  if (!pendingFuelWhatsAppPayload) {
    return;
  }

  openWhatsAppDirect(pendingFuelWhatsAppPayload.numero, pendingFuelWhatsAppPayload.mensagem);
  pendingFuelWhatsAppPayload = null;
  hideWhatsAppSendButton();
  document.getElementById('fuel-form').reset();
  document.getElementById('loading-modal').classList.add('hidden');
  resetProgressState();
  resetFuelPhotoState();
  setFuelDateToToday();
  populateDriverOptions();
  showSuccessMessage('WhatsApp aberto com a mensagem do comprovante.');
}

async function uploadFuelReceiptToCloudinary(file, metadata) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'comprovantes-frota');
  formData.append('filename_override', file.name.replace(/\.[^.]+$/, ''));
  formData.append(
    'context',
    `modo=${metadata.modo || 'rapido'}|motorista=${metadata.motorista}|cidade=${metadata.cidade}|posto=${metadata.posto}|data=${metadata.data}|km=${metadata.km || 'nao informado'}|valor=${metadata.valor || 'nao informado'}|litros=${metadata.litros || 'nao informado'}|combustivel=${metadata.tipoCombustivel || 'nao informado'}`
  );

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Falha ao enviar comprovante para o Cloudinary.');
  }

  return response.json();
}

async function uploadLooseNoteReceiptToCloudinary(file, metadata) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'comprovantes-frota/notinhas-avulsas');
  formData.append('filename_override', file.name.replace(/\.[^.]+$/, ''));
  formData.append(
    'context',
    `motorista=${metadata.motorista}|fornecedor=${metadata.fornecedor}|servico=${metadata.tipoServico}|valor=${metadata.valor}|data=${metadata.data}|km=${metadata.km || 'nao informado'}`
  );

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Falha ao enviar comprovante para o Cloudinary.');
  }

  return response.json();
}

function resetProgressState() {
  for (let i = 1; i <= 5; i += 1) {
    const iconEl = document.getElementById(`step-${i}-icon`);
    const circle = iconEl.querySelector('div');
    const spinner = document.getElementById(`step-${i}-spinner`);
    const checkmark = document.getElementById(`step-${i}-check`);

    circle.classList.remove('border-green-600', 'bg-green-50');
    circle.classList.add('border-gray-300');
    spinner.classList.add('hidden');
    checkmark.classList.add('hidden');
  }

  document.getElementById('progress-bar').style.width = '0%';
  hideWhatsAppSendButton();
}

function buildFuelWhatsAppMessage(formData, isComplete, receiptUrl) {
  const details = [
    `> *Motorista:* ${formData.motorista}`,
    `> *Cidade:* ${formData.cidade}`,
    `> *Posto:* ${formData.posto}`,
    `> *Data/Hora:* ${formData.dataFormatada} às ${formData.horaFormatada}`,
    isComplete ? `> *Valor:* ${formData.valor}` : '',
    isComplete ? `> *Litros:* ${formData.litros}` : '',
    isComplete ? `> *Combustível:* ${formData.tipoCombustivel}` : '',
    `> *KM:* ${formData.km || 'Não informado'}`
  ].filter(Boolean);
  const lines = ['⛽ *COMPROVANTE DE ABASTECIMENTO*', '', ...details, ''];
  const revisionWarning = getRevisionWarningMessage(formData.km);
  if (revisionWarning) lines.push(revisionWarning, '', '');
  lines.push(`🧾 *Comprovante:* ${receiptUrl}`);
  return lines.join('\n');
}

function buildLooseWhatsAppMessage(formData, receiptUrl) {
  const details = [
    `> *Motorista:* ${formData.motorista}`,
    `> *Fornecedor:* ${formData.fornecedor}`,
    `> *Tipo do serviço:* ${formData.tipoServico}`,
    `> *Valor:* ${formData.valor}`,
    `> *Data/Hora:* ${formData.dataFormatada} às ${formData.horaFormatada}`,
    formData.km ? `> *KM:* ${formData.km}` : '',
    formData.observacoes ? `> *Observações:* ${formData.observacoes}` : ''
  ].filter(Boolean);
  return ['🔧 *REGISTRO DE SERVIÇOS*', '', ...details, '', `🧾 *Comprovante:* ${receiptUrl}`].join('\n');
}

async function queueCentralOfflineSubmission({ kind, formData, receiptFile, payload, offlineRecord }) {
  if (!receiptFile) throw new Error('O comprovante não está disponível para salvar no aparelho.');
  const serializableFormData = { ...formData };
  delete serializableFormData.file;
  await saveCentralOfflineSubmission({
    id: payload.rowId,
    kind,
    formData: serializableFormData,
    receiptBlob: receiptFile,
    fileName: receiptFile.name || `comprovante-${payload.rowId}.jpg`,
    fileType: receiptFile.type || 'image/jpeg',
    lastModified: receiptFile.lastModified || Date.now(),
    payload,
    offlineRecord,
    createdAt: new Date().toISOString()
  });
  saveCentralLastSentRecord(offlineRecord);
  navigator.serviceWorker?.ready
    .then((registration) => registration.sync?.register?.('central-offline-submissions'))
    .catch(() => null);
  updateCentralConnectivityStatus();
}

async function processCentralOfflineSubmissions() {
  if (centralOfflineSyncInProgress || !navigator.onLine) return;
  centralOfflineSyncInProgress = true;
  updateCentralConnectivityStatus({ syncing: true });
  let synchronized = 0;
  try {
    const submissions = await getCentralOfflineSubmissions();
    for (const submission of submissions) {
      try {
        const formData = submission.formData || {};
        let receiptUrl = String(submission.receiptUrl || '');
        if (!receiptUrl) {
          const receiptFile = submission.receiptBlob instanceof File
            ? submission.receiptBlob
            : new File([submission.receiptBlob], submission.fileName, {
              type: submission.fileType || 'image/jpeg',
              lastModified: submission.lastModified || Date.now()
            });
          const upload = submission.kind === 'loose'
            ? await uploadLooseNoteReceiptToCloudinary(receiptFile, {
              motorista: formData.motorista,
              fornecedor: formData.fornecedor,
              tipoServico: formData.tipoServico,
              valor: formData.valor,
              data: formData.dataFormatada,
              km: formData.km
            })
            : await uploadFuelReceiptToCloudinary(receiptFile, {
              motorista: formData.motorista,
              cidade: formData.cidade,
              posto: formData.posto,
              data: formData.dataFormatada,
              km: formData.km,
              valor: formData.valor,
              litros: formData.litros,
              tipoCombustivel: formData.tipoCombustivel,
              modo: submission.payload?.data?.tipo === 'abastecimento' ? 'completo' : 'rapido'
            });
          receiptUrl = String(upload?.secure_url || '');
          if (!receiptUrl) throw new Error('O servidor não retornou o link do comprovante.');
          submission.receiptUrl = receiptUrl;
          await saveCentralOfflineSubmission(submission);
        }

        const isComplete = submission.payload?.data?.tipo === 'abastecimento';
        const mensagem = submission.kind === 'loose'
          ? buildLooseWhatsAppMessage(formData, receiptUrl)
          : buildFuelWhatsAppMessage(formData, isComplete, receiptUrl);
        submission.payload.data.comprovanteUrl = receiptUrl;
        submission.payload.data.mensagemWhatsapp = mensagem;
        await saveCentralRegistroWithRetry(submission.payload);
        await deleteCentralOfflineSubmission(submission.id);
        saveCentralLastSentRecord({ ...submission.offlineRecord, receiptUrl });
        synchronized += 1;
      } catch (error) {
        console.warn('O registro offline continuará guardado para a próxima tentativa.', error);
        if (!navigator.onLine) break;
      }
    }
  } catch (error) {
    console.warn('Não foi possível consultar os registros offline.', error);
  } finally {
    centralOfflineSyncInProgress = false;
    if (navigator.onLine) {
      if (synchronized && document.visibilityState === 'visible') {
        showSuccessMessage(`${synchronized} registro(s) offline sincronizado(s).`);
      }
      window.setTimeout(() => updateCentralConnectivityStatus(), 2200);
    } else {
      updateCentralConnectivityStatus();
    }
  }
}

async function submitFuelForm(e) {
  e.preventDefault();

  const profile = await requireAuthorizedDriverProfile();
  if (!profile) return;

  const formData = getFuelFormData();
  if (normalizeDirectoryValue(formData.motorista) !== normalizeDirectoryValue(profile.name)) {
    showErrorMessage(DRIVER_PROFILE_PERMISSION_ERROR);
    return;
  }
  const uploadKey = getFuelReceiptUploadKey(formData);
  const isComplete = currentFuelFormMode === 'completo';

  if (!formData.file) {
    showErrorMessage('Por favor, selecione uma foto do comprovante');
    return;
  }

  if (!uploadedFuelReceipt || uploadedFuelReceipt.key !== uploadKey) {
    showErrorMessage('Salve o comprovante antes de enviar pelo WhatsApp.');
    return;
  }

  if (uploadedFuelReceipt.result.offline) {
    const appwritePayload = buildCentralRegistroPayload({
      type: isComplete ? 'abastecimento' : 'abastecimento_rapido',
      formData,
      receiptUrl: '',
      mensagem: ''
    });
    const offlineRecord = {
      id: appwritePayload.rowId,
      protocol: appwritePayload.data.protocolo,
      type: appwritePayload.data.tipo,
      date: formData.data,
      time: formData.horaFormatada,
      value: isComplete && formData.valor ? formData.valor : '',
      numericValue: isComplete ? (parseCentralMoney(formData.valor) || 0) : 0,
      supplier: formData.posto,
      receiptUrl: '',
      status: 'pendente',
      offline: true
    };
    try {
      await queueCentralOfflineSubmission({
        kind: 'fuel',
        formData,
        receiptFile: uploadedFuelReceipt.offlineFile || formData.file,
        payload: appwritePayload,
        offlineRecord
      });
    } catch (error) {
      showErrorMessage(error?.message || 'Não foi possível guardar este registro no aparelho. Mantenha a tela aberta e tente novamente.');
      return;
    }
    document.getElementById('fuel-form').reset();
    document.getElementById('fuel-form-modal').classList.add('hidden');
    resetFuelPhotoState();
    setFuelDateToToday();
    applyFuelFormMode('rapido');
    populateDriverOptions();
    showSuccessMessage('Registro salvo no aparelho. O envio será automático quando a internet voltar.');
    return;
  }

  const mensagem = buildFuelWhatsAppMessage(formData, isComplete, uploadedFuelReceipt.result.secure_url);

  const appwritePayload = buildCentralRegistroPayload({
    type: isComplete ? 'abastecimento' : 'abastecimento_rapido',
    formData,
    receiptUrl: uploadedFuelReceipt.result.secure_url,
    mensagem
  });

  const centralSavePromise = saveCentralRegistroWithRetry(appwritePayload);
  const shouldOpenWhatsApp = navigator.onLine;
  if (shouldOpenWhatsApp) openWhatsAppDirect(FUEL_WHATSAPP_NUMBER, mensagem);
  let queuedAfterUpload = false;

  try {
    await centralSavePromise;
  } catch (error) {
    console.error('Erro ao registrar abastecimento no Appwrite:', error);
    if (error?.isNetworkError || !navigator.onLine) queuedAfterUpload = true;
    else {
      showErrorMessage(getCentralAppwriteErrorMessage(error));
      return;
    }
  }

  saveDriverNameSuggestion(formData.motorista);
  saveLastFuelEntry({ motorista: formData.motorista, cidade: formData.cidade, posto: formData.posto });
  saveCentralLastSentRecord({
    id: appwritePayload.rowId,
    protocol: appwritePayload.data.protocolo,
    type: appwritePayload.data.tipo,
    date: formData.data,
    time: formData.horaFormatada,
    value: isComplete && formData.valor ? formData.valor : '',
    numericValue: isComplete ? (parseCentralMoney(formData.valor) || 0) : 0,
    supplier: formData.posto,
    receiptUrl: uploadedFuelReceipt.result.secure_url,
    status: 'pendente'
  });
  document.getElementById('fuel-form').reset();
  document.getElementById('fuel-form-modal').classList.add('hidden');
  resetFuelPhotoState();
  setFuelDateToToday();
  applyFuelFormMode('rapido');
  populateDriverOptions();
  showSuccessMessage(queuedAfterUpload
    ? 'Registro guardado. A Central concluirá o envio quando a internet voltar.'
    : 'WhatsApp aberto. Envie a mensagem para validar o abastecimento.');
}

async function submitLooseNoteForm(e) {
  e.preventDefault();

  const profile = await requireAuthorizedDriverProfile();
  if (!profile) return;

  const formData = getLooseNoteFormData();
  if (normalizeDirectoryValue(formData.motorista) !== normalizeDirectoryValue(profile.name)) {
    showErrorMessage(DRIVER_PROFILE_PERMISSION_ERROR);
    return;
  }
  const uploadKey = getLooseNoteReceiptUploadKey(formData);

  if (!formData.motorista || !formData.fornecedor || !formData.tipoServico || !formData.valor || !formData.data) {
    showErrorMessage('Preencha motorista, fornecedor, tipo do servi\u00e7o, valor e data.');
    return;
  }

  if (!formData.file) {
    showErrorMessage('Por favor, selecione uma foto do comprovante.');
    return;
  }

  if (!uploadedLooseNoteReceipt || uploadedLooseNoteReceipt.key !== uploadKey) {
    showErrorMessage('Salve o comprovante antes de enviar pelo WhatsApp.');
    return;
  }

  if (uploadedLooseNoteReceipt.result.offline) {
    const appwritePayload = buildCentralRegistroPayload({
      type: 'servico',
      formData,
      receiptUrl: '',
      mensagem: ''
    });
    const offlineRecord = {
      id: appwritePayload.rowId,
      protocol: appwritePayload.data.protocolo,
      type: appwritePayload.data.tipo,
      date: formData.data,
      time: formData.horaFormatada,
      value: formData.valor || '',
      numericValue: parseCentralMoney(formData.valor) || 0,
      supplier: formData.fornecedor,
      receiptUrl: '',
      status: 'pendente',
      offline: true
    };
    try {
      await queueCentralOfflineSubmission({
        kind: 'loose',
        formData,
        receiptFile: uploadedLooseNoteReceipt.offlineFile || formData.file,
        payload: appwritePayload,
        offlineRecord
      });
    } catch (error) {
      showErrorMessage(error?.message || 'Não foi possível guardar este registro no aparelho. Mantenha a tela aberta e tente novamente.');
      return;
    }
    closeLooseNoteForm();
    showSuccessMessage('Registro salvo no aparelho. O envio será automático quando a internet voltar.');
    return;
  }

  const mensagem = buildLooseWhatsAppMessage(formData, uploadedLooseNoteReceipt.result.secure_url);

  const appwritePayload = buildCentralRegistroPayload({
    type: 'servico',
    formData,
    receiptUrl: uploadedLooseNoteReceipt.result.secure_url,
    mensagem
  });

  const centralSavePromise = saveCentralRegistroWithRetry(appwritePayload);
  const shouldOpenWhatsApp = navigator.onLine;
  if (shouldOpenWhatsApp) openWhatsAppDirect(FUEL_WHATSAPP_NUMBER, mensagem);
  let queuedAfterUpload = false;

  try {
    await centralSavePromise;
  } catch (error) {
    console.error('Erro ao registrar servi\u00e7o no Appwrite:', error);
    if (error?.isNetworkError || !navigator.onLine) queuedAfterUpload = true;
    else {
      showErrorMessage(getCentralAppwriteErrorMessage(error));
      return;
    }
  }

  saveDriverNameSuggestion(formData.motorista);
  saveCentralLastSentRecord({
    id: appwritePayload.rowId,
    protocol: appwritePayload.data.protocolo,
    type: appwritePayload.data.tipo,
    date: formData.data,
    time: formData.horaFormatada,
    value: formData.valor || '',
    numericValue: parseCentralMoney(formData.valor) || 0,
    supplier: formData.fornecedor,
    receiptUrl: uploadedLooseNoteReceipt.result.secure_url,
    status: 'pendente'
  });
  closeLooseNoteForm();
  showSuccessMessage(queuedAfterUpload
    ? 'Registro guardado. A Central concluirá o envio quando a internet voltar.'
    : 'WhatsApp aberto. Envie a mensagem para validar o registro de serviços.');
}

function showSuccessMessage(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in max-w-md mx-auto text-center font-semibold';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4500);
}

function showErrorMessage(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in max-w-md mx-auto text-center font-semibold';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4500);
}

function openMap(link) {
  window.open(link, '_blank', 'noopener,noreferrer');
}

function openFuelForm(postoNome, cidadeNome) {
  if (!isStoredDriverProfileComplete()) {
    showErrorMessage('Para enviar um registro, vincule seu perfil e veículo.');
    openDriverProfile('edit');
    return;
  }
  document.getElementById('fuel-form-modal').classList.remove('hidden');
  prepareFuelForm({ cidade: cidadeNome, posto: postoNome, mode: 'rapido' });
}

function openWhatsAppSuggestions() {
  const numeroWhatsApp = '5527999884208';
  const mensagem = 'Ol\u00e1! Gostaria de enviar uma sugest\u00e3o ou feedback sobre o aplicativo de postos credenciados.';
  const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
  window.open(urlWhatsApp, '_blank', 'noopener,noreferrer');
}

function showComingSoon() {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in max-w-sm';
  toast.textContent = 'Esta funcionalidade estar\u00e1 dispon\u00edvel em breve!';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function goToWelcome() {
  closeOpenFormsSilently();
  document.getElementById('welcome-screen').classList.remove('hidden');
  document.getElementById('postos-display').classList.add('hidden');
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('profile-section')?.classList.add('hidden');
  currentView = 'welcome';
  setMobileNavActive('home');
  renderHomeDriverArea();
  updateBackButtonVisibility();
}

function showDashboard() {
  closeOpenFormsSilently();
  document.getElementById('welcome-screen').classList.add('hidden');
  document.getElementById('postos-display').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  document.getElementById('profile-section')?.classList.add('hidden');
  currentView = 'dashboard';
  setMobileNavActive('postos');
  updateBackButtonVisibility();
}

function selectCity(cityName) {
  let postos = [];
  const postosCidades = {};

  if (cityName === 'Todos os Postos') {
    Object.entries(postosPorCidade).forEach(([cidade, cityPostos]) => {
      cityPostos.forEach((posto) => {
        postos.push(posto);
        postosCidades[posto.nome] = cidade;
      });
    });
  } else if (postosPorCidade[cityName]) {
    postos = postosPorCidade[cityName];
    postos.forEach((posto) => {
      postosCidades[posto.nome] = cityName;
    });
  }

  const postosDisplay = document.getElementById('postos-display');
  const welcomeScreen = document.getElementById('welcome-screen');
  const dashboard = document.getElementById('dashboard');
  const cityNameEl = document.getElementById('selected-city-name');
  const postosListEl = document.getElementById('postos-list');
  const postosCountEl = document.getElementById('postos-count');

  console.log('City:', cityName, 'Postos found:', postos.length);

  cityNameEl.textContent = cityName === 'Todos os Postos' ? 'Todos os Postos' : cityName;
  postosCountEl.textContent = postos.length;

  postosListEl.innerHTML = postos.map((posto) => `
    <div class="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 card-hover">
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-gray-900 text-sm sm:text-base mb-1">${posto.nome}</h3>
        </div>
        <div class="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 ml-2 sm:ml-3">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
        </div>
      </div>

      <div class="space-y-2 mb-3 sm:mb-4 text-xs sm:text-sm">
        <div class="flex items-start gap-2 text-gray-600">
          <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span class="break-words">${posto.endereco}</span>
        </div>
      </div>

      ${posto.link ? `<button
        onclick="openMap('${posto.link.replace(/'/g, "\\'")}')"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-xs sm:text-sm"
      >
        <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
        </svg>
        Ver no Mapa
      </button>` : ''}
      <button
        onclick="openFuelForm('${posto.nome.replace(/'/g, "\\'").replace(/"/g, '\\"')}', '${postosCidades[posto.nome].replace(/'/g, "\\'").replace(/"/g, '\\"')}')"
        class="w-full ${posto.link ? 'mt-2' : ''} bg-green-600 hover:bg-green-700 text-white font-medium py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-xs sm:text-sm"
      >
        <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        Registrar Abastecimento
      </button>
    </div>
  `).join('');

  welcomeScreen.classList.add('hidden');
  dashboard.classList.add('hidden');
  document.getElementById('profile-section')?.classList.add('hidden');
  postosDisplay.classList.remove('hidden');
  currentView = 'postos';
  setMobileNavActive('postos');
  updateBackButtonVisibility();
}

function backToSearch() {
  document.getElementById('postos-display').classList.add('hidden');
  document.getElementById('profile-section')?.classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  currentView = 'dashboard';
  setMobileNavActive('postos');
  updateBackButtonVisibility();
}

function setMobileNavActive(target) {
  document.body.dataset.mobileNav = target;
  document.querySelectorAll('[data-mobile-nav]').forEach((button) => {
    button.classList.toggle('active', button.dataset.mobileNav === target);
  });
}

function restoreMobileNavForCurrentView() {
  if (currentView === 'profile') {
    setMobileNavActive('profile');
    return;
  }
  if (currentView === 'settings') {
    setMobileNavActive('settings');
    return;
  }
  setMobileNavActive(currentView === 'welcome' ? 'home' : 'postos');
}

function openProfilePage(view = 'profile') {
  closeOpenFormsSilently();
  document.getElementById('welcome-screen').classList.add('hidden');
  document.getElementById('postos-display').classList.add('hidden');
  document.getElementById('dashboard').classList.add('hidden');
  const section = document.getElementById('profile-section');
  section?.classList.remove('hidden');
  if (section) section.dataset.profileView = view;
  const settingsView = view === 'settings';
  const kicker = document.getElementById('profile-page-kicker');
  const title = document.getElementById('profile-page-title');
  const description = document.getElementById('profile-page-description');
  if (kicker) kicker.textContent = settingsView ? 'PREFERÊNCIAS DO APP' : 'PERFIL DESTE APARELHO';
  if (title) title.textContent = settingsView ? 'Configurações' : 'Meu perfil';
  if (description) description.textContent = settingsView
    ? 'Permissões, instalação e informações do aplicativo.'
    : 'Seus dados, veículo e envios.';
  currentView = view;
  setMobileNavActive(view);
  updateBackButtonVisibility();
  if (settingsView) {
    refreshCentralNotificationSetting();
    refreshCentralCameraSetting();
  } else {
    renderProfilePage();
    if (!centralSubmissionHistoryLoaded) refreshMySubmissions({ silent: true });
  }
}

function showProfileSection() {
  openProfilePage('profile');
}

function showSettingsSection() {
  openProfilePage('settings');
}

function showAboutSection() {
  showSettingsSection();
}

function openCentralNotificationSettings() {
  showSettingsSection();
  window.setTimeout(() => {
    const setting = document.getElementById('central-notification-toggle')?.closest('.about-notification-setting');
    setting?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 120);
}

function closeOpenFormsSilently() {
  closeReceiptCamera();
  const fuelModal = document.getElementById('fuel-form-modal');
  const looseModal = document.getElementById('loose-note-modal');

  if (fuelModal && !fuelModal.classList.contains('hidden')) {
    fuelModal.classList.add('hidden');
    closeReceiptValidationModal();
    document.getElementById('fuel-form')?.reset();
    resetFuelPhotoState();
    setFuelDateToToday();
    applyFuelFormMode('rapido');
    populateDriverOptions();
  }

  if (looseModal && !looseModal.classList.contains('hidden')) {
    looseModal.classList.add('hidden');
    document.getElementById('loose-note-form')?.reset();
    resetLoosePhotoState();
    setLooseDateToToday();
    populateDriverOptions();
  }
}

function updateBackButtonVisibility() {
  const backButton = document.getElementById('back-button');
  if (!backButton) {
    return;
  }

  if (currentView === 'welcome') {
    backButton.classList.add('hidden');
  } else {
    backButton.classList.remove('hidden');
  }
}

async function prepareReceiptFile(target, file) {
  if (!file) {
    return;
  }

  const isLoose = target === 'loose';
  const selectionId = isLoose ? ++looseReceiptSelectionId : ++fuelReceiptSelectionId;
  const updateStatus = isLoose ? updateLooseReceiptUploadStatus : updateReceiptUploadStatus;
  updateStatus('Otimizando a foto para economizar mem\u00f3ria...', 'progress');

  try {
    const optimizedFile = await compressFuelReceiptIfNeeded(file);
    const currentSelectionId = isLoose ? looseReceiptSelectionId : fuelReceiptSelectionId;
    if (selectionId !== currentSelectionId) {
      return;
    }

    const preview = document.getElementById(isLoose ? 'loose-photo-preview' : 'photo-preview');
    const previewContainer = document.getElementById(isLoose ? 'loose-photo-preview-container' : 'photo-preview-container');
    const photoButtons = document.getElementById(isLoose ? 'loose-photo-buttons' : 'photo-buttons');

    if (isLoose) {
      selectedLooseNoteReceiptFile = optimizedFile;
      uploadedLooseNoteReceipt = null;
      looseNoteReceiptUploadPromise = null;
      setLooseActionButtonsVisible(false);
      setSaveLooseReceiptButtonVisible(true);
    } else {
      selectedFuelReceiptFile = optimizedFile;
      uploadedFuelReceipt = null;
      fuelReceiptUploadPromise = null;
      setFuelActionButtonsVisible(false);
      setSaveReceiptButtonVisible(true);
    }

    preview.src = setReceiptPreviewUrl(target, optimizedFile);
    previewContainer.classList.remove('hidden');
    photoButtons.classList.add('hidden');
    updateStatus('Foto otimizada. Clique em Salvar comprovante.', 'neutral');
  } catch (error) {
    console.error('Erro ao preparar comprovante:', error);
    if (isLoose) {
      resetLoosePhotoState();
    } else {
      resetFuelPhotoState();
    }
    showErrorMessage(error?.message || 'N\u00e3o foi poss\u00edvel preparar a foto. Tente novamente.');
  }
}

function updatePhotoPreview(fileInput) {
  const file = fileInput?.files && fileInput.files[0] ? fileInput.files[0] : null;
  const cameFromCamera = fileInput?.id === 'fuel-photo-camera';
  if (fileInput) {
    fileInput.value = '';
  }
  if (cameFromCamera) {
    reviewNativeReceiptFile('fuel', file);
    return;
  }
  prepareReceiptFile('fuel', file);
}

function updateLoosePhotoPreview(fileInput) {
  const file = fileInput?.files && fileInput.files[0] ? fileInput.files[0] : null;
  const cameFromCamera = fileInput?.id === 'loose-photo-camera';
  if (fileInput) {
    fileInput.value = '';
  }
  if (cameFromCamera) {
    reviewNativeReceiptFile('loose', file);
    return;
  }
  prepareReceiptFile('loose', file);
}

function stopReceiptCameraStream() {
  receiptCameraFlashEnabled = false;
  updateReceiptCameraFlashButton(false);

  if (activeReceiptCameraStream) {
    activeReceiptCameraStream.getTracks().forEach((track) => track.stop());
    activeReceiptCameraStream = null;
  }

  const video = document.getElementById('receipt-camera-video');
  if (video) {
    video.pause();
    video.srcObject = null;
  }
}

async function requestReceiptCameraStream(deviceId = '') {
  stopReceiptCameraStream();
  const videoConstraints = deviceId
    ? {
        deviceId: { exact: deviceId },
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 960, max: 1440 }
      }
    : {
        facingMode: { exact: 'environment' },
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 960, max: 1440 }
      };

  try {
    activeReceiptCameraStream = await navigator.mediaDevices.getUserMedia({
      video: videoConstraints,
      audio: false
    });
  } catch (error) {
    if (deviceId) {
      throw error;
    }

    activeReceiptCameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 960, max: 1440 }
      },
      audio: false
    });
  }

  return activeReceiptCameraStream;
}

async function attachReceiptCameraStream(stream) {
  const video = document.getElementById('receipt-camera-video');
  if (!video) {
    throw new Error('Visualizador da c\u00e2mera indispon\u00edvel.');
  }

  video.srcObject = stream;
  await video.play();
  updateReceiptCameraFlashAvailability();
}

function updateReceiptCameraFlashButton(supported) {
  const button = document.getElementById('receipt-camera-flash');
  if (!button) {
    return;
  }

  button.classList.toggle('hidden', !supported);
  button.classList.toggle('is-active', supported && receiptCameraFlashEnabled);
  button.disabled = !supported;
  button.setAttribute('aria-pressed', String(supported && receiptCameraFlashEnabled));
  button.setAttribute('aria-label', receiptCameraFlashEnabled ? 'Desativar flash' : 'Ativar flash');
  button.title = receiptCameraFlashEnabled ? 'Desativar flash' : 'Ativar flash';
}

function updateReceiptCameraFlashAvailability() {
  const track = activeReceiptCameraStream?.getVideoTracks?.()[0];
  const capabilities = track?.getCapabilities?.() || {};
  const supported = capabilities.torch === true;
  receiptCameraFlashEnabled = supported && track?.getSettings?.().torch === true;
  updateReceiptCameraFlashButton(supported);
  return supported;
}

async function toggleReceiptCameraFlash() {
  const track = activeReceiptCameraStream?.getVideoTracks?.()[0];
  const capabilities = track?.getCapabilities?.() || {};
  const status = document.getElementById('receipt-camera-status');

  if (!track || capabilities.torch !== true) {
    updateReceiptCameraFlashButton(false);
    showErrorMessage('O flash n\u00e3o est\u00e1 dispon\u00edvel nesta c\u00e2mera.');
    return;
  }

  const shouldEnable = !receiptCameraFlashEnabled;
  try {
    await track.applyConstraints({ advanced: [{ torch: shouldEnable }] });
    receiptCameraFlashEnabled = shouldEnable;
    updateReceiptCameraFlashButton(true);
    if (status) {
      status.textContent = shouldEnable ? 'Flash ligado' : 'Flash desligado';
    }
  } catch (error) {
    console.error('N\u00e3o foi poss\u00edvel alterar o flash:', error);
    receiptCameraFlashEnabled = false;
    updateReceiptCameraFlashAvailability();
    showErrorMessage('N\u00e3o foi poss\u00edvel alterar o flash neste celular.');
  }
}

async function preferRearReceiptCamera() {
  receiptCameraDevices = (await navigator.mediaDevices.enumerateDevices())
    .filter((device) => device.kind === 'videoinput');

  const currentTrack = activeReceiptCameraStream?.getVideoTracks?.()[0];
  const currentSettings = currentTrack?.getSettings?.() || {};
  const currentDeviceId = currentSettings.deviceId || '';
  const currentIndex = receiptCameraDevices.findIndex((device) => device.deviceId === currentDeviceId);
  const currentLabel = currentIndex >= 0 ? receiptCameraDevices[currentIndex].label || '' : '';
  const isFrontCamera = currentSettings.facingMode === 'user' || /front|user|frontal/i.test(currentLabel);

  receiptCameraDeviceIndex = currentIndex >= 0 ? currentIndex : 0;

  // Preserve the camera selected by facingMode=environment. On multi-lens phones,
  // replacing it with the first "rear" device often selects the ultra-wide lens.
  if (isFrontCamera) {
    const rearIndex = receiptCameraDevices.findIndex((device) => {
      const label = device.label || '';
      return RECEIPT_CAMERA_LABEL_PATTERN.test(label)
        && !/ultra|0[.,]5|0\.5|macro|telephoto|telefoto/i.test(label);
    });

    if (rearIndex >= 0 && receiptCameraDevices[rearIndex].deviceId !== currentDeviceId) {
      receiptCameraDeviceIndex = rearIndex;
      const stream = await requestReceiptCameraStream(receiptCameraDevices[rearIndex].deviceId);
      await attachReceiptCameraStream(stream);
    }
  }

  document.getElementById('receipt-camera-switch')?.classList.toggle('hidden', receiptCameraDevices.length < 2);
}

function openNativeReceiptCameraFallback(target) {
  const input = document.getElementById(target === 'loose' ? 'loose-photo-camera' : 'fuel-photo-camera');
  if (!input) {
    return;
  }

  input.setAttribute('capture', 'environment');
  input.value = '';
  input.click();
}

function clearReceiptCameraReview() {
  const reviewImage = document.getElementById('receipt-camera-review-image');
  if (reviewImage) {
    reviewImage.src = '';
    reviewImage.classList.add('hidden');
  }

  if (pendingReceiptCameraPreviewUrl) {
    URL.revokeObjectURL(pendingReceiptCameraPreviewUrl);
    pendingReceiptCameraPreviewUrl = '';
  }

  pendingReceiptCameraFile = null;
  document.getElementById('receipt-camera-video')?.classList.remove('hidden');
  document.getElementById('receipt-camera-guide')?.classList.remove('hidden');
  document.getElementById('receipt-camera-live-actions')?.classList.remove('hidden');
  document.getElementById('receipt-camera-review-actions')?.classList.add('hidden');
}

function enterReceiptCameraFullscreen() {
  document.body.classList.add('receipt-camera-open');
  document.body.style.overflow = 'hidden';
}

function exitReceiptCameraFullscreen() {
  document.body.classList.remove('receipt-camera-open');
  document.body.style.overflow = '';
}

function showReceiptCameraLiveMode() {
  clearReceiptCameraReview();
  document.getElementById('receipt-camera-video')?.classList.remove('hidden');
  document.getElementById('receipt-camera-guide')?.classList.remove('hidden');
  document.getElementById('receipt-camera-live-actions')?.classList.remove('hidden');
  document.getElementById('receipt-camera-review-actions')?.classList.add('hidden');
}

function showReceiptCameraReviewMode(file, target) {
  if (!file) {
    return;
  }

  clearReceiptCameraReview();
  activeReceiptCameraTarget = target === 'loose' ? 'loose' : 'fuel';
  pendingReceiptCameraFile = file;
  pendingReceiptCameraPreviewUrl = URL.createObjectURL(file);

  const modal = document.getElementById('receipt-camera-modal');
  const reviewImage = document.getElementById('receipt-camera-review-image');
  const status = document.getElementById('receipt-camera-status');
  modal?.classList.remove('hidden');
  enterReceiptCameraFullscreen();
  stopReceiptCameraStream();

  const video = document.getElementById('receipt-camera-video');
  video?.classList.add('hidden');
  document.getElementById('receipt-camera-guide')?.classList.add('hidden');
  document.getElementById('receipt-camera-live-actions')?.classList.add('hidden');
  document.getElementById('receipt-camera-review-actions')?.classList.remove('hidden');

  if (reviewImage) {
    reviewImage.src = pendingReceiptCameraPreviewUrl;
    reviewImage.classList.remove('hidden');
  }
  if (status) {
    status.textContent = 'Confira a foto antes de continuar';
  }
}

async function reviewNativeReceiptFile(target, file) {
  if (!file) {
    return;
  }

  activeReceiptCameraTarget = target === 'loose' ? 'loose' : 'fuel';
  const modal = document.getElementById('receipt-camera-modal');
  const status = document.getElementById('receipt-camera-status');
  modal?.classList.remove('hidden');
  enterReceiptCameraFullscreen();
  if (status) {
    status.textContent = 'Otimizando a foto para revis\u00e3o...';
  }

  try {
    const optimizedFile = await compressFuelReceiptIfNeeded(file);
    showReceiptCameraReviewMode(optimizedFile, activeReceiptCameraTarget);
  } catch (error) {
    closeReceiptCamera();
    showErrorMessage(error?.message || 'N\u00e3o foi poss\u00edvel preparar a foto.');
  }
}

function openReceiptCamera(target = 'fuel') {
  activeReceiptCameraTarget = target === 'loose' ? 'loose' : 'fuel';
  closeReceiptCamera();
  openNativeReceiptCameraFallback(activeReceiptCameraTarget);
}

function closeReceiptCamera() {
  stopReceiptCameraStream();
  clearReceiptCameraReview();
  document.getElementById('receipt-camera-modal')?.classList.add('hidden');
  exitReceiptCameraFullscreen();
}

async function switchReceiptCamera() {
  if (receiptCameraDevices.length < 2) {
    return;
  }

  receiptCameraDeviceIndex = (receiptCameraDeviceIndex + 1) % receiptCameraDevices.length;
  const status = document.getElementById('receipt-camera-status');
  if (status) {
    status.textContent = 'Alternando c\u00e2mera...';
  }

  try {
    const stream = await requestReceiptCameraStream(receiptCameraDevices[receiptCameraDeviceIndex].deviceId);
    await attachReceiptCameraStream(stream);
    if (status) {
      status.textContent = 'C\u00e2mera pronta';
    }
  } catch (error) {
    console.error('N\u00e3o foi poss\u00edvel alternar a c\u00e2mera:', error);
    showErrorMessage('N\u00e3o foi poss\u00edvel alternar a c\u00e2mera.');
  }
}

async function captureReceiptCamera() {
  const video = document.getElementById('receipt-camera-video');
  if (!video?.videoWidth || !video?.videoHeight) {
    showErrorMessage('Aguarde a c\u00e2mera carregar antes de fotografar.');
    return;
  }

  const viewport = document.querySelector('.receipt-camera-viewport');
  const viewportWidth = Math.max(1, viewport?.clientWidth || video.clientWidth || video.videoWidth);
  const viewportHeight = Math.max(1, viewport?.clientHeight || video.clientHeight || video.videoHeight);
  const viewportRatio = viewportWidth / viewportHeight;
  const videoRatio = video.videoWidth / video.videoHeight;

  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = video.videoWidth;
  let sourceHeight = video.videoHeight;

  // The live video uses object-fit: cover. Crop the saved frame to the same
  // visible area so processing never reveals extra ultra-wide-like framing.
  if (videoRatio > viewportRatio) {
    sourceWidth = video.videoHeight * viewportRatio;
    sourceX = (video.videoWidth - sourceWidth) / 2;
  } else if (videoRatio < viewportRatio) {
    sourceHeight = video.videoWidth / viewportRatio;
    sourceY = (video.videoHeight - sourceHeight) / 2;
  }

  const scale = Math.min(1, COMPRESSED_RECEIPT_MAX_SIZE / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) {
    showErrorMessage('Este celular est\u00e1 com pouca mem\u00f3ria. Feche outros aplicativos e tente novamente.');
    return;
  }

  canvas.width = width;
  canvas.height = height;
  let blob;

  try {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(
      video,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      width,
      height
    );
    blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error('Falha ao capturar a foto.'))),
        'image/jpeg',
        COMPRESSED_RECEIPT_QUALITY
      );
    });
  } finally {
    context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 1;
    canvas.height = 1;
  }

  const file = new File([blob], `comprovante-${Date.now()}.jpg`, {
    type: 'image/jpeg',
    lastModified: Date.now()
  });
  optimizedReceiptFiles.add(file);
  showReceiptCameraReviewMode(file, activeReceiptCameraTarget);
}

async function retakeReceiptCamera() {
  const status = document.getElementById('receipt-camera-status');
  showReceiptCameraLiveMode();
  if (status) {
    status.textContent = 'Reabrindo a c\u00e2mera traseira...';
  }

  try {
    const selectedDevice = receiptCameraDevices[receiptCameraDeviceIndex];
    const stream = await requestReceiptCameraStream(selectedDevice?.deviceId || '');
    await attachReceiptCameraStream(stream);
    if (status) {
      status.textContent = 'C\u00e2mera pronta';
    }
  } catch (error) {
    console.error('N\u00e3o foi poss\u00edvel reabrir a c\u00e2mera:', error);
    closeReceiptCamera();
    openNativeReceiptCameraFallback(activeReceiptCameraTarget);
  }
}

async function confirmReceiptCamera() {
  if (!pendingReceiptCameraFile) {
    return;
  }

  const file = pendingReceiptCameraFile;
  const target = activeReceiptCameraTarget;
  pendingReceiptCameraFile = null;
  closeReceiptCamera();
  await prepareReceiptFile(target, file);
}

function deletePhoto() {
  resetFuelPhotoState();
}

function deleteLoosePhoto() {
  resetLoosePhotoState();
}

function openReceiptPreview(imageId) {
  const sourceImage = document.getElementById(imageId);
  const modal = document.getElementById('receipt-preview-modal');
  const fullscreenImage = document.getElementById('receipt-preview-fullscreen-image');

  if (!sourceImage || !modal || !fullscreenImage || !sourceImage.src) {
    return;
  }

  fullscreenImage.src = sourceImage.src;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeReceiptPreview() {
  const modal = document.getElementById('receipt-preview-modal');
  const fullscreenImage = document.getElementById('receipt-preview-fullscreen-image');

  if (modal) {
    modal.classList.add('hidden');
  }

  if (fullscreenImage) {
    fullscreenImage.src = '';
  }

  document.body.style.overflow = '';
}

function formatCurrency(input) {
  let value = input.value.replace(/\D/g, '');

  if (value.length === 0) {
    input.value = '';
    return;
  }

  if (value.length <= 2) {
    value = value.padStart(2, '0');
    input.value = `R$ 0,${value}`;
  } else {
    const inteiros = value.slice(0, -2);
    const decimais = value.slice(-2);
    const inteirosLimpos = inteiros.replace(/^0+/, '') || '0';
    const inteirosFormatados = inteirosLimpos.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    input.value = `R$ ${inteirosFormatados},${decimais}`;
  }
}

function capturePhoto() {
  openReceiptCamera('fuel');
}

function captureLoosePhoto() {
  openReceiptCamera('loose');
}

window.addEventListener('pagehide', stopReceiptCameraStream);

async function simulateProgress(options = {}) {
  const { receiptAlreadyUploaded = false } = options;
  const steps = [
    {
      id: 1,
      duration: 450,
      initialText: 'Verificando informa\u00e7\u00f5es...',
      completedText: 'Informa\u00e7\u00f5es verificadas',
      initialDescription: 'Conferindo motorista, cidade, posto e data.',
      completedDescription: 'Dados b\u00e1sicos conferidos.'
    },
    {
      id: 2,
      duration: 450,
      initialText: 'Validando dados...',
      completedText: 'Dados validados',
      initialDescription: 'Analisando o formul\u00e1rio preenchido.',
      completedDescription: 'Formul\u00e1rio validado.'
    },
    {
      id: 3,
      duration: 450,
      initialText: 'Gerando protocolo...',
      completedText: 'Protocolo gerado',
      initialDescription: 'Criando identificador do abastecimento.',
      completedDescription: 'Identificador criado.'
    },
    {
      id: 4,
      duration: receiptAlreadyUploaded ? 300 : 900,
      initialText: receiptAlreadyUploaded ? 'Confirmando comprovante salvo...' : 'Salvando comprovante...',
      completedText: receiptAlreadyUploaded ? 'Comprovante j\u00e1 salvo' : 'Comprovante salvo',
      initialDescription: receiptAlreadyUploaded ? 'Usando o link salvo na nuvem.' : 'Comprimindo e enviando para a nuvem.',
      completedDescription: 'Link do comprovante pronto.'
    },
    {
      id: 5,
      duration: 450,
      initialText: 'Preparando WhatsApp...',
      completedText: 'Pronto para validar',
      initialDescription: 'Montando a mensagem com o link do comprovante.',
      completedDescription: 'Clique no bot\u00e3o abaixo para enviar e validar.'
    }
  ];

  for (let i = 0; i < steps.length; i += 1) {
    const step = steps[i];
    const progressBar = document.getElementById('progress-bar');
    const currentProgress = ((i + 1) / steps.length) * 100;
    const spinner = document.getElementById(`step-${step.id}-spinner`);
    const textEl = document.getElementById(`step-${step.id}-text`);
    const descriptionEl = textEl.nextElementSibling;

    spinner.classList.remove('hidden');
    textEl.textContent = step.initialText;
    if (descriptionEl) {
      descriptionEl.textContent = step.initialDescription;
    }

    await new Promise((resolve) => setTimeout(resolve, step.duration));

    spinner.classList.add('hidden');
    document.getElementById(`step-${step.id}-check`).classList.remove('hidden');
    textEl.textContent = step.completedText;
    if (descriptionEl) {
      descriptionEl.textContent = step.completedDescription;
    }

    const circle = document.getElementById(`step-${step.id}-icon`).querySelector('div');
    circle.classList.add('border-green-600', 'bg-green-50');
    circle.classList.remove('border-gray-300');
    progressBar.style.width = `${currentProgress}%`;
  }
}

window.addEventListener('DOMContentLoaded', function() {
  const header = document.querySelector('.sticky.top-0');
  if (header) {
    header.style.zIndex = '20';
  }
  setMobileNavActive('home');
  populateDriverOptions();
});

async function onConfigChange(newConfig) {
  config = { ...defaultConfig, ...newConfig };
}

function mapToCapabilities(currentConfig) {
  return {
    recolorables: [
      {
        get: () => currentConfig.background_color || defaultConfig.background_color,
        set: (value) => {
          config.background_color = value;
          if (window.elementSdk) {
            window.elementSdk.setConfig({ background_color: value });
          }
        }
      },
      {
        get: () => currentConfig.card_color || defaultConfig.card_color,
        set: (value) => {
          config.card_color = value;
          if (window.elementSdk) {
            window.elementSdk.setConfig({ card_color: value });
          }
        }
      },
      {
        get: () => currentConfig.text_color || defaultConfig.text_color,
        set: (value) => {
          config.text_color = value;
          if (window.elementSdk) {
            window.elementSdk.setConfig({ text_color: value });
          }
        }
      },
      {
        get: () => currentConfig.primary_action_color || defaultConfig.primary_action_color,
        set: (value) => {
          config.primary_action_color = value;
          if (window.elementSdk) {
            window.elementSdk.setConfig({ primary_action_color: value });
          }
        }
      },
      {
        get: () => currentConfig.secondary_action_color || defaultConfig.secondary_action_color,
        set: (value) => {
          config.secondary_action_color = value;
          if (window.elementSdk) {
            window.elementSdk.setConfig({ secondary_action_color: value });
          }
        }
      }
    ],
    borderables: [],
    fontEditable: {
      get: () => currentConfig.font_family || defaultConfig.font_family,
      set: (value) => {
        config.font_family = value;
        if (window.elementSdk) {
          window.elementSdk.setConfig({ font_family: value });
        }
      }
    },
    fontSizeable: {
      get: () => currentConfig.font_size || defaultConfig.font_size,
      set: (value) => {
        config.font_size = value;
        if (window.elementSdk) {
          window.elementSdk.setConfig({ font_size: value });
        }
      }
    }
  };
}

function mapToEditPanelValues(currentConfig) {
  return new Map([
    ['page_title', currentConfig.page_title || defaultConfig.page_title]
  ]);
}

if (window.elementSdk) {
  window.elementSdk.init({
    defaultConfig,
    onConfigChange,
    mapToCapabilities,
    mapToEditPanelValues
  });
}

window.addEventListener('DOMContentLoaded', async function() {
  await ensureCentralDeviceStateRestored();
  if (window.lucide) {
    lucide.createIcons();
  }

  setupPwaInstallExperience();
  registerServiceWorker();
  setupCentralPushExperience();
  refreshCentralNotificationBadge();

  navigator.serviceWorker?.addEventListener('message', (event) => {
    if (event.data?.type === 'CENTRAL_SYNC_OFFLINE_SUBMISSIONS') {
      processCentralOfflineSubmissions();
      return;
    }
    if (event.data?.type !== 'CENTRAL_NOTIFICATION_RECEIVED') return;
    refreshCentralNotificationBadge();
    const modal = document.getElementById('central-notifications-modal');
    if (modal && !modal.classList.contains('hidden')) refreshCentralNotifications();
  });
});

const cityImageCards = [
  {
    name: 'Boa Esperan\u00e7a',
    image: 'assets/cidades/boa-esperanca.jpeg',
    postos: '1 posto'
  },
  {
    name: 'Montanha',
    image: 'assets/cidades/montanha.jpeg',
    postos: '1 posto'
  },
  {
    name: 'Nova Ven\u00e9cia',
    image: 'assets/cidades/nova-venecia.jpeg',
    postos: '1 posto'
  },
  {
    name: 'Pedro Can\u00e1rio',
    image: 'assets/cidades/pedro-canario.jpeg',
    postos: '1 posto'
  },
  {
    name: 'Pinheiros',
    image: 'assets/cidades/pinheiros.jpeg',
    postos: '3 postos',
    featured: true
  },
  {
    name: 'S\u00e3o Mateus',
    image: 'assets/cidades/sao-mateus.jpeg',
    postos: '2 postos'
  }
];

function renderCityImageCards() {
  const dashboard = document.getElementById('dashboard');
  const grid = dashboard?.querySelector('.grid');

  if (!grid) {
    return;
  }

  grid.className = 'city-card-grid';
  grid.innerHTML = '';

  const availableCards = cityImageCards
    .filter((city) => Array.isArray(postosPorCidade[city.name]) && postosPorCidade[city.name].length)
    .map((city) => ({
      ...city,
      postos: `${postosPorCidade[city.name].length} posto${postosPorCidade[city.name].length === 1 ? '' : 's'}`
    }));

  (availableCards.length ? availableCards : cityImageCards).forEach((city) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'city-image-card';
    button.setAttribute('aria-label', `Ver postos em ${city.name}`);
    button.addEventListener('click', () => selectCity(city.name));

    const image = document.createElement('img');
    image.src = city.image;
    image.alt = city.name;
    image.loading = 'lazy';

    const badge = document.createElement('span');
    badge.className = 'city-card-badge';
    badge.textContent = city.postos;

    button.appendChild(image);
    button.appendChild(badge);

    if (city.featured) {
      const featured = document.createElement('span');
      featured.className = 'city-card-featured';
      featured.textContent = 'Recomendado';
      button.appendChild(featured);
    }

    grid.appendChild(button);
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  await ensureCentralDeviceStateRestored();
  updateCentralConnectivityStatus();
  renderCityImageCards();
  loadManagedCentralStations();
  ensureDriverDirectoryLoaded().catch((error) => {
    console.warn('O diretório será carregado novamente quando necessário.', error);
  });
  retryPendingCentralRegistro();
  processCentralOfflineSubmissions();
  getCentralDeviceId();
  renderHomeDriverArea();
  refreshMySubmissions({ silent: true });
  await loadCentralOnboardingConfig();
  if (window.location.hash === '#meus-envios') window.setTimeout(() => openMySubmissions(), 350);
  else if (shouldOpenDriverOnboarding()) window.setTimeout(() => openDriverProfile(), 450);
});

window.addEventListener('keydown', (event) => {
  const onboardingOpen = [
    'driver-onboarding-driver-step',
    'driver-onboarding-vehicle-step',
    'driver-onboarding-vehicle-search-step',
    'driver-onboarding-permissions-step',
    'driver-onboarding-camera-step',
    'driver-onboarding-location-step',
    'driver-onboarding-notifications-step',
    'driver-onboarding-ready-step'
  ].some((id) => !document.getElementById(id)?.classList.contains('hidden'));

  if (event.key === 'Escape' && !document.getElementById('driver-profile-modal')?.classList.contains('hidden') && !onboardingOpen) {
    closeDriverProfile();
  } else if (event.key === 'Escape' && !document.getElementById('my-submissions-modal')?.classList.contains('hidden')) {
    closeMySubmissions();
  } else if (event.key === 'Escape' && !document.getElementById('central-notifications-modal')?.classList.contains('hidden')) {
    closeCentralNotifications();
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    refreshMySubmissions({ silent: true });
    retryPendingCentralRegistro();
    processCentralOfflineSubmissions();
  } else {
    persistCentralDeviceState();
  }
});

window.addEventListener('pagehide', () => {
  persistCentralDeviceState();
});

window.addEventListener('online', () => {
  centralConnectionDegraded = false;
  updateCentralConnectivityStatus({ syncing: true });
  retryPendingCentralRegistro();
  processCentralOfflineSubmissions();
  loadManagedCentralStations();
  setupCentralPushExperience();
});

window.addEventListener('offline', () => {
  centralConnectionDegraded = true;
  updateCentralConnectivityStatus();
});

const CENTRAL_BANNERS_CONFIG = Object.freeze({
  endpoint: 'https://nyc.cloud.appwrite.io/v1',
  projectId: '6a68cb3e00312ec0a3fd',
  databaseId: '6a68ce8c000a36a44d98',
  tableId: 'central_home_banners'
});
const CENTRAL_BUILTIN_BANNER_VARIANTS = Object.freeze({
  'builtin:hero-revisao-km': './assets/home/hero-revisao-km-mobile.jpeg',
  'builtin:hero-posto-proximo': './assets/home/hero-posto-proximo-mobile.jpeg'
});

async function loadManagedHomeBanners() {
  const slidesContainer = document.querySelector('#home-hero-carousel .home-hero-slides');
  if (!slidesContainer) return false;
  try {
    const config = CENTRAL_BANNERS_CONFIG;
    const response = await fetch(`${config.endpoint}/tablesdb/${config.databaseId}/tables/${config.tableId}/rows`, {
      headers: { 'x-appwrite-project': config.projectId }
    });
    if (!response.ok) throw new Error(`Appwrite respondeu ${response.status}`);
    const payload = await response.json();
    const rows = Array.isArray(payload?.rows) ? payload.rows : [];
    const managesBuiltinBanners = rows.some((banner) => String(banner?.fileId || '').startsWith('builtin:'));
    const banners = rows
      .filter((banner) => banner?.active && String(banner?.imageUrl || '').trim())
      .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
    if (!banners.length) return false;

    const fragment = document.createDocumentFragment();
    banners.forEach((banner, index) => {
      const fileId = String(banner.fileId || '');
      const mobileVariant = CENTRAL_BUILTIN_BANNER_VARIANTS[fileId] || '';
      const slide = document.createElement(mobileVariant ? 'picture' : 'div');
      const classes = ['home-hero-slide', 'hero-managed'];
      if (fileId === 'builtin:hero-posto') classes.push('hero-main');
      if (fileId.startsWith('builtin:mobile-')) classes.push('hero-mobile-only');
      if (managesBuiltinBanners && index === 0) classes.push('is-active');
      slide.className = classes.join(' ');
      if (mobileVariant) {
        const source = document.createElement('source');
        source.media = '(max-width: 767px)';
        source.srcset = mobileVariant;
        slide.appendChild(source);
      }
      const image = document.createElement('img');
      image.src = String(banner.imageUrl);
      image.alt = String(banner.title || 'Aviso da Central de Registros');
      image.loading = index === 0 ? 'eager' : 'lazy';
      image.draggable = false;
      slide.appendChild(image);
      fragment.appendChild(slide);
    });
    if (managesBuiltinBanners) {
      slidesContainer.replaceChildren(fragment);
    } else {
      slidesContainer.appendChild(fragment);
    }
    return true;
  } catch (error) {
    console.warn('Não foi possível carregar os banners administrados; usando os banners locais.', error);
    return false;
  }
}

function initHomeHeroCarousel() {
  const carousel = document.getElementById('home-hero-carousel');
  const allSlides = Array.from(carousel?.querySelectorAll('.home-hero-slide') || []);
  const dotsContainer = carousel?.querySelector('.home-hero-dots');
  const mobileQuery = window.matchMedia('(max-width: 767px)');
  let slides = [];
  let dots = [];

  if (!carousel || !allSlides.length || !dotsContainer) {
    return;
  }

  if (allSlides.length === 1) {
    allSlides[0].classList.add('is-active');
    carousel.classList.toggle('is-message-slide', !allSlides[0].classList.contains('hero-main'));
    dotsContainer.innerHTML = '<span class="is-active"></span>';
    return;
  }

  let currentSlide = 0;
  let autoplayId = null;
  let dragStartX = 0;
  let dragStartY = 0;
  let isDragging = false;

  const getActiveSlides = () => allSlides.filter((slide) => mobileQuery.matches || !slide.classList.contains('hero-mobile-only'));

  const rebuildDots = () => {
    dotsContainer.innerHTML = slides.map(() => '<span></span>').join('');
    dots = Array.from(dotsContainer.querySelectorAll('span'));
  };

  const refreshSlides = () => {
    slides = getActiveSlides();
    allSlides.forEach((slide) => slide.classList.remove('is-active'));
    rebuildDots();
    currentSlide = 0;
    showSlide(0);
  };

  const showSlide = (nextIndex) => {
    if (!slides.length) {
      return;
    }

    currentSlide = (nextIndex + slides.length) % slides.length;
    allSlides.forEach((slide) => slide.classList.remove('is-active'));
    slides[currentSlide]?.classList.add('is-active');
    dots.forEach((dot, index) => dot.classList.toggle('is-active', index === currentSlide));
    carousel.classList.toggle('is-message-slide', !slides[currentSlide]?.classList.contains('hero-main'));
  };

  const restartAutoplay = () => {
    window.clearInterval(autoplayId);
    autoplayId = window.setInterval(() => showSlide(currentSlide + 1), 10000);
  };

  const goToSlide = (direction) => {
    showSlide(currentSlide + direction);
    restartAutoplay();
  };

  const startDrag = (clientX, clientY) => {
    dragStartX = clientX;
    dragStartY = clientY;
    isDragging = true;
  };

  const finishDrag = (clientX, clientY) => {
    if (!isDragging) {
      return;
    }

    const deltaX = clientX - dragStartX;
    const deltaY = clientY - dragStartY;
    isDragging = false;

    if (Math.abs(deltaX) < 45 || Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }

    goToSlide(deltaX < 0 ? 1 : -1);
  };

  carousel.addEventListener('pointerdown', (event) => {
    startDrag(event.clientX, event.clientY);
  });

  carousel.addEventListener('pointerup', (event) => {
    finishDrag(event.clientX, event.clientY);
  });

  carousel.addEventListener('pointercancel', () => {
    isDragging = false;
  });

  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      goToSlide(-1);
    }

    if (event.key === 'ArrowRight') {
      goToSlide(1);
    }
  });

  carousel.setAttribute('tabindex', '0');
  refreshSlides();
  mobileQuery.addEventListener('change', () => {
    refreshSlides();
    restartAutoplay();
  });
  restartAutoplay();
}

window.addEventListener('DOMContentLoaded', async () => {
  await loadManagedHomeBanners();
  initHomeHeroCarousel();
});
