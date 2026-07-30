let allVehicles = [];
    let allDrivers = [];
    let allSuppliers = [];
    let allOrders = [];
    let allFinanceEntries = [];
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
    let currentModalType = null;
    let currentEditingId = null;
    let currentFinanceEntryType = null;
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
    let customLogoEnabled = false;
    let customLogoUrl = '';
    let customLogoScale = 60;
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

    function toggleOrderNumberEditing() {
      allowManualOrderNumberEditing = !allowManualOrderNumberEditing;
      updateOperationSettingsUi();
    }

    function saveOperationSettings() {
      const adminInput = document.getElementById('settings-manager-name');
      managerDisplayName = String(adminInput?.value || '').trim() || 'Gestor';
      saveToLocalStorage();
      updateManagerIdentityUi();
      updateOperationSettingsUi();
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
        .replace(/&/g, '&')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function requiredLabel(text) {
      return `${text} <span class="required-mark">*</span>`;
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
        <button type="button" class="global-search-item${index === highlightedModuleIndex ? ' active' : ''}" data-url="${module.url}">
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
      const normalized = rawValue.trim().toLowerCase();
      if (!normalized) return null;

      const exactMatch = vehicles.find(vehicle =>
        getVehicleAutocompleteLabel(vehicle).toLowerCase() === normalized
        || String(vehicle.numeroFrota || '').toLowerCase() === normalized
        || String(vehicle.placa || '').toLowerCase() === normalized
      );
      if (exactMatch) return exactMatch;

      const matches = vehicles.filter(vehicle =>
        getVehicleAutocompleteLabel(vehicle).toLowerCase().includes(normalized)
        || String(vehicle.numeroFrota || '').toLowerCase().includes(normalized)
        || String(vehicle.placa || '').toLowerCase().includes(normalized)
      );
      return matches.length === 1 ? matches[0] : null;
    }

    function resolveOrderFromSearch(rawValue, orders = getOpenOrdersSorted()) {
      const normalized = rawValue.trim().toLowerCase();
      const cleanNormalized = normalized.replace(/^os\s*/i, '');
      if (!normalized) return null;

      const exactMatch = orders.find(order =>
        getOrderAutocompleteLabel(order).toLowerCase() === normalized
        || getOrderNumberLabel(order).toLowerCase() === cleanNormalized
      );
      if (exactMatch) return exactMatch;

      const matches = orders.filter(order =>
        getOrderAutocompleteLabel(order).toLowerCase().includes(normalized)
        || getOrderNumberLabel(order).toLowerCase().includes(cleanNormalized)
      );
      return matches.length === 1 ? matches[0] : null;
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

    function normalizeFinanceNoteLabel(value) {
      const rawValue = String(value || '').trim();
      if (!rawValue) return '';
      const withoutPrefix = rawValue.replace(/^nf[\s.:/-]*/i, '').trim();
      return withoutPrefix ? `NF ${withoutPrefix}` : '';
    }

    function getFinanceAdjustmentBaseTotal(entry) {
      if (isFuelGroupEntry(entry)) {
        return getFuelGroupChildren(entry).reduce((sum, item) => sum + getFinanceTotal(item), 0);
      }
      return Number(entry?.baseTotal || entry?.total || 0);
    }

    function isFinanceEntryLockedForEditing(entry) {
      if (!entry) return false;
      if (entry.groupedIntoId) return true;
      return !!entry.closedExpense || !!entry.orderId || ['pendente_os', 'distribuido'].includes(getFinanceEntryStatus(entry));
    }

    function canReverseFinanceEntry(entry) {
      if (!entry || entry.groupedIntoId) return false;
      return isFinanceEntryLockedForEditing(entry);
    }

    function isFuelEntry(entry) {
      return entry?.entryType === 'combustivel';
    }

    function isFuelGroupEntry(entry) {
      return entry?.entryType === 'combustivel_agrupado';
    }

    function getEntryVehicleId(entry) {
      if (!entry) return '';
      if (entry.vehicleId) return entry.vehicleId;
      const order = allOrders.find(item => item.id === entry.orderId);
      return order?.vehicleId || '';
    }

    function getFinanceEntryDate(entry) {
      return entry?.dataAbastecimento || entry?.dataVencimento || String(entry?.createdAt || '').slice(0, 10) || '';
    }

    function getFinanceEntryStatus(entry) {
      if (isFuelEntry(entry) && entry.groupedIntoId) return 'agrupado';
      if (entry?.workflowStatus) return entry.workflowStatus;
      if (isFuelGroupEntry(entry)) return entry.orderId ? 'distribuido' : 'pendente';
      if (isFuelEntry(entry)) return 'pendente';
      return entry?.orderId ? 'distribuido' : 'pendente';
    }

    function getFinanceEntryDateLabel(entry) {
      if (isFuelGroupEntry(entry)) return entry.dataVencimento ? 'Vencimento' : 'Agrupamento';
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

    function getFuelGroupChildren(entry) {
      if (!isFuelGroupEntry(entry)) return [];
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

    function getFinanceSupplierSummary(entry) {
      if (!entry) return '';
      const noteLabel = normalizeFinanceNoteLabel(entry.nf);
      if (!isFuelGroupEntry(entry)) {
        return [entry.fornecedor, noteLabel, entry.fuelType].filter(Boolean).join('  ');
      }

      const children = getFuelGroupChildren(entry);
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

    function saveToLocalStorage() {
      localStorage.setItem('wefrotas_vehicles', JSON.stringify(allVehicles));
      localStorage.setItem('wefrotas_drivers', JSON.stringify(allDrivers));
      localStorage.setItem('wefrotas_suppliers', JSON.stringify(allSuppliers));
      localStorage.setItem('wefrotas_orders', JSON.stringify(allOrders));
      localStorage.setItem('wefrotas_finance', JSON.stringify(allFinanceEntries));
      localStorage.setItem('wefrotas_deleted_orders', JSON.stringify(deletedOrders));
      localStorage.setItem('wefrotas_order_counter', String(orderCounter));
      localStorage.setItem('wefrotas_notifications', JSON.stringify(systemNotifications));
      localStorage.setItem('wefrotas_custom_logo_enabled', customLogoEnabled ? 'true' : 'false');
      localStorage.setItem('wefrotas_custom_logo_url', customLogoUrl);
      localStorage.setItem('wefrotas_custom_logo_scale', String(customLogoScale || 60));
      localStorage.setItem('wefrotas_manager_display_name', managerDisplayName || 'Gestor');
      localStorage.setItem('wefrotas_allow_manual_order_number_editing', allowManualOrderNumberEditing ? 'true' : 'false');
    }

    function loadFromLocalStorage() {
      const savedVehicles = localStorage.getItem('wefrotas_vehicles');
      const savedDrivers = localStorage.getItem('wefrotas_drivers');
      const savedSuppliers = localStorage.getItem('wefrotas_suppliers');
      const savedOrders = localStorage.getItem('wefrotas_orders');
      const savedFinance = localStorage.getItem('wefrotas_finance');
      const savedDeletedOrders = localStorage.getItem('wefrotas_deleted_orders');
      const savedCounter = localStorage.getItem('wefrotas_order_counter');
      const savedNotifications = localStorage.getItem('wefrotas_notifications');
      const savedCustomLogoEnabled = localStorage.getItem('wefrotas_custom_logo_enabled');
      const savedCustomLogoUrl = localStorage.getItem('wefrotas_custom_logo_url');
      const savedCustomLogoScale = localStorage.getItem('wefrotas_custom_logo_scale');
      const savedManagerDisplayName = localStorage.getItem('wefrotas_manager_display_name');
      const legacyAdministratorName = localStorage.getItem('wefrotas_default_administrator_name');
      const savedAllowManualOrderNumberEditing = localStorage.getItem('wefrotas_allow_manual_order_number_editing');
      if (savedVehicles) allVehicles = JSON.parse(savedVehicles);
      if (savedDrivers) allDrivers = JSON.parse(savedDrivers);
      if (savedSuppliers) allSuppliers = JSON.parse(savedSuppliers);
      if (savedOrders) allOrders = JSON.parse(savedOrders);
      if (savedFinance) allFinanceEntries = JSON.parse(savedFinance);
      if (savedDeletedOrders) deletedOrders = JSON.parse(savedDeletedOrders);
      if (savedCounter) orderCounter = Number(savedCounter) || 1;
      if (savedNotifications) systemNotifications = JSON.parse(savedNotifications);
      customLogoEnabled = savedCustomLogoEnabled === 'true';
      customLogoUrl = savedCustomLogoUrl || '';
      customLogoScale = Number(savedCustomLogoScale) || 60;
      managerDisplayName = savedManagerDisplayName || legacyAdministratorName || 'Gestor';
      allowManualOrderNumberEditing = savedAllowManualOrderNumberEditing === 'true';
      migrateFinanceEntries();
      syncOrderCounterWithOrders();
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

    function parseBrazilianDateToIso(value) {
      const rawValue = String(value || '').trim();
      const match = rawValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!match) return '';
      const [, day, month, year] = match;
      return `${year}-${month}-${day}`;
    }

    function resolveDriverByImportedName(name) {
      const normalized = normalizeComparableText(name);
      if (!normalized) return null;
      const exactMatch = allDrivers.find((driver) => normalizeComparableText(driver.nome) === normalized);
      if (exactMatch) return exactMatch;
      const partialMatches = allDrivers.filter((driver) => normalizeComparableText(driver.nome).includes(normalized) || normalized.includes(normalizeComparableText(driver.nome)));
      return partialMatches.length === 1 ? partialMatches[0] : null;
    }

    function resolveFuelSupplierByImportedName(name) {
      const normalized = normalizeComparableText(name);
      if (!normalized) return null;
      const fuelSuppliers = allSuppliers.filter((supplier) => supplier.tipo === 'posto');
      const exactMatch = fuelSuppliers.find((supplier) => normalizeComparableText(supplier.nome) === normalized);
      if (exactMatch) return exactMatch;
      const partialMatches = fuelSuppliers.filter((supplier) => normalizeComparableText(supplier.nome).includes(normalized) || normalized.includes(normalizeComparableText(supplier.nome)));
      return partialMatches.length === 1 ? partialMatches[0] : null;
    }

    function parseImportedFuelMessage(rawText) {
      const sourceText = String(rawText || '').trim();
      if (!sourceText) return null;

      const normalizedLines = sourceText
        .split(/\r?\n/)
        .map((line) => line.replace(/\*/g, '').replace(/^\s*[^\p{L}\p{N}]+/gu, '').trim())
        .filter(Boolean);

      const readField = (label) => {
        const normalizedLabel = `${normalizeComparableText(label)}:`;
        const line = normalizedLines.find((item) => normalizeComparableText(item).startsWith(normalizedLabel));
        if (!line) return '';
        const separatorIndex = line.indexOf(':');
        return separatorIndex >= 0 ? line.slice(separatorIndex + 1).trim() : '';
      };

      const comprovanteUrlMatch = sourceText.match(/https?:\/\/\S+/i);
      const importedData = {
        motorista: readField('Motorista'),
        cidade: readField('Cidade'),
        posto: readField('Posto'),
        dataBr: readField('Data'),
        dataIso: parseBrazilianDateToIso(readField('Data')),
        km: String(readField('KM') || '').replace(/[^\d]/g, ''),
        comprovanteUrl: comprovanteUrlMatch ? comprovanteUrlMatch[0].trim() : ''
      };

      if (!importedData.motorista || !importedData.posto || !importedData.dataIso) {
        return null;
      }

      return importedData;
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
      const loading = document.getElementById('receipt-viewer-loading');
      const empty = document.getElementById('receipt-viewer-empty');
      const externalLink = document.getElementById('receipt-viewer-external-link');

      backdrop?.classList.add('hidden');
      if (image) {
        image.onload = null;
        image.onerror = null;
        image.src = '';
        image.classList.add('hidden');
      }
      loading?.classList.remove('hidden');
      empty?.classList.add('hidden');
      if (externalLink) externalLink.href = '#';
    }

    function handleReceiptViewerBackdrop(event) {
      if (event.target === event.currentTarget) closeReceiptViewer();
    }

    function viewFinanceReceipt(url) {
      const receiptUrl = String(url || '').trim();
      if (!receiptUrl) {
        showToast('Esse lançamento não possui comprovante vinculado.');
        return;
      }
      const backdrop = document.getElementById('receipt-viewer-backdrop');
      const image = document.getElementById('receipt-viewer-image');
      const loading = document.getElementById('receipt-viewer-loading');
      const empty = document.getElementById('receipt-viewer-empty');
      const externalLink = document.getElementById('receipt-viewer-external-link');

      if (!backdrop || !image || !loading || !empty || !externalLink) {
        window.open(receiptUrl, '_blank', 'noopener,noreferrer');
        return;
      }

      backdrop.classList.remove('hidden');
      loading.classList.remove('hidden');
      empty.classList.add('hidden');
      image.classList.add('hidden');
      externalLink.href = receiptUrl;

      image.onload = () => {
        loading.classList.add('hidden');
        empty.classList.add('hidden');
        image.classList.remove('hidden');
      };

      image.onerror = () => {
        loading.classList.add('hidden');
        image.classList.add('hidden');
        empty.classList.remove('hidden');
      };

      image.src = receiptUrl;
    }

    function openFinanceImportPrompt(initialValue = '') {
      openPromptModal({
        title: 'Importar dados do WhatsApp',
        text: 'Cole abaixo a mensagem completa recebida no WhatsApp para pré-preencher o lançamento de combustível.',
        placeholder: 'Cole aqui o texto com motorista, posto, data, KM e link do comprovante.',
        value: initialValue,
        confirmLabel: 'Importar dados',
        cancelLabel: 'Cancelar',
        onConfirm: (value) => {
          const importedData = parseImportedFuelMessage(value);
          if (!importedData) {
            showToast('Não foi possível identificar os dados do abastecimento. Confira o texto colado.');
            openFinanceImportPrompt(value);
            return;
          }
          openImportedFuelLaunch(importedData);
        }
      });
    }

    function openImportedFuelLaunch(importedData) {
      openCadastroModal('finance');
      loadFinanceForm('combustivel');

      const supplier = resolveFuelSupplierByImportedName(importedData.posto);
      const driver = resolveDriverByImportedName(importedData.motorista);
      const notes = [];

      if (document.getElementById('finance-data-abastecimento')) {
        document.getElementById('finance-data-abastecimento').value = importedData.dataIso;
      }
      if (document.getElementById('finance-km')) {
        document.getElementById('finance-km').value = importedData.km || '';
      }
      if (document.getElementById('finance-supplier-id') && supplier) {
        document.getElementById('finance-supplier-id').value = supplier.id;
      }
      if (document.getElementById('finance-driver-id') && driver) {
        document.getElementById('finance-driver-id').value = driver.id;
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

      const observationsField = document.getElementById('finance-observacoes');
      if (observationsField) {
        observationsField.value = notes.join(' | ');
      }

      updateFinanceReceiptPreview(importedData.comprovanteUrl || '');
      toggleFinanceSpecificFields();

      const pendingFields = ['veículo', 'tipo de combustível', 'valor'];
      if (document.getElementById('finance-litros')) {
        pendingFields.splice(2, 0, 'quantidade em litros');
      }
      showToast(`Dados importados. Revise ${pendingFields.join(', ')} e finalize o lançamento.`);
    }

    function findVehicleDuplicate(payload, ignoreId = null) {
      const placa = normalizeComparableText(payload.placa);
      const frota = normalizeComparableText(payload.numeroFrota);
      return allVehicles.find((item) =>
        item.id !== ignoreId && (
          normalizeComparableText(item.placa) === placa ||
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
        title: 'Frotas',
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
              navigateToModule(filteredModules[0].url);
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
            navigateToModule(selectedModule.url);
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
        navigateToModule(item.dataset.url);
      });
    }

    if (mobileGlobalSearchResultsEl) {
      mobileGlobalSearchResultsEl.addEventListener('click', (event) => {
        const item = event.target.closest('.global-search-item');
        if (!item) return;
        navigateToModule(item.dataset.url);
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

      if (type === 'vehicle') {
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
          <div class="field-wrap full">
            <label>Chassi</label>
            <input class="soft-input w-full" id="vehicle-chassi" placeholder="9BWZZZ377VT004251">
          </div>
        `;
      } else if (type === 'driver') {
        kicker.textContent = 'Motoristas';
        title.textContent = 'Cadastrar motorista';
        fields.innerHTML = `
          <div class="field-wrap full">
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
        `;
      } else if (type === 'supplier') {
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
        kicker.textContent = 'Ordens de serviço';
        title.textContent = 'Cadastrar OS';
        fields.innerHTML = `
          <div class="field-wrap">
            <label>Número da OS</label>
            <input class="soft-input w-full" id="order-numero" value="${String(orderCounter).padStart(4, '0')}" ${allowManualOrderNumberEditing ? '' : 'readonly'}>
          </div>
          <div class="field-wrap">
            <label>Administração</label>
            <input class="soft-input w-full" id="order-administracao" placeholder="Ex: Administração">
          </div>
          <div class="field-wrap">
            <label>${requiredLabel('Veículo')}</label>
            <select class="soft-input w-full" id="order-veiculo" required>
              <option value="">Selecione um veículo</option>
              ${allVehicles.map(vehicle => `<option value="${vehicle.id}">${escapeHtml(vehicle.numeroFrota)}  ${escapeHtml(vehicle.placa)}  ${escapeHtml(vehicle.modelo)}</option>`).join('')}
            </select>
          </div>
          <div class="field-wrap">
            <label>Responsável</label>
            <select class="soft-input w-full" id="order-driver">
              <option value="">Selecione um motorista</option>
              ${allDrivers.map(driver => `<option value="${driver.id}">${escapeHtml(driver.nome)}</option>`).join('')}
            </select>
          </div>
          <div class="field-wrap">
            <label>Data de início</label>
            <input class="soft-input w-full" id="order-data-inicio" type="date">
          </div>
          <div class="field-wrap">
            <label>Data de término</label>
            <input class="soft-input w-full" id="order-data-termino" type="date">
          </div>
          <div class="field-wrap">
            <label>Status</label>
            <select class="soft-input w-full" id="order-status">
              <option value="aberta">Aberta</option>
              <option value="andamento">Em andamento</option>
              <option value="fechada">Fechada</option>
            </select>
          </div>
          <div class="field-wrap full">
            <label>${requiredLabel('Descrição do serviço / problema')}</label>
            <textarea class="soft-input textarea w-full" id="order-descricao" placeholder="Descreva tudo que deve sair na impressão da OS."></textarea>
          </div>
        `;
      } else if (type === 'finance') {
        kicker.textContent = 'Financeiro';
        title.textContent = 'Novo lançamento';
        fields.innerHTML = `
          <div class="field-wrap full">
            <label>O que você quer lançar?</label>
            <div class="grid md:grid-cols-3 gap-4">
              <button type="button" class="soft-btn primary !h-auto py-5 px-5 text-left" onclick="loadFinanceForm('combustivel')">
                <span class="block text-base font-extrabold">Lançamento de combustível</span>
                <span class="block text-sm font-medium opacity-90 mt-2">Seleciona veículo, data de abastecimento, posto, tipo de combustível e KM.</span>
              </button>
              <button type="button" class="soft-btn !h-auto py-5 px-5 text-left" onclick="loadFinanceForm('despesa')">
                <span class="block text-base font-extrabold">Lançamento de despesa</span>
                <span class="block text-sm font-medium text-slate-500 mt-2">Usa a lista completa de parceiros cadastrados no sistema.</span>
              </button>
              <button type="button" class="soft-btn !h-auto py-5 px-5 text-left border-[#99f6e4] text-[#0f766e]" onclick="openFinanceImportPrompt()">
                <span class="block text-base font-extrabold">Importar dados</span>
                <span class="block text-sm font-medium mt-2">Cole a mensagem do WhatsApp e pré-preencha o abastecimento com o link do comprovante.</span>
              </button>
            </div>
          </div>
        `;
        setModalSubmitState(false);
      }

      backdrop.classList.add('show');
      attachModalInputMasks();
    }

    function closeCadastroModal() {
      document.getElementById('modal-backdrop').classList.remove('show');
      document.getElementById('cadastro-form').reset();
      currentModalType = null;
      currentEditingId = null;
      currentFinanceEntryType = null;
      setModalSubmitState(true, 'Salvar cadastro');
      setModalActionsVisible(true);
    }

    function handleModalBackdrop(event) {
      if (event) event.stopPropagation();
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
          allVehicles = parsed.vehicles;
          allDrivers = parsed.drivers;
          allSuppliers = parsed.suppliers.map((supplier) => ({
            ...supplier,
            tipoLabel: getSupplierTypeLabel(supplier.tipo)
          }));
          allOrders = parsed.orders;
          allFinanceEntries = parsed.finance;
          deletedOrders = Array.isArray(parsed.deletedOrders) ? parsed.deletedOrders : [];
          systemNotifications = Array.isArray(parsed.notifications) ? parsed.notifications.slice(0, 30) : [];
          orderCounter = Number(parsed.orderCounter) || 1;
          customLogoEnabled = !!parsed.customLogoEnabled;
          customLogoUrl = parsed.customLogoUrl || '';
          customLogoScale = Number(parsed.customLogoScale) || 60;
          managerDisplayName = parsed.managerDisplayName || parsed.defaultAdministratorName || 'Gestor';
          allowManualOrderNumberEditing = !!parsed.allowManualOrderNumberEditing;
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
      return [];
    }

    function downloadBatchTemplate(entity) {
      if (entity !== 'vehicle') {
        showToast('A importação em lote está disponível apenas para veículos.');
        return;
      }
      const label = 'veículos';
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
      if (entity !== 'vehicle') {
        showToast('A importação em lote está disponível apenas para veículos.');
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
        const existingIndex = allVehicles.findIndex((item) => item.numeroFrota === numeroFrota || item.placa.toLowerCase() === placa.toLowerCase());
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
        if (!nome || !cpf || !cnh || !categoria || !isValidCpf(cpf)) {
          skipped += 1;
          return;
        }
        const payload = { nome, cpf, cnh, categoria, telefone, validade };
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
            updated += 1;
          }
        } else {
          if (findDriverDuplicate(payload)) {
            duplicates += 1;
            return;
          }
          allDrivers.unshift({ id: generateId(), ...payload });
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
      if (entity !== 'vehicle') {
        showToast('A importação em lote está disponível apenas para veículos.');
        return;
      }
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
          const summary = importVehiclesFromRows(rows);
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
      const fuelEntries = allFinanceEntries
        .filter(entry => entry.orderId === orderId && (isFuelEntry(entry) || isFuelGroupEntry(entry)))
        .flatMap(entry => isFuelGroupEntry(entry) ? getFuelGroupChildren(entry) : [entry])
        .filter(entry => isFuelEntry(entry) && entry.km !== '')
        .sort((a, b) => {
          const dateCompare = String(getFinanceEntryDate(a)).localeCompare(String(getFinanceEntryDate(b)));
          if (dateCompare !== 0) return dateCompare;
          return Number(a.km || 0) - Number(b.km || 0);
        });

      if (!fuelEntries.length) {
        return { kmInicial: '', kmFinal: '' };
      }
      return {
        kmInicial: fuelEntries[0].km || '',
        kmFinal: fuelEntries[fuelEntries.length - 1].km || ''
      };
    }

    function getVehicleCurrentKm(vehicleId) {
      const entries = allFinanceEntries
        .filter(entry => isFuelEntry(entry) && getEntryVehicleId(entry) === vehicleId && entry.km !== '' && getFinanceEntryDate(entry))
        .sort((a, b) => {
          const dateCompare = String(getFinanceEntryDate(b)).localeCompare(String(getFinanceEntryDate(a)));
          if (dateCompare !== 0) return dateCompare;
          return Number(b.km || 0) - Number(a.km || 0);
        });

      if (!entries.length) return null;
      return Number(entries[0].km || 0);
    }

    function getRevisionDescription(revisionKm) {
      return `REVISAO DE ${Number(revisionKm || 0).toLocaleString('pt-BR')}KM`;
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
      return allOrders.find(order =>
        order.vehicleId === vehicleId
        && order.status !== 'fechada'
        && normalizeRevisionText(order.descricao).includes(revisionToken)
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
      document.getElementById('order-veiculo').value = vehicle.id;
      document.getElementById('order-data-inicio').value = getLocalIsoDate();
      document.getElementById('order-status').value = 'aberta';
      document.getElementById('order-descricao').value = getRevisionDescription(maintenance.nextRevisionKm);
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

      const vehicleEntriesMap = new Map();
      allFinanceEntries
        .filter(entry => isFuelEntry(entry))
        .forEach(entry => {
          const currentVehicleId = getEntryVehicleId(entry);
          if (!currentVehicleId) return;
          const entryDate = getFinanceEntryDate(entry);
          if (vehicleId && currentVehicleId !== vehicleId) return;
          if (start && (!entryDate || entryDate < start)) return;
          if (end && (!entryDate || entryDate > end)) return;

          const stats = statsMap.get(currentVehicleId);
          if (!stats) return;
          stats.totalCost += Number(entry.total || 0);
          stats.entries += 1;

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
        .filter(item => item.days !== null && item.days >= 0 && item.days <= 45)
        .sort((a, b) => a.days - b.days);

      return { cnhItems, insuranceItems };
    }

    function renderDashboardTableRows(items, formatter) {
      if (!items.length) {
        return '<div class="text-slate-400 text-sm">Nenhum item para exibir no momento.</div>';
      }
      return items.map(formatter).join('');
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
        .filter(entry => !filters.vehicleId || getEntryVehicleId(entry) === filters.vehicleId)
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
            { label: 'Veículos com custo', value: String(vehicleStats.length), help: 'Unidades com abastecimento registrado no período.' },
            { label: 'Custo total', value: formatCurrency(totalCost), help: 'Soma de combustíveis considerados no relatório.' },
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

      if (['orders', 'orders_open', 'orders_progress', 'orders_closed', 'orders_deleted'].includes(filters.type)) {
        const totalLinked = visibleOrders.reduce((sum, order) => {
          if (typeof order.totalLinked === 'number') return sum + order.totalLinked;
          return sum + allFinanceEntries.filter(entry => entry.orderId === order.id).reduce((entrySum, entry) => entrySum + getFinanceTotal(entry), 0);
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
              : allFinanceEntries.filter(entry => entry.orderId === order.id).reduce((sum, entry) => sum + getFinanceTotal(entry), 0);
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
          current.total += getFinanceTotal(entry);
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
          current.total += getFinanceTotal(entry);
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

    function getVisibleFinanceEntries() {
      const quickSearch = normalizeComparableText(document.getElementById('finance-filter-search')?.value || '');
      const supplierFilter = document.getElementById('finance-filter-supplier')?.value.trim().toLowerCase() || '';
      const statusFilter = document.getElementById('finance-filter-status')?.value || '';
      const vehicleFilter = document.getElementById('finance-filter-vehicle')?.value || '';
      const dateFilter = document.getElementById('finance-filter-date')?.value || '';
      const valueFilter = document.getElementById('finance-filter-value')?.value.trim().toLowerCase() || '';

      let visibleEntries = allFinanceEntries
        .filter(entry => !entry.groupedIntoId)
        .sort((a, b) => {
          const dateCompare = String(getFinanceEntryDate(b)).localeCompare(String(getFinanceEntryDate(a)));
          if (dateCompare !== 0) return dateCompare;
          return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
        });

      if (supplierFilter) visibleEntries = visibleEntries.filter(entry => String(entry.fornecedor || '').toLowerCase().includes(supplierFilter));
      if (statusFilter) visibleEntries = visibleEntries.filter(entry => getFinanceEntryStatus(entry) === statusFilter);
      if (vehicleFilter) visibleEntries = visibleEntries.filter(entry => getEntryVehicleId(entry) === vehicleFilter);
      if (dateFilter) visibleEntries = visibleEntries.filter(entry => getFinanceEntryDate(entry) === dateFilter);
      if (quickSearch) {
        visibleEntries = visibleEntries.filter(entry => {
          const order = allOrders.find(item => item.id === entry.orderId);
          const vehicle = allVehicles.find(item => item.id === getEntryVehicleId(entry));
          const haystack = normalizeComparableText([
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

      return visibleEntries;
    }

    function setModalSubmitState(visible, label = 'Salvar cadastro') {
      const button = document.getElementById('modal-submit-btn');
      if (!button) return;
      button.textContent = label;
      button.style.display = visible ? 'inline-flex' : 'none';
    }

    function setModalActionsVisible(visible) {
      const actions = document.getElementById('modal-actions');
      if (!actions) return;
      actions.style.display = visible ? 'flex' : 'none';
    }

    function loadFinanceForm(entryType) {
      currentModalType = 'finance';
      currentFinanceEntryType = entryType;
      const fields = document.getElementById('modal-fields');
      const kicker = document.getElementById('modal-kicker');
      const title = document.getElementById('modal-title');
      const supplierOptions = allSuppliers
        .filter(supplier => entryType === 'combustivel' ? supplier.tipo === 'posto' : supplier.tipo !== 'posto')
        .map(supplier => `<option value="${supplier.id}">${escapeHtml(supplier.nome)}${entryType === 'combustivel' ? '' : `  ${escapeHtml(supplier.tipoLabel)}`}</option>`)
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

      if (entryType === 'combustivel') {
        fields.innerHTML = `
          <input id="finance-kind" type="hidden" value="despesa">
          <div class="field-wrap full">
            <label>${requiredLabel('Veículo')}</label>
            <input id="finance-vehicle-id" type="hidden">
            <input class="soft-input w-full" id="finance-vehicle-search" list="finance-vehicle-options" placeholder="Digite frota, placa ou nome do veículo" autocomplete="off" required>
            <datalist id="finance-vehicle-options">${vehicleOptions}</datalist>
          </div>
          <div class="field-wrap">
            <label>${requiredLabel('Data de abastecimento')}</label>
            <input class="soft-input w-full" id="finance-data-abastecimento" type="date" required>
          </div>
          <div class="field-wrap">
            <label>${requiredLabel('Posto de combustível')}</label>
            <select class="soft-input w-full" id="finance-supplier-id" onchange="toggleFinanceSpecificFields()" required>
              <option value="">Selecione um posto</option>
              ${supplierOptions}
            </select>
          </div>
          <div class="field-wrap">
            <label>Valor</label>
            <input class="soft-input w-full" id="finance-total" type="text" inputmode="numeric" value="${formatCurrencyInputValue(0)}">
          </div>
          <div class="field-wrap">
            <label>QTD em litros</label>
            <input class="soft-input w-full" id="finance-litros" type="number" min="0" step="0.001" placeholder="Ex: 120.500">
          </div>
          <div class="field-wrap" id="finance-fuel-wrap">
            <label>${requiredLabel('Tipo de combustível')}</label>
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
          <div class="field-wrap">
            <label>${requiredLabel('KM')}</label>
            <input class="soft-input w-full" id="finance-km" type="number" min="0" step="1" placeholder="Ex: 50500">
          </div>
          <div class="field-wrap">
            <label>Selecionar motorista</label>
            <select class="soft-input w-full" id="finance-driver-id">
              <option value="">Selecione um motorista</option>
              ${allDrivers.map(driver => `<option value="${driver.id}">${escapeHtml(driver.nome)}</option>`).join('')}
            </select>
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
            <textarea class="soft-input textarea w-full" id="finance-observacoes" placeholder="Observações do abastecimento"></textarea>
          </div>
        `;
      } else {
        fields.innerHTML = `
          <div class="field-wrap full">
            <label>Alocar na OS</label>
            <input id="finance-order-id" type="hidden">
            <input class="soft-input w-full" id="finance-order-search" list="finance-order-options" placeholder="Digite número da OS, frota, placa ou veículo" autocomplete="off">
            <datalist id="finance-order-options">
              <option value="Lançar sem OS por enquanto"></option>
              ${orderOptions}
            </datalist>
          </div>
          <div class="field-wrap">
            <label>${requiredLabel('Natureza financeira')}</label>
            <select class="soft-input w-full" id="finance-kind" required>
              <option value="despesa">Despesa</option>
              <option value="receita">Receita</option>
            </select>
          </div>
          <div class="field-wrap">
            <label>${requiredLabel('Data de vencimento')}</label>
            <input class="soft-input w-full" id="finance-data-vencimento" type="date" required>
          </div>
          <div class="field-wrap">
            <label>${requiredLabel('Fornecedor')}</label>
            <select class="soft-input w-full" id="finance-supplier-id" onchange="toggleFinanceSpecificFields()" required>
              <option value="">Selecione um parceiro</option>
              ${supplierOptions}
            </select>
          </div>
          <div class="field-wrap">
            <label>NF / referência</label>
            <input class="soft-input w-full" id="finance-nf" placeholder="Ex: NF 1542">
          </div>
          <div class="field-wrap">
            <label>KM</label>
            <input class="soft-input w-full" id="finance-km" type="number" min="0" step="1" placeholder="Ex: 50500">
          </div>
          <div class="field-wrap">
            <label>Valor</label>
            <input class="soft-input w-full" id="finance-total" type="text" inputmode="numeric" value="${formatCurrencyInputValue(0)}">
          </div>
          <div class="field-wrap full">
            <label>Observações</label>
            <textarea class="soft-input textarea w-full" id="finance-observacoes" placeholder="Observações do lançamento"></textarea>
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
      }
      toggleFinanceSpecificFields();
      attachModalInputMasks();
      updateFinanceReceiptPreview('');
    }

    function openFuelGroupingModal(editId = null) {
      openCadastroModal('finance');
      currentModalType = 'finance-group';
      currentFinanceEntryType = 'combustivel_agrupado';
      currentEditingId = editId;

      const existingGroup = editId ? allFinanceEntries.find(item => item.id === editId && isFuelGroupEntry(item)) : null;
      const selectedEntries = existingGroup
        ? getFuelGroupChildren(existingGroup)
        : Array.from(selectedFinance)
          .map(id => allFinanceEntries.find(item => item.id === id))
          .filter(entry => entry && isFuelEntry(entry) && !entry.groupedIntoId);

      if (!selectedEntries.length) {
        closeCadastroModal();
        showToast('Selecione abastecimentos pendentes para agrupar.');
        return;
      }
      if (!existingGroup && selectedEntries.length < 2) {
        closeCadastroModal();
        showToast('Selecione pelo menos dois abastecimentos para agrupar.');
        return;
      }

      const vehicleIds = [...new Set(selectedEntries.map(entry => getEntryVehicleId(entry)).filter(Boolean))];
      if (vehicleIds.length !== 1) {
        closeCadastroModal();
        showToast('O agrupamento só pode ser feito com abastecimentos do mesmo veículo.');
        return;
      }

      const vehicleId = vehicleIds[0];
      const vehicle = allVehicles.find(item => item.id === vehicleId);
      const groupOpenOrders = getOpenOrdersSorted()
        .filter(order => order.vehicleId === vehicleId);
      const orderOptions = groupOpenOrders
        .map(order => `<option value="${escapeHtml(getOrderAutocompleteLabel(order))}"></option>`)
        .join('');
      const totalBase = selectedEntries.reduce((sum, entry) => sum + getFinanceTotal(entry), 0);
      const fields = document.getElementById('modal-fields');
      const kicker = document.getElementById('modal-kicker');
      const title = document.getElementById('modal-title');

      kicker.textContent = 'Financeiro';
      title.textContent = existingGroup ? 'Editar agrupamento de abastecimentos' : 'Agrupar abastecimentos';
      fields.innerHTML = `
        <input id="finance-group-entry-ids" type="hidden" value="${selectedEntries.map(entry => entry.id).join(',')}">
        <div class="field-wrap full">
          <label>Veículo do agrupamento</label>
          <div class="soft-input w-full flex items-center">${escapeHtml(vehicle ? `${vehicle.numeroFrota}  ${vehicle.placa}  ${vehicle.modelo}` : '-')}</div>
        </div>
        <div class="field-wrap full">
          <label>Histórico dos abastecimentos</label>
          <div class="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            ${selectedEntries.map(entry => `
              <div class="rounded-2xl border border-slate-200 px-4 py-3 bg-slate-50">
                <div class="flex items-center justify-between gap-3 flex-wrap">
                  <strong class="text-slate-800">${escapeHtml(entry.fornecedor || 'Abastecimento')}</strong>
                  <span class="text-sm font-semibold text-slate-500">${escapeHtml(formatCurrency(getFinanceTotal(entry)))}</span>
                </div>
                <div class="mt-2 text-sm text-slate-500 flex gap-3 flex-wrap">
                  <span>Data: ${escapeHtml(formatDate(getFinanceEntryDate(entry)))}</span>
                  ${entry.fuelType ? `<span>Combustível: ${escapeHtml(entry.fuelType)}</span>` : ''}
                  ${entry.km ? `<span>KM: ${escapeHtml(entry.km)}</span>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
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
      const groupEntry = allFinanceEntries.find(entry => entry.id === selectedId && isFuelGroupEntry(entry));
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
      if (isFuelGroupEntry(entry)) {
        openFuelGroupingModal(entry.id);
        setModalSubmitState(false);
        return;
      }
      editSelectedFinance();
      setModalSubmitState(false);
    }

    function openCloseFuelExpenseModal() {
      if (selectedFinance.size !== 1) {
        showToast('Selecione um lançamento para fechar a despesa.');
        return;
      }
      const entry = allFinanceEntries.find(item => item.id === Array.from(selectedFinance)[0]);
      if (!entry || (!isFuelEntry(entry) && !isFuelGroupEntry(entry))) {
        showToast('Selecione um abastecimento ou agrupamento válido.');
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
          <div class="soft-input w-full flex items-center">${escapeHtml(isFuelGroupEntry(entry) ? 'Agrupamento de abastecimentos' : (entry.fornecedor || 'Abastecimento'))}</div>
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
          <label>Alocar na OS?</label>
          <input id="finance-close-order-id" type="hidden">
          <input class="soft-input w-full" id="finance-close-order-search" list="finance-close-order-options" placeholder="Digite número da OS, frota, placa ou veículo" autocomplete="off">
          <datalist id="finance-close-order-options">
            <option value="Não alocar agora"></option>
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
      const cnhTableNode = document.getElementById('home-cnh-table');
      const insuranceTableNode = document.getElementById('home-insurance-table');
      const maintenanceTableNode = document.getElementById('home-maintenance-table');
      const vehicleStats = getVehicleCostStats().filter(item => item.entries > 0);
      const bestVehicle = vehicleStats[0];
      const { cnhItems, insuranceItems } = getDashboardExpirations();
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
      if (costTableNode) {
        costTableNode.innerHTML = renderDashboardTableRows(
          vehicleStats.slice(0, 6),
          item => `
            <div class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3">
              <div>
                <p class="font-bold text-slate-800">${escapeHtml(item.placa)}  ${escapeHtml(item.modelo)}</p>
                <p class="text-xs text-slate-500">Frota ${escapeHtml(item.frota)}  ${item.totalKm} km  ${item.entries} lançamento(s)</p>
              </div>
              <div class="text-right">
                <p class="font-extrabold text-[#6267d9]">${escapeHtml(formatCurrency(item.costPerKm))}</p>
                <p class="text-xs text-slate-500">${escapeHtml(formatCurrency(item.totalCost))}</p>
              </div>
            </div>
          `
        );
      }
      if (cnhTableNode) {
        cnhTableNode.innerHTML = renderDashboardTableRows(
          cnhItems.slice(0, 6),
          item => `
            <div class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3">
              <div>
                <p class="font-bold text-slate-800">${escapeHtml(item.nome)}</p>
                <p class="text-xs text-slate-500">CPF ${escapeHtml(item.cpf || '-')}  CNH ${escapeHtml(item.cnh || '-')}</p>
              </div>
              <div class="text-right">
                <p class="font-extrabold text-[#6267d9]">${escapeHtml(formatDate(item.validade))}</p>
                <p class="text-xs text-slate-500">${item.days} dia(s)</p>
              </div>
            </div>
          `
        );
      }
      if (insuranceTableNode) {
        insuranceTableNode.innerHTML = renderDashboardTableRows(
          insuranceItems.slice(0, 6),
          item => `
            <div class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3">
              <div>
                <p class="font-bold text-slate-800">${escapeHtml(item.placa)}  ${escapeHtml(item.modelo)}</p>
                <p class="text-xs text-slate-500">Frota ${escapeHtml(item.numeroFrota || '-')}</p>
              </div>
              <div class="text-right">
                <p class="font-extrabold text-[#6267d9]">${escapeHtml(formatDate(item.seguroVencimento))}</p>
                <p class="text-xs text-slate-500">${item.days} dia(s)</p>
              </div>
            </div>
          `
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

            return `
              <div class="rounded-[24px] border border-slate-200 px-5 py-5">
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
                    ? `<button type="button" class="soft-btn primary" onclick="openRevisionOrderForVehicle('${vehicle.id}')">Abrir OS</button>`
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
      select.innerHTML = '<option value="">Todos os veículos</option>' + allVehicles.map(vehicle => `
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

    function updateButtonState(editId, deleteId, count, requiresSingle = true) {
      const editButton = document.getElementById(editId);
      const deleteButton = document.getElementById(deleteId);
      if (editButton) {
        editButton.style.opacity = !requiresSingle || count === 1 ? '1' : '0.45';
        editButton.style.pointerEvents = !requiresSingle || count === 1 ? 'auto' : 'none';
      }
      if (deleteButton) {
        deleteButton.style.opacity = count > 0 ? '1' : '0.45';
        deleteButton.style.pointerEvents = count > 0 ? 'auto' : 'none';
      }
    }

    function updateVehicleSelectionUI() {
      pruneSelections();
      const count = selectedVehicles.size;
      const visibleVehicles = getVisibleVehicles();
      document.getElementById('vehicles-selected-text').textContent = `${count} selecionado${count === 1 ? '' : 's'}`;
      document.getElementById('select-all-vehicles').classList.toggle('checked', visibleVehicles.length > 0 && visibleVehicles.every(vehicle => selectedVehicles.has(vehicle.id)));
      updateButtonState('edit-vehicle-btn', 'delete-vehicle-btn', count);
    }

    function updateDriverSelectionUI() {
      pruneSelections();
      const count = selectedDrivers.size;
      const visibleDrivers = getVisibleDrivers();
      document.getElementById('drivers-selected-text').textContent = `${count} selecionado${count === 1 ? '' : 's'}`;
      document.getElementById('select-all-drivers').classList.toggle('checked', visibleDrivers.length > 0 && visibleDrivers.every(driver => selectedDrivers.has(driver.id)));
      updateButtonState('edit-driver-btn', 'delete-driver-btn', count);
    }

    function updateSupplierSelectionUI() {
      pruneSelections();
      const count = selectedSuppliers.size;
      const visibleSuppliers = getVisibleSuppliers();
      document.getElementById('suppliers-selected-text').textContent = `${count} selecionado${count === 1 ? '' : 's'}`;
      document.getElementById('select-all-suppliers').classList.toggle('checked', visibleSuppliers.length > 0 && visibleSuppliers.every(supplier => selectedSuppliers.has(supplier.id)));
      updateButtonState('edit-supplier-btn', 'delete-supplier-btn', count);
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
      updateButtonState('edit-order-btn', 'delete-order-btn', count);
      const printButton = document.getElementById('print-order-btn');
      const closeButton = document.getElementById('close-order-btn');
      const reopenButton = document.getElementById('reopen-order-btn');
      if (printButton) {
        printButton.style.opacity = count === 1 ? '1' : '0.45';
        printButton.style.pointerEvents = count === 1 ? 'auto' : 'none';
      }
      if (closeButton) {
        closeButton.style.opacity = canClose ? '1' : '0.45';
        closeButton.style.pointerEvents = canClose ? 'auto' : 'none';
      }
      if (reopenButton) {
        reopenButton.style.opacity = canReopen ? '1' : '0.45';
        reopenButton.style.pointerEvents = canReopen ? 'auto' : 'none';
      }
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
      document.getElementById('finance-selected-text').textContent = `${count} selecionado${count === 1 ? '' : 's'}`;
      document.getElementById('select-all-finance').classList.toggle('checked', visibleEntries.length > 0 && visibleEntries.every(entry => selectedFinance.has(entry.id)));
      updateButtonState('edit-finance-btn', 'delete-finance-btn', count);

      const groupButton = document.getElementById('group-finance-btn');
      const ungroupButton = document.getElementById('ungroup-finance-btn');
      const viewButton = document.getElementById('view-finance-btn');
      const closeExpenseButton = document.getElementById('close-finance-expense-btn');
      const editButton = document.getElementById('edit-finance-btn');
      const deleteButton = document.getElementById('delete-finance-btn');
      const reverseButton = document.getElementById('reverse-finance-btn');
      const canGroup = selectedEntries.length >= 2
        && selectedEntries.every(entry => isFuelEntry(entry) && !entry.groupedIntoId)
        && new Set(selectedEntries.map(entry => getEntryVehicleId(entry))).size === 1;
      const canUngroup = selectedEntries.length === 1 && isFuelGroupEntry(selectedEntries[0]);
      const canView = selectedEntries.length === 1;
      const canCloseExpense = selectedEntries.length === 1
        && (isFuelEntry(selectedEntries[0]) || isFuelGroupEntry(selectedEntries[0]))
        && getFinanceEntryStatus(selectedEntries[0]) !== 'agrupado'
        && !isFinanceEntryLockedForEditing(selectedEntries[0]);
      const canEdit = selectedEntries.length === 1 && !isFinanceEntryLockedForEditing(selectedEntries[0]);
      const canDelete = count > 0 && selectedEntries.every(entry => !canReverseFinanceEntry(entry) && !entry.groupedIntoId && !isFuelGroupEntry(entry));
      const canReverse = selectedEntries.length >= 1 && selectedEntries.every(entry => canReverseFinanceEntry(entry));

      [
        { node: groupButton, enabled: canGroup },
        { node: ungroupButton, enabled: canUngroup },
        { node: viewButton, enabled: canView },
        { node: closeExpenseButton, enabled: canCloseExpense },
        { node: editButton, enabled: canEdit },
        { node: deleteButton, enabled: canDelete },
        { node: reverseButton, enabled: canReverse }
      ].forEach(({ node, enabled }) => {
        if (!node) return;
        node.style.opacity = enabled ? '1' : '0.45';
        node.style.pointerEvents = enabled ? 'auto' : 'none';
      });
    }

    function toggleVehicleSelection(event, id) {
      if (event) event.stopPropagation();
      if (selectedVehicles.has(id)) selectedVehicles.delete(id);
      else selectedVehicles.add(id);
      renderVehicles();
    }

    function toggleDriverSelection(event, id) {
      if (event) event.stopPropagation();
      if (selectedDrivers.has(id)) selectedDrivers.delete(id);
      else selectedDrivers.add(id);
      renderDrivers();
    }

    function toggleSupplierSelection(event, id) {
      if (event) event.stopPropagation();
      if (selectedSuppliers.has(id)) selectedSuppliers.delete(id);
      else selectedSuppliers.add(id);
      renderSuppliers();
    }

    function toggleOrderSelection(event, id) {
      if (event) event.stopPropagation();
      if (selectedOrders.has(id)) selectedOrders.delete(id);
      else selectedOrders.add(id);
      renderOrders();
    }

    function toggleFinanceSelection(event, id) {
      if (event) event.stopPropagation();
      if (selectedFinance.has(id)) selectedFinance.delete(id);
      else selectedFinance.add(id);
      renderFinance();
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

    function getVisibleVehicles() {
      const quickSearch = normalizeComparableText(document.getElementById('vehicle-filter-search')?.value || '');
      const fleetFilter = (document.getElementById('vehicle-filter-fleet')?.value || '').trim().toLowerCase();
      const plateFilter = (document.getElementById('vehicle-filter-plate')?.value || '').trim().toLowerCase();
      const yearFilter = (document.getElementById('vehicle-filter-year')?.value || '').trim().toLowerCase();

      return [...allVehicles]
        .filter(vehicle => !fleetFilter || String(vehicle.numeroFrota || '').toLowerCase().includes(fleetFilter))
        .filter(vehicle => !plateFilter || String(vehicle.placa || '').toLowerCase().includes(plateFilter))
        .filter(vehicle => !yearFilter || String(vehicle.ano || '').toLowerCase().includes(yearFilter))
        .filter(vehicle => {
          if (!quickSearch) return true;
          const haystack = normalizeComparableText([
            vehicle.numeroFrota,
            vehicle.placa,
            vehicle.modelo,
            vehicle.ano,
            vehicle.cor,
            vehicle.chassi
          ].join(' '));
          return haystack.includes(quickSearch);
        })
        .sort((a, b) => getNumericOrderValue(a.numeroFrota) - getNumericOrderValue(b.numeroFrota));
    }

    function getVisibleDrivers() {
      const quickSearch = normalizeComparableText(document.getElementById('driver-filter-search')?.value || '');
      const categoryFilter = (document.getElementById('driver-filter-category')?.value || '').trim().toLowerCase();
      const validityFilter = document.getElementById('driver-filter-validity')?.value || '';

      return [...allDrivers]
        .filter(driver => !categoryFilter || String(driver.categoria || '').toLowerCase().includes(categoryFilter))
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
        })
        .sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR'));
    }

    function getVisibleSuppliers() {
      const quickSearch = normalizeComparableText(document.getElementById('supplier-filter-search')?.value || '');
      const typeFilter = document.getElementById('supplier-filter-type')?.value || '';
      const documentFilter = (document.getElementById('supplier-filter-document')?.value || '').trim().toLowerCase();

      return [...allSuppliers]
        .filter(supplier => !typeFilter || supplier.tipo === typeFilter)
        .filter(supplier => !documentFilter || String(supplier.documento || '').toLowerCase().includes(documentFilter))
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
        })
        .sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR'));
    }

    function hasActiveVehicleFilters() {
      return ['vehicle-filter-search', 'vehicle-filter-fleet', 'vehicle-filter-plate', 'vehicle-filter-year']
        .some((id) => String(document.getElementById(id)?.value || '').trim() !== '');
    }

    function hasActiveDriverFilters() {
      return ['driver-filter-search', 'driver-filter-category', 'driver-filter-validity']
        .some((id) => String(document.getElementById(id)?.value || '').trim() !== '');
    }

    function hasActiveSupplierFilters() {
      return ['supplier-filter-search', 'supplier-filter-type', 'supplier-filter-document']
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
        updateVehicleSelectionUI();
        return;
      }
      list.innerHTML = visibleVehicles.map(vehicle => `
        <div class="orders-table-row entity-table-row--vehicles ${selectedVehicles.has(vehicle.id) ? 'selected' : ''}">
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
        </div>
      `).join('');
      updateEntityListViewport('vehicles-list-shell', visibleVehicles.length);
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
        updateDriverSelectionUI();
        return;
      }
      list.innerHTML = visibleDrivers.map(driver => `
        <div class="orders-table-row entity-table-row--drivers ${selectedDrivers.has(driver.id) ? 'selected' : ''}">
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
            </div>
        </div>
      `).join('');
      updateEntityListViewport('drivers-list-shell', visibleDrivers.length);
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
        updateSupplierSelectionUI();
        return;
      }
      list.innerHTML = visibleSuppliers.map(supplier => `
        <div class="orders-table-row entity-table-row--suppliers ${selectedSuppliers.has(supplier.id) ? 'selected' : ''}">
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
      updateSupplierSelectionUI();
    }

    function getFilteredOrders() {
      const quickSearch = normalizeComparableText(document.getElementById('order-filter-search')?.value || '');
      const number = document.getElementById('order-filter-number')?.value.trim().toLowerCase() || '';
      const start = document.getElementById('order-filter-start')?.value || '';
      const end = document.getElementById('order-filter-end')?.value || '';
      const status = document.getElementById('order-filter-status')?.value || '';
      const sort = document.getElementById('order-filter-sort')?.value || 'recentes';

      let items = [...allOrders];
      if (number) items = items.filter(order => String(order.numero).toLowerCase().includes(number));
      if (start) items = items.filter(order => !order.dataInicio || order.dataInicio >= start);
      if (end) items = items.filter(order => !order.dataInicio || order.dataInicio <= end);
      if (status) items = items.filter(order => order.status === status);
      if (quickSearch) {
        items = items.filter(order => {
          const vehicle = allVehicles.find(item => item.id === order.vehicleId);
          const driver = allDrivers.find(item => item.id === order.driverId);
          const haystack = normalizeComparableText([
            order.numero,
            order.status,
            order.descricao,
            order.responsavelNome,
            driver?.nome,
            vehicle ? `${vehicle.numeroFrota || ''} ${vehicle.placa || ''} ${vehicle.modelo || ''}` : ''
          ].join(' '));
          return haystack.includes(quickSearch);
        });
      }
      items.sort((a, b) => sort === 'antigas'
        ? String(a.numero).localeCompare(String(b.numero))
        : String(b.numero).localeCompare(String(a.numero))
      );
      return items;
    }

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
        updateOrderSelectionUI();
        return;
      }
      list.innerHTML = filteredOrders.map(order => {
        const vehicle = allVehicles.find(item => item.id === order.vehicleId);
        const driver = allDrivers.find(item => item.id === order.driverId);
        const financialItems = allFinanceEntries.filter(item => item.orderId === order.id);
        const totalFinance = financialItems.reduce((sum, item) => sum + getFinanceTotal(item), 0);
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
          <div class="orders-table-row ${selectedOrders.has(order.id) ? 'selected' : ''}">
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
      updateOrderSelectionUI();
    }

    function populateFinanceVehicleFilter() {
      const select = document.getElementById('finance-filter-vehicle');
      if (!select) return;

      const currentValue = select.value;
      const options = ['<option value="">Todos os veículos</option>'].concat(
        allVehicles
          .slice()
          .sort((a, b) => `${a.placa || a.plate || ''} ${a.modelo || a.model || ''}`.localeCompare(`${b.placa || b.plate || ''} ${b.modelo || b.model || ''}`, 'pt-BR'))
          .map(vehicle => `<option value="${vehicle.id}">${vehicle.placa || vehicle.plate || 'Sem placa'}  ${vehicle.modelo || vehicle.model || 'Veículo'}</option>`)
      );

      select.innerHTML = options.join('');
      if (currentValue && allVehicles.some(vehicle => vehicle.id === currentValue)) {
        select.value = currentValue;
      }
    }

    function renderFinance() {
      populateFinanceVehicleFilter();
      const list = document.getElementById('finance-list');
      if (!list) return;
      const visibleEntries = getVisibleFinanceEntries();
      if (!visibleEntries.length) {
        list.innerHTML = '<div class="empty-state">Nenhum lançamento financeiro cadastrado.</div>';
        selectedFinance.clear();
        updateEntityListViewport('finance-list-shell', 0);
        updateFinanceSelectionUI();
        return;
      }
      list.innerHTML = visibleEntries.map(entry => {
        const order = allOrders.find(item => item.id === entry.orderId);
        const vehicle = allVehicles.find(item => item.id === getEntryVehicleId(entry));
        const groupEntry = entry.groupedIntoId ? allFinanceEntries.find(item => item.id === entry.groupedIntoId) : null;
        const groupedChildren = isFuelGroupEntry(entry) ? getFuelGroupChildren(entry) : [];
        const title = isFuelGroupEntry(entry)
          ? 'Agrupamento de abastecimentos'
          : (entry.fornecedor || 'Lançamento');
        const typeLabel = isFuelGroupEntry(entry)
          ? 'Agrupamento'
          : entry.entryType === 'combustivel'
            ? 'Combustível'
            : (entry.kindLabel || 'Despesa');
        const vehicleLabel = vehicle
          ? `${vehicle.numeroFrota || ''} ${vehicle.placa || ''} ${vehicle.modelo || ''}`.trim()
          : '-';
        const orderLabel = order ? `OS ${escapeHtml(getOrderNumberLabel(order))}` : 'Sem OS';
        const details = [
          entry.nf ? escapeHtml(normalizeFinanceNoteLabel(entry.nf)) : '',
          entry.driverId ? `Motorista ${escapeHtml(getDriverLabel(entry.driverId))}` : '',
          entry.fuelType ? `Combustível ${escapeHtml(entry.fuelType)}` : '',
          entry.litros ? `${escapeHtml(entry.litros)} L` : '',
          entry.km ? `KM ${escapeHtml(entry.km)}` : '',
          entry.discount ? `Desc. ${escapeHtml(formatCurrency(entry.discount))}` : '',
          entry.surcharge ? `Acrésc. ${escapeHtml(formatCurrency(entry.surcharge))}` : '',
          groupEntry ? `Agrupado em ${escapeHtml(normalizeFinanceNoteLabel(groupEntry.nf) || 'grupo sem nota')}` : ''
        ].filter(Boolean);
        const historyHtml = isFuelGroupEntry(entry) && groupedChildren.length
          ? `
            <div class="finance-history-list">
              ${groupedChildren.map(item => `
                <div class="finance-history-item">
                  <strong>${escapeHtml(item.fornecedor || 'Abastecimento')}</strong>
                  <span>${escapeHtml(formatDate(getFinanceEntryDate(item)))}</span>
                  <span>${escapeHtml(formatCurrency(getFinanceTotal(item)))}</span>
                  ${item.comprovanteUrl ? `
                    <button type="button" class="finance-history-action" onclick="viewFinanceReceipt('${escapeHtml(item.comprovanteUrl)}')">
                      Ver comprovante
                    </button>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          `
          : '';
        const receiptButtonHtml = isFuelEntry(entry) && entry.comprovanteUrl
          ? `
            <button type="button" class="finance-receipt-link" onclick="viewFinanceReceipt('${escapeHtml(entry.comprovanteUrl)}')">
              Ver comprovante
            </button>
          `
          : '';
        return `
          <div class="orders-table-row finance-table-row finance-entry finance-entry--${getFinanceEntryFamily(entry)} ${selectedFinance.has(entry.id) ? 'selected' : ''}">
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
              <span class="mini-badge">${escapeHtml(typeLabel)}</span>
            </div>
            <div class="orders-table-cell">
              <span class="mini-badge mini-badge--status-${getFinanceEntryStatus(entry)}">${escapeHtml(getFinanceEntryStatusLabel(entry))}</span>
            </div>
            <div class="orders-table-cell">
              <div class="orders-main-text">${escapeHtml(vehicleLabel)}</div>
              <div class="orders-sub-text">${orderLabel}</div>
            </div>
            <div class="orders-table-cell">
              <div class="orders-main-text">${escapeHtml(formatDate(getFinanceEntryDate(entry)))}</div>
              <div class="orders-sub-text">${escapeHtml(getFinanceEntryDateLabel(entry))}</div>
            </div>
            <div class="orders-table-cell">
              <div class="orders-main-text">${details.length ? details.join(' • ') : '-'}</div>
              ${receiptButtonHtml}
              ${historyHtml}
            </div>
            <div class="orders-table-cell orders-table-cell--value">
              <span class="orders-value-text">${formatCurrency(getFinanceTotal(entry))}</span>
            </div>
          </div>
        `;
      }).join('');
      updateEntityListViewport('finance-list-shell', visibleEntries.length);
      updateFinanceSelectionUI();
    }

    function clearOrderFilters() {
      document.getElementById('order-filter-search').value = '';
      document.getElementById('order-filter-number').value = '';
      document.getElementById('order-filter-start').value = '';
      document.getElementById('order-filter-end').value = '';
      document.getElementById('order-filter-status').value = '';
      document.getElementById('order-filter-sort').value = 'recentes';
      renderOrders();
    }

    function clearFinanceFilters() {
      document.getElementById('finance-filter-search').value = '';
      document.getElementById('finance-filter-supplier').value = '';
      document.getElementById('finance-filter-status').value = '';
      document.getElementById('finance-filter-vehicle').value = '';
      document.getElementById('finance-filter-date').value = '';
      document.getElementById('finance-filter-value').value = '';
      renderFinance();
    }

    function clearVehicleFilters() {
      document.getElementById('vehicle-filter-search').value = '';
      document.getElementById('vehicle-filter-fleet').value = '';
      document.getElementById('vehicle-filter-plate').value = '';
      document.getElementById('vehicle-filter-year').value = '';
      renderVehicles();
    }

    function clearDriverFilters() {
      document.getElementById('driver-filter-search').value = '';
      document.getElementById('driver-filter-category').value = '';
      document.getElementById('driver-filter-validity').value = '';
      renderDrivers();
    }

    function clearSupplierFilters() {
      document.getElementById('supplier-filter-search').value = '';
      document.getElementById('supplier-filter-type').value = '';
      document.getElementById('supplier-filter-document').value = '';
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
      document.getElementById('driver-telefone').value = driver.telefone || '';
      document.getElementById('driver-validade').value = driver.validade || '';
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
      document.getElementById('order-administracao').value = order.administracao || '';
      document.getElementById('order-veiculo').value = order.vehicleId || '';
      document.getElementById('order-driver').value = order.driverId || '';
      document.getElementById('order-data-inicio').value = order.dataInicio || '';
      document.getElementById('order-data-termino').value = order.dataTermino || '';
      document.getElementById('order-status').value = order.status || 'aberta';
      document.getElementById('order-descricao').value = order.descricao || '';
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
      if (canReverseFinanceEntry(entry)) {
        showToast('Essa despesa já foi fechada ou distribuída. Faça o estorno antes de editar.');
        return;
      }
      if (isFuelGroupEntry(entry)) {
        openFuelGroupingModal(id);
        return;
      }
      openCadastroModal('finance');
      loadFinanceForm(entry.entryType || 'despesa');
      currentEditingId = id;
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
        document.getElementById('finance-nf').value = entry.nf || '';
        if (document.getElementById('finance-km')) {
          document.getElementById('finance-km').value = entry.km || '';
        }
        document.getElementById('finance-total').value = formatCurrencyInputValue(entry.total ?? 0);
      }
      document.getElementById('finance-observacoes').value = entry.observacoes || '';
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
      allVehicles = allVehicles.filter(vehicle => !selectedVehicles.has(vehicle.id));
      selectedVehicles.clear();
      saveToLocalStorage();
      renderAll();
      showToast('Veículo(s) excluído(s) com sucesso.');
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
      allDrivers = allDrivers.filter(driver => !selectedDrivers.has(driver.id));
      selectedDrivers.clear();
      saveToLocalStorage();
      renderAll();
      showToast('Motorista(s) excluído(s) com sucesso.');
    }

    function deleteSelectedSuppliers() {
      if (!selectedSuppliers.size) {
        showToast('Selecione pelo menos um fornecedor para excluir.');
        return;
      }
      allSuppliers = allSuppliers.filter(supplier => !selectedSuppliers.has(supplier.id));
      selectedSuppliers.clear();
      saveToLocalStorage();
      renderAll();
      showToast('Fornecedor(es) excluído(s) com sucesso.');
    }

    function deleteSelectedOrders() {
      if (!selectedOrders.size) {
        showToast('Selecione pelo menos uma OS para excluir.');
        return;
      }
      const deletedIds = new Set(selectedOrders);
      const deletedAt = new Date().toISOString();
      const deletedBatch = allOrders
        .filter(order => deletedIds.has(order.id))
        .map(order => {
          const vehicle = allVehicles.find(item => item.id === order.vehicleId);
          const linkedEntries = allFinanceEntries.filter(entry => entry.orderId === order.id);
          return {
            ...order,
            deletedAt,
            vehicleSnapshot: vehicle ? {
              id: vehicle.id,
              placa: vehicle.placa,
              modelo: vehicle.modelo,
              numeroFrota: vehicle.numeroFrota
            } : null,
            totalLinked: linkedEntries.reduce((sum, entry) => sum + getFinanceTotal(entry), 0)
          };
        });
      deletedOrders = [...deletedBatch, ...deletedOrders].slice(0, 500);
      allOrders = allOrders.filter(order => !deletedIds.has(order.id));
      allFinanceEntries = allFinanceEntries.filter(entry => !deletedIds.has(entry.orderId));
      selectedOrders.clear();
      saveToLocalStorage();
      renderAll();
      showToast('OS e lançamentos vinculados excluídos com sucesso.');
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
        isFuelGroupEntry(entry)
        && (entry.closedExpense || ['pendente_os', 'distribuido'].includes(getFinanceEntryStatus(entry)) || !!entry.orderId)
      );
      if (hasClosedGroup) {
        showToast('Agrupamento já fechado não pode ser excluído. Faça o estorno ou ajuste a despesa antes.');
        return;
      }

      const hasOpenGroup = selectedEntries.some(entry => isFuelGroupEntry(entry));
      if (hasOpenGroup) {
        showToast('Desfaça o agrupamento antes de excluir esse lançamento.');
        return;
      }

      const hasAllocatedEntry = selectedEntries.some(entry =>
        !isFuelGroupEntry(entry)
        && (['pendente_os', 'distribuido'].includes(getFinanceEntryStatus(entry)) || !!entry.orderId || !!entry.closedExpense)
      );
      if (hasAllocatedEntry) {
        showToast('Despesa já alocada em OS não pode ser excluída. Faça o estorno antes de remover.');
        return;
      }

      allFinanceEntries = allFinanceEntries.filter(entry => !selectedFinance.has(entry.id));
      selectedFinance.clear();
      saveToLocalStorage();
      renderAll();
      showToast('Lançamento(s) excluído(s) com sucesso.');
    }

    function reverseSelectedFinance() {
      if (!selectedFinance.size) {
        showToast('Selecione pelo menos uma despesa para estornar.');
        return;
      }
      const selectedEntries = Array.from(selectedFinance)
        .map(id => allFinanceEntries.find(entry => entry.id === id))
        .filter(Boolean);
      if (!selectedEntries.length || selectedEntries.some(entry => !canReverseFinanceEntry(entry))) {
        showToast('Selecione apenas despesas fechadas ou distribuídas para estornar.');
        return;
      }

      allFinanceEntries = allFinanceEntries.map((entry) => {
        if (!selectedFinance.has(entry.id)) return entry;
        return {
          ...entry,
          orderId: '',
          workflowStatus: 'pendente',
          closedExpense: false
        };
      });
      saveToLocalStorage();
      renderAll();
      showToast('Estorno realizado. Agora a despesa pode ser editada novamente.');
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
      allOrders = allOrders.map(order => closableIds.has(order.id)
        ? { ...order, status: 'fechada', dataTermino: order.dataTermino || getLocalIsoDate() }
        : order);
      saveToLocalStorage();
      renderAll();
      showToast(`OS fechada${closableIds.size === 1 ? '' : 's'} com sucesso.`);
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
        text: 'Informe o motivo da reabertura. Essa justificativa será adicionada à descrição da ordem de serviço.',
        placeholder: 'Ex.: retorno da oficina, ajuste interno, complemento financeiro...',
        onConfirm: (justification) => {
          const today = formatDate(getLocalIsoDate());
          allOrders = allOrders.map(order => reopenableIds.has(order.id)
            ? {
                ...order,
                status: 'aberta',
                descricao: `${order.descricao || ''}${order.descricao ? '\n\n' : ''}OS REABERTA EM ${today} motivo: ${justification}`
              }
            : order);
          saveToLocalStorage();
          renderAll();
          showToast(`OS reaberta${reopenableIds.size === 1 ? '' : 's'} com sucesso.`);
        }
      });
    }

    function printSelectedOrder() {
      if (selectedOrders.size !== 1) {
        showToast('Selecione uma OS para imprimir.');
        return;
      }
      const id = Array.from(selectedOrders)[0];
      const order = allOrders.find(item => item.id === id);
      if (!order) return;
      const vehicle = allVehicles.find(item => item.id === order.vehicleId);
      const driver = allDrivers.find(item => item.id === order.driverId);
      const kmData = getOrderKmData(order.id);
      const entries = allFinanceEntries.filter(item => item.orderId === order.id);
      const totalEntries = entries.reduce((sum, item) => sum + getFinanceTotal(item), 0);
      const statusLabel = (order.status || 'aberta').charAt(0).toUpperCase() + (order.status || 'aberta').slice(1);

      const rows = Array.from({ length: Math.max(entries.length, 24) }, (_, index) => {
        const entry = entries[index];
        return `
          <tr>
            <td>${entry ? escapeHtml(formatDate(entry.dataVencimento)) : ''}</td>
            <td>${entry ? escapeHtml(getFinanceSupplierSummary(entry)) : ''}</td>
            <td class="money">${entry && entry.kind === 'despesa' ? escapeHtml(formatCurrency(entry.total)) : ''}</td>
            <td class="money">${entry && entry.kind === 'receita' ? escapeHtml(formatCurrency(entry.total)) : ''}</td>
            <td class="money">${entry ? escapeHtml(formatCurrency(getFinanceTotal(entry))) : ''}</td>
          </tr>
        `;
      }).join('');

      const printWindow = window.open('', '_blank', 'width=980,height=1200');
      if (!printWindow) {
        showToast('Não foi possível abrir a janela de impressão.');
        return;
      }

      printWindow.document.open();
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
                <td>${escapeHtml(order.descricao || '')}</td>
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
            ? { ...vehicle, numeroFrota, placa, modelo, ano, cor, seguroVencimento, chassi }
            : vehicle);
          showToast('Veículo atualizado com sucesso.');
        } else {
          allVehicles.unshift({ id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, numeroFrota, placa, modelo, ano, cor, seguroVencimento, chassi });
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
            ? { ...driver, nome, cpf, cnh, categoria, telefone, validade }
            : driver);
          showToast('Motorista atualizado com sucesso.');
        } else {
          allDrivers.unshift({ id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, nome, cpf, cnh, categoria, telefone, validade });
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
        const administracao = document.getElementById('order-administracao').value.trim();
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
        if (findOrderNumberDuplicate(numero, currentEditingId)) {
          showToast(`Já existe uma OS com o número ${String(numero).padStart(4, '0')}.`);
          return;
        }
        if (currentEditingId) {
          allOrders = allOrders.map(order => order.id === currentEditingId
            ? { ...order, numero, administracao, vehicleId, driverId, responsavelNome, dataInicio, dataTermino, status, descricao }
            : order);
          syncOrderCounterWithOrders();
          showToast('OS atualizada com sucesso.');
        } else {
          allOrders.unshift({ id: generateId(), numero, administracao, vehicleId, driverId, responsavelNome, dataInicio, dataTermino, status, descricao });
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
        const supplierId = document.getElementById('finance-supplier-id').value;
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
          .filter(entry => entry && isFuelEntry(entry));
        if (!entries.length) {
          showToast('Não foi possível localizar os abastecimentos do agrupamento.');
          return;
        }

        const vehicleId = getEntryVehicleId(entries[0]);
        const groupOrderSearch = document.getElementById('finance-group-order-search')?.value || '';
        let orderId = document.getElementById('finance-group-order-id').value;
        if (!orderId && groupOrderSearch.trim() && groupOrderSearch.trim().toLowerCase() !== 'deixar pendente') {
          const resolvedOrder = resolveOrderFromSearch(groupOrderSearch, getOpenOrdersSorted().filter(order => order.vehicleId === vehicleId));
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
          entryType: 'combustivel_agrupado',
          vehicleId,
          orderId: orderId || '',
          kind: 'despesa',
          kindLabel: 'Despesa',
          supplierId: '',
          supplierType: 'posto',
          fornecedor: `Agrupamento de ${entries.length} abastecimento(s)`,
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
        if (!orderId && closeOrderSearch.trim() && closeOrderSearch.trim().toLowerCase() !== 'não alocar agora') {
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
        if (linkedOrder && linkedOrder.status === 'fechada') {
          showToast('Não é permitido alocar em OS fechada.');
          return;
        }

        const workflowStatus = orderId ? 'distribuido' : 'pendente_os';
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
        showToast(orderId ? 'Despesa fechada e distribuída com sucesso.' : 'Despesa fechada, mas pendente de alocação em OS.');
        return;
      }
    });

    loadFromLocalStorage();
    renderAll();
    updateModuleHeader('home');
    applySidebarState();
    applyThemeState(localStorage.getItem('wefrotas_theme') === 'dark');
    renderNotifications();
    updateCustomLogoUi();
    updateManagerIdentityUi();
    updateOperationSettingsUi();
    document.getElementById('settings-custom-logo-file')?.addEventListener('change', handleCustomLogoUpload);
    document.getElementById('settings-custom-logo-size')?.addEventListener('input', (event) => {
      const sizeLabel = document.getElementById('settings-custom-logo-size-label');
      if (sizeLabel) sizeLabel.textContent = `${event.target.value}%`;
    });
    ['order-filter-search', 'order-filter-number'].forEach(id => {
      const node = document.getElementById(id);
      if (node) node.addEventListener('input', renderOrders);
    });
    ['order-filter-start', 'order-filter-end', 'order-filter-status', 'order-filter-sort'].forEach(id => {
      const node = document.getElementById(id);
      if (node) node.addEventListener('change', renderOrders);
    });
    ['finance-filter-search', 'finance-filter-supplier', 'finance-filter-value'].forEach(id => {
      const node = document.getElementById(id);
      if (node) node.addEventListener('input', renderFinance);
    });
    applyCurrencyMaskToInput(document.getElementById('finance-filter-value'));
    ['finance-filter-status', 'finance-filter-vehicle', 'finance-filter-date'].forEach(id => {
      const node = document.getElementById(id);
      if (node) node.addEventListener('change', renderFinance);
    });
    ['vehicle-filter-search', 'vehicle-filter-fleet', 'vehicle-filter-plate', 'vehicle-filter-year'].forEach(id => {
      const node = document.getElementById(id);
      if (node) node.addEventListener('input', renderVehicles);
    });
    ['driver-filter-search', 'driver-filter-category'].forEach(id => {
      const node = document.getElementById(id);
      if (node) node.addEventListener('input', renderDrivers);
    });
    ['driver-filter-validity', 'supplier-filter-type'].forEach(id => {
      const node = document.getElementById(id);
      if (node) node.addEventListener('change', id === 'driver-filter-validity' ? renderDrivers : renderSuppliers);
    });
    ['supplier-filter-search', 'supplier-filter-document'].forEach(id => {
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


