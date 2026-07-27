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
const MAX_RECEIPT_IMAGE_BYTES = 1200 * 1024;
const COMPRESSED_RECEIPT_MAX_SIZE = 1600;
const COMPRESSED_RECEIPT_QUALITY = 0.72;
const DRIVER_NAMES_STORAGE_KEY = 'postoscredenciados-covreecia:driver-names';
const LAST_FUEL_ENTRY_STORAGE_KEY = 'postoscredenciados-covreecia:last-fuel-entry';
const OTHER_DRIVER_OPTION = 'OUTRO (ESPECIFICAR)';
let pendingFuelWhatsAppPayload = null;
let uploadedFuelReceipt = null;
let fuelReceiptUploadPromise = null;
const DEFAULT_DRIVER_NAMES = [
  'AMANDA P. BONATTO',
  'ALAN CHRISTIE',
  'ITALO P. BONATTO',
  'ELOIS DOS SANTOS',
  'JO\u00c3O SILVA',
  'ELICARLOS ZANOTTI',
  'GLEIDSON LAURENTINO',
  'RONI VON',
  'TIAGO COVRE',
  OTHER_DRIVER_OPTION
];

const postosPorCidade = {
  'Boa Esperan\u00e7a': [
    { nome: 'Auto Posto 4 Rodas', endereco: 'Boa Esperan\u00e7a, ES', link: 'https://www.google.com/maps/place/Auto+Posto+4+Rodas/@-18.5404958,-40.2937824,826m/data=!3m2!1e3!4b1!4m6!3m5!1s0xb5956c7feac48d:0xc15be322b9fed420!8m2!3d-18.5404958!4d-40.2912075!16s%2Fg%2F1tfp3pxm' }
  ],
  Pinheiros: [
    { nome: 'Posto Rede Nater (Shell)', endereco: 'Pinheiros, ES', link: 'https://www.google.com/maps/place/Posto+Rede+Nater+(Shell)+em+Pinheiros/@-18.4168459,-40.2107607,153m/data=!3m1!1e3!4m6!3m5!1s0xb59b33d7ff34b9:0x82053208dc2a16f8!8m2!3d-18.4163054!4d-40.2110065!16s%2Fg%2F11qpbrwj22' },
    { nome: 'Posto Pinheiros', endereco: 'Pinheiros, ES', link: 'https://www.google.com/maps/place/Posto+Pinheiros/@-18.413462,-40.2128249,156m/data=!3m1!1e3!4m6!3m5!1s0xb59a1481427d61:0xeba41bb1a2b24a1e!8m2!3d-18.4135384!4d-40.2127649!16s%2Fg%2F1tj7xmm_' },
    { nome: 'Posto Nort\u00e3o', endereco: 'Pinheiros, ES', link: 'https://www.google.com/maps/place/Posto+Nort%C3%A3o/@-18.4045169,-40.2319949,1969m/data=!3m1!1e3!4m6!3m5!1s0xb59a201628e4ab:0xcd6c4ad08d8fb206!8m2!3d-18.4045175!4d-40.2258587!16s%2Fg%2F11b6yqny3l?entry=ttu&g_ep=EgoyMDI2MDEyNi4wIKXMDSoKLDEwMDc5MjA2OUgBUAM%3D' }
  ],
  'Nova Ven\u00e9cia': [
    { nome: 'Posto Cidade Alta', endereco: 'Nova Ven\u00e9cia, ES', link: 'https://www.google.com/maps/place/Posto+Cidade+Alta/@-18.693836,-40.4136076,2405m/data=!3m1!1e3!4m10!1m2!2m1!1sposto!3m6!1s0xb5db2293e5e22b:0xeb619e2ab30e53b2!8m2!3d-18.693836!4d-40.3997215!15sCgVwb3N0b1oHIgVwb3N0b5IBC2dhc19zdGF0aW9u4AEA!16s%2Fg%2F11k62_1v8g' }
  ],
  Montanha: [
    { nome: 'Posto Atl\u00e2ntico Servicentro', endereco: 'Montanha, ES', link: 'https://www.google.com/maps/place/Posto+Atlantico+Servicentro/@-18.1277285,-40.3620985,1655m/data=!3m1!1e3!4m10!1m2!2m1!1sauto+posto+servicentro+motanha!3m6!1s0xb50c56fe1af699:0xdce102eb786d422d!8m2!3d-18.1277285!4d-40.3525713!15sCh9hdXRvIHBvc3RvIHNlcnZpY2VudHJvIG1vbnRhbmhhkgELZ2FzX3N0YXRpb27gAQA!16s%2Fg%2F11hblk2rbr' }
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

document.getElementById('driver-name').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    document.getElementById('fuel-date').focus();
  }
});

