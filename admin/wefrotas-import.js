(function(){
  'use strict';
  const config=window.GAVEBLUE_SUPABASE_CONFIG||{};
  const fileInput=document.getElementById('backup-file'),organizations=document.getElementById('organization');
  const candidatesNode=document.getElementById('candidates'),importButton=document.getElementById('import'),resultNode=document.getElementById('result');
  const entityKeys=['vehicles','drivers','suppliers','centralCities','orders','finance','deletedOrders','notifications'];
  let client=null,candidates=[];
  const counts=snapshot=>Object.fromEntries(entityKeys.map(key=>[key,Array.isArray(snapshot?.[key])?snapshot[key].length:0]));
  const validSnapshot=value=>value&&typeof value==='object'&&!Array.isArray(value)&&entityKeys.some(key=>Array.isArray(value[key]));
  const addCandidate=(list,source,key,variant,updatedAt,workspaceId,snapshot)=>{if(validSnapshot(snapshot))list.push({source,key,variant,updatedAt:String(updatedAt||''),workspaceId:String(workspaceId||''),snapshot,counts:counts(snapshot)});};
  function extract(document){
    const list=[];
    for(const item of document.localStorageBefore||[]){const value=item.decoded||{};addCandidate(list,'localStorage',item.key,'snapshot',value.updatedAt,value.workspaceId,value.snapshot);addCandidate(list,'localStorage',item.key,'localSnapshot',value.createdAt,value.workspaceId,value.localSnapshot);addCandidate(list,'localStorage',item.key,'serverSnapshot',value.createdAt,value.workspaceId,value.serverSnapshot);}
    for(const item of document.indexedDB||[]){const row=item.value||item.decoded||{};const workspace=String(item.key||'').split(':').at(-1);addCandidate(list,'IndexedDB',item.key,'working',row.updatedAt,workspace,row.value);}
    const seen=new Set();return list.filter(item=>{const signature=JSON.stringify(item.snapshot);if(seen.has(signature))return false;seen.add(signature);return true;}).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
  }
  function renderCandidates(){
    candidatesNode.innerHTML=candidates.length?candidates.map((item,index)=>`<label class="candidate"><input type="radio" name="candidate" value="${index}"><strong>${item.source} · ${item.variant}</strong><small>${item.workspaceId||'workspace não informado'} · ${item.updatedAt||'sem data'}</small><small>${Object.entries(item.counts).map(([key,value])=>`${key}: ${value}`).join(' · ')}</small></label>`).join(''):'<p>Nenhuma versão operacional válida encontrada.</p>';
    candidatesNode.querySelectorAll('input').forEach(input=>input.addEventListener('change',()=>{importButton.disabled=!organizations.value;}));
  }
  async function sha256(value){const bytes=new TextEncoder().encode(JSON.stringify(value));const hash=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(hash)).map(byte=>byte.toString(16).padStart(2,'0')).join('');}
  async function initialize(){
    if(!config.url||!config.anonKey||!window.supabase){resultNode.textContent='Configuração Supabase indisponível.';return;}
    client=window.supabase.createClient(config.url,config.anonKey,{auth:{persistSession:true,autoRefreshToken:true}});
    const{data:{session}}=await client.auth.getSession();if(!session){resultNode.textContent='Entre primeiro no painel administrativo.';organizations.innerHTML='<option value="">Sessão administrativa ausente</option>';return;}
    const{data,error}=await client.from('organizations').select('id,name,slug').order('name');if(error){resultNode.textContent=error.message;return;}
    organizations.innerHTML='<option value="">Selecione a empresa</option>'+data.map(item=>`<option value="${item.id}" data-workspace="${item.slug}">${item.name}</option>`).join('');
  }
  fileInput.addEventListener('change',async()=>{try{const file=fileInput.files?.[0];if(!file)return;candidates=extract(JSON.parse(await file.text()));renderCandidates();resultNode.textContent=`${candidates.length} versão(ões) independentes encontradas. Escolha uma explicitamente.`;}catch(error){candidates=[];renderCandidates();resultNode.textContent=`Backup inválido: ${error.message}`;}});
  organizations.addEventListener('change',()=>{importButton.disabled=!organizations.value||!candidatesNode.querySelector('input:checked');});
  importButton.addEventListener('click',async()=>{
    const selected=candidates[Number(candidatesNode.querySelector('input:checked')?.value)];if(!selected||!organizations.value)return;
    const option=organizations.selectedOptions[0],expectedWorkspace=option.dataset.workspace||'';
    if(selected.workspaceId&&expectedWorkspace&&selected.workspaceId!==expectedWorkspace){resultNode.textContent=`BLOQUEADO: a versão pertence a ${selected.workspaceId}, mas a empresa escolhida usa ${expectedWorkspace}.`;return;}
    importButton.disabled=true;try{
      const hash=await sha256(selected.snapshot),importKey=`rescue-${selected.updatedAt||'undated'}-${hash.slice(0,16)}`;
      const{data,error}=await client.rpc('wefrotas_import_snapshot',{target_organization_id:organizations.value,p_import_key:importKey,source_updated_at:selected.updatedAt||null,snapshot:selected.snapshot});if(error)throw error;
      const{data:loaded,error:loadError}=await client.rpc('wefrotas_load_snapshot',{target_organization_id:organizations.value});if(loadError)throw loadError;
      const destination=counts(loaded?.snapshot||{}),matches=entityKeys.every(key=>destination[key]===selected.counts[key]);
      resultNode.textContent=JSON.stringify({ok:matches,import:data,origin:selected.counts,destination,revision:loaded?.revision,message:matches?'Contagens conferidas.':'Divergência encontrada; corte bloqueado.'},null,2);
    }catch(error){resultNode.textContent=`Importação não confirmada: ${error.message}`;}finally{importButton.disabled=false;}
  });
  window.WeFrotasImportTools=Object.freeze({extract,counts});
  initialize();
})();
