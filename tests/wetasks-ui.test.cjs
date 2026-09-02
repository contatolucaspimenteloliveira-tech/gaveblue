// Isolated browser fixtures: no production login, network or task writes.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../wetasks');

test('responsive tutorial, header task search, single filter and reminders', async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.WETASKS_TEST_BROWSER ? { executablePath: process.env.WETASKS_TEST_BROWSER } : {}) });
  try {
    for (const width of [320, 390, 640, 762, 1440]) {
      const height = width === 320 ? 568 : width === 640 ? 360 : 900;
      const context = await browser.newContext({ viewport: { width, height }, serviceWorkers: 'block' });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.origin !== 'https://wetasks.test' || !url.pathname.startsWith('/wetasks/') || /wetasks-cloud|supabase-config/.test(url.pathname)) return route.fulfill({ status: 204, body: '' });
        const file = path.resolve(root, url.pathname.slice('/wetasks/'.length) || 'index.html');
        if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
        const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' }[path.extname(file)];
        return route.fulfill({ body: fs.readFileSync(file), contentType: mime || 'application/octet-stream' });
      });
      await page.goto('https://wetasks.test/wetasks/#/tasks');
      await page.locator('#header-task-search').waitFor();
      assert.match(await page.locator('#app-screen-title').innerText(), /Essas são suas tarefas para este dia/);
      assert.equal(await page.locator('.app-page-heading .screen-eyebrow').count(), 0);
      assert.equal(await page.locator('#tutorial-task-filters select').count(), 1);
      assert.equal(await page.locator('#tutorial-task-filters button').count(), 0);
      assert.equal(await page.locator('.dock-create .dock-icon').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(37, 99, 235)');
      await page.evaluate(() => {
        tasks = [
          { id: 'one', title: 'Reunião Açúcar', description: 'Planejar equipe', notes: 'Levar relatório', date: todayStr(), time: '', status: 'pending', priority: 'high' },
          { id: 'two', title: 'Entrega pronta', date: todayStr(), time: '', status: 'done', priority: 'low' },
          { id: 'three', title: 'Tarefa futura', date: '2099-05-10', time: '', status: 'pending', priority: 'urgent' }
        ];
        notifications = [{ id: 'notice', title: 'Lembrete', message: 'Teste', read: false, createdAt: new Date().toISOString() }];
        renderAll(); updateNotificationBadge();
      });
      await page.locator('#task-status-filter').selectOption('done');
      assert.equal(await page.locator('#tasks-list .task-swipe-card').count(), 1);
      assert.match(await page.locator('#tasks-list').innerText(), /Entrega pronta/);
      await page.locator('#task-status-filter').selectOption('pending');
      assert.match(await page.locator('#tasks-list').innerText(), /Reunião Açúcar/);
      await page.locator('#header-task-search').click();
      const input = page.locator('#global-search-input-desktop');
      await input.fill('acucar');
      assert.equal(await page.locator('.task-search-result').count(), 1);
      await input.fill('10/05/2099');
      assert.match(await page.locator('.task-search-result').innerText(), /Tarefa futura/);
      await input.press('Enter');
      assert.equal(await page.locator('#task-modal').isVisible(), true);
      await page.evaluate(() => closeTaskModal());
      await page.locator('#header-profile').click();
      assert.match(await page.locator('#toast-container').innerText(), /perfil.*em breve/i);
      await page.evaluate(() => { selectedTaskDate = todayStr(); filterTasks('pending'); switchTab('tasks'); });
      await page.evaluate(() => document.getElementById('toast-container').replaceChildren());
      const before = await page.evaluate(() => JSON.stringify({ tasks, notifications, selectedTaskDate, currentFilter }));
      await page.evaluate(() => startTutorial(true));
      for (let step = 1; step <= 12; step++) {
        assert.equal(await page.locator('#tutorial-step-label').innerText(), `PASSO ${step} DE 12`);
        const box = await page.locator('#tutorial-card').boundingBox();
        assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= width + 1 && box.y + box.height <= height + 1, `Card outside viewport at ${width}, step ${step}: ${JSON.stringify(box)}`);
        assert.ok(box.height < 450, `Stretched tutorial at ${width}, step ${step}`);
        assert.equal(await page.locator('#tutorial-next-btn').isEnabled(), true);
        if (step === 2) {
          await page.locator('#tutorial-prev-btn').click();
          assert.match(await page.locator('#tutorial-step-label').innerText(), /1 DE 12/);
          await page.locator('#tutorial-next-btn').click();
        }
        if (step === 1 && process.env.WETASKS_SCREENSHOT_DIR) await page.screenshot({ animations: 'disabled', path: path.join(process.env.WETASKS_SCREENSHOT_DIR, `wetasks-tour-${width}.png`) });
        await page.locator('#tutorial-next-btn').click();
      }
      assert.equal(await page.locator('#tutorial-overlay').isVisible(), false);
      assert.equal(await page.evaluate(() => JSON.stringify({ tasks, notifications, selectedTaskDate, currentFilter })), before);
      assert.equal(await page.locator('#app').evaluate(el => el.inert), false);
      await page.evaluate(() => setTheme('dark'));
      await page.evaluate(() => startTutorial(true));
      await page.evaluate(() => document.getElementById('toast-container').replaceChildren());
      if (process.env.WETASKS_SCREENSHOT_DIR) await page.screenshot({ animations: 'disabled', path: path.join(process.env.WETASKS_SCREENSHOT_DIR, `wetasks-tour-dark-${width}.png`) });
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => !!document.activeElement.closest('#tutorial-card')), true);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#tutorial-overlay').isVisible(), false);
      await page.locator('#header-notifications').click();
      assert.equal(await page.locator('#notifications-panel').isVisible(), true);
      assert.equal(await page.evaluate(() => notifications.every(n => n.read)), true);
      await page.evaluate(() => { setTheme('light'); switchTab('tasks'); });
      await page.evaluate(() => document.getElementById('toast-container').replaceChildren());
      if (process.env.WETASKS_SCREENSHOT_DIR) await page.screenshot({ animations: 'disabled', path: path.join(process.env.WETASKS_SCREENSHOT_DIR, `wetasks-header-${width}.png`) });
      assert.deepEqual(errors, []);
      await context.close();
    }
  } finally { await browser.close(); }
});
