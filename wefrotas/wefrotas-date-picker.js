(function () {
  'use strict';

  const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const state = { input: null, type: 'date', month: new Date(), draft: '', view: 'days', yearPage: 0 };
  let observer = null;

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function toIsoDate(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function parseIsoDate(value) {
    const match = String(value || '').match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3] || 1));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatValue(value, type) {
    const date = parseIsoDate(value);
    if (!date) return type === 'month' ? 'Selecione um mês' : 'Selecione uma data';
    if (type === 'month') return `${MONTHS[date.getMonth()]} de ${date.getFullYear()}`;
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
  }

  function ensurePicker() {
    if (document.getElementById('standard-date-picker-backdrop')) return;
    document.body.insertAdjacentHTML('beforeend', `
      <div id="standard-date-picker-backdrop" class="standard-date-picker-backdrop" aria-hidden="true">
        <div class="standard-date-picker-stage">
          <button id="standard-date-picker-current" class="standard-date-picker-current" type="button" aria-label="Data selecionada"></button>
          <section id="standard-date-picker-dialog" class="standard-date-picker-dialog" role="dialog" aria-modal="true" aria-labelledby="standard-date-picker-title">
            <header class="standard-date-picker-head">
              <button id="standard-date-picker-prev" type="button" aria-label="Anterior">‹</button>
              <button id="standard-date-picker-title" class="standard-date-picker-title" type="button"></button>
              <button id="standard-date-picker-next" type="button" aria-label="Próximo">›</button>
            </header>
            <div id="standard-date-picker-content" class="standard-date-picker-content"></div>
            <footer class="standard-date-picker-footer">
              <span id="standard-date-picker-hint">Escolha uma data.</span>
              <div>
                <button id="standard-date-picker-clear" type="button">Limpar</button>
                <button id="standard-date-picker-apply" class="is-primary" type="button">Aplicar</button>
              </div>
            </footer>
          </section>
        </div>
      </div>`);

    document.getElementById('standard-date-picker-prev').addEventListener('click', () => move(-1));
    document.getElementById('standard-date-picker-next').addEventListener('click', () => move(1));
    document.getElementById('standard-date-picker-title').addEventListener('click', toggleView);
    document.getElementById('standard-date-picker-clear').addEventListener('click', clearValue);
    document.getElementById('standard-date-picker-apply').addEventListener('click', applyValue);
    document.getElementById('standard-date-picker-current').addEventListener('click', closePicker);
    document.getElementById('standard-date-picker-backdrop').addEventListener('click', event => {
      if (event.target.id === 'standard-date-picker-backdrop') closePicker();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && document.body.classList.contains('standard-calendar-open')) closePicker();
    });
  }

  function getFieldLabel(input) {
    const explicit = input.id ? document.querySelector(`label[for="${CSS.escape(input.id)}"]`) : null;
    const nearby = input.closest('.orders-filter-field, .form-field, .batch-order-field, .field, div')?.querySelector(':scope > label');
    const label = explicit || nearby;
    const text = label?.textContent?.trim().replace(/\s+/g, ' ');
    return text || (input.type === 'month' ? 'Mês' : 'Data');
  }

  function isWithinBounds(value) {
    if (!value || !state.input) return true;
    const comparable = state.type === 'month' ? value.slice(0, 7) : value.slice(0, 10);
    const min = String(state.input.min || '').slice(0, comparable.length);
    const max = String(state.input.max || '').slice(0, comparable.length);
    return (!min || comparable >= min) && (!max || comparable <= max);
  }

  function openPicker(input) {
    if (!input || input.disabled) return;
    ensurePicker();
    state.input = input;
    state.type = input.type === 'month' ? 'month' : 'date';
    state.draft = input.value || '';
    const selected = parseIsoDate(state.draft) || new Date();
    state.month = new Date(selected.getFullYear(), selected.getMonth(), 1);
    state.view = state.type === 'month' ? 'months' : 'days';
    state.yearPage = Math.floor(state.month.getFullYear() / 12) * 12;
    const backdrop = document.getElementById('standard-date-picker-backdrop');
    backdrop.classList.add('is-open');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.classList.add('standard-calendar-open');
    render();
  }

  function closePicker() {
    const backdrop = document.getElementById('standard-date-picker-backdrop');
    backdrop?.classList.remove('is-open');
    backdrop?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('standard-calendar-open');
    state.input = null;
  }

  function commit(value) {
    if (!state.input) return;
    state.input.value = value;
    state.input.dispatchEvent(new Event('input', { bubbles: true }));
    state.input.dispatchEvent(new Event('change', { bubbles: true }));
    closePicker();
  }

  function applyValue() {
    if (state.draft && !isWithinBounds(state.draft)) return;
    commit(state.draft);
  }

  function clearValue() {
    commit('');
  }

  function move(direction) {
    if (state.view === 'years') {
      state.yearPage += direction * 12;
    } else if (state.view === 'months') {
      state.month = new Date(state.month.getFullYear() + direction, state.month.getMonth(), 1);
    } else {
      state.month = new Date(state.month.getFullYear(), state.month.getMonth() + direction, 1);
    }
    render();
  }

  function toggleView() {
    if (state.view === 'days') state.view = 'months';
    else if (state.view === 'months') state.view = 'years';
    else state.view = state.type === 'month' ? 'months' : 'days';
    render();
  }

  function selectDay(value) {
    if (!isWithinBounds(value)) return;
    state.draft = value;
    render();
  }

  function selectMonth(month) {
    state.month = new Date(state.month.getFullYear(), month, 1);
    if (state.type === 'month') state.draft = `${state.month.getFullYear()}-${pad(month + 1)}`;
    state.view = state.type === 'month' ? 'months' : 'days';
    render();
  }

  function selectYear(year) {
    state.month = new Date(year, state.month.getMonth(), 1);
    state.view = 'months';
    render();
  }

  function renderDays(content, title) {
    const year = state.month.getFullYear();
    const month = state.month.getMonth();
    title.textContent = `${MONTHS[month]} ${year}`;
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const blanks = Array.from({ length: firstWeekday }, () => '<span class="standard-date-picker-day is-placeholder"></span>').join('');
    const days = Array.from({ length: daysInMonth }, (_, index) => {
      const value = toIsoDate(new Date(year, month, index + 1));
      const selected = value === state.draft ? ' is-selected' : '';
      const today = value === toIsoDate(new Date()) ? ' is-today' : '';
      const disabled = !isWithinBounds(value);
      return `<button type="button" class="standard-date-picker-day${selected}${today}" data-date="${value}" ${disabled ? 'disabled' : ''}>${index + 1}</button>`;
    }).join('');
    content.innerHTML = `<div class="standard-date-picker-weekdays">${WEEKDAYS.map(day => `<span>${day}</span>`).join('')}</div><div class="standard-date-picker-days">${blanks}${days}</div>`;
    content.querySelectorAll('[data-date]').forEach(button => button.addEventListener('click', () => selectDay(button.dataset.date)));
  }

  function renderMonths(content, title) {
    const year = state.month.getFullYear();
    title.textContent = String(year);
    content.innerHTML = `<div class="standard-date-picker-month-grid">${MONTHS.map((month, index) => {
      const value = `${year}-${pad(index + 1)}`;
      const selected = state.type === 'month' ? state.draft === value : state.month.getMonth() === index;
      const disabled = state.type === 'month' && !isWithinBounds(value);
      return `<button type="button" data-month="${index}" class="${selected ? 'is-selected' : ''}" ${disabled ? 'disabled' : ''}>${month.slice(0, 3)}</button>`;
    }).join('')}</div>`;
    content.querySelectorAll('[data-month]').forEach(button => button.addEventListener('click', () => selectMonth(Number(button.dataset.month))));
  }

  function renderYears(content, title) {
    const start = state.yearPage;
    title.textContent = `${start} – ${start + 11}`;
    content.innerHTML = `<div class="standard-date-picker-year-grid">${Array.from({ length: 12 }, (_, index) => {
      const year = start + index;
      return `<button type="button" data-year="${year}" class="${year === state.month.getFullYear() ? 'is-selected' : ''}">${year}</button>`;
    }).join('')}</div>`;
    content.querySelectorAll('[data-year]').forEach(button => button.addEventListener('click', () => selectYear(Number(button.dataset.year))));
  }

  function render() {
    if (!state.input) return;
    const content = document.getElementById('standard-date-picker-content');
    const title = document.getElementById('standard-date-picker-title');
    const current = document.getElementById('standard-date-picker-current');
    const hint = document.getElementById('standard-date-picker-hint');
    const apply = document.getElementById('standard-date-picker-apply');
    current.innerHTML = `<span>${escapeHtml(getFieldLabel(state.input))}</span><strong>${escapeHtml(formatValue(state.draft, state.type))}</strong><svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v3M17 3v3M4 8h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" stroke-width="1.9" stroke-linecap="round"/></svg>`;
    hint.textContent = state.type === 'month' ? 'Escolha o mês.' : 'Escolha uma data.';
    apply.textContent = 'Aplicar';
    if (state.view === 'years') renderYears(content, title);
    else if (state.view === 'months') renderMonths(content, title);
    else renderDays(content, title);
  }

  function enhanceInput(input) {
    if (!(input instanceof HTMLInputElement) || input.dataset.standardDatePicker === 'off' || input.dataset.standardDatePickerReady === 'true') return;
    if (!['date', 'month'].includes(input.type) || input.closest('.contextual-module-filter-source')) return;
    input.dataset.standardDatePickerReady = 'true';
    input.classList.add('standard-date-input');
    const shell = document.createElement('span');
    shell.className = 'standard-date-input-shell';
    input.parentNode.insertBefore(shell, input);
    shell.appendChild(input);
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'standard-date-input-trigger';
    trigger.setAttribute('aria-label', `Abrir calendário: ${getFieldLabel(input)}`);
    trigger.innerHTML = '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v3M17 3v3M4 8h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" stroke-width="1.9" stroke-linecap="round"/></svg>';
    trigger.addEventListener('click', () => openPicker(input));
    shell.appendChild(trigger);
  }

  function scan(root) {
    if (root instanceof HTMLInputElement) enhanceInput(root);
    root.querySelectorAll?.('input[type="date"], input[type="month"]').forEach(enhanceInput);
  }

  function init() {
    ensurePicker();
    scan(document);
    observer = new MutationObserver(mutations => mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
      if (node instanceof Element) scan(node);
    })));
    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.WeFrotasDatePicker = { scan, open: input => openPicker(input), close: closePicker };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