document.getElementById('fuel-date').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    document.getElementById('fuel-km').focus();
  }
});

document.getElementById('fuel-km').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    document.getElementById('fuel-photo').click();
  }
});

function toggleMenu() {
  const menu = document.getElementById('menu-dropdown');
  menu.classList.toggle('hidden');
}

function closeMenu() {
  document.getElementById('menu-dropdown').classList.add('hidden');
}

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

function getStoredDriverNames() {
  try {
    const storedNames = localStorage.getItem(DRIVER_NAMES_STORAGE_KEY);
    const parsedNames = storedNames ? JSON.parse(storedNames) : [];
    const validStoredNames = Array.isArray(parsedNames) ? parsedNames : [];
    return Array.from(new Set([...DEFAULT_DRIVER_NAMES, ...validStoredNames]));
  } catch (error) {
    return [...DEFAULT_DRIVER_NAMES];
  }
}

function populateDriverOptions() {
  const driverSelect = document.getElementById('driver-name');
  if (!driverSelect) {
    return;
  }

  const currentValue = driverSelect.value;
  const driverNames = getStoredDriverNames();
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
      reject(new Error('N\u00e3o foi poss\u00edvel ler a imagem selecionada.'));
    };

    image.src = objectUrl;
  });
}

async function compressFuelReceiptIfNeeded(file) {
  if (!file || !file.type.startsWith('image/') || file.size <= MAX_RECEIPT_IMAGE_BYTES) {
    return file;
  }

  const image = await loadImageFromFile(file);
  const scale = Math.min(1, COMPRESSED_RECEIPT_MAX_SIZE / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  const compressedBlob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('N\u00e3o foi poss\u00edvel comprimir a imagem.'))),
      'image/jpeg',
      COMPRESSED_RECEIPT_QUALITY
    );
  });

  if (compressedBlob.size >= file.size) {
    return file;
  }

  const compressedName = (file.name || 'comprovante.jpg').replace(/\.[^.]+$/, '.jpg');
  return new File([compressedBlob], compressedName, {
    type: 'image/jpeg',
    lastModified: Date.now()
  });
}

function resetFuelPhotoState() {
  document.getElementById('fuel-photo').value = '';
  document.getElementById('photo-preview-container').classList.add('hidden');
  document.getElementById('photo-buttons').classList.remove('hidden');
  document.getElementById('photo-preview').src = '';
  uploadedFuelReceipt = null;
  fuelReceiptUploadPromise = null;
  updateReceiptUploadStatus('Salve o comprovante para deixar o envio pelo WhatsApp mais r\u00e1pido.');
  setFuelActionButtonsVisible(false);
  setSaveReceiptButtonVisible(true);
}

