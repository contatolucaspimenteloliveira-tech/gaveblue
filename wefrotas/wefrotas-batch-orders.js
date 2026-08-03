(function () {
  const state = {
    selectedVehicleIds: new Set(),
    rows: new Map()
  };

  const orderTypeLabels = {
    avulsa: 'Avulsa',
    mensal: 'Mensal de despesas',
    revisao: 'Revisão',
    sinistro: 'Sinistro'
  };

  function getApi() {
    return window.wefrotasBatchOrdersApi || null;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getVehicleLabel(vehicle) {
    return `${vehicle.numeroFrota || '-'} ${vehicle.placa || '-'} ${vehicle.modelo || 'Veículo'}`.trim();
  }

  function getDefaultRow(vehicleId = '') {
    const api = getApi();
    const startDate = document.getElementById('batch-order-default-start')?.value || api?.getLocalIsoDate?.() || '';
    const endDate = document.getElementById('batch-order-default-end')?.value || '';
    const type = document.getElementById('batch-order-default-type')?.value || 'mensal';
    const status = document.getElementById('batch-order-default-status')?.value || 'aberta';
    const administration = document.getElementById('batch-order-default-admin')?.value || api?.getDefaultAdministration?.() || '';
    const description = document.getElementById('batch-order-default-description')?.value || '';
    return {
      vehicleId,
      tipoOs: type,
      dataInicio: startDate,
      dataTermino: endDate,
      administracao: administration,
      status,
      descricao: description
    };
  }

  function ensureRow(vehicleId) {
    if (!state.rows.has(vehicleId)) {
      state.rows.set(vehicleId, getDefaultRow(vehicleId));
    }
    return state.rows.get(vehicleId);
  }

  function injectStyles() {
    if (document.getElementById('batch-order-styles')) return;
    const style = document.createElement('style');
    style.id = 'batch-order-styles';
    style.textContent = `
      .batch-order-backdrop {
        position: fixed;
        inset: 0;
        z-index: 80;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: rgba(15, 23, 42, 0.52);
        backdrop-filter: blur(14px);
      }
      .batch-order-backdrop.hidden {
        display: none;
      }
      .batch-order-card {
        width: min(1180px, 100%);
        max-height: min(92vh, 900px);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid #dbe6f7;
        border-radius: 28px;
        background: #fff;
        box-shadow: 0 28px 80px rgba(15, 23, 42, 0.28);
      }
      .batch-order-header,
      .batch-order-footer {
        flex: 0 0 auto;
        padding: 24px 28px;
      }
      .batch-order-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 20px;
      }
      .batch-order-kicker {
        margin: 0 0 4px;
        color: #7067f0;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 0.22em;
        text-transform: uppercase;
      }
      .batch-order-title {
        margin: 0;
        color: #07142f;
        font-size: clamp(26px, 3vw, 38px);
        font-weight: 950;
        line-height: 1;
      }
      .batch-order-subtitle {
        margin: 10px 0 0;
        color: #64748b;
        font-size: 15px;
      }
      .batch-order-icon {
        width: 58px;
        height: 58px;
        display: grid;
        place-items: center;
        border-radius: 18px;
        color: #fff;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        box-shadow: 0 18px 40px rgba(99, 102, 241, 0.32);
      }
      .batch-order-close {
        width: 56px;
        height: 56px;
        display: grid;
        place-items: center;
        border: 1px solid #dbe6f7;
        border-radius: 18px;
        color: #334155;
        background: #fff;
        transition: 0.2s ease;
      }
      .batch-order-close:hover {
        color: #dc2626;
        border-color: #fecaca;
        background: #fff1f2;
      }
      .batch-order-body {
        flex: 1 1 auto;
        overflow: auto;
        padding: 0 28px 22px;
      }
      .batch-order-section {
        padding: 22px;
        border: 1px solid #dbe6f7;
        border-radius: 24px;
        background: linear-gradient(180deg, #ffffff, #f8fbff);
      }
      .batch-order-section + .batch-order-section {
        margin-top: 18px;
      }
      .batch-order-section-title {
        margin: 0 0 16px;
        color: #0f172a;
        font-size: 18px;
        font-weight: 900;
      }
      .batch-order-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
      }
      .batch-order-field label {
        display: block;
        margin-bottom: 7px;
        color: #64748b;
        font-size: 12px;
        font-weight: 900;
        text-transform: uppercase;
      }
      .batch-order-input,
      .batch-order-select,
      .batch-order-textarea {
        width: 100%;
        min-height: 48px;
        border: 1px solid #d5e0f0;
        border-radius: 16px;
        background: #fff;
        color: #0f172a;
        font: inherit;
        font-size: 14px;
        outline: none;
        padding: 0 14px;
      }
      .batch-order-textarea {
        min-height: 78px;
        resize: vertical;
        padding: 12px 14px;
      }
      .batch-order-input:focus,
      .batch-order-select:focus,
      .batch-order-textarea:focus {
        border-color: #8b5cf6;
        box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.14);
      }
      .batch-order-span-2 {
        grid-column: span 2;
      }
      .batch-order-span-4 {
        grid-column: span 4;
      }
      .batch-order-vehicle-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        max-height: 310px;
        overflow: auto;
        padding-right: 4px;
      }
      .batch-order-vehicle {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        padding: 14px;
        border: 1px solid #dbe6f7;
        border-radius: 18px;
        background: #fff;
        cursor: pointer;
        transition: 0.18s ease;
      }
      .batch-order-vehicle:hover,
      .batch-order-vehicle.is-selected {
        border-color: #8b5cf6;
        background: #f5f3ff;
      }
      .batch-order-vehicle input {
        width: 22px;
        height: 22px;
        accent-color: #7c3aed;
      }
      .batch-order-vehicle strong {
        display: block;
        color: #0f172a;
        font-size: 14px;
        font-weight: 900;
      }
      .batch-order-vehicle span {
        display: block;
        margin-top: 3px;
        color: #64748b;
        font-size: 12px;
      }
      .batch-order-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        margin-bottom: 14px;
      }
      .batch-order-count {
        color: #475569;
        font-size: 14px;
        font-weight: 800;
      }
      .batch-order-link-btn {
        border: 0;
        color: #6d5dfc;
        background: transparent;
        font-weight: 900;
        cursor: pointer;
      }
      .batch-order-row-list {
        display: grid;
        gap: 12px;
      }
      .batch-order-row {
        padding: 16px;
        border: 1px solid #dbe6f7;
        border-radius: 20px;
        background: #fff;
      }
      .batch-order-row-title {
        margin: 0 0 12px;
        color: #0f172a;
        font-size: 15px;
        font-weight: 950;
      }
      .batch-order-empty {
        padding: 28px;
        border: 1px dashed #cbd5e1;
        border-radius: 20px;
        color: #64748b;
        text-align: center;
        font-weight: 700;
      }
      .batch-order-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        background: linear-gradient(180deg, rgba(255,255,255,0.86), #fff);
      }
      .batch-order-btn {
        min-height: 52px;
        border: 1px solid #dbe6f7;
        border-radius: 16px;
        padding: 0 22px;
        background: #fff;
        color: #475569;
        font-weight: 900;
        cursor: pointer;
      }
      .batch-order-btn.primary {
        border: 0;
        color: #fff;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        box-shadow: 0 18px 38px rgba(99, 102, 241, 0.26);
      }
      @media (max-width: 980px) {
        .batch-order-grid,
        .batch-order-vehicle-grid {
          grid-template-columns: 1fr;
        }
        .batch-order-span-2,
        .batch-order-span-4 {
          grid-column: auto;
        }
        .batch-order-header,
        .batch-order-footer,
        .batch-order-body {
          padding-left: 18px;
          padding-right: 18px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function getModalHtml() {
    const api = getApi();
    const today = api?.getLocalIsoDate?.() || '';
    const administrations = api?.getAdministrations?.() || [];
    const defaultAdmin = api?.getDefaultAdministration?.() || '';
    return `
      <div class="batch-order-backdrop hidden" id="batch-order-backdrop" onclick="handleBatchOrderBackdrop(event)">
        <div class="batch-order-card" role="dialog" aria-modal="true" aria-labelledby="batch-order-title">
          <div class="batch-order-header">
            <div style="display:flex; gap:16px; align-items:flex-start;">
              <div class="batch-order-icon" aria-hidden="true">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5v8M4 9h8M17 11v8M13 15h8"/>
                </svg>
              </div>
              <div>
                <p class="batch-order-kicker">Ordens de serviço</p>
                <h2 class="batch-order-title" id="batch-order-title">Abrir OS em lote</h2>
                <p class="batch-order-subtitle">Selecione veículos e ajuste tipo, datas e descrição antes de criar as OS.</p>
              </div>
            </div>
            <button type="button" class="batch-order-close" onclick="closeBatchOrderModal()" aria-label="Fechar">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 6l12 12M18 6L6 18"/>
              </svg>
            </button>
          </div>
          <div class="batch-order-body">
            <section class="batch-order-section">
              <h3 class="batch-order-section-title">Padrão para novas linhas</h3>
              <div class="batch-order-grid">
                <div class="batch-order-field">
                  <label>Tipo de OS</label>
                  <select id="batch-order-default-type" class="batch-order-select">
                    ${Object.entries(orderTypeLabels).map(([value, label]) => `<option value="${value}" ${value === 'mensal' ? 'selected' : ''}>${label}</option>`).join('')}
                  </select>
                </div>
                <div class="batch-order-field">
                  <label>Data de início</label>
                  <input id="batch-order-default-start" class="batch-order-input" type="date" value="${escapeHtml(today)}">
                </div>
                <div class="batch-order-field">
                  <label>Data de fim</label>
                  <input id="batch-order-default-end" class="batch-order-input" type="date">
                </div>
                <div class="batch-order-field">
                  <label>Status</label>
                  <select id="batch-order-default-status" class="batch-order-select">
                    <option value="aberta" selected>Aberta</option>
                    <option value="andamento">Em andamento</option>
                  </select>
                </div>
                <div class="batch-order-field batch-order-span-2">
                  <label>Administração</label>
                  <input id="batch-order-default-admin" class="batch-order-input" list="batch-order-admin-options" value="${escapeHtml(defaultAdmin)}" placeholder="Ex.: Administração">
                  <datalist id="batch-order-admin-options">
                    ${administrations.map(name => `<option value="${escapeHtml(name)}"></option>`).join('')}
                  </datalist>
                </div>
                <div class="batch-order-field batch-order-span-2">
                  <label>Descrição manual opcional</label>
                  <input id="batch-order-default-description" class="batch-order-input" placeholder="Deixe em branco para descrição automática">
                </div>
              </div>
              <div style="margin-top:14px; display:flex; justify-content:flex-end;">
                <button type="button" class="batch-order-link-btn" onclick="applyBatchOrderDefaults()">Aplicar padrão nas OS selecionadas</button>
              </div>
            </section>
            <section class="batch-order-section">
              <div class="batch-order-toolbar">
                <h3 class="batch-order-section-title" style="margin:0;">Veículos</h3>
                <div>
                  <button type="button" class="batch-order-link-btn" onclick="selectAllBatchOrderVehicles()">Selecionar todos</button>
                  <button type="button" class="batch-order-link-btn" onclick="clearBatchOrderVehicles()">Limpar</button>
                </div>
              </div>
              <div id="batch-order-vehicles"></div>
            </section>
            <section class="batch-order-section">
              <div class="batch-order-toolbar">
                <h3 class="batch-order-section-title" style="margin:0;">OS que serão criadas</h3>
                <span id="batch-order-count" class="batch-order-count">0 selecionadas</span>
              </div>
              <div id="batch-order-rows"></div>
            </section>
          </div>
          <div class="batch-order-footer">
            <button type="button" class="batch-order-btn" onclick="closeBatchOrderModal()">Cancelar</button>
            <button type="button" class="batch-order-btn primary" onclick="submitBatchOrders()">Criar OS em lote</button>
          </div>
        </div>
      </div>
    `;
  }

  function ensureModal() {
    injectStyles();
    if (!document.getElementById('batch-order-backdrop')) {
      document.body.insertAdjacentHTML('beforeend', getModalHtml());
    }
  }

  function renderVehicles() {
    const api = getApi();
    const container = document.getElementById('batch-order-vehicles');
    if (!container || !api) return;
    const vehicles = api.getVehicles();
    if (!vehicles.length) {
      container.innerHTML = '<div class="batch-order-empty">Nenhum veículo cadastrado para abrir OS em lote.</div>';
      return;
    }
    container.innerHTML = `
      <div class="batch-order-vehicle-grid">
        ${vehicles.map(vehicle => `
          <label class="batch-order-vehicle ${state.selectedVehicleIds.has(vehicle.id) ? 'is-selected' : ''}">
            <input type="checkbox" value="${escapeHtml(vehicle.id)}" ${state.selectedVehicleIds.has(vehicle.id) ? 'checked' : ''} onchange="toggleBatchOrderVehicle('${escapeHtml(vehicle.id)}', this.checked)">
            <span>
              <strong>${escapeHtml(getVehicleLabel(vehicle))}</strong>
              <span>${vehicle.currentKm === null ? 'KM atual não informado' : `KM atual ${Number(vehicle.currentKm || 0).toLocaleString('pt-BR')}`}</span>
            </span>
          </label>
        `).join('')}
      </div>
    `;
  }

  function renderRows() {
    const api = getApi();
    const container = document.getElementById('batch-order-rows');
    const countNode = document.getElementById('batch-order-count');
    if (!container || !api) return;
    const vehicles = api.getVehicles().filter(vehicle => state.selectedVehicleIds.has(vehicle.id));
    if (countNode) countNode.textContent = `${vehicles.length} selecionada${vehicles.length === 1 ? '' : 's'}`;
    if (!vehicles.length) {
      container.innerHTML = '<div class="batch-order-empty">Selecione veículos acima para preparar as OS.</div>';
      return;
    }
    container.innerHTML = `
      <div class="batch-order-row-list">
        ${vehicles.map(vehicle => {
          const row = ensureRow(vehicle.id);
          const automaticDescription = api.buildDescription({ ...row, descricao: '' }) || 'Descrição manual obrigatória para OS avulsa.';
          return `
            <div class="batch-order-row" data-batch-row="${escapeHtml(vehicle.id)}">
              <p class="batch-order-row-title">${escapeHtml(getVehicleLabel(vehicle))}</p>
              <div class="batch-order-grid">
                <div class="batch-order-field">
                  <label>Tipo</label>
                  <select class="batch-order-select" data-field="tipoOs" onchange="updateBatchOrderRow('${escapeHtml(vehicle.id)}')">
                    ${Object.entries(orderTypeLabels).map(([value, label]) => `<option value="${value}" ${row.tipoOs === value ? 'selected' : ''}>${label}</option>`).join('')}
                  </select>
                </div>
                <div class="batch-order-field">
                  <label>Início</label>
                  <input class="batch-order-input" data-field="dataInicio" type="date" value="${escapeHtml(row.dataInicio)}" onchange="updateBatchOrderRow('${escapeHtml(vehicle.id)}')">
                </div>
                <div class="batch-order-field">
                  <label>Fim</label>
                  <input class="batch-order-input" data-field="dataTermino" type="date" value="${escapeHtml(row.dataTermino)}" onchange="updateBatchOrderRow('${escapeHtml(vehicle.id)}')">
                </div>
                <div class="batch-order-field">
                  <label>Status</label>
                  <select class="batch-order-select" data-field="status" onchange="updateBatchOrderRow('${escapeHtml(vehicle.id)}')">
                    <option value="aberta" ${row.status === 'aberta' ? 'selected' : ''}>Aberta</option>
                    <option value="andamento" ${row.status === 'andamento' ? 'selected' : ''}>Em andamento</option>
                  </select>
                </div>
                <div class="batch-order-field batch-order-span-2">
                  <label>Administração</label>
                  <input class="batch-order-input" data-field="administracao" value="${escapeHtml(row.administracao)}" onchange="updateBatchOrderRow('${escapeHtml(vehicle.id)}')" placeholder="Administração">
                </div>
                <div class="batch-order-field batch-order-span-2">
                  <label>Descrição</label>
                  <input class="batch-order-input" data-field="descricao" value="${escapeHtml(row.descricao)}" onchange="updateBatchOrderRow('${escapeHtml(vehicle.id)}')" placeholder="${escapeHtml(automaticDescription)}">
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderModal() {
    renderVehicles();
    renderRows();
  }

  window.openBatchOrderModal = function openBatchOrderModal() {
    if (!getApi()) {
      alert('O módulo de OS em lote ainda não terminou de carregar.');
      return;
    }
    ensureModal();
    state.selectedVehicleIds.clear();
    state.rows.clear();
    renderModal();
    document.getElementById('batch-order-backdrop')?.classList.remove('hidden');
  };

  window.closeBatchOrderModal = function closeBatchOrderModal() {
    document.getElementById('batch-order-backdrop')?.classList.add('hidden');
  };

  window.handleBatchOrderBackdrop = function handleBatchOrderBackdrop(event) {
    if (event.target?.id === 'batch-order-backdrop') {
      window.closeBatchOrderModal();
    }
  };

  window.toggleBatchOrderVehicle = function toggleBatchOrderVehicle(vehicleId, checked) {
    if (checked) {
      state.selectedVehicleIds.add(vehicleId);
      ensureRow(vehicleId);
    } else {
      state.selectedVehicleIds.delete(vehicleId);
    }
    renderModal();
  };

  window.selectAllBatchOrderVehicles = function selectAllBatchOrderVehicles() {
    const api = getApi();
    if (!api) return;
    api.getVehicles().forEach(vehicle => {
      state.selectedVehicleIds.add(vehicle.id);
      ensureRow(vehicle.id);
    });
    renderModal();
  };

  window.clearBatchOrderVehicles = function clearBatchOrderVehicles() {
    state.selectedVehicleIds.clear();
    renderModal();
  };

  window.applyBatchOrderDefaults = function applyBatchOrderDefaults() {
    state.selectedVehicleIds.forEach(vehicleId => {
      state.rows.set(vehicleId, getDefaultRow(vehicleId));
    });
    renderRows();
  };

  window.updateBatchOrderRow = function updateBatchOrderRow(vehicleId) {
    const rowNode = Array.from(document.querySelectorAll('[data-batch-row]'))
      .find(node => node.dataset.batchRow === vehicleId);
    if (!rowNode) return;
    const row = ensureRow(vehicleId);
    rowNode.querySelectorAll('[data-field]').forEach(field => {
      row[field.dataset.field] = field.value;
    });
    state.rows.set(vehicleId, row);
  };

  window.submitBatchOrders = function submitBatchOrders() {
    const api = getApi();
    if (!api) return;
    const items = Array.from(state.selectedVehicleIds).map(vehicleId => state.rows.get(vehicleId) || getDefaultRow(vehicleId));
    if (!items.length) {
      alert('Selecione ao menos um veículo para criar OS em lote.');
      return;
    }

    const confirmed = window.confirm(`Você está prestes a criar ${items.length} OS. Deseja continuar?`);
    if (!confirmed) return;

    try {
      api.createOrders({ items });
      window.closeBatchOrderModal();
    } catch (error) {
      alert(error?.message || 'Não foi possível criar as OS em lote.');
    }
  };
})();
