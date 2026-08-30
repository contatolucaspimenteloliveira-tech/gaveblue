import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const json = (status: number, payload: unknown) => new Response(JSON.stringify(payload), {
  status,
  headers: { ...corsHeaders, 'content-type': 'application/json; charset=utf-8' }
});

const cleanSlug = (value: unknown) => String(value || '').trim().toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);

const orgLabel = (organizationId: string) => `org${organizationId.replace(/-/g, '').slice(0, 24)}`;
const orgRoleLabel = (organizationId: string, role: string) => `${orgLabel(organizationId)}${({ admin: 'adm', manager: 'mgr', approver: 'apr', viewer: 'view', driver: 'drv' } as Record<string,string>)[role] || 'view'}`;
const roleLabel: Record<string, string> = { admin: 'admin', manager: 'gestor', approver: 'aprovador', viewer: 'consulta', driver: 'motorista' };

async function syncAppwriteLabels(appwriteUserId: string, organizationId: string, role: string) {
  const endpoint = Deno.env.get('APPWRITE_ENDPOINT');
  const project = Deno.env.get('APPWRITE_PROJECT_ID');
  const key = Deno.env.get('APPWRITE_API_KEY');
  if (!appwriteUserId || !endpoint || !project || !key) return { skipped: true };
  const headers = { 'content-type': 'application/json', 'x-appwrite-project': project, 'x-appwrite-key': key };
  const userUrl = `${endpoint.replace(/\/$/, '')}/users/${encodeURIComponent(appwriteUserId)}`;
  const currentResponse = await fetch(userUrl, { headers });
  if (!currentResponse.ok) throw new Error('Usuário Appwrite não encontrado para sincronizar o acesso.');
  const current = await currentResponse.json();
  const managedRoles = new Set(Object.values(roleLabel));
  const labels = [...new Set([
    ...(Array.isArray(current.labels) ? current.labels : []).filter((item: string) => !managedRoles.has(item) && !/^org[a-f0-9]{24}(?:adm|mgr|apr|view|drv)?$/.test(item)),
    orgLabel(organizationId),
    orgRoleLabel(organizationId, role),
    roleLabel[role] || 'consulta'
  ])];
  const response = await fetch(`${userUrl}/labels`, { method: 'PUT', headers, body: JSON.stringify({ labels }) });
  if (!response.ok) throw new Error((await response.json().catch(() => ({})))?.message || 'Falha ao aplicar o acesso no Appwrite.');
  return { skipped: false, labels };
}

