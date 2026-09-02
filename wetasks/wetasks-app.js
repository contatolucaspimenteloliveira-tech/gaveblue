// App shell only: task persistence and notification delivery stay in their adapters.
(function () {
  'use strict';
  const search = document.getElementById('tutorial-search-desktop');
  document.getElementById('app-search-mount').appendChild(search);
  document.querySelectorAll('.header-actions').forEach(node => node.remove());
  document.getElementById('mobile-search-panel')?.remove();
  document.querySelector('.header-desktop-right')?.remove();
  document.querySelectorAll('.header-shell img').forEach(img => {
    img.src = './icons/wetasks.jpeg';
    img.alt = 'WeTasks';
    img.removeAttribute('loading');
    img.removeAttribute('onerror');
    img.style.display = 'block';
  });
  const heading = document.createElement('div');
  heading.className = 'app-page-heading';
  heading.innerHTML = '<p class="screen-eyebrow">WETASKS · SUA AGENDA PESSOAL</p><h1 id="app-screen-title" tabindex="-1">Tarefas</h1>';
  document.querySelector('.header-shell').after(heading);

  const dock = document.createElement('nav');
  dock.className = 'app-dock';
  dock.setAttribute('aria-label', 'Navegação e ações do WeTasks');
  const tabs = document.getElementById('tutorial-main-tabs');
  const oldTabsWrapper = tabs.parentElement;
  tabs.replaceChildren();
  tabs.removeAttribute('style');
  dock.appendChild(tabs);
  oldTabsWrapper.remove();
  const items = [
    ['tasks', 'list-todo', 'Tarefas'], ['calendar', 'calendar-days', 'Agenda'],
    ['create', 'plus', 'Criar'], ['dashboard', 'bar-chart-3', 'Resumo'],
    ['notifications', 'bell', 'Avisos'], ['search', 'search', 'Busca'], ['settings', 'settings-2', 'Ajustes']
  ];
  items.forEach(([key, icon, label]) => {
    const button = key === 'create' ? document.getElementById('fab-button') : document.createElement('button');
    button.removeAttribute('style');
    button.removeAttribute('onmouseover');
    button.removeAttribute('onmouseout');
    button.className = `dock-action${key === 'create' ? ' dock-create' : ''}`;
    button.type = 'button';
    if (key !== 'create') {
      button.id = `tab-${key}`;
      button.addEventListener('click', () => switchTab(key));
    }
    button.setAttribute('aria-label', key === 'create' ? 'Nova tarefa' : label);
    button.title = key === 'create' ? 'Nova tarefa' : label;
    button.innerHTML = `<span class="dock-icon"><i data-lucide="${icon}"></i>${key === 'notifications' ? '<span id="notification-badge-dock" class="dock-badge" style="display:none"></span>' : ''}</span><span class="dock-label">${label}</span>`;
    tabs.appendChild(button);
  });
  document.body.appendChild(dock);
  ['settings-panel', 'notifications-panel'].forEach(id => {
    const panel = document.getElementById(id);
    panel.classList.add('app-screen');
    panel.classList.remove('slide-up');
    panel.querySelector('.panel-head button')?.remove();
  });
  const exit = document.createElement('button');
  exit.type = 'button';
  exit.className = 'btn app-exit';
  exit.innerHTML = '<i data-lucide="log-out"></i> Voltar ao site GaveBlue';
  exit.addEventListener('click', goToWebsite);
  document.querySelector('#settings-panel > .panel-body').appendChild(exit);
  lucide.createIcons();
  updateNotificationBadge();
  function restoreRoute() { switchTab(window.location.hash.replace(/^#\/?/, '') || 'tasks', false); }
  window.addEventListener('popstate', restoreRoute);
  window.addEventListener('hashchange', restoreRoute);
  restoreRoute();

  let installPrompt = null;
  const hint = document.getElementById('app-install-hint');
  const installButton = document.getElementById('app-install-button');
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  function updateInstallUI() {
    if (standalone()) {
      hint.textContent = 'Você já está usando o aplicativo instalado.';
      installButton.hidden = true;
    } else if (installPrompt) {
      hint.textContent = 'Instale e abra sua agenda direto da tela inicial.';
      installButton.hidden = false;
      installButton.textContent = 'Instalar app';
    } else {
      hint.textContent = 'No iPhone: Safari → Compartilhar → Adicionar à Tela de Início. No Android ou computador: menu do navegador → Instalar aplicativo.';
      installButton.textContent = 'Como instalar';
    }
  }
  window.installWeTasks = async function () {
    if (!installPrompt) {
      updateInstallUI();
      showToast('Use o menu do navegador para adicionar o WeTasks à tela inicial.', 'info');
      return;
    }
    const prompt = installPrompt;
    installPrompt = null;
    try { await prompt.prompt(); await prompt.userChoice; }
    catch { showToast('Não foi possível iniciar a instalação. Tente pelo menu do navegador.', 'error'); }
    updateInstallUI();
  };
  window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; updateInstallUI(); });
  window.addEventListener('appinstalled', () => { installPrompt = null; hint.textContent = 'WeTasks instalado. Abra pelo ícone na tela inicial.'; installButton.hidden = true; });
  updateInstallUI();
  // Reuse the existing worker and scope so push subscriptions are preserved.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./wetasks-sw.js').catch(error => console.warn('[WeTasks] App indisponível offline:', error));
  }
})();
