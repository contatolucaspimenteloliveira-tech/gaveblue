(function () {
  const config = window.WETASKS_SUPABASE_CONFIG || {};
  const STORAGE_MIGRATED_KEY = 'wetasks_supabase_migrated_v1';
  let client = null;
  let user = null;
  let syncTimer = null;
  let syncing = false;
  let queuedState = null;
  let lastError = '';

  const clone = (value) => JSON.parse(JSON.stringify(value || []));

  function isConfigured() {
    return Boolean(config.url && config.anonKey && window.supabase?.createClient);
  }

  function taskToRow(task) {
    return {
      user_id: user.id,
      task_id: String(task.id),
      title: String(task.title || ''),
      description: String(task.description || ''),
      due_date: task.date,
      due_time: task.time || null,
      timezone: 'America/Sao_Paulo',
      priority: task.priority || 'low',
      notes: String(task.notes || ''),
      status: task.status === 'done' ? 'done' : 'pending',
      created_at: task.createdAt || new Date().toISOString(),
      updated_at: task.updatedAt || new Date().toISOString()
    };
  }

  function rowToTask(row) {
    return {
      id: row.task_id,
      title: row.title,
      description: row.description || '',
      date: row.due_date,
      time: row.due_time ? String(row.due_time).slice(0, 5) : '',
      priority: row.priority,
      notes: row.notes || '',
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  function notificationToRow(notification) {
    return {
      user_id: user.id,
      id: String(notification.id),
      task_id: notification.taskId || null,
      type: notification.type || 'info',
      message: String(notification.message || ''),
      is_read: Boolean(notification.read),
      created_at: notification.timestamp || new Date().toISOString()
    };
  }

  function rowToNotification(row) {
    return {
      id: row.id,
      taskId: row.task_id || undefined,
      type: row.type,
      message: row.message,
      timestamp: row.created_at,
      read: row.is_read
    };
  }

  async function ensureSession() {
    const { data: sessionData } = await client.auth.getSession();
    if (sessionData?.session?.user) return sessionData.session.user;
    const { data, error } = await client.auth.signInAnonymously();
    if (error) throw error;
    return data.user;
  }

  async function fetchCloudState() {
    const [{ data: taskRows, error: taskError }, { data: notificationRows, error: notificationError }] = await Promise.all([
      client.from('wetasks_tasks').select('*').order('created_at'),
      client.from('wetasks_notifications').select('*').order('created_at', { ascending: false }).limit(50)
    ]);
    if (taskError) throw taskError;
    if (notificationError) throw notificationError;
    return {
      tasks: (taskRows || []).map(rowToTask),
      notifications: (notificationRows || []).map(rowToNotification)
    };
  }

  async function syncState(state) {
    if (!client || !user || syncing) {
      queuedState = cloneState(state);
      return;
    }
    syncing = true;
    try {
      const taskRows = (state.tasks || []).filter((task) => task.id !== 'tutorial_demo_task').map(taskToRow);
      const notificationRows = (state.notifications || []).map(notificationToRow);
      if (taskRows.length) {
        const { error } = await client.from('wetasks_tasks').upsert(taskRows, { onConflict: 'user_id,task_id' });
        if (error) throw error;
      }
      const ids = taskRows.map((row) => row.task_id);
      let deleteQuery = client.from('wetasks_tasks').delete().eq('user_id', user.id);
      if (ids.length) deleteQuery = deleteQuery.not('task_id', 'in', `(${ids.map((id) => `"${String(id).replace(/"/g, '')}"`).join(',')})`);
      const { error: deleteError } = await deleteQuery;
      if (deleteError) throw deleteError;
      if (notificationRows.length) {
        const { error } = await client.from('wetasks_notifications').upsert(notificationRows, { onConflict: 'user_id,id' });
        if (error) throw error;
      }
      lastError = '';
    } catch (error) {
      lastError = error?.message || String(error);
      console.warn('[WeTasks] Sincronização adiada:', lastError);
    } finally {
      syncing = false;
      if (queuedState) {
        const next = queuedState;
        queuedState = null;
        await syncState(next);
      }
    }
  }

  function cloneState(state) {
    return { tasks: clone(state?.tasks), notifications: clone(state?.notifications) };
  }

  function scheduleSync(tasks, notifications) {
    if (!client || !user) return;
    queuedState = cloneState({ tasks, notifications });
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      const state = queuedState;
      queuedState = null;
      if (state) syncState(state);
    }, 350);
  }

  async function start(localState) {
    if (!isConfigured()) return { connected: false, ...cloneState(localState) };
    try {
      client = window.supabase.createClient(config.url, config.anonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
      });
      user = await ensureSession();
      const remote = await fetchCloudState();
      const hasRemoteData = remote.tasks.length || remote.notifications.length;
      const alreadyMigrated = localStorage.getItem(STORAGE_MIGRATED_KEY) === 'true';

      if (!hasRemoteData && !alreadyMigrated) {
        await syncState(localState);
        localStorage.setItem(STORAGE_MIGRATED_KEY, 'true');
        return { connected: true, userId: user.id, ...cloneState(localState) };
      }

      localStorage.setItem(STORAGE_MIGRATED_KEY, 'true');
      return { connected: true, userId: user.id, ...remote };
    } catch (error) {
      lastError = error?.message || String(error);
      console.warn('[WeTasks] Modo local ativo:', lastError);
      client = null;
      user = null;
      return { connected: false, error: lastError, ...cloneState(localState) };
    }
  }

  function urlBase64ToUint8Array(value) {
    const padding = '='.repeat((4 - value.length % 4) % 4);
    const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
    return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
  }

  async function enablePush() {
    if (!client || !user) throw new Error('A nuvem do WeTasks ainda não está conectada.');
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) throw new Error('Este navegador não suporta notificações em segundo plano.');
    const registration = await navigator.serviceWorker.register('./wetasks-sw.js');
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('Permissão de notificação não concedida.');

    const response = await fetch(`${config.url}/functions/v1/${config.notificationFunction}`);
    if (!response.ok) throw new Error('Não foi possível obter a chave de notificação.');
    const { publicKey } = await response.json();
    if (!publicKey) throw new Error('As notificações agendadas ainda não foram ativadas no servidor.');

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });
    const row = {
      user_id: user.id,
      endpoint: subscription.endpoint,
      subscription: subscription.toJSON(),
      user_agent: navigator.userAgent,
      active: true
    };
    const { data: existing } = await client.from('wetasks_push_subscriptions').select('id').eq('endpoint', row.endpoint).maybeSingle();
    const query = existing?.id
      ? client.from('wetasks_push_subscriptions').update(row).eq('id', existing.id)
      : client.from('wetasks_push_subscriptions').insert(row);
    const { error } = await query;
    if (error) throw error;
    return true;
  }

  window.WeTasksCloud = {
    start,
    scheduleSync,
    enablePush,
    getStatus: () => ({ connected: Boolean(client && user), userId: user?.id || '', error: lastError })
  };
})();
