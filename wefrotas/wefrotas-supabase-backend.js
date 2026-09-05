(function createWeFrotasSupabaseBackend(global) {
  'use strict';

  const config = global.WEFROTAS_SUPABASE_CONFIG || {};
  const supabasePreview = (() => {
    try { return new URL(global.location.href).searchParams.get('backend') === 'supabase'; }
    catch (_) { return false; }
  })();
  // During acceptance, production keeps the confirmed backend unless the URL
  // explicitly requests Supabase. Final cutover flips the immutable config.
  if (!config.cutover && !supabasePreview) return;
  const core = global.WeFrotasSupabaseCore;
  const ROLE_PERMISSIONS = Object.freeze({
    'wefrotas-admin': new Set(['read','syncSnapshot','manageOperations','approveRecords','manageSettings','manageUsers','manageDevices','sendNotifications','deleteRecords']),
    'wefrotas-gestor': new Set(['read','syncSnapshot','manageOperations','approveRecords','manageSettings']),
    'wefrotas-aprovador': new Set(['read','approveRecords']),
    'wefrotas-consulta': new Set(['read'])
  });
  const MEMBER_ROLES = Object.freeze({
    admin: 'wefrotas-admin', manager: 'wefrotas-gestor', approver: 'wefrotas-aprovador',
    viewer: 'wefrotas-consulta', driver: 'wefrotas-consulta'
  });
  const clone = (value) => JSON.parse(JSON.stringify(value));

  let client = null;
  let currentUser = null;
  let organizationContext = Object.freeze({ id:'', workspaceId:'', role:'', modules:[], limits:{} });
  let snapshotGetter = null;
  let snapshotApplier = null;
  let statusListener = null;
  let centralListener = null;
  let baseSnapshot = null;
  let revision = 0;
  let snapshotReady = false;
  let syncTimer = null;
  let remoteRefreshTimer = null;
  let syncChain = Promise.resolve();
  let channel = null;
  let centralChannel = null;
  let contextEpoch = 0;
  let contextUserId = '';
  let pendingRecord = null;
  let applyingSnapshot = false;
  let reconnectListenerRegistered = false;
  // Each tab owns its journal. A second tab must never clear the first tab's
  // unsent edits. sessionStorage preserves this identity across a refresh.
  const journalClientId = (() => {
    try {
      const key = 'wefrotas_supabase_client';
      const existing = global.sessionStorage?.getItem(key);
      if (existing) return existing;
      const value = crypto.randomUUID();
      global.sessionStorage?.setItem(key, value);
      return value;
    } catch (_) { return crypto.randomUUID(); }
  })();

  function isConfigured() {
    return Boolean(config.url && config.anonKey && core && global.supabase?.createClient);
  }

  function ensureClient() {
    if (!isConfigured()) throw new Error('O Supabase do WeFrotas ainda não foi configurado.');
    if (!client) client = global.supabase.createClient(config.url, config.anonKey, {
      // Admin and WeFrotas share an origin/project, but not a login. Never
      // adopt, copy or clear the SDK's default Admin session during cutover.
      auth: { storageKey:`wefrotas-auth-${new URL(config.url).origin}-v1`, persistSession:true, autoRefreshToken:true, detectSessionInUrl:true },
      realtime: { params: { eventsPerSecond: 20 } }
    });
    return client;
  }

  function normalizeUser(user) {
    if (!user) return null;
    return {
      ...user, $id:user.id, email:user.email || '',
      name:user.user_metadata?.name || user.user_metadata?.full_name || String(user.email || '').split('@')[0] || 'Usuário',
      labels:[getAccessRole()]
    };
  }

  function emitStatus(state, message, extra = {}) {
    statusListener?.({ state, message, user:currentUser, ...extra });
  }

  function captureContext() {
    assertOrganization();
    return {
      epoch: contextEpoch, organizationId: organizationContext.id,
      workspaceId: organizationContext.workspaceId, userId: currentUser.id,
      journalKey: `wefrotas_supabase_journal:${organizationContext.id}:${currentUser.id}:${journalClientId}`,
      journalPrefix: `wefrotas_supabase_journal:${organizationContext.id}:${currentUser.id}:`,
      legacyKey: `wefrotas_supabase_pending:${organizationContext.id}`,
      formerPendingKey: `wefrotas_online_sync_pending:${organizationContext.id}`,
      formerBaseKey: `wefrotas_online_sync_base:${organizationContext.id}`,
      formerVersionKey: `wefrotas_online_sync_version:${organizationContext.id}`
    };
  }

  function isCurrentContext(scope) {
    return scope.epoch === contextEpoch && scope.organizationId === organizationContext.id && scope.userId === currentUser?.id;
  }

  function assertContext(scope) {
    if (!isCurrentContext(scope)) throw Object.assign(new Error('A sessão ou empresa mudou durante a operação. A cópia pendente foi preservada.'), { code:409, type:'WEFROTAS_CONTEXT_CHANGED' });
  }

  function readJournal(scope) {
    const serialized = localStorage.getItem(scope.journalKey);
    if (!serialized) return null;
    try {
      const record = JSON.parse(serialized);
      if (record.version !== 1 || record.organizationId !== scope.organizationId || record.userId !== scope.userId || !record.base || !record.desired || !Number.isSafeInteger(record.revision)) throw new Error('journal');
      core.diffSnapshots(record.base, record.desired);
      return record;
    } catch (_) {
      throw new Error('A cópia pendente não pôde ser lida. Ela foi preservada; não substitua os dados antes de recuperá-la.');
    }
  }

  function persistJournal(scope, record) {
    assertContext(scope);
    const serialized = JSON.stringify(record);
    try {
      localStorage.setItem(scope.journalKey, serialized);
      if (localStorage.getItem(scope.journalKey) !== serialized) throw new Error('verification');
    } catch (cause) {
      throw Object.assign(new Error('Não foi possível confirmar a cópia local de segurança. A gravação não foi enviada; mantenha esta tela aberta.'), { cause, code:507 });
    }
    pendingRecord = record;
    return record;
  }

  function clearJournal(scope) {
    assertContext(scope);
    localStorage.removeItem(scope.journalKey);
    if (localStorage.getItem(scope.journalKey) !== null) throw new Error('Não foi possível finalizar a cópia pendente. A confirmação será verificada novamente.');
    pendingRecord = null;
  }

  function hasPending() {
    if (!organizationContext.id || !currentUser?.id) return false;
    const scope = captureContext();
    return Boolean(pendingRecord || localStorage.getItem(scope.journalKey) || hasLegacyPending(scope));
  }

  function hasLegacyPending(scope) {
    return Boolean(localStorage.getItem(scope.legacyKey) || localStorage.getItem(scope.formerPendingKey));
  }

  function otherTenantJournals(scope) {
    const journals=[];
    for(let index=0;index<localStorage.length;index+=1) {
      const key=localStorage.key(index);
      if(key?.startsWith(scope.journalPrefix)&&key!==scope.journalKey) {
        const serialized=localStorage.getItem(key);
        let record=null;
        try { record=JSON.parse(serialized); } catch (_) { /* preserve malformed copies too */ }
        journals.push({key,record,serialized});
      }
    }
    return journals;
  }

  function preservePreMigrationCopy(scope, localSnapshot) {
    const key=`wefrotas:supabase-first-adoption:${scope.organizationId}:${scope.userId}`;
    const existing=localStorage.getItem(key);
    if(existing) {
      try {
        const saved=JSON.parse(existing);
        if(saved.organizationId!==scope.organizationId||saved.userId!==scope.userId||!saved.localSnapshot)throw new Error('backup');
      } catch (_) { throw new Error('A cópia anterior à migração não pôde ser validada. Seus dados locais foram preservados.'); }
      return key;
    }
    const backup={createdAt:new Date().toISOString(),organizationId:scope.organizationId,workspaceId:scope.workspaceId,userId:scope.userId,
      localSnapshot,legacyConfirmedBase:localStorage.getItem(scope.formerBaseKey),legacyConfirmedVersion:localStorage.getItem(scope.formerVersionKey),
      legacyPending:localStorage.getItem(scope.legacyKey),formerPending:localStorage.getItem(scope.formerPendingKey)};
    const serialized=JSON.stringify(backup);
    localStorage.setItem(key,serialized);
    if(localStorage.getItem(key)!==serialized)throw new Error('A cópia anterior à migração não pôde ser confirmada. Seus dados locais não foram substituídos.');
    return key;
  }

  function serialize(scope, operation) {
    const result = syncChain.then(() => { assertContext(scope); return operation(); });
    syncChain = result.catch(() => {});
    return result;
  }

  function applyState(snapshotValue, state) {
    const snapshot = core.normalizeSnapshot(snapshotValue);
    core.STATE_KEYS.forEach(key => { delete snapshot[key]; });
    return Object.assign(snapshot, clone(state.settings), { orderCounter:state.orderCounter });
  }

  // A three-way merge may accept identical already-committed changes (lost
  // response), but never chooses a winner for different edits of one row.
  function rebaseChanges(base, desired, remote) {
    const delta = core.diffSnapshots(base, desired);
    const remoteDelta = core.diffSnapshots(base, remote);
    for (const key of core.ENTITY_KEYS) {
      const rows = new Map(remote[key].map(row => [String(row.id), row]));
      delta[key].upserts = delta[key].upserts.filter(row => !core.equal(rows.get(String(row.id)), row));
      delta[key].deletes = delta[key].deletes.filter(id => rows.has(String(id)));
    }
    if (core.deltasOverlap(delta, remoteDelta)) throw Object.assign(new Error('Conflito no mesmo registro detectado. A cópia local foi preservada para revisão.'), { code:409 });
    const baseState = core.extractState(base), desiredState = core.extractState(desired), remoteState = core.extractState(remote);
    const state = clone(remoteState);
    for (const key of [...core.STATE_KEYS, 'orderCounter']) {
      const before = key === 'orderCounter' ? baseState.orderCounter : baseState.settings[key];
      const after = key === 'orderCounter' ? desiredState.orderCounter : desiredState.settings[key];
      const server = key === 'orderCounter' ? remoteState.orderCounter : remoteState.settings[key];
      if (core.equal(before, after) || core.equal(after, server)) continue;
      if (!core.equal(before, server)) throw Object.assign(new Error('Conflito nas configurações da empresa. A cópia local foi preservada para revisão.'), { code:409 });
      if (key === 'orderCounter') state.orderCounter = after;
      else if (after === undefined) delete state.settings[key];
      else state.settings[key] = clone(after);
    }
    return { delta, state, snapshot:applyState(core.applyDelta(remote, delta), state), changed:core.hasDelta(delta) || !core.equal(state, remoteState) };
  }

  async function applyToScreen(scope, snapshot) {
    assertContext(scope);
    applyingSnapshot = true;
    try { await snapshotApplier?.(clone(snapshot)); assertContext(scope); }
    finally { if (isCurrentContext(scope)) applyingSnapshot = false; }
  }

  function getAccessRole() {
    return MEMBER_ROLES[organizationContext.role] || organizationContext.role || 'wefrotas-consulta';
  }

  function hasPermission(permission) {
    return ROLE_PERMISSIONS[getAccessRole()]?.has(permission) === true;
  }

  function assertOrganization() {
    if (!currentUser?.id || !organizationContext.id) throw new Error('A empresa ainda não foi confirmada pelo Supabase.');
  }

  function assertPermission(permission) {
    assertOrganization();
    if (!hasPermission(permission)) throw Object.assign(new Error('Seu perfil não possui permissão para esta ação.'),{code:403});
  }

  async function restoreSession() {
    if (!isConfigured()) return null;
    const { data, error } = await ensureClient().auth.getSession();
    if (error) throw error;
    currentUser = normalizeUser(data?.session?.user || null);
    return currentUser;
  }

  async function initialize(options = {}) {
    snapshotGetter = options.getSnapshot;
    snapshotApplier = options.applySnapshot;
    statusListener = options.onStatus;
    centralListener = options.onCentralRecordsChange;
    if (!reconnectListenerRegistered && global.addEventListener) {
      reconnectListenerRegistered = true;
      global.addEventListener('online', () => {
        if (!snapshotReady || !organizationContext.id || !currentUser?.id) return;
        const scope=captureContext();
        serialize(scope,async()=>{
          if(pendingRecord&&hasPermission('syncSnapshot'))await flushPending(scope);
          return refreshChanges(scope);
        }).catch(error=>{if(isCurrentContext(scope))emitStatus('error','A conexão voltou, mas existem alterações pendentes de confirmação.',{error});});
      });
    }
    const user = await restoreSession();
    emitStatus(user ? 'online' : 'signed-out', user ? 'Sessão Supabase encontrada.' : 'Entre para acessar os dados online.');
    return user;
  }

  async function signIn(email, password) {
    const { data, error } = await ensureClient().auth.signInWithPassword({ email, password });
    if (error) throw error;
    currentUser = normalizeUser(data.user);
    emitStatus('online','Login validado pelo Supabase.');
    return currentUser;
  }

  async function signOut() {
    contextEpoch += 1;
    clearTimeout(syncTimer); syncTimer = null;
    clearTimeout(remoteRefreshTimer); remoteRefreshTimer = null;
    pendingRecord = null; applyingSnapshot = false; snapshotReady = false;
    syncChain = Promise.resolve();
    if (channel) await ensureClient().removeChannel(channel).catch(()=>{});
    if (centralChannel) await ensureClient().removeChannel(centralChannel).catch(()=>{});
    await ensureClient().auth.signOut({ scope:'local' });
    currentUser = null; baseSnapshot = null; revision = 0; snapshotReady = false;
    organizationContext = Object.freeze({ id:'',workspaceId:'',role:'',modules:[],limits:{} });
    emitStatus('signed-out','Sessão encerrada.');
  }

  function setOrganizationContext(value = {}) {
    if (!value.id || !value.workspaceId) throw new Error('A empresa autorizada possui contexto inválido.');
    if (String(value.id) !== organizationContext.id || String(value.workspaceId) !== organizationContext.workspaceId || String(value.role || '') !== organizationContext.role || contextUserId !== currentUser?.id) {
      contextEpoch += 1;
      contextUserId = currentUser?.id || '';
      clearTimeout(syncTimer); syncTimer = null;
      clearTimeout(remoteRefreshTimer); remoteRefreshTimer = null;
      baseSnapshot = null; revision = 0; snapshotReady = false; pendingRecord = null; applyingSnapshot = false;
      syncChain = Promise.resolve();
    }
    organizationContext = Object.freeze({
      id:String(value.id), slug:String(value.slug || value.workspaceId),
      workspaceId:String(value.workspaceId), role:String(value.role || ''),
      modules:Array.isArray(value.modules)?[...value.modules]:[], limits:{...(value.limits||{})},
      branding:{...(value.branding||{})}, name:String(value.name||'')
    });
    currentUser = normalizeUser(currentUser);
    return organizationContext;
  }

  async function resolveMyAccess() {
    if (!currentUser?.id) throw Object.assign(new Error('Sessão Supabase ausente.'),{code:401});
    const db = ensureClient();
    const { data:membership,error:memberError } = await db.from('organization_members')
      .select('organization_id,role,status,email').eq('user_id',currentUser.id).eq('status','active').limit(2);
    if (memberError) throw memberError;
    if (!membership?.length) throw Object.assign(new Error('Seu usuário ainda não está vinculado a uma empresa ativa.'),{code:403});
    if (membership.length > 1) throw Object.assign(new Error('Este acesso está vinculado a mais de uma empresa; selecione o ambiente pelo painel.'),{code:409});
    const member = membership[0];
    const [{data:organization,error:orgError},{data:modules,error:moduleError},{data:subscription,error:subscriptionError}] = await Promise.all([
      db.from('organizations').select('id,slug,name,status,logo_url,primary_color,secondary_color').eq('id',member.organization_id).single(),
      db.from('organization_modules').select('module_key,enabled').eq('organization_id',member.organization_id),
      db.from('organization_subscriptions').select('status,max_users,max_vehicles,max_devices,plans(max_users,max_vehicles,max_devices)').eq('organization_id',member.organization_id).maybeSingle()
    ]);
    if (orgError) throw orgError; if (moduleError) throw moduleError; if (subscriptionError) throw subscriptionError;
    if (!['active','trial'].includes(organization.status) || !['active','trial'].includes(subscription?.status || '')) throw Object.assign(new Error('A empresa ou assinatura está inativa.'),{code:403});
    const enabledModules=(modules||[]).filter(item=>item.enabled).map(item=>item.module_key);
    const limits={users:subscription?.max_users||subscription?.plans?.max_users||0,vehicles:subscription?.max_vehicles||subscription?.plans?.max_vehicles||0,devices:subscription?.max_devices||subscription?.plans?.max_devices||0};
    return {
      role:MEMBER_ROLES[member.role]||'wefrotas-consulta',
      organization:{ id:organization.id,slug:organization.slug,name:organization.name,workspaceId:organization.slug,
        modules:enabledModules,limits,
        branding:{logoUrl:organization.logo_url||'',primaryColor:organization.primary_color||'#2563eb',secondaryColor:organization.secondary_color||'#7c3aed'} }
    };
  }

  async function loadRemote(scope = captureContext()) {
    assertContext(scope);
    const { data,error } = await ensureClient().rpc('wefrotas_load_snapshot',{target_organization_id:scope.organizationId});
    assertContext(scope);
    if (error) throw error;
    const snapshot=core.normalizeSnapshot(data?.snapshot||{});
    await refreshPrivateAssetUrls(snapshot, scope);
    assertContext(scope);
    return { revision:Number(data?.revision)||0, updatedAt:data?.updatedAt||'', initialized:data?.initialized===true, snapshot };
  }

  function privateAssetPath(value, organizationId) {
    if(typeof value!=='string'||value.length>1024||/[\\%?#:\u0000-\u001f\u007f]/.test(value))return '';
    const parts=value.split('/');
    return parts.length>=3&&parts[0]===organizationId&&parts.every(part=>part&&part!=='.'&&part!=='..')?value:'';
  }

  async function refreshPrivateAssetUrls(snapshot, scope = captureContext()) {
    assertContext(scope);
    const vehicles=Array.isArray(snapshot?.vehicles)?snapshot.vehicles:[];
    const cities=Array.isArray(snapshot?.centralCities)?snapshot.centralCities:[];
    const banners=Array.isArray(snapshot?.banners)?snapshot.banners:[];
    const assetReferences=[
      ...vehicles.map(item=>({item,path:item?.vehicleImageFileId||item?.storagePath||item?.fileId,urlField:'vehicleImageUrl'})),
      ...cities.map(item=>({item,path:item?.imageFileId||item?.storagePath||item?.fileId,urlField:'imageUrl'})),
      ...banners.map(item=>({item,path:item?.imageFileId||item?.storagePath||item?.fileId,urlField:'imageUrl'}))
    ].map(reference=>({...reference,path:privateAssetPath(reference.path,scope.organizationId)})).filter(reference=>{
      if(!reference.path)return false;
      const current=reference.item[reference.urlField];
      if(!current)return true;
      try{const url=new URL(current);return url.origin===new URL(config.url).origin&&url.pathname.startsWith('/storage/v1/object/sign/');}
      catch(_){return false;}
    });
    const paths=[...new Set(assetReferences.map(reference=>reference.path))];
    if(!paths.length)return snapshot;
    const store=ensureClient().storage.from(config.assetsBucket||'wefrotas-assets');
    const signedByPath=new Map();
    await Promise.all(paths.map(async path=>{const{data,error}=await store.createSignedUrl(path,31536000);if(!error&&data?.signedUrl)signedByPath.set(path,data.signedUrl);}));
    assertContext(scope);
    assetReferences.forEach(({item,path,urlField})=>{const url=signedByPath.get(path);if(url){const fragment=String(item[urlField]||'').match(/#.*$/)?.[0]||'';item[urlField]=url+fragment;}});
    return snapshot;
  }

  async function subscribeRealtime(scope = captureContext()) {
    if (channel) await ensureClient().removeChannel(channel).catch(()=>{});
    assertContext(scope);
    const filter=`organization_id=eq.${scope.organizationId}`;
    channel=ensureClient().channel(`wefrotas:${scope.organizationId}:${crypto.randomUUID()}`);
    // Only the committed workspace revision triggers a read. Applying row
    // notifications individually would expose half an OS/finance transaction.
    const scheduleRefresh=()=>{
      if(!isCurrentContext(scope))return;
      clearTimeout(remoteRefreshTimer);
      remoteRefreshTimer=setTimeout(()=>{
        serialize(scope,()=>refreshChanges(scope)).catch(error=>{
          if(isCurrentContext(scope)) emitStatus('error','A atualização permanece pendente; sua cópia foi preservada.',{error});
        });
      },180);
    };
    channel.on('postgres_changes',{event:'UPDATE',schema:'public',table:'wefrotas_workspace_state',filter},(payload)=>{
      if (!isCurrentContext(scope) || Number(payload?.new?.revision) <= revision) return;
      scheduleRefresh();
    });
    // Catch changes committed between initial loading and subscription, and
    // while a realtime connection was disconnected without an online event.
    channel.subscribe(status=>{if(status==='SUBSCRIBED')scheduleRefresh();});
    if(centralChannel)await ensureClient().removeChannel(centralChannel).catch(()=>{});
    assertContext(scope);
    centralChannel=ensureClient().channel(`wefrotas-central:${scope.organizationId}:${crypto.randomUUID()}`);
    centralChannel.on('postgres_changes',{event:'*',schema:'public',table:'wefrotas_central_records',filter},payload=>{
      if(!isCurrentContext(scope))return;
      const row=payload.eventType==='DELETE'?payload.old:payload.new;
      if(!row?.entity_id)return;
      centralListener?.({events:[`wefrotas_central_records.${payload.eventType==='DELETE'?'delete':'update'}`],payload:{...row.data,$id:row.entity_id,id:row.entity_id,status:row.status,workspaceId:scope.workspaceId}});
    }).subscribe();
  }

  function makeJournal(scope, desired, previous = pendingRecord) {
    return {
      version:1, organizationId:scope.organizationId, workspaceId:scope.workspaceId, userId:scope.userId,
      requestId:crypto.randomUUID(), updatedAt:new Date().toISOString(),
      revision:previous?.revision ?? revision,
      base:clone(previous?.base || baseSnapshot), desired:core.normalizeSnapshot(desired)
    };
  }

  function stageSnapshot(scope, snapshotValue) {
    assertPermission('syncSnapshot');
    if (!snapshotReady || !baseSnapshot) throw Object.assign(new Error('A base Supabase ainda não foi confirmada. Nenhuma alteração foi enviada.'),{code:412});
    if (hasLegacyPending(scope)) throw Object.assign(new Error('Há uma cópia pendente antiga sem versão de origem. Revise a recuperação antes de enviar alterações.'),{code:409});
    const desired=core.normalizeSnapshot(snapshotValue || {});
    core.diffSnapshots(baseSnapshot,desired); // validate before journal or network
    return persistJournal(scope,makeJournal(scope,desired));
  }

  async function acceptSaved(scope, attempt, savedSnapshot, savedRevision) {
    assertContext(scope);
    const latest=pendingRecord || readJournal(scope);
    if (latest && latest.requestId !== attempt.requestId) {
      // Later edits were made against the earlier visible snapshot. Replay only
      // that tail on the confirmed result so remote additions cannot be deleted.
      const tail=core.diffSnapshots(attempt.desired,latest.desired);
      let next=core.applyDelta(savedSnapshot,tail);
      const tailState=rebaseChanges(attempt.desired,latest.desired,attempt.desired).state;
      const desiredState=core.extractState(latest.desired), originalState=core.extractState(attempt.desired);
      if (!core.equal(desiredState,originalState)) {
        const merged=core.extractState(savedSnapshot);
        for(const key of core.STATE_KEYS) if(!core.equal(originalState.settings[key],tailState.settings[key])) {
          if(tailState.settings[key]===undefined)delete merged.settings[key];else merged.settings[key]=clone(tailState.settings[key]);
        }
        if(desiredState.orderCounter!==originalState.orderCounter)merged.orderCounter=desiredState.orderCounter;
        next=applyState(next,merged);
      }
      persistJournal(scope,{...latest,base:clone(savedSnapshot),desired:next,revision:savedRevision});
      baseSnapshot=clone(savedSnapshot);revision=savedRevision;
      await applyToScreen(scope,next);
    } else {
      // Retain the journal until the canonical result is durably applied by the
      // frontend. Failure or tab switch during application can be retried.
      await applyToScreen(scope,savedSnapshot);
      baseSnapshot=clone(savedSnapshot);revision=savedRevision;
      clearJournal(scope);
    }
  }

  async function flushPending(scope) {
    assertContext(scope);assertPermission('syncSnapshot');
    let finalMode='unchanged';
    // Each pass takes the newest durable journal; timers never close over stale
    // snapshots. Calls to queueSnapshot and syncNow share this single worker.
    for(let pass=0;pass<20;pass+=1) {
      const attempt=pendingRecord || readJournal(scope);
      if(!attempt)return{mode:finalMode,revision,workspaceId:scope.workspaceId,updatedAt:String(revision)};
      let source=core.normalizeSnapshot(attempt.base), target=core.normalizeSnapshot(attempt.desired), expectedRevision=attempt.revision;
      let mode='supabase-saved';
      let confirmed=false;
      emitStatus('syncing','Salvando alterações no Supabase...');
      for(let retry=0;retry<4;retry+=1) {
        const delta=core.diffSnapshots(source,target), state=core.extractState(target);
        if(!core.hasDelta(delta)&&core.equal(core.extractState(source),state)) {
          await acceptSaved(scope,attempt,target,expectedRevision);confirmed=true;break;
        }
        let response;
        try { response=await ensureClient().rpc('wefrotas_apply_snapshot_delta',{target_organization_id:scope.organizationId,expected_revision:expectedRevision,delta,next_state:state}); }
        catch(error){response={error};}
        assertContext(scope);
        if(!response.error) {
          const nextRevision=Number(response.data);
          if(!Number.isSafeInteger(nextRevision)||nextRevision<=expectedRevision)throw new Error('O servidor não retornou uma confirmação válida. A cópia permanece pendente.');
          await acceptSaved(scope,attempt,target,nextRevision);confirmed=true;break;
        }
        // Read back even on a lost response. A transaction may have committed
        // before the network failed; equal changes are acknowledged, not resent.
        let remote;
        try { remote=await loadRemote(scope); }
        catch (_) { throw response.error; }
        const merged=rebaseChanges(attempt.base,attempt.desired,remote.snapshot);
        if(!merged.changed) {
          await acceptSaved(scope,attempt,remote.snapshot,remote.revision);confirmed=true;mode='supabase-verified';break;
        }
        if(!String(response.error.message||'').includes('WEFROTAS_REVISION_CONFLICT'))throw response.error;
        source=remote.snapshot;target=merged.snapshot;expectedRevision=remote.revision;mode='supabase-rebased';
      }
      if(!confirmed)throw Object.assign(new Error('A base mudou durante as tentativas de gravação. A cópia permanece pendente; tente novamente.'),{code:409});
      finalMode=mode;
    }
    if(pendingRecord)throw new Error('Há novas alterações aguardando envio. A confirmação ainda está pendente.');
    return{mode:finalMode,revision,workspaceId:scope.workspaceId,updatedAt:String(revision)};
  }

  async function adoptRemoteOrUploadLocal() {
    const scope=captureContext();
    return serialize(scope,async()=>{
      pendingRecord=readJournal(scope);
      const local=core.normalizeSnapshot(pendingRecord?.desired || snapshotGetter?.() || {});
      const preMigrationBackupKey=preservePreMigrationCopy(scope,local);
      const otherJournals=otherTenantJournals(scope);
      if(otherJournals.length) {
        throw Object.assign(new Error('Existem alterações pendentes em outra aba ou sessão deste usuário. As cópias foram preservadas; revise a recuperação antes de carregar a base online.'),{code:409,reconciliationRequired:true,pendingJournals:otherJournals,backupKey:preMigrationBackupKey});
      }
      if(hasLegacyPending(scope)) {
        // A legacy boolean cannot establish which rows this browser edited.
        // Preserve a verified recovery copy and stop rather than infer deletions.
        const key=`wefrotas:legacy-pending:${scope.organizationId}:${journalClientId}`;
        const backup=JSON.stringify({createdAt:new Date().toISOString(),organizationId:scope.organizationId,localSnapshot:local,
          legacyConfirmedBase:localStorage.getItem(scope.formerBaseKey),legacyConfirmedVersion:localStorage.getItem(scope.formerVersionKey)});
        if(!localStorage.getItem(key)){localStorage.setItem(key,backup);if(localStorage.getItem(key)!==backup)throw new Error('Backup da cópia antiga não confirmado.');}
        throw Object.assign(new Error('Há alterações locais antigas pendentes. A cópia foi preservada e precisa de revisão antes de carregar a base online.'),{code:409,reconciliationRequired:true,backupKey:key});
      }
      let remote;
      try { remote=await loadRemote(scope); }
      catch(error) {
        assertContext(scope);
        if(!pendingRecord)throw error;
        baseSnapshot=clone(pendingRecord.base);revision=pendingRecord.revision;snapshotReady=true;
        await applyToScreen(scope,pendingRecord.desired);
        emitStatus('error','Cópia local recuperada. As alterações ainda aguardam confirmação do servidor.',{error});
        return{mode:'local-pending',snapshot:clone(pendingRecord.desired),revision,error};
      }
      if(pendingRecord) {
        baseSnapshot=clone(pendingRecord.base);revision=pendingRecord.revision;snapshotReady=true;
        await applyToScreen(scope,pendingRecord.desired);
        try {
          if(!hasPermission('syncSnapshot'))throw Object.assign(new Error('Sua cópia pendente foi preservada; este perfil não pode enviá-la.'),{code:403});
          const result=await flushPending(scope);
          await subscribeRealtime(scope);
          emitStatus('online','Alterações recuperadas e confirmadas no Supabase.');
          return{...result,snapshot:clone(baseSnapshot)};
        } catch(error) {
          assertContext(scope);
          await subscribeRealtime(scope);
          emitStatus('error','A cópia local permanece pendente para revisão ou nova tentativa.',{error});
          return{mode:'local-pending',snapshot:clone(pendingRecord?.desired||local),revision,error};
        }
      }
      const counts=core.countSnapshot(remote.snapshot);
      if(!Object.values(counts).some(Boolean)&&!remote.snapshot?.administrations?.length&&!remote.initialized) {
        snapshotReady=false;
        throw Object.assign(new Error('O Supabase ainda não possui uma base importada para esta empresa. A cópia local foi preservada.'),{code:412});
      }
      baseSnapshot=clone(remote.snapshot);revision=remote.revision;
      await applyToScreen(scope,remote.snapshot);snapshotReady=true;
      await subscribeRealtime(scope);
      emitStatus('online','Dados da empresa carregados do Supabase.');
      return{mode:'supabase-authoritative',snapshot:clone(remote.snapshot),revision};
    });
  }

  async function syncNow(snapshotValue = snapshotGetter?.()) {
    const scope=captureContext();
    assertPermission('syncSnapshot');
    if(applyingSnapshot)throw new Error('Aguarde a aplicação da versão confirmada antes de salvar.');
    stageSnapshot(scope,snapshotValue);
    clearTimeout(syncTimer);syncTimer=null;
    return serialize(scope,async()=>{
      try{const result=await flushPending(scope);emitStatus('online','Alterações confirmadas no Supabase.');return result;}
      catch(error){if(isCurrentContext(scope))emitStatus('error','Falha ao salvar no Supabase. A cópia local permanece pendente.',{error});throw error;}
    });
  }

  function queueSnapshot(snapshotValue) {
    if(!snapshotReady||applyingSnapshot)return;
    const scope=captureContext();
    stageSnapshot(scope,snapshotValue||snapshotGetter?.()||{});
    clearTimeout(syncTimer);
    syncTimer=setTimeout(()=>{
      syncTimer=null;
      serialize(scope,()=>flushPending(scope)).then(()=>{
        if(isCurrentContext(scope))emitStatus('online','Alterações confirmadas no Supabase.');
      }).catch(error=>{if(isCurrentContext(scope))emitStatus('error','A cópia local permanece pendente de sincronização.',{error});});
    },600);
  }

  async function refreshChanges(scope) {
    assertContext(scope);
    if(!snapshotReady||!baseSnapshot)throw new Error('A base ainda não foi carregada.');
    const {data,error}=await ensureClient().rpc('wefrotas_load_changes',{target_organization_id:scope.organizationId,after_revision:revision});
    assertContext(scope);if(error)throw error;
    const fallback=data?.requiresSnapshot?await loadRemote(scope):null;
    assertContext(scope);
    const nextRevision=Number(fallback?.revision??data?.revision);
    if(!Number.isSafeInteger(nextRevision)||nextRevision<revision)throw new Error('A atualização incremental retornou uma versão inválida.');
    if(nextRevision===revision)return{mode:'unchanged',revision};
    const remote=fallback?.snapshot||applyState(core.applyDelta(baseSnapshot,data.delta||{}),data.state||core.extractState(baseSnapshot));
    await refreshPrivateAssetUrls(remote,scope);assertContext(scope);
    if(pendingRecord) {
      const merged=rebaseChanges(pendingRecord.base,pendingRecord.desired,remote);
      persistJournal(scope,{...pendingRecord,base:clone(remote),desired:merged.snapshot,revision:nextRevision});
      baseSnapshot=clone(remote);revision=nextRevision;
      await applyToScreen(scope,merged.snapshot);
      return{mode:'local-pending',snapshot:clone(merged.snapshot),revision};
    }
    await applyToScreen(scope,remote);baseSnapshot=clone(remote);revision=nextRevision;
    emitStatus('online','Atualização recebida do Supabase.');
    return{mode:'remote-refreshed',snapshot:clone(remote),revision};
  }

  async function refreshFromServer() {
    const scope=captureContext();
    return serialize(scope,()=>refreshChanges(scope));
  }

  async function recoverFromServer({confirmed=false}={}) {
    if(!confirmed)throw new Error('Confirme a recuperação antes de substituir a cópia local.');
    const scope=captureContext();
    clearTimeout(syncTimer);syncTimer=null;
    return serialize(scope,async()=>{
      const local=clone(snapshotGetter?.()||{}), journal=pendingRecord||readJournal(scope), remote=await loadRemote(scope);
      const backup={version:'wefrotas-supabase-recovery-v1',createdAt:new Date().toISOString(),organizationId:scope.organizationId,workspaceId:scope.workspaceId,localSnapshot:local,pendingJournal:journal,otherPendingJournals:otherTenantJournals(scope),
        legacyConfirmedBase:localStorage.getItem(scope.formerBaseKey),legacyConfirmedVersion:localStorage.getItem(scope.formerVersionKey),serverSnapshot:remote.snapshot};
      backup.differingFields=[...new Set([...Object.keys(local),...Object.keys(remote.snapshot)])].filter(key=>!core.equal(local[key],remote.snapshot[key]));
      const key=`wefrotas:recovery:${scope.organizationId}:${Date.now()}`, serialized=JSON.stringify(backup);
      localStorage.setItem(key,serialized);if(localStorage.getItem(key)!==serialized)throw new Error('Backup não confirmado. Recuperação cancelada.');
      await applyToScreen(scope,remote.snapshot);
      baseSnapshot=clone(remote.snapshot);revision=remote.revision;clearJournal(scope);localStorage.removeItem(scope.legacyKey);localStorage.removeItem(scope.formerPendingKey);snapshotReady=true;
      await subscribeRealtime(scope);
      emitStatus('online','Cópia do servidor carregada. As versões anteriores estão preservadas no backup.');
      return{backup,backupKey:key};
    });
  }

  async function inspectPendingReconciliation() {
    const scope=captureContext(),remote=await loadRemote(scope),local=pendingRecord?.desired||snapshotGetter?.()||{};
    return{createdAt:new Date().toISOString(),revision,remoteRevision:remote.revision,delta:core.diffSnapshots(remote.snapshot,local),localSnapshot:clone(local),serverSnapshot:clone(remote.snapshot),pendingJournal:clone(pendingRecord||readJournal(scope)),otherPendingJournals:otherTenantJournals(scope),legacyConfirmedBase:localStorage.getItem(scope.formerBaseKey)};
  }

  async function updateAuthenticatedUserName(name) {
    const normalized=String(name||'').trim().replace(/\s+/g,' ');
    if(normalized.length<2) throw new Error('Informe um nome com pelo menos 2 caracteres.');
    const {data,error}=await ensureClient().auth.updateUser({data:{name:normalized}});if(error)throw error;
    currentUser=normalizeUser(data.user);return currentUser;
  }

  function execution(body,status=200){return{status:status>=400?'failed':'completed',responseStatusCode:status,responseBody:JSON.stringify(body),errors:status>=400?body.error||'Erro':''};}

  async function callAdminFunction(payload) {
    const {data,error}=await ensureClient().functions.invoke(config.adminFunction||'wefrotas-admin',{
      body:{...payload,organizationId:payload.organizationId||organizationContext.id}
    });
    if(error) throw error; return data;
  }

  async function executeAdministrativeFunction(payload={}) {
    try {
      let body;
      if(payload.action==='my-access') body={ok:true,...await resolveMyAccess()};
      else if(payload.action==='wefrotas-snapshot-save') body={ok:true,...await syncNow(payload.snapshot)};
      else if(payload.action==='wefrotas-session-presence') {
        assertOrganization();
        const row={organization_id:organizationContext.id,connection_id:payload.connectionId,user_id:currentUser.id,browser:String(payload.browser||''),system:String(payload.system||''),active:payload.phase!=='close'&&payload.active!==false,last_seen_at:new Date().toISOString(),closed_at:payload.phase==='close'?new Date().toISOString():null};
        const {error}=await ensureClient().from('wefrotas_session_presence').upsert(row,{onConflict:'organization_id,connection_id'});if(error)throw error;body={ok:true};
      } else if(payload.action==='central-record-update') body={ok:true,record:await updateCentralPendingRecord(payload.recordId,payload)};
      else if(payload.action==='central-record-approve' || payload.action==='central-finance-append') {
        assertPermission('approveRecords');
        const scope=captureContext();
        const {data,error}=await ensureClient().rpc('wefrotas_approve_central_record',{
          target_organization_id:scope.organizationId,record_id:String(payload.centralRecordId||payload.recordId||''),finance_entry:payload.entry
        });
        assertContext(scope);if(error)throw error;body={ok:true,...data};
      }
      else if(payload.action==='central-record-delete') {await deleteCentralPendingRecord(payload.recordId);body={ok:true};}
      else if(payload.action==='central-banner-delete') {await deleteCentralHomeBanner(payload.rowId);body={ok:true};}
      else body=await callAdminFunction(payload);
      return execution(body,200);
    } catch(error){return execution({ok:false,error:error.message,code:error.code||500,type:error.name||''},Number(error.code)||500);}
  }

  async function uploadFile(file,kind) {
    assertPermission('manageOperations');
    const safe=String(file?.name||'arquivo').replace(/[^a-zA-Z0-9._-]+/g,'-');
    const path=`${organizationContext.id}/${kind}/${crypto.randomUUID()}-${safe}`;
    const store=ensureClient().storage.from(config.assetsBucket||'wefrotas-assets');
    const {error}=await store.upload(path,file,{upsert:false,contentType:file.type||undefined});if(error)throw error;
    const {data:signed,error:signedError}=await store.createSignedUrl(path,31536000);if(signedError)throw signedError;
    return {fileId:path,storagePath:path,imageUrl:signed.signedUrl,url:signed.signedUrl};
  }

  async function deleteFile(path) {
    if(!path)return true;assertPermission('manageSettings');
    const {error}=await ensureClient().storage.from(config.assetsBucket||'wefrotas-assets').remove([path]);if(error)throw error;return true;
  }

  async function listCentralPendingRecords(limit=150) {
    const scope=captureContext();const {data,error,count}=await ensureClient().from('wefrotas_central_records').select('*',{count:'exact'}).eq('organization_id',scope.organizationId).order('occurred_at',{ascending:false}).limit(Math.min(500,Math.max(1,Number(limit)||150)));
    assertContext(scope);if(error)throw error;
    const rows=(data||[]).map(row=>({...row.data,$id:row.entity_id,id:row.entity_id,workspaceId:scope.workspaceId,status:row.status}));
    return{rows,total:Number(count) || rows.length};
  }

  async function updateCentralPendingRecord(id,patch={}) {
    assertPermission('approveRecords');
    const scope=captureContext();
    const current=(await ensureClient().from('wefrotas_central_records').select('*').eq('organization_id',scope.organizationId).eq('entity_id',id).single());
    assertContext(scope);if(current.error)throw current.error;
    const changes={...patch};delete changes.action;delete changes.recordId;
    const {data:saved,error}=await ensureClient().rpc('wefrotas_update_central_record',{
      target_organization_id:scope.organizationId,record_id:String(id),patch:changes,expected_status:current.data.status
    });
    assertContext(scope);if(error)throw error;
    const row=saved?.record||saved;
    return{...(row?.data||row),$id:row?.entity_id||row?.id||String(id)};
  }

  async function deleteCentralPendingRecord(id) {
    assertPermission('deleteRecords');const scope=captureContext();
    const{error}=await ensureClient().rpc('wefrotas_delete_central_record',{target_organization_id:scope.organizationId,record_id:String(id)});
    assertContext(scope);if(error)throw error;return true;
  }

  async function listCentralHomeBanners(){const scope=captureContext();const{data,error}=await ensureClient().from('wefrotas_banners').select('*').eq('organization_id',scope.organizationId).order('sort_order');assertContext(scope);if(error)throw error;const banners=(data||[]).map(row=>({...row.data,$id:row.entity_id,id:row.entity_id}));await refreshPrivateAssetUrls({banners},scope);return banners;}
  async function upsertBanner(value={}){
    assertPermission('manageSettings');const scope=captureContext();
    if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Os dados do banner são inválidos.');
    const id=String(value.id||value.$id||crypto.randomUUID());const row={organization_id:scope.organizationId,entity_id:id,active:value.active!==false,sort_order:Number(value.sortOrder)||0,data:{...value,id}};
    const{data,error}=await ensureClient().from('wefrotas_banners').upsert(row,{onConflict:'organization_id,entity_id'}).select().single();assertContext(scope);if(error)throw error;return{...data.data,$id:id};
  }
  async function upsertCentralHomeBanner(rowId,value) {
    // Existing screens pass (rowId, data), while create passes one object.
    if(arguments.length===1)return upsertBanner(rowId);
    assertPermission('manageSettings');
    if(typeof rowId!=='string'||!rowId.trim())throw new Error('O identificador do banner é inválido.');
    if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Os dados do banner são inválidos.');
    return upsertBanner({...value,id:rowId,$id:rowId});
  }
  async function updateCentralHomeBanner(id,patch={}) {
    assertPermission('manageSettings');const scope=captureContext();
    const {data,error}=await ensureClient().from('wefrotas_banners').select('*').eq('organization_id',scope.organizationId).eq('entity_id',String(id)).single();
    assertContext(scope);if(error)throw error;
    return upsertBanner({...data.data,...patch,id:String(id),$id:String(id)});
  }
  async function deleteCentralHomeBanner(id){assertPermission('manageSettings');if(typeof id!=='string'||!id.trim())throw new Error('O identificador do banner é inválido.');const scope=captureContext();const{error}=await ensureClient().from('wefrotas_banners').delete().eq('organization_id',scope.organizationId).eq('entity_id',id);assertContext(scope);if(error)throw error;return true;}

  async function syncCentralDriverDirectory(snapshotValue=snapshotGetter?.()||{}) {
    assertPermission('syncSnapshot');
    const snapshot=core.normalizeSnapshot(snapshotValue);const vehicles=new Map(snapshot.vehicles.map(v=>[String(v.id),v]));const rows=[];
    for(const driver of snapshot.drivers){const ids=Array.isArray(driver.vehicleIds)?driver.vehicleIds:(driver.vehicleId?[driver.vehicleId]:snapshot.vehicles.filter(v=>String(v.motoristaId||v.driverId||'')===String(driver.id)).map(v=>v.id));for(const vehicleId of ids.length?ids:['']){const vehicle=vehicles.get(String(vehicleId));const entityId=`${driver.id}:${vehicleId||'without-vehicle'}`;rows.push({organization_id:organizationContext.id,entity_id:entityId,driver_id:String(driver.id),vehicle_id:String(vehicleId||''),active:driver.ativo!==false&&(!vehicle||vehicle.ativo!==false),data:{id:entityId,driverId:driver.id,driverName:driver.nome||'',vehicleId:vehicleId||'',vehiclePlate:vehicle?.placa||'',vehicleFleetNumber:vehicle?.numeroFrota||'',vehicleModel:vehicle?.modelo||''}});}}
    if(rows.length){const{error}=await ensureClient().from('wefrotas_central_driver_directory').upsert(rows,{onConflict:'organization_id,entity_id'});if(error)throw error;}return rows;
  }

  global.WeFrotasBackend=Object.freeze({
    config,isConfigured,initialize,signIn,signOut,setOrganizationContext,isSnapshotReady:()=>snapshotReady&&!applyingSnapshot,isContingencyMode:()=>false,
    isDatabaseReadQuotaError:()=>false,getOrganizationContext:()=>organizationContext,getUser:()=>currentUser,updateAuthenticatedUserName,
    executeAdministrativeFunction,getAccessRole,hasPermission,loadRemoteSnapshot:async()=> (await loadRemote()).snapshot,
    adoptRemoteOrUploadLocal,queueSnapshot,syncNow,recoverFromServer,refreshFromServer,inspectPendingReconciliation,
    reconcileSelectedPending:async()=>{throw new Error('Recarregue a versão Supabase e reaplique manualmente apenas as alterações desejadas.');},
    uploadReceipt:file=>uploadFile(file,'receipts'),uploadVehicleImage:file=>uploadFile(file,'vehicles'),
    listCentralPendingRecords,updateCentralPendingRecord,deleteCentralPendingRecord,
    uploadCentralBanner:file=>uploadFile(file,'banners'),deleteCentralBannerFile:deleteFile,
    uploadCentralCityImage:file=>uploadFile(file,'cities'),deleteCentralCityImage:deleteFile,
    listCentralHomeBanners,createCentralHomeBanner:upsertBanner,upsertCentralHomeBanner,updateCentralHomeBanner,deleteCentralHomeBanner,
    syncCentralDriverDirectory
  });
})(window);
