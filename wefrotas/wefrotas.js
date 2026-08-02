let allVehicles = [];
    let allDrivers = [];
    let allSuppliers = [];
    let allOrders = [];
    let allFinanceEntries = [];
    let allAdministrations = [];
    let deletedOrders = [];
    const globalSearchInputEl = document.getElementById('global-search-input');
    const globalSearchResultsEl = document.getElementById('global-search-results');
    const mobileGlobalSearchInputEl = document.getElementById('mobile-global-search-input');
    const mobileGlobalSearchResultsEl = document.getElementById('mobile-global-search-results');
    const searchFocusOverlayEl = document.getElementById('search-focus-overlay');
    const mobileSearchBtnEl = document.getElementById('mobile-search-btn');
    const mobileSearchBackdropEl = document.getElementById('mobile-search-backdrop');
    const mobileSearchModalEl = document.getElementById('mobile-search-modal');
    const sidebarToggleBtnEl = document.getElementById('sidebar-toggle-btn');
    const appLayoutEl = document.querySelector('.app-layout');
    const ecosystemModules = [
      { name: 'WeTime', description: 'Relógio online e painel de horário', url: 'https://gaveblue.com.br/wetime' },
      { name: 'WeRecibos', description: 'Gerador de recibos', url: 'https://gaveblue.com.br/recibos' },
      { name: 'WeConsultas', description: 'Consultas empresariais', url: 'https://gaveblue.com.br/weconsultas' },
      { name: 'WeFrotas', description: 'Gestão de frotas', url: 'https://gaveblue.com.br/wefrotas' },
      { name: 'WeDevs', description: 'Ferramentas e utilidades dev', url: 'https://gaveblue.com.br/wedevs' },
      { name: 'WeTasks', description: 'Tarefas e organização', url: 'https://gaveblue.com.br/wetasks' }
    ];
    let selectedVehicles = new Set();
    let selectedDrivers = new Set();
    let selectedSuppliers = new Set();
    let selectedOrders = new Set();
    let selectedFinance = new Set();
    let financeSortState = { key: 'default', direction: 'desc' };
    let orderSortState = { key: 'default', direction: 'desc' };
    let orderVehicleFilterId = '';
    let vehicleSortState = { key: 'fleet', direction: 'asc' };
    let driverSortState = { key: 'name', direction: 'asc' };
    let supplierSortState = { key: 'name', direction: 'asc' };
    let currentModalType = null;
    let currentEditingId = null;
    let currentFinanceEntryType = null;
    let orderViewerZoom = 1;
    let systemNotifications = [];
    let pendingBatchImportEntity = null;
    let pendingPromptConfirm = null;
    let pendingPromptCancel = null;
    let filteredModules = [];
    let highlightedModuleIndex = -1;
    let activeSearchInputEl = null;
    let activeSearchResultsEl = null;
    let sidebarCollapsed = false;
    let orderCounter = 1;
    let managerDisplayName = 'Gestor';
    let allowManualOrderNumberEditing = false;
    const wefrotasLogoSrc = new URL('wefrotas.png', window.location.href).href;
    const wefrotasIndexedDbName = 'wefrotas_app_storage';
    const wefrotasIndexedDbVersion = 1;
    const wefrotasIndexedDbStore = 'snapshots';
    const wefrotasIndexedDbSnapshotKey = 'current';
    const wefrotasLegacyLargeKeys = [
      'wefrotas_vehicles',
      'wefrotas_drivers',
      'wefrotas_suppliers',
      'wefrotas_orders',
      'wefrotas_finance',
      'wefrotas_deleted_orders',
      'wefrotas_notifications'
    ];
    let wefrotasDbConnection = null;
    let wefrotasStorageEngine = 'localStorage';
    let wefrotasStorageQueue = Promise.resolve();
    let customLogoEnabled = false;
    let customLogoUrl = '';
    let customLogoScale = 60;
    let receiptViewerZoomLevel = 1;
    const importedDriverVehiclePlateMap = {
      amanda: 'TOJ1D23'
    };
    let promptModalConfig = {
      allowEmpty: false,
      exactValue: '',
      confirmLabel: 'Confirmar',
      cancelLabel: 'Cancelar',
      mode: 'prompt',
      closeOnBackdrop: true
    };

    function generateId() {
      return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    function getLocalIsoDate() {
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      return new Date(now.getTime() - offset).toISOString().slice(0, 10);
    }

    function getActiveLogoSrc() {
      return customLogoEnabled && customLogoUrl ? customLogoUrl : wefrotasLogoSrc;
    }

    function getReportLogoStyle() {
      const scale = Number(customLogoScale || 60) / 100;
      return {
        width: Math.round(320 * scale),
        height: Math.round(110 * scale)
      };
    }

    function getOsLogoStyle() {
      const scale = Number(customLogoScale || 60) / 100;
      return {
        width: Math.round(220 * scale),
        height: Math.round(78 * scale)
      };
    }

    function getNextOrderCounterValue() {
      const maxOrderNumber = allOrders.reduce((maxValue, order) => {
        const numericValue = getNumericOrderValue(order?.numero);
        return Number.isFinite(numericValue) ? Math.max(maxValue, numericValue) : maxValue;
      }, 0);
      return Math.max(Number(orderCounter) || 1, maxOrderNumber + 1, 1);
    }

    function syncOrderCounterWithOrders() {
      orderCounter = getNextOrderCounterValue();
    }

    function updateCustomLogoUi() {
      const toggleButton = document.getElementById('settings-custom-logo-toggle');
      const fileInput = document.getElementById('settings-custom-logo-file');
      const preview = document.getElementById('settings-custom-logo-preview');
      const hint = document.getElementById('settings-custom-logo-hint');
      const sizeInput = document.getElementById('settings-custom-logo-size');
      const sizeLabel = document.getElementById('settings-custom-logo-size-label');
      if (!toggleButton || !fileInput || !preview || !hint || !sizeInput || !sizeLabel) return;

      sizeInput.value = String(customLogoScale || 60);
      sizeLabel.textContent = `${customLogoScale || 60}%`;
      toggleButton.textContent = customLogoEnabled ? 'Desativar logo personalizada' : 'Ativar logo personalizada';
      toggleButton.classList.toggle('active', customLogoEnabled);
      preview.hidden = !customLogoUrl;
      preview.src = customLogoUrl || '';
      hint.textContent = customLogoEnabled && customLogoUrl
        ? 'A logo personalizada está ativa e será usada nas OS e relatórios.'
        : customLogoUrl
          ? 'A imagem foi carregada. Ative ou salve a personalização para usar essa logo nas OS e relatórios.'
          : 'Envie uma imagem do seu computador. Se a chave estiver desligada, o sistema continua usando a logo padrão.';
    }

    function getNameInitials(value, fallback = 'GB') {
      const parts = String(value || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      if (!parts.length) return fallback;
      return parts
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase();
    }

    function updateManagerIdentityUi() {
      const nameNode = document.getElementById('sidebar-user-name');
      const avatarNode = document.getElementById('sidebar-user-avatar');
      const topbarAvatarNode = document.getElementById('topbar-avatar');
      const initials = getNameInitials(managerDisplayName, 'GB');
      if (nameNode) nameNode.textContent = managerDisplayName || 'Gestor';
      if (avatarNode) avatarNode.textContent = initials;
      if (topbarAvatarNode) topbarAvatarNode.textContent = initials;
    }

    function updateOperationSettingsUi() {
      const adminInput = document.getElementById('settings-manager-name');
      const toggleButton = document.getElementById('settings-order-number-edit-toggle');
      const hint = document.getElementById('settings-order-number-edit-hint');
      if (adminInput) adminInput.value = managerDisplayName || '';
      renderAdministrationSettings();
      if (toggleButton) {
        toggleButton.textContent = allowManualOrderNumberEditing
          ? 'Travar edição do número da OS'
          : 'Destravar edição do número da OS';
        toggleButton.classList.toggle('active', allowManualOrderNumberEditing);
      }
      if (hint) {
        hint.textContent = allowManualOrderNumberEditing
          ? 'A edição manual está liberada. Se você usar um número maior, a próxima OS continuará a partir dele.'
          : 'A edição está travada. O sistema mantém a sequência automática com base no maior número já usado.';
      }
    }

    function renderAdministrationSettings() {
      const listNode = document.getElementById('settings-administration-list');
      if (!listNode) return;
      const administrations = getAdministrationOptions();
      if (!administrations.length) {
        listNode.innerHTML = '<div class="settings-empty-line">Nenhuma administração cadastrada.</div>';
        return;
      }
      listNode.innerHTML = administrations.map(name => `
        <div class="settings-chip-item">
          <span>${escapeHtml(name)}</span>
          <button type="button" onclick="removeAdministrationSetting('${encodeURIComponent(name)}')" aria-label="Remover ${escapeHtml(name)}">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 6l12 12M18 6L6 18"/>
            </svg>
          </button>
        </div>
      `).join('');
    }

    async function addAdministrationSetting() {
      const input = document.getElementById('settings-administration-name');
      const value = String(input?.value || '').trim();
      if (!value) {
        showToast('Informe o nome da administração.');
        return;
      }
      const exists = getAdministrationOptions()
        .some(name => name.localeCompare(value, 'pt-BR', { sensitivity: 'base' }) === 0);
      if (exists) {
        showToast('Essa administração já está cadastrada.');
        return;
      }
      allAdministrations = normalizeAdministrationList([...allAdministrations, value]);
      if (input) input.value = '';
      renderAdministrationSettings();
      await saveToLocalStorage();
      showToast('Administração cadastrada com sucesso.');
    }

    async function removeAdministrationSetting(encodedName) {
      const name = decodeURIComponent(encodedName || '');
      allAdministrations = normalizeAdministrationList(allAdministrations.filter(item => item !== name));
      renderAdministrationSettings();
      await saveToLocalStorage();
      showToast('Administração removida.');
    }

    function toggleOrderNumberEditing() {
      allowManualOrderNumberEditing = !allowManualOrderNumberEditing;
      updateOperationSettingsUi();
    }

    window.addAdministrationSetting = addAdministrationSetting;
    window.removeAdministrationSetting = removeAdministrationSetting;

    async function saveOperationSettings() {
      const adminInput = document.getElementById('settings-manager-name');
      managerDisplayName = String(adminInput?.value || '').trim() || 'Gestor';
      updateManagerIdentityUi();
      updateOperationSettingsUi();
      await saveToLocalStorage();
      showToast(`Gestor atualizado para ${managerDisplayName}. Alteração salva com sucesso.`);
    }

    function toggleCustomLogoEnabled() {
      if (!customLogoEnabled && !customLogoUrl) {
        showToast('Envie uma logo antes de ativar a personalização.');
        return;
      }
      customLogoEnabled = !customLogoEnabled;
      updateCustomLogoUi();
    }

    function handleCustomLogoUpload(event) {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        showToast('Selecione um arquivo de imagem válido.');
        event.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        customLogoUrl = String(loadEvent.target?.result || '');
        customLogoEnabled = true;
        updateCustomLogoUi();
        showToast('Logo carregada. Agora clique em salvar para aplicar.');
      };
      reader.readAsDataURL(file);
    }

    function saveCustomLogoSettings() {
      if (customLogoEnabled && !customLogoUrl) {
        showToast('Envie uma logo para ativar a personalização.');
        return;
      }

      openSettingsFeedback('loading', 'Salvando personalização', 'Aguarde enquanto aplicamos a sua logo personalizada.');
      const sizeInput = document.getElementById('settings-custom-logo-size');
      customLogoScale = Number(sizeInput?.value || 60);
      saveToLocalStorage();
      updateCustomLogoUi();
      setTimeout(() => {
        openSettingsFeedback(
          'success',
          customLogoEnabled ? 'Logo personalizada salva' : 'Logo padrão restaurada',
          customLogoEnabled
            ? 'A sua personalização foi salva com sucesso e já está pronta para uso nas OS e relatórios.'
            : 'O sistema voltou a usar a logo padrão com sucesso.'
        );
      }, 700);
    }

    function formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(`${dateString}T00:00:00`);
      if (Number.isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('pt-BR');
    }

    function formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
    }

    function formatCurrencyInputValue(value) {
      if (typeof value === 'number' && Number.isFinite(value)) {
        return formatCurrency(value);
      }
      if (typeof value === 'string' && /[Rr]\$|,|\./.test(value)) {
        return formatCurrency(parseCurrencyInputValue(value));
      }
      const digits = String(value || '').replace(/\D/g, '');
      const numericValue = Number(digits || 0) / 100;
      return formatCurrency(numericValue);
    }

    function parseCurrencyInputValue(value) {
      const digits = String(value || '').replace(/\D/g, '');
      return Number(digits || 0) / 100;
    }

    function toCurrencyCents(value) {
      return Math.round(Number(value || 0) * 100);
    }

    function applyCurrencyMaskToInput(input) {
      if (!input) return;
      if (String(input.value || '').trim() !== '') {
        input.value = formatCurrencyInputValue(input.value);
      }
      if (input.dataset.currencyMaskBound === 'true') return;
      input.dataset.currencyMaskBound = 'true';
      input.addEventListener('input', () => {
        const digits = String(input.value || '').replace(/\D/g, '');
        input.value = digits ? formatCurrencyInputValue(digits) : '';
      });
    }

    function daysUntil(dateString) {
      if (!dateString) return null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const target = new Date(`${dateString}T00:00:00`);
      if (Number.isNaN(target.getTime())) return null;
      return Math.ceil((target.getTime() - today.getTime()) / 86400000);
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function requiredLabel(text) {
      return `${text} <span class="required-mark">*</span>`;
    }

    const modalIcons = {
      default: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M7 3h7l5 5v13H7z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M14 3v5h5"/></svg>',
      order: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M7 3h7l5 5v13H7z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M14 3v5h5M10 13h6M10 17h4"/></svg>',
      finance: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M4 7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M16 11h4v5h-4a2.5 2.5 0 010-5zM7 9h5"/></svg>',
      fuel: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M6 21V5a2 2 0 012-2h5a2 2 0 012 2v16"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M9 7h3M15 8h1.5L20 11.5V18a2 2 0 01-2 2h-1"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M8 13h5"/></svg>',
      expense: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M7 3h7l5 5v13H7z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M14 3v5h5M11 12h4M10 16h6"/></svg>'
    };

    const fieldIcons = {
      hash: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 4L7 20M17 4l-2 16M4 9h16M3 15h16"/>',
      document: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M7 3h7l5 5v13H7z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M14 3v5h5M10 13h6M10 17h4"/>',
      building: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M4 21V7l8-4 8 4v14M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
      flag: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M6 21V4M7 4h10l-1.5 4L17 12H7"/>',
      calendar: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M7 3v3M17 3v3M4 8h16M6 5h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z"/>',
      vehicle: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M4 13l2-5h12l2 5M5 13h14v5H5z"/><circle cx="8" cy="18" r="1.5"/><circle cx="16" cy="18" r="1.5"/>',
      user: '<circle cx="12" cy="8" r="3.2" stroke-width="1.9"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M5 20c0-3.314 3.134-6 7-6s7 2.686 7 6"/>',
      edit: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M4 20h4l10.5-10.5a2.1 2.1 0 00-3-3L5 17v3z"/>',
      money: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M12 3v18M16.5 7.5c0-1.933-2.015-3.5-4.5-3.5S7.5 5.567 7.5 7.5 9.515 11 12 11s4.5 1.567 4.5 3.5S14.485 18 12 18s-4.5-1.567-4.5-3.5"/>',
      fuel: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M6 21V5a2 2 0 012-2h5a2 2 0 012 2v16M9 7h3M15 8h1.5L20 11.5V18a2 2 0 01-2 2h-1"/>',
      droplet: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z"/>',
      speed: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M4 15a8 8 0 1116 0"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M12 15l4-4"/>',
      store: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M4 10h16l-1-5H5zM6 10v10h12V10M9 20v-5h6v5"/>'
    };

    function setModalVisual(theme = 'default', subtitle = 'Preencha as informações para continuar.') {
      const card = document.getElementById('cadastro-modal-card');
      const icon = document.getElementById('modal-icon');
      const subtitleNode = document.getElementById('modal-subtitle');
      if (card) card.dataset.theme = theme;
      if (icon) icon.innerHTML = modalIcons[theme] || modalIcons.default;
      if (subtitleNode) subtitleNode.textContent = subtitle;
    }

    function fieldIcon(name) {
      return `<span class="form-field-icon" aria-hidden="true"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">${fieldIcons[name] || fieldIcons.document}</svg></span>`;
    }

    function onlyDigits(value) {
      return String(value || '').replace(/\D/g, '');
    }

    function formatCpf(value) {
      const digits = onlyDigits(value).slice(0, 11);
      return digits
        .replace(/^(\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1-$2');
    }

    function formatCnpj(value) {
      const digits = onlyDigits(value).slice(0, 14);
      return digits
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }

    function formatCpfOrCnpj(value) {
      const digits = onlyDigits(value);
      return digits.length <= 11 ? formatCpf(digits) : formatCnpj(digits);
    }

    function isRepeatedDigits(value) {
      return /^(\d)\1+$/.test(value);
    }

    function isValidCpf(value) {
      const cpf = onlyDigits(value);
      if (cpf.length !== 11 || isRepeatedDigits(cpf)) return false;
      let sum = 0;
      for (let i = 0; i < 9; i += 1) sum += Number(cpf[i]) * (10 - i);
      let firstDigit = (sum * 10) % 11;
      if (firstDigit === 10) firstDigit = 0;
      if (firstDigit !== Number(cpf[9])) return false;
      sum = 0;
      for (let i = 0; i < 10; i += 1) sum += Number(cpf[i]) * (11 - i);
      let secondDigit = (sum * 10) % 11;
      if (secondDigit === 10) secondDigit = 0;
      return secondDigit === Number(cpf[10]);
    }

    function isValidCnpj(value) {
      const cnpj = onlyDigits(value);
      if (cnpj.length !== 14 || isRepeatedDigits(cnpj)) return false;
      const calcDigit = (base, factors) => {
        const total = base.split('').reduce((sum, digit, index) => sum + (Number(digit) * factors[index]), 0);
        const remainder = total % 11;
        return remainder < 2 ? 0 : 11 - remainder;
      };
      const base = cnpj.slice(0, 12);
      const digit1 = calcDigit(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
      const digit2 = calcDigit(base + digit1, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
      return cnpj === `${base}${digit1}${digit2}`;
    }

    function attachModalInputMasks() {
      const driverCpf = document.getElementById('driver-cpf');
      const supplierDocument = document.getElementById('supplier-document');
      if (driverCpf) {
        driverCpf.addEventListener('input', () => {
          driverCpf.value = formatCpf(driverCpf.value);
        });
      }
      if (supplierDocument) {
        supplierDocument.addEventListener('input', () => {
          supplierDocument.value = formatCpfOrCnpj(supplierDocument.value);
        });
      }
      ['finance-total', 'finance-group-base-total', 'finance-group-total', 'finance-group-discount', 'finance-group-surcharge', 'finance-close-total', 'finance-close-discount'].forEach((id) => {
        applyCurrencyMaskToInput(document.getElementById(id));
      });
    }

    function syncFuelGroupingTotals() {
      const baseInput = document.getElementById('finance-group-base-total');
      const totalInput = document.getElementById('finance-group-total');
      const discountInput = document.getElementById('finance-group-discount');
      const surchargeInput = document.getElementById('finance-group-surcharge');
      const helperNode = document.getElementById('finance-group-total-helper');
      if (!baseInput || !totalInput || !discountInput || !surchargeInput) return;

      const source = document.body.dataset.financeGroupSyncSource || 'total';
      const baseTotal = parseCurrencyInputValue(baseInput.value || 0);
      let discount = parseCurrencyInputValue(discountInput.value || 0);
      let surcharge = parseCurrencyInputValue(surchargeInput.value || 0);
      let total = parseCurrencyInputValue(totalInput.value || 0);

      if (source === 'total') {
        if (total < baseTotal) {
          discount = baseTotal - total;
          surcharge = 0;
        } else if (total > baseTotal) {
          surcharge = total - baseTotal;
          discount = 0;
        } else {
          discount = 0;
          surcharge = 0;
        }
      } else {
        if (discount > 0 && surcharge > 0) {
          surcharge = 0;
        }
        total = Math.max(baseTotal - discount + surcharge, 0);
      }

      discount = toCurrencyCents(discount) / 100;
      surcharge = toCurrencyCents(surcharge) / 100;
      total = toCurrencyCents(total) / 100;

      discountInput.value = discount ? formatCurrencyInputValue(discount) : '';
      surchargeInput.value = surcharge ? formatCurrencyInputValue(surcharge) : '';
      totalInput.value = formatCurrencyInputValue(total);

      if (!helperNode) return;
      if (discount > 0) {
        helperNode.textContent = `Divergência identificada: desconto aplicado de ${formatCurrency(discount)} sobre a soma das notinhas.`;
      } else if (surcharge > 0) {
        helperNode.textContent = `Divergência identificada: acréscimo de ${formatCurrency(surcharge)} sobre a soma das notinhas.`;
      } else {
        helperNode.textContent = 'O valor final está igual à soma automática das notinhas.';
      }
    }

    function navigateToModule(url) {
      window.location.href = url;
    }

    function openGlobalSearchModule(module) {
      if (!module) return;
      hideGlobalSearchResults();
      if (module.module) {
        showModule(module.module, getModuleNavButton(module.module));
        return;
      }
      navigateToModule(module.url);
    }

    function setActiveSearchContext(inputEl, resultsEl) {
      activeSearchInputEl = inputEl;
      activeSearchResultsEl = resultsEl;
    }

    function openMobileSearch() {
      if (!mobileSearchModalEl || !mobileSearchBackdropEl || !mobileGlobalSearchInputEl) return;
      mobileSearchModalEl.classList.add('open');
      mobileSearchBackdropEl.classList.add('open');
      setActiveSearchContext(mobileGlobalSearchInputEl, mobileGlobalSearchResultsEl);
      updateGlobalSearch(mobileGlobalSearchInputEl.value || '');
      setTimeout(() => mobileGlobalSearchInputEl.focus(), 40);
    }

    function closeMobileSearch() {
      if (!mobileSearchModalEl || !mobileSearchBackdropEl) return;
      mobileSearchModalEl.classList.remove('open');
      mobileSearchBackdropEl.classList.remove('open');
      if (mobileGlobalSearchResultsEl) {
        mobileGlobalSearchResultsEl.classList.add('hidden');
      }
    }

    function hideGlobalSearchResults() {
      globalSearchResultsEl.classList.add('hidden');
      if (mobileGlobalSearchResultsEl) mobileGlobalSearchResultsEl.classList.add('hidden');
      searchFocusOverlayEl.classList.add('hidden');
      closeMobileSearch();
      highlightedModuleIndex = -1;
    }

    function syncHighlightedGlobalSearchItem() {
      const items = (activeSearchResultsEl || globalSearchResultsEl).querySelectorAll('.global-search-item');
      items.forEach((item, index) => {
        item.classList.toggle('active', index === highlightedModuleIndex);
      });
    }

    function renderGlobalSearchResults(modules, resultsEl = globalSearchResultsEl) {
      filteredModules = modules;
      highlightedModuleIndex = modules.length ? 0 : -1;
      activeSearchResultsEl = resultsEl;

      if (!modules.length) {
        resultsEl.innerHTML = '<div class="global-search-empty">Nenhum módulo encontrado.</div>';
        resultsEl.classList.remove('hidden');
        if (resultsEl === globalSearchResultsEl) {
          searchFocusOverlayEl.classList.remove('hidden');
        }
        return;
      }

      resultsEl.innerHTML = modules.map((module, index) => `
        <button type="button" class="global-search-item${index === highlightedModuleIndex ? ' active' : ''}" data-url="${module.url || ''}" data-module="${module.module || ''}">
          <span>
            <span class="global-search-kicker">Ecossistema GaveBlue</span>
            <span class="block font-semibold text-sm">${escapeHtml(module.name)}</span>
            <span class="global-search-route">${escapeHtml(module.description)}</span>
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:rgba(191,219,254,0.95)">
            <path d="M7 17L17 7" stroke-width="2" stroke-linecap="round"></path>
            <path d="M9 7H17V15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        </button>
      `).join('');

      resultsEl.classList.remove('hidden');
      if (resultsEl === globalSearchResultsEl) {
        searchFocusOverlayEl.classList.remove('hidden');
      }
    }

    function updateGlobalSearch(query, resultsEl = activeSearchResultsEl || globalSearchResultsEl) {
      const normalizedQuery = query.trim().toLowerCase();
      if (!normalizedQuery) {
        renderGlobalSearchResults(ecosystemModules, resultsEl);
        return;
      }

      const modules = ecosystemModules.filter((module) =>
        module.name.toLowerCase().includes(normalizedQuery) ||
        module.description.toLowerCase().includes(normalizedQuery)
      );

      renderGlobalSearchResults(modules, resultsEl);
    }

    function getVehicleLabel(vehicleId) {
      const vehicle = allVehicles.find(item => item.id === vehicleId);
      return vehicle ? `${vehicle.numeroFrota}  ${vehicle.placa}  ${vehicle.modelo}` : 'Veículo não encontrado';
    }

    function getNumericOrderValue(value) {
      const digits = String(value || '').replace(/\D/g, '');
      return digits ? Number(digits) : Number.MAX_SAFE_INTEGER;
    }

    function getSortedVehicles() {
      return allVehicles
        .slice()
        .sort((a, b) => {
          const numberCompare = getNumericOrderValue(a.numeroFrota) - getNumericOrderValue(b.numeroFrota);
          if (numberCompare !== 0) return numberCompare;
          return `${a.placa || ''} ${a.modelo || ''}`.localeCompare(`${b.placa || ''} ${b.modelo || ''}`, 'pt-BR');
        });
    }

    function getSortedDrivers() {
      return allDrivers
        .slice()
        .sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR', { sensitivity: 'base' }));
    }

    function getAdministrationOptions() {
      return Array.from(new Set(allAdministrations.map(name => String(name || '').trim()).filter(Boolean)))
        .sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
    }

    function getLastAdministrationValue() {
      return String(getAdministrationOptions()[0] || '').trim();
    }

    function collectLegacyAdministrationOptions() {
      return Array.from(new Set(allOrders
        .map(order => String(order.administracao || '').trim())
        .filter(Boolean)))
        .sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
    }

    function normalizeAdministrationList(list = []) {
      return Array.from(new Set((Array.isArray(list) ? list : [])
        .map(name => String(name || '').trim())
        .filter(Boolean)))
        .sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
    }

    function getSortedSuppliers(suppliers = allSuppliers) {
      return suppliers
        .slice()
        .sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR', { sensitivity: 'base' }));
    }

    function getVehicleAutocompleteLabel(vehicle) {
      return `${vehicle.numeroFrota || '-'} - ${vehicle.placa || '-'} - ${vehicle.modelo || 'Veículo'}`;
    }

    function getOpenOrdersSorted() {
      return allOrders
        .filter(order => order.status !== 'fechada')
        .slice()
        .sort((a, b) => getNumericOrderValue(a.numero) - getNumericOrderValue(b.numero));
    }

    function getOrderAutocompleteLabel(order) {
      const vehicle = allVehicles.find(item => item.id === order.vehicleId);
      return `OS ${getOrderNumberLabel(order)} - ${vehicle?.numeroFrota || '-'} - ${vehicle?.placa || '-'} - ${vehicle?.modelo || 'Veículo'}`;
    }

    function getSupplierAutocompleteLabel(supplier) {
      return supplier?.nome || '';
    }

    function getSupplierSearchText(supplier) {
      return [
        supplier?.nome,
        supplier?.tipoLabel,
        supplier?.tipo,
        supplier?.documento,
        supplier?.telefone,
        supplier?.email,
        supplier?.observacoes
      ].filter(Boolean).join(' ');
    }

    function getMeaningfulSupplierTokens(value) {
      const ignoredTokens = new Set([
        'auto',
        'combustivel',
        'combustiveis',
        'ltda',
        'posto',
        'rede',
        'servicos',
        'shell'
      ]);
      return normalizeComparableText(value)
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .split(/\s+/)
        .filter(token => token.length > 2 && !ignoredTokens.has(token));
    }

    function getStringDistance(a, b) {
      const source = String(a || '');
      const target = String(b || '');
      if (source === target) return 0;
      if (!source) return target.length;
      if (!target) return source.length;

      const rows = Array.from({ length: source.length + 1 }, (_, index) => [index]);
      for (let column = 1; column <= target.length; column += 1) rows[0][column] = column;
      for (let row = 1; row <= source.length; row += 1) {
        for (let column = 1; column <= target.length; column += 1) {
          const cost = source[row - 1] === target[column - 1] ? 0 : 1;
          rows[row][column] = Math.min(
            rows[row - 1][column] + 1,
            rows[row][column - 1] + 1,
            rows[row - 1][column - 1] + cost
          );
        }
      }
      return rows[source.length][target.length];
    }

    function areSupplierTokensSimilar(a, b) {
      if (a === b) return true;
      if (a.length < 4 || b.length < 4) return false;
      return getStringDistance(a, b) <= 1;
    }

    function normalizeOrderNumberInput(value) {
      const digits = String(value || '').replace(/\D/g, '');
      if (!digits) return '';
      return String(Number(digits));
    }

    function findOrderNumberDuplicate(numero, excludeId = '') {
      const normalized = normalizeOrderNumberInput(numero);
      if (!normalized) return null;
      return allOrders.find(order => order.id !== excludeId && normalizeOrderNumberInput(order.numero) === normalized) || null;
    }

    function resolveVehicleFromSearch(rawValue, vehicles = getSortedVehicles()) {
      const normalized = normalizeSearchText(rawValue);
      if (!normalized) return null;

      const exactMatch = vehicles.find(vehicle =>
        normalizeSearchText(getVehicleAutocompleteLabel(vehicle)) === normalized
        || normalizeSearchText(vehicle.numeroFrota) === normalized
        || normalizeSearchText(vehicle.placa) === normalized
      );
      if (exactMatch) return exactMatch;

      const matches = vehicles.filter(vehicle =>
        normalizeSearchText(getVehicleAutocompleteLabel(vehicle)).includes(normalized)
        || normalizeSearchText(vehicle.numeroFrota).includes(normalized)
        || normalizeSearchText(vehicle.placa).includes(normalized)
      );
      return matches.length === 1 ? matches[0] : null;
    }

    function resolveOrderFromSearch(rawValue, orders = getOpenOrdersSorted()) {
      const normalized = normalizeSearchText(rawValue);
      const cleanNormalized = normalized.replace(/^os\s*/i, '');
      if (!normalized) return null;

      const exactMatch = orders.find(order =>
        normalizeSearchText(getOrderAutocompleteLabel(order)) === normalized
        || normalizeSearchText(getOrderNumberLabel(order)) === cleanNormalized
      );
      if (exactMatch) return exactMatch;

      const matches = orders.filter(order =>
        normalizeSearchText(getOrderAutocompleteLabel(order)).includes(normalized)
        || normalizeSearchText(getOrderNumberLabel(order)).includes(cleanNormalized)
      );
      return matches.length === 1 ? matches[0] : null;
    }

    function resolveSupplierFromSearch(rawValue, suppliers = allSuppliers) {
      const normalized = normalizeComparableText(rawValue);
      if (!normalized) return null;

      const exactMatch = suppliers.find(supplier =>
        normalizeComparableText(supplier.nome) === normalized
        || normalizeComparableText(supplier.documento) === normalized
      );
      if (exactMatch) return exactMatch;

      const matches = suppliers.filter(supplier =>
        normalizeComparableText(getSupplierSearchText(supplier)).includes(normalized)
      );
      return matches.length === 1 ? matches[0] : null;
    }

    function resolveSupplierByRelevantTerms(rawValue, suppliers = allSuppliers) {
      const normalized = normalizeComparableText(rawValue);
      if (!normalized) return null;

      const directMatch = resolveSupplierFromSearch(rawValue, suppliers);
      if (directMatch) return directMatch;

      const inputTokens = getMeaningfulSupplierTokens(rawValue);
      if (!inputTokens.length) return null;

      const scoredMatches = suppliers
        .map((supplier) => {
          const supplierTokens = getMeaningfulSupplierTokens(getSupplierSearchText(supplier));
          const score = inputTokens.reduce((total, inputToken) => {
            const hasExactToken = supplierTokens.includes(inputToken);
            const hasSimilarToken = supplierTokens.some(supplierToken => areSupplierTokensSimilar(inputToken, supplierToken));
            return total + (hasExactToken ? 10 : hasSimilarToken ? 7 : 0);
          }, 0);
          return { supplier, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score);

      if (!scoredMatches.length) return null;
      const [firstMatch, secondMatch] = scoredMatches;
      if (!secondMatch || firstMatch.score >= secondMatch.score + 3) {
        return firstMatch.supplier;
      }
      return null;
    }

    function bindAutocompleteField({ inputId, hiddenId, items, labelGetter, resolver }) {
      const input = document.getElementById(inputId);
      const hidden = document.getElementById(hiddenId);
      if (!input || !hidden) return;

      const syncValue = () => {
        const rawValue = input.value.trim();
        if (!rawValue) {
          hidden.value = '';
          return;
        }
        const exactMatch = items.find(item => labelGetter(item).toLowerCase() === rawValue.toLowerCase());
        const resolved = exactMatch || resolver(rawValue, items);
        hidden.value = resolved ? resolved.id : '';
      };

      input.addEventListener('input', syncValue);
      input.addEventListener('change', syncValue);
      syncValue();
    }

    function bindSupplierSearchDisplay() {
      const input = document.getElementById('finance-supplier-search');
      const hidden = document.getElementById('finance-supplier-id');
      if (!input || !hidden) return;
      const syncDisplay = () => {
        const supplier = allSuppliers.find(item => item.id === hidden.value)
          || resolveSupplierByRelevantTerms(input.value, allSuppliers);
        if (!supplier) return;
        hidden.value = supplier.id;
        input.value = supplier.nome || '';
        toggleFinanceSpecificFields();
      };
      input.addEventListener('change', syncDisplay);
      input.addEventListener('blur', syncDisplay);
    }

    function getDriverLabel(driverId) {
      const driver = allDrivers.find(item => item.id === driverId);
      return driver ? driver.nome : 'Responsável não encontrado';
    }

    function getOrderNumberLabel(order) {
      return String(order.numero || '').padStart(4, '0');
    }

    function getFinanceTotal(entry) {
      return Number(entry.total || 0);
    }

    function getFinanceNetTotal(entry) {
      const total = getFinanceTotal(entry);
      return entry?.kind === 'receita' ? -total : total;
    }

    function sumFinanceNetTotal(entries) {
      return entries.reduce((sum, entry) => sum + getFinanceNetTotal(entry), 0);
    }

    function normalizeFinanceNoteLabel(value) {
      const rawValue = String(value || '').trim();
      if (!rawValue) return '';
      const withoutPrefix = rawValue.replace(/^nf[\s.:/-]*/i, '').trim();
      return withoutPrefix ? `NF ${withoutPrefix}` : '';
    }

    function getFinanceAdjustmentBaseTotal(entry) {
      if (isFinanceGroupEntry(entry)) {
        return getFinanceGroupChildren(entry).reduce((sum, item) => sum + getFinanceTotal(item), 0);
      }
      return Number(entry?.baseTotal || entry?.total || 0);
    }

    function isFinanceEntryLockedForEditing(entry) {
      if (!entry) return false;
      if (entry.groupedIntoId) return true;
      return !!entry.closedExpense || !!entry.orderId || ['pendente_os', 'distribuido'].includes(getFinanceEntryStatus(entry));
    }

    function getLinkedFinanceOrder(entry) {
      if (!entry?.orderId) return null;
      return allOrders.find(order => order.id === entry.orderId) || null;
    }

    function isFinanceEntryLinkedToClosedOrder(entry) {
      return getLinkedFinanceOrder(entry)?.status === 'fechada';
    }

    function canReverseFinanceEntry(entry) {
      if (!entry || entry.groupedIntoId) return false;
      if (isFinanceEntryLinkedToClosedOrder(entry)) return false;
      return isFinanceEntryLockedForEditing(entry);
    }

    function isFuelEntry(entry) {
      return entry?.entryType === 'combustivel';
    }

    function isFuelGroupEntry(entry) {
      return entry?.entryType === 'combustivel_agrupado';
    }

    function isExpenseGroupEntry(entry) {
      return entry?.entryType === 'despesa_agrupada';
    }

    function isFinanceGroupEntry(entry) {
      return isFuelGroupEntry(entry) || isExpenseGroupEntry(entry);
    }

    function isRegularExpenseEntry(entry) {
      return !!entry && entry.entryType !== 'combustivel' && !isFinanceGroupEntry(entry);
    }

    function getFinanceGroupingMode(entries = []) {
      if (entries.length < 2) return null;
      if (entries.every(entry => isFuelEntry(entry) && !entry.groupedIntoId && !isFinanceEntryLockedForEditing(entry))) {
        const vehicleIds = new Set(entries.map(entry => getEntryVehicleId(entry)).filter(Boolean));
        return vehicleIds.size === 1 ? 'fuel' : null;
      }
      if (entries.every(entry => isRegularExpenseEntry(entry) && !entry.groupedIntoId && !isFinanceEntryLockedForEditing(entry))) {
        const supplierIds = new Set(entries.map(entry => entry.supplierId || normalizeSearchText(entry.fornecedor || '')).filter(Boolean));
        return supplierIds.size === 1 ? 'expense' : null;
      }
      return null;
    }

    function getEntryVehicleId(entry) {
      if (!entry) return '';
      if (entry.vehicleId) return entry.vehicleId;
      const order = allOrders.find(item => item.id === entry.orderId);
      return order?.vehicleId || '';
    }

    function getEntryLinkedOrder(entry) {
      if (!entry?.orderId) return null;
      return allOrders.find(order => order.id === entry.orderId) || null;
    }

    function getEntryLinkedVehicleId(entry) {
      return getEntryLinkedOrder(entry)?.vehicleId || '';
    }

    function getEntryImmediateVehicleId(entry) {
      return entry?.vehicleId || getEntryLinkedVehicleId(entry) || '';
    }

    function isDistributedCostEntry(entry) {
      return !!entry && !entry.groupedIntoId && !!entry.orderId && !!getEntryLinkedVehicleId(entry);
    }

    function isFinanceEntryInsidePeriod(entry, start = '', end = '') {
      const entryDate = getFinanceEntryDate(entry);
      if (start && (!entryDate || entryDate < start)) return false;
      if (end && (!entryDate || entryDate > end)) return false;
      return true;
    }

    function getOrderCompetenceDate(order) {
      return order?.dataInicio || order?.dataTermino || '';
    }

    function getFinanceEntryCompetenceDate(entry) {
      const linkedOrder = getEntryLinkedOrder(entry);
      return getOrderCompetenceDate(linkedOrder) || getFinanceEntryDate(entry);
    }

    function isFinanceEntryInsideCompetencePeriod(entry, start = '', end = '') {
      const competenceDate = getFinanceEntryCompetenceDate(entry);
      if (start && (!competenceDate || competenceDate < start)) return false;
      if (end && (!competenceDate || competenceDate > end)) return false;
      return true;
    }

    function getVehicleDistributedCostTotal(vehicleId, start = '', end = '') {
      return allFinanceEntries
        .filter(isDistributedCostEntry)
        .filter(entry => getEntryLinkedVehicleId(entry) === vehicleId)
        .filter(entry => isFinanceEntryInsideCompetencePeriod(entry, start, end))
        .reduce((sum, entry) => sum + getFinanceNetTotal(entry), 0);
    }

    function getFinanceEntryDate(entry) {
      return entry?.dataAbastecimento || entry?.dataVencimento || String(entry?.createdAt || '').slice(0, 10) || '';
    }

    function getFinanceEntryStatus(entry) {
      if (entry?.groupedIntoId) return 'agrupado';
      if (entry?.orderId) return 'distribuido';
      if (entry?.workflowStatus === 'distribuido') return 'distribuido';
      if (entry?.workflowStatus === 'pendente_os' || entry?.closedExpense) return 'pendente_os';
      if (entry?.workflowStatus && entry.workflowStatus !== 'distribuido') return entry.workflowStatus;
      return 'pendente';
    }

    function advanceOrderStatusOnFinancialAllocation(orderId) {
      if (!orderId) return false;
      let changed = false;
      allOrders = allOrders.map(order => {
        if (order.id === orderId && order.status === 'aberta') {
          changed = true;
          return { ...order, status: 'andamento' };
        }
        return order;
      });
      return changed;
    }

    function hasAllocatedFinancialEntry(orderId) {
      if (!orderId) return false;
      return allFinanceEntries.some(entry => entry?.orderId === orderId);
    }

    function syncAllocatedOrderStatuses() {
      let changed = false;
      allOrders = allOrders.map(order => {
        if (order.status === 'aberta' && hasAllocatedFinancialEntry(order.id)) {
          changed = true;
          return { ...order, status: 'andamento' };
        }
        return order;
      });
      return changed;
    }

    function syncOrderStatusesAfterFinancialReversal(orderIds = []) {
      const impactedIds = new Set(orderIds.filter(Boolean));
      if (!impactedIds.size) return false;
      let changed = false;
      allOrders = allOrders.map(order => {
        if (impactedIds.has(order.id) && order.status === 'andamento' && !hasAllocatedFinancialEntry(order.id)) {
          changed = true;
          return { ...order, status: 'aberta' };
        }
        return order;
      });
      return changed;
    }

    function getFinanceEntryDateLabel(entry) {
      if (isFinanceGroupEntry(entry)) return entry.dataVencimento ? 'Vencimento' : 'Agrupamento';
      if (isFuelEntry(entry)) return 'Abastecimento';
      return 'Vencimento';
    }

    function getFinanceEntryStatusLabel(entry) {
      const status = getFinanceEntryStatus(entry);
      switch (status) {
        case 'agrupado': return 'Agrupado';
        case 'distribuido': return 'Distribuído';
        case 'pendente_os': return 'Pendente até alocar OS';
        default: return 'Pendente';
      }
    }

    function getFinanceEntryFamily(entry) {
      return isFuelEntry(entry) || isFuelGroupEntry(entry) ? 'fuel' : 'expense';
    }

    function getFinanceGroupChildren(entry) {
      if (!isFinanceGroupEntry(entry)) return [];
      const groupedIds = Array.isArray(entry.groupedEntryIds) ? entry.groupedEntryIds : [];
      return groupedIds
        .map(id => allFinanceEntries.find(item => item.id === id))
        .filter(Boolean)
        .sort((a, b) => {
          const dateCompare = String(getFinanceEntryDate(a)).localeCompare(String(getFinanceEntryDate(b)));
          if (dateCompare !== 0) return dateCompare;
          return String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
        });
    }

    function getFuelGroupChildren(entry) {
      if (!isFuelGroupEntry(entry)) return [];
      return getFinanceGroupChildren(entry);
    }

    function getFinanceSupplierSummary(entry) {
      if (!entry) return '';
      const noteLabel = normalizeFinanceNoteLabel(entry.nf);
      if (!isFinanceGroupEntry(entry)) {
        return [entry.fornecedor, noteLabel, entry.fuelType].filter(Boolean).join('  ');
      }

      const children = getFinanceGroupChildren(entry);
      const supplierNames = [...new Set(children.map(item => item.fornecedor).filter(Boolean))];
      const notes = children.map(item => normalizeFinanceNoteLabel(item.nf)).filter(Boolean);
      return [
        supplierNames.join(', '),
        noteLabel,
        notes.length ? `Notas: ${notes.join(', ')}` : ''
      ].filter(Boolean).join('  ');
    }

    function getOrderGroupedFuelReportRows(orderId) {
      return allFinanceEntries
        .filter(entry => entry.orderId === orderId && isFuelGroupEntry(entry))
        .map(entry => {
          const children = getFuelGroupChildren(entry)
            .slice()
            .sort((a, b) => String(getFinanceEntryDate(a)).localeCompare(String(getFinanceEntryDate(b))));
          const totalLitros = children.reduce((sum, item) => sum + Number(item.litros || 0), 0);
          const latestKm = children.reduce((maxKm, item) => Math.max(maxKm, Number(item.km || 0)), 0);
          return {
            id: entry.id,
            supplierSummary: getFinanceSupplierSummary(entry),
            dates: children.map(item => getFinanceEntryDate(item)).filter(Boolean),
            total: getFinanceTotal(entry),
            litros: totalLitros,
            km: latestKm || '',
            childCount: children.length
          };
        });
    }

    function getFuelEntriesForVehicle(vehicleId, excludeId = '') {
      return allFinanceEntries
        .filter(entry => isFuelEntry(entry) && getEntryVehicleId(entry) === vehicleId && entry.id !== excludeId && entry.km !== '' && getFinanceEntryDate(entry))
        .sort((a, b) => {
          const dateCompare = String(getFinanceEntryDate(a)).localeCompare(String(getFinanceEntryDate(b)));
          if (dateCompare !== 0) return dateCompare;
          return String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
        });
    }

    function validateFuelMileageForVehicle({ vehicleId, date, km, excludeId = '' }) {
      const kmValue = Number(km || 0);
      if (!vehicleId || !date || !km) return 'Selecione o veículo, a data de abastecimento e informe o KM.';
      if (!Number.isFinite(kmValue) || kmValue < 0) return 'Informe um KM válido para o abastecimento.';

      const entries = getFuelEntriesForVehicle(vehicleId, excludeId);
      const previous = [...entries]
        .filter(entry => getFinanceEntryDate(entry) <= date)
        .sort((a, b) => String(getFinanceEntryDate(a)).localeCompare(String(getFinanceEntryDate(b))) || Number(a.km || 0) - Number(b.km || 0))
        .pop();
      const next = entries.find(entry => getFinanceEntryDate(entry) > date);

      if (previous && kmValue < Number(previous.km || 0)) {
        return `O KM informado não pode ser menor que ${previous.km} para esse veículo.`;
      }
      if (next && kmValue > Number(next.km || 0)) {
        return `O KM informado não pode ser maior que ${next.km}, pois já existe abastecimento futuro para esse veículo.`;
      }
      return '';
    }

    function findSimilarFuelEntry({ vehicleId, dataAbastecimento, total, excludeId = '' }) {
      if (Number(total || 0) <= 0) return null;
      const normalizedTotal = Number(total || 0).toFixed(2);
      return allFinanceEntries.find((entry) =>
        entry
        && entry.id !== excludeId
        && isFuelEntry(entry)
        && getEntryImmediateVehicleId(entry) === vehicleId
        && String(entry.dataAbastecimento || entry.dataVencimento || '') === String(dataAbastecimento || '')
        && Number(entry.total || 0).toFixed(2) === normalizedTotal
      ) || null;
    }

    function migrateFinanceEntries() {
      allFinanceEntries = (Array.isArray(allFinanceEntries) ? allFinanceEntries : []).map((entry) => {
        if (!entry || typeof entry !== 'object') return entry;

        const nextEntry = { ...entry };
        if (!nextEntry.createdAt) nextEntry.createdAt = new Date().toISOString();
        if (!nextEntry.kind) nextEntry.kind = 'despesa';
        if (!nextEntry.kindLabel) nextEntry.kindLabel = nextEntry.kind === 'receita' ? 'Receita' : 'Despesa';

        if (isFuelEntry(nextEntry)) {
          if (!nextEntry.vehicleId) {
            const linkedOrder = allOrders.find(item => item.id === nextEntry.orderId);
            nextEntry.vehicleId = linkedOrder?.vehicleId || '';
          }
          if (!nextEntry.dataAbastecimento) {
            nextEntry.dataAbastecimento = nextEntry.dataVencimento || String(nextEntry.createdAt || '').slice(0, 10);
          }
          if (nextEntry.km === undefined || nextEntry.km === null || nextEntry.km === '') {
            nextEntry.km = nextEntry.kmFinal || nextEntry.kmInicial || '';
          }
        }

        if (isFuelGroupEntry(nextEntry) && !Array.isArray(nextEntry.groupedEntryIds)) {
          nextEntry.groupedEntryIds = [];
        }

        return nextEntry;
      });
    }

    function buildStorageSnapshot() {
      return {
        vehicles: allVehicles,
        drivers: allDrivers,
        suppliers: allSuppliers,
        orders: allOrders,
        finance: allFinanceEntries,
        administrations: allAdministrations,
        deletedOrders,
        orderCounter,
        notifications: systemNotifications,
        customLogoEnabled,
        customLogoUrl,
        customLogoScale,
        managerDisplayName,
        allowManualOrderNumberEditing
      };
    }

    function parseLocalStorageJson(key, fallbackValue) {
      const rawValue = localStorage.getItem(key);
      if (!rawValue) return fallbackValue;
      try {
        return JSON.parse(rawValue);
      } catch (error) {
        console.warn(`Não foi possível ler ${key} no armazenamento local.`, error);
        return fallbackValue;
      }
    }

    function applyStorageSnapshot(snapshot = {}) {
      allVehicles = Array.isArray(snapshot.vehicles) ? snapshot.vehicles.map(normalizeVehicleRecord) : [];
      allDrivers = Array.isArray(snapshot.drivers) ? snapshot.drivers.map(normalizeDriverRecord) : [];
      allSuppliers = Array.isArray(snapshot.suppliers) ? snapshot.suppliers : [];
      allOrders = Array.isArray(snapshot.orders) ? snapshot.orders : [];
      allFinanceEntries = Array.isArray(snapshot.finance) ? snapshot.finance : [];
      allAdministrations = normalizeAdministrationList(snapshot.administrations || snapshot.administracoes || []);
      deletedOrders = Array.isArray(snapshot.deletedOrders) ? snapshot.deletedOrders : [];
      systemNotifications = Array.isArray(snapshot.notifications) ? snapshot.notifications : [];
      orderCounter = Number(snapshot.orderCounter) || 1;
      customLogoEnabled = snapshot.customLogoEnabled === true || snapshot.customLogoEnabled === 'true';
      customLogoUrl = snapshot.customLogoUrl || '';
      customLogoScale = Number(snapshot.customLogoScale) || 60;
      managerDisplayName = snapshot.managerDisplayName || snapshot.defaultAdministratorName || 'Gestor';
      allowManualOrderNumberEditing = snapshot.allowManualOrderNumberEditing === true || snapshot.allowManualOrderNumberEditing === 'true';
      if (!allAdministrations.length) allAdministrations = collectLegacyAdministrationOptions();
      migrateFinanceEntries();
      syncOrderCounterWithOrders();
    }

    function getLegacyLocalStorageSnapshot() {
      return {
        vehicles: parseLocalStorageJson('wefrotas_vehicles', []),
        drivers: parseLocalStorageJson('wefrotas_drivers', []),
        suppliers: parseLocalStorageJson('wefrotas_suppliers', []),
        orders: parseLocalStorageJson('wefrotas_orders', []),
        finance: parseLocalStorageJson('wefrotas_finance', []),
        administrations: parseLocalStorageJson('wefrotas_administrations', []),
        deletedOrders: parseLocalStorageJson('wefrotas_deleted_orders', []),
        orderCounter: localStorage.getItem('wefrotas_order_counter') || 1,
        notifications: parseLocalStorageJson('wefrotas_notifications', []),
        customLogoEnabled: localStorage.getItem('wefrotas_custom_logo_enabled') === 'true',
        customLogoUrl: localStorage.getItem('wefrotas_custom_logo_url') || '',
        customLogoScale: localStorage.getItem('wefrotas_custom_logo_scale') || 60,
        managerDisplayName: localStorage.getItem('wefrotas_manager_display_name') || localStorage.getItem('wefrotas_default_administrator_name') || 'Gestor',
        allowManualOrderNumberEditing: localStorage.getItem('wefrotas_allow_manual_order_number_editing') === 'true'
      };
    }

    function saveSmallSettingsToLocalStorage(snapshot = buildStorageSnapshot()) {
      try {
        localStorage.setItem('wefrotas_storage_engine', wefrotasStorageEngine);
        localStorage.setItem('wefrotas_order_counter', String(snapshot.orderCounter || 1));
        localStorage.setItem('wefrotas_custom_logo_enabled', snapshot.customLogoEnabled ? 'true' : 'false');
        localStorage.setItem('wefrotas_custom_logo_url', snapshot.customLogoUrl || '');
        localStorage.setItem('wefrotas_custom_logo_scale', String(snapshot.customLogoScale || 60));
        localStorage.setItem('wefrotas_manager_display_name', snapshot.managerDisplayName || 'Gestor');
        localStorage.setItem('wefrotas_allow_manual_order_number_editing', snapshot.allowManualOrderNumberEditing ? 'true' : 'false');
        localStorage.setItem('wefrotas_administrations', JSON.stringify(snapshot.administrations || []));
      } catch (error) {
        console.warn('Não foi possível salvar preferências pequenas no localStorage.', error);
      }
    }

    function saveFullSnapshotToLocalStorage(snapshot = buildStorageSnapshot()) {
      try {
        localStorage.setItem('wefrotas_vehicles', JSON.stringify(snapshot.vehicles || []));
        localStorage.setItem('wefrotas_drivers', JSON.stringify(snapshot.drivers || []));
        localStorage.setItem('wefrotas_suppliers', JSON.stringify(snapshot.suppliers || []));
        localStorage.setItem('wefrotas_orders', JSON.stringify(snapshot.orders || []));
        localStorage.setItem('wefrotas_finance', JSON.stringify(snapshot.finance || []));
        localStorage.setItem('wefrotas_administrations', JSON.stringify(snapshot.administrations || []));
        localStorage.setItem('wefrotas_deleted_orders', JSON.stringify(snapshot.deletedOrders || []));
        localStorage.setItem('wefrotas_notifications', JSON.stringify(snapshot.notifications || []));
        saveSmallSettingsToLocalStorage(snapshot);
      } catch (error) {
        console.warn('Não foi possível salvar snapshot completo no localStorage.', error);
      }
    }

    function clearLegacyLargeLocalStorageData() {
      wefrotasLegacyLargeKeys.forEach((key) => localStorage.removeItem(key));
    }

    function openWeFrotasIndexedDb() {
      if (!window.indexedDB) {
        return Promise.reject(new Error('IndexedDB indisponível neste navegador.'));
      }
      if (wefrotasDbConnection) return Promise.resolve(wefrotasDbConnection);

      return new Promise((resolve, reject) => {
        const request = indexedDB.open(wefrotasIndexedDbName, wefrotasIndexedDbVersion);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(wefrotasIndexedDbStore)) {
            db.createObjectStore(wefrotasIndexedDbStore, { keyPath: 'key' });
          }
        };
        request.onsuccess = () => {
          wefrotasDbConnection = request.result;
          wefrotasDbConnection.onversionchange = () => {
            wefrotasDbConnection.close();
            wefrotasDbConnection = null;
          };
          resolve(wefrotasDbConnection);
        };
        request.onerror = () => reject(request.error || new Error('Falha ao abrir IndexedDB.'));
      });
    }

    function readWeFrotasIndexedDbSnapshot() {
      return openWeFrotasIndexedDb().then((db) => new Promise((resolve, reject) => {
        const transaction = db.transaction(wefrotasIndexedDbStore, 'readonly');
        const store = transaction.objectStore(wefrotasIndexedDbStore);
        const request = store.get(wefrotasIndexedDbSnapshotKey);
        request.onsuccess = () => resolve(request.result?.value || null);
        request.onerror = () => reject(request.error || new Error('Falha ao ler IndexedDB.'));
      }));
    }

    function writeWeFrotasIndexedDbSnapshot(snapshot = buildStorageSnapshot()) {
      return openWeFrotasIndexedDb().then((db) => new Promise((resolve, reject) => {
        const transaction = db.transaction(wefrotasIndexedDbStore, 'readwrite');
        const store = transaction.objectStore(wefrotasIndexedDbStore);
        const request = store.put({
          key: wefrotasIndexedDbSnapshotKey,
          value: snapshot,
          updatedAt: new Date().toISOString()
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error || new Error('Falha ao salvar IndexedDB.'));
      }));
    }

    async function loadFromStorage() {
      try {
        const indexedDbSnapshot = await readWeFrotasIndexedDbSnapshot();
        if (indexedDbSnapshot) {
          wefrotasStorageEngine = 'IndexedDB';
          applyStorageSnapshot(indexedDbSnapshot);
          saveSmallSettingsToLocalStorage(indexedDbSnapshot);
          clearLegacyLargeLocalStorageData();
          return;
        }

        const legacySnapshot = getLegacyLocalStorageSnapshot();
        applyStorageSnapshot(legacySnapshot);
        wefrotasStorageEngine = 'IndexedDB';
        await writeWeFrotasIndexedDbSnapshot(buildStorageSnapshot());
        saveSmallSettingsToLocalStorage(buildStorageSnapshot());
        clearLegacyLargeLocalStorageData();
      } catch (error) {
        console.warn('IndexedDB indisponível. Mantendo fallback em localStorage.', error);
        wefrotasStorageEngine = 'localStorage';
        applyStorageSnapshot(getLegacyLocalStorageSnapshot());
      }
    }

    function saveToLocalStorage() {
      const snapshot = buildStorageSnapshot();
      saveSmallSettingsToLocalStorage(snapshot);

      if (wefrotasStorageEngine === 'IndexedDB') {
        wefrotasStorageQueue = wefrotasStorageQueue
          .then(() => writeWeFrotasIndexedDbSnapshot(snapshot))
          .then(() => clearLegacyLargeLocalStorageData())
          .catch((error) => {
            console.warn('Falha ao salvar no IndexedDB. Salvando cópia de emergência em localStorage.', error);
            wefrotasStorageEngine = 'localStorage';
            saveFullSnapshotToLocalStorage(snapshot);
          });
        return wefrotasStorageQueue;
      }

      saveFullSnapshotToLocalStorage(snapshot);
      return Promise.resolve();
    }

    function getStorageUsageStats() {
      const snapshotText = JSON.stringify(buildStorageSnapshot());
      const usedBytes = snapshotText.length * 2;
      const fallbackLimitBytes = wefrotasStorageEngine === 'IndexedDB' ? 250 * 1024 * 1024 : 5 * 1024 * 1024;
      const usedPercent = Math.min(100, (usedBytes / fallbackLimitBytes) * 100);
      return {
        usedBytes,
        freeBytes: Math.max(fallbackLimitBytes - usedBytes, 0),
        limitBytes: fallbackLimitBytes,
        usedPercent,
        engine: wefrotasStorageEngine
      };
    }

    function formatStorageBytes(bytes) {
      if (bytes >= 1024 * 1024 * 1024) {
        return `${(bytes / 1024 / 1024 / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} GB`;
      }
      if (bytes >= 1024 * 1024) {
        return `${(bytes / 1024 / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} MB`;
      }
      return `${(bytes / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} KB`;
    }

    function renderStorageDashboard() {
      const summaryNode = document.getElementById('home-storage-summary');
      const usedNode = document.getElementById('home-storage-used');
      const freeNode = document.getElementById('home-storage-free');
      const fillNode = document.getElementById('home-storage-meter-fill');
      if (!summaryNode || !usedNode || !freeNode || !fillNode) return;

      const stats = getStorageUsageStats();
      const percentLabel = stats.usedPercent.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

      summaryNode.textContent = stats.engine === 'IndexedDB'
        ? 'IndexedDB ativo: o limite de 5 MB do localStorage não é mais a régua principal.'
        : `${percentLabel}% da capacidade segura do localStorage em uso.`;
      usedNode.textContent = stats.engine === 'IndexedDB'
        ? `${formatStorageBytes(stats.usedBytes)} em dados do WeFrotas`
        : `${formatStorageBytes(stats.usedBytes)} usados`;
      freeNode.textContent = stats.engine === 'IndexedDB'
        ? 'Cota gerenciada pelo navegador'
        : `${formatStorageBytes(stats.freeBytes)} livres`;
      fillNode.style.width = `${Math.max(stats.usedPercent, stats.usedBytes > 0 ? 2 : 0).toFixed(2)}%`;
      fillNode.classList.toggle('is-warning', stats.usedPercent >= 60 && stats.usedPercent < 85);
      fillNode.classList.toggle('is-danger', stats.usedPercent >= 85);

      if (stats.engine === 'IndexedDB' && navigator.storage?.estimate) {
        navigator.storage.estimate().then((estimate) => {
          const quotaBytes = Number(estimate.quota) || stats.limitBytes;
          const originUsedBytes = Number(estimate.usage) || stats.usedBytes;
          const originPercent = Math.min(100, (originUsedBytes / quotaBytes) * 100);
          summaryNode.textContent = `IndexedDB ativo: ${originPercent.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% da cota estimada do navegador em uso.`;
          freeNode.textContent = `Cota estimada: ${formatStorageBytes(quotaBytes)}`;
          fillNode.style.width = `${Math.max(originPercent, originUsedBytes > 0 ? 2 : 0).toFixed(2)}%`;
          fillNode.classList.toggle('is-warning', originPercent >= 60 && originPercent < 85);
          fillNode.classList.toggle('is-danger', originPercent >= 85);
        }).catch(() => {});
      }
    }

    function loadFromLocalStorage() {
      applyStorageSnapshot(getLegacyLocalStorageSnapshot());
    }

    function showToast(message, options = {}) {
      const stack = document.getElementById('toast-stack');
      if (!stack) return;
      const toast = document.createElement('div');
      toast.className = 'toast-item';
      toast.textContent = message;
      stack.appendChild(toast);
      if (options.notify) {
        addSystemNotification(options.notifyTitle || 'Atualização do sistema', options.notifyMessage || message);
      }
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-6px)';
        setTimeout(() => toast.remove(), 180);
      }, 2600);
    }

    function formatNotificationTime(value) {
      return new Date(value).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    function updateNotificationBadge() {
      const badge = document.getElementById('notifications-badge');
      if (!badge) return;
      const total = systemNotifications.filter((item) => !item.read).length;
      badge.textContent = total > 9 ? '9+' : String(total);
      badge.classList.toggle('hidden', total === 0);
    }

    function renderNotifications() {
      const list = document.getElementById('notifications-list');
      if (!list) return;
      if (!systemNotifications.length) {
        list.innerHTML = '<div class="notification-empty">Nenhuma notificação registrada ainda.</div>';
        updateNotificationBadge();
        return;
      }
      list.innerHTML = systemNotifications.map((item) => `
        <article class="notification-item">
          <div class="notification-item-head">
            <h3 class="notification-item-title">${escapeHtml(item.title)}</h3>
            <span class="notification-item-time">${escapeHtml(formatNotificationTime(item.createdAt))}</span>
          </div>
          <p class="notification-item-text">${escapeHtml(item.text)}</p>
        </article>
      `).join('');
      updateNotificationBadge();
    }

    function addSystemNotification(title, text) {
      systemNotifications.unshift({
        id: generateId(),
        title,
        text,
        createdAt: new Date().toISOString(),
        read: false
      });
      systemNotifications = systemNotifications.slice(0, 30);
      saveToLocalStorage();
      renderNotifications();
    }

    function clearAllNotifications() {
      systemNotifications = [];
      saveToLocalStorage();
      renderNotifications();
      showToast('Notificações limpas.');
    }

    function togglePanel(panelId, overlayId, force) {
      const panel = document.getElementById(panelId);
      const overlay = document.getElementById(overlayId);
      if (!panel || !overlay) return;
      const shouldOpen = typeof force === 'boolean' ? force : !panel.classList.contains('open');
      panel.classList.toggle('open', shouldOpen);
      overlay.classList.toggle('open', shouldOpen);
      panel.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
    }

    function toggleSettings(force) {
      const shouldOpen = typeof force === 'boolean'
        ? force
        : !document.getElementById('settings-panel')?.classList.contains('open');
      if (shouldOpen) toggleNotifications(false);
      if (shouldOpen) {
        updateCustomLogoUi();
        openSettingsScreen('home');
      }
      togglePanel('settings-panel', 'settings-overlay', shouldOpen);
    }

    function openSettingsScreen(screen) {
      document.querySelectorAll('.settings-screen').forEach((node) => node.classList.remove('active'));
      const target = document.getElementById(`settings-screen-${screen}`);
      target?.classList.add('active');
      document.querySelector('#settings-panel .panel-body')?.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function openPromptModal({
      title,
      text,
      placeholder = '',
      value = '',
      onConfirm,
      onCancel = null,
      allowEmpty = false,
      exactValue = '',
      confirmLabel = 'Confirmar',
      cancelLabel = 'Cancelar',
      mode = 'prompt',
      closeOnBackdrop = true
    }) {
      const backdrop = document.getElementById('prompt-modal-backdrop');
      const titleNode = document.getElementById('prompt-modal-title');
      const textNode = document.getElementById('prompt-modal-text');
      const input = document.getElementById('prompt-modal-input');
      const inputLabel = document.getElementById('prompt-modal-input-label');
      const confirmButton = document.getElementById('prompt-modal-confirm-btn');
      const cancelButton = document.getElementById('prompt-modal-cancel-btn');
      if (!backdrop || !titleNode || !textNode || !input || !inputLabel || !confirmButton || !cancelButton) return;
      pendingPromptConfirm = typeof onConfirm === 'function' ? onConfirm : null;
      pendingPromptCancel = typeof onCancel === 'function' ? onCancel : null;
      const shouldHideInput = mode === 'confirm' || (allowEmpty && !exactValue);
      promptModalConfig = {
        allowEmpty,
        exactValue: String(exactValue || ''),
        confirmLabel,
        cancelLabel,
        mode,
        closeOnBackdrop
      };
      titleNode.textContent = title || 'Justificativa';
      textNode.textContent = text || '';
      input.placeholder = placeholder || 'Descreva aqui o motivo';
      input.value = value || '';
      input.style.display = shouldHideInput ? 'none' : 'block';
      inputLabel.style.display = shouldHideInput ? 'none' : 'block';
      confirmButton.textContent = confirmLabel;
      cancelButton.textContent = cancelLabel;
      backdrop.dataset.mode = mode;
      backdrop.classList.remove('hidden');
      if (!shouldHideInput) setTimeout(() => input.focus(), 30);
    }

    function closePromptModal(triggerCancel = true) {
      const backdrop = document.getElementById('prompt-modal-backdrop');
      backdrop?.classList.add('hidden');
      if (backdrop) delete backdrop.dataset.mode;
      const input = document.getElementById('prompt-modal-input');
      if (input) input.value = '';
      const cancelHandler = pendingPromptCancel;
      promptModalConfig = { allowEmpty: false, exactValue: '', confirmLabel: 'Confirmar', cancelLabel: 'Cancelar', mode: 'prompt', closeOnBackdrop: true };
      pendingPromptConfirm = null;
      pendingPromptCancel = null;
      if (triggerCancel && cancelHandler) cancelHandler();
    }

    function handlePromptBackdrop(event) {
      if (event.target === event.currentTarget && promptModalConfig.closeOnBackdrop) closePromptModal();
    }

    function confirmPromptModal() {
      const input = document.getElementById('prompt-modal-input');
      const value = input?.value?.trim() || '';
      if (promptModalConfig.mode !== 'confirm' && !promptModalConfig.allowEmpty && !value) {
        showToast('Informe uma justificativa para continuar.');
        input?.focus();
        return;
      }
      if (promptModalConfig.mode !== 'confirm' && promptModalConfig.exactValue && value.toUpperCase() !== promptModalConfig.exactValue.toUpperCase()) {
        showToast(`Digite ${promptModalConfig.exactValue} para continuar.`);
        input?.focus();
        return;
      }
      const handler = pendingPromptConfirm;
      closePromptModal(false);
      if (handler) handler(value);
    }

    function openSettingsFeedback(state = 'loading', title = '', text = '') {
      const backdrop = document.getElementById('settings-feedback-backdrop');
      const icon = document.getElementById('settings-feedback-icon');
      const titleNode = document.getElementById('settings-feedback-title');
      const textNode = document.getElementById('settings-feedback-text');
      const closeButton = document.getElementById('settings-feedback-close');
      if (!backdrop || !icon || !titleNode || !textNode || !closeButton) return;

      backdrop.classList.remove('hidden');
      closeButton.classList.toggle('hidden', state === 'loading');
      icon.className = `batch-feedback-icon ${state}`;
      icon.innerHTML = state === 'loading'
        ? '<span class="batch-feedback-spinner"></span>'
        : '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M20 6 9 17l-5-5"/></svg>';
      titleNode.textContent = title;
      textNode.textContent = text;
    }

    function closeSettingsFeedback() {
      document.getElementById('settings-feedback-backdrop')?.classList.add('hidden');
    }

    function toggleNotifications(force) {
      const shouldOpen = typeof force === 'boolean'
        ? force
        : !document.getElementById('notifications-panel')?.classList.contains('open');
      if (shouldOpen) toggleSettings(false);
      if (shouldOpen && systemNotifications.some((item) => !item.read)) {
        systemNotifications = systemNotifications.map((item) => ({ ...item, read: true }));
        saveToLocalStorage();
        renderNotifications();
      }
      togglePanel('notifications-panel', 'notifications-overlay', shouldOpen);
    }

    function openBatchFeedback(state, title, text, meta = '') {
      const backdrop = document.getElementById('batch-feedback-backdrop');
      const icon = document.getElementById('batch-feedback-icon');
      const kicker = document.getElementById('batch-feedback-kicker');
      const titleNode = document.getElementById('batch-feedback-title');
      const textNode = document.getElementById('batch-feedback-text');
      const metaNode = document.getElementById('batch-feedback-meta');
      const closeButton = document.getElementById('batch-feedback-close');
      if (!backdrop || !icon || !kicker || !titleNode || !textNode || !metaNode || !closeButton) return;

      backdrop.classList.remove('hidden');
      icon.className = `batch-feedback-icon ${state}`;
      if (state === 'loading') {
        icon.innerHTML = '<span class="batch-feedback-spinner"></span>';
        kicker.textContent = 'Importação em andamento';
        closeButton.classList.add('hidden');
      } else if (state === 'success') {
        icon.innerHTML = `
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 12l4 4 10-10"/>
          </svg>
        `;
        kicker.textContent = 'Importação concluída';
        closeButton.classList.remove('hidden');
      } else {
        icon.innerHTML = `
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4m0 4h.01M10.29 3.86l-7.4 12.82A1 1 0 003.76 18h16.48a1 1 0 00.87-1.5l-7.4-12.82a1 1 0 00-1.74 0z"/>
          </svg>
        `;
        kicker.textContent = 'Importação não concluída';
        closeButton.classList.remove('hidden');
      }

      titleNode.textContent = title;
      textNode.textContent = text;
      metaNode.textContent = meta;
      metaNode.classList.toggle('hidden', !meta);
    }

    function closeBatchFeedback() {
      document.getElementById('batch-feedback-backdrop')?.classList.add('hidden');
    }

    function normalizeComparableText(value) {
      return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
    }

    function normalizeSearchText(value) {
      const normalized = normalizeComparableText(value);
      const compact = normalized.replace(/[^a-z0-9]/g, '');
      return compact || normalized;
    }

    function parseBrazilianDateToIso(value) {
      const rawValue = String(value || '').trim();
      const match = rawValue.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (!match) return '';
      const [, day, month, year] = match;
      return `${year}-${month}-${day}`;
    }

    function getImportedMessageReader(rawText) {
      const sourceText = String(rawText || '').trim();
      const normalizedLines = sourceText
        .split(/\r?\n/)
        .map((line) => line.replace(/\*/g, '').replace(/^\s*[^\p{L}\p{N}]+/gu, '').trim())
        .filter(Boolean);

      return (label) => {
        const normalizedLabel = `${normalizeComparableText(label)}:`;
        const line = normalizedLines.find((item) => normalizeComparableText(item).startsWith(normalizedLabel));
        if (!line) return '';
        const separatorIndex = line.indexOf(':');
        return separatorIndex >= 0 ? line.slice(separatorIndex + 1).trim() : '';
      };
    }

    function normalizeImportedLiters(value) {
      const rawValue = String(value || '').trim();
      const match = rawValue.match(/[\d.,]+/);
      return match ? match[0].replace(',', '.') : '';
    }

    function normalizeImportedFuelType(value) {
      const normalized = normalizeComparableText(value);
      if (!normalized) return '';
      const aliases = [
        ['diesel s10', 'Diesel S10'],
        ['s10', 'Diesel S10'],
        ['gasolina aditivada', 'Gasolina aditivada'],
        ['aditivada', 'Gasolina aditivada'],
        ['gasolina', 'Gasolina'],
        ['etanol', 'Etanol'],
        ['arla', 'Arla 32'],
        ['gnv', 'GNV'],
        ['oleo hidraulico', 'Oleo hidraulico'],
        ['oleo de motor', 'Oleo de motor'],
        ['diesel', 'Diesel']
      ];
      const match = aliases.find(([alias]) => normalized.includes(alias));
      return match ? match[1] : value;
    }

    function normalizeVehicleRecord(vehicle) {
      return {
        ...vehicle,
        motoristaId: vehicle?.motoristaId || vehicle?.driverId || ''
      };
    }

    function normalizeDriverRecord(driver) {
      const vehicleIds = Array.isArray(driver?.vehicleIds)
        ? driver.vehicleIds
        : driver?.vehicleId
          ? [driver.vehicleId]
          : [];

      return {
        ...driver,
        vehicleIds: Array.from(new Set(vehicleIds.filter(Boolean).map(String)))
      };
    }

    function getDriverVehicleIds(driver) {
      if (!driver) return [];
      const linkedFromDriver = Array.isArray(driver.vehicleIds) ? driver.vehicleIds : [];
      const linkedFromVehicles = allVehicles
        .filter((vehicle) => String(vehicle.motoristaId || '') === String(driver.id))
        .map((vehicle) => vehicle.id);

      return Array.from(new Set([...linkedFromDriver, ...linkedFromVehicles].filter(Boolean).map(String)));
    }

    function getSelectedDriverVehicleIds() {
      const list = document.getElementById('driver-vehicles');
      if (!list) return [];
      return Array.from(list.querySelectorAll('input[type="checkbox"]:checked'))
        .map(input => input.value)
        .filter(Boolean);
    }

    function setSelectedDriverVehicleIds(vehicleIds = []) {
      const list = document.getElementById('driver-vehicles');
      if (!list) return;
      const selectedSet = new Set(vehicleIds.map(String));
      Array.from(list.querySelectorAll('input[type="checkbox"]')).forEach(input => {
        input.checked = selectedSet.has(String(input.value));
      });
    }

    function syncVehiclesWithDriver(driverId, vehicleIds = []) {
      if (!driverId) return;
      const selectedSet = new Set(vehicleIds.map(String));
      allVehicles = allVehicles.map(vehicle => {
        const currentDriverId = String(vehicle.motoristaId || '');
        const shouldLink = selectedSet.has(String(vehicle.id));
        if (shouldLink) return { ...vehicle, motoristaId: driverId };
        if (currentDriverId === String(driverId)) return { ...vehicle, motoristaId: '' };
        return vehicle;
      });
    }

    function findVehicleByLinkedDriverId(driverId) {
      if (!driverId) return null;
      const driver = allDrivers.find((item) => String(item.id) === String(driverId));
      const linkedVehicleIds = getDriverVehicleIds(driver);
      const matches = allVehicles.filter((vehicle) =>
        linkedVehicleIds.includes(String(vehicle.id)) ||
        String(vehicle?.motoristaId || '') === String(driverId)
      );
      return matches.length === 1 ? matches[0] : null;
    }

    function resolveVehicleByImportedDriver(importedName, driver = null) {
      const normalizedName = normalizeComparableText(importedName);
      if (!normalizedName) return null;

      const linkedVehicle = findVehicleByLinkedDriverId(driver?.id);
      if (linkedVehicle) return linkedVehicle;

      const mappedPlateEntry = Object.entries(importedDriverVehiclePlateMap).find(([alias]) =>
        normalizedName === alias ||
        normalizedName.startsWith(`${alias} `) ||
        normalizedName.includes(alias)
      );
      if (mappedPlateEntry?.[1]) {
        const mappedPlate = mappedPlateEntry[1];
        const mappedVehicle = allVehicles.find((vehicle) => normalizeSearchText(vehicle?.placa) === normalizeSearchText(mappedPlate));
        if (mappedVehicle) return mappedVehicle;
      }

      if (!driver) return null;

      const candidateVehicles = allVehicles.filter((vehicle) => {
        const linkedDriver = allDrivers.find((item) => item.id === vehicle?.motoristaId);
        const linkedDriverName = normalizeComparableText(linkedDriver?.nome);
        return linkedDriverName && (
          linkedDriverName === normalizedName ||
          linkedDriverName.includes(normalizedName) ||
          normalizedName.includes(linkedDriverName)
        );
      });

      return candidateVehicles.length === 1 ? candidateVehicles[0] : null;
    }

    function suggestFinanceVehicleFromDriver() {
      const driverId = document.getElementById('finance-driver-id')?.value || '';
      const driver = allDrivers.find((item) => item.id === driverId);
      const vehicle = findVehicleByLinkedDriverId(driver?.id);
      if (!vehicle) return;

      const vehicleIdField = document.getElementById('finance-vehicle-id');
      const vehicleSearchField = document.getElementById('finance-vehicle-search');
      if (vehicleIdField) vehicleIdField.value = vehicle.id;
      if (vehicleSearchField) vehicleSearchField.value = getVehicleAutocompleteLabel(vehicle);
    }

    window.suggestFinanceVehicleFromDriver = suggestFinanceVehicleFromDriver;

    function resolveDriverByImportedName(name) {
      const normalized = normalizeComparableText(name);
      if (!normalized) return null;
      const exactMatch = allDrivers.find((driver) => normalizeComparableText(driver.nome) === normalized);
      if (exactMatch) return exactMatch;
      const importedTokens = normalized.split(/\s+/).filter(Boolean);
      const importedFirstTwo = importedTokens.slice(0, 2).join(' ');
      const partialMatches = allDrivers.filter((driver) => {
        const driverName = normalizeComparableText(driver.nome);
        const driverTokens = driverName.split(/\s+/).filter(Boolean);
        const driverFirstTwo = driverTokens.slice(0, 2).join(' ');
        return driverName.includes(normalized)
          || normalized.includes(driverName)
          || (!!importedFirstTwo && importedFirstTwo === driverFirstTwo)
          || (importedTokens.length === 1 && driverTokens[0] === importedTokens[0]);
      });
      return partialMatches.length === 1 ? partialMatches[0] : null;
    }

    function resolveFuelSupplierByImportedName(name) {
      const normalized = normalizeComparableText(name);
      if (!normalized) return null;
      const fuelSuppliers = allSuppliers.filter((supplier) => supplier.tipo === 'posto');
      const exactMatch = fuelSuppliers.find((supplier) => normalizeComparableText(supplier.nome) === normalized);
      if (exactMatch) return exactMatch;
      return resolveSupplierByRelevantTerms(name, fuelSuppliers);
    }

    function parseImportedFuelMessage(rawText) {
      const sourceText = String(rawText || '').trim();
      if (!sourceText) return null;

      const readField = getImportedMessageReader(sourceText);
      const dateValue = readField('Data') || readField('Data/Hora');
      const comprovanteUrlMatch = sourceText.match(/https?:\/\/\S+/i);
      const importedData = {
        type: 'fuel',
        motorista: readField('Motorista'),
        cidade: readField('Cidade'),
        posto: readField('Posto'),
        dataBr: dateValue,
        dataIso: parseBrazilianDateToIso(dateValue),
        valor: readField('Valor'),
        litros: normalizeImportedLiters(readField('Litros') || readField('QTD em litros') || readField('Qtd em L')),
        tipoCombustivel: normalizeImportedFuelType(readField('Combustível') || readField('Combustivel') || readField('Tipo de combustível')),
        km: String(readField('KM') || '').replace(/[^\d]/g, ''),
        comprovanteUrl: comprovanteUrlMatch ? comprovanteUrlMatch[0].trim() : ''
      };

      if (!importedData.motorista || !importedData.posto || !importedData.dataIso) {
        return null;
      }

      return importedData;
    }

    function parseImportedLooseNoteMessage(rawText) {
      const sourceText = String(rawText || '').trim();
      if (!sourceText) return null;

      const readField = getImportedMessageReader(sourceText);
      const dateValue = readField('Data') || readField('Data/Hora');
      const comprovanteUrlMatch = sourceText.match(/https?:\/\/\S+/i);
      const importedData = {
        type: 'loose_note',
        motorista: readField('Motorista'),
        fornecedor: readField('Fornecedor') || readField('Posto'),
        tipoServico: readField('Tipo do serviço') || readField('Tipo de serviço') || readField('Serviço') || readField('Servico'),
        valor: readField('Valor'),
        dataBr: dateValue,
        dataIso: parseBrazilianDateToIso(dateValue),
        km: String(readField('KM') || '').replace(/[^\d]/g, ''),
        observacoes: readField('Observações') || readField('Observacoes'),
        comprovanteUrl: comprovanteUrlMatch ? comprovanteUrlMatch[0].trim() : ''
      };

      if (!importedData.fornecedor || !importedData.valor) {
        return null;
      }

      return importedData;
    }

    function parseImportedCentralMessage(rawText) {
      const sourceText = String(rawText || '').trim();
      const normalized = normalizeComparableText(sourceText);
      if (!sourceText) return null;
      if (normalized.includes('registro de notinha avulsa')) {
        return parseImportedLooseNoteMessage(sourceText);
      }
      return parseImportedFuelMessage(sourceText);
    }

    function updateFinanceReceiptPreview(url = '') {
      const wrapper = document.getElementById('finance-receipt-wrap');
      const hiddenInput = document.getElementById('finance-comprovante-url');
      const labelNode = document.getElementById('finance-receipt-url');
      const actionButton = document.getElementById('finance-receipt-open-btn');
      const normalizedUrl = String(url || '').trim();

      if (hiddenInput) hiddenInput.value = normalizedUrl;
      if (!wrapper || !labelNode || !actionButton) return;

      if (normalizedUrl) {
        wrapper.classList.remove('hidden');
        labelNode.textContent = normalizedUrl;
        actionButton.disabled = false;
      } else {
        wrapper.classList.add('hidden');
        labelNode.textContent = '';
        actionButton.disabled = true;
      }
    }

    function closeReceiptViewer() {
      const backdrop = document.getElementById('receipt-viewer-backdrop');
      const image = document.getElementById('receipt-viewer-image');
      const frame = document.getElementById('receipt-viewer-frame');
      const stage = document.getElementById('receipt-viewer-stage');
      const loading = document.getElementById('receipt-viewer-loading');
      const empty = document.getElementById('receipt-viewer-empty');
      const externalLink = document.getElementById('receipt-viewer-external-link');

      backdrop?.classList.add('hidden');
      if (image) {
        image.onload = null;
        image.onerror = null;
        image.src = '';
        image.classList.add('hidden');
        image.style.transform = 'scale(1)';
        image.style.transformOrigin = 'center center';
      }
      if (frame) {
        frame.onload = null;
        frame.src = 'about:blank';
        frame.classList.add('hidden');
      }
      if (stage) {
        stage.classList.add('hidden');
        stage.classList.remove('is-zoomed');
        stage.scrollTop = 0;
        stage.scrollLeft = 0;
      }
      loading?.classList.remove('hidden');
      empty?.classList.add('hidden');
      if (externalLink) externalLink.href = '#';
      receiptViewerZoomLevel = 1;
    }

    function handleReceiptViewerBackdrop(event) {
      if (event.target === event.currentTarget) closeReceiptViewer();
    }

    function handleReceiptViewerWheel(event) {
      const stage = document.getElementById('receipt-viewer-stage');
      const image = document.getElementById('receipt-viewer-image');
      if (!stage || !image || stage.classList.contains('hidden') || image.classList.contains('hidden')) return;

      event.preventDefault();
      const stageRect = stage.getBoundingClientRect();
      const originX = ((event.clientX - stageRect.left) / Math.max(stageRect.width, 1)) * 100;
      const originY = ((event.clientY - stageRect.top) / Math.max(stageRect.height, 1)) * 100;
      const delta = event.deltaY < 0 ? 0.15 : -0.15;
      receiptViewerZoomLevel = Math.min(3, Math.max(1, Number((receiptViewerZoomLevel + delta).toFixed(2))));

      image.style.transformOrigin = `${originX}% ${originY}%`;
      image.style.transform = `scale(${receiptViewerZoomLevel})`;
      stage.classList.toggle('is-zoomed', receiptViewerZoomLevel > 1.02);
    }

    function viewFinanceReceipt(url) {
      const receiptUrl = String(url || '').trim();
      if (!receiptUrl) {
        showToast('Esse lançamento não possui comprovante vinculado.');
        return;
      }
      const backdrop = document.getElementById('receipt-viewer-backdrop');
      const image = document.getElementById('receipt-viewer-image');
      const frame = document.getElementById('receipt-viewer-frame');
      const stage = document.getElementById('receipt-viewer-stage');
      const loading = document.getElementById('receipt-viewer-loading');
      const empty = document.getElementById('receipt-viewer-empty');
      const externalLink = document.getElementById('receipt-viewer-external-link');

      if (!backdrop || !image || !frame || !stage || !loading || !empty || !externalLink) {
        window.open(receiptUrl, '_blank', 'noopener,noreferrer');
        return;
      }

      backdrop.classList.remove('hidden');
      loading.classList.remove('hidden');
      empty.classList.add('hidden');
      stage.classList.add('hidden');
      stage.classList.remove('is-zoomed');
      stage.scrollTop = 0;
      stage.scrollLeft = 0;
      image.classList.add('hidden');
      frame.classList.add('hidden');
      image.style.transform = 'scale(1)';
      image.style.transformOrigin = 'center center';
      externalLink.href = receiptUrl;
      receiptViewerZoomLevel = 1;

      let isResolved = false;
      const showLoadedReceipt = (mode) => {
        if (isResolved) return;
        isResolved = true;
        loading.classList.add('hidden');
        empty.classList.add('hidden');
        stage.classList.remove('hidden');
        if (mode === 'image') {
          image.src = receiptUrl;
          image.classList.remove('hidden');
          frame.classList.add('hidden');
        } else {
          frame.src = receiptUrl;
          frame.classList.remove('hidden');
          image.classList.add('hidden');
        }
      };

      const showReceiptError = () => {
        if (isResolved) return;
        isResolved = true;
        loading.classList.add('hidden');
        image.classList.add('hidden');
        frame.classList.add('hidden');
        empty.classList.remove('hidden');
      };

      const preloadImage = new Image();
      preloadImage.onload = () => {
        showLoadedReceipt('image');
      };
      preloadImage.onerror = () => {
        frame.onload = () => showLoadedReceipt('frame');
        frame.onerror = () => showReceiptError();
        frame.src = receiptUrl;
      };

      setTimeout(() => {
        if (!isResolved && frame.src === 'about:blank') {
          frame.onload = () => showLoadedReceipt('frame');
          frame.onerror = () => showReceiptError();
          frame.src = receiptUrl;
        }
      }, 1800);

      setTimeout(() => {
        if (!isResolved) showReceiptError();
      }, 7000);

      preloadImage.src = receiptUrl;
    }

    function openFinanceImportPrompt(initialValue = '') {
      openPromptModal({
        title: 'Importar dados do WhatsApp',
        text: 'Cole abaixo a mensagem completa recebida da Central de Registros para pré-preencher abastecimentos ou notinhas avulsas.',
        placeholder: 'Cole aqui o texto com motorista, fornecedor, data, valor e link do comprovante, quando houver.',
        value: initialValue,
        confirmLabel: 'Importar dados',
        cancelLabel: 'Cancelar',
        onConfirm: (value) => {
          const importedData = parseImportedCentralMessage(value);
          if (!importedData) {
            showToast('Não foi possível identificar os dados da Central. Confira o texto colado.');
            openFinanceImportPrompt(value);
            return;
          }
          if (importedData.type === 'loose_note') {
            openImportedLooseNoteLaunch(importedData);
          } else {
            openImportedFuelLaunch(importedData);
          }
        }
      });
    }

    function openImportedFuelLaunch(importedData) {
      openCadastroModal('finance');
      loadFinanceForm('combustivel');

      const supplier = resolveFuelSupplierByImportedName(importedData.posto);
      const driver = resolveDriverByImportedName(importedData.motorista);
      const vehicle = resolveVehicleByImportedDriver(importedData.motorista, driver);
      const notes = [];

      if (document.getElementById('finance-data-abastecimento')) {
        document.getElementById('finance-data-abastecimento').value = importedData.dataIso;
      }
      if (document.getElementById('finance-km')) {
        document.getElementById('finance-km').value = importedData.km || '';
      }
      if (document.getElementById('finance-total') && importedData.valor) {
        document.getElementById('finance-total').value = formatCurrencyInputValue(importedData.valor);
      }
      if (document.getElementById('finance-litros') && importedData.litros) {
        document.getElementById('finance-litros').value = importedData.litros;
      }
      if (document.getElementById('finance-fuel-type') && importedData.tipoCombustivel) {
        document.getElementById('finance-fuel-type').value = importedData.tipoCombustivel;
      }
      if (document.getElementById('finance-supplier-id') && supplier) {
        document.getElementById('finance-supplier-id').value = supplier.id;
      }
      if (document.getElementById('finance-driver-id') && driver) {
        document.getElementById('finance-driver-id').value = driver.id;
      }
      if (document.getElementById('finance-vehicle-id') && vehicle) {
        document.getElementById('finance-vehicle-id').value = vehicle.id;
      }
      if (document.getElementById('finance-vehicle-search') && vehicle) {
        document.getElementById('finance-vehicle-search').value = getVehicleAutocompleteLabel(vehicle);
      }

      if (importedData.cidade) {
        notes.push(`Cidade informada no WhatsApp: ${importedData.cidade}`);
      }
      if (!driver && importedData.motorista) {
        notes.push(`Motorista informado no WhatsApp: ${importedData.motorista}`);
      }
      if (!supplier && importedData.posto) {
        notes.push(`Posto informado no WhatsApp: ${importedData.posto}`);
      }
      if (!vehicle && importedData.motorista) {
        notes.push(`Veículo não localizado automaticamente para o motorista ${importedData.motorista}`);
      }

      const observationsField = document.getElementById('finance-observacoes');
      if (observationsField) {
        observationsField.value = notes.join(' | ');
      }

      updateFinanceReceiptPreview(importedData.comprovanteUrl || '');
      toggleFinanceSpecificFields();

      const pendingFields = [];
      if (!vehicle) pendingFields.push('veículo');
      if (!importedData.tipoCombustivel) pendingFields.push('tipo de combustível');
      if (!importedData.litros) pendingFields.push('quantidade em litros');
      if (!importedData.valor || !parseCurrencyInputValue(importedData.valor)) pendingFields.push('valor');
      showToast(pendingFields.length
        ? `Dados importados. Revise ${pendingFields.join(', ')} e finalize o lançamento.`
        : 'Abastecimento importado. Revise os dados e finalize o lançamento.');
    }

    function openImportedLooseNoteLaunch(importedData) {
      openCadastroModal('finance');
      loadFinanceForm('despesa');

      const expenseSuppliers = allSuppliers.filter((supplier) => supplier.tipo !== 'posto');
      const supplier = resolveSupplierByRelevantTerms(importedData.fornecedor, expenseSuppliers);
      const notes = [];

      if (document.getElementById('finance-order-search')) {
        document.getElementById('finance-order-search').value = 'Lançar sem OS por enquanto';
      }
      if (document.getElementById('finance-data-vencimento')) {
        document.getElementById('finance-data-vencimento').value = importedData.dataIso || getLocalIsoDate();
      }
      if (document.getElementById('finance-total') && importedData.valor) {
        document.getElementById('finance-total').value = formatCurrencyInputValue(importedData.valor);
      }
      if (document.getElementById('finance-supplier-id') && supplier) {
        document.getElementById('finance-supplier-id').value = supplier.id;
      }
      if (document.getElementById('finance-supplier-search')) {
        document.getElementById('finance-supplier-search').value = supplier
          ? getSupplierAutocompleteLabel(supplier)
          : importedData.fornecedor || '';
      }
      if (document.getElementById('finance-nf')) {
        document.getElementById('finance-nf').value = 'NOTINHA AVULSA';
      }
      if (document.getElementById('finance-km') && importedData.km) {
        document.getElementById('finance-km').value = importedData.km;
      }
      updateFinanceReceiptPreview(importedData.comprovanteUrl || '');

      if (importedData.tipoServico) {
        notes.push(`Tipo de serviço informado na Central: ${importedData.tipoServico}`);
      }
      if (importedData.motorista) {
        notes.push(`Motorista informado na Central: ${importedData.motorista}`);
      }
      if (importedData.observacoes) {
        notes.push(importedData.observacoes);
      }
      if (!supplier && importedData.fornecedor) {
        notes.push(`Fornecedor informado na Central: ${importedData.fornecedor}`);
      }

      const observationsField = document.getElementById('finance-observacoes');
      if (observationsField) {
        observationsField.value = notes.join(' | ');
      }

      toggleFinanceSpecificFields();
      showToast(supplier
        ? 'Notinha avulsa importada. Revise os dados e finalize o lançamento.'
        : 'Notinha avulsa importada. Confira o fornecedor antes de finalizar.');
    }

    function findVehicleDuplicate(payload, ignoreId = null) {
      const placa = normalizeSearchText(payload.placa);
      const frota = normalizeComparableText(payload.numeroFrota);
      return allVehicles.find((item) =>
        item.id !== ignoreId && (
          normalizeSearchText(item.placa) === placa ||
          normalizeComparableText(item.numeroFrota) === frota
        )
      );
    }

    function findDriverDuplicate(payload, ignoreId = null) {
      const cpf = onlyDigits(payload.cpf);
      const cnh = normalizeComparableText(payload.cnh);
      return allDrivers.find((item) =>
        item.id !== ignoreId && (
          onlyDigits(item.cpf) === cpf ||
          normalizeComparableText(item.cnh) === cnh
        )
      );
    }

    function findSupplierDuplicate(payload, ignoreId = null) {
      const documentDigits = onlyDigits(payload.documento || '');
      const name = normalizeComparableText(payload.nome);
      const type = normalizeComparableText(payload.tipo);
      return allSuppliers.find((item) =>
        item.id !== ignoreId && (
          (documentDigits && onlyDigits(item.documento || '') === documentDigits) ||
          (normalizeComparableText(item.nome) === name && normalizeComparableText(item.tipo) === type)
        )
      );
    }

    const moduleHeaderContent = {
      home: {
        title: 'Home',
        subtitle: 'Acompanhe a frota, os lançamentos e os principais indicadores em um só lugar.'
      },
      orders: {
        title: 'Ordens de Serviço (OS)',
        subtitle: 'Gerencie e acompanhe todas as ordens de serviço da frota.'
      },
      financeiro: {
        title: 'Financeiro',
        subtitle: 'Controle despesas, abastecimentos, agrupamentos e pendências operacionais.'
      },
      veiculos: {
        title: 'Veículos',
        subtitle: 'Organize veículos, quilometragem, seguros e dados estratégicos da operação.'
      },
      motoristas: {
        title: 'Motoristas',
        subtitle: 'Centralize equipe, CNHs, contatos e vencimentos importantes.'
      },
      fornecedores: {
        title: 'Fornecedores',
        subtitle: 'Mantenha parceiros, postos e prestadores organizados em um único painel.'
      },
      calendario: {
        title: 'Calendário',
        subtitle: 'Planeje revisões, acompanhe agendamentos e relacione OS futuras.'
      },
      documentos: {
        title: 'Documentos',
        subtitle: 'Consulte os comprovantes vinculados aos abastecimentos da frota.'
      },
      relatorios: {
        title: 'Relatórios',
        subtitle: 'Visualize custos, desempenho e histórico da operação com leitura rápida.'
      }
    };

    function updateModuleHeader(module) {
      const titleNode = document.getElementById('module-header-title');
      const subtitleNode = document.getElementById('module-header-subtitle');
      const content = moduleHeaderContent[module] || moduleHeaderContent.home;
      if (titleNode) titleNode.textContent = content.title;
      if (subtitleNode) subtitleNode.textContent = content.subtitle;
    }

    function applySidebarState() {
      if (!appLayoutEl) return;
      const isMobile = window.innerWidth <= 1120;
      appLayoutEl.classList.toggle('sidebar-collapsed', !isMobile && sidebarCollapsed);
      appLayoutEl.classList.toggle('sidebar-open-mobile', isMobile && sidebarCollapsed);
      if (sidebarToggleBtnEl) {
        const expanded = isMobile ? sidebarCollapsed : !sidebarCollapsed;
        sidebarToggleBtnEl.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        sidebarToggleBtnEl.setAttribute('aria-label', expanded ? 'Ocultar menu' : 'Exibir menu');
      }
    }

    function toggleSidebar(force) {
      const nextState = typeof force === 'boolean' ? force : !sidebarCollapsed;
      sidebarCollapsed = nextState;
      applySidebarState();
    }

    window.toggleSidebar = toggleSidebar;

    function showModule(module, button) {
      if (module === 'documentos') {
        showToast('A aba Documentos está desativada.');
        showModule('home', getModuleNavButton('home'));
        return;
      }
      document.querySelectorAll('.module-panel').forEach(panel => panel.classList.remove('active'));
      document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.id !== 'theme-toggle-btn') btn.classList.remove('active');
      });
      const panel = document.getElementById(`panel-${module}`);
      if (panel) panel.classList.add('active');
      if (button) button.classList.add('active');
      updateModuleHeader(module);
      if (window.innerWidth <= 1120 && sidebarCollapsed) {
        toggleSidebar(false);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function getModuleNavButton(module) {
      return Array.from(document.querySelectorAll('.nav-btn'))
        .find(button => (button.getAttribute('onclick') || '').includes(`showModule('${module}'`)) || null;
    }

    function openModuleFromHome(module) {
      showModule(module, getModuleNavButton(module));
    }

    function setFilterValue(id, value) {
      const field = document.getElementById(id);
      if (field) field.value = value || '';
    }

    function buildVehicleSearchValue(vehicle) {
      if (!vehicle) return '';
      return [vehicle.numeroFrota, vehicle.placa, vehicle.modelo, vehicle.chassi]
        .filter(Boolean)
        .join(' ');
    }

    function openFinanceForVehicle(vehicleId) {
      const vehicle = allVehicles.find(item => item.id === vehicleId);
      openModuleFromHome('financeiro');
      setFilterValue('finance-filter-search', buildVehicleSearchValue(vehicle));
      setFilterValue('finance-filter-status', '');
      setFilterValue('finance-filter-start', '');
      setFilterValue('finance-filter-end', '');
      setFilterValue('finance-filter-value', '');
      selectedFinance.clear();
      renderFinance();
    }

    function openDriverFromHome(driverId) {
      const driver = allDrivers.find(item => item.id === driverId);
      openModuleFromHome('motoristas');
      setFilterValue('driver-filter-search', driver ? [driver.nome, driver.cpf, driver.cnh, driver.telefone].filter(Boolean).join(' ') : '');
      setFilterValue('driver-filter-validity', '');
      selectedDrivers.clear();
      renderDrivers();
    }

    function openVehicleFromHome(vehicleId) {
      const vehicle = allVehicles.find(item => item.id === vehicleId);
      openModuleFromHome('veiculos');
      setFilterValue('vehicle-filter-search', buildVehicleSearchValue(vehicle));
      selectedVehicles.clear();
      renderVehicles();
    }

    function openOrdersForVehicle(vehicleId) {
      const vehicle = allVehicles.find(item => item.id === vehicleId);
      openModuleFromHome('orders');
      orderVehicleFilterId = vehicleId || '';
      setFilterValue('order-filter-search', vehicle ? `${vehicle.numeroFrota || ''} ${vehicle.placa || ''} ${vehicle.modelo || ''}`.trim() : '');
      setFilterValue('order-filter-start', '');
      setFilterValue('order-filter-end', '');
      setFilterValue('order-filter-status', '');
      setFilterValue('order-filter-sort', 'recentes');
      orderSortState = { key: 'default', direction: 'desc' };
      selectedOrders.clear();
      renderOrders();
    }

    function openOrderFromHome(orderId) {
      const order = allOrders.find(item => item.id === orderId);
      openModuleFromHome('orders');
      orderVehicleFilterId = '';
      setFilterValue('order-filter-search', order ? `OS ${getOrderNumberLabel(order)}` : '');
      setFilterValue('order-filter-start', '');
      setFilterValue('order-filter-end', '');
      setFilterValue('order-filter-status', '');
      setFilterValue('order-filter-sort', 'recentes');
      selectedOrders.clear();
      renderOrders();
    }

    function getMonthRange(monthKey) {
      const [year, month] = String(monthKey || getCurrentMonthKey()).split('-').map(Number);
      if (!year || !month) return { start: '', end: '' };
      return {
        start: `${year}-${String(month).padStart(2, '0')}-01`,
        end: new Date(year, month, 0).toISOString().slice(0, 10)
      };
    }

    function openMonthlyVehicleCostReport() {
      const monthKey = document.getElementById('home-monthly-cost-filter')?.value || getCurrentMonthKey();
      const { start, end } = getMonthRange(monthKey);
      openModuleFromHome('relatorios');
      setFilterValue('report-filter-type', 'monthly_vehicle_cost');
      setFilterValue('report-filter-vehicle', '');
      setFilterValue('report-filter-start', start);
      setFilterValue('report-filter-end', end);
      renderReports();
    }

    function handleDashboardShortcutKey(event, actionName, id) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      const action = window[actionName];
      if (typeof action === 'function') action(id);
    }

    window.openFinanceForVehicle = openFinanceForVehicle;
    window.openDriverFromHome = openDriverFromHome;
    window.openVehicleFromHome = openVehicleFromHome;
    window.openOrdersForVehicle = openOrdersForVehicle;
    window.openOrderFromHome = openOrderFromHome;
    window.openMonthlyVehicleCostReport = openMonthlyVehicleCostReport;
    window.printMonthlyVehicleCostDashboard = printMonthlyVehicleCostDashboard;
    window.handleDashboardShortcutKey = handleDashboardShortcutKey;
    window.renderMonthlyVehicleCostChart = renderMonthlyVehicleCostChart;

    function setupGlobalSearchInput(inputEl, resultsEl) {
      if (!inputEl || !resultsEl) return;

      inputEl.addEventListener('input', (event) => {
        setActiveSearchContext(inputEl, resultsEl);
        updateGlobalSearch(event.target.value, resultsEl);
      });

      inputEl.addEventListener('focus', (event) => {
        setActiveSearchContext(inputEl, resultsEl);
        updateGlobalSearch(event.target.value, resultsEl);
      });

      inputEl.addEventListener('keydown', (event) => {
        setActiveSearchContext(inputEl, resultsEl);
        if (resultsEl.classList.contains('hidden')) {
          if (event.key === 'Enter' && inputEl.value.trim()) {
            updateGlobalSearch(inputEl.value, resultsEl);
            if (filteredModules[0]) {
              openGlobalSearchModule(filteredModules[0]);
            }
          }
          return;
        }

        if (event.key === 'ArrowDown') {
          event.preventDefault();
          highlightedModuleIndex = Math.min(highlightedModuleIndex + 1, filteredModules.length - 1);
          syncHighlightedGlobalSearchItem();
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault();
          highlightedModuleIndex = Math.max(highlightedModuleIndex - 1, 0);
          syncHighlightedGlobalSearchItem();
        }

        if (event.key === 'Enter') {
          event.preventDefault();
          const selectedModule = filteredModules[highlightedModuleIndex] || filteredModules[0];
          if (selectedModule) {
            openGlobalSearchModule(selectedModule);
          }
        }

        if (event.key === 'Escape') {
          if (resultsEl === mobileGlobalSearchResultsEl) {
            closeMobileSearch();
          } else {
            hideGlobalSearchResults();
          }
        }
      });
    }

    setupGlobalSearchInput(globalSearchInputEl, globalSearchResultsEl);
    setupGlobalSearchInput(mobileGlobalSearchInputEl, mobileGlobalSearchResultsEl);

    if (globalSearchResultsEl) {
      globalSearchResultsEl.addEventListener('click', (event) => {
        const item = event.target.closest('.global-search-item');
        if (!item) return;
        openGlobalSearchModule(item.dataset.module
          ? { module: item.dataset.module }
          : { url: item.dataset.url });
      });
    }

    if (mobileGlobalSearchResultsEl) {
      mobileGlobalSearchResultsEl.addEventListener('click', (event) => {
        const item = event.target.closest('.global-search-item');
        if (!item) return;
        openGlobalSearchModule(item.dataset.module
          ? { module: item.dataset.module }
          : { url: item.dataset.url });
      });
    }

    if (globalSearchInputEl && globalSearchResultsEl) {
      document.addEventListener('click', (event) => {
        const clickedDesktopSearch = globalSearchResultsEl.contains(event.target) || globalSearchInputEl.contains(event.target);
        const clickedMobileSearch = mobileSearchModalEl?.contains(event.target) || mobileSearchBtnEl?.contains(event.target);
        if (!clickedDesktopSearch && !clickedMobileSearch) {
          searchFocusOverlayEl.classList.add('hidden');
          globalSearchResultsEl.classList.add('hidden');
          closeMobileSearch();
          highlightedModuleIndex = -1;
        }
      });
    }

    if (mobileSearchBtnEl) {
      mobileSearchBtnEl.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (mobileSearchModalEl.classList.contains('open')) {
          closeMobileSearch();
        } else {
          openMobileSearch();
        }
      });
    }

    if (mobileSearchBackdropEl) {
      mobileSearchBackdropEl.addEventListener('click', () => {
        closeMobileSearch();
      });
    }

    function applyThemeState(isDark) {
      document.body.classList.toggle('dark-mode', isDark);
      const themeButton = document.getElementById('theme-toggle-btn');
      if (themeButton) themeButton.classList.toggle('active', isDark);
      document.getElementById('settings-theme-light')?.classList.toggle('active', !isDark);
      document.getElementById('settings-theme-dark')?.classList.toggle('active', isDark);
      localStorage.setItem('wefrotas_theme', isDark ? 'dark' : 'light');
    }

    function toggleTheme() {
      applyThemeState(!document.body.classList.contains('dark-mode'));
    }

    function openPremiumModal() {
      currentModalType = 'premium';
      currentEditingId = null;
      currentFinanceEntryType = null;
      const backdrop = document.getElementById('modal-backdrop');
      const fields = document.getElementById('modal-fields');
      const kicker = document.getElementById('modal-kicker');
      const title = document.getElementById('modal-title');
      const isDark = document.body.classList.contains('dark-mode');
      const premiumWhatsAppUrl = 'https://wa.me/5527988790381?text=' + encodeURIComponent('Olá! Quero assinar o WeFrotas Premium por R$ 29,90. Pode me passar os próximos passos?');

      kicker.textContent = 'WeFrotas Premium';
      title.textContent = 'Versão Premium  R$ 29,90';
      setModalSubmitState(false);
      setModalActionsVisible(false);

      fields.innerHTML = `
        <div class="space-y-6 w-full" style="grid-column: 1 / -1;">
          <div class="rounded-[24px] border ${isDark ? 'border-amber-500/30 bg-gradient-to-br from-[#2f2411] to-[#1b2438]' : 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50'} p-6">
            <p class="text-sm font-bold uppercase tracking-[0.18em] ${isDark ? 'text-amber-300' : 'text-amber-700'}">Plano Premium</p>
            <h4 class="mt-3 text-2xl font-extrabold ${isDark ? 'text-slate-50' : 'text-slate-900'}">Faça upgrade para o plano premium e desbloqueie a versão completa do sistema</h4>
            <p class="mt-3 text-sm leading-7 ${isDark ? 'text-slate-300' : 'text-slate-700'}">Tenha seu logo aplicado no sistema, relatórios extras, recursos avançados de gestão e uma apresentação mais profissional para a sua operação.</p>
            <a href="${premiumWhatsAppUrl}" target="_blank" rel="noopener noreferrer" class="mt-5 inline-flex items-center gap-3 rounded-[18px] px-5 py-3 font-extrabold ${isDark ? 'bg-[#25D366] text-[#0f172a]' : 'bg-[#25D366] text-white'} shadow-[0_16px_28px_rgba(37,211,102,0.28)] hover:translate-y-[-1px] transition-all">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.52 3.48A11.86 11.86 0 0012.07 0C5.5 0 .14 5.35.14 11.92c0 2.1.55 4.16 1.6 5.98L0 24l6.28-1.65a11.9 11.9 0 005.79 1.48h.01c6.56 0 11.92-5.35 11.92-11.92 0-3.18-1.24-6.17-3.48-8.43zM12.08 21.8h-.01a9.9 9.9 0 01-5.04-1.38l-.36-.21-3.73.98 1-3.64-.24-.38a9.87 9.87 0 01-1.53-5.25c0-5.46 4.44-9.9 9.91-9.9 2.64 0 5.12 1.03 6.98 2.9a9.82 9.82 0 012.9 6.99c0 5.46-4.44 9.9-9.89 9.9zm5.43-7.42c-.3-.15-1.77-.87-2.04-.97-.27-.1-.46-.15-.66.15-.19.3-.76.97-.93 1.16-.17.2-.34.22-.64.08-.3-.15-1.25-.46-2.38-1.47a8.9 8.9 0 01-1.65-2.05c-.17-.3-.02-.46.13-.61.13-.13.3-.34.44-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.66-.5h-.56c-.2 0-.52.08-.8.37-.27.3-1.03 1-1.03 2.44 0 1.44 1.05 2.84 1.2 3.04.14.2 2.07 3.16 5.01 4.43.7.3 1.25.49 1.68.63.71.22 1.36.19 1.87.11.57-.08 1.77-.72 2.02-1.42.25-.69.25-1.28.17-1.41-.07-.12-.27-.2-.57-.35z"/>
              </svg>
              <span>Assinar Premium Agora</span>
            </a>
          </div>
          <div class="overflow-hidden rounded-[24px] border ${isDark ? 'border-slate-700 bg-[#111b2d]' : 'border-slate-200 bg-white'}">
            <div class="grid grid-cols-[1.8fr_1fr_1fr] border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}">
              <div class="p-5 flex items-center justify-center text-center">
                <p class="text-xs font-extrabold uppercase tracking-[0.18em] ${isDark ? 'text-slate-400' : 'text-slate-500'}">Comparativo de planos</p>
              </div>
              <div class="p-5 text-center border-l ${isDark ? 'border-slate-700' : 'border-slate-200'}">
                <p class="text-xs font-extrabold uppercase tracking-[0.18em] ${isDark ? 'text-slate-400' : 'text-slate-500'}">Grátis</p>
                <h5 class="mt-2 text-xl font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}">Essencial</h5>
              </div>
              <div class="p-5 text-center border-l ${isDark ? 'border-amber-500/30 bg-gradient-to-b from-[#3a2d11] to-[#251e12]' : 'border-amber-200 bg-gradient-to-b from-[#fff9df] to-[#fff1bf]'}">
                <p class="text-xs font-extrabold uppercase tracking-[0.18em] ${isDark ? 'text-amber-300' : 'text-amber-700'}">Premium</p>
                <h5 class="mt-2 text-xl font-extrabold ${isDark ? 'text-slate-50' : 'text-slate-900'}">Profissional</h5>
                <p class="mt-1 text-sm font-bold ${isDark ? 'text-amber-300' : 'text-amber-700'}">R$ 29,90</p>
              </div>
            </div>
            <div class="grid grid-cols-[1.8fr_1fr_1fr]">
              ${[
                ['Cadastro de veículos, motoristas, parceiros e OS', true, true],
                ['Lançamentos financeiros vinculados à OS', true, true],
                ['Impressão padrão da OS', true, true],
                ['Dashboard básico do sistema', true, true],
                ['Seu logo aplicado no sistema', false, true],
                ['Seu logo nos relatórios e impressões', false, true],
                ['Relatórios avançados de operação', false, true],
                ['Indicadores extras e análises gerenciais', false, true],
                ['Filtros premium e consultas avançadas', false, true]
              ].map(([label, free, premium], index) => `
                <div class="contents">
                  <div class="p-4 text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'} ${index < 8 ? (isDark ? 'border-b border-slate-700' : 'border-b border-slate-200') : ''}">${label}</div>
                  <div class="p-4 flex items-center justify-center border-l ${isDark ? 'border-slate-700' : 'border-slate-200'} ${index < 8 ? (isDark ? 'border-b border-slate-700' : 'border-b border-slate-200') : ''}">
                    <span class="inline-flex h-8 w-8 items-center justify-center rounded-full ${free ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500'} text-lg font-extrabold">${free ? '✓' : '-'}</span>
                  </div>
                  <div class="p-4 flex items-center justify-center border-l ${isDark ? 'border-amber-500/30 bg-[#1b2230]' : 'border-amber-200 bg-[#fffdf4]'} ${index < 8 ? (isDark ? 'border-b border-slate-700' : 'border-b border-amber-100') : ''}">
                    <span class="inline-flex h-8 w-8 items-center justify-center rounded-full ${premium ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500'} text-lg font-extrabold">${premium ? '✓' : '-'}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="rounded-[22px] ${isDark ? 'bg-[#182233] border border-slate-700' : 'bg-slate-50 border border-slate-200'} p-5">
            <p class="text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}">A versão premium é ideal para quem quer apresentar a ferramenta com a própria identidade visual e ampliar a camada de gestão com mais relatórios e análises.</p>
          </div>
        </div>
      `;

      backdrop.classList.add('show');
    }

    function openCadastroModal(type) {
      currentModalType = type;
      currentEditingId = null;
      currentFinanceEntryType = null;
      const backdrop = document.getElementById('modal-backdrop');
      const fields = document.getElementById('modal-fields');
      const kicker = document.getElementById('modal-kicker');
      const title = document.getElementById('modal-title');
      setModalSubmitState(true, 'Salvar cadastro');
      setModalActionsVisible(true);
      setCadastroModalReadOnly(false);
      setModalVisual('default', 'Preencha as informações para continuar.');

      if (type === 'vehicle') {
        setModalVisual('default', 'Preencha os dados principais do veículo.');
        kicker.textContent = 'Veículos';
        title.textContent = 'Cadastrar veículo';
        fields.innerHTML = `
          <div class="field-wrap">
            <label>${requiredLabel('Número de Frota')}</label>
            <input class="soft-input w-full" id="vehicle-frota" placeholder="Ex: 015" required>
          </div>
          <div class="field-wrap">
            <label>${requiredLabel('Placa')}</label>
            <input class="soft-input w-full" id="vehicle-placa" placeholder="ABC-1234" required>
          </div>
          <div class="field-wrap">
            <label>${requiredLabel('Modelo')}</label>
            <input class="soft-input w-full" id="vehicle-modelo" placeholder="Ex: Ford Cargo 816" required>
          </div>
          <div class="field-wrap">
            <label>${requiredLabel('Ano')}</label>
            <input class="soft-input w-full" id="vehicle-ano" placeholder="2024" required>
          </div>
          <div class="field-wrap">
            <label>Cor</label>
            <input class="soft-input w-full" id="vehicle-cor" placeholder="Branco">
          </div>
          <div class="field-wrap">
            <label>Vencimento do seguro</label>
            <input class="soft-input w-full" id="vehicle-seguro" type="date">
          </div>
          <div class="field-wrap">
            <label>Motorista vinculado</label>
            <select class="soft-input w-full" id="vehicle-motorista">
              <option value="">Selecione um motorista</option>
              ${getSortedDrivers().map(driver => `<option value="${driver.id}">${escapeHtml(driver.nome)}</option>`).join('')}
            </select>
          </div>
          <div class="field-wrap full">
            <label>Chassi</label>
            <input class="soft-input w-full" id="vehicle-chassi" placeholder="9BWZZZ377VT004251">
          </div>
        `;
      } else if (type === 'driver') {
        setModalVisual('default', 'Cadastre o motorista e vincule os veículos quando necessário.');
        kicker.textContent = 'Motoristas';
        title.textContent = 'Cadastrar motorista';
        fields.innerHTML = `
          <div class="field-wrap field-wrap--span-2">
            <label>${requiredLabel('Nome completo')}</label>
            <input class="soft-input w-full" id="driver-nome" placeholder="Nome do motorista" required>
          </div>
          <div class="field-wrap">
            <label>${requiredLabel('CPF')}</label>
            <input class="soft-input w-full" id="driver-cpf" placeholder="000.000.000-00" required>
          </div>
          <div class="field-wrap">
            <label>${requiredLabel('CNH')}</label>
            <input class="soft-input w-full" id="driver-cnh" placeholder="00000000000" required>
          </div>
          <div class="field-wrap">
            <label>${requiredLabel('Categoria')}</label>
            <select class="soft-input w-full" id="driver-categoria" required>
              <option value="">Selecione</option>
              <option value="ACC">ACC</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="AB">AB</option>
              <option value="C">C</option>
              <option value="AC">AC</option>
              <option value="D">D</option>
              <option value="AD">AD</option>
              <option value="E">E</option>
              <option value="AE">AE</option>
            </select>
          </div>
          <div class="field-wrap">
            <label>Telefone</label>
            <input class="soft-input w-full" id="driver-telefone" placeholder="(00) 00000-0000">
          </div>
          <div class="field-wrap">
            <label>Validade da CNH</label>
            <input class="soft-input w-full" id="driver-validade" type="date">
          </div>
          <div class="field-wrap full">
            <label>Veículos vinculados</label>
            <div id="driver-vehicles" class="driver-vehicle-checklist" role="group" aria-label="Veículos vinculados ao motorista">
              ${getSortedVehicles().length
                ? getSortedVehicles().map(vehicle => `
                  <label class="driver-vehicle-option">
                    <input type="checkbox" value="${vehicle.id}">
                    <span class="driver-vehicle-check" aria-hidden="true">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 12l4 4 10-10"/>
                      </svg>
                    </span>
                    <span class="driver-vehicle-text">
                      <strong>${escapeHtml([vehicle.numeroFrota, vehicle.placa].filter(Boolean).join(' - ') || 'Veículo sem identificação')}</strong>
                      <small>${escapeHtml(vehicle.modelo || 'Modelo não informado')}</small>
                    </span>
                  </label>
                `).join('')
                : '<div class="driver-vehicle-empty">Cadastre veículos para criar vínculos com este motorista.</div>'}
            </div>
          </div>
        `;
      } else if (type === 'supplier') {
        setModalVisual('default', 'Cadastre parceiros, postos e prestadores usados no financeiro.');
        kicker.textContent = 'Fornecedores';
        title.textContent = 'Cadastrar fornecedor';
        fields.innerHTML = `
          <div class="field-wrap full">
            <label>${requiredLabel('Nome do parceiro')}</label>
            <input class="soft-input w-full" id="supplier-name" placeholder="Nome do fornecedor ou parceiro" required>
          </div>
          <div class="field-wrap">
            <label>${requiredLabel('Tipo de parceiro')}</label>
            <select class="soft-input w-full" id="supplier-type" required>
              <option value="">Selecione</option>
              <option value="posto">Posto de combustível</option>
              <option value="oficina">Oficina</option>
              <option value="concessionaria">Concessionária</option>
              <option value="pecas">Loja de peças</option>
              <option value="pneus">Pneus</option>
              <option value="lubrificantes">Lubrificantes</option>
              <option value="eletrica">Elétrica automotiva</option>
              <option value="funilaria">Funilaria e pintura</option>
              <option value="borracharia">Borracharia</option>
              <option value="guincho">Guincho</option>
              <option value="seguradora">Seguradora</option>
              <option value="rastreamento">Rastreamento e telemetria</option>
              <option value="lavajato">Lava-jato</option>
              <option value="locadora">Locadora</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div class="field-wrap">
            <label>Documento</label>
            <input class="soft-input w-full" id="supplier-document" placeholder="CPF/CNPJ">
          </div>
          <div class="field-wrap">
            <label>Telefone</label>
            <input class="soft-input w-full" id="supplier-phone" placeholder="(00) 00000-0000">
          </div>
          <div class="field-wrap">
            <label>E-mail</label>
            <input class="soft-input w-full" id="supplier-email" placeholder="contato@fornecedor.com">
          </div>
          <div class="field-wrap full">
            <label>Observações</label>
            <textarea class="soft-input textarea w-full" id="supplier-notes" placeholder="Observações do parceiro"></textarea>
          </div>
        `;
      } else if (type === 'order') {
        syncOrderCounterWithOrders();
        setModalVisual('order', 'Preencha as informações para criar uma nova ordem de serviço.');
        const administrationOptions = getAdministrationOptions();
        kicker.textContent = 'Ordens de serviço';
        title.textContent = 'Cadastrar OS';
        fields.innerHTML = `
          <div class="field-wrap">
            <label>Nº OS</label>
            <div class="form-input-shell">
              ${fieldIcon('hash')}
              <input class="soft-input w-full" id="order-numero" value="${String(orderCounter).padStart(4, '0')}" ${allowManualOrderNumberEditing ? '' : 'readonly'}>
            </div>
          </div>
          <div class="field-wrap">
            <label>${requiredLabel('Tipo de OS')}</label>
            <div class="form-input-shell">
              ${fieldIcon('document')}
              <select class="soft-input w-full" id="order-tipo-os" onchange="updateOrderDescriptionFromType()" required>
                <option value="avulsa">Avulsa</option>
                <option value="mensal">Mensal de despesas</option>
                <option value="revisao">Revisão</option>
                <option value="sinistro">Sinistro</option>
              </select>
            </div>
          </div>
          <div class="field-wrap">
            <label>Administração</label>
            <div class="form-input-shell">
              ${fieldIcon('building')}
              <select class="soft-input w-full" id="order-administracao" onchange="toggleOrderAdministrationCustom()">
                <option value="">Selecione</option>
                ${administrationOptions.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('')}
                <option value="__custom__">Outra administração</option>
              </select>
            </div>
          </div>
          <div class="field-wrap hidden" id="order-administracao-custom-wrap">
            <label>Nova administração</label>
            <div class="form-input-shell">
              ${fieldIcon('building')}
              <input class="soft-input w-full" id="order-administracao-custom" placeholder="Digite a administração">
            </div>
          </div>
          <div class="field-wrap">
            <label>Status</label>
            <div class="form-input-shell">
              ${fieldIcon('flag')}
              <select class="soft-input w-full" id="order-status">
                <option value="aberta">Aberta</option>
                <option value="andamento">Em andamento</option>
                <option value="fechada">Fechada</option>
              </select>
            </div>
          </div>
          <div class="field-wrap">
            <label>Data de início</label>
            <div class="form-input-shell form-input-shell--date">
              ${fieldIcon('calendar')}
              <input class="soft-input w-full" id="order-data-inicio" type="date" onchange="handleOrderStartDateChange()">
            </div>
          </div>
          <div class="field-wrap">
            <label>Data de fim</label>
            <div class="form-input-shell form-input-shell--date">
              ${fieldIcon('calendar')}
              <input class="soft-input w-full" id="order-data-termino" type="date" onchange="handleOrderEndDateChange()">
            </div>
          </div>
          <div class="field-wrap">
            <label>${requiredLabel('Veículo')}</label>
            <div class="form-input-shell">
              ${fieldIcon('vehicle')}
              <select class="soft-input w-full" id="order-veiculo" onchange="handleOrderVehicleChange()" required>
                <option value="">Selecione um veículo</option>
                ${getSortedVehicles().map(vehicle => `<option value="${vehicle.id}">${escapeHtml(vehicle.numeroFrota)}  ${escapeHtml(vehicle.placa)}  ${escapeHtml(vehicle.modelo)}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="field-wrap">
            <label>Responsável</label>
            <div class="form-input-shell">
              ${fieldIcon('user')}
              <select class="soft-input w-full" id="order-driver">
                <option value="">Selecione um motorista</option>
                ${getSortedDrivers().map(driver => `<option value="${driver.id}">${escapeHtml(driver.nome)}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="field-wrap full">
            <label>${requiredLabel('Descrição do serviço / problema')}</label>
            <div class="form-input-shell form-input-shell--textarea">
              ${fieldIcon('edit')}
              <textarea class="soft-input textarea w-full" id="order-descricao" placeholder="Descreva tudo que deve sair na impressão da OS."></textarea>
            </div>
          </div>
        `;
        setOrderAdministrationFormValue(getLastAdministrationValue());
        updateOrderDateConstraints();
      } else if (type === 'finance') {
        setModalVisual('finance', 'Escolha o tipo de lançamento que deseja realizar.');
        kicker.textContent = 'Financeiro';
        title.textContent = 'Novo lançamento';
        fields.innerHTML = `
          <div class="field-wrap full">
            <label>O que você quer lançar?</label>
            <div class="finance-choice-grid">
              <button type="button" class="finance-choice-card finance-choice-card--fuel" onclick="loadFinanceForm('combustivel')">
                <span class="finance-choice-icon">${modalIcons.fuel}</span>
                <span class="finance-choice-content">
                  <span class="finance-choice-title">Lançamento de combustível</span>
                  <span class="finance-choice-rule"></span>
                  <span class="finance-choice-description">Selecione veículo, data de abastecimento, posto, tipo de combustível, litros, valor e KM.</span>
                </span>
                <span class="finance-choice-arrow">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </span>
              </button>
              <button type="button" class="finance-choice-card finance-choice-card--expense" onclick="loadFinanceForm('despesa')">
                <span class="finance-choice-icon">${modalIcons.expense}</span>
                <span class="finance-choice-content">
                  <span class="finance-choice-title">Lançamento de despesa</span>
                  <span class="finance-choice-rule"></span>
                  <span class="finance-choice-description">Registre notas fiscais, seguros, serviços, peças e outros lançamentos que não são abastecimento.</span>
                </span>
                <span class="finance-choice-arrow">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </span>
              </button>
            </div>
          </div>
        `;
        setModalSubmitState(false);
      }

      backdrop.classList.add('show');
      attachModalInputMasks();
      enhanceModalSelects();
    }

    function closeCadastroModal() {
      document.getElementById('modal-backdrop').classList.remove('show');
      closeCustomSelects();
      document.getElementById('cadastro-form').reset();
      currentModalType = null;
      currentEditingId = null;
      currentFinanceEntryType = null;
      setModalSubmitState(true, 'Salvar cadastro');
      setModalActionsVisible(true);
    }

    function handleModalBackdrop(event) {
      if (event) event.stopPropagation();
      if (!event?.target?.closest('.custom-select-shell')) closeCustomSelects();
    }

    function downloadBlob(filename, blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 300);
    }

    function exportSystemBackup() {
      const payload = {
        version: 'wefrotas-backup-v1',
        exportedAt: new Date().toISOString(),
        theme: localStorage.getItem('wefrotas_theme') || 'light',
        customLogoEnabled,
        customLogoUrl,
        customLogoScale,
        managerDisplayName,
        allowManualOrderNumberEditing,
        orderCounter,
        notifications: systemNotifications,
        vehicles: allVehicles,
        drivers: allDrivers,
        suppliers: allSuppliers,
        orders: allOrders,
        finance: allFinanceEntries,
        administrations: allAdministrations,
        deletedOrders
      };
      downloadBlob(`wefrotas_backup_${getLocalIsoDate()}.json`, new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' }));
      showToast('Backup exportado com sucesso.', {
        notify: true,
        notifyTitle: 'Backup exportado',
        notifyMessage: 'Seu backup local do WeFrotas foi baixado em JSON.'
      });
    }

    function importSystemBackup() {
      const input = document.getElementById('wefrotas-import-backup-input');
      if (!input) return;
      input.value = '';
      input.click();
    }

    function handleBackupImportFile(event) {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        try {
          const parsed = JSON.parse(loadEvent.target.result);
          if (!Array.isArray(parsed.vehicles) || !Array.isArray(parsed.drivers) || !Array.isArray(parsed.suppliers) || !Array.isArray(parsed.orders) || !Array.isArray(parsed.finance)) {
            throw new Error('Estrutura inválida');
          }
          allVehicles = parsed.vehicles.map(normalizeVehicleRecord);
          allDrivers = parsed.drivers.map(normalizeDriverRecord);
          allSuppliers = parsed.suppliers.map((supplier) => ({
            ...supplier,
            tipoLabel: getSupplierTypeLabel(supplier.tipo)
          }));
          allOrders = parsed.orders;
          allFinanceEntries = parsed.finance;
          allAdministrations = normalizeAdministrationList(parsed.administrations || parsed.administracoes || []);
          deletedOrders = Array.isArray(parsed.deletedOrders) ? parsed.deletedOrders : [];
          systemNotifications = Array.isArray(parsed.notifications) ? parsed.notifications.slice(0, 30) : [];
          orderCounter = Number(parsed.orderCounter) || 1;
          customLogoEnabled = !!parsed.customLogoEnabled;
          customLogoUrl = parsed.customLogoUrl || '';
          customLogoScale = Number(parsed.customLogoScale) || 60;
          managerDisplayName = parsed.managerDisplayName || parsed.defaultAdministratorName || 'Gestor';
          allowManualOrderNumberEditing = !!parsed.allowManualOrderNumberEditing;
          if (!allAdministrations.length) allAdministrations = collectLegacyAdministrationOptions();
          if (parsed.theme === 'dark' || parsed.theme === 'light') {
            applyThemeState(parsed.theme === 'dark');
          }
          syncOrderCounterWithOrders();
          saveToLocalStorage();
          renderAll();
          renderNotifications();
          updateCustomLogoUi();
          updateOperationSettingsUi();
          showToast('Backup importado com sucesso.', {
            notify: true,
            notifyTitle: 'Backup importado',
            notifyMessage: `Os dados de ${file.name} foram restaurados no WeFrotas.`
          });
          toggleSettings(false);
        } catch (error) {
          console.error(error);
          showToast('Não foi possível importar esse backup.');
        }
      };
      reader.readAsText(file, 'utf-8');
    }

    function resetSystemState() {
      allVehicles = [];
      allDrivers = [];
      allSuppliers = [];
      allOrders = [];
      allFinanceEntries = [];
      allAdministrations = [];
      deletedOrders = [];
      systemNotifications = [];
      selectedVehicles.clear();
      selectedDrivers.clear();
      selectedSuppliers.clear();
      selectedOrders.clear();
      selectedFinance.clear();
      orderCounter = 1;
      managerDisplayName = 'Gestor';
      allowManualOrderNumberEditing = false;
      customLogoEnabled = false;
      customLogoUrl = '';
      customLogoScale = 60;
      [
        'wefrotas_vehicles',
        'wefrotas_drivers',
        'wefrotas_suppliers',
        'wefrotas_orders',
        'wefrotas_finance',
        'wefrotas_administrations',
        'wefrotas_deleted_orders',
        'wefrotas_order_counter',
        'wefrotas_notifications',
        'wefrotas_custom_logo_enabled',
        'wefrotas_custom_logo_url',
        'wefrotas_custom_logo_scale',
        'wefrotas_default_administrator_name',
        'wefrotas_manager_display_name',
        'wefrotas_allow_manual_order_number_editing',
        'wefrotas_theme'
      ].forEach((key) => localStorage.removeItem(key));
      applyThemeState(false);
      saveToLocalStorage();
      renderAll();
      renderNotifications();
      updateCustomLogoUi();
      updateOperationSettingsUi();
    }

    function openSystemResetModal() {
      openPromptModal({
        title: 'Resetar sistema',
        text: 'Isso vai limpar OS, financeiro, veículos, motoristas, fornecedores, notificações, personalizações e histórico de exclusões. Digite RESETAR para continuar.',
        placeholder: 'Digite RESETAR',
        exactValue: 'RESETAR',
        confirmLabel: 'Resetar',
        onConfirm: () => {
          openSettingsFeedback('loading', 'Resetando sistema', 'Estamos removendo todos os dados locais do WeFrotas.');
          setTimeout(() => {
            resetSystemState();
            toggleSettings(false);
            openSettingsFeedback('success', 'Sistema resetado', 'Todos os dados locais e personalizações foram limpos com sucesso.');
          }, 700);
        }
      });
    }

    function normalizeImportHeader(value) {
      return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
    }

    function normalizeImportedDate(value) {
      if (!value) return '';
      if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toISOString().slice(0, 10);
      }
      if (typeof value === 'number' && Number.isFinite(value)) {
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const parsed = new Date(excelEpoch.getTime() + (value * 86400000));
        return parsed.toISOString().slice(0, 10);
      }
      const text = String(value).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
      if (/^\d{8}$/.test(text)) {
        return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
      }
      const separators = ['/', '-', '.', '\\'];
      for (const separator of separators) {
        const escapedSeparator = separator === '\\' ? '\\\\' : separator === '.' ? '\\.' : separator;
        const brDate = text.match(new RegExp(`^(\\d{1,2})${escapedSeparator}(\\d{1,2})${escapedSeparator}(\\d{4})$`));
        if (brDate) {
          const day = brDate[1].padStart(2, '0');
          const month = brDate[2].padStart(2, '0');
          return `${brDate[3]}-${month}-${day}`;
        }
        const isoDate = text.match(new RegExp(`^(\\d{4})${escapedSeparator}(\\d{1,2})${escapedSeparator}(\\d{1,2})$`));
        if (isoDate) {
          return `${isoDate[1]}-${isoDate[2].padStart(2, '0')}-${isoDate[3].padStart(2, '0')}`;
        }
      }
      const parsed = new Date(text);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().slice(0, 10);
      }
      return '';
    }

    function getMappedRow(row) {
      const mapped = {};
      Object.entries(row || {}).forEach(([key, value]) => {
        mapped[normalizeImportHeader(key)] = typeof value === 'string' ? value.trim() : value;
      });
      return mapped;
    }

    function getMappedValue(row, possibleKeys) {
      const normalizedKeys = possibleKeys.map(normalizeImportHeader);
      return normalizedKeys.reduce((found, key) => {
        if (found !== '') return found;
        const value = row[key];
        return value === undefined || value === null ? '' : value;
      }, '');
    }

    function normalizeSupplierType(value) {
      const normalized = normalizeImportHeader(value);
      const aliases = {
        posto: 'posto',
        postodecombustivel: 'posto',
        oficina: 'oficina',
        concessionaria: 'concessionaria',
        lojasdepecas: 'pecas',
        pecas: 'pecas',
        pneus: 'pneus',
        lubrificantes: 'lubrificantes',
        eletrica: 'eletrica',
        eletricaautomotiva: 'eletrica',
        funilaria: 'funilaria',
        funilariaepintura: 'funilaria',
        borracharia: 'borracharia',
        guincho: 'guincho',
        seguradora: 'seguradora',
        rastreamento: 'rastreamento',
        rastreamentoetelemetria: 'rastreamento',
        lavajato: 'lavajato',
        locadora: 'locadora',
        outro: 'outro'
      };
      return aliases[normalized] || '';
    }

    function getBatchTemplateRows(entity) {
      if (entity === 'vehicle') {
        return [
          ['NumeroFrota', 'Placa', 'Modelo', 'Ano', 'Cor', 'VencimentoSeguro', 'Chassi'],
          ['015', 'ABC1D23', 'Strada Freedom', '2024', 'Branco', '2026-12-20', '9BWZZZ377VT004251']
        ];
      }
      if (entity === 'driver') {
        return [
          ['Nome', 'CPF', 'CNH', 'Categoria', 'Telefone', 'ValidadeCNH', 'Veiculos'],
          ['João da Silva', '123.456.789-09', '12345678900', 'AB', '(27) 99999-0000', '2027-05-17', '015, ABC1D23']
        ];
      }
      if (entity === 'supplier') {
        return [
          ['Nome', 'Tipo', 'Documento', 'Telefone', 'Email', 'Observacoes'],
          ['Auto Posto Exemplo', 'Posto de combustível', '12.345.678/0001-90', '(27) 3333-0000', 'financeiro@posto.com.br', 'Fornecedor ativo']
        ];
      }
      return [];
    }

    function downloadBatchTemplate(entity) {
      const labels = {
        vehicle: 'veículos',
        driver: 'motoristas',
        supplier: 'fornecedores'
      };
      const label = labels[entity];
      if (!label) {
        showToast('Modelo de planilha não reconhecido.');
        return;
      }
      const rows = getBatchTemplateRows(entity);
      if (window.XLSX) {
        const workbook = XLSX.utils.book_new();
        const sheet = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(workbook, sheet, 'Modelo');
        XLSX.writeFile(workbook, `wefrotas_modelo_${label}.xlsx`);
      } else {
        const csv = rows.map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\n');
        downloadBlob(`wefrotas_modelo_${label}.csv`, new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      }
      showToast(`Modelo de ${label} baixado com sucesso.`, {
        notify: true,
        notifyTitle: 'Modelo de planilha',
        notifyMessage: `O modelo de ${label} foi gerado para preenchimento em lote.`
      });
    }

    function triggerBatchImport(entity) {
      if (!['vehicle', 'driver', 'supplier'].includes(entity)) {
        showToast('Tipo de importação não reconhecido.');
        return;
      }
      pendingBatchImportEntity = entity;
      const input = document.getElementById('wefrotas-batch-import-input');
      if (!input) return;
      input.value = '';
      input.click();
    }

    function importVehiclesFromRows(rows) {
      let created = 0;
      let updated = 0;
      let skipped = 0;
      let duplicates = 0;
      rows.forEach((rawRow) => {
        const row = getMappedRow(rawRow);
        const numeroFrota = getMappedValue(row, ['NumeroFrota', 'Frota', 'CodigoFrota']);
        const placa = getMappedValue(row, ['Placa']);
        const modelo = getMappedValue(row, ['Modelo', 'Veiculo']);
        const ano = getMappedValue(row, ['Ano']);
        const cor = getMappedValue(row, ['Cor']);
        const seguroVencimento = normalizeImportedDate(getMappedValue(row, ['VencimentoSeguro', 'SeguroVencimento', 'Seguro']));
        const chassi = getMappedValue(row, ['Chassi']);
        if (!numeroFrota || !placa || !modelo || !ano) {
          skipped += 1;
          return;
        }
        const payload = { numeroFrota, placa, modelo, ano, cor, seguroVencimento, chassi };
        const existingIndex = allVehicles.findIndex((item) => item.numeroFrota === numeroFrota || normalizeSearchText(item.placa) === normalizeSearchText(placa));
        if (existingIndex >= 0) {
          const duplicate = findVehicleDuplicate(payload, allVehicles[existingIndex].id);
          if (duplicate) {
            duplicates += 1;
            return;
          }
          const isSame = JSON.stringify({ ...allVehicles[existingIndex], id: undefined }) === JSON.stringify({ ...allVehicles[existingIndex], ...payload, id: undefined });
          if (isSame) {
            duplicates += 1;
          } else {
            allVehicles[existingIndex] = { ...allVehicles[existingIndex], ...payload };
            updated += 1;
          }
        } else {
          if (findVehicleDuplicate(payload)) {
            duplicates += 1;
            return;
          }
          allVehicles.unshift({ id: generateId(), ...payload });
          created += 1;
        }
      });
      return { created, updated, skipped, duplicates, label: 'veículos' };
    }

    function resolveImportedVehicleIds(value) {
      return String(value || '')
        .split(/[,;|]/)
        .map(item => item.trim())
        .filter(Boolean)
        .map((token) => {
          const normalizedToken = normalizeSearchText(token);
          const exactVehicle = allVehicles.find((vehicle) =>
            normalizeSearchText(vehicle.numeroFrota) === normalizedToken ||
            normalizeSearchText(vehicle.placa) === normalizedToken ||
            normalizeSearchText(getVehicleAutocompleteLabel(vehicle)) === normalizedToken
          );
          return exactVehicle?.id || '';
        })
        .filter(Boolean);
    }

    function importDriversFromRows(rows) {
      let created = 0;
      let updated = 0;
      let skipped = 0;
      let duplicates = 0;
      rows.forEach((rawRow) => {
        const row = getMappedRow(rawRow);
        const nome = String(getMappedValue(row, ['Nome', 'Motorista'])).trim();
        const cpf = formatCpf(String(getMappedValue(row, ['CPF', 'Documento', 'CpfMotorista'])).trim());
        const cnh = String(getMappedValue(row, ['CNH', 'NumeroCNH'])).trim();
        const categoria = getMappedValue(row, ['Categoria', 'CategoriaCNH']).toUpperCase();
        const telefone = String(getMappedValue(row, ['Telefone', 'Celular', 'Contato'])).trim();
        const validade = normalizeImportedDate(getMappedValue(row, ['ValidadeCNH', 'Validade', 'DataValidadeCNH']));
        const vehicleLinksValue = getMappedValue(row, ['Veiculos', 'Veículos', 'Frotas', 'Placas']);
        const hasVehicleLinksValue = String(vehicleLinksValue || '').trim() !== '';
        const vehicleIds = hasVehicleLinksValue ? resolveImportedVehicleIds(vehicleLinksValue) : [];
        if (!nome || !cpf || !cnh || !categoria || !isValidCpf(cpf)) {
          skipped += 1;
          return;
        }
        const payload = { nome, cpf, cnh, categoria, telefone, validade, ...(hasVehicleLinksValue ? { vehicleIds } : {}) };
        const existingIndex = allDrivers.findIndex((item) => onlyDigits(item.cpf) === onlyDigits(cpf) || item.cnh === cnh);
        if (existingIndex >= 0) {
          const duplicate = findDriverDuplicate(payload, allDrivers[existingIndex].id);
          if (duplicate) {
            duplicates += 1;
            return;
          }
          const isSame = JSON.stringify({ ...allDrivers[existingIndex], id: undefined }) === JSON.stringify({ ...allDrivers[existingIndex], ...payload, id: undefined });
          if (isSame) {
            duplicates += 1;
          } else {
            allDrivers[existingIndex] = { ...allDrivers[existingIndex], ...payload };
            if (hasVehicleLinksValue) {
              syncVehiclesWithDriver(allDrivers[existingIndex].id, vehicleIds);
            }
            updated += 1;
          }
        } else {
          if (findDriverDuplicate(payload)) {
            duplicates += 1;
            return;
          }
          const newDriverId = generateId();
          allDrivers.unshift({ id: newDriverId, ...payload });
          if (hasVehicleLinksValue) {
            syncVehiclesWithDriver(newDriverId, vehicleIds);
          }
          created += 1;
        }
      });
      return { created, updated, skipped, duplicates, label: 'motoristas' };
    }

    function importSuppliersFromRows(rows) {
      let created = 0;
      let updated = 0;
      let skipped = 0;
      let duplicates = 0;
      rows.forEach((rawRow) => {
        const row = getMappedRow(rawRow);
        const nome = String(getMappedValue(row, ['Nome', 'Fornecedor', 'Parceiro'])).trim();
        const tipo = normalizeSupplierType(getMappedValue(row, ['Tipo', 'Categoria']));
        const documento = formatCpfOrCnpj(String(getMappedValue(row, ['Documento', 'CNPJ', 'CPF', 'CPF/CNPJ'])).trim());
        const telefone = String(getMappedValue(row, ['Telefone', 'Celular', 'Contato'])).trim();
        const email = String(getMappedValue(row, ['Email', 'E-mail', 'Mail'])).trim();
        const observacoes = String(getMappedValue(row, ['Observacoes', 'Observações', 'Obs'])).trim();
        const digits = onlyDigits(documento);
        const validDocument = !documento || (digits.length === 11 ? isValidCpf(documento) : digits.length === 14 ? isValidCnpj(documento) : false);
        if (!nome || !tipo || !validDocument) {
          skipped += 1;
          return;
        }
        const tipoLabel = getSupplierTypeLabel(tipo);
        const payload = { nome, tipo, tipoLabel, documento, telefone, email, observacoes };
        const existingIndex = allSuppliers.findIndex((item) =>
          (documento && onlyDigits(item.documento || '') === digits) ||
          (item.nome.toLowerCase() === nome.toLowerCase() && item.tipo === tipo)
        );
        if (existingIndex >= 0) {
          const duplicate = findSupplierDuplicate(payload, allSuppliers[existingIndex].id);
          if (duplicate) {
            duplicates += 1;
            return;
          }
          const isSame = JSON.stringify({ ...allSuppliers[existingIndex], id: undefined }) === JSON.stringify({ ...allSuppliers[existingIndex], ...payload, id: undefined });
          if (isSame) {
            duplicates += 1;
          } else {
            allSuppliers[existingIndex] = { ...allSuppliers[existingIndex], ...payload };
            updated += 1;
          }
        } else {
          if (findSupplierDuplicate(payload)) {
            duplicates += 1;
            return;
          }
          allSuppliers.unshift({ id: generateId(), ...payload });
          created += 1;
        }
      });
      return { created, updated, skipped, duplicates, label: 'fornecedores' };
    }

    function handleBatchImportFile(event) {
      const file = event.target.files?.[0];
      const entity = pendingBatchImportEntity;
      event.target.value = '';
      pendingBatchImportEntity = null;
      if (!file || !entity) return;
      if (!window.XLSX) {
        showToast('Importação por planilha não está disponível agora.');
        return;
      }
      openBatchFeedback('loading', 'Importando planilha...', 'Estamos lendo os dados da planilha e validando os registros para evitar duplicidades.');
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        try {
          const workbook = XLSX.read(loadEvent.target.result, { type: 'array', cellDates: true });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: true });
          if (!rows.length) {
            openBatchFeedback('error', 'Planilha vazia', 'A importação não encontrou nenhuma linha preenchida para processar.');
            showToast('A planilha está vazia.');
            return;
          }
          const importers = {
            vehicle: importVehiclesFromRows,
            driver: importDriversFromRows,
            supplier: importSuppliersFromRows
          };
          const importer = importers[entity];
          if (!importer) {
            showToast('Tipo de importação não reconhecido.');
            return;
          }
          const summary = importer(rows);
          if (summary.created === 0 && summary.updated === 0) {
            const meta = `Ignorados: ${summary.skipped}  Duplicados: ${summary.duplicates}`;
            openBatchFeedback('error', 'Nenhum registro foi importado', `A planilha de ${summary.label} foi lida, mas não houve novos cadastros nem atualizações válidas.`, meta);
            showToast(`Nenhum ${summary.label} foi importado. Revise o modelo e os dados preenchidos.`);
            return;
          }
          saveToLocalStorage();
          renderAll();
          toggleSettings(false);
          renderNotifications();
          const meta = `Novos: ${summary.created}  Atualizados: ${summary.updated}  Ignorados: ${summary.skipped}  Duplicados: ${summary.duplicates}`;
          openBatchFeedback('success', 'Importação concluída com sucesso', `A planilha de ${summary.label} foi processada e os dados válidos já estão disponíveis no sistema.`, meta);
          showToast(`Importação concluída: ${summary.created} novos, ${summary.updated} atualizados, ${summary.skipped} ignorados e ${summary.duplicates} duplicados.`, {
            notify: true,
            notifyTitle: 'Importação em lote concluída',
            notifyMessage: `Planilha de ${summary.label} processada com ${summary.created} novos e ${summary.updated} registros atualizados.`
          });
          setTimeout(() => {
            closeBatchFeedback();
          }, 2600);
        } catch (error) {
          console.error(error);
          openBatchFeedback('error', 'Não foi possível importar a planilha', 'O arquivo não pôde ser processado. Revise o modelo e tente novamente.');
          showToast('Não foi possível importar essa planilha.');
        }
      };
      reader.readAsArrayBuffer(file);
    }

    function getSupplierTypeLabel(type) {
      return {
        posto: 'Posto de combustível',
        oficina: 'Oficina',
        concessionaria: 'Concessionária',
        pecas: 'Loja de peças',
        pneus: 'Pneus',
        lubrificantes: 'Lubrificantes',
        eletrica: 'Elétrica automotiva',
        funilaria: 'Funilaria e pintura',
        borracharia: 'Borracharia',
        guincho: 'Guincho',
        seguradora: 'Seguradora',
        rastreamento: 'Rastreamento e telemetria',
        lavajato: 'Lava-jato',
        locadora: 'Locadora',
        outro: 'Outro'
      }[type] || 'Outro';
    }

    function toggleFinanceSpecificFields() {
      const supplierId = document.getElementById('finance-supplier-id')?.value;
      const supplier = allSuppliers.find(item => item.id === supplierId);
      const wrap = document.getElementById('finance-fuel-wrap');
      if (!wrap) return;
      wrap.style.display = supplier && supplier.tipo === 'posto' ? 'block' : 'none';
      if (!supplier || supplier.tipo !== 'posto') {
        const fuelField = document.getElementById('finance-fuel-type');
        if (fuelField) fuelField.value = '';
      }
    }

    function getOrderKmData(orderId) {
      const kmEntries = allFinanceEntries
        .filter(entry => entry.orderId === orderId || (entry.groupedIntoId && allFinanceEntries.some(group => group.id === entry.groupedIntoId && group.orderId === orderId)))
        .flatMap(entry => isFuelGroupEntry(entry) ? getFuelGroupChildren(entry) : [entry])
        .filter(entry => entry && entry.km !== undefined && entry.km !== null && String(entry.km).trim() !== '')
        .sort((a, b) => {
          const dateCompare = String(getFinanceEntryDate(a)).localeCompare(String(getFinanceEntryDate(b)));
          if (dateCompare !== 0) return dateCompare;
          return Number(a.km || 0) - Number(b.km || 0);
        });

      if (!kmEntries.length) {
        return { kmInicial: '', kmFinal: '' };
      }
      return {
        kmInicial: kmEntries[0].km || '',
        kmFinal: kmEntries[kmEntries.length - 1].km || ''
      };
    }

    function getVehicleCurrentKm(vehicleId) {
      const entries = allFinanceEntries
        .filter(entry => !entry.groupedIntoId && getEntryImmediateVehicleId(entry) === vehicleId)
        .flatMap(entry => isFuelGroupEntry(entry) ? getFuelGroupChildren(entry) : [entry])
        .filter(entry => entry && entry.km !== undefined && entry.km !== null && String(entry.km).trim() !== '' && getFinanceEntryDate(entry))
        .sort((a, b) => {
          const dateCompare = String(getFinanceEntryDate(b)).localeCompare(String(getFinanceEntryDate(a)));
          if (dateCompare !== 0) return dateCompare;
          return Number(b.km || 0) - Number(a.km || 0);
        });

      if (!entries.length) return null;
      return Number(entries[0].km || 0);
    }

    function getMonthYearReference(dateString) {
      if (!dateString) return 'MÊS/AAAA';
      const date = new Date(`${dateString}T00:00:00`);
      if (Number.isNaN(date.getTime())) return 'MÊS/AAAA';
      return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
    }

    function getRevisionDescription(revisionKm, vehicle = null) {
      const kmLabel = revisionKm ? Number(revisionKm).toLocaleString('pt-BR') : 'XX.XXX';
      const revisionNumber = revisionKm ? Math.max(1, Math.round(Number(revisionKm) / 10000)) : 'X';
      return `REVISÃO ${kmLabel} KM - REF A ${revisionNumber}º REVISÃO PERIÓDICA`;
    }

    function getMonthlyExpenseDescription(dateString) {
      return `CONTROLE MENSAL DE DESPESAS REF A ${getMonthYearReference(dateString)}`;
    }

    function getOrderTypeDescription(type, options = {}) {
      if (type === 'mensal') return getMonthlyExpenseDescription(options.dataInicio);
      if (type === 'revisao') return getRevisionDescription(options.revisionKm, options.vehicle);
      if (type === 'sinistro') return 'SINISTRO';
      return '';
    }

    function updateOrderDescriptionFromType(force = false) {
      const typeField = document.getElementById('order-tipo-os');
      const dateField = document.getElementById('order-data-inicio');
      const vehicleField = document.getElementById('order-veiculo');
      const descriptionField = document.getElementById('order-descricao');
      if (!typeField || !descriptionField) return;

      const vehicle = allVehicles.find(item => item.id === vehicleField?.value);
      const currentKm = vehicle ? getVehicleCurrentKm(vehicle.id) : null;
      const nextRevisionKm = currentKm ? (Math.ceil(currentKm / 10000) * 10000 || 10000) : 0;
      const nextDescription = getOrderTypeDescription(typeField.value, {
        dataInicio: dateField?.value || '',
        vehicle,
        revisionKm: nextRevisionKm
      });

      const currentValue = descriptionField.value.trim();
      const previousGenerated = descriptionField.dataset.generatedDescription || '';
      if (!nextDescription) {
        if (currentValue && currentValue === previousGenerated) {
          descriptionField.value = '';
          descriptionField.dataset.generatedDescription = '';
        }
        return;
      }
      if (force || !currentValue || currentValue === previousGenerated) {
        descriptionField.value = nextDescription;
        descriptionField.dataset.generatedDescription = nextDescription;
      }
    }

    window.updateOrderDescriptionFromType = updateOrderDescriptionFromType;

    function updateOrderDateConstraints() {
      const startField = document.getElementById('order-data-inicio');
      const endField = document.getElementById('order-data-termino');
      if (!startField || !endField) return;
      endField.min = startField.value || '';
      if (startField.value && endField.value && endField.value < startField.value) {
        endField.value = '';
        showToast('A data de fim não pode ser anterior à data de início da OS.');
      }
    }

    function validateOrderDateRange(dataInicio, dataTermino) {
      if (!dataInicio || !dataTermino) return true;
      if (dataTermino >= dataInicio) return true;
      showToast('A data de fim da OS não pode ser anterior à data de início.');
      document.getElementById('order-data-termino')?.focus();
      return false;
    }

    function handleOrderStartDateChange() {
      updateOrderDescriptionFromType();
      updateOrderDateConstraints();
    }

    function handleOrderEndDateChange() {
      updateOrderDateConstraints();
    }

    function toggleOrderAdministrationCustom() {
      const field = document.getElementById('order-administracao');
      const wrap = document.getElementById('order-administracao-custom-wrap');
      if (!field || !wrap) return;
      wrap.classList.toggle('hidden', field.value !== '__custom__');
      if (field.value === '__custom__') {
        setTimeout(() => document.getElementById('order-administracao-custom')?.focus(), 30);
      }
    }

    function getOrderAdministrationFormValue() {
      const field = document.getElementById('order-administracao');
      if (!field) return '';
      if (field.value === '__custom__') {
        return document.getElementById('order-administracao-custom')?.value.trim() || '';
      }
      return field.value.trim();
    }

    function setOrderAdministrationFormValue(value = '') {
      const field = document.getElementById('order-administracao');
      const customField = document.getElementById('order-administracao-custom');
      if (!field) return;
      const normalizedValue = String(value || '').trim();
      const option = Array.from(field.options).find(item => item.value === normalizedValue);
      if (!normalizedValue || option) {
        field.value = normalizedValue;
        if (customField) customField.value = '';
      } else {
        field.value = '__custom__';
        if (customField) customField.value = normalizedValue;
      }
      toggleOrderAdministrationCustom();
      syncCustomSelectById('order-administracao');
    }

    function handleOrderVehicleChange() {
      const vehicleField = document.getElementById('order-veiculo');
      const driverField = document.getElementById('order-driver');
      const vehicle = allVehicles.find(item => item.id === vehicleField?.value);
      if (vehicle?.motoristaId && driverField) {
        driverField.value = vehicle.motoristaId;
      }
      updateOrderDescriptionFromType();
      syncCustomSelectById('order-veiculo');
      syncCustomSelectById('order-driver');
    }

    window.toggleOrderAdministrationCustom = toggleOrderAdministrationCustom;
    window.handleOrderVehicleChange = handleOrderVehicleChange;
    window.handleOrderStartDateChange = handleOrderStartDateChange;
    window.handleOrderEndDateChange = handleOrderEndDateChange;

    const modalCustomSelectIds = new Set([
      'vehicle-motorista',
      'driver-categoria',
      'supplier-type',
      'order-tipo-os',
      'order-administracao',
      'order-status',
      'order-veiculo',
      'order-driver',
      'finance-supplier-id',
      'finance-driver-id'
    ]);

    function getCustomSelectLabel(select) {
      if (!select) return 'Selecione';
      const selected = select.options[select.selectedIndex];
      return selected?.textContent?.trim() || select.getAttribute('placeholder') || 'Selecione';
    }

    function closeCustomSelects(except = null) {
      document.querySelectorAll('.custom-select-shell.open').forEach(shell => {
        if (shell !== except) shell.classList.remove('open');
      });
    }

    function positionCustomSelectMenu(shell) {
      const button = shell?.querySelector('.custom-select-button');
      const menu = shell?.querySelector('.custom-select-menu');
      if (!button || !menu) return;

      const rect = button.getBoundingClientRect();
      const viewportPadding = 12;
      const gap = 8;
      const minHeight = 140;
      const preferredHeight = 260;
      const width = Math.min(
        Math.max(rect.width + 50, 320),
        window.innerWidth - viewportPadding * 2
      );
      const left = Math.min(
        Math.max(rect.left - 42, viewportPadding),
        window.innerWidth - width - viewportPadding
      );
      const spaceBelow = window.innerHeight - rect.bottom - gap - viewportPadding;
      const spaceAbove = rect.top - gap - viewportPadding;
      const openAbove = spaceBelow < minHeight && spaceAbove > spaceBelow;
      const maxHeight = Math.max(minHeight, Math.min(preferredHeight, openAbove ? spaceAbove : spaceBelow));
      const top = openAbove
        ? Math.max(viewportPadding, rect.top - gap - maxHeight)
        : Math.min(rect.bottom + gap, window.innerHeight - viewportPadding - minHeight);

      menu.style.setProperty('--custom-select-left', `${left}px`);
      menu.style.setProperty('--custom-select-top', `${top}px`);
      menu.style.setProperty('--custom-select-width', `${width}px`);
      menu.style.setProperty('--custom-select-max-height', `${maxHeight}px`);
    }

    function positionOpenCustomSelects() {
      document.querySelectorAll('.custom-select-shell.open').forEach(positionCustomSelectMenu);
    }

    function syncCustomSelectById(id) {
      const select = document.getElementById(id);
      const shell = select?.closest('.custom-select-shell');
      const label = shell?.querySelector('.custom-select-label');
      if (select && label) label.textContent = getCustomSelectLabel(select);
    }

    function enhanceModalSelects() {
      const fields = document.getElementById('modal-fields');
      if (!fields) return;
      fields.querySelectorAll('select.soft-input').forEach(select => {
        if (!modalCustomSelectIds.has(select.id) || select.dataset.customSelectReady === 'true') return;
        select.dataset.customSelectReady = 'true';
        select.classList.add('custom-select-native');

        const shell = document.createElement('div');
        shell.className = 'custom-select-shell';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'custom-select-button';
        button.innerHTML = `
          <span class="custom-select-label">${escapeHtml(getCustomSelectLabel(select))}</span>
          <svg class="custom-select-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 9l6 6 6-6"/>
          </svg>
        `;
        const menu = document.createElement('div');
        menu.className = 'custom-select-menu';

        Array.from(select.options).forEach(option => {
          const item = document.createElement('button');
          item.type = 'button';
          item.className = 'custom-select-option';
          item.dataset.value = option.value;
          item.textContent = option.textContent;
          item.addEventListener('click', () => {
            select.value = option.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            button.querySelector('.custom-select-label').textContent = getCustomSelectLabel(select);
            closeCustomSelects();
          });
          menu.appendChild(item);
        });

        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          const willOpen = !shell.classList.contains('open');
          closeCustomSelects(shell);
          if (willOpen) {
            positionCustomSelectMenu(shell);
            shell.classList.add('open');
          } else {
            shell.classList.remove('open');
          }
        });

        select.parentNode.insertBefore(shell, select);
        shell.appendChild(select);
        shell.appendChild(button);
        shell.appendChild(menu);
      });
    }

    window.addEventListener('resize', positionOpenCustomSelects);
    document.addEventListener('scroll', positionOpenCustomSelects, true);

    function setOrderTypeValue(type) {
      const typeField = document.getElementById('order-tipo-os');
      if (typeField) typeField.value = type || 'avulsa';
    }

    function normalizeRevisionText(value) {
      return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Z0-9]/gi, '')
        .toUpperCase();
    }

    function findOpenRevisionOrder(vehicleId, revisionKm) {
      const revisionToken = normalizeRevisionText(getRevisionDescription(revisionKm));
      const legacyRevisionToken = normalizeRevisionText(`REVISAO DE ${Number(revisionKm || 0).toLocaleString('pt-BR')}KM`);
      const previousRevisionToken = normalizeRevisionText(`REVISAO ${Number(revisionKm || 0).toLocaleString('pt-BR')} KM`);
      return allOrders.find(order =>
        order.vehicleId === vehicleId
        && order.status !== 'fechada'
        && (
          normalizeRevisionText(order.descricao).includes(revisionToken)
          || normalizeRevisionText(order.descricao).includes(legacyRevisionToken)
          || normalizeRevisionText(order.descricao).includes(previousRevisionToken)
        )
      ) || null;
    }

    function getVehicleMaintenanceStatus(vehicle) {
      const currentKm = getVehicleCurrentKm(vehicle.id);
      if (currentKm === null || Number.isNaN(currentKm)) {
        return {
          currentKm: null,
          nextRevisionKm: null,
          remainingKm: null,
          isAlert: false,
          openOrder: null
        };
      }

      const nextRevisionKm = Math.ceil(currentKm / 10000) * 10000 || 10000;
      const remainingKm = Math.max(nextRevisionKm - currentKm, 0);
      const openOrder = findOpenRevisionOrder(vehicle.id, nextRevisionKm);

      return {
        currentKm,
        nextRevisionKm,
        remainingKm,
        isAlert: remainingKm <= 2000,
        openOrder
      };
    }

    function openRevisionOrderForVehicle(vehicleId) {
      const vehicle = allVehicles.find(item => item.id === vehicleId);
      if (!vehicle) {
        showToast('Não foi possível localizar o veículo para abrir a OS.');
        return;
      }

      const maintenance = getVehicleMaintenanceStatus(vehicle);
      if (!maintenance.nextRevisionKm) {
        showToast('Esse veículo ainda não possui KM atual para gerar a OS de revisão.');
        return;
      }

      if (maintenance.openOrder) {
        showToast(`Já existe uma OS aberta para a revisão de ${maintenance.nextRevisionKm.toLocaleString('pt-BR')} KM.`);
        return;
      }

      openCadastroModal('order');
      setOrderTypeValue('revisao');
      document.getElementById('order-veiculo').value = vehicle.id;
      document.getElementById('order-data-inicio').value = getLocalIsoDate();
      document.getElementById('order-status').value = 'aberta';
      updateOrderDateConstraints();
      document.getElementById('order-descricao').value = getRevisionDescription(maintenance.nextRevisionKm, vehicle);
      document.getElementById('order-descricao').dataset.generatedDescription = document.getElementById('order-descricao').value;
      document.getElementById('modal-title').textContent = 'Abrir OS de revisão';
      showToast(`OS preparada para revisão de ${maintenance.nextRevisionKm.toLocaleString('pt-BR')} KM.`);
    }

    function getVehicleCostStats(options = {}) {
      const vehicleId = options.vehicleId || '';
      const start = options.start || '';
      const end = options.end || '';
      const statsMap = new Map();

      allVehicles.forEach(vehicle => {
        statsMap.set(vehicle.id, {
          vehicleId: vehicle.id,
          frota: vehicle.numeroFrota || '-',
          placa: vehicle.placa || '-',
          modelo: vehicle.modelo || '-',
          totalCost: 0,
          totalKm: 0,
          entries: 0
        });
      });

      allFinanceEntries
        .filter(entry => isDistributedCostEntry(entry))
        .forEach(entry => {
          const currentVehicleId = getEntryLinkedVehicleId(entry);
          if (!currentVehicleId) return;
          const entryDate = getFinanceEntryCompetenceDate(entry);
          if (vehicleId && currentVehicleId !== vehicleId) return;
          if (start && (!entryDate || entryDate < start)) return;
          if (end && (!entryDate || entryDate > end)) return;

          const stats = statsMap.get(currentVehicleId);
          if (!stats) return;
          stats.totalCost += Number(entry.total || 0);
          stats.entries += isFuelGroupEntry(entry) ? Math.max(getFuelGroupChildren(entry).length, 1) : 1;
        });

      const vehicleEntriesMap = new Map();
      allFinanceEntries
        .filter(entry => !entry.groupedIntoId)
        .flatMap(entry => isFuelGroupEntry(entry) ? getFuelGroupChildren(entry) : [entry])
        .filter(entry => entry && entry.km !== undefined && entry.km !== null && String(entry.km).trim() !== '')
        .forEach((entry) => {
          const currentVehicleId = getEntryImmediateVehicleId(entry);
          if (!currentVehicleId) return;
          if (vehicleId && currentVehicleId !== vehicleId) return;
          const entryDate = getFinanceEntryDate(entry);
          if (start && (!entryDate || entryDate < start)) return;
          if (end && (!entryDate || entryDate > end)) return;
          if (!vehicleEntriesMap.has(currentVehicleId)) vehicleEntriesMap.set(currentVehicleId, []);
          vehicleEntriesMap.get(currentVehicleId).push(entry);
        });

      vehicleEntriesMap.forEach((entries, currentVehicleId) => {
        const stats = statsMap.get(currentVehicleId);
        if (!stats) return;
        const sortedEntries = entries
          .filter(entry => entry.km !== '')
          .sort((a, b) => {
            const dateCompare = String(getFinanceEntryDate(a)).localeCompare(String(getFinanceEntryDate(b)));
            if (dateCompare !== 0) return dateCompare;
            return Number(a.km || 0) - Number(b.km || 0);
          });

        let previousKm = null;
        sortedEntries.forEach((entry) => {
          const currentKm = Number(entry.km || 0);
          if (previousKm !== null && currentKm >= previousKm) {
            stats.totalKm += currentKm - previousKm;
          }
          previousKm = currentKm;
        });
      });

      return Array.from(statsMap.values())
        .filter(item => !vehicleId || item.vehicleId === vehicleId)
        .map(item => ({
          ...item,
          costPerKm: item.totalKm > 0 ? item.totalCost / item.totalKm : 0
        }))
        .sort((a, b) => {
          if (a.entries === 0 && b.entries !== 0) return 1;
          if (b.entries === 0 && a.entries !== 0) return -1;
          return a.costPerKm - b.costPerKm;
        });
    }
    function getDashboardExpirations() {
      const cnhItems = allDrivers
        .map(driver => ({ ...driver, days: daysUntil(driver.validade) }))
        .filter(item => item.days !== null && item.days >= 0 && item.days <= 45)
        .sort((a, b) => a.days - b.days);

      const insuranceItems = allVehicles
        .map(vehicle => ({ ...vehicle, days: daysUntil(vehicle.seguroVencimento) }))
        .filter(item => item.days !== null && item.days <= 45)
        .sort((a, b) => a.days - b.days);

      return { cnhItems, insuranceItems };
    }

    function getCurrentMonthKey() {
      return getLocalIsoDate().slice(0, 7);
    }

    function getMonthLabel(monthKey) {
      if (!monthKey) return '';
      const [year, month] = monthKey.split('-').map(Number);
      if (!year || !month) return '';
      return new Date(year, month - 1, 1).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric'
      });
    }

    function getVehicleMonthlyCosts(monthKey = getCurrentMonthKey()) {
      const { start, end } = getMonthRange(monthKey);

      return getSortedVehicles()
        .slice(0, 9)
        .map(vehicle => ({
          vehicle,
          total: getVehicleDistributedCostTotal(vehicle.id, start, end)
        }));
    }

    function renderMonthlyVehicleCostChart() {
      const cardNode = document.getElementById('home-monthly-cost-card');
      const chartNode = document.getElementById('home-monthly-cost-chart');
      const labelNode = document.getElementById('home-monthly-cost-label');
      const monthFilterNode = document.getElementById('home-monthly-cost-filter');
      if (!cardNode || !chartNode) return;

      if (!allVehicles.length) {
        cardNode.classList.add('hidden');
        chartNode.innerHTML = '';
        return;
      }

      if (monthFilterNode && !monthFilterNode.value) {
        monthFilterNode.value = getCurrentMonthKey();
      }

      const monthKey = monthFilterNode?.value || getCurrentMonthKey();
      const rows = getVehicleMonthlyCosts(monthKey);
      const maxValue = Math.max(...rows.map(item => item.total), 0);
      cardNode.classList.remove('hidden');
      if (labelNode) labelNode.textContent = `Valores de ${getMonthLabel(monthKey)} pela competência de abertura da OS.`;
      chartNode.innerHTML = rows.map(({ vehicle, total }) => {
        const percent = maxValue > 0 ? Math.max((total / maxValue) * 100, total > 0 ? 10 : 3) : 3;
        const vehicleTitle = [vehicle.numeroFrota, vehicle.placa].filter(Boolean).join(' - ') || 'Veículo';
        return `
          <button type="button" class="home-monthly-bar-item" onclick="openOrdersForVehicle('${vehicle.id}')" title="Ver OS de ${escapeHtml(vehicleTitle)}">
            <div class="home-monthly-bar-value">${escapeHtml(formatCurrency(total))}</div>
            <div class="home-monthly-bar-track" aria-hidden="true">
              <div class="home-monthly-bar-fill" style="height: ${percent.toFixed(2)}%;"></div>
            </div>
            <div class="home-monthly-bar-label">
              <strong>${escapeHtml(vehicle.numeroFrota || '-')}</strong>
              <span>${escapeHtml(vehicle.placa || '-')}</span>
            </div>
          </button>
        `;
      }).join('');
    }

    function renderDashboardTableRows(items, formatter) {
      if (!items.length) {
        return '<div class="text-slate-400 text-sm">Nenhum item para exibir no momento.</div>';
      }
      return items.map(formatter).join('');
    }

    function getHomeFinanceStatusItems() {
      const entries = allFinanceEntries.filter(entry => !entry.groupedIntoId);
      const pending = entries.filter(entry => ['pendente', 'pendente_os'].includes(getFinanceEntryStatus(entry)));
      const distributed = entries.filter(entry => getFinanceEntryStatus(entry) === 'distribuido');
      const sumEntries = items => items.reduce((sum, entry) => sum + getFinanceNetTotal(entry), 0);

      return [
        {
          group: 'pending',
          label: 'Pendentes',
          count: pending.length,
          total: sumEntries(pending),
          help: 'Aguardando fechamento ou OS'
        },
        {
          group: 'distributed',
          label: 'Distribuídas',
          count: distributed.length,
          total: sumEntries(distributed),
          help: 'Vinculadas em OS'
        }
      ];
    }

    function openFinanceStatusFromHome(group) {
      openModuleFromHome('financeiro');
      setFilterValue('finance-filter-search', '');
      setFilterValue('finance-filter-start', '');
      setFilterValue('finance-filter-end', '');
      setFilterValue('finance-filter-value', '');
      setFilterValue('finance-filter-status', group === 'distributed' ? 'distribuido' : 'pendente');
      renderFinance();
    }

    window.openFinanceStatusFromHome = openFinanceStatusFromHome;

    function getInsuranceAlertTone(days) {
      if (days < 0) return 'danger';
      if (days <= 5) return 'critical';
      return 'warning';
    }

    function getInsuranceAlertLabel(days) {
      if (days < 0) return `Vencido h\u00e1 ${Math.abs(days)} dia(s)`;
      if (days === 0) return 'Vence hoje';
      return `Faltam ${days} dia(s)`;
    }

    function getReportFilters() {
      return {
        type: document.getElementById('report-filter-type')?.value || 'cost',
        vehicleId: document.getElementById('report-filter-vehicle')?.value || '',
        start: document.getElementById('report-filter-start')?.value || '',
        end: document.getElementById('report-filter-end')?.value || ''
      };
    }

    function getReportTitleByType(type) {
      switch (type) {
        case 'cost': return 'Custo por KM';
        case 'monthly_vehicle_cost': return 'Custo mensal por veículo';
        case 'orders': return 'OS por veículo';
        case 'orders_open': return 'OS abertas';
        case 'orders_progress': return 'OS em andamento';
        case 'orders_closed': return 'OS fechadas';
        case 'orders_deleted': return 'OS excluídas';
        case 'finance_status': return 'Financeiro por status';
        case 'supplier_ranking': return 'Gastos por fornecedor';
        case 'maintenance_due': return 'Revisões por KM';
        case 'cnh_expiring': return 'CNHs a vencer';
        case 'insurance_expiring': return 'Seguros a vencer';
        default: return 'Relatório';
      }
    }

    function isDateWithinRange(dateString, start, end) {
      if (!dateString) return false;
      if (start && dateString < start) return false;
      if (end && dateString > end) return false;
      return true;
    }

    function getReportPeriodLabel(filters) {
      if (filters.start && filters.end) return `${formatDate(filters.start)} até ${formatDate(filters.end)}`;
      if (filters.start) return `A partir de ${formatDate(filters.start)}`;
      if (filters.end) return `Até ${formatDate(filters.end)}`;
      return 'Todo o período disponível';
    }

    function getReportVehicleLabel(vehicleId) {
      if (!vehicleId) return 'Todos os veículos';
      const vehicle = allVehicles.find(item => item.id === vehicleId);
      return vehicle ? `${vehicle.placa || '-'} ${vehicle.modelo || 'Veículo'} Frota ${vehicle.numeroFrota || '-'}` : 'Veículo filtrado';
    }

    function getReportFinanceEntries(filters) {
      return allFinanceEntries
        .filter(entry => !entry.groupedIntoId)
        .filter(entry => !filters.vehicleId || getEntryLinkedVehicleId(entry) === filters.vehicleId)
        .filter(entry => {
          const entryDate = getFinanceEntryDate(entry);
          if (!filters.start && !filters.end) return true;
          return isDateWithinRange(entryDate, filters.start, filters.end);
        })
        .sort((a, b) => String(getFinanceEntryDate(b)).localeCompare(String(getFinanceEntryDate(a))) || String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    }

    function getReportMaintenanceItems(filters) {
      return allVehicles
        .filter(vehicle => !filters.vehicleId || vehicle.id === filters.vehicleId)
        .map(vehicle => ({ vehicle, maintenance: getVehicleMaintenanceStatus(vehicle) }))
        .sort((a, b) => {
          const aHasKm = a.maintenance.currentKm !== null;
          const bHasKm = b.maintenance.currentKm !== null;
          if (aHasKm && !bHasKm) return -1;
          if (!aHasKm && bHasKm) return 1;
          if (!aHasKm && !bHasKm) return getNumericOrderValue(a.vehicle.numeroFrota) - getNumericOrderValue(b.vehicle.numeroFrota);
          if (a.maintenance.remainingKm !== b.maintenance.remainingKm) return a.maintenance.remainingKm - b.maintenance.remainingKm;
          return getNumericOrderValue(a.vehicle.numeroFrota) - getNumericOrderValue(b.vehicle.numeroFrota);
        });
    }

    function createReportStatusPill(label, tone = 'neutral') {
      return `<span class="report-status-pill status-${tone}">${escapeHtml(label)}</span>`;
    }

    function buildReportData(filters) {
      const title = getReportTitleByType(filters.type);
      const meta = `Período: ${getReportPeriodLabel(filters)} • Veículo: ${getReportVehicleLabel(filters.vehicleId)}`;
      const visibleFinanceEntries = getReportFinanceEntries(filters);
      const visibleOrders = getFilteredReportOrders();
      const vehicleStats = getVehicleCostStats(filters).filter(item => filters.vehicleId ? item.vehicleId === filters.vehicleId : item.entries > 0);

      if (filters.type === 'cost') {
        const totalCost = vehicleStats.reduce((sum, item) => sum + item.totalCost, 0);
        const totalKm = vehicleStats.reduce((sum, item) => sum + item.totalKm, 0);
        const averageCostPerKm = totalKm > 0 ? totalCost / totalKm : 0;
        return {
          title,
          meta,
          summary: [
            { label: 'Veículos com custo', value: String(vehicleStats.length), help: 'Unidades com abastecimento distribuído em OS no período.' },
            { label: 'Custo total', value: formatCurrency(totalCost), help: 'Soma de combustíveis vinculados em OS no relatório.' },
            { label: 'KM rodado', value: totalKm.toLocaleString('pt-BR'), help: 'Base calculada pelos lançamentos com KM válido.' },
            { label: 'Média por KM', value: formatCurrency(averageCostPerKm), help: 'Custo médio geral do período selecionado.' }
          ],
          columns: [
            { label: 'Frota' },
            { label: 'Placa' },
            { label: 'Veículo' },
            { label: 'KM', numeric: true },
            { label: 'Custo', numeric: true },
            { label: 'Custo/KM', numeric: true }
          ],
          rows: vehicleStats.map(item => ({
            cells: [
              { text: item.frota || '-' },
              { text: item.placa || '-' },
              { text: item.modelo || '-' },
              { text: String(item.totalKm || 0), numeric: true },
              { text: formatCurrency(item.totalCost), numeric: true },
              { text: formatCurrency(item.costPerKm), numeric: true }
            ]
          })),
          emptyMessage: 'Nenhum custo por KM encontrado para os filtros aplicados.'
        };
      }

      if (filters.type === 'monthly_vehicle_cost') {
        const rows = getSortedVehicles()
          .filter(vehicle => !filters.vehicleId || vehicle.id === filters.vehicleId)
          .map(vehicle => ({
            vehicle,
            currentKm: getVehicleCurrentKm(vehicle.id),
            total: getVehicleDistributedCostTotal(vehicle.id, filters.start, filters.end)
          }));
        const vehiclesWithCost = rows.filter(item => item.total > 0).length;
        const totalAmount = rows.reduce((sum, item) => sum + item.total, 0);
        return {
          title,
          meta,
          summary: [
            { label: 'Veículos listados', value: String(rows.length), help: 'Veículos cadastrados considerados no relatório.' },
            { label: 'Veículos com custo', value: String(vehiclesWithCost), help: 'Unidades com despesa distribuída em OS no período.' },
            { label: 'Custo total', value: formatCurrency(totalAmount), help: 'Soma de despesas vinculadas a OS por veículo.' },
            { label: 'Média por veículo', value: formatCurrency(rows.length ? totalAmount / rows.length : 0), help: 'Média considerando os veículos listados.' }
          ],
          columns: [
            { label: 'Frota' },
            { label: 'Placa' },
            { label: 'Veículo' },
            { label: 'KM atual', numeric: true },
            { label: 'Custo total', numeric: true }
          ],
          rows: rows.map(item => ({
            cells: [
              { text: item.vehicle.numeroFrota || '-' },
              { text: item.vehicle.placa || '-' },
              { text: item.vehicle.modelo || '-' },
              { text: item.currentKm === null ? '-' : `${item.currentKm.toLocaleString('pt-BR')} km`, numeric: true },
              { text: formatCurrency(item.total), numeric: true }
            ]
          })),
          emptyMessage: 'Nenhum veículo encontrado para os filtros aplicados.'
        };
      }

      if (['orders', 'orders_open', 'orders_progress', 'orders_closed', 'orders_deleted'].includes(filters.type)) {
        const totalLinked = visibleOrders.reduce((sum, order) => {
          if (typeof order.totalLinked === 'number') return sum + order.totalLinked;
          return sum + sumFinanceNetTotal(allFinanceEntries.filter(entry => entry.orderId === order.id));
        }, 0);
        const vehiclesCovered = new Set(visibleOrders.map(order => order.vehicleId).filter(Boolean)).size;
        return {
          title,
          meta,
          summary: [
            { label: 'Ordens listadas', value: String(visibleOrders.length), help: 'Quantidade de OS conforme o tipo selecionado.' },
            { label: 'Veículos envolvidos', value: String(vehiclesCovered), help: 'Veículos únicos relacionados às ordens filtradas.' },
            { label: 'Valor vinculado', value: formatCurrency(totalLinked), help: 'Soma dos lançamentos financeiros ligados às OS.' },
            { label: 'Ticket médio', value: formatCurrency(visibleOrders.length ? totalLinked / visibleOrders.length : 0), help: 'Média de valor por ordem do conjunto filtrado.' }
          ],
          columns: [
            { label: 'Nº OS' },
            { label: 'Veículo' },
            { label: 'Abertura' },
            { label: 'Status' },
            { label: 'Serviço' },
            { label: 'Total vinculado', numeric: true }
          ],
          rows: visibleOrders.map(order => {
            const vehicle = order.vehicleSnapshot || allVehicles.find(item => item.id === order.vehicleId);
            const total = typeof order.totalLinked === 'number'
              ? order.totalLinked
              : sumFinanceNetTotal(allFinanceEntries.filter(entry => entry.orderId === order.id));
            const groupedRows = getOrderGroupedFuelReportRows(order.id);
            const statusLabel = filters.type === 'orders_deleted' ? 'Excluída' : (order.status || '-');
            const statusTone = statusLabel === 'fechada' || statusLabel === 'Fechada'
              ? 'ok'
              : statusLabel === 'andamento' || statusLabel === 'Em andamento'
                ? 'warn'
                : statusLabel === 'aberta' || statusLabel === 'Aberta'
                  ? 'neutral'
                  : 'danger';
            const notes = groupedRows.length
              ? `${groupedRows.length} agrupamento(s) de abastecimento vinculado(s).`
              : '';
            return {
              cells: [
                { text: getOrderNumberLabel(order) },
                { text: vehicle ? `${vehicle.placa || '-'} • ${vehicle.modelo || 'Veículo'}` : '-' },
                { text: filters.type === 'orders_deleted' ? formatDate(String(order.deletedAt || '').slice(0, 10)) : formatDate(order.dataInicio) },
                { text: statusLabel, html: createReportStatusPill(statusLabel, statusTone) },
                { text: order.descricao || '-', note: notes },
                { text: formatCurrency(total), numeric: true }
              ]
            };
          }),
          emptyMessage: 'Nenhuma ordem encontrada para os filtros aplicados.'
        };
      }

      if (filters.type === 'finance_status') {
        const statusMap = new Map();
        visibleFinanceEntries.forEach((entry) => {
          const status = getFinanceEntryStatus(entry);
          const current = statusMap.get(status) || { status, count: 0, total: 0 };
          current.count += 1;
          current.total += getFinanceNetTotal(entry);
          statusMap.set(status, current);
        });
        const rows = Array.from(statusMap.values()).sort((a, b) => b.total - a.total);
        const totalAmount = rows.reduce((sum, item) => sum + item.total, 0);
        return {
          title,
          meta,
          summary: [
            { label: 'Lançamentos', value: String(visibleFinanceEntries.length), help: 'Registros financeiros considerados no período.' },
            { label: 'Valor total', value: formatCurrency(totalAmount), help: 'Soma total dos lançamentos filtrados.' },
            { label: 'Pendentes', value: String(rows.filter(item => item.status === 'pendente' || item.status === 'pendente_os').reduce((sum, item) => sum + item.count, 0)), help: 'Lançamentos ainda não distribuídos por completo.' },
            { label: 'Finalizados', value: String(rows.filter(item => item.status === 'distribuido').reduce((sum, item) => sum + item.count, 0)), help: 'Lançamentos já fechados e distribuídos.' }
          ],
          columns: [
            { label: 'Status' },
            { label: 'Quantidade', numeric: true },
            { label: 'Valor total', numeric: true },
            { label: 'Participação', numeric: true }
          ],
          rows: rows.map(item => ({
            cells: [
              {
                text: getFinanceEntryStatusLabel({ workflowStatus: item.status }),
                html: createReportStatusPill(
                  getFinanceEntryStatusLabel({ workflowStatus: item.status }),
                  item.status === 'distribuido' ? 'ok' : item.status === 'agrupado' ? 'warn' : 'danger'
                )
              },
              { text: String(item.count), numeric: true },
              { text: formatCurrency(item.total), numeric: true },
              { text: `${totalAmount > 0 ? ((item.total / totalAmount) * 100).toFixed(1).replace('.', ',') : '0,0'}%`, numeric: true }
            ]
          })),
          emptyMessage: 'Nenhum lançamento financeiro encontrado para os filtros aplicados.'
        };
      }

      if (filters.type === 'supplier_ranking') {
        const supplierMap = new Map();
        visibleFinanceEntries.forEach((entry) => {
          const key = String(entry.fornecedor || 'Fornecedor não informado');
          const current = supplierMap.get(key) || {
            name: key,
            total: 0,
            count: 0,
            type: '',
            latestDate: ''
          };
          current.total += getFinanceNetTotal(entry);
          current.count += 1;
          current.latestDate = [current.latestDate, getFinanceEntryDate(entry)].filter(Boolean).sort().pop() || current.latestDate;
          if (!current.type) {
            const supplier = allSuppliers.find(item => item.nome === entry.fornecedor);
            current.type = supplier?.tipoLabel || entry.kindLabel || '-';
          }
          supplierMap.set(key, current);
        });
        const rows = Array.from(supplierMap.values()).sort((a, b) => b.total - a.total);
        const grandTotal = rows.reduce((sum, item) => sum + item.total, 0);
        return {
          title,
          meta,
          summary: [
            { label: 'Fornecedores', value: String(rows.length), help: 'Quantidade de parceiros com movimento financeiro no período.' },
            { label: 'Total movimentado', value: formatCurrency(grandTotal), help: 'Soma geral dos lançamentos agregados por fornecedor.' },
            { label: 'Maior fornecedor', value: rows[0] ? rows[0].name : '-', help: rows[0] ? `Responsável por ${formatCurrency(rows[0].total)} no período.` : 'Nenhum movimento encontrado.' },
            { label: 'Média por fornecedor', value: formatCurrency(rows.length ? grandTotal / rows.length : 0), help: 'Valor médio financeiro por fornecedor listado.' }
          ],
          columns: [
            { label: 'Fornecedor' },
            { label: 'Tipo' },
            { label: 'Lançamentos', numeric: true },
            { label: 'Último registro' },
            { label: 'Total', numeric: true }
          ],
          rows: rows.map(item => ({
            cells: [
              { text: item.name },
              { text: item.type || '-' },
              { text: String(item.count), numeric: true },
              { text: item.latestDate ? formatDate(item.latestDate) : '-' },
              { text: formatCurrency(item.total), numeric: true }
            ]
          })),
          emptyMessage: 'Nenhum fornecedor com movimentação encontrado para os filtros aplicados.'
        };
      }

      if (filters.type === 'maintenance_due') {
        const items = getReportMaintenanceItems(filters);
        const alertCount = items.filter(item => item.maintenance.isAlert && !item.maintenance.openOrder).length;
        const openOsCount = items.filter(item => item.maintenance.openOrder).length;
        const noKmCount = items.filter(item => item.maintenance.currentKm === null).length;
        return {
          title,
          meta,
          summary: [
            { label: 'Veículos analisados', value: String(items.length), help: 'Frota considerada no monitoramento de revisão por KM.' },
            { label: 'Alertas ativos', value: String(alertCount), help: 'Veículos próximos da revisão e sem OS aberta.' },
            { label: 'OS de revisão abertas', value: String(openOsCount), help: 'Veículos que já possuem ordem de revisão em andamento.' },
            { label: 'Sem KM atual', value: String(noKmCount), help: 'Unidades sem base de quilometragem para cálculo da próxima revisão.' }
          ],
          columns: [
            { label: 'Frota' },
            { label: 'Placa' },
            { label: 'Veículo' },
            { label: 'KM atual', numeric: true },
            { label: 'Próxima revisão', numeric: true },
            { label: 'Falta', numeric: true },
            { label: 'Situação' }
          ],
          rows: items.map(({ vehicle, maintenance }) => {
            const statusLabel = maintenance.currentKm === null
              ? 'Aguardando KM'
              : maintenance.openOrder
                ? `OS ${getOrderNumberLabel(maintenance.openOrder)} aberta`
                : maintenance.remainingKm <= 0
                  ? 'Revisão vencida'
                  : maintenance.remainingKm <= 2000
                    ? 'Agendar revisão'
                    : 'No prazo';
            const tone = maintenance.currentKm === null
              ? 'neutral'
              : maintenance.openOrder
                ? 'ok'
                : maintenance.remainingKm <= 0
                  ? 'danger'
                  : maintenance.remainingKm <= 2000
                    ? 'warn'
                    : 'ok';
            return {
              cells: [
                { text: vehicle.numeroFrota || '-' },
                { text: vehicle.placa || '-' },
                { text: vehicle.modelo || '-' },
                { text: maintenance.currentKm === null ? '-' : maintenance.currentKm.toLocaleString('pt-BR'), numeric: true },
                { text: maintenance.nextRevisionKm === null ? '-' : maintenance.nextRevisionKm.toLocaleString('pt-BR'), numeric: true },
                { text: maintenance.remainingKm === null ? '-' : maintenance.remainingKm.toLocaleString('pt-BR'), numeric: true },
                { text: statusLabel, html: createReportStatusPill(statusLabel, tone) }
              ]
            };
          }),
          emptyMessage: 'Nenhum veículo encontrado para o monitoramento de revisão.'
        };
      }

      if (filters.type === 'cnh_expiring') {
        const thresholdEnd = filters.end || new Date(new Date().getTime() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const rows = allDrivers
          .filter(driver => driver.validade)
          .filter(driver => !filters.start || driver.validade >= filters.start)
          .filter(driver => driver.validade <= thresholdEnd)
          .sort((a, b) => String(a.validade || '').localeCompare(String(b.validade || '')))
          .map(driver => ({ ...driver, days: daysUntil(driver.validade) }));
        return {
          title,
          meta,
          summary: [
            { label: 'Motoristas listados', value: String(rows.length), help: 'CNHs dentro da janela informada ou dos próximos 180 dias.' },
            { label: 'Vencidas', value: String(rows.filter(item => item.days !== null && item.days < 0).length), help: 'Documentos que já passaram da validade.' },
            { label: 'Até 30 dias', value: String(rows.filter(item => item.days !== null && item.days >= 0 && item.days <= 30).length), help: 'CNHs com maior urgência de renovação.' },
            { label: 'Até 90 dias', value: String(rows.filter(item => item.days !== null && item.days >= 0 && item.days <= 90).length), help: 'Janela ampliada para planejamento de renovação.' }
          ],
          columns: [
            { label: 'Motorista' },
            { label: 'CPF' },
            { label: 'CNH' },
            { label: 'Categoria' },
            { label: 'Validade' },
            { label: 'Situação' }
          ],
          rows: rows.map(driver => {
            const tone = driver.days === null ? 'neutral' : driver.days < 0 ? 'danger' : driver.days <= 30 ? 'warn' : 'ok';
            const status = driver.days === null ? 'Sem cálculo' : driver.days < 0 ? `Vencida há ${Math.abs(driver.days)} dia(s)` : `${driver.days} dia(s) restantes`;
            return {
              cells: [
                { text: driver.nome || '-' },
                { text: driver.cpf || '-' },
                { text: driver.cnh || '-' },
                { text: driver.categoria || '-' },
                { text: formatDate(driver.validade) },
                { text: status, html: createReportStatusPill(status, tone) }
              ]
            };
          }),
          emptyMessage: 'Nenhuma CNH encontrada dentro da janela de vencimento selecionada.'
        };
      }

      if (filters.type === 'insurance_expiring') {
        const thresholdEnd = filters.end || new Date(new Date().getTime() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const rows = allVehicles
          .filter(vehicle => vehicle.seguroVencimento)
          .filter(vehicle => !filters.vehicleId || vehicle.id === filters.vehicleId)
          .filter(vehicle => !filters.start || vehicle.seguroVencimento >= filters.start)
          .filter(vehicle => vehicle.seguroVencimento <= thresholdEnd)
          .sort((a, b) => String(a.seguroVencimento || '').localeCompare(String(b.seguroVencimento || '')))
          .map(vehicle => ({ ...vehicle, days: daysUntil(vehicle.seguroVencimento) }));
        return {
          title,
          meta,
          summary: [
            { label: 'Veículos listados', value: String(rows.length), help: 'Seguros dentro da janela informada ou dos próximos 180 dias.' },
            { label: 'Vencidos', value: String(rows.filter(item => item.days !== null && item.days < 0).length), help: 'Seguros que já estão fora da validade.' },
            { label: 'Até 30 dias', value: String(rows.filter(item => item.days !== null && item.days >= 0 && item.days <= 30).length), help: 'Renovações mais urgentes da frota.' },
            { label: 'Até 90 dias', value: String(rows.filter(item => item.days !== null && item.days >= 0 && item.days <= 90).length), help: 'Faixa útil para programação financeira.' }
          ],
          columns: [
            { label: 'Frota' },
            { label: 'Placa' },
            { label: 'Veículo' },
            { label: 'Vencimento' },
            { label: 'Situação' }
          ],
          rows: rows.map(vehicle => {
            const tone = vehicle.days === null ? 'neutral' : vehicle.days < 0 ? 'danger' : vehicle.days <= 30 ? 'warn' : 'ok';
            const status = vehicle.days === null ? 'Sem cálculo' : vehicle.days < 0 ? `Vencido há ${Math.abs(vehicle.days)} dia(s)` : `${vehicle.days} dia(s) restantes`;
            return {
              cells: [
                { text: vehicle.numeroFrota || '-' },
                { text: vehicle.placa || '-' },
                { text: vehicle.modelo || '-' },
                { text: formatDate(vehicle.seguroVencimento) },
                { text: status, html: createReportStatusPill(status, tone) }
              ]
            };
          }),
          emptyMessage: 'Nenhum seguro encontrado dentro da janela de vencimento selecionada.'
        };
      }

      return {
        title,
        meta,
        summary: [],
        columns: [],
        rows: [],
        emptyMessage: 'Nenhum dado encontrado.'
      };
    }

    function renderReportSummary(summary) {
      const node = document.getElementById('report-summary-grid');
      if (!node) return;
      node.innerHTML = summary.map(item => `
        <div class="report-summary-card">
          <p class="report-summary-label">${escapeHtml(item.label)}</p>
          <p class="report-summary-value">${escapeHtml(item.value)}</p>
          <p class="report-summary-help">${escapeHtml(item.help)}</p>
        </div>
      `).join('');
    }

    function renderReportResultsTable(reportData) {
      const node = document.getElementById('report-results-table');
      if (!node) return;
      if (!reportData.rows.length) {
        node.innerHTML = `<div class="report-results-empty">${escapeHtml(reportData.emptyMessage)}</div>`;
        return;
      }

      const headHtml = reportData.columns.map(column => `
        <th class="${column.numeric ? 'report-cell--numeric' : ''}">${escapeHtml(column.label)}</th>
      `).join('');

      const rowsHtml = reportData.rows.map(row => `
        <tr>
          ${row.cells.map((cell, index) => `
            <td class="${reportData.columns[index]?.numeric || cell.numeric ? 'report-cell--numeric' : ''}">
              ${cell.html || escapeHtml(cell.text || '-')}
              ${cell.note ? `<div class="report-results-note">${escapeHtml(cell.note)}</div>` : ''}
            </td>
          `).join('')}
        </tr>
      `).join('');

      node.innerHTML = `
        <div class="report-results-scroll">
          <table class="report-results-table">
            <thead>
              <tr>${headHtml}</tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      `;
    }

    function getFilteredReportOrders() {
      const { vehicleId, start, end, type } = getReportFilters();
      const source = type === 'orders_deleted' ? deletedOrders : allOrders;
      return source.filter(order => {
        if (vehicleId && order.vehicleId !== vehicleId) return false;
        const reportDate = type === 'orders_deleted'
          ? String(order.deletedAt || '').slice(0, 10)
          : String(order.dataInicio || '');
        if (start && (!reportDate || reportDate < start)) return false;
        if (end && (!reportDate || reportDate > end)) return false;
        if (type === 'orders_open' && order.status !== 'aberta') return false;
        if (type === 'orders_progress' && order.status !== 'andamento') return false;
        if (type === 'orders_closed' && order.status !== 'fechada') return false;
        return true;
      }).sort((a, b) => String(a.numero || '').localeCompare(String(b.numero || '')));
    }

    function getFinanceSortValue(entry, key) {
      const order = allOrders.find(item => item.id === entry.orderId);
      const vehicle = allVehicles.find(item => item.id === getEntryVehicleId(entry));
      switch (key) {
        case 'supplier':
          return normalizeComparableText(entry.fornecedor || '');
        case 'status':
          return getFinanceEntryStatus(entry);
        case 'vehicle':
          return normalizeComparableText(vehicle ? `${vehicle.numeroFrota || ''} ${vehicle.placa || ''} ${vehicle.modelo || ''}` : '');
        case 'order':
          return order ? getNumericOrderValue(order.numero) : Number.MAX_SAFE_INTEGER;
        case 'date':
          return String(getFinanceEntryDate(entry) || '');
        case 'value':
          return getFinanceTotal(entry);
        default:
          return '';
      }
    }

    function getFinanceDefaultSortPriority(entry) {
      const status = getFinanceEntryStatus(entry);
      if (status === 'pendente' || status === 'pendente_os') return 0;
      if (status === 'agrupado') return 1;
      return 2;
    }

    function sortFinanceEntries(entries) {
      const withPosition = entries.map((entry, index) => ({ entry, index }));
      const direction = financeSortState.direction === 'asc' ? 1 : -1;
      withPosition.sort((a, b) => {
        if (financeSortState.key === 'default') {
          const priorityCompare = getFinanceDefaultSortPriority(a.entry) - getFinanceDefaultSortPriority(b.entry);
          if (priorityCompare !== 0) return priorityCompare;
          const dateCompare = String(getFinanceEntryDate(b.entry)).localeCompare(String(getFinanceEntryDate(a.entry)));
          if (dateCompare !== 0) return dateCompare;
          return String(b.entry.createdAt || '').localeCompare(String(a.entry.createdAt || '')) || a.index - b.index;
        }

        const aValue = getFinanceSortValue(a.entry, financeSortState.key);
        const bValue = getFinanceSortValue(b.entry, financeSortState.key);
        let compare = 0;
        if (typeof aValue === 'number' || typeof bValue === 'number') {
          compare = Number(aValue || 0) - Number(bValue || 0);
        } else {
          compare = String(aValue || '').localeCompare(String(bValue || ''), 'pt-BR', { numeric: true, sensitivity: 'base' });
        }
        if (compare !== 0) return compare * direction;
        const dateCompare = String(getFinanceEntryDate(b.entry)).localeCompare(String(getFinanceEntryDate(a.entry)));
        if (dateCompare !== 0) return dateCompare;
        return a.index - b.index;
      });
      return withPosition.map(item => item.entry);
    }

    function updateFinanceSortIndicators() {
      document.querySelectorAll('[data-finance-sort-indicator]').forEach((node) => {
        const key = node.getAttribute('data-finance-sort-indicator');
        node.textContent = financeSortState.key === key
          ? (financeSortState.direction === 'asc' ? '↑' : '↓')
          : '';
      });
      document.querySelectorAll('.finance-sort-head').forEach((button) => {
        const key = button.querySelector('[data-finance-sort-indicator]')?.getAttribute('data-finance-sort-indicator');
        button.classList.toggle('active', financeSortState.key === key);
      });
    }

    function toggleFinanceSort(key) {
      if (financeSortState.key === key) {
        financeSortState.direction = financeSortState.direction === 'asc' ? 'desc' : 'asc';
      } else {
        financeSortState = { key, direction: key === 'date' || key === 'value' ? 'desc' : 'asc' };
      }
      renderFinance();
    }

    window.toggleFinanceSort = toggleFinanceSort;

    function getVisibleFinanceEntries() {
      const quickSearch = normalizeSearchText(document.getElementById('finance-filter-search')?.value || '');
      const statusFilter = document.getElementById('finance-filter-status')?.value || '';
      const startFilter = document.getElementById('finance-filter-start')?.value || '';
      const endFilter = document.getElementById('finance-filter-end')?.value || '';
      const valueFilter = document.getElementById('finance-filter-value')?.value.trim().toLowerCase() || '';

      let visibleEntries = allFinanceEntries
        .filter(entry => !entry.groupedIntoId);

      if (statusFilter === 'pendente') {
        visibleEntries = visibleEntries.filter(entry => ['pendente', 'pendente_os'].includes(getFinanceEntryStatus(entry)));
      } else if (statusFilter) {
        visibleEntries = visibleEntries.filter(entry => getFinanceEntryStatus(entry) === statusFilter);
      }
      if (startFilter) visibleEntries = visibleEntries.filter(entry => getFinanceEntryDate(entry) >= startFilter);
      if (endFilter) visibleEntries = visibleEntries.filter(entry => getFinanceEntryDate(entry) <= endFilter);
      if (quickSearch) {
        visibleEntries = visibleEntries.filter(entry => {
          const order = allOrders.find(item => item.id === entry.orderId);
          const vehicle = allVehicles.find(item => item.id === getEntryVehicleId(entry));
          const haystack = normalizeSearchText([
            entry.fornecedor,
            entry.nf,
            entry.observacoes,
            entry.kindLabel,
            entry.fuelType,
            entry.km,
            order ? `OS ${getOrderNumberLabel(order)}` : '',
            vehicle ? `${vehicle.numeroFrota || ''} ${vehicle.placa || ''} ${vehicle.modelo || ''}` : ''
          ].join(' '));
          return haystack.includes(quickSearch);
        });
      }
      if (valueFilter) {
        const normalizedValue = valueFilter.replace(/[^\d,.-]/g, '').replace(',', '.');
        visibleEntries = visibleEntries.filter(entry => {
          const total = Number(entry.total || 0);
          return String(total).includes(normalizedValue) || formatCurrency(total).toLowerCase().includes(valueFilter);
        });
      }

      return sortFinanceEntries(visibleEntries);
    }

    function setModalSubmitState(visible, label = 'Salvar cadastro') {
      const button = document.getElementById('modal-submit-btn');
      if (!button) return;
      const labelNode = button.querySelector('span');
      if (labelNode) {
        labelNode.textContent = label;
      } else {
        button.textContent = label;
      }
      button.style.display = visible ? 'inline-flex' : 'none';
      button.hidden = !visible;
      button.disabled = !visible;
    }

    function setModalActionsVisible(visible) {
      const actions = document.getElementById('modal-actions');
      if (!actions) return;
      actions.style.display = visible ? 'flex' : 'none';
    }

    function setCadastroModalReadOnly(readOnly) {
      const fields = document.getElementById('modal-fields');
      if (!fields) return;
      fields.querySelectorAll('input, select, textarea, button').forEach((field) => {
        if (field.id === 'finance-receipt-open-btn') return;
        field.disabled = readOnly;
      });
    }

    function loadFinanceForm(entryType) {
      currentModalType = 'finance';
      currentFinanceEntryType = entryType;
      const fields = document.getElementById('modal-fields');
      const kicker = document.getElementById('modal-kicker');
      const title = document.getElementById('modal-title');
      const supplierOptions = getSortedSuppliers(allSuppliers)
        .filter(supplier => entryType === 'combustivel' ? supplier.tipo === 'posto' : supplier.tipo !== 'posto')
        .map(supplier => `<option value="${supplier.id}">${escapeHtml(supplier.nome)}</option>`)
        .join('');
      const supplierSearchItems = getSortedSuppliers(allSuppliers
        .filter(supplier => entryType === 'combustivel' ? supplier.tipo === 'posto' : supplier.tipo !== 'posto'));
      const supplierSearchOptions = supplierSearchItems
        .map(supplier => `<option value="${escapeHtml(supplier.nome)}" label="${escapeHtml([supplier.tipoLabel, supplier.documento].filter(Boolean).join(' - '))}"></option>`)
        .join('');
      const openOrders = getOpenOrdersSorted();
      const orderOptions = openOrders
        .map(order => `<option value="${escapeHtml(getOrderAutocompleteLabel(order))}"></option>`)
        .join('');
      const sortedVehicles = getSortedVehicles();
      const vehicleOptions = sortedVehicles
        .map(vehicle => `<option value="${escapeHtml(getVehicleAutocompleteLabel(vehicle))}"></option>`)
        .join('');

      kicker.textContent = 'Financeiro';
      title.textContent = entryType === 'combustivel' ? 'Lançamento de combustível' : 'Lançar despesa';
      setModalVisual(
        entryType === 'combustivel' ? 'fuel' : 'expense',
        entryType === 'combustivel'
          ? 'Registre abastecimentos com veículo, posto, litros, valor e KM.'
          : 'Registre notas fiscais, seguros, serviços e outras despesas da frota.'
      );

      if (entryType === 'combustivel') {
        fields.innerHTML = `
          <input id="finance-kind" type="hidden" value="despesa">
          <div class="field-wrap full">
            <label>${requiredLabel('Veículo')}</label>
            <input id="finance-vehicle-id" type="hidden">
            <div class="form-input-shell">
              ${fieldIcon('vehicle')}
              <input class="soft-input w-full" id="finance-vehicle-search" list="finance-vehicle-options" placeholder="Digite frota, placa ou nome do veículo" autocomplete="off" required>
            </div>
            <datalist id="finance-vehicle-options">${vehicleOptions}</datalist>
          </div>
          <div class="field-wrap">
            <label>${requiredLabel('Data de abastecimento')}</label>
            <div class="form-input-shell form-input-shell--date">
              ${fieldIcon('calendar')}
              <input class="soft-input w-full" id="finance-data-abastecimento" type="date" required>
            </div>
          </div>
          <div class="field-wrap">
            <label>${requiredLabel('Posto de combustível')}</label>
            <div class="form-input-shell">
              ${fieldIcon('store')}
              <select class="soft-input w-full" id="finance-supplier-id" onchange="toggleFinanceSpecificFields()" required>
                <option value="">Selecione um posto</option>
                ${supplierOptions}
              </select>
            </div>
          </div>
          <div class="field-wrap">
            <label>Valor</label>
            <div class="form-input-shell">
              ${fieldIcon('money')}
              <input class="soft-input w-full" id="finance-total" type="text" inputmode="numeric" value="${formatCurrencyInputValue(0)}">
            </div>
          </div>
          <div class="field-wrap">
            <label>QTD em litros</label>
            <div class="form-input-shell">
              ${fieldIcon('droplet')}
              <input class="soft-input w-full" id="finance-litros" type="number" min="0" step="0.001" placeholder="Ex: 120.500">
            </div>
          </div>
          <div class="field-wrap" id="finance-fuel-wrap">
            <label>${requiredLabel('Tipo de combustível')}</label>
            <div class="form-input-shell">
              ${fieldIcon('fuel')}
              <select class="soft-input w-full" id="finance-fuel-type">
                <option value="">Selecione</option>
                <option value="Diesel">Diesel</option>
                <option value="Diesel S10">Diesel S10</option>
                <option value="Gasolina">Gasolina</option>
                <option value="Gasolina aditivada">Gasolina aditivada</option>
                <option value="Etanol">Etanol</option>
                <option value="GNV">GNV</option>
                <option value="Arla 32">Arla 32</option>
                <option value="Oleo hidraulico">Oleo hidraulico</option>
                <option value="Oleo de motor">Oleo de motor</option>
              </select>
            </div>
          </div>
          <div class="field-wrap">
            <label>${requiredLabel('KM')}</label>
            <div class="form-input-shell">
              ${fieldIcon('speed')}
              <input class="soft-input w-full" id="finance-km" type="number" min="0" step="1" placeholder="Ex: 50500">
            </div>
          </div>
          <div class="field-wrap">
            <label>Selecionar motorista</label>
            <div class="form-input-shell">
              ${fieldIcon('user')}
              <select class="soft-input w-full" id="finance-driver-id" onchange="suggestFinanceVehicleFromDriver()">
                <option value="">Selecione um motorista</option>
                ${getSortedDrivers().map(driver => `<option value="${driver.id}">${escapeHtml(driver.nome)}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="field-wrap full hidden" id="finance-receipt-wrap">
            <label>Comprovante importado</label>
            <input id="finance-comprovante-url" type="hidden">
            <div class="soft-input w-full flex items-center justify-between gap-3">
              <span id="finance-receipt-url" class="truncate text-slate-500"></span>
              <button type="button" id="finance-receipt-open-btn" class="soft-btn !h-11 !px-4" onclick="viewFinanceReceipt(document.getElementById('finance-comprovante-url')?.value || '')">Abrir comprovante</button>
            </div>
          </div>
          <div class="field-wrap full">
            <label>Observações</label>
            <div class="form-input-shell form-input-shell--textarea">
              ${fieldIcon('edit')}
              <textarea class="soft-input textarea w-full" id="finance-observacoes" placeholder="Observações do abastecimento"></textarea>
            </div>
          </div>
        `;
      } else {
        fields.innerHTML = `
          <div class="field-wrap full">
            <label>Alocar na OS</label>
            <input id="finance-order-id" type="hidden">
            <div class="form-input-shell">
              ${fieldIcon('document')}
              <input class="soft-input w-full" id="finance-order-search" list="finance-order-options" placeholder="Digite número da OS, frota, placa ou veículo" autocomplete="off">
            </div>
            <datalist id="finance-order-options">
              <option value="Lançar sem OS por enquanto"></option>
              ${orderOptions}
            </datalist>
          </div>
          <div class="field-wrap">
            <label>${requiredLabel('Natureza financeira')}</label>
            <div class="form-input-shell">
              ${fieldIcon('flag')}
              <select class="soft-input w-full" id="finance-kind" required>
                <option value="despesa">Despesa</option>
                <option value="receita">Receita</option>
              </select>
            </div>
          </div>
          <div class="field-wrap">
            <label>${requiredLabel('Data de vencimento')}</label>
            <div class="form-input-shell form-input-shell--date">
              ${fieldIcon('calendar')}
              <input class="soft-input w-full" id="finance-data-vencimento" type="date" required>
            </div>
          </div>
          <div class="field-wrap">
            <label>${requiredLabel('Fornecedor')}</label>
            <input id="finance-supplier-id" type="hidden">
            <div class="form-input-shell">
              ${fieldIcon('store')}
              <input class="soft-input w-full" id="finance-supplier-search" list="finance-supplier-options" placeholder="Digite nome, categoria ou CNPJ do parceiro" autocomplete="off" required>
            </div>
            <datalist id="finance-supplier-options">${supplierSearchOptions}</datalist>
          </div>
          <div class="field-wrap">
            <label>NF / referência</label>
            <div class="form-input-shell">
              ${fieldIcon('document')}
              <input class="soft-input w-full" id="finance-nf" placeholder="Ex: NF 1542">
            </div>
          </div>
          <div class="field-wrap">
            <label>KM</label>
            <div class="form-input-shell">
              ${fieldIcon('speed')}
              <input class="soft-input w-full" id="finance-km" type="number" min="0" step="1" placeholder="Ex: 50500">
            </div>
          </div>
          <div class="field-wrap">
            <label>Valor</label>
            <div class="form-input-shell">
              ${fieldIcon('money')}
              <input class="soft-input w-full" id="finance-total" type="text" inputmode="numeric" value="${formatCurrencyInputValue(0)}">
            </div>
          </div>
          <div class="field-wrap full hidden" id="finance-receipt-wrap">
            <label>Comprovante importado</label>
            <input id="finance-comprovante-url" type="hidden">
            <div class="soft-input w-full flex items-center justify-between gap-3">
              <span id="finance-receipt-url" class="truncate text-slate-500"></span>
              <button type="button" id="finance-receipt-open-btn" class="soft-btn !h-11 !px-4" onclick="viewFinanceReceipt(document.getElementById('finance-comprovante-url')?.value || '')">Abrir comprovante</button>
            </div>
          </div>
          <div class="field-wrap full">
            <label>Observações</label>
            <div class="form-input-shell form-input-shell--textarea">
              ${fieldIcon('edit')}
              <textarea class="soft-input textarea w-full" id="finance-observacoes" placeholder="Observações do lançamento"></textarea>
            </div>
          </div>
        `;
      }

      setModalSubmitState(true, entryType === 'combustivel' ? 'Salvar abastecimento' : 'Salvar lançamento');
      if (entryType === 'combustivel') {
        bindAutocompleteField({
          inputId: 'finance-vehicle-search',
          hiddenId: 'finance-vehicle-id',
          items: sortedVehicles,
          labelGetter: getVehicleAutocompleteLabel,
          resolver: resolveVehicleFromSearch
        });
      } else {
        bindAutocompleteField({
          inputId: 'finance-order-search',
          hiddenId: 'finance-order-id',
          items: openOrders,
          labelGetter: getOrderAutocompleteLabel,
          resolver: resolveOrderFromSearch
        });
        bindAutocompleteField({
          inputId: 'finance-supplier-search',
          hiddenId: 'finance-supplier-id',
          items: supplierSearchItems,
          labelGetter: getSupplierAutocompleteLabel,
          resolver: resolveSupplierByRelevantTerms
        });
        bindSupplierSearchDisplay();
      }
      toggleFinanceSpecificFields();
      attachModalInputMasks();
      enhanceModalSelects();
      updateFinanceReceiptPreview('');
    }

    function openFuelGroupingModal(editId = null, options = {}) {
      openCadastroModal('finance');
      currentModalType = 'finance-group';
      currentEditingId = editId;
      const documentsOnly = options?.documentsOnly === true;

      const existingGroup = editId ? allFinanceEntries.find(item => item.id === editId && isFinanceGroupEntry(item)) : null;
      const existingMode = existingGroup
        ? (isExpenseGroupEntry(existingGroup) ? 'expense' : 'fuel')
        : null;
      const selectedEntries = existingGroup
        ? getFinanceGroupChildren(existingGroup)
        : Array.from(selectedFinance)
          .map(id => allFinanceEntries.find(item => item.id === id))
          .filter(entry => entry && !entry.groupedIntoId && !isFinanceEntryLockedForEditing(entry));
      const groupingMode = existingMode || getFinanceGroupingMode(selectedEntries);
      currentFinanceEntryType = groupingMode === 'expense' ? 'despesa_agrupada' : 'combustivel_agrupado';

      if (!selectedEntries.length) {
        closeCadastroModal();
        showToast('Selecione lançamentos pendentes para agrupar.');
        return;
      }
      if (!existingGroup && selectedEntries.length < 2) {
        closeCadastroModal();
        showToast('Selecione pelo menos dois lançamentos para agrupar.');
        return;
      }
      if (!groupingMode) {
        closeCadastroModal();
        showToast('Agrupe abastecimentos do mesmo veículo ou despesas do mesmo fornecedor.');
        return;
      }

      const isExpenseGrouping = groupingMode === 'expense';
      const vehicleIds = [...new Set(selectedEntries.map(entry => getEntryVehicleId(entry)).filter(Boolean))];
      const vehicleId = isExpenseGrouping ? (vehicleIds.length === 1 ? vehicleIds[0] : '') : vehicleIds[0];
      const vehicle = allVehicles.find(item => item.id === vehicleId);
      const groupOpenOrders = getOpenOrdersSorted()
        .filter(order => !vehicleId || order.vehicleId === vehicleId);
      const orderOptions = groupOpenOrders
        .map(order => `<option value="${escapeHtml(getOrderAutocompleteLabel(order))}"></option>`)
        .join('');
      const totalBase = selectedEntries.reduce((sum, entry) => sum + getFinanceTotal(entry), 0);
      const fields = document.getElementById('modal-fields');
      const kicker = document.getElementById('modal-kicker');
      const title = document.getElementById('modal-title');
      const groupNoun = isExpenseGrouping ? 'despesas' : 'abastecimentos';
      const groupTitle = isExpenseGrouping ? 'Agrupar despesas' : 'Agrupar abastecimentos';
      const supplier = isExpenseGrouping
        ? (allSuppliers.find(item => item.id === selectedEntries[0]?.supplierId) || null)
        : null;

      kicker.textContent = 'Financeiro';
      title.textContent = documentsOnly
        ? 'Comprovantes do agrupamento'
        : existingGroup ? `Editar agrupamento de ${groupNoun}` : groupTitle;
      const historyBlockHtml = `
        <div class="field-wrap full">
          <label>Histórico ${isExpenseGrouping ? 'das despesas' : 'dos abastecimentos'}</label>
          <div class="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            ${selectedEntries.map(entry => `
              <div class="rounded-2xl border border-slate-200 px-4 py-3 bg-slate-50">
                <div class="flex items-center justify-between gap-3 flex-wrap">
                  <strong class="text-slate-800">${escapeHtml(entry.fornecedor || (isExpenseGrouping ? 'Despesa' : 'Abastecimento'))}</strong>
                  <span class="text-sm font-semibold text-slate-500">${escapeHtml(formatCurrency(getFinanceTotal(entry)))}</span>
                </div>
                <div class="mt-2 text-sm text-slate-500 flex gap-3 flex-wrap">
                  <span>Data: ${escapeHtml(formatDate(getFinanceEntryDate(entry)))}</span>
                  ${entry.fuelType ? `<span>Combustível: ${escapeHtml(entry.fuelType)}</span>` : ''}
                  ${entry.nf ? `<span>${escapeHtml(normalizeFinanceNoteLabel(entry.nf))}</span>` : ''}
                  ${entry.km ? `<span>KM: ${escapeHtml(entry.km)}</span>` : ''}
                </div>
                ${entry.comprovanteUrl ? `
                  <div class="finance-group-documents">
                    <span class="finance-group-document-label">Comprovante</span>
                    <button type="button" class="finance-group-document-btn" onclick="viewFinanceReceipt('${escapeHtml(entry.comprovanteUrl)}')">
                      Ver
                    </button>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
      fields.innerHTML = documentsOnly ? historyBlockHtml : `
        <input id="finance-group-entry-ids" type="hidden" value="${selectedEntries.map(entry => entry.id).join(',')}">
        <div class="field-wrap full">
          <label>${isExpenseGrouping ? 'Fornecedor do agrupamento' : 'Veículo do agrupamento'}</label>
          <div class="soft-input w-full flex items-center">${escapeHtml(isExpenseGrouping
            ? (supplier?.nome || selectedEntries[0]?.fornecedor || '-')
            : (vehicle ? `${vehicle.numeroFrota}  ${vehicle.placa}  ${vehicle.modelo}` : '-'))}</div>
        </div>
        ${historyBlockHtml}
        <div class="field-wrap">
          <label>Soma das notinhas</label>
          <input class="soft-input w-full" id="finance-group-base-total" type="text" inputmode="numeric" value="${formatCurrencyInputValue(Number(totalBase || 0))}" readonly>
        </div>
        <div class="field-wrap">
          <label>Valor final do agrupamento</label>
          <input class="soft-input w-full" id="finance-group-total" type="text" inputmode="numeric" value="${formatCurrencyInputValue(existingGroup ? Number(existingGroup.total || 0) : Number(totalBase || 0))}">
          <div id="finance-group-total-helper" class="mt-2 text-xs text-slate-500">O valor final está igual à soma automática das notinhas.</div>
        </div>
        <div class="field-wrap">
          <label>Desconto</label>
          <input class="soft-input w-full" id="finance-group-discount" type="text" inputmode="numeric" value="${formatCurrencyInputValue(Number(existingGroup?.discount || 0))}">
        </div>
        <div class="field-wrap">
          <label>Acréscimo</label>
          <input class="soft-input w-full" id="finance-group-surcharge" type="text" inputmode="numeric" value="${formatCurrencyInputValue(Number(existingGroup?.surcharge || 0))}">
        </div>
        <div class="field-wrap">
          <label>Data de vencimento</label>
          <input class="soft-input w-full" id="finance-group-data-vencimento" type="date">
        </div>
        <div class="field-wrap">
          <label>Número da nota</label>
          <input class="soft-input w-full" id="finance-group-nf" placeholder="Ex: NF 1542">
        </div>
        <div class="field-wrap full">
          <label>Alocar na OS (opcional)</label>
          <input id="finance-group-order-id" type="hidden">
          <input class="soft-input w-full" id="finance-group-order-search" list="finance-group-order-options" placeholder="Digite número da OS, frota, placa ou veículo" autocomplete="off">
          <datalist id="finance-group-order-options">
            <option value="Deixar pendente"></option>
            ${orderOptions}
          </datalist>
        </div>
        <div class="field-wrap full">
          <label>Observações</label>
          <textarea class="soft-input textarea w-full" id="finance-group-observacoes" placeholder="Observações do agrupamento"></textarea>
        </div>
      `;

      if (documentsOnly) {
        setModalSubmitState(false);
        return;
      }

      document.getElementById('finance-group-order-id').value = existingGroup?.orderId || '';
      if (document.getElementById('finance-group-order-search')) {
        const existingOrder = groupOpenOrders.find(order => order.id === existingGroup?.orderId);
        document.getElementById('finance-group-order-search').value = existingOrder ? getOrderAutocompleteLabel(existingOrder) : '';
      }
      document.getElementById('finance-group-data-vencimento').value = existingGroup?.dataVencimento || '';
      document.getElementById('finance-group-nf').value = existingGroup?.nf || '';
      document.getElementById('finance-group-observacoes').value = existingGroup?.observacoes || '';
      bindAutocompleteField({
        inputId: 'finance-group-order-search',
        hiddenId: 'finance-group-order-id',
        items: groupOpenOrders,
        labelGetter: getOrderAutocompleteLabel,
        resolver: resolveOrderFromSearch
      });
      attachModalInputMasks();
      ['finance-group-total', 'finance-group-discount', 'finance-group-surcharge'].forEach((id) => {
        const node = document.getElementById(id);
        if (!node) return;
        node.addEventListener('input', () => {
          document.body.dataset.financeGroupSyncSource = id === 'finance-group-total' ? 'total' : 'adjustment';
          syncFuelGroupingTotals();
        });
      });
      syncFuelGroupingTotals();
      setModalSubmitState(true, existingGroup ? 'Salvar agrupamento' : 'Criar agrupamento');
    }

    function undoSelectedFuelGrouping() {
      if (selectedFinance.size !== 1) {
        showToast('Selecione um agrupamento para desfazer.');
        return;
      }
      const selectedId = Array.from(selectedFinance)[0];
      const groupEntry = allFinanceEntries.find(entry => entry.id === selectedId && isFinanceGroupEntry(entry));
      if (!groupEntry) {
        showToast('Selecione um agrupamento válido para desfazer.');
        return;
      }
      if (canReverseFinanceEntry(groupEntry)) {
        showToast('Esse agrupamento já foi fechado ou distribuído. Faça o estorno antes de desfazer.');
        return;
      }

      const groupedIds = new Set(Array.isArray(groupEntry.groupedEntryIds) ? groupEntry.groupedEntryIds : []);
      allFinanceEntries = allFinanceEntries
        .filter(entry => entry.id !== groupEntry.id)
        .map(entry => groupedIds.has(entry.id)
          ? { ...entry, groupedIntoId: '' }
          : entry);
      selectedFinance.clear();
      saveToLocalStorage();
      renderAll();
      showToast('Agrupamento desfeito com sucesso.');
    }

    function viewSelectedFinance() {
      if (selectedFinance.size !== 1) {
        showToast('Selecione apenas um lançamento para visualizar.');
        return;
      }
      const entry = allFinanceEntries.find(item => item.id === Array.from(selectedFinance)[0]);
      if (!entry) return;
      if (isFinanceGroupEntry(entry)) {
        openFuelGroupingModal(entry.id);
        setModalSubmitState(false);
        setCadastroModalReadOnly(true);
        return;
      }
      viewFinanceEntryById(entry.id);
      setModalSubmitState(false);
    }

    function loadFinanceEntryIntoForm(entry) {
      if (!entry) return;
      openCadastroModal('finance');
      loadFinanceForm(entry.entryType || 'despesa');
      currentEditingId = entry.id;
      if (isFuelEntry(entry)) {
        const vehicle = allVehicles.find(item => item.id === (entry.vehicleId || getEntryVehicleId(entry) || ''));
        document.getElementById('finance-vehicle-id').value = vehicle?.id || '';
        if (document.getElementById('finance-vehicle-search')) {
          document.getElementById('finance-vehicle-search').value = vehicle ? getVehicleAutocompleteLabel(vehicle) : '';
        }
        document.getElementById('finance-data-abastecimento').value = entry.dataAbastecimento || entry.dataVencimento || '';
        document.getElementById('finance-supplier-id').value = entry.supplierId || '';
        document.getElementById('finance-total').value = formatCurrencyInputValue(entry.total ?? 0);
        const litrosField = document.getElementById('finance-litros');
        if (litrosField) litrosField.value = entry.litros || '';
        const driverField = document.getElementById('finance-driver-id');
        if (driverField) driverField.value = entry.driverId || '';
        toggleFinanceSpecificFields();
        if (document.getElementById('finance-fuel-type')) {
          document.getElementById('finance-fuel-type').value = entry.fuelType || '';
        }
        if (document.getElementById('finance-km')) {
          document.getElementById('finance-km').value = entry.km || entry.kmFinal || '';
        }
        updateFinanceReceiptPreview(entry.comprovanteUrl || '');
      } else {
        const order = allOrders.find(item => item.id === (entry.orderId || ''));
        document.getElementById('finance-order-id').value = order?.id || '';
        if (document.getElementById('finance-order-search')) {
          document.getElementById('finance-order-search').value = order ? getOrderAutocompleteLabel(order) : '';
        }
        document.getElementById('finance-kind').value = entry.kind || 'despesa';
        document.getElementById('finance-data-vencimento').value = entry.dataVencimento || '';
        document.getElementById('finance-supplier-id').value = entry.supplierId || '';
        if (document.getElementById('finance-supplier-search')) {
          const supplier = allSuppliers.find(item => item.id === entry.supplierId);
          document.getElementById('finance-supplier-search').value = supplier?.nome || entry.fornecedor || '';
        }
        document.getElementById('finance-nf').value = entry.nf || '';
        if (document.getElementById('finance-km')) {
          document.getElementById('finance-km').value = entry.km || '';
        }
        document.getElementById('finance-total').value = formatCurrencyInputValue(entry.total ?? 0);
      }
      document.getElementById('finance-observacoes').value = entry.observacoes || '';
    }

    function getFinanceEntryReceiptUrl(entry) {
      if (!entry) return '';
      if (entry.comprovanteUrl) return entry.comprovanteUrl;
      if (isFinanceGroupEntry(entry)) {
        const childWithReceipt = getFinanceGroupChildren(entry).find((item) => item?.comprovanteUrl);
        return childWithReceipt?.comprovanteUrl || '';
      }
      return '';
    }

    function getFinanceEntryReceipts(entry) {
      if (!entry) return [];
      if (isFinanceGroupEntry(entry)) {
        return getFinanceGroupChildren(entry)
          .filter((item) => item?.comprovanteUrl)
          .map((item) => ({
            id: item.id,
            url: item.comprovanteUrl,
            fornecedor: item.fornecedor || (isExpenseGroupEntry(entry) ? 'Despesa' : 'Abastecimento'),
            date: getFinanceEntryDate(item),
            value: getFinanceTotal(item)
          }));
      }
      return entry.comprovanteUrl
        ? [{
            id: entry.id,
            url: entry.comprovanteUrl,
            fornecedor: entry.fornecedor || 'Abastecimento',
            date: getFinanceEntryDate(entry),
            value: getFinanceTotal(entry)
          }]
        : [];
    }

    function viewFinanceEntryById(entryId) {
      const entry = allFinanceEntries.find((item) => item.id === entryId);
      if (!entry) return;
      if (isFinanceGroupEntry(entry)) {
        openFuelGroupingModal(entry.id);
        setModalSubmitState(false);
        setCadastroModalReadOnly(true);
        return;
      }
      currentEditingId = entry.id;
      selectedFinance = new Set([entry.id]);
      loadFinanceEntryIntoForm(entry);
      document.getElementById('modal-title').textContent = 'Visualizar lançamento';
      setModalSubmitState(false);
      setCadastroModalReadOnly(true);
    }

    function openFinanceReceiptByEntryId(entryId) {
      const entry = allFinanceEntries.find((item) => item.id === entryId);
      const receipts = getFinanceEntryReceipts(entry);
      if (!receipts.length) {
        showToast('Esse lançamento não possui comprovante vinculado.');
        return;
      }
      if (isFinanceGroupEntry(entry)) {
        openFuelGroupingModal(entry.id, { documentsOnly: true });
        return;
      }
      viewFinanceReceipt(receipts[0].url);
    }

    function openCloseFuelExpenseModal() {
      if (selectedFinance.size !== 1) {
        showToast('Selecione um lançamento para fechar a despesa.');
        return;
      }
      const entry = allFinanceEntries.find(item => item.id === Array.from(selectedFinance)[0]);
      if (!entry) {
        showToast('Selecione um lançamento válido.');
        return;
      }

      const vehicleId = getEntryVehicleId(entry);
      const closeOpenOrders = getOpenOrdersSorted()
        .filter(order => !vehicleId || order.vehicleId === vehicleId);
      const orderOptions = closeOpenOrders
        .map(order => `<option value="${escapeHtml(getOrderAutocompleteLabel(order))}"></option>`)
        .join('');
      const fields = document.getElementById('modal-fields');
      const kicker = document.getElementById('modal-kicker');
      const title = document.getElementById('modal-title');

      openCadastroModal('finance');
      currentModalType = 'finance-close';
      currentEditingId = entry.id;
      kicker.textContent = 'Financeiro';
      title.textContent = 'Fechar despesa';
      fields.innerHTML = `
        <div class="field-wrap full">
          <label>Lançamento selecionado</label>
          <div class="soft-input w-full flex items-center">${escapeHtml(isFinanceGroupEntry(entry) ? (isExpenseGroupEntry(entry) ? 'Agrupamento de despesas' : 'Agrupamento de abastecimentos') : (entry.fornecedor || 'Abastecimento'))}</div>
        </div>
        <div class="field-wrap">
          <label>NF / numero da nota</label>
          <input class="soft-input w-full" id="finance-close-nf" placeholder="Ex: NF 1542">
        </div>
        <div class="field-wrap">
          <label>Data de vencimento</label>
          <input class="soft-input w-full" id="finance-close-data-vencimento" type="date">
        </div>
        <div class="field-wrap">
          <label>Desconto</label>
          <input class="soft-input w-full" id="finance-close-discount" type="text" inputmode="numeric" value="${formatCurrencyInputValue(Number(entry.discount || 0))}">
        </div>
        <div class="field-wrap">
          <label>Valor final</label>
          <input class="soft-input w-full" id="finance-close-total" type="text" inputmode="numeric" value="${formatCurrencyInputValue(Number(entry.total || 0))}">
        </div>
        <div class="field-wrap full">
          <label>${requiredLabel('Alocar na OS')}</label>
          <input id="finance-close-order-id" type="hidden">
          <input class="soft-input w-full" id="finance-close-order-search" list="finance-close-order-options" placeholder="Digite número da OS, frota, placa ou veículo" autocomplete="off">
          <datalist id="finance-close-order-options">
            ${orderOptions}
          </datalist>
        </div>
        <div class="field-wrap full">
          <label>Observações</label>
          <textarea class="soft-input textarea w-full" id="finance-close-observacoes" placeholder="Observações do fechamento da despesa"></textarea>
        </div>
      `;

      document.getElementById('finance-close-nf').value = entry.nf || '';
      document.getElementById('finance-close-data-vencimento').value = entry.dataVencimento || '';
      document.getElementById('finance-close-order-id').value = entry.orderId || '';
      if (document.getElementById('finance-close-order-search')) {
        const existingOrder = closeOpenOrders.find(order => order.id === entry.orderId);
        document.getElementById('finance-close-order-search').value = existingOrder ? getOrderAutocompleteLabel(existingOrder) : '';
      }
      document.getElementById('finance-close-observacoes').value = entry.observacoes || '';
      bindAutocompleteField({
        inputId: 'finance-close-order-search',
        hiddenId: 'finance-close-order-id',
        items: closeOpenOrders,
        labelGetter: getOrderAutocompleteLabel,
        resolver: resolveOrderFromSearch
      });
      setModalSubmitState(true, 'Fechar despesa');
    }

    function renderHomeCards() {
      const vehiclesNode = document.getElementById('home-total-vehicles');
      const driversNode = document.getElementById('home-total-drivers');
      const financeNode = document.getElementById('home-total-finance');
      const costNode = document.getElementById('home-cost-per-km');
      const costLabelNode = document.getElementById('home-cost-per-km-label');
      const cnhNode = document.getElementById('home-cnh-expiring');
      const insuranceNode = document.getElementById('home-insurance-expiring');
      const costTableNode = document.getElementById('home-cost-table');
      const financeStatusTableNode = document.getElementById('home-finance-status-table');
      const insuranceTableNode = document.getElementById('home-insurance-table');
      const maintenanceTableNode = document.getElementById('home-maintenance-table');
      const vehicleStats = getVehicleCostStats().filter(item => item.entries > 0);
      const bestVehicle = vehicleStats[0];
      const { cnhItems, insuranceItems } = getDashboardExpirations();
      const financeStatusItems = getHomeFinanceStatusItems();
      const maintenanceItems = getSortedVehicles()
        .map(vehicle => ({
          vehicle,
          maintenance: getVehicleMaintenanceStatus(vehicle)
        }))
        .sort((a, b) => {
          const aHasKm = a.maintenance.currentKm !== null;
          const bHasKm = b.maintenance.currentKm !== null;
          if (aHasKm && !bHasKm) return -1;
          if (!aHasKm && bHasKm) return 1;
          if (!aHasKm && !bHasKm) {
            return getNumericOrderValue(a.vehicle.numeroFrota) - getNumericOrderValue(b.vehicle.numeroFrota);
          }
          if (a.maintenance.remainingKm !== b.maintenance.remainingKm) {
            return a.maintenance.remainingKm - b.maintenance.remainingKm;
          }
          return getNumericOrderValue(a.vehicle.numeroFrota) - getNumericOrderValue(b.vehicle.numeroFrota);
        });

      if (vehiclesNode) vehiclesNode.textContent = allVehicles.length;
      if (driversNode) driversNode.textContent = allDrivers.length;
      if (financeNode) financeNode.textContent = allFinanceEntries.length;
      if (costNode) costNode.textContent = bestVehicle ? formatCurrency(bestVehicle.costPerKm) : formatCurrency(0);
      if (costLabelNode) costLabelNode.textContent = bestVehicle
        ? `${bestVehicle.placa}  ${bestVehicle.modelo}`
        : 'Nenhum abastecimento registrado';
      if (cnhNode) cnhNode.textContent = cnhItems.length;
      if (insuranceNode) insuranceNode.textContent = insuranceItems.length;
      renderStorageDashboard();
      renderMonthlyVehicleCostChart();
      if (costTableNode) {
        costTableNode.innerHTML = renderDashboardTableRows(
          vehicleStats.slice(0, 6),
          item => `
            <button type="button" class="dashboard-action-row" onclick="openOrdersForVehicle('${item.vehicleId}')">
              <div>
                <p class="font-bold text-slate-800">${escapeHtml(item.placa)}  ${escapeHtml(item.modelo)}</p>
                <p class="text-xs text-slate-500">Frota ${escapeHtml(item.frota)}  ${item.totalKm} km  ${item.entries} lançamento(s)</p>
              </div>
              <div class="text-right">
                <p class="font-extrabold text-[#6267d9]">${escapeHtml(formatCurrency(item.costPerKm))}</p>
                <p class="text-xs text-slate-500">${escapeHtml(formatCurrency(item.totalCost))}</p>
              </div>
            </button>
          `
        );
      }
      if (financeStatusTableNode) {
        financeStatusTableNode.innerHTML = renderDashboardTableRows(
          financeStatusItems,
          item => `
            <button type="button" class="dashboard-action-row" onclick="openFinanceStatusFromHome('${item.group}')">
              <div>
                <p class="font-bold text-slate-800">${escapeHtml(item.label)}</p>
                <p class="text-xs text-slate-500">${item.count} lançamento(s)</p>
              </div>
              <div class="text-right">
                <p class="font-extrabold ${item.group === 'pending' ? 'text-amber-600' : 'text-emerald-600'}">${escapeHtml(formatCurrency(item.total))}</p>
                <p class="text-xs text-slate-500">${escapeHtml(item.help)}</p>
              </div>
            </button>
          `
        );
      }
      if (insuranceTableNode) {
        insuranceTableNode.innerHTML = renderDashboardTableRows(
          insuranceItems.slice(0, 6),
          item => {
            const alertTone = getInsuranceAlertTone(item.days);
            return `
              <button type="button" class="dashboard-action-row insurance-alert-row insurance-alert-row--${alertTone}" onclick="openVehicleFromHome('${item.id}')">
                <div>
                  <p class="font-bold text-slate-800">${escapeHtml(item.placa)}  ${escapeHtml(item.modelo)}</p>
                  <p class="text-xs text-slate-500">Frota ${escapeHtml(item.numeroFrota || '-')}</p>
                </div>
                <div class="text-right">
                  <p class="font-extrabold insurance-alert-date">${escapeHtml(formatDate(item.seguroVencimento))}</p>
                  <p class="text-xs font-bold insurance-alert-label">${escapeHtml(getInsuranceAlertLabel(item.days))}</p>
                </div>
              </button>
            `;
          }
        );
      }
      if (maintenanceTableNode) {
        maintenanceTableNode.innerHTML = renderDashboardTableRows(
          maintenanceItems,
          ({ vehicle, maintenance }) => {
            const currentKmLabel = maintenance.currentKm === null ? 'Sem KM atual' : `${maintenance.currentKm.toLocaleString('pt-BR')} km`;
            const nextRevisionLabel = maintenance.nextRevisionKm === null ? 'Aguardando KM' : `${maintenance.nextRevisionKm.toLocaleString('pt-BR')} km`;
            const alertLabel = maintenance.currentKm === null
              ? 'Registre abastecimentos com KM para ativar o controle.'
              : maintenance.openOrder
                ? `OS ${getOrderNumberLabel(maintenance.openOrder)} aberta para ${nextRevisionLabel}.`
                : maintenance.isAlert
                  ? `Faltam ${maintenance.remainingKm.toLocaleString('pt-BR')} km para a próxima revisão.`
                  : `Faltam ${maintenance.remainingKm.toLocaleString('pt-BR')} km para a próxima revisão.`;
            const badgeClass = maintenance.openOrder
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : maintenance.isAlert
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-50 text-slate-600 border-slate-200';
            const shortcutAction = maintenance.openOrder
              ? `openOrderFromHome('${maintenance.openOrder.id}')`
              : `openVehicleFromHome('${vehicle.id}')`;

            return `
              <div class="dashboard-action-row dashboard-action-row--stacked" role="button" tabindex="0" onclick="${shortcutAction}" onkeydown="handleDashboardShortcutKey(event, '${maintenance.openOrder ? 'openOrderFromHome' : 'openVehicleFromHome'}', '${maintenance.openOrder ? maintenance.openOrder.id : vehicle.id}')">
                <div class="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p class="font-extrabold text-slate-900">${escapeHtml(vehicle.numeroFrota || '-')} - ${escapeHtml(vehicle.placa || '-')} - ${escapeHtml(vehicle.modelo || 'Veículo')}</p>
                    <p class="text-xs text-slate-500 mt-2">KM atual: ${escapeHtml(currentKmLabel)}  Próxima revisão: ${escapeHtml(nextRevisionLabel)}</p>
                  </div>
                  <span class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${badgeClass}">
                    ${maintenance.openOrder ? 'OS aberta' : maintenance.isAlert ? 'Agendar revisão' : 'No prazo'}
                  </span>
                </div>
                <div class="mt-4 flex items-center justify-between gap-4 flex-wrap">
                  <p class="text-sm text-slate-600">${escapeHtml(alertLabel)}</p>
                  ${maintenance.isAlert && !maintenance.openOrder
                    ? `<button type="button" class="soft-btn primary" onclick="event.stopPropagation(); openRevisionOrderForVehicle('${vehicle.id}')">Abrir OS</button>`
                    : ''}
                </div>
              </div>
            `;
          }
        );
      }
    }

    function renderReports() {
      const select = document.getElementById('report-filter-vehicle');
      const typeSelect = document.getElementById('report-filter-type');
      const titleNode = document.getElementById('report-results-title');
      const metaNode = document.getElementById('report-results-meta');
      if (!select || !typeSelect || !titleNode || !metaNode) return;

      const currentValue = select.value;
      select.innerHTML = '<option value="">Todos os veículos</option>' + getSortedVehicles().map(vehicle => `
        <option value="${vehicle.id}">${escapeHtml(vehicle.placa)}  ${escapeHtml(vehicle.modelo)}  Frota ${escapeHtml(vehicle.numeroFrota || '-')}</option>
      `).join('');
      if (Array.from(select.options).some(option => option.value === currentValue)) {
        select.value = currentValue;
      }

      const filters = getReportFilters();
      const reportData = buildReportData(filters);
      titleNode.textContent = reportData.title;
      metaNode.textContent = reportData.meta;
      renderReportSummary(reportData.summary);
      renderReportResultsTable(reportData);
    }

    function getFinanceDocumentOrder(entry) {
      if (!entry) return null;
      if (entry.orderId) return allOrders.find(order => order.id === entry.orderId) || null;
      if (entry.groupedIntoId) {
        const groupEntry = allFinanceEntries.find(item => item.id === entry.groupedIntoId);
        return groupEntry?.orderId ? allOrders.find(order => order.id === groupEntry.orderId) || null : null;
      }
      return null;
    }

    function getFinanceDocuments() {
      return [];
    }

    function openFinanceEntryFromDocuments(entryId) {
      showToast('A aba Documentos está desativada.');
    }

    window.openFinanceEntryFromDocuments = openFinanceEntryFromDocuments;

    function renderDocuments() {
      return;
    }

    function printMonthlyVehicleCostDashboard() {
      const monthKey = document.getElementById('home-monthly-cost-filter')?.value || getCurrentMonthKey();
      const rows = getVehicleMonthlyCosts(monthKey);
      const maxValue = Math.max(...rows.map(item => item.total), 0);
      const printWindow = window.open('', '_blank', 'width=1080,height=900');
      if (!printWindow) {
        showToast('Não foi possível abrir a impressão do dashboard.');
        return;
      }

      const barsHtml = rows.map(({ vehicle, total }) => {
        const percent = maxValue > 0 ? Math.max((total / maxValue) * 100, total > 0 ? 10 : 3) : 3;
        return `
          <div class="bar-item">
            <div class="bar-value">${escapeHtml(formatCurrency(total))}</div>
            <div class="bar-track">
              <div class="bar-fill" style="height:${percent.toFixed(2)}%;"></div>
            </div>
            <div class="bar-label">
              <strong>${escapeHtml(vehicle.numeroFrota || '-')}</strong>
              <span>${escapeHtml(vehicle.placa || '-')}</span>
            </div>
          </div>
        `;
      }).join('');

      printWindow.document.open();
      printWindow.document.write(`
        <!doctype html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Custo por mês por veículo</title>
          <style>
            * {
              box-sizing: border-box;
              font-family: Arial, Helvetica, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color-adjust: exact;
              -moz-print-color-adjust: exact;
            }
            body { margin: 24px; color: #0f172a; }
            .head { display:flex; align-items:center; justify-content:space-between; gap:18px; margin-bottom:24px; }
            .logo { max-width:${getReportLogoStyle().width}px; max-height:${getReportLogoStyle().height}px; object-fit:contain; }
            h1 { margin:0; font-size:26px; }
            p { margin:6px 0 0; color:#64748b; }
            .chart { display:grid; grid-template-columns:repeat(9, minmax(74px, 1fr)); align-items:end; gap:14px; min-height:360px; border:1px solid #dbe3ef; border-radius:22px; padding:22px 18px 16px; }
            .bar-item { height:310px; display:grid; grid-template-rows:auto 1fr auto; gap:10px; text-align:center; }
            .bar-value { font-size:12px; font-weight:800; white-space:nowrap; }
            .bar-track { display:flex; align-items:flex-end; min-height:220px; border:1px solid #dbe3ef; border-radius:18px; overflow:hidden; background:#f3f6fb; }
            .bar-fill { width:100%; min-height:8px; background:linear-gradient(180deg, #7c6df2 0%, #3b82f6 100%); border-radius:16px 16px 0 0; }
            .bar-label { font-size:11px; color:#64748b; line-height:1.3; }
            .bar-label strong, .bar-label span { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            .bar-label strong { color:#0f172a; }
            .empty { border:1px dashed #cbd5e1; border-radius:18px; padding:28px; color:#64748b; text-align:center; }
            @media print {
              body { margin: 18mm; }
              .chart { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="head">
            <div>
              <h1>Custo por mês por veículo</h1>
              <p>Valores de ${escapeHtml(getMonthLabel(monthKey))}.</p>
            </div>
            <img class="logo" src="${getActiveLogoSrc()}" alt="WeFrotas">
          </div>
          ${rows.length ? `<div class="chart">${barsHtml}</div>` : '<div class="empty">Nenhum veículo cadastrado para exibir.</div>'}
          <script>
            window.onload = function () {
              setTimeout(function () {
                window.print();
                window.close();
              }, 180);
            };
          <\/script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }

    function printReport() {
      const filters = getReportFilters();
      const reportData = buildReportData(filters);
      const printWindow = window.open('', '_blank', 'width=1080,height=1200');
      if (!printWindow) {
        showToast('Não foi possível abrir a impressão do relatório.');
        return;
      }

      const summaryHtml = reportData.summary.map(item => `
        <div style="border:1px solid #dbe3ef; border-radius:16px; padding:14px 16px;">
          <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:#64748b;">${escapeHtml(item.label)}</div>
          <div style="font-size:24px; font-weight:800; color:#172554; margin-top:6px;">${escapeHtml(item.value)}</div>
          <div style="font-size:11px; color:#64748b; margin-top:6px; line-height:1.5;">${escapeHtml(item.help)}</div>
        </div>
      `).join('');
      const headerHtml = reportData.columns.map(column => `<th style="${column.numeric ? 'text-align:right;' : 'text-align:left;'}">${escapeHtml(column.label)}</th>`).join('');
      const rowsHtml = reportData.rows.map(row => `
        <tr>
          ${row.cells.map((cell, index) => `
            <td style="${reportData.columns[index]?.numeric || cell.numeric ? 'text-align:right;' : ''}">
              ${escapeHtml(cell.text || '-')}
              ${cell.note ? `<div style="font-size:11px; color:#64748b; margin-top:4px; line-height:1.5;">${escapeHtml(cell.note)}</div>` : ''}
            </td>
          `).join('')}
        </tr>
      `).join('') || `<tr><td colspan="${Math.max(reportData.columns.length, 1)}">${escapeHtml(reportData.emptyMessage)}</td></tr>`;

      printWindow.document.open();
      printWindow.document.write(`
        <!doctype html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>${reportData.title}</title>
          <style>
            * {
              box-sizing: border-box;
              font-family: Arial, Helvetica, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color-adjust: exact;
              -moz-print-color-adjust: exact;
            }
            body { margin: 24px; color: #111; }
            h1, h2 { margin: 0 0 12px; }
            p { margin: 0 0 20px; color: #444; }
            .report-head { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 22px; }
            .report-logo { max-width: ${getReportLogoStyle().width}px; max-height: ${getReportLogoStyle().height}px; object-fit: contain; }
            .summary-grid { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:14px; margin-bottom: 22px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 28px; border: 1px solid #000; empty-cells: show; }
            th, td { border: 1px solid #000; padding: 8px 10px; font-size: 12px; }
            th { text-transform: uppercase; background: #f4f4f4 !important; }
            @media print {
              table, th, td {
                border-color: #000 !important;
                border-style: solid !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                -moz-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              th, td { border-width: 1pt !important; }
              table { border-width: 1pt !important; }
            }
          </style>
        </head>
        <body>
          <div class="report-head">
            <img class="report-logo" src="${getActiveLogoSrc()}" alt="WeFrotas">
            <h1>${reportData.title}</h1>
          </div>
          <p>${escapeHtml(reportData.meta)}</p>
          ${reportData.summary.length ? `<div class="summary-grid">${summaryHtml}</div>` : ''}
          <table>
            <thead>
              <tr>${headerHtml}</tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <script>
            window.onload = function () {
              setTimeout(function () {
                window.print();
                window.close();
              }, 180);
            };
          <\/script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }

    function pruneSelections() {
      const vehicleIds = new Set(allVehicles.map(vehicle => vehicle.id));
      const driverIds = new Set(allDrivers.map(driver => driver.id));
      const supplierIds = new Set(allSuppliers.map(supplier => supplier.id));
      const orderIds = new Set(allOrders.map(order => order.id));
      const financeIds = new Set(allFinanceEntries.map(entry => entry.id));
      selectedVehicles = new Set(Array.from(selectedVehicles).filter(id => vehicleIds.has(id)));
      selectedDrivers = new Set(Array.from(selectedDrivers).filter(id => driverIds.has(id)));
      selectedSuppliers = new Set(Array.from(selectedSuppliers).filter(id => supplierIds.has(id)));
      selectedOrders = new Set(Array.from(selectedOrders).filter(id => orderIds.has(id)));
      selectedFinance = new Set(Array.from(selectedFinance).filter(id => financeIds.has(id)));
    }

    function setActionButtonState(button, enabled, activeTitle, blockedTitle) {
      if (!button) return;
      const safeActiveTitle = activeTitle || button.dataset.activeTitle || button.title || 'Ação';
      button.dataset.activeTitle = safeActiveTitle;
      button.classList.toggle('is-action-disabled', !enabled);
      button.setAttribute('aria-disabled', enabled ? 'false' : 'true');
      button.title = enabled ? safeActiveTitle : (blockedTitle || safeActiveTitle);
    }

    function blockDisabledActionClicks(event) {
      const blockedButton = event.target.closest?.('[aria-disabled="true"], .is-action-disabled');
      if (!blockedButton) return;
      event.preventDefault();
      event.stopPropagation();
      if (blockedButton.title) showToast(blockedButton.title);
    }

    function updateButtonState(editId, deleteId, count, labels = {}) {
      const editButton = document.getElementById(editId);
      const deleteButton = document.getElementById(deleteId);
      const editLabel = labels.edit || editButton?.dataset.activeTitle || editButton?.title || 'Editar';
      const deleteLabel = labels.delete || deleteButton?.dataset.activeTitle || deleteButton?.title || 'Excluir';
      const itemLabel = labels.item || 'item';
      const canEdit = labels.requiresSingle === false ? count > 0 : count === 1;
      const editBlockedTitle = count === 0
        ? `${editLabel}: selecione 1 ${itemLabel}.`
        : `${editLabel}: selecione apenas 1 ${itemLabel}.`;
      const deleteBlockedTitle = `${deleteLabel}: selecione pelo menos 1 ${itemLabel}.`;

      setActionButtonState(editButton, canEdit, editLabel, editBlockedTitle);
      setActionButtonState(deleteButton, count > 0, deleteLabel, deleteBlockedTitle);
    }

    function updateVehicleSelectionUI() {
      pruneSelections();
      const count = selectedVehicles.size;
      const visibleVehicles = getVisibleVehicles();
      document.getElementById('vehicles-selected-text').textContent = `${count} selecionado${count === 1 ? '' : 's'}`;
      document.getElementById('select-all-vehicles').classList.toggle('checked', visibleVehicles.length > 0 && visibleVehicles.every(vehicle => selectedVehicles.has(vehicle.id)));
      updateButtonState('edit-vehicle-btn', 'delete-vehicle-btn', count, {
        edit: 'Editar veículo',
        delete: 'Excluir veículo(s)',
        item: 'veículo'
      });
    }

    function updateDriverSelectionUI() {
      pruneSelections();
      const count = selectedDrivers.size;
      const visibleDrivers = getVisibleDrivers();
      document.getElementById('drivers-selected-text').textContent = `${count} selecionado${count === 1 ? '' : 's'}`;
      document.getElementById('select-all-drivers').classList.toggle('checked', visibleDrivers.length > 0 && visibleDrivers.every(driver => selectedDrivers.has(driver.id)));
      updateButtonState('edit-driver-btn', 'delete-driver-btn', count, {
        edit: 'Editar motorista',
        delete: 'Excluir motorista(s)',
        item: 'motorista'
      });
    }

    function updateSupplierSelectionUI() {
      pruneSelections();
      const count = selectedSuppliers.size;
      const visibleSuppliers = getVisibleSuppliers();
      document.getElementById('suppliers-selected-text').textContent = `${count} selecionado${count === 1 ? '' : 's'}`;
      document.getElementById('select-all-suppliers').classList.toggle('checked', visibleSuppliers.length > 0 && visibleSuppliers.every(supplier => selectedSuppliers.has(supplier.id)));
      updateButtonState('edit-supplier-btn', 'delete-supplier-btn', count, {
        edit: 'Editar fornecedor',
        delete: 'Excluir fornecedor(es)',
        item: 'fornecedor'
      });
    }

    function updateOrderSelectionUI() {
      pruneSelections();
      const count = selectedOrders.size;
      const visibleOrders = getFilteredOrders();
      const selectedOrderRecords = Array.from(selectedOrders)
        .map(id => allOrders.find(order => order.id === id))
        .filter(Boolean);
      const canClose = selectedOrderRecords.length > 0 && selectedOrderRecords.some(order => order.status !== 'fechada');
      const canReopen = selectedOrderRecords.length > 0 && selectedOrderRecords.some(order => order.status === 'fechada');
      document.getElementById('orders-selected-text').textContent = `${count} selecionado${count === 1 ? '' : 's'}`;
      document.getElementById('select-all-orders').classList.toggle('checked', visibleOrders.length > 0 && visibleOrders.every(order => selectedOrders.has(order.id)));
      updateButtonState('edit-order-btn', 'delete-order-btn', count, {
        edit: 'Editar OS',
        delete: 'Excluir OS',
        item: 'OS'
      });
      const printButton = document.getElementById('print-order-btn');
      const viewButton = document.getElementById('view-order-btn');
      const closeButton = document.getElementById('close-order-btn');
      const reopenButton = document.getElementById('reopen-order-btn');
      setActionButtonState(
        viewButton,
        count === 1,
        'Visualizar OS',
        count === 0 ? 'Visualizar OS: selecione 1 OS.' : 'Visualizar OS: selecione apenas 1 OS.'
      );
      setActionButtonState(
        printButton,
        count > 0,
        count > 1 ? 'Imprimir OS em lote' : 'Imprimir OS',
        'Imprimir OS: selecione ao menos 1 OS.'
      );
      setActionButtonState(
        closeButton,
        canClose,
        'Fechar OS',
        count === 0 ? 'Fechar OS: selecione uma OS aberta.' : 'Fechar OS: selecione ao menos uma OS que ainda esteja aberta.'
      );
      setActionButtonState(
        reopenButton,
        canReopen,
        'Reabrir OS',
        count === 0 ? 'Reabrir OS: selecione uma OS fechada.' : 'Reabrir OS: selecione ao menos uma OS fechada.'
      );
    }

    function getFinanceBlockedTooltip(action, entries) {
      const count = entries.length;
      const firstEntry = entries[0];
      const selectedLabel = count === 1 ? 'lançamento selecionado' : 'lançamentos selecionados';

      if (!count) {
        const emptyMessages = {
          group: 'Agrupar lançamentos: selecione pelo menos 2 abastecimentos do mesmo veículo ou despesas do mesmo fornecedor.',
          ungroup: 'Desfazer agrupamento: selecione 1 agrupamento.',
          close: 'Fechar despesa: selecione 1 lançamento pendente.',
          edit: 'Editar lançamento: selecione 1 lançamento.',
          delete: 'Excluir lançamento: selecione pelo menos 1 lançamento.',
          reverse: 'Estornar despesa: selecione uma despesa fechada ou distribuída.'
        };
        return emptyMessages[action] || 'Ação indisponível: selecione um lançamento.';
      }

      if (action === 'group') {
        if (count < 2) return 'Agrupar lançamentos: selecione pelo menos 2 lançamentos.';
        if (entries.some(entry => entry.groupedIntoId || isFinanceEntryLockedForEditing(entry))) {
          return 'Agrupar lançamentos: use apenas lançamentos pendentes e sem agrupamento.';
        }
        const hasOnlyFuel = entries.every(entry => isFuelEntry(entry));
        const hasOnlyExpenses = entries.every(entry => isRegularExpenseEntry(entry));
        if (!hasOnlyFuel && !hasOnlyExpenses) return 'Agrupar lançamentos: não misture abastecimentos com despesas.';
        if (!getFinanceGroupingMode(entries)) {
          return hasOnlyFuel
            ? 'Agrupar abastecimentos: selecione abastecimentos do mesmo veículo.'
            : 'Agrupar despesas: selecione despesas do mesmo fornecedor.';
        }
      }

      if (action === 'ungroup') {
        if (count !== 1) return 'Desfazer agrupamento: selecione apenas 1 agrupamento.';
        if (!isFinanceGroupEntry(firstEntry)) return 'Desfazer agrupamento: selecione um agrupamento.';
        if (isFinanceEntryLinkedToClosedOrder(firstEntry)) return 'Desfazer agrupamento: reabra a OS antes de alterar essa despesa.';
        if (isFinanceEntryLockedForEditing(firstEntry)) return 'Desfazer agrupamento: faça o estorno antes.';
      }

      if (action === 'close') {
        if (count !== 1) return 'Fechar despesa: selecione apenas 1 lançamento.';
        if (getFinanceEntryStatus(firstEntry) === 'agrupado') {
          return 'Fechar despesa: esse abastecimento faz parte de um agrupamento.';
        }
        if (isFinanceEntryLinkedToClosedOrder(firstEntry)) {
          return 'Fechar despesa: a OS vinculada já está fechada.';
        }
        if (isFinanceEntryLockedForEditing(firstEntry)) {
          return 'Fechar despesa: despesa já fechada. Faça o estorno se precisar alterar.';
        }
      }

      if (action === 'edit') {
        if (count !== 1) return `Editar lançamento: selecione apenas 1 lançamento. Há ${count} ${selectedLabel}.`;
        if (firstEntry.groupedIntoId) return 'Editar lançamento: desfaça o agrupamento antes.';
        if (isFinanceEntryLinkedToClosedOrder(firstEntry)) return 'Editar lançamento: reabra a OS antes de alterar essa despesa.';
        if (isFinanceEntryLockedForEditing(firstEntry)) return 'Editar lançamento: faça o estorno antes.';
      }

      if (action === 'delete') {
        if (entries.some(entry => entry.groupedIntoId || isFinanceGroupEntry(entry))) {
          return 'Excluir lançamento: desfaça o agrupamento antes.';
        }
        if (entries.some(entry => isFinanceEntryLinkedToClosedOrder(entry))) {
          return 'Excluir lançamento: reabra a OS antes de alterar essa despesa.';
        }
      }

      if (action === 'reverse') {
        if (entries.some(entry => isFinanceEntryLinkedToClosedOrder(entry))) {
          return 'Estornar despesa: reabra a OS antes de estornar essa despesa.';
        }
        if (!entries.every(entry => canReverseFinanceEntry(entry))) {
          return 'Estornar despesa: selecione apenas despesas fechadas ou distribuídas.';
        }
      }

      return 'Ação indisponível para a seleção atual.';
    }

    function updateFinanceSelectionUI() {
      pruneSelections();
      const visibleEntries = getVisibleFinanceEntries();
      const visibleIds = new Set(visibleEntries.map(entry => entry.id));
      selectedFinance = new Set(Array.from(selectedFinance).filter(id => visibleIds.has(id)));
      const count = selectedFinance.size;
      const selectedEntries = Array.from(selectedFinance)
        .map(id => allFinanceEntries.find(entry => entry.id === id))
        .filter(Boolean);
      const selectedTotal = selectedEntries.reduce((sum, entry) => sum + getFinanceTotal(entry), 0);
      document.getElementById('finance-selected-text').textContent = count
        ? `${count} selecionado${count === 1 ? '' : 's'} | Total ${formatCurrency(selectedTotal)}`
        : '0 selecionados';
      document.getElementById('select-all-finance').classList.toggle('checked', visibleEntries.length > 0 && visibleEntries.every(entry => selectedFinance.has(entry.id)));
      updateButtonState('edit-finance-btn', 'delete-finance-btn', count, {
        edit: 'Editar lançamento',
        delete: 'Excluir lançamento',
        item: 'lançamento'
      });

      const groupButton = document.getElementById('group-finance-btn');
      const ungroupButton = document.getElementById('ungroup-finance-btn');
      const closeExpenseButton = document.getElementById('close-finance-expense-btn');
      const editButton = document.getElementById('edit-finance-btn');
      const deleteButton = document.getElementById('delete-finance-btn');
      const reverseButton = document.getElementById('reverse-finance-btn');
      const canGroup = !!getFinanceGroupingMode(selectedEntries);
      const canUngroup = selectedEntries.length === 1 && isFinanceGroupEntry(selectedEntries[0]);
      const canCloseExpense = selectedEntries.length === 1
        && getFinanceEntryStatus(selectedEntries[0]) !== 'agrupado'
        && !isFinanceEntryLockedForEditing(selectedEntries[0]);
      const canEdit = selectedEntries.length === 1 && !isFinanceEntryLockedForEditing(selectedEntries[0]);
      const canDelete = count > 0 && selectedEntries.every(entry =>
        !entry.groupedIntoId
        && !isFinanceGroupEntry(entry)
        && !isFinanceEntryLinkedToClosedOrder(entry)
      );
      const canReverse = selectedEntries.length >= 1 && selectedEntries.every(entry => canReverseFinanceEntry(entry));

      setActionButtonState(groupButton, canGroup, 'Agrupar lançamentos', getFinanceBlockedTooltip('group', selectedEntries));
      setActionButtonState(ungroupButton, canUngroup, 'Desfazer agrupamento', getFinanceBlockedTooltip('ungroup', selectedEntries));
      setActionButtonState(closeExpenseButton, canCloseExpense, 'Fechar despesa', getFinanceBlockedTooltip('close', selectedEntries));
      setActionButtonState(editButton, canEdit, 'Editar lançamento', getFinanceBlockedTooltip('edit', selectedEntries));
      setActionButtonState(deleteButton, canDelete, 'Excluir lançamento', getFinanceBlockedTooltip('delete', selectedEntries));
      setActionButtonState(reverseButton, canReverse, 'Estornar despesa', getFinanceBlockedTooltip('reverse', selectedEntries));
    }

    function toggleVehicleSelection(event, id) {
      if (event) event.stopPropagation();
      if (selectedVehicles.has(id)) selectedVehicles.delete(id);
      else selectedVehicles.add(id);
      renderVehicles();
    }

    function handleVehicleRowSelectionKey(event, id) {
      if (!['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      toggleVehicleSelection(event, id);
    }

    function toggleDriverSelection(event, id) {
      if (event) event.stopPropagation();
      if (selectedDrivers.has(id)) selectedDrivers.delete(id);
      else selectedDrivers.add(id);
      renderDrivers();
    }

    function handleDriverRowSelectionKey(event, id) {
      if (!['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      toggleDriverSelection(event, id);
    }

    function toggleSupplierSelection(event, id) {
      if (event) event.stopPropagation();
      if (selectedSuppliers.has(id)) selectedSuppliers.delete(id);
      else selectedSuppliers.add(id);
      renderSuppliers();
    }

    function handleSupplierRowSelectionKey(event, id) {
      if (!['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      toggleSupplierSelection(event, id);
    }

    function toggleOrderSelection(event, id) {
      if (event) event.stopPropagation();
      if (selectedOrders.has(id)) selectedOrders.delete(id);
      else selectedOrders.add(id);
      renderOrders();
    }

    function handleOrderRowSelectionKey(event, id) {
      if (!['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      toggleOrderSelection(event, id);
    }

    function toggleFinanceSelection(event, id) {
      if (event) event.stopPropagation();
      if (selectedFinance.has(id)) selectedFinance.delete(id);
      else selectedFinance.add(id);
      renderFinance();
    }

    function handleFinanceRowSelectionKey(event, id) {
      if (!['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      toggleFinanceSelection(event, id);
    }

    function toggleSelectAllVehicles(event) {
      if (event) event.stopPropagation();
      const visibleVehicles = getVisibleVehicles();
      const allVisibleSelected = visibleVehicles.length > 0 && visibleVehicles.every(vehicle => selectedVehicles.has(vehicle.id));
      if (allVisibleSelected) visibleVehicles.forEach(vehicle => selectedVehicles.delete(vehicle.id));
      else visibleVehicles.forEach(vehicle => selectedVehicles.add(vehicle.id));
      renderVehicles();
    }

    function toggleSelectAllDrivers(event) {
      if (event) event.stopPropagation();
      const visibleDrivers = getVisibleDrivers();
      const allVisibleSelected = visibleDrivers.length > 0 && visibleDrivers.every(driver => selectedDrivers.has(driver.id));
      if (allVisibleSelected) visibleDrivers.forEach(driver => selectedDrivers.delete(driver.id));
      else visibleDrivers.forEach(driver => selectedDrivers.add(driver.id));
      renderDrivers();
    }

    function toggleSelectAllSuppliers(event) {
      if (event) event.stopPropagation();
      const visibleSuppliers = getVisibleSuppliers();
      const allVisibleSelected = visibleSuppliers.length > 0 && visibleSuppliers.every(supplier => selectedSuppliers.has(supplier.id));
      if (allVisibleSelected) visibleSuppliers.forEach(supplier => selectedSuppliers.delete(supplier.id));
      else visibleSuppliers.forEach(supplier => selectedSuppliers.add(supplier.id));
      renderSuppliers();
    }

    function toggleSelectAllOrders(event) {
      if (event) event.stopPropagation();
      const visibleOrders = getFilteredOrders();
      const allVisibleSelected = visibleOrders.length > 0 && visibleOrders.every(order => selectedOrders.has(order.id));
      if (allVisibleSelected) visibleOrders.forEach(order => selectedOrders.delete(order.id));
      else visibleOrders.forEach(order => selectedOrders.add(order.id));
      renderOrders();
    }

    function toggleSelectAllFinance(event) {
      if (event) event.stopPropagation();
      const visibleEntries = getVisibleFinanceEntries();
      const allVisibleSelected = visibleEntries.length > 0 && visibleEntries.every(entry => selectedFinance.has(entry.id));
      if (allVisibleSelected) visibleEntries.forEach(entry => selectedFinance.delete(entry.id));
      else visibleEntries.forEach(entry => selectedFinance.add(entry.id));
      renderFinance();
    }

    function compareSortableValues(aValue, bValue) {
      if (typeof aValue === 'number' || typeof bValue === 'number') {
        return Number(aValue || 0) - Number(bValue || 0);
      }
      return String(aValue || '').localeCompare(String(bValue || ''), 'pt-BR', { numeric: true, sensitivity: 'base' });
    }

    function sortByState(items, state, valueGetter) {
      const direction = state.direction === 'asc' ? 1 : -1;
      return items
        .map((item, index) => ({ item, index }))
        .sort((a, b) => {
          const compare = compareSortableValues(valueGetter(a.item, state.key), valueGetter(b.item, state.key));
          return compare !== 0 ? compare * direction : a.index - b.index;
        })
        .map(({ item }) => item);
    }

    function getVehicleSortValue(vehicle, key) {
      switch (key) {
        case 'plate': return normalizeComparableText(vehicle.placa || '');
        case 'model': return normalizeComparableText(vehicle.modelo || '');
        case 'fleet': return getNumericOrderValue(vehicle.numeroFrota);
        case 'details': return normalizeComparableText([vehicle.seguroVencimento, vehicle.chassi, vehicle.cor].join(' '));
        case 'status': return 'ativo';
        case 'km': return getVehicleCurrentKm(vehicle.id) ?? -1;
        case 'cost': return getVehicleDistributedCostTotal(vehicle.id);
        default: return normalizeComparableText(vehicle.placa || '');
      }
    }

    function getDriverSortValue(driver, key) {
      switch (key) {
        case 'name': return normalizeComparableText(driver.nome || '');
        case 'category': return normalizeComparableText(driver.categoria || '');
        case 'cpf': return normalizeComparableText(driver.cpf || '');
        case 'cnh': return normalizeComparableText(driver.cnh || '');
        case 'contact': return normalizeComparableText([driver.telefone, driver.validade].join(' '));
        case 'status': return 'ativo';
        default: return normalizeComparableText(driver.nome || '');
      }
    }

    function getSupplierSortValue(supplier, key) {
      switch (key) {
        case 'name': return normalizeComparableText(supplier.nome || '');
        case 'type': return normalizeComparableText(supplier.tipoLabel || supplier.tipo || '');
        case 'document': return normalizeComparableText(supplier.documento || '');
        case 'contact': return normalizeComparableText([supplier.telefone, supplier.email].join(' '));
        case 'notes': return normalizeComparableText(supplier.observacoes || '');
        case 'status': return 'ativo';
        default: return normalizeComparableText(supplier.nome || '');
      }
    }

    function updateSimpleSortIndicators(attributeName, currentState) {
      document.querySelectorAll(`[${attributeName}]`).forEach((node) => {
        const key = node.getAttribute(attributeName);
        node.textContent = currentState.key === key
          ? (currentState.direction === 'asc' ? '↑' : '↓')
          : '';
        node.closest('.finance-sort-head')?.classList.toggle('active', currentState.key === key);
      });
    }

    function toggleVehicleSort(key) {
      vehicleSortState = vehicleSortState.key === key
        ? { key, direction: vehicleSortState.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: ['fleet', 'km', 'cost'].includes(key) ? 'desc' : 'asc' };
      renderVehicles();
    }

    function toggleDriverSort(key) {
      driverSortState = driverSortState.key === key
        ? { key, direction: driverSortState.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' };
      renderDrivers();
    }

    function toggleSupplierSort(key) {
      supplierSortState = supplierSortState.key === key
        ? { key, direction: supplierSortState.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' };
      renderSuppliers();
    }

    window.toggleVehicleSort = toggleVehicleSort;
    window.toggleDriverSort = toggleDriverSort;
    window.toggleSupplierSort = toggleSupplierSort;

    function getVisibleVehicles() {
      const quickSearch = normalizeSearchText(document.getElementById('vehicle-filter-search')?.value || '');

      const items = [...allVehicles]
        .filter(vehicle => {
          if (!quickSearch) return true;
          const haystack = normalizeSearchText([
            vehicle.numeroFrota,
            vehicle.placa,
            vehicle.modelo,
            vehicle.ano,
            vehicle.cor,
            vehicle.chassi
          ].join(' '));
          return haystack.includes(quickSearch);
        });
      return sortByState(items, vehicleSortState, getVehicleSortValue);
    }

    function getVisibleDrivers() {
      const quickSearch = normalizeComparableText(document.getElementById('driver-filter-search')?.value || '');
      const validityFilter = document.getElementById('driver-filter-validity')?.value || '';

      const items = [...allDrivers]
        .filter(driver => !validityFilter || String(driver.validade || '') === validityFilter)
        .filter(driver => {
          if (!quickSearch) return true;
          const haystack = normalizeComparableText([
            driver.nome,
            driver.cpf,
            driver.cnh,
            driver.telefone,
            driver.categoria
          ].join(' '));
          return haystack.includes(quickSearch);
        });
      return sortByState(items, driverSortState, getDriverSortValue);
    }

    function getVisibleSuppliers() {
      const quickSearch = normalizeComparableText(document.getElementById('supplier-filter-search')?.value || '');
      const typeFilter = document.getElementById('supplier-filter-type')?.value || '';

      const items = [...allSuppliers]
        .filter(supplier => !typeFilter || supplier.tipo === typeFilter)
        .filter(supplier => {
          if (!quickSearch) return true;
          const haystack = normalizeComparableText([
            supplier.nome,
            supplier.tipoLabel,
            supplier.documento,
            supplier.telefone,
            supplier.email,
            supplier.observacoes
          ].join(' '));
          return haystack.includes(quickSearch);
        });
      return sortByState(items, supplierSortState, getSupplierSortValue);
    }

    function hasActiveVehicleFilters() {
      return ['vehicle-filter-search']
        .some((id) => String(document.getElementById(id)?.value || '').trim() !== '');
    }

    function hasActiveDriverFilters() {
      return ['driver-filter-search', 'driver-filter-validity']
        .some((id) => String(document.getElementById(id)?.value || '').trim() !== '');
    }

    function hasActiveSupplierFilters() {
      return ['supplier-filter-search', 'supplier-filter-type']
        .some((id) => String(document.getElementById(id)?.value || '').trim() !== '');
    }

    function renderVehicles() {
      const list = document.getElementById('vehicles-list');
      if (!list) return;
      const visibleVehicles = getVisibleVehicles();
      if (!visibleVehicles.length) {
        list.innerHTML = `<div class="empty-state">${hasActiveVehicleFilters() ? 'Nenhum veículo encontrado com os filtros aplicados.' : 'Nenhum veículo cadastrado. Clique no botão + para começar.'}</div>`;
        selectedVehicles = new Set(Array.from(selectedVehicles).filter(id => allVehicles.some(vehicle => vehicle.id === id)));
        updateEntityListViewport('vehicles-list-shell', 0);
        updateSimpleSortIndicators('data-vehicle-sort-indicator', vehicleSortState);
        updateVehicleSelectionUI();
        return;
      }
      list.innerHTML = visibleVehicles.map(vehicle => {
        const currentKm = getVehicleCurrentKm(vehicle.id);
        const totalCost = getVehicleDistributedCostTotal(vehicle.id);
        return `
        <div class="orders-table-row entity-table-row--vehicles ${selectedVehicles.has(vehicle.id) ? 'selected' : ''}" role="button" tabindex="0" onclick="toggleVehicleSelection(event, '${vehicle.id}')" onkeydown="handleVehicleRowSelectionKey(event, '${vehicle.id}')">
            <div class="orders-table-cell orders-table-cell--check">
              <button class="selection-check ${selectedVehicles.has(vehicle.id) ? 'checked' : ''}" onclick="toggleVehicleSelection(event, '${vehicle.id}')">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 12l4 4 10-10"/>
                </svg>
              </button>
            </div>
            <div class="orders-table-cell">
              <div class="orders-main-text orders-os-number">${escapeHtml(vehicle.placa || '-')}</div>
              <div class="orders-sub-text">${escapeHtml(vehicle.chassi || 'Sem chassi')}</div>
            </div>
            <div class="orders-table-cell">
              <div class="orders-main-text orders-main-text--wrap">${escapeHtml(vehicle.modelo || 'Veículo')}</div>
              <div class="orders-sub-text">${vehicle.cor ? escapeHtml(vehicle.cor) : 'Cor não informada'}</div>
            </div>
            <div class="orders-table-cell">
              <div class="orders-main-text">Frota ${escapeHtml(vehicle.numeroFrota || '-')}</div>
              <div class="orders-sub-text">Ano ${escapeHtml(vehicle.ano || '-')}</div>
            </div>
            <div class="orders-table-cell">
              <div class="orders-main-text orders-main-text--wrap">${vehicle.seguroVencimento ? `Seguro ${escapeHtml(formatDate(vehicle.seguroVencimento))}` : 'Seguro não informado'}</div>
              <div class="orders-sub-text orders-sub-text--wrap">${escapeHtml(vehicle.chassi || '-')}</div>
            </div>
            <div class="orders-table-cell">
              <span class="mini-badge">Veículo ativo</span>
            </div>
            <div class="orders-table-cell vehicle-km-cell">
              <div class="orders-main-text">${currentKm === null ? '-' : `${currentKm.toLocaleString('pt-BR')} km`}</div>
            </div>
            <div class="orders-table-cell vehicle-cost-cell">
              <span class="orders-value-text">${escapeHtml(formatCurrency(totalCost))}</span>
            </div>
        </div>
      `;
      }).join('');
      updateEntityListViewport('vehicles-list-shell', visibleVehicles.length);
      updateSimpleSortIndicators('data-vehicle-sort-indicator', vehicleSortState);
      updateVehicleSelectionUI();
    }

    function renderDrivers() {
      const list = document.getElementById('drivers-list');
      if (!list) return;
      const visibleDrivers = getVisibleDrivers();
      if (!visibleDrivers.length) {
        list.innerHTML = `<div class="empty-state">${hasActiveDriverFilters() ? 'Nenhum motorista encontrado com os filtros aplicados.' : 'Nenhum motorista cadastrado. Clique no botão + para começar.'}</div>`;
        selectedDrivers = new Set(Array.from(selectedDrivers).filter(id => allDrivers.some(driver => driver.id === id)));
        updateEntityListViewport('drivers-list-shell', 0);
        updateSimpleSortIndicators('data-driver-sort-indicator', driverSortState);
        updateDriverSelectionUI();
        return;
      }
      list.innerHTML = visibleDrivers.map(driver => {
        const linkedVehicles = getDriverVehicleIds(driver)
          .map(vehicleId => allVehicles.find(vehicle => vehicle.id === vehicleId))
          .filter(Boolean)
          .map(vehicle => `${vehicle.numeroFrota || '-'} ${vehicle.placa || '-'}`);
        const vehicleSummary = linkedVehicles.length
          ? `Veículos: ${linkedVehicles.slice(0, 2).join(', ')}${linkedVehicles.length > 2 ? ` +${linkedVehicles.length - 2}` : ''}`
          : 'Sem veículo vinculado';
        return `
        <div class="orders-table-row entity-table-row--drivers ${selectedDrivers.has(driver.id) ? 'selected' : ''}" role="button" tabindex="0" onclick="toggleDriverSelection(event, '${driver.id}')" onkeydown="handleDriverRowSelectionKey(event, '${driver.id}')">
            <div class="orders-table-cell orders-table-cell--check">
              <button class="selection-check ${selectedDrivers.has(driver.id) ? 'checked' : ''}" onclick="toggleDriverSelection(event, '${driver.id}')">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 12l4 4 10-10"/>
                </svg>
              </button>
            </div>
            <div class="orders-table-cell">
              <div class="orders-main-text orders-main-text--wrap">${escapeHtml(driver.nome || '-')}</div>
              <div class="orders-sub-text orders-sub-text--wrap">${driver.telefone ? escapeHtml(driver.telefone) : 'Sem telefone'}</div>
            </div>
            <div class="orders-table-cell">
              <span class="mini-badge">Categoria ${escapeHtml(driver.categoria || '-')}</span>
            </div>
            <div class="orders-table-cell">
              <div class="orders-main-text">${escapeHtml(driver.cpf || '-')}</div>
            </div>
            <div class="orders-table-cell">
              <div class="orders-main-text">${escapeHtml(driver.cnh || '-')}</div>
              <div class="orders-sub-text">${driver.validade ? `Validade ${escapeHtml(formatDate(driver.validade))}` : 'Sem validade'}</div>
            </div>
            <div class="orders-table-cell">
              <div class="orders-main-text orders-main-text--wrap">${driver.telefone ? escapeHtml(driver.telefone) : '-'}</div>
              <div class="orders-sub-text orders-sub-text--wrap">${driver.validade ? escapeHtml(formatDate(driver.validade)) : 'Validade não informada'}</div>
            </div>
            <div class="orders-table-cell">
              <span class="mini-badge">Motorista ativo</span>
              <div class="orders-sub-text orders-sub-text--wrap mt-1">${escapeHtml(vehicleSummary)}</div>
            </div>
        </div>
      `;
      }).join('');
      updateEntityListViewport('drivers-list-shell', visibleDrivers.length);
      updateSimpleSortIndicators('data-driver-sort-indicator', driverSortState);
      updateDriverSelectionUI();
    }

    function renderSuppliers() {
      const list = document.getElementById('suppliers-list');
      if (!list) return;
      const visibleSuppliers = getVisibleSuppliers();
      if (!visibleSuppliers.length) {
        list.innerHTML = `<div class="empty-state">${hasActiveSupplierFilters() ? 'Nenhum fornecedor encontrado com os filtros aplicados.' : 'Nenhum fornecedor cadastrado ainda.'}</div>`;
        selectedSuppliers = new Set(Array.from(selectedSuppliers).filter(id => allSuppliers.some(supplier => supplier.id === id)));
        updateEntityListViewport('suppliers-list-shell', 0);
        updateSimpleSortIndicators('data-supplier-sort-indicator', supplierSortState);
        updateSupplierSelectionUI();
        return;
      }
      list.innerHTML = visibleSuppliers.map(supplier => `
        <div class="orders-table-row entity-table-row--suppliers ${selectedSuppliers.has(supplier.id) ? 'selected' : ''}" role="button" tabindex="0" onclick="toggleSupplierSelection(event, '${supplier.id}')" onkeydown="handleSupplierRowSelectionKey(event, '${supplier.id}')">
            <div class="orders-table-cell orders-table-cell--check">
              <button class="selection-check ${selectedSuppliers.has(supplier.id) ? 'checked' : ''}" onclick="toggleSupplierSelection(event, '${supplier.id}')">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 12l4 4 10-10"/>
                </svg>
              </button>
            </div>
            <div class="orders-table-cell">
              <div class="orders-main-text orders-main-text--wrap">${escapeHtml(supplier.nome || '-')}</div>
              <div class="orders-sub-text orders-sub-text--wrap">${supplier.email ? escapeHtml(supplier.email) : 'Sem e-mail'}</div>
            </div>
            <div class="orders-table-cell">
              <span class="mini-badge">${escapeHtml(supplier.tipoLabel || 'Outro')}</span>
            </div>
            <div class="orders-table-cell">
              <div class="orders-main-text">${escapeHtml(supplier.documento || '-')}</div>
            </div>
            <div class="orders-table-cell">
              <div class="orders-main-text orders-main-text--wrap">${supplier.telefone ? escapeHtml(supplier.telefone) : '-'}</div>
              <div class="orders-sub-text orders-sub-text--wrap">${supplier.email ? escapeHtml(supplier.email) : 'Sem e-mail'}</div>
            </div>
            <div class="orders-table-cell">
              <div class="orders-main-text orders-main-text--wrap">${supplier.observacoes ? escapeHtml(supplier.observacoes) : '-'}</div>
            </div>
            <div class="orders-table-cell">
              <span class="mini-badge">Parceiro ativo</span>
            </div>
        </div>
      `).join('');
      updateEntityListViewport('suppliers-list-shell', visibleSuppliers.length);
      updateSimpleSortIndicators('data-supplier-sort-indicator', supplierSortState);
      updateSupplierSelectionUI();
    }

    function getFilteredOrders() {
      const quickSearch = normalizeSearchText(document.getElementById('order-filter-search')?.value || '');
      const start = document.getElementById('order-filter-start')?.value || '';
      const end = document.getElementById('order-filter-end')?.value || '';
      const status = document.getElementById('order-filter-status')?.value || '';
      const sort = document.getElementById('order-filter-sort')?.value || 'recentes';

      let items = [...allOrders];
      if (orderVehicleFilterId) items = items.filter(order => order.vehicleId === orderVehicleFilterId);
      if (start) items = items.filter(order => !order.dataInicio || order.dataInicio >= start);
      if (end) items = items.filter(order => !order.dataInicio || order.dataInicio <= end);
      if (status) items = items.filter(order => order.status === status);
      if (quickSearch) {
        items = items.filter(order => {
          const vehicle = allVehicles.find(item => item.id === order.vehicleId);
          const driver = allDrivers.find(item => item.id === order.driverId);
          const haystack = normalizeSearchText([
            order.numero,
            order.status,
            order.descricao,
            order.responsavelNome,
            driver?.nome,
            vehicle ? `${vehicle.numeroFrota || ''} ${vehicle.placa || ''} ${vehicle.modelo || ''} ${vehicle.chassi || ''}` : '',
            vehicle ? buildVehicleSearchValue(vehicle) : ''
          ].join(' '));
          return haystack.includes(quickSearch);
        });
      }
      return sortOrders(items, sort);
    }

    function getOrderSortValue(order, key) {
      const vehicle = allVehicles.find(item => item.id === order.vehicleId);
      const driver = allDrivers.find(item => item.id === order.driverId);
      switch (key) {
        case 'number':
          return getNumericOrderValue(order.numero);
        case 'vehicle':
          return normalizeComparableText(vehicle ? `${vehicle.numeroFrota || ''} ${vehicle.placa || ''} ${vehicle.modelo || ''}` : '');
        case 'driver':
          return normalizeComparableText(driver?.nome || order.responsavelNome || '');
        case 'start':
          return String(order.dataInicio || '');
        case 'end':
          return String(order.dataTermino || '');
        case 'status':
          return normalizeComparableText(order.status || '');
        case 'service':
          return normalizeComparableText(order.descricao || '');
        case 'value':
          return sumFinanceNetTotal(allFinanceEntries.filter(entry => entry.orderId === order.id));
        default:
          return '';
      }
    }

    function sortOrders(items, defaultSort = 'recentes') {
      const withPosition = items.map((order, index) => ({ order, index }));
      const direction = orderSortState.direction === 'asc' ? 1 : -1;
      withPosition.sort((a, b) => {
        if (orderSortState.key === 'default') {
          const numberCompare = getNumericOrderValue(a.order.numero) - getNumericOrderValue(b.order.numero);
          return defaultSort === 'antigas' ? numberCompare : -numberCompare;
        }
        const aValue = getOrderSortValue(a.order, orderSortState.key);
        const bValue = getOrderSortValue(b.order, orderSortState.key);
        let compare = 0;
        if (typeof aValue === 'number' || typeof bValue === 'number') {
          compare = Number(aValue || 0) - Number(bValue || 0);
        } else {
          compare = String(aValue || '').localeCompare(String(bValue || ''), 'pt-BR', { numeric: true, sensitivity: 'base' });
        }
        if (compare !== 0) return compare * direction;
        return getNumericOrderValue(b.order.numero) - getNumericOrderValue(a.order.numero) || a.index - b.index;
      });
      return withPosition.map(item => item.order);
    }

    function updateOrderSortIndicators() {
      document.querySelectorAll('[data-order-sort-indicator]').forEach((node) => {
        const key = node.getAttribute('data-order-sort-indicator');
        node.textContent = orderSortState.key === key
          ? (orderSortState.direction === 'asc' ? '↑' : '↓')
          : '';
      });
      document.querySelectorAll('.table-sort-head').forEach((button) => {
        const key = button.querySelector('[data-order-sort-indicator]')?.getAttribute('data-order-sort-indicator');
        button.classList.toggle('active', orderSortState.key === key);
      });
    }

    function toggleOrderSort(key) {
      if (orderSortState.key === key) {
        orderSortState.direction = orderSortState.direction === 'asc' ? 'desc' : 'asc';
      } else {
        orderSortState = { key, direction: ['number', 'start', 'end', 'value'].includes(key) ? 'desc' : 'asc' };
      }
      renderOrders();
    }

    window.toggleOrderSort = toggleOrderSort;

    function updateEntityListViewport(shellId, count) {
      const shell = document.getElementById(shellId);
      if (!shell) return;
      shell.classList.toggle('is-scrollable', count > 3);
    }

    function getOrderStatusUi(status) {
      switch (status) {
        case 'fechada':
          return { label: 'Concluída', className: 'order-status-badge status-done' };
        case 'andamento':
          return { label: 'Em andamento', className: 'order-status-badge status-progress' };
        case 'cancelada':
          return { label: 'Cancelada', className: 'order-status-badge status-cancelled' };
        default:
          return { label: 'Aberta', className: 'order-status-badge status-open' };
      }
    }

    function renderOrders() {
      const list = document.getElementById('orders-list');
      if (!list) return;
      const filteredOrders = getFilteredOrders();
      if (!filteredOrders.length) {
        list.innerHTML = '<div class="empty-state">Nenhuma ordem de serviço cadastrada.</div>';
        selectedOrders = new Set(Array.from(selectedOrders).filter(id => allOrders.some(order => order.id === id)));
        updateEntityListViewport('orders-list-shell', 0);
        updateOrderSortIndicators();
        updateOrderSelectionUI();
        return;
      }
      list.innerHTML = filteredOrders.map(order => {
        const vehicle = allVehicles.find(item => item.id === order.vehicleId);
        const driver = allDrivers.find(item => item.id === order.driverId);
        const financialItems = allFinanceEntries.filter(item => item.orderId === order.id);
        const totalFinance = sumFinanceNetTotal(financialItems);
        const statusUi = getOrderStatusUi(order.status);
        const vehicleLabel = vehicle ? `${vehicle.numeroFrota || ''} ${vehicle.placa || ''} ${vehicle.modelo || ''}`.trim() : '-';
        const vehicleSub = vehicle ? [vehicle.placa || '', vehicle.modelo || ''].filter(Boolean).join(' ') : '';
        const personName = driver ? driver.nome : order.responsavelNome || '-';
        const initials = personName
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((item) => item.charAt(0))
          .join('')
          .toUpperCase() || 'OS';
        const serviceLabel = order.descricao || 'Serviço não informado';
        return `
          <div class="orders-table-row ${selectedOrders.has(order.id) ? 'selected' : ''}" role="button" tabindex="0" onclick="toggleOrderSelection(event, '${order.id}')" onkeydown="handleOrderRowSelectionKey(event, '${order.id}')">
            <div class="orders-table-cell orders-table-cell--check">
              <button class="selection-check ${selectedOrders.has(order.id) ? 'checked' : ''}" onclick="toggleOrderSelection(event, '${order.id}')">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 12l4 4 10-10"/>
                </svg>
              </button>
            </div>
            <div class="orders-table-cell">
              <span class="orders-os-number">OS-${escapeHtml(getOrderNumberLabel(order))}</span>
            </div>
            <div class="orders-table-cell">
              <div class="orders-main-text">${escapeHtml(vehicleLabel || '-')}</div>
              <div class="orders-sub-text">${escapeHtml(vehicleSub || '-')}</div>
            </div>
            <div class="orders-table-cell">
              <div class="orders-driver-wrap">
                <span class="orders-driver-avatar">${escapeHtml(initials)}</span>
                <span class="orders-main-text">${escapeHtml(personName)}</span>
              </div>
            </div>
            <div class="orders-table-cell">
              <div class="orders-main-text">${formatDate(order.dataInicio)}</div>
            </div>
            <div class="orders-table-cell">
              <div class="orders-main-text">${formatDate(order.dataTermino)}</div>
            </div>
            <div class="orders-table-cell">
              <span class="${statusUi.className}">${statusUi.label}</span>
            </div>
            <div class="orders-table-cell">
              <div class="orders-main-text">${escapeHtml(serviceLabel)}</div>
            </div>
            <div class="orders-table-cell orders-table-cell--value">
              <span class="orders-value-text">${formatCurrency(totalFinance)}</span>
            </div>
          </div>
        `;
      }).join('');
      updateEntityListViewport('orders-list-shell', filteredOrders.length);
      updateOrderSortIndicators();
      updateOrderSelectionUI();
    }

    function renderFinance() {
      const list = document.getElementById('finance-list');
      if (!list) return;
      const visibleEntries = getVisibleFinanceEntries();
      if (!visibleEntries.length) {
        list.innerHTML = '<div class="empty-state">Nenhum lançamento financeiro cadastrado.</div>';
        selectedFinance.clear();
        updateEntityListViewport('finance-list-shell', 0);
        updateFinanceSortIndicators();
        updateFinanceSelectionUI();
        return;
      }
      list.innerHTML = visibleEntries.map(entry => {
        const order = allOrders.find(item => item.id === entry.orderId);
        const vehicle = allVehicles.find(item => item.id === getEntryVehicleId(entry));
        const groupEntry = entry.groupedIntoId ? allFinanceEntries.find(item => item.id === entry.groupedIntoId) : null;
        const groupedChildren = isFinanceGroupEntry(entry) ? getFinanceGroupChildren(entry) : [];
        const title = isFinanceGroupEntry(entry)
          ? (isExpenseGroupEntry(entry) ? 'Agrupamento de despesas' : 'Agrupamento de abastecimentos')
          : (entry.fornecedor || 'Lançamento');
        const vehicleLabel = vehicle
          ? `${vehicle.numeroFrota || ''} ${vehicle.placa || ''} ${vehicle.modelo || ''}`.trim()
          : '-';
        const orderBadgeHtml = order
          ? `<span class="finance-os-badge">OS ${escapeHtml(getOrderNumberLabel(order))}</span>`
          : '';
        const receiptUrl = getFinanceEntryReceiptUrl(entry);
        const detailsActionsHtml = `
          <div class="finance-detail-actions">
            <button
              type="button"
              class="finance-detail-action-btn ${receiptUrl ? '' : 'is-disabled'}"
              title="${receiptUrl ? 'Abrir comprovante' : 'Sem comprovante vinculado a este lançamento.'}"
              aria-disabled="${receiptUrl ? 'false' : 'true'}"
              onclick="event.stopPropagation(); openFinanceReceiptByEntryId('${entry.id}')"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21.44 11.05l-8.49 8.49a5.5 5.5 0 01-7.78-7.78l9.2-9.19a3.5 3.5 0 114.95 4.95l-9.19 9.2a1.5 1.5 0 11-2.12-2.13l8.49-8.48"/>
              </svg>
            </button>
            <button
              type="button"
              class="finance-detail-action-btn"
              title="Visualizar lançamento"
              onclick="event.stopPropagation(); viewFinanceEntryById('${entry.id}')"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1.5 12s4-7 10.5-7 10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"/>
                <circle cx="12" cy="12" r="3" stroke-width="2"></circle>
              </svg>
            </button>
          </div>
        `;
        return `
          <div class="orders-table-row finance-table-row finance-entry finance-entry--${getFinanceEntryFamily(entry)} ${selectedFinance.has(entry.id) ? 'selected' : ''}" role="button" tabindex="0" onclick="toggleFinanceSelection(event, '${entry.id}')" onkeydown="handleFinanceRowSelectionKey(event, '${entry.id}')">
            <div class="orders-table-cell orders-table-cell--check">
              <button class="selection-check ${selectedFinance.has(entry.id) ? 'checked' : ''}" onclick="toggleFinanceSelection(event, '${entry.id}')">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 12l4 4 10-10"/>
                </svg>
              </button>
            </div>
            <div class="orders-table-cell">
              <div class="orders-main-text">${escapeHtml(title)}</div>
              <div class="orders-sub-text">${entry.observacoes ? escapeHtml(entry.observacoes) : escapeHtml(entry.kindLabel || 'Despesa')}</div>
            </div>
            <div class="orders-table-cell">
              <span class="mini-badge mini-badge--status-${getFinanceEntryStatus(entry)}">${escapeHtml(getFinanceEntryStatusLabel(entry))}</span>
            </div>
            <div class="orders-table-cell">
              <div class="orders-main-text">${escapeHtml(vehicleLabel)}</div>
            </div>
            <div class="orders-table-cell finance-os-cell">
              ${orderBadgeHtml}
            </div>
            <div class="orders-table-cell">
              <div class="orders-main-text">${escapeHtml(formatDate(getFinanceEntryDate(entry)))}</div>
              <div class="orders-sub-text">${escapeHtml(getFinanceEntryDateLabel(entry))}</div>
            </div>
            <div class="orders-table-cell orders-table-cell--value finance-value-cell">
              <span class="orders-value-text">${formatCurrency(getFinanceTotal(entry))}</span>
            </div>
            <div class="orders-table-cell">
              ${detailsActionsHtml}
            </div>
          </div>
        `;
      }).join('');
      updateEntityListViewport('finance-list-shell', visibleEntries.length);
      updateFinanceSortIndicators();
      updateFinanceSelectionUI();
    }

    function clearOrderFilters() {
      orderVehicleFilterId = '';
      document.getElementById('order-filter-search').value = '';
      document.getElementById('order-filter-start').value = '';
      document.getElementById('order-filter-end').value = '';
      document.getElementById('order-filter-status').value = '';
      document.getElementById('order-filter-sort').value = 'recentes';
      orderSortState = { key: 'default', direction: 'desc' };
      renderOrders();
    }

    function clearFinanceFilters() {
      document.getElementById('finance-filter-search').value = '';
      document.getElementById('finance-filter-status').value = '';
      document.getElementById('finance-filter-start').value = '';
      document.getElementById('finance-filter-end').value = '';
      document.getElementById('finance-filter-value').value = '';
      financeSortState = { key: 'default', direction: 'desc' };
      renderFinance();
    }

    function clearVehicleFilters() {
      document.getElementById('vehicle-filter-search').value = '';
      vehicleSortState = { key: 'fleet', direction: 'asc' };
      renderVehicles();
    }

    function clearDriverFilters() {
      document.getElementById('driver-filter-search').value = '';
      document.getElementById('driver-filter-validity').value = '';
      driverSortState = { key: 'name', direction: 'asc' };
      renderDrivers();
    }

    function clearSupplierFilters() {
      document.getElementById('supplier-filter-search').value = '';
      document.getElementById('supplier-filter-type').value = '';
      supplierSortState = { key: 'name', direction: 'asc' };
      renderSuppliers();
    }

    function editSelectedVehicle() {
      if (selectedVehicles.size !== 1) {
        showToast('Selecione apenas um veículo para editar.');
        return;
      }
      const id = Array.from(selectedVehicles)[0];
      const vehicle = allVehicles.find(item => item.id === id);
      if (!vehicle) return;
      openCadastroModal('vehicle');
      currentEditingId = id;
      document.getElementById('vehicle-frota').value = vehicle.numeroFrota;
      document.getElementById('vehicle-placa').value = vehicle.placa;
      document.getElementById('vehicle-modelo').value = vehicle.modelo;
      document.getElementById('vehicle-ano').value = vehicle.ano;
      document.getElementById('vehicle-cor').value = vehicle.cor || '';
      document.getElementById('vehicle-seguro').value = vehicle.seguroVencimento || '';
      document.getElementById('vehicle-motorista').value = vehicle.motoristaId || '';
      syncCustomSelectById('vehicle-motorista');
      document.getElementById('vehicle-chassi').value = vehicle.chassi || '';
      document.getElementById('modal-title').textContent = 'Editar veículo';
    }

    function editSelectedDriver() {
      if (selectedDrivers.size !== 1) {
        showToast('Selecione apenas um motorista para editar.');
        return;
      }
      const id = Array.from(selectedDrivers)[0];
      const driver = allDrivers.find(item => item.id === id);
      if (!driver) return;
      openCadastroModal('driver');
      currentEditingId = id;
      document.getElementById('driver-nome').value = driver.nome;
      document.getElementById('driver-cpf').value = driver.cpf;
      document.getElementById('driver-cnh').value = driver.cnh;
      document.getElementById('driver-categoria').value = driver.categoria;
      syncCustomSelectById('driver-categoria');
      document.getElementById('driver-telefone').value = driver.telefone || '';
      document.getElementById('driver-validade').value = driver.validade || '';
      setSelectedDriverVehicleIds(getDriverVehicleIds(driver));
      document.getElementById('modal-title').textContent = 'Editar motorista';
    }

    function editSelectedSupplier() {
      if (selectedSuppliers.size !== 1) {
        showToast('Selecione apenas um fornecedor para editar.');
        return;
      }
      const id = Array.from(selectedSuppliers)[0];
      const supplier = allSuppliers.find(item => item.id === id);
      if (!supplier) return;
      openCadastroModal('supplier');
      currentEditingId = id;
      document.getElementById('supplier-name').value = supplier.nome || '';
      document.getElementById('supplier-type').value = supplier.tipo || '';
      syncCustomSelectById('supplier-type');
      document.getElementById('supplier-document').value = supplier.documento || '';
      document.getElementById('supplier-phone').value = supplier.telefone || '';
      document.getElementById('supplier-email').value = supplier.email || '';
      document.getElementById('supplier-notes').value = supplier.observacoes || '';
      document.getElementById('modal-title').textContent = 'Editar fornecedor';
    }

    function editSelectedOrder() {
      if (selectedOrders.size !== 1) {
        showToast('Selecione apenas uma OS para editar.');
        return;
      }
      const id = Array.from(selectedOrders)[0];
      const order = allOrders.find(item => item.id === id);
      if (!order) return;
      openCadastroModal('order');
      currentEditingId = id;
      document.getElementById('order-numero').value = getOrderNumberLabel(order);
      document.getElementById('order-numero').readOnly = !allowManualOrderNumberEditing;
      setOrderAdministrationFormValue(order.administracao || '');
      setOrderTypeValue(order.tipoOs || 'avulsa');
      document.getElementById('order-veiculo').value = order.vehicleId || '';
      document.getElementById('order-driver').value = order.driverId || '';
      document.getElementById('order-data-inicio').value = order.dataInicio || '';
      document.getElementById('order-data-termino').value = order.dataTermino || '';
      document.getElementById('order-status').value = order.status || 'aberta';
      updateOrderDateConstraints();
      ['order-tipo-os', 'order-veiculo', 'order-driver', 'order-status'].forEach(syncCustomSelectById);
      document.getElementById('order-descricao').value = order.descricao || '';
      document.getElementById('order-descricao').dataset.generatedDescription = '';
      document.getElementById('modal-title').textContent = 'Editar OS';
    }

    function editSelectedFinance() {
      if (selectedFinance.size !== 1) {
        showToast('Selecione apenas um lançamento para editar.');
        return;
      }
      const id = Array.from(selectedFinance)[0];
      const entry = allFinanceEntries.find(item => item.id === id);
      if (!entry) return;
      if (entry.groupedIntoId) {
        showToast('Esse lançamento faz parte de um agrupamento. Desfaça o agrupamento antes de editar.');
        return;
      }
      if (isFinanceEntryLinkedToClosedOrder(entry)) {
        showToast('Não é possível editar despesa vinculada a OS fechada. Reabra a OS antes.');
        return;
      }
      if (canReverseFinanceEntry(entry)) {
        showToast('Essa despesa já foi fechada ou distribuída. Faça o estorno antes de editar.');
        return;
      }
      if (isFinanceGroupEntry(entry)) {
        openFuelGroupingModal(id);
        return;
      }
      loadFinanceEntryIntoForm(entry);
      setCadastroModalReadOnly(false);
      document.getElementById('modal-title').textContent = 'Editar lançamento';
    }

    function deleteSelectedVehicles() {
      if (!selectedVehicles.size) {
        showToast('Selecione pelo menos um veículo para excluir.');
        return;
      }
      const linkedOrders = allOrders.filter(order => selectedVehicles.has(order.vehicleId));
      if (linkedOrders.length) {
        showToast('Não é possível excluir veículo com OS vinculada.');
        return;
      }
      const selectedCount = selectedVehicles.size;
      openPromptModal({
        mode: 'confirm',
        title: selectedCount === 1 ? 'Excluir veículo' : 'Excluir veículos',
        text: selectedCount === 1
          ? 'Tem certeza que deseja excluir este veículo? Essa ação não poderá ser desfeita.'
          : `Tem certeza que deseja excluir ${selectedCount} veículos? Essa ação não poderá ser desfeita.`,
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        onConfirm: () => {
          allVehicles = allVehicles.filter(vehicle => !selectedVehicles.has(vehicle.id));
          selectedVehicles.clear();
          saveToLocalStorage();
          renderAll();
          showToast('Veículo(s) excluído(s) com sucesso.');
        }
      });
    }

    function deleteSelectedDrivers() {
      if (!selectedDrivers.size) {
        showToast('Selecione pelo menos um motorista para excluir.');
        return;
      }
      const linkedOrders = allOrders.filter(order => selectedDrivers.has(order.driverId));
      if (linkedOrders.length) {
        showToast('Não é possível excluir motorista com OS vinculada.');
        return;
      }
      const selectedCount = selectedDrivers.size;
      openPromptModal({
        mode: 'confirm',
        title: selectedCount === 1 ? 'Excluir motorista' : 'Excluir motoristas',
        text: selectedCount === 1
          ? 'Tem certeza que deseja excluir este motorista? Essa ação não poderá ser desfeita.'
          : `Tem certeza que deseja excluir ${selectedCount} motoristas? Essa ação não poderá ser desfeita.`,
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        onConfirm: () => {
          allDrivers = allDrivers.filter(driver => !selectedDrivers.has(driver.id));
          selectedDrivers.clear();
          saveToLocalStorage();
          renderAll();
          showToast('Motorista(s) excluído(s) com sucesso.');
        }
      });
    }

    function deleteSelectedSuppliers() {
      if (!selectedSuppliers.size) {
        showToast('Selecione pelo menos um fornecedor para excluir.');
        return;
      }
      const selectedCount = selectedSuppliers.size;
      openPromptModal({
        mode: 'confirm',
        title: selectedCount === 1 ? 'Excluir fornecedor' : 'Excluir fornecedores',
        text: selectedCount === 1
          ? 'Tem certeza que deseja excluir este fornecedor? Essa ação não poderá ser desfeita.'
          : `Tem certeza que deseja excluir ${selectedCount} fornecedores? Essa ação não poderá ser desfeita.`,
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        onConfirm: () => {
          allSuppliers = allSuppliers.filter(supplier => !selectedSuppliers.has(supplier.id));
          selectedSuppliers.clear();
          saveToLocalStorage();
          renderAll();
          showToast('Fornecedor(es) excluído(s) com sucesso.');
        }
      });
    }

    function deleteSelectedOrders() {
      if (!selectedOrders.size) {
        showToast('Selecione pelo menos uma OS para excluir.');
        return;
      }
      const selectedCount = selectedOrders.size;
      openPromptModal({
        mode: 'confirm',
        title: selectedCount === 1 ? 'Excluir OS' : 'Excluir OS em lote',
        text: selectedCount === 1
          ? 'Tem certeza que deseja excluir esta OS? Os lançamentos financeiros vinculados serão estornados e voltarão para pendente.'
          : `Tem certeza que deseja excluir ${selectedCount} OS? Os lançamentos financeiros vinculados serão estornados e voltarão para pendente.`,
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        onConfirm: () => {
          const deletedIds = new Set(selectedOrders);
          const deletedAt = new Date().toISOString();
          const linkedEntryIds = new Set();
          const deletedBatch = allOrders
            .filter(order => deletedIds.has(order.id))
            .map(order => {
              const vehicle = allVehicles.find(item => item.id === order.vehicleId);
              const linkedEntries = allFinanceEntries.filter(entry => entry.orderId === order.id);
              linkedEntries.forEach(entry => linkedEntryIds.add(entry.id));
              return {
                ...order,
                deletedAt,
                vehicleSnapshot: vehicle ? {
                  id: vehicle.id,
                  placa: vehicle.placa,
                  modelo: vehicle.modelo,
                  numeroFrota: vehicle.numeroFrota
                } : null,
                totalLinked: sumFinanceNetTotal(linkedEntries)
              };
            });
          deletedOrders = [...deletedBatch, ...deletedOrders].slice(0, 500);
          allOrders = allOrders.filter(order => !deletedIds.has(order.id));
          allFinanceEntries = allFinanceEntries.map(entry => {
            if (!deletedIds.has(entry.orderId)) return entry;
            return {
              ...entry,
              orderId: '',
              workflowStatus: 'pendente',
              closedExpense: false,
              reversedFromDeletedOrder: entry.orderId,
              reversedFromDeletedOrderAt: deletedAt
            };
          });
          selectedOrders.clear();
          saveToLocalStorage();
          renderAll();
          showToast(linkedEntryIds.size
            ? 'OS excluída. Lançamentos financeiros preservados e estornados para pendente.'
            : 'OS excluída com sucesso.');
        }
      });
    }

    function deleteSelectedFinance() {
      if (!selectedFinance.size) {
        showToast('Selecione pelo menos um lançamento para excluir.');
        return;
      }
      const selectedEntries = Array.from(selectedFinance)
        .map(id => allFinanceEntries.find(entry => entry.id === id))
        .filter(Boolean);

      const hasGroupedChild = selectedEntries.some(entry => entry.groupedIntoId);
      if (hasGroupedChild) {
        showToast('Desfaça o agrupamento antes de excluir lançamentos agrupados.');
        return;
      }

      const hasClosedGroup = selectedEntries.some(entry =>
        isFinanceGroupEntry(entry)
        && (entry.closedExpense || ['pendente_os', 'distribuido'].includes(getFinanceEntryStatus(entry)) || !!entry.orderId)
      );
      if (hasClosedGroup) {
        if (selectedEntries.some(entry => isFinanceEntryLinkedToClosedOrder(entry))) {
          showToast('Agrupamento vinculado a OS fechada não pode ser excluído. Reabra a OS antes.');
          return;
        }
        showToast('Agrupamento já fechado não pode ser excluído. Faça o estorno ou ajuste a despesa antes.');
        return;
      }

      const hasOpenGroup = selectedEntries.some(entry => isFinanceGroupEntry(entry));
      if (hasOpenGroup) {
        showToast('Desfaça o agrupamento antes de excluir esse lançamento.');
        return;
      }

      if (selectedEntries.some(entry => isFinanceEntryLinkedToClosedOrder(entry))) {
        showToast('Despesa vinculada a OS fechada não pode ser excluída. Reabra a OS antes.');
        return;
      }

      const selectedCount = selectedEntries.length;
      const hasAllocatedEntry = selectedEntries.some(entry =>
        !isFinanceGroupEntry(entry)
        && (['pendente_os', 'distribuido'].includes(getFinanceEntryStatus(entry)) || !!entry.orderId || !!entry.closedExpense)
      );
      openPromptModal({
        mode: 'confirm',
        title: selectedCount === 1 ? 'Excluir lançamento' : 'Excluir lançamentos',
        text: hasAllocatedEntry
          ? (selectedCount === 1
            ? 'Este lançamento está alocado em OS. O sistema vai estornar o vínculo da OS e excluir o lançamento. Essa ação não poderá ser desfeita.'
            : `Existem lançamentos alocados em OS nesta seleção. O sistema vai estornar os vínculos das OS e excluir os ${selectedCount} lançamentos. Essa ação não poderá ser desfeita.`)
          : (selectedCount === 1
            ? 'Tem certeza que deseja excluir este lançamento? Essa ação não poderá ser desfeita.'
            : `Tem certeza que deseja excluir ${selectedCount} lançamentos? Essa ação não poderá ser desfeita.`),
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        onConfirm: () => {
          const impactedOrderIds = selectedEntries.map(entry => entry.orderId).filter(Boolean);
          allFinanceEntries = allFinanceEntries.filter(entry => !selectedFinance.has(entry.id));
          syncOrderStatusesAfterFinancialReversal(impactedOrderIds);
          selectedFinance.clear();
          saveToLocalStorage();
          renderAll();
          showToast(hasAllocatedEntry
            ? 'Estorno da OS realizado e lançamento(s) excluído(s) com sucesso.'
            : 'Lançamento(s) excluído(s) com sucesso.');
        }
      });
    }

    function reverseSelectedFinance() {
      if (!selectedFinance.size) {
        showToast('Selecione pelo menos uma despesa para estornar.');
        return;
      }
      const selectedEntries = Array.from(selectedFinance)
        .map(id => allFinanceEntries.find(entry => entry.id === id))
        .filter(Boolean);
      if (selectedEntries.some(entry => isFinanceEntryLinkedToClosedOrder(entry))) {
        showToast('Não é possível estornar despesa vinculada a OS fechada. Reabra a OS antes.');
        return;
      }
      if (!selectedEntries.length || selectedEntries.some(entry => !canReverseFinanceEntry(entry))) {
        showToast('Selecione apenas despesas fechadas ou distribuídas para estornar.');
        return;
      }

      const selectedCount = selectedEntries.length;
      openPromptModal({
        mode: 'confirm',
        title: selectedCount === 1 ? 'Estornar despesa' : 'Estornar despesas',
        text: selectedCount === 1
          ? 'Tem certeza que deseja estornar esta despesa? Ela voltará para pendente e poderá ser editada.'
          : `Tem certeza que deseja estornar ${selectedCount} despesas? Elas voltarão para pendente e poderão ser editadas.`,
        confirmLabel: 'Estornar',
        cancelLabel: 'Cancelar',
        onConfirm: () => {
          const impactedOrderIds = selectedEntries.map(entry => entry.orderId).filter(Boolean);
          allFinanceEntries = allFinanceEntries.map((entry) => {
            if (!selectedFinance.has(entry.id)) return entry;
            return {
              ...entry,
              orderId: '',
              workflowStatus: 'pendente',
              closedExpense: false
            };
          });
          syncOrderStatusesAfterFinancialReversal(impactedOrderIds);
          saveToLocalStorage();
          renderAll();
          showToast('Estorno realizado. Agora a despesa pode ser editada novamente.');
        }
      });
    }

    function closeSelectedOrder() {
      if (!selectedOrders.size) {
        showToast('Selecione pelo menos uma OS para fechar.');
        return;
      }
      const selectedIds = new Set(selectedOrders);
      const closableIds = new Set(
        allOrders
          .filter(order => selectedIds.has(order.id) && order.status !== 'fechada')
          .map(order => order.id)
      );
      if (!closableIds.size) {
        showToast('As OS selecionadas já estão fechadas.');
        return;
      }
      openPromptModal({
        mode: 'confirm',
        title: closableIds.size === 1 ? 'Fechar OS' : 'Fechar OS em lote',
        text: closableIds.size === 1
          ? 'Tem certeza que deseja fechar esta OS?'
          : `Tem certeza que deseja fechar ${closableIds.size} OS?`,
        confirmLabel: 'Fechar',
        cancelLabel: 'Cancelar',
        onConfirm: () => {
          allOrders = allOrders.map(order => closableIds.has(order.id)
            ? { ...order, status: 'fechada', dataTermino: order.dataTermino || getLocalIsoDate() }
            : order);
          saveToLocalStorage();
          renderAll();
          showToast(`OS fechada${closableIds.size === 1 ? '' : 's'} com sucesso.`);
        }
      });
    }

    function getOrderReopenHistory(order) {
      const savedHistory = Array.isArray(order?.reopenHistory) ? order.reopenHistory : [];
      const legacyHistory = String(order?.descricao || '')
        .split('\n')
        .map(line => line.trim())
        .filter(line => /^OS REABERTA EM/i.test(line))
        .map(line => {
          const match = line.match(/^OS REABERTA EM\s+(.+?)(?:\s+motivo:\s*(.*))?$/i);
          return {
            dateLabel: match?.[1] || '',
            timeLabel: '',
            reason: match?.[2] || line
          };
        });
      return [...legacyHistory, ...savedHistory];
    }

    function getOrderPrintableDescription(order) {
      return String(order?.descricao || '')
        .split('\n')
        .filter(line => !/^OS REABERTA EM/i.test(line.trim()))
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    }

    function reopenSelectedOrder() {
      if (!selectedOrders.size) {
        showToast('Selecione pelo menos uma OS para reabrir.');
        return;
      }
      const selectedIds = new Set(selectedOrders);
      const reopenableIds = new Set(
        allOrders
          .filter(order => selectedIds.has(order.id) && order.status === 'fechada')
          .map(order => order.id)
      );
      if (!reopenableIds.size) {
        showToast('Selecione ao menos uma OS fechada para reabrir.');
        return;
      }
      openPromptModal({
        title: 'Reabrir OS',
        text: 'Informe o motivo da reabertura. Essa justificativa ficará no histórico da OS e sairá em página separada na impressão.',
        placeholder: 'Ex.: retorno da oficina, ajuste interno, complemento financeiro...',
        onConfirm: (justification) => {
          const now = new Date();
          const dateIso = getLocalIsoDate();
          const timeLabel = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          allOrders = allOrders.map(order => reopenableIds.has(order.id)
            ? {
                ...order,
                status: 'aberta',
                reopenHistory: [
                  ...(Array.isArray(order.reopenHistory) ? order.reopenHistory : []),
                  {
                    date: dateIso,
                    dateLabel: formatDate(dateIso),
                    timeLabel,
                    reason: justification
                  }
                ]
              }
            : order);
          saveToLocalStorage();
          renderAll();
          showToast(`OS reaberta${reopenableIds.size === 1 ? '' : 's'} com sucesso.`);
        }
      });
    }

    function getSelectedOrderForSingleAction(message) {
      if (selectedOrders.size !== 1) {
        showToast(message);
        return null;
      }
      const id = Array.from(selectedOrders)[0];
      return allOrders.find(item => item.id === id) || null;
    }

    function buildOrderViewerHtml(order) {
      const vehicle = allVehicles.find(item => item.id === order.vehicleId);
      const driver = allDrivers.find(item => item.id === order.driverId);
      const kmData = getOrderKmData(order.id);
      const entries = allFinanceEntries.filter(item => item.orderId === order.id);
      const totalEntries = sumFinanceNetTotal(entries);
      const statusLabel = getOrderStatusUi(order.status).label;
      const printableDescription = getOrderPrintableDescription(order);
      const reopenHistory = getOrderReopenHistory(order);
      let runningTotal = 0;
      const rows = Array.from({ length: Math.max(entries.length, 18) }, (_, index) => {
        const entry = entries[index];
        if (entry) runningTotal += getFinanceNetTotal(entry);
        return `
          <tr>
            <td>${entry ? escapeHtml(formatDate(getFinanceEntryDate(entry))) : ''}</td>
            <td>${entry ? escapeHtml(getFinanceSupplierSummary(entry)) : ''}</td>
            <td class="money">${entry && entry.kind === 'despesa' ? escapeHtml(formatCurrency(entry.total)) : ''}</td>
            <td class="money">${entry && entry.kind === 'receita' ? escapeHtml(formatCurrency(entry.total)) : ''}</td>
            <td class="money">${entry ? escapeHtml(formatCurrency(runningTotal)) : ''}</td>
          </tr>
        `;
      }).join('');
      const reopenRows = reopenHistory.map((item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(item.dateLabel || formatDate(item.date) || '-')}</td>
          <td>${escapeHtml(item.timeLabel || '-')}</td>
          <td>${escapeHtml(item.reason || '-')}</td>
        </tr>
      `).join('');

      return `
        <!doctype html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <style>
            * { box-sizing: border-box; font-family: Arial, Helvetica, sans-serif; color: #000; }
            html, body { margin: 0; padding: 0; background: #fff; }
            body { padding: 24px; }
            .sheet { width: 100%; margin: 0 auto; }
            table { width: 100%; table-layout: fixed; border-collapse: collapse; border: 1px solid #000; empty-cells: show; }
            td, th { border: 1px solid #000; padding: 3px 5px; font-size: 10px; vertical-align: middle; }
            .top-strip td { height: 20px; background: #d9d9d9; }
            .header-logo-cell { width: 22%; padding: 10px 12px 6px 20px; text-align: left; }
            .header-main-cell { width: 56%; text-align: center; padding: 10px 8px 8px; }
            .header-number-cell { width: 22%; text-align: right; padding: 20px 18px 8px 8px; }
            .brand-logo { max-width: ${getOsLogoStyle().width}px; max-height: ${getOsLogoStyle().height}px; object-fit: contain; display: block; }
            .admin-line { font-size: 10px; font-weight: 800; margin-bottom: 10px; }
            .title-line { font-size: 15px; font-weight: 800; line-height: 1.2; }
            .status-line { margin-top: 16px; font-size: 10px; font-weight: 700; }
            .number-label, .number-value { font-size: 19px; font-style: italic; font-weight: 800; }
            .number-value { font-size: 22px; }
            .label { font-weight: 700; }
            .block-gap { margin-top: 24px; }
            .desc-title td, .finance-table th, .reopen-table th { background: #d9d9d9; text-align: center; font-weight: 800; text-transform: uppercase; }
            .desc-title td { height: 40px; font-size: 11px; }
            .desc-box td { height: 90px; vertical-align: top; padding: 8px; white-space: pre-wrap; line-height: 1.42; font-size: 13px; }
            .signature-block td { height: 74px; }
            .sign-wrap { width: 250px; margin: 40px auto 0; text-align: center; }
            .sign-line { width: 100%; border-top: 1px solid #000; min-height: 1px; display: block; }
            .sign-label { margin-top: 2px; font-size: 11px; font-weight: 800; }
            .finance-table th { height: 48px; font-size: 10px; line-height: 1.1; }
            .finance-table td { height: 21px; font-size: 10px; }
            .money { text-align: right; white-space: nowrap; }
            .total-row td { height: 28px; }
            .finance-total-spacer { border-left: none; border-bottom: none; border-right: none; }
            .finance-total-label { text-align: center; font-size: 11px; font-weight: 800; }
            .reopen-title { margin: 26px 0 10px; font-size: 15px; font-weight: 800; text-align: center; text-transform: uppercase; }
            .reopen-table td, .reopen-table th { height: 26px; font-size: 10px; vertical-align: top; }
          </style>
        </head>
        <body>
          <div class="sheet">
            <table class="top-strip"><tr><td></td></tr></table>
            <table>
              <tr>
                <td class="header-logo-cell"><img class="brand-logo" src="${getActiveLogoSrc()}" alt="WeFrotas"></td>
                <td class="header-main-cell">
                  <div class="admin-line">${escapeHtml(order.administracao || 'NOME PREENCHIDO NA ADMINISTRAÇÃO')}</div>
                  <div class="title-line">Ordem de Serviço para veículos/Máquinas</div>
                  <div class="status-line">Status: ${escapeHtml(statusLabel)}</div>
                </td>
                <td class="header-number-cell"><span class="number-label">Nº:</span> <span class="number-value">${escapeHtml(getOrderNumberLabel(order))}</span></td>
              </tr>
            </table>
            <table>
              <tr><td class="label" style="width:14%;">Administração:</td><td style="width:54%;">${escapeHtml(order.administracao || '')}</td><td class="label" style="width:16%;">DT. INÍCIO:</td><td style="width:16%;">${escapeHtml(formatDate(order.dataInicio))}</td></tr>
              <tr><td class="label">Veículo:</td><td>${escapeHtml(vehicle ? vehicle.modelo : '')}</td><td class="label">DT. TÉRMINO:</td><td>${escapeHtml(formatDate(order.dataTermino))}</td></tr>
              <tr><td class="label">Placa:</td><td>${escapeHtml(vehicle ? vehicle.placa : '')}</td><td class="label">KM INICIAL:</td><td>${escapeHtml(kmData.kmInicial || '')}</td></tr>
              <tr><td class="label">Chassi:</td><td>${escapeHtml(vehicle ? vehicle.chassi || '' : '')}</td><td class="label">KM FINAL:</td><td>${escapeHtml(kmData.kmFinal || '')}</td></tr>
              <tr><td class="label">Responsável:</td><td colspan="3">${escapeHtml(driver ? driver.nome : order.responsavelNome || '')}</td></tr>
            </table>
            <table class="desc-title block-gap"><tr><td>DESCRIÇÃO DO SERVIÇO/PROBLEMA:</td></tr></table>
            <table class="desc-box"><tr><td>${escapeHtml(printableDescription || '')}</td></tr></table>
            <table class="signature-block block-gap"><tr><td><div class="sign-wrap"><div class="sign-line"></div><div class="sign-label">AUTORIZADOR</div></div></td></tr></table>
            <table class="finance-table">
              <thead><tr><th style="width:14%;">DATA<br>VENCIMENTO</th><th>FORNECEDOR E NFs</th><th style="width:17%;">DÉBITO</th><th style="width:16%;">CRÉDITO</th><th style="width:16%;">TOTAL</th></tr></thead>
              <tbody>${rows}<tr class="total-row"><td colspan="3" class="finance-total-spacer"></td><td class="finance-total-label">TOTAL</td><td class="money">${entries.length ? escapeHtml(formatCurrency(totalEntries)) : 'R$'}</td></tr></tbody>
            </table>
            ${reopenHistory.length ? `<h2 class="reopen-title">Histórico de reaberturas da OS</h2><table class="reopen-table"><thead><tr><th style="width:8%;">#</th><th style="width:18%;">Data</th><th style="width:14%;">Hora</th><th>Justificativa</th></tr></thead><tbody>${reopenRows}</tbody></table>` : ''}
          </div>
        </body>
        </html>
      `;
    }

    function applyOrderViewerZoom() {
      const frame = document.getElementById('order-viewer-frame');
      const label = document.getElementById('order-viewer-zoom-label');
      if (frame) {
        frame.style.transform = `scale(${orderViewerZoom})`;
        frame.style.marginBottom = `${Math.max(0, 1123 * (orderViewerZoom - 1))}px`;
      }
      if (label) label.textContent = `${Math.round(orderViewerZoom * 100)}%`;
    }

    function fitOrderViewerToStage() {
      const stage = document.getElementById('order-viewer-stage');
      if (!stage) return;
      const availableWidth = Math.max(0, stage.clientWidth - 24);
      orderViewerZoom = Math.min(1.65, Math.max(0.7, Number((availableWidth / 794).toFixed(2))));
      applyOrderViewerZoom();
    }

    function changeOrderViewerZoom(delta) {
      orderViewerZoom = Math.min(1.8, Math.max(0.55, Number((orderViewerZoom + delta).toFixed(2))));
      applyOrderViewerZoom();
    }

    function closeOrderViewer() {
      const backdrop = document.getElementById('order-viewer-backdrop');
      const frame = document.getElementById('order-viewer-frame');
      if (backdrop) backdrop.classList.add('hidden');
      if (frame) frame.srcdoc = '';
    }

    function handleOrderViewerBackdrop(event) {
      if (event.target?.id === 'order-viewer-backdrop') closeOrderViewer();
    }

    function viewSelectedOrder() {
      const order = getSelectedOrderForSingleAction('Selecione uma OS para visualizar.');
      if (!order) return;
      const backdrop = document.getElementById('order-viewer-backdrop');
      const frame = document.getElementById('order-viewer-frame');
      const title = document.getElementById('order-viewer-title');
      if (!backdrop || !frame) return;
      orderViewerZoom = 1;
      if (title) title.textContent = `Visualizar OS ${getOrderNumberLabel(order)}`;
      frame.srcdoc = buildOrderViewerHtml(order);
      backdrop.classList.remove('hidden');
      requestAnimationFrame(fitOrderViewerToStage);
    }

    function saveSelectedOrderPdf() {
      showToast('Na janela de impressão, escolha "Salvar como PDF".');
      printSelectedOrder();
    }

    function buildPrintableOrderPageHtml(order, forcePageBreak = false) {
      const vehicle = allVehicles.find(item => item.id === order.vehicleId);
      const driver = allDrivers.find(item => item.id === order.driverId);
      const kmData = getOrderKmData(order.id);
      const entries = allFinanceEntries.filter(item => item.orderId === order.id);
      const totalEntries = sumFinanceNetTotal(entries);
      const statusLabel = (order.status || 'aberta').charAt(0).toUpperCase() + (order.status || 'aberta').slice(1);
      const printableDescription = getOrderPrintableDescription(order);
      const reopenHistory = getOrderReopenHistory(order);
      const reopenHistoryRows = reopenHistory.map((item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(item.dateLabel || formatDate(item.date) || '-')}</td>
          <td>${escapeHtml(item.timeLabel || '-')}</td>
          <td>${escapeHtml(item.reason || '-')}</td>
        </tr>
      `).join('');

      let runningTotal = 0;
      const rows = Array.from({ length: Math.max(entries.length, 24) }, (_, index) => {
        const entry = entries[index];
        if (entry) {
          runningTotal += getFinanceNetTotal(entry);
        }
        return `
          <tr>
            <td>${entry ? escapeHtml(formatDate(getFinanceEntryDate(entry))) : ''}</td>
            <td>${entry ? escapeHtml(getFinanceSupplierSummary(entry)) : ''}</td>
            <td class="money">${entry && entry.kind === 'despesa' ? escapeHtml(formatCurrency(entry.total)) : ''}</td>
            <td class="money">${entry && entry.kind === 'receita' ? escapeHtml(formatCurrency(entry.total)) : ''}</td>
            <td class="money">${entry ? escapeHtml(formatCurrency(runningTotal)) : ''}</td>
          </tr>
        `;
      }).join('');

      return `
        <div class="sheet ${forcePageBreak ? 'sheet-page-break' : ''}">
          <table class="top-strip">
            <tr><td></td></tr>
          </table>

          <table class="header-table">
            <tr>
              <td class="header-logo-cell"><img class="brand-logo" src="${getActiveLogoSrc()}" alt="WeFrotas"></td>
              <td class="header-main-cell">
                <div class="admin-line">${escapeHtml(order.administracao || 'NOME PREENCHIDO NA ADMINISTRAÇÃO')}</div>
                <div class="title-line">Ordem de Serviço para veículos/Máquinas</div>
                <div class="status-line">Status: ${escapeHtml(statusLabel)}</div>
              </td>
              <td class="header-number-cell">
                <div class="number-wrap">
                  <span class="number-label">Nº:</span>
                  <span class="number-value">${escapeHtml(getOrderNumberLabel(order))}</span>
                </div>
              </td>
            </tr>
          </table>

          <table class="info-table">
            <tr>
              <td class="label" style="width:14%;">Administração:</td>
              <td style="width:54%;">${escapeHtml(order.administracao || '')}</td>
              <td class="label" style="width:16%;">DT. INÍCIO:</td>
              <td style="width:16%;">${escapeHtml(formatDate(order.dataInicio))}</td>
            </tr>
            <tr>
              <td class="label">Veículo:</td>
              <td>${escapeHtml(vehicle ? vehicle.modelo : '')}</td>
              <td class="label">DT. TÉRMINO:</td>
              <td>${escapeHtml(formatDate(order.dataTermino))}</td>
            </tr>
            <tr>
              <td class="label">Placa:</td>
              <td>${escapeHtml(vehicle ? vehicle.placa : '')}</td>
              <td class="label" style="width:16%;">KM INICIAL:</td>
              <td style="width:16%;">${escapeHtml(kmData.kmInicial || '')}</td>
            </tr>
            <tr>
              <td class="label">Chassi:</td>
              <td>${escapeHtml(vehicle ? vehicle.chassi || '' : '')}</td>
              <td class="label">KM FINAL:</td>
              <td>${escapeHtml(kmData.kmFinal || '')}</td>
            </tr>
            <tr>
              <td class="label">Responsável:</td>
              <td colspan="5">${escapeHtml(driver ? driver.nome : order.responsavelNome || '')}</td>
            </tr>
          </table>

          <table class="desc-title block-gap">
            <tr>
              <td>DESCRIÇÃO DO SERVIÇO/PROBLEMA:</td>
            </tr>
          </table>

          <table class="desc-box">
            <tr>
              <td>${escapeHtml(printableDescription || '')}</td>
            </tr>
          </table>

          <table class="signature-block block-gap">
            <tr>
              <td>
                <div class="sign-wrap">
                  <div class="sign-line"></div>
                  <div class="sign-label">AUTORIZADOR</div>
                </div>
              </td>
            </tr>
          </table>

          <table class="finance-table">
            <thead>
              <tr>
                <th style="width: 14%;">DATA<br>VENCIMENTO</th>
                <th>FORNECEDOR E NFs</th>
                <th style="width: 17%;">DÉBITO</th>
                <th style="width: 16%;">CRÉDITO</th>
                <th style="width: 16%;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
              <tr class="total-row">
                <td colspan="3" class="finance-total-spacer"></td>
                <td class="finance-total-label">TOTAL</td>
                <td class="money ${entries.length ? '' : 'money-empty'}">${entries.length ? escapeHtml(formatCurrency(totalEntries)) : 'R$'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        ${reopenHistory.length ? `
          <div class="sheet reopen-sheet">
            <table class="top-strip">
              <tr><td></td></tr>
            </table>
            <table class="header-table">
              <tr>
                <td class="header-logo-cell"><img class="brand-logo" src="${getActiveLogoSrc()}" alt="WeFrotas"></td>
                <td class="header-main-cell">
                  <div class="admin-line">${escapeHtml(order.administracao || 'NOME PREENCHIDO NA ADMINISTRAÇÃO')}</div>
                  <div class="title-line">Histórico de reaberturas da OS</div>
                  <div class="status-line">OS Nº: ${escapeHtml(getOrderNumberLabel(order))}</div>
                </td>
                <td class="header-number-cell">
                  <div class="number-wrap">
                    <span class="number-label">Nº:</span>
                    <span class="number-value">${escapeHtml(getOrderNumberLabel(order))}</span>
                  </div>
                </td>
              </tr>
            </table>
            <table class="reopen-table">
              <thead>
                <tr>
                  <th style="width:8%;">#</th>
                  <th style="width:18%;">Data</th>
                  <th style="width:14%;">Hora</th>
                  <th>Justificativa</th>
                </tr>
              </thead>
              <tbody>${reopenHistoryRows}</tbody>
            </table>
          </div>
        ` : ''}
      `;
    }

    function printSelectedOrder() {
      if (!selectedOrders.size) {
        showToast('Selecione ao menos uma OS para imprimir.');
        return;
      }
      const selectedOrderRecords = Array.from(selectedOrders)
        .map(id => allOrders.find(item => item.id === id))
        .filter(Boolean);
      if (!selectedOrderRecords.length) {
        showToast('Não foi possível localizar as OS selecionadas.');
        return;
      }
      const order = selectedOrderRecords[0];
      if (!order) return;
      const vehicle = allVehicles.find(item => item.id === order.vehicleId);
      const driver = allDrivers.find(item => item.id === order.driverId);
      const kmData = getOrderKmData(order.id);
      const entries = allFinanceEntries.filter(item => item.orderId === order.id);
      const totalEntries = sumFinanceNetTotal(entries);
      const statusLabel = (order.status || 'aberta').charAt(0).toUpperCase() + (order.status || 'aberta').slice(1);
      const printableDescription = getOrderPrintableDescription(order);
      const reopenHistory = getOrderReopenHistory(order);
      const reopenHistoryRows = reopenHistory.map((item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(item.dateLabel || formatDate(item.date) || '-')}</td>
          <td>${escapeHtml(item.timeLabel || '-')}</td>
          <td>${escapeHtml(item.reason || '-')}</td>
        </tr>
      `).join('');

      let runningTotal = 0;
      const rows = Array.from({ length: Math.max(entries.length, 24) }, (_, index) => {
        const entry = entries[index];
        if (entry) {
          runningTotal += getFinanceNetTotal(entry);
        }
        return `
          <tr>
            <td>${entry ? escapeHtml(formatDate(getFinanceEntryDate(entry))) : ''}</td>
            <td>${entry ? escapeHtml(getFinanceSupplierSummary(entry)) : ''}</td>
            <td class="money">${entry && entry.kind === 'despesa' ? escapeHtml(formatCurrency(entry.total)) : ''}</td>
            <td class="money">${entry && entry.kind === 'receita' ? escapeHtml(formatCurrency(entry.total)) : ''}</td>
            <td class="money">${entry ? escapeHtml(formatCurrency(runningTotal)) : ''}</td>
          </tr>
        `;
      }).join('');

      const printWindow = window.open('', '_blank', 'width=980,height=1200');
      if (!printWindow) {
        showToast('Não foi possível abrir a janela de impressão.');
        return;
      }

      printWindow.document.open();
      if (selectedOrderRecords.length > 1) {
        const printPages = selectedOrderRecords
          .map((selectedOrder, index) => buildPrintableOrderPageHtml(selectedOrder, index > 0))
          .join('');
        printWindow.document.write(`
          <!doctype html>
          <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <title>OS em lote - ${selectedOrderRecords.length} ordens</title>
            <style>
              @page { size: A4; margin: 8mm; }
              * {
                box-sizing: border-box;
                font-family: Arial, Helvetica, sans-serif;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                color-adjust: exact;
                -moz-print-color-adjust: exact;
              }
              html, body { margin: 0; padding: 0; background: #fff; color: #000; }
              body { padding: 8px; }
              .sheet { width: 196mm; max-width: 100%; margin: 0 auto; }
              .sheet-page-break {
                page-break-before: always;
                break-before: page;
              }
              table {
                width: 100%;
                table-layout: fixed;
                border-collapse: collapse;
                border: 1px solid #000;
                empty-cells: show;
              }
              td, th {
                border: 1px solid #000;
                padding: 2px 4px;
                font-size: 10px;
                vertical-align: middle;
              }
              .top-strip td { height: 20px; background: #d9d9d9 !important; }
              .header-logo-cell { width: 22%; padding: 10px 12px 6px 20px; text-align: left; }
              .header-main-cell { width: 56%; text-align: center; padding: 10px 8px 8px; }
              .header-number-cell { width: 22%; text-align: right; padding: 20px 18px 8px 8px; }
              .brand-logo { max-width: ${getOsLogoStyle().width}px; max-height: ${getOsLogoStyle().height}px; object-fit: contain; display: block; }
              .admin-line { font-size: 10px; font-weight: 800; letter-spacing: 0.02em; margin-bottom: 10px; }
              .title-line { font-size: 15px; font-weight: 800; line-height: 1.2; }
              .status-line { margin-top: 16px; font-size: 10px; font-weight: 700; }
              .number-wrap { display: inline-flex; align-items: baseline; gap: 6px; }
              .number-label { font-size: 18px; font-style: italic; font-weight: 800; }
              .number-value { font-size: 22px; font-style: italic; font-weight: 800; line-height: 1; }
              .info-table td { height: 18px; }
              .label { font-weight: 700; }
              .block-gap { margin-top: 24px; }
              .desc-title td { height: 40px; text-align: center; font-size: 11px; font-weight: 800; text-transform: uppercase; background: #d9d9d9 !important; }
              .desc-box td { height: 90px; vertical-align: top; padding: 8px; white-space: pre-wrap; line-height: 1.42; font-size: 13px; }
              .signature-block td { height: 74px; }
              .sign-wrap { width: 250px; margin: 40px auto 0; text-align: center; }
              .sign-line { width: 100%; border-top: 1px solid #000; min-height: 1px; display: block; }
              .sign-label { margin-top: 2px; font-size: 11px; font-weight: 800; }
              .finance-table {
                margin-top: 0;
                page-break-inside: avoid;
                break-inside: avoid;
              }
              .finance-table th {
                height: 48px;
                background: #d9d9d9 !important;
                text-align: center;
                font-size: 10px;
                font-weight: 800;
                text-transform: uppercase;
                line-height: 1.1;
              }
              .finance-table td {
                height: 21px;
                font-size: 10px;
                page-break-inside: avoid;
                break-inside: avoid;
              }
              .finance-table tr {
                page-break-inside: avoid;
                break-inside: avoid;
              }
              .money { text-align: right; white-space: nowrap; }
              .money-empty { text-align: left; }
              .total-row td { height: 28px; }
              .finance-table td.finance-total-spacer {
                border-left: none !important;
                border-bottom: none !important;
                border-right: none !important;
                border-top: 1px solid #000 !important;
              }
              .finance-total-label { text-align: center; font-size: 11px; font-weight: 800; }
              .reopen-sheet {
                page-break-before: always;
                break-before: page;
              }
              .reopen-table th,
              .reopen-table td {
                height: 28px;
                font-size: 11px;
                vertical-align: top;
                padding: 6px;
              }
              .reopen-table th {
                background: #d9d9d9 !important;
                text-align: center;
                text-transform: uppercase;
              }
              @media print {
                table, td, th {
                  border-color: #000 !important;
                  border-style: solid !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  -moz-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
                td, th { border-width: 1pt !important; }
                table { border-width: 1pt !important; }
              }
            </style>
          </head>
          <body>
            ${printPages}
            <script>
              window.onload = function () {
                setTimeout(function () {
                  window.print();
                  window.close();
                }, 180);
              };
            <\/script>
          </body>
          </html>
        `);
        printWindow.document.close();
        return;
      }
      printWindow.document.write(`
        <!doctype html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>OS ${escapeHtml(getOrderNumberLabel(order))}</title>
          <style>
            @page { size: A4; margin: 8mm; }
            * {
              box-sizing: border-box;
              font-family: Arial, Helvetica, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color-adjust: exact;
              -moz-print-color-adjust: exact;
            }
            html, body { margin: 0; padding: 0; background: #fff; color: #000; }
            body { padding: 8px; }
            .sheet { width: 196mm; max-width: 100%; margin: 0 auto; }
            table {
              width: 100%;
              table-layout: fixed;
              border-collapse: collapse;
              border: 1px solid #000;
              empty-cells: show;
            }
            td, th {
              border: 1px solid #000;
              padding: 2px 4px;
              font-size: 10px;
              vertical-align: middle;
            }
            .top-strip td { height: 20px; background: #d9d9d9 !important; }
            .header-logo-cell { width: 22%; padding: 10px 12px 6px 20px; text-align: left; }
            .header-main-cell { width: 56%; text-align: center; padding: 10px 8px 8px; }
            .header-number-cell { width: 22%; text-align: right; padding: 20px 18px 8px 8px; }
            .brand-logo { max-width: ${getOsLogoStyle().width}px; max-height: ${getOsLogoStyle().height}px; object-fit: contain; display: block; }
            .admin-line { font-size: 10px; font-weight: 800; letter-spacing: 0.02em; margin-bottom: 10px; }
            .title-line { font-size: 15px; font-weight: 800; line-height: 1.2; }
            .status-line { margin-top: 16px; font-size: 10px; font-weight: 700; }
            .number-wrap { display: inline-flex; align-items: baseline; gap: 6px; }
            .number-label { font-size: 18px; font-style: italic; font-weight: 800; }
            .number-value { font-size: 22px; font-style: italic; font-weight: 800; line-height: 1; }
            .info-table td { height: 18px; }
            .label { font-weight: 700; }
            .gray-cell { background: #d9d9d9 !important; }
            .block-gap { margin-top: 24px; }
            .desc-title td { height: 40px; text-align: center; font-size: 11px; font-weight: 800; text-transform: uppercase; background: #d9d9d9 !important; }
            .desc-box td { height: 90px; vertical-align: top; padding: 8px; white-space: pre-wrap; line-height: 1.42; font-size: 13px; }
            .signature-block td { height: 74px; }
            .sign-wrap { width: 250px; margin: 40px auto 0; text-align: center; }
            .sign-line { width: 100%; border-top: 1px solid #000; min-height: 1px; display: block; }
            .sign-label { margin-top: 2px; font-size: 11px; font-weight: 800; }
            .finance-table {
              margin-top: 0;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .finance-table th {
                height: 48px;
                background: #d9d9d9 !important;
                text-align: center;
                font-size: 10px;
                font-weight: 800;
                text-transform: uppercase;
                line-height: 1.1;
              }
            .finance-table td {
              height: 21px;
              font-size: 10px;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .finance-table tr {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .money { text-align: right; white-space: nowrap; }
            .money-empty { text-align: left; }
            .total-row td { height: 28px; }
            .finance-table td.finance-total-spacer {
              border-left: none !important;
              border-bottom: none !important;
              border-right: none !important;
              border-top: 1px solid #000 !important;
            }
            .finance-total-label { text-align: center; font-size: 11px; font-weight: 800; }
            .reopen-sheet {
              page-break-before: always;
              break-before: page;
            }
            .reopen-title {
              margin: 0 0 12px;
              font-size: 16px;
              font-weight: 800;
              text-align: center;
              text-transform: uppercase;
            }
            .reopen-subtitle {
              margin: 0 0 18px;
              font-size: 11px;
              text-align: center;
            }
            .reopen-table th,
            .reopen-table td {
              height: 28px;
              font-size: 11px;
              vertical-align: top;
              padding: 6px;
            }
            .reopen-table th {
              background: #d9d9d9 !important;
              text-align: center;
              text-transform: uppercase;
            }
            @media print {
              table, td, th {
                border-color: #000 !important;
                border-style: solid !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                -moz-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              td, th { border-width: 1pt !important; }
              table { border-width: 1pt !important; }
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <table class="top-strip">
              <tr><td></td></tr>
            </table>

            <table class="header-table">
              <tr>
                <td class="header-logo-cell"><img class="brand-logo" src="${getActiveLogoSrc()}" alt="WeFrotas"></td>
                <td class="header-main-cell">
                  <div class="admin-line">${escapeHtml(order.administracao || 'NOME PREENCHIDO NA ADMINISTRAÇÃO')}</div>
                  <div class="title-line">Ordem de Serviço para veículos/Máquinas</div>
                  <div class="status-line">Status: ${escapeHtml(statusLabel)}</div>
                </td>
                <td class="header-number-cell">
                  <div class="number-wrap">
                    <span class="number-label">Nº:</span>
                    <span class="number-value">${escapeHtml(getOrderNumberLabel(order))}</span>
                  </div>
                </td>
              </tr>
            </table>

            <table class="info-table">
              <tr>
                <td class="label" style="width:14%;">Administração:</td>
                <td style="width:54%;">${escapeHtml(order.administracao || '')}</td>
                <td class="label" style="width:16%;">DT. INÍCIO:</td>
                <td style="width:16%;">${escapeHtml(formatDate(order.dataInicio))}</td>
              </tr>
              <tr>
                <td class="label">Veículo:</td>
                <td>${escapeHtml(vehicle ? vehicle.modelo : '')}</td>
                <td class="label">DT. TÉRMINO:</td>
                <td>${escapeHtml(formatDate(order.dataTermino))}</td>
              </tr>
              <tr>
                <td class="label">Placa:</td>
                <td>${escapeHtml(vehicle ? vehicle.placa : '')}</td>
                <td class="label" style="width:16%;">KM INICIAL:</td>
                <td style="width:16%;">${escapeHtml(kmData.kmInicial || '')}</td>
              </tr>
              <tr>
                <td class="label">Chassi:</td>
                <td>${escapeHtml(vehicle ? vehicle.chassi || '' : '')}</td>
                <td class="label">KM FINAL:</td>
                <td>${escapeHtml(kmData.kmFinal || '')}</td>
              </tr>
              <tr>
                <td class="label">Responsável:</td>
                <td colspan="5">${escapeHtml(driver ? driver.nome : order.responsavelNome || '')}</td>
              </tr>
            </table>

            <table class="desc-title block-gap">
              <tr>
                <td>DESCRIÇÃO DO SERVIÇO/PROBLEMA:</td>
              </tr>
            </table>

            <table class="desc-box">
              <tr>
                <td>${escapeHtml(printableDescription || '')}</td>
              </tr>
            </table>

            <table class="signature-block block-gap">
              <tr>
                <td>
                  <div class="sign-wrap">
                    <div class="sign-line"></div>
                    <div class="sign-label">AUTORIZADOR</div>
                  </div>
                </td>
              </tr>
            </table>

            <table class="finance-table">
              <thead>
                <tr>
                  <th style="width: 14%;">DATA<br>VENCIMENTO</th>
                  <th>FORNECEDOR E NFs</th>
                  <th style="width: 17%;">DÉBITO</th>
                  <th style="width: 16%;">CRÉDITO</th>
                  <th style="width: 16%;">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
                <tr class="total-row">
                  <td colspan="3" class="finance-total-spacer"></td>
                  <td class="finance-total-label">TOTAL</td>
                  <td class="money ${entries.length ? '' : 'money-empty'}">${entries.length ? escapeHtml(formatCurrency(totalEntries)) : 'R$'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          ${reopenHistory.length ? `
            <div class="sheet reopen-sheet">
              <table class="top-strip">
                <tr><td></td></tr>
              </table>
              <table class="header-table">
                <tr>
                  <td class="header-logo-cell"><img class="brand-logo" src="${getActiveLogoSrc()}" alt="WeFrotas"></td>
                  <td class="header-main-cell">
                    <div class="admin-line">${escapeHtml(order.administracao || 'NOME PREENCHIDO NA ADMINISTRAÇÃO')}</div>
                    <div class="title-line">Histórico de reaberturas da OS</div>
                    <div class="status-line">OS Nº: ${escapeHtml(getOrderNumberLabel(order))}</div>
                  </td>
                  <td class="header-number-cell">
                    <div class="number-wrap">
                      <span class="number-label">Nº:</span>
                      <span class="number-value">${escapeHtml(getOrderNumberLabel(order))}</span>
                    </div>
                  </td>
                </tr>
              </table>
              <table class="reopen-table">
                <thead>
                  <tr>
                    <th style="width:8%;">#</th>
                    <th style="width:18%;">Data</th>
                    <th style="width:14%;">Hora</th>
                    <th>Justificativa</th>
                  </tr>
                </thead>
                <tbody>${reopenHistoryRows}</tbody>
              </table>
            </div>
          ` : ''}
          <script>
            window.onload = function () {
              setTimeout(function () {
                window.print();
                window.close();
              }, 180);
            };
          <\/script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }

    function renderAll() {
      syncAllocatedOrderStatuses();
      renderHomeCards();
      renderVehicles();
      renderDrivers();
      renderSuppliers();
      renderOrders();
      renderFinance();
      renderReports();
    }

    document.getElementById('cadastro-form').addEventListener('submit', function (event) {
      event.preventDefault();
      if (currentModalType === 'vehicle') {
        const numeroFrota = document.getElementById('vehicle-frota').value.trim();
        const placa = document.getElementById('vehicle-placa').value.trim();
        const modelo = document.getElementById('vehicle-modelo').value.trim();
        const ano = document.getElementById('vehicle-ano').value.trim();
        const cor = document.getElementById('vehicle-cor').value.trim();
        const seguroVencimento = document.getElementById('vehicle-seguro').value.trim();
        const motoristaId = document.getElementById('vehicle-motorista').value.trim();
        const chassi = document.getElementById('vehicle-chassi').value.trim();
        if (!numeroFrota || !placa || !modelo || !ano) {
          showToast('Preencha número de frota, placa, modelo e ano.');
          return;
        }
        if (findVehicleDuplicate({ numeroFrota, placa }, currentEditingId)) {
          showToast('Já existe um veículo com essa frota ou placa cadastrada.');
          return;
        }
        if (currentEditingId) {
          allVehicles = allVehicles.map(vehicle => vehicle.id === currentEditingId
            ? { ...vehicle, numeroFrota, placa, modelo, ano, cor, seguroVencimento, motoristaId, chassi }
            : vehicle);
          showToast('Veículo atualizado com sucesso.');
        } else {
          allVehicles.unshift({ id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, numeroFrota, placa, modelo, ano, cor, seguroVencimento, motoristaId, chassi });
          showToast('Veículo cadastrado com sucesso.');
        }
        saveToLocalStorage();
        renderAll();
        closeCadastroModal();
      }

      if (currentModalType === 'driver') {
        const nome = document.getElementById('driver-nome').value.trim();
        const cpf = formatCpf(document.getElementById('driver-cpf').value.trim());
        const cnh = document.getElementById('driver-cnh').value.trim();
        const categoria = document.getElementById('driver-categoria').value.trim();
        const telefone = document.getElementById('driver-telefone').value.trim();
        const validade = document.getElementById('driver-validade').value.trim();
        const vehicleIds = getSelectedDriverVehicleIds();
        if (!nome || !cpf || !cnh || !categoria) {
          showToast('Preencha nome, CPF, CNH e categoria do motorista.');
          return;
        }
        if (!isValidCpf(cpf)) {
          showToast('Informe um CPF válido para o motorista.');
          return;
        }
        if (findDriverDuplicate({ cpf, cnh }, currentEditingId)) {
          showToast('Já existe um motorista com esse CPF ou CNH cadastrado.');
          return;
        }
        if (currentEditingId) {
          allDrivers = allDrivers.map(driver => driver.id === currentEditingId
            ? { ...driver, nome, cpf, cnh, categoria, telefone, validade, vehicleIds }
            : driver);
          syncVehiclesWithDriver(currentEditingId, vehicleIds);
          showToast('Motorista atualizado com sucesso.');
        } else {
          const newDriverId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          allDrivers.unshift({ id: newDriverId, nome, cpf, cnh, categoria, telefone, validade, vehicleIds });
          syncVehiclesWithDriver(newDriverId, vehicleIds);
          showToast('Motorista cadastrado com sucesso.');
        }
        saveToLocalStorage();
        renderAll();
        closeCadastroModal();
      }

      if (currentModalType === 'supplier') {
        const nome = document.getElementById('supplier-name').value.trim();
        const tipo = document.getElementById('supplier-type').value;
        const documento = formatCpfOrCnpj(document.getElementById('supplier-document').value.trim());
        const telefone = document.getElementById('supplier-phone').value.trim();
        const email = document.getElementById('supplier-email').value.trim();
        const observacoes = document.getElementById('supplier-notes').value.trim();
        if (!nome || !tipo) {
          showToast('Preencha o nome do parceiro e o tipo de fornecedor.');
          return;
        }
        if (documento) {
          const digits = onlyDigits(documento);
          const validDocument = digits.length === 11 ? isValidCpf(documento) : digits.length === 14 ? isValidCnpj(documento) : false;
          if (!validDocument) {
            showToast('Informe um CPF ou CNPJ válido para o parceiro.');
            return;
          }
        }
        if (findSupplierDuplicate({ nome, tipo, documento }, currentEditingId)) {
          showToast('Já existe um fornecedor igual cadastrado.');
          return;
        }
        const tipoLabel = getSupplierTypeLabel(tipo);
        if (currentEditingId) {
          allSuppliers = allSuppliers.map(supplier => supplier.id === currentEditingId
            ? { ...supplier, nome, tipo, tipoLabel, documento, telefone, email, observacoes }
            : supplier);
          showToast('Fornecedor atualizado com sucesso.');
        } else {
          allSuppliers.unshift({ id: generateId(), nome, tipo, tipoLabel, documento, telefone, email, observacoes });
          showToast('Fornecedor cadastrado com sucesso.');
        }
        saveToLocalStorage();
        renderAll();
        closeCadastroModal();
      }

      if (currentModalType === 'order') {
        const rawNumero = document.getElementById('order-numero').value.trim();
        const numero = allowManualOrderNumberEditing || currentEditingId
          ? normalizeOrderNumberInput(rawNumero)
          : String(getNextOrderCounterValue());
        const administracao = getOrderAdministrationFormValue();
        const tipoOs = document.getElementById('order-tipo-os')?.value || 'avulsa';
        const vehicleId = document.getElementById('order-veiculo').value;
        const driverId = document.getElementById('order-driver').value;
        const dataInicio = document.getElementById('order-data-inicio').value;
        const dataTermino = document.getElementById('order-data-termino').value;
        const status = document.getElementById('order-status').value;
        const descricao = document.getElementById('order-descricao').value.trim();
        const responsavelNome = getDriverLabel(driverId);
        if (!vehicleId || !descricao) {
          showToast('Selecione um veículo e preencha a descrição da OS.');
          return;
        }
        if (!numero) {
          showToast('Informe um número válido para a OS.');
          return;
        }
        if (!validateOrderDateRange(dataInicio, dataTermino)) {
          return;
        }
        if (findOrderNumberDuplicate(numero, currentEditingId)) {
          showToast(`Já existe uma OS com o número ${String(numero).padStart(4, '0')}.`);
          return;
        }
        if (currentEditingId) {
          allOrders = allOrders.map(order => order.id === currentEditingId
            ? { ...order, numero, administracao, tipoOs, vehicleId, driverId, responsavelNome, dataInicio, dataTermino, status, descricao }
            : order);
          syncOrderCounterWithOrders();
          showToast('OS atualizada com sucesso.');
        } else {
          allOrders.unshift({ id: generateId(), numero, administracao, tipoOs, vehicleId, driverId, responsavelNome, dataInicio, dataTermino, status, descricao });
          syncOrderCounterWithOrders();
          showToast('OS cadastrada com sucesso.');
        }
        saveToLocalStorage();
        renderAll();
        closeCadastroModal();
      }

      if (currentModalType === 'finance') {
        const entryType = currentFinanceEntryType || 'despesa';
        const kind = document.getElementById('finance-kind').value;
        const supplierSearch = document.getElementById('finance-supplier-search')?.value || '';
        let supplierId = document.getElementById('finance-supplier-id').value;
        if (!supplierId && supplierSearch.trim()) {
          const resolvedSupplier = resolveSupplierByRelevantTerms(supplierSearch);
          supplierId = resolvedSupplier?.id || '';
          const hiddenSupplierField = document.getElementById('finance-supplier-id');
          if (hiddenSupplierField) hiddenSupplierField.value = supplierId;
        }
        const totalField = document.getElementById('finance-total').value;
        const total = parseCurrencyInputValue(totalField);
        const supplier = allSuppliers.find(item => item.id === supplierId);
        const fornecedor = supplier ? supplier.nome : '';
        const supplierType = supplier ? supplier.tipo : '';
        const observacoes = document.getElementById('finance-observacoes').value.trim();

        if (entryType === 'combustivel') {
          const vehicleSearch = document.getElementById('finance-vehicle-search')?.value || '';
          let vehicleId = document.getElementById('finance-vehicle-id').value;
          if (!vehicleId && vehicleSearch.trim()) {
            const resolvedVehicle = resolveVehicleFromSearch(vehicleSearch);
            vehicleId = resolvedVehicle?.id || '';
            const hiddenVehicleField = document.getElementById('finance-vehicle-id');
            if (hiddenVehicleField) hiddenVehicleField.value = vehicleId;
          }
          const dataAbastecimento = document.getElementById('finance-data-abastecimento').value;
          const fuelType = document.getElementById('finance-fuel-type')?.value || '';
          const km = document.getElementById('finance-km')?.value || '';
          const litros = document.getElementById('finance-litros')?.value || '';
          const driverId = document.getElementById('finance-driver-id')?.value || '';
          const comprovanteUrl = document.getElementById('finance-comprovante-url')?.value.trim() || '';
          if (!vehicleId || !dataAbastecimento || !supplierId) {
            showToast('Selecione o veículo, o posto e a data de abastecimento.');
            return;
          }
          if (supplierType !== 'posto') {
            showToast('Selecione um posto de combustível válido para o abastecimento.');
            return;
          }
          if (!fuelType) {
            showToast('Selecione o tipo de combustível para o abastecimento.');
            return;
          }
          const mileageError = validateFuelMileageForVehicle({ vehicleId, date: dataAbastecimento, km, excludeId: currentEditingId || '' });
          if (mileageError) {
            showToast(mileageError);
            return;
          }

          const payload = {
            entryType,
            vehicleId,
            orderId: '',
            kind,
            kindLabel: 'Despesa',
            supplierId,
            supplierType,
            fornecedor,
            fuelType,
            km,
            litros,
            driverId,
            comprovanteUrl,
            dataAbastecimento,
            dataVencimento: '',
            nf: '',
            total,
            observacoes,
            groupedIntoId: '',
            workflowStatus: 'pendente',
            closedExpense: false,
            discount: 0
          };

          const persistFuelEntry = () => {
            if (currentEditingId) {
              allFinanceEntries = allFinanceEntries.map(entry => entry.id === currentEditingId ? { ...entry, ...payload } : entry);
              showToast('Abastecimento atualizado com sucesso.');
            } else {
              allFinanceEntries.unshift({ id: generateId(), createdAt: new Date().toISOString(), ...payload });
              showToast('Abastecimento registrado com sucesso.');
            }
            saveToLocalStorage();
            renderAll();
            closeCadastroModal();
          };

          const similarFuelEntry = findSimilarFuelEntry({
            vehicleId,
            dataAbastecimento,
            total,
            excludeId: currentEditingId || ''
          });
          if (similarFuelEntry) {
            openPromptModal({
              mode: 'confirm',
              title: 'Possível lançamento duplicado',
              text: `Já existe um abastecimento para este veículo em ${formatDate(dataAbastecimento)} com valor ${formatCurrency(total)}. Deseja registrar mesmo assim?`,
              confirmLabel: 'Registrar mesmo assim',
              cancelLabel: 'Revisar',
              onConfirm: persistFuelEntry
            });
            return;
          }

          persistFuelEntry();
          return;
        }

        const orderSearch = document.getElementById('finance-order-search')?.value || '';
        let orderId = document.getElementById('finance-order-id').value;
        if (!orderId && orderSearch.trim() && orderSearch.trim().toLowerCase() !== 'lancar sem os por enquanto') {
          const resolvedOrder = resolveOrderFromSearch(orderSearch);
          orderId = resolvedOrder?.id || '';
          const hiddenOrderField = document.getElementById('finance-order-id');
          if (hiddenOrderField) hiddenOrderField.value = orderId;
        }
        const dataVencimento = document.getElementById('finance-data-vencimento').value;
        const nf = normalizeFinanceNoteLabel(document.getElementById('finance-nf').value.trim());
        const km = document.getElementById('finance-km')?.value || '';
        const comprovanteUrl = document.getElementById('finance-comprovante-url')?.value.trim() || '';
        const linkedOrder = allOrders.find(item => item.id === orderId);
        if (!dataVencimento || !supplierId) {
          showToast('Selecione o parceiro e a data de vencimento do lançamento.');
          return;
        }
        if (linkedOrder && linkedOrder.status === 'fechada') {
          showToast('Não é permitido lançar financeiro em OS fechada.');
          return;
        }
        if (supplierType === 'posto') {
          showToast('Postos de combustível só podem ser usados no fluxo de abastecimento.');
          return;
        }

        const payload = {
          entryType,
          orderId: orderId || '',
          vehicleId: linkedOrder?.vehicleId || '',
          kind,
          kindLabel: kind === 'receita' ? 'Receita' : 'Despesa',
          supplierId,
          supplierType,
          fornecedor,
          nf,
          km,
          comprovanteUrl,
          dataVencimento,
          total,
          observacoes
        };

        if (currentEditingId) {
          allFinanceEntries = allFinanceEntries.map(entry => entry.id === currentEditingId ? { ...entry, ...payload } : entry);
          showToast('Lançamento atualizado com sucesso.');
        } else {
          allFinanceEntries.unshift({ id: generateId(), createdAt: new Date().toISOString(), ...payload });
          showToast(orderId ? 'Lançamento vinculado a OS com sucesso.' : 'Lançamento salvo sem OS. Você pode alocar depois.');
        }
        advanceOrderStatusOnFinancialAllocation(orderId);
        saveToLocalStorage();
        renderAll();
        closeCadastroModal();
        return;
      }

      if (currentModalType === 'finance-group') {
        const ids = String(document.getElementById('finance-group-entry-ids')?.value || '')
          .split(',')
          .map(value => value.trim())
          .filter(Boolean);
        const entries = ids
          .map(id => allFinanceEntries.find(entry => entry.id === id))
          .filter(entry => entry && !isFinanceGroupEntry(entry));
        if (!entries.length) {
          showToast('Não foi possível localizar os lançamentos do agrupamento.');
          return;
        }

        const groupingMode = currentEditingId
          ? (currentFinanceEntryType === 'despesa_agrupada' ? 'expense' : 'fuel')
          : getFinanceGroupingMode(entries);
        if (!groupingMode) {
          showToast('Agrupe abastecimentos do mesmo veículo ou despesas do mesmo fornecedor.');
          return;
        }
        const isExpenseGrouping = groupingMode === 'expense';
        const vehicleIds = [...new Set(entries.map(entry => getEntryVehicleId(entry)).filter(Boolean))];
        const vehicleId = isExpenseGrouping ? (vehicleIds.length === 1 ? vehicleIds[0] : '') : getEntryVehicleId(entries[0]);
        const groupOrderSearch = document.getElementById('finance-group-order-search')?.value || '';
        let orderId = document.getElementById('finance-group-order-id').value;
        if (!orderId && groupOrderSearch.trim() && groupOrderSearch.trim().toLowerCase() !== 'deixar pendente') {
          const resolvedOrder = resolveOrderFromSearch(groupOrderSearch, getOpenOrdersSorted().filter(order => !vehicleId || order.vehicleId === vehicleId));
          orderId = resolvedOrder?.id || '';
          const hiddenOrderField = document.getElementById('finance-group-order-id');
          if (hiddenOrderField) hiddenOrderField.value = orderId;
        }
        const dataVencimento = document.getElementById('finance-group-data-vencimento').value;
        const nf = normalizeFinanceNoteLabel(document.getElementById('finance-group-nf').value.trim());
        const baseTotal = parseCurrencyInputValue(document.getElementById('finance-group-base-total').value || 0);
        const total = parseCurrencyInputValue(document.getElementById('finance-group-total').value || 0);
        const discount = parseCurrencyInputValue(document.getElementById('finance-group-discount').value || 0);
        const surcharge = parseCurrencyInputValue(document.getElementById('finance-group-surcharge').value || 0);
        const observacoes = document.getElementById('finance-group-observacoes').value.trim();
        const linkedOrder = orderId ? allOrders.find(item => item.id === orderId) : null;
        if (linkedOrder && linkedOrder.status === 'fechada') {
          showToast('Não é permitido alocar agrupamento em OS fechada.');
          return;
        }
        if (discount > 0 && surcharge > 0) {
          showToast('Use desconto ou acréscimo no agrupamento, nunca os dois ao mesmo tempo.');
          return;
        }
        const expectedTotal = toCurrencyCents(Math.max(baseTotal - discount + surcharge, 0));
        const informedTotal = toCurrencyCents(total);
        if (informedTotal !== expectedTotal) {
          showToast('Revise os valores do agrupamento. A soma final não confere com a regra de desconto/acréscimo.');
          syncFuelGroupingTotals();
          return;
        }

        const payload = {
          entryType: isExpenseGrouping ? 'despesa_agrupada' : 'combustivel_agrupado',
          vehicleId,
          orderId: orderId || '',
          kind: 'despesa',
          kindLabel: 'Despesa',
          supplierId: isExpenseGrouping ? (entries[0].supplierId || '') : '',
          supplierType: isExpenseGrouping ? (entries[0].supplierType || '') : 'posto',
          fornecedor: isExpenseGrouping
            ? `Agrupamento de ${entries.length} despesa(s) - ${entries[0].fornecedor || 'Fornecedor'}`
            : `Agrupamento de ${entries.length} abastecimento(s)`,
          nf,
          dataVencimento,
          baseTotal,
          total,
          observacoes,
          groupedEntryIds: entries.map(entry => entry.id),
          workflowStatus: 'pendente',
          closedExpense: false,
          discount,
          surcharge
        };

        const persistGrouping = () => {
          let targetGroupId = currentEditingId;
          const isNewGroup = !currentEditingId;
          if (currentEditingId) {
            allFinanceEntries = allFinanceEntries.map(entry => entry.id === currentEditingId ? { ...entry, ...payload } : entry);
            showToast('Agrupamento atualizado com sucesso.');
          } else {
            const groupId = generateId();
            targetGroupId = groupId;
            allFinanceEntries = allFinanceEntries.map(entry => ids.includes(entry.id) ? { ...entry, groupedIntoId: groupId } : entry);
            allFinanceEntries.unshift({ id: groupId, createdAt: new Date().toISOString(), ...payload });
            showToast('Agrupamento criado com sucesso.');
          }
          advanceOrderStatusOnFinancialAllocation(orderId);
          saveToLocalStorage();
          closeCadastroModal();
          selectedFinance = targetGroupId ? new Set([targetGroupId]) : new Set();
          renderAll();
          if (isNewGroup && targetGroupId) {
            openPromptModal({
              mode: 'confirm',
              title: 'Agrupamento criado',
              text: 'Deseja fechar essa despesa agora? Se preferir, ela pode continuar pendente para fechamento posterior.',
              confirmLabel: 'Fechar agora',
              cancelLabel: 'Manter pendente',
              onConfirm: () => openCloseFuelExpenseModal(),
              onCancel: () => showToast('Agrupamento mantido como pendente para fechamento posterior.')
            });
          }
        };

        if (discount > 0) {
          openPromptModal({
            mode: 'confirm',
            title: 'Aplicar desconto no agrupamento',
            text: `A soma das notinhas é ${formatCurrency(baseTotal)} e será fechada com desconto de ${formatCurrency(discount)}. Deseja continuar?`,
            confirmLabel: 'Aplicar desconto',
            cancelLabel: 'Revisar',
            onConfirm: persistGrouping
          });
          return;
        }
        if (surcharge > 0) {
          openPromptModal({
            mode: 'confirm',
            title: 'Aplicar acréscimo no agrupamento',
            text: `A soma das notinhas é ${formatCurrency(baseTotal)} e será fechada com acréscimo de ${formatCurrency(surcharge)}. Deseja continuar?`,
            confirmLabel: 'Aplicar acréscimo',
            cancelLabel: 'Revisar',
            onConfirm: persistGrouping
          });
          return;
        }
        persistGrouping();
        return;
      }

      if (currentModalType === 'finance-close') {
        const entry = allFinanceEntries.find(item => item.id === currentEditingId);
        if (!entry) {
          showToast('Não foi possível localizar a despesa para fechamento.');
          return;
        }
        const closeOrderSearch = document.getElementById('finance-close-order-search')?.value || '';
        let orderId = document.getElementById('finance-close-order-id').value;
        if (!orderId && closeOrderSearch.trim()) {
          const resolvedOrder = resolveOrderFromSearch(closeOrderSearch, getOpenOrdersSorted().filter(order => !getEntryVehicleId(entry) || order.vehicleId === getEntryVehicleId(entry)));
          orderId = resolvedOrder?.id || '';
          const hiddenOrderField = document.getElementById('finance-close-order-id');
          if (hiddenOrderField) hiddenOrderField.value = orderId;
        }
        const dataVencimento = document.getElementById('finance-close-data-vencimento').value;
        const nf = normalizeFinanceNoteLabel(document.getElementById('finance-close-nf').value.trim());
        const total = parseCurrencyInputValue(document.getElementById('finance-close-total').value || 0);
        const discount = parseCurrencyInputValue(document.getElementById('finance-close-discount').value || 0);
        const observacoes = document.getElementById('finance-close-observacoes').value.trim();
        const linkedOrder = orderId ? allOrders.find(item => item.id === orderId) : null;
        if (!orderId || !linkedOrder) {
          showToast('Selecione uma OS aberta para fechar a despesa.');
          document.getElementById('finance-close-order-search')?.focus();
          return;
        }
        if (linkedOrder && linkedOrder.status === 'fechada') {
          showToast('Não é permitido alocar em OS fechada.');
          return;
        }

        const workflowStatus = 'distribuido';
        advanceOrderStatusOnFinancialAllocation(orderId);
        allFinanceEntries = allFinanceEntries.map(item => item.id === currentEditingId
          ? {
              ...item,
              orderId: orderId || '',
              dataVencimento,
              nf,
              total,
              discount,
              observacoes,
              workflowStatus,
              closedExpense: true
            }
          : item
        );
        saveToLocalStorage();
        renderAll();
        closeCadastroModal();
        showToast('Despesa fechada e distribuída com sucesso.');
        return;
      }
    });

    async function initializeWeFrotas() {
      await loadFromStorage();
      if (syncAllocatedOrderStatuses()) saveToLocalStorage();
      renderAll();
      updateModuleHeader('home');
      applySidebarState();
      applyThemeState(localStorage.getItem('wefrotas_theme') === 'dark');
      renderNotifications();
      updateCustomLogoUi();
      updateManagerIdentityUi();
      updateOperationSettingsUi();
    }

    initializeWeFrotas();
    document.getElementById('settings-custom-logo-file')?.addEventListener('change', handleCustomLogoUpload);
    document.getElementById('settings-custom-logo-size')?.addEventListener('input', (event) => {
      const sizeLabel = document.getElementById('settings-custom-logo-size-label');
      if (sizeLabel) sizeLabel.textContent = `${event.target.value}%`;
    });
    ['order-filter-search'].forEach(id => {
      const node = document.getElementById(id);
      if (node) node.addEventListener('input', () => {
        orderVehicleFilterId = '';
        renderOrders();
      });
    });
    ['order-filter-start', 'order-filter-end', 'order-filter-status', 'order-filter-sort'].forEach(id => {
      const node = document.getElementById(id);
      if (node) node.addEventListener('change', renderOrders);
    });
    ['finance-filter-search', 'finance-filter-value'].forEach(id => {
      const node = document.getElementById(id);
      if (node) node.addEventListener('input', renderFinance);
    });
    applyCurrencyMaskToInput(document.getElementById('finance-filter-value'));
    ['finance-filter-status', 'finance-filter-start', 'finance-filter-end'].forEach(id => {
      const node = document.getElementById(id);
      if (node) node.addEventListener('change', renderFinance);
    });
    ['vehicle-filter-search'].forEach(id => {
      const node = document.getElementById(id);
      if (node) node.addEventListener('input', renderVehicles);
    });
    ['driver-filter-search'].forEach(id => {
      const node = document.getElementById(id);
      if (node) node.addEventListener('input', renderDrivers);
    });
    ['driver-filter-validity', 'supplier-filter-type'].forEach(id => {
      const node = document.getElementById(id);
      if (node) node.addEventListener('change', id === 'driver-filter-validity' ? renderDrivers : renderSuppliers);
    });
    ['supplier-filter-search'].forEach(id => {
      const node = document.getElementById(id);
      if (node) node.addEventListener('input', renderSuppliers);
    });
    ['report-filter-start', 'report-filter-end'].forEach(id => {
      const node = document.getElementById(id);
      if (node) node.addEventListener('change', renderReports);
    });
    const reportTypeFilter = document.getElementById('report-filter-type');
    if (reportTypeFilter) reportTypeFilter.addEventListener('change', renderReports);
    const reportVehicleFilter = document.getElementById('report-filter-vehicle');
    if (reportVehicleFilter) reportVehicleFilter.addEventListener('change', renderReports);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        toggleSettings(false);
        toggleNotifications(false);
        if (window.innerWidth <= 1120) toggleSidebar(false);
      }
    });
    window.addEventListener('resize', applySidebarState);
    document.addEventListener('click', blockDisabledActionClicks, true);
