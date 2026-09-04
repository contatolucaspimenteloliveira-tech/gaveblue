(function createWeFrotasSupabaseBackend(global) {
  'use strict';

  const config = global.WEFROTAS_SUPABASE_CONFIG || {};
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

  function isConfigured() {
    return Boolean(config.url && config.anonKey && core && global.supabase?.createClient);
  }

  function ensureClient() {
    if (!isConfigured()) throw new Error('O Supabase do WeFrotas ainda não foi configurado.');
    if (!client) client = global.supabase.createClient(config.url, config.anonKey, {
      auth: { persistSession:true, autoRefreshToken:true, detectSessionInUrl:true },
      realtime: { params: { eventsPerSecond: 20 } }
    });
    return client;
  }

  function normalizeUser(user) {
    if (!user) return null;
    return {
      ...user, $id:user.id, email:user.email || '',
      name:user.user_metadata?.name || user.user_metadata?.full_name || String(user.email || '').split('@')[0] || 'Usuário',
      labels:[MEMBER_ROLES[organizationContext.role] || 'wefrotas-consulta']
    };
  }

  function emitStatus(state, message, extra = {}) {
    statusListener?.({ state, message, user:currentUser, ...extra });
  }

  function pendingKey() {
    return organizationContext.id ? `wefrotas_supabase_pending:${organizationContext.id}` : '';
  }

  function setPending(value) {
    const key = pendingKey();
    if (!key) return;
    if (value) localStorage.setItem(key,'1'); else localStorage.removeItem(key);
  }

  function hasPending() {
    const key = pendingKey();
    return Boolean(key && localStorage.getItem(key) === '1');
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
    clearTimeout(syncTimer); syncTimer = null;
    clearTimeout(remoteRefreshTimer); remoteRefreshTimer = null;
    if (channel) await ensureClient().removeChannel(channel).catch(()=>{});
    if (centralChannel) await ensureClient().removeChannel(centralChannel).catch(()=>{});
    await ensureClient().auth.signOut({ scope:'local' });
    currentUser = null; baseSnapshot = null; revision = 0; snapshotReady = false;
    organizationContext = Object.freeze({ id:'',workspaceId:'',role:'',modules:[],limits:{} });
    emitStatus('signed-out','Sessão encerrada.');
  }

  function setOrganizationContext(value = {}) {
    if (!value.id || !value.workspaceId) throw new Error('A empresa autorizada possui contexto inválido.');
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
      db.from('organizations').select('id,slug,name,status,appwrite_workspace_id,logo_url,primary_color,secondary_color').eq('id',member.organization_id).single(),
      db.from('organization_modules').select('module_key,enabled').eq('organization_id',member.organization_id),
      db.from('organization_subscriptions').select('status,max_users,max_vehicles,max_devices,plans(max_users,max_vehicles,max_devices)').eq('organization_id',member.organization_id).maybeSingle()
    ]);
    if (orgError) throw orgError; if (moduleError) throw moduleError; if (subscriptionError) throw subscriptionError;
    if (organization.status !== 'active' || !['active','trial'].includes(subscription?.status || '')) throw Object.assign(new Error('A empresa ou assinatura está inativa.'),{code:403});
    const enabledModules=(modules||[]).filter(item=>item.enabled).map(item=>item.module_key);
    const limits={users:subscription?.max_users||subscription?.plans?.max_users||0,vehicles:subscription?.max_vehicles||subscription?.plans?.max_vehicles||0,devices:subscription?.max_devices||subscription?.plans?.max_devices||0};
    return {
      role:MEMBER_ROLES[member.role]||'wefrotas-consulta',
      organization:{ id:organization.id,slug:organization.slug,name:organization.name,workspaceId:organization.appwrite_workspace_id,
        appwriteLabel:'supabase',appwriteRoleLabel:'supabase',appwriteManagerLabels:['supabase'],modules:enabledModules,limits,
        branding:{logoUrl:organization.logo_url||'',primaryColor:organization.primary_color||'#2563eb',secondaryColor:organization.secondary_color||'#7c3aed'} }
    };
  }

  async function loadRemote() {
    assertOrganization();
    const { data,error } = await ensureClient().rpc('wefrotas_load_snapshot',{target_organization_id:organizationContext.id});
    if (error) throw error;
    return { revision:Number(data?.revision)||0, updatedAt:data?.updatedAt||'', snapshot:core.normalizeSnapshot(data?.snapshot||{}) };
  }

  async function subscribeRealtime() {
    if (channel) await ensureClient().removeChannel(channel).catch(()=>{});
    const db=ensureClient();
    const filter=`organization_id=eq.${organizationContext.id}`;
    channel=db.channel(`wefrotas:${organizationContext.id}:${crypto.randomUUID()}`);
    for (const [key,table] of Object.entries(core.ENTITY_TABLES)) {
      channel.on('postgres_changes',{event:'*',schema:'public',table,filter},async(payload)=>{
        if (hasPending()) return;
        const row=payload.eventType==='DELETE'?payload.old:payload.new;
        baseSnapshot=core.applyRealtimeEntity(baseSnapshot||snapshotGetter?.()||{},key,payload.eventType,row);
        await snapshotApplier?.(clone(baseSnapshot));
        emitStatus('online','Atualização recebida do Supabase.');
      });
    }
    channel.on('postgres_changes',{event:'UPDATE',schema:'public',table:'wefrotas_workspace_state',filter},(payload)=>{
      const announcedRevision=Number(payload?.new?.revision)||0;
      if(announcedRevision<=revision)return;
      clearTimeout(remoteRefreshTimer);
      const refresh=async()=>{
        if(hasPending()){remoteRefreshTimer=setTimeout(refresh,350);return;}
        try{
          const remote=await loadRemote();
          if(remote.revision<announcedRevision)return;
          baseSnapshot=clone(remote.snapshot);revision=remote.revision;
          await snapshotApplier?.(clone(remote.snapshot));
          emitStatus('online','Versão mais recente carregada do Supabase.');
        }catch(error){emitStatus('error','Não foi possível atualizar a versão recebida do Supabase.',{error});}
      };
      remoteRefreshTimer=setTimeout(refresh,180);
    });
    channel.subscribe();
  }

  async function adoptRemoteOrUploadLocal() {
    const remote=await loadRemote();
    const counts=core.countSnapshot(remote.snapshot);
    const hasRemoteData=Object.values(counts).some(Boolean);
    if (!hasRemoteData && !remote.snapshot?.administrations?.length) {
      snapshotReady=false;
      throw Object.assign(new Error('O Supabase ainda não possui uma base importada para esta empresa. A cópia local foi preservada.'),{code:412});
    }
    baseSnapshot=clone(remote.snapshot); revision=remote.revision;
    await snapshotApplier?.(clone(remote.snapshot));
    snapshotReady=true; setPending(false); await subscribeRealtime();
    emitStatus('online','Dados da empresa carregados do Supabase.');
    return {mode:'supabase-authoritative',snapshot:clone(remote.snapshot),revision};
  }

  async function syncNow(snapshotValue = snapshotGetter?.()) {
    assertPermission('syncSnapshot');
    if (!snapshotReady || !baseSnapshot) throw Object.assign(new Error('A base Supabase ainda não foi confirmada. Nenhuma alteração foi enviada.'),{code:412});
    const desired=core.normalizeSnapshot(snapshotValue||{});
    const delta=core.diffSnapshots(baseSnapshot,desired);
    const state=core.extractState(desired);
    if (!core.hasDelta(delta) && core.equal(core.extractState(baseSnapshot),state)) return {mode:'unchanged',revision};
    setPending(true); emitStatus('syncing','Salvando alterações no Supabase...');
    let {data,error}=await ensureClient().rpc('wefrotas_apply_snapshot_delta',{
      target_organization_id:organizationContext.id,expected_revision:revision,delta,next_state:state
    });
    if (error) {
      const conflict=String(error.message||'').includes('WEFROTAS_REVISION_CONFLICT');
      if(conflict){
        const remote=await loadRemote();
        const remoteDelta=core.diffSnapshots(baseSnapshot,remote.snapshot);
        const remoteState=core.extractState(remote.snapshot);
        const baseState=core.extractState(baseSnapshot);
        const localStateChanged=!core.equal(baseState,state);
        const remoteStateChanged=!core.equal(baseState,remoteState);
        if(core.deltasOverlap(delta,remoteDelta)||(localStateChanged&&remoteStateChanged&&!core.equal(state,remoteState))){
          emitStatus('error','Conflito no mesmo registro detectado. A cópia local foi preservada para revisão.',{error});
          error.code=409;throw error;
        }
        const rebasedSnapshot=core.applyDelta(remote.snapshot,delta);
        const rebasedState=localStateChanged?state:remoteState;
        ({data,error}=await ensureClient().rpc('wefrotas_apply_snapshot_delta',{
          target_organization_id:organizationContext.id,expected_revision:remote.revision,delta,next_state:rebasedState
        }));
        if(!error){
          Object.assign(rebasedSnapshot,rebasedState.settings,{orderCounter:rebasedState.orderCounter});
          revision=Number(data);baseSnapshot=clone(rebasedSnapshot);setPending(false);
          emitStatus('online','Alterações conciliadas e confirmadas no Supabase.');
          return{mode:'supabase-rebased',revision,workspaceId:organizationContext.workspaceId,updatedAt:String(revision)};
        }
      }
      emitStatus('error','Falha ao salvar no Supabase. A cópia local permanece pendente.',{error});
      throw error;
    }
    revision=Number(data); baseSnapshot=clone(desired); setPending(false);
    emitStatus('online','Alterações confirmadas no Supabase.');
    return {mode:'supabase-saved',revision,workspaceId:organizationContext.workspaceId,updatedAt:String(revision)};
  }

  function queueSnapshot(snapshotValue) {
    if (!snapshotReady) return;
    const desired=clone(snapshotValue||snapshotGetter?.()||{});
    setPending(true); clearTimeout(syncTimer);
    syncTimer=setTimeout(()=>{syncChain=syncChain.then(()=>syncNow(desired)).catch(error=>console.warn('Sincronização Supabase pendente.',error));},600);
  }

  async function refreshFromServer() {
    assertOrganization();
    if (hasPending()) return {mode:'local-pending',snapshot:snapshotGetter?.()};
    const remote=await loadRemote(); baseSnapshot=clone(remote.snapshot); revision=remote.revision;
    await snapshotApplier?.(clone(remote.snapshot)); snapshotReady=true;
    return {mode:'remote-refreshed',snapshot:clone(remote.snapshot),revision};
  }

  async function recoverFromServer({confirmed=false}={}) {
    if (!confirmed) throw new Error('Confirme a recuperação antes de substituir a cópia local.');
    const local=clone(snapshotGetter?.()||{}); const remote=await loadRemote();
    const backup={version:'wefrotas-supabase-recovery-v1',createdAt:new Date().toISOString(),organizationId:organizationContext.id,workspaceId:organizationContext.workspaceId,localSnapshot:local,serverSnapshot:remote.snapshot};
    const key=`wefrotas:recovery:${organizationContext.id}:${Date.now()}`; const serialized=JSON.stringify(backup);
    localStorage.setItem(key,serialized); if(localStorage.getItem(key)!==serialized) throw new Error('Backup não confirmado. Recuperação cancelada.');
    baseSnapshot=clone(remote.snapshot);revision=remote.revision;await snapshotApplier?.(clone(remote.snapshot));setPending(false);snapshotReady=true;
    return {backup,backupKey:key};
  }

  async function inspectPendingReconciliation() {
    const remote=await loadRemote();
    return {createdAt:new Date().toISOString(),revision,remoteRevision:remote.revision,delta:core.diffSnapshots(remote.snapshot,snapshotGetter?.()||{}),localSnapshot:clone(snapshotGetter?.()||{}),serverSnapshot:clone(remote.snapshot)};
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
      else if(payload.action==='central-record-delete') {await deleteCentralPendingRecord(payload.recordId);body={ok:true};}
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
    assertOrganization();const {data,error}=await ensureClient().from('wefrotas_central_records').select('*').eq('organization_id',organizationContext.id).order('occurred_at',{ascending:false}).limit(Math.min(500,Math.max(1,Number(limit)||150)));if(error)throw error;
    return (data||[]).map(row=>({...row.data,$id:row.entity_id,id:row.entity_id,workspaceId:organizationContext.workspaceId,status:row.status}));
  }

  async function updateCentralPendingRecord(id,patch={}) {
    assertPermission('approveRecords');
    const current=(await ensureClient().from('wefrotas_central_records').select('*').eq('organization_id',organizationContext.id).eq('entity_id',id).single());if(current.error)throw current.error;
    const data={...current.data.data,...patch};delete data.action;delete data.recordId;
    const row={organization_id:organizationContext.id,entity_id:String(id),record_type:String(data.type||data.recordType||current.data.record_type||''),status:String(data.status||current.data.status||'pendente'),occurred_at:data.createdAt||data.date||current.data.occurred_at,data};
    const {data:saved,error}=await ensureClient().from('wefrotas_central_records').upsert(row,{onConflict:'organization_id,entity_id'}).select().single();if(error)throw error;return{...saved.data,$id:saved.entity_id};
  }

  async function deleteCentralPendingRecord(id) {assertPermission('deleteRecords');const{error}=await ensureClient().from('wefrotas_central_records').delete().eq('organization_id',organizationContext.id).eq('entity_id',String(id));if(error)throw error;return true;}

  async function listCentralHomeBanners(){assertOrganization();const{data,error}=await ensureClient().from('wefrotas_banners').select('*').eq('organization_id',organizationContext.id).order('sort_order');if(error)throw error;return(data||[]).map(row=>({...row.data,$id:row.entity_id,id:row.entity_id}));}
  async function upsertBanner(value={}){assertPermission('manageSettings');const id=String(value.id||value.$id||crypto.randomUUID());const row={organization_id:organizationContext.id,entity_id:id,active:value.active!==false,sort_order:Number(value.sortOrder)||0,data:{...value,id}};const{data,error}=await ensureClient().from('wefrotas_banners').upsert(row,{onConflict:'organization_id,entity_id'}).select().single();if(error)throw error;return{...data.data,$id:id};}
  async function deleteCentralHomeBanner(id){assertPermission('manageSettings');const{error}=await ensureClient().from('wefrotas_banners').delete().eq('organization_id',organizationContext.id).eq('entity_id',String(id));if(error)throw error;return true;}

  async function syncCentralDriverDirectory(snapshotValue=snapshotGetter?.()||{}) {
    assertPermission('syncSnapshot');
    const snapshot=core.normalizeSnapshot(snapshotValue);const vehicles=new Map(snapshot.vehicles.map(v=>[String(v.id),v]));const rows=[];
    for(const driver of snapshot.drivers){const ids=Array.isArray(driver.vehicleIds)?driver.vehicleIds:(driver.vehicleId?[driver.vehicleId]:snapshot.vehicles.filter(v=>String(v.motoristaId||v.driverId||'')===String(driver.id)).map(v=>v.id));for(const vehicleId of ids.length?ids:['']){const vehicle=vehicles.get(String(vehicleId));const entityId=`${driver.id}:${vehicleId||'without-vehicle'}`;rows.push({organization_id:organizationContext.id,entity_id:entityId,driver_id:String(driver.id),vehicle_id:String(vehicleId||''),active:driver.ativo!==false&&(!vehicle||vehicle.ativo!==false),data:{id:entityId,driverId:driver.id,driverName:driver.nome||'',vehicleId:vehicleId||'',vehiclePlate:vehicle?.placa||'',vehicleFleetNumber:vehicle?.numeroFrota||'',vehicleModel:vehicle?.modelo||''}});}}
    if(rows.length){const{error}=await ensureClient().from('wefrotas_central_driver_directory').upsert(rows,{onConflict:'organization_id,entity_id'});if(error)throw error;}return rows;
  }

  global.WeFrotasBackend=Object.freeze({
    config,isConfigured,initialize,signIn,signOut,setOrganizationContext,isSnapshotReady:()=>snapshotReady,isContingencyMode:()=>false,
    isDatabaseReadQuotaError:()=>false,getOrganizationContext:()=>organizationContext,getUser:()=>currentUser,updateAuthenticatedUserName,
    executeAdministrativeFunction,getAccessRole,hasPermission,loadRemoteSnapshot:async()=> (await loadRemote()).snapshot,
    adoptRemoteOrUploadLocal,queueSnapshot,syncNow,recoverFromServer,refreshFromServer,inspectPendingReconciliation,
    reconcileSelectedPending:async()=>{throw new Error('Recarregue a versão Supabase e reaplique manualmente apenas as alterações desejadas.');},
    uploadReceipt:file=>uploadFile(file,'receipts'),uploadVehicleImage:file=>uploadFile(file,'vehicles'),
    listCentralPendingRecords,updateCentralPendingRecord,deleteCentralPendingRecord,
    uploadCentralBanner:file=>uploadFile(file,'banners'),deleteCentralBannerFile:deleteFile,
    uploadCentralCityImage:file=>uploadFile(file,'cities'),deleteCentralCityImage:deleteFile,
    listCentralHomeBanners,createCentralHomeBanner:upsertBanner,upsertCentralHomeBanner:upsertBanner,updateCentralHomeBanner:upsertBanner,deleteCentralHomeBanner,
    syncCentralDriverDirectory
  });
})(window);
