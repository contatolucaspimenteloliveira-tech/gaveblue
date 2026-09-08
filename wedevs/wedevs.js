const defaultConfig = {
      editor_title: 'Editor HTML para testes rápidos'
    };

    const htmlEditor = document.getElementById('html-editor');
    const cssEditor = document.getElementById('css-editor');
    const jsEditor = document.getElementById('js-editor');
    const htmlHighlight = document.getElementById('html-highlight');
    const cssHighlight = document.getElementById('css-highlight');
    const jsHighlight = document.getElementById('js-highlight');
    const htmlStack = document.getElementById('html-stack');
    const cssStack = document.getElementById('css-stack');
    const jsStack = document.getElementById('js-stack');
    const previewFrame = document.getElementById('preview-frame');
    const fullscreenFrame = document.getElementById('fullscreen-frame');
    const clearBtn = document.getElementById('clear-btn');
    const loadFileBtn = document.getElementById('load-file-btn');
    const previewToggleBtn = document.getElementById('preview-toggle-btn');
    const runBtn = document.getElementById('run-btn');
    const fileInput = document.getElementById('file-input');
    const editorSurface = document.querySelector('.editor-surface');
    const charCount = document.getElementById('char-count');
    const lineCount = document.getElementById('line-count');
    const toast = document.getElementById('toast');
    const mainTitle = document.getElementById('main-title');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const hidePreviewBtn = document.getElementById('hide-preview-btn');
    const fullscreenModal = document.getElementById('fullscreen-modal');
    const closeFullscreenBtn = document.getElementById('close-fullscreen-btn');
    const exitBtn = document.getElementById('exit-btn');
    const workspaceLayout = document.getElementById('workspace-layout');
    const previewPanel = document.getElementById('preview-panel');
    const mobileSearchBtn = document.getElementById('mobile-search-btn');
    const globalSearchInputEl = document.getElementById('global-search-input');
    const globalSearchResultsEl = document.getElementById('global-search-results');
    const searchFocusOverlayEl = document.getElementById('search-focus-overlay');
    const ecosystemModules = [
      { name: 'WeTime', description: 'Relógio online e painel de horário', url: '/wetime/' },
      { name: 'WeRecibos', description: 'Gerador de recibos', url: '/recibos/' },
      { name: 'WeConsultas', description: 'Consultas empresariais', url: '/weconsultas/' },
      { name: 'WeFrotas', description: 'Gestão de frotas', url: '/wefrotas/conheca/' },
      { name: 'WeDevs', description: 'Ferramentas e utilidades dev', url: '/wedevs/' },
      { name: 'WeTasks', description: 'Tarefas e organização', url: '/wetasks/' }
    ];

    let currentTab = 'html';
    let runTimeout;
    let filteredModules = [];
    let highlightedModuleIndex = -1;
    let previewVisible = false;

    function getActiveEditor() {
      if (currentTab === 'css') return cssEditor;
      if (currentTab === 'js') return jsEditor;
      return htmlEditor;
    }

    function updateTabStyles(activeTab) {
      tabBtns.forEach((button) => {
        const isActive = button.dataset.tab === activeTab;
        button.classList.toggle('active', isActive);
        button.classList.toggle('inactive', !isActive);
      });
    }

    function switchTab(tab) {
      currentTab = tab;
      updateTabStyles(tab);
      htmlStack.classList.toggle('hidden', tab !== 'html');
      cssStack.classList.toggle('hidden', tab !== 'css');
      jsStack.classList.toggle('hidden', tab !== 'js');
      updateCounts();
    }

    function escapeHtml(value) {
      return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
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
            <span class="block font-semibold text-sm">${escapeHtml(module.name)}</span>
            <span class="global-search-route">${escapeHtml(module.description)}</span>
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

    function highlightHtml(code) {
      let value = escapeHtml(code);
      value = value.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="token-comment">$1</span>');
      value = value.replace(/(&lt;\/?)([a-zA-Z0-9-]+)/g, '$1<span class="token-tag">$2</span>');
      value = value.replace(/([a-zA-Z-:]+)(=)(&quot;.*?&quot;|'.*?')/g, '<span class="token-attr">$1</span>$2<span class="token-string">$3</span>');
      return value || '<span class="token-plain"> </span>';
    }

    function highlightCss(code) {
      let value = escapeHtml(code);
      value = value.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token-comment">$1</span>');
      value = value.replace(/([.#]?[a-zA-Z0-9_-]+)(\s*\{)/g, '<span class="token-selector">$1</span>$2');
      value = value.replace(/([a-z-]+)(\s*:)/g, '<span class="token-property">$1</span>$2');
      value = value.replace(/(:\s*)(#[0-9a-fA-F]+|\d+px|\d+rem|\d+%|\d+)/g, '$1<span class="token-number">$2</span>');
      return value || '<span class="token-plain"> </span>';
    }

    function highlightJs(code) {
      let value = escapeHtml(code);
      value = value.replace(/(\/\/.*?$)/gm, '<span class="token-comment">$1</span>');
      value = value.replace(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g, '<span class="token-string">$1</span>');
      value = value.replace(/\b(const|let|var|function|return|if|else|for|while|new|class|import|from|export)\b/g, '<span class="token-keyword">$1</span>');
      value = value.replace(/\b(\d+)\b/g, '<span class="token-number">$1</span>');
      value = value.replace(/\b([a-zA-Z_$][\w$]*)(?=\()/g, '<span class="token-function">$1</span>');
      return value || '<span class="token-plain"> </span>';
    }

    function syncHighlight(editor, layer, type) {
      if (type === 'html') layer.innerHTML = highlightHtml(editor.value);
      if (type === 'css') layer.innerHTML = highlightCss(editor.value);
      if (type === 'js') layer.innerHTML = highlightJs(editor.value);
      layer.scrollTop = editor.scrollTop;
      layer.scrollLeft = editor.scrollLeft;
    }

    function getLineLabel(lines) {
      return `${lines} ${lines === 1 ? 'linha' : 'linhas'}`;
    }

    function updateCounts() {
      const totalChars = htmlEditor.value.length + cssEditor.value.length + jsEditor.value.length;
      const activeEditor = getActiveEditor();
      const lines = activeEditor.value.length ? activeEditor.value.split('\n').length : 1;
      charCount.textContent = `${totalChars.toLocaleString('pt-BR')} caracteres`;
      lineCount.textContent = getLineLabel(lines);
    }

    function showToast(message = 'Código executado com sucesso!') {
      const mobileToast = window.innerWidth <= 640;
      toast.textContent = message;
      toast.style.opacity = '1';
      toast.style.transform = mobileToast ? 'translateY(0)' : 'translateX(-50%) translateY(0)';
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = mobileToast ? 'translateY(20px)' : 'translateX(-50%) translateY(20px)';
      }, 1800);
    }

    function injectIntoHead(doc, content) {
      if (!content.trim()) return doc;
      if (/<\/head>/i.test(doc)) {
        return doc.replace(/<\/head>/i, `${content}\n</head>`);
      }
      if (/<html[\s>]/i.test(doc)) {
        return doc.replace(/<html([^>]*)>/i, `<html$1><head>${content}</head>`);
      }
      return `<head>${content}</head>${doc}`;
    }

    function injectIntoBody(doc, content) {
      if (!content.trim()) return doc;
      if (/<\/body>/i.test(doc)) {
        return doc.replace(/<\/body>/i, `${content}\n</body>`);
      }
      return `${doc}\n${content}`;
    }

    function ensurePreviewBase(doc) {
      if (/<base[\s>]/i.test(doc)) return doc;
      const baseTag = `<base href="${window.location.href}">`;
      return injectIntoHead(doc, baseTag);
    }

    function escapeScriptContent(content) {
      return content.replace(/<\/script/gi, '<\\/script');
    }

    function escapeStyleContent(content) {
      return content.replace(/<\/style/gi, '<\\/style');
    }

    function buildPreviewDoc() {
      const htmlContent = htmlEditor.value.trim();
      const cssContent = cssEditor.value.trim();
      const jsContent = jsEditor.value.trim();
      const hasFullDocument = /<html[\s>]|<!doctype/i.test(htmlContent);

      if (hasFullDocument) {
        let fullDocument = htmlEditor.value;

        if (cssContent) {
          fullDocument = injectIntoHead(fullDocument, `<style>\n${escapeStyleContent(cssEditor.value)}\n</style>`);
        }

        if (jsContent) {
          fullDocument = injectIntoBody(fullDocument, `<script>\n${escapeScriptContent(jsEditor.value)}\n<\/script>`);
        }

        return ensurePreviewBase(fullDocument);
      }

      return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <base href="${window.location.href}">
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; padding: 16px; font-family: system-ui, sans-serif; }
            ${escapeStyleContent(cssEditor.value)}
          </style>
        </head>
        <body>
          ${htmlEditor.value}
          <script>${escapeScriptContent(jsEditor.value)}<\/script>
        </body>
        </html>
      `;
    }

    function syncPreviewLayout() {
      previewPanel.classList.toggle('hidden', !previewVisible);
      previewPanel.classList.toggle('flex', previewVisible);
      workspaceLayout.classList.toggle('lg:grid-cols-1', !previewVisible);
      workspaceLayout.classList.toggle('lg:grid-cols-[1.05fr_0.95fr]', previewVisible);
      previewToggleBtn.classList.toggle('ring-2', previewVisible);
      previewToggleBtn.classList.toggle('ring-violet-400/50', previewVisible);
    }

    function showPreviewPanel() {
      previewVisible = true;
      syncPreviewLayout();
    }

    function hidePreviewPanel() {
      previewVisible = false;
      syncPreviewLayout();
    }

    function togglePreviewPanel() {
      previewVisible = !previewVisible;
      syncPreviewLayout();
      if (previewVisible) {
        runCode(false);
      }
    }

    function runCode(openPreview = true) {
      const fullCode = buildPreviewDoc();
      if (openPreview) {
        showPreviewPanel();
      }
      previewFrame.srcdoc = fullCode;
      fullscreenFrame.srcdoc = fullCode;
      showToast();
    }

    function debounceRun() {
      clearTimeout(runTimeout);
      runTimeout = setTimeout(runCode, 450);
    }

    function clearEditors() {
      htmlEditor.value = '';
      cssEditor.value = '';
      jsEditor.value = '';
      htmlHighlight.innerHTML = '';
      cssHighlight.innerHTML = '';
      jsHighlight.innerHTML = '';
      previewFrame.srcdoc = '';
      fullscreenFrame.srcdoc = '';
      updateCounts();
      showToast('Editor limpo com sucesso!');
    }

    function getEditorMetaByTab(tab = currentTab) {
      if (tab === 'css') return { editor: cssEditor, layer: cssHighlight, type: 'css' };
      if (tab === 'js') return { editor: jsEditor, layer: jsHighlight, type: 'js' };
      return { editor: htmlEditor, layer: htmlHighlight, type: 'html' };
    }

    function detectTabFromFileName(fileName = '') {
      const lowerName = fileName.toLowerCase();
      if (lowerName.endsWith('.css')) return 'css';
      if (lowerName.endsWith('.js') || lowerName.endsWith('.mjs') || lowerName.endsWith('.cjs') || lowerName.endsWith('.jsx') || lowerName.endsWith('.ts') || lowerName.endsWith('.tsx')) return 'js';
      if (lowerName.endsWith('.html') || lowerName.endsWith('.htm') || lowerName.endsWith('.svg') || lowerName.endsWith('.xml')) return 'html';
      return currentTab;
    }

    function loadTextIntoEditorTab(content, tab, fileName = '') {
      const { editor, layer, type } = getEditorMetaByTab(tab);
      editor.value = content;
      syncHighlight(editor, layer, type);
      updateCounts();
      debounceRun();
    }

    function readFileEntry(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            file,
            content: String(reader.result || ''),
            tab: detectTabFromFileName(file.name)
          });
        };
        reader.onerror = reject;
        reader.readAsText(file, 'UTF-8');
      });
    }

    async function readFilesIntoEditors(fileList) {
      const files = Array.from(fileList || []);
      if (!files.length) return;

      try {
        const results = await Promise.all(files.map(readFileEntry));
        const importedTabs = new Set();

        results.forEach(({ content, tab, file }) => {
          loadTextIntoEditorTab(content, tab, file.name);
          importedTabs.add(tab);
        });

        const preferredTab = ['html', 'css', 'js'].find((tab) => importedTabs.has(tab)) || results[0]?.tab;
        if (preferredTab) {
          switchTab(preferredTab);
        }

        const label = files.length === 1
          ? `Arquivo carregado: ${files[0].name}`
          : `${files.length} arquivos carregados com sucesso!`;
        showToast(label);
      } catch (error) {
        showToast('Não foi possível ler um dos arquivos.');
      }
    }

    async function readFileIntoActiveEditor(file) {
      if (!file) return;
      await readFilesIntoEditors([file]);
    }

    function handleDroppedFiles(fileList) {
      if (!fileList?.length) return;
      readFilesIntoEditors(fileList);
    }

    function setDragState(active) {
      editorSurface?.classList.toggle('drag-over', active);
    }

    function openFullscreen() {
      fullscreenModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }

    function closeFullscreen() {
      fullscreenModal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }

    tabBtns.forEach((button) => {
      button.addEventListener('click', () => switchTab(button.dataset.tab));
    });

    [
      [htmlEditor, htmlHighlight, 'html'],
      [cssEditor, cssHighlight, 'css'],
      [jsEditor, jsHighlight, 'js']
    ].forEach(([editor, layer, type]) => {
      editor.addEventListener('input', () => {
        updateCounts();
        syncHighlight(editor, layer, type);
        debounceRun();
      });
      editor.addEventListener('scroll', () => {
        layer.scrollTop = editor.scrollTop;
        layer.scrollLeft = editor.scrollLeft;
      });
    });

    clearBtn.addEventListener('click', clearEditors);
    loadFileBtn.addEventListener('click', () => fileInput.click());
    previewToggleBtn.addEventListener('click', togglePreviewPanel);
    fileInput.addEventListener('change', (event) => {
      readFilesIntoEditors(event.target.files);
      event.target.value = '';
    });
    runBtn.addEventListener('click', runCode);
    fullscreenBtn.addEventListener('click', openFullscreen);
    hidePreviewBtn.addEventListener('click', hidePreviewPanel);
    closeFullscreenBtn.addEventListener('click', closeFullscreen);
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

    exitBtn.addEventListener('click', () => {
      window.location.href = '/';
    });

    ['dragenter', 'dragover'].forEach((eventName) => {
      editorSurface?.addEventListener(eventName, (event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragState(true);
      });
    });

    ['dragleave', 'dragend'].forEach((eventName) => {
      editorSurface?.addEventListener(eventName, (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.relatedTarget && editorSurface.contains(event.relatedTarget)) return;
        setDragState(false);
      });
    });

    editorSurface?.addEventListener('drop', (event) => {
      event.preventDefault();
      event.stopPropagation();
      setDragState(false);
      handleDroppedFiles(event.dataTransfer?.files);
    });

    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        runCode();
      }
      if (event.key === 'Escape' && !fullscreenModal.classList.contains('hidden')) {
        closeFullscreen();
      }
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

    async function onConfigChange(config) {
      mainTitle.textContent = config.editor_title || defaultConfig.editor_title;
    }

    function mapToCapabilities() {
      return {
        recolorables: [],
        borderables: [],
        fontEditable: undefined,
        fontSizeable: undefined
      };
    }

    function mapToEditPanelValues(config) {
      return new Map([
        ['editor_title', config.editor_title || defaultConfig.editor_title]
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

    switchTab('html');
    syncPreviewLayout();
    syncHighlight(htmlEditor, htmlHighlight, 'html');
    syncHighlight(cssEditor, cssHighlight, 'css');
    syncHighlight(jsEditor, jsHighlight, 'js');
    updateCounts();
