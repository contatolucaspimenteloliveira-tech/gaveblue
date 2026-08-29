let lastCnpjData = null;
    let lastCnpjDigits = null;
    let cepMode = 'direct';

    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty('--mouse-x', `${x}%`);
      document.documentElement.style.setProperty('--mouse-y', `${y}%`);
    });

    document.querySelectorAll('.feature-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--card-mouse-x', `${x}px`);
        card.style.setProperty('--card-mouse-y', `${y}px`);
      });
    });

    const defaultConfig = {
      hero_title: 'Consulte dados empresariais com mais agilidade',
      hero_subtitle: 'Acesse consultas úteis como CEP e CNPJ em uma experiência simples, rápida e pensada para facilitar sua rotina.'
    };
    let config = { ...defaultConfig };
    let banksCache = null;

    const mobileSearchBtn = document.getElementById('mobile-search-btn');
    const globalSearchInputEl = document.getElementById('global-search-input');
    const globalSearchResultsEl = document.getElementById('global-search-results');
    const searchFocusOverlayEl = document.getElementById('search-focus-overlay');
    const ecosystemModules = [
      { name: 'WeTime', description: 'Relógio online e painel de horário', url: 'https://gaveblue.com/wetime' },
      { name: 'WeRecibos', description: 'Gerador de recibos', url: 'https://gaveblue.com/recibos' },
      { name: 'WeConsultas', description: 'Consultas empresariais', url: 'https://gaveblue.com/weconsultas' },
      { name: 'WeFrotas', description: 'Gestão de frotas', url: 'https://gaveblue.com/wefrotas' },
      { name: 'WeDevs', description: 'Ferramentas e utilidades dev', url: 'https://gaveblue.com/wedevs' },
      { name: 'WeTasks', description: 'Tarefas e organização', url: 'https://gaveblue.com/wetasks' }
    ];
    let filteredModules = [];
    let highlightedModuleIndex = -1;

    function escapeGlobalSearchHtml(value) {
      return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
    }

    function navigateToModule(url) {
      window.location.href = url;
    }

    function hideGlobalSearchResults() {
      globalSearchResultsEl.classList.add('hidden');
      searchFocusOverlayEl.classList.add('hidden');
      if (window.innerWidth <= 640) {
        globalSearchInputEl.closest('.global-search')?.classList.remove('mobile-open');
        globalSearchInputEl.value = '';
      }
      highlightedModuleIndex = -1;
    }

    function syncHighlightedGlobalSearchItem() {
      const items = globalSearchResultsEl.querySelectorAll('.global-search-item');
      items.forEach((item, index) => {
        item.classList.toggle('active', index === highlightedModuleIndex);
      });
    }

    function renderGlobalSearchResults(modules) {
      filteredModules = modules;
      highlightedModuleIndex = modules.length ? 0 : -1;

      if (!modules.length) {
        globalSearchResultsEl.innerHTML = '<div class="global-search-empty">Nenhum módulo encontrado.</div>';
        globalSearchResultsEl.classList.remove('hidden');
        searchFocusOverlayEl.classList.remove('hidden');
        return;
      }

      globalSearchResultsEl.innerHTML = modules.map((module, index) => `
        <button type="button" class="global-search-item${index === highlightedModuleIndex ? ' active' : ''}" data-url="${module.url}">
          <span>
            <span class="global-search-kicker">Ecossistema GaveBlue</span>
            <span class="block font-semibold text-sm">${escapeGlobalSearchHtml(module.name)}</span>
            <span class="global-search-route">${escapeGlobalSearchHtml(module.description)}</span>
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:rgba(191,219,254,0.95)">
            <path d="M7 17L17 7" stroke-width="2" stroke-linecap="round"></path>
            <path d="M9 7H17V15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        </button>
      `).join('');

      globalSearchResultsEl.classList.remove('hidden');
      searchFocusOverlayEl.classList.remove('hidden');
    }

    function updateGlobalSearch(query) {
      const normalizedQuery = query.trim().toLowerCase();
      if (!normalizedQuery) {
        renderGlobalSearchResults(ecosystemModules);
        return;
      }

      const modules = ecosystemModules.filter((module) =>
        module.name.toLowerCase().includes(normalizedQuery) ||
        module.description.toLowerCase().includes(normalizedQuery)
      );

      renderGlobalSearchResults(modules);
    }

    if (window.elementSdk) {
      window.elementSdk.init({
        defaultConfig,
        onConfigChange: async (newConfig) => {
          config = { ...defaultConfig, ...newConfig };
          if (newConfig.hero_title) document.getElementById('hero-title').textContent = newConfig.hero_title;
          if (newConfig.hero_subtitle) document.getElementById('hero-subtitle').textContent = newConfig.hero_subtitle;
        },
        mapToCapabilities: () => ({
          recolorables: [],
          borderables: [],
          fontEditable: undefined,
          fontSizeable: undefined
        }),
        mapToEditPanelValues: (cfg) => new Map([
          ['hero_title', cfg.hero_title || defaultConfig.hero_title],
          ['hero_subtitle', cfg.hero_subtitle || defaultConfig.hero_subtitle]
        ])
      });
    }

    function switchTab(tab) {
      const heroBlock = document.getElementById('hero-block');
      const panels = {
        home: document.getElementById('home-tab'),
        content: document.getElementById('content-tab'),
        help: document.getElementById('help-tab')
      };

      Object.entries(panels).forEach(([key, panel]) => {
        panel.classList.toggle('hidden', key !== tab);
        panel.classList.toggle('block', key === tab);
      });

      if (tab === 'content') {
        heroBlock.classList.add('hidden');
      } else {
        heroBlock.classList.remove('hidden');
      }
    }

    function sairApp() {
      window.location.href = 'https://gaveblue.com.br/';
    }

    globalSearchInputEl.addEventListener('input', (event) => {
      updateGlobalSearch(event.target.value);
    });

    globalSearchInputEl.addEventListener('focus', (event) => {
      updateGlobalSearch(event.target.value);
    });

    mobileSearchBtn?.addEventListener('click', (event) => {
      event.stopPropagation();
      const wrapper = globalSearchInputEl.closest('.global-search');
      wrapper?.classList.add('mobile-open');
      setTimeout(() => globalSearchInputEl.focus(), 20);
    });

    globalSearchInputEl.addEventListener('keydown', (event) => {
      if (globalSearchResultsEl.classList.contains('hidden')) {
        if (event.key === 'Enter' && globalSearchInputEl.value.trim()) {
          updateGlobalSearch(globalSearchInputEl.value);
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
        hideGlobalSearchResults();
      }
    });

    globalSearchResultsEl.addEventListener('click', (event) => {
      const item = event.target.closest('.global-search-item');
      if (!item) return;
      navigateToModule(item.dataset.url);
    });

    document.addEventListener('click', (event) => {
      const searchWrapper = globalSearchInputEl.closest('.global-search');
      if (
        !globalSearchResultsEl.contains(event.target) &&
        !globalSearchInputEl.contains(event.target) &&
        !searchWrapper?.contains(event.target) &&
        !mobileSearchBtn?.contains(event.target)
      ) {
        hideGlobalSearchResults();
      }
    });

    function openScreen(type) {
      switchTab('content');
      document.getElementById('hero-title').scrollIntoView({ behavior: 'smooth' });
      document.querySelectorAll('.query-section').forEach(s => s.classList.remove('active'));
      document.getElementById('cards-container').classList.add('hidden');
      document.getElementById(type + '-screen').classList.add('active');
      if (type === 'cep') document.getElementById('cep-input').focus();
      if (type === 'cnpj') document.getElementById('cnpj-input').focus();
      if (type === 'banks') document.getElementById('banks-input').focus();
      if (type === 'ibge') document.getElementById('ibge-input').focus();
      if (type === 'holidays') document.getElementById('holidays-input').focus();
    }

    function goHome() {
      document.querySelectorAll('.query-section').forEach(s => s.classList.remove('active'));
      document.getElementById('cards-container').classList.remove('hidden');
      document.getElementById('result-cep').classList.add('result-hidden');
      document.getElementById('result-cnpj').classList.add('result-hidden');
      document.getElementById('result-banks').classList.add('result-hidden');
      document.getElementById('result-ibge').classList.add('result-hidden');
      document.getElementById('result-holidays').classList.add('result-hidden');
      document.getElementById('cep-input').value = '';
      document.getElementById('cep-reverse-uf').value = '';
      document.getElementById('cep-reverse-city').value = '';
      document.getElementById('cep-reverse-street').value = '';
      document.getElementById('cnpj-input').value = '';
      document.getElementById('banks-input').value = '';
      document.getElementById('ibge-input').value = '';
      document.getElementById('holidays-input').value = '';
      switchCepMode('direct');
      switchTab('home');
      document.getElementById('hero-title').scrollIntoView({ behavior: 'smooth' });
    }

    function showError(message) {
      const toast = document.getElementById('error-toast');
      document.getElementById('error-message').textContent = message;
      toast.classList.remove('hidden');
      setTimeout(() => toast.classList.add('hidden'), 4000);
    }

    function showComingSoon() {
      showError('Este recurso estará disponível em breve!');
    }

    function maskCEP(input) {
      let value = input.value.replace(/\D/g, '');
      if (value.length > 5) value = value.substring(0, 5) + '-' + value.substring(5, 8);
      input.value = value;
    }

    function maskCNPJ(input) {
      let value = input.value.replace(/\D/g, '');
      if (value.length > 12) value = value.substring(0, 2) + '.' + value.substring(2, 5) + '.' + value.substring(5, 8) + '/' + value.substring(8, 12) + '-' + value.substring(12, 14);
      else if (value.length > 8) value = value.substring(0, 2) + '.' + value.substring(2, 5) + '.' + value.substring(5, 8) + '/' + value.substring(8);
      else if (value.length > 5) value = value.substring(0, 2) + '.' + value.substring(2, 5) + '.' + value.substring(5);
      else if (value.length > 2) value = value.substring(0, 2) + '.' + value.substring(2);
      input.value = value;
    }

    function handleEnterSubmit(event, type) {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      if (type === 'cep') consultCEP();
      if (type === 'cnpj') consultarCNPJ();
      if (type === 'banks') consultBanks();
      if (type === 'ibge') consultIbge();
      if (type === 'holidays') consultHolidays();
      if (type === 'reverseCep') consultReverseCEP();
    }

    function formatarCNPJResult(cnpj) {
      const limpo = cnpj.replace(/\D/g, '');
      if (limpo.length !== 14) return cnpj;
      return limpo.substring(0, 2) + '.' + limpo.substring(2, 5) + '.' + limpo.substring(5, 8) + '/' + limpo.substring(8, 12) + '-' + limpo.substring(12, 14);
    }

    function switchCepMode(mode) {
      cepMode = mode;
      const directFields = document.getElementById('cep-direct-fields');
      const reverseFields = document.getElementById('cep-reverse-fields');
      const directBtn = document.getElementById('cep-mode-direct-btn');
      const reverseBtn = document.getElementById('cep-mode-reverse-btn');

      const activeClass = 'px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-400/30 text-white font-semibold';
      const inactiveClass = 'px-4 py-2 rounded-xl bg-slate-800/70 border border-slate-600/40 text-slate-300 font-semibold hover:text-white';

      directFields.classList.toggle('hidden', mode !== 'direct');
      reverseFields.classList.toggle('hidden', mode !== 'reverse');
      directBtn.className = mode === 'direct' ? activeClass : inactiveClass;
      reverseBtn.className = mode === 'reverse' ? activeClass : inactiveClass;
    }

    function formatDateBR(iso) {
      if (!iso) return 'Não informado';
      const s = String(iso);
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const [y, m, d] = s.split('-');
        return `${d}/${m}/${y}`;
      }
      try { return new Date(s).toLocaleDateString('pt-BR'); } catch { return s; }
    }

    function formatPhoneBR(dddTel) {
      if (!dddTel) return '';
      const digits = String(dddTel).replace(/\D/g, '');
      if (digits.length < 10) return dddTel;
      const ddd = digits.slice(0, 2);
      const num = digits.slice(2);
      if (num.length === 8) return `(${ddd}) ${num.slice(0, 4)}-${num.slice(4)}`;
      if (num.length === 9) return `(${ddd}) ${num.slice(0, 5)}-${num.slice(5)}`;
      return `(${ddd}) ${num}`;
    }

    function moneyBR(v) {
      const n = Number(v);
      if (!Number.isFinite(n)) return '';
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
    }

    async function consultCEP() {
      const input = document.getElementById('cep-input').value.replace(/\D/g, '');
      if (input.length !== 8) {
        showError('Por favor, digite um CEP válido com 8 dígitos');
        return;
      }

      const btn = document.getElementById('btn-cep');
      btn.disabled = true;
      btn.textContent = 'Consultando...';

      try {
        const response = await fetch(`https://viacep.com.br/ws/${input}/json/`);
        if (!response.ok) throw new Error('Erro na requisição');
        const data = await response.json();

        if (data.erro) {
          showError('CEP não encontrado');
          return;
        }

        const resultDiv = document.getElementById('result-cep');
        resultDiv.classList.remove('result-hidden');

        document.getElementById('cep-data').innerHTML = `
          <div class="grid grid-cols-2 gap-4">
            <div><span class="text-xs text-slate-500 uppercase">CEP</span><p class="text-slate-200 font-medium">${input}</p></div>
            <div><span class="text-xs text-slate-500 uppercase">UF</span><p class="text-slate-200 font-medium">${data.uf || 'N/A'}</p></div>
          </div>
          <div><span class="text-xs text-slate-500 uppercase">Logradouro</span><p class="text-slate-200 font-medium">${data.logradouro || 'Não informado'}</p></div>
          <div class="grid grid-cols-2 gap-4">
            <div><span class="text-xs text-slate-500 uppercase">Bairro</span><p class="text-slate-200 font-medium">${data.bairro || 'N/A'}</p></div>
            <div><span class="text-xs text-slate-500 uppercase">Cidade</span><p class="text-slate-200 font-medium">${data.localidade || 'N/A'}</p></div>
          </div>
        `;
      } catch (error) {
        console.error('Erro CEP:', error);
        showError('Erro ao consultar CEP. Verifique sua conexão.');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Consultar CEP';
      }
    }

    async function consultReverseCEP() {
      const uf = document.getElementById('cep-reverse-uf').value.trim().toUpperCase();
      const city = document.getElementById('cep-reverse-city').value.trim();
      const street = document.getElementById('cep-reverse-street').value.trim();

      if (!uf || !city || !street) {
        showError('Preencha UF, cidade e logradouro para consultar o CEP reverso.');
        return;
      }

      const btn = document.getElementById('btn-reverse-cep');
      btn.disabled = true;
      btn.textContent = 'Consultando...';

      try {
        const url = `https://viacep.com.br/ws/${encodeURIComponent(uf)}/${encodeURIComponent(city)}/${encodeURIComponent(street)}/json/`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro na requisição');
        const data = await response.json();

        const resultDiv = document.getElementById('result-cep');
        resultDiv.classList.remove('result-hidden');

        if (!Array.isArray(data) || !data.length) {
          document.getElementById('cep-data').innerHTML = `<div class="rounded-xl bg-slate-700/30 border border-slate-600/40 p-4 text-slate-300">Nenhum CEP encontrado para <strong>${esc(street)}</strong>, ${esc(city)} - ${esc(uf)}.</div>`;
          return;
        }

        document.getElementById('cep-data').innerHTML = data.slice(0, 10).map(item => `
          <div class="rounded-xl bg-slate-700/30 border border-slate-600/40 p-4">
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <span class="text-xs text-slate-500 uppercase">CEP</span>
                <p class="text-slate-200 font-medium">${esc(item.cep || 'N/A')}</p>
              </div>
              <div>
                <span class="text-xs text-slate-500 uppercase">Bairro</span>
                <p class="text-slate-200 font-medium">${esc(item.bairro || 'N/A')}</p>
              </div>
            </div>
            <div class="mt-3">
              <span class="text-xs text-slate-500 uppercase">Logradouro</span>
              <p class="text-slate-200 font-medium">${esc(item.logradouro || 'Não informado')}</p>
            </div>
            <div class="grid sm:grid-cols-2 gap-4 mt-3">
              <div>
                <span class="text-xs text-slate-500 uppercase">Cidade</span>
                <p class="text-slate-200 font-medium">${esc(item.localidade || 'N/A')}</p>
              </div>
              <div>
                <span class="text-xs text-slate-500 uppercase">UF</span>
                <p class="text-slate-200 font-medium">${esc(item.uf || 'N/A')}</p>
              </div>
            </div>
          </div>
        `).join('');
      } catch (error) {
        console.error('Erro CEP reverso:', error);
        showError('Erro ao consultar CEP reverso. Verifique os dados e tente novamente.');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Consultar CEP reverso';
      }
    }

    async function fetchBanksList() {
      if (banksCache) return banksCache;
      const response = await fetch('https://brasilapi.com.br/api/banks/v1', {
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) throw new Error('Erro ao carregar bancos');
      banksCache = await response.json();
      return banksCache;
    }

    function renderBanksResults(banks, query) {
      const resultDiv = document.getElementById('result-banks');
      const dataDiv = document.getElementById('banks-data');
      const countDiv = document.getElementById('banks-count');
      resultDiv.classList.remove('result-hidden');
      countDiv.textContent = `${banks.length} resultado${banks.length === 1 ? '' : 's'}`;

      if (!banks.length) {
        dataDiv.innerHTML = `<div class="rounded-xl bg-slate-700/30 border border-slate-600/40 p-4 text-slate-300">Nenhum banco encontrado para <strong>${esc(query)}</strong>.</div>`;
        return;
      }

      dataDiv.innerHTML = banks.map(bank => `
        <div class="rounded-xl bg-slate-700/30 border border-slate-600/40 p-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-white font-semibold text-base">${esc(safeText(bank.name, 'Banco não informado'))}</p>
              <p class="text-slate-400 text-sm mt-1">${bank.fullName ? esc(bank.fullName) : 'Nome completo não informado'}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border bg-yellow-500/15 border-yellow-400/25 text-yellow-200">COMPE: ${esc(safeText(bank.code, '-'))}</span>
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border bg-blue-500/15 border-blue-400/25 text-blue-200">ISPB: ${esc(safeText(bank.ispb, '-'))}</span>
            </div>
          </div>
        </div>
      `).join('');
    }

    async function consultBanks() {
      const query = document.getElementById('banks-input').value.trim();
      if (!query) {
        showError('Digite o código ou nome do banco para consultar.');
        return;
      }

      const btn = document.getElementById('btn-banks');
      btn.disabled = true;
      btn.textContent = 'Consultando...';

      try {
        const digitsOnly = query.replace(/\D/g, '');
        let results = [];

        if (digitsOnly && digitsOnly === query) {
          const exactResponse = await fetch(`https://brasilapi.com.br/api/banks/v1/${digitsOnly}`, {
            headers: { 'Accept': 'application/json' }
          });
          if (exactResponse.ok) {
            const exactBank = await exactResponse.json();
            results = [exactBank];
          }
        }

        if (!results.length) {
          const banks = await fetchBanksList();
          const normalized = query.toLowerCase();
          results = banks.filter(bank =>
            String(bank.code || '').includes(digitsOnly || '###never###') ||
            String(bank.name || '').toLowerCase().includes(normalized) ||
            String(bank.fullName || '').toLowerCase().includes(normalized) ||
            String(bank.ispb || '').includes(digitsOnly || '###never###')
          );
        }

        renderBanksResults(results, query);
      } catch (error) {
        console.error('Erro Bancos:', error);
        showError('Erro ao consultar bancos. Tente novamente em instantes.');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Consultar Bancos';
      }
    }

    function renderIbgeResults(items, query) {
      const resultDiv = document.getElementById('result-ibge');
      const dataDiv = document.getElementById('ibge-data');
      const countDiv = document.getElementById('ibge-count');
      resultDiv.classList.remove('result-hidden');
      countDiv.textContent = `${items.length} resultado${items.length === 1 ? '' : 's'}`;

      if (!items.length) {
        dataDiv.innerHTML = `<div class="rounded-xl bg-slate-700/30 border border-slate-600/40 p-4 text-slate-300">Nenhum estado encontrado para <strong>${esc(query)}</strong>.</div>`;
        return;
      }

      dataDiv.innerHTML = items.map(item => `
        <div class="rounded-xl bg-slate-700/30 border border-slate-600/40 p-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-white font-semibold text-base">${esc(safeText(item.nome, 'UF não informada'))}</p>
              <p class="text-slate-400 text-sm mt-1">Região: ${esc(safeText(item.regiao?.nome, 'Não informada'))}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border bg-orange-500/15 border-orange-400/25 text-orange-200">UF: ${esc(safeText(item.sigla, '-'))}</span>
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border bg-blue-500/15 border-blue-400/25 text-blue-200">IBGE: ${esc(String(item.codigo_ibge || item.id || '-'))}</span>
            </div>
          </div>
        </div>
      `).join('');
    }

    async function consultIbge() {
      const query = document.getElementById('ibge-input').value.trim();
      if (!query) {
        showError('Digite a sigla ou código da UF para consultar.');
        return;
      }

      const btn = document.getElementById('btn-ibge');
      btn.disabled = true;
      btn.textContent = 'Consultando...';

      try {
        const response = await fetch('https://brasilapi.com.br/api/ibge/uf/v1', {
          headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error('Erro ao consultar IBGE');
        const allStates = await response.json();
        const normalized = query.toLowerCase();
        const digitsOnly = query.replace(/\D/g, '');

        let results = allStates.filter(item =>
          String(item.sigla || '').toLowerCase() === normalized ||
          String(item.sigla || '').toLowerCase().includes(normalized) ||
          String(item.nome || '').toLowerCase().includes(normalized) ||
          String(item.codigo_ibge || item.id || '').includes(digitsOnly || '###never###')
        );

        if (!results.length && digitsOnly && digitsOnly === query) {
          const exactResponse = await fetch(`https://brasilapi.com.br/api/ibge/uf/v1/${digitsOnly}`, {
            headers: { 'Accept': 'application/json' }
          });
          if (exactResponse.ok) {
            const exact = await exactResponse.json();
            results = Array.isArray(exact) ? exact : [exact];
          }
        }

        renderIbgeResults(results, query);
      } catch (error) {
        console.error('Erro IBGE:', error);
        showError('Erro ao consultar IBGE. Tente novamente em instantes.');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Consultar IBGE';
      }
    }

    function renderHolidayResults(items, year) {
      const resultDiv = document.getElementById('result-holidays');
      const dataDiv = document.getElementById('holidays-data');
      const countDiv = document.getElementById('holidays-count');
      resultDiv.classList.remove('result-hidden');
      countDiv.textContent = `${items.length} feriado${items.length === 1 ? '' : 's'}`;

      if (!items.length) {
        dataDiv.innerHTML = `<div class="rounded-xl bg-slate-700/30 border border-slate-600/40 p-4 text-slate-300">Nenhum feriado encontrado para <strong>${esc(year)}</strong>.</div>`;
        return;
      }

      dataDiv.innerHTML = items.map(item => `
        <div class="rounded-xl bg-slate-700/30 border border-slate-600/40 p-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-white font-semibold text-base">${esc(safeText(item.name, 'Feriado'))}</p>
              <p class="text-slate-400 text-sm mt-1">${esc(formatDateBR(item.date))}</p>
            </div>
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border bg-pink-500/15 border-pink-400/25 text-pink-200">${esc(safeText(item.type, 'Nacional'))}</span>
          </div>
        </div>
      `).join('');
    }

    async function consultHolidays() {
      const year = document.getElementById('holidays-input').value.trim();
      if (!/^\d{4}$/.test(year)) {
        showError('Digite um ano válido com 4 dígitos.');
        return;
      }

      const btn = document.getElementById('btn-holidays');
      btn.disabled = true;
      btn.textContent = 'Consultando...';

      try {
        const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${year}`, {
          headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error('Erro ao consultar feriados');
        const data = await response.json();
        renderHolidayResults(Array.isArray(data) ? data : [], year);
      } catch (error) {
        console.error('Erro Feriados:', error);
        showError('Erro ao consultar feriados. Tente novamente em instantes.');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Consultar Feriados';
      }
    }

    function onlyDigits(v) { return String(v || '').replace(/\D/g, ''); }

    function safeText(v, fallback = 'Não informado') {
      const s = (v === null || v === undefined) ? '' : String(v).trim();
      return s ? s : fallback;
    }

    function esc(s) {
      return String(s ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
    }

    function badge(text, tone = 'slate') {
      const map = {
        slate: 'bg-slate-600/20 border-slate-500/30 text-slate-200',
        ok: 'bg-green-500/15 border-green-400/25 text-green-200',
        warn: 'bg-amber-500/15 border-amber-400/25 text-amber-200',
        bad: 'bg-red-500/15 border-red-400/25 text-red-200',
        info: 'bg-blue-500/15 border-blue-400/25 text-blue-200',
        purple: 'bg-purple-500/15 border-purple-400/25 text-purple-200',
      };
      const cls = map[tone] || map.slate;
      return `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border ${cls}">${esc(text)}</span>`;
    }

    function sitTone(desc) {
      const d = String(desc || '').toUpperCase();
      if (d === 'ATIVA') return 'ok';
      if (d === 'BAIXADA') return 'bad';
      if (d === 'SUSPENSA' || d === 'INAPTA') return 'warn';
      return 'info';
    }

    function exibirDadosBrasilAPI(d, cnpjDigits) {
      const resultDiv = document.getElementById('result-cnpj');
      resultDiv.classList.remove('result-hidden');
      lastCnpjData = d;
      lastCnpjDigits = cnpjDigits;

      const cnpjFmt = formatarCNPJResult(cnpjDigits);
      const razao = safeText(d.razao_social);
      const fantasia = safeText(d.nome_fantasia, '');
      const situDesc = safeText(d.descricao_situacao_cadastral, 'Não informado');
      const situBadge = badge(situDesc, sitTone(situDesc));
      const porte = safeText(d.porte, 'NÃO INFORMADO');
      const matrizFilial = safeText(d.descricao_identificador_matriz_filial || d.descricao_matriz_filial, 'Não informado');
      const inicio = formatDateBR(d.data_inicio_atividade);
      const dataSitu = formatDateBR(d.data_situacao_cadastral);
      const natureza = safeText(d.natureza_juridica, '');
      const cnaePrin = `${safeText(d.cnae_fiscal, '')}${d.cnae_fiscal_descricao ? ' - ' + safeText(d.cnae_fiscal_descricao, '') : ''}`.trim();
      const capital = (d.capital_social || d.capital_social === 0) ? moneyBR(d.capital_social) : '';
      const email = safeText(d.email, '');
      const tel1 = formatPhoneBR(d.ddd_telefone_1);
      const tel2 = formatPhoneBR(d.ddd_telefone_2);
      const tels = [tel1, tel2].filter(Boolean).join(' • ');
      const tipoLog = safeText(d.descricao_tipo_de_logradouro, '');
      const log = safeText(d.logradouro, '');
      const num = safeText(d.numero, '');
      const comp = safeText(d.complemento, '');
      const bairro = safeText(d.bairro, '');
      const mun = safeText(d.municipio, '');
      const uf = safeText(d.uf, '');
      const cep = safeText(d.cep, '');
      const endLinha = [tipoLog, log].filter(Boolean).join(' ').trim();
      const end2 = [num && `nº ${num}`, comp].filter(Boolean).join(' • ');
      const simples = (d.opcao_pelo_simples === true) ? 'SIM' : (d.opcao_pelo_simples === false) ? 'NÃO' : 'OUTROS';
      const mei = (d.opcao_pelo_mei === true) ? 'SIM' : (d.opcao_pelo_mei === false) ? 'NÃO' : 'OUTROS';
      const qsa = Array.isArray(d.qsa) ? d.qsa : [];
      const cnaesSec = Array.isArray(d.cnaes_secundarios) ? d.cnaes_secundarios : [];

      const qsaHtml = qsa.length
        ? qsa.map(s => {
            const nome = safeText(s.nome_socio, '-');
            const qual = safeText(s.qualificacao_socio, '-');
            const entrada = formatDateBR(s.data_entrada_sociedade);
            const doc = safeText(s.cnpj_cpf_do_socio, '');
            return `
              <div class="bg-slate-600/20 rounded-lg p-3 border border-slate-500/20">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-slate-200 font-semibold text-sm">${esc(nome)}</p>
                    <p class="text-slate-400 text-xs mt-1">${esc(doc)}${doc ? ' • ' : ''}Entrada: ${esc(entrada)}</p>
                  </div>
                  ${badge(qual, 'purple')}
                </div>
              </div>
            `;
          }).join('')
        : `<p class="text-slate-400 text-xs">Nenhum sócio listado.</p>`;

      const cnaesHtml = cnaesSec.length
        ? `
          <div class="space-y-2 max-h-44 overflow-y-auto pr-1">
            ${cnaesSec.map(c => `
              <div class="bg-slate-600/20 rounded-lg p-3 border border-slate-500/20">
                <p class="text-slate-200 text-xs font-medium">${esc(safeText(c.descricao, '-'))}</p>
                <p class="text-slate-500 text-[11px] mt-1">CNAE: <span class="font-mono">${esc(safeText(c.codigo, '-'))}</span></p>
              </div>
            `).join('')}
          </div>
        `
        : `<p class="text-slate-400 text-xs">Sem CNAEs secundários.</p>`;

      document.getElementById('cnpj-data').innerHTML = `
        <div class="space-y-3 text-sm">
          <div class="flex justify-end flex-wrap gap-2">
            <button onclick="downloadCnpjPdf()" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-400/25 text-emerald-100 hover:bg-emerald-500/20 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 16V4m0 12l-4-4m4 4l4-4M4 18v1a2 2 0 002 2h12a2 2 0 002-2v-1" />
              </svg>
              Download PDF
            </button>
            <button onclick="printCnpjDocument()" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/15 text-white hover:bg-white/15 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-10 0h8v4H10v-4z" />
              </svg>
              Imprimir
            </button>
          </div>
          <div class="bg-slate-700/30 rounded-xl p-4 border border-slate-600/40">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p class="text-slate-400 text-xs uppercase tracking-wide">CNPJ</p>
                <p class="text-slate-100 font-mono font-bold text-base">${esc(cnpjFmt)}</p>
              </div>
              <div class="flex items-center gap-2 flex-wrap">
                ${situBadge}
                ${badge(`Porte: ${porte}`, 'info')}
                ${badge(matrizFilial, 'slate')}
              </div>
            </div>
            <div class="mt-3">
              <p class="text-slate-400 text-xs uppercase tracking-wide">Razão social</p>
              <p class="text-slate-100 font-semibold">${esc(razao)}</p>
              ${fantasia ? `<p class="text-slate-400 text-xs mt-1">Fantasia: <span class="text-slate-200">${esc(fantasia)}</span></p>` : ``}
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-3">
            <div class="bg-slate-700/30 rounded-xl p-4 border border-slate-600/40">
              <p class="text-blue-300 text-xs font-semibold uppercase tracking-wide mb-3">Empresa</p>
              <div class="space-y-2">
                <div>
                  <p class="text-slate-500 text-[11px] uppercase">Natureza jurídica</p>
                  <p class="text-slate-200 text-xs">${esc(natureza || 'Não informado')}</p>
                </div>
                <div>
                  <p class="text-slate-500 text-[11px] uppercase">CNAE principal</p>
                  <p class="text-slate-200 text-xs">${esc(cnaePrin || 'Não informado')}</p>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <p class="text-slate-500 text-[11px] uppercase">Início</p>
                    <p class="text-slate-200 text-xs">${esc(inicio)}</p>
                  </div>
                  <div>
                    <p class="text-slate-500 text-[11px] uppercase">Situação desde</p>
                    <p class="text-slate-200 text-xs">${esc(dataSitu)}</p>
                  </div>
                </div>
                ${capital ? `<div><p class="text-slate-500 text-[11px] uppercase">Capital social</p><p class="text-slate-200 text-xs">${esc(capital)}</p></div>` : ``}
                <div class="grid grid-cols-2 gap-2">
                  <div class="bg-slate-600/20 rounded-lg p-2 border border-slate-500/20">
                    <p class="text-slate-500 text-[11px] uppercase">Simples</p>
                    <p class="text-slate-200 text-xs font-semibold">${esc(simples)}</p>
                  </div>
                  <div class="bg-slate-600/20 rounded-lg p-2 border border-slate-500/20">
                    <p class="text-slate-500 text-[11px] uppercase">MEI</p>
                    <p class="text-slate-200 text-xs font-semibold">${esc(mei)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-slate-700/30 rounded-xl p-4 border border-slate-600/40">
              <p class="text-amber-300 text-xs font-semibold uppercase tracking-wide mb-3">Contato e endereço</p>
              <div class="space-y-2">
                <div>
                  <p class="text-slate-500 text-[11px] uppercase">E-mail</p>
                  <p class="text-slate-200 text-xs break-all">${esc(email || 'Não informado')}</p>
                </div>
                <div>
                  <p class="text-slate-500 text-[11px] uppercase">Telefones</p>
                  <p class="text-slate-200 text-xs">${esc(tels || 'Não informado')}</p>
                </div>
                <div class="mt-2 bg-slate-600/20 rounded-lg p-3 border border-slate-500/20">
                  <p class="text-slate-500 text-[11px] uppercase">Endereço</p>
                  <p class="text-slate-200 text-xs mt-1">${esc(endLinha || 'Não informado')}</p>
                  ${end2 ? `<p class="text-slate-400 text-xs mt-1">${esc(end2)}</p>` : ``}
                  <p class="text-slate-400 text-xs mt-2">${esc(bairro)} • ${esc(mun)} / ${esc(uf)} • CEP: <span class="font-mono">${esc(cep)}</span></p>
                </div>
              </div>
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-3">
            <div class="bg-slate-700/30 rounded-xl p-4 border border-slate-600/40">
              <p class="text-purple-300 text-xs font-semibold uppercase tracking-wide mb-3">Sócios e administradores (QSA)</p>
              <div class="space-y-2 max-h-52 overflow-y-auto pr-1">${qsaHtml}</div>
            </div>
            <div class="bg-slate-700/30 rounded-xl p-4 border border-slate-600/40">
              <p class="text-cyan-300 text-xs font-semibold uppercase tracking-wide mb-3">CNAEs secundários</p>
              ${cnaesHtml}
            </div>
          </div>

          <div class="rounded-xl bg-slate-700/20 border border-slate-600/30 p-4">
            <p class="text-slate-300 text-xs leading-relaxed">
              Essas informações são públicas, não confidenciais e sua divulgação está em conformidade com o Decreto nº 8.777/2016 e a Lei nº 12.527/2011, que assegura o direito constitucional de acesso Ã  informação, mas temos total consideração pelo direito individual de privacidade.
            </p>
          </div>
        </div>
      `;
    }

    function buildCnpjPrintDocument(includePrintScript = false) {
      if (!lastCnpjData || !lastCnpjDigits) {
        return null;
      }

      const d = lastCnpjData;
      const cnpjFmt = formatarCNPJResult(lastCnpjDigits);
      const razao = safeText(d.razao_social);
      const fantasia = safeText(d.nome_fantasia, '********');
      const cnaePrincipal = `${safeText(d.cnae_fiscal, '')}${d.cnae_fiscal_descricao ? ' - ' + safeText(d.cnae_fiscal_descricao, '') : ''}`.trim() || 'Não informado';
      const cnaesSec = (Array.isArray(d.cnaes_secundarios) ? d.cnaes_secundarios : [])
        .map(c => `${safeText(c.codigo, '')} - ${safeText(c.descricao, '')}`.trim())
        .join('<br>') || 'Não informado';
      const socios = (Array.isArray(d.qsa) ? d.qsa : [])
        .map(s => {
          const nome = safeText(s.nome_socio, 'Não informado');
          const qualificacao = safeText(s.qualificacao_socio, 'Não informado');
          const entrada = formatDateBR(s.data_entrada_sociedade);
          return `${esc(nome)} - ${esc(qualificacao)}${entrada !== 'Não informado' ? ` - Entrada: ${esc(entrada)}` : ''}`;
        })
        .join('<br>') || 'Não informado';
      const natureza = `${safeText(d.codigo_natureza_juridica || '', '')}${d.natureza_juridica ? ' - ' + safeText(d.natureza_juridica, '') : ''}`.trim() || 'Não informado';
      const logradouro = [safeText(d.descricao_tipo_de_logradouro, ''), safeText(d.logradouro, '')].filter(Boolean).join(' ').trim() || 'Não informado';
      const numero = safeText(d.numero, '');
      const complemento = safeText(d.complemento, '********');
      const cep = safeText(d.cep, '');
      const bairro = safeText(d.bairro, '');
      const municipio = safeText(d.municipio, '');
      const uf = safeText(d.uf, '');
      const email = safeText(d.email, 'Não informado');
      const telefone = [formatPhoneBR(d.ddd_telefone_1), formatPhoneBR(d.ddd_telefone_2)].filter(Boolean).join(' ') || 'Não informado';
      const situacao = safeText(d.descricao_situacao_cadastral);
      const dataSituacao = formatDateBR(d.data_situacao_cadastral);
      const dataAbertura = formatDateBR(d.data_inicio_atividade);
      const porte = safeText(d.porte, 'Não informado');

      const printHtml = `
        <!doctype html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <base href="${window.location.href}">
          <title>Comprovante CNPJ - ${cnpjFmt}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 12px; color: #000; }
            .sheet { border: 1px solid #000; padding: 10px; }
            .center { text-align: center; }
            .header { display: grid; grid-template-columns: 90px 1fr; align-items: center; gap: 12px; margin-bottom: 10px; }
            .brasao { width: 64px; height: 64px; object-fit: contain; }
            .title-1 { font-size: 16px; font-weight: 700; }
            .title-2 { font-size: 14px; margin-top: 4px; }
            .grid-3 { display: grid; grid-template-columns: 1.1fr 2fr 1fr; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; }
            .grid-4 { display: grid; grid-template-columns: 1.3fr 0.6fr 0.9fr 0.5fr; }
            .box { border: 1px solid #000; min-height: 34px; padding: 4px 6px; }
            .box + .box { border-left: none; }
            .row + .row .box { border-top: none; }
            .label { font-size: 8px; text-transform: uppercase; line-height: 1.1; }
            .value { font-size: 12px; font-weight: 700; margin-top: 3px; }
            .value.normal { font-weight: 400; }
            .spacer { height: 10px; }
            .multiline { min-height: 58px; }
            .multiline-lg { min-height: 88px; }
            .multiline-xl { min-height: 96px; }
            @media print {
              body { margin: 0; }
              .sheet { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="header">
              <img class="brasao" src="https://i.imgur.com/mGRUGD1.png" crossorigin="anonymous" alt="Brasão do Brasil">
              <div class="center">
                <div class="title-1">REPÚBLICA FEDERATIVA DO BRASIL</div>
                <div class="title-2">CADASTRO NACIONAL DA PESSOA JURÍDICA</div>
              </div>
            </div>

            <div class="row grid-3">
              <div class="box">
                <div class="label">Número de inscrição</div>
                <div class="value">${esc(cnpjFmt)}</div>
                <div class="value">MATRIZ</div>
              </div>
              <div class="box center">
                <div class="label">Comprovante de inscrição e de situação cadastral</div>
                <div class="value">COMPROVANTE DE INSCRIÇÃO E DE SITUAÇÃO CADASTRAL</div>
              </div>
              <div class="box">
                <div class="label">Data de abertura</div>
                <div class="value">${esc(dataAbertura)}</div>
              </div>
            </div>

            <div class="spacer"></div>

            <div class="row">
              <div class="box">
                <div class="label">Nome empresarial</div>
                <div class="value">${esc(razao)}</div>
              </div>
            </div>

            <div class="row grid-3">
              <div class="box" style="grid-column: span 2;">
                <div class="label">Título do estabelecimento (nome de fantasia)</div>
                <div class="value normal">${esc(fantasia)}</div>
              </div>
              <div class="box">
                <div class="label">Porte</div>
                <div class="value">${esc(porte)}</div>
              </div>
            </div>

            <div class="row">
              <div class="box">
                <div class="label">Código e descrição da atividade econômica principal</div>
                <div class="value normal">${esc(cnaePrincipal)}</div>
              </div>
            </div>

            <div class="row">
              <div class="box multiline-lg">
                <div class="label">Código e descrição das atividades econômicas secundárias</div>
                <div class="value normal">${cnaesSec}</div>
              </div>
            </div>

            <div class="row">
              <div class="box multiline-xl">
                <div class="label">Quadro de sócios e administradores</div>
                <div class="value normal">${socios}</div>
              </div>
            </div>

            <div class="row">
              <div class="box">
                <div class="label">Código e descrição da natureza jurídica</div>
                <div class="value normal">${esc(natureza)}</div>
              </div>
            </div>

            <div class="row grid-3">
              <div class="box" style="grid-column: span 2;">
                <div class="label">Logradouro</div>
                <div class="value normal">${esc(logradouro)}</div>
              </div>
              <div class="box">
                <div class="label">Número</div>
                <div class="value normal">${esc(numero || 'S/N')}</div>
              </div>
            </div>

            <div class="row grid-4">
              <div class="box">
                <div class="label">CEP</div>
                <div class="value normal">${esc(cep)}</div>
              </div>
              <div class="box">
                <div class="label">Bairro/Distrito</div>
                <div class="value normal">${esc(bairro)}</div>
              </div>
              <div class="box">
                <div class="label">Município</div>
                <div class="value normal">${esc(municipio)}</div>
              </div>
              <div class="box">
                <div class="label">UF</div>
                <div class="value normal">${esc(uf)}</div>
              </div>
            </div>

            <div class="row grid-2">
              <div class="box">
                <div class="label">Endereço eletrônico</div>
                <div class="value normal">${esc(email)}</div>
              </div>
              <div class="box">
                <div class="label">Telefone</div>
                <div class="value normal">${esc(telefone)}</div>
              </div>
            </div>

            <div class="row">
              <div class="box">
                <div class="label">Situação cadastral</div>
                <div class="value">${esc(situacao)}</div>
              </div>
            </div>

            <div class="row grid-2">
              <div class="box">
                <div class="label">Motivo de situação cadastral</div>
                <div class="value normal">********</div>
              </div>
              <div class="box">
                <div class="label">Data da situação cadastral</div>
                <div class="value normal">${esc(dataSituacao)}</div>
              </div>
            </div>

            <div class="row grid-2">
              <div class="box">
                <div class="label">Complemento</div>
                <div class="value normal">${esc(complemento)}</div>
              </div>
              <div class="box">
                <div class="label">Situação especial</div>
                <div class="value normal">********</div>
              </div>
            </div>
          </div>
          ${includePrintScript ? `
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 120);
            };
            window.onafterprint = function() {
              setTimeout(function() {
                try { window.close(); } catch (e) {}
              }, 400);
            };
          <\/script>` : ''}
        </body>
        </html>
      `;

      return {
        fileName: `cnpj-${lastCnpjDigits}.pdf`,
        html: printHtml
      };
    }

    function printCnpjDocument() {
      const doc = buildCnpjPrintDocument(true);
      if (!doc) {
        showError('Faça uma consulta de CNPJ antes de imprimir.');
        return;
      }

      const printWindow = window.open('', '_blank', 'width=900,height=1000');
      if (!printWindow) {
        showError('Não foi possível abrir a janela de impressão.');
        return;
      }
      printWindow.document.open();
      printWindow.document.write(doc.html);
      printWindow.document.close();
    }

    function loadImageAsDataUrl(url) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          } catch (error) {
            reject(error);
          }
        };
        img.onerror = reject;
        img.src = url;
      });
    }

    async function downloadCnpjPdf() {
      if (!lastCnpjData || !lastCnpjDigits) {
        showError('Faça uma consulta de CNPJ antes de baixar o PDF.');
        return;
      }

      const jsPdfApi = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
      if (!jsPdfApi) {
        showError('O recurso de PDF não está disponível neste navegador.');
        return;
      }

      try {
        const d = lastCnpjData;
        const pdf = new jsPdfApi({ unit: 'mm', format: 'a4', orientation: 'portrait' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 12;
        const contentWidth = pageWidth - (margin * 2);
        const boxPadding = 2.6;
        const lineHeight = 5.2;
        let y = 14;

        const addPageIfNeeded = (heightNeeded = 10) => {
          if (y + heightNeeded > pageHeight - 14) {
            pdf.addPage();
            y = 14;
          }
        };

        const drawTitle = () => {
          const logoWidth = 18;
          const logoHeight = 18;
          const logoX = margin;
          const logoY = y - 6;
          if (logoDataUrl) {
            try {
              pdf.addImage(logoDataUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);
            } catch (e) {}
          }
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(14);
          pdf.text('REPÚBLICA FEDERATIVA DO BRASIL', pageWidth / 2 + 6, y, { align: 'center' });
          y += 6;
          pdf.setFontSize(12);
          pdf.text('CADASTRO NACIONAL DA PESSOA JURÍDICA', pageWidth / 2 + 6, y, { align: 'center' });
          y += 8;
        };

        const drawField = (label, value, minHeight = 11) => {
          const safeValue = String(value || 'Não informado');
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8);
          const labelLines = pdf.splitTextToSize(label, contentWidth - (boxPadding * 2));
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9.5);
          const valueLines = pdf.splitTextToSize(safeValue, contentWidth - (boxPadding * 2));
          const boxHeight = Math.max(minHeight, (labelLines.length * 3.3) + (valueLines.length * lineHeight) + 4.5);

          addPageIfNeeded(boxHeight + 3);
          pdf.rect(margin, y, contentWidth, boxHeight);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8);
          pdf.text(labelLines, margin + boxPadding, y + 4);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9.5);
          pdf.text(valueLines, margin + boxPadding, y + 8.2);
          y += boxHeight;
        };

        const drawTwoColumns = (leftLabel, leftValue, rightLabel, rightValue, minHeight = 13) => {
          const colWidth = contentWidth / 2;
          const leftText = pdf.splitTextToSize(String(leftValue || 'Não informado'), colWidth - (boxPadding * 2));
          const rightText = pdf.splitTextToSize(String(rightValue || 'Não informado'), colWidth - (boxPadding * 2));
          const boxHeight = Math.max(minHeight, Math.max(leftText.length, rightText.length) * lineHeight + 8);

          addPageIfNeeded(boxHeight + 3);
          pdf.rect(margin, y, colWidth, boxHeight);
          pdf.rect(margin + colWidth, y, colWidth, boxHeight);

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8);
          pdf.text(leftLabel, margin + boxPadding, y + 4);
          pdf.text(rightLabel, margin + colWidth + boxPadding, y + 4);

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9.5);
          pdf.text(leftText, margin + boxPadding, y + 8.2);
          pdf.text(rightText, margin + colWidth + boxPadding, y + 8.2);
          y += boxHeight;
        };

        const cnpjFmt = formatarCNPJResult(lastCnpjDigits);
        let logoDataUrl = '';
        try {
          logoDataUrl = await loadImageAsDataUrl('https://i.imgur.com/mGRUGD1.png');
        } catch (error) {
          console.warn('Não foi possível carregar o brasão para o PDF.', error);
        }
        const razao = safeText(d.razao_social);
        const fantasia = safeText(d.nome_fantasia, 'Não informado');
        const natureza = `${safeText(d.codigo_natureza_juridica || '', '')}${d.natureza_juridica ? ' - ' + safeText(d.natureza_juridica, '') : ''}`.trim() || 'Não informado';
        const cnaePrincipal = `${safeText(d.cnae_fiscal, '')}${d.cnae_fiscal_descricao ? ' - ' + safeText(d.cnae_fiscal_descricao, '') : ''}`.trim() || 'Não informado';
        const cnaesSec = (Array.isArray(d.cnaes_secundarios) ? d.cnaes_secundarios : [])
          .map((c) => `${safeText(c.codigo, '')} - ${safeText(c.descricao, '')}`.trim())
          .join('\n') || 'Não informado';
        const socios = (Array.isArray(d.qsa) ? d.qsa : [])
          .map((s) => {
            const nome = safeText(s.nome_socio, 'Não informado');
            const qualificacao = safeText(s.qualificacao_socio, 'Não informado');
            const entrada = formatDateBR(s.data_entrada_sociedade);
            return `${nome} - ${qualificacao}${entrada !== 'Não informado' ? ` - Entrada: ${entrada}` : ''}`;
          })
          .join('\n') || 'Não informado';
        const logradouro = [safeText(d.descricao_tipo_de_logradouro, ''), safeText(d.logradouro, '')].filter(Boolean).join(' ').trim() || 'Não informado';
        const enderecoCompleto = [
          logradouro,
          d.numero ? `Número: ${safeText(d.numero, 'S/N')}` : 'Número: S/N',
          d.complemento ? `Complemento: ${safeText(d.complemento, '')}` : '',
          d.bairro ? `Bairro: ${safeText(d.bairro, '')}` : '',
          d.municipio ? `Município: ${safeText(d.municipio, '')}` : '',
          d.uf ? `UF: ${safeText(d.uf, '')}` : '',
          d.cep ? `CEP: ${safeText(d.cep, '')}` : ''
        ].filter(Boolean).join(' | ');
        const telefone = [formatPhoneBR(d.ddd_telefone_1), formatPhoneBR(d.ddd_telefone_2)].filter(Boolean).join(' / ') || 'Não informado';
        const email = safeText(d.email, 'Não informado');
        const situacao = safeText(d.descricao_situacao_cadastral, 'Não informado');
        const dataAbertura = formatDateBR(d.data_inicio_atividade);
        const dataSituacao = formatDateBR(d.data_situacao_cadastral);
        const porte = safeText(d.porte, 'Não informado');

        drawTitle();
        drawTwoColumns('Número de inscrição', `${cnpjFmt} - MATRIZ`, 'Data de abertura', dataAbertura, 16);
        drawField('Nome empresarial', razao, 14);
        drawTwoColumns('Nome de fantasia', fantasia, 'Porte', porte, 16);
        drawField('Código e descrição da natureza jurídica', natureza, 14);
        drawField('Código e descrição da atividade econômica principal', cnaePrincipal, 18);
        drawField('CNAEs secundários', cnaesSec, 24);
        drawField('Quadro de sócios e administradores', socios, 28);
        drawField('Endereço', enderecoCompleto, 20);
        drawTwoColumns('Telefone', telefone, 'Endereço eletrônico', email, 18);
        drawTwoColumns('Situação cadastral', situacao, 'Data da situação cadastral', dataSituacao, 16);

        pdf.save(`cnpj-${lastCnpjDigits}.pdf`);
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        showError('Não foi possível gerar o PDF agora.');
      }
    }

    async function consultarCNPJ() {
      const raw = document.getElementById('cnpj-input').value;
      const cnpj = onlyDigits(raw);

      if (cnpj.length !== 14) {
        showError('CNPJ deve conter 14 dígitos');
        return;
      }

      const btn = document.getElementById('btn-cnpj');
      btn.disabled = true;
      btn.textContent = 'Consultando...';

      try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
          showError('Erro ao consultar. Tente novamente em alguns instantes.');
          return;
        }

        const data = await response.json();
        exibirDadosBrasilAPI(data, cnpj);
      } catch (error) {
        console.error('Erro CNPJ:', error);
        showError('Erro de conexão. Verifique sua internet e tente novamente.');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Consultar CNPJ';
      }
    }
