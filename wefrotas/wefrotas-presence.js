// Independent access telemetry. Never reads, writes or queues operational snapshots.
(function (global) {
  'use strict';
  let connection = null, busy = false, closing = false, activityAt = Date.now(), warned = false;
  const backend = () => global.WeFrotasBackend;
  function device() {
    const ua = global.navigator?.userAgent || '';
    return {
      browser: /Edg\//.test(ua) ? 'Edge' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Outro',
      system: /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Windows/.test(ua) ? 'Windows' : /Mac/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'Outro'
    };
  }
  async function transmit(phase) {
    if (!connection || busy) return;
    const active = connection;
    const user = backend()?.getUser(), org = backend()?.getOrganizationContext();
    if (active.actorId !== user?.$id || active.workspaceId !== org?.workspaceId) return;
    busy = true;
    try {
      const response = await backend().executeAdministrativeFunction({
        action:'wefrotas-session-presence', connectionId:active.id, phase,
        expectedUserId:active.actorId, expectedWorkspaceId:active.workspaceId,
        ...device(), active: !document.hidden && Date.now() - activityAt < 90000
      });
      const body = typeof response?.responseBody === 'string' ? JSON.parse(response.responseBody) : response?.responseBody;
      if (!body?.ok) throw new Error(body?.error || 'Registro de presença indisponível.');
      if (connection === active) active.confirmed = true;
      warned = false;
    } catch (error) {
      // Access telemetry must not turn an operational save into an error or block login.
      if (!warned) console.warn('Auditoria de acesso indisponível; a sincronização operacional não foi alterada.');
      warned = true;
    } finally { busy = false; }
  }
  function tick() {
    if (closing || !global.crypto?.randomUUID) return;
    const user = backend()?.getUser(), org = backend()?.getOrganizationContext();
    if (!user?.$id || !org?.id || !org?.workspaceId) { connection = null; return; }
    if (!connection || connection.actorId !== user.$id || connection.workspaceId !== org.workspaceId) {
      connection = {id:global.crypto.randomUUID(),actorId:user.$id,workspaceId:org.workspaceId,confirmed:false,nextAt:0};
    }
    if (!busy && Date.now() >= connection.nextAt) {
      connection.nextAt = Date.now() + 60000;
      void transmit(connection.confirmed ? 'ping' : 'open');
    }
  }
  ['pointerdown','keydown','touchstart'].forEach(type => document.addEventListener(type, () => {activityAt=Date.now();},{passive:true}));
  global.addEventListener('pagehide', () => {closing=true; void transmit('close');});
  global.addEventListener('pageshow', e => {if(e.persisted){connection=null;closing=false;tick();}});
  // A new document is a new access connection, not a new authentication token/session.
  // Closed tabs that cannot deliver pagehide expire as "Sem contato" in the admin.
  global.setInterval(tick, 5000);
  tick();
})(window);
