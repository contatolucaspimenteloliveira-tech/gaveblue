import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
});
const cleanEmail = (value: unknown) => String(value || '').trim().toLowerCase();
const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const allowedRoles = new Set(['admin','manager','approver','viewer','driver']);
const roleToDatabase = (value: unknown) => ({
  'wefrotas-admin':'admin','wefrotas-gestor':'manager','wefrotas-aprovador':'approver','wefrotas-consulta':'viewer'
} as Record<string,string>)[String(value || '')] || (allowedRoles.has(String(value || '')) ? String(value) : 'viewer');
const roleToInterface = (value: unknown) => ({
  admin:'wefrotas-admin',manager:'wefrotas-gestor',approver:'wefrotas-aprovador',viewer:'wefrotas-consulta',driver:'wefrotas-consulta'
} as Record<string,string>)[String(value || '')] || 'wefrotas-consulta';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json(405, { ok:false, error:'Método não permitido.' });
  try {
    const url = Deno.env.get('SUPABASE_URL') || '';
    const anon = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!url || !anon || !service) throw new Error('Variáveis Supabase ausentes.');
    const bearer = req.headers.get('authorization') || '';
    const auth = createClient(url, anon, { global:{ headers:{ Authorization:bearer } } });
    const admin = createClient(url, service, { auth:{ persistSession:false,autoRefreshToken:false } });
    const {data:authData,error:authError}=await auth.auth.getUser();
    if(authError||!authData.user)return json(401,{ok:false,error:'Entre no WeFrotas.'});
    const payload=await req.json().catch(()=>({}));
    const action=String(payload.action||'');
    const orgId=String(payload.organizationId||payload.expectedOrganizationId||'').trim();
    const [{data:platformAdmin},{data:membership}]=await Promise.all([
      admin.from('platform_admins').select('role,active').eq('user_id',authData.user.id).maybeSingle(),
      orgId?admin.from('organization_members').select('organization_id,role,status').eq('organization_id',orgId).eq('user_id',authData.user.id).maybeSingle():Promise.resolve({data:null})
    ]);
    const isPlatform=platformAdmin?.active&&['owner','support'].includes(platformAdmin.role);
    const isManager=membership?.status==='active'&&['admin','manager'].includes(membership.role);
    if(!isPlatform&&!isManager)return json(403,{ok:false,error:'Sem permissão administrativa nesta empresa.'});
    if(!orgId)return json(400,{ok:false,error:'Empresa não informada.'});

    if(action==='wefrotas-users-list'){
      let query=admin.from('organization_members').select('id,user_id,email,role,status,created_at,updated_at').eq('organization_id',orgId).order('email');
      const search=String(payload.search||'').trim();if(search)query=query.ilike('email',`%${search.replace(/[%_]/g,'')}%`);
      const{data,error}=await query;if(error)throw error;
      const{data:authUsers,error:authUsersError}=await admin.auth.admin.listUsers({page:1,perPage:1000});if(authUsersError)throw authUsersError;
      const byId=new Map((authUsers.users||[]).map((item:any)=>[item.id,item]));
      return json(200,{ok:true,provider:'supabase',users:(data||[]).map((item:any)=>{const account=byId.get(item.user_id);return{id:item.id,userId:item.user_id,email:item.email,name:account?.user_metadata?.name||item.email.split('@')[0],role:roleToInterface(item.role),status:item.status==='active',createdAt:item.created_at,updatedAt:item.updated_at,accessedAt:account?.last_sign_in_at||null,syncError:item.status==='active'&&!item.user_id?'Defina uma senha para concluir a migração deste acesso ao Supabase.':''};})});
    }

    if(action==='wefrotas-user-create'){
      const email=cleanEmail(payload.email),password=String(payload.password||payload.temporaryPassword||''),name=String(payload.name||'').trim();
      const role=roleToDatabase(payload.role);
      if(!validEmail(email))return json(400,{ok:false,error:'E-mail inválido.'});
      if(password.length<8)return json(400,{ok:false,error:'A senha temporária precisa ter pelo menos 8 caracteres.'});
      const{data:existing,error:existingError}=await admin.from('organization_members').select('*').eq('organization_id',orgId).eq('email',email).maybeSingle();if(existingError)throw existingError;
      if(existing?.user_id)return json(409,{ok:false,error:'Este e-mail já possui uma conta Supabase vinculada à empresa.'});
      const{data:created,error:createError}=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{name}});if(createError)throw createError;
      const row={organization_id:orgId,user_id:created.user.id,email,appwrite_user_id:existing?.appwrite_user_id||'',role,status:'active'};
      const saveQuery=existing?admin.from('organization_members').update(row).eq('id',existing.id):admin.from('organization_members').insert(row);
      const{data:saved,error:saveError}=await saveQuery.select().single();
      if(saveError){await admin.auth.admin.deleteUser(created.user.id).catch(()=>{});throw saveError;}
      await admin.from('wefrotas_audit_events').insert({organization_id:orgId,actor_user_id:authData.user.id,actor_email:authData.user.email||'',entity_type:'user',entity_id:saved.id,action:'create',after_data:saved});
      return json(200,{ok:true,provider:'supabase',repaired:Boolean(existing),user:{id:saved.id,userId:created.user.id,email,role:roleToInterface(role),status:true}});
    }

    if(action==='wefrotas-user-update'){
      const memberId=String(payload.userId||'');
      const{data:member,error:memberError}=await admin.from('organization_members').select('*').eq('organization_id',orgId).eq('id',memberId).single();if(memberError)throw memberError;
      const role=payload.role?roleToDatabase(payload.role):member.role;
      const status=payload.status===false||payload.status==='disabled'?'disabled':'active';
      const email=payload.email?cleanEmail(payload.email):member.email;
      const authPatch:any={};if(payload.name)authPatch.user_metadata={name:String(payload.name).trim()};if(payload.password)authPatch.password=String(payload.password);if(email!==member.email)authPatch.email=email;
      if(member.user_id&&Object.keys(authPatch).length){const{error}=await admin.auth.admin.updateUserById(member.user_id,authPatch);if(error)throw error;}
      const{data:saved,error}=await admin.from('organization_members').update({email,role,status}).eq('id',member.id).select().single();if(error)throw error;
      await admin.from('wefrotas_audit_events').insert({organization_id:orgId,actor_user_id:authData.user.id,actor_email:authData.user.email||'',entity_type:'user',entity_id:saved.id,action:'update',before_data:member,after_data:saved});
      return json(200,{ok:true,provider:'supabase',user:{id:saved.id,userId:saved.user_id,email:saved.email,role:roleToInterface(saved.role),status:saved.status==='active'}});
    }

    if(action==='stats'){
      const tables=['wefrotas_vehicles','wefrotas_drivers','wefrotas_suppliers','wefrotas_orders','wefrotas_finance_entries','wefrotas_central_records'];
      const results=await Promise.all(tables.map(table=>admin.from(table).select('entity_id',{count:'exact',head:true}).eq('organization_id',orgId)));
      return json(200,{ok:true,stats:Object.fromEntries(tables.map((table,index)=>[table.replace('wefrotas_',''),results[index].count||0]))});
    }

    if(action==='notify'||action==='broadcast'){
      const title=String(payload.title||'WeFrotas').slice(0,120),text=String(payload.message||payload.text||'').slice(0,1000);
      const id=crypto.randomUUID();const data={id,title,text,createdAt:new Date().toISOString(),read:false,audience:action==='broadcast'?'all':String(payload.subscriptionId||'')};
      const{error}=await admin.from('wefrotas_notifications').insert({organization_id:orgId,entity_id:id,data});if(error)throw error;
      return json(200,{ok:true,queued:1,id});
    }

    if(['harden-permissions','migrate-central-stations','reset-onboarding'].includes(action))return json(200,{ok:true,provider:'supabase',changed:0});
    return json(400,{ok:false,error:'Ação não suportada pelo backend Supabase.'});
  }catch(error:any){console.error(error);return json(Number(error?.status||500),{ok:false,error:error?.message||'Falha interna.'});}
});
