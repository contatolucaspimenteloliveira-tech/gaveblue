import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
const json = (status: number, payload: unknown) => new Response(JSON.stringify(payload), {
  status, headers: { ...corsHeaders, 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
});
const cleanSlug = (value: unknown) => String(value || '').trim().toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
const cleanEmail = (value: unknown) => String(value || '').trim().toLowerCase();
const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validIso = (value: unknown) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
  && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString() === value;
const allowedRoles = new Set(['admin', 'manager', 'approver', 'viewer', 'driver']);

async function findAuthUser(admin: any, email: string) {
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const found = (data?.users || []).find((user: any) => cleanEmail(user.email) === email);
    if (found) return found;
    if ((data?.users || []).length < 1000) break;
  }
  return null;
}

async function recordPlatformAudit(admin: any, input: {
  organizationId: string; actorId: string; actorEmail: string; entityType: string; entityId?: string;
  action: 'create' | 'update' | 'delete' | 'import' | 'login' | 'logout'; before?: unknown; after?: unknown; operation: string;
}) {
  const { error } = await admin.from('wefrotas_audit_events').insert({
    organization_id: input.organizationId, actor_user_id: input.actorId, actor_email: input.actorEmail,
    entity_type: input.entityType, entity_id: input.entityId || '', action: input.action,
    before_data: input.before || null, after_data: input.after || null,
    details: { operation: input.operation, provider: 'supabase' }
  });
  if (error) throw error;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json(405, { ok: false, error: 'Método não permitido.' });
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!supabaseUrl || !anonKey || !serviceKey) throw new Error('Variáveis do Supabase ausentes.');
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
        admin.from('organizations').select('*,organization_subscriptions(*,plans(*)),organization_modules(*),organization_members(id,user_id,email,role,status,appwrite_user_id,created_at,updated_at)').order('created_at'),
        admin.from('plans').select('*').eq('active', true).order('monthly_price')
      ]);
      if (orgError || planError) throw orgError || planError;
      return json(200, { ok: true, provider: 'supabase', adminRole: platformAdmin.role, user: { id: authData.user.id, email: authData.user.email }, organizations, plans });
    }

    if (action === 'session-list') {
      const from = String(payload.from || ''), to = String(payload.to || '');
      if (!validIso(from) || !validIso(to) || from > to) return json(400, { ok: false, error: 'Período das sessões inválido.' });
      let query = admin.from('wefrotas_session_presence').select('*').gte('last_seen_at', from).lte('last_seen_at', to)
        .order('last_seen_at', { ascending: false }).limit(201);
      if (payload.organizationId) query = query.eq('organization_id', String(payload.organizationId));
      const { data: rows, error } = await query;
      if (error) throw error;
      const organizationIds = [...new Set((rows || []).map((row: any) => row.organization_id))];
      const userIds = [...new Set((rows || []).map((row: any) => row.user_id))];
      const [{ data: organizations }, { data: members }] = await Promise.all([
        organizationIds.length ? admin.from('organizations').select('id,name').in('id', organizationIds) : Promise.resolve({ data: [] }),
        userIds.length ? admin.from('organization_members').select('organization_id,user_id,email').in('user_id', userIds) : Promise.resolve({ data: [] })
      ]);
      const orgNames = new Map((organizations || []).map((org: any) => [org.id, org.name]));
      const memberEmails = new Map((members || []).map((member: any) => [`${member.organization_id}:${member.user_id}`, member.email]));
      const sessions = (rows || []).slice(0, 200).map((row: any) => ({
        id: row.connection_id, organizationId: row.organization_id, organizationName: orgNames.get(row.organization_id) || 'Empresa',
        actorId: row.user_id, actorName: '', actorEmail: memberEmails.get(`${row.organization_id}:${row.user_id}`) || '',
        startedAt: row.opened_at, lastSeenAt: row.last_seen_at, lastActivityAt: row.last_seen_at,
        closedAt: row.closed_at, browser: row.browser, system: row.system
      }));
      return json(200, { ok: true, provider: 'supabase', sessions, limited: (rows || []).length > 200, serverTime: new Date().toISOString() });
    }

    if (action === 'audit-list') {
      const limit = Math.floor(Math.max(1, Math.min(Number(payload.limit) || 100, 200)));
      if ((payload.from && !validIso(payload.from)) || (payload.to && !validIso(payload.to)) || (payload.from && payload.to && payload.from > payload.to)) {
        return json(400, { ok: false, error: 'Período de auditoria inválido.' });
      }
      const organizationId = String(payload.organizationId || '').trim();
      let orgQuery = admin.from('organizations').select('id,name');
      if (organizationId) orgQuery = orgQuery.eq('id', organizationId);
      const { data: organizations, error: organizationError } = await orgQuery;
      if (organizationError) throw organizationError;
      const cursors = payload.cursors && typeof payload.cursors === 'object' && !Array.isArray(payload.cursors) ? payload.cursors : {};
      const nextCursors: Record<string, string | null> = {};
      const pages = await Promise.all((organizations || []).map(async (organization: any) => {
        const cursor = cursors[organization.id];
        if (Object.prototype.hasOwnProperty.call(cursors, organization.id) && cursor === null) { nextCursors[organization.id] = null; return []; }
        if (cursor && !/^\d+$/.test(String(cursor))) throw new Error('Cursor da auditoria inválido. Atualize a consulta.');
        let query = admin.from('wefrotas_audit_events').select('*').eq('organization_id', organization.id).order('id', { ascending: false }).limit(limit);
        if (payload.from) query = query.gte('occurred_at', payload.from);
        if (payload.to) query = query.lte('occurred_at', payload.to);
        if (cursor) query = query.lt('id', cursor);
        const { data: events, error } = await query;
        if (error) throw error;
        nextCursors[organization.id] = (events || []).length === limit ? String(events![events!.length - 1].id) : null;
        return (events || []).map((event: any) => ({
          id: String(event.id), organizationId: organization.id, organizationName: organization.name,
          at: event.occurred_at, actorId: event.actor_user_id || '', actorEmail: event.actor_email || 'Usuário não identificado', actorName: '',
          action: String(event.details?.operation || `${event.entity_type}.${event.action}`), targetId: event.entity_id || '',
          result: 'success', before: event.before_data, after: event.after_data, justification: String(event.details?.justification || '')
        }));
      }));
      const events = pages.flat().sort((a: any, b: any) => String(b.at).localeCompare(String(a.at)) || Number(b.id) - Number(a.id));
      return json(200, { ok: true, provider: 'supabase', auditVersion: 2, events, cursors: nextCursors, hasMore: Object.values(nextCursors).some(Boolean) });
    }

    if (action === 'organization-save') {
      if (!['owner', 'support', 'commercial'].includes(platformAdmin.role)) return json(403, { ok: false, error: 'Sem permissão para alterar empresas.' });
      const id = String(payload.id || '').trim();
      const slug = cleanSlug(payload.slug || payload.name);
      const name = String(payload.name || '').trim().slice(0, 120);
      if (!slug || name.length < 2) return json(400, { ok: false, error: 'Informe nome e identificador válidos.' });
      const row = {
        slug, name, legal_name: String(payload.legalName || '').trim().slice(0, 180), document: String(payload.document || '').trim().slice(0, 32),
        status: ['trial', 'active', 'past_due', 'suspended', 'archived'].includes(payload.status) ? payload.status : 'trial',
        logo_url: String(payload.logoUrl || '').trim().slice(0, 1000),
        primary_color: /^#[0-9a-f]{6}$/i.test(payload.primaryColor) ? payload.primaryColor : '#2563eb',
        secondary_color: /^#[0-9a-f]{6}$/i.test(payload.secondaryColor) ? payload.secondaryColor : '#7c3aed',
        appwrite_workspace_id: cleanSlug(payload.workspaceId || payload.appwriteWorkspaceId || slug).slice(0, 36),
        metadata: { address: String(payload.address || '').trim().slice(0, 240), supportEmail: cleanEmail(payload.supportEmail).slice(0, 320),
          whatsapp: String(payload.whatsapp || '').replace(/\D/g, '').slice(0, 15), instagramUrl: String(payload.instagramUrl || '').trim().slice(0, 1000) }
      };
      const query = id ? admin.from('organizations').update(row).eq('id', id).select().single() : admin.from('organizations').insert(row).select().single();
      const { data: organization, error } = await query;
      if (error) throw error;
      for (const moduleKey of ['wefrotas', 'central']) {
        const { error: moduleError } = await admin.from('organization_modules').upsert({ organization_id: organization.id, module_key: moduleKey, enabled: payload.modules?.includes(moduleKey) }, { onConflict: 'organization_id,module_key' });
        if (moduleError) throw moduleError;
      }
      if (payload.planId) {
        const { error: subscriptionError } = await admin.from('organization_subscriptions').upsert({ organization_id: organization.id, plan_id: payload.planId,
          status: payload.subscriptionStatus || row.status, trial_ends_at: payload.trialEndsAt || null, current_period_end: payload.currentPeriodEnd || null });
        if (subscriptionError) throw subscriptionError;
      }
      await recordPlatformAudit(admin, { organizationId: organization.id, actorId: authData.user.id, actorEmail: authData.user.email || '', entityType: 'organization', entityId: organization.id, action: id ? 'update' : 'create', after: row, operation: id ? 'organization.update' : 'organization.create' });
      return json(200, { ok: true, provider: 'supabase', organization });
    }

    if (action === 'member-save') {
      if (!['owner', 'support'].includes(platformAdmin.role)) return json(403, { ok: false, error: 'Sem permissão para administrar acessos.' });
      const organizationId = String(payload.organizationId || '').trim();
      const email = cleanEmail(payload.email);
      const role = allowedRoles.has(String(payload.role)) ? String(payload.role) : 'viewer';
      const status = payload.status === 'disabled' ? 'disabled' : 'active';
      const password = String(payload.temporaryPassword || payload.password || '');
      if (!organizationId || !validEmail(email)) return json(400, { ok: false, error: 'Informe empresa e e-mail válidos.' });
      const [{ data: currentMember }, { data: subscription }, { count: activeMembers }] = await Promise.all([
        admin.from('organization_members').select('*').eq('organization_id', organizationId).eq('email', email).maybeSingle(),
        admin.from('organization_subscriptions').select('max_users,plans(max_users)').eq('organization_id', organizationId).maybeSingle(),
        admin.from('organization_members').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('status', 'active')
      ]);
      const plan = Array.isArray(subscription?.plans) ? subscription.plans[0] : subscription?.plans;
      const maxUsers = subscription?.max_users || plan?.max_users || null;
      if (!currentMember && status === 'active' && maxUsers && Number(activeMembers || 0) >= maxUsers) return json(409, { ok: false, error: `O limite de ${maxUsers} usuários deste plano foi atingido.` });
      let authUser = await findAuthUser(admin, email);
      let createdAuthUser = false;
      if (!authUser && status === 'active') {
        if (password.length < 8 || password.length > 256) return json(400, { ok: false, error: 'Este acesso ainda não possui conta no Supabase. Informe uma senha temporária de 8 a 256 caracteres.' });
        const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true,
          user_metadata: { name: String(payload.name || email.split('@')[0]).trim().slice(0, 128) } });
        if (error) throw error;
        authUser = data.user; createdAuthUser = true;
      } else if (authUser && (password || payload.name)) {
        const patch: Record<string, unknown> = {};
        if (password) { if (password.length < 8 || password.length > 256) return json(400, { ok: false, error: 'A nova senha precisa ter de 8 a 256 caracteres.' }); patch.password = password; }
        if (payload.name) patch.user_metadata = { ...(authUser.user_metadata || {}), name: String(payload.name).trim().slice(0, 128) };
        const { data, error } = await admin.auth.admin.updateUserById(authUser.id, patch);
        if (error) throw error;
        authUser = data.user;
      }
      const member = { organization_id: organizationId, user_id: authUser?.id || null, email,
        appwrite_user_id: currentMember?.appwrite_user_id || '', role, status };
      const { data: saved, error } = await admin.from('organization_members').upsert(member, { onConflict: 'organization_id,email' }).select().single();
      if (error) { if (createdAuthUser && authUser?.id) await admin.auth.admin.deleteUser(authUser.id).catch(() => {}); throw error; }
      await recordPlatformAudit(admin, { organizationId, actorId: authData.user.id, actorEmail: authData.user.email || '', entityType: 'user', entityId: saved.id,
        action: currentMember ? 'update' : 'create', before: currentMember, after: saved, operation: 'member.save' });
      return json(200, { ok: true, provider: 'supabase', member: saved, accountCreated: createdAuthUser });
    }

    return json(400, { ok: false, error: 'Ação inválida.' });
  } catch (error: any) {
    console.error(error);
    return json(Number(error?.status || 500), { ok: false, error: error?.message || 'Falha interna na gestão da plataforma.' });
  }
});
