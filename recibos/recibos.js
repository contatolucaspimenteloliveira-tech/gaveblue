    // VariÃ¡vel global para controlar o zoom
    let zoomAtual = 100;

    // FunÃ§Ã£o para aumentar zoom
    function aumentarZoom() {
      if (zoomAtual < 200) {
        zoomAtual += 10;
        aplicarZoom();
      }
    }

    // FunÃ§Ã£o para diminuir zoom
    function diminuirZoom() {
      if (zoomAtual > 50) {
        zoomAtual -= 10;
        aplicarZoom();
      }
    }

    // FunÃ§Ã£o para aplicar zoom
    function aplicarZoom() {
      const escala = zoomAtual / 100;
      
      // Aplicar zoom apenas nos recibos
      const recibos = document.querySelectorAll('.recibo');
      recibos.forEach(recibo => {
        recibo.style.transform = `scale(${escala})`;
        recibo.style.transformOrigin = 'top center';
        recibo.style.marginBottom = `${40 * escala}px`;
      });
      
      // Mostrar toast com o nÃ­vel de zoom
      mostrarToastZoom();
      
      // Salvar preferÃªncia
      localStorage.setItem('zoomRecibos', zoomAtual);
    }

    let toastTimer;

    function mostrarToastGlobal(texto, tipo = 'info', icone = 'i', duracao = 2200) {
      const toast = document.getElementById('toast-global');
      const toastIcon = document.getElementById('toast-icon');
      const toastText = document.getElementById('toast-text');

      if (!toast || !toastIcon || !toastText) return;

      toast.classList.remove('toast-success', 'toast-error', 'toast-info', 'visible');
      toast.classList.add(`toast-${tipo}`);
      toastIcon.textContent = icone;
      toastText.textContent = texto;

      if (toastTimer) {
        clearTimeout(toastTimer);
      }

      requestAnimationFrame(() => {
        toast.classList.add('visible');
      });

      toastTimer = setTimeout(() => {
        toast.classList.remove('visible');
      }, duracao);
    }

    // FunÃ§Ã£o para mostrar toast de zoom
    function mostrarToastZoom() {
      mostrarToastGlobal(`Zoom: ${zoomAtual}%`, 'info', '↔', 1800);
    }

    // Carregar zoom salvo
    window.addEventListener('DOMContentLoaded', function() {
      const zoomSalvo = localStorage.getItem('zoomRecibos');
      if (zoomSalvo) {
        zoomAtual = parseInt(zoomSalvo);
        aplicarZoom();
      }
    });

    // FunÃ§Ã£o para selecionar todos os recibos
    function selecionarTodos() {
      const checkboxes = document.querySelectorAll('.checkbox-recibo');
      const todosEstaoSelecionados = Array.from(checkboxes).every(cb => cb.checked);
      
      checkboxes.forEach(checkbox => {
        const recibo = checkbox.closest('.recibo');
        if (todosEstaoSelecionados) {
          checkbox.checked = false;
          recibo.classList.remove('selecionado');
        } else {
          checkbox.checked = true;
          recibo.classList.add('selecionado');
        }
      });
    }

    // FunÃ§Ã£o para alternar seleÃ§Ã£o de recibo
    function toggleSelecaoRecibo(checkbox) {
      const recibo = checkbox.closest('.recibo');
      if (checkbox.checked) {
        recibo.classList.add('selecionado');
      } else {
        recibo.classList.remove('selecionado');
      }
    }

    // FunÃ§Ã£o para abrir popup de confirmaÃ§Ã£o de exclusÃ£o
    function abrirConfirmacaoExclusao() {
      const selecionados = document.querySelectorAll('.recibo.selecionado');
      if (selecionados.length === 0) {
        mostrarMensagem('Nenhum recibo selecionado!', 'erro');
        return;
      }
      
      const texto = document.getElementById('texto-confirmacao-exclusao');
      texto.textContent = `Tem certeza que deseja excluir ${selecionados.length} recibo(s) selecionado(s)? Esta aÃ§Ã£o nÃ£o poderÃ¡ ser desfeita.`;
      
      document.getElementById('popup-confirmacao').classList.remove('hidden');
    }

    // FunÃ§Ã£o para fechar popup de confirmaÃ§Ã£o
    function fecharConfirmacao() {
      document.getElementById('popup-confirmacao').classList.add('hidden');
    }

    // FunÃ§Ã£o para confirmar exclusÃ£o
    function ehReciboPrincipal(recibo) {
      if (!recibo) return false;
      return recibo.id === 'recibo' || recibo.id === 'recibo-completo' || recibo.id === 'recibo-simplificado' || recibo.id === 'recibo-covre';
    }

    function limparReciboPrincipal(recibo) {
      if (!recibo) return;

      recibo.classList.remove('selecionado');

      const checkbox = recibo.querySelector('.checkbox-recibo');
      if (checkbox) {
        checkbox.checked = false;
      }

      if (recibo.id === 'recibo') {
        const valor = document.getElementById('valor');
        const recebedor = document.getElementById('recebedor');
        const referencia = document.getElementById('referencia');
        const descricao = document.getElementById('descricao');
        const emitente = document.getElementById('emitente');
        const cpfcnpj = document.getElementById('cpfcnpj');
        const data = document.getElementById('data');
        const quantia = document.getElementById('quantia');
        const assinaturaNome = document.getElementById('assinaturaNome');
        const assinaturaCpf = document.getElementById('assinaturaCpf');

        if (valor) valor.value = '';
        if (recebedor) recebedor.value = '';
        if (referencia) referencia.value = '';
        if (descricao) descricao.value = '';
        if (emitente) emitente.value = '';
        if (cpfcnpj) cpfcnpj.value = '';
        if (data) data.value = obterDataFormatada();
        if (quantia) quantia.value = '';
        if (assinaturaNome) assinaturaNome.textContent = '';
        if (assinaturaCpf) assinaturaCpf.textContent = '';
      } else if (recibo.id === 'recibo-completo') {
        const valor = document.getElementById('valor-completo');
        const numero = document.getElementById('numero-recibo-completo');
        const recebedor = document.getElementById('recebedor-completo');
        const referencia = document.getElementById('referencia-completo');
        const descricao = document.getElementById('descricao-completo');
        const emitente = document.getElementById('emitente-completo');
        const cpfcnpj = document.getElementById('cpfcnpj-completo');
        const data = document.getElementById('data-completo');
        const quantia = document.getElementById('campoQuantia-completo');
        const assinaturaNome = document.getElementById('assinaturaNome-completo');
        const assinaturaCpf = document.getElementById('assinaturaCpf-completo');

        if (valor) valor.value = '';
        if (numero) numero.value = '';
        if (recebedor) recebedor.value = '';
        if (referencia) referencia.value = '';
        if (descricao) descricao.value = '';
        if (emitente) emitente.value = '';
        if (cpfcnpj) cpfcnpj.value = '';
        if (data) data.value = obterDataFormatada();
        if (quantia) quantia.value = '';
        if (assinaturaNome) assinaturaNome.textContent = '';
        if (assinaturaCpf) assinaturaCpf.textContent = '';
      } else if (recibo.id === 'recibo-simplificado') {
        const valor = document.getElementById('valor-simples');
        const nome = document.getElementById('nome-principal');
        const quantia = document.getElementById('quantia-simples');

        if (valor) valor.value = '';
        if (nome) nome.value = '';
        if (quantia) quantia.value = '';
        if (nome) atualizarAssinaturaSimples(nome);
      } else if (recibo.id === 'recibo-covre') {
        const valor = document.getElementById('valor-covre');
        const nome = document.getElementById('nome-covre');

        if (valor) valor.value = '';
        if (nome) nome.value = '';
      }
    }

    function confirmarExclusao() {
      const selecionados = document.querySelectorAll('.recibo.selecionado');
      let removeuGerados = 0;
      let limpouPrincipal = false;

      selecionados.forEach(recibo => {
        if (ehReciboPrincipal(recibo)) {
          limparReciboPrincipal(recibo);
          limpouPrincipal = true;
        } else {
          recibo.remove();
          removeuGerados += 1;
        }
      });
      
      fecharConfirmacao();
      atualizarContador();

      if (removeuGerados > 0 && limpouPrincipal) {
        mostrarToastGlobal('Recibos gerados excluídos e recibo principal limpo com sucesso!', 'success', '✓', 2600);
      } else if (removeuGerados > 0) {
        mostrarToastExclusao();
      } else if (limpouPrincipal) {
        mostrarToastGlobal('Recibo principal limpo com sucesso!', 'info', '✓', 2400);
      }
    }

    // FunÃ§Ã£o para mostrar toast de exclusÃ£o
    function mostrarToastExclusao() {
      mostrarToastGlobal('Recibos excluídos com sucesso!', 'success', '✓', 2600);
    }

    function incrementarNumeroSequencial(valorAtual) {
      const valor = String(valorAtual || '').trim();
      if (!/^\d+$/.test(valor)) return '';

      const largura = valor.length;
      const proximoNumero = String(parseInt(valor, 10) + 1);
      return proximoNumero.padStart(largura, '0');
    }

    function obterProximoNumeroReciboCompleto() {
      const numeros = [];

      const numeroPrincipal = document.getElementById('numero-recibo-completo');
      if (numeroPrincipal && /^\d+$/.test(numeroPrincipal.value.trim())) {
        numeros.push(numeroPrincipal.value.trim());
      }

      document.querySelectorAll('#recibos-gerados .numero-recibo').forEach((campo) => {
        const valor = campo.value.trim();
        if (/^\d+$/.test(valor)) {
          numeros.push(valor);
        }
      });

      if (!numeros.length) return '';

      const ultimoValor = numeros.reduce((atual, valor) => {
        if (!atual) return valor;
        return parseInt(valor, 10) >= parseInt(atual, 10) ? valor : atual;
      }, '');

      return incrementarNumeroSequencial(ultimoValor);
    }

    // FunÃ§Ã£o para adicionar recibo vazio
    function adicionarReciboVazio() {
      // Verificar se os recibos principais estÃ£o visÃ­veis
      const reciboPadrao = document.getElementById('recibo');
      const reciboCompleto = document.getElementById('recibo-completo');
      const reciboSimplificado = document.getElementById('recibo-simplificado');
      const reciboCovre = document.getElementById('recibo-covre');
      const algumReciboVisivel = (reciboPadrao && reciboPadrao.style.display !== 'none') || 
                                  (reciboCompleto && reciboCompleto.style.display !== 'none') ||
                                  (reciboSimplificado && reciboSimplificado.style.display !== 'none') ||
                                  (reciboCovre && reciboCovre.style.display !== 'none');
      
      // Se nÃ£o hÃ¡ recibo principal visÃ­vel, mostrar o recibo do modelo atual
      if (!algumReciboVisivel) {
        mostrarReciboPrincipal();
        return;
      }
      
      let modeloId = 'modelo-recibo';
      if (modeloAtual === 'completo') {
        modeloId = 'modelo-recibo-completo';
      } else if (modeloAtual === 'simplificado') {
        modeloId = 'modelo-recibo-simplificado';
      } else if (modeloAtual === 'covre') {
        modeloId = 'modelo-recibo-covre';
      }
      
      const modelo = document.getElementById(modeloId);
      const novoRecibo = modelo.cloneNode(true);
      const timestamp = Date.now();
      novoRecibo.id = 'recibo-novo-' + timestamp;
      novoRecibo.style.display = 'block';

      if (modeloAtual === 'padrao' || modeloAtual === 'completo') {
        const tituloConfig = window.elementSdk && window.elementSdk.config ? window.elementSdk.config.titulo_recibo : 'RECIBO';
        novoRecibo.querySelector('.titulo-modelo').textContent = tituloConfig || 'RECIBO';

        if (modeloAtual === 'completo') {
          const numeroInput = novoRecibo.querySelector('.numero-recibo');
          const proximoNumero = obterProximoNumeroReciboCompleto();
          if (numeroInput && proximoNumero) {
            numeroInput.value = proximoNumero;
          }
        }
        
        const dataInput = novoRecibo.querySelector('.data');
        if (dataInput) {
          dataInput.value = obterDataFormatada();
        }

        novoRecibo.querySelector('.valor').oninput = function() { formatarMoeda(this); };
        novoRecibo.querySelector('.cpfcnpj').oninput = function() { 
          formatarCpfCnpj(this); 
          atualizarAssinaturaDireto(this);
        };
        novoRecibo.querySelector('.emitente').oninput = function() { 
          atualizarAssinaturaDireto(this);
        };
      } else if (modeloAtual === 'simplificado') {
        novoRecibo.querySelector('.valor').oninput = function() { formatarMoeda(this); };
        const nomeSimplesInput = novoRecibo.querySelector('.nome-simples');
        if (nomeSimplesInput) {
          nomeSimplesInput.oninput = function() { atualizarAssinaturaSimples(this); };
          atualizarAssinaturaSimples(nomeSimplesInput);
        }
      } else if (modeloAtual === 'covre') {
        novoRecibo.querySelector('.valor').oninput = function() { formatarMoeda(this); };
        const nomeSimplesInput = novoRecibo.querySelector('.nome-simples');
        if (nomeSimplesInput) {
          nomeSimplesInput.oninput = function() { atualizarAssinaturaSimples(this); };
          atualizarAssinaturaSimples(nomeSimplesInput);
        }
      }

      const escala = zoomAtual / 100;
      novoRecibo.style.transform = `scale(${escala})`;
      novoRecibo.style.transformOrigin = 'top center';
      novoRecibo.style.marginBottom = `${40 * escala}px`;

      const container = document.getElementById('recibos-gerados');
      container.appendChild(novoRecibo);
      
      atualizarContador();
      
      setTimeout(() => {
        novoRecibo.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }

    // FunÃ§Ã£o para sair da aplicaÃ§Ã£o
    function sairAplicacao() {
      window.location.href = 'https://gaveblue.com.br/';
    }

    const globalSearchInputEl = document.getElementById('global-search-input');
    const globalSearchResultsEl = document.getElementById('global-search-results');
    const mobileSearchBtnEl = document.getElementById('mobile-search-btn');
    const mobileGlobalSearchInputEl = document.getElementById('mobile-global-search-input');
    const mobileGlobalSearchResultsEl = document.getElementById('mobile-global-search-results');
    const mobileSearchBackdropEl = document.getElementById('mobile-search-backdrop');
    const mobileSearchModalEl = document.getElementById('mobile-search-modal');
    const searchFocusOverlayEl = document.getElementById('search-focus-overlay');
    const ecosystemModules = [
      { name: 'WeTime', description: 'RelÃ³gio online e painel de horÃ¡rio', url: 'https://gaveblue.com.br/wetime' },
      { name: 'WeRecibos', description: 'Gerador de recibos', url: 'https://gaveblue.com.br/recibos' },
      { name: 'WeConsultas', description: 'Consultas empresariais', url: 'https://gaveblue.com.br/weconsultas' },
      { name: 'WeFrotas', description: 'GestÃ£o de frotas', url: 'https://gaveblue.com.br/wefrotas' },
      { name: 'WeDevs', description: 'Ferramentas e utilidades dev', url: 'https://gaveblue.com.br/wedevs' },
      { name: 'WeTasks', description: 'Tarefas e organizaÃ§Ã£o', url: 'https://gaveblue.com.br/wetasks' }
    ];
    let filteredModules = [];
    let highlightedModuleIndex = -1;
    let activeSearchInputEl = globalSearchInputEl;
    let activeSearchResultsEl = globalSearchResultsEl;

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

    function setActiveSearchContext(inputEl, resultsEl) {
      activeSearchInputEl = inputEl;
      activeSearchResultsEl = resultsEl;
    }

    function hideGlobalSearchResults() {
      if (globalSearchResultsEl) globalSearchResultsEl.classList.add('hidden');
      if (mobileGlobalSearchResultsEl) mobileGlobalSearchResultsEl.classList.add('hidden');
      searchFocusOverlayEl.classList.add('hidden');
      highlightedModuleIndex = -1;
    }

    function closeMobileSearch() {
      if (mobileSearchBackdropEl) mobileSearchBackdropEl.classList.remove('active');
      if (mobileSearchModalEl) mobileSearchModalEl.classList.remove('active');
      hideGlobalSearchResults();
    }

    function openMobileSearch() {
      if (!mobileSearchBackdropEl || !mobileSearchModalEl || !mobileGlobalSearchInputEl) return;
      mobileSearchBackdropEl.classList.add('active');
      mobileSearchModalEl.classList.add('active');
      setActiveSearchContext(mobileGlobalSearchInputEl, mobileGlobalSearchResultsEl);
      updateGlobalSearch(mobileGlobalSearchInputEl.value, mobileGlobalSearchResultsEl);
      requestAnimationFrame(() => mobileGlobalSearchInputEl.focus());
    }

    function syncHighlightedGlobalSearchItem() {
      const items = (activeSearchResultsEl || globalSearchResultsEl).querySelectorAll('.global-search-item');
      items.forEach((item, index) => {
        item.classList.toggle('active', index === highlightedModuleIndex);
      });
    }

    function renderGlobalSearchResults(modules, resultsEl = activeSearchResultsEl || globalSearchResultsEl) {
      filteredModules = modules;
      highlightedModuleIndex = modules.length ? 0 : -1;

      if (!modules.length) {
        resultsEl.innerHTML = '<div class="global-search-empty">Nenhum mÃ³dulo encontrado.</div>';
        resultsEl.classList.remove('hidden');
        searchFocusOverlayEl.classList.remove('hidden');
        return;
      }

      resultsEl.innerHTML = modules.map((module, index) => `
        <button type="button" class="global-search-item${index === highlightedModuleIndex ? ' active' : ''}" data-url="${module.url}">
          <span>
            <span class="global-search-kicker">Ecossistema GaveBlue</span>
            <span class="block" style="font-size:14px;font-weight:700;">${escapeGlobalSearchHtml(module.name)}</span>
            <span class="global-search-route">${escapeGlobalSearchHtml(module.description)}</span>
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:rgba(191,219,254,0.95)">
            <path d="M7 17L17 7" stroke-width="2" stroke-linecap="round"></path>
            <path d="M9 7H17V15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        </button>
      `).join('');

      resultsEl.classList.remove('hidden');
      searchFocusOverlayEl.classList.remove('hidden');
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
          hideGlobalSearchResults();
          if (inputEl === mobileGlobalSearchInputEl) closeMobileSearch();
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

    if (mobileSearchBtnEl) {
      mobileSearchBtnEl.addEventListener('click', (event) => {
        event.stopPropagation();
        openMobileSearch();
      });
    }

    if (mobileSearchBackdropEl) {
      mobileSearchBackdropEl.addEventListener('click', closeMobileSearch);
    }

    document.addEventListener('click', (event) => {
      const clickedDesktopSearch = globalSearchResultsEl?.contains(event.target) || globalSearchInputEl?.contains(event.target);
      const clickedMobileSearch = mobileSearchModalEl?.contains(event.target) || mobileSearchBtnEl?.contains(event.target);
      if (!clickedDesktopSearch && !clickedMobileSearch) {
        hideGlobalSearchResults();
        closeMobileSearch();
      }
    });

    function entrarNoGeradorRecibos() {
      document.body.classList.add('app-mode');
      document.getElementById('recibos-home').classList.add('hidden');
      document.getElementById('recibos-app').classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function mostrarHomeRecibos() {
      window.location.href = 'https://gaveblue.com.br/';
    }

    async function copiarChavePixApoio() {
      const chave = 'apoio@gaveblue.com.br';
      const botao = document.getElementById('support-copy-btn');
      const textoBotao = botao ? botao.querySelector('.support-copy-btn-text') : null;

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(chave);
        } else {
          const tempInput = document.createElement('textarea');
          tempInput.value = chave;
          tempInput.setAttribute('readonly', '');
          tempInput.style.position = 'fixed';
          tempInput.style.opacity = '0';
          tempInput.style.pointerEvents = 'none';
          document.body.appendChild(tempInput);
          tempInput.select();
          tempInput.setSelectionRange(0, chave.length);
          const copiou = document.execCommand('copy');
          tempInput.remove();
          if (!copiou) {
            throw new Error('copy-failed');
          }
        }

        mostrarToastGlobal('Chave Pix copiada com sucesso!', 'success', '✓', 2200);
        if (textoBotao) {
          textoBotao.textContent = 'Copiado';
          setTimeout(() => {
            textoBotao.textContent = 'Copiar';
          }, 1800);
        }
      } catch (error) {
        mostrarToastGlobal('Não foi possível copiar a chave Pix.', 'error', '!', 2400);
      }
    }


    // FunÃ§Ã£o para processar data de forma inteligente
    function processarDataInteligente(valorData) {
      if (!valorData) return obterDataFormatada();
      
      const meses = ['JANEIRO', 'FEVEREIRO', 'MARÃ‡O', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
      
      if (typeof valorData === 'number') {
        const dataExcel = XLSX.SSF.parse_date_code(valorData);
        const dia = String(dataExcel.d).padStart(2, '0');
        const mes = meses[dataExcel.m - 1];
        const ano = dataExcel.y;
        return `${dia} DE ${mes} DE ${ano}`;
      }
      
      const valorStr = String(valorData).trim();
      
      if (/^\d{2} DE [A-ZÇÃÁÉÍÓÚ]+ DE \d{4}$/.test(valorStr.toUpperCase())) {
        return valorStr.toUpperCase();
      }
      
      let data = null;
      
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(valorStr)) {
        const partes = valorStr.split('/');
        data = new Date(partes[2], partes[1] - 1, partes[0]);
      }
      else if (/^\d{2}[-\.]\d{2}[-\.]\d{4}$/.test(valorStr)) {
        const partes = valorStr.split(/[-\.]/);
        data = new Date(partes[2], partes[1] - 1, partes[0]);
      }
      else if (/^\d{4}[-\/]\d{2}[-\/]\d{2}$/.test(valorStr)) {
        const partes = valorStr.split(/[-\/]/);
        data = new Date(partes[0], partes[1] - 1, partes[2]);
      }
      else if (/^\d{2}\/\d{2}\/\d{2}$/.test(valorStr)) {
        const partes = valorStr.split('/');
        const ano = parseInt(partes[2]) < 50 ? '20' + partes[2] : '19' + partes[2];
        data = new Date(ano, partes[1] - 1, partes[0]);
      }
      else {
        data = new Date(valorStr);
      }
      
      if (data && !isNaN(data.getTime())) {
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = meses[data.getMonth()];
        const ano = data.getFullYear();
        return `${dia} DE ${mes} DE ${ano}`;
      }
      
      return obterDataFormatada();
    }

    // FunÃ§Ã£o para processar valor monetÃ¡rio de forma inteligente
    function processarValorInteligente(valorMonetario) {
      if (!valorMonetario) return '';
      
      if (typeof valorMonetario === 'number') {
        return 'R$ ' + valorMonetario.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
      
      let valorStr = String(valorMonetario).trim();
      
      if (/^R\$\s?\d{1,3}(\.\d{3})*(,\d{2})?$/.test(valorStr)) {
        return valorStr.replace(/^R\$\s?/, 'R$ ');
      }
      
      valorStr = valorStr.replace(/[^\d,\.]/g, '');
      
      if (!valorStr) return '';
      
      let valorNumerico = 0;
      
      if (/^\d+(\.\d{1,2})?$/.test(valorStr) && !valorStr.includes(',')) {
        valorNumerico = parseFloat(valorStr);
      }
      else if (valorStr.includes('.') && valorStr.includes(',')) {
        valorStr = valorStr.replace(/\./g, '').replace(',', '.');
        valorNumerico = parseFloat(valorStr);
      }
      else if (valorStr.includes(',') && valorStr.includes('.')) {
        valorStr = valorStr.replace(/,/g, '');
        valorNumerico = parseFloat(valorStr);
      }
      else if (valorStr.includes('.') && !valorStr.includes(',')) {
        const partes = valorStr.split('.');
        if (partes[0].length > 3 || partes[1].length === 3) {
          valorStr = valorStr.replace(/\./g, '');
          valorNumerico = parseFloat(valorStr);
        } else {
          valorNumerico = parseFloat(valorStr);
        }
      }
      else if (valorStr.includes(',') && !valorStr.includes('.')) {
        valorStr = valorStr.replace(',', '.');
        valorNumerico = parseFloat(valorStr);
      }
      else {
        valorNumerico = parseFloat(valorStr);
      }
      
      if (isNaN(valorNumerico) || valorNumerico < 0) {
        return '';
      }
      
      return 'R$ ' + valorNumerico.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // VariÃ¡vel global para controlar o modelo atual
    let modeloAtual = 'padrao';

    function atualizarAssinaturaCompleta() {
      const emitente = document.getElementById('emitente-completo');
      const cpfcnpj = document.getElementById('cpfcnpj-completo');
      const assinaturaNome = document.getElementById('assinaturaNome-completo');
      const assinaturaCpf = document.getElementById('assinaturaCpf-completo');

      if (assinaturaNome) assinaturaNome.textContent = emitente ? emitente.value : '';
      if (assinaturaCpf) assinaturaCpf.textContent = cpfcnpj ? cpfcnpj.value : '';
    }

    // FunÃ§Ã£o auxiliar para mostrar recibo principal
    function mostrarReciboPrincipal() {
      const reciboPadrao = document.getElementById('recibo');
      const reciboCompleto = document.getElementById('recibo-completo');
      const reciboSimplificado = document.getElementById('recibo-simplificado');
      const reciboCovre = document.getElementById('recibo-covre');
      
      // Debug: Verificar se elementos existem
      if (!reciboPadrao || !reciboCompleto || !reciboSimplificado || !reciboCovre) {
        console.warn('Um ou mais elementos de recibo nÃ£o foram encontrados');
      }
      
      if (modeloAtual === 'completo') {
        reciboCompleto.style.display = 'block';
        reciboPadrao.style.display = 'none';
        reciboSimplificado.style.display = 'none';
        reciboCovre.style.display = 'none';
      } else if (modeloAtual === 'simplificado') {
        reciboSimplificado.style.display = 'block';
        reciboPadrao.style.display = 'none';
        reciboCompleto.style.display = 'none';
        reciboCovre.style.display = 'none';
      } else if (modeloAtual === 'covre') {
        reciboCovre.style.display = 'block';
        reciboPadrao.style.display = 'none';
        reciboCompleto.style.display = 'none';
        reciboSimplificado.style.display = 'none';
      } else {
        reciboPadrao.style.display = 'block';
        reciboCompleto.style.display = 'none';
        reciboSimplificado.style.display = 'none';
        reciboCovre.style.display = 'none';
      }
      
      // Rolar atÃ© o recibo principal
      const reciboVisivel = modeloAtual === 'completo'
        ? reciboCompleto
        : (modeloAtual === 'simplificado' ? reciboSimplificado : (modeloAtual === 'covre' ? reciboCovre : reciboPadrao));
      setTimeout(() => {
        reciboVisivel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }

    // FunÃ§Ã£o para alternar entre modelos
    function alternarModelo() {
      const reciboPadrao = document.getElementById('recibo');
      const reciboCompleto = document.getElementById('recibo-completo');
      const reciboSimplificado = document.getElementById('recibo-simplificado');
      const reciboCovre = document.getElementById('recibo-covre');
      
      // Ciclar entre os quatro modelos: padrÃ£o â†’ completo â†’ simplificado â†’ trainer â†’ padrÃ£o
      if (modeloAtual === 'padrao') {
        modeloAtual = 'completo';
        reciboPadrao.style.display = 'none';
        reciboCompleto.style.display = 'block';
        reciboSimplificado.style.display = 'none';
        reciboCovre.style.display = 'none';
        mostrarMensagem('Modelo completo ativado!', 'sucesso');
      } else if (modeloAtual === 'completo') {
        modeloAtual = 'simplificado';
        reciboPadrao.style.display = 'none';
        reciboCompleto.style.display = 'none';
        reciboSimplificado.style.display = 'block';
        reciboCovre.style.display = 'none';
        mostrarMensagem('Modelo simplificado ativado!', 'sucesso');
      } else if (modeloAtual === 'simplificado') {
        modeloAtual = 'covre';
        reciboPadrao.style.display = 'none';
        reciboCompleto.style.display = 'none';
        reciboSimplificado.style.display = 'none';
        reciboCovre.style.display = 'block';
        mostrarMensagem('Modelo Trainer ativado!', 'sucesso');
      } else {
        modeloAtual = 'padrao';
        reciboPadrao.style.display = 'block';
        reciboCompleto.style.display = 'none';
        reciboSimplificado.style.display = 'none';
        reciboCovre.style.display = 'none';
        mostrarMensagem('Modelo padrão ativado!', 'sucesso');
      }
      
      localStorage.setItem('modeloRecibo', modeloAtual);
      
      setTimeout(() => {
        const reciboVisivel = modeloAtual === 'completo'
          ? reciboCompleto
          : (modeloAtual === 'simplificado' ? reciboSimplificado : (modeloAtual === 'covre' ? reciboCovre : reciboPadrao));
        reciboVisivel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }

    // FunÃ§Ã£o para mostrar toast de alternÃ¢ncia de modelo
    function mostrarToastAlternancia(mensagem) {
      mostrarToastGlobal(mensagem, 'info', '↺', 2000);
    }

    // Carregar preferÃªncia do modelo ao iniciar
    window.addEventListener('DOMContentLoaded', function() {
      const modeloSalvo = localStorage.getItem('modeloRecibo');
      const reciboPadrao = document.getElementById('recibo');
      const reciboCompleto = document.getElementById('recibo-completo');
      const reciboSimplificado = document.getElementById('recibo-simplificado');
      const reciboCovre = document.getElementById('recibo-covre');
      
      // Sempre comeÃ§ar com modelo padrÃ£o como padrÃ£o
      reciboPadrao.style.display = 'block';
      reciboCompleto.style.display = 'none';
      reciboSimplificado.style.display = 'none';
      reciboCovre.style.display = 'none';
      modeloAtual = 'padrao';
      
      if (modeloSalvo === 'completo') {
        reciboPadrao.style.display = 'none';
        reciboCompleto.style.display = 'block';
        reciboSimplificado.style.display = 'none';
        reciboCovre.style.display = 'none';
        modeloAtual = 'completo';
      } else if (modeloSalvo === 'simplificado') {
        reciboPadrao.style.display = 'none';
        reciboCompleto.style.display = 'none';
        reciboSimplificado.style.display = 'block';
        reciboCovre.style.display = 'none';
        modeloAtual = 'simplificado';
      } else if (modeloSalvo === 'covre') {
        reciboPadrao.style.display = 'none';
        reciboCompleto.style.display = 'none';
        reciboSimplificado.style.display = 'none';
        reciboCovre.style.display = 'block';
        modeloAtual = 'covre';
      }

      const valorCompleto = document.getElementById('valor-completo');
      const emitenteCompleto = document.getElementById('emitente-completo');
      const cpfCompleto = document.getElementById('cpfcnpj-completo');
      const dataCompleto = document.getElementById('data-completo');

      if (valorCompleto) valorCompleto.oninput = function() { formatarMoeda(this); };
      if (emitenteCompleto) emitenteCompleto.oninput = atualizarAssinaturaCompleta;
      if (cpfCompleto) cpfCompleto.oninput = function() { formatarCpfCnpj(this); atualizarAssinaturaCompleta(); };
      if (dataCompleto && !dataCompleto.value) dataCompleto.value = obterDataFormatada();
    });

    function atualizarBotaoFooter(recolhido) {
      const toggleBtn = document.getElementById('toggle-footer');
      if (!toggleBtn) return;

      toggleBtn.classList.toggle('footer-hidden', recolhido);
      toggleBtn.setAttribute('data-name', recolhido ? 'Mostrar Barra' : 'Ocultar Barra');
      toggleBtn.setAttribute('data-tooltip', recolhido ? 'Mostrar Barra' : 'Ocultar Barra');
      toggleBtn.innerHTML = `<i data-lucide="${recolhido ? 'chevron-down' : 'chevron-up'}"></i>`;

      if (window.lucide) {
        window.lucide.createIcons();
      }
    }

    // FunÃ§Ã£o para alternar visibilidade do rodapÃ©
    function toggleFooter() {
      const footer = document.querySelector('.botoes');
      if (!footer) return;

      footer.classList.toggle('footer-collapsed');
      const isHidden = footer.classList.contains('footer-collapsed');
      atualizarBotaoFooter(isHidden);
      localStorage.setItem('footerHidden', isHidden ? 'true' : 'false');
    }

    // Carregar preferÃªncia do rodapÃ© ao iniciar
    window.addEventListener('DOMContentLoaded', function() {
      const footerHidden = localStorage.getItem('footerHidden') === 'true';
      const footer = document.querySelector('.botoes');

      if (footerHidden && footer) {
        footer.classList.add('footer-collapsed');
      }

      atualizarBotaoFooter(footerHidden);
    });
    function abrirNotificacoes() {
      carregarNotificacoes();
      document.getElementById('popup-notificacoes').classList.remove('hidden');
    }

    // FunÃ§Ã£o para fechar central de notificaÃ§Ãµes
    function fecharNotificacoes() {
      document.getElementById('popup-notificacoes').classList.add('hidden');
    }

    // NotificaÃ§Ãµes prÃ©-definidas
    const notificacoesPadrao = [
      {
        id: 1,
        titulo: 'Novo recurso: Salvar recibos',
        descricao: 'Agora vocÃª pode salvar seus recibos no histÃ³rico com um Ãºnico clique. Use o botÃ£o "Salvar Recibo" na barra de ferramentas para manter seus recibos organizados.',
        icone: 'ðŸ’¾'
      },
      {
        id: 2,
        titulo: 'HistÃ³rico de recibos',
        descricao: 'Acompanhe todos os recibos que vocÃª criou. Clique no botÃ£o de histÃ³rico para visualizar, editar ou restaurar recibos antigos.'
      },
      {
        id: 3,
        titulo: 'Download de modelos de planilhas',
        descricao: 'Baixe modelos prontos para importar mÃºltiplos recibos de uma vez. DisponÃ­vel em duas versÃµes: PadrÃ£o (completo) e Simplificado (bÃ¡sico).'
      },
      {
        id: 4,
        titulo: 'ImportaÃ§Ã£o em massa',
        descricao: 'Importe vÃ¡rios recibos de uma vez usando planilhas Excel. Basta preparar seus dados no formato correto e clicar em "Importar Dados".'
      },
      {
        id: 5,
        titulo: 'Novo modelo Trainer disponÃ­vel',
        descricao: 'Novo modelo de recibo Trainer disponÃ­vel na barra de ferramentas para alternÃ¢ncia rÃ¡pida entre os formatos.'
      },
      {
        id: 6,
        titulo: 'PersonalizaÃ§Ãµes ampliadas',
        descricao: 'Gerencie seus emitentes e recebedores! Salve informaÃ§Ãµes frequentemente usadas para agilizar o preenchimento de recibos futuros.'
      }
    ];

    // FunÃ§Ã£o para inicializar notificaÃ§Ãµes
    function inicializarNotificacoes() {
      const notificacoesLidas = JSON.parse(localStorage.getItem('notificacoes-lidas') || '[]');
      const notificacoes = JSON.parse(localStorage.getItem('notificacoes') || JSON.stringify(notificacoesPadrao));
      
      // Se nÃ£o houver notificaÃ§Ãµes salvas, usar as padrÃ£o
      if (!localStorage.getItem('notificacoes')) {
        localStorage.setItem('notificacoes', JSON.stringify(notificacoesPadrao));
      }
      
      atualizarBadgeNotificacoes();
    }

    // FunÃ§Ã£o para carregar notificaÃ§Ãµes
    function carregarNotificacoes() {
      const notificacoes = JSON.parse(localStorage.getItem('notificacoes') || JSON.stringify(notificacoesPadrao));
      const notificacoesLidas = JSON.parse(localStorage.getItem('notificacoes-lidas') || '[]');
      const container = document.getElementById('lista-notificacoes');
      container.innerHTML = '';

      if (notificacoes.length === 0) {
      container.innerHTML = '<div style="text-align: center; padding: 40px 20px; color: #6b7280;">Todas as notificaÃ§Ãµes foram lidas!</div>';
        return;
      }

      notificacoes.forEach(notificacao => {
        const estaLida = notificacoesLidas.includes(notificacao.id);
        const item = document.createElement('div');
        item.className = 'notificacao-item' + (estaLida ? ' lida' : '');
        item.onclick = () => marcarComoLida(notificacao.id);
        
        item.innerHTML = `
          <p class="notificacao-titulo">
            ${notificacao.icone || 'ðŸ“¢'} ${notificacao.titulo}
            ${estaLida ? '<span class="notificacao-badge-lida">âœ“ Lida</span>' : ''}
          </p>
          <p class="notificacao-descricao">${notificacao.descricao}</p>
        `;
        
        container.appendChild(item);
      });
    }

    // FunÃ§Ã£o para marcar notificaÃ§Ã£o como lida
    function marcarComoLida(notificacaoId) {
      let notificacoesLidas = JSON.parse(localStorage.getItem('notificacoes-lidas') || '[]');
      
      if (!notificacoesLidas.includes(notificacaoId)) {
        notificacoesLidas.push(notificacaoId);
        localStorage.setItem('notificacoes-lidas', JSON.stringify(notificacoesLidas));
        
        carregarNotificacoes();
        atualizarBadgeNotificacoes();
      }
    }

    // FunÃ§Ã£o para marcar todas como lidas
    function marcarTodasLidas() {
      const notificacoes = JSON.parse(localStorage.getItem('notificacoes') || JSON.stringify(notificacoesPadrao));
      const todasLidas = notificacoes.map(n => n.id);
      localStorage.setItem('notificacoes-lidas', JSON.stringify(todasLidas));
      
      carregarNotificacoes();
      atualizarBadgeNotificacoes();
      mostrarMensagem('Todas as notificaÃ§Ãµes foram marcadas como lidas!', 'sucesso');
    }

    // FunÃ§Ã£o para atualizar badge de notificaÃ§Ãµes
    function atualizarBadgeNotificacoes() {
      const notificacoes = JSON.parse(localStorage.getItem('notificacoes') || JSON.stringify(notificacoesPadrao));
      const notificacoesLidas = JSON.parse(localStorage.getItem('notificacoes-lidas') || '[]');
      const naoLidas = notificacoes.length - notificacoesLidas.length;
      
      const badge = document.querySelector('.notificacoes-badge');
      if (badge) {
        if (naoLidas > 0) {
          badge.textContent = naoLidas;
          badge.style.display = 'flex';
        } else {
          badge.style.display = 'none';
        }
      }
    }

    // Inicializar notificaÃ§Ãµes ao carregar
    window.addEventListener('DOMContentLoaded', function() {
      inicializarNotificacoes();
    });

    function abrirAjuda() {
      document.getElementById('popup-ajuda').classList.remove('hidden');
    }

    // FunÃ§Ã£o para fechar ajuda
    function fecharAjuda() {
      document.getElementById('popup-ajuda').classList.add('hidden');
    }

    function abrirEditarEmitentes() {
      abrirEmitentes();
    }

    function abrirEmitentes() {
      carregarEmitentes();
      document.getElementById('popup-emitentes').classList.remove('hidden');
    }

    // FunÃ§Ã£o para fechar gerenciador de emitentes
    function fecharEmitentes() {
      document.getElementById('popup-emitentes').classList.add('hidden');
      document.getElementById('novo-emitente-nome').value = '';
      document.getElementById('novo-emitente-cpf').value = '';
    }

    // FunÃ§Ã£o para abrir gerenciador de recebedores
    function abrirRecebedores() {
      carregarRecebedores();
      document.getElementById('popup-recebedores').classList.remove('hidden');
    }

    // FunÃ§Ã£o para fechar gerenciador de recebedores
    function fecharRecebedores() {
      document.getElementById('popup-recebedores').classList.add('hidden');
      document.getElementById('novo-recebedor-nome').value = '';
      document.getElementById('novo-recebedor-cpf').value = '';
    }

    // FunÃ§Ã£o para adicionar recebedor
    function adicionarRecebedor() {
      const nome = document.getElementById('novo-recebedor-nome').value.trim();
      const cpf = document.getElementById('novo-recebedor-cpf').value.trim();

      if (!nome || !cpf) {
        mostrarMensagem('Preencha nome e CPF/CNPJ!', 'erro');
        return;
      }

      let recebedores = JSON.parse(localStorage.getItem('recebedores') || '[]');
      
      if (recebedores.some(r => r.cpf === cpf)) {
        mostrarMensagem('Recebedor com este CPF/CNPJ jÃ¡ existe!', 'erro');
        return;
      }

      recebedores.push({ id: Date.now(), nome, cpf });
      localStorage.setItem('recebedores', JSON.stringify(recebedores));

      document.getElementById('novo-recebedor-nome').value = '';
      document.getElementById('novo-recebedor-cpf').value = '';
      carregarRecebedores();
      mostrarMensagem('Recebedor adicionado com sucesso!', 'sucesso');
    }

    // FunÃ§Ã£o para carregar recebedores
    function carregarRecebedores() {
      const recebedores = JSON.parse(localStorage.getItem('recebedores') || '[]');
      const container = document.getElementById('lista-recebedores');
      container.innerHTML = '';

      if (recebedores.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px 20px; color: #6b7280;">Nenhum recebedor cadastrado</div>';
        return;
      }

      recebedores.forEach(recebedor => {
        const item = document.createElement('div');
        item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 10px; background: #f9fafb;';
        item.innerHTML = `
          <div>
            <div style="font-weight: bold; color: #1f2937;">${recebedor.nome}</div>
            <div style="font-size: 13px; color: #6b7280;">${recebedor.cpf}</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button onclick="usarRecebedor('${recebedor.id}')" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">Usar</button>
            <button onclick="deletarRecebedor('${recebedor.id}')" style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">Deletar</button>
          </div>
        `;
        container.appendChild(item);
      });
    }

    // FunÃ§Ã£o para usar recebedor
    function usarRecebedor(id) {
      const recebedores = JSON.parse(localStorage.getItem('recebedores') || '[]');
      const recebedor = recebedores.find(r => r.id == id);

      if (!recebedor) return;

        if (modeloAtual === 'simplificado' && reciboSimplificado && reciboSimplificado.style.display !== 'none') {
        document.getElementById('nome-principal').value = recebedor.nome;
      } else if (modeloAtual === 'covre' && reciboMoyses && reciboMoyses.style.display !== 'none') {
        const nomeInput = reciboMoyses.querySelector('.nome');
        if (nomeInput) nomeInput.value = recebedor.nome;
      } else {
        // Formatar como "RAZAO SOCIAL, inscrita(a) sob o CPF/CNPJ nÂº 123..."
        const cpfFormatado = formatarCpfCnpj2(recebedor.cpf);
        const linhaFormatada = `${recebedor.nome}, inscrita(a) sob o CPF/CNPJ nÂº ${cpfFormatado}`;
        document.getElementById('recebedor').value = linhaFormatada;
      }

      fecharRecebedores();
      mostrarMensagem('Recebedor carregado!', 'sucesso');
    }

    // FunÃ§Ã£o para deletar recebedor
    function deletarRecebedor(id) {
      let recebedores = JSON.parse(localStorage.getItem('recebedores') || '[]');
      recebedores = recebedores.filter(r => r.id != id);
      localStorage.setItem('recebedores', JSON.stringify(recebedores));
      carregarRecebedores();
      mostrarMensagem('Recebedor deletado!', 'sucesso');
    }

    // FunÃ§Ã£o auxiliar para formatar CPF/CNPJ sem modificar o input
    function formatarCpfCnpj2(valor) {
      let cpf = valor.replace(/\D/g, '');
      cpf = cpf.substring(0, 14);
      
      if (cpf.length <= 11) {
        cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
        cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
        cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      } else {
        cpf = cpf.replace(/^(\d{2})(\d)/, '$1.$2');
        cpf = cpf.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        cpf = cpf.replace(/\.(\d{3})(\d)/, '.$1/$2');
        cpf = cpf.replace(/(\d{4})(\d)/, '$1-$2');
      }
      
      return cpf;
    }

    // FunÃ§Ã£o para mostrar sugestÃµes de emitente
    function mostrarSugestoesEmitente(input) {
      const valor = input.value.toLowerCase().trim();
      const container = document.getElementById('sugestoes-emitente');

      if (valor.length < 1) {
        container.style.display = 'none';
        return;
      }

      const emitentes = JSON.parse(localStorage.getItem('emitentes') || '[]');
      const filtrados = emitentes.filter(e => 
        e.nome.toLowerCase().includes(valor) || e.cpf.includes(valor)
      );

      if (filtrados.length === 0) {
        container.style.display = 'none';
        return;
      }

      container.innerHTML = '';
      filtrados.slice(0, 5).forEach(emitente => {
        const item = document.createElement('div');
        item.style.cssText = 'padding: 12px; border-bottom: 1px solid #e5e7eb; cursor: pointer; hover: background #f3f4f6;';
        item.innerHTML = `<div style="font-weight: 500; color: #1f2937;">${emitente.nome}</div><div style="font-size: 12px; color: #6b7280;">${emitente.cpf}</div>`;
        item.onmouseover = () => item.style.background = '#f3f4f6';
        item.onmouseout = () => item.style.background = 'white';
        item.onclick = () => selecionarEmitenteSugestao(emitente);
        container.appendChild(item);
      });

      container.style.display = 'block';
    }

    // FunÃ§Ã£o para selecionar emitente da sugestÃ£o
    function selecionarEmitenteSugestao(emitente) {
      document.getElementById('emitente').value = emitente.nome;
      document.getElementById('cpfcnpj').value = emitente.cpf;
      atualizarAssinatura();
      document.getElementById('sugestoes-emitente').style.display = 'none';
    }

    // FunÃ§Ã£o para mostrar sugestÃµes de recebedor
    function mostrarSugestoesRecebedor(input) {
      const valor = input.value.toLowerCase().trim();
      const container = document.getElementById('sugestoes-recebedor');

      if (valor.length < 1) {
        container.style.display = 'none';
        return;
      }

      const recebedores = JSON.parse(localStorage.getItem('recebedores') || '[]');
      const filtrados = recebedores.filter(r => 
        r.nome.toLowerCase().includes(valor) || r.cpf.includes(valor)
      );

      if (filtrados.length === 0) {
        container.style.display = 'none';
        return;
      }

      container.innerHTML = '';
      filtrados.slice(0, 5).forEach(recebedor => {
        const item = document.createElement('div');
        item.style.cssText = 'padding: 12px; border-bottom: 1px solid #e5e7eb; cursor: pointer;';
        item.innerHTML = `<div style="font-weight: 500; color: #1f2937;">${recebedor.nome}</div><div style="font-size: 12px; color: #6b7280;">${recebedor.cpf}</div>`;
        item.onmouseover = () => item.style.background = '#f3f4f6';
        item.onmouseout = () => item.style.background = 'white';
        item.onclick = () => selecionarRecebedorSugestao(recebedor);
        container.appendChild(item);
      });

      container.style.display = 'block';
    }

    // FunÃ§Ã£o para selecionar recebedor da sugestÃ£o
    function selecionarRecebedorSugestao(recebedor) {
      const cpfFormatado = formatarCpfCnpj2(recebedor.cpf);
      const linhaFormatada = `${recebedor.nome}, inscrita(a) sob o CPF/CNPJ nÂº ${cpfFormatado}`;
      document.getElementById('recebedor').value = linhaFormatada;
      document.getElementById('sugestoes-recebedor').style.display = 'none';
    }

    // Configurar eventos para sugestÃµes ao carregar pÃ¡gina
    window.addEventListener('DOMContentLoaded', function() {
      const emitenteInput = document.getElementById('emitente');
      const recebedorInput = document.getElementById('recebedor');

      if (emitenteInput) {
        emitenteInput.addEventListener('input', function() {
          mostrarSugestoesEmitente(this);
        });
        emitenteInput.addEventListener('blur', function() {
          setTimeout(() => {
            document.getElementById('sugestoes-emitente').style.display = 'none';
          }, 200);
        });
        emitenteInput.addEventListener('focus', function() {
          if (this.value.length > 0) {
            mostrarSugestoesEmitente(this);
          }
        });
      }

      if (recebedorInput) {
        recebedorInput.addEventListener('input', function() {
          mostrarSugestoesRecebedor(this);
        });
        recebedorInput.addEventListener('blur', function() {
          setTimeout(() => {
            document.getElementById('sugestoes-recebedor').style.display = 'none';
          }, 200);
        });
        recebedorInput.addEventListener('focus', function() {
          if (this.value.length > 0) {
            mostrarSugestoesRecebedor(this);
          }
        });
      }
    });

    // FunÃ§Ã£o para adicionar emitente
    function adicionarEmitente() {
      const nome = document.getElementById('novo-emitente-nome').value.trim();
      const cpf = document.getElementById('novo-emitente-cpf').value.trim();

      if (!nome || !cpf) {
        mostrarMensagem('Preencha nome e CPF/CNPJ!', 'erro');
        return;
      }

      let emitentes = JSON.parse(localStorage.getItem('emitentes') || '[]');
      
      if (emitentes.some(e => e.cpf === cpf)) {
        mostrarMensagem('Emitente com este CPF/CNPJ jÃ¡ existe!', 'erro');
        return;
      }

      emitentes.push({ id: Date.now(), nome, cpf });
      localStorage.setItem('emitentes', JSON.stringify(emitentes));

      document.getElementById('novo-emitente-nome').value = '';
      document.getElementById('novo-emitente-cpf').value = '';
      carregarEmitentes();
      mostrarMensagem('Emitente adicionado com sucesso!', 'sucesso');
    }

    // FunÃ§Ã£o para carregar emitentes
    function carregarEmitentes() {
      const emitentes = JSON.parse(localStorage.getItem('emitentes') || '[]');
      const container = document.getElementById('lista-emitentes');
      container.innerHTML = '';

      if (emitentes.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px 20px; color: #6b7280;">Nenhum emitente cadastrado</div>';
        return;
      }

      emitentes.forEach(emitente => {
        const item = document.createElement('div');
        item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 10px; background: #f9fafb;';
        item.innerHTML = `
          <div>
            <div style="font-weight: bold; color: #1f2937;">${emitente.nome}</div>
            <div style="font-size: 13px; color: #6b7280;">${emitente.cpf}</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button onclick="usarEmitente('${emitente.id}')" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">Usar</button>
            <button onclick="deletarEmitente('${emitente.id}')" style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">Deletar</button>
          </div>
        `;
        container.appendChild(item);
      });
    }

    // FunÃ§Ã£o para usar emitente
    function usarEmitente(id) {
      const emitentes = JSON.parse(localStorage.getItem('emitentes') || '[]');
      const emitente = emitentes.find(e => e.id == id);

      if (!emitente) return;

      if (modeloAtual === 'simplificado') {
        document.getElementById('nome-principal').value = emitente.nome;
      } else if (modeloAtual === 'covre') {
        const reciboCovre = document.getElementById('recibo-moyses');
        if (reciboCovre) {
          const nomeInput = reciboCovre.querySelector('.nome');
          if (nomeInput) nomeInput.value = emitente.nome;
        }
      } else {
        document.getElementById('emitente').value = emitente.nome;
        document.getElementById('cpfcnpj').value = emitente.cpf;
        document.getElementById('assinaturaNome').textContent = emitente.nome;
        document.getElementById('assinaturaCpf').textContent = emitente.cpf;
      }

      fecharEmitentes();
      mostrarMensagem('Emitente carregado!', 'sucesso');
    }

    // FunÃ§Ã£o para deletar emitente
    function deletarEmitente(id) {
      let emitentes = JSON.parse(localStorage.getItem('emitentes') || '[]');
      emitentes = emitentes.filter(e => e.id != id);
      localStorage.setItem('emitentes', JSON.stringify(emitentes));
      carregarEmitentes();
      mostrarMensagem('Emitente deletado!', 'sucesso');
    }

    // FunÃ§Ã£o para abrir histÃ³rico
    function abrirHistorico() {
      carregarHistorico();
      document.getElementById('popup-historico').classList.remove('hidden');
    }

    // FunÃ§Ã£o para fechar histÃ³rico
    function fecharHistorico() {
      document.getElementById('popup-historico').classList.add('hidden');
    }

    // FunÃ§Ã£o para salvar recibo no histÃ³rico
    function salvarNoHistorico(dados) {
      let historico = JSON.parse(localStorage.getItem('historico-recibos') || '[]');
      
      const recibo = {
        id: Date.now(),
        data: new Date().toLocaleString('pt-BR'),
        dados: dados
      };

      historico.unshift(recibo);
      
      if (historico.length > 50) {
        historico = historico.slice(0, 50);
      }

      localStorage.setItem('historico-recibos', JSON.stringify(historico));
    }

    // FunÃ§Ã£o para carregar histÃ³rico
    function carregarHistorico() {
      const historico = JSON.parse(localStorage.getItem('historico-recibos') || '[]');
      const container = document.getElementById('lista-historico');
      container.innerHTML = '';

      if (historico.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px 20px; color: #6b7280;">Nenhum recibo no histÃ³rico</div>';
        return;
      }

      historico.forEach(item => {
        const resumo = `${item.dados.recebedor || item.dados.nome || 'Sem nome'} - ${item.dados.valor || 'Sem valor'}`;
        const itemDiv = document.createElement('div');
        itemDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 10px; background: #fffbeb;';
        itemDiv.innerHTML = `
          <div>
            <div style="font-weight: bold; color: #1f2937;">${resumo}</div>
            <div style="font-size: 12px; color: #6b7280;">${item.data}</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button onclick="visualizarRecibosHistorico('${item.id}')" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">Visualizar</button>
            <button onclick="deletarRecibosHistorico('${item.id}')" style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">Deletar</button>
          </div>
        `;
        container.appendChild(itemDiv);
      });
    }

    // FunÃ§Ã£o para visualizar recibos do histÃ³rico
    function visualizarRecibosHistorico(id) {
      const historico = JSON.parse(localStorage.getItem('historico-recibos') || '[]');
      const item = historico.find(h => h.id == id);

      if (!item) return;

      fecharHistorico();
      
      // Limpar recibos gerados
      document.getElementById('recibos-gerados').innerHTML = '';

      // Reconstruir o recibo a partir dos dados salvos
      let modeloId = 'modelo-recibo';
      if (item.dados.modelo === 'completo') {
        modeloId = 'modelo-recibo-completo';
      } else if (item.dados.modelo === 'simplificado') {
        modeloId = 'modelo-recibo-simplificado';
      } else if (item.dados.modelo === 'covre') {
        modeloId = 'modelo-recibo-covre';
      }

      const modelo = document.getElementById(modeloId);
      const novoRecibo = modelo.cloneNode(true);
      novoRecibo.id = 'recibo-historico-' + id;
      novoRecibo.style.display = 'block';

      // Preencher dados do recibo
      if (item.dados.modelo === 'simplificado') {
        const valorInput = novoRecibo.querySelector('.valor');
        valorInput.value = item.dados.valor || '';
        const nomeInput = novoRecibo.querySelector('.nome-simples');
        nomeInput.value = item.dados.nome || '';
        atualizarAssinaturaSimples(nomeInput);
        const quantiaInput = novoRecibo.querySelector('.quantia-simples');
        quantiaInput.value = item.dados.quantia || '';
      } else if (item.dados.modelo === 'completo') {
        const tituloConfig = window.elementSdk && window.elementSdk.config ? window.elementSdk.config.titulo_recibo : 'RECIBO';
        novoRecibo.querySelector('.titulo-modelo').textContent = tituloConfig || 'RECIBO';
        novoRecibo.querySelector('.numero-recibo').value = item.dados.numeroRecibo || '';
        novoRecibo.querySelector('.valor').value = item.dados.valor || '';
        novoRecibo.querySelector('.recebedor').value = item.dados.recebedor || '';
        novoRecibo.querySelector('.campoQuantia').value = item.dados.quantia || '';
        novoRecibo.querySelector('.referencia').value = item.dados.referencia || '';
        novoRecibo.querySelector('.descricao').value = item.dados.descricao || '';
        novoRecibo.querySelector('.emitente').value = item.dados.emitente || '';
        novoRecibo.querySelector('.cpfcnpj').value = item.dados.cpfcnpj || '';
        novoRecibo.querySelector('.data').value = item.dados.data || '';
        novoRecibo.querySelector('.assinaturaNome').textContent = item.dados.emitente || '';
        novoRecibo.querySelector('.assinaturaCpf').textContent = item.dados.cpfcnpj || '';
      } else if (item.dados.modelo === 'covre') {
        const valorInput = novoRecibo.querySelector('.valor');
        valorInput.value = item.dados.valor || '';
        const nomeInput = novoRecibo.querySelector('.nome');
        nomeInput.value = item.dados.nome || '';
      } else {
        const tituloConfig = window.elementSdk && window.elementSdk.config ? window.elementSdk.config.titulo_recibo : 'RECIBO';
        novoRecibo.querySelector('.titulo-modelo').textContent = tituloConfig || 'RECIBO';
        
        novoRecibo.querySelector('.valor').value = item.dados.valor || '';
        novoRecibo.querySelector('.recebedor').value = item.dados.recebedor || '';
        novoRecibo.querySelector('.campoQuantia').value = item.dados.quantia || '';
        novoRecibo.querySelector('.referencia').value = item.dados.referencia || '';
        novoRecibo.querySelector('.descricao').value = item.dados.descricao || '';
        novoRecibo.querySelector('.emitente').value = item.dados.emitente || '';
        novoRecibo.querySelector('.cpfcnpj').value = item.dados.cpfcnpj || '';
        novoRecibo.querySelector('.data').value = item.dados.data || '';
        novoRecibo.querySelector('.assinaturaNome').textContent = item.dados.emitente || '';
        novoRecibo.querySelector('.assinaturaCpf').textContent = item.dados.cpfcnpj || '';
      }

      const escala = zoomAtual / 100;
      novoRecibo.style.transform = `scale(${escala})`;
      novoRecibo.style.transformOrigin = 'top center';
      novoRecibo.style.marginBottom = `${40 * escala}px`;

      document.getElementById('recibos-gerados').appendChild(novoRecibo);
      atualizarContador();
      
      mostrarMensagem('Recibo restaurado do histÃ³rico!', 'sucesso');
    }

    // FunÃ§Ã£o para deletar recibo do histÃ³rico
    function deletarRecibosHistorico(id) {
      let historico = JSON.parse(localStorage.getItem('historico-recibos') || '[]');
      historico = historico.filter(h => h.id != id);
      localStorage.setItem('historico-recibos', JSON.stringify(historico));
      carregarHistorico();
      mostrarMensagem('Recibo deletado do histÃ³rico!', 'sucesso');
    }

    // FunÃ§Ã£o para limpar histÃ³rico completo
    function limparHistorico() {
      if (confirm('Tem certeza que deseja limpar todo o histÃ³rico? Esta aÃ§Ã£o nÃ£o poderÃ¡ ser desfeita.')) {
        localStorage.removeItem('historico-recibos');
        carregarHistorico();
        mostrarMensagem('HistÃ³rico limpo!', 'sucesso');
      }
    }

    // FunÃ§Ã£o para salvar recibo atual no histÃ³rico
    function salvarRecibosAtual() {
      const reciboPadrao = document.getElementById('recibo');
      const reciboCompleto = document.getElementById('recibo-completo');
      const reciboSimplificado = document.getElementById('recibo-simplificado');
      
      let dadosRecibo = {};

      if (modeloAtual === 'simplificado' && reciboSimplificado.style.display !== 'none') {
        const valor = document.getElementById('valor-simples').value;
        const nome = document.getElementById('nome-principal').value;
        const quantia = document.getElementById('quantia-simples').value;

        if (!valor && !nome) {
          mostrarMensagem('Preencha pelo menos valor ou nome!', 'erro');
          return;
        }

        dadosRecibo = {
          modelo: 'simplificado',
          valor: valor,
          nome: nome,
          quantia: quantia
        };
      } else if (modeloAtual === 'completo' && reciboCompleto.style.display !== 'none') {
        const numeroRecibo = document.getElementById('numero-recibo-completo').value;
        const valor = document.getElementById('valor-completo').value;
        const recebedor = document.getElementById('recebedor-completo').value;
        const referencia = document.getElementById('referencia-completo').value;
        const descricao = document.getElementById('descricao-completo').value;
        const emitente = document.getElementById('emitente-completo').value;
        const cpfcnpj = document.getElementById('cpfcnpj-completo').value;
        const data = document.getElementById('data-completo').value;
        const quantia = document.getElementById('campoQuantia-completo').value;

        if (!valor && !recebedor && !emitente && !numeroRecibo) {
          mostrarMensagem('Preencha pelo menos nÃºmero, valor, recebedor ou emitente!', 'erro');
          return;
        }

        dadosRecibo = {
          modelo: 'completo',
          numeroRecibo,
          valor,
          recebedor,
          referencia,
          descricao,
          emitente,
          cpfcnpj,
          data,
          quantia
        };
      } else if (modeloAtual === 'padrao' && reciboPadrao.style.display !== 'none') {
        const valor = document.getElementById('valor').value;
        const recebedor = document.getElementById('recebedor').value;
        const referencia = document.getElementById('referencia').value;
        const descricao = document.getElementById('descricao').value;
        const emitente = document.getElementById('emitente').value;
        const cpfcnpj = document.getElementById('cpfcnpj').value;
        const data = document.getElementById('data').value;

        if (!valor && !recebedor && !emitente) {
          mostrarMensagem('Preencha pelo menos valor, recebedor ou emitente!', 'erro');
          return;
        }

        dadosRecibo = {
          modelo: 'padrao',
          valor: valor,
          recebedor: recebedor,
          referencia: referencia,
          descricao: descricao,
          emitente: emitente,
          cpfcnpj: cpfcnpj,
          data: data,
          quantia: document.getElementById('campoQuantia').value
        };
      } else {
        mostrarMensagem('Nenhum recibo ativo para salvar!', 'erro');
        return;
      }

      salvarNoHistorico(dadosRecibo);
      
      // Limpar campos apÃ³s salvar
      if (modeloAtual === 'simplificado') {
        document.getElementById('valor-simples').value = '';
        document.getElementById('nome-principal').value = '';
      atualizarAssinaturaSimples(document.getElementById('nome-principal'));
        document.getElementById('quantia-simples').value = '';
        atualizarAssinaturaSimples(document.getElementById('nome-principal'));
      } else if (modeloAtual === 'completo') {
        limparReciboPrincipal(reciboCompleto);
      } else {
        document.getElementById('valor').value = '';
        document.getElementById('recebedor').value = '';
        document.getElementById('referencia').value = '';
        document.getElementById('descricao').value = '';
        document.getElementById('emitente').value = '';
        document.getElementById('cpfcnpj').value = '';
        document.getElementById('data').value = obterDataFormatada();
        document.getElementById('campoQuantia').value = '';
        document.getElementById('assinaturaNome').textContent = '';
        document.getElementById('assinaturaCpf').textContent = '';
      }

      mostrarMensagem('Recibo salvo no histÃ³rico!', 'sucesso');
    }

    // FunÃ§Ã£o para baixar modelo de planilha padrÃ£o
    function baixarModeloPadrao() {
      mostrarToastGlobal('Download do modelo padrão iniciado!', 'info', '↓', 2400);
      
      const dados = [
        ['Valor', 'Recebedor', 'Referencia', 'Descricao', 'Emitente', 'CPFCNPJ', 'Data'],
        ['R$ 1.500,00', 'JoÃ£o Silva', 'ServiÃ§os de consultoria', 'Projeto X - Fase 1', 'Maria Santos', '123.456.789-00', '15/01/2024'],
        ['R$ 2.300,00', 'Pedro Costa', 'ManutenÃ§Ã£o predial', 'Reparo hidrÃ¡ulico', 'JosÃ© Oliveira', '987.654.321-00', '20/01/2024']
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(dados);

      ws['!cols'] = [
        { wch: 15 },
        { wch: 20 },
        { wch: 25 },
        { wch: 30 },
        { wch: 20 },
        { wch: 18 },
        { wch: 12 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Recibos');
      XLSX.writeFile(wb, 'modelo_recibos_padrao.xlsx');
    }

    // FunÃ§Ã£o para baixar modelo de planilha completo
    function baixarModeloCompleto() {
      mostrarToastGlobal('Download do modelo completo iniciado!', 'info', '↓', 2400);

      const dados = [
        ['NumeroRecibo', 'Valor', 'Recebedor', 'Referencia', 'Descricao', 'Emitente', 'CPFCNPJ', 'Data'],
        ['0001', 'R$ 1.500,00', 'JoÃ£o Silva', 'ServiÃ§os de consultoria', 'Projeto X - Fase 1', 'Maria Santos', '123.456.789-00', '15/01/2024'],
        ['0002', 'R$ 2.300,00', 'Pedro Costa', 'ManutenÃ§Ã£o predial', 'Reparo hidrÃ¡ulico', 'JosÃ© Oliveira', '987.654.321-00', '20/01/2024']
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(dados);

      ws['!cols'] = [
        { wch: 14 },
        { wch: 15 },
        { wch: 20 },
        { wch: 25 },
        { wch: 30 },
        { wch: 20 },
        { wch: 18 },
        { wch: 12 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Recibos');
      XLSX.writeFile(wb, 'modelo_recibos_completo.xlsx');
    }

    // FunÃ§Ã£o para baixar modelo de planilha simplificado
    function baixarModeloSimplificado() {
      mostrarToastGlobal('Download do modelo simplificado iniciado!', 'info', '↓', 2400);
      
      const dados = [
        ['Valor', 'Recebedor'],
        ['R$ 850,00', 'Ana Costa'],
        ['R$ 1.200,00', 'Pedro Santos'],
        ['R$ 500,00', 'Carlos Souza'],
        ['R$ 2.000,00', 'Juliana Alves']
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(dados);

      ws['!cols'] = [
        { wch: 15 },
        { wch: 25 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Recibos');
      XLSX.writeFile(wb, 'modelo_recibos_simplificado.xlsx');
    }

    // Manter compatibilidade com nome antigo da funÃ§Ã£o
    function baixarModeloPlanilha() {
      baixarModeloPadrao();
    }

    // FunÃ§Ã£o para atualizar contador
    function atualizarContador() {
      const recibosGerados = document.querySelectorAll('#recibos-gerados .recibo');
      const total = recibosGerados.length;
      const contador = document.getElementById('status-contador');
      const numeroSpan = document.getElementById('contador-numero');
      
      if (total > 0) {
        numeroSpan.textContent = total;
        contador.classList.add('visible');
        
        setTimeout(() => {
          contador.classList.remove('visible');
        }, 3000);
      } else {
        contador.classList.remove('visible');
      }
    }

    // FunÃ§Ã£o para mostrar toast
    function mostrarToast() {
      mostrarToastGlobal('Recibos importados com sucesso!', 'success', '✓', 2600);
    }

    // FunÃ§Ã£o auxiliar para mostrar mensagens
    function mostrarMensagem(texto, tipo) {
      const ehErro = tipo === 'erro';
      mostrarToastGlobal(texto, ehErro ? 'error' : 'success', ehErro ? '!' : '✓', 2600);
    }

    // FunÃ§Ã£o para converter nÃºmero para extenso
    function numeroParaExtenso(valor) {
      if (!valor || isNaN(valor) || valor === 0) return '';
      
      const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
      const dez = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
      const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
      const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
      
      function converterGrupo(n) {
        if (n === 0) return '';
        if (n === 100) return 'cem';
        
        let resultado = '';
        const c = Math.floor(n / 100);
        const d = Math.floor((n % 100) / 10);
        const u = n % 10;
        
        if (c > 0) resultado += centenas[c];
        if (d === 1) {
          if (resultado) resultado += ' e ';
          resultado += dez[u];
          return resultado;
        }
        if (d > 0) {
          if (resultado) resultado += ' e ';
          resultado += dezenas[d];
        }
        if (u > 0) {
          if (resultado) resultado += ' e ';
          resultado += unidades[u];
        }
        return resultado;
      }
      
      const partes = valor.toFixed(2).split('.');
      const reais = parseInt(partes[0]);
      const centavos = parseInt(partes[1]);
      
      function converterNumeroInteiro(n) {
        if (n === 0) return 'zero';
        if (n < 1000) return converterGrupo(n);

        if (n < 1000000) {
          const milhares = Math.floor(n / 1000);
          const resto = n % 1000;
          let resultado = milhares === 1 ? 'mil' : `${converterGrupo(milhares)} mil`;

          if (resto > 0) {
            resultado += ' e ' + converterGrupo(resto);
          }

          return resultado;
        }

        if (n < 1000000000) {
          const milhoes = Math.floor(n / 1000000);
          const resto = n % 1000000;
          let resultado = milhoes === 1 ? 'um milhão' : `${converterGrupo(milhoes)} milhões`;

          if (resto > 0) {
            resultado += resto < 100 ? ' e ' : ', ';
            resultado += converterNumeroInteiro(resto);
          }

          return resultado;
        }

        const bilhoes = Math.floor(n / 1000000000);
        const resto = n % 1000000000;
        let resultado = bilhoes === 1 ? 'um bilhão' : `${converterGrupo(bilhoes)} bilhões`;

        if (resto > 0) {
          resultado += resto < 100 ? ' e ' : ', ';
          resultado += converterNumeroInteiro(resto);
        }

        return resultado;
      }

      let extenso = '';

      if (reais === 0) {
        extenso = 'zero reais';
      } else if (reais === 1) {
        extenso = 'um real';
      } else {
        extenso = converterNumeroInteiro(reais) + ' reais';
      }
      
      if (centavos > 0) {
        extenso += ' e ' + converterGrupo(centavos);
        extenso += centavos === 1 ? ' centavo' : ' centavos';
      }
      
      return extenso.charAt(0).toUpperCase() + extenso.slice(1);
    }

    // Formatar moeda
    function formatarMoeda(input) {
      let valor = input.value.replace(/\D/g, '');
      
      if (valor === '') {
        input.value = '';
        const recibo = input.closest('.recibo');
        const campoQuantia = recibo.querySelector('.campoQuantia') || recibo.querySelector('#campoQuantia') || recibo.querySelector('#campoQuantia-completo') || recibo.querySelector('.quantia-simples') || recibo.querySelector('#quantia-simples');
        if (campoQuantia) {
          campoQuantia.value = '';
        }
        return;
      }
      
      const numero = parseInt(valor);
      const reais = numero / 100;
      
      input.value = 'R$ ' + reais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      
      const recibo = input.closest('.recibo');
      const campoQuantia = recibo.querySelector('.campoQuantia') || recibo.querySelector('#campoQuantia') || recibo.querySelector('#campoQuantia-completo') || recibo.querySelector('.quantia-simples') || recibo.querySelector('#quantia-simples');
      if (campoQuantia && reais > 0) {
        const extenso = numeroParaExtenso(reais);
        campoQuantia.value = extenso.toUpperCase();
      }
    }

    // FunÃ§Ã£o para formatar CPF/CNPJ
    function formatarCpfCnpj(input) {
      let valor = input.value.replace(/\D/g, '');
      valor = valor.substring(0, 14);
      
      if (valor.length <= 11) {
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      } else {
        valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
        valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
        valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
      }
      
      input.value = valor;
    }

    // Atualizar assinatura do recibo principal
    function atualizarAssinatura() {
      const emitente = document.getElementById('emitente').value;
      const cpfcnpj = document.getElementById('cpfcnpj').value;
      document.getElementById('assinaturaNome').textContent = emitente;
      document.getElementById('assinaturaCpf').textContent = cpfcnpj;
    }

    // Atualizar assinatura de recibos gerados
    function atualizarAssinaturaDireto(input) {
      const recibo = input.closest('.recibo');
      const emitente = recibo.querySelector('.emitente').value;
      const cpfcnpj = recibo.querySelector('.cpfcnpj').value;
      recibo.querySelector('.assinaturaNome').textContent = emitente;
      recibo.querySelector('.assinaturaCpf').textContent = cpfcnpj;
    }

    function atualizarAssinaturaSimples(input) {
      const recibo = input.closest('.recibo');
      if (!recibo) return;

      const assinatura = recibo.querySelector('.assinatura-nome-simples');
      if (!assinatura) return;

      const nome = input.value.trim();
      assinatura.textContent = nome || 'Assinatura';
    }

    // Verificar se o recibo principal está preenchido
    function verificarReciboPrincipalPreenchido() {
      if (modeloAtual === 'completo') {
        const valor = document.getElementById('valor-completo').value.trim();
        const numero = document.getElementById('numero-recibo-completo').value.trim();
        const recebedor = document.getElementById('recebedor-completo').value.trim();
        const referencia = document.getElementById('referencia-completo').value.trim();
        const descricao = document.getElementById('descricao-completo').value.trim();
        const emitente = document.getElementById('emitente-completo').value.trim();
        const cpfcnpj = document.getElementById('cpfcnpj-completo').value.trim();
        const data = document.getElementById('data-completo').value.trim();
        return valor !== '' || numero !== '' || recebedor !== '' || referencia !== '' || descricao !== '' || emitente !== '' || cpfcnpj !== '' || data !== '';
      } else if (modeloAtual === 'simplificado') {
        const valor = document.getElementById('valor-simples').value.trim();
        const nome = document.getElementById('nome-principal').value.trim();
        return valor !== '' || nome !== '';
      } else if (modeloAtual === 'covre') {
        const valor = document.getElementById('valor-covre').value.trim();
        const nome = document.getElementById('nome-covre').value.trim();
        return valor !== '' || nome !== '';
      } else {
        const valor = document.getElementById('valor').value.trim();
        const recebedor = document.getElementById('recebedor').value.trim();
        const referencia = document.getElementById('referencia').value.trim();
        const emitente = document.getElementById('emitente').value.trim();
        const cpfcnpj = document.getElementById('cpfcnpj').value.trim();
        const data = document.getElementById('data').value.trim();
        return valor !== '' || recebedor !== '' || referencia !== '' || emitente !== '' || cpfcnpj !== '' || data !== '';
      }
    }

    function normalizarChaveImportacao(chave) {
      return String(chave || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '')
        .toLowerCase();
    }

    function obterValorImportado(row, aliases) {
      const mapa = new Map();
      Object.keys(row || {}).forEach((key) => {
        mapa.set(normalizarChaveImportacao(key), row[key]);
      });

      for (const alias of aliases) {
        const valor = mapa.get(normalizarChaveImportacao(alias));
        if (valor !== undefined && valor !== null && String(valor).trim() !== '') {
          return valor;
        }
      }

      return '';
    }

    function extrairDadosImportados(row) {
      return {
        numeroRecibo: obterValorImportado(row, ['NumeroRecibo', 'NúmeroRecibo', 'Numero do Recibo', 'Número do Recibo']),
        valor: obterValorImportado(row, ['Valor']),
        recebedor: obterValorImportado(row, ['Recebedor', 'Nome do Recebedor', 'Nome']),
        referencia: obterValorImportado(row, ['Referencia', 'Referência']),
        descricao: obterValorImportado(row, ['Descricao', 'Descrição']),
        emitente: obterValorImportado(row, ['Emitente', 'Favorecido']),
        cpfcnpj: obterValorImportado(row, ['CPFCNPJ', 'CPF/CNPJ', 'CpfCnpj']),
        data: obterValorImportado(row, ['Data', 'Data do Recibo'])
      };
    }

    function preencherValorEQuantia(recibo, valorBruto) {
      if (!valorBruto) return;

      const valorInput = recibo.querySelector('.valor, #valor, #valor-completo, #valor-simples, #valor-covre');
      if (!valorInput) return;

      const valorFormatado = processarValorInteligente(valorBruto);
      valorInput.value = valorFormatado;

      const campoQuantia = recibo.querySelector('.campoQuantia, #campoQuantia, #campoQuantia-completo, .quantia-simples, #quantia-simples');
      if (!campoQuantia) return;

      const valorLimpo = valorFormatado.replace(/[^\d,]/g, '').replace(',', '.');
      const valorNumerico = parseFloat(valorLimpo);
      if (!isNaN(valorNumerico) && valorNumerico > 0) {
        campoQuantia.value = numeroParaExtenso(valorNumerico).toUpperCase();
      }
    }

    function preencherReciboPrincipalImportado(row) {
      const dados = extrairDadosImportados(row);

      if (modeloAtual === 'completo') {
        if (dados.numeroRecibo) {
          document.getElementById('numero-recibo-completo').value = dados.numeroRecibo;
        }
        preencherValorEQuantia(document.getElementById('recibo-completo'), dados.valor);
        if (dados.recebedor) document.getElementById('recebedor-completo').value = dados.recebedor;
        if (dados.referencia) document.getElementById('referencia-completo').value = dados.referencia;
        if (dados.descricao) document.getElementById('descricao-completo').value = dados.descricao;
        if (dados.emitente) {
          document.getElementById('emitente-completo').value = dados.emitente;
          document.getElementById('assinaturaNome-completo').textContent = dados.emitente;
        }
        if (dados.cpfcnpj) {
          const cpfInput = document.getElementById('cpfcnpj-completo');
          cpfInput.value = dados.cpfcnpj;
          formatarCpfCnpj(cpfInput);
          document.getElementById('assinaturaCpf-completo').textContent = cpfInput.value;
        }
        if (dados.data) {
          document.getElementById('data-completo').value = processarDataInteligente(dados.data);
        }
        return;
      }

      if (modeloAtual === 'simplificado') {
        preencherValorEQuantia(document.getElementById('recibo-simplificado'), dados.valor);
        const nome = dados.recebedor || dados.emitente;
        if (nome) {
          const nomeInput = document.getElementById('nome-principal');
          nomeInput.value = nome;
          atualizarAssinaturaSimples(nomeInput);
        }
        return;
      }

      if (modeloAtual === 'covre') {
        const reciboPrincipal = document.getElementById('recibo-covre');
        preencherValorEQuantia(reciboPrincipal, dados.valor);
        const nome = dados.recebedor || dados.emitente;
        if (nome) {
          const nomeInput = reciboPrincipal.querySelector('#nome-covre, .nome-covre');
          if (nomeInput) nomeInput.value = nome;
        }
        return;
      }

      preencherValorEQuantia(document.getElementById('recibo'), dados.valor);
      if (dados.recebedor) document.getElementById('recebedor').value = dados.recebedor;
      if (dados.referencia) document.getElementById('referencia').value = dados.referencia;
      if (dados.descricao) document.getElementById('descricao').value = dados.descricao;
      if (dados.emitente) {
        document.getElementById('emitente').value = dados.emitente;
        document.getElementById('assinaturaNome').textContent = dados.emitente;
      }
      if (dados.cpfcnpj) {
        const cpfInput = document.getElementById('cpfcnpj');
        cpfInput.value = dados.cpfcnpj;
        formatarCpfCnpj(cpfInput);
        document.getElementById('assinaturaCpf').textContent = cpfInput.value;
      }
      if (dados.data) {
        document.getElementById('data').value = processarDataInteligente(dados.data);
      }
    }

    function preencherReciboClonadoImportado(novoRecibo, row) {
      const dados = extrairDadosImportados(row);

      if (modeloAtual === 'padrao' || modeloAtual === 'completo') {
        const tituloConfig = window.elementSdk && window.elementSdk.config ? window.elementSdk.config.titulo_recibo : 'RECIBO';
        const titulo = novoRecibo.querySelector('.titulo-modelo');
        if (titulo) titulo.textContent = tituloConfig || 'RECIBO';
      }

      if (modeloAtual === 'completo') {
        if (dados.numeroRecibo) {
          const numeroInput = novoRecibo.querySelector('.numero-recibo');
          if (numeroInput) numeroInput.value = dados.numeroRecibo;
        }
        preencherValorEQuantia(novoRecibo, dados.valor);
        if (dados.recebedor) novoRecibo.querySelector('.recebedor').value = dados.recebedor;
        if (dados.referencia) novoRecibo.querySelector('.referencia').value = dados.referencia;
        if (dados.descricao) novoRecibo.querySelector('.descricao').value = dados.descricao;
        if (dados.emitente) {
          novoRecibo.querySelector('.emitente').value = dados.emitente;
          novoRecibo.querySelector('.assinaturaNome').textContent = dados.emitente;
        }
        if (dados.cpfcnpj) {
          const cpfInput = novoRecibo.querySelector('.cpfcnpj');
          cpfInput.value = dados.cpfcnpj;
          formatarCpfCnpj(cpfInput);
          novoRecibo.querySelector('.assinaturaCpf').textContent = cpfInput.value;
        }
        if (dados.data) {
          novoRecibo.querySelector('.data').value = processarDataInteligente(dados.data);
        }
        return;
      }

      if (modeloAtual === 'simplificado') {
        preencherValorEQuantia(novoRecibo, dados.valor);
        const nome = dados.recebedor || dados.emitente;
        if (nome) {
          const nomeInput = novoRecibo.querySelector('.nome-simples');
          nomeInput.value = nome;
          atualizarAssinaturaSimples(nomeInput);
        }
        return;
      }

      if (modeloAtual === 'covre') {
        preencherValorEQuantia(novoRecibo, dados.valor);
        const nome = dados.recebedor || dados.emitente;
        if (nome) {
          const nomeInput = novoRecibo.querySelector('.nome-covre');
          if (nomeInput) nomeInput.value = nome;
        }
        return;
      }

      preencherValorEQuantia(novoRecibo, dados.valor);
      if (dados.recebedor) novoRecibo.querySelector('.recebedor').value = dados.recebedor;
      if (dados.referencia) novoRecibo.querySelector('.referencia').value = dados.referencia;
      if (dados.descricao) novoRecibo.querySelector('.descricao').value = dados.descricao;
      if (dados.emitente) {
        novoRecibo.querySelector('.emitente').value = dados.emitente;
        novoRecibo.querySelector('.assinaturaNome').textContent = dados.emitente;
      }
      if (dados.cpfcnpj) {
        const cpfInput = novoRecibo.querySelector('.cpfcnpj');
        cpfInput.value = dados.cpfcnpj;
        formatarCpfCnpj(cpfInput);
        novoRecibo.querySelector('.assinaturaCpf').textContent = cpfInput.value;
      }
      if (dados.data) {
        novoRecibo.querySelector('.data').value = processarDataInteligente(dados.data);
      }
    }

    function configurarEventosReciboImportado(novoRecibo) {
      const valorInput = novoRecibo.querySelector('.valor');
      if (valorInput) {
        valorInput.oninput = function() { formatarMoeda(this); };
      }

      if (modeloAtual === 'simplificado') {
        const nomeSimplesInput = novoRecibo.querySelector('.nome-simples');
        if (nomeSimplesInput) {
          nomeSimplesInput.oninput = function() { atualizarAssinaturaSimples(this); };
          atualizarAssinaturaSimples(nomeSimplesInput);
        }
        return;
      }

      if (modeloAtual === 'padrao' || modeloAtual === 'completo') {
        const cpfInput = novoRecibo.querySelector('.cpfcnpj');
        if (cpfInput) {
          cpfInput.oninput = function() {
            formatarCpfCnpj(this);
            atualizarAssinaturaDireto(this);
          };
        }

        const emitenteInput = novoRecibo.querySelector('.emitente');
        if (emitenteInput) {
          emitenteInput.oninput = function() {
            atualizarAssinaturaDireto(this);
          };
        }
      }
    }

    // FunÃ§Ã£o para alternar modo escuro
    function toggleDarkMode() {
      const body = document.body;
      const isDark = body.classList.toggle('dark-mode');
      const btn = document.getElementById('dark-mode-toggle');
      
      localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
      
      btn.setAttribute('data-name', isDark ? 'Modo Claro' : 'Modo Escuro');
      btn.setAttribute('data-tooltip', isDark ? 'Modo Claro' : 'Modo Escuro');
      btn.innerHTML = `<i data-lucide="${isDark ? 'sun' : 'moon'}"></i>`;
      btn.classList.toggle('theme-dark-state', isDark);
      btn.classList.toggle('theme-light-state', !isDark);

      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    }

    // Carregar preferÃªncias ao iniciar (modo escuro)
    (function loadDarkMode() {
      const darkMode = localStorage.getItem('darkMode');
      if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
        const btn = document.getElementById('dark-mode-toggle');
        if (btn) {
          btn.setAttribute('data-name', 'Modo Claro');
          btn.setAttribute('data-tooltip', 'Modo Claro');
          btn.innerHTML = '<i data-lucide="sun"></i>';
          btn.classList.add('theme-dark-state');
          btn.classList.remove('theme-light-state');
        }
      } else {
        const btn = document.getElementById('dark-mode-toggle');
        if (btn) {
          btn.classList.add('theme-light-state');
          btn.classList.remove('theme-dark-state');
        }
      }

      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    })();

    // FunÃ§Ã£o para imprimir
    function obterRecibosVisiveisParaImpressao() {
      return Array.from(document.querySelectorAll('.recibo')).filter(recibo => {
        const styles = window.getComputedStyle(recibo);
        return styles.display !== 'none' &&
               styles.visibility !== 'hidden' &&
               !recibo.id.startsWith('modelo-');
      });
    }

    function clonarReciboParaImpressao(reciboOriginal) {
      const clone = reciboOriginal.cloneNode(true);
      clone.classList.remove('selecionado', 'ultima-impressao');
      clone.style.display = 'block';
      clone.style.transform = 'none';
      clone.style.transformOrigin = 'initial';
      clone.style.marginBottom = '20px';

      const camposOriginais = reciboOriginal.querySelectorAll('input, textarea');
      const camposClonados = clone.querySelectorAll('input, textarea');

      camposOriginais.forEach((campoOriginal, index) => {
        const campoClonado = camposClonados[index];
        if (!campoClonado) return;

        if (campoOriginal.type === 'checkbox' || campoOriginal.type === 'radio') {
          campoClonado.checked = campoOriginal.checked;
          return;
        }

        if (campoClonado.tagName === 'TEXTAREA') {
          campoClonado.textContent = campoOriginal.value;
          campoClonado.value = campoOriginal.value;
        } else {
          campoClonado.setAttribute('value', campoOriginal.value);
          campoClonado.value = campoOriginal.value;
        }
      });

      clone.querySelectorAll('.checkbox-recibo').forEach(checkbox => checkbox.remove());
      clone.querySelectorAll('[id^="sugestoes-"]').forEach(item => item.remove());
      clone.querySelectorAll('[style*="display: none"]').forEach(item => {
        if (item.id && item.id.startsWith('sugestoes-')) {
          item.remove();
        }
      });

      return clone.outerHTML;
    }

    function isMobilePdfMode() {
      return window.matchMedia('(max-width: 768px)').matches;
    }

    function atualizarBotaoImpressao() {
      const button = document.getElementById('print-receipts-btn');
      if (!button) return;

      const isMobile = isMobilePdfMode();
      button.setAttribute('data-name', isMobile ? 'Baixar PDF' : 'Imprimir');
      button.setAttribute('data-tooltip', isMobile ? 'Baixar PDF' : 'Imprimir');
      button.innerHTML = `<i data-lucide="${isMobile ? 'download' : 'printer'}"></i>`;

      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    }

    async function baixarRecibosPdfMobile(recibosVisiveis) {
      if (!window.html2canvas || !(window.jspdf && window.jspdf.jsPDF)) {
        alert('O recurso de PDF não está disponível neste navegador.');
        return;
      }

      const tempWrapper = document.createElement('div');
      tempWrapper.style.position = 'absolute';
      tempWrapper.style.left = '-99999px';
      tempWrapper.style.top = '0';
      tempWrapper.style.width = '820px';
      tempWrapper.style.padding = '20px 0';
      tempWrapper.style.background = '#ffffff';
      tempWrapper.style.pointerEvents = 'none';
      tempWrapper.style.zIndex = '-1';

      const renderedClones = recibosVisiveis.map((recibo) => {
        const holder = document.createElement('div');
        holder.className = 'print-item';
        holder.style.background = '#ffffff';
        holder.style.padding = '0';
        holder.style.margin = '0 0 20px';
        holder.innerHTML = clonarReciboParaImpressao(recibo);
        tempWrapper.appendChild(holder);
        return holder;
      });

      document.body.appendChild(tempWrapper);

      try {
        await new Promise(resolve => setTimeout(resolve, 180));
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const usableWidth = pageWidth - margin * 2;
        const usableHeight = pageHeight - margin * 2;

        for (let index = 0; index < renderedClones.length; index += 1) {
          const holder = renderedClones[index];
          const receiptEl = holder.querySelector('.recibo') || holder;
          const canvas = await window.html2canvas(receiptEl, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            scrollX: 0,
            scrollY: 0
          });

          const imageData = canvas.toDataURL('image/jpeg', 0.98);
          const imageHeight = (canvas.height * usableWidth) / canvas.width;

          if (index > 0) {
            pdf.addPage();
          }

          if (imageHeight <= usableHeight) {
            pdf.addImage(imageData, 'JPEG', margin, margin, usableWidth, imageHeight);
          } else {
            let remainingHeight = imageHeight;
            let sourceY = 0;
            const pageCanvas = document.createElement('canvas');
            const pageContext = pageCanvas.getContext('2d');
            const pagePixelHeight = Math.floor((usableHeight * canvas.width) / usableWidth);
            pageCanvas.width = canvas.width;
            pageCanvas.height = pagePixelHeight;

            let firstChunk = true;
            while (remainingHeight > 0) {
              pageContext.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
              pageContext.drawImage(
                canvas,
                0,
                sourceY,
                canvas.width,
                pagePixelHeight,
                0,
                0,
                pageCanvas.width,
                pageCanvas.height
              );

              const chunkHeight = Math.min(usableHeight, remainingHeight);
              const chunkData = pageCanvas.toDataURL('image/jpeg', 0.98);

              if (!firstChunk) {
                pdf.addPage();
              }

              pdf.addImage(chunkData, 'JPEG', margin, margin, usableWidth, chunkHeight);
              sourceY += pagePixelHeight;
              remainingHeight -= usableHeight;
              firstChunk = false;
            }
          }
        }

        pdf.save('WeRecibos.pdf');
      } catch (error) {
        console.error('Erro ao gerar PDF mobile:', error);
        alert('Não foi possível gerar o PDF agora.');
      } finally {
        tempWrapper.remove();
      }
    }

    function imprimirPDF() {
      const recibosVisiveis = obterRecibosVisiveisParaImpressao();

      if (!recibosVisiveis.length) {
        alert('Nenhum recibo visível para imprimir.');
        return;
      }

      if (isMobilePdfMode()) {
        baixarRecibosPdfMobile(recibosVisiveis);
        return;
      }

      const htmlRecibos = recibosVisiveis
        .map((recibo) => `<div class="print-item">${clonarReciboParaImpressao(recibo)}</div>`)
        .join('');

      const janelaImpressao = window.open('', '_blank', 'width=900,height=1200');

      if (!janelaImpressao) {
        alert('Não foi possível abrir a janela de impressão. Verifique se o navegador bloqueou pop-ups.');
        return;
      }

      janelaImpressao.document.open();
      janelaImpressao.document.write(`
        <!doctype html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Impressão de Recibos</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }
            * {
              box-sizing: border-box;
            }
            html, body {
              width: auto !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #fff;
              color: #000;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-item {
              margin: 0 !important;
              padding: 0 !important;
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            .print-item + .print-item {
              break-before: page !important;
              page-break-before: always !important;
            }
            .recibo {
              position: relative;
              width: 190mm !important;
              max-width: 190mm !important;
              margin: 0 auto !important;
              padding: 20px 25px 15px 25px !important;
              border: none !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              background: #fff !important;
              color: #000 !important;
              transform: none !important;
              break-after: auto !important;
              page-break-after: auto !important;
              page-break-inside: avoid !important;
            }
            .topo {
              display: flex;
              justify-content: center;
              align-items: center;
              margin-bottom: 25px;
              margin-top: -10px;
              position: relative;
            }
            .titulo {
              font-size: 22px;
              font-weight: bold;
              color: #000 !important;
            }
            .valor-topo {
              font-size: 12px;
              text-align: right;
              position: absolute;
              right: 0;
            }
            .numero-topo {
              font-size: 12px;
              text-align: left;
              position: absolute;
              left: 0;
            }
            .valor-topo label,
            .numero-topo label {
              font-weight: bold;
              color: #000;
            }
            .valor-topo label {
              font-weight: bold;
              color: #000;
            }
            .valor-topo input {
              width: 130px;
              border: 1px solid #999 !important;
              border-radius: 8px;
              padding: 3px 8px;
              background: #f9f9f9 !important;
              font-weight: bold;
              font-size: 12px;
              color: #000 !important;
              outline: none;
            }
            .numero-topo input {
              width: 92px;
              border: 2px solid #007BFF !important;
              border-radius: 8px;
              padding: 3px 8px;
              background: #eef6ff !important;
              font-weight: bold;
              font-size: 12px;
              color: #000 !important;
              outline: none;
              text-align: center;
              letter-spacing: 0.04em;
              box-shadow: none !important;
            }
            .linha {
              margin: 5px 0;
              font-size: 14px;
              color: #000 !important;
            }
            .linha-horizontal {
              display: flex;
              gap: 20px;
              align-items: center;
            }
            .linha-horizontal .campo-pequeno {
              flex: 1;
            }
            input,
            textarea {
              width: 100%;
              border: none;
              border-bottom: 1px solid #ccc;
              background: transparent;
              color: #000 !important;
              font-size: 14px;
              outline: none;
              padding: 2px 4px;
              font-family: inherit;
            }
            textarea {
              resize: none;
              overflow: hidden;
              line-height: 1.3em;
              min-height: 1.3em;
            }
            .assinatura {
              margin-top: 20px;
              text-align: center;
            }
            .assinatura-linha {
              border-bottom: 1px solid #000;
              width: 250px;
              margin: 0 auto;
              height: 25px;
            }
            .assinatura-nome {
              margin-top: 4px;
              font-size: 12px;
              font-weight: bold;
              min-height: 18px;
              max-height: 18px;
              overflow: hidden;
              color: #000 !important;
            }
            .recibo-moyses {
              display: flex;
              flex-direction: column;
              padding: 18px 34px 20px !important;
              min-height: 360px;
              background: #fff !important;
              color: #000 !important;
            }
            .moyses-topo {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 10px;
            }
            .moyses-topo-espaco {
              flex: 1;
              min-height: 10px;
            }
            .moyses-valor-box {
              width: 190px;
              display: flex;
              justify-content: flex-end;
            }
            .moyses-valor-input {
              width: 190px;
              height: 28px;
              border: 1px solid #222 !important;
              border-radius: 0 !important;
              padding: 3px 10px;
              background: #f4cfb4 !important;
              font-weight: 500;
              font-size: 12px;
              text-align: center;
              color: #222 !important;
              outline: none;
              box-shadow: none !important;
            }
            .moyses-corpo-vazio {
              flex: 1;
              min-height: 120px;
            }
            .moyses-assinatura-area {
              display: flex;
              flex-direction: column;
              gap: 10px;
              margin-top: auto;
              padding-top: 8px;
            }
            .moyses-assinatura-linha-row {
              display: flex;
              align-items: flex-end;
              gap: 2px;
            }
            .moyses-label-assinatura,
            .moyses-label-nome {
              font-size: 12px;
              font-weight: 400;
              color: #000;
              text-transform: none;
              letter-spacing: 0;
              line-height: 1;
              white-space: nowrap;
            }
            .moyses-assinatura-linha {
              flex: 1;
              height: 0;
              min-width: 220px;
              border-bottom: 1px solid #000 !important;
              transform: translateY(-1px);
            }
            .moyses-nome-row {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .moyses-nome-input {
              width: 210px;
              min-width: 210px;
              display: block;
              border: none !important;
              border-bottom: 1px solid #000 !important;
              border-radius: 0 !important;
              text-align: left;
              padding: 1px 0 2px;
              font-size: 12px;
              color: #000 !important;
              background: transparent !important;
              box-shadow: none !important;
              outline: none;
              -webkit-appearance: none;
              appearance: none;
            }
            .checkbox-recibo,
            .botoes,
            .loading-overlay,
            .status-contador,
            .toast,
            .popup-overlay,
            .whatsapp-btn,
            .btn-sair,
            .toggle-footer-btn,
            .btn-adicionar-recibo,
            .gb-header {
              display: none !important;
            }
          </style>
        </head>
        <body>
          ${htmlRecibos}
          <script>
            window.onload = function () {
              setTimeout(function () {
                window.print();
                window.close();
              }, 200);
            };
          <\/script>
        </body>
        </html>
      `);
      janelaImpressao.document.close();
    }

    window.addEventListener('resize', atualizarBotaoImpressao);
    window.addEventListener('DOMContentLoaded', atualizarBotaoImpressao);

    // FunÃ§Ã£o para formatar moeda no modelo simplificado
    function formatarMoedaSimples(input) {
      let valor = input.value.replace(/\D/g, '');
      
      if (valor === '') {
        input.value = '';
        document.getElementById('quantia-simples').value = '';
        return;
      }
      
      const numero = parseInt(valor);
      const reais = numero / 100;
      
      input.value = 'R$ ' + reais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      
      if (reais > 0) {
        const extenso = numeroParaExtenso(reais);
        document.getElementById('quantia-simples').value = extenso.toUpperCase();
      }
    }

    // FunÃ§Ã£o para obter data formatada
    function obterDataFormatada() {
      const meses = ['JANEIRO', 'FEVEREIRO', 'MARÃ‡O', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
      const hoje = new Date();
      const dia = String(hoje.getDate()).padStart(2, '0');
      const mes = meses[hoje.getMonth()];
      const ano = hoje.getFullYear();
      return `${dia} DE ${mes} DE ${ano}`;
    }

    // Preencher data automaticamente no recibo principal ao carregar
    window.addEventListener('DOMContentLoaded', function() {
      const dataInput = document.getElementById('data');
      if (dataInput && !dataInput.value) {
        dataInput.value = obterDataFormatada();
      }
    });

    // Eventos do recibo principal
    document.getElementById('valor').oninput = function() { formatarMoeda(this); };
    document.getElementById('cpfcnpj').oninput = function() { 
      formatarCpfCnpj(this); 
      atualizarAssinatura();
    };
    document.getElementById('emitente').oninput = function() { 
      atualizarAssinatura();
    };

    // Eventos do recibo simplificado
    document.getElementById('valor-completo').oninput = function() { formatarMoeda(this); };
    document.getElementById('emitente-completo').oninput = atualizarAssinaturaCompleta;
    document.getElementById('cpfcnpj-completo').oninput = function() { formatarCpfCnpj(this); atualizarAssinaturaCompleta(); };
    document.getElementById('valor-simples').oninput = function() { formatarMoedaSimples(this); };
    document.getElementById('nome-principal').oninput = function() { atualizarAssinaturaSimples(this); };

    // Eventos do recibo COVRE
    document.getElementById('valor-covre').oninput = function() { formatarMoeda(this); };

    // Importar Excel
    function importarExcel(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        const container = document.getElementById('recibos-gerados');
        
        event.target.value = '';
        const linhasImportadas = Array.isArray(jsonData)
          ? jsonData.filter((row) => Object.values(row || {}).some((value) => String(value || '').trim() !== ''))
          : [];

        if (!linhasImportadas.length) {
          mostrarMensagem('A planilha importada está vazia ou sem dados válidos.', 'erro');
          return;
        }

        let reciboPrincipalDisponivel = !verificarReciboPrincipalPreenchido();

        linhasImportadas.forEach((row, index) => {
          if (reciboPrincipalDisponivel) {
            preencherReciboPrincipalImportado(row);
            reciboPrincipalDisponivel = false;
            return;
          }

          let modeloId = 'modelo-recibo';
          if (modeloAtual === 'completo') {
            modeloId = 'modelo-recibo-completo';
          } else if (modeloAtual === 'simplificado') {
            modeloId = 'modelo-recibo-simplificado';
          } else if (modeloAtual === 'covre') {
            modeloId = 'modelo-recibo-covre';
          }

          const modelo = document.getElementById(modeloId);
          if (!modelo) return;

          const novoRecibo = modelo.cloneNode(true);
          novoRecibo.id = 'recibo-' + Date.now() + '-' + index;
          novoRecibo.style.display = 'block';

          preencherReciboClonadoImportado(novoRecibo, row);
          configurarEventosReciboImportado(novoRecibo);

          const escala = zoomAtual / 100;
          novoRecibo.style.transform = `scale(${escala})`;
          novoRecibo.style.transformOrigin = 'top center';
          novoRecibo.style.marginBottom = `${40 * escala}px`;

          container.appendChild(novoRecibo);
        });

        atualizarContador();
        mostrarToast();
      };
      reader.readAsArrayBuffer(file);
    }

    // Element SDK
    (function initElementSdk() {
      if (!window.elementSdk) return;

      const defaultConfig = {
        background_color: "#f5f5f7",
        surface_color: "#ffffff",
        text_color: "#000000",
        primary_action_color: "#6366f1",
        secondary_action_color: "#10b981",
        font_family: "Arial",
        font_size: 16,
        titulo_recibo: "RECIBO"
      };

      function applyConfig(config) {
        const cfg = Object.assign({}, defaultConfig, config || {});
        const baseFontStack = "Arial, sans-serif";
        const fontFamily = cfg.font_family + ", " + baseFontStack;

        document.body.style.background = cfg.background_color;
        document.body.style.fontFamily = fontFamily;

        const recibos = document.querySelectorAll('.recibo');
        recibos.forEach(r => {
          r.style.backgroundColor = cfg.surface_color;
          r.style.fontFamily = fontFamily;
        });

        const titulos = document.querySelectorAll('.titulo, .titulo-modelo');
        titulos.forEach(t => {
          t.textContent = cfg.titulo_recibo;
          t.style.color = cfg.primary_action_color;
          t.style.fontFamily = fontFamily;
        });

        const baseSize = Number(cfg.font_size) || 16;
        document.querySelectorAll('.linha, .campo-pequeno').forEach(el => {
          el.style.fontSize = baseSize + 'px';
          el.style.fontFamily = fontFamily;
        });

        document.querySelectorAll('.linha input, .linha textarea, .campo-pequeno input').forEach(el => {
          el.style.fontSize = baseSize + 'px';
          el.style.fontFamily = fontFamily;
          el.style.color = cfg.text_color;
        });

        const buttons = document.querySelectorAll('.botoes button');
        buttons.forEach((btn) => {
          btn.style.fontFamily = fontFamily;
          if (btn.classList.contains('baixar-pdf') || btn.classList.contains('imprimir-pdf')) {
            btn.style.backgroundColor = cfg.primary_action_color;
          }
          if (btn.classList.contains('importar')) btn.style.backgroundColor = cfg.secondary_action_color;
        });
      }

      window.elementSdk.init({
        defaultConfig,
        onConfigChange: async (config) => {
          applyConfig(config);
        },
        mapToCapabilities: (config) => {
          const cfg = Object.assign({}, defaultConfig, config || {});
          return {
            recolorables: [
              {
                get: () => cfg.background_color,
                set: (value) => window.elementSdk.setConfig({ background_color: value })
              },
              {
                get: () => cfg.surface_color,
                set: (value) => window.elementSdk.setConfig({ surface_color: value })
              },
              {
                get: () => cfg.text_color,
                set: (value) => window.elementSdk.setConfig({ text_color: value })
              },
              {
                get: () => cfg.primary_action_color,
                set: (value) => window.elementSdk.setConfig({ primary_action_color: value })
              },
              {
                get: () => cfg.secondary_action_color,
                set: (value) => window.elementSdk.setConfig({ secondary_action_color: value })
              }
            ],
            borderables: [],
            fontEditable: {
              get: () => cfg.font_family,
              set: (value) => window.elementSdk.setConfig({ font_family: value })
            },
            fontSizeable: {
              get: () => cfg.font_size,
              set: (value) => window.elementSdk.setConfig({ font_size: value })
            }
          };
        },
        mapToEditPanelValues: (config) => {
          const cfg = Object.assign({}, defaultConfig, config || {});
          return new Map([
            ["titulo_recibo", cfg.titulo_recibo]
          ]);
        }
      });

      applyConfig(window.elementSdk.config || defaultConfig);
    })();

