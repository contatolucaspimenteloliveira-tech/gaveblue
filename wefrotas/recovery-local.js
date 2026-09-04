(function(root){
  'use strict';
  const VERSION='wefrotas-local-rescue-v1', DB='wefrotas_app_storage';
  const allowedKey=key=>/^wefrotas_online_sync_(base|version|pending):[^:]+$/.test(key)||/^wefrotas:tenant:.+:snapshot$/.test(key)||/^wefrotas:(recovery|outbox|contingency):/.test(key)||/^wefrotas_(vehicles|drivers|suppliers|orders|finance|administrations|deletedOrders|orderCounter|notifications|centralCities|centralDeviceLinks)$/.test(key);
  function readLocal(storage){const rows=[];for(let i=0;i<storage.length;i++){const key=storage.key(i);if(key&&allowedKey(key))rows.push({key,raw:storage.getItem(key)});}return rows.sort((a,b)=>a.key.localeCompare(b.key));}
  async function readIndexed(indexed){
    if(!indexed||typeof indexed.databases!=='function')throw new Error('Não foi possível enumerar IndexedDB. Nenhuma base foi criada ou modificada.');
    if(!(await indexed.databases()).some(db=>db.name===DB))return [];
    return new Promise((resolve,reject)=>{const request=indexed.open(DB);
      request.onupgradeneeded=()=>request.transaction.abort();
      request.onerror=()=>reject(request.error||new Error('IndexedDB não pôde ser aberto em leitura.'));
      request.onblocked=()=>reject(new Error('Leitura bloqueada por outra aba.'));
      request.onsuccess=()=>{const db=request.result,stores=[...db.objectStoreNames],rows=[];if(!stores.length){db.close();resolve(rows);return;}
        const tx=db.transaction(stores,'readonly');tx.oncomplete=()=>{db.close();resolve(rows);};tx.onerror=tx.onabort=()=>{db.close();reject(tx.error||new Error('Leitura local interrompida.'));};
        for(const storeName of stores){const cursor=tx.objectStore(storeName).openCursor();cursor.onsuccess=()=>{const item=cursor.result;if(!item)return;rows.push({store:storeName,key:item.key,value:item.value});item.continue();};}
      };
    });
  }
  async function decode(raw){if(typeof raw!=='string')return raw;if(!raw.startsWith('gzip-base64:'))return JSON.parse(raw);const bytes=Uint8Array.from(root.atob(raw.slice(12)),c=>c.charCodeAt(0));const stream=new root.Blob([bytes]).stream().pipeThrough(new root.DecompressionStream('gzip'));return JSON.parse(await new root.Response(stream).text());}
  function describe(record,source){const key=String(record.key),value=record.decoded,variants=[],candidates=[['snapshot',value?.snapshot],['working',value?.value],['localSnapshot',value?.localSnapshot],['serverSnapshot',value?.serverSnapshot]];if(value&&Array.isArray(value.vehicles))candidates.push(['root',value]);for(const[variant,snapshot]of candidates){if(!snapshot||typeof snapshot!=='object')continue;variants.push({source,key,variant,workspaceId:value.workspaceId||null,updatedAt:value.updatedAt||value.createdAt||null,counts:Object.fromEntries(Object.entries(snapshot).filter(([,v])=>Array.isArray(v)).map(([k,v])=>[k,v.length]))});}return variants;}
  async function capture({storage=root.localStorage,indexed=root.indexedDB,origin=root.location?.origin||''}={}){
    const errors=[],startedAt=new Date().toISOString();let before=[],after=[],idb=[];
    try{before=readLocal(storage);}catch(e){errors.push({source:'localStorage.before',error:e.message});}
    try{idb=await readIndexed(indexed);}catch(e){errors.push({source:'IndexedDB',error:e.message});}
    try{after=readLocal(storage);}catch(e){errors.push({source:'localStorage.after',error:e.message});}
    const variants=[];for(const[source,records]of[['localStorage.before',before],['localStorage.after',after],['IndexedDB',idb]])for(const record of records){try{record.decoded=await decode(source==='IndexedDB'?record.value:record.raw);variants.push(...describe(record,source));}catch(e){record.decodeError=e.message;}}
    const data={version:VERSION,toolVersion:'20260904-rescue-1',origin,startedAt,exportedAt:new Date().toISOString(),database:DB,changedDuringCapture:JSON.stringify(before)!==JSON.stringify(after),consistency:'Independent local sources; no remote confirmation and no automatic winner.',errors,localStorageBefore:before,localStorageAfter:after,indexedDB:idb,variants};
    const serialized=JSON.stringify(data,null,2);JSON.parse(serialized);return{data,serialized};
  }
  const api={VERSION,allowedKey,readLocal,readIndexed,decode,describe,capture};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WeFrotasLocalRescue=Object.freeze(api);
  if(!root.document)return;let latest=null;const status=document.getElementById('status'),generate=document.getElementById('generate');
  generate.addEventListener('click',async()=>{generate.disabled=true;status.textContent='Lendo somente as cópias locais…';try{latest=await capture();document.getElementById('json').value=latest.serialized;document.getElementById('summary').textContent=JSON.stringify({errors:latest.data.errors,changedDuringCapture:latest.data.changedDuringCapture,variants:latest.data.variants},null,2);document.getElementById('download').disabled=false;status.textContent=latest.data.variants.length?'Cópias encontradas. Baixe o JSON; nenhuma versão foi escolhida ou restaurada.':'Nenhum snapshot reconhecido neste navegador/endereço.';}catch(e){status.textContent=`Resgate não concluído: ${e.message}`;}finally{generate.disabled=false;}});
  document.getElementById('download').addEventListener('click',()=>{if(!latest)return;const url=URL.createObjectURL(new Blob([latest.serialized],{type:'application/json;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=`wefrotas-resgate-${latest.data.exportedAt.replace(/[:.]/g,'-')}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);status.textContent='Download solicitado. Confira o arquivo; isso não confirma sincronização.';});
})(globalThis);
