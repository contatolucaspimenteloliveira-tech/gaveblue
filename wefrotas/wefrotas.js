let allVehicles = [];
    let allDrivers = [];
    let allSuppliers = [];
    let centralCities = [];
    let allOrders = [];
    let allFinanceEntries = [];
    let allAdministrations = [];
    let deletedOrders = [];
    let centralPendingRecords = [];
    let centralPendingLoading = false;
    let centralPendingError = '';
    let centralPendingLoaded = false;
    let centralPendingAutoRefreshTimer = null;
    let centralPushSending = false;
    let centralPushSubscriberTotal = 0;
    let centralPushDevices = [];
    let centralDevicesLoading = false;
    let centralDeviceLinks = {};
    let centralHomeBanners = [];
    let centralBannerSaving = false;
    let selectedCentralBannerId = '';
    let selectedCentralCityId = '';
    let centralDefaultBannersSeeding = null;
    const CENTRAL_DEFAULT_BANNERS = Object.freeze([
      { rowId: 'builtin-hero-posto', fileId: 'builtin:hero-posto', title: 'Postos credenciados', path: 'hero-posto.png', sortOrder: 0 },
      { rowId: 'builtin-revisao-km', fileId: 'builtin:hero-revisao-km', title: 'Atenção à revisão de KM', path: 'hero-revisao-km-desktop.jpeg', sortOrder: 1 },
      { rowId: 'builtin-posto-proximo', fileId: 'builtin:hero-posto-proximo', title: 'Encontre um posto próximo', path: 'hero-posto-proximo-desktop.jpeg', sortOrder: 2 },
      { rowId: 'builtin-agro-show', fileId: 'builtin:agro-show-2026', title: 'Pinheiros Agro Show 2026', path: 'agro-show-2026.jpeg', sortOrder: 3 },
      { rowId: 'builtin-alerta-painel', fileId: 'builtin:mobile-alerta-painel', title: 'Alerta do painel', path: 'mobile-alerta-painel.jpeg', sortOrder: 4 },
      { rowId: 'builtin-placa-suja', fileId: 'builtin:mobile-placa-suja', title: 'Cuidados com a placa', path: 'mobile-placa-suja.jpeg', sortOrder: 5 },
      { rowId: 'builtin-sinistro', fileId: 'builtin:mobile-sinistro', title: 'Orientação em caso de sinistro', path: 'mobile-sinistro.jpeg', sortOrder: 6 },
      { rowId: 'builtin-sinalizacao', fileId: 'builtin:mobile-sinalizacao', title: 'Atenção à sinalização', path: 'mobile-sinalizacao.jpeg', sortOrder: 7 },
      { rowId: 'builtin-celular-volante', fileId: 'builtin:mobile-celular-volante', title: 'Não use o celular ao volante', path: 'mobile-celular-volante.jpeg', sortOrder: 8 },
      { rowId: 'builtin-agosto-lilas', fileId: 'builtin:mobile-agosto-lilas', title: 'Agosto Lilás', path: 'mobile-agosto-lilas.jpg', sortOrder: 9 }
    ]);
    const CENTRAL_DEFAULT_CITIES = Object.freeze([
      { id: 'city-boa-esperanca', name: 'Boa Esperança', imageUrl: new URL('../postoscredenciados-covreecia/assets/cidades/boa-esperanca.jpeg', window.location.href).href, fileId: 'builtin:city-boa-esperanca', active: true },
      { id: 'city-montanha', name: 'Montanha', imageUrl: new URL('../postoscredenciados-covreecia/assets/cidades/montanha.jpeg', window.location.href).href, fileId: 'builtin:city-montanha', active: true },
      { id: 'city-nova-venecia', name: 'Nova Venécia', imageUrl: new URL('../postoscredenciados-covreecia/assets/cidades/nova-venecia.jpeg', window.location.href).href, fileId: 'builtin:city-nova-venecia', active: true },
      { id: 'city-pedro-canario', name: 'Pedro Canário', imageUrl: new URL('../postoscredenciados-covreecia/assets/cidades/pedro-canario.jpeg', window.location.href).href, fileId: 'builtin:city-pedro-canario', active: true },
      { id: 'city-pinheiros', name: 'Pinheiros', imageUrl: new URL('../postoscredenciados-covreecia/assets/cidades/pinheiros.jpeg', window.location.href).href, fileId: 'builtin:city-pinheiros', active: true, featured: true },
      { id: 'city-sao-mateus', name: 'São Mateus', imageUrl: new URL('../postoscredenciados-covreecia/assets/cidades/sao-mateus.jpeg', window.location.href).href, fileId: 'builtin:city-sao-mateus', active: true }
    ]);
    const CENTRAL_DEFAULT_BANNERS_MIGRATION = Object.freeze({
      rowId: 'builtin-migration-v1',
      fileId: 'builtin:migration-v1',
      title: 'Migração dos banners padrão',
      path: 'hero-posto.png',
      sortOrder: 0
    });
    const CENTRAL_PENDING_FILTERS_KEY = 'wefrotas:central-pending-filters';
    let centralPendingStatusFilter = 'todos';
    let centralPendingDateStart = '';
    let centralPendingDateEnd = '';
    let centralPendingCalendarMonth = null;
    let centralPendingCalendarSelectingEnd = false;
    let centralPendingCalendarView = 'days';
    let centralPendingDraftDateStart = '';
    let centralPendingDraftDateEnd = '';
    let centralPendingSearchFilter = '';
    let centralPendingValueFilter = '';
    let centralPendingVehicleFilter = '';
    let centralPendingSupplierFilter = '';
    let centralPendingOrderFilter = '';
    let centralPendingNfFilter = '';
    let centralPendingDueStart = '';
    let centralPendingDueEnd = '';
    let centralPendingSortState = { key: 'date', direction: 'desc' };
    let centralPendingFiltersLoaded = false;
    let selectedCentralPending = new Set();
    const centralApprovalInProgress = new Set();
    const centralStatusRepairInProgress = new Set();
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
      { name: 'WeTime', description: 'Relógio online e painel de horário', url: 'https://gaveblue.com.br/wetime/' },
      { name: 'WeRecibos', description: 'Gerador de recibos', url: 'https://gaveblue.com.br/recibos/' },
      { name: 'WeConsultas', description: 'Consultas empresariais', url: 'https://gaveblue.com.br/weconsultas/' },
      { name: 'WeFrotas', description: 'Gestão de frotas', url: 'https://gaveblue.com.br/wefrotas/' },
      { name: 'WeDevs', description: 'Ferramentas e utilidades dev', url: 'https://gaveblue.com.br/wedevs/' },
      { name: 'WeTasks', description: 'Tarefas e organização', url: 'https://gaveblue.com.br/wetasks/' }
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
    const reportPreferencesStorageKey = 'wefrotas_report_preferences_v1';
    let reportPreferences = loadReportPreferences();
    let reportDraggedColumnId = '';
    let reportSortState = { type: '', columnId: '', direction: '' };
    let currentModalType = null;
    let currentEditingId = null;
    let currentFinanceEntryType = null;
    let vehicleImagePreviewObjectUrl = '';
    let activeModule = 'home';
    let activeCentralSection = 'registros';
    let activeCentralConfigSection = 'comunicacao';
    let currentWefrotasRoleLabel = 'Consulta';
    let centralManagerUsers = [];
    let centralManagerUsersLoading = false;
    let centralManagerUsersGeneration = 0;
    let wefrotasUsersSearchTimer = null;
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
    // Never open an unowned/legacy snapshot before the server resolves the tenant.
    let wefrotasIndexedDbSnapshotKey = '';
    let wefrotasStorageWorkspace = '';
    let wefrotasDbConnection = null;
    let wefrotasStorageEngine = 'localStorage';
    let wefrotasStorageQueue = Promise.resolve();
    let wefrotasLocalSnapshotUpdatedAt = '';
    let customLogoEnabled = false;
    let customLogoUrl = '';
    let customLogoScale = 60;
    let receiptViewerZoomLevel = 1;
    const ONLINE_IDLE_TIMEOUT_MS = 10 * 60 * 1000;
    const ONLINE_LAST_ACTIVITY_STORAGE_KEY = 'wefrotas_online_last_activity_v1';
    let onlineIdleTimer = null;
    let onlineIdleListenersRegistered = false;
    let onlineLoginInProgress = false;
    let onlineLogoutInProgress = false;
    let onlineAuthSlowTimer = null;
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

    function getLastDayOfMonthIso(dateString) {
      const baseDate = dateString ? new Date(`${dateString}T00:00:00`) : new Date();
      if (Number.isNaN(baseDate.getTime())) return '';
      const lastDay = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
      const offset = lastDay.getTimezoneOffset() * 60000;
      return new Date(lastDay.getTime() - offset).toISOString().slice(0, 10);
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

    function getAuthenticatedUserDisplayName(user) {
      const appwriteName = String(user?.name || '').trim();
      if (appwriteName) return appwriteName;
      const emailName = String(user?.email || '').split('@')[0].trim();
      return emailName || 'Usuário';
    }

    function getAuthenticatedUserRoleLabel(user) {
      // The server-resolved company membership replaces legacy global labels.
      // Never infer privileges from an org label belonging to another company.
      const backend = window.WeFrotasBackend;
      const organizationRole = user?.$id && backend?.getUser?.()?.$id === user.$id
        ? backend?.getOrganizationContext?.()?.role
        : '';
      if (organizationRole) {
        return ({
          'wefrotas-admin': 'Administrador',
          'wefrotas-gestor': 'Gestor',
          'wefrotas-aprovador': 'Aprovador',
          'wefrotas-consulta': 'Consulta'
        })[organizationRole] || 'Consulta';
      }
      const labels = Array.isArray(user?.labels)
        ? user.labels.map((label) => String(label).trim().toLowerCase())
        : [];
      if (labels.includes('wefrotas-admin') || labels.includes('admin') || labels.includes('administrador')) return 'Administrador';
      if (labels.includes('wefrotas-gestor') || labels.includes('gestor')) return 'Gestor';
      if (labels.includes('wefrotas-aprovador') || labels.includes('aprovador')) return 'Aprovador';
      if (labels.includes('wefrotas-consulta') || labels.includes('consulta')) return 'Consulta';
      return 'Consulta';
    }

    const wefrotasUiPermissionMatrix = Object.freeze({
      Administrador: new Set(['read', 'editOperations', 'approveRecords', 'manageSettings', 'manageUsers', 'manageDevices', 'sendNotifications', 'deleteRecords']),
      Gestor: new Set(['read', 'editOperations', 'approveRecords', 'manageSettings']),
      Aprovador: new Set(['read', 'approveRecords']),
      Consulta: new Set(['read'])
    });

    function hasWefrotasPermission(permission) {
      return wefrotasUiPermissionMatrix[currentWefrotasRoleLabel]?.has(permission) === true;
    }

    function requireWefrotasPermission(permission, message = 'Seu perfil não possui permissão para esta ação.') {
      if (hasWefrotasPermission(permission)) return true;
      showToast(message);
      return false;
    }

    function applyAuthenticatedAccessUi(user) {
      const roleLabel = getAuthenticatedUserRoleLabel(user);
      currentWefrotasRoleLabel = roleLabel;
      const isAdmin = roleLabel === 'Administrador';
      const canManageSettings = isAdmin || roleLabel === 'Gestor';
      document.querySelectorAll('[data-central-section="usuarios"]').forEach((node) => node.classList.toggle('hidden', !isAdmin));
      document.querySelectorAll('[data-central-section="notificacoes"]').forEach((node) => node.classList.toggle('hidden', !isAdmin));
      document.querySelectorAll('[data-central-section="configuracoes"]').forEach((node) => node.classList.toggle('hidden', !canManageSettings));
      const approverHiddenModules = new Set(['orders', 'financeiro', 'veiculos', 'motoristas', 'fornecedores']);
      document.querySelectorAll('#app-sidebar button[onclick*="showModule("]').forEach((button) => {
        const module = button.getAttribute('onclick')?.match(/showModule\('([^']+)'/)?.[1] || '';
        button.classList.toggle('permission-hidden', roleLabel === 'Aprovador' && approverHiddenModules.has(module));
      });
      document.body.classList.toggle('wefrotas-readonly', roleLabel === 'Consulta');
      document.body.dataset.accessRole = roleLabel.toLocaleLowerCase('pt-BR');
      document.querySelectorAll('.app-main-shell button, #app-sidebar button').forEach((button) => {
        if (!button.dataset.permissionOriginalTitle) button.dataset.permissionOriginalTitle = button.title || '';
        if (roleLabel !== 'Consulta') {
          if (button.dataset.permissionLocked === 'true') button.disabled = false;
          button.dataset.permissionLocked = 'false';
          button.title = button.dataset.permissionOriginalTitle;
          return;
        }
        const actionText = `${button.title || ''} ${button.textContent || ''} ${button.getAttribute('onclick') || ''}`;
        const mutating = /novo|adicionar|editar|excluir|aprovar|rejeitar|auditar|estornar|salvar|importar|agrupar|distribuir|migrate|reset|delete|create|editselected|opennew/i.test(actionText);
        if (mutating) {
          button.disabled = true;
          button.dataset.permissionLocked = 'true';
          button.title = 'Seu perfil possui acesso somente para consulta.';
        }
      });
    }

    function updateManagerIdentityUi() {
      const nameNode = document.getElementById('sidebar-user-name');
      const roleNode = document.getElementById('sidebar-user-role');
      const avatarNode = document.getElementById('sidebar-user-avatar');
      const topbarAvatarNode = document.getElementById('topbar-avatar');
      const authenticatedUser = window.WeFrotasBackend?.getUser?.() || null;
      const displayName = authenticatedUser
        ? getAuthenticatedUserDisplayName(authenticatedUser)
        : managerDisplayName || 'Usuário';
      const initials = getNameInitials(displayName, 'GB');
      if (authenticatedUser) managerDisplayName = displayName;
      if (nameNode) nameNode.textContent = displayName;
      if (roleNode) roleNode.textContent = authenticatedUser
        ? getAuthenticatedUserRoleLabel(authenticatedUser)
        : 'Usuário';
      if (avatarNode) avatarNode.textContent = initials;
      if (topbarAvatarNode) topbarAvatarNode.textContent = initials;
      if (authenticatedUser) applyAuthenticatedAccessUi(authenticatedUser);
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
      const authenticatedUser = window.WeFrotasBackend?.getUser?.() || null;
      managerDisplayName = authenticatedUser
        ? getAuthenticatedUserDisplayName(authenticatedUser)
        : String(adminInput?.value || '').trim() || 'Usuário';
      updateManagerIdentityUi();
      updateOperationSettingsUi();
      await saveToLocalStorage();
      showToast('Configurações da operação salvas com sucesso.');
    }

    function toggleCustomLogoEnabled() {
      if (!customLogoEnabled && !customLogoUrl) {
        showToast('Envie uma logo antes de ativar a personalização.');
        return;
      }
      customLogoEnabled = !customLogoEnabled;
      updateCustomLogoUi();
    }

    function readBlobAsDataUrl(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error || new Error('Falha ao ler a imagem.'));
        reader.readAsDataURL(blob);
      });
    }

    async function optimizeCustomLogoDataUrl(dataUrl) {
      const source = String(dataUrl || '');
      if (!source.startsWith('data:image/') || source.length <= 450000) return source;
      try {
        const blob = await (await fetch(source)).blob();
        const bitmap = await createImageBitmap(blob);
        const scale = Math.min(1, 1200 / bitmap.width, 600 / bitmap.height);
        const width = Math.max(1, Math.round(bitmap.width * scale));
        const height = Math.max(1, Math.round(bitmap.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d', { alpha: true });
        context.drawImage(bitmap, 0, 0, width, height);
        bitmap.close?.();
        const optimizedBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.82));
        if (!optimizedBlob) return source;
        const optimized = await readBlobAsDataUrl(optimizedBlob);
        return optimized.length < source.length ? optimized : source;
      } catch (error) {
        console.warn('Não foi possível otimizar a logo personalizada.', error);
        return source;
      }
    }

    async function prepareSnapshotForOnline(snapshot = buildStorageSnapshot()) {
      const sourceLogo = String(snapshot.customLogoUrl || '');
      const optimizedLogo = await optimizeCustomLogoDataUrl(sourceLogo);
      if (!optimizedLogo || optimizedLogo === sourceLogo) return snapshot;
      customLogoUrl = optimizedLogo;
      const optimizedSnapshot = { ...snapshot, customLogoUrl: optimizedLogo };
      try {
        wefrotasStorageEngine = 'IndexedDB';
        await writeWeFrotasIndexedDbSnapshot(optimizedSnapshot);
      } catch (error) {
        wefrotasStorageEngine = 'localStorage';
        saveFullSnapshotToLocalStorage(optimizedSnapshot);
      }
      updateCustomLogoUi();
      return optimizedSnapshot;
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
      reader.onload = async (loadEvent) => {
        customLogoUrl = await optimizeCustomLogoDataUrl(String(loadEvent.target?.result || ''));
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

    function parseDecimalInputValue(value) {
      if (typeof value === 'number' && Number.isFinite(value)) return value;
      const match = String(value || '').trim().match(/-?[\d.,]+/);
      if (!match) return 0;
      let text = match[0].replace(/\s/g, '');
      const commaCount = (text.match(/,/g) || []).length;
      const dotCount = (text.match(/\./g) || []).length;
      if (commaCount && dotCount) {
        const lastComma = text.lastIndexOf(',');
        const lastDot = text.lastIndexOf('.');
        const decimalSeparator = lastComma > lastDot ? ',' : '.';
        const thousandsSeparator = decimalSeparator === ',' ? '.' : ',';
        text = text.replace(new RegExp(`\\${thousandsSeparator}`, 'g'), '');
        text = text.replace(decimalSeparator, '.');
      } else if (commaCount > 1 || dotCount > 1) {
        const separator = commaCount > 1 ? ',' : '.';
        const lastIndex = text.lastIndexOf(separator);
        text = text.slice(0, lastIndex).replace(new RegExp(`\\${separator}`, 'g'), '') + '.' + text.slice(lastIndex + 1);
      } else {
        text = text.replace(',', '.');
      }
      return Number(text.replace(/[^\d.-]/g, '')) || 0;
    }

    function formatLitersValue(value) {
      const liters = parseDecimalInputValue(value);
      return liters ? `${liters.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} L` : '-';
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

    function isEntityActive(entity) {
      return !!entity && entity?.ativo !== false && entity?.active !== false;
    }

    function getActiveSortedVehicles() {
      return getSortedVehicles().filter(isEntityActive);
    }

    function getSortedDrivers() {
      return allDrivers
        .slice()
        .sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR', { sensitivity: 'base' }));
    }

    function getActiveSortedDrivers() {
      return getSortedDrivers().filter(isEntityActive);
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

    function getActiveSortedSuppliers(suppliers = allSuppliers) {
      return getSortedSuppliers(suppliers).filter(isEntityActive);
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
        'servicentro',
        'shell'
      ]);
      return normalizeComparableText(value)
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .split(/\s+/)
        .filter(token => token.length > 2 && !ignoredTokens.has(token));
    }

    function getSupplierAliasTokens(value) {
      const normalized = normalizeComparableText(value);
      const aliases = [];
      if (!normalized) return aliases;

      const aliasMap = [
        ['atlantico', ['atlantico', 'servicentro', 'oliveira', 'rios']],
        ['nater', ['nater', 'coop', 'shell']],
        ['nater coop', ['nater', 'coop', 'shell']],
        ['rede nater', ['nater', 'coop', 'shell']],
        ['nortao', ['nortao', 'ale']],
        ['pinheiros', ['pinheiros', 'ipiranga']]
      ];

      aliasMap.forEach(([needle, tokens]) => {
        if (normalized.includes(needle)) aliases.push(...tokens);
      });

      return aliases;
    }

    function getSupplierMatchTokens(value) {
      return Array.from(new Set([
        ...getMeaningfulSupplierTokens(value),
        ...getSupplierAliasTokens(value)
      ].filter(Boolean)));
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

      const inputTokens = getSupplierMatchTokens(rawValue);
      if (!inputTokens.length) return null;

      const scoredMatches = suppliers
        .map((supplier) => {
          const supplierTokens = getSupplierMatchTokens(getSupplierSearchText(supplier));
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
      const status = normalizeComparableText(getLinkedFinanceOrder(entry)?.status || '');
      return ['fechada', 'finalizada', 'concluida'].includes(status);
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

    function isDistributedFuelCostEntry(entry) {
      return isDistributedCostEntry(entry) && (isFuelEntry(entry) || isFuelGroupEntry(entry));
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

    function normalizeDateForFilter(value) {
      if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
      }

      const raw = String(value || '').trim();
      if (!raw) return '';

      const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

      const brazilianMatch = raw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
      if (brazilianMatch) {
        return `${brazilianMatch[3]}-${brazilianMatch[2].padStart(2, '0')}-${brazilianMatch[1].padStart(2, '0')}`;
      }

      const parsed = new Date(raw);
      if (Number.isNaN(parsed.getTime())) return '';
      return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
    }

    async function saveAuthenticatedUserName() {
      const input = document.getElementById('settings-manager-name');
      const button = document.getElementById('settings-manager-name-save');
      const name = String(input?.value || '').trim().replace(/\s+/g, ' ');
      if (name.length < 2) {
        showToast('Informe um nome com pelo menos 2 caracteres.');
        input?.focus();
        return;
      }
      if (!window.WeFrotasBackend?.getUser?.()) {
        showToast('Entre no WeFrotas Online para alterar seu nome.');
        return;
      }
      if (!window.WeFrotasBackend?.updateAuthenticatedUserName) {
        showToast('A atualização do perfil ainda não está disponível. Recarregue a página.');
        return;
      }
      const originalLabel = button?.textContent || 'Salvar nome';
      if (button) {
        button.disabled = true;
        button.textContent = 'Salvando...';
      }
      try {
        const user = await window.WeFrotasBackend.updateAuthenticatedUserName(name);
        managerDisplayName = getAuthenticatedUserDisplayName(user);
        updateManagerIdentityUi();
        updateOperationSettingsUi();
        showToast('Nome do usuário atualizado.');
      } catch (error) {
        console.error('Não foi possível atualizar o nome do usuário.', error);
        const sessionExpired = error?.code === 401
          || error?.code === 403
          || /missing scopes|guests|account/i.test(String(error?.message || ''));
        showToast(sessionExpired
          ? 'Sua sessão expirou. Entre novamente para alterar o nome.'
          : (error?.message || 'Não foi possível atualizar o nome do usuário.'));
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = originalLabel;
        }
      }
    }

    function getFinanceEntryDate(entry) {
      return normalizeDateForFilter(entry?.dataAbastecimento)
        || normalizeDateForFilter(entry?.dataVencimento)
        || normalizeDateForFilter(entry?.createdAt);
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
          const totalLitros = children.reduce((sum, item) => sum + parseDecimalInputValue(item.litros), 0);
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
      let changed = false;
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
          const legacyLiters = String(nextEntry.litros ?? '').trim();
          const legacyLitersNumber = Number(legacyLiters);
          if (!isFuelGroupEntry(nextEntry)
            && /^\d{5,}$/.test(legacyLiters)
            && Number.isFinite(legacyLitersNumber)
            && legacyLitersNumber >= 10000) {
            nextEntry.litros = String(legacyLitersNumber / 1000);
            changed = true;
          }
        }

        if (isFuelGroupEntry(nextEntry) && !Array.isArray(nextEntry.groupedEntryIds)) {
          nextEntry.groupedEntryIds = [];
        }

        return nextEntry;
      });
      return changed;
    }

    function buildStorageSnapshot() {
      return {
        vehicles: allVehicles,
        drivers: allDrivers,
        suppliers: allSuppliers,
        centralCities,
        orders: allOrders,
        finance: allFinanceEntries,
        administrations: allAdministrations,
        deletedOrders,
        orderCounter,
        notifications: systemNotifications,
        centralDeviceLinks,
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
      allSuppliers = Array.isArray(snapshot.suppliers) ? snapshot.suppliers.map(normalizeSupplierRecord) : [];
      centralCities = Array.isArray(snapshot.centralCities)
        ? snapshot.centralCities.map(normalizeCentralCityRecord).filter((city) => city.name)
        : (wefrotasStorageWorkspace === 'covre-e-cia' ? CENTRAL_DEFAULT_CITIES.map((city) => ({ ...city })) : []);
      const migratedSupplierCities = ensureSupplierCitiesRegistered();
      allOrders = Array.isArray(snapshot.orders) ? snapshot.orders : [];
      allFinanceEntries = Array.isArray(snapshot.finance) ? snapshot.finance : [];
      allAdministrations = normalizeAdministrationList(snapshot.administrations || snapshot.administracoes || []);
      deletedOrders = Array.isArray(snapshot.deletedOrders) ? snapshot.deletedOrders : [];
      systemNotifications = Array.isArray(snapshot.notifications) ? snapshot.notifications : [];
      centralDeviceLinks = snapshot.centralDeviceLinks && typeof snapshot.centralDeviceLinks === 'object'
        ? snapshot.centralDeviceLinks
        : {};
      orderCounter = Number(snapshot.orderCounter) || 1;
      customLogoEnabled = snapshot.customLogoEnabled === true || snapshot.customLogoEnabled === 'true';
      customLogoUrl = snapshot.customLogoUrl || '';
      customLogoScale = Number(snapshot.customLogoScale) || 60;
      managerDisplayName = snapshot.managerDisplayName || snapshot.defaultAdministratorName || 'Gestor';
      allowManualOrderNumberEditing = snapshot.allowManualOrderNumberEditing === true || snapshot.allowManualOrderNumberEditing === 'true';
      if (!allAdministrations.length) allAdministrations = collectLegacyAdministrationOptions();
      const migratedLegacyLiters = migrateFinanceEntries();
      syncOrderCounterWithOrders();
      return migratedLegacyLiters || migratedSupplierCities;
    }

    function getLegacyLocalStorageSnapshot() {
      // The old shared keys are deliberately left untouched for recovery, not adopted.
      if (!wefrotasStorageWorkspace) return {};
      return parseLocalStorageJson(`wefrotas:tenant:${wefrotasStorageWorkspace}:snapshot`, {});
    }




    function saveFullSnapshotToLocalStorage(snapshot = buildStorageSnapshot(), workspace = wefrotasStorageWorkspace) {
      if (!workspace) return;
      localStorage.setItem(`wefrotas:tenant:${workspace}:snapshot`, JSON.stringify(snapshot));
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
      const snapshotKey = wefrotasIndexedDbSnapshotKey;
      if (!snapshotKey) return Promise.resolve(null);
      return openWeFrotasIndexedDb().then((db) => new Promise((resolve, reject) => {
        const transaction = db.transaction(wefrotasIndexedDbStore, 'readonly');
        const store = transaction.objectStore(wefrotasIndexedDbStore);
        const request = store.get(snapshotKey);
        request.onsuccess = () => {
          wefrotasLocalSnapshotUpdatedAt = request.result?.updatedAt || '';
          resolve(request.result?.value || null);
        };
        request.onerror = () => reject(request.error || new Error('Falha ao ler IndexedDB.'));
      }));
    }

    function writeWeFrotasIndexedDbSnapshot(snapshot = buildStorageSnapshot(), snapshotKey = wefrotasIndexedDbSnapshotKey) {
      if (!snapshotKey) return Promise.resolve();
      return openWeFrotasIndexedDb().then((db) => new Promise((resolve, reject) => {
        const transaction = db.transaction(wefrotasIndexedDbStore, 'readwrite');
        const store = transaction.objectStore(wefrotasIndexedDbStore);
        const updatedAt = new Date().toISOString();
        const request = store.put({
          key: snapshotKey,
          value: snapshot,
          updatedAt
        });
        request.onsuccess = () => {
          wefrotasLocalSnapshotUpdatedAt = updatedAt;
          resolve();
        };
        request.onerror = () => reject(request.error || new Error('Falha ao salvar IndexedDB.'));
      }));
    }

    async function loadFromStorage() {
      if (!wefrotasStorageWorkspace) { applyStorageSnapshot({ centralCities: [] }); return; }
      try {
        const indexedDbSnapshot = await readWeFrotasIndexedDbSnapshot();
        if (indexedDbSnapshot) {
          wefrotasStorageEngine = 'IndexedDB';
          applyStorageSnapshot(indexedDbSnapshot);
          return;
        }

        const legacySnapshot = getLegacyLocalStorageSnapshot();
        applyStorageSnapshot(legacySnapshot);
        wefrotasStorageEngine = 'IndexedDB';
        await writeWeFrotasIndexedDbSnapshot(buildStorageSnapshot());
      } catch (error) {
        console.warn('IndexedDB indisponível. Mantendo fallback em localStorage.', error);
        wefrotasStorageEngine = 'localStorage';
        applyStorageSnapshot(getLegacyLocalStorageSnapshot());
      }
    }

    function saveToLocalStorage() {
      if (!wefrotasStorageWorkspace || !window.WeFrotasBackend?.isSnapshotReady?.()) return Promise.resolve();
      const workspace = wefrotasStorageWorkspace;
      const snapshotKey = wefrotasIndexedDbSnapshotKey;
      const snapshot = JSON.parse(JSON.stringify(buildStorageSnapshot()));
      window.WeFrotasBackend?.queueSnapshot(snapshot);

      if (wefrotasStorageEngine === 'IndexedDB') {
        wefrotasStorageQueue = wefrotasStorageQueue
          .then(() => writeWeFrotasIndexedDbSnapshot(snapshot, snapshotKey))
          .catch((error) => {
            console.warn('Falha ao salvar no IndexedDB. Salvando cópia de emergência em localStorage.', error);
            wefrotasStorageEngine = 'localStorage';
            saveFullSnapshotToLocalStorage(snapshot, workspace);
          });
        return wefrotasStorageQueue;
      }

      saveFullSnapshotToLocalStorage(snapshot);
      return Promise.resolve();
    }

    async function activateOrganizationStorage(organization) {
      await wefrotasStorageQueue.catch(() => {});
      wefrotasStorageWorkspace = organization.workspaceId;
      wefrotasIndexedDbSnapshotKey = `tenant:${organization.id}:${organization.workspaceId}`;
      wefrotasLocalSnapshotUpdatedAt = '';
      centralPendingRecords = [];
      centralPushDevices = [];
      centralHomeBanners = [];
      resetWefrotasUsers();
      centralPendingLoaded = false;
      centralPendingFiltersLoaded = false;
      centralPushSubscriberTotal = 0;
      selectedVehicles.clear(); selectedDrivers.clear(); selectedSuppliers.clear();
      selectedOrders.clear(); selectedFinance.clear();
      applyStorageSnapshot({ centralCities: [] });
      await loadFromStorage();
    }

    async function persistCentralConfigurationImmediately() {
      await saveToLocalStorage();
      const backend = window.WeFrotasBackend;
      if (backend?.getUser?.() && backend?.syncNow) {
        await backend.syncNow(buildStorageSnapshot());
      }
    }

    async function persistOperationalDataImmediately() {
      await saveToLocalStorage();
      const backend = window.WeFrotasBackend;
      if (!backend?.getUser?.() || !backend?.syncNow) throw new Error('Sessão online indisponível. Gravação não confirmada.');
      await backend.syncNow(buildStorageSnapshot());
    }

    async function persistFinanceImmediately() {
      await persistOperationalDataImmediately();
    }

    function updateOnlineStatus({ state = 'local', message = '', user = null } = {}) {
      const statusNode = document.getElementById('online-status');
      const textNode = document.getElementById('online-status-text');
      const syncButton = document.getElementById('online-sync-btn');
      const logoutButton = document.getElementById('online-logout-btn');
      if (!statusNode || !textNode) return;
      statusNode.classList.remove('is-local', 'is-online', 'is-syncing', 'is-error', 'is-signed-out');
      statusNode.classList.add(`is-${state}`);
      textNode.textContent = message || 'WeFrotas Online';
      if (syncButton) {
        syncButton.hidden = !user;
        syncButton.disabled = state === 'syncing';
        syncButton.classList.toggle('is-syncing', state === 'syncing');
        syncButton.classList.toggle('is-error', state === 'error');
        syncButton.title = message || 'Sincronizar dados';
        syncButton.setAttribute('aria-label', message || 'Sincronizar dados');
      }
      if (logoutButton) logoutButton.hidden = !user;
      if (user) updateManagerIdentityUi();
    }

    const onlineAuthStageOrder = ['validating', 'consulting', 'preparing', 'done'];

    function setOnlineAuthStage(stage = 'validating', message = '') {
      const stageIndex = Math.max(0, onlineAuthStageOrder.indexOf(stage));
      const titleNode = document.getElementById('online-auth-loading-title');
      const descriptionNode = document.getElementById('online-auth-checking-text');
      const iconNode = document.getElementById('online-auth-loading-icon');
      const defaultContent = {
        validating: ['Validando seu acesso', 'Confirmando sua sessão com segurança.'],
        consulting: ['Consultando informações', 'Buscando os dados atualizados da sua frota.'],
        preparing: ['Preparando seu ambiente', 'Organizando módulos, registros e preferências.'],
        done: ['Login validado', 'Tudo pronto. Abrindo o WeFrotas.']
      };
      const [title, description] = defaultContent[stage] || defaultContent.validating;
      if (titleNode) titleNode.textContent = title;
      if (descriptionNode) descriptionNode.textContent = message || description;
      iconNode?.classList.toggle('is-done', stage === 'done');
      document.querySelectorAll('[data-auth-stage]').forEach((node) => {
        const nodeIndex = onlineAuthStageOrder.indexOf(node.dataset.authStage);
        node.classList.toggle('is-complete', nodeIndex < stageIndex || stage === 'done');
        node.classList.toggle('is-active', nodeIndex === stageIndex && stage !== 'done');
      });
    }

    function showOnlineAuthChecking(message = 'Confirmando sua sessão com segurança.', stage = 'validating') {
      const backdrop = document.getElementById('online-auth-backdrop');
      const checking = document.getElementById('online-auth-checking');
      const layout = document.getElementById('online-auth-layout');
      if (!backdrop) return;
      document.body.classList.add('auth-locked');
      backdrop.classList.remove('hidden');
      checking?.classList.remove('hidden');
      layout?.classList.add('hidden');
      setOnlineAuthStage(stage, message);
      window.clearTimeout(onlineAuthSlowTimer);
      const noteNode = document.getElementById('online-auth-loading-note');
      if (noteNode) noteNode.textContent = 'Aguarde só um instante.';
      onlineAuthSlowTimer = window.setTimeout(() => {
        if (noteNode) noteNode.textContent = 'A conexão está levando um pouco mais, mas seus dados continuam protegidos.';
      }, 5000);
    }

    async function finishOnlineAuthChecking() {
      setOnlineAuthStage('done');
      window.clearTimeout(onlineAuthSlowTimer);
      await new Promise((resolve) => window.setTimeout(resolve, 380));
    }

    function toggleOnlineLogin(show, errorMessage = '') {
      const backdrop = document.getElementById('online-auth-backdrop');
      const checking = document.getElementById('online-auth-checking');
      const layout = document.getElementById('online-auth-layout');
      const errorNode = document.getElementById('online-auth-error');
      if (!backdrop) return;
      window.clearTimeout(onlineAuthSlowTimer);
      checking?.classList.add('hidden');
      layout?.classList.toggle('hidden', !show);
      document.body.classList.toggle('auth-locked', show);
      backdrop.classList.toggle('hidden', !show);
      if (errorMessage && errorNode) errorNode.textContent = errorMessage;
      if (show) window.setTimeout(() => document.getElementById('online-auth-email')?.focus(), 50);
    }

    function setOnlineLoginLoading(loading) {
      const submitButton = document.getElementById('online-auth-submit');
      const submitLabel = document.getElementById('online-auth-submit-label');
      if (submitButton) {
        submitButton.disabled = loading;
        submitButton.classList.toggle('is-loading', loading);
      }
      if (submitLabel) submitLabel.textContent = loading ? 'Entrando...' : 'Entrar';
    }

    function translateOnlineAuthError(error) {
      const rawMessage = String(error?.message || error?.type || '').trim();
      const normalized = rawMessage.toLowerCase();
      const code = Number(error?.code || 0);

      if (!rawMessage) return 'Não foi possível entrar. Tente novamente.';
      if (code === 401 || /invalid credentials|invalid email or password|user_invalid_credentials|password.*invalid|email.*invalid/i.test(rawMessage)) {
        return 'E-mail ou senha incorretos. Confira os dados e tente novamente.';
      }
      if (code === 429 || normalized.includes('rate limit') || normalized.includes('too many requests')) {
        return 'Muitas tentativas em sequência. Aguarde um pouco e tente novamente.';
      }
      if (normalized.includes('network') || normalized.includes('failed to fetch') || normalized.includes('load failed')) {
        return 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.';
      }
      if (normalized.includes('missing scope') || normalized.includes('unauthorized') || normalized.includes('permission')) {
        return 'Seu acesso não tem permissão para esta ação. Entre novamente ou fale com o administrador.';
      }
      if (normalized.includes('appwrite') && normalized.includes('configured')) {
        return 'O acesso online ainda não foi configurado corretamente.';
      }
      if (normalized.includes('session') && normalized.includes('active')) {
        return 'Já existe uma sessão ativa. Estamos recuperando seu acesso.';
      }
      if (normalized.includes('user') && normalized.includes('not found')) {
        return 'Usuário não encontrado. Confira o e-mail informado.';
      }
      if (normalized.includes('password') && normalized.includes('8')) {
        return 'A senha precisa ter pelo menos 8 caracteres.';
      }

      return rawMessage
        .replace(/Invalid credentials\.?/i, 'E-mail ou senha incorretos.')
        .replace(/Network request failed\.?/i, 'Falha de conexão com o servidor.')
        .replace(/Failed to fetch\.?/i, 'Falha ao conectar com o servidor.');
    }

    function setupOnlinePasswordToggle() {
      const passwordInput = document.getElementById('online-auth-password');
      const toggleButton = document.getElementById('online-auth-password-toggle');
      if (!passwordInput || !toggleButton) return;

      toggleButton.addEventListener('click', () => {
        const shouldShow = passwordInput.type === 'password';
        passwordInput.type = shouldShow ? 'text' : 'password';
        toggleButton.classList.toggle('is-visible', shouldShow);
        toggleButton.setAttribute('aria-pressed', shouldShow ? 'true' : 'false');
        toggleButton.setAttribute('aria-label', shouldShow ? 'Ocultar senha' : 'Mostrar senha');
        toggleButton.setAttribute('title', shouldShow ? 'Ocultar senha' : 'Mostrar senha');
        passwordInput.focus();
      });
    }

    function toggleOnlinePlatformLoading(show, message = 'Carregando...') {
      const loadingNode = document.getElementById('online-platform-loading');
      const loadingText = document.getElementById('online-platform-loading-text');
      loadingNode?.classList.toggle('hidden', !show);
      if (loadingText) loadingText.textContent = message;
    }

    async function waitForOnlineLogout(timeoutMs = 6000) {
      let timeoutId;
      const timeout = new Promise((_, reject) => {
        timeoutId = window.setTimeout(() => reject(new Error('O servidor demorou para confirmar o logout.')), timeoutMs);
      });
      try {
        await Promise.race([window.WeFrotasBackend?.signOut(), timeout]);
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    function stopOnlineIdleTimer() {
      window.clearTimeout(onlineIdleTimer);
      onlineIdleTimer = null;
    }

    function readOnlineLastActivityAt() {
      try {
        const value = Number(localStorage.getItem(ONLINE_LAST_ACTIVITY_STORAGE_KEY));
        return Number.isFinite(value) && value > 0 ? value : 0;
      } catch (error) {
        return 0;
      }
    }

    function markOnlineActivity() {
      const activityAt = Date.now();
      try {
        localStorage.setItem(ONLINE_LAST_ACTIVITY_STORAGE_KEY, String(activityAt));
      } catch (error) {}
      return activityAt;
    }

    function scheduleOnlineIdleLogout({ touch = true, delayMs = ONLINE_IDLE_TIMEOUT_MS } = {}) {
      stopOnlineIdleTimer();
      if (!window.WeFrotasBackend?.getUser() || document.body.classList.contains('auth-locked')) return;
      if (touch) markOnlineActivity();
      onlineIdleTimer = window.setTimeout(expireOnlineSessionByInactivity, Math.max(250, Number(delayMs) || ONLINE_IDLE_TIMEOUT_MS));
    }

    async function expireOnlineSessionByInactivity() {
      if (onlineLogoutInProgress || !window.WeFrotasBackend?.getUser()) return;
      const lastActivityAt = readOnlineLastActivityAt();
      const inactiveForMs = lastActivityAt > 0 ? Date.now() - lastActivityAt : ONLINE_IDLE_TIMEOUT_MS;
      if (inactiveForMs < ONLINE_IDLE_TIMEOUT_MS) {
        scheduleOnlineIdleLogout({ touch: false, delayMs: ONLINE_IDLE_TIMEOUT_MS - inactiveForMs });
        return;
      }
      onlineLogoutInProgress = true;
      stopOnlineIdleTimer();
      toggleOnlinePlatformLoading(true, 'Encerrando sessão por inatividade...');
      try {
        await waitForOnlineLogout();
      } catch (error) {
        console.warn('Não foi possível encerrar a sessão remota por inatividade.', error);
      } finally {
        toggleOnlinePlatformLoading(false);
        onlineLogoutInProgress = false;
        toggleOnlineLogin(true, 'Sua sessão foi encerrada após 10 minutos sem atividade.');
      }
    }

    function registerOnlineIdleListeners() {
      if (onlineIdleListenersRegistered) return;
      onlineIdleListenersRegistered = true;
      ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((eventName) => {
        window.addEventListener(eventName, scheduleOnlineIdleLogout, { passive: true });
      });
    }

    async function applyRemoteStorageSnapshot(snapshot) {
      const migratedStorage = applyStorageSnapshot(snapshot);
      try {
        wefrotasStorageEngine = 'IndexedDB';
        await writeWeFrotasIndexedDbSnapshot(buildStorageSnapshot());
      } catch (error) {
        wefrotasStorageEngine = 'localStorage';
        saveFullSnapshotToLocalStorage(buildStorageSnapshot());
      }
      renderAll();
      renderNotifications();
      updateCustomLogoUi();
      updateManagerIdentityUi();
      updateOperationSettingsUi();
      if (migratedStorage && window.WeFrotasBackend?.isSnapshotReady?.()) {
        await persistCentralConfigurationImmediately().catch((error) => {
          console.warn('A migração local foi aplicada, mas ainda não pôde ser sincronizada.', error);
        });
      }
    }

    async function connectWeFrotasOnline() {
      showOnlineAuthChecking('Confirmando se já existe uma sessão ativa.', 'validating');
      const backend = window.WeFrotasBackend;
      if (!backend) {
        updateOnlineStatus({ state: 'error', message: 'Backend não carregado.' });
        toggleOnlineLogin(true, 'Não foi possível carregar o acesso online. Tente novamente.');
        return null;
      }
      const user = await backend.initialize({
        getSnapshot: buildStorageSnapshot,
        getSnapshotUpdatedAt: () => wefrotasLocalSnapshotUpdatedAt,
        prepareSnapshot: prepareSnapshotForOnline,
        persistSnapshot: (snapshot, workspaceId, expectedUpdatedAt) => executeCentralPushAdmin({ action: 'wefrotas-snapshot-save', snapshot, workspaceId, expectedUpdatedAt }),
        applySnapshot: applyRemoteStorageSnapshot,
        onStatus: updateOnlineStatus,
        onCentralRecordsChange: () => refreshCentralPendingRecords({ silent: true })
      });
      if (!backend.isConfigured()) {
        toggleOnlineLogin(true, 'O acesso online ainda não foi configurado.');
        return null;
      }
      if (!user) {
        toggleOnlineLogin(true);
        return null;
      }
      setOnlineAuthStage('consulting');
      let preparingTimer = window.setTimeout(() => setOnlineAuthStage('preparing'), 700);
      try {
        await loadAuthorizedOrganizationContext();
        const result = await backend.adoptRemoteOrUploadLocal();
        window.clearTimeout(preparingTimer);
        preparingTimer = null;
        await finishOnlineAuthChecking();
        toggleOnlineLogin(false);
        scheduleOnlineIdleLogout();
        startCentralPendingAutoRefresh();
        refreshCentralPendingRecords({ silent: true });
        return result;
      } catch (error) {
        window.clearTimeout(preparingTimer);
        console.error('Sessão recuperada, mas os dados continuam pendentes.', error);
        toggleOnlineLogin(true, 'Não foi possível confirmar os dados da empresa. Tente entrar novamente.');
        updateOnlineStatus({
          state: 'error',
          message: `Conectado, mas a sincronização está pendente: ${error?.message || 'erro no Appwrite'}`,
          user
        });
        return { mode: 'local-pending', error };
      }
    }

    async function loginWeFrotasOnline(event) {
      event?.preventDefault();
      if (onlineLoginInProgress) return;
      const backend = window.WeFrotasBackend;
      const email = document.getElementById('online-auth-email')?.value.trim() || '';
      const password = document.getElementById('online-auth-password')?.value || '';
      const errorNode = document.getElementById('online-auth-error');
      if (errorNode) errorNode.textContent = '';
      if (!backend) {
        if (errorNode) errorNode.textContent = 'O serviço de acesso não foi carregado. Atualize a página.';
        return;
      }
      if (!email || !password) {
        if (errorNode) errorNode.textContent = 'Informe e-mail e senha para entrar.';
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (errorNode) errorNode.textContent = 'Informe um e-mail válido.';
        return;
      }
      onlineLoginInProgress = true;
      let signedIn = false;
      setOnlineLoginLoading(true);
      try {
        showOnlineAuthChecking('Validando e-mail e senha.', 'validating');
        const user = await backend.signIn(email, password);
        signedIn = true;
        setOnlineAuthStage('consulting');
        let preparingTimer = window.setTimeout(() => setOnlineAuthStage('preparing'), 700);
        try {
          await loadAuthorizedOrganizationContext();
          await backend.adoptRemoteOrUploadLocal();
        } catch (syncError) {
          console.error('Login concluído com sincronização pendente.', syncError);
          updateOnlineStatus({
            state: 'error',
            message: `Conectado, mas a sincronização está pendente: ${syncError?.message || 'erro no Appwrite'}`,
            user
          });
          throw syncError;
        } finally {
          window.clearTimeout(preparingTimer);
        }
        await finishOnlineAuthChecking();
        toggleOnlineLogin(false);
        scheduleOnlineIdleLogout();
        startCentralPendingAutoRefresh();
        refreshCentralPendingRecords();
        showToast('WeFrotas Online conectado.');
      } catch (error) {
        if (signedIn) await backend.signOut().catch(() => {});
        toggleOnlineLogin(true, translateOnlineAuthError(error));
      } finally {
        onlineLoginInProgress = false;
        setOnlineLoginLoading(false);
      }
    }

    async function logoutWeFrotasOnline() {
      if (onlineLogoutInProgress) return;
      onlineLogoutInProgress = true;
      closeReceiptViewer();
      updateFinanceReceiptPreview('');
      stopOnlineIdleTimer();
      const logoutButton = document.getElementById('online-logout-btn');
      const previousLabel = logoutButton?.textContent || 'Sair';
      if (logoutButton) {
        logoutButton.disabled = true;
        logoutButton.textContent = 'Saindo...';
      }
      toggleOnlinePlatformLoading(true, 'Encerrando sua sessão...');
      try {
        await waitForOnlineLogout();
      } catch (error) {
        console.warn('Não foi possível encerrar a sessão remota.', error);
      } finally {
        toggleOnlinePlatformLoading(false);
        onlineLogoutInProgress = false;
        if (logoutButton) {
          logoutButton.disabled = false;
          logoutButton.textContent = previousLabel;
        }
        toggleOnlineLogin(true);
      }
    }

    async function syncWeFrotasOnline({ quiet = false } = {}) {
      try {
        await window.WeFrotasBackend?.syncNow(buildStorageSnapshot());
        await refreshCentralPendingRecords();
        if (!quiet) showToast('Dados e registros da Central atualizados.');
      } catch (error) {
        if (!quiet) showToast(error?.message || 'Não foi possível sincronizar agora.');
      }
    }

    function startCentralPendingAutoRefresh() {
      window.clearInterval(centralPendingAutoRefreshTimer);
      centralPendingAutoRefreshTimer = window.setInterval(() => {
        if (document.visibilityState !== 'visible' || !window.WeFrotasBackend?.getUser?.()) return;
        refreshCentralPendingRecords({ silent: true });
        if (activeCentralSection === 'usuarios' || activeCentralSection === 'notificacoes') {
          refreshPushSubscriberStats();
        }
      }, 15000);
    }

    window.logoutWeFrotasOnline = logoutWeFrotasOnline;
    window.syncWeFrotasOnline = syncWeFrotasOnline;

    window.recoverWeFrotasFromServer = async function () {
      if (!window.confirm('Preservar as pendências locais em backup e carregar a versão atual do servidor? Nenhum dado será enviado ou substituído no servidor.')) return;
      try {
        const { backup } = await window.WeFrotasBackend.recoverFromServer({ confirmed: true });
        downloadBlob(`wefrotas_conciliacao_${Date.now()}.json`, new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json;charset=utf-8' }));
        showToast(`Cópia do servidor carregada. Backup preservado. Campos para conciliação: ${backup.differingFields.join(', ') || 'nenhum'}.`);
      } catch (error) {
        showToast(`Recuperação não concluída: ${error?.message || 'erro desconhecido'}`);
      }
    };

    window.reviewWeFrotasRecoveryBackup = function () {
      const organizationId = window.WeFrotasBackend?.getOrganizationContext?.().id;
      if (!organizationId) return showToast('Empresa não confirmada.');
      const prefix = `wefrotas:recovery:${organizationId}:`;
      const keys = Object.keys(localStorage).filter(key => key.startsWith(prefix)).sort().reverse();
      if (!keys.length) return showToast('Nenhum backup de conciliação desta empresa neste navegador.');
      try {
        const backup = JSON.parse(localStorage.getItem(keys[0]));
        const lines = [`Backup: ${backup.createdAt}. As duas cópias estão preservadas. Nenhum dado será alterado.`];
        for (const field of backup.differingFields || []) {
          const local = backup.localSnapshot[field], remote = backup.serverSnapshot[field];
          if (Array.isArray(local) && Array.isArray(remote) && [...local, ...remote].every(item => item && item.id)) {
            const localById = new Map(local.map(item => [String(item.id), item]));
            const remoteById = new Map(remote.map(item => [String(item.id), item]));
            const localOnly = local.filter(item => !remoteById.has(String(item.id)));
            const remoteOnly = remote.filter(item => !localById.has(String(item.id)));
            lines.push(`${field}: local ${local.length}, servidor ${remote.length}; exclusivos locais ${localOnly.length}, exclusivos no servidor ${remoteOnly.length}.`);
            for (const item of localOnly.slice(0, 20)) lines.push(`Somente local: ${field} ${item.numero || item.nome || item.placa || item.id}.`);
            for (const item of local) {
              const other = remoteById.get(String(item.id));
              if (!other) continue;
              const changed = [...new Set([...Object.keys(item), ...Object.keys(other)])]
                .filter(key => JSON.stringify(item[key]) !== JSON.stringify(other[key]));
              if (changed.length) lines.push(`${field} ${item.numero || item.nome || item.placa || item.id}: ${changed.join(', ')}.`);
            }
          } else lines.push(`Diferença em ${field}.`);
        }
        openPromptModal({ title: 'Conciliação preservada', text: lines.join('\n'), mode: 'confirm',
          confirmLabel: 'Baixar as duas versões', cancelLabel: 'Fechar',
          onConfirm: () => downloadBlob(`wefrotas_conciliacao_${backup.createdAt.replace(/[:.]/g, '-')}.json`, new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json;charset=utf-8' })) });
      } catch (error) { showToast(`Não foi possível ler o backup: ${error.message}`); }
    };

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

    function initializeSettingsPage() {
      const sourcePanel = document.getElementById('settings-page-source');
      const sourceBody = sourcePanel?.querySelector('.panel-body');
      const mount = document.getElementById('settings-page-mount');
      if (sourceBody && mount && sourceBody.parentElement !== mount) {
        sourceBody.classList.add('settings-page-body');
        mount.appendChild(sourceBody);
      }
      const centralSettingsMount = document.getElementById('settings-central-mount');
      const centralSettingsView = document.getElementById('central-view-configuracoes');
      const centralSettingsShell = centralSettingsView?.querySelector('.central-config-shell');
      if (centralSettingsMount && centralSettingsShell && centralSettingsShell.parentElement !== centralSettingsMount) {
        centralSettingsMount.appendChild(centralSettingsShell);
        centralSettingsView.remove();
      }
      sourcePanel?.remove();
    }

    function toggleSettings(force) {
      if (force === false) return;
      toggleNotifications(false);
      showModule('settings', getModuleNavButton('settings'));
      updateCustomLogoUi();
      openSettingsScreen('home');
    }

    function openSettingsScreen(screen) {
      document.querySelectorAll('.settings-screen').forEach((node) => node.classList.remove('active'));
      const target = document.getElementById(`settings-screen-${screen}`);
      target?.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function openCentralCommunicationFromSettings() {
      if (!requireWefrotasPermission('manageSettings', 'Seu perfil não possui acesso às configurações da Central.')) return;
      showModule('settings', getModuleNavButton('settings'));
      openSettingsScreen('central');
      showCentralConfigSection('comunicacao');
    }

    function openWefrotasUsersFromSettings() {
      showCentralSubmodule('usuarios');
    }

    function setCentralBannerFeedback(message, isError = false) {
      const node = document.getElementById('central-banner-feedback');
      if (!node) return;
      node.textContent = message || '';
      node.classList.toggle('is-error', Boolean(isError));
    }

    function previewCentralBannerFile() {
      const file = document.getElementById('central-banner-file')?.files?.[0];
      const preview = document.getElementById('central-banner-preview');
      const placeholder = document.getElementById('central-banner-preview-placeholder');
      if (!preview) return;
      if (!file) {
        preview.removeAttribute('src');
        preview.classList.add('hidden');
        placeholder?.classList.remove('hidden');
        return;
      }
      preview.src = URL.createObjectURL(file);
      preview.classList.remove('hidden');
      placeholder?.classList.add('hidden');
    }

    function renderCentralBanners() {
      const list = document.getElementById('central-banner-list');
      if (!list) return;
      const rows = centralHomeBanners
        .filter((banner) => !isCentralBannerMigrationMarker(banner))
        .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
      if (!rows.length) {
        selectedCentralBannerId = '';
        updateCentralBannerActionbar(rows);
        list.innerHTML = '<p class="settings-description">Nenhum banner personalizado. A Central continua usando os banners padrão do aplicativo.</p>';
        return;
      }
      if (!rows.some((banner) => String(banner.$id) === String(selectedCentralBannerId))) selectedCentralBannerId = '';
      list.innerHTML = rows.map((banner, index) => `
        <article class="central-banner-item ${banner.active ? '' : 'is-disabled'} ${String(banner.$id) === String(selectedCentralBannerId) ? 'is-selected' : ''}" data-banner-id="${escapeHtml(banner.$id)}" onclick="selectCentralBanner(this.dataset.bannerId)">
          <span class="central-entity-selector" aria-hidden="true">${String(banner.$id) === String(selectedCentralBannerId) ? '✓' : ''}</span>
          <img src="${escapeHtml(banner.imageUrl || '')}" alt="${escapeHtml(banner.title || 'Banner da Central')}">
          <div class="central-banner-item-copy">
            <strong>${escapeHtml(banner.title || 'Banner sem descrição')} ${isBuiltinCentralBanner(banner) ? '<em>PADRÃO</em>' : ''}</strong>
            <span>${banner.active ? 'Visível no aplicativo' : 'Oculto no aplicativo'} · ${getCentralBannerDuration(banner.imageUrl) / 1000} s</span>
          </div>
        </article>
      `).join('');
      updateCentralBannerActionbar(rows);
    }

    function isBuiltinCentralBanner(banner) {
      return String(banner?.fileId || '').startsWith('builtin:');
    }

    function isCentralBannerMigrationMarker(banner) {
      return String(banner?.fileId || '') === CENTRAL_DEFAULT_BANNERS_MIGRATION.fileId;
    }

    function getBuiltinCentralBannerData(definition) {
      return {
        title: definition.title,
        imageUrl: new URL(`../postoscredenciados-covreecia/assets/home/${definition.path}`, window.location.href).href,
        fileId: definition.fileId,
        active: true,
        sortOrder: definition.sortOrder
      };
    }

    async function ensureDefaultCentralBanners(rows) {
      if (window.WeFrotasBackend?.getOrganizationContext?.()?.workspaceId !== 'covre-e-cia') return rows;
      if (rows.some(isCentralBannerMigrationMarker)) return rows;
      if (!window.WeFrotasBackend?.upsertCentralHomeBanner) return rows;
      if (!centralDefaultBannersSeeding) {
        centralDefaultBannersSeeding = (async () => {
          const customRows = [...rows]
            .filter((banner) => !isBuiltinCentralBanner(banner))
            .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
          await Promise.all(customRows.map((banner, index) => (
            window.WeFrotasBackend.updateCentralHomeBanner(banner.$id, { sortOrder: 100 + index })
          )));
          await Promise.all(CENTRAL_DEFAULT_BANNERS.map((definition) => (
            window.WeFrotasBackend.upsertCentralHomeBanner(definition.rowId, getBuiltinCentralBannerData(definition))
          )));
          await window.WeFrotasBackend.upsertCentralHomeBanner(
            CENTRAL_DEFAULT_BANNERS_MIGRATION.rowId,
            { ...getBuiltinCentralBannerData(CENTRAL_DEFAULT_BANNERS_MIGRATION), active: false }
          );
        })().finally(() => {
          centralDefaultBannersSeeding = null;
        });
      }
      await centralDefaultBannersSeeding;
      return window.WeFrotasBackend.listCentralHomeBanners();
    }

    async function loadCentralBanners() {
      const list = document.getElementById('central-banner-list');
      if (list) list.innerHTML = '<p class="settings-description">Carregando banners...</p>';
      try {
        centralHomeBanners = await window.WeFrotasBackend.listCentralHomeBanners();
        if (!centralHomeBanners.some(isCentralBannerMigrationMarker)) {
          if (list) list.innerHTML = '<p class="settings-description">Importando os banners atuais da Central...</p>';
          centralHomeBanners = await ensureDefaultCentralBanners(centralHomeBanners);
        }
        renderCentralBanners();
      } catch (error) {
        if (list) list.innerHTML = `<p class="settings-description is-error">${escapeHtml(error?.message || 'Não foi possível carregar os banners.')}</p>`;
      }
    }

    async function saveCentralBanner() {
      if (centralBannerSaving) return;
      const fileInput = document.getElementById('central-banner-file');
      const titleInput = document.getElementById('central-banner-title');
      const file = fileInput?.files?.[0];
      const title = titleInput?.value.trim() || '';
      const duration = Number(document.getElementById('central-banner-duration')?.value || 6000);
      if (!file || !title) {
        setCentralBannerFeedback('Informe uma descrição e escolha uma imagem.', true);
        return;
      }
      centralBannerSaving = true;
      const button = document.getElementById('central-banner-save');
      if (button) { button.disabled = true; button.textContent = 'Enviando...'; }
      setCentralBannerFeedback('Enviando imagem com acesso público somente para leitura...');
      let upload = null;
      try {
        upload = await window.WeFrotasBackend.uploadCentralBanner(file);
        const nextOrder = centralHomeBanners
          .filter((item) => !isCentralBannerMigrationMarker(item))
          .reduce((max, item) => Math.max(max, Number(item.sortOrder || 0)), -1) + 1;
        await window.WeFrotasBackend.createCentralHomeBanner({ title, imageUrl: setCentralBannerDuration(upload.imageUrl, duration), fileId: upload.fileId, active: true, sortOrder: nextOrder });
        fileInput.value = '';
        titleInput.value = '';
        previewCentralBannerFile();
        await loadCentralBanners();
        centralBannerSaving = false;
        closeCentralBannerModal();
        showToast('Banner publicado no carrossel.');
      } catch (error) {
        if (upload?.fileId) window.WeFrotasBackend.deleteCentralBannerFile(upload.fileId).catch(() => undefined);
        setCentralBannerFeedback(error?.message || 'Não foi possível publicar o banner.', true);
      } finally {
        centralBannerSaving = false;
        if (button) { button.disabled = false; button.textContent = 'Publicar no carrossel'; }
      }
    }

    async function toggleCentralBanner(rowId) {
      const banner = centralHomeBanners.find(item => item.$id === rowId);
      if (!banner) return;
      try {
        await window.WeFrotasBackend.updateCentralHomeBanner(rowId, { active: !banner.active });
        banner.active = !banner.active;
        renderCentralBanners();
      } catch (error) { showToast(error?.message || 'Não foi possível alterar o banner.'); }
    }

    async function moveCentralBanner(rowId, direction) {
      const rows = centralHomeBanners
        .filter((banner) => !isCentralBannerMigrationMarker(banner))
        .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
      const index = rows.findIndex(item => item.$id === rowId);
      const other = rows[index + direction];
      if (index < 0 || !other) return;
      const current = rows[index];
      const currentOrder = Number(current.sortOrder || index);
      const otherOrder = Number(other.sortOrder || index + direction);
      try {
        await Promise.all([
          window.WeFrotasBackend.updateCentralHomeBanner(current.$id, { sortOrder: otherOrder }),
          window.WeFrotasBackend.updateCentralHomeBanner(other.$id, { sortOrder: currentOrder })
        ]);
        current.sortOrder = otherOrder;
        other.sortOrder = currentOrder;
        renderCentralBanners();
      } catch (error) { showToast(error?.message || 'Não foi possível reordenar os banners.'); }
    }

    function confirmDeleteCentralBanner(rowId) {
      const banner = centralHomeBanners.find(item => item.$id === rowId);
      if (!banner) return;
      openPromptModal({
        title: 'Excluir este banner?',
        text: isBuiltinCentralBanner(banner)
          ? 'Este banner padrão deixará de aparecer no aplicativo. Você poderá reenviá-lo manualmente depois.'
          : 'A imagem deixará de aparecer no aplicativo.',
        mode: 'confirm',
        confirmLabel: 'Excluir',
        onConfirm: () => deleteCentralBanner(rowId)
      });
    }

    async function deleteCentralBanner(rowId) {
      const banner = centralHomeBanners.find(item => item.$id === rowId);
      if (!banner) return;
      try {
        await executeCentralPushAdmin({ action: 'central-banner-delete', rowId });
        centralHomeBanners = centralHomeBanners.filter(item => item.$id !== rowId);
        if (String(selectedCentralBannerId) === String(rowId)) selectedCentralBannerId = '';
        renderCentralBanners();
        showToast('Banner removido.');
      } catch (error) { showToast(error?.message || 'Não foi possível excluir o banner.'); }
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
      return match ? String(parseDecimalInputValue(match[0])) : '';
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
        motoristaId: vehicle?.motoristaId || vehicle?.driverId || '',
        ativo: isEntityActive(vehicle)
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
        ativo: isEntityActive(driver),
        vehicleIds: Array.from(new Set(vehicleIds.filter(Boolean).map(String)))
      };
    }

    function normalizeSupplierRecord(supplier) {
      return {
        ...supplier,
        ativo: isEntityActive(supplier),
        tipoLabel: supplier?.tipoLabel || getSupplierTypeLabel(supplier?.tipo),
        cidade: String(supplier?.cidade || supplier?.cidadePosto || '').trim(),
        endereco: String(supplier?.endereco || supplier?.address || '').trim(),
        mapaUrl: String(supplier?.mapaUrl || supplier?.linkMapa || supplier?.mapLink || '').trim()
      };
    }

    function normalizeCentralCityRecord(city) {
      return {
        id: String(city?.id || generateId()),
        name: String(city?.name || city?.nome || '').trim(),
        imageUrl: String(city?.imageUrl || city?.imagemUrl || '').trim(),
        fileId: String(city?.fileId || '').trim(),
        active: city?.active !== false && city?.ativo !== false,
        featured: city?.featured === true || city?.destaque === true
      };
    }

    function ensureSupplierCitiesRegistered() {
      const known = new Set(centralCities.map((city) => normalizeComparableText(city.name)));
      let changed = false;
      allSuppliers.forEach((supplier) => {
        const name = String(supplier?.cidade || '').trim();
        const key = normalizeComparableText(name);
        if (!name || !key || known.has(key)) return;
        centralCities.push({
          id: generateId(),
          name,
          imageUrl: new URL('../postoscredenciados-covreecia/assets/home/buscar-postos.jpeg', window.location.href).href,
          fileId: 'builtin:city-generic',
          active: true,
          featured: false
        });
        known.add(key);
        changed = true;
      });
      return changed;
    }

    function getDriverVehicleIds(driver) {
      if (!driver) return [];
      // O cadastro do motorista e sua lista `vehicleIds` são a fonte oficial.
      // `motoristaId` permanece apenas como compatibilidade para registros realmente
      // legados que ainda não possuem a propriedade `vehicleIds`.
      if (Array.isArray(driver.vehicleIds)) {
        return Array.from(new Set(driver.vehicleIds.filter(Boolean).map(String)));
      }
      const linkedFromDriver = driver.vehicleId ? [driver.vehicleId] : [];
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

    function getDriverComparableTokens(value) {
      const ignoredTokens = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);
      return normalizeComparableText(value)
        .split(/\s+/)
        .map(token => token.trim())
        .filter(token => token && !ignoredTokens.has(token));
    }

    function getDriverMatchScore(importedTokens, driverTokens) {
      if (!importedTokens.length || !driverTokens.length) return 0;
      const importedText = importedTokens.join(' ');
      const driverText = driverTokens.join(' ');
      if (driverText === importedText) return 100;
      if (driverText.includes(importedText) || importedText.includes(driverText)) return 82;
      const commonTokens = importedTokens.filter(token => driverTokens.includes(token));
      let score = commonTokens.length * 22;
      if (importedTokens[0] && driverTokens[0] === importedTokens[0]) score += 24;
      if (importedTokens[1] && driverTokens[1] === importedTokens[1]) score += 18;
      if (importedTokens.at(-1) && driverTokens.includes(importedTokens.at(-1))) score += 12;
      if (importedTokens.length === 1 && driverTokens[0] === importedTokens[0]) score += 18;
      return score;
    }

    function resolveDriverByImportedName(name) {
      const normalized = normalizeComparableText(name);
      if (!normalized) return null;
      const exactMatch = allDrivers.find((driver) => normalizeComparableText(driver.nome) === normalized);
      if (exactMatch) return exactMatch;
      const importedTokens = getDriverComparableTokens(name);
      const rankedMatches = allDrivers
        .map((driver) => ({
          driver,
          score: getDriverMatchScore(importedTokens, getDriverComparableTokens(driver.nome))
        }))
        .filter(item => item.score >= 40)
        .sort((a, b) => b.score - a.score);
      if (!rankedMatches.length) return null;
      const [best, second] = rankedMatches;
      if (second && best.score === second.score) return null;
      return best.driver;
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
      const normalizedSource = normalizeComparableText(sourceText);
      const isServiceRecord = normalizedSource.includes('registro de servico')
        || normalizedSource.includes('registro de servicos')
        || normalizedSource.includes('comprovante de servico')
        || normalizedSource.includes('comprovante de servicos');
      const importedData = {
        type: isServiceRecord ? 'service' : 'loose_note',
        motorista: readField('Motorista'),
        fornecedor: readField('Fornecedor') || readField('Nome do fornecedor') || readField('Posto'),
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

    function showImportResolutionFeedback(missingItems = [], successMessage = 'Dados importados. Revise e finalize o lançamento.') {
      const missing = missingItems.filter(Boolean);
      if (!missing.length) {
        showToast(successMessage);
        return;
      }
      showToast(`Importação concluída com atenção: ${missing.join(', ')} não encontrado(s) no cadastro.`);
    }

    function syncFinanceImportSelects() {
      [
        'finance-supplier-id',
        'finance-driver-id',
        'finance-fuel-type'
      ].forEach(syncCustomSelectById);
      toggleFinanceSpecificFields();
    }

    function parseImportedCentralMessage(rawText) {
      const sourceText = String(rawText || '').trim();
      const normalized = normalizeComparableText(sourceText);
      if (!sourceText) return null;
      if (
        normalized.includes('registro de notinha avulsa') ||
        normalized.includes('registro de servico') ||
        normalized.includes('registro de servicos') ||
        normalized.includes('comprovante de servico') ||
        normalized.includes('comprovante de servicos')
      ) {
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
        notes.push(`Posto não encontrado no cadastro: ${importedData.posto}`);
      }
      if (!vehicle && importedData.motorista) {
        notes.push(`Veículo não localizado automaticamente para o motorista ${importedData.motorista}`);
      }

      const observationsField = document.getElementById('finance-observacoes');
      if (observationsField) {
        observationsField.value = notes.join(' | ');
      }

      updateFinanceReceiptPreview(importedData.comprovanteUrl || '');
      syncFinanceImportSelects();

      const pendingFields = [];
      if (!vehicle) pendingFields.push('veículo');
      if (!supplier) pendingFields.push('posto');
      if (!driver && importedData.motorista) pendingFields.push('motorista');
      if (!importedData.tipoCombustivel) pendingFields.push('tipo de combustível');
      if (!importedData.litros) pendingFields.push('quantidade em litros');
      if (!importedData.valor || !parseCurrencyInputValue(importedData.valor)) pendingFields.push('valor');
      showImportResolutionFeedback(pendingFields, 'Abastecimento importado. Revise os dados e finalize o lançamento.');
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
        document.getElementById('finance-nf').value = importedData.type === 'service' ? 'REGISTRO DE SERVIÇOS' : 'NOTINHA AVULSA';
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
        notes.push(`Fornecedor não encontrado no cadastro: ${importedData.fornecedor}`);
      }

      const observationsField = document.getElementById('finance-observacoes');
      if (observationsField) {
        observationsField.value = notes.join(' | ');
      }

      toggleFinanceSpecificFields();
      const missingItems = [];
      if (!supplier && importedData.fornecedor) missingItems.push('fornecedor');
      showImportResolutionFeedback(
        missingItems,
        importedData.type === 'service'
          ? 'Registro de serviços importado. Revise os dados e finalize o lançamento.'
          : 'Notinha avulsa importada. Revise os dados e finalize o lançamento.'
      );
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
      const city = normalizeComparableText(payload.cidade);
      return allSuppliers.find((item) =>
        item.id !== ignoreId && (
          (documentDigits && onlyDigits(item.documento || '') === documentDigits) ||
          (
            normalizeComparableText(item.nome) === name &&
            normalizeComparableText(item.tipo) === type &&
            (type !== 'posto' || normalizeComparableText(item.cidade) === city)
          )
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
      central: {
        title: 'Central de Registros',
        subtitle: 'Gerencie registros, notificações, usuários e configurações da Central em um único lugar.'
      },
      relatorios: {
        title: 'Relatórios',
        subtitle: 'Visualize custos, desempenho e histórico da operação com leitura rápida.'
      },
      settings: {
        title: 'Configurações',
        subtitle: 'Personalize, administre e mantenha o WeFrotas.'
      }
    };

    const centralSectionHeaderContent = {
      registros: {
        title: 'Registros da Central',
        subtitle: 'Analise, aprove, rejeite e acompanhe os registros enviados pelo aplicativo.'
      },
      notificacoes: {
        title: 'Notificações da Central',
        subtitle: 'Envie comunicados gerais ou mensagens para um aparelho específico.'
      },
      usuarios: {
        title: 'Usuários da Central',
        subtitle: 'Relacione os aparelhos inscritos aos motoristas cadastrados no WeFrotas.'
      },
      configuracoes: {
        title: 'Configurações da Central',
        subtitle: 'Organize comunicação, regras de registro e integrações do aplicativo.'
      }
    };

    function updateModuleHeader(module) {
      const titleNode = document.getElementById('module-header-title');
      const subtitleNode = document.getElementById('module-header-subtitle');
      const content = module === 'central'
        ? (centralSectionHeaderContent[activeCentralSection] || moduleHeaderContent.central)
        : (moduleHeaderContent[module] || moduleHeaderContent.home);
      if (titleNode) titleNode.textContent = content.title;
      if (subtitleNode) subtitleNode.textContent = content.subtitle;
    }


    async function executeCentralPushAdmin(payload) {
      const requestedUserId = window.WeFrotasBackend?.getUser?.()?.$id;
      const requestedWorkspaceId = window.WeFrotasBackend?.getOrganizationContext?.()?.workspaceId;
      const backend = window.WeFrotasBackend;
      if (!backend?.executeAdministrativeFunction) {
        throw new Error('Atualize a página para carregar o serviço de acesso.');
      }

      const execution = await backend.executeAdministrativeFunction({
        ...payload,
        expectedUserId: requestedUserId,
        expectedWorkspaceId: payload.action === 'my-access' ? undefined : requestedWorkspaceId
      });

      if (requestedUserId !== window.WeFrotasBackend?.getUser?.()?.$id) {
        throw new Error('A sessão mudou. A resposta da empresa anterior foi descartada.');
      }
      if (payload.action !== 'my-access' && requestedWorkspaceId !== window.WeFrotasBackend?.getOrganizationContext?.()?.workspaceId) {
        throw new Error('A empresa mudou. A resposta da empresa anterior foi descartada.');
      }
      let result = {};
      try {
        result = JSON.parse(execution.responseBody || '{}');
      } catch (error) {
        result = {};
      }

      if (execution.status === 'failed' || execution.responseStatusCode >= 400 || result.ok === false) {
        throw new Error(result.error || execution.errors || 'A função de notificações não concluiu a operação.');
      }
      return result;
    }

    async function loadAuthorizedOrganizationContext() {
      // A mesma aba pode autenticar outra empresa. Remova qualquer comprovante
      // transitório antes de consultar/aplicar o novo contexto para não manter
      // conteúdo visual da sessão anterior sobre a nova organização.
      closeReceiptViewer();
      updateFinanceReceiptPreview('');
      const result = await executeCentralPushAdmin({ action: 'my-access' });
      if (!result.organization?.workspaceId) throw new Error('Seu usuário ainda não está vinculado a uma empresa ativa.');
      if (!result.organization.modules?.includes('wefrotas')) throw new Error('A licença desta empresa não inclui o WeFrotas.');
      window.WeFrotasBackend?.setOrganizationContext({
        ...result.organization,
        role: result.role
      });
      await activateOrganizationStorage(result.organization);
      updateManagerIdentityUi();
      const tenantLogo = document.getElementById('wefrotas-tenant-logo');
      if (tenantLogo) {
        tenantLogo.src = result.organization.branding?.logoUrl || wefrotasLogoSrc;
        tenantLogo.alt = `Logo ${result.organization.name || 'da empresa'}`;
      }
      return result.organization;
    }

    const wefrotasRoleDefinitions = Object.freeze({
      'wefrotas-admin': { label: 'Administrador', appwriteLabel: 'admin', description: 'Acesso total, inclusive usuários, configurações e ações críticas.' },
      'wefrotas-gestor': { label: 'Gestor', appwriteLabel: 'gestor', description: 'Gerencia a operação e os cadastros, mas não administra contas de acesso.' },
      'wefrotas-aprovador': { label: 'Aprovador', appwriteLabel: 'aprovador', description: 'Analisa, aprova, rejeita e audita registros da Central.' },
      'wefrotas-consulta': { label: 'Consulta', appwriteLabel: 'consulta', description: 'Acesso de leitura, sem alterações operacionais.' }
    });

    function getWefrotasRoleDefinition(role) {
      return wefrotasRoleDefinitions[role] || wefrotasRoleDefinitions['wefrotas-consulta'];
    }

    function formatWefrotasUserAccessDate(value) {
      if (!value) return 'Ainda não acessou';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return 'Acesso não informado';
      return `Último acesso em ${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }

    function renderWefrotasUsers() {
      const list = document.getElementById('central-users-list');
      if (!list) return;
      if (centralManagerUsersLoading) {
        list.innerHTML = '<div class="central-devices-empty"><span class="central-devices-spinner"></span>Atualizando contas de acesso…</div>';
        return;
      }
      if (!centralManagerUsers.length) {
        list.innerHTML = '<div class="central-devices-empty">Nenhum usuário encontrado para esta pesquisa.</div>';
        return;
      }
      const currentUserId = String(window.WeFrotasBackend?.getUser?.()?.$id || '');
      list.innerHTML = centralManagerUsers.map((user) => {
        const role = getWefrotasRoleDefinition(user.role);
        const active = user.status !== false;
        const isCurrent = user.id === currentUserId;
        const syncError = String(user.syncError || '');
        return `<article class="central-user-card ${active ? '' : 'is-inactive'}">
          <span class="central-user-avatar">${escapeHtml(getNameInitials(user.name || user.email, 'U'))}</span>
          <div class="central-user-copy"><div><strong>${escapeHtml(user.name || 'Usuário sem nome')}</strong>${isCurrent ? '<em>VOCÊ</em>' : ''}<span class="central-user-status ${active ? '' : 'is-inactive'}">${syncError ? 'Requer reparo' : (active ? 'Ativo' : 'Inativo')}</span></div><p>${escapeHtml(user.email || '')}</p><small>${escapeHtml(syncError || formatWefrotasUserAccessDate(user.accessedAt))}</small></div>
          <div class="central-user-role"><strong>${escapeHtml(role.label)}</strong><span>${escapeHtml(role.description)}</span></div>
          <div class="central-user-actions"><button type="button" onclick="openWefrotasUserModal('${escapeHtml(user.id)}')">${syncError ? 'Reparar' : 'Editar'}</button>${syncError ? '' : `<button type="button" class="${active ? 'is-danger' : 'is-success'}" onclick="toggleWefrotasUserStatus('${escapeHtml(user.id)}')" ${isCurrent ? 'disabled title="Você não pode desativar a própria conta"' : ''}>${active ? 'Desativar' : 'Ativar'}</button>`}</div>
        </article>`;
      }).join('');
    }

    function resetWefrotasUsers() {
      centralManagerUsersGeneration += 1;
      window.clearTimeout(wefrotasUsersSearchTimer);
      centralManagerUsers = [];
      centralManagerUsersLoading = false;
      const search = document.getElementById('central-users-search');
      if (search) search.value = '';
      renderWefrotasUsers();
    }

    async function refreshWefrotasUsers() {
      if (centralManagerUsersLoading) return;
      const generation = centralManagerUsersGeneration;
      centralManagerUsersLoading = true;
      renderWefrotasUsers();
      try {
        const search = document.getElementById('central-users-search')?.value.trim() || '';
        const result = await executeCentralPushAdmin({ action: 'wefrotas-users-list', search });
        if (generation !== centralManagerUsersGeneration) return;
        centralManagerUsers = Array.isArray(result.users) ? result.users : [];
      } catch (error) {
        if (generation !== centralManagerUsersGeneration) return;
        centralManagerUsers = [];
        const list = document.getElementById('central-users-list');
        if (list) list.innerHTML = `<div class="central-devices-empty is-error">${escapeHtml(error?.message || 'Não foi possível carregar os usuários.')}</div>`;
        return;
      } finally {
        if (generation === centralManagerUsersGeneration) centralManagerUsersLoading = false;
      }
      renderWefrotasUsers();
    }

    function scheduleWefrotasUsersRefresh() {
      window.clearTimeout(wefrotasUsersSearchTimer);
      wefrotasUsersSearchTimer = window.setTimeout(refreshWefrotasUsers, 350);
    }

    function updateWefrotasUserPermissionSummary() {
      const role = document.getElementById('wefrotas-user-role')?.value || 'wefrotas-consulta';
      const node = document.getElementById('wefrotas-user-permission-summary');
      if (!node) return;
      const definition = getWefrotasRoleDefinition(role);
      node.innerHTML = `<strong>${escapeHtml(definition.label)}</strong><span>${escapeHtml(definition.description)}</span>`;
    }

    function openWefrotasUserModal(userId = '') {
      if (!requireWefrotasPermission('manageUsers', 'Somente administradores podem gerenciar usuários.')) return;
      const user = centralManagerUsers.find((item) => item.id === userId) || null;
      document.getElementById('wefrotas-user-id').value = user?.id || '';
      document.getElementById('wefrotas-user-name').value = user?.name || '';
      const emailInput = document.getElementById('wefrotas-user-email');
      emailInput.value = user?.email || '';
      emailInput.disabled = Boolean(user);
      const passwordField = document.getElementById('wefrotas-user-password-field');
      const passwordInput = document.getElementById('wefrotas-user-password');
      const passwordLabel = document.getElementById('wefrotas-user-password-label');
      const passwordHint = document.getElementById('wefrotas-user-password-hint');
      passwordInput.value = '';
      passwordInput.required = !user || Boolean(user?.syncError);
      passwordField.classList.remove('hidden');
      passwordLabel.textContent = user?.syncError ? 'Nova senha para reparar o acesso' : (user ? 'Nova senha (opcional)' : 'Senha temporária');
      passwordHint.textContent = user?.syncError
        ? 'Obrigatória para recriar ou religar a conta no Appwrite. Use pelo menos 8 caracteres.'
        : user
        ? 'Deixe em branco para manter a senha atual. A nova senha deve ter pelo menos 8 caracteres.'
        : 'Mínimo de 8 caracteres. A senha não será exibida novamente.';
      document.getElementById('wefrotas-user-role').value = user?.role || 'wefrotas-consulta';
      document.getElementById('wefrotas-user-modal-title').textContent = user?.syncError ? 'Reparar usuário' : (user ? 'Editar usuário' : 'Novo usuário');
      document.getElementById('wefrotas-user-submit').textContent = user?.syncError ? 'Reparar acesso' : (user ? 'Salvar alterações' : 'Criar usuário');
      document.getElementById('wefrotas-user-feedback').textContent = user?.syncError || '';
      updateWefrotasUserPermissionSummary();
      document.getElementById('wefrotas-user-modal')?.classList.remove('hidden');
      window.setTimeout(() => document.getElementById('wefrotas-user-name')?.focus(), 50);
    }

    function closeWefrotasUserModal() {
      document.getElementById('wefrotas-user-modal')?.classList.add('hidden');
    }

    function handleWefrotasUserModalBackdrop(event) {
      if (event.target?.id === 'wefrotas-user-modal') closeWefrotasUserModal();
    }

    async function saveWefrotasUser(event) {
      event?.preventDefault();
      if (!requireWefrotasPermission('manageUsers', 'Somente administradores podem gerenciar usuários.')) return;
      const userId = document.getElementById('wefrotas-user-id')?.value || '';
      const password = document.getElementById('wefrotas-user-password')?.value || '';
      const payload = {
        action: userId ? 'wefrotas-user-update' : 'wefrotas-user-create',
        userId,
        name: document.getElementById('wefrotas-user-name')?.value.trim() || '',
        role: document.getElementById('wefrotas-user-role')?.value || 'wefrotas-consulta'
      };
      if (!userId) {
        payload.email = document.getElementById('wefrotas-user-email')?.value.trim() || '';
        payload.password = password;
      } else if (password) {
        payload.password = password;
      }
      const button = document.getElementById('wefrotas-user-submit');
      const feedback = document.getElementById('wefrotas-user-feedback');
      button.disabled = true;
      feedback.textContent = userId ? 'Salvando alterações…' : 'Criando acesso seguro…';
      try {
        const result = await executeCentralPushAdmin(payload);
        closeWefrotasUserModal();
        await refreshWefrotasUsers();
        showToast(result?.repaired ? 'Acesso reparado e sincronizado com o WeFrotas.' : (userId ? 'Usuário atualizado.' : 'Usuário criado. Entregue a senha temporária de forma segura.'));
      } catch (error) {
        feedback.textContent = error?.message || 'Não foi possível salvar o usuário.';
      } finally {
        button.disabled = false;
      }
    }

    function toggleWefrotasUserStatus(userId) {
      if (!requireWefrotasPermission('manageUsers', 'Somente administradores podem gerenciar usuários.')) return;
      const user = centralManagerUsers.find((item) => item.id === userId);
      if (!user) return;
      const activating = user.status === false;
      openPromptModal({
        title: `${activating ? 'Ativar' : 'Desativar'} ${user.name || user.email}?`,
        text: activating ? 'O usuário poderá entrar novamente no WeFrotas.' : 'A conta perderá o acesso, mas seu histórico será preservado.',
        mode: 'confirm',
        confirmLabel: activating ? 'Ativar usuário' : 'Desativar usuário',
        cancelLabel: 'Cancelar',
        onConfirm: async () => {
          try {
            await executeCentralPushAdmin({ action: 'wefrotas-user-update', userId, status: activating });
            await refreshWefrotasUsers();
            showToast(`Usuário ${activating ? 'ativado' : 'desativado'}.`);
          } catch (error) { showToast(error?.message || 'Não foi possível alterar o usuário.'); }
        }
      });
    }

    function syncDriversWithVehicle(vehicleId, driverId = '') {
      const normalizedVehicleId = String(vehicleId || '');
      const normalizedDriverId = String(driverId || '');
      if (!normalizedVehicleId) return;
      allDrivers = allDrivers.map((driver) => {
        const vehicleIds = Array.isArray(driver.vehicleIds)
          ? driver.vehicleIds.filter(Boolean).map(String)
          : driver.vehicleId
            ? [String(driver.vehicleId)]
            : [];
        const nextVehicleIds = vehicleIds.filter((id) => id !== normalizedVehicleId);
        if (String(driver.id || '') === normalizedDriverId) nextVehicleIds.push(normalizedVehicleId);
        return { ...driver, vehicleIds: Array.from(new Set(nextVehicleIds)) };
      });
    }

    async function hardenWefrotasPermissionsFromUi() {
      if (!requireWefrotasPermission('manageUsers', 'Somente administradores podem aplicar as regras de segurança.')) return;
      const button = document.querySelector('.central-users-security');
      if (button?.disabled) return;
      if (button) button.disabled = true;
      try {
        const result = await executeCentralPushAdmin({ action: 'harden-permissions' });
        const total = Object.values(result?.hardened || {}).reduce((sum, value) => sum + Number(value || 0), 0);
        showToast(`Segurança aplicada em ${total} registro(s).`);
      } catch (error) {
        showToast(error?.message || 'Não foi possível aplicar as regras de segurança.');
      } finally {
        if (button) button.disabled = false;
      }
    }

    window.refreshWefrotasUsers = refreshWefrotasUsers;
    window.scheduleWefrotasUsersRefresh = scheduleWefrotasUsersRefresh;
    window.openWefrotasUserModal = openWefrotasUserModal;
    window.closeWefrotasUserModal = closeWefrotasUserModal;
    window.handleWefrotasUserModalBackdrop = handleWefrotasUserModalBackdrop;
    window.saveWefrotasUser = saveWefrotasUser;
    window.toggleWefrotasUserStatus = toggleWefrotasUserStatus;
    window.hardenWefrotasPermissionsFromUi = hardenWefrotasPermissionsFromUi;
    document.getElementById('wefrotas-user-role')?.addEventListener('change', updateWefrotasUserPermissionSummary);

    async function migrateCentralStationsToWefrotas() {
      const feedback = document.getElementById('central-station-migration-feedback');
      const button = document.getElementById('central-station-migration-button');
      const confirmed = window.confirm(
        'Importar os postos da lista antiga da Central para Fornecedores? Os cadastros existentes receberão cidade, endereço e link do mapa; postos ausentes serão criados.'
      );
      if (!confirmed) return;
      if (button) {
        button.disabled = true;
        button.textContent = 'Importando postos...';
      }
      if (feedback) feedback.textContent = 'Atualizando o cadastro de fornecedores...';
      try {
        const result = await executeCentralPushAdmin({ action: 'migrate-central-stations' });
        if (feedback) {
          feedback.textContent = `${result.created || 0} novo(s), ${result.updated || 0} atualizado(s) e ${result.unchanged || 0} já completo(s). Atualize a página para ver a lista em Fornecedores.`;
        }
      } catch (caught) {
        if (feedback) feedback.textContent = caught?.message || 'Não foi possível importar os postos.';
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = 'Importar lista atual da Central';
        }
      }
    }

    window.migrateCentralStationsToWefrotas = migrateCentralStationsToWefrotas;

    function updatePushBroadcastPreview() {
      const title = document.getElementById('push-broadcast-title')?.value.trim() || '';
      const body = document.getElementById('push-broadcast-body')?.value.trim() || '';
      const titlePreview = document.getElementById('push-preview-title');
      const bodyPreview = document.getElementById('push-preview-body');
      const titleCount = document.getElementById('push-title-count');
      const bodyCount = document.getElementById('push-body-count');
      if (titlePreview) titlePreview.textContent = title || 'Título da notificação';
      if (bodyPreview) bodyPreview.textContent = body || 'O subtítulo do comunicado aparecerá aqui.';
      if (titleCount) titleCount.textContent = String(title.length);
      if (bodyCount) bodyCount.textContent = String(body.length);
    }

    function setPushBroadcastFeedback(message, type = '') {
      const node = document.getElementById('push-broadcast-feedback');
      if (!node) return;
      node.textContent = message || '';
      node.className = 'push-broadcast-feedback' + (type ? ' is-' + type : '');
    }

    function renderPushIndividualRecipients() {
      const select = document.getElementById('push-individual-record');
      if (!select) return;
      const previous = select.value;
      const eligible = [...centralPendingRecords]
        .filter(record => String(record?.pushSubscriptionId || '').trim())
        .sort((a, b) => String(b?.criadoEm || b?.data || '').localeCompare(String(a?.criadoEm || a?.data || '')));
      select.innerHTML = '<option value="">Selecione um registro com aparelho vinculado</option>' + eligible.map(record => {
        const id = getCentralPendingRecordId(record);
        const driver = record?.motorista || 'Motorista não informado';
        const type = getCentralPendingRecordType(record);
        const date = String(record?.data || record?.criadoEm || '').slice(0, 10);
        const dateLabel = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date.split('-').reverse().join('/') : date;
        return `<option value="${escapeHtml(id)}">${escapeHtml(driver)} • ${escapeHtml(type)}${dateLabel ? ' • ' + escapeHtml(dateLabel) : ''}</option>`;
      }).join('');
      if (eligible.some(record => getCentralPendingRecordId(record) === previous)) select.value = previous;
    }

    function getSelectedPushRecipient() {
      if (document.getElementById('push-audience-mode')?.value !== 'individual') return null;
      const rowId = document.getElementById('push-individual-record')?.value || '';
      return centralPendingRecords.find(record => getCentralPendingRecordId(record) === rowId) || null;
    }

    function updatePushAudienceMode() {
      const individual = document.getElementById('push-audience-mode')?.value === 'individual';
      const field = document.getElementById('push-individual-recipient-field');
      const sendLabel = document.querySelector('#push-broadcast-send span');
      const safetyTitle = document.getElementById('push-safety-title');
      const safetyDescription = document.getElementById('push-safety-description');
      field?.classList.toggle('hidden', !individual);
      if (individual) renderPushIndividualRecipients();
      if (sendLabel) sendLabel.textContent = individual ? 'Enviar para este aparelho' : 'Enviar para todos';
      if (safetyTitle) safetyTitle.textContent = individual ? 'Envio individual' : 'Envio geral';
      if (safetyDescription) safetyDescription.textContent = individual
        ? 'O destino vem da inscrição técnica anexada ao registro. IP, localização e cadastro do motorista não são usados.'
        : 'Não exige cadastro de motorista. Cada aparelho recebe somente depois que o usuário autorizar.';
    }

    async function refreshPushSubscriberStats() {
      const countNode = document.getElementById('push-subscriber-count');
      const statusNode = document.getElementById('push-subscriber-status');
      if (statusNode) statusNode.textContent = 'Atualizando...';
      try {
        const result = await executeCentralPushAdmin({ action: 'stats' });
        centralPushSubscriberTotal = Number(result.subscribers || 0);
        if (Array.isArray(result.devices)) centralPushDevices = result.devices.map(normalizeCentralPushDevice).filter(item => item.id);
        if (countNode) countNode.textContent = String(centralPushSubscriberTotal);
        if (statusNode) statusNode.textContent = 'Aparelhos autorizados a receber';
      } catch (error) {
        if (countNode) countNode.textContent = '—';
        if (statusNode) statusNode.textContent = error?.message || 'Canal ainda não configurado';
      }
      renderCentralDevices();
    }

    function normalizeCentralPushDevice(device = {}) {
      return {
        id: String(device.id || device.$id || '').trim(),
        userAgent: String(device.userAgent || '').trim(),
        updatedAt: String(device.updatedAt || device.$updatedAt || '').trim(),
        presence: String(device.presence || '').trim().toLowerCase(),
        driverId: String(device.driverId || '').trim(),
        vehicleId: String(device.vehicleId || '').trim(),
        linkUpdatedAt: String(device.linkUpdatedAt || '').trim(),
        linkAppliedAt: String(device.linkAppliedAt || '').trim(),
        linkConfigured: device.linkConfigured === true,
        active: device.active !== false
      };
    }

    function getCentralDevicesFromRecords() {
      const devices = new Map();
      [...centralPendingRecords]
        .sort((a, b) => String(b?.atualizadoEm || b?.criadoEm || b?.$updatedAt || '').localeCompare(String(a?.atualizadoEm || a?.criadoEm || a?.$updatedAt || '')))
        .forEach((record) => {
          const id = String(record?.pushSubscriptionId || '').trim();
          if (!id || devices.has(id)) return;
          devices.set(id, {
            id,
            userAgent: '',
            updatedAt: String(record?.atualizadoEm || record?.criadoEm || record?.$updatedAt || ''),
            active: true
          });
        });
      return [...devices.values()];
    }

    function getCentralDeviceRecord(deviceId) {
      return [...centralPendingRecords]
        .filter(record => String(record?.pushSubscriptionId || '').trim() === deviceId)
        .sort((a, b) => String(b?.atualizadoEm || b?.criadoEm || b?.$updatedAt || '').localeCompare(String(a?.atualizadoEm || a?.criadoEm || a?.$updatedAt || '')))[0] || null;
    }

    function getCentralDeviceDriver(deviceId) {
      const remoteDevice = centralPushDevices.find(device => device.id === deviceId);
      const savedDriverId = String(remoteDevice?.driverId || centralDeviceLinks?.[deviceId]?.driverId || '').trim();
      const saved = allDrivers.find(driver => driver.id === savedDriverId);
      if (saved) return saved;
      const record = getCentralDeviceRecord(deviceId);
      const recordDriverName = normalizeComparableText(record?.motorista || '');
      if (!recordDriverName) return null;
      return allDrivers.find(driver => normalizeComparableText(driver.nome || '') === recordDriverName) || null;
    }

    function describeCentralDevice(userAgent = '') {
      const ua = String(userAgent || '');
      const platform = /iphone|ipad|ios/i.test(ua) ? 'iPhone / iOS' : /android/i.test(ua) ? 'Android' : /windows/i.test(ua) ? 'Windows' : /macintosh|mac os/i.test(ua) ? 'macOS' : 'Aparelho móvel';
      const browser = /edg\//i.test(ua) ? 'Edge' : /firefox|fxios/i.test(ua) ? 'Firefox' : /crios|chrome/i.test(ua) ? 'Chrome' : /safari/i.test(ua) ? 'Safari' : '';
      return browser ? `${platform} • ${browser}` : platform;
    }

    function formatCentralDeviceDate(value) {
      if (!value) return 'Atividade ainda não informada';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return 'Atividade recente';
      return `Último contato em ${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }

    function getCentralDevicePresence(device = {}) {
      if (device.active === false) return { key: 'offline', label: 'Offline' };
      const lastSeen = new Date(device.updatedAt || 0).getTime();
      const elapsed = Number.isFinite(lastSeen) ? Date.now() - lastSeen : Number.POSITIVE_INFINITY;
      const key = elapsed <= 75000 ? 'online' : elapsed <= 180000 ? 'unstable' : 'offline';
      if (key === 'online') return { key, label: 'Online' };
      if (key === 'unstable') return { key, label: 'Conexão instável' };
      return { key: 'offline', label: 'Offline' };
    }

    function renderCentralDevices() {
      const list = document.getElementById('central-devices-list');
      const count = document.getElementById('central-devices-count');
      if (!list) return;
      const devices = [...centralPushDevices].sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
      if (count) count.textContent = String(centralPushSubscriberTotal || devices.length || 0);
      if (centralDevicesLoading) {
        list.innerHTML = '<div class="central-devices-empty"><span class="central-devices-spinner"></span>Atualizando aparelhos inscritos…</div>';
        return;
      }
      if (!devices.length) {
        list.innerHTML = '<div class="central-devices-empty">Nenhum aparelho com notificações autorizadas foi encontrado.</div>';
        return;
      }
      list.innerHTML = devices.map((device) => {
        const linkedDriver = getCentralDeviceDriver(device.id);
        const latestRecord = getCentralDeviceRecord(device.id);
        const shortId = device.id.slice(-6).toUpperCase();
        const presence = getCentralDevicePresence(device);
        const recordLabel = latestRecord
          ? `Último envio: ${escapeHtml(latestRecord.motorista || 'motorista não informado')} • ${escapeHtml(getCentralPendingRecordType(latestRecord))}`
          : 'Ainda não enviou registros para a Central';
        return `
          <article class="central-device-card ${linkedDriver ? 'is-linked' : ''}">
            <div class="central-device-main">
              <span class="central-device-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="7" y="2.5" width="10" height="19" rx="2.5" stroke-width="1.9"/><path d="M10 5.5h4M11 18.5h2" stroke-width="1.9" stroke-linecap="round"/></svg></span>
              <div class="central-device-copy">
                <div><strong>${linkedDriver ? escapeHtml(linkedDriver.nome) : 'Aparelho não vinculado'}</strong><span class="central-device-status is-${presence.key}"><i aria-hidden="true"></i>${presence.label}</span></div>
                <p>${escapeHtml(describeCentralDevice(device.userAgent))} • ID ${escapeHtml(shortId)}</p>
                <small>${escapeHtml(formatCentralDeviceDate(device.updatedAt))}</small>
                <small>${recordLabel}</small>
              </div>
            </div>
            <div class="central-device-linking">
              <label for="central-device-driver-${escapeHtml(device.id)}">Motorista vinculado</label>
              <select id="central-device-driver-${escapeHtml(device.id)}">
                <option value="">Selecione um motorista</option>
                ${getSortedDrivers().map(driver => `<option value="${escapeHtml(driver.id)}" ${linkedDriver?.id === driver.id ? 'selected' : ''}>${escapeHtml(driver.nome)}${isEntityActive(driver) ? '' : ' (inativo)'}</option>`).join('')}
              </select>
              <div class="central-device-actions">
                <button type="button" onclick="saveCentralDeviceLink('${escapeHtml(device.id)}')">${linkedDriver ? 'Atualizar vínculo' : 'Vincular motorista'}</button>
                <button type="button" class="central-device-delete" onclick="confirmCentralDeviceDeletion('${escapeHtml(device.id)}', '${escapeHtml(shortId)}')" title="Excluir aparelho" aria-label="Excluir aparelho ID ${escapeHtml(shortId)}">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </div>
            </div>
          </article>
        `;
      }).join('');
    }

    async function refreshCentralDevices() {
      if (centralDevicesLoading) return;
      centralDevicesLoading = true;
      renderCentralDevices();
      try {
        await refreshCentralPendingRecords({ silent: true });
        await refreshPushSubscriberStats();
      } finally {
        centralDevicesLoading = false;
        renderCentralDevices();
      }
    }

    async function waitForCentralDeviceLinkApplied(deviceId, expectedUpdatedAt, timeoutMs = 40000) {
      const startedAt = Date.now();
      await new Promise((resolve) => window.setTimeout(resolve, 3000));
      while (Date.now() - startedAt < timeoutMs) {
        try {
          const result = await executeCentralPushAdmin({ action: 'device-profile-status', subscriptionId: deviceId });
          const status = result?.profileSync || {};
          if (String(status.updatedAt || '') === String(expectedUpdatedAt || '') && status.appliedAt) return status;
        } catch (error) {
          console.warn('Aguardando confirmação do vínculo pelo aparelho.', error);
        }
        await new Promise((resolve) => window.setTimeout(resolve, 1800));
      }
      throw new Error('A alteração foi salva, mas o aparelho ainda não confirmou. Abra a Central nesse celular e aguarde a sincronização.');
    }

    async function saveCentralDeviceLink(deviceId) {
      if (!requireWefrotasPermission('manageDevices', 'Somente administradores podem gerenciar aparelhos.')) return;
      const select = document.getElementById(`central-device-driver-${deviceId}`);
      const card = select?.closest('.central-device-card');
      if (card?.dataset.saving === 'true') return;
      const controls = [...(card?.querySelectorAll('select, button') || [])];
      if (card) card.dataset.saving = 'true';
      controls.forEach((control) => { control.disabled = true; });
      toggleOnlinePlatformLoading(true, 'Salvando o vínculo do aparelho...');
      try {
        const driverId = String(select?.value || '').trim();
        if (!driverId) {
          const result = await executeCentralPushAdmin({ action: 'device-profile-admin-set', subscriptionId: deviceId, driverId: '', vehicleId: '' });
          const updatedAt = String(result?.profileSync?.updatedAt || new Date().toISOString());
          centralDeviceLinks[deviceId] = { driverId: '', vehicleId: '', updatedAt, linkedAt: updatedAt, source: 'wefrotas' };
          const device = centralPushDevices.find(item => item.id === deviceId);
          if (device) Object.assign(device, { driverId: '', vehicleId: '', linkUpdatedAt: updatedAt, linkConfigured: true });
          const confirmed = await waitForCentralDeviceLinkApplied(deviceId, updatedAt);
          if (device) device.linkAppliedAt = String(confirmed.appliedAt || '');
          renderCentralDevices();
          showToast('Vínculo removido. O aparelho continua autorizado a receber notificações.');
          return;
        }
        const driver = allDrivers.find(item => item.id === driverId);
        if (!driver) return showToast('Motorista não encontrado. Atualize os cadastros e tente novamente.');
        const linkedVehicleIds = Array.isArray(driver.vehicleIds) ? driver.vehicleIds.map(String) : [];
        const vehicle = allVehicles.find(item => linkedVehicleIds.includes(String(item.id)))
          || allVehicles.find(item => String(item.motoristaId || item.driverId || '') === driverId);
        if (!vehicle) return showToast('Este motorista não possui veículo vinculado. Atualize o cadastro do motorista primeiro.');
        const result = await executeCentralPushAdmin({
          action: 'device-profile-admin-set',
          subscriptionId: deviceId,
          driverId,
          vehicleId: String(vehicle.id || '')
        });
        const syncedProfile = result?.profileSync?.profile || {};
        const updatedAt = String(result?.profileSync?.updatedAt || new Date().toISOString());
        centralDeviceLinks[deviceId] = {
          driverId: String(syncedProfile.driverId || driverId),
          vehicleId: String(syncedProfile.vehicleId || vehicle.id || ''),
          updatedAt,
          linkedAt: updatedAt,
          source: 'wefrotas'
        };
        const device = centralPushDevices.find(item => item.id === deviceId);
        if (device) Object.assign(device, {
          driverId: centralDeviceLinks[deviceId].driverId,
          vehicleId: centralDeviceLinks[deviceId].vehicleId,
          linkUpdatedAt: updatedAt,
          linkConfigured: true
        });
        const confirmed = await waitForCentralDeviceLinkApplied(deviceId, updatedAt);
        if (device) device.linkAppliedAt = String(confirmed.appliedAt || '');
        renderCentralDevices();
        showToast(`Aparelho vinculado a ${driver.nome}.`);
      } catch (error) {
        showToast(error?.message || 'Não foi possível atualizar o vínculo deste aparelho.');
      } finally {
        toggleOnlinePlatformLoading(false);
        if (card) delete card.dataset.saving;
        controls.forEach((control) => { control.disabled = false; });
      }
    }

    function confirmCentralDeviceDeletion(deviceId, shortId) {
      if (!requireWefrotasPermission('manageDevices', 'Somente administradores podem excluir aparelhos.')) return;
      openPromptModal({
        title: 'Excluir este aparelho?',
        text: `A inscrição ${shortId} será removida e deixará de receber notificações. Um novo acesso poderá criar outra inscrição.`,
        mode: 'confirm',
        confirmLabel: 'Excluir aparelho',
        cancelLabel: 'Cancelar',
        onConfirm: () => deleteCentralDevice(deviceId)
      });
    }

    async function deleteCentralDevice(deviceId) {
      try {
        await executeCentralPushAdmin({ action: 'delete-subscription', subscriptionId: deviceId });
        centralPushDevices = centralPushDevices.filter(device => device.id !== deviceId);
        centralPushSubscriberTotal = centralPushDevices.length;
        delete centralDeviceLinks[deviceId];
        await saveToLocalStorage();
        renderCentralDevices();
        await refreshPushSubscriberStats();
        showToast('Aparelho excluído da Central.');
      } catch (error) {
        showToast(error?.message || 'Não foi possível excluir o aparelho.');
      }
    }

    function confirmCentralOnboardingReset() {
      if (!requireWefrotasPermission('manageDevices', 'Somente administradores podem exigir uma nova configuração.')) return;
      openPromptModal({
        title: 'Exigir nova configuração em todos os aparelhos?',
        text: 'Na próxima abertura da Central, todos precisarão refazer o fluxo de motorista, veículo e permissões. Os registros já enviados não serão apagados.',
        mode: 'confirm',
        confirmLabel: 'Resetar configuração',
        cancelLabel: 'Cancelar',
        onConfirm: resetCentralOnboarding
      });
    }

    async function resetCentralOnboarding() {
      const button = document.getElementById('central-onboarding-reset-button');
      if (button) { button.disabled = true; button.classList.add('is-loading'); }
      try {
        await executeCentralPushAdmin({ action: 'reset-onboarding' });
        showToast('Nova configuração obrigatória publicada para todos os aparelhos.');
      } catch (error) {
        showToast(error?.message || 'Não foi possível publicar a nova configuração.');
      } finally {
        if (button) { button.disabled = false; button.classList.remove('is-loading'); }
      }
    }

    window.refreshCentralDevices = refreshCentralDevices;
    window.saveCentralDeviceLink = saveCentralDeviceLink;
    window.confirmCentralDeviceDeletion = confirmCentralDeviceDeletion;
    window.confirmCentralOnboardingReset = confirmCentralOnboardingReset;

    function confirmPushBroadcast() {
      if (centralPushSending) return;
      const title = document.getElementById('push-broadcast-title')?.value.trim() || '';
      const body = document.getElementById('push-broadcast-body')?.value.trim() || '';
      if (!title || !body) {
        setPushBroadcastFeedback('Preencha o título e o subtítulo antes de enviar.', 'error');
        return;
      }

      const individual = document.getElementById('push-audience-mode')?.value === 'individual';
      const recipient = getSelectedPushRecipient();
      if (individual && !recipient) {
        setPushBroadcastFeedback('Selecione um registro que tenha aparelho vinculado.', 'error');
        return;
      }

      openPromptModal({
        title: individual ? 'Enviar para este aparelho?' : 'Enviar notificação para todos?',
        text: individual
          ? `A mensagem será enviada somente ao aparelho do registro de ${recipient?.motorista || 'motorista não informado'}.`
          : 'A mensagem será disparada para todos os aparelhos inscritos na Central de Registros.',
        mode: 'confirm',
        confirmLabel: 'Enviar agora',
        cancelLabel: 'Revisar',
        onConfirm: sendPushBroadcast
      });
    }

    async function sendPushBroadcast() {
      if (!requireWefrotasPermission('sendNotifications', 'Somente administradores podem enviar notificações.')) return;
      if (centralPushSending) return;
      const titleInput = document.getElementById('push-broadcast-title');
      const bodyInput = document.getElementById('push-broadcast-body');
      const urlInput = document.getElementById('push-broadcast-url');
      const button = document.getElementById('push-broadcast-send');
      const title = titleInput?.value.trim() || '';
      const body = bodyInput?.value.trim() || '';
      if (!title || !body) return;
      const individual = document.getElementById('push-audience-mode')?.value === 'individual';
      const recipient = getSelectedPushRecipient();
      if (individual && !recipient?.pushSubscriptionId) {
        setPushBroadcastFeedback('O registro selecionado não possui aparelho vinculado.', 'error');
        return;
      }

      centralPushSending = true;
      if (button) {
        button.disabled = true;
        button.querySelector('span').textContent = 'Enviando...';
      }
      setPushBroadcastFeedback(individual ? 'Enviando ao aparelho selecionado...' : 'Disparando a notificação geral...', 'loading');

      try {
        const result = await executeCentralPushAdmin({
          action: individual ? 'notify' : 'broadcast',
          ...(individual ? { subscriptionId: recipient.pushSubscriptionId } : {}),
          title,
          body,
          url: urlInput?.value || './'
        });
        const sent = Number(result.sent ?? (result.ok ? 1 : 0));
        const failed = Number(result.failed || 0);
        setPushBroadcastFeedback(
          individual
            ? (sent ? 'Notificação enviada ao aparelho selecionado.' : 'O aparelho não confirmou o recebimento.')
            : sent + ' aparelho(s) receberam o envio' + (failed ? '; ' + failed + ' falharam.' : '.'),
          failed ? 'warning' : 'success'
        );
        titleInput.value = '';
        bodyInput.value = '';
        updatePushBroadcastPreview();
        await refreshPushSubscriberStats();
      } catch (error) {
        setPushBroadcastFeedback(error?.message || 'Não foi possível enviar a notificação.', 'error');
      } finally {
        centralPushSending = false;
        if (button) {
          button.disabled = false;
          updatePushAudienceMode();
        }
      }
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

    function initializeCentralManagement() {
      const registrosView = document.getElementById('central-view-registros');
      const notificacoesView = document.getElementById('central-view-notificacoes');
      const documentosPanel = document.getElementById('panel-documentos');
      const notificacoesPanel = document.getElementById('panel-notificacoes');
      if (registrosView && documentosPanel && documentosPanel.parentElement !== registrosView) {
        documentosPanel.classList.remove('module-panel');
        documentosPanel.classList.add('central-embedded-panel');
        registrosView.appendChild(documentosPanel);
      }
      if (notificacoesView && notificacoesPanel && notificacoesPanel.parentElement !== notificacoesView) {
        notificacoesPanel.classList.remove('module-panel');
        notificacoesPanel.classList.add('central-embedded-panel');
        notificacoesView.appendChild(notificacoesPanel);
      }
      showCentralSection(activeCentralSection);
    }

    function setCentralNavExpanded(expanded) {
      const group = document.getElementById('central-nav-group');
      const toggle = document.getElementById('central-nav-toggle');
      group?.classList.toggle('open', Boolean(expanded));
      toggle?.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }

    function openCentralModule(button = null) {
      const isAlreadyOpen = activeModule === 'central' && document.getElementById('central-nav-group')?.classList.contains('open');
      showModule('central', button || document.getElementById('central-nav-toggle'));
      setCentralNavExpanded(!isAlreadyOpen || activeModule !== 'central');
    }

    function showCentralSubmodule(section, button = null) {
      setCentralNavExpanded(true);
      showModule('central', document.getElementById('central-nav-toggle'));
      showCentralSection(section, button);
    }

    function showCentralConfigSection(section = 'comunicacao', button = null) {
      const allowedSections = new Set(['comunicacao', 'cidades', 'integracoes']);
      activeCentralConfigSection = allowedSections.has(section) ? section : 'comunicacao';
      document.querySelectorAll('.central-config-view').forEach((view) => {
        view.classList.toggle('active', view.id === `central-config-${activeCentralConfigSection}`);
      });
      document.querySelectorAll('[data-central-config-section]').forEach((tab) => {
        const isActive = tab.dataset.centralConfigSection === activeCentralConfigSection;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      if (button) button.focus({ preventScroll: true });
      if (activeCentralConfigSection === 'comunicacao') loadCentralBanners();
      if (activeCentralConfigSection === 'cidades') renderCentralCities();
    }

    function getCentralCityStationCounts(cityName) {
      const key = normalizeComparableText(cityName);
      const linked = allSuppliers.filter((supplier) => normalizeComparableText(supplier.tipo) === 'posto' && normalizeComparableText(supplier.cidade) === key);
      return { total: linked.length, active: linked.filter(isEntityActive).length };
    }

    function renderCentralCities() {
      const list = document.getElementById('central-cities-list');
      if (!list) return;
      const cities = centralCities.slice().sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
      if (!cities.length) {
        selectedCentralCityId = '';
        updateCentralCityActionbar();
        list.innerHTML = '<div class="central-stations-empty"><strong>Nenhuma cidade cadastrada</strong><span>Cadastre uma cidade para depois vinculá-la aos postos em Fornecedores.</span></div>';
        return;
      }
      if (!cities.some((city) => String(city.id) === String(selectedCentralCityId))) selectedCentralCityId = '';
      list.innerHTML = cities.map((city) => {
        const counts = getCentralCityStationCounts(city.name);
        return `
          <article class="central-city-item${city.active ? '' : ' is-inactive'}${String(city.id) === String(selectedCentralCityId) ? ' is-selected' : ''}" data-city-id="${escapeHtml(city.id)}" onclick="selectCentralCity(this.dataset.cityId)">
            <span class="central-entity-selector" aria-hidden="true">${String(city.id) === String(selectedCentralCityId) ? '✓' : ''}</span>
            <img src="${escapeHtml(city.imageUrl)}" alt="${escapeHtml(city.name)}">
            <div class="central-city-item-copy">
              <div><strong>${escapeHtml(city.name)}</strong><span class="central-station-state ${city.active ? 'is-active' : ''}">${city.active ? 'Visível' : 'Oculta'}</span></div>
              <span>${counts.active} ${counts.active === 1 ? 'posto ativo' : 'postos ativos'} · ${counts.total} ${counts.total === 1 ? 'vinculado' : 'vinculados'} no cadastro</span>
            </div>
          </article>`;
      }).join('');
      updateCentralCityActionbar();
    }

    function updateCentralCityActionbar() {
      const selected = centralCities.find((city) => String(city.id) === String(selectedCentralCityId));
      const label = document.getElementById('central-city-selection-label');
      if (label) label.textContent = selected ? selected.name : 'Selecione uma cidade';
      ['central-city-edit', 'central-city-visibility', 'central-city-delete'].forEach((id) => {
        const button = document.getElementById(id);
        if (button) button.disabled = !selected;
      });
      const visibility = document.getElementById('central-city-visibility');
      if (visibility) visibility.title = selected?.active ? 'Ocultar' : 'Exibir';
    }

    function selectCentralCity(id) {
      selectedCentralCityId = String(id || '');
      renderCentralCities();
    }

    function openCentralCityModal() {
      if (!requireWefrotasPermission('manageSettings', 'Seu perfil não possui permissão para cadastrar cidades.')) return;
      resetCentralCityForm();
      const modal = document.getElementById('central-city-modal');
      modal?.classList.add('open');
      modal?.setAttribute('aria-hidden', 'false');
      document.body.classList.add('central-action-modal-open');
      window.setTimeout(() => document.getElementById('central-city-name')?.focus(), 80);
    }

    function closeCentralCityModal() {
      const modal = document.getElementById('central-city-modal');
      modal?.classList.remove('open');
      modal?.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('central-action-modal-open');
      resetCentralCityForm();
    }

    function editSelectedCentralCity() {
      if (selectedCentralCityId) editCentralCity(selectedCentralCityId);
    }

    function toggleSelectedCentralCity() {
      if (selectedCentralCityId) toggleCentralCity(selectedCentralCityId);
    }

    function deleteSelectedCentralCity() {
      if (selectedCentralCityId) confirmDeleteCentralCity(selectedCentralCityId);
    }

    function setCentralCityFeedback(message, type = '') {
      const feedback = document.getElementById('central-city-feedback');
      if (!feedback) return;
      feedback.textContent = message || '';
      feedback.dataset.status = type;
    }

    function previewCentralCityImage() {
      const file = document.getElementById('central-city-image-file')?.files?.[0];
      if (!file) return;
      const preview = document.getElementById('central-city-image-preview');
      const placeholder = document.getElementById('central-city-preview-placeholder');
      if (!preview) return;
      preview.src = URL.createObjectURL(file);
      preview.classList.remove('hidden');
      placeholder?.classList.add('hidden');
    }

    function resetCentralBannerForm() {
      const fileInput = document.getElementById('central-banner-file');
      const titleInput = document.getElementById('central-banner-title');
      const durationInput = document.getElementById('central-banner-duration');
      if (fileInput) fileInput.value = '';
      if (titleInput) titleInput.value = '';
      if (durationInput) durationInput.value = '6000';
      previewCentralBannerFile();
      setCentralBannerFeedback('');
    }

    function openCentralBannerModal() {
      if (!requireWefrotasPermission('manageSettings', 'Seu perfil não possui permissão para publicar banners.')) return;
      const modal = document.getElementById('central-banner-modal');
      if (!modal) return;
      resetCentralBannerForm();
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('central-action-modal-open');
      window.setTimeout(() => document.getElementById('central-banner-title')?.focus(), 80);
    }

    function closeCentralBannerModal() {
      if (centralBannerSaving) return;
      const modal = document.getElementById('central-banner-modal');
      modal?.classList.remove('open');
      modal?.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('central-action-modal-open');
      resetCentralBannerForm();
    }

    function getCentralBannerDuration(imageUrl) {
      const match = String(imageUrl || '').match(/(?:#|&)slideDuration=(\d+)/i);
      const duration = Number(match?.[1] || 6000);
      return [4000, 6000, 8000, 10000, 15000].includes(duration) ? duration : 6000;
    }

    function setCentralBannerDuration(imageUrl, duration) {
      const clean = String(imageUrl || '').replace(/#.*$/, '');
      return `${clean}#slideDuration=${getCentralBannerDuration(`#slideDuration=${duration}`)}`;
    }

    function updateCentralBannerActionbar(rows = null) {
      const orderedRows = rows || centralHomeBanners.filter((banner) => !isCentralBannerMigrationMarker(banner)).sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
      const selected = orderedRows.find((banner) => String(banner.$id) === String(selectedCentralBannerId));
      const index = selected ? orderedRows.indexOf(selected) : -1;
      const label = document.getElementById('central-banner-selection-label');
      if (label) label.textContent = selected ? selected.title || 'Banner selecionado' : 'Selecione um banner';
      const up = document.getElementById('central-banner-move-up');
      const down = document.getElementById('central-banner-move-down');
      const duration = document.getElementById('central-banner-selected-duration');
      const visibility = document.getElementById('central-banner-visibility');
      const remove = document.getElementById('central-banner-delete');
      if (up) up.disabled = !selected || index <= 0;
      if (down) down.disabled = !selected || index < 0 || index >= orderedRows.length - 1;
      if (duration) { duration.disabled = !selected; if (selected) duration.value = String(getCentralBannerDuration(selected.imageUrl)); }
      if (visibility) { visibility.disabled = !selected; visibility.title = selected?.active ? 'Ocultar' : 'Exibir'; }
      if (remove) remove.disabled = !selected;
    }

    function selectCentralBanner(rowId) {
      selectedCentralBannerId = String(rowId || '');
      renderCentralBanners();
    }

    function moveSelectedCentralBanner(direction) {
      if (selectedCentralBannerId) moveCentralBanner(selectedCentralBannerId, direction);
    }

    function toggleSelectedCentralBanner() {
      if (selectedCentralBannerId) toggleCentralBanner(selectedCentralBannerId);
    }

    function deleteSelectedCentralBanner() {
      if (selectedCentralBannerId) confirmDeleteCentralBanner(selectedCentralBannerId);
    }

    async function updateSelectedCentralBannerDuration() {
      const banner = centralHomeBanners.find((item) => String(item.$id) === String(selectedCentralBannerId));
      const select = document.getElementById('central-banner-selected-duration');
      if (!banner || !select) return;
      const previousUrl = banner.imageUrl;
      const nextUrl = setCentralBannerDuration(previousUrl, select.value);
      select.disabled = true;
      try {
        await window.WeFrotasBackend.updateCentralHomeBanner(banner.$id, { imageUrl: nextUrl });
        banner.imageUrl = nextUrl;
        renderCentralBanners();
        showToast(`Duração alterada para ${Number(select.value) / 1000} segundos.`);
      } catch (error) {
        banner.imageUrl = previousUrl;
        select.disabled = false;
        showToast(error?.message || 'Não foi possível alterar a duração do slide.');
      }
    }

    function resetCentralCityForm() {
      const editId = document.getElementById('central-city-edit-id');
      const name = document.getElementById('central-city-name');
      const file = document.getElementById('central-city-image-file');
      const active = document.getElementById('central-city-active');
      const preview = document.getElementById('central-city-image-preview');
      if (editId) editId.value = '';
      if (name) name.value = '';
      if (file) file.value = '';
      if (active) active.checked = true;
      if (preview) { preview.src = ''; preview.classList.add('hidden'); }
      document.getElementById('central-city-preview-placeholder')?.classList.remove('hidden');
      const title = document.getElementById('central-city-form-title');
      const save = document.getElementById('central-city-save');
      if (title) title.textContent = 'Adicionar cidade';
      if (save) save.textContent = 'Cadastrar cidade';
      setCentralCityFeedback('');
    }

    function editCentralCity(id) {
      const city = centralCities.find((item) => String(item.id) === String(id));
      if (!city) return;
      document.getElementById('central-city-edit-id').value = city.id;
      document.getElementById('central-city-name').value = city.name;
      document.getElementById('central-city-active').checked = city.active;
      const preview = document.getElementById('central-city-image-preview');
      if (preview) { preview.src = city.imageUrl; preview.classList.remove('hidden'); }
      document.getElementById('central-city-preview-placeholder')?.classList.add('hidden');
      document.getElementById('central-city-form-title').textContent = 'Editar cidade';
      document.getElementById('central-city-save').textContent = 'Salvar alterações';
      const modal = document.getElementById('central-city-modal');
      modal?.classList.add('open');
      modal?.setAttribute('aria-hidden', 'false');
      document.body.classList.add('central-action-modal-open');
      window.setTimeout(() => document.getElementById('central-city-name')?.focus(), 80);
    }

    async function saveCentralCityFromSettings(event) {
      event?.preventDefault();
      const editId = document.getElementById('central-city-edit-id')?.value || '';
      const name = document.getElementById('central-city-name')?.value.trim() || '';
      const active = document.getElementById('central-city-active')?.checked !== false;
      const file = document.getElementById('central-city-image-file')?.files?.[0] || null;
      const current = centralCities.find((item) => String(item.id) === String(editId));
      if (!name) return setCentralCityFeedback('Informe o nome da cidade.', 'error');
      if (centralCities.some((city) => city.id !== editId && normalizeComparableText(city.name) === normalizeComparableText(name))) {
        return setCentralCityFeedback('Esta cidade já está cadastrada.', 'error');
      }
      if (!current && !file) return setCentralCityFeedback('Escolha a imagem que será exibida no card da cidade.', 'error');

      const saveButton = document.getElementById('central-city-save');
      if (saveButton) saveButton.disabled = true;
      setCentralCityFeedback('Salvando cidade e sincronizando o aplicativo...');
      try {
        let uploaded = current ? { fileId: current.fileId, imageUrl: current.imageUrl } : null;
        if (file) uploaded = await window.WeFrotasBackend.uploadCentralCityImage(file);
        if (!uploaded?.imageUrl) throw new Error('Não foi possível salvar a imagem da cidade.');
        const previousName = current?.name || '';
        const next = { id: current?.id || generateId(), name, active, featured: current?.featured === true, fileId: uploaded.fileId, imageUrl: uploaded.imageUrl };
        centralCities = current ? centralCities.map((city) => city.id === current.id ? next : city) : [...centralCities, next];
        if (current && normalizeComparableText(previousName) !== normalizeComparableText(name)) {
          allSuppliers = allSuppliers.map((supplier) => normalizeComparableText(supplier.tipo) === 'posto' && normalizeComparableText(supplier.cidade) === normalizeComparableText(previousName)
            ? { ...supplier, cidade: name }
            : supplier);
        }
        await persistCentralConfigurationImmediately();
        renderAll();
        renderCentralCities();
        closeCentralCityModal();
        showToast(current ? 'Cidade atualizada com sucesso.' : 'Cidade cadastrada com sucesso.');
        if (file && current?.fileId && current.fileId !== uploaded.fileId) window.WeFrotasBackend.deleteCentralCityImage(current.fileId).catch(() => {});
      } catch (error) {
        setCentralCityFeedback(error?.message || 'Não foi possível salvar a cidade.', 'error');
      } finally {
        if (saveButton) saveButton.disabled = false;
      }
    }

    async function toggleCentralCity(id) {
      const city = centralCities.find((item) => String(item.id) === String(id));
      if (!city) return;
      city.active = !city.active;
      try {
        await persistCentralConfigurationImmediately();
        renderCentralCities();
        showToast(city.active ? 'Cidade ativada no aplicativo.' : 'Cidade ocultada do aplicativo.');
      } catch (error) {
        city.active = !city.active;
        await saveToLocalStorage().catch(() => {});
        renderCentralCities();
        showToast(error?.message || 'Não foi possível atualizar a cidade no aplicativo.');
      }
    }

    function confirmDeleteCentralCity(id) {
      const city = centralCities.find((item) => String(item.id) === String(id));
      if (!city) return;
      const counts = getCentralCityStationCounts(city.name);
      if (counts.total > 0) {
        showToast(`Não é possível excluir ${city.name}: existem ${counts.total} ${counts.total === 1 ? 'posto vinculado' : 'postos vinculados'}. Altere esses fornecedores primeiro.`);
        return;
      }
      openPromptModal({
        title: `Excluir ${city.name}?`,
        text: 'A cidade e a imagem do card serão removidas. Esta ação não pode ser desfeita.',
        mode: 'confirm',
        confirmLabel: 'Excluir cidade',
        cancelLabel: 'Cancelar',
        onConfirm: () => deleteCentralCity(id)
      });
    }

    async function deleteCentralCity(id) {
      const city = centralCities.find((item) => String(item.id) === String(id));
      if (!city) return;
      const cityIndex = centralCities.findIndex((item) => String(item.id) === String(id));
      const counts = getCentralCityStationCounts(city.name);
      if (counts.total > 0) {
        showToast('A cidade recebeu um vínculo e não pode mais ser excluída. Atualize os fornecedores primeiro.');
        return;
      }
      try {
        centralCities = centralCities.filter((item) => String(item.id) !== String(id));
        if (String(selectedCentralCityId) === String(id)) selectedCentralCityId = '';
        await persistCentralConfigurationImmediately();
        if (document.getElementById('central-city-edit-id')?.value === String(id)) resetCentralCityForm();
        renderCentralCities();
        renderAll();
        showToast('Cidade excluída com sucesso.');
        if (city.fileId) window.WeFrotasBackend.deleteCentralCityImage(city.fileId).catch(() => {});
      } catch (error) {
        if (!centralCities.some((item) => String(item.id) === String(id))) {
          centralCities.splice(Math.max(0, cityIndex), 0, city);
          await saveToLocalStorage().catch(() => {});
          renderCentralCities();
          renderAll();
        }
        showToast(error?.message || 'Não foi possível excluir a cidade.');
      }
    }

    function showCentralSection(section = 'registros', button = null) {
      const allowedSections = new Set(['registros', 'notificacoes', 'usuarios']);
      const requestedSection = allowedSections.has(section) ? section : 'registros';
      const requiredPermission = {
        notificacoes: 'sendNotifications',
        usuarios: 'manageUsers'
      }[requestedSection];
      if (requiredPermission && !hasWefrotasPermission(requiredPermission)) {
        showToast('Seu perfil não possui acesso a esta área da Central.');
        section = 'registros';
      } else {
        section = requestedSection;
      }
      activeCentralSection = section;
      document.querySelectorAll('.central-management-view').forEach((view) => {
        view.classList.toggle('active', view.id === `central-view-${activeCentralSection}`);
      });
      document.querySelectorAll('[data-central-section]').forEach((tab) => {
        const isActive = tab.dataset.centralSection === activeCentralSection;
        tab.classList.toggle('active', isActive);
        if (tab.hasAttribute('aria-selected')) tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      if (button) button.focus({ preventScroll: true });
      if (activeModule === 'central') updateModuleHeader('central');
      if (activeModule === 'central') updateContextualSearchUi();
      if (activeCentralSection === 'registros') {
        refreshCentralPendingRecords({ silent: true });
        renderDocuments();
      }
      if (activeCentralSection === 'notificacoes') {
        updatePushBroadcastPreview();
        updatePushAudienceMode();
        refreshCentralPendingRecords({ silent: true });
        refreshPushSubscriberStats();
      }
      if (activeCentralSection === 'usuarios') {
        refreshWefrotasUsers();
        refreshCentralDevices();
      }
    }

    window.showCentralSection = showCentralSection;
    window.openCentralModule = openCentralModule;
    window.showCentralSubmodule = showCentralSubmodule;
    window.showCentralConfigSection = showCentralConfigSection;
    window.openCentralCommunicationFromSettings = openCentralCommunicationFromSettings;
    window.openCentralBannerModal = openCentralBannerModal;
    window.closeCentralBannerModal = closeCentralBannerModal;
    window.selectCentralBanner = selectCentralBanner;
    window.moveSelectedCentralBanner = moveSelectedCentralBanner;
    window.toggleSelectedCentralBanner = toggleSelectedCentralBanner;
    window.deleteSelectedCentralBanner = deleteSelectedCentralBanner;
    window.updateSelectedCentralBannerDuration = updateSelectedCentralBannerDuration;
    window.openCentralCityModal = openCentralCityModal;
    window.closeCentralCityModal = closeCentralCityModal;
    window.selectCentralCity = selectCentralCity;
    window.editSelectedCentralCity = editSelectedCentralCity;
    window.toggleSelectedCentralCity = toggleSelectedCentralCity;
    window.deleteSelectedCentralCity = deleteSelectedCentralCity;
    window.openWefrotasUsersFromSettings = openWefrotasUsersFromSettings;
    window.renderCentralCities = renderCentralCities;
    window.previewCentralCityImage = previewCentralCityImage;
    window.saveCentralCityFromSettings = saveCentralCityFromSettings;
    window.editCentralCity = editCentralCity;
    window.toggleCentralCity = toggleCentralCity;
    window.resetCentralCityForm = resetCentralCityForm;

    function showModule(module, button) {
      if (!hasWefrotasPermission('read')) {
        showToast('Seu acesso ainda não foi validado. Entre novamente.');
        return;
      }
      if (currentWefrotasRoleLabel === 'Aprovador' && ['orders', 'financeiro', 'veiculos', 'motoristas', 'fornecedores'].includes(module)) {
        showToast('O perfil Aprovador atua somente na Central de Registros e em consultas autorizadas.');
        return;
      }
      const legacyCentralSection = module === 'documentos'
        ? 'registros'
        : (module === 'notificacoes' ? 'notificacoes' : '');
      if (legacyCentralSection) module = 'central';
      activeModule = module;
      document.querySelectorAll('.module-panel').forEach(panel => panel.classList.remove('active'));
      document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.id !== 'theme-toggle-btn') btn.classList.remove('active');
      });
      const panel = document.getElementById(`panel-${module}`);
      if (panel) panel.classList.add('active');
      const activeButton = button || (module === 'central' ? document.getElementById('central-nav-toggle') : getModuleNavButton(module));
      if (activeButton) activeButton.classList.add('active');
      setCentralNavExpanded(module === 'central');
      updateModuleHeader(module);
      updateContextualSearchUi();
      if (window.innerWidth <= 1120 && sidebarCollapsed) {
        toggleSidebar(false);
      }
      if (module === 'central') showCentralSection(legacyCentralSection || activeCentralSection);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function getModuleNavButton(module) {
      if (module === 'central') return document.getElementById('central-nav-toggle');
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
      renderModuleCompactFilterControls('financeiro');
      updateContextualSearchUi();
      selectedFinance.clear();
      renderFinance();
    }

    function openDriverFromHome(driverId) {
      const driver = allDrivers.find(item => item.id === driverId);
      openModuleFromHome('motoristas');
      setFilterValue('driver-filter-search', driver ? [driver.nome, driver.cpf, driver.cnh, driver.telefone].filter(Boolean).join(' ') : '');
      setFilterValue('driver-filter-status', 'todos');
      setFilterValue('driver-filter-start', '');
      setFilterValue('driver-filter-end', '');
      renderModuleCompactFilterControls('motoristas');
      updateContextualSearchUi();
      selectedDrivers.clear();
      renderDrivers();
    }

    function openVehicleFromHome(vehicleId) {
      const vehicle = allVehicles.find(item => item.id === vehicleId);
      openModuleFromHome('veiculos');
      setFilterValue('vehicle-filter-search', buildVehicleSearchValue(vehicle));
      setFilterValue('vehicle-filter-status', 'todos');
      setFilterValue('vehicle-filter-start', '');
      setFilterValue('vehicle-filter-end', '');
      renderModuleCompactFilterControls('veiculos');
      updateContextualSearchUi();
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
      setFilterValue('order-filter-status', 'todos');
      setFilterValue('order-filter-sort', 'recentes');
      renderModuleCompactFilterControls('orders');
      updateContextualSearchUi();
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
      setFilterValue('order-filter-status', 'todos');
      setFilterValue('order-filter-sort', 'recentes');
      renderModuleCompactFilterControls('orders');
      updateContextualSearchUi();
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

    function getHomeCostPerKmFilters() {
      const modeNode = document.getElementById('home-km-cost-mode');
      const monthNode = document.getElementById('home-km-cost-filter');
      const mode = modeNode?.value || 'all';
      if (monthNode && !monthNode.value) monthNode.value = getCurrentMonthKey();
      if (mode !== 'month') {
        if (monthNode) monthNode.classList.add('is-muted');
        return { mode, monthKey: '', start: '', end: '', label: 'Todo o histórico' };
      }
      if (monthNode) monthNode.classList.remove('is-muted');
      const monthKey = monthNode?.value || getCurrentMonthKey();
      const { start, end } = getMonthRange(monthKey);
      return {
        mode,
        monthKey,
        start,
        end,
        label: `Mês de ${getMonthLabel(monthKey)}`
      };
    }

    function openCostPerKmReport() {
      const filters = getHomeCostPerKmFilters();
      openModuleFromHome('relatorios');
      setFilterValue('report-filter-type', 'cost');
      setFilterValue('report-filter-vehicle', '');
      setFilterValue('report-filter-start', filters.start);
      setFilterValue('report-filter-end', filters.end);
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
    window.openCostPerKmReport = openCostPerKmReport;
    window.printMonthlyVehicleCostDashboard = printMonthlyVehicleCostDashboard;
    window.printCostPerKmDashboard = printCostPerKmDashboard;
    window.handleDashboardShortcutKey = handleDashboardShortcutKey;
    window.renderMonthlyVehicleCostChart = renderMonthlyVehicleCostChart;

    function setupGlobalSearchInput(inputEl, resultsEl) {
      if (!inputEl || !resultsEl) return;

      inputEl.addEventListener('input', (event) => {
        if (syncContextualModuleSearch(event.target.value, event.currentTarget)) return;
        setActiveSearchContext(inputEl, resultsEl);
        updateGlobalSearch(event.target.value, resultsEl);
      });

      inputEl.addEventListener('focus', (event) => {
        if (isContextualSearchModule()) return;
        setActiveSearchContext(inputEl, resultsEl);
        updateGlobalSearch(event.target.value, resultsEl);
      });

      inputEl.addEventListener('keydown', (event) => {
        if (isContextualSearchModule()) return;
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

    const contextualModuleSearchFields = {
      orders: 'order-filter-search',
      financeiro: 'finance-filter-search',
      veiculos: 'vehicle-filter-search',
      motoristas: 'driver-filter-search',
      fornecedores: 'supplier-filter-search'
    };

    function isCentralRecordsSearchContext() {
      return activeModule === 'central' && activeCentralSection === 'registros';
    }

    function isContextualSearchModule() {
      return isCentralRecordsSearchContext() || Boolean(contextualModuleSearchFields[activeModule]);
    }

    function syncContextualModuleSearch(value, sourceInput = null) {
      const explicitTargetId = sourceInput?.dataset?.contextualTargetId || '';
      if (explicitTargetId === 'central-records' || (!explicitTargetId && isCentralRecordsSearchContext())) {
        centralPendingSearchFilter = normalizeComparableText(value);
        saveCentralPendingFilters();
        renderCentralPendingRecords();
        hideGlobalSearchResults();
        return true;
      }
      const targetId = explicitTargetId || contextualModuleSearchFields[activeModule];
      if (!targetId) return false;
      const target = document.getElementById(targetId);
      if (!target) return false;
      target.value = value;
      target.dispatchEvent(new Event('input', { bubbles: true }));
      hideGlobalSearchResults();
      return true;
    }

    function updateContextualSearchUi() {
      const targetId = contextualModuleSearchFields[activeModule];
      const target = targetId ? document.getElementById(targetId) : null;
      const centralRecordsContext = isCentralRecordsSearchContext();
      const placeholder = centralRecordsContext
        ? 'Pesquisar nos registros da Central...'
        : (target ? `Pesquisar em ${document.getElementById('module-header-title')?.textContent || 'este módulo'}...` : 'Pesquisar módulo, atalho ou recurso...');
      [globalSearchInputEl, mobileGlobalSearchInputEl].forEach((input) => {
        if (!input) return;
        input.value = centralRecordsContext ? centralPendingSearchFilter : (target?.value || '');
        input.dataset.contextualTargetId = centralRecordsContext ? 'central-records' : (targetId || '');
        input.placeholder = placeholder;
        input.setAttribute('aria-label', placeholder);
      });
      hideGlobalSearchResults();
    }

    function getContextualModuleSearchValue(module, fallbackId) {
      const targetId = contextualModuleSearchFields[module];
      // Desktop and mobile inputs both write to this module-owned field.
      // Reading the hidden desktop input discards searches typed on mobile.
      return document.getElementById(targetId || fallbackId)?.value || '';
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

    function releaseVehicleImagePreviewUrl() {
      if (!vehicleImagePreviewObjectUrl) return;
      URL.revokeObjectURL(vehicleImagePreviewObjectUrl);
      vehicleImagePreviewObjectUrl = '';
    }

    function setVehicleImagePreview(url = '', options = {}) {
      const preview = document.getElementById('vehicle-image-preview');
      const placeholder = document.getElementById('vehicle-image-placeholder');
      const removeButton = document.getElementById('vehicle-image-remove');
      const input = document.getElementById('vehicle-image-file');
      if (!preview || !placeholder) return;
      const source = String(url || '').trim();
      preview.src = source;
      preview.classList.toggle('hidden', !source);
      placeholder.classList.toggle('hidden', Boolean(source));
      removeButton?.classList.toggle('hidden', !source);
      if (input && options.keepRemovalState !== true) delete input.dataset.removeExisting;
    }

    function previewVehicleImageFile() {
      const input = document.getElementById('vehicle-image-file');
      const file = input?.files?.[0];
      if (!file) return;
      if (!String(file.type || '').startsWith('image/')) {
        showToast('Selecione um arquivo de imagem válido.');
        input.value = '';
        return;
      }
      if (Number(file.size || 0) > 8 * 1024 * 1024) {
        showToast('A foto do veículo deve ter no máximo 8 MB.');
        input.value = '';
        return;
      }
      releaseVehicleImagePreviewUrl();
      vehicleImagePreviewObjectUrl = URL.createObjectURL(file);
      setVehicleImagePreview(vehicleImagePreviewObjectUrl);
    }

    function clearVehicleImageSelection() {
      const input = document.getElementById('vehicle-image-file');
      if (input) {
        input.value = '';
        input.dataset.removeExisting = 'true';
      }
      releaseVehicleImagePreviewUrl();
      setVehicleImagePreview('', { keepRemovalState: true });
    }

    window.previewVehicleImageFile = previewVehicleImageFile;
    window.clearVehicleImageSelection = clearVehicleImageSelection;

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
              ${getSortedDrivers().map(driver => `<option value="${driver.id}" ${isEntityActive(driver) ? '' : 'disabled'}>${escapeHtml(driver.nome)}${isEntityActive(driver) ? '' : ' (inativo)'}</option>`).join('')}
            </select>
          </div>
          <div class="field-wrap full">
            <label>Chassi</label>
            <input class="soft-input w-full" id="vehicle-chassi" placeholder="9BWZZZ377VT004251">
          </div>
          <div class="field-wrap full vehicle-image-field">
            <div class="vehicle-image-copy">
              <label>Foto do veículo</label>
              <span>Essa imagem aparecerá no perfil do motorista na Central.</span>
              <label class="vehicle-image-upload" for="vehicle-image-file">
                <input id="vehicle-image-file" type="file" accept="image/png,image/jpeg,image/webp" onchange="previewVehicleImageFile()">
                <strong>Escolher foto</strong>
                <small>PNG, JPG ou WebP de até 8 MB</small>
              </label>
              <button id="vehicle-image-remove" class="vehicle-image-remove hidden" type="button" onclick="clearVehicleImageSelection()">Remover foto</button>
            </div>
            <div class="vehicle-image-preview-shell">
              <div id="vehicle-image-placeholder" class="vehicle-image-placeholder">Sem foto</div>
              <img id="vehicle-image-preview" class="vehicle-image-preview hidden" alt="Prévia do veículo">
            </div>
          </div>
          <div class="field-wrap full entity-active-field">
            <div><strong>Veículo ativo</strong><small>Disponível para novos vínculos e lançamentos.</small></div>
            <label class="entity-active-switch" aria-label="Ativar ou desativar veículo">
              <input id="vehicle-active" type="checkbox" checked>
              <span aria-hidden="true"></span>
            </label>
          </div>
        `;
        setVehicleImagePreview('');
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
                    <input type="checkbox" value="${vehicle.id}" ${isEntityActive(vehicle) ? '' : 'disabled'}>
                    <span class="driver-vehicle-check" aria-hidden="true">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 12l4 4 10-10"/>
                      </svg>
                    </span>
                    <span class="driver-vehicle-text">
                      <strong>${escapeHtml([vehicle.numeroFrota, vehicle.placa].filter(Boolean).join(' - ') || 'Veículo sem identificação')}</strong>
                      <small>${escapeHtml(vehicle.modelo || 'Modelo não informado')}${isEntityActive(vehicle) ? '' : ' · Inativo'}</small>
                    </span>
                  </label>
                `).join('')
                : '<div class="driver-vehicle-empty">Cadastre veículos para criar vínculos com este motorista.</div>'}
            </div>
          </div>
          <div class="field-wrap full entity-active-field">
            <div><strong>Motorista ativo</strong><small>Disponível para novos vínculos e lançamentos.</small></div>
            <label class="entity-active-switch" aria-label="Ativar ou desativar motorista">
              <input id="driver-active" type="checkbox" checked>
              <span aria-hidden="true"></span>
            </label>
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
            <select class="soft-input w-full" id="supplier-type" onchange="syncSupplierCityLabel()" required>
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
            <label id="supplier-city-label">Cidade</label>
            <select class="soft-input w-full" id="supplier-city">
              <option value="">Selecione uma cidade cadastrada</option>
              ${centralCities.filter((city) => city.active).slice().sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')).map((city) => `<option value="${escapeHtml(city.name)}">${escapeHtml(city.name)}</option>`).join('')}
            </select>
          </div>
          <div class="field-wrap full">
            <label>Endereço</label>
            <input class="soft-input w-full" id="supplier-address" placeholder="Rua, número, bairro e cidade">
          </div>
          <div class="field-wrap full">
            <label>Link da rota / Google Maps</label>
            <input class="soft-input w-full" id="supplier-map-url" type="url" placeholder="https://maps.app.goo.gl/...">
          </div>
          <div class="field-wrap">
            <label>E-mail</label>
            <input class="soft-input w-full" id="supplier-email" placeholder="contato@fornecedor.com">
          </div>
          <div class="field-wrap full">
            <label>Observações</label>
            <textarea class="soft-input textarea w-full" id="supplier-notes" placeholder="Observações do parceiro"></textarea>
          </div>
          <div class="field-wrap full entity-active-field">
            <div><strong>Fornecedor ativo</strong></div>
            <label class="entity-active-switch" aria-label="Ativar ou desativar fornecedor">
              <input id="supplier-active" type="checkbox" checked>
              <span aria-hidden="true"></span>
            </label>
          </div>
        `;
        syncSupplierCityLabel();
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
            <label>${requiredLabel('Veículo')}</label>
            <div class="form-input-shell">
              ${fieldIcon('vehicle')}
              <select class="soft-input w-full" id="order-veiculo" onchange="handleOrderVehicleChange()" required>
                <option value="">Selecione um veículo</option>
                ${getSortedVehicles().map(vehicle => `<option value="${vehicle.id}" ${isEntityActive(vehicle) ? '' : 'disabled'}>${escapeHtml(vehicle.numeroFrota)}  ${escapeHtml(vehicle.placa)}  ${escapeHtml(vehicle.modelo)}${isEntityActive(vehicle) ? '' : ' (inativo)'}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="field-wrap">
            <label>Responsável</label>
            <div class="form-input-shell">
              ${fieldIcon('user')}
              <select class="soft-input w-full" id="order-driver">
                <option value="">Selecione um motorista</option>
                ${getSortedDrivers().map(driver => `<option value="${driver.id}" ${isEntityActive(driver) ? '' : 'disabled'}>${escapeHtml(driver.nome)}${isEntityActive(driver) ? '' : ' (inativo)'}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="field-wrap">
            <label>Data de início</label>
            <div class="form-input-shell form-input-shell--date" onclick="openNativeDatePicker('order-data-inicio')">
              ${fieldIcon('calendar')}
              <input class="soft-input w-full" id="order-data-inicio" type="date" onchange="handleOrderStartDateChange()">
            </div>
          </div>
          <div class="field-wrap">
            <label>Data de fim</label>
            <div class="form-input-shell form-input-shell--date" onclick="openNativeDatePicker('order-data-termino')">
              ${fieldIcon('calendar')}
              <input class="soft-input w-full" id="order-data-termino" type="date" onchange="handleOrderEndDateChange()">
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
        setDefaultOrderDates();
        updateOrderDescriptionFromType(true);
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
      releaseVehicleImagePreviewUrl();
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
      reader.onload = async (loadEvent) => {
        try {
          const parsed = JSON.parse(loadEvent.target.result);
          if (!Array.isArray(parsed.vehicles) || !Array.isArray(parsed.drivers) || !Array.isArray(parsed.suppliers) || !Array.isArray(parsed.orders) || !Array.isArray(parsed.finance)) {
            throw new Error('Estrutura inválida');
          }
          allVehicles = parsed.vehicles.map(normalizeVehicleRecord);
          allDrivers = parsed.drivers.map(normalizeDriverRecord);
          allSuppliers = parsed.suppliers.map(normalizeSupplierRecord);
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
          await saveToLocalStorage();
          renderAll();
          renderNotifications();
          updateCustomLogoUi();
          updateOperationSettingsUi();
          toggleSettings(false);
          if (!window.WeFrotasBackend?.getUser()) {
            showToast('Backup restaurado neste dispositivo. Entre no WeFrotas para sincronizar com os demais usuários.');
            return;
          }
          try {
            await window.WeFrotasBackend.syncNow(buildStorageSnapshot());
          } catch (syncError) {
            console.error('Falha ao sincronizar o backup restaurado.', syncError);
            showToast('Backup restaurado neste dispositivo, mas o Appwrite não confirmou a sincronização.');
            return;
          }
          showToast('Backup restaurado e sincronizado para todos os usuários.', {
            notify: true,
            notifyTitle: 'Backup importado',
            notifyMessage: `Os dados de ${file.name} foram restaurados e enviados ao Appwrite.`
          });
        } catch (error) {
          console.error(error);
          showToast(error?.message || 'Não foi possível ler e restaurar esse backup.');
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
      centralDeviceLinks = {};
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
      // saveToLocalStorage replaces only the authenticated tenant's snapshot.
      // Shared legacy data must never be deleted by another company's reset.
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
          allVehicles.unshift({ id: generateId(), createdAt: new Date().toISOString(), ...payload });
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
          allDrivers.unshift({ id: newDriverId, createdAt: new Date().toISOString(), ...payload });
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
          allSuppliers.unshift({ id: generateId(), createdAt: new Date().toISOString(), ...payload });
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

    function getVehicleFuelKmRange(vehicleId, start = '', end = '') {
      const kms = getFuelSheetRows()
        .filter(row => getEntryLinkedVehicleId(row.entry) === vehicleId || getEntryImmediateVehicleId(row.entry) === vehicleId || row.vehicle?.id === vehicleId)
        .filter(row => isDateWithinRange(getFinanceEntryDate(row.entry), start, end))
        .map(row => Number(row.entry?.km || 0))
        .filter(km => Number.isFinite(km) && km > 0)
        .sort((a, b) => a - b);

      return {
        initialKm: kms.length ? kms[0] : null,
        finalKm: kms.length ? kms[kms.length - 1] : null
      };
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

    function getOrderGeneratedDescription(order) {
      if (!order) return '';
      const vehicle = allVehicles.find(item => item.id === order.vehicleId);
      const currentKm = vehicle ? getVehicleCurrentKm(vehicle.id) : null;
      const nextRevisionKm = currentKm ? (Math.ceil(currentKm / 10000) * 10000 || 10000) : 0;
      return getOrderTypeDescription(order.tipoOs || 'avulsa', {
        dataInicio: order.dataInicio || '',
        vehicle,
        revisionKm: nextRevisionKm
      });
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

    function openNativeDatePicker(fieldId) {
      const field = document.getElementById(fieldId);
      if (!field) return;
      if (typeof field.showPicker === 'function') {
        try {
          field.showPicker();
        } catch (error) {
          field.focus();
        }
      } else {
        field.focus();
      }
    }

    function setDefaultOrderDates() {
      const startField = document.getElementById('order-data-inicio');
      const endField = document.getElementById('order-data-termino');
      if (!startField || !endField) return;
      const today = getLocalIsoDate();
      startField.value = today;
      endField.value = getLastDayOfMonthIso(today);
      endField.dataset.autoEndDate = endField.value;
    }

    function syncOrderEndDateWithStart() {
      const startField = document.getElementById('order-data-inicio');
      const endField = document.getElementById('order-data-termino');
      if (!startField || !endField || !startField.value) return;
      const suggestedEndDate = getLastDayOfMonthIso(startField.value);
      const previousAutoEndDate = endField.dataset.autoEndDate || '';
      if (!endField.value || endField.value === previousAutoEndDate) {
        endField.value = suggestedEndDate;
        endField.dataset.autoEndDate = suggestedEndDate;
      }
    }

    window.openNativeDatePicker = openNativeDatePicker;

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
      syncOrderEndDateWithStart();
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
      'finance-driver-id',
      'finance-fuel-type'
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

    function getMaintenanceOrderMatchScore(order, revisionKm) {
      const description = normalizeRevisionText(order?.descricao);
      const targetKm = String(Math.max(0, Number(revisionKm || 0)));
      let score = 0;

      if (Number(order?.maintenanceRevisionKm || 0) === Number(revisionKm || 0)) score += 240;
      if ((order?.tipoOs || '').toLowerCase() === 'revisao') score += 90;
      if (description.includes('REVISAO')) score += 75;
      if (/(MANUTENCAO|PREVENTIVA|PERIODICA)/.test(description)) score += 55;
      if (/(TROCADEOLEO|FILTRO|ALINHAMENTO|BALANCEAMENTO)/.test(description)) score += 25;
      if (targetKm && description.includes(targetKm)) score += 55;
      if (order?.status === 'aberta') score += 18;
      if (order?.status === 'andamento') score += 14;
      if (order?.status === 'cancelada') score -= 180;

      return score;
    }

    function findLinkedRevisionOrder(vehicleId, revisionKm) {
      return allOrders.find(order =>
        order.vehicleId === vehicleId
        && Number(order.maintenanceRevisionKm || 0) === Number(revisionKm || 0)
      ) || null;
    }

    function findSuggestedRevisionOrder(vehicleId, revisionKm, linkedOrder = null) {
      const candidates = allOrders
        .filter(order => order.vehicleId === vehicleId && order.id !== linkedOrder?.id)
        .map(order => ({ order, score: getMaintenanceOrderMatchScore(order, revisionKm) }))
        .filter(item => item.score >= 55)
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return String(b.order.dataInicio || '').localeCompare(String(a.order.dataInicio || ''));
        });
      return candidates[0]?.order || null;
    }

    function getVehicleMaintenanceStatus(vehicle) {
      const currentKm = getVehicleCurrentKm(vehicle.id);
      if (currentKm === null || Number.isNaN(currentKm)) {
        return {
          currentKm: null,
          nextRevisionKm: null,
          remainingKm: null,
          isAlert: false,
          linkedOrder: null,
          suggestedOrder: null
        };
      }

      const nextRevisionKm = Math.ceil(currentKm / 10000) * 10000 || 10000;
      const remainingKm = Math.max(nextRevisionKm - currentKm, 0);
      const linkedOrder = findLinkedRevisionOrder(vehicle.id, nextRevisionKm);
      const suggestedOrder = findSuggestedRevisionOrder(vehicle.id, nextRevisionKm, linkedOrder);

      return {
        currentKm,
        nextRevisionKm,
        remainingKm,
        isAlert: remainingKm <= 2000,
        linkedOrder,
        suggestedOrder
      };
    }

    function linkSuggestedMaintenanceOrder(vehicleId, orderId) {
      const vehicle = allVehicles.find(item => item.id === vehicleId);
      const order = allOrders.find(item => item.id === orderId);
      if (!vehicle || !order || order.vehicleId !== vehicle.id) {
        showToast('Não foi possível validar a OS sugerida para este veículo.');
        return;
      }

      const maintenance = getVehicleMaintenanceStatus(vehicle);
      if (!maintenance.nextRevisionKm) {
        showToast('Esse veículo ainda não possui KM atual para vincular a revisão.');
        return;
      }

      const statusLabel = getOrderStatusUi(order.status).label;
      const vehicleLabel = `${vehicle.numeroFrota || '-'} - ${vehicle.placa || '-'} ${vehicle.modelo || ''}`.trim();
      openPromptModal({
        mode: 'confirm',
        title: `Vincular a OS ${getOrderNumberLabel(order)}?`,
        text: `${vehicleLabel} • revisão de ${maintenance.nextRevisionKm.toLocaleString('pt-BR')} km. A OS está ${statusLabel.toLowerCase()} e será identificada como a revisão deste veículo.`,
        confirmLabel: 'Vincular OS',
        cancelLabel: 'Cancelar',
        onConfirm: async () => {
          allOrders = allOrders.map(item => item.id === order.id
            ? {
                ...item,
                maintenanceRevisionKm: maintenance.nextRevisionKm,
                maintenanceLinkedAt: new Date().toISOString()
              }
            : item);
          await saveToLocalStorage();
          renderAll();
          showToast(`OS ${getOrderNumberLabel(order)} vinculada à revisão do veículo.`);
        }
      });
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

      if (maintenance.linkedOrder && maintenance.linkedOrder.status !== 'fechada') {
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

    window.linkSuggestedMaintenanceOrder = linkSuggestedMaintenanceOrder;

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
        .filter(entry => isDistributedFuelCostEntry(entry))
        .forEach(entry => {
          const currentVehicleId = getEntryLinkedVehicleId(entry);
          if (!currentVehicleId) return;
          const entryDate = getFinanceEntryCompetenceDate(entry);
          if (vehicleId && currentVehicleId !== vehicleId) return;
          if (start && (!entryDate || entryDate < start)) return;
          if (end && (!entryDate || entryDate > end)) return;

          const stats = statsMap.get(currentVehicleId);
          if (!stats) return;
          stats.totalCost += getFinanceNetTotal(entry);
          stats.entries += isFuelGroupEntry(entry) ? Math.max(getFuelGroupChildren(entry).length, 1) : 1;
        });

      const vehicleEntriesMap = new Map();
      allFinanceEntries
        .filter(entry => !entry.groupedIntoId)
        .filter(entry => isFuelEntry(entry) || isFuelGroupEntry(entry))
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

    function getCostPerKmTone(costPerKm) {
      const value = Number(costPerKm || 0);
      if (value > 1) return 'red';
      if (value > 0.8 && value <= 0.9) return 'yellow';
      if (value <= 0.8) return 'green';
      return 'neutral';
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
      setFilterValue('finance-filter-status', group === 'distributed' ? 'distribuido' : 'pendente');
      renderModuleCompactFilterControls('financeiro');
      updateContextualSearchUi();
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

    function syncReportDateBounds() {
      const startNode = document.getElementById('report-filter-start');
      const endNode = document.getElementById('report-filter-end');
      if (!startNode || !endNode) return;
      endNode.min = startNode.value || '';
      startNode.max = endNode.value || '';
    }

    function applyReportFilters() {
      const filters = getReportFilters();
      syncReportDateBounds();
      if (filters.start && filters.end && filters.start > filters.end) {
        showToast('A data inicial não pode ser posterior à data final.');
        return false;
      }
      renderReports();
      return true;
    }

    function clearReportFilters() {
      setFilterValue('report-filter-type', 'cost');
      setFilterValue('report-filter-vehicle', '');
      setFilterValue('report-filter-start', '');
      setFilterValue('report-filter-end', '');
      syncReportDateBounds();
      renderReports();
    }

    function getReportTitleByType(type) {
      switch (type) {
        case 'cost': return 'Custo por KM';
        case 'fuel_liters_per_km': return 'Litro por KM';
        case 'monthly_vehicle_cost': return 'Custo mensal por veículo';
        case 'fuel_register': return 'Registro de abastecimentos';
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
      const normalizedDate = normalizeDateForFilter(dateString);
      const normalizedStart = normalizeDateForFilter(start);
      const normalizedEnd = normalizeDateForFilter(end);
      if (!normalizedDate) return false;
      if (normalizedStart && normalizedDate < normalizedStart) return false;
      if (normalizedEnd && normalizedDate > normalizedEnd) return false;
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

    function getReportDateContextLabel(type) {
      if (['fuel_register', 'fuel_liters_per_km', 'cost'].includes(type)) {
        return 'Data usada: abastecimento dos lançamentos de combustível.';
      }
      if (type === 'monthly_vehicle_cost') {
        return 'Data usada: competência de abertura da OS vinculada ao veículo.';
      }
      if (String(type || '').startsWith('orders')) {
        return type === 'orders_deleted'
          ? 'Data usada: exclusão da OS.'
          : 'Data usada: abertura da OS.';
      }
      if (['finance_status', 'supplier_ranking'].includes(type)) {
        return 'Data usada: vencimento ou data principal do lançamento financeiro.';
      }
      if (type === 'maintenance_due') {
        return 'Filtro de data não interfere nas revisões por KM.';
      }
      if (type === 'cnh_expiring') {
        return 'Data usada: validade da CNH.';
      }
      if (type === 'insurance_expiring') {
        return 'Data usada: vencimento do seguro.';
      }
      return 'A data usada depende do relatório selecionado.';
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

    function createReportReceiptCell(url) {
      const normalizedUrl = String(url || '').trim();
      if (!normalizedUrl) return { text: '-' };
      return {
        text: 'Ver comprovante',
        html: `
          <button type="button" class="report-link-btn" title="Ver comprovante" onclick="event.stopPropagation(); viewFinanceReceipt(decodeURIComponent('${encodeURIComponent(normalizedUrl)}'))">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 13a5 5 0 007.07 0l2.12-2.12a5 5 0 00-7.07-7.07L11 4.93"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 11a5 5 0 00-7.07 0L4.81 13.12a5 5 0 007.07 7.07L13 19.07"/>
            </svg>
          </button>
        `
      };
    }

    function getReportColumnId(column, index) {
      const base = normalizeComparableText(column?.label || `coluna ${index + 1}`)
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      return `${base || 'coluna'}-${index}`;
    }

    function loadReportPreferences() {
      try {
        return JSON.parse(localStorage.getItem(reportPreferencesStorageKey) || '{}') || {};
      } catch (error) {
        return {};
      }
    }

    function saveReportPreferences() {
      try {
        localStorage.setItem(reportPreferencesStorageKey, JSON.stringify(reportPreferences || {}));
      } catch (error) {
        console.warn('Não foi possível salvar a configuração dos relatórios.', error);
      }
    }

    function getReportPreference(type = getReportFilters().type) {
      if (!reportPreferences[type]) {
        reportPreferences[type] = { order: [], hidden: [] };
      }
      return reportPreferences[type];
    }

    function getNormalizedReportColumns(reportData) {
      return (reportData.columns || []).map((column, index) => ({
        ...column,
        id: column.id || getReportColumnId(column, index),
        originalIndex: index
      }));
    }

    function getReportColumnsInPreferredOrder(reportData, type = getReportFilters().type) {
      const columns = getNormalizedReportColumns(reportData);
      const ids = columns.map(column => column.id);
      const preference = getReportPreference(type);
      const orderedIds = Array.isArray(preference.order)
        ? preference.order.filter(id => ids.includes(id))
        : [];
      const missingIds = ids.filter(id => !orderedIds.includes(id));
      return [...orderedIds, ...missingIds]
        .map(id => columns.find(column => column.id === id))
        .filter(Boolean);
    }

    function getReportDisplayData(reportData, type = getReportFilters().type) {
      const orderedColumns = getReportColumnsInPreferredOrder(reportData, type);
      const preference = getReportPreference(type);
      const hiddenIds = new Set(Array.isArray(preference.hidden) ? preference.hidden : []);
      const visibleColumns = orderedColumns.filter(column => !hiddenIds.has(column.id));
      const safeColumns = visibleColumns.length ? visibleColumns : orderedColumns;
      const normalizedRows = (reportData.rows || []).map((row, originalIndex) => ({
        ...row,
        originalIndex,
        cells: safeColumns.map(column => row.cells?.[column.originalIndex] || { text: '-' })
      }));
      const shouldSort = reportSortState.type === type && reportSortState.columnId && reportSortState.direction;
      if (shouldSort) {
        const sortColumnIndex = safeColumns.findIndex(column => column.id === reportSortState.columnId);
        if (sortColumnIndex >= 0) {
          const direction = reportSortState.direction === 'asc' ? 1 : -1;
          normalizedRows.sort((a, b) => {
            const column = safeColumns[sortColumnIndex];
            const aValue = getReportCellSortValue(a.cells[sortColumnIndex], column);
            const bValue = getReportCellSortValue(b.cells[sortColumnIndex], column);
            let compare = 0;
            if (typeof aValue === 'number' || typeof bValue === 'number') {
              compare = Number(aValue || 0) - Number(bValue || 0);
            } else {
              compare = String(aValue || '').localeCompare(String(bValue || ''), 'pt-BR', { numeric: true, sensitivity: 'base' });
            }
            return compare ? compare * direction : a.originalIndex - b.originalIndex;
          });
        }
      }
      return {
        ...reportData,
        columns: safeColumns,
        rows: normalizedRows
      };
    }

    function getReportCellSortValue(cell, column) {
      const rawValue = cell?.sortValue ?? cell?.value ?? cell?.text ?? '';
      if (column?.numeric || cell?.numeric) {
        if (typeof rawValue === 'number') return rawValue;
        const normalized = String(rawValue)
          .replace(/[^\d,.-]/g, '')
          .replace(/\.(?=\d{3}(?:\D|$))/g, '')
          .replace(',', '.');
        const numberValue = Number(normalized);
        return Number.isFinite(numberValue) ? numberValue : 0;
      }
      const dateMatch = String(rawValue).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (dateMatch) return `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
      return normalizeComparableText(rawValue);
    }

    function handleReportColumnHeaderClick(event, columnId) {
      if (event?.target?.closest?.('button')) return;
      const type = getReportFilters().type;
      if (reportSortState.type !== type || reportSortState.columnId !== columnId) {
        reportSortState = { type, columnId, direction: 'asc' };
      } else if (reportSortState.direction === 'asc') {
        reportSortState = { type, columnId, direction: 'desc' };
      } else {
        reportSortState = { type: '', columnId: '', direction: '' };
      }
      renderReports();
    }

    function renderReportColumnsPanel(reportData) {
      const panel = document.getElementById('report-columns-panel');
      if (!panel) return;
      const type = getReportFilters().type;
      const preference = getReportPreference(type);
      const hiddenIds = new Set(Array.isArray(preference.hidden) ? preference.hidden : []);
      const columns = getReportColumnsInPreferredOrder(reportData, type);
      if (!columns.length) {
        panel.innerHTML = '';
        return;
      }

      panel.innerHTML = `
        <div class="report-columns-head">
          <div>
            <strong>Colunas do relatório</strong>
            <span>Escolha, oculte e reorganize a visualização atual.</span>
          </div>
          <button type="button" class="soft-btn !h-9 !px-3" onclick="resetReportColumns()">Restaurar padrão</button>
        </div>
        <div class="report-columns-grid">
          ${columns.map(column => `
            <label class="report-column-option">
              <input type="checkbox" ${hiddenIds.has(column.id) ? '' : 'checked'} onchange="setReportColumnVisibility('${column.id}', this.checked)">
              <span>${escapeHtml(column.label)}</span>
            </label>
          `).join('')}
        </div>
      `;
    }

    function toggleReportColumnsPanel(force) {
      const panel = document.getElementById('report-columns-panel');
      if (!panel) return;
      const shouldShow = typeof force === 'boolean' ? force : panel.classList.contains('hidden');
      panel.classList.toggle('hidden', !shouldShow);
    }

    function toggleReportExportMenu(force) {
      const menu = document.getElementById('report-export-menu');
      if (!menu) return;
      const shouldShow = typeof force === 'boolean' ? force : menu.classList.contains('hidden');
      menu.classList.toggle('hidden', !shouldShow);
    }

    function setReportColumnVisibility(columnId, visible) {
      const preference = getReportPreference();
      const hidden = new Set(Array.isArray(preference.hidden) ? preference.hidden : []);
      if (visible) hidden.delete(columnId);
      else hidden.add(columnId);
      preference.hidden = Array.from(hidden);
      saveReportPreferences();
      renderReports();
      toggleReportColumnsPanel(true);
    }

    function moveReportColumn(columnId, direction) {
      const reportData = buildReportData(getReportFilters());
      const type = getReportFilters().type;
      const columns = getReportColumnsInPreferredOrder(reportData, type);
      const order = columns.map(column => column.id);
      const currentIndex = order.indexOf(columnId);
      const nextIndex = currentIndex + Number(direction || 0);
      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= order.length) return;
      [order[currentIndex], order[nextIndex]] = [order[nextIndex], order[currentIndex]];
      getReportPreference(type).order = order;
      saveReportPreferences();
      renderReports();
      toggleReportColumnsPanel(true);
    }

    function moveReportColumnTo(columnId, targetColumnId) {
      if (!columnId || !targetColumnId || columnId === targetColumnId) return;
      const reportData = buildReportData(getReportFilters());
      const type = getReportFilters().type;
      const columns = getReportColumnsInPreferredOrder(reportData, type);
      const order = columns.map(column => column.id);
      const fromIndex = order.indexOf(columnId);
      const toIndex = order.indexOf(targetColumnId);
      if (fromIndex < 0 || toIndex < 0) return;
      order.splice(fromIndex, 1);
      order.splice(toIndex, 0, columnId);
      getReportPreference(type).order = order;
      saveReportPreferences();
      renderReports();
    }

    function handleReportColumnDragStart(event, columnId) {
      reportDraggedColumnId = columnId;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', columnId);
      event.currentTarget.classList.add('report-column-dragging');
    }

    function handleReportColumnDragEnd(event) {
      reportDraggedColumnId = '';
      event.currentTarget.classList.remove('report-column-dragging');
    }

    function handleReportColumnDragOver(event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      event.currentTarget.classList.add('report-column-drop-target');
    }

    function handleReportColumnDragLeave(event) {
      event.currentTarget.classList.remove('report-column-drop-target');
    }

    function handleReportColumnDrop(event, targetColumnId) {
      event.preventDefault();
      event.currentTarget.classList.remove('report-column-drop-target');
      const sourceColumnId = event.dataTransfer.getData('text/plain') || reportDraggedColumnId;
      moveReportColumnTo(sourceColumnId, targetColumnId);
      reportDraggedColumnId = '';
    }

    function resetReportColumns() {
      const type = getReportFilters().type;
      delete reportPreferences[type];
      if (reportSortState.type === type) {
        reportSortState = { type: '', columnId: '', direction: '' };
      }
      saveReportPreferences();
      renderReports();
      toggleReportColumnsPanel(true);
      showToast('Visual do relatório restaurado.');
    }

    function getReportExportRows(reportData) {
      const displayData = getReportDisplayData(reportData);
      return displayData.rows.map(row => displayData.columns.reduce((acc, column, index) => {
        const cell = row.cells[index] || {};
        acc[column.label] = cell.text || '-';
        return acc;
      }, {}));
    }

    function exportReport(type = 'xlsx') {
      const reportData = buildReportData(getReportFilters());
      const rows = getReportExportRows(reportData);
      if (!rows.length) {
        showToast('Não há dados para exportar.');
        return;
      }
      if (type === 'pdf') {
        toggleReportExportMenu(false);
        printReport();
        return;
      }
      if (!window.XLSX) {
        showToast('Biblioteca de exportação ainda não carregada.');
        return;
      }
      const workbook = XLSX.utils.book_new();
      const sheet = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, sheet, 'Relatório');
      const extension = type === 'xls' ? 'xls' : 'xlsx';
      const slug = normalizeComparableText(reportData.title).replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'relatorio';
      XLSX.writeFile(workbook, `${slug}.${extension}`, { bookType: extension });
      toggleReportExportMenu(false);
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
            kmRange: getVehicleFuelKmRange(vehicle.id, filters.start, filters.end),
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
            { label: 'KM inicial', numeric: true },
            { label: 'KM final', numeric: true },
            { label: 'KM atual', numeric: true },
            { label: 'Custo total', numeric: true }
          ],
          rows: rows.map(item => ({
            cells: [
              { text: item.vehicle.numeroFrota || '-' },
              { text: item.vehicle.placa || '-' },
              { text: item.vehicle.modelo || '-' },
              { text: item.kmRange.initialKm === null ? '-' : `${item.kmRange.initialKm.toLocaleString('pt-BR')} km`, numeric: true },
              { text: item.kmRange.finalKm === null ? '-' : `${item.kmRange.finalKm.toLocaleString('pt-BR')} km`, numeric: true },
              { text: item.currentKm === null ? '-' : `${item.currentKm.toLocaleString('pt-BR')} km`, numeric: true },
              { text: formatCurrency(item.total), numeric: true }
            ]
          })),
          emptyMessage: 'Nenhum veículo encontrado para os filtros aplicados.'
        };
      }

      if (filters.type === 'fuel_register') {
        const rows = getFuelSheetRows()
          .filter(row => !filters.vehicleId || getEntryLinkedVehicleId(row.entry) === filters.vehicleId || row.vehicle?.id === filters.vehicleId)
          .filter(row => {
            const entryDate = getFinanceEntryDate(row.entry);
            if (!filters.start && !filters.end) return true;
            return isDateWithinRange(entryDate, filters.start, filters.end);
          })
          .sort((a, b) => String(getFinanceEntryDate(b.entry)).localeCompare(String(getFinanceEntryDate(a.entry))) || String(b.entry.createdAt || '').localeCompare(String(a.entry.createdAt || '')));
        const totalLiters = rows.reduce((sum, row) => sum + parseDecimalInputValue(row.entry.litros), 0);
        const totalValue = rows.reduce((sum, row) => sum + getFinanceTotal(row.entry), 0);
        const averageUnitValue = totalLiters ? totalValue / totalLiters : 0;
        return {
          title,
          meta,
          summary: [
            { label: 'Registros', value: String(rows.length), help: 'Abastecimentos encontrados para o período selecionado.' },
            { label: 'Litros', value: `${totalLiters.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} L`, help: 'Soma da litragem dos registros filtrados.' },
            { label: 'Valor total', value: formatCurrency(totalValue), help: 'Total financeiro dos abastecimentos exibidos.' },
            { label: 'Valor por litro', value: formatCurrency(averageUnitValue), help: 'Média geral calculada por valor dividido por litros.' }
          ],
          columns: [
            { label: 'Data abastecimento' },
            { label: 'Veículo' },
            { label: 'Placa' },
            { label: 'KM', numeric: true },
            { label: 'Litros', numeric: true },
            { label: 'Valor', numeric: true },
            { label: 'Motorista' },
            { label: 'Posto' },
            { label: 'Comprovante' }
          ],
          rows: rows.map(row => ({
            cells: [
              { text: formatDate(getFinanceEntryDate(row.entry)) },
              { text: [row.vehicle?.numeroFrota, row.vehicle?.modelo].filter(Boolean).join(' ') || row.vehicleLabel || '-' },
              { text: row.vehicle?.placa || row.entry.placa || '-' },
              { text: row.entry.km ? Number(row.entry.km).toLocaleString('pt-BR') : '-', numeric: true },
              { text: formatLitersValue(row.entry.litros), numeric: true },
              { text: formatCurrency(getFinanceTotal(row.entry)), numeric: true },
              { text: row.driver?.nome || row.entry.motorista || row.entry.driverName || '-' },
              { text: row.entry.fornecedor || row.supplier?.nome || '-' },
              createReportReceiptCell(row.entry.comprovanteUrl)
            ]
          })),
          emptyMessage: 'Nenhum abastecimento encontrado para os filtros aplicados.'
        };
      }

      if (filters.type === 'fuel_liters_per_km') {
        const sourceRows = getFuelSheetRows()
          .filter(row => !filters.vehicleId || getEntryLinkedVehicleId(row.entry) === filters.vehicleId || row.vehicle?.id === filters.vehicleId)
          .map(row => ({
            ...row,
            vehicleId: getEntryLinkedVehicleId(row.entry) || row.vehicle?.id || '',
            entryDate: getFinanceEntryDate(row.entry),
            km: Number(row.entry.km || 0),
            liters: parseDecimalInputValue(row.entry.litros),
            total: getFinanceTotal(row.entry)
          }))
          .filter(row => row.vehicleId && row.entryDate && row.km > 0)
          .sort((a, b) => {
            const vehicleCompare = String(a.vehicleId).localeCompare(String(b.vehicleId));
            if (vehicleCompare) return vehicleCompare;
            const dateCompare = String(a.entryDate).localeCompare(String(b.entryDate));
            if (dateCompare) return dateCompare;
            return a.km - b.km;
          });

        const previousKmByVehicle = new Map();
        const reportRows = sourceRows
          .map(row => {
            const initialKm = previousKmByVehicle.get(row.vehicleId) || null;
            previousKmByVehicle.set(row.vehicleId, row.km);
            const kmDriven = initialKm && row.km > initialKm ? row.km - initialKm : 0;
            const litersPerKm = kmDriven > 0 ? row.liters / kmDriven : 0;
            const kmPerLiter = row.liters > 0 && kmDriven > 0 ? kmDriven / row.liters : 0;
            const costPerKm = kmDriven > 0 ? row.total / kmDriven : 0;
            return {
              ...row,
              initialKm,
              finalKm: row.km,
              kmDriven,
              litersPerKm,
              kmPerLiter,
              costPerKm
            };
          })
          .filter(row => isDateWithinRange(row.entryDate, filters.start, filters.end))
          .sort((a, b) => String(b.entryDate).localeCompare(String(a.entryDate)) || b.finalKm - a.finalKm);

        const totalLiters = reportRows.reduce((sum, row) => sum + row.liters, 0);
        const totalKm = reportRows.reduce((sum, row) => sum + row.kmDriven, 0);
        const totalValue = reportRows.reduce((sum, row) => sum + row.total, 0);
        const averageLitersPerKm = totalKm ? totalLiters / totalKm : 0;
        const averageKmPerLiter = totalLiters ? totalKm / totalLiters : 0;
        const missingIntervals = reportRows.filter(row => !row.kmDriven).length;

        return {
          title,
          meta,
          summary: [
            { label: 'Abastecimentos', value: String(reportRows.length), help: 'Registros de abastecimento encontrados no período.' },
            { label: 'Litros por KM', value: averageLitersPerKm ? `${averageLitersPerKm.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} L/km` : '-', help: 'Litros totais divididos pelo KM rodado calculado.' },
            { label: 'KM por litro', value: averageKmPerLiter ? `${averageKmPerLiter.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} km/L` : '-', help: 'Indicador complementar de consumo médio.' },
            { label: 'Custo por KM', value: totalKm ? formatCurrency(totalValue / totalKm) : '-', help: 'Valor total dividido pelo KM rodado calculado.' }
          ],
          columns: [
            { label: 'Data abastecimento' },
            { label: 'Motorista' },
            { label: 'Frota' },
            { label: 'Veículo' },
            { label: 'Placa' },
            { label: 'KM inicial', numeric: true },
            { label: 'KM final', numeric: true },
            { label: 'KM rodado', numeric: true },
            { label: 'Litros', numeric: true },
            { label: 'L/KM', numeric: true },
            { label: 'KM/L', numeric: true },
            { label: 'Custo', numeric: true },
            { label: 'Custo/KM', numeric: true },
            { label: 'Posto' },
            { label: 'Comprovante' }
          ],
          rows: reportRows.map(row => ({
            cells: [
              { text: formatDate(row.entryDate) },
              { text: row.driver?.nome || row.entry.motorista || row.entry.driverName || '-' },
              { text: row.vehicle?.numeroFrota || '-' },
              { text: row.vehicle?.modelo || row.vehicleLabel || '-' },
              { text: row.vehicle?.placa || row.entry.placa || '-' },
              { text: row.initialKm ? row.initialKm.toLocaleString('pt-BR') : '-', numeric: true },
              { text: row.finalKm ? row.finalKm.toLocaleString('pt-BR') : '-', numeric: true },
              { text: row.kmDriven ? row.kmDriven.toLocaleString('pt-BR') : '-', numeric: true },
              { text: formatLitersValue(row.liters), numeric: true },
              { text: row.litersPerKm ? `${row.litersPerKm.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} L/km` : '-', numeric: true },
              { text: row.kmPerLiter ? `${row.kmPerLiter.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} km/L` : '-', numeric: true },
              { text: formatCurrency(row.total), numeric: true },
              { text: row.costPerKm ? formatCurrency(row.costPerKm) : '-', numeric: true },
              { text: row.entry.fornecedor || row.supplier?.nome || '-' },
              createReportReceiptCell(row.entry.comprovanteUrl)
            ],
            tone: row.kmDriven ? '' : 'warning'
          })),
          emptyMessage: filters.vehicleId
            ? 'Nenhum abastecimento com KM encontrado para este veículo no período.'
            : 'Selecione um veículo ou ajuste o período para visualizar o consumo por KM.',
          footerNote: missingIntervals
            ? `${missingIntervals} registro(s) sem KM inicial anterior suficiente ficaram sem consumo calculado.`
            : ''
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
          const isGroup = isFinanceGroupEntry(entry);
          const children = isGroup ? getFinanceGroupChildren(entry) : [];
          const childSuppliers = children
            .map(child => child.fornecedor || 'Fornecedor não informado')
            .filter(Boolean);
          const key = isGroup
            ? `Agrupamento: ${childSuppliers.length ? Array.from(new Set(childSuppliers)).join(', ') : 'sem fornecedores detalhados'}`
            : String(entry.fornecedor || 'Fornecedor não informado');
          const current = supplierMap.get(key) || {
            name: key,
            total: 0,
            count: 0,
            type: '',
            latestDate: '',
            details: []
          };
          current.total += getFinanceNetTotal(entry);
          current.count += 1;
          current.latestDate = [current.latestDate, getFinanceEntryDate(entry)].filter(Boolean).sort().pop() || current.latestDate;
          if (!current.type) {
            const supplier = allSuppliers.find(item => item.nome === entry.fornecedor);
            current.type = isGroup ? 'Agrupamento' : (supplier?.tipoLabel || entry.kindLabel || '-');
          }
          if (isGroup) {
            current.details.push(...children.map(child => `${child.fornecedor || 'Fornecedor não informado'} ${formatCurrency(getFinanceTotal(child))}`));
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
              { text: item.name, note: item.details.length ? item.details.join(' | ') : '' },
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
        const alertCount = items.filter(item => item.maintenance.isAlert && !item.maintenance.linkedOrder).length;
        const openOsCount = items.filter(item => item.maintenance.linkedOrder && item.maintenance.linkedOrder.status !== 'fechada').length;
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
              : maintenance.linkedOrder
                ? `OS ${getOrderNumberLabel(maintenance.linkedOrder)} ${getOrderStatusUi(maintenance.linkedOrder.status).label.toLowerCase()}`
                : maintenance.remainingKm <= 0
                  ? 'Revisão vencida'
                  : maintenance.remainingKm <= 2000
                    ? 'Agendar revisão'
                    : 'No prazo';
            const tone = maintenance.currentKm === null
              ? 'neutral'
              : maintenance.linkedOrder
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
      const displayData = getReportDisplayData(reportData);
      if (!displayData.rows.length) {
        node.innerHTML = `<div class="report-results-empty">${escapeHtml(reportData.emptyMessage)}</div>`;
        return;
      }

      const headHtml = displayData.columns.map(column => `
        <th class="${column.numeric ? 'report-cell--numeric' : ''}" draggable="true" onclick="handleReportColumnHeaderClick(event, '${column.id}')" ondragstart="handleReportColumnDragStart(event, '${column.id}')" ondragend="handleReportColumnDragEnd(event)" ondragover="handleReportColumnDragOver(event)" ondragleave="handleReportColumnDragLeave(event)" ondrop="handleReportColumnDrop(event, '${column.id}')">
          <div class="report-head-wrap">
            <span>${escapeHtml(column.label)}</span>
            <span class="report-sort-indicator">${reportSortState.type === getReportFilters().type && reportSortState.columnId === column.id ? (reportSortState.direction === 'asc' ? '↑' : '↓') : ''}</span>
          </div>
        </th>
      `).join('');

      const rowsHtml = displayData.rows.map(row => `
        <tr>
          ${row.cells.map((cell, index) => `
            <td class="${displayData.columns[index]?.numeric || cell.numeric ? 'report-cell--numeric' : ''}">
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
        ${reportData.footerNote ? `<div class="report-results-note">${escapeHtml(reportData.footerNote)}</div>` : ''}
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
        case 'dueDate':
          return String(entry.dataVencimento || '');
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
      const quickSearch = normalizeSearchText(getContextualModuleSearchValue('financeiro', 'finance-filter-search'));
      const statusFilter = document.getElementById('finance-filter-status')?.value || '';
      const startFilter = document.getElementById('finance-filter-start')?.value || '';
      const endFilter = document.getElementById('finance-filter-end')?.value || '';

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
          const total = getFinanceTotal(entry);
          const haystack = normalizeSearchText([
            entry.fornecedor,
            entry.posto,
            entry.supplier,
            entry.nf,
            entry.notaFiscal,
            entry.numeroNota,
            entry.observacoes,
            entry.kindLabel,
            entry.fuelType,
            entry.km,
            entry.motorista,
            entry.dataVencimento,
            formatDate(entry.dataVencimento),
            getFinanceEntryDate(entry),
            formatDate(getFinanceEntryDate(entry)),
            getFinanceEntryStatusLabel(entry),
            total,
            formatCurrency(total),
            entry.orderId,
            entry.os,
            entry.numeroOs,
            order ? `OS ${getOrderNumberLabel(order)}` : '',
            vehicle ? buildVehicleSearchValue(vehicle) : '',
            entry.veiculo,
            entry.vehicle,
            entry.placa,
            entry.modelo,
            entry.frota
          ].join(' '));
          return haystack.includes(quickSearch);
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
        .map(supplier => `<option value="${supplier.id}" ${isEntityActive(supplier) ? '' : 'disabled'}>${escapeHtml(supplier.nome)}${isEntityActive(supplier) ? '' : ' (inativo)'}</option>`)
        .join('');
      const supplierSearchItems = getActiveSortedSuppliers(allSuppliers
        .filter(supplier => entryType === 'combustivel' ? supplier.tipo === 'posto' : supplier.tipo !== 'posto'));
      const supplierSearchOptions = supplierSearchItems
        .map(supplier => `<option value="${escapeHtml(supplier.nome)}" label="${escapeHtml([supplier.tipoLabel, supplier.documento].filter(Boolean).join(' - '))}"></option>`)
        .join('');
      const openOrders = getOpenOrdersSorted();
      const orderOptions = openOrders
        .map(order => `<option value="${escapeHtml(getOrderAutocompleteLabel(order))}"></option>`)
        .join('');
      const sortedVehicles = getActiveSortedVehicles();
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
              <input class="soft-input w-full" id="finance-litros" type="text" inputmode="decimal" placeholder="Ex: 120,500">
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
                ${getSortedDrivers().map(driver => `<option value="${driver.id}" ${isEntityActive(driver) ? '' : 'disabled'}>${escapeHtml(driver.nome)}${isEntityActive(driver) ? '' : ' (inativo)'}</option>`).join('')}
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
        <div class="field-wrap full finance-group-history">
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
        <div class="field-wrap full finance-group-summary-card">
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
      syncFinanceImportSelects();
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
      const costKmFilters = getHomeCostPerKmFilters();
      const vehicleStats = getVehicleCostStats(costKmFilters).filter(item => item.entries > 0);
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
        if (!vehicleStats.length) {
          costTableNode.innerHTML = '<div class="home-km-empty">Nenhum abastecimento distribuído em OS para calcular custo por KM.</div>';
        } else {
          const rows = vehicleStats.slice(0, 9);
          const maxCostPerKm = Math.max(...rows.map(item => item.costPerKm), 0);
          costTableNode.innerHTML = rows.map((item) => {
            const percent = maxCostPerKm > 0 ? Math.max((item.costPerKm / maxCostPerKm) * 100, item.costPerKm > 0 ? 10 : 3) : 3;
            const tone = getCostPerKmTone(item.costPerKm);
            return `
              <button type="button" class="home-monthly-bar-item home-km-bar-item home-km-bar-item--${tone}" onclick="openOrdersForVehicle('${item.vehicleId}')" title="Ver OS de ${escapeHtml(item.frota)} - ${escapeHtml(item.placa)}">
                <div class="home-monthly-bar-value">${escapeHtml(formatCurrency(item.costPerKm))}</div>
                <div class="home-monthly-bar-track home-km-bar-track">
                  <div class="home-monthly-bar-fill home-km-bar-fill" style="height:${percent.toFixed(2)}%;"></div>
                </div>
                <div class="home-monthly-bar-label">
                  <strong>${escapeHtml(item.frota)}</strong>
                  <span>${escapeHtml(item.placa)}</span>
                  <small>${escapeHtml(formatCurrency(item.totalCost))} / ${Number(item.totalKm || 0).toLocaleString('pt-BR')} km</small>
                </div>
              </button>
            `;
          }).join('');
        }
      }
      if (financeStatusTableNode) {
        financeStatusTableNode.innerHTML = renderDashboardTableRows(
          financeStatusItems,
          item => `
            <button type="button" class="home-finance-status-card home-finance-status-card--${item.group}" onclick="openFinanceStatusFromHome('${item.group}')">
              <div>
                <p>${escapeHtml(item.label)}</p>
                <span>${item.count} lançamento(s)</span>
              </div>
              <strong>${escapeHtml(formatCurrency(item.total))}</strong>
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
              <button type="button" class="home-insurance-row insurance-alert-row--${alertTone}" onclick="openVehicleFromHome('${item.id}')">
                <div>
                  <p>${escapeHtml(item.placa)} ${escapeHtml(item.modelo)}</p>
                  <span>Frota ${escapeHtml(item.numeroFrota || '-')}</span>
                </div>
                <strong>${escapeHtml(formatDate(item.seguroVencimento))}</strong>
                <span class="home-insurance-status">${escapeHtml(getInsuranceAlertLabel(item.days))}</span>
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
            const remainingLabel = maintenance.currentKm === null
              ? 'Aguardando KM'
              : `${maintenance.remainingKm.toLocaleString('pt-BR')} km`;
            const shortcutAction = maintenance.linkedOrder
              ? `openOrderFromHome('${maintenance.linkedOrder.id}')`
              : `openVehicleFromHome('${vehicle.id}')`;
            const linkedStatus = maintenance.linkedOrder
              ? getOrderStatusUi(maintenance.linkedOrder.status).label
              : '';
            const suggestedStatus = maintenance.suggestedOrder
              ? getOrderStatusUi(maintenance.suggestedOrder.status).label
              : '';

            return `
              <div class="home-maintenance-row home-maintenance-row--${maintenance.linkedOrder ? 'open' : maintenance.isAlert ? 'alert' : 'ok'} ${maintenance.isAlert && maintenance.suggestedOrder ? 'home-maintenance-row--has-suggestion' : ''}" role="button" tabindex="0" onclick="${shortcutAction}" onkeydown="handleDashboardShortcutKey(event, '${maintenance.linkedOrder ? 'openOrderFromHome' : 'openVehicleFromHome'}', '${maintenance.linkedOrder ? maintenance.linkedOrder.id : vehicle.id}')">
                <div>
                  <p>${escapeHtml(vehicle.numeroFrota || '-')} - ${escapeHtml(vehicle.placa || '-')}</p>
                  <span>${escapeHtml(vehicle.modelo || 'Veículo')}</span>
                </div>
                <div class="home-maintenance-metrics">
                  <span>KM atual <strong>${escapeHtml(currentKmLabel)}</strong></span>
                  <span>Faltam <strong>${escapeHtml(remainingLabel)}</strong></span>
                </div>
                ${maintenance.linkedOrder
                  ? `<span class="home-maintenance-pill">OS ${escapeHtml(getOrderNumberLabel(maintenance.linkedOrder))} • ${escapeHtml(linkedStatus)}</span>`
                  : maintenance.isAlert
                    ? `<div class="home-maintenance-actions">
                        <button type="button" class="home-maintenance-btn" onclick="event.stopPropagation(); openRevisionOrderForVehicle('${vehicle.id}')">Abrir OS</button>
                        ${maintenance.suggestedOrder ? `
                          <span class="home-maintenance-suggestion">Sugestão: OS ${escapeHtml(getOrderNumberLabel(maintenance.suggestedOrder))} • ${escapeHtml(suggestedStatus)}</span>
                          <button type="button" class="home-maintenance-link-btn" onclick="event.stopPropagation(); linkSuggestedMaintenanceOrder('${vehicle.id}', '${maintenance.suggestedOrder.id}')">Vincular OS</button>
                        ` : ''}
                      </div>`
                    : `<span class="home-maintenance-pill">No prazo</span>`}
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
      const dateContextNode = document.getElementById('report-filter-date-context');
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
      if (dateContextNode) {
        dateContextNode.textContent = getReportDateContextLabel(filters.type);
      }
      syncReportDateBounds();
      renderReportSummary(reportData.summary);
      renderReportColumnsPanel(reportData);
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

    const FUEL_SHEET_STORAGE_KEY = 'wefrotas:fuel-register-sheet:v1';
    const FUEL_SHEET_PAGE_SIZE = 100;
    const FUEL_SHEET_DEFAULT_COLUMNS = ['date', 'vehicle', 'plate', 'km', 'liters', 'value', 'driver', 'supplier'];
    const FUEL_SHEET_ALL_COLUMNS = [
      'date',
      'vehicle',
      'plate',
      'km',
      'liters',
      'value',
      'driver',
      'supplier',
      'fuelType',
      'city',
      'createdDate',
      'createdTime',
      'documentNumber',
      'receipt',
      'status',
      'unitValue',
      'order',
      'notes'
    ];
    let fuelSheetPreferences = loadFuelSheetPreferences();
    let fuelSheetDraggedColumn = '';

    function getFuelSheetColumnDefinitions() {
      return {
        date: {
          label: 'Data abastecimento',
          type: 'date',
          width: 168,
          value: row => getFinanceEntryDate(row.entry),
          display: value => formatDate(value)
        },
        vehicle: {
          label: 'Veículo',
          type: 'text',
          width: 220,
          value: row => [row.vehicle?.numeroFrota, row.vehicle?.modelo].filter(Boolean).join(' ') || row.vehicleLabel || ''
        },
        plate: {
          label: 'Placa',
          type: 'text',
          width: 140,
          value: row => row.vehicle?.placa || row.entry.placa || ''
        },
        km: {
          label: 'KM',
          type: 'number',
          width: 120,
          value: row => Number(row.entry.km || 0) || 0,
          display: value => value ? Number(value).toLocaleString('pt-BR') : '-'
        },
        liters: {
          label: 'Litros',
          type: 'number',
          width: 125,
          value: row => parseDecimalInputValue(row.entry.litros),
          display: value => formatLitersValue(value)
        },
        value: {
          label: 'Valor',
          type: 'currency',
          width: 140,
          value: row => getFinanceTotal(row.entry),
          display: value => formatCurrency(value)
        },
        driver: {
          label: 'Motorista',
          type: 'text',
          width: 210,
          value: row => row.driver?.nome || row.entry.motorista || row.entry.driverName || ''
        },
        supplier: {
          label: 'Posto',
          type: 'text',
          width: 230,
          value: row => row.entry.fornecedor || row.supplier?.nome || ''
        },
        fuelType: {
          label: 'Tipo de combustível',
          type: 'text',
          width: 190,
          value: row => row.entry.fuelType || ''
        },
        city: {
          label: 'Cidade',
          type: 'text',
          width: 170,
          value: row => row.entry.cidade || row.entry.city || ''
        },
        createdDate: {
          label: 'Data de entrada',
          type: 'date',
          width: 165,
          value: row => String(row.entry.createdAt || '').slice(0, 10),
          display: value => formatDate(value)
        },
        createdTime: {
          label: 'Hora',
          type: 'text',
          width: 110,
          value: row => {
            const date = new Date(row.entry.createdAt || '');
            return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          }
        },
        documentNumber: {
          label: 'Nº documento',
          type: 'text',
          width: 150,
          value: row => row.entry.nf || row.entry.documentNumber || row.entry.numeroNota || ''
        },
        receipt: {
          label: 'Comprovante',
          type: 'text',
          width: 150,
          value: row => row.entry.comprovanteUrl || '',
          display: (value, row) => value
            ? `<button type="button" class="documents-link-btn" onclick="event.stopPropagation(); openFinanceReceiptByEntryId('${row.entry.id}')">Ver comprovante</button>`
            : '-'
        },
        status: {
          label: 'Status',
          type: 'text',
          width: 150,
          value: row => getFinanceEntryStatusLabel(row.entry)
        },
        unitValue: {
          label: 'Valor por litro',
          type: 'currency',
          width: 155,
          value: row => {
            const liters = parseDecimalInputValue(row.entry.litros);
            return liters ? getFinanceTotal(row.entry) / liters : 0;
          },
          display: value => value ? formatCurrency(value) : '-'
        },
        order: {
          label: 'OS',
          type: 'text',
          width: 130,
          value: row => row.order ? `OS ${getOrderNumberLabel(row.order)}` : ''
        },
        notes: {
          label: 'Observações',
          type: 'text',
          width: 260,
          value: row => row.entry.observacoes || ''
        }
      };
    }

    function getDefaultFuelSheetPreferences() {
      return {
        order: [...FUEL_SHEET_ALL_COLUMNS],
        visible: FUEL_SHEET_ALL_COLUMNS.reduce((acc, key) => {
          acc[key] = FUEL_SHEET_DEFAULT_COLUMNS.includes(key);
          return acc;
        }, {}),
        widths: {},
        pinned: [],
        filters: {},
        sort: null,
        page: 1
      };
    }

    function loadFuelSheetPreferences() {
      const defaults = getDefaultFuelSheetPreferences();
      try {
        const saved = JSON.parse(localStorage.getItem(FUEL_SHEET_STORAGE_KEY) || 'null');
        if (!saved || typeof saved !== 'object') return defaults;
        return {
          ...defaults,
          ...saved,
          order: Array.from(new Set([...(saved.order || []), ...FUEL_SHEET_ALL_COLUMNS])).filter(key => FUEL_SHEET_ALL_COLUMNS.includes(key)),
          visible: { ...defaults.visible, ...(saved.visible || {}) },
          widths: { ...(saved.widths || {}) },
          pinned: (saved.pinned || []).filter(key => FUEL_SHEET_ALL_COLUMNS.includes(key)),
          filters: { ...(saved.filters || {}) }
        };
      } catch (error) {
        return defaults;
      }
    }

    function saveFuelSheetPreferences() {
      localStorage.setItem(FUEL_SHEET_STORAGE_KEY, JSON.stringify(fuelSheetPreferences));
    }

    function getFuelSheetRows() {
      const rows = [];
      const seen = new Set();
      allFinanceEntries.forEach((entry) => {
        if (isFuelEntry(entry) && !seen.has(entry.id)) {
          rows.push(buildFuelSheetRow(entry));
          seen.add(entry.id);
        }
        if (isFuelGroupEntry(entry)) {
          getFuelGroupChildren(entry).forEach((child) => {
            if (seen.has(child.id)) return;
            rows.push(buildFuelSheetRow({
              ...child,
              orderId: child.orderId || entry.orderId || '',
              dataVencimento: child.dataVencimento || entry.dataVencimento || '',
              workflowStatus: child.workflowStatus || entry.workflowStatus || ''
            }));
            seen.add(child.id);
          });
        }
      });
      return rows;
    }

    function buildFuelSheetRow(entry) {
      const vehicle = allVehicles.find(item => item.id === getEntryVehicleId(entry)) || null;
      const supplier = allSuppliers.find(item => item.id === entry.supplierId) || null;
      const driver = allDrivers.find(item => item.id === entry.driverId) || null;
      const order = getFinanceDocumentOrder(entry);
      return {
        id: entry.id,
        entry,
        vehicle,
        supplier,
        driver,
        order,
        vehicleLabel: vehicle ? getVehicleLabel(vehicle.id) : ''
      };
    }

    function getVisibleFuelSheetColumns() {
      return fuelSheetPreferences.order.filter(key => fuelSheetPreferences.visible[key]);
    }

    function getFuelSheetColumnWidth(columnId) {
      const definitions = getFuelSheetColumnDefinitions();
      return Number(fuelSheetPreferences.widths[columnId] || definitions[columnId]?.width || 150);
    }

    function getFuelSheetRawValue(row, columnId) {
      const definition = getFuelSheetColumnDefinitions()[columnId];
      return definition ? definition.value(row) : '';
    }

    function getFuelSheetDisplayValue(row, columnId) {
      const definition = getFuelSheetColumnDefinitions()[columnId];
      const value = getFuelSheetRawValue(row, columnId);
      if (!definition) return escapeHtml(value);
      if (definition.display) return definition.display(value, row);
      return escapeHtml(value || '-');
    }

    function normalizeFuelSheetComparable(value) {
      return normalizeSearchText(String(value || ''));
    }

    function isFuelSheetFilterActive(filter) {
      if (!filter) return false;
      if (filter.search) return true;
      if (Array.isArray(filter.selected) && filter.selected.length) return true;
      if (filter.operator) return true;
      return false;
    }

    function applyFuelSheetFilters(rows) {
      const definitions = getFuelSheetColumnDefinitions();
      return rows.filter(row => Object.entries(fuelSheetPreferences.filters || {}).every(([columnId, filter]) => {
        if (!isFuelSheetFilterActive(filter)) return true;
        const definition = definitions[columnId];
        if (!definition) return true;
        const value = getFuelSheetRawValue(row, columnId);
        if (definition.type === 'date') {
          const textValue = String(value || '');
          if (!filter.operator) return true;
          if (filter.operator === 'eq') return textValue === filter.value;
          if (filter.operator === 'before') return textValue && textValue < filter.value;
          if (filter.operator === 'after') return textValue && textValue > filter.value;
          if (filter.operator === 'between') return textValue && (!filter.from || textValue >= filter.from) && (!filter.to || textValue <= filter.to);
          return true;
        }
        if (definition.type === 'number' || definition.type === 'currency') {
          const numericValue = Number(value || 0);
          const first = Number(filter.value || 0);
          const from = Number(filter.from || 0);
          const to = Number(filter.to || 0);
          if (!filter.operator) return true;
          if (filter.operator === 'eq') return numericValue === first;
          if (filter.operator === 'gt') return numericValue > first;
          if (filter.operator === 'lt') return numericValue < first;
          if (filter.operator === 'between') return numericValue >= from && numericValue <= to;
          return true;
        }
        const normalizedValue = normalizeFuelSheetComparable(value);
        if (filter.search && !normalizedValue.includes(normalizeFuelSheetComparable(filter.search))) return false;
        if (Array.isArray(filter.selected) && filter.selected.length) {
          return filter.selected.map(normalizeFuelSheetComparable).includes(normalizedValue);
        }
        return true;
      }));
    }

    function applyFuelSheetSort(rows) {
      const sort = fuelSheetPreferences.sort;
      if (!sort?.columnId || !sort.direction) return rows;
      const definition = getFuelSheetColumnDefinitions()[sort.columnId];
      if (!definition) return rows;
      return rows.slice().sort((a, b) => {
        const aValue = getFuelSheetRawValue(a, sort.columnId);
        const bValue = getFuelSheetRawValue(b, sort.columnId);
        let result = 0;
        if (definition.type === 'number' || definition.type === 'currency') {
          result = Number(aValue || 0) - Number(bValue || 0);
        } else {
          result = String(aValue || '').localeCompare(String(bValue || ''), 'pt-BR', { numeric: true, sensitivity: 'base' });
        }
        return sort.direction === 'desc' ? -result : result;
      });
    }

    function getFilteredFuelSheetRows() {
      return applyFuelSheetSort(applyFuelSheetFilters(getFuelSheetRows()));
    }

    function renderFuelSheetTotals(rows) {
      const totalRecordsNode = document.getElementById('fuel-sheet-total-records');
      const totalLitersNode = document.getElementById('fuel-sheet-total-liters');
      const totalValueNode = document.getElementById('fuel-sheet-total-value');
      const litersTotal = rows.reduce((sum, row) => sum + parseDecimalInputValue(row.entry.litros), 0);
      const valueTotal = rows.reduce((sum, row) => sum + getFinanceTotal(row.entry), 0);
      if (totalRecordsNode) totalRecordsNode.textContent = rows.length.toLocaleString('pt-BR');
      if (totalLitersNode) totalLitersNode.textContent = `${litersTotal.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} L`;
      if (totalValueNode) totalValueNode.textContent = formatCurrency(valueTotal);
    }

    function getFuelSheetPinnedLeft(columnId, visibleColumns) {
      if (!fuelSheetPreferences.pinned.includes(columnId)) return '';
      const left = visibleColumns
        .slice(0, visibleColumns.indexOf(columnId))
        .filter(key => fuelSheetPreferences.pinned.includes(key))
        .reduce((sum, key) => sum + getFuelSheetColumnWidth(key), 0);
      return `left:${left}px;`;
    }

    function renderFuelSheetHead(visibleColumns) {
      const head = document.getElementById('fuel-sheet-head');
      if (!head) return;
      const definitions = getFuelSheetColumnDefinitions();
      head.innerHTML = `
        <tr>
          ${visibleColumns.map((columnId) => {
            const definition = definitions[columnId];
            const width = getFuelSheetColumnWidth(columnId);
            const isPinned = fuelSheetPreferences.pinned.includes(columnId);
            const hasFilter = isFuelSheetFilterActive(fuelSheetPreferences.filters[columnId]);
            const sort = fuelSheetPreferences.sort?.columnId === columnId ? fuelSheetPreferences.sort.direction : '';
            return `
              <th
                class="${isPinned ? 'is-pinned' : ''}"
                draggable="true"
                data-column-id="${columnId}"
                style="width:${width}px;min-width:${width}px;${getFuelSheetPinnedLeft(columnId, visibleColumns)}"
                ondragstart="handleFuelHeaderDragStart(event, '${columnId}')"
                ondragover="event.preventDefault()"
                ondrop="handleFuelHeaderDrop(event, '${columnId}')"
              >
                <button type="button" class="documents-head-btn" onclick="openFuelColumnMenu(event, '${columnId}')">
                  <span>${escapeHtml(definition.label)}</span>
                  <span class="documents-head-icons">
                    ${isPinned ? '<svg class="is-active" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 17v5"/><path stroke-linecap="round" stroke-linejoin="round" d="M5 17h14l-2-6V4H7v7l-2 6z"/></svg>' : ''}
                    ${sort ? (sort === 'asc'
                      ? '<svg class="is-active" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m6 15 6-6 6 6"/></svg>'
                      : '<svg class="is-active" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6"/></svg>'
                    ) : ''}
                    <svg class="${hasFilter ? 'is-active' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 5h16l-6 7v4l-4 2v-6L4 5z"/></svg>
                  </span>
                </button>
                <span class="documents-column-resizer" onmousedown="startFuelColumnResize(event, '${columnId}')"></span>
              </th>
            `;
          }).join('')}
        </tr>
      `;
    }

    function renderFuelSheetBody(rows, visibleColumns) {
      const body = document.getElementById('fuel-sheet-body');
      if (!body) return;
      const pageCount = Math.max(1, Math.ceil(rows.length / FUEL_SHEET_PAGE_SIZE));
      fuelSheetPreferences.page = Math.min(Math.max(1, Number(fuelSheetPreferences.page || 1)), pageCount);
      const start = (fuelSheetPreferences.page - 1) * FUEL_SHEET_PAGE_SIZE;
      const pageRows = rows.slice(start, start + FUEL_SHEET_PAGE_SIZE);
      if (!pageRows.length) {
        body.innerHTML = `<tr><td colspan="${Math.max(visibleColumns.length, 1)}" class="documents-empty-cell">Nenhum abastecimento encontrado.</td></tr>`;
        return;
      }
      body.innerHTML = pageRows.map(row => `
        <tr ondblclick="openFinanceEntryFromDocuments('${row.entry.id}')">
          ${visibleColumns.map((columnId) => {
            const width = getFuelSheetColumnWidth(columnId);
            const isPinned = fuelSheetPreferences.pinned.includes(columnId);
            return `
              <td
                class="${isPinned ? 'is-pinned' : ''}"
                style="width:${width}px;min-width:${width}px;${getFuelSheetPinnedLeft(columnId, visibleColumns)}"
              >
                ${getFuelSheetDisplayValue(row, columnId)}
              </td>
            `;
          }).join('')}
        </tr>
      `).join('');
    }

    function renderFuelSheetPagination(rows) {
      const node = document.getElementById('fuel-sheet-pagination');
      if (!node) return;
      const pageCount = Math.max(1, Math.ceil(rows.length / FUEL_SHEET_PAGE_SIZE));
      const start = rows.length ? ((fuelSheetPreferences.page - 1) * FUEL_SHEET_PAGE_SIZE) + 1 : 0;
      const end = Math.min(rows.length, fuelSheetPreferences.page * FUEL_SHEET_PAGE_SIZE);
      node.innerHTML = `
        <span>${start}-${end} de ${rows.length.toLocaleString('pt-BR')} registros</span>
        <div>
          <button type="button" onclick="setFuelSheetPage(${fuelSheetPreferences.page - 1})" ${fuelSheetPreferences.page <= 1 ? 'disabled' : ''}>Anterior</button>
          <strong>${fuelSheetPreferences.page} / ${pageCount}</strong>
          <button type="button" onclick="setFuelSheetPage(${fuelSheetPreferences.page + 1})" ${fuelSheetPreferences.page >= pageCount ? 'disabled' : ''}>Próxima</button>
        </div>
      `;
    }

    function getCentralPendingRecordId(record) {
      return String(record?.$id || record?.id || record?.protocolo || '');
    }

    function getCentralPendingRecordType(record) {
      const type = normalizeComparableText(record?.tipo || record?.type || '');
      if (type.includes('servico')) return 'Serviço';
      if (type.includes('rapido')) return 'Abastecimento rápido';
      return 'Abastecimento';
    }

    function getCentralPendingSupplier(record) {
      return record?.posto || record?.fornecedor || record?.supplier || '-';
    }

    function getCentralPendingDriverVehicleLabel(record) {
      const driverName = String(record?.motorista || record?.driver || '-').trim() || '-';
      const firstName = driverName === '-' ? '-' : driverName.split(/\s+/)[0];
      const directPlate = String(
        record?.placa
        || record?.vehiclePlate
        || record?.veiculoPlaca
        || record?.vehicle?.placa
        || record?.vehicle?.plate
        || ''
      ).trim();
      if (directPlate) return `${firstName} - ${directPlate}`;

      const vehicleId = String(record?.vehicleId || record?.veiculoId || record?.vehicle?.id || '').trim();
      let vehicle = vehicleId ? allVehicles.find(item => String(item?.id || '') === vehicleId) : null;
      if (!vehicle && driverName !== '-') {
        const normalizedDriver = normalizeComparableText(driverName);
        const driver = allDrivers.find(item => normalizeComparableText(item?.nome || item?.name || '') === normalizedDriver);
        const linkedIds = Array.isArray(driver?.vehicleIds)
          ? driver.vehicleIds.map(String)
          : (driver?.vehicleId ? [String(driver.vehicleId)] : []);
        vehicle = allVehicles.find(item => linkedIds.includes(String(item?.id || '')))
          || allVehicles.find(item => String(item?.motoristaId || item?.driverId || '') === String(driver?.id || ''));
      }
      const linkedPlate = String(vehicle?.placa || vehicle?.plate || '').trim();
      return linkedPlate ? `${firstName} - ${linkedPlate}` : firstName;
    }

    function getCentralPendingValue(record) {
      const numericValue = Number(record?.valorNumero ?? record?.valor ?? 0);
      if (Number.isFinite(numericValue) && numericValue > 0) return formatCurrency(numericValue);
      return record?.valor ? escapeHtml(record.valor) : '-';
    }

    function getCentralPendingDate(record) {
      const dateValue = record?.data || record?.dataBr || String(record?.criadoEm || '').slice(0, 10);
      const timeValue = record?.hora || '';
      return `${formatDate(dateValue)}${timeValue ? `<small>${escapeHtml(timeValue)}</small>` : ''}`;
    }

    function normalizeCentralReceiptIdentity(value) {
      return String(value || '').trim().replace(/[?#].*$/, '').toLowerCase();
    }

    function getCentralRecordIsoDate(record, imported = null) {
      const rawDate = String(record?.data || imported?.dataIso || imported?.dataBr || '').trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate.slice(0, 10))) return rawDate.slice(0, 10);
      return parseBrazilianDateToIso(rawDate);
    }

    function findCentralFinanceDuplicate(record, importedData = null) {
      const rowId = getCentralPendingRecordId(record);
      const imported = importedData || parseImportedCentralMessage(buildCentralPendingMessage(record));
      const receiptIdentity = normalizeCentralReceiptIdentity(record?.comprovanteUrl || imported?.comprovanteUrl);
      const expectedDate = getCentralRecordIsoDate(record, imported);
      const expectedTotal = Math.round((getCentralRecordTotal(record) || parseCurrencyInputValue(imported?.valor || '')) * 100);
      const expectedSupplier = normalizeComparableText(imported?.fornecedor || record?.fornecedor || record?.posto || '');

      return allFinanceEntries.find((entry) => {
        if (rowId && String(entry?.centralRecordId || '') === rowId) return true;
        const entryReceipt = normalizeCentralReceiptIdentity(entry?.comprovanteUrl);
        if (receiptIdentity && entryReceipt && receiptIdentity === entryReceipt) return true;
        if (!expectedSupplier || !expectedDate || !expectedTotal || isFuelEntry(entry)) return false;
        const entrySupplier = normalizeComparableText(entry?.fornecedor || '');
        const supplierMatches = entrySupplier === expectedSupplier
          || entrySupplier.includes(expectedSupplier)
          || expectedSupplier.includes(entrySupplier);
        return supplierMatches
          && Math.round(getFinanceTotal(entry) * 100) === expectedTotal
          && getFinanceEntryDate(entry) === expectedDate;
      }) || null;
    }

    function linkFinanceEntryToCentralRecord(entry, record) {
      const rowId = getCentralPendingRecordId(record);
      if (!entry || !rowId || String(entry.centralRecordId || '') === rowId) return false;
      entry.centralRecordId = rowId;
      saveToLocalStorage();
      return true;
    }

    function repairCentralApprovedStatus(record, entry) {
      const rowId = getCentralPendingRecordId(record);
      if (!rowId || !entry || centralStatusRepairInProgress.has(rowId)) return;
      centralStatusRepairInProgress.add(rowId);
      linkFinanceEntryToCentralRecord(entry, record);
      const approvalData = {
        status: 'aprovado',
        importadoEm: record?.importadoEm || entry?.createdAt || new Date().toISOString(),
        lancamentoFinanceiroId: entry.id,
        resolucao: 'Aprovado e lançado no financeiro.'
      };
      setCentralPendingRecordStatus(record, approvalData)
        .catch(error => console.warn('Não foi possível reparar o status aprovado da Central.', error))
        .finally(() => centralStatusRepairInProgress.delete(rowId));
    }

    function getCentralPendingStatus(record) {
      const status = normalizeComparableText(record?.status || 'pendente');
      if (status.includes('import') || status.includes('aprov')) return { label: 'Aprovado', className: 'approved' };
      if (status.includes('rejeit')) return { label: 'Rejeitado', className: 'error' };
      if (status.includes('erro')) return { label: 'Erro', className: 'error' };
      if (status.includes('aprov')) return { label: 'Aprovado', className: 'approved' };
      return { label: 'Pendente', className: 'pending' };
    }

    function matchesCentralPendingStatus(record, filter) {
      const normalizedFilter = ['todos', 'pendente', 'aprovado', 'rejeitado'].includes(filter) ? filter : 'todos';
      if (normalizedFilter === 'todos') return true;
      const className = getCentralPendingStatus(record).className;
      if (normalizedFilter === 'pendente') return className === 'pending';
      if (normalizedFilter === 'aprovado') return className === 'approved' || className === 'imported';
      return className === 'error';
    }

    function buildCentralPendingMessage(record) {
      if (record?.mensagemWhatsapp) return String(record.mensagemWhatsapp);
      const type = normalizeComparableText(record?.tipo || '');
      if (type.includes('servico')) {
        return [
          'REGISTRO DE SERVIÇOS',
          `Motorista: ${record?.motorista || ''}`,
          `Fornecedor: ${record?.fornecedor || record?.posto || ''}`,
          `Tipo do serviço: ${record?.tipoServico || ''}`,
          `Valor: ${record?.valor || getCentralPendingValue(record)}`,
          `Data/Hora: ${record?.data || ''}${record?.hora ? ` ${record.hora}` : ''}`,
          `KM: ${record?.km || ''}`,
          `Comprovante: ${record?.comprovanteUrl || ''}`
        ].join('\n');
      }
      return [
        'COMPROVANTE DE ABASTECIMENTO',
        `Motorista: ${record?.motorista || ''}`,
        `Cidade: ${record?.cidade || ''}`,
        `Posto: ${record?.posto || record?.fornecedor || ''}`,
        `Data/Hora: ${record?.data || ''}${record?.hora ? ` ${record.hora}` : ''}`,
        `KM: ${record?.km || ''}`,
        `Litros: ${record?.litros || ''}`,
        `Valor: ${record?.valor || ''}`,
        `Combustível: ${record?.tipoCombustivel || ''}`,
        `Comprovante: ${record?.comprovanteUrl || ''}`
      ].join('\n');
    }

    function getCentralPendingSortedRows() {
      loadCentralPendingFilters();
      const rows = [...centralPendingRecords]
        .filter(record => normalizeComparableText(record?.workspaceId || '') === normalizeComparableText(window.WeFrotasBackend?.getOrganizationContext?.().workspaceId || window.WeFrotasBackend?.config?.companyId || 'covre-e-cia'))
        .filter(record => matchesCentralPendingStatus(record, centralPendingStatusFilter))
        .filter(record => {
          const date = getCentralRecordIsoDate(record);
          return (!centralPendingDateStart || date >= centralPendingDateStart) && (!centralPendingDateEnd || date <= centralPendingDateEnd);
        })
        .filter(record => {
          if (!centralPendingSearchFilter) return true;
          const haystack = normalizeSearchText([
            getCentralPendingRecordId(record),
            record?.protocolo,
            record?.motorista,
            record?.posto,
            record?.fornecedor,
            record?.cidade,
            record?.tipo,
            record?.tipoServico,
            record?.tipoCombustivel,
            record?.veiculo,
            record?.modelo,
            record?.placa,
            record?.frota,
            record?.km,
            record?.nf,
            record?.notaFiscal,
            record?.os,
            record?.numeroOs,
            getCentralPendingDate(record),
            getCentralRecordIsoDate(record),
            getCentralPendingValue(record),
            getCentralPendingStatus(record).label,
            record?.status,
            record?.resolucao,
            record?.dataVencimento,
            record?.vencimento,
            record?.observacoes,
            record?.mensagemWhatsapp
          ].join(' '));
          const terms = centralPendingSearchFilter.split(/\s+/).map(normalizeSearchText).filter(Boolean);
          return terms.every(term => haystack.includes(term));
        })
        .filter(record => {
          if (!centralPendingValueFilter) return true;
          const expected = parseCurrencyInputValue(centralPendingValueFilter);
          const total = getCentralRecordTotal(record);
          return expected > 0
            ? String(total).includes(String(expected)) || Math.abs(total - expected) < 0.01
            : normalizeSearchText(record?.valor || total).includes(normalizeSearchText(centralPendingValueFilter));
        })
        .filter(record => !centralPendingVehicleFilter || normalizeSearchText([
          record?.veiculo,
          record?.modelo,
          record?.placa,
          record?.frota,
          record?.vehicle
        ].join(' ')).includes(centralPendingVehicleFilter))
        .filter(record => !centralPendingSupplierFilter || normalizeSearchText([
          record?.posto,
          record?.fornecedor,
          record?.supplier
        ].join(' ')).includes(centralPendingSupplierFilter))
        .filter(record => !centralPendingOrderFilter || normalizeSearchText([
          record?.os,
          record?.numeroOs,
          record?.orderNumber,
          record?.ordemServico
        ].join(' ')).includes(centralPendingOrderFilter))
        .filter(record => !centralPendingNfFilter || normalizeSearchText([
          record?.nf,
          record?.notaFiscal,
          record?.numeroNota
        ].join(' ')).includes(centralPendingNfFilter))
        .filter(record => {
          const dueDate = String(record?.dataVencimento || record?.vencimento || '').slice(0, 10);
          if ((centralPendingDueStart || centralPendingDueEnd) && !dueDate) return false;
          return (!centralPendingDueStart || dueDate >= centralPendingDueStart)
            && (!centralPendingDueEnd || dueDate <= centralPendingDueEnd);
        });
      const direction = centralPendingSortState.direction === 'asc' ? 1 : -1;
      return rows.sort((a, b) => {
        const statusPriority = { pending: 0, approved: 1, imported: 1, error: 2 };
        const priority = record => statusPriority[getCentralPendingStatus(record).className] ?? 2;
        const priorityDifference = priority(a) - priority(b);
        if (priorityDifference !== 0) return priorityDifference;
        const getValue = (record) => {
          switch (centralPendingSortState.key) {
            case 'type': return getCentralPendingRecordType(record);
            case 'driver': return record?.motorista || '';
            case 'supplier': return getCentralPendingSupplier(record);
            case 'km': {
              const rawKm = String(record?.km || '').trim();
              if (/^\d{1,3}(\.\d{3})+$/.test(rawKm)) return Number(rawKm.replace(/\./g, '')) || 0;
              return parseDecimalInputValue(rawKm);
            }
            case 'value': return getCentralRecordTotal(record);
            case 'status': return getCentralPendingStatus(record).label;
            case 'date':
            default: return `${getCentralRecordIsoDate(record)} ${record?.hora || ''}`;
          }
        };
        const aValue = getValue(a);
        const bValue = getValue(b);
        const comparison = typeof aValue === 'number' || typeof bValue === 'number'
          ? Number(aValue || 0) - Number(bValue || 0)
          : String(aValue || '').localeCompare(String(bValue || ''), 'pt-BR', { numeric: true, sensitivity: 'base' });
        if (comparison !== 0) return comparison * direction;
        return `${getCentralRecordIsoDate(b)} ${b?.hora || ''}`.localeCompare(`${getCentralRecordIsoDate(a)} ${a?.hora || ''}`);
      });
    }

    function loadCentralPendingFilters() {
      if (centralPendingFiltersLoaded) return;
      centralPendingFiltersLoaded = true;
      try {
        const saved = JSON.parse(localStorage.getItem(CENTRAL_PENDING_FILTERS_KEY) || '{}');
        centralPendingStatusFilter = ['todos', 'pendente', 'aprovado', 'rejeitado'].includes(saved.status) ? saved.status : 'todos';
        centralPendingDateStart = centralPendingCalendarIso(parseCentralPendingCalendarDate(saved.start));
        centralPendingDateEnd = centralPendingCalendarIso(parseCentralPendingCalendarDate(saved.end));
        if (centralPendingDateEnd && (!centralPendingDateStart || centralPendingDateEnd < centralPendingDateStart)) centralPendingDateEnd = '';
        centralPendingSearchFilter = normalizeComparableText(saved.search || '');
        centralPendingValueFilter = '';
        centralPendingVehicleFilter = '';
        centralPendingSupplierFilter = '';
        centralPendingOrderFilter = '';
        centralPendingNfFilter = '';
        centralPendingDueStart = '';
        centralPendingDueEnd = '';
        // Start the new priority ordering by newest date, not a legacy saved sort.
        if (saved.sortVersion === 2 && ['date', 'driver', 'supplier', 'km', 'value', 'status'].includes(saved.sortKey)) {
          centralPendingSortState = { key: saved.sortKey, direction: saved.sortDirection === 'asc' ? 'asc' : 'desc' };
        }
      } catch (error) {}
      const values = { 'central-pending-status-inline': centralPendingStatusFilter };
      Object.entries(values).forEach(([id, value]) => {
        const node = document.getElementById(id);
        if (node) node.value = value;
      });
      renderCentralPendingDateControls();
    }

    function saveCentralPendingFilters() {
      try {
        localStorage.setItem(CENTRAL_PENDING_FILTERS_KEY, JSON.stringify({
          status: centralPendingStatusFilter,
          start: centralPendingDateStart,
          end: centralPendingDateEnd,
          search: centralPendingSearchFilter,
          value: centralPendingValueFilter,
          vehicle: centralPendingVehicleFilter,
          supplier: centralPendingSupplierFilter,
          order: centralPendingOrderFilter,
          nf: centralPendingNfFilter,
          dueStart: centralPendingDueStart,
          dueEnd: centralPendingDueEnd,
          sortKey: centralPendingSortState.key,
          sortVersion: 2,
          sortDirection: centralPendingSortState.direction
        }));
      } catch (error) {}
    }

    function applyCentralPendingFilters() {
      centralPendingSearchFilter = normalizeComparableText(globalSearchInputEl?.value || '');
      centralPendingValueFilter = '';
      centralPendingVehicleFilter = '';
      centralPendingSupplierFilter = '';
      centralPendingOrderFilter = '';
      centralPendingNfFilter = '';
      centralPendingDueStart = '';
      centralPendingDueEnd = '';
      saveCentralPendingFilters();
      renderCentralPendingRecords();
    }

    function clearCentralPendingFilters() {
      centralPendingStatusFilter = 'todos';
      centralPendingDateStart = '';
      centralPendingDateEnd = '';
      centralPendingSearchFilter = '';
      centralPendingValueFilter = '';
      centralPendingVehicleFilter = '';
      centralPendingSupplierFilter = '';
      centralPendingOrderFilter = '';
      centralPendingNfFilter = '';
      centralPendingDueStart = '';
      centralPendingDueEnd = '';
      centralPendingSortState = { key: 'date', direction: 'desc' };
      centralPendingFiltersLoaded = false;
      try { localStorage.removeItem(CENTRAL_PENDING_FILTERS_KEY); } catch (error) {}
      loadCentralPendingFilters();
      updateContextualSearchUi();
      renderCentralPendingRecords();
    }

    function parseCentralPendingCalendarDate(value) {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
      if (!match) return null;
      const year = Number(match[1]);
      const month = Number(match[2]) - 1;
      const day = Number(match[3]);
      if (year < 1000 || year > 9999) return null;
      const date = new Date(year, month, day);
      return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day ? date : null;
    }

    function centralPendingCalendarIso(date) {
      if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
      return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    function formatCentralPendingCalendarDate(value) {
      const date = parseCentralPendingCalendarDate(value);
      return date ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date) : '';
    }

    function renderCentralPendingDateControls() {
      const statusLabels = { todos: 'Todos', pendente: 'Pendentes', aprovado: 'Aprovados', rejeitado: 'Rejeitados' };
      const statusLabel = document.getElementById('central-pending-status-label');
      if (statusLabel) statusLabel.textContent = statusLabels[centralPendingStatusFilter] || statusLabels.todos;
      document.querySelectorAll('[data-status-value]').forEach((button) => {
        const active = button.dataset.statusValue === centralPendingStatusFilter;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-current', active ? 'true' : 'false');
      });
      const label = document.getElementById('central-pending-date-range-label');
      if (label) {
        const start = formatCentralPendingCalendarDate(centralPendingDateStart);
        const end = formatCentralPendingCalendarDate(centralPendingDateEnd);
        label.textContent = start ? `${start}${end ? ` – ${end}` : ' – …'}` : 'Todas as datas';
      }
      const hint = document.getElementById('central-pending-calendar-hint');
      if (hint) {
        hint.textContent = centralPendingCalendarSelectingEnd && centralPendingDraftDateStart && !centralPendingDraftDateEnd
          ? 'Agora escolha a data final.'
          : (centralPendingDraftDateStart && centralPendingDraftDateEnd ? 'Período pronto para filtrar.' : 'Escolha a data inicial.');
      }
    }

    function renderCentralPendingCalendar() {
      const months = document.getElementById('central-pending-calendar-months');
      if (!months) return;
      if (!(centralPendingCalendarMonth instanceof Date)) {
        const selected = parseCentralPendingCalendarDate(centralPendingDateStart) || new Date();
        centralPendingCalendarMonth = new Date(selected.getFullYear(), selected.getMonth(), 1);
      }
      const startIso = centralPendingDraftDateStart;
      const endIso = centralPendingDraftDateEnd;
      const todayIso = centralPendingCalendarIso(new Date());
      const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
      const year = centralPendingCalendarMonth.getFullYear();
      const month = centralPendingCalendarMonth.getMonth();
      const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(centralPendingCalendarMonth);
      const pickerHead = `<div class="central-pending-calendar-picker-head"><button type="button" onclick="event.stopPropagation(); setCentralPendingCalendarView('months')">${monthName}</button><button type="button" onclick="event.stopPropagation(); setCentralPendingCalendarView('years')">${year}</button></div>`;

      if (centralPendingCalendarView === 'months') {
        const monthNames = Array.from({ length: 12 }, (_, index) => new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(year, index, 1)).replace('.', ''));
        months.innerHTML = `<section class="central-pending-calendar-month">${pickerHead}<div class="central-pending-calendar-options is-months">${monthNames.map((name, index) => `<button type="button" class="${index === month ? 'is-selected' : ''}" onclick="event.stopPropagation(); chooseCentralPendingCalendarMonth(${index})">${name}</button>`).join('')}</div></section>`;
      } else if (centralPendingCalendarView === 'years') {
        const firstYear = Math.floor(year / 12) * 12;
        months.innerHTML = `<section class="central-pending-calendar-month">${pickerHead}<div class="central-pending-calendar-options is-years">${Array.from({ length: 12 }, (_, index) => firstYear + index).map(optionYear => `<button type="button" class="${optionYear === year ? 'is-selected' : ''}" onclick="event.stopPropagation(); chooseCentralPendingCalendarYear(${optionYear})">${optionYear}</button>`).join('')}</div></section>`;
      } else {
        const firstWeekday = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const blanks = Array.from({ length: firstWeekday }, () => '<span class="central-pending-calendar-day is-placeholder"></span>').join('');
        const days = Array.from({ length: daysInMonth }, (_, index) => {
          const date = new Date(year, month, index + 1);
          const iso = centralPendingCalendarIso(date);
          const classes = ['central-pending-calendar-day'];
          if (iso === todayIso) classes.push('is-today');
          if (iso === startIso) classes.push('is-start');
          if (iso === endIso) classes.push('is-end');
          if (startIso && endIso && iso > startIso && iso < endIso) classes.push('is-in-range');
          return `<button type="button" class="${classes.join(' ')}" data-date="${iso}" aria-label="${formatCentralPendingCalendarDate(iso)}" onclick="event.stopPropagation(); selectCentralPendingCalendarDate('${iso}')">${index + 1}</button>`;
        }).join('');
        months.innerHTML = `<section class="central-pending-calendar-month">${pickerHead}<div class="central-pending-calendar-weekdays">${weekdays.map(day => `<span>${day}</span>`).join('')}</div><div class="central-pending-calendar-days">${blanks}${days}</div></section>`;
      }
      renderCentralPendingDateControls();
    }

    function toggleCentralPendingCalendar(forceOpen) {
      const calendar = document.getElementById('central-pending-calendar');
      const button = document.getElementById('central-pending-date-range-button');
      if (!calendar || !button) return;
      const open = typeof forceOpen === 'boolean' ? forceOpen : !calendar.classList.contains('is-open');
      calendar.classList.toggle('is-open', open);
      calendar.setAttribute('aria-hidden', open ? 'false' : 'true');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('central-calendar-open', open);
      if (open) {
        centralPendingDraftDateStart = centralPendingDateStart;
        centralPendingDraftDateEnd = centralPendingDateEnd;
        centralPendingCalendarSelectingEnd = Boolean(centralPendingDraftDateStart && !centralPendingDraftDateEnd);
        centralPendingCalendarView = 'days';
        const selected = parseCentralPendingCalendarDate(centralPendingDraftDateStart) || new Date();
        centralPendingCalendarMonth = new Date(selected.getFullYear(), selected.getMonth(), 1);
        renderCentralPendingCalendar();
      }
    }

    function moveCentralPendingCalendar(offset) {
      if (!(centralPendingCalendarMonth instanceof Date)) centralPendingCalendarMonth = new Date();
      const step = centralPendingCalendarView === 'years' ? 12 : (centralPendingCalendarView === 'months' ? 1 : 0);
      centralPendingCalendarMonth = step
        ? new Date(centralPendingCalendarMonth.getFullYear() + (Number(offset || 0) * step), centralPendingCalendarMonth.getMonth(), 1)
        : new Date(centralPendingCalendarMonth.getFullYear(), centralPendingCalendarMonth.getMonth() + Number(offset || 0), 1);
      renderCentralPendingCalendar();
    }

    function setCentralPendingCalendarView(view) {
      centralPendingCalendarView = ['days', 'months', 'years'].includes(view) ? view : 'days';
      renderCentralPendingCalendar();
    }

    function chooseCentralPendingCalendarMonth(month) {
      centralPendingCalendarMonth = new Date(centralPendingCalendarMonth.getFullYear(), Math.max(0, Math.min(11, Number(month))), 1);
      centralPendingCalendarView = 'days';
      renderCentralPendingCalendar();
    }

    function chooseCentralPendingCalendarYear(year) {
      const normalizedYear = Math.max(1000, Math.min(9999, Number(year)));
      centralPendingCalendarMonth = new Date(normalizedYear, centralPendingCalendarMonth.getMonth(), 1);
      centralPendingCalendarView = 'months';
      renderCentralPendingCalendar();
    }

    function selectCentralPendingCalendarDate(value) {
      const iso = centralPendingCalendarIso(parseCentralPendingCalendarDate(value));
      if (!iso) return;
      if (!centralPendingDraftDateStart || centralPendingDraftDateEnd || !centralPendingCalendarSelectingEnd) {
        centralPendingDraftDateStart = iso;
        centralPendingDraftDateEnd = '';
        centralPendingCalendarSelectingEnd = true;
      } else if (iso < centralPendingDraftDateStart) {
        centralPendingDraftDateStart = iso;
      } else {
        centralPendingDraftDateEnd = iso;
        centralPendingCalendarSelectingEnd = false;
      }
      renderCentralPendingCalendar();
    }

    function clearCentralPendingDateRange() {
      centralPendingDraftDateStart = '';
      centralPendingDraftDateEnd = '';
      centralPendingCalendarSelectingEnd = false;
      centralPendingCalendarView = 'days';
      renderCentralPendingCalendar();
    }

    function applyCentralPendingDateRange() {
      centralPendingDateStart = centralPendingDraftDateStart;
      centralPendingDateEnd = centralPendingDraftDateEnd || centralPendingDraftDateStart;
      saveCentralPendingFilters();
      renderCentralPendingRecords();
      toggleCentralPendingCalendar(false);
    }

    function setCentralPendingStatus(value) {
      loadCentralPendingFilters();
      centralPendingStatusFilter = ['todos', 'pendente', 'aprovado', 'rejeitado'].includes(value) ? value : 'todos';
      const menu = document.getElementById('central-pending-status-filter');
      if (menu) menu.open = false;
      saveCentralPendingFilters();
      renderCentralPendingRecords();
    }

    function updateCentralPendingSortIndicators() {
      document.querySelectorAll('[data-central-sort-indicator]').forEach((node) => {
        const key = node.getAttribute('data-central-sort-indicator');
        node.textContent = centralPendingSortState.key === key
          ? (centralPendingSortState.direction === 'asc' ? '↑' : '↓')
          : '';
      });
      document.querySelectorAll('.central-pending-sort-head').forEach((button) => {
        button.classList.toggle('is-active', button.dataset.sortKey === centralPendingSortState.key);
      });
    }

    function toggleCentralPendingSort(key) {
      if (!['date', 'driver', 'supplier', 'km', 'value', 'status'].includes(key)) return;
      if (centralPendingSortState.key === key) {
        centralPendingSortState.direction = centralPendingSortState.direction === 'asc' ? 'desc' : 'asc';
      } else {
        centralPendingSortState = { key, direction: key === 'date' || key === 'value' || key === 'km' ? 'desc' : 'asc' };
      }
      saveCentralPendingFilters();
      renderCentralPendingRecords();
    }

    function renderCentralPendingSummary(rows) {
      const pendingRows = rows.filter(row => getCentralPendingStatus(row).className === 'pending');
      const fuelRows = rows.filter(row => !normalizeComparableText(row?.tipo || '').includes('servico'));
      const serviceRows = rows.filter(row => normalizeComparableText(row?.tipo || '').includes('servico'));
      const countNode = document.getElementById('central-pending-count');
      const fuelNode = document.getElementById('central-pending-fuel-count');
      const serviceNode = document.getElementById('central-pending-service-count');
      if (countNode) countNode.textContent = pendingRows.length.toLocaleString('pt-BR');
      if (fuelNode) fuelNode.textContent = fuelRows.length.toLocaleString('pt-BR');
      if (serviceNode) serviceNode.textContent = serviceRows.length.toLocaleString('pt-BR');
    }

    function setCentralPendingLoadingIndicator(visible) {
      document.getElementById('central-pending-loading-indicator')?.classList.toggle('hidden', !visible);
    }

    function renderCentralPendingRecords() {
      const list = document.getElementById('central-pending-list');
      if (!list) return;
      const rows = getCentralPendingSortedRows();
      const visibleIds = new Set(rows.map(record => getCentralPendingRecordId(record)));
      selectedCentralPending = new Set(Array.from(selectedCentralPending).filter(id => visibleIds.has(id)));
      renderCentralPendingSummary(rows);
      updateCentralPendingSortIndicators();
      renderCentralPendingDateControls();

      // Uma atualização silenciosa/realtime nunca deve apagar a tabela que já
      // está na tela. O estado de carregamento vazio é reservado somente para
      // a primeira consulta; nas seguintes, a barra superior sinaliza o sync.
      if (centralPendingLoading && !centralPendingLoaded) {
        list.innerHTML = '<tr><td colspan="7" class="central-pending-empty">Buscando registros enviados pela Central...</td></tr>';
        return;
      }
      // Oscilações de rede também não substituem dados já confirmados. Se ainda
      // não existe cópia carregada, exibimos o erro no corpo da tabela.
      if (centralPendingError && (!centralPendingLoaded || !centralPendingRecords.length)) {
        list.innerHTML = `<tr><td colspan="7" class="central-pending-empty central-pending-error">${escapeHtml(centralPendingError)}</td></tr>`;
        return;
      }
      if (!centralPendingLoaded) {
        list.innerHTML = '<tr><td colspan="7" class="central-pending-empty">Aguardando a primeira atualização automática.</td></tr>';
        return;
      }
      if (!rows.length) {
        list.innerHTML = '<tr><td colspan="7" class="central-pending-empty">Nenhum registro recebido da Central até agora.</td></tr>';
        return;
      }

      list.innerHTML = rows.map((record) => {
        const status = getCentralPendingStatus(record);
        const rowId = escapeHtml(getCentralPendingRecordId(record));
        const receiptUrl = String(record?.comprovanteUrl || '').trim();
        return `
          <tr class="${selectedCentralPending.has(getCentralPendingRecordId(record)) ? 'is-selected' : ''}" onclick="toggleCentralPendingRecord('${rowId}')">
            <td>${getCentralPendingDate(record)}</td>
            <td>${escapeHtml(getCentralPendingDriverVehicleLabel(record))}</td>
            <td>${escapeHtml(getCentralPendingSupplier(record))}</td>
            <td>${escapeHtml(record?.km || '-')}</td>
            <td class="central-pending-value">${getCentralPendingValue(record)}</td>
            <td><span class="central-pending-status ${status.className}">${status.label}</span></td>
            <td>
              <div class="central-pending-actions">
                <button type="button" title="Ver comprovante" ${receiptUrl ? `onclick="event.stopPropagation(); viewFinanceReceipt('${escapeHtml(receiptUrl)}')"` : 'disabled'}>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="3" stroke-width="1.9"/></svg>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    async function refreshCentralPendingRecords({ silent = false } = {}) {
      if (centralPendingLoading) return;
      if (!window.WeFrotasBackend?.getUser?.()) {
        centralPendingError = '';
        centralPendingLoaded = true;
        centralPendingRecords = [];
        renderCentralPendingRecords();
        return;
      }
      if (!window.WeFrotasBackend?.listCentralPendingRecords) {
        centralPendingError = 'Leitura da Central ainda não está disponível neste navegador.';
        centralPendingLoaded = true;
        renderCentralPendingRecords();
        return;
      }

      centralPendingLoading = true;
      let shouldRenderAfterLoad = !silent;
      centralPendingError = '';
      setCentralPendingLoadingIndicator(true);
      if (!silent && !centralPendingLoaded) renderCentralPendingRecords();
      try {
        const result = await window.WeFrotasBackend.listCentralPendingRecords(150);
        const pendingRepairs = [];
        const nextRecords = (Array.isArray(result?.rows) ? result.rows : []).map((record) => {
          const linkedEntry = findCentralFinanceDuplicate(record);
          if (!linkedEntry || getCentralPendingStatus(record).className !== 'pending') return record;
          linkFinanceEntryToCentralRecord(linkedEntry, record);
          pendingRepairs.push({ record, entry: linkedEntry });
          return {
            ...record,
            status: 'aprovado',
            importadoEm: record.importadoEm || linkedEntry.createdAt || '',
            lancamentoFinanceiroId: linkedEntry.id,
            resolucao: record.resolucao || 'Aprovado e lançado no financeiro.'
          };
        });
        const currentSignature = JSON.stringify(centralPendingRecords.map(item => [item.$id || item.id, item.$updatedAt || item.atualizadoEm || '', item.status || '', item.resolucao || '']));
        const nextSignature = JSON.stringify(nextRecords.map(item => [item.$id || item.id, item.$updatedAt || item.atualizadoEm || '', item.status || '', item.resolucao || '']));
        const changed = currentSignature !== nextSignature || !centralPendingLoaded;
        centralPendingRecords = nextRecords;
        centralPendingLoaded = true;
        renderPushIndividualRecipients();
        shouldRenderAfterLoad = changed;
        pendingRepairs.forEach(({ record, entry }) => repairCentralApprovedStatus(record, entry));
      } catch (error) {
        centralPendingError = `Não foi possível carregar a Central: ${error?.message || 'erro desconhecido'}`;
      } finally {
        centralPendingLoading = false;
        setCentralPendingLoadingIndicator(false);
        if (shouldRenderAfterLoad || centralPendingError) renderCentralPendingRecords();
      }
    }

    function prepareCentralPendingRecord(rowId) {
      const record = centralPendingRecords.find(item => getCentralPendingRecordId(item) === rowId);
      if (!record) {
        showToast('Registro da Central não encontrado. Atualize a lista e tente novamente.');
        return;
      }
      const importedData = parseImportedCentralMessage(buildCentralPendingMessage(record));
      if (!importedData) {
        showToast('Não consegui interpretar esse registro da Central. Confira os campos recebidos.');
        return;
      }
      if (importedData.type === 'loose_note' || importedData.type === 'service') {
        openImportedLooseNoteLaunch(importedData);
      } else {
        openImportedFuelLaunch(importedData);
      }
    }

    async function setCentralPendingRecordStatus(record, data) {
      const rowId = getCentralPendingRecordId(record);
      if (!rowId) throw new Error('Não foi possível atualizar o status do registro na Central.');
      const result = await executeCentralPushAdmin({ action: 'central-record-update', recordId: rowId, ...data });
      const updated = result?.record || {};
      centralPendingRecords = centralPendingRecords.map(item => getCentralPendingRecordId(item) === rowId ? { ...item, ...updated, ...data } : item);
      if (getCentralPendingStatus({ ...record, ...updated, ...data }).className !== 'pending') selectedCentralPending.delete(rowId);
      renderCentralPendingRecords();
    }

    function setCentralPendingRecordStatusLocally(record, data) {
      const rowId = getCentralPendingRecordId(record);
      centralPendingRecords = centralPendingRecords.map(item => getCentralPendingRecordId(item) === rowId ? { ...item, ...data } : item);
      selectedCentralPending.delete(rowId);
      renderCentralPendingRecords();
    }

    async function returnDeletedEntriesToCentral(entries = []) {
      if (!entries.length || !window.WeFrotasBackend?.updateCentralPendingRecord) return;
      if (!centralPendingLoaded) await refreshCentralPendingRecords();
      const updates = entries.map((entry) => {
        const record = centralPendingRecords.find(item => getCentralPendingRecordId(item) === entry.centralRecordId || item.lancamentoFinanceiroId === entry.id);
        if (!record) return null;
        return setCentralPendingRecordStatus(record, {
          status: 'pendente',
          resolucao: 'Lançamento financeiro excluído. Registro devolvido para nova análise.',
          importadoEm: '',
          lancamentoFinanceiroId: ''
        });
      }).filter(Boolean);
      if (!updates.length) return;
      try {
        await Promise.all(updates);
        showToast('Registro(s) de origem devolvido(s) para pendente na Central.');
      } catch (error) {
        console.warn('Não foi possível devolver todos os registros à Central.', error);
        showToast('O financeiro foi excluído, mas um registro não pôde ser devolvido à Central.');
      }
    }

    function getCentralRecordTotal(record) {
      const value = Number(record?.valorNumero ?? parseCurrencyInputValue(record?.valor || ''));
      return Number.isFinite(value) && value > 0 ? value : 0;
    }

    async function notifyCentralRecordApproval(record) {
      const subscriptionId = String(record?.pushSubscriptionId || '').trim();
      const deviceId = String(record?.deviceId || '').trim();
      if (!subscriptionId && !deviceId) return { skipped: true, reason: 'missing-device-link' };
      return executeCentralPushAdmin({
        action: 'notify',
        subscriptionId,
        deviceId,
        notificationId: `central-approved-${getCentralPendingRecordId(record)}-${Date.now()}`,
        title: 'Registro aprovado',
        body: 'Seu registro foi aprovado e lançado no WeFrotas.',
        url: './#meus-envios'
      });
    }

    async function persistApprovedCentralFinance(record, entry) {
      const backend = window.WeFrotasBackend;
      // A manager may already have local edits (including the imported entry).
      // Confirm those before the server append changes the snapshot version.
      if (backend?.hasPermission?.('syncSnapshot')) await persistOperationalDataImmediately();
      const result = await executeCentralPushAdmin({
        action: 'central-finance-append',
        centralRecordId: getCentralPendingRecordId(record),
        entry
      });
      // The append writes on the server. Re-read its canonical snapshot/version
      // instead of queueing an old whole-company snapshot over that write.
      await backend.adoptRemoteOrUploadLocal();
      return result;
    }

    async function approveCentralPendingRecord(rowId) {
      if (!requireWefrotasPermission('approveRecords', 'Seu perfil não permite aprovar registros.')) return;
      const record = centralPendingRecords.find(item => getCentralPendingRecordId(item) === rowId);
      if (!record) return showToast('Registro da Central não encontrado.');
      if (centralApprovalInProgress.has(rowId)) return showToast('Este registro já está sendo aprovado. Aguarde a conclusão.');

      const existingEntry = findCentralFinanceDuplicate(record);
      if (existingEntry) {
        linkFinanceEntryToCentralRecord(existingEntry, record);
        const approvalData = {
          status: 'aprovado',
          importadoEm: record.importadoEm || existingEntry.createdAt || new Date().toISOString(),
          lancamentoFinanceiroId: existingEntry.id,
          resolucao: 'Aprovado e lançado no financeiro.'
        };
        try {
          await persistApprovedCentralFinance(record, existingEntry);
          await setCentralPendingRecordStatus(record, approvalData);
          setCentralPendingRecordStatusLocally(record, approvalData);
          notifyCentralRecordApproval(record).catch((error) => console.warn('Registro aprovado, mas o aparelho não recebeu o aviso.', error));
          showToast('Este registro já estava lançado. O status da Central foi corrigido.');
        } catch (error) {
          showToast(`O lançamento já existe no Financeiro, mas a confirmação da Central ficou pendente: ${error?.message || 'erro desconhecido'}`);
        }
        return;
      }
      if (getCentralPendingStatus(record).className === 'approved') return showToast('Este registro já foi aprovado.');

      const imported = parseImportedCentralMessage(buildCentralPendingMessage(record));
      if (!imported) return prepareCentralPendingRecord(rowId);

      const isService = imported.type === 'service' || imported.type === 'loose_note';
      const supplier = isService
        ? resolveSupplierByRelevantTerms(imported.fornecedor, allSuppliers.filter(item => item.tipo !== 'posto' && isEntityActive(item)))
        : (() => {
            const matchedSupplier = resolveFuelSupplierByImportedName(imported.posto);
            return isEntityActive(matchedSupplier) ? matchedSupplier : null;
          })();
      const importedDriver = isService ? null : resolveDriverByImportedName(imported.motorista);
      const vehicle = isService || !isEntityActive(importedDriver) ? null : resolveVehicleByImportedDriver(imported.motorista, importedDriver);
      const activeVehicle = vehicle && isEntityActive(vehicle) ? vehicle : null;
      const total = getCentralRecordTotal(record) || parseCurrencyInputValue(imported.valor || '');
      const centralEntryDate = getCentralRecordIsoDate(record, imported);
      const isReady = isService
        ? !!(supplier && centralEntryDate && total)
        : !!(supplier && activeVehicle && centralEntryDate && imported.tipoCombustivel && imported.litros && total);

      if (!isReady) {
        prepareCentralPendingRecord(rowId);
        showToast('Revise os campos pendentes para concluir este lançamento.');
        return;
      }

      const financeId = generateId();
      const entry = isService ? {
        id: financeId, centralRecordId: getCentralPendingRecordId(record), createdAt: new Date().toISOString(), entryType: 'despesa', orderId: '', vehicleId: '', kind: 'despesa', kindLabel: 'Despesa',
        supplierId: supplier.id, supplierType: supplier.tipo, fornecedor: supplier.nome, nf: 'REGISTRO DE SERVIÇOS', km: imported.km || '', comprovanteUrl: imported.comprovanteUrl || record.comprovanteUrl || '',
        dataVencimento: centralEntryDate, total, observacoes: [imported.tipoServico, imported.observacoes].filter(Boolean).join(' | ')
      } : {
        id: financeId, centralRecordId: getCentralPendingRecordId(record), createdAt: new Date().toISOString(), entryType: 'combustivel', vehicleId: activeVehicle.id, orderId: '', kind: 'despesa', kindLabel: 'Despesa',
        supplierId: supplier.id, supplierType: supplier.tipo, fornecedor: supplier.nome, fuelType: imported.tipoCombustivel, km: imported.km || '', litros: String(imported.litros),
        driverId: importedDriver?.id || '', comprovanteUrl: imported.comprovanteUrl || record.comprovanteUrl || '', dataAbastecimento: centralEntryDate,
        dataVencimento: '', nf: '', total, observacoes: imported.cidade ? `Cidade informada na Central: ${imported.cidade}` : '', groupedIntoId: '', workflowStatus: 'pendente', closedExpense: false, discount: 0
      };

      const approvalData = { status: 'aprovado', importadoEm: new Date().toISOString(), lancamentoFinanceiroId: financeId, resolucao: 'Aprovado e lançado no financeiro.' };
      centralApprovalInProgress.add(rowId);
      allFinanceEntries.unshift(entry);
      renderAll();
      try {
        // O Financeiro é persistido e confirmado no Appwrite antes de a Central
        // receber o status aprovado. Assim o lançamento aparece imediatamente e
        // nunca fica uma aprovação remota sem o respectivo registro financeiro.
        await persistApprovedCentralFinance(record, entry);
        await setCentralPendingRecordStatus(record, approvalData);
        setCentralPendingRecordStatusLocally(record, approvalData);
        notifyCentralRecordApproval(record).catch((error) => console.warn('Registro aprovado, mas o aparelho não recebeu o aviso.', error));
        showToast('Registro aprovado e lançado no financeiro.');
      } catch (error) {
        showToast(`O lançamento já está visível no Financeiro, mas a confirmação da Central ficou pendente: ${error?.message || 'erro desconhecido'}`);
      } finally {
        centralApprovalInProgress.delete(rowId);
      }
    }

    async function notifyCentralRecordRejection(record, reason) {
      const subscriptionId = String(record?.pushSubscriptionId || '').trim();
      const deviceId = String(record?.deviceId || '').trim();
      if (!subscriptionId && !deviceId) {
        return { skipped: true, reason: 'missing-device-link' };
      }
      return executeCentralPushAdmin({
        action: 'notify',
        subscriptionId,
        deviceId,
        notificationId: `central-rejected-${getCentralPendingRecordId(record)}-${Date.now()}`,
        title: 'Registro recusado',
        body: `Motivo: ${String(reason || '').trim()}`,
        url: './#meus-envios'
      });
    }

    function rejectCentralPendingRecord(rowId) {
      if (!requireWefrotasPermission('approveRecords', 'Seu perfil não permite rejeitar registros.')) return;
      const record = centralPendingRecords.find(item => getCentralPendingRecordId(item) === rowId);
      if (!record) return showToast('Registro da Central não encontrado.');
      openPromptModal({
        title: 'Rejeitar registro', text: 'Informe o motivo da rejeição. Ele ficará registrado na Central.', placeholder: 'Ex.: comprovante ilegível ou valor divergente', confirmLabel: 'Rejeitar registro', cancelLabel: 'Cancelar',
        onConfirm: async (reason) => {
          try {
            await setCentralPendingRecordStatus(record, { status: 'rejeitado', resolucao: reason });
            try {
              const notification = await notifyCentralRecordRejection(record, reason);
              showToast(notification?.skipped
                ? 'Registro rejeitado. Este envio antigo não possui aparelho vinculado para aviso.'
                : 'Registro rejeitado e motivo enviado ao aparelho de origem.');
            } catch (notificationError) {
              console.warn('Registro rejeitado, mas o aparelho não recebeu o aviso.', notificationError);
              showToast(`Registro rejeitado, mas o aviso falhou: ${notificationError?.message || 'erro desconhecido'}`);
            }
          } catch (error) {
            showToast(error?.message || 'Não foi possível rejeitar o registro.');
          }
        }
      });
    }

    function getSelectedCentralPendingRecordId(actionLabel) {
      if (selectedCentralPending.size !== 1) {
        showToast(`${actionLabel}: selecione apenas um registro.`);
        return '';
      }
      return Array.from(selectedCentralPending)[0];
    }

    function approveSelectedCentralPendingRecord() {
      const rowId = getSelectedCentralPendingRecordId('Aprovar');
      if (rowId) approveCentralPendingRecord(rowId);
    }

    function rejectSelectedCentralPendingRecord() {
      const rowId = getSelectedCentralPendingRecordId('Rejeitar');
      if (rowId) rejectCentralPendingRecord(rowId);
    }

    function prepareSelectedCentralPendingRecord() {
      const rowId = getSelectedCentralPendingRecordId('Revisar lançamento');
      if (rowId) prepareCentralPendingRecord(rowId);
    }

    function toggleCentralPendingRecord(rowId) {
      if (selectedCentralPending.has(rowId)) selectedCentralPending.delete(rowId);
      else selectedCentralPending.add(rowId);
      renderCentralPendingRecords();
    }

    function toggleAllCentralPendingRecords(checked) {
      const rows = getCentralPendingSortedRows();
      rows.forEach(record => {
        const rowId = getCentralPendingRecordId(record);
        if (checked) selectedCentralPending.add(rowId);
        else selectedCentralPending.delete(rowId);
      });
      renderCentralPendingRecords();
    }

    async function auditSelectedCentralPendingRecords() {
      if (!requireWefrotasPermission('approveRecords', 'Seu perfil não permite auditar registros.')) return;
      const records = centralPendingRecords.filter(record => selectedCentralPending.has(getCentralPendingRecordId(record)));
      if (!records.length) return showToast('Selecione ao menos um registro para auditar.');
      try {
        await Promise.all(records.map(record => setCentralPendingRecordStatus(record, { status: 'pendente', resolucao: 'Registro devolvido para pendente pela auditoria.', importadoEm: '', lancamentoFinanceiroId: '' })));
        selectedCentralPending.clear();
        renderCentralPendingRecords();
        showToast('Registros devolvidos para pendente.');
      } catch (error) {
        showToast(error?.message || 'Não foi possível concluir a auditoria.');
      }
    }

    function deleteSelectedCentralPendingRecords() {
      if (!requireWefrotasPermission('deleteRecords', 'Somente administradores podem excluir registros da Central.')) return;
      const records = centralPendingRecords.filter(record => selectedCentralPending.has(getCentralPendingRecordId(record)));
      if (!records.length) return showToast('Selecione ao menos um registro para excluir.');
      openPromptModal({
        mode: 'confirm', title: 'Excluir registros', text: `Excluir ${records.length} registro(s) da Central? Essa ação não poderá ser desfeita.`, confirmLabel: 'Excluir', cancelLabel: 'Cancelar',
        onConfirm: async () => {
          try {
            await Promise.all(records.map(record => executeCentralPushAdmin({ action: 'central-record-delete', recordId: getCentralPendingRecordId(record) })));
            const ids = new Set(records.map(getCentralPendingRecordId));
            centralPendingRecords = centralPendingRecords.filter(record => !ids.has(getCentralPendingRecordId(record)));
            selectedCentralPending.clear();
            renderCentralPendingRecords();
            showToast('Registros excluídos da Central.');
          } catch (error) { showToast(error?.message || 'Não foi possível excluir os registros.'); }
        }
      });
    }

    function renderDocuments() {
      const panel = document.getElementById('panel-documentos');
      if (!panel) return;
      if (centralPendingLoading) return;
      if (!centralPendingLoaded && !centralPendingLoading && !centralPendingError) {
        refreshCentralPendingRecords({ silent: true });
        return;
      }
      renderCentralPendingRecords();
    }

    window.refreshCentralPendingRecords = refreshCentralPendingRecords;
    window.toggleCentralPendingSort = toggleCentralPendingSort;
    window.toggleCentralPendingCalendar = toggleCentralPendingCalendar;
    window.moveCentralPendingCalendar = moveCentralPendingCalendar;
    window.setCentralPendingCalendarView = setCentralPendingCalendarView;
    window.chooseCentralPendingCalendarMonth = chooseCentralPendingCalendarMonth;
    window.chooseCentralPendingCalendarYear = chooseCentralPendingCalendarYear;
    window.selectCentralPendingCalendarDate = selectCentralPendingCalendarDate;
    window.clearCentralPendingDateRange = clearCentralPendingDateRange;
    window.applyCentralPendingDateRange = applyCentralPendingDateRange;
    window.setCentralPendingStatus = setCentralPendingStatus;
    window.prepareCentralPendingRecord = prepareCentralPendingRecord;
    window.approveCentralPendingRecord = approveCentralPendingRecord;
    window.rejectCentralPendingRecord = rejectCentralPendingRecord;
    window.toggleCentralPendingRecord = toggleCentralPendingRecord;
    window.toggleAllCentralPendingRecords = toggleAllCentralPendingRecords;
    window.approveSelectedCentralPendingRecord = approveSelectedCentralPendingRecord;
    window.rejectSelectedCentralPendingRecord = rejectSelectedCentralPendingRecord;
    window.prepareSelectedCentralPendingRecord = prepareSelectedCentralPendingRecord;
    window.auditSelectedCentralPendingRecords = auditSelectedCentralPendingRecords;
    window.deleteSelectedCentralPendingRecords = deleteSelectedCentralPendingRecords;

    function setFuelSheetPage(page) {
      fuelSheetPreferences.page = page;
      renderDocuments();
    }

    function renderFuelColumnsPanel() {
      const panel = document.getElementById('fuel-columns-panel');
      if (!panel) return;
      const definitions = getFuelSheetColumnDefinitions();
      panel.innerHTML = `
        <div class="documents-columns-title">
          <strong>Colunas visíveis</strong>
          <button type="button" onclick="toggleFuelColumnsPanel()">Fechar</button>
        </div>
        <div class="documents-columns-grid">
          ${fuelSheetPreferences.order.map(columnId => `
            <label>
              <input type="checkbox" ${fuelSheetPreferences.visible[columnId] ? 'checked' : ''} onchange="toggleFuelSheetColumn('${columnId}', this.checked)">
              <span>${escapeHtml(definitions[columnId]?.label || columnId)}</span>
            </label>
          `).join('')}
        </div>
      `;
    }

    function positionDocumentsPopover(panel, trigger) {
      if (!panel) return;
      const rect = trigger?.getBoundingClientRect?.();
      if (!rect) {
        panel.style.left = '';
        panel.style.top = '';
        return;
      }
      const width = panel.offsetWidth || 360;
      const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
      panel.style.left = `${left}px`;
      panel.style.top = `${rect.bottom + 8}px`;
    }

    function toggleFuelColumnsPanel(event) {
      const panel = document.getElementById('fuel-columns-panel');
      if (!panel) return;
      const willOpen = panel.classList.contains('hidden');
      closeFuelExportMenu();
      panel.classList.toggle('hidden');
      if (willOpen) positionDocumentsPopover(panel, event?.currentTarget);
    }

    function closeFuelColumnsPanel() {
      document.getElementById('fuel-columns-panel')?.classList.add('hidden');
    }

    function toggleFuelExportMenu(event) {
      event?.stopPropagation?.();
      closeFuelColumnsPanel();
      document.getElementById('fuel-export-menu')?.classList.toggle('hidden');
    }

    function closeFuelExportMenu() {
      document.getElementById('fuel-export-menu')?.classList.add('hidden');
    }

    function toggleFuelSheetColumn(columnId, visible) {
      fuelSheetPreferences.visible[columnId] = visible;
      fuelSheetPreferences.page = 1;
      renderDocuments();
    }

    function openFuelColumnMenu(event, columnId) {
      event.stopPropagation();
      closeFuelColumnsPanel();
      closeFuelExportMenu();
      const menu = document.getElementById('fuel-filter-menu');
      if (!menu) return;
      const rect = event.currentTarget.getBoundingClientRect();
      menu.style.left = `${Math.min(rect.left, window.innerWidth - 330)}px`;
      menu.style.top = `${rect.bottom + 8}px`;
      menu.innerHTML = buildFuelColumnMenuHtml(columnId);
      menu.classList.remove('hidden');
    }

    function buildFuelColumnMenuHtml(columnId) {
      const definitions = getFuelSheetColumnDefinitions();
      const definition = definitions[columnId];
      const filter = fuelSheetPreferences.filters[columnId] || {};
      const uniqueValues = getFuelSheetRows()
        .map(row => String(getFuelSheetRawValue(row, columnId) || '').trim())
        .filter(Boolean)
        .filter((value, index, list) => list.findIndex(item => normalizeFuelSheetComparable(item) === normalizeFuelSheetComparable(value)) === index)
        .sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true, sensitivity: 'base' }))
        .slice(0, 160);
      const filterHtml = definition.type === 'date'
        ? `
          <label>Condição</label>
          <select onchange="setFuelDateFilter('${columnId}', 'operator', this.value)">
            <option value="">Sem filtro</option>
            <option value="eq" ${filter.operator === 'eq' ? 'selected' : ''}>Igual a</option>
            <option value="before" ${filter.operator === 'before' ? 'selected' : ''}>Antes de</option>
            <option value="after" ${filter.operator === 'after' ? 'selected' : ''}>Depois de</option>
            <option value="between" ${filter.operator === 'between' ? 'selected' : ''}>Entre duas datas</option>
          </select>
          <input type="date" value="${escapeHtml(filter.value || filter.from || '')}" onchange="setFuelDateFilter('${columnId}', '${filter.operator === 'between' ? 'from' : 'value'}', this.value)">
          <input type="date" value="${escapeHtml(filter.to || '')}" onchange="setFuelDateFilter('${columnId}', 'to', this.value)">
        `
        : (definition.type === 'number' || definition.type === 'currency')
          ? `
            <label>Condição</label>
            <select onchange="setFuelNumberFilter('${columnId}', 'operator', this.value)">
              <option value="">Sem filtro</option>
              <option value="eq" ${filter.operator === 'eq' ? 'selected' : ''}>Igual</option>
              <option value="gt" ${filter.operator === 'gt' ? 'selected' : ''}>Maior que</option>
              <option value="lt" ${filter.operator === 'lt' ? 'selected' : ''}>Menor que</option>
              <option value="between" ${filter.operator === 'between' ? 'selected' : ''}>Entre</option>
            </select>
            <input type="number" step="0.01" value="${escapeHtml(filter.value || filter.from || '')}" oninput="setFuelNumberFilter('${columnId}', '${filter.operator === 'between' ? 'from' : 'value'}', this.value)">
            <input type="number" step="0.01" value="${escapeHtml(filter.to || '')}" oninput="setFuelNumberFilter('${columnId}', 'to', this.value)">
          `
          : `
            <label>Pesquisar</label>
            <input type="search" value="${escapeHtml(filter.search || '')}" placeholder="Digite para pesquisar..." oninput="setFuelTextFilter('${columnId}', 'search', this.value)">
            <div class="documents-filter-actions-inline">
              <button type="button" onclick="selectAllFuelFilterValues('${columnId}')">Selecionar todos</button>
              <button type="button" onclick="clearFuelColumnFilter('${columnId}')">Limpar seleção</button>
            </div>
            <div class="documents-filter-values">
              ${uniqueValues.map(value => {
                const checked = !Array.isArray(filter.selected) || !filter.selected.length || filter.selected.map(normalizeFuelSheetComparable).includes(normalizeFuelSheetComparable(value));
                return `
                  <label>
                    <input type="checkbox" ${checked ? 'checked' : ''} onchange="toggleFuelFilterValue('${columnId}', '${escapeHtml(value)}', this.checked)">
                    <span>${escapeHtml(value)}</span>
                  </label>
                `;
              }).join('') || '<span class="documents-filter-empty">Sem valores para filtrar.</span>'}
            </div>
          `;
      return `
        <div class="documents-menu-title">${escapeHtml(definition.label)}</div>
        <button type="button" onclick="sortFuelSheet('${columnId}', 'asc')">Ordenar crescente</button>
        <button type="button" onclick="sortFuelSheet('${columnId}', 'desc')">Ordenar decrescente</button>
        <button type="button" onclick="clearFuelSort()">Limpar ordenação</button>
        <hr>
        <div class="documents-filter-block">${filterHtml}</div>
        <hr>
        <button type="button" onclick="toggleFuelPinnedColumn('${columnId}')">${fuelSheetPreferences.pinned.includes(columnId) ? 'Desafixar coluna' : 'Fixar coluna'}</button>
        <button type="button" onclick="moveFuelColumn('${columnId}', -1)">Mover para esquerda</button>
        <button type="button" onclick="moveFuelColumn('${columnId}', 1)">Mover para direita</button>
        <button type="button" onclick="hideFuelSheetColumn('${columnId}')">Ocultar coluna</button>
        <button type="button" onclick="closeFuelColumnMenu()">Fechar</button>
      `;
    }

    function closeFuelColumnMenu() {
      document.getElementById('fuel-filter-menu')?.classList.add('hidden');
    }

    function sortFuelSheet(columnId, direction) {
      fuelSheetPreferences.sort = { columnId, direction };
      fuelSheetPreferences.page = 1;
      closeFuelColumnMenu();
      renderDocuments();
    }

    function clearFuelSort() {
      fuelSheetPreferences.sort = null;
      closeFuelColumnMenu();
      renderDocuments();
    }

    function setFuelTextFilter(columnId, key, value) {
      fuelSheetPreferences.filters[columnId] = { ...(fuelSheetPreferences.filters[columnId] || {}), [key]: value };
      fuelSheetPreferences.page = 1;
      renderDocuments();
    }

    function toggleFuelFilterValue(columnId, value, checked) {
      const allValues = getFuelSheetRows()
        .map(row => String(getFuelSheetRawValue(row, columnId) || '').trim())
        .filter(Boolean);
      const normalizedAllValues = Array.from(new Set(allValues.map(normalizeFuelSheetComparable)));
      const current = fuelSheetPreferences.filters[columnId]?.selected?.map(normalizeFuelSheetComparable) || normalizedAllValues;
      const normalizedValue = normalizeFuelSheetComparable(value);
      const next = checked
        ? Array.from(new Set([...current, normalizedValue]))
        : current.filter(item => item !== normalizedValue);
      fuelSheetPreferences.filters[columnId] = { ...(fuelSheetPreferences.filters[columnId] || {}), selected: next };
      fuelSheetPreferences.page = 1;
      renderDocuments();
    }

    function selectAllFuelFilterValues(columnId) {
      fuelSheetPreferences.filters[columnId] = { ...(fuelSheetPreferences.filters[columnId] || {}), selected: [] };
      renderDocuments();
    }

    function setFuelDateFilter(columnId, key, value) {
      fuelSheetPreferences.filters[columnId] = { ...(fuelSheetPreferences.filters[columnId] || {}), [key]: value };
      fuelSheetPreferences.page = 1;
      renderDocuments();
    }

    function setFuelNumberFilter(columnId, key, value) {
      fuelSheetPreferences.filters[columnId] = { ...(fuelSheetPreferences.filters[columnId] || {}), [key]: value };
      fuelSheetPreferences.page = 1;
      renderDocuments();
    }

    function clearFuelColumnFilter(columnId) {
      delete fuelSheetPreferences.filters[columnId];
      fuelSheetPreferences.page = 1;
      closeFuelColumnMenu();
      renderDocuments();
    }

    function clearFuelSheetFilters() {
      fuelSheetPreferences.filters = {};
      fuelSheetPreferences.sort = null;
      fuelSheetPreferences.page = 1;
      closeFuelColumnMenu();
      renderDocuments();
    }

    function resetFuelSheetView() {
      fuelSheetPreferences = getDefaultFuelSheetPreferences();
      closeFuelColumnMenu();
      document.getElementById('fuel-columns-panel')?.classList.add('hidden');
      renderDocuments();
      showToast('Visual padrão restaurado.');
    }

    function toggleFuelPinnedColumn(columnId) {
      const current = new Set(fuelSheetPreferences.pinned);
      if (current.has(columnId)) current.delete(columnId);
      else current.add(columnId);
      fuelSheetPreferences.pinned = fuelSheetPreferences.order.filter(key => current.has(key));
      closeFuelColumnMenu();
      renderDocuments();
    }

    function hideFuelSheetColumn(columnId) {
      fuelSheetPreferences.visible[columnId] = false;
      closeFuelColumnMenu();
      renderDocuments();
    }

    function moveFuelColumn(columnId, offset) {
      const index = fuelSheetPreferences.order.indexOf(columnId);
      const targetIndex = index + offset;
      if (index < 0 || targetIndex < 0 || targetIndex >= fuelSheetPreferences.order.length) return;
      const nextOrder = [...fuelSheetPreferences.order];
      nextOrder.splice(index, 1);
      nextOrder.splice(targetIndex, 0, columnId);
      fuelSheetPreferences.order = nextOrder;
      closeFuelColumnMenu();
      renderDocuments();
    }

    function handleFuelHeaderDragStart(event, columnId) {
      fuelSheetDraggedColumn = columnId;
      event.dataTransfer.effectAllowed = 'move';
    }

    function handleFuelHeaderDrop(event, targetColumnId) {
      event.preventDefault();
      if (!fuelSheetDraggedColumn || fuelSheetDraggedColumn === targetColumnId) return;
      const nextOrder = [...fuelSheetPreferences.order];
      const fromIndex = nextOrder.indexOf(fuelSheetDraggedColumn);
      const toIndex = nextOrder.indexOf(targetColumnId);
      if (fromIndex < 0 || toIndex < 0) return;
      nextOrder.splice(fromIndex, 1);
      nextOrder.splice(toIndex, 0, fuelSheetDraggedColumn);
      fuelSheetPreferences.order = nextOrder;
      fuelSheetDraggedColumn = '';
      renderDocuments();
    }

    function startFuelColumnResize(event, columnId) {
      event.preventDefault();
      event.stopPropagation();
      const startX = event.clientX;
      const startWidth = getFuelSheetColumnWidth(columnId);
      const onMove = (moveEvent) => {
        fuelSheetPreferences.widths[columnId] = Math.max(90, startWidth + moveEvent.clientX - startX);
        renderDocuments();
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        saveFuelSheetPreferences();
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    }

    function openFinanceEntryFromDocuments(entryId) {
      viewFinanceEntryById(entryId);
    }

    function getFuelSheetExportRows() {
      const definitions = getFuelSheetColumnDefinitions();
      const visibleColumns = getVisibleFuelSheetColumns();
      return getFilteredFuelSheetRows().map(row => visibleColumns.reduce((acc, columnId) => {
        const definition = definitions[columnId];
        const value = getFuelSheetRawValue(row, columnId);
        acc[definition.label] = definition.type === 'date'
          ? formatDate(value)
          : (definition.type === 'currency'
            ? Number(value || 0)
            : value);
        return acc;
      }, {}));
    }

    function exportFuelSheet(type = 'xlsx') {
      closeFuelExportMenu();
      const rows = getFuelSheetExportRows();
      if (!rows.length) {
        showToast('Não há registros para exportar.');
        return;
      }
      if (type === 'pdf') {
        printFuelSheet(true);
        return;
      }
      if (!window.XLSX) {
        showToast('Biblioteca de exportação ainda não carregada.');
        return;
      }
      const workbook = XLSX.utils.book_new();
      const sheet = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, sheet, 'Abastecimentos');
      XLSX.writeFile(workbook, `registro_abastecimentos.${type}`, { bookType: type === 'xls' ? 'xls' : 'xlsx' });
    }

    function printFuelSheet(asPdf = false) {
      const rows = getFuelSheetExportRows();
      const headers = Object.keys(rows[0] || {});
      if (!rows.length) {
        showToast('Não há registros para imprimir.');
        return;
      }
      const printWindow = window.open('', '_blank', 'width=1200,height=900');
      if (!printWindow) {
        showToast('Não foi possível abrir a impressão.');
        return;
      }
      printWindow.document.open();
      printWindow.document.write(`
        <!doctype html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Registro de Abastecimentos</title>
          <style>
            body { font-family: Arial, sans-serif; color: #0f172a; padding: 24px; }
            h1 { font-size: 22px; margin: 0 0 6px; }
            p { margin: 0 0 18px; color: #64748b; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th, td { border: 1px solid #cbd5e1; padding: 7px; text-align: left; }
            th { background: #eef2ff; text-transform: uppercase; font-size: 10px; }
          </style>
        </head>
        <body>
          <h1>Registro de Abastecimentos</h1>
          <p>${rows.length.toLocaleString('pt-BR')} registro(s) conforme filtros e colunas visíveis.</p>
          <table>
            <thead><tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead>
            <tbody>
              ${rows.map(row => `<tr>${headers.map(header => `<td>${escapeHtml(row[header])}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function () { setTimeout(function () { window.print(); ${asPdf ? '' : ''} }, 200); };
          <\/script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }

    function triggerFuelSheetImport() {
      document.getElementById('fuel-sheet-import-input')?.click();
    }

    function normalizeFuelSheetImportKey(value) {
      return normalizeSearchText(value).replace(/[^a-z0-9]/g, '');
    }

    function readFuelImportCell(row, keys) {
      const normalizedMap = Object.entries(row).reduce((acc, [key, value]) => {
        acc[normalizeFuelSheetImportKey(key)] = value;
        return acc;
      }, {});
      const foundKey = keys.map(normalizeFuelSheetImportKey).find(key => Object.prototype.hasOwnProperty.call(normalizedMap, key));
      return foundKey ? normalizedMap[foundKey] : '';
    }

    function parseFuelSheetDateValue(value) {
      if (!value) return '';
      if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
      const text = String(value).trim();
      const brMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (brMatch) return `${brMatch[3]}-${brMatch[2].padStart(2, '0')}-${brMatch[1].padStart(2, '0')}`;
      const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
      return isoMatch ? isoMatch[0] : '';
    }

    function parseFuelSheetNumberValue(value) {
      if (typeof value === 'number') return value;
      const text = String(value || '').trim();
      if (!text) return 0;
      if (text.includes(',') || /R\$/i.test(text)) return parseCurrencyInputValue(text);
      return Number(text.replace(/[^\d.-]/g, '')) || 0;
    }

    function handleFuelSheetImport(event) {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;
      if (!window.XLSX) {
        showToast('Biblioteca de importação ainda não carregada.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        try {
          const workbook = XLSX.read(loadEvent.target.result, { type: 'array', cellDates: true });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: true });
          const payloads = rows.map((row) => {
            const vehicleText = readFuelImportCell(row, ['Veículo', 'Veiculo', 'Placa']);
            const supplierText = readFuelImportCell(row, ['Posto', 'Fornecedor']);
            const driverText = readFuelImportCell(row, ['Motorista']);
            const vehicle = resolveVehicleFromSearch(vehicleText);
            const supplier = resolveSupplierByRelevantTerms(supplierText, allSuppliers.filter(item => item.tipo === 'posto')) || resolveSupplierByRelevantTerms(supplierText);
            const driver = resolveDriverByImportedName(driverText);
            const dataAbastecimento = parseFuelSheetDateValue(readFuelImportCell(row, ['Data abastecimento', 'Data', 'Data/Hora']));
            if (!vehicle || !dataAbastecimento || !supplierText) return null;
            return {
              id: generateId(),
              createdAt: new Date().toISOString(),
              entryType: 'combustivel',
              vehicleId: vehicle.id,
              orderId: '',
              kind: 'despesa',
              kindLabel: 'Despesa',
              supplierId: supplier?.id || '',
              supplierType: supplier?.tipo || 'posto',
              fornecedor: supplier?.nome || String(supplierText || '').trim(),
              fuelType: String(readFuelImportCell(row, ['Tipo de combustível', 'Combustível', 'Combustivel']) || '').trim(),
              km: String(readFuelImportCell(row, ['KM']) || '').replace(/[^\d]/g, ''),
              litros: String(parseDecimalInputValue(readFuelImportCell(row, ['Litros', 'QTD em litros'])) || ''),
              driverId: driver?.id || '',
              comprovanteUrl: String(readFuelImportCell(row, ['Comprovante']) || '').trim(),
              dataAbastecimento,
              dataVencimento: '',
              nf: String(readFuelImportCell(row, ['Nº documento', 'Numero documento', 'NF', 'Nota']) || '').trim(),
              total: parseFuelSheetNumberValue(readFuelImportCell(row, ['Valor'])),
              observacoes: String(readFuelImportCell(row, ['Observações', 'Observacoes']) || '').trim(),
              groupedIntoId: '',
              workflowStatus: 'pendente',
              closedExpense: false,
              discount: 0
            };
          }).filter(Boolean);
          if (!payloads.length) {
            showToast('Nenhum abastecimento válido foi encontrado na planilha.');
            return;
          }
          if (!confirm(`Importar ${payloads.length} abastecimento(s) para o financeiro?`)) return;
          allFinanceEntries = [...payloads.reverse(), ...allFinanceEntries];
          saveToLocalStorage();
          renderAll();
          showToast(`${payloads.length} abastecimento(s) importado(s).`);
        } catch (error) {
          showToast('Não foi possível importar essa planilha.');
        }
      };
      reader.readAsArrayBuffer(file);
    }

    document.addEventListener('click', (event) => {
      const menu = document.getElementById('fuel-filter-menu');
      if (menu && !menu.classList.contains('hidden') && !menu.contains(event.target) && !event.target.closest('.documents-head-btn')) {
        closeFuelColumnMenu();
      }
      const exportMenu = document.getElementById('fuel-export-menu');
      if (exportMenu && !exportMenu.classList.contains('hidden') && !exportMenu.contains(event.target) && !event.target.closest('.documents-export-wrap')) {
        closeFuelExportMenu();
      }
      const columnsPanel = document.getElementById('fuel-columns-panel');
      if (columnsPanel && !columnsPanel.classList.contains('hidden') && !columnsPanel.contains(event.target) && !event.target.closest('[title="Colunas"]')) {
        closeFuelColumnsPanel();
      }
      const reportExportMenu = document.getElementById('report-export-menu');
      if (reportExportMenu && !reportExportMenu.classList.contains('hidden') && !reportExportMenu.contains(event.target) && !event.target.closest('.report-export-wrapper')) {
        toggleReportExportMenu(false);
      }
      const reportColumnsPanel = document.getElementById('report-columns-panel');
      if (reportColumnsPanel && !reportColumnsPanel.classList.contains('hidden') && !reportColumnsPanel.contains(event.target) && !event.target.closest('.report-toolbar')) {
        toggleReportColumnsPanel(false);
      }
    });

    window.openFinanceEntryFromDocuments = openFinanceEntryFromDocuments;
    window.toggleFuelColumnsPanel = toggleFuelColumnsPanel;
    window.toggleFuelExportMenu = toggleFuelExportMenu;
    window.toggleFuelSheetColumn = toggleFuelSheetColumn;
    window.clearFuelSheetFilters = clearFuelSheetFilters;
    window.resetFuelSheetView = resetFuelSheetView;
    window.exportFuelSheet = exportFuelSheet;
    window.printFuelSheet = printFuelSheet;
    window.toggleReportColumnsPanel = toggleReportColumnsPanel;
    window.toggleReportExportMenu = toggleReportExportMenu;
    window.setReportColumnVisibility = setReportColumnVisibility;
    window.moveReportColumn = moveReportColumn;
    window.handleReportColumnDragStart = handleReportColumnDragStart;
    window.handleReportColumnDragEnd = handleReportColumnDragEnd;
    window.handleReportColumnDragOver = handleReportColumnDragOver;
    window.handleReportColumnDragLeave = handleReportColumnDragLeave;
    window.handleReportColumnDrop = handleReportColumnDrop;
    window.handleReportColumnHeaderClick = handleReportColumnHeaderClick;
    window.resetReportColumns = resetReportColumns;
    window.exportReport = exportReport;
    window.triggerFuelSheetImport = triggerFuelSheetImport;
    window.handleFuelSheetImport = handleFuelSheetImport;
    window.setFuelSheetPage = setFuelSheetPage;
    window.openFuelColumnMenu = openFuelColumnMenu;
    window.closeFuelColumnMenu = closeFuelColumnMenu;
    window.sortFuelSheet = sortFuelSheet;
    window.clearFuelSort = clearFuelSort;
    window.setFuelTextFilter = setFuelTextFilter;
    window.toggleFuelFilterValue = toggleFuelFilterValue;
    window.selectAllFuelFilterValues = selectAllFuelFilterValues;
    window.setFuelDateFilter = setFuelDateFilter;
    window.setFuelNumberFilter = setFuelNumberFilter;
    window.clearFuelColumnFilter = clearFuelColumnFilter;
    window.toggleFuelPinnedColumn = toggleFuelPinnedColumn;
    window.moveFuelColumn = moveFuelColumn;
    window.hideFuelSheetColumn = hideFuelSheetColumn;
    window.handleFuelHeaderDragStart = handleFuelHeaderDragStart;
    window.handleFuelHeaderDrop = handleFuelHeaderDrop;
    window.startFuelColumnResize = startFuelColumnResize;

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

    function printCostPerKmDashboard() {
      const filters = getHomeCostPerKmFilters();
      const rows = getVehicleCostStats(filters).filter(item => item.entries > 0).slice(0, 9);
      const maxCostPerKm = Math.max(...rows.map(item => item.costPerKm), 0);
      const printWindow = window.open('', '_blank', 'width=1080,height=900');
      if (!printWindow) {
        showToast('Não foi possível abrir a impressão do dashboard.');
        return;
      }

      const barsHtml = rows.map((item) => {
        const percent = maxCostPerKm > 0 ? Math.max((item.costPerKm / maxCostPerKm) * 100, item.costPerKm > 0 ? 10 : 3) : 3;
        const tone = getCostPerKmTone(item.costPerKm);
        return `
          <div class="bar-item bar-item--${tone}">
            <div class="bar-value">${escapeHtml(formatCurrency(item.costPerKm))}</div>
            <div class="bar-track">
              <div class="bar-fill" style="height:${percent.toFixed(2)}%;"></div>
            </div>
            <div class="bar-label">
              <strong>${escapeHtml(item.frota || '-')}</strong>
              <span>${escapeHtml(item.placa || '-')}</span>
              <small>${escapeHtml(formatCurrency(item.totalCost))} / ${Number(item.totalKm || 0).toLocaleString('pt-BR')} km</small>
            </div>
          </div>
        `;
      }).join('') || '<p>Nenhum abastecimento distribuído em OS para calcular custo por KM.</p>';

      printWindow.document.open();
      printWindow.document.write(`
        <!doctype html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Custo por KM por veículo</title>
          <style>
            * { box-sizing: border-box; font-family: Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            body { margin: 28px; color: #0f172a; }
            .head { display:flex; align-items:flex-start; justify-content:space-between; gap:22px; margin-bottom:28px; }
            .logo { max-width:${getReportLogoStyle().width}px; max-height:${getReportLogoStyle().height}px; object-fit:contain; }
            h1 { margin:0; font-size:26px; }
            p { margin:6px 0 0; color:#64748b; font-size:14px; }
            .chart { display:grid; grid-template-columns:repeat(9, minmax(0, 1fr)); gap:18px; align-items:end; min-height:360px; margin-top:22px; }
            .bar-item { height:330px; display:grid; grid-template-rows:auto 1fr auto; gap:10px; text-align:center; }
            .bar-value { font-size:14px; font-weight:900; color:#334155; }
            .bar-track { display:flex; align-items:flex-end; border:1px solid #dbe3ef; border-radius:20px; background:#f8fafc; overflow:hidden; min-height:220px; }
            .bar-fill { width:100%; min-height:8px; border-radius:18px 18px 0 0; background:linear-gradient(180deg,#94a3b8,#64748b); }
            .bar-item--green .bar-fill { background:linear-gradient(180deg,#4ade80,#16a34a); }
            .bar-item--green .bar-value { color:#15803d; }
            .bar-item--yellow .bar-fill { background:linear-gradient(180deg,#facc15,#f59e0b); }
            .bar-item--yellow .bar-value { color:#b45309; }
            .bar-item--red .bar-fill { background:linear-gradient(180deg,#fb7185,#dc2626); }
            .bar-item--red .bar-value { color:#b91c1c; }
            .bar-item--neutral .bar-fill { background:linear-gradient(180deg,#fb923c,#ea580c); }
            .bar-item--neutral .bar-value { color:#c2410c; }
            .bar-label strong, .bar-label span, .bar-label small { display:block; }
            .bar-label strong { font-size:13px; font-weight:900; }
            .bar-label span { font-size:12px; color:#475569; }
            .bar-label small { font-size:10px; color:#64748b; margin-top:3px; line-height:1.25; }
          </style>
        </head>
        <body>
          <div class="head">
            <div>
              <h1>Custo por KM por veículo</h1>
              <p>${escapeHtml(filters.label)} • apenas abastecimentos distribuídos em OS</p>
            </div>
            <img class="logo" src="${getActiveLogoSrc()}" alt="WeFrotas">
          </div>
          <div class="chart">${barsHtml}</div>
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
      const rawReportData = buildReportData(filters);
      const reportData = getReportDisplayData(rawReportData, filters.type);
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
      const visibleVehicles = getVisibleVehicles();
      const visibleIds = new Set(visibleVehicles.map(vehicle => vehicle.id));
      selectedVehicles = new Set(Array.from(selectedVehicles).filter(id => visibleIds.has(id)));
      const count = selectedVehicles.size;
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
      const visibleDrivers = getVisibleDrivers();
      const visibleIds = new Set(visibleDrivers.map(driver => driver.id));
      selectedDrivers = new Set(Array.from(selectedDrivers).filter(id => visibleIds.has(id)));
      const count = selectedDrivers.size;
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
      const visibleSuppliers = getVisibleSuppliers();
      const visibleIds = new Set(visibleSuppliers.map(supplier => supplier.id));
      selectedSuppliers = new Set(Array.from(selectedSuppliers).filter(id => visibleIds.has(id)));
      const count = selectedSuppliers.size;
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
      const visibleOrders = getFilteredOrders();
      const visibleIds = new Set(visibleOrders.map(order => order.id));
      selectedOrders = new Set(Array.from(selectedOrders).filter(id => visibleIds.has(id)));
      const count = selectedOrders.size;
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
        if (entries.some(entry => entry?.orderId)) {
          return 'Excluir lançamento: despesas alocadas em OS não podem ser excluídas.';
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
        && !entry.orderId
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
        case 'status': return isEntityActive(vehicle) ? 'ativo' : 'inativo';
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
        case 'status': return isEntityActive(driver) ? 'ativo' : 'inativo';
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
        case 'status': return isEntityActive(supplier) ? 'ativo' : 'inativo';
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

    function getEntityCreatedIsoDate(entity) {
      const explicitDate = String(entity?.createdAt || entity?.criadoEm || entity?.$createdAt || '').slice(0, 10);
      if (parseCentralPendingCalendarDate(explicitDate)) return explicitDate;
      const timestamp = Number(String(entity?.id || '').split('_')[0]);
      if (!Number.isFinite(timestamp) || timestamp < 946684800000) return '';
      return centralPendingCalendarIso(new Date(timestamp));
    }

    function matchesEntityStatus(entity, value) {
      if (!value || value === 'todos') return true;
      return value === 'ativo' ? isEntityActive(entity) : !isEntityActive(entity);
    }

    function matchesIsoDateRange(value, start, end) {
      const iso = String(value || '').slice(0, 10);
      if (!iso) return !start && !end;
      return (!start || iso >= start) && (!end || iso <= end);
    }

    function getVisibleVehicles() {
      const quickSearch = normalizeSearchText(getContextualModuleSearchValue('veiculos', 'vehicle-filter-search'));
      const statusFilter = document.getElementById('vehicle-filter-status')?.value || 'todos';
      const startFilter = document.getElementById('vehicle-filter-start')?.value || '';
      const endFilter = document.getElementById('vehicle-filter-end')?.value || '';

      const items = [...allVehicles]
        .filter(vehicle => matchesEntityStatus(vehicle, statusFilter))
        .filter(vehicle => matchesIsoDateRange(vehicle.seguroVencimento, startFilter, endFilter))
        .filter(vehicle => {
          if (!quickSearch) return true;
          const driver = allDrivers.find(item => item.id === vehicle.motoristaId);
          const currentKm = getVehicleCurrentKm(vehicle.id);
          const totalCost = getVehicleDistributedCostTotal(vehicle.id);
          const haystack = normalizeSearchText([
            vehicle.numeroFrota,
            vehicle.placa,
            vehicle.modelo,
            vehicle.ano,
            vehicle.cor,
            vehicle.chassi,
            vehicle.seguroVencimento,
            formatDate(vehicle.seguroVencimento),
            isEntityActive(vehicle) ? 'ativo' : 'inativo',
            driver?.nome,
            currentKm,
            totalCost,
            formatCurrency(totalCost)
          ].join(' '));
          return haystack.includes(quickSearch);
        });
      return sortByState(items, vehicleSortState, getVehicleSortValue);
    }

    function getVisibleDrivers() {
      const quickSearch = normalizeComparableText(getContextualModuleSearchValue('motoristas', 'driver-filter-search'));
      const statusFilter = document.getElementById('driver-filter-status')?.value || 'todos';
      const startFilter = document.getElementById('driver-filter-start')?.value || '';
      const endFilter = document.getElementById('driver-filter-end')?.value || '';

      const items = [...allDrivers]
        .filter(driver => matchesEntityStatus(driver, statusFilter))
        .filter(driver => matchesIsoDateRange(driver.validade, startFilter, endFilter))
        .filter(driver => {
          if (!quickSearch) return true;
          const linkedVehicles = allVehicles.filter(vehicle =>
            (Array.isArray(driver.vehicleIds) && driver.vehicleIds.map(String).includes(String(vehicle.id))) ||
            String(vehicle.motoristaId || '') === String(driver.id)
          );
          const haystack = normalizeComparableText([
            driver.nome,
            driver.cpf,
            driver.cnh,
            driver.telefone,
            driver.categoria,
            driver.validade,
            formatDate(driver.validade),
            isEntityActive(driver) ? 'ativo' : 'inativo',
            ...linkedVehicles.flatMap(vehicle => [vehicle.numeroFrota, vehicle.placa, vehicle.modelo])
          ].join(' '));
          return haystack.includes(quickSearch);
        });
      return sortByState(items, driverSortState, getDriverSortValue);
    }

    function getVisibleSuppliers() {
      const quickSearch = normalizeComparableText(getContextualModuleSearchValue('fornecedores', 'supplier-filter-search'));
      const typeFilter = document.getElementById('supplier-filter-type')?.value || '';
      const statusFilter = document.getElementById('supplier-filter-status')?.value || 'todos';
      const startFilter = document.getElementById('supplier-filter-start')?.value || '';
      const endFilter = document.getElementById('supplier-filter-end')?.value || '';

      const items = [...allSuppliers]
        .filter(supplier => !typeFilter || supplier.tipo === typeFilter)
        .filter(supplier => matchesEntityStatus(supplier, statusFilter))
        .filter(supplier => matchesIsoDateRange(getEntityCreatedIsoDate(supplier), startFilter, endFilter))
        .filter(supplier => {
          if (!quickSearch) return true;
          const haystack = normalizeComparableText([
            supplier.nome,
            supplier.tipoLabel,
            supplier.documento,
            supplier.telefone,
            supplier.email,
            supplier.observacoes,
            supplier.cidade,
            supplier.endereco,
            supplier.mapaUrl,
            getEntityCreatedIsoDate(supplier),
            formatDate(getEntityCreatedIsoDate(supplier)),
            isEntityActive(supplier) ? 'ativo' : 'inativo'
          ].join(' '));
          return haystack.includes(quickSearch);
        });
      return sortByState(items, supplierSortState, getSupplierSortValue);
    }

    function hasActiveVehicleFilters() {
      return Boolean(document.getElementById('vehicle-filter-search')?.value.trim())
        || !['', 'todos'].includes(document.getElementById('vehicle-filter-status')?.value || '')
        || Boolean(document.getElementById('vehicle-filter-start')?.value || document.getElementById('vehicle-filter-end')?.value);
    }

    function hasActiveDriverFilters() {
      return Boolean(document.getElementById('driver-filter-search')?.value.trim())
        || !['', 'todos'].includes(document.getElementById('driver-filter-status')?.value || '')
        || Boolean(document.getElementById('driver-filter-start')?.value || document.getElementById('driver-filter-end')?.value);
    }

    function hasActiveSupplierFilters() {
      return Boolean(document.getElementById('supplier-filter-search')?.value.trim())
        || Boolean(document.getElementById('supplier-filter-type')?.value)
        || !['', 'todos'].includes(document.getElementById('supplier-filter-status')?.value || '')
        || Boolean(document.getElementById('supplier-filter-start')?.value || document.getElementById('supplier-filter-end')?.value);
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
        <div class="orders-table-row entity-table-row--vehicles ${selectedVehicles.has(vehicle.id) ? 'selected' : ''} ${isEntityActive(vehicle) ? '' : 'entity-is-inactive'}" role="button" tabindex="0" onclick="toggleVehicleSelection(event, '${vehicle.id}')" onkeydown="handleVehicleRowSelectionKey(event, '${vehicle.id}')">
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
              <span class="mini-badge ${isEntityActive(vehicle) ? '' : 'mini-badge--inactive'}">Veículo ${isEntityActive(vehicle) ? 'ativo' : 'inativo'}</span>
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
        <div class="orders-table-row entity-table-row--drivers ${selectedDrivers.has(driver.id) ? 'selected' : ''} ${isEntityActive(driver) ? '' : 'entity-is-inactive'}" role="button" tabindex="0" onclick="toggleDriverSelection(event, '${driver.id}')" onkeydown="handleDriverRowSelectionKey(event, '${driver.id}')">
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
              <span class="mini-badge ${isEntityActive(driver) ? '' : 'mini-badge--inactive'}">Motorista ${isEntityActive(driver) ? 'ativo' : 'inativo'}</span>
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
        <div class="orders-table-row entity-table-row--suppliers ${selectedSuppliers.has(supplier.id) ? 'selected' : ''} ${isEntityActive(supplier) ? '' : 'entity-is-inactive'}" role="button" tabindex="0" onclick="toggleSupplierSelection(event, '${supplier.id}')" onkeydown="handleSupplierRowSelectionKey(event, '${supplier.id}')">
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
              <span class="mini-badge ${isEntityActive(supplier) ? '' : 'mini-badge--inactive'}">Parceiro ${isEntityActive(supplier) ? 'ativo' : 'inativo'}</span>
            </div>
        </div>
      `).join('');
      updateEntityListViewport('suppliers-list-shell', visibleSuppliers.length);
      updateSimpleSortIndicators('data-supplier-sort-indicator', supplierSortState);
      updateSupplierSelectionUI();
    }

    function getFilteredOrders() {
      const quickSearch = normalizeSearchText(getContextualModuleSearchValue('orders', 'order-filter-search'));
      const start = document.getElementById('order-filter-start')?.value || '';
      const end = document.getElementById('order-filter-end')?.value || '';
      const status = document.getElementById('order-filter-status')?.value || '';
      const sort = document.getElementById('order-filter-sort')?.value || 'recentes';

      let items = [...allOrders];
      if (orderVehicleFilterId) items = items.filter(order => order.vehicleId === orderVehicleFilterId);
      if (start) items = items.filter(order => !order.dataInicio || order.dataInicio >= start);
      if (end) items = items.filter(order => !order.dataInicio || order.dataInicio <= end);
      if (status === 'ativas') {
        items = items.filter(order => ['aberta', 'andamento'].includes(order.status || 'aberta'));
      } else if (status && status !== 'todos') {
        items = items.filter(order => order.status === status);
      }
      if (quickSearch) {
        items = items.filter(order => {
          const vehicle = allVehicles.find(item => item.id === order.vehicleId);
          const driver = allDrivers.find(item => item.id === order.driverId);
          const total = sumFinanceNetTotal(allFinanceEntries.filter(entry => entry.orderId === order.id));
          const haystack = normalizeSearchText([
            order.numero,
            String(order.numero || '').padStart(4, '0'),
            `OS-${String(order.numero || '').padStart(4, '0')}`,
            `OS ${String(order.numero || '').padStart(4, '0')}`,
            order.status,
            order.descricao,
            order.responsavelNome,
            order.dataInicio,
            order.dataTermino,
            formatDate(order.dataInicio),
            formatDate(order.dataTermino),
            total,
            formatCurrency(total),
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
          const statusPriority = { andamento: 0, aberta: 1, fechada: 2 };
          const statusCompare = (statusPriority[a.order.status || 'aberta'] ?? 3) - (statusPriority[b.order.status || 'aberta'] ?? 3);
          if (statusCompare !== 0) return statusCompare;
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
        const dueDate = entry.dataVencimento || '';
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
            <div class="orders-table-cell">
              <div class="orders-main-text">${dueDate ? escapeHtml(formatDate(dueDate)) : ''}</div>
              <div class="orders-sub-text">${dueDate ? 'Vencimento' : ''}</div>
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
      document.getElementById('order-filter-status').value = 'todos';
      document.getElementById('order-filter-sort').value = 'recentes';
      orderSortState = { key: 'default', direction: 'desc' };
      renderModuleCompactFilterControls('orders');
      updateContextualSearchUi();
      renderOrders();
    }

    function clearFinanceFilters() {
      document.getElementById('finance-filter-search').value = '';
      document.getElementById('finance-filter-status').value = '';
      document.getElementById('finance-filter-start').value = '';
      document.getElementById('finance-filter-end').value = '';
      ['finance-filter-vehicle','finance-filter-supplier','finance-filter-order','finance-filter-nf','finance-filter-due-start','finance-filter-due-end'].forEach(id => { const node=document.getElementById(id); if(node) node.value=''; });
      financeSortState = { key: 'default', direction: 'desc' };
      renderModuleCompactFilterControls('financeiro');
      updateContextualSearchUi();
      renderFinance();
    }

    const moduleFilterClearActions = {
      orders: clearOrderFilters,
      financeiro: clearFinanceFilters,
      veiculos: clearVehicleFilters,
      motoristas: clearDriverFilters,
      fornecedores: clearSupplierFilters,
      documentos: clearCentralPendingFilters
    };
    const moduleFilterRenderActions = {
      orders: renderOrders,
      financeiro: renderFinance,
      veiculos: renderVehicles,
      motoristas: renderDrivers,
      fornecedores: renderSuppliers
    };
    const moduleFilterApplyActions = {
      documentos: applyCentralPendingFilters
    };
    function getModuleFiltersModal(module) {
      return document.querySelector(`.module-filters-modal[data-filter-module="${module}"]`) || document.querySelector(`#panel-${module} .module-filters-modal`);
    }
    function openModuleFilters(module) {
      const modal = getModuleFiltersModal(module);
      if (!modal) return;
      if (modal.parentElement !== document.body) document.body.append(modal);
      modal.classList.add('is-open');
      document.body.classList.add('module-filters-open');
    }
    function closeModuleFilters(module) {
      getModuleFiltersModal(module)?.classList.remove('is-open');
      document.body.classList.remove('module-filters-open');
    }
    function applyModuleFilters(module) {
      closeModuleFilters(module);
      if (moduleFilterApplyActions[module]) moduleFilterApplyActions[module]();
      else moduleFilterRenderActions[module]?.();
    }
    function clearModuleFilters(module) { moduleFilterClearActions[module]?.(); }
    window.openModuleFilters = openModuleFilters;
    window.closeModuleFilters = closeModuleFilters;
    window.applyModuleFilters = applyModuleFilters;
    window.clearModuleFilters = clearModuleFilters;

    const moduleCompactFilterConfigs = {
      orders: {
        statusInputId: 'order-filter-status', startInputId: 'order-filter-start', endInputId: 'order-filter-end', dateLabel: 'Abertura',
        statuses: [['todos', 'Todos'], ['ativas', 'Abertas e em andamento'], ['aberta', 'Abertas'], ['andamento', 'Em andamento'], ['fechada', 'Fechadas']]
      },
      financeiro: {
        statusInputId: 'finance-filter-status', startInputId: 'finance-filter-start', endInputId: 'finance-filter-end', dateLabel: 'Lançamento',
        statuses: [['', 'Todos'], ['pendente', 'Pendentes'], ['pendente_os', 'Pendentes de OS'], ['distribuido', 'Finalizados'], ['agrupado', 'Agrupados']]
      },
      veiculos: {
        statusInputId: 'vehicle-filter-status', startInputId: 'vehicle-filter-start', endInputId: 'vehicle-filter-end', dateLabel: 'Seguro',
        statuses: [['todos', 'Todos'], ['ativo', 'Ativos'], ['inativo', 'Inativos']]
      },
      motoristas: {
        statusInputId: 'driver-filter-status', startInputId: 'driver-filter-start', endInputId: 'driver-filter-end', dateLabel: 'CNH',
        statuses: [['todos', 'Todos'], ['ativo', 'Ativos'], ['inativo', 'Inativos']]
      },
      fornecedores: {
        statusInputId: 'supplier-filter-status', startInputId: 'supplier-filter-start', endInputId: 'supplier-filter-end', dateLabel: 'Cadastro',
        statuses: [['todos', 'Todos'], ['ativo', 'Ativos'], ['inativo', 'Inativos']]
      }
    };
    let moduleCompactCalendarState = {
      module: '', month: null, selectingEnd: false, view: 'days', draftStart: '', draftEnd: ''
    };

    function getModuleCompactFilterValue(module, key) {
      const id = moduleCompactFilterConfigs[module]?.[key];
      return id ? (document.getElementById(id)?.value || '') : '';
    }

    function renderModuleCompactFilterControls(module) {
      const config = moduleCompactFilterConfigs[module];
      if (!config) return;
      const status = getModuleCompactFilterValue(module, 'statusInputId');
      const selectedStatus = config.statuses.find(([value]) => value === status) || config.statuses[0];
      const statusLabel = document.getElementById(`module-compact-status-label-${module}`);
      if (statusLabel) statusLabel.textContent = selectedStatus[1];
      document.querySelectorAll(`[data-module-status="${module}"]`).forEach((button) => {
        const active = button.dataset.moduleStatusValue === selectedStatus[0];
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-current', active ? 'true' : 'false');
      });
      const start = formatCentralPendingCalendarDate(getModuleCompactFilterValue(module, 'startInputId'));
      const end = formatCentralPendingCalendarDate(getModuleCompactFilterValue(module, 'endInputId'));
      const dateLabel = document.getElementById(`module-compact-date-label-${module}`);
      if (dateLabel) dateLabel.textContent = start ? `${start}${end ? ` – ${end}` : ' – …'}` : 'Todas as datas';
      if (moduleCompactCalendarState.module === module) {
        const hint = document.getElementById(`module-compact-calendar-hint-${module}`);
        if (hint) hint.textContent = moduleCompactCalendarState.selectingEnd && moduleCompactCalendarState.draftStart && !moduleCompactCalendarState.draftEnd
          ? 'Agora escolha a data final.'
          : (moduleCompactCalendarState.draftStart && moduleCompactCalendarState.draftEnd ? 'Período pronto para filtrar.' : 'Escolha a data inicial.');
      }
    }

    function setModuleCompactStatus(module, value) {
      const config = moduleCompactFilterConfigs[module];
      if (!config || !config.statuses.some(([option]) => option === value)) return;
      const field = document.getElementById(config.statusInputId);
      if (field) field.value = value;
      const details = document.getElementById(`module-compact-status-${module}`);
      if (details) details.open = false;
      renderModuleCompactFilterControls(module);
      moduleFilterRenderActions[module]?.();
    }

    function renderModuleCompactCalendar(module) {
      const state = moduleCompactCalendarState;
      const months = document.getElementById(`module-compact-calendar-months-${module}`);
      if (!months || state.module !== module) return;
      if (!(state.month instanceof Date)) state.month = new Date();
      const todayIso = centralPendingCalendarIso(new Date());
      const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
      const year = state.month.getFullYear();
      const month = state.month.getMonth();
      const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(state.month);
      const pickerHead = `<div class="central-pending-calendar-picker-head"><button type="button" onclick="event.stopPropagation(); setModuleCompactCalendarView('${module}', 'months')">${monthName}</button><button type="button" onclick="event.stopPropagation(); setModuleCompactCalendarView('${module}', 'years')">${year}</button></div>`;
      if (state.view === 'months') {
        const names = Array.from({ length: 12 }, (_, index) => new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(year, index, 1)).replace('.', ''));
        months.innerHTML = `<section class="central-pending-calendar-month">${pickerHead}<div class="central-pending-calendar-options is-months">${names.map((name, index) => `<button type="button" class="${index === month ? 'is-selected' : ''}" onclick="event.stopPropagation(); chooseModuleCompactCalendarMonth('${module}', ${index})">${name}</button>`).join('')}</div></section>`;
      } else if (state.view === 'years') {
        const firstYear = Math.floor(year / 12) * 12;
        months.innerHTML = `<section class="central-pending-calendar-month">${pickerHead}<div class="central-pending-calendar-options is-years">${Array.from({ length: 12 }, (_, index) => firstYear + index).map(optionYear => `<button type="button" class="${optionYear === year ? 'is-selected' : ''}" onclick="event.stopPropagation(); chooseModuleCompactCalendarYear('${module}', ${optionYear})">${optionYear}</button>`).join('')}</div></section>`;
      } else {
        const firstWeekday = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const blanks = Array.from({ length: firstWeekday }, () => '<span class="central-pending-calendar-day is-placeholder"></span>').join('');
        const days = Array.from({ length: daysInMonth }, (_, index) => {
          const iso = centralPendingCalendarIso(new Date(year, month, index + 1));
          const classes = ['central-pending-calendar-day'];
          if (iso === todayIso) classes.push('is-today');
          if (iso === state.draftStart) classes.push('is-start');
          if (iso === state.draftEnd) classes.push('is-end');
          if (state.draftStart && state.draftEnd && iso > state.draftStart && iso < state.draftEnd) classes.push('is-in-range');
          return `<button type="button" class="${classes.join(' ')}" data-date="${iso}" aria-label="${formatCentralPendingCalendarDate(iso)}" onclick="event.stopPropagation(); selectModuleCompactCalendarDate('${module}', '${iso}')">${index + 1}</button>`;
        }).join('');
        months.innerHTML = `<section class="central-pending-calendar-month">${pickerHead}<div class="central-pending-calendar-weekdays">${weekdays.map(day => `<span>${day}</span>`).join('')}</div><div class="central-pending-calendar-days">${blanks}${days}</div></section>`;
      }
      renderModuleCompactFilterControls(module);
    }

    function closeModuleCompactCalendars() {
      document.querySelectorAll('.module-compact-calendar.is-open').forEach((calendar) => {
        calendar.classList.remove('is-open');
        calendar.setAttribute('aria-hidden', 'true');
      });
      document.querySelectorAll('.module-compact-date-button[aria-expanded="true"]').forEach(button => button.setAttribute('aria-expanded', 'false'));
      document.querySelectorAll('.orders-sticky-table-header.has-open-calendar').forEach(header => header.classList.remove('has-open-calendar'));
      document.body.classList.remove('central-calendar-open');
      moduleCompactCalendarState.module = '';
    }

    function toggleModuleCompactCalendar(module, forceOpen) {
      const config = moduleCompactFilterConfigs[module];
      const calendar = document.getElementById(`module-compact-calendar-${module}`);
      const button = document.getElementById(`module-compact-date-button-${module}`);
      if (!config || !calendar || !button) return;
      const open = typeof forceOpen === 'boolean' ? forceOpen : !calendar.classList.contains('is-open');
      closeModuleCompactCalendars();
      if (!open) return;
      toggleCentralPendingCalendar(false);
      moduleCompactCalendarState = {
        module,
        month: null,
        selectingEnd: false,
        view: 'days',
        draftStart: getModuleCompactFilterValue(module, 'startInputId'),
        draftEnd: getModuleCompactFilterValue(module, 'endInputId')
      };
      moduleCompactCalendarState.selectingEnd = Boolean(moduleCompactCalendarState.draftStart && !moduleCompactCalendarState.draftEnd);
      const selected = parseCentralPendingCalendarDate(moduleCompactCalendarState.draftStart) || new Date();
      moduleCompactCalendarState.month = new Date(selected.getFullYear(), selected.getMonth(), 1);
      calendar.classList.add('is-open');
      calendar.setAttribute('aria-hidden', 'false');
      button.setAttribute('aria-expanded', 'true');
      button.closest('.orders-sticky-table-header')?.classList.add('has-open-calendar');
      document.body.classList.add('central-calendar-open');
      renderModuleCompactCalendar(module);
    }

    function moveModuleCompactCalendar(module, offset) {
      if (moduleCompactCalendarState.module !== module) return;
      const state = moduleCompactCalendarState;
      const step = state.view === 'years' ? 12 : (state.view === 'months' ? 1 : 0);
      state.month = step
        ? new Date(state.month.getFullYear() + (Number(offset || 0) * step), state.month.getMonth(), 1)
        : new Date(state.month.getFullYear(), state.month.getMonth() + Number(offset || 0), 1);
      renderModuleCompactCalendar(module);
    }

    function setModuleCompactCalendarView(module, view) {
      if (moduleCompactCalendarState.module !== module) return;
      moduleCompactCalendarState.view = ['days', 'months', 'years'].includes(view) ? view : 'days';
      renderModuleCompactCalendar(module);
    }

    function chooseModuleCompactCalendarMonth(module, month) {
      if (moduleCompactCalendarState.module !== module) return;
      const state = moduleCompactCalendarState;
      state.month = new Date(state.month.getFullYear(), Math.max(0, Math.min(11, Number(month))), 1);
      state.view = 'days';
      renderModuleCompactCalendar(module);
    }

    function chooseModuleCompactCalendarYear(module, year) {
      if (moduleCompactCalendarState.module !== module) return;
      const state = moduleCompactCalendarState;
      const normalizedYear = Math.max(1000, Math.min(9999, Number(year)));
      state.month = new Date(normalizedYear, state.month.getMonth(), 1);
      state.view = 'months';
      renderModuleCompactCalendar(module);
    }

    function selectModuleCompactCalendarDate(module, value) {
      if (moduleCompactCalendarState.module !== module) return;
      const iso = centralPendingCalendarIso(parseCentralPendingCalendarDate(value));
      if (!iso) return;
      const state = moduleCompactCalendarState;
      if (!state.draftStart || state.draftEnd || !state.selectingEnd) {
        state.draftStart = iso;
        state.draftEnd = '';
        state.selectingEnd = true;
      } else if (iso < state.draftStart) {
        state.draftStart = iso;
      } else {
        state.draftEnd = iso;
        state.selectingEnd = false;
      }
      renderModuleCompactCalendar(module);
    }

    function clearModuleCompactDateRange(module) {
      if (moduleCompactCalendarState.module !== module) return;
      moduleCompactCalendarState.draftStart = '';
      moduleCompactCalendarState.draftEnd = '';
      moduleCompactCalendarState.selectingEnd = false;
      moduleCompactCalendarState.view = 'days';
      renderModuleCompactCalendar(module);
    }

    function applyModuleCompactDateRange(module) {
      const config = moduleCompactFilterConfigs[module];
      if (!config || moduleCompactCalendarState.module !== module) return;
      const start = moduleCompactCalendarState.draftStart;
      const end = moduleCompactCalendarState.draftEnd || start;
      const startField = document.getElementById(config.startInputId);
      const endField = document.getElementById(config.endInputId);
      if (startField) startField.value = start;
      if (endField) endField.value = end;
      renderModuleCompactFilterControls(module);
      moduleFilterRenderActions[module]?.();
      closeModuleCompactCalendars();
    }

    Object.assign(window, {
      setModuleCompactStatus,
      toggleModuleCompactCalendar,
      moveModuleCompactCalendar,
      setModuleCompactCalendarView,
      chooseModuleCompactCalendarMonth,
      chooseModuleCompactCalendarYear,
      selectModuleCompactCalendarDate,
      clearModuleCompactDateRange,
      applyModuleCompactDateRange
    });

    function clearVehicleFilters() {
      document.getElementById('vehicle-filter-search').value = '';
      document.getElementById('vehicle-filter-status').value = 'todos';
      document.getElementById('vehicle-filter-start').value = '';
      document.getElementById('vehicle-filter-end').value = '';
      vehicleSortState = { key: 'fleet', direction: 'asc' };
      renderModuleCompactFilterControls('veiculos');
      updateContextualSearchUi();
      renderVehicles();
    }

    function clearDriverFilters() {
      document.getElementById('driver-filter-search').value = '';
      document.getElementById('driver-filter-status').value = 'todos';
      document.getElementById('driver-filter-start').value = '';
      document.getElementById('driver-filter-end').value = '';
      driverSortState = { key: 'name', direction: 'asc' };
      renderModuleCompactFilterControls('motoristas');
      updateContextualSearchUi();
      renderDrivers();
    }

    function clearSupplierFilters() {
      document.getElementById('supplier-filter-search').value = '';
      document.getElementById('supplier-filter-type').value = '';
      document.getElementById('supplier-filter-status').value = 'todos';
      document.getElementById('supplier-filter-start').value = '';
      document.getElementById('supplier-filter-end').value = '';
      supplierSortState = { key: 'name', direction: 'asc' };
      renderModuleCompactFilterControls('fornecedores');
      updateContextualSearchUi();
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
      document.getElementById('vehicle-active').checked = isEntityActive(vehicle);
      setVehicleImagePreview(vehicle.vehicleImageUrl || vehicle.imageUrl || '');
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
      document.getElementById('driver-active').checked = isEntityActive(driver);
      document.getElementById('modal-title').textContent = 'Editar motorista';
    }

    function openSupplierEditor(supplier) {
      if (!supplier) return;
      openCadastroModal('supplier');
      currentEditingId = supplier.id;
      document.getElementById('supplier-name').value = supplier.nome || '';
      document.getElementById('supplier-type').value = supplier.tipo || '';
      syncCustomSelectById('supplier-type');
      syncSupplierCityLabel();
      document.getElementById('supplier-document').value = supplier.documento || '';
      document.getElementById('supplier-phone').value = supplier.telefone || '';
      const supplierCitySelect = document.getElementById('supplier-city');
      if (supplierCitySelect && supplier.cidade && !Array.from(supplierCitySelect.options).some((option) => option.value === supplier.cidade)) {
        supplierCitySelect.add(new Option(`${supplier.cidade} (cidade oculta)`, supplier.cidade));
      }
      if (supplierCitySelect) supplierCitySelect.value = supplier.cidade || '';
      document.getElementById('supplier-address').value = supplier.endereco || '';
      document.getElementById('supplier-map-url').value = supplier.mapaUrl || '';
      document.getElementById('supplier-email').value = supplier.email || '';
      document.getElementById('supplier-notes').value = supplier.observacoes || '';
      document.getElementById('supplier-active').checked = isEntityActive(supplier);
      document.getElementById('modal-title').textContent = 'Editar fornecedor';
    }

    function syncSupplierCityLabel() {
      const label = document.getElementById('supplier-city-label');
      if (!label) return;
      label.textContent = document.getElementById('supplier-type')?.value === 'posto' ? 'Cidade do posto' : 'Cidade';
    }

    function editSelectedSupplier() {
      if (selectedSuppliers.size !== 1) {
        showToast('Selecione apenas um fornecedor para editar.');
        return;
      }
      const id = Array.from(selectedSuppliers)[0];
      const supplier = allSuppliers.find(item => item.id === id);
      openSupplierEditor(supplier);
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
      document.getElementById('order-data-termino').dataset.autoEndDate = order.dataTermino || '';
      document.getElementById('order-status').value = order.status || 'aberta';
      updateOrderDateConstraints();
      ['order-tipo-os', 'order-administracao', 'order-veiculo', 'order-driver', 'order-status'].forEach(syncCustomSelectById);
      document.getElementById('order-descricao').value = order.descricao || '';
      const generatedDescription = getOrderGeneratedDescription(order);
      document.getElementById('order-descricao').dataset.generatedDescription = order.descricao === generatedDescription ? generatedDescription : '';
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

    async function confirmOperationalDeletion(successMessage) {
      renderAll();
      showToast('Sincronizando exclusão…');
      try {
        await persistOperationalDataImmediately();
        showToast(successMessage);
      } catch (error) {
        // Keep the locally saved pending change for retry; never claim server success.
        showToast(`Exclusão pendente de sincronização: ${error?.message || 'falha na conexão'}`);
      }
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
          return confirmOperationalDeletion('Veículo(s) excluído(s) e sincronizado(s).');
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
          return confirmOperationalDeletion('Motorista(s) excluído(s) e sincronizado(s).');
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
          return confirmOperationalDeletion('Fornecedor(es) excluído(s) e sincronizado(s).');
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
      if (selectedEntries.some(entry => entry.orderId)) {
        showToast('Despesa alocada em OS não pode ser excluída. Remova o vínculo pela OS antes.');
        return;
      }

      const selectedCount = selectedEntries.length;
      const hasAllocatedEntry = selectedEntries.some(entry =>
        !isFinanceGroupEntry(entry)
        && (['pendente_os', 'distribuido'].includes(getFinanceEntryStatus(entry)) || !!entry.orderId || !!entry.closedExpense)
      );
      openPromptModal({
        mode: hasAllocatedEntry ? 'prompt' : 'confirm',
        title: selectedCount === 1 ? 'Excluir lançamento' : 'Excluir lançamentos',
        text: hasAllocatedEntry
          ? (selectedCount === 1
            ? 'Este lançamento está alocado em OS. Informe o motivo para estornar o vínculo da OS e excluir o lançamento.'
            : `Existem lançamentos alocados em OS nesta seleção. Informe o motivo para estornar os vínculos das OS e excluir os ${selectedCount} lançamentos.`)
          : (selectedCount === 1
            ? 'Tem certeza que deseja excluir este lançamento? Essa ação não poderá ser desfeita.'
            : `Tem certeza que deseja excluir ${selectedCount} lançamentos? Essa ação não poderá ser desfeita.`),
        placeholder: 'Ex.: lançamento duplicado, nota errada, correção de OS...',
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        onConfirm: async (justification) => {
          const impactedOrderIds = selectedEntries.map(entry => entry.orderId).filter(Boolean);
          if (hasAllocatedEntry && impactedOrderIds.length) {
            const impactedOrderSet = new Set(impactedOrderIds);
            const historyEntry = createOrderHistoryEntry(
              'finance_reversal',
              `${justification} (${selectedCount} lançamento${selectedCount === 1 ? '' : 's'} excluído${selectedCount === 1 ? '' : 's'} após estorno).`
            );
            allOrders = allOrders.map(order => impactedOrderSet.has(order.id) ? appendOrderHistory(order, historyEntry) : order);
          }
          allFinanceEntries = allFinanceEntries.filter(entry => !selectedFinance.has(entry.id));
          syncOrderStatusesAfterFinancialReversal(impactedOrderIds);
          const centralEntries = selectedEntries.filter(entry => entry.centralRecordId || entry.id);
          selectedFinance.clear();
          saveToLocalStorage();
          renderAll();
          await returnDeletedEntriesToCentral(centralEntries);
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
        title: selectedCount === 1 ? 'Estornar despesa' : 'Estornar despesas',
        text: selectedCount === 1
          ? 'Informe o motivo do estorno. A despesa voltará para pendente e essa justificativa ficará no Histórico da OS.'
          : `Informe o motivo do estorno de ${selectedCount} despesas. Elas voltarão para pendente e essa justificativa ficará no Histórico da OS.`,
        placeholder: 'Ex.: nota lançada na OS errada, correção de agrupamento, ajuste financeiro...',
        confirmLabel: 'Estornar',
        cancelLabel: 'Cancelar',
        onConfirm: (justification) => {
          const impactedOrderIds = selectedEntries.map(entry => entry.orderId).filter(Boolean);
          const impactedOrderSet = new Set(impactedOrderIds);
          allFinanceEntries = allFinanceEntries.map((entry) => {
            if (!selectedFinance.has(entry.id)) return entry;
            return {
              ...entry,
              orderId: '',
              workflowStatus: 'pendente',
              closedExpense: false
            };
          });
          if (impactedOrderSet.size) {
            const historyEntry = createOrderHistoryEntry(
              'finance_reversal',
              `${justification} (${selectedCount} lançamento${selectedCount === 1 ? '' : 's'} estornado${selectedCount === 1 ? '' : 's'}).`
            );
            allOrders = allOrders.map(order => impactedOrderSet.has(order.id) ? appendOrderHistory(order, historyEntry) : order);
          }
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
        onConfirm: async () => {
          allOrders = allOrders.map(order => closableIds.has(order.id)
            ? { ...order, status: 'fechada', dataTermino: order.dataTermino || getLocalIsoDate() }
            : order);
          try {
            await persistOperationalDataImmediately();
          } catch (error) {
            renderAll();
            showToast('Fechamento NÃO confirmado no servidor. Cópia local pendente; não considere a OS salva.');
            return;
          }
          renderAll();
          showToast(`OS fechada${closableIds.size === 1 ? '' : 's'} com sucesso.`);
        }
      });
    }

    function createOrderHistoryEntry(type, reason) {
      const now = new Date();
      const dateIso = getLocalIsoDate();
      return {
        type,
        date: dateIso,
        dateLabel: formatDate(dateIso),
        timeLabel: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        reason
      };
    }

    function appendOrderHistory(order, entry) {
      return {
        ...order,
        reopenHistory: [
          ...(Array.isArray(order.reopenHistory) ? order.reopenHistory : []),
          entry
        ]
      };
    }

    function getOrderHistoryTypeLabel(type) {
      if (type === 'description_edit') return 'Edição da descrição';
      if (type === 'finance_reversal') return 'Estorno de despesa';
      if (type === 'order_reopen') return 'Reabertura';
      return 'Movimentação';
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
            type: 'order_reopen',
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
          const historyEntry = createOrderHistoryEntry('order_reopen', justification);
          allOrders = allOrders.map(order => reopenableIds.has(order.id)
            ? appendOrderHistory({ ...order, status: 'aberta' }, historyEntry)
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
          <td>${escapeHtml(getOrderHistoryTypeLabel(item.type))}</td>
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
            ${reopenHistory.length ? `<h2 class="reopen-title">Histórico da OS</h2><table class="reopen-table"><thead><tr><th style="width:8%;">#</th><th style="width:16%;">Data</th><th style="width:12%;">Hora</th><th style="width:22%;">Movimentação</th><th>Justificativa</th></tr></thead><tbody>${reopenRows}</tbody></table>` : ''}
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
          <td>${escapeHtml(getOrderHistoryTypeLabel(item.type))}</td>
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
                  <div class="title-line">Histórico da OS</div>
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
                  <th style="width:16%;">Data</th>
                  <th style="width:12%;">Hora</th>
                  <th style="width:22%;">Movimentação</th>
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
          <td>${escapeHtml(getOrderHistoryTypeLabel(item.type))}</td>
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
                    <div class="title-line">Histórico da OS</div>
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
                    <th style="width:16%;">Data</th>
                    <th style="width:12%;">Hora</th>
                    <th style="width:22%;">Movimentação</th>
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
      renderDocuments();
      renderReports();
    }

    function getBatchOrderRevisionKm(vehicle) {
      const currentKm = vehicle ? getVehicleCurrentKm(vehicle.id) : null;
      if (currentKm === null || Number.isNaN(currentKm)) return 0;
      return Math.ceil(currentKm / 10000) * 10000 || 10000;
    }

    function buildBatchOrderDescription(item, vehicle) {
      const tipoOs = item.tipoOs || 'avulsa';
      const manualDescription = String(item.descricao || '').trim();
      if (manualDescription) return manualDescription;
      return getOrderTypeDescription(tipoOs, {
        dataInicio: item.dataInicio || '',
        vehicle,
        revisionKm: getBatchOrderRevisionKm(vehicle)
      });
    }

    function createBatchOrdersFromPayload(payload = {}) {
      const items = Array.isArray(payload.items) ? payload.items : [];
      const validItems = [];
      const nextAdministrations = [];

      items.forEach((item) => {
        const vehicle = allVehicles.find(vehicleItem => vehicleItem.id === item.vehicleId);
        if (!vehicle) return;

        const tipoOs = item.tipoOs || 'avulsa';
        const dataInicio = item.dataInicio || '';
        const dataTermino = item.dataTermino || '';
        const administracao = String(item.administracao || '').trim();
        const status = item.status || 'aberta';
        const descricao = buildBatchOrderDescription(item, vehicle);

        if (!validateOrderDateRange(dataInicio, dataTermino)) {
          throw new Error('Revise as datas: a data de fim não pode ser anterior à data de início.');
        }
        if (!descricao) {
          throw new Error('Preencha a descrição para OS avulsa ou selecione um tipo com descrição automática.');
        }
        if (administracao) nextAdministrations.push(administracao);

        validItems.push({
          vehicle,
          tipoOs,
          dataInicio,
          dataTermino,
          administracao,
          status,
          descricao
        });
      });

      if (!validItems.length) {
        throw new Error('Selecione ao menos um veículo para abrir OS em lote.');
      }

      const firstNumber = getNextOrderCounterValue();
      const createdOrders = validItems.map((item, index) => {
        const driverId = item.vehicle.motoristaId || '';
        return {
          id: generateId(),
          numero: String(firstNumber + index),
          administracao: item.administracao,
          tipoOs: item.tipoOs,
          vehicleId: item.vehicle.id,
          driverId,
          responsavelNome: getDriverLabel(driverId),
          dataInicio: item.dataInicio,
          dataTermino: item.dataTermino,
          status: item.status,
          descricao: item.descricao
        };
      });

      allOrders = [...createdOrders, ...allOrders];
      if (nextAdministrations.length) {
        allAdministrations = normalizeAdministrationList([...allAdministrations, ...nextAdministrations]);
      }
      syncOrderCounterWithOrders();
      saveToLocalStorage();
      renderAll();
      showToast(`${createdOrders.length} OS criada${createdOrders.length === 1 ? '' : 's'} em lote com sucesso.`);
      return createdOrders;
    }

    window.wefrotasBatchOrdersApi = {
      getVehicles: () => getActiveSortedVehicles().map(vehicle => ({
        id: vehicle.id,
        numeroFrota: vehicle.numeroFrota || '',
        placa: vehicle.placa || '',
        modelo: vehicle.modelo || '',
        motoristaId: vehicle.motoristaId || '',
        currentKm: getVehicleCurrentKm(vehicle.id)
      })),
      getAdministrations: () => getAdministrationOptions(),
      getDefaultAdministration: () => getLastAdministrationValue(),
      getLocalIsoDate,
      buildDescription: (item = {}) => {
        const vehicle = allVehicles.find(vehicleItem => vehicleItem.id === item.vehicleId);
        return buildBatchOrderDescription(item, vehicle);
      },
      createOrders: createBatchOrdersFromPayload
    };

    document.getElementById('cadastro-form').addEventListener('submit', async function (event) {
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
        const ativo = document.getElementById('vehicle-active')?.checked !== false;
        const vehicleImageInput = document.getElementById('vehicle-image-file');
        const vehicleImageFile = vehicleImageInput?.files?.[0] || null;
        const currentVehicle = currentEditingId ? allVehicles.find(vehicle => vehicle.id === currentEditingId) : null;
        let vehicleImageUrl = vehicleImageInput?.dataset.removeExisting === 'true'
          ? ''
          : String(currentVehicle?.vehicleImageUrl || currentVehicle?.imageUrl || '');
        let vehicleImageFileId = vehicleImageInput?.dataset.removeExisting === 'true'
          ? ''
          : String(currentVehicle?.vehicleImageFileId || '');
        if (!numeroFrota || !placa || !modelo || !ano) {
          showToast('Preencha número de frota, placa, modelo e ano.');
          return;
        }
        if (findVehicleDuplicate({ numeroFrota, placa }, currentEditingId)) {
          showToast('Já existe um veículo com essa frota ou placa cadastrada.');
          return;
        }
        if (vehicleImageFile) {
          const submitButton = document.getElementById('modal-submit-btn');
          const submitLabel = submitButton?.querySelector('span');
          if (submitButton) submitButton.disabled = true;
          if (submitLabel) submitLabel.textContent = 'Enviando foto...';
          try {
            const uploadedImage = await window.WeFrotasBackend?.uploadVehicleImage?.(vehicleImageFile);
            if (!uploadedImage?.imageUrl) throw new Error('O serviço de upload da foto não está disponível.');
            vehicleImageUrl = uploadedImage.imageUrl;
            vehicleImageFileId = uploadedImage.fileId || '';
          } catch (error) {
            if (submitButton) submitButton.disabled = false;
            if (submitLabel) submitLabel.textContent = currentEditingId ? 'Salvar alterações' : 'Salvar cadastro';
            showToast(error?.message || 'Não foi possível enviar a foto do veículo.');
            return;
          }
        }
        const vehicleWasEdited = Boolean(currentEditingId);
        if (currentEditingId) {
          allVehicles = allVehicles.map(vehicle => vehicle.id === currentEditingId
            ? { ...vehicle, numeroFrota, placa, modelo, ano, cor, seguroVencimento, motoristaId, chassi, ativo, vehicleImageUrl, vehicleImageFileId }
            : vehicle);
          syncDriversWithVehicle(currentEditingId, motoristaId);
        } else {
          const newVehicleId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          allVehicles.unshift({ id: newVehicleId, createdAt: new Date().toISOString(), numeroFrota, placa, modelo, ano, cor, seguroVencimento, motoristaId, chassi, ativo, vehicleImageUrl, vehicleImageFileId });
          syncDriversWithVehicle(newVehicleId, motoristaId);
        }
        renderAll();
        const submitButton = document.getElementById('modal-submit-btn');
        const submitLabel = submitButton?.querySelector('span');
        if (submitButton) submitButton.disabled = true;
        if (submitLabel) submitLabel.textContent = 'Salvando e sincronizando...';
        try {
          await persistOperationalDataImmediately();
          showToast(vehicleWasEdited ? 'Veículo atualizado e sincronizado.' : 'Veículo cadastrado e sincronizado.');
        } catch (error) {
          console.error('O veículo foi preservado localmente, mas a confirmação online falhou.', error);
          showToast('Veículo salvo neste dispositivo. A sincronização online continua pendente.');
        }
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
        const ativo = document.getElementById('driver-active')?.checked !== false;
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
        const driverWasEdited = Boolean(currentEditingId);
        if (currentEditingId) {
          allDrivers = allDrivers.map(driver => driver.id === currentEditingId
            ? { ...driver, nome, cpf, cnh, categoria, telefone, validade, vehicleIds, ativo }
            : driver);
          syncVehiclesWithDriver(currentEditingId, vehicleIds);
        } else {
          const newDriverId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          allDrivers.unshift({ id: newDriverId, createdAt: new Date().toISOString(), nome, cpf, cnh, categoria, telefone, validade, vehicleIds, ativo });
          syncVehiclesWithDriver(newDriverId, vehicleIds);
        }
        renderAll();
        const submitButton = document.getElementById('modal-submit-btn');
        const submitLabel = submitButton?.querySelector('span');
        if (submitButton) submitButton.disabled = true;
        if (submitLabel) submitLabel.textContent = 'Salvando e sincronizando...';
        try {
          await persistOperationalDataImmediately();
          showToast(driverWasEdited ? 'Motorista atualizado e sincronizado.' : 'Motorista cadastrado e sincronizado.');
        } catch (error) {
          console.error('O motorista foi preservado localmente, mas a confirmação online falhou.', error);
          showToast('Motorista salvo neste dispositivo. A sincronização online continua pendente.');
        }
        closeCadastroModal();
      }

      if (currentModalType === 'supplier') {
        const nome = document.getElementById('supplier-name').value.trim();
        const tipo = document.getElementById('supplier-type').value;
        const documento = formatCpfOrCnpj(document.getElementById('supplier-document').value.trim());
        const telefone = document.getElementById('supplier-phone').value.trim();
        const cidade = document.getElementById('supplier-city').value.trim();
        const endereco = document.getElementById('supplier-address').value.trim();
        const mapaUrl = document.getElementById('supplier-map-url').value.trim();
        const email = document.getElementById('supplier-email').value.trim();
        const observacoes = document.getElementById('supplier-notes').value.trim();
        const ativo = document.getElementById('supplier-active')?.checked !== false;
        if (!nome || !tipo) {
          showToast('Preencha o nome do parceiro e o tipo de fornecedor.');
          return;
        }
        if (tipo === 'posto' && (!cidade || !endereco)) {
          showToast('Para publicar um posto na Central, informe cidade e endereço.');
          return;
        }
        if (mapaUrl && !/^https?:\/\//i.test(mapaUrl)) {
          showToast('Informe um link válido do Google Maps, iniciado por https://.');
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
        if (findSupplierDuplicate({ nome, tipo, documento, cidade }, currentEditingId)) {
          showToast('Já existe um fornecedor igual cadastrado.');
          return;
        }
        const tipoLabel = getSupplierTypeLabel(tipo);
        if (currentEditingId) {
          allSuppliers = allSuppliers.map(supplier => supplier.id === currentEditingId
            ? { ...supplier, nome, tipo, tipoLabel, documento, telefone, cidade, endereco, mapaUrl, email, observacoes, ativo }
            : supplier);
          showToast('Fornecedor atualizado com sucesso.');
        } else {
          allSuppliers.unshift({ id: generateId(), createdAt: new Date().toISOString(), nome, tipo, tipoLabel, documento, telefone, cidade, endereco, mapaUrl, email, observacoes, ativo });
          showToast('Fornecedor cadastrado com sucesso.');
        }
        saveToLocalStorage();
        renderAll();
        if (activeCentralConfigSection === 'cidades') renderCentralCities();
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
          const previousOrder = allOrders.find(order => order.id === currentEditingId);
          const nextOrderPayload = { numero, administracao, tipoOs, vehicleId, driverId, responsavelNome, dataInicio, dataTermino, status, descricao };
          const persistUpdatedOrder = async (historyEntry = null) => {
            allOrders = allOrders.map(order => {
              if (order.id !== currentEditingId) return order;
              const updatedOrder = { ...order, ...nextOrderPayload };
              return historyEntry ? appendOrderHistory(updatedOrder, historyEntry) : updatedOrder;
            });
            syncOrderCounterWithOrders();
            try { await persistOperationalDataImmediately(); }
            catch (error) { renderAll(); showToast(`OS não confirmada no servidor: ${error.message}`); return; }
            renderAll();
            closeCadastroModal();
            showToast('OS atualizada com sucesso.');
          };

          if (previousOrder && String(previousOrder.descricao || '').trim() !== descricao) {
            openPromptModal({
              title: 'Justificar alteração da OS',
              text: 'Informe o motivo da alteração na descrição do serviço. Essa justificativa ficará no Histórico da OS.',
              placeholder: 'Ex.: ajuste da referência mensal, revisão corrigida, complemento do serviço...',
              confirmLabel: 'Salvar alteração',
              cancelLabel: 'Cancelar',
              onConfirm: (justification) => persistUpdatedOrder(createOrderHistoryEntry('description_edit', justification))
            });
            return;
          }
          await persistUpdatedOrder();
          return;
        } else {
          allOrders.unshift({ id: generateId(), numero, administracao, tipoOs, vehicleId, driverId, responsavelNome, dataInicio, dataTermino, status, descricao });
          syncOrderCounterWithOrders();
        }
        try { await persistOperationalDataImmediately(); }
        catch (error) { renderAll(); showToast(`OS não confirmada no servidor: ${error.message}`); return; }
        showToast('OS cadastrada e sincronizada.');
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
          const litros = String(parseDecimalInputValue(document.getElementById('finance-litros')?.value || '') || '');
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
        try {
          await persistFinanceImmediately();
        } catch (error) {
          renderAll();
          showToast('Fechamento NÃO confirmado no servidor. Cópia local pendente; não considere a despesa salva.');
          return;
        }
        renderAll();
        closeCadastroModal();
        showToast('Despesa fechada e distribuída com sucesso.');
        return;
      }
    });

    async function initializeWeFrotas() {
      initializeSettingsPage();
      await loadFromStorage();
      if (syncAllocatedOrderStatuses()) saveToLocalStorage();
      initializeCentralManagement();
      updateStickyTableOffset();
      setupStickyTableHeaders();
      setupUnifiedModuleHeaders();
      renderAll();
      updateModuleHeader('home');
      updateContextualSearchUi();
      applySidebarState();
      applyThemeState(localStorage.getItem('wefrotas_theme') === 'dark');
      renderNotifications();
      updateCustomLogoUi();
      updateManagerIdentityUi();
      updateOperationSettingsUi();
      try {
        await connectWeFrotasOnline();
      } catch (error) {
        console.error('Não foi possível iniciar o backend do WeFrotas.', error);
        toggleOnlineLogin(true, 'Não foi possível validar seu acesso. Atualize a página e tente novamente.');
        updateOnlineStatus({
          state: 'error',
          message: 'Não foi possível validar o acesso online.'
        });
      }
    }

    function updateStickyTableOffset() {
      const topbar = document.querySelector('.app-topbar');
      if (!topbar) return;
      document.documentElement.style.setProperty('--wefrotas-topbar-height', `${Math.ceil(topbar.getBoundingClientRect().height)}px`);
    }

    function setupStickyTableHeaders() {
      document.querySelectorAll('.orders-table-shell').forEach((shell) => {
        const toolbar = shell.querySelector(':scope > .orders-toolbar');
        const scroll = shell.querySelector(':scope > .orders-table-scroll');
        if (!toolbar || !scroll || shell.querySelector(':scope > .orders-sticky-table-header')) return;
        const stickyHeader = document.createElement('div');
        stickyHeader.className = 'orders-sticky-table-header';
        shell.insertBefore(stickyHeader, scroll);
        stickyHeader.append(toolbar);
      });
    }

    function setupUnifiedModuleHeaders() {
      Object.entries(contextualModuleSearchFields).forEach(([module, searchFieldId]) => {
        const panel = document.getElementById(`panel-${module}`);
        const filterShell = panel?.querySelector(':scope > .orders-filter-shell');
        const stickyHeader = panel?.querySelector('.orders-sticky-table-header');
        const toolbar = stickyHeader?.querySelector(':scope > .orders-toolbar');
        const selection = toolbar?.querySelector('.orders-selection-wrap');
        const searchField = document.getElementById(searchFieldId);
        const config = moduleCompactFilterConfigs[module];
        if (!filterShell || !stickyHeader || !toolbar || !config) return;
        filterShell.classList.add('contextual-module-filter-source');
        if (selection && selection.parentElement !== stickyHeader) {
          selection.classList.add('module-selection-sticky');
          stickyHeader.insertBefore(selection, stickyHeader.firstChild);
        }
        if (!stickyHeader.querySelector(`.module-compact-filters[data-module="${module}"]`)) {
          const controls = document.createElement('div');
          controls.className = 'module-compact-filters';
          controls.dataset.module = module;
          controls.innerHTML = `
            <details id="module-compact-status-${module}" class="central-pending-status-filter module-compact-status-filter">
              <summary aria-label="Filtrar ${module} por status">
                <span>Status</span>
                <strong id="module-compact-status-label-${module}">${escapeHtml(config.statuses[0][1])}</strong>
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 9l6 6 6-6"/></svg>
              </summary>
              <div class="central-pending-status-menu" role="menu" aria-label="Opções de status">
                ${config.statuses.map(([value, label]) => `<button type="button" data-module-status="${module}" data-module-status-value="${escapeHtml(value)}" onclick="setModuleCompactStatus('${module}', '${escapeHtml(value)}')">${escapeHtml(label)}</button>`).join('')}
              </div>
            </details>
            <div class="central-pending-date-range module-compact-date-range">
              <button id="module-compact-date-button-${module}" class="central-pending-date-range-button module-compact-date-button" type="button" aria-haspopup="dialog" aria-expanded="false" onclick="toggleModuleCompactCalendar('${module}')">
                <span>${escapeHtml(config.dateLabel)}</span>
                <strong id="module-compact-date-label-${module}">Todas as datas</strong>
                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M7 3v3M17 3v3M4 8h16M6 5h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z"/></svg>
              </button>
              <div id="module-compact-calendar-${module}" class="central-pending-calendar module-compact-calendar" role="dialog" aria-label="Selecionar período de ${module}" aria-hidden="true">
                <div class="central-pending-calendar-head">
                  <button type="button" aria-label="Mês anterior" onclick="event.stopPropagation(); moveModuleCompactCalendar('${module}', -1)">‹</button>
                  <strong>Selecionar período</strong>
                  <button type="button" aria-label="Próximo mês" onclick="event.stopPropagation(); moveModuleCompactCalendar('${module}', 1)">›</button>
                </div>
                <div id="module-compact-calendar-months-${module}" class="central-pending-calendar-months"></div>
                <div class="central-pending-calendar-footer">
                  <span id="module-compact-calendar-hint-${module}">Escolha a data inicial.</span>
                  <div class="central-pending-calendar-footer-actions">
                    <button type="button" onclick="event.stopPropagation(); clearModuleCompactDateRange('${module}')">Limpar</button>
                    <button class="is-primary" type="button" onclick="event.stopPropagation(); applyModuleCompactDateRange('${module}')">Filtrar</button>
                  </div>
                </div>
              </div>
            </div>
            <button class="filter-action-btn module-compact-clear" type="button" title="Limpar filtros" aria-label="Limpar filtros" onclick="clearModuleFilters('${module}')">⌫</button>`;
          stickyHeader.insertBefore(controls, toolbar);
        }
        searchField?.closest('.orders-filter-field')?.classList.add('is-contextual-search-source');
        renderModuleCompactFilterControls(module);
      });
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (document.querySelector('.module-compact-calendar.is-open')) {
          closeModuleCompactCalendars();
          return;
        }
        if (document.getElementById('central-pending-calendar')?.classList.contains('is-open')) {
          toggleCentralPendingCalendar(false);
          return;
        }
      }
      const openModal = document.querySelector('.module-filters-modal.is-open');
      if (!openModal?.dataset.filterModule) return;
      if (event.key === 'Escape') {
        closeModuleFilters(openModal.dataset.filterModule);
        return;
      }
      if (event.key === 'Enter' && event.target?.closest?.('.orders-filter-field')) {
        event.preventDefault();
        applyModuleFilters(openModal.dataset.filterModule);
      }
    });

    document.addEventListener('click', (event) => {
      if (document.querySelector('.module-compact-calendar.is-open') && !event.target?.closest?.('.module-compact-date-range')) {
        closeModuleCompactCalendars();
      }
      const calendar = document.getElementById('central-pending-calendar');
      if (!calendar?.classList.contains('is-open')) return;
      if (!event.target?.closest?.('.central-pending-date-range')) toggleCentralPendingCalendar(false);
    });

    registerOnlineIdleListeners();
    initializeWeFrotas().catch((error) => {
      console.error('Falha inesperada ao iniciar o WeFrotas.', error);
      toggleOnlineLogin(true, 'Não foi possível iniciar o sistema. Atualize a página e tente novamente.');
    });
    setupOnlinePasswordToggle();
    document.getElementById('online-auth-form')?.addEventListener('submit', loginWeFrotasOnline);
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
    applyCurrencyMaskToInput(document.getElementById('central-pending-value-filter'));
    document.getElementById('finance-filter-search')?.addEventListener('input', renderFinance);
    ['finance-filter-start', 'finance-filter-end', 'finance-filter-status'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', renderFinance);
    });
    ['vehicle-filter-search'].forEach(id => {
      const node = document.getElementById(id);
      if (node) node.addEventListener('input', renderVehicles);
    });
    ['driver-filter-search'].forEach(id => {
      const node = document.getElementById(id);
      if (node) node.addEventListener('input', renderDrivers);
    });
    ['driver-filter-start', 'driver-filter-end', 'driver-filter-status', 'supplier-filter-type'].forEach(id => {
      const node = document.getElementById(id);
      if (node) node.addEventListener('change', id.startsWith('driver-') ? renderDrivers : renderSuppliers);
    });
    ['vehicle-filter-start', 'vehicle-filter-end', 'vehicle-filter-status'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', renderVehicles);
    });
    ['supplier-filter-start', 'supplier-filter-end', 'supplier-filter-status'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', renderSuppliers);
    });
    ['supplier-filter-search'].forEach(id => {
      const node = document.getElementById(id);
      if (node) node.addEventListener('input', renderSuppliers);
    });
    ['report-filter-start', 'report-filter-end'].forEach(id => {
      const node = document.getElementById(id);
      if (node) node.addEventListener('change', applyReportFilters);
    });
    const reportTypeFilter = document.getElementById('report-filter-type');
    if (reportTypeFilter) reportTypeFilter.addEventListener('change', applyReportFilters);
    const reportVehicleFilter = document.getElementById('report-filter-vehicle');
    if (reportVehicleFilter) reportVehicleFilter.addEventListener('change', applyReportFilters);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (document.getElementById('central-banner-modal')?.classList.contains('open')) {
          closeCentralBannerModal();
          return;
        }
        if (document.getElementById('central-city-modal')?.classList.contains('open')) {
          closeCentralCityModal();
          return;
        }
        toggleSettings(false);
        toggleNotifications(false);
        if (window.innerWidth <= 1120) toggleSidebar(false);
      }
    });
    window.addEventListener('resize', () => {
      applySidebarState();
      updateStickyTableOffset();
    });
    document.addEventListener('click', blockDisabledActionClicks, true);