function prepareFuelForm(options = {}) {
  const { cidade = '', posto = '', useLastEntry = false } = options;
  const citySelect = document.getElementById('fuel-city');
  const stationSelect = document.getElementById('fuel-station');
  const driverInput = document.getElementById('driver-name');
  const lastFuelEntry = useLastEntry ? getLastFuelEntry() : null;
  const selectedCity = cidade || lastFuelEntry?.cidade || '';
  const selectedPosto = posto || lastFuelEntry?.posto || '';
  const selectedDriver = lastFuelEntry?.motorista || '';

  document.getElementById('fuel-form').reset();
  citySelect.value = selectedCity;
  populateDriverOptions();
  driverInput.value = selectedDriver;

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

function openFuelFormMenu() {
  document.getElementById('fuel-form-modal').classList.remove('hidden');
  prepareFuelForm({ useLastEntry: true });
}

function closeFuelForm() {
  document.getElementById('fuel-form-modal').classList.add('hidden');
  document.getElementById('fuel-form').reset();
  resetFuelPhotoState();
  setFuelDateToToday();
  populateDriverOptions();
}

function openWhatsAppDirect(numero, mensagem) {
  const webUrl = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

  try {
    const popup = window.open(webUrl, '_blank', 'noopener,noreferrer');
    if (!popup) {
      window.location.assign(webUrl);
    }
  } catch (error) {
    window.location.assign(webUrl);
  }
}

function getFuelFormData() {
  const fileInput = document.getElementById('fuel-photo');
  const data = document.getElementById('fuel-date').value;
  const dateObj = data ? new Date(`${data}T00:00:00`) : null;

  return {
    motorista: document.getElementById('driver-name').value.trim(),
    cidade: document.getElementById('fuel-city').value,
    posto: document.getElementById('fuel-station').value,
    data,
    dataFormatada: dateObj ? dateObj.toLocaleDateString('pt-BR') : '',
    km: document.getElementById('fuel-km').value.trim(),
    file: fileInput.files && fileInput.files[0]
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
    formData.data
  ].join('|');
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

function setSaveReceiptButtonVisible(isVisible) {
  const button = document.getElementById('save-receipt-btn');
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

function validateFuelReceiptUploadFields(formData) {
  if (!formData.motorista || !formData.cidade || !formData.posto || !formData.data) {
    showErrorMessage('Preencha motorista, cidade, posto e data antes de salvar o comprovante.');
    return false;
  }

  if (!formData.file) {
    showErrorMessage('Selecione uma foto do comprovante primeiro.');
    return false;
  }

  return true;
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
      showSuccessMessage('Comprovante j\u00e1 salvo. Agora \u00e9 s\u00f3 enviar pelo WhatsApp.');
    }
    return uploadedFuelReceipt.result;
  }

  if (fuelReceiptUploadPromise) {
    return fuelReceiptUploadPromise;
  }

  setSaveReceiptButtonLoading(true);
  updateReceiptUploadStatus('Comprimindo e salvando comprovante na nuvem...', 'progress');

  fuelReceiptUploadPromise = (async () => {
    const compressedFile = await compressFuelReceiptIfNeeded(formData.file);
    const renamedFile = createRenamedFuelReceiptFile(compressedFile, formData.motorista, formData.data);
    const result = await uploadFuelReceiptToCloudinary(renamedFile, {
      motorista: formData.motorista,
      cidade: formData.cidade,
      posto: formData.posto,
      data: formData.dataFormatada,
      km: formData.km
    });

    uploadedFuelReceipt = {
      key: uploadKey,
      result
    };
    updateReceiptUploadStatus('Comprovante salvo. O envio final pelo WhatsApp \u00e9 obrigat\u00f3rio para validar.', 'success');
    setSaveReceiptButtonVisible(false);
    setFuelActionButtonsVisible(true);
    if (!silent) {
      showSuccessMessage('Comprovante salvo com sucesso.');
    }

    return result;
  })();

  try {
    return await fuelReceiptUploadPromise;
  } catch (error) {
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
    `motorista=${metadata.motorista}|cidade=${metadata.cidade}|posto=${metadata.posto}|data=${metadata.data}|km=${metadata.km || 'nao informado'}`
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

async function submitFuelForm(e) {
  e.preventDefault();

  const formData = getFuelFormData();
  const uploadKey = getFuelReceiptUploadKey(formData);

  if (!formData.file) {
    showErrorMessage('Por favor, selecione uma foto do comprovante');
    return;
  }

  if (!uploadedFuelReceipt || uploadedFuelReceipt.key !== uploadKey) {
    showErrorMessage('Salve o comprovante antes de enviar pelo WhatsApp.');
    return;
  }

  const mensagem = [
    '\u26fd *REGISTRO DE ABASTECIMENTO*',
    '',
    `\ud83d\udc64 *Motorista:* ${formData.motorista}`,
    `\ud83c\udfd9\ufe0f *Cidade:* ${formData.cidade}`,
    `\u26fd *Posto:* ${formData.posto}`,
    `\ud83d\udcc5 *Data:* ${formData.dataFormatada}`,
    `\ud83d\udee3\ufe0f *KM:* ${formData.km || 'N\u00e3o informado'}`,
    `\ud83e\uddfe *Comprovante:* ${uploadedFuelReceipt.result.secure_url}`
  ].join('\n');

  openWhatsAppDirect(FUEL_WHATSAPP_NUMBER, mensagem);
  saveDriverNameSuggestion(formData.motorista);
  saveLastFuelEntry({ motorista: formData.motorista, cidade: formData.cidade, posto: formData.posto });
  document.getElementById('fuel-form').reset();
  document.getElementById('fuel-form-modal').classList.add('hidden');
  resetFuelPhotoState();
  setFuelDateToToday();
  populateDriverOptions();
  showSuccessMessage('WhatsApp aberto. Envie a mensagem para validar o abastecimento.');
}

function showSuccessMessage(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function showErrorMessage(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function openMap(link) {
  window.open(link, '_blank', 'noopener,noreferrer');
}

function openFuelForm(postoNome, cidadeNome) {
  document.getElementById('fuel-form-modal').classList.remove('hidden');
  prepareFuelForm({ cidade: cidadeNome, posto: postoNome });
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
  document.getElementById('welcome-screen').classList.remove('hidden');
  document.getElementById('postos-display').classList.add('hidden');
  document.getElementById('dashboard').classList.add('hidden');
  currentView = 'welcome';
  updateBackButtonVisibility();
}

function showDashboard() {
  document.getElementById('welcome-screen').classList.add('hidden');
  document.getElementById('postos-display').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  currentView = 'dashboard';
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
  postosDisplay.classList.remove('hidden');
  currentView = 'postos';
  updateBackButtonVisibility();
}

function backToSearch() {
  document.getElementById('postos-display').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  currentView = 'dashboard';
  updateBackButtonVisibility();
}

function updateBackButtonVisibility() {
  const backButton = document.getElementById('back-button');
  if (currentView === 'welcome') {
    backButton.classList.add('hidden');
  } else {
    backButton.classList.remove('hidden');
  }
}

function updatePhotoPreview() {
  const fileInput = document.getElementById('fuel-photo');
  const previewContainer = document.getElementById('photo-preview-container');
  const photoButtons = document.getElementById('photo-buttons');
  const preview = document.getElementById('photo-preview');
  uploadedFuelReceipt = null;
  fuelReceiptUploadPromise = null;

  if (fileInput.files && fileInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.src = e.target.result;
      previewContainer.classList.remove('hidden');
      photoButtons.classList.add('hidden');
      updateReceiptUploadStatus('Clique em Salvar comprovante para antecipar o upload.', 'neutral');
      setSaveReceiptButtonVisible(true);
      setFuelActionButtonsVisible(false);
    };
    reader.readAsDataURL(fileInput.files[0]);
  }
}

function deletePhoto() {
  resetFuelPhotoState();
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
  const fileInput = document.getElementById('fuel-photo');
  fileInput.setAttribute('capture', 'environment');
  fileInput.click();
}

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

window.addEventListener('DOMContentLoaded', function() {
  if (window.lucide) {
    lucide.createIcons();
  }
});