async function ensureAppwriteUser(input: { appwriteUserId?: string; email: string; name?: string; temporaryPassword?: string }) {
  const endpoint = Deno.env.get('APPWRITE_ENDPOINT');
  const project = Deno.env.get('APPWRITE_PROJECT_ID');
  const key = Deno.env.get('APPWRITE_API_KEY');
  if (!endpoint || !project || !key) return { id: input.appwriteUserId || '', skipped: true };
  if (input.appwriteUserId) return { id: input.appwriteUserId, skipped: false };
  const password = String(input.temporaryPassword || '');
  if (password.length < 8 || password.length > 256) throw new Error('Informe uma senha temporária de 8 a 256 caracteres para criar o acesso no WeFrotas.');
  const response = await fetch(`${endpoint.replace(/\/$/, '')}/users`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-appwrite-project': project, 'x-appwrite-key': key },
    body: JSON.stringify({ userId: 'unique()', email: input.email, password, name: String(input.name || input.email.split('@')[0]).slice(0, 128) })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result?.message || 'Falha ao criar o usuário no Appwrite. Se ele já existir, informe o ID Appwrite.');
  return { id: String(result.$id || ''), skipped: false };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json(405, { ok: false, error: 'Método não permitido.' });
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const bearer = req.headers.get('authorization') || '';
    const authClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: bearer } } });
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: authData, error: authError } = await authClient.auth.getUser();
    if (authError || !authData.user) return json(401, { ok: false, error: 'Entre no Painel GaveBlue.' });
    const { data: platformAdmin } = await admin.from('platform_admins').select('role,active').eq('user_id', authData.user.id).maybeSingle();
    if (!platformAdmin?.active) return json(403, { ok: false, error: 'Seu usuário não administra a plataforma.' });
    const payload = await req.json().catch(() => ({}));
    const action = String(payload.action || 'bootstrap');

    if (action === 'bootstrap' || action === 'organizations-list') {
      const [{ data: organizations, error: orgError }, { data: plans, error: planError }] = await Promise.all([
        admin.from('organizations').select('*,organization_subscriptions(*,plans(*)),organization_modules(*),organization_members(id,email,role,status,appwrite_user_id)').order('created_at'),
        admin.from('plans').select('*').eq('active', true).order('monthly_price')
      ]);
      if (orgError || planError) throw orgError || planError;
      return json(200, { ok: true, adminRole: platformAdmin.role, user: { id: authData.user.id, email: authData.user.email }, organizations, plans });
    }

    if (action === 'organization-save') {
      if (!['owner', 'support', 'commercial'].includes(platformAdmin.role)) return json(403, { ok: false, error: 'Sem permissão para alterar empresas.' });
      const id = String(payload.id || '').trim();
      const slug = cleanSlug(payload.slug || payload.name);
      const name = String(payload.name || '').trim().slice(0, 120);
      if (!slug || name.length < 2) return json(400, { ok: false, error: 'Informe nome e identificador válidos.' });
      const row = {
        slug, name,
        legal_name: String(payload.legalName || '').trim().slice(0, 180),
        document: String(payload.document || '').trim().slice(0, 32),
        status: ['trial', 'active', 'past_due', 'suspended', 'archived'].includes(payload.status) ? payload.status : 'trial',
        logo_url: String(payload.logoUrl || '').trim().slice(0, 1000),
        primary_color: /^#[0-9a-f]{6}$/i.test(payload.primaryColor) ? payload.primaryColor : '#2563eb',
        secondary_color: /^#[0-9a-f]{6}$/i.test(payload.secondaryColor) ? payload.secondaryColor : '#7c3aed',
        appwrite_workspace_id: cleanSlug(payload.appwriteWorkspaceId || slug).slice(0, 36)
      };
      const query = id ? admin.from('organizations').update(row).eq('id', id).select().single() : admin.from('organizations').insert(row).select().single();
      const { data: organization, error } = await query;
      if (error) throw error;
      for (const moduleKey of ['wefrotas', 'central']) {
        await admin.from('organization_modules').upsert({ organization_id: organization.id, module_key: moduleKey, enabled: payload.modules?.includes(moduleKey) }, { onConflict: 'organization_id,module_key' });
      }
      if (payload.planId) await admin.from('organization_subscriptions').upsert({
        organization_id: organization.id, plan_id: payload.planId, status: payload.subscriptionStatus || row.status,
        trial_ends_at: payload.trialEndsAt || null, current_period_end: payload.currentPeriodEnd || null
      });
      await admin.from('platform_audit_logs').insert({ actor_user_id: authData.user.id, organization_id: organization.id, action: id ? 'organization.update' : 'organization.create', target_type: 'organization', target_id: organization.id, after_data: row });
      return json(200, { ok: true, organization });
    }

    if (action === 'member-save') {
      if (!['owner', 'support'].includes(platformAdmin.role)) return json(403, { ok: false, error: 'Sem permissão para administrar acessos.' });
      const organizationId = String(payload.organizationId || '');
      const email = String(payload.email || '').trim().toLowerCase();
      const role = ['admin', 'manager', 'approver', 'viewer', 'driver'].includes(payload.role) ? payload.role : 'viewer';
      if (!organizationId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(400, { ok: false, error: 'Informe empresa e e-mail válidos.' });
      const [{ data: currentMember }, { data: subscription }, { count: activeMembers }] = await Promise.all([
        admin.from('organization_members').select('id').eq('organization_id', organizationId).eq('email', email).maybeSingle(),
        admin.from('organization_subscriptions').select('max_users,plans(max_users)').eq('organization_id', organizationId).maybeSingle(),
        admin.from('organization_members').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('status', 'active')
      ]);
      const plan = Array.isArray(subscription?.plans) ? subscription.plans[0] : subscription?.plans;
      const maxUsers = subscription?.max_users || plan?.max_users || null;
      if (!currentMember && payload.status !== 'disabled' && maxUsers && Number(activeMembers || 0) >= maxUsers) return json(409, { ok: false, error: `O limite de ${maxUsers} usuários deste plano foi atingido.` });
      const { data: usersData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      let user = usersData.users.find((item) => item.email?.toLowerCase() === email);
      if (!user) {
        const adminAppUrl = Deno.env.get('ADMIN_APP_URL') || 'https://gaveblue.com.br/admin/';
        const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo: adminAppUrl });
        if (error) throw error;
        user = data.user;
      }
      if (!user) throw new Error('O usuário não pôde ser criado no Supabase Auth.');
      const appwriteUser = await ensureAppwriteUser({ appwriteUserId: String(payload.appwriteUserId || '').trim(), email, name: String(payload.name || ''), temporaryPassword: String(payload.temporaryPassword || '') });
      const member = { organization_id: organizationId, user_id: user.id, email, appwrite_user_id: appwriteUser.id, role, status: payload.status === 'disabled' ? 'disabled' : 'active' };
      const { data: saved, error } = await admin.from('organization_members').upsert(member, { onConflict: 'organization_id,email' }).select().single();
      if (error) throw error;
      const appwrite = member.status === 'active' ? await syncAppwriteLabels(member.appwrite_user_id, organizationId, role) : { skipped: true };
      await admin.from('platform_audit_logs').insert({ actor_user_id: authData.user.id, organization_id: organizationId, action: 'member.save', target_type: 'member', target_id: saved.id, after_data: member });
      return json(200, { ok: true, member: saved, appwrite });
    }

    return json(400, { ok: false, error: 'Ação inválida.' });
  } catch (error: any) {
    console.error(error);
    return json(500, { ok: false, error: error?.message || 'Falha interna na gestão da plataforma.' });
  }
});
