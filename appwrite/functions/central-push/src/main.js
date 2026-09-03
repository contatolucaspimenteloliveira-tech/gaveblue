import crypto from 'node:crypto';
import { gunzipSync, gzipSync } from 'node:zlib';
import { Account, Client, Databases, ID, Permission, Query, Role, Storage, Users } from 'node-appwrite';
import webpush from 'web-push';

const DATABASE_ID = process.env.DATABASE_ID || '6a68ce8c000a36a44d98';
const COLLECTION_ID = process.env.COLLECTION_ID || 'central_push_subscriptions';
const CENTRAL_RECORDS_COLLECTION_ID = process.env.CENTRAL_RECORDS_COLLECTION_ID || 'central_registros_pendentes';
const DRIVER_DIRECTORY_COLLECTION_ID = process.env.DRIVER_DIRECTORY_COLLECTION_ID || 'central_driver_directory';
const CENTRAL_BANNERS_COLLECTION_ID = process.env.CENTRAL_BANNERS_COLLECTION_ID || 'central_home_banners';
const WEFROTAS_BUCKET_ID = process.env.WEFROTAS_BUCKET_ID || '6a6fce300023ca843972';
const APPROVAL_LOCKS_COLLECTION_ID = process.env.APPROVAL_LOCKS_COLLECTION_ID || 'central_approval_locks';
const WEFROTAS_TABLE_ID = process.env.WEFROTAS_TABLE_ID || 'gaveblue_wefrotas';
const WEFROTAS_COMPANY_ID = process.env.WEFROTAS_COMPANY_ID || 'covre-e-cia';
const SUPABASE_URL = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_SERVICE_ROLE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '');
const WEFROTAS_SNAPSHOT_CHUNK_SIZE = 600 * 1024;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:adm01@covreecia.com.br';
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const ADMIN_USER_IDS = new Set(
  String(process.env.ADMIN_USER_IDS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
);

// Diretório que já é exibido na Central. Ele é usado apenas para a migração
// inicial para o cadastro de fornecedores do WeFrotas; depois a gestão passa a
// acontecer exclusivamente no WeFrotas.
const CENTRAL_STATION_DIRECTORY = Object.freeze([
  { name: 'Auto Posto 4 Rodas', city: 'Boa Esperança', address: 'Boa Esperança, ES', mapsUrl: 'https://www.google.com/maps/place/Auto+Posto+4+Rodas/@-18.5404958,-40.2937824,826m/data=!3m2!1e3!4b1!4m6!3m5!1s0xb5956c7feac48d:0xc15be322b9fed420!8m2!3d-18.5404958!4d-40.2912075!16s%2Fg%2F1tfp3pxm' },
  { name: 'Posto Nater Coop - Shell', city: 'Pinheiros', address: 'Pinheiros, ES', mapsUrl: 'https://www.google.com/maps/place/Posto+Rede+Nater+(Shell)+em+Pinheiros/@-18.4168459,-40.2107607,153m/data=!3m1!1e3!4m6!3m5!1s0xb59b33d7ff34b9:0x82053208dc2a16f8!8m2!3d-18.4163054!4d-40.2110065!16s%2Fg%2F11qpbrwj22' },
  { name: 'Posto Pinheiros - Ipiranga', city: 'Pinheiros', address: 'Pinheiros, ES', mapsUrl: 'https://www.google.com/maps/place/Posto+Pinheiros/@-18.413462,-40.2128249,156m/data=!3m1!1e3!4m6!3m5!1s0xb59a1481427d61:0xeba41bb1a2b24a1e!8m2!3d-18.4135384!4d-40.2127649!16s%2Fg%2F1tj7xmm_' },
  { name: 'Posto Nortão - Ale', city: 'Pinheiros', address: 'Pinheiros, ES', mapsUrl: 'https://www.google.com/maps/place/Posto+Nort%C3%A3o/@-18.4045169,-40.2319949,1969m/data=!3m1!1e3!4m6!3m5!1s0xb59a201628e4ab:0xcd6c4ad08d8fb206!8m2!3d-18.4045175!4d-40.2258587!16s%2Fg%2F11b6yqny3l?entry=ttu&g_ep=EgoyMDI2MDEyNi4wIKXMDSoKLDEwMDc5MjA2OUgBUAM%3D' },
  { name: 'Posto Cidade Alta', city: 'Nova Venécia', address: 'Nova Venécia, ES', mapsUrl: 'https://www.google.com/maps/place/Posto+Cidade+Alta/@-18.693836,-40.4136076,2405m/data=!3m1!1e3!4m10!1m2!2m1!1sposto!3m6!1s0xb5db2293e5e22b:0xeb619e2ab30e53b2!8m2!3d-18.693836!4d-40.3997215!15sCgVwb3N0b1oHIgVwb3N0b5IBC2dhc19zdGF0aW9u4AEA!16s%2Fg%2F11k62_1v8g' },
  { name: 'Auto Posto Servicentro Oliveira Rios - Atlântico', city: 'Montanha', address: 'Montanha, ES', mapsUrl: 'https://www.google.com/maps/place/Posto+Atlantico+Servicentro/@-18.1277285,-40.3620985,1655m/data=!3m1!1e3!4m10!1m2!2m1!1sauto+posto+servicentro+motanha!3m6!1s0xb50c56fe1af699:0xdce102eb786d422d!8m2!3d-18.1277285!4d-40.3525713!15sCh9hdXRvIHBvc3RvIHNlcnZpY2VudHJvIG1vbnRhbmhhkgELZ2FzX3N0YXRpb27gAQA!16s%2Fg%2F11hblk2rbr' },
  { name: 'Posto Canário', city: 'Pedro Canário', address: 'ES-209, 10 - Centro, Pedro Canário - ES', mapsUrl: 'https://www.google.com/maps/place/ES-209,+10+-+Centro,+Pedro+Can%C3%A1rio+-+ES,+29970-000/@-18.2990761,-39.9587556,19z/data=!4m6!3m5!1s0xca804b02de6b95:0x50166aeec8735e0f!8m2!3d-18.2991215!4d-39.9579864!16s%2Fg%2F11f613rqzg?hl=pt-BR&entry=ttu&g_ep=EgoyMDI2MDIwMS4wIKXMDSoASAFQAw%3D%3D' },
  { name: 'Posto Diamante Negro', city: 'São Mateus', address: 'São Mateus, ES', mapsUrl: 'https://maps.app.goo.gl/caunq78awoUE6Nf96' },
  { name: 'Posto Damiani', city: 'São Mateus', address: 'São Mateus, ES', mapsUrl: 'https://maps.app.goo.gl/LiyUgK2LJwUFPsjm8' }
]);
const CENTRAL_DEFAULT_CITIES = Object.freeze([
  { id: 'city-boa-esperanca', name: 'Boa Esperança', imageUrl: 'https://gaveblue.com.br/postoscredenciados-covreecia/assets/cidades/boa-esperanca.jpeg', active: true, featured: false },
  { id: 'city-montanha', name: 'Montanha', imageUrl: 'https://gaveblue.com.br/postoscredenciados-covreecia/assets/cidades/montanha.jpeg', active: true, featured: false },
  { id: 'city-nova-venecia', name: 'Nova Venécia', imageUrl: 'https://gaveblue.com.br/postoscredenciados-covreecia/assets/cidades/nova-venecia.jpeg', active: true, featured: false },
  { id: 'city-pedro-canario', name: 'Pedro Canário', imageUrl: 'https://gaveblue.com.br/postoscredenciados-covreecia/assets/cidades/pedro-canario.jpeg', active: true, featured: false },
  { id: 'city-pinheiros', name: 'Pinheiros', imageUrl: 'https://gaveblue.com.br/postoscredenciados-covreecia/assets/cidades/pinheiros.jpeg', active: true, featured: true },
  { id: 'city-sao-mateus', name: 'São Mateus', imageUrl: 'https://gaveblue.com.br/postoscredenciados-covreecia/assets/cidades/sao-mateus.jpeg', active: true, featured: false }
]);
const CENTRAL_GENERIC_CITY_IMAGE_URL = 'https://gaveblue.com.br/postoscredenciados-covreecia/assets/home/buscar-postos.jpeg';

function parseBody(req) {
  if (req.bodyJson && typeof req.bodyJson === 'object') return req.bodyJson;
  try {
    return JSON.parse(req.bodyText || req.body || '{}');
  } catch (error) {
    return {};
  }
}

function json(res, status, payload) {
  return res.json(payload, status);
}

function subscriptionDocumentId(endpoint, workspaceId = WEFROTAS_COMPANY_ID) {
  const source = workspaceId === WEFROTAS_COMPANY_ID ? endpoint : `${workspaceId}:${endpoint}`;
  return crypto.createHash('sha256').update(source).digest('hex').slice(0, 36);
}

function approvalLockDocumentId(recordId) {
  return crypto.createHash('sha256').update(`central-approval:${recordId}`).digest('hex').slice(0, 36);
}

function assertCentralRecordId(value) {
  const recordId = String(value || '').trim();
  if (!/^[a-zA-Z0-9_-]{1,36}$/.test(recordId)) {
    const error = new Error('Identificador de registro da Central inválido.');
    error.status = 400;
    throw error;
  }
  return recordId;
}

async function deleteTenantCentralBanner(req, payload = {}) {
  const access = await assertOperationalManager(req);
  const rowId = assertCentralRecordId(payload.rowId);
  const databases = createDatabaseClient(req);
  const banner = await databases.getDocument({
    databaseId: DATABASE_ID,
    collectionId: CENTRAL_BANNERS_COLLECTION_ID,
    documentId: rowId
  });
  if (String(banner?.workspaceId || '') !== String(access.organization.workspaceId || '')) {
    throw Object.assign(new Error('Este banner pertence a outra empresa.'), { status: 403 });
  }
  await databases.deleteDocument({
    databaseId: DATABASE_ID,
    collectionId: CENTRAL_BANNERS_COLLECTION_ID,
    documentId: rowId
  });
  const fileId = String(banner?.fileId || '').trim();
  let fileDeleted = false;
  if (fileId && !fileId.startsWith('builtin:')) {
    try {
      await new Storage(createServerClient(req)).deleteFile({ bucketId: WEFROTAS_BUCKET_ID, fileId });
      fileDeleted = true;
    } catch (error) {
      if (Number(error?.code || 0) !== 404) console.warn('Banner excluído, mas o arquivo não pôde ser removido:', error?.message || error);
    }
  }
  return { rowId, fileId, fileDeleted, workspaceId: access.organization.workspaceId };
}

async function createCentralRecord(databases, payload, organization) {
  const documentId = assertCentralRecordId(payload.rowId);
  const source = payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data) ? payload.data : {};
  const allowed = [
    'tipo', 'protocolo', 'motorista', 'data', 'hora', 'km', 'comprovanteUrl', 'mensagemWhatsapp', 'origem',
    'deviceId', 'pushSubscriptionId', 'criadoEm', 'fornecedor', 'tipoServico', 'valor', 'valorNumero',
    'observacoes', 'cidade', 'posto', 'litros', 'litrosNumero', 'tipoCombustivel'
  ];
  const data = { workspaceId: organization.workspaceId, status: 'pendente' };
  allowed.forEach((key) => {
    const value = source[key];
    if (value === undefined || value === null || value === '') return;
    data[key] = typeof value === 'string' ? value.slice(0, key === 'mensagemWhatsapp' ? 8000 : 2048) : value;
  });
  if (!data.tipo || !data.protocolo || !data.motorista || !data.criadoEm) {
    throw Object.assign(new Error('O registro não possui os dados mínimos obrigatórios.'), { status: 400 });
  }
  try {
    return await databases.createDocument({ databaseId: DATABASE_ID, collectionId: CENTRAL_RECORDS_COLLECTION_ID, documentId, data, permissions: tenantReadPermissions(organization) });
  } catch (error) {
    if (Number(error?.code) === 409) return { $id: documentId, alreadyExists: true };
    throw error;
  }
}

function createServerClient(req) {
  const endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT;
  const project = process.env.APPWRITE_FUNCTION_PROJECT_ID;
  const key = String(req.headers?.['x-appwrite-key'] || process.env.APPWRITE_FUNCTION_API_KEY || '').trim();
  if (!endpoint || !project || !key) {
    throw new Error('As variáveis automáticas da função Appwrite não estão disponíveis.');
  }
  return new Client().setEndpoint(endpoint).setProject(project).setKey(key);
}

function createDatabaseClient(req) {
  return new Databases(createServerClient(req));
}

function assertPushConfigured() {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    throw new Error('As chaves VAPID ainda não foram configuradas na função.');
  }
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

const WEFROTAS_ROLE_LABELS = Object.freeze({
  'wefrotas-admin': 'admin',
  'wefrotas-gestor': 'gestor',
  'wefrotas-aprovador': 'aprovador',
  'wefrotas-consulta': 'consulta'
});
const WEFROTAS_ACCESS_ROLES = new Set(Object.keys(WEFROTAS_ROLE_LABELS));
const WEFROTAS_TO_MEMBER_ROLE = Object.freeze({
  'wefrotas-admin': 'admin', 'wefrotas-gestor': 'manager', 'wefrotas-aprovador': 'approver',
  'wefrotas-consulta': 'viewer', 'wefrotas-motorista': 'driver'
});
const WEFROTAS_APPWRITE_LABELS = new Set(Object.values(WEFROTAS_ROLE_LABELS));
const SUPABASE_MEMBER_ROLES = Object.freeze({
  admin: 'wefrotas-admin',
  manager: 'wefrotas-gestor',
  approver: 'wefrotas-aprovador',
  viewer: 'wefrotas-consulta',
  driver: 'wefrotas-consulta'
});

function supabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

async function supabaseRest(path, options = {}) {
  if (!supabaseConfigured()) return null;
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'content-type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
    const details = await response.json().catch(() => ({}));
    throw new Error(details.message || `Supabase respondeu ${response.status}.`);
  }
  return response.status === 204 ? null : response.json();
}

function organizationAppwriteLabel(organizationId) {
  return `org${String(organizationId || '').replace(/-/g, '').slice(0, 24)}`;
}

function organizationAppwriteRoleLabel(organizationId, memberRole) {
  const suffix = { admin: 'adm', manager: 'mgr', approver: 'apr', viewer: 'view', driver: 'drv' }[memberRole] || 'view';
  return `${organizationAppwriteLabel(organizationId)}${suffix}`;
}

async function resolveSupabaseMembership(appwriteUserId) {
  if (!supabaseConfigured()) return null;
  const select = 'role,status,organization_id,organizations(id,slug,name,status,appwrite_workspace_id,logo_url,primary_color,secondary_color,organization_modules(module_key,enabled),organization_subscriptions(status,max_users,max_vehicles,max_devices,plans(max_users,max_vehicles,max_devices)))';
  const rows = await supabaseRest(`organization_members?appwrite_user_id=eq.${encodeURIComponent(appwriteUserId)}&status=eq.active&select=${encodeURIComponent(select)}&limit=2`);
  if (!Array.isArray(rows) || rows.length !== 1) {
    const error = new Error(rows?.length > 1 ? 'Seu usuário está vinculado a mais de uma empresa. Selecione a empresa no Painel GaveBlue.' : 'Seu usuário não está vinculado a uma empresa ativa.');
    error.status = 403;
    throw error;
  }
  const membership = rows[0];
  const organization = membership.organizations;
  const subscription = Array.isArray(organization?.organization_subscriptions) ? organization.organization_subscriptions[0] : organization?.organization_subscriptions;
  if (!organization || !['trial', 'active'].includes(organization.status) || !['trial', 'active'].includes(subscription?.status || organization.status)) {
    throw Object.assign(new Error('O acesso desta empresa está suspenso. Fale com a GaveBlue.'), { status: 403 });
  }
  const plan = Array.isArray(subscription?.plans) ? subscription.plans[0] : subscription?.plans;
  return {
    role: SUPABASE_MEMBER_ROLES[membership.role] || 'wefrotas-consulta',
    organization: {
      id: organization.id,
      slug: organization.slug,
      name: organization.name,
      workspaceId: organization.appwrite_workspace_id,
      appwriteLabel: organizationAppwriteLabel(organization.id),
      appwriteRoleLabel: organizationAppwriteRoleLabel(organization.id, membership.role),
      appwriteManagerLabels: [organizationAppwriteRoleLabel(organization.id, 'admin'), organizationAppwriteRoleLabel(organization.id, 'manager')],
      modules: (organization.organization_modules || []).filter((item) => item.enabled).map((item) => item.module_key),
      branding: { logoUrl: organization.logo_url, primaryColor: organization.primary_color, secondaryColor: organization.secondary_color },
      limits: {
        users: subscription?.max_users || plan?.max_users || null,
        vehicles: subscription?.max_vehicles || plan?.max_vehicles || null,
        devices: subscription?.max_devices || plan?.max_devices || null
      }
    }
  };
}

async function ensureMembershipAppwriteLabels(req, userId, membership) {
  if (!membership?.organization?.appwriteLabel || !membership?.organization?.appwriteRoleLabel) return;
  const users = new Users(createServerClient(req));
  const user = await users.get({ userId });
  const current = normalizeAppwriteLabels(user?.labels);
  const managedRoles = new Set(['admin', 'administrador', ...WEFROTAS_APPWRITE_LABELS]);
  const next = normalizeAppwriteLabels([
    ...current.filter((label) => !managedRoles.has(label) && !/^org[a-f0-9]{24}(?:adm|mgr|apr|view|drv)?$/.test(label)),
    membership.organization.appwriteLabel,
    membership.organization.appwriteRoleLabel
  ]);
  if (next.length === current.length && next.every((label, index) => label === current[index])) return;
  await users.updateLabels({ userId, labels: next });
}

async function resolvePublicOrganization(slugValue) {
  const slug = String(slugValue || WEFROTAS_COMPANY_ID).trim().toLowerCase();
  if (!supabaseConfigured()) return {
    slug: WEFROTAS_COMPANY_ID, name: 'Covre & Cia', workspaceId: WEFROTAS_COMPANY_ID,
    appwriteLabel: '', appwriteManagerLabels: ['admin'], modules: ['wefrotas', 'central'], limits: {}, branding: {},
    institutional: { legalName: 'COVRE & CIA LTDA', document: '28.419.232/0001-06', address: 'Av. Agenor Luiz Heringer, 463 - Centro, Pinheiros/ES', supportEmail: 'adm01@covreecia.com.br', whatsapp: '5527999884208', instagramUrl: 'https://www.instagram.com/covre_e_cia?igsh=czBmYWxudGhiNmVo' }
  };
  const select = 'id,slug,name,legal_name,document,status,appwrite_workspace_id,logo_url,primary_color,secondary_color,metadata,organization_modules(module_key,enabled),organization_subscriptions(status,max_users,max_vehicles,max_devices,plans(max_users,max_vehicles,max_devices))';
  const rows = await supabaseRest(`organizations?slug=eq.${encodeURIComponent(slug)}&select=${encodeURIComponent(select)}&limit=1`);
  const organization = rows?.[0];
  const subscription = Array.isArray(organization?.organization_subscriptions) ? organization.organization_subscriptions[0] : organization?.organization_subscriptions;
  if (!organization || !['trial', 'active'].includes(organization.status) || !['trial', 'active'].includes(subscription?.status || organization.status)) {
    throw Object.assign(new Error('Esta empresa não possui uma licença ativa.'), { status: 403 });
  }
  const plan = Array.isArray(subscription?.plans) ? subscription.plans[0] : subscription?.plans;
  return {
    id: organization.id,
    slug: organization.slug,
    name: organization.name,
    workspaceId: organization.appwrite_workspace_id,
    appwriteLabel: organizationAppwriteLabel(organization.id),
    appwriteManagerLabels: [organizationAppwriteRoleLabel(organization.id, 'admin'), organizationAppwriteRoleLabel(organization.id, 'manager')],
    modules: (organization.organization_modules || []).filter((item) => item.enabled).map((item) => item.module_key),
    limits: { users: subscription?.max_users || plan?.max_users || null, vehicles: subscription?.max_vehicles || plan?.max_vehicles || null, devices: subscription?.max_devices || plan?.max_devices || null },
    branding: { logoUrl: organization.logo_url, primaryColor: organization.primary_color, secondaryColor: organization.secondary_color },
    institutional: {
      legalName: organization.legal_name,
      document: organization.document,
      address: String(organization.metadata?.address || ''),
      supportEmail: String(organization.metadata?.supportEmail || ''),
      whatsapp: String(organization.metadata?.whatsapp || ''),
      instagramUrl: String(organization.metadata?.instagramUrl || '')
    }
  };
}

async function resolveCentralOrganization(payload = {}) {
  const organization = await resolvePublicOrganization(payload.organizationSlug);
  if (!organization.modules.includes('central')) {
    throw Object.assign(new Error('A licença desta empresa não inclui a Central de Registros.'), { status: 403 });
  }
  return organization;
}

function normalizeAppwriteLabels(values) {
  return [...new Set((Array.isArray(values) ? values : [])
    .map((value) => String(value || '').trim().toLowerCase())
    .filter((value) => /^[a-z0-9]{1,36}$/.test(value)))];
}

function getAppwriteRoleLabel(role) {
  return WEFROTAS_ROLE_LABELS[assertManagedRole(role)];
}

function getWefrotasRole(user, userId = '') {
  if (ADMIN_USER_IDS.has(String(userId || user?.$id || ''))) return 'wefrotas-admin';
  const labels = Array.isArray(user?.labels) ? user.labels.map((label) => String(label).trim().toLowerCase()) : [];
  if (labels.includes('admin') || labels.includes('administrador') || labels.includes('wefrotas-admin')) return 'wefrotas-admin';
  const matchedRole = Object.entries(WEFROTAS_ROLE_LABELS).find(([role, label]) => labels.includes(label) || labels.includes(role));
  return matchedRole?.[0] || 'wefrotas-consulta';
}

async function authenticateManager(req) {
  const userId = String(req.headers?.['x-appwrite-user-id'] || '').trim();
  const userJwt = String(req.headers?.['x-appwrite-user-jwt'] || '').trim();
  if (!userId || !userJwt) {
    const error = new Error('Entre no WeFrotas para continuar.');
    error.status = 403;
    throw error;
  }

  try {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setJWT(userJwt);
    const authenticatedUser = await new Account(client).get();
    if (authenticatedUser?.$id !== userId) throw new Error('Identidade divergente.');
    const expected = parseBody(req);
    if (expected.expectedUserId && String(expected.expectedUserId) !== userId) {
      throw Object.assign(new Error('O login mudou em outra aba. Atualize o WeFrotas e entre novamente na empresa desejada.'), { status: 409 });
    }
    const membership = await resolveSupabaseMembership(userId);
    const resolvedWorkspaceId = membership?.organization?.workspaceId || WEFROTAS_COMPANY_ID;
    if (expected.expectedWorkspaceId && String(expected.expectedWorkspaceId) !== resolvedWorkspaceId) {
      throw Object.assign(new Error('A empresa da tela não corresponde à sessão atual. Atualize o WeFrotas antes de continuar.'), { status: 409 });
    }
    if (membership) await ensureMembershipAppwriteLabels(req, userId, membership);
    return {
      userId,
      user: authenticatedUser,
      role: membership?.role || getWefrotasRole(authenticatedUser, userId),
      organization: membership?.organization || {
        id: '', slug: WEFROTAS_COMPANY_ID, name: 'Covre & Cia', workspaceId: WEFROTAS_COMPANY_ID,
        appwriteLabel: '', modules: ['wefrotas', 'central'], limits: {}
      }
    };
  } catch (caught) {
    if (caught?.status) throw caught;
    const error = new Error('Não foi possível validar sua sessão administrativa.');
    error.status = 403;
    throw error;
  }
}

async function assertAdmin(req) {
  const access = await authenticateManager(req);
  if (access.role !== 'wefrotas-admin') {
    const error = new Error('Seu perfil não possui permissão administrativa.');
    error.status = 403;
    throw error;
  }
  return access;
}

async function assertAccessRole(req, allowedRoles, message = 'Seu perfil não possui permissão para esta ação.') {
  const access = await authenticateManager(req);
  if (!allowedRoles.includes(access.role)) {
    const error = new Error(message);
    error.status = 403;
    throw error;
  }
  return access;
}

const assertOperationalManager = (req) => assertAccessRole(req, ['wefrotas-admin', 'wefrotas-gestor']);
const assertCentralApprover = (req) => assertAccessRole(req, ['wefrotas-admin', 'wefrotas-gestor', 'wefrotas-aprovador']);

const ROLE_PERMISSION_LABELS = Object.freeze({
  // Appwrite rejeita uma permissão label:<papel> enquanto nenhum usuário do
  // projeto possuir aquela label. A autorização fina continua sendo aplicada
  // pela Function (assertAccessRole); nos documentos usamos apenas papéis que
  // são invariavelmente válidos no projeto.
  admin: ['admin']
});

function buildDocumentPermissions({ publicRead = false, authenticatedRead = false, read = [], update = [], remove = [] } = {}) {
  return [
    ...(publicRead
      ? [Permission.read(Role.any())]
      : authenticatedRead
        ? [Permission.read(Role.users())]
        : read.map((label) => Permission.read(Role.label(label)))),
    ...update.map((label) => Permission.update(Role.label(label))),
    ...remove.map((label) => Permission.delete(Role.label(label)))
  ];
}

function tenantManagerLabels(organization = {}) {
  return Array.isArray(organization.appwriteManagerLabels) && organization.appwriteManagerLabels.length
    ? organization.appwriteManagerLabels
    : ['admin'];
}

function normalizeTenant(value = WEFROTAS_COMPANY_ID) {
  if (value && typeof value === 'object') return value;
  return { workspaceId: String(value || WEFROTAS_COMPANY_ID), appwriteLabel: '', appwriteManagerLabels: ['admin'] };
}

function tenantManagedPermissions(organization = {}, { publicRead = false, auditOnly = false } = {}) {
  const readLabels = organization.appwriteLabel ? [organization.appwriteLabel] : ROLE_PERMISSION_LABELS.admin;
  const managerLabels = tenantManagerLabels(organization);
  return buildDocumentPermissions({
    publicRead,
    read: auditOnly ? managerLabels.slice(0, 1) : readLabels,
    update: auditOnly ? [] : managerLabels,
    remove: auditOnly ? [] : managerLabels
  });
}

function tenantReadPermissions(organization = {}) {
  return buildDocumentPermissions({ read: organization.appwriteLabel ? [organization.appwriteLabel] : ROLE_PERMISSION_LABELS.admin });
}

function normalizeManagedUser(user) {
  return {
    id: String(user?.$id || ''),
    name: String(user?.name || ''),
    email: String(user?.email || ''),
    role: getWefrotasRole(user),
    status: user?.status !== false,
    emailVerification: user?.emailVerification === true,
    createdAt: String(user?.$createdAt || ''),
    updatedAt: String(user?.$updatedAt || ''),
    accessedAt: String(user?.accessedAt || '')
  };
}

function assertManagedRole(value) {
  const role = String(value || '').trim().toLowerCase();
  if (!WEFROTAS_ACCESS_ROLES.has(role)) {
    const error = new Error('Perfil de acesso inválido.');
    error.status = 400;
    throw error;
  }
  return role;
}

async function findManagedUserByEmail(users, email) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail) return null;
  const result = await users.list({
    queries: [Query.equal('email', [normalizedEmail]), Query.limit(2)]
  });
  return (result?.users || []).find((item) => String(item?.email || '').trim().toLowerCase() === normalizedEmail) || null;
}

async function listWefrotasUsers(req, payload) {
  const access = await authenticateManager(req);
  if (access.role !== 'wefrotas-admin') throw Object.assign(new Error('Seu perfil não possui permissão administrativa.'), { status: 403 });
  const search = String(payload.search || '').trim().slice(0, 120);
  if (!supabaseConfigured()) {
    const result = await new Users(createServerClient(req)).list({ queries: [Query.limit(100)], ...(search ? { search } : {}) });
    const users = (result?.users || []).map(normalizeManagedUser).sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    return { users, total: Number(result?.total || 0) };
  }
  const members = await supabaseRest(`organization_members?organization_id=eq.${encodeURIComponent(access.organization.id)}&select=appwrite_user_id,email,role,status&limit=1000`);
  const usersApi = new Users(createServerClient(req));
  const resolved = await Promise.all((members || []).filter((item) => item.appwrite_user_id).map(async (member) => {
    try {
      const user = normalizeManagedUser(await usersApi.get({ userId: member.appwrite_user_id }));
      return { ...user, role: SUPABASE_MEMBER_ROLES[member.role] || user.role, status: member.status === 'active' && user.status };
    } catch (error) {
      return {
        id: member.appwrite_user_id,
        name: String(member.email || '').split('@')[0] || 'Acesso pendente',
        email: member.email || '',
        role: SUPABASE_MEMBER_ROLES[member.role] || 'wefrotas-consulta',
        status: false,
        accessedAt: null,
        syncError: Number(error?.code) === 404 ? 'Conta Appwrite ausente. Edite e informe uma senha temporária para reparar.' : 'Não foi possível validar a conta no Appwrite.'
      };
    }
  }));
  const normalizedSearch = search.toLocaleLowerCase('pt-BR');
  const users = resolved.filter(Boolean).filter((user) => !normalizedSearch || `${user.name} ${user.email}`.toLocaleLowerCase('pt-BR').includes(normalizedSearch));
  return { users, total: users.length };
}

async function createWefrotasUser(req, payload) {
  const access = await authenticateManager(req);
  if (access.role !== 'wefrotas-admin') throw Object.assign(new Error('Seu perfil não possui permissão administrativa.'), { status: 403 });
  const creatorId = access.userId;
  const name = String(payload.name || '').trim().slice(0, 128);
  const email = String(payload.email || '').trim().toLowerCase().slice(0, 320);
  const password = String(payload.password || '');
  const role = assertManagedRole(payload.role);
  if (name.length < 2) throw Object.assign(new Error('Informe o nome do usuário.'), { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Object.assign(new Error('Informe um e-mail válido.'), { status: 400 });
  if (password.length < 8) throw Object.assign(new Error('A senha temporária deve ter pelo menos 8 caracteres.'), { status: 400 });
  const users = new Users(createServerClient(req));
  let currentMembership = null;
  if (supabaseConfigured()) {
    const memberships = await supabaseRest(`organization_members?organization_id=eq.${encodeURIComponent(access.organization.id)}&email=eq.${encodeURIComponent(email)}&select=id,email,appwrite_user_id,role,status&limit=1`);
    currentMembership = memberships?.[0] || null;
    if (access.organization.limits?.users && !currentMembership) {
      const members = await supabaseRest(`organization_members?organization_id=eq.${encodeURIComponent(access.organization.id)}&status=eq.active&select=id&limit=1000`);
      if ((members || []).length >= access.organization.limits.users) throw Object.assign(new Error(`O limite de ${access.organization.limits.users} usuários deste plano foi atingido.`), { status: 409 });
    }
  }
  if (currentMembership?.appwrite_user_id) {
    try {
      await users.get({ userId: currentMembership.appwrite_user_id });
      throw Object.assign(new Error('Este e-mail já está cadastrado. Atualize a lista e use Editar.'), { status: 409 });
    } catch (error) {
      if (Number(error?.status || error?.code) === 409) throw error;
      if (Number(error?.code) !== 404) throw error;
    }
  }
  const recoverable = currentMembership ? await findManagedUserByEmail(users, email) : null;
  if (recoverable) {
    await users.updateName({ userId: recoverable.$id, name });
    await users.updatePassword({ userId: recoverable.$id, password });
    await users.updateLabels({ userId: recoverable.$id, labels: normalizeAppwriteLabels([
      ...(Array.isArray(recoverable.labels) ? recoverable.labels : []).filter((label) => !/^org[a-f0-9]{24}(?:adm|mgr|apr|view|drv)?$/.test(String(label || '').trim().toLowerCase())),
      access.organization.appwriteLabel,
      organizationAppwriteRoleLabel(access.organization.id, WEFROTAS_TO_MEMBER_ROLE[role])
    ]) });
    await users.updateStatus({ userId: recoverable.$id, status: true });
    await supabaseRest(`organization_members?organization_id=eq.${encodeURIComponent(access.organization.id)}&email=eq.${encodeURIComponent(email)}`, {
      method: 'PATCH', headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ appwrite_user_id: recoverable.$id, role: WEFROTAS_TO_MEMBER_ROLE[role], status: 'active' })
    });
    return { user: normalizeManagedUser(await users.get({ userId: recoverable.$id })), createdBy: creatorId, workspaceId: access.organization.workspaceId, organization: access.organization, repaired: true };
  }
  const created = await users.create({ userId: ID.unique(), email, password, name });
  let updated;
  try {
    updated = await users.updateLabels({ userId: created.$id, labels: normalizeAppwriteLabels(supabaseConfigured()
      ? [access.organization.appwriteLabel, organizationAppwriteRoleLabel(access.organization.id, WEFROTAS_TO_MEMBER_ROLE[role])]
      : [getAppwriteRoleLabel(role)]) });
    if (supabaseConfigured()) await supabaseRest('organization_members?on_conflict=organization_id,email', {
      method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ organization_id: access.organization.id, email, appwrite_user_id: created.$id, role: WEFROTAS_TO_MEMBER_ROLE[role], status: 'active' })
    });
  } catch (error) {
    await users.delete({ userId: created.$id }).catch(() => undefined);
    throw error;
  }
  return { user: normalizeManagedUser(updated), createdBy: creatorId, workspaceId: access.organization.workspaceId, organization: access.organization };
}

async function updateWefrotasUser(req, payload) {
  const access = await authenticateManager(req);
  if (access.role !== 'wefrotas-admin') throw Object.assign(new Error('Seu perfil não possui permissão administrativa.'), { status: 403 });
  const managerId = access.userId;
  const userId = String(payload.userId || '').trim();
  if (!/^[a-zA-Z0-9_.-]{1,36}$/.test(userId)) throw Object.assign(new Error('Usuário inválido.'), { status: 400 });
  if (userId === managerId && (payload.status === false || (payload.role && payload.role !== 'wefrotas-admin'))) {
    throw Object.assign(new Error('Você não pode desativar ou remover o próprio acesso administrativo.'), { status: 400 });
  }
  const password = payload.password !== undefined ? String(payload.password || '') : '';
  if (password && password.length < 8) {
    throw Object.assign(new Error('A nova senha deve ter pelo menos 8 caracteres.'), { status: 400 });
  }
  if (password.length > 256) {
    throw Object.assign(new Error('A nova senha deve ter no máximo 256 caracteres.'), { status: 400 });
  }
  const users = new Users(createServerClient(req));
  let membership = null;
  if (supabaseConfigured()) {
    const memberships = await supabaseRest(`organization_members?organization_id=eq.${encodeURIComponent(access.organization.id)}&appwrite_user_id=eq.${encodeURIComponent(userId)}&select=id,email,appwrite_user_id,role,status&limit=1`);
    if (!memberships?.length) throw Object.assign(new Error('Este usuário não pertence à sua empresa.'), { status: 403 });
    membership = memberships[0];
  }
  let before;
  try {
    before = normalizeManagedUser(await users.get({ userId }));
  } catch (error) {
    if (Number(error?.code) !== 404 || !membership) throw error;
    if (!password) throw Object.assign(new Error('Esta conta perdeu o vínculo com o Appwrite. Informe uma nova senha de pelo menos 8 caracteres para repará-la.'), { status: 409 });
    const email = String(membership.email || payload.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Object.assign(new Error('O vínculo não possui um e-mail válido para recuperação.'), { status: 409 });
    let recovered = await findManagedUserByEmail(users, email);
    let createdForRepair = false;
    if (!recovered) {
      recovered = await users.create({ userId: ID.unique(), email, password, name: String(payload.name || email.split('@')[0]).trim().slice(0, 128) });
      createdForRepair = true;
    } else {
      if (payload.name) await users.updateName({ userId: recovered.$id, name: String(payload.name).trim().slice(0, 128) });
      await users.updatePassword({ userId: recovered.$id, password });
    }
    try {
      const memberRole = payload.role !== undefined ? WEFROTAS_TO_MEMBER_ROLE[assertManagedRole(payload.role)] : membership.role;
      const labels = normalizeAppwriteLabels([
        ...(Array.isArray(recovered.labels) ? recovered.labels : []).filter((label) => !/^org[a-f0-9]{24}(?:adm|mgr|apr|view|drv)?$/.test(String(label || '').trim().toLowerCase())),
        access.organization.appwriteLabel,
        organizationAppwriteRoleLabel(access.organization.id, memberRole)
      ]);
      await users.updateLabels({ userId: recovered.$id, labels });
      const repairedStatus = payload.status === undefined ? membership.status === 'active' : payload.status === true;
      await users.updateStatus({ userId: recovered.$id, status: repairedStatus });
      await supabaseRest(`organization_members?organization_id=eq.${encodeURIComponent(access.organization.id)}&id=eq.${encodeURIComponent(membership.id)}`, {
        method: 'PATCH', headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ appwrite_user_id: recovered.$id, role: memberRole, status: repairedStatus ? 'active' : 'disabled' })
      });
    } catch (repairError) {
      if (createdForRepair) await users.delete({ userId: recovered.$id }).catch(() => undefined);
      throw repairError;
    }
    return { user: normalizeManagedUser(await users.get({ userId: recovered.$id })), before: { id: userId, email, status: false, role: SUPABASE_MEMBER_ROLES[membership.role] }, managerId, workspaceId: access.organization.workspaceId, organization: access.organization, repaired: true };
  }
  if (payload.name !== undefined) {
    const name = String(payload.name || '').trim().slice(0, 128);
    if (name.length < 2) throw Object.assign(new Error('Informe o nome do usuário.'), { status: 400 });
    await users.updateName({ userId, name });
  }
  if (password) {
    await users.updatePassword({ userId, password });
  }
  if (payload.role !== undefined) {
    const existing = await users.get({ userId });
    const preservedLabels = (Array.isArray(existing?.labels) ? existing.labels : []).filter((label) => {
      const normalized = String(label || '').trim().toLowerCase();
      return !WEFROTAS_ACCESS_ROLES.has(normalized) && !WEFROTAS_APPWRITE_LABELS.has(normalized) && normalized !== 'administrador' && !/^org[a-f0-9]{24}(?:adm|mgr|apr|view|drv)?$/.test(normalized);
    });
    const memberRole = WEFROTAS_TO_MEMBER_ROLE[assertManagedRole(payload.role)];
    const labels = normalizeAppwriteLabels(supabaseConfigured()
      ? [...preservedLabels, access.organization.appwriteLabel, organizationAppwriteRoleLabel(access.organization.id, memberRole)]
      : [...preservedLabels, getAppwriteRoleLabel(payload.role)]);
    await users.updateLabels({ userId, labels });
    if (supabaseConfigured()) await supabaseRest(`organization_members?organization_id=eq.${encodeURIComponent(access.organization.id)}&appwrite_user_id=eq.${encodeURIComponent(userId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ role: memberRole }) });
  }
  if (payload.status !== undefined) {
    await users.updateStatus({ userId, status: payload.status === true });
    if (supabaseConfigured()) await supabaseRest(`organization_members?organization_id=eq.${encodeURIComponent(access.organization.id)}&appwrite_user_id=eq.${encodeURIComponent(userId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: payload.status === true ? 'active' : 'disabled' }) });
  }
  return { user: normalizeManagedUser(await users.get({ userId })), before, managerId, workspaceId: access.organization.workspaceId, organization: access.organization };
}

async function saveSubscription(databases, payload, workspaceId = WEFROTAS_COMPANY_ID) {
  const subscription = payload.subscription || {};
  const endpoint = String(subscription.endpoint || '').trim();
  const p256dh = String(subscription.keys?.p256dh || '').trim();
  const auth = String(subscription.keys?.auth || '').trim();
  if (!endpoint.startsWith('https://') || !p256dh || !auth) {
    const error = new Error('Inscrição de push inválida.');
    error.status = 400;
    throw error;
  }

  const documentId = subscriptionDocumentId(endpoint, workspaceId);
  const data = {
    workspaceId,
    endpoint: endpoint.slice(0, 2048),
    p256dh: p256dh.slice(0, 512),
    auth: auth.slice(0, 512),
    userAgent: String(payload.userAgent || '').slice(0, 1024),
    active: true,
    updatedAt: new Date().toISOString()
  };

  try {
    await databases.updateDocument({
      databaseId: DATABASE_ID,
      collectionId: COLLECTION_ID,
      documentId,
      data
    });
  } catch (error) {
    if (Number(error?.code) !== 404) throw error;
    await databases.createDocument({
      databaseId: DATABASE_ID,
      collectionId: COLLECTION_ID,
      documentId,
      data
    });
  }
  // A neutral installation may be opened for another company in the same
  // browser. Its Web Push endpoint must remain active for only one company.
  let offset = 0;
  while (true) {
    const page = await databases.listDocuments({
      databaseId: DATABASE_ID,
      collectionId: COLLECTION_ID,
      queries: [Query.limit(100), Query.offset(offset)]
    });
    const duplicates = page.documents.filter((document) => (
      document.$id !== documentId
      && document.active !== false
      && String(document.endpoint || '') === endpoint
    ));
    await Promise.all(duplicates.map((document) => databases.updateDocument({
      databaseId: DATABASE_ID,
      collectionId: COLLECTION_ID,
      documentId: document.$id,
      data: { active: false, updatedAt: data.updatedAt }
    })));
    if (page.documents.length < 100) break;
    offset += page.documents.length;
  }
  return documentId;
}

async function disableSubscription(databases, payload, workspaceId = WEFROTAS_COMPANY_ID) {
  const endpoint = String(payload.subscription?.endpoint || '').trim();
  if (!endpoint.startsWith('https://')) {
    const error = new Error('Inscrição de push inválida.');
    error.status = 400;
    throw error;
  }
  const documentId = subscriptionDocumentId(endpoint, workspaceId);
  try {
    await databases.updateDocument({
      databaseId: DATABASE_ID,
      collectionId: COLLECTION_ID,
      documentId,
      data: { active: false, updatedAt: new Date().toISOString() }
    });
  } catch (error) {
    if (Number(error?.code) !== 404) throw error;
  }
  return documentId;
}

async function listSubscriptions(databases, workspaceId = WEFROTAS_COMPANY_ID) {
  const documents = [];
  let offset = 0;
  while (true) {
    const page = await databases.listDocuments({
      databaseId: DATABASE_ID,
      collectionId: COLLECTION_ID,
      queries: [Query.limit(100), Query.offset(offset)]
    });
    documents.push(...page.documents.filter((document) => document.active !== false && String(document.workspaceId || WEFROTAS_COMPANY_ID) === workspaceId));
    if (page.documents.length < 100) break;
    offset += page.documents.length;
  }
  return documents;
}

async function deleteSubscription(databases, subscriptionId) {
  const documentId = String(subscriptionId || '').trim();
  if (!isValidSubscriptionId(documentId)) {
    const error = new Error('Identificador do aparelho inválido.');
    error.status = 400;
    throw error;
  }
  try {
    await databases.deleteDocument({
      databaseId: DATABASE_ID,
      collectionId: COLLECTION_ID,
      documentId
    });
  } catch (error) {
    if (Number(error?.code) !== 404) throw error;
  }
  return documentId;
}

async function touchSubscriptionPresence(databases, payload, workspaceId = WEFROTAS_COMPANY_ID) {
  const documentId = String(payload.subscriptionId || '').trim();
  if (!isValidSubscriptionId(documentId)) {
    const error = new Error('Identificador do aparelho inválido.');
    error.status = 400;
    throw error;
  }
  const updatedAt = new Date().toISOString();
  const data = { active: true, updatedAt, workspaceId };
  const userAgent = String(payload.userAgent || '').trim();
  if (userAgent) data.userAgent = userAgent.slice(0, 1024);
  try {
    const current = await databases.getDocument({ databaseId: DATABASE_ID, collectionId: COLLECTION_ID, documentId });
    if (String(current.workspaceId || WEFROTAS_COMPANY_ID) !== workspaceId) throw Object.assign(new Error('Este dispositivo pertence a outra empresa.'), { status: 403 });
    await databases.updateDocument({ databaseId: DATABASE_ID, collectionId: COLLECTION_ID, documentId, data });
    return { touched: true, updatedAt };
  } catch (error) {
    if (Number(error?.code) !== 404) throw error;
    return { touched: false, updatedAt: '' };
  }
}

async function getWefrotasSnapshot(databases, workspaceId = WEFROTAS_COMPANY_ID) {
  const row = await databases.getDocument({
    databaseId: DATABASE_ID,
    collectionId: WEFROTAS_TABLE_ID,
    documentId: wefrotasSnapshotDocumentId(workspaceId)
  });
  return decodeWefrotasSnapshot(databases, row?.snapshot, workspaceId);
}

async function resolveCentralDeviceProfile(databases, subscriptionId, snapshot = null, directory = null, workspaceId = WEFROTAS_COMPANY_ID) {
  const subscription = await databases.getDocument({ databaseId: DATABASE_ID, collectionId: COLLECTION_ID, documentId: subscriptionId });
  if (String(subscription.workspaceId || WEFROTAS_COMPANY_ID) !== workspaceId) throw Object.assign(new Error('Este dispositivo pertence a outra empresa.'), { status: 403 });
  const links = snapshot?.centralDeviceLinks && typeof snapshot.centralDeviceLinks === 'object'
    ? snapshot.centralDeviceLinks
    : (await getWefrotasSnapshot(databases, workspaceId))?.centralDeviceLinks || {};
  if (!Object.prototype.hasOwnProperty.call(links, subscriptionId)) {
    return { configured: false, linked: false, updatedAt: '', appliedAt: '', profile: null };
  }
  const link = links[subscriptionId] && typeof links[subscriptionId] === 'object' ? links[subscriptionId] : {};
  const driverId = String(link.driverId || '').trim();
  const vehicleId = String(link.vehicleId || '').trim();
  const updatedAt = String(link.updatedAt || link.linkedAt || '').trim();
  const appliedAt = String(link.appliedAt || '').trim();
  if (!driverId || !vehicleId) return { configured: true, linked: false, updatedAt, appliedAt, profile: null };

  const resolvedDirectory = Array.isArray(directory) ? directory : await listDriverDirectory(databases, workspaceId);
  const row = resolvedDirectory.find((item) => String(item.driverId) === driverId && String(item.vehicleId) === vehicleId);
  if (!row) return { configured: true, linked: false, updatedAt, appliedAt, profile: null };
  return {
    configured: true,
    linked: true,
    updatedAt,
    appliedAt,
    profile: {
      driverId,
      vehicleId,
      name: String(row.driverName || ''),
      vehicle: String(row.vehicleName || ''),
      plate: String(row.plate || ''),
      vehicleImageUrl: String(row.vehicleImageUrl || '')
    }
  };
}

async function updateCentralDeviceProfile(databases, subscriptionId, { driverId = '', vehicleId = '', source = '' } = {}, actorId = '', tenant = WEFROTAS_COMPANY_ID) {
  const organization = normalizeTenant(tenant); const workspaceId = organization.workspaceId;
  const normalizedSubscriptionId = String(subscriptionId || '').trim();
  if (!isValidSubscriptionId(normalizedSubscriptionId)) {
    throw Object.assign(new Error('Identificador do aparelho inválido.'), { status: 400 });
  }
  try {
    const subscription = await databases.getDocument({ databaseId: DATABASE_ID, collectionId: COLLECTION_ID, documentId: normalizedSubscriptionId });
    if (String(subscription.workspaceId || WEFROTAS_COMPANY_ID) !== workspaceId) throw Object.assign(new Error('Este dispositivo pertence a outra empresa.'), { status: 403 });
  } catch (error) {
    if (Number(error?.code) === 404) throw Object.assign(new Error('Este aparelho não está mais inscrito.'), { status: 404 });
    throw error;
  }

  let normalizedDriverId = String(driverId || '').trim();
  let normalizedVehicleId = String(vehicleId || '').trim();
  if (normalizedDriverId) {
    const directory = await listDriverDirectory(databases, workspaceId);
    let row = directory.find((item) => String(item.driverId) === normalizedDriverId && String(item.vehicleId) === normalizedVehicleId);
    if (!row && !normalizedVehicleId) row = directory.find((item) => String(item.driverId) === normalizedDriverId);
    if (!row) {
      throw Object.assign(new Error('O motorista não possui permissão para usar este veículo.'), { status: 403 });
    }
    normalizedVehicleId = String(row.vehicleId || '').trim();
  } else {
    normalizedVehicleId = '';
  }

  const snapshot = await getWefrotasSnapshot(databases, workspaceId);
  const links = snapshot.centralDeviceLinks && typeof snapshot.centralDeviceLinks === 'object'
    ? { ...snapshot.centralDeviceLinks }
    : {};
  const updatedAt = new Date().toISOString();
  const normalizedSource = String(source || '').slice(0, 30);
  links[normalizedSubscriptionId] = {
    driverId: normalizedDriverId,
    vehicleId: normalizedVehicleId,
    updatedAt,
    linkedAt: updatedAt,
    appliedAt: normalizedSource === 'central-app' ? updatedAt : '',
    source: normalizedSource
  };
  snapshot.centralDeviceLinks = links;
  await persistWefrotasSnapshot(databases, snapshot, actorId || `device:${normalizedSubscriptionId.slice(-8)}`, organization);
  return resolveCentralDeviceProfile(databases, normalizedSubscriptionId, snapshot, null, workspaceId);
}

async function acknowledgeCentralDeviceProfile(databases, subscriptionId, expectedUpdatedAt, tenant = WEFROTAS_COMPANY_ID) {
  const organization = normalizeTenant(tenant); const workspaceId = organization.workspaceId;
  const normalizedSubscriptionId = String(subscriptionId || '').trim();
  if (!isValidSubscriptionId(normalizedSubscriptionId)) {
    throw Object.assign(new Error('Identificador do aparelho inválido.'), { status: 400 });
  }
  const subscription = await databases.getDocument({ databaseId: DATABASE_ID, collectionId: COLLECTION_ID, documentId: normalizedSubscriptionId });
  if (String(subscription.workspaceId || WEFROTAS_COMPANY_ID) !== workspaceId) throw Object.assign(new Error('Este dispositivo pertence a outra empresa.'), { status: 403 });
  const snapshot = await getWefrotasSnapshot(databases, workspaceId);
  const links = snapshot.centralDeviceLinks && typeof snapshot.centralDeviceLinks === 'object'
    ? { ...snapshot.centralDeviceLinks }
    : {};
  const current = links[normalizedSubscriptionId];
  const currentUpdatedAt = String(current?.updatedAt || current?.linkedAt || '').trim();
  if (!current || !currentUpdatedAt || currentUpdatedAt !== String(expectedUpdatedAt || '').trim()) {
    return resolveCentralDeviceProfile(databases, normalizedSubscriptionId, snapshot, null, workspaceId);
  }
  const appliedAt = new Date().toISOString();
  links[normalizedSubscriptionId] = { ...current, appliedAt };
  snapshot.centralDeviceLinks = links;
  await persistWefrotasSnapshot(databases, snapshot, `device:${normalizedSubscriptionId.slice(-8)}`, organization);
  return resolveCentralDeviceProfile(databases, normalizedSubscriptionId, snapshot, null, workspaceId);
}

function getSubscriptionPresence(updatedAt, active = true) {
  if (!active) return 'offline';
  const lastSeen = new Date(updatedAt || 0).getTime();
  if (!Number.isFinite(lastSeen) || lastSeen <= 0) return 'offline';
  const elapsed = Date.now() - lastSeen;
  if (elapsed <= 75_000) return 'online';
  if (elapsed <= 180_000) return 'unstable';
  return 'offline';
}

async function listDriverDirectory(databases, workspaceId = WEFROTAS_COMPANY_ID) {
  if (workspaceId !== WEFROTAS_COMPANY_ID) {
    let row;
    try {
      row = await databases.getDocument({ databaseId: DATABASE_ID, collectionId: WEFROTAS_TABLE_ID, documentId: wefrotasSnapshotDocumentId(workspaceId) });
    } catch (error) {
      if (Number(error?.code) === 404) return [];
      throw error;
    }
    if (row.workspaceId !== workspaceId) throw Object.assign(new Error('Diretório de outra empresa.'), { status: 403 });
    const snapshot = await decodeWefrotasSnapshot(databases, row.snapshot, workspaceId);
    return buildTenantDriverDirectory(snapshot);
  }
  const rows = [];
  let offset = 0;
  while (true) {
    const page = await databases.listDocuments({
      databaseId: DATABASE_ID,
      collectionId: DRIVER_DIRECTORY_COLLECTION_ID,
      queries: [Query.limit(100), Query.offset(offset)]
    });
    rows.push(...page.documents.filter((document) => document.active !== false && String(document.workspaceId || WEFROTAS_COMPANY_ID) === workspaceId));
    if (page.documents.length < 100) break;
    offset += page.documents.length;
  }
  return rows
    .map((document) => ({
      driverId: String(document.driverId || ''),
      driverName: String(document.driverName || ''),
      vehicleId: String(document.vehicleId || ''),
      vehicleName: String(document.vehicleName || ''),
      vehicleImageUrl: String(document.vehicleImageUrl || ''),
      plate: String(document.plate || ''),
      fleetNumber: String(document.fleetNumber || '')
    }))
    .filter((item) => item.driverId && item.driverName)
    .sort((a, b) => a.driverName.localeCompare(b.driverName, 'pt-BR'));
}

async function listCentralBanners(databases, workspaceId = WEFROTAS_COMPANY_ID) {
  const rows = [];
  let offset = 0;
  while (true) {
    const page = await databases.listDocuments({ databaseId: DATABASE_ID, collectionId: CENTRAL_BANNERS_COLLECTION_ID, queries: [Query.limit(100), Query.offset(offset)] });
    rows.push(...page.documents.filter((document) => String(document.workspaceId || WEFROTAS_COMPANY_ID) === workspaceId));
    if (page.documents.length < 100) break;
    offset += page.documents.length;
  }
  return rows.map((banner) => ({
    id: String(banner.$id || ''), title: String(banner.title || ''), imageUrl: String(banner.imageUrl || ''),
    fileId: String(banner.fileId || ''), active: banner.active === true, sortOrder: Number(banner.sortOrder || 0)
  }));
}

function isValidDeviceId(value) {
  return /^[a-f0-9-]{32,64}$/i.test(String(value || '').trim());
}

function isValidSubscriptionId(value) {
  return /^[a-f0-9]{36}$/i.test(String(value || '').trim());
}

async function listHistoryByField(databases, field, value) {
  if (!value) return [];
  const page = await databases.listDocuments({
    databaseId: DATABASE_ID,
    collectionId: CENTRAL_RECORDS_COLLECTION_ID,
    queries: [Query.equal(field, [value]), Query.orderDesc('$createdAt'), Query.limit(50)]
  });
  return page.documents;
}

function wefrotasSnapshotDocumentId(workspaceId = WEFROTAS_COMPANY_ID) {
  return crypto.createHash('sha256').update(workspaceId).digest('hex').slice(0, 36);
}

function wefrotasSnapshotChunkDocumentId(generation, index, workspaceId = WEFROTAS_COMPANY_ID) {
  return crypto.createHash('sha256').update(`${workspaceId}:snapshot:${generation}:${index}`).digest('hex').slice(0, 36);
}

const CENTRAL_ONBOARDING_FALLBACK_VERSION = '2026-08-managed-onboarding-v3';

function centralOnboardingConfigDocumentId(workspaceId = WEFROTAS_COMPANY_ID) {
  return crypto.createHash('sha256').update(`${workspaceId}:central-onboarding-config`).digest('hex').slice(0, 36);
}

function normalizeOnboardingVersion(value) {
  return String(value || '').trim().replace(/[^a-zA-Z0-9._:-]/g, '').slice(0, 120);
}

async function getCentralOnboardingConfig(databases, workspaceId = WEFROTAS_COMPANY_ID) {
  try {
    const row = await databases.getDocument({
      databaseId: DATABASE_ID,
      collectionId: WEFROTAS_TABLE_ID,
      documentId: centralOnboardingConfigDocumentId(workspaceId)
    });
    const parsed = JSON.parse(String(row?.snapshot || '{}'));
    return {
      version: normalizeOnboardingVersion(parsed?.version) || CENTRAL_ONBOARDING_FALLBACK_VERSION,
      updatedAt: String(parsed?.updatedAt || row?.updatedAt || row?.$updatedAt || '')
    };
  } catch (error) {
    if (Number(error?.code) !== 404) throw error;
    return { version: CENTRAL_ONBOARDING_FALLBACK_VERSION, updatedAt: '' };
  }
}

async function resetCentralOnboarding(databases, senderId, tenant = WEFROTAS_COMPANY_ID) {
  const organization = normalizeTenant(tenant); const workspaceId = organization.workspaceId;
  const updatedAt = new Date().toISOString();
  const version = `central-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;
  await updateOrCreateWefrotasRow(databases, centralOnboardingConfigDocumentId(workspaceId), {
    workspaceId,
    snapshot: JSON.stringify({ version, updatedAt }),
    updatedAt,
    updatedBy: senderId
  }, tenantManagedPermissions(organization));
  return { version, updatedAt };
}

async function decodeWefrotasSnapshot(databases, storedValue, workspaceId = WEFROTAS_COMPANY_ID) {
  const value = String(storedValue || '');
  if (value.startsWith('chunked-v1:')) {
    const manifest = JSON.parse(value.slice('chunked-v1:'.length));
    if (!manifest?.generation || !Number.isInteger(manifest.count) || manifest.count < 1 || manifest.count > 200) {
      throw new Error('O índice de postos do WeFrotas é inválido.');
    }
    const chunks = [];
    for (let index = 0; index < manifest.count; index += 4) {
      const batch = await Promise.all(Array.from({ length: Math.min(4, manifest.count - index) }, (_, offset) =>
        databases.getDocument({
          databaseId: DATABASE_ID,
          collectionId: WEFROTAS_TABLE_ID,
          documentId: wefrotasSnapshotChunkDocumentId(manifest.generation, index + offset, workspaceId)
        })
      ));
      chunks.push(...batch.map((row) => String(row?.snapshot || '')));
    }
    return decodeWefrotasSnapshot(databases, chunks.join(''), workspaceId);
  }
  if (value.startsWith('gzip-base64:')) {
    return JSON.parse(gunzipSync(Buffer.from(value.slice('gzip-base64:'.length), 'base64')).toString('utf8'));
  }
  return JSON.parse(value || '{}');
}

async function listCentralDirectory(databases, workspaceId = WEFROTAS_COMPANY_ID) {
  const row = await databases.getDocument({
    databaseId: DATABASE_ID,
    collectionId: WEFROTAS_TABLE_ID,
    documentId: wefrotasSnapshotDocumentId(workspaceId)
  });
  const snapshot = await decodeWefrotasSnapshot(databases, row?.snapshot, workspaceId);
  const stations = Array.isArray(snapshot?.suppliers) ? snapshot.suppliers : [];
  const normalizedStations = stations
    .filter((supplier) => String(supplier?.tipo || '') === 'posto' && supplier?.ativo !== false && supplier?.active !== false)
    .map((supplier) => ({
      id: String(supplier?.id || ''),
      name: String(supplier?.nome || '').trim().slice(0, 160),
      city: String(supplier?.cidade || supplier?.cidadePosto || '').trim().slice(0, 120),
      address: String(supplier?.endereco || supplier?.address || '').trim().slice(0, 360),
      mapsUrl: String(supplier?.mapaUrl || supplier?.linkMapa || supplier?.mapLink || '').trim().slice(0, 1000)
    }))
    .filter((station) => station.name && station.city && station.address)
    .map((station) => ({ ...station, mapsUrl: /^https:\/\//i.test(station.mapsUrl) ? station.mapsUrl : '' }))
    .sort((a, b) => a.city.localeCompare(b.city, 'pt-BR') || a.name.localeCompare(b.name, 'pt-BR'));
  const configuredCities = Array.isArray(snapshot?.centralCities) && snapshot.centralCities.length ? snapshot.centralCities : CENTRAL_DEFAULT_CITIES;
  const configuredCityNames = new Set(configuredCities.map((city) => normalizeStationName(city?.name || city?.nome)));
  const migratedSupplierCities = stations
    .map((supplier) => String(supplier?.cidade || supplier?.cidadePosto || '').trim().slice(0, 120))
    .filter((name) => name && !configuredCityNames.has(normalizeStationName(name)))
    .map((name) => {
      configuredCityNames.add(normalizeStationName(name));
      return {
        id: crypto.createHash('sha256').update(`central-city:${normalizeStationName(name)}`).digest('hex').slice(0, 36),
        name,
        imageUrl: CENTRAL_GENERIC_CITY_IMAGE_URL,
        active: true,
        featured: false
      };
    });
  const cities = [...configuredCities, ...migratedSupplierCities]
    .map((city) => ({
      id: String(city?.id || ''),
      name: String(city?.name || city?.nome || '').trim().slice(0, 120),
      imageUrl: String(city?.imageUrl || city?.imagemUrl || CENTRAL_GENERIC_CITY_IMAGE_URL).trim().slice(0, 1000),
      active: city?.active !== false && city?.ativo !== false,
      featured: city?.featured === true || city?.destaque === true
    }))
    .filter((city) => city.name && city.imageUrl)
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  return { stations: normalizedStations, cities };
}

function normalizeStationName(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function centralStationSupplierId(name) {
  return crypto.createHash('sha256').update(`central-station:${normalizeStationName(name)}`).digest('hex').slice(0, 36);
}

function stationFieldsDiffer(supplier, station) {
  return String(supplier?.cidade || supplier?.cidadePosto || '').trim() !== station.city
    || String(supplier?.endereco || supplier?.address || '').trim() !== station.address
    || String(supplier?.mapaUrl || supplier?.linkMapa || supplier?.mapLink || '').trim() !== station.mapsUrl;
}

async function updateOrCreateWefrotasRow(databases, documentId, data, permissions = undefined) {
  try {
    await databases.updateDocument({
      databaseId: DATABASE_ID,
      collectionId: WEFROTAS_TABLE_ID,
      documentId,
      data,
      ...(permissions ? { permissions } : {})
    });
  } catch (caught) {
    if (Number(caught?.code) !== 404) throw caught;
    await databases.createDocument({
      databaseId: DATABASE_ID,
      collectionId: WEFROTAS_TABLE_ID,
      documentId,
      data,
      ...(permissions ? { permissions } : {})
    });
  }
}

async function writeWefrotasAudit(databases, { actorId, action, targetId = '', before = null, after = null, justification = '', result = 'success', workspaceId = WEFROTAS_COMPANY_ID, organization: tenant = null }) {
  const organization = normalizeTenant(tenant || workspaceId); workspaceId = organization.workspaceId;
  const updatedAt = new Date().toISOString();
  const documentId = crypto.createHash('sha256')
    .update(`audit:${updatedAt}:${actorId}:${action}:${targetId}:${crypto.randomUUID()}`)
    .digest('hex')
    .slice(0, 36);
  await updateOrCreateWefrotasRow(databases, documentId, {
    workspaceId,
    snapshot: JSON.stringify({ kind: 'platform-audit', actorId, action, targetId, before, after, justification: String(justification || '').slice(0, 500), result, createdAt: updatedAt }),
    updatedAt,
    updatedBy: actorId
  }, tenantManagedPermissions(organization, { auditOnly: true }));
}

const SNAPSHOT_AUDIT_ENTITIES = Object.freeze([
  ['vehicles', 'vehicle', 'veículo'],
  ['drivers', 'driver', 'motorista'],
  ['suppliers', 'supplier', 'fornecedor'],
  ['orders', 'order', 'OS'],
  ['finance', 'finance', 'lançamento financeiro']
]);

function snapshotEntityId(item = {}) {
  return String(item?.id || item?.$id || item?.uuid || '').trim();
}

function snapshotAuditSummary(item = {}) {
  return {
    name: String(item?.nome || item?.name || item?.titulo || item?.descricao || item?.numero || '').slice(0, 180),
    plate: String(item?.placa || item?.plate || '').toUpperCase().slice(0, 16),
    number: String(item?.numero || item?.numeroOS || item?.orderNumber || '').slice(0, 48),
    status: String(item?.status || item?.workflowStatus || '').slice(0, 48),
    total: Number(item?.total ?? item?.valor ?? item?.value ?? 0) || 0
  };
}

function getSnapshotAuditEvents(previous = {}, next = {}) {
  const events = [];
  for (const [collection, key, label] of SNAPSHOT_AUDIT_ENTITIES) {
    const before = new Map((Array.isArray(previous?.[collection]) ? previous[collection] : [])
      .map((item) => [snapshotEntityId(item), item]).filter(([id]) => id));
    const after = new Map((Array.isArray(next?.[collection]) ? next[collection] : [])
      .map((item) => [snapshotEntityId(item), item]).filter(([id]) => id));
    for (const [id, item] of after) {
      const old = before.get(id);
      if (!old) events.push({ action: `${key}.create`, targetId: id, after: snapshotAuditSummary(item), label });
      else if (JSON.stringify(old) !== JSON.stringify(item)) events.push({ action: `${key}.update`, targetId: id, before: snapshotAuditSummary(old), after: snapshotAuditSummary(item), label });
    }
    for (const [id, item] of before) {
      if (!after.has(id)) events.push({ action: `${key}.delete`, targetId: id, before: snapshotAuditSummary(item), label });
    }
  }
  return events;
}

async function updateCollectionPermissions(databases, collectionId, permissions, includeDocument = () => true) {
  let cursor = '';
  let updated = 0;
  do {
    const queries = [Query.limit(100), Query.orderAsc('$id')];
    if (cursor) queries.push(Query.cursorAfter(cursor));
    const page = await databases.listDocuments({ databaseId: DATABASE_ID, collectionId, queries });
    const documents = Array.isArray(page?.documents) ? page.documents : [];
    for (const document of documents) {
      if (!includeDocument(document)) continue;
      const resolvedPermissions = typeof permissions === 'function' ? permissions(document) : permissions;
      await databases.updateDocument({
        databaseId: DATABASE_ID,
        collectionId,
        documentId: document.$id,
        permissions: resolvedPermissions
      });
      updated += 1;
    }
    cursor = documents.length === 100 ? String(documents.at(-1)?.$id || '') : '';
  } while (cursor);
  return updated;
}

async function hardenWefrotasPermissions(databases, organization) {
  const workspaceId = organization.workspaceId;
  const belongsToTenant = (document) => {
    const documentWorkspace = String(document?.workspaceId || WEFROTAS_COMPANY_ID).replace(/:audit$/, '');
    return documentWorkspace === workspaceId;
  };
  const isAuditDocument = (document) => {
    if (String(document?.workspaceId || '').endsWith(':audit')) return true;
    try { return JSON.parse(String(document?.snapshot || '{}')).kind === 'platform-audit'; } catch { return false; }
  };
  const snapshotPermissions = tenantManagedPermissions(organization);
  const auditPermissions = tenantManagedPermissions(organization, { auditOnly: true });
  const recordPermissions = tenantReadPermissions(organization);
  const publicPermissions = tenantManagedPermissions(organization, { publicRead: true });
  const results = {};
  results.snapshots = await updateCollectionPermissions(databases, WEFROTAS_TABLE_ID, (document) => (
    isAuditDocument(document) ? auditPermissions : snapshotPermissions
  ), belongsToTenant);
  results.centralRecords = await updateCollectionPermissions(databases, CENTRAL_RECORDS_COLLECTION_ID, recordPermissions, belongsToTenant);
  results.driverDirectory = await updateCollectionPermissions(databases, DRIVER_DIRECTORY_COLLECTION_ID, snapshotPermissions, belongsToTenant);
  results.banners = await updateCollectionPermissions(databases, CENTRAL_BANNERS_COLLECTION_ID, publicPermissions, belongsToTenant);
  results.approvalLocks = 0;
  results.pushSubscriptions = 0;
  return results;
}

async function persistWefrotasSnapshot(databases, snapshot, senderId, tenant = WEFROTAS_COMPANY_ID) {
  const organization = normalizeTenant(tenant); const workspaceId = organization.workspaceId;
  const snapshotPermissions = tenantManagedPermissions(organization);
  const serialized = JSON.stringify(snapshot);
  const compressed = `gzip-base64:${gzipSync(Buffer.from(serialized, 'utf8')).toString('base64')}`;
  const storedSnapshot = compressed.length < serialized.length ? compressed : serialized;
  const rowId = wefrotasSnapshotDocumentId(workspaceId);
  const updatedAt = new Date().toISOString();
  const chunks = [];
  for (let offset = 0; offset < storedSnapshot.length; offset += WEFROTAS_SNAPSHOT_CHUNK_SIZE) {
    chunks.push(storedSnapshot.slice(offset, offset + WEFROTAS_SNAPSHOT_CHUNK_SIZE));
  }

  let primarySnapshot = storedSnapshot;
  if (chunks.length > 1) {
    const generation = `${Date.now().toString(36)}-${crypto.randomBytes(5).toString('hex')}`;
    for (let start = 0; start < chunks.length; start += 4) {
      await Promise.all(chunks.slice(start, start + 4).map((chunk, index) => (
        updateOrCreateWefrotasRow(databases, wefrotasSnapshotChunkDocumentId(generation, start + index, workspaceId), {
          workspaceId,
          snapshot: chunk,
          updatedAt,
          updatedBy: senderId
        }, snapshotPermissions)
      )));
    }
    primarySnapshot = `chunked-v1:${JSON.stringify({ generation, count: chunks.length, length: storedSnapshot.length })}`;
  }

  await updateOrCreateWefrotasRow(databases, rowId, {
    workspaceId,
    snapshot: primarySnapshot,
    updatedAt,
    updatedBy: senderId
  }, snapshotPermissions);
  return { updatedAt, rowId };
}

function buildTenantDriverDirectory(snapshot = {}) {
  const active = item => item?.ativo !== false && item?.active !== false;
  const vehicles = (Array.isArray(snapshot.vehicles) ? snapshot.vehicles : []).filter(active);
  return (Array.isArray(snapshot.drivers) ? snapshot.drivers : []).filter(active).flatMap(driver => {
    const driverId = String(driver?.id || '').trim();
    const driverName = String(driver?.nome || driver?.name || '').trim();
    if (!driverId || !driverName) return [];
    const canonical = Array.isArray(driver.vehicleIds) || Boolean(driver.vehicleId);
    const ids = new Set((Array.isArray(driver.vehicleIds) ? driver.vehicleIds : driver.vehicleId ? [driver.vehicleId] : []).map(String));
    const linked = vehicles.filter(vehicle => canonical ? ids.has(String(vehicle.id)) : String(vehicle.motoristaId || vehicle.driverId || '') === driverId);
    return (linked.length ? linked : [null]).map(vehicle => ({
      driverId, driverName, vehicleId: String(vehicle?.id || ''),
      vehicleName: String(vehicle?.modelo || vehicle?.model || ''),
      vehicleImageUrl: String(vehicle?.vehicleImageUrl || vehicle?.imageUrl || ''),
      plate: String(vehicle?.placa || vehicle?.plate || '').toUpperCase(),
      fleetNumber: String(vehicle?.numeroFrota || vehicle?.fleetNumber || '')
    }));
  }).sort((a, b) => a.driverName.localeCompare(b.driverName, 'pt-BR'));
}

async function saveTenantOperationalSnapshot(req, payload = {}) {
  const access = await assertOperationalManager(req);
  const organization = access.organization;
  if (!organization?.id || !organization.appwriteLabel || !organization.modules?.includes('wefrotas')) {
    throw Object.assign(new Error('Empresa não autorizada para o WeFrotas.'), { status: 403 });
  }
  if (payload.workspaceId !== organization.workspaceId) {
    throw Object.assign(new Error('A empresa do salvamento não corresponde à sessão.'), { status: 403 });
  }
  const snapshot = payload.snapshot;
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)
    || ['vehicles', 'drivers', 'suppliers', 'orders', 'finance'].some(key => !Array.isArray(snapshot[key]))) {
    throw Object.assign(new Error('Cadastro incompleto. Nenhum dado foi substituído.'), { status: 400 });
  }
  if (Buffer.byteLength(JSON.stringify(snapshot), 'utf8') > 10 * 1024 * 1024) {
    throw Object.assign(new Error('Os dados excedem o tamanho permitido para este envio.'), { status: 413 });
  }
  const maxVehicles = Number(organization.limits?.vehicles || 0);
  const activeVehicles = snapshot.vehicles.filter(vehicle => vehicle?.ativo !== false && vehicle?.active !== false).length;
  if (maxVehicles > 0 && activeVehicles > maxVehicles) {
    throw Object.assign(new Error(`O plano desta empresa permite até ${maxVehicles} veículos ativos.`), { status: 409 });
  }
  const databases = createDatabaseClient(req);
  const rowId = wefrotasSnapshotDocumentId(organization.workspaceId);
  let previousRow = null;
  let previousSnapshot = {};
  try {
    previousRow = await databases.getDocument({ databaseId: DATABASE_ID, collectionId: WEFROTAS_TABLE_ID, documentId: rowId });
    previousSnapshot = await decodeWefrotasSnapshot(databases, previousRow.snapshot, organization.workspaceId);
  } catch (error) {
    if (Number(error?.code) !== 404) throw error;
  }
  const expectedUpdatedAt = String(payload.expectedUpdatedAt || '').trim();
  const currentUpdatedAt = String(previousRow?.updatedAt || previousRow?.$updatedAt || '').trim();
  if (previousRow && expectedUpdatedAt !== currentUpdatedAt) {
    await writeWefrotasAudit(databases, {
      actorId: access.userId, action: 'snapshot.conflict', targetId: rowId,
      before: { updatedAt: currentUpdatedAt, updatedBy: String(previousRow?.updatedBy || '') },
      after: { expectedUpdatedAt }, result: 'blocked', organization
    });
    throw Object.assign(new Error('Os dados desta empresa foram alterados em outro dispositivo. Atualize a página antes de salvar para evitar sobrescrever informações.'), { status: 409 });
  }
  const auditEvents = getSnapshotAuditEvents(previousSnapshot, snapshot);
  const saved = await persistWefrotasSnapshot(databases, snapshot, access.userId, organization);
  await syncTenantDriverDirectory(databases, snapshot, organization);
  const eventsToWrite = auditEvents.slice(0, 200);
  await Promise.all(eventsToWrite.map((event) => writeWefrotasAudit(databases, {
    actorId: access.userId, action: event.action, targetId: event.targetId,
    before: event.before || null, after: event.after || null, organization
  })));
  if (auditEvents.length > eventsToWrite.length) {
    await writeWefrotasAudit(databases, { actorId: access.userId, action: 'snapshot.bulk-change', targetId: rowId, after: { omittedEvents: auditEvents.length - eventsToWrite.length }, organization });
  }
  return { ok: true, workspaceId: organization.workspaceId, updatedAt: saved.updatedAt, auditEvents: auditEvents.length };
}

async function syncTenantDriverDirectory(databases, snapshot, organization) {
  const workspaceId = organization.workspaceId;
  const desired = buildTenantDriverDirectory(snapshot);
  const desiredIds = new Set();
  const updatedAt = new Date().toISOString();
  const permissions = tenantManagedPermissions(organization);
  const existing = new Map();
  let offset = 0;
  while (true) {
    const page = await databases.listDocuments({ databaseId: DATABASE_ID, collectionId: DRIVER_DIRECTORY_COLLECTION_ID,
      queries: [Query.equal('workspaceId', [workspaceId]), Query.limit(100), Query.offset(offset)] });
    for (const row of page.documents) if (row.workspaceId === workspaceId) existing.set(row.$id, row);
    if (page.documents.length < 100) break;
    offset += page.documents.length;
  }
  for (const row of desired) {
    const documentId = crypto.createHash('sha256').update(`${workspaceId}:central-driver:${row.driverId}:${row.vehicleId || 'without-vehicle'}`).digest('hex').slice(0, 36);
    desiredIds.add(documentId);
    const current = existing.get(documentId);
    if (current && current.active !== false && Object.keys(row).every(key => String(current[key] ?? '') === String(row[key] ?? ''))) continue;
    const args = { databaseId: DATABASE_ID, collectionId: DRIVER_DIRECTORY_COLLECTION_ID, documentId,
      data: { ...row, workspaceId, active: true, updatedAt }, permissions };
    try { await databases.updateDocument(args); } catch (error) {
      if (Number(error?.code) !== 404) throw error;
      await databases.createDocument(args);
    }
  }
  for (const row of existing.values()) {
    if (desiredIds.has(row.$id) || row.active === false) continue;
    await databases.updateDocument({ databaseId: DATABASE_ID, collectionId: DRIVER_DIRECTORY_COLLECTION_ID,
      documentId: row.$id, data: { active: false, updatedAt }, permissions });
  }
}

async function appendApprovedFinanceEntry(databases, senderId, payload = {}, tenant = WEFROTAS_COMPANY_ID) {
  const organization = normalizeTenant(tenant); const workspaceId = organization.workspaceId;
  const entry = payload?.entry && typeof payload.entry === 'object' && !Array.isArray(payload.entry)
    ? structuredClone(payload.entry)
    : null;
  const centralRecordId = String(entry?.centralRecordId || payload?.centralRecordId || '').trim().slice(0, 80);
  const entryId = String(entry?.id || '').trim().slice(0, 80);
  if (!entry || !centralRecordId || !entryId) {
    throw Object.assign(new Error('O lançamento aprovado não possui identificação válida.'), { status: 400 });
  }
  if (Buffer.byteLength(JSON.stringify(entry), 'utf8') > 100_000) {
    throw Object.assign(new Error('O lançamento aprovado excede o tamanho permitido.'), { status: 400 });
  }

  const lockId = approvalLockDocumentId(`${workspaceId}:__finance_snapshot__`);
  let locked = false;
  for (let attempt = 0; attempt < 12 && !locked; attempt += 1) {
    const claimedAt = new Date().toISOString();
    try {
      await databases.createDocument({
        databaseId: DATABASE_ID,
        collectionId: APPROVAL_LOCKS_COLLECTION_ID,
        documentId: lockId,
        data: { centralRecordId: '__finance_snapshot__', status: 'em_aprovacao', claimedBy: senderId, claimedAt, financeEntryId: '-', completedAt: '-', updatedAt: claimedAt },
        permissions: []
      });
      locked = true;
    } catch (caught) {
      if (Number(caught?.code) !== 409) throw caught;
      try {
        const currentLock = await databases.getDocument({ databaseId: DATABASE_ID, collectionId: APPROVAL_LOCKS_COLLECTION_ID, documentId: lockId });
        const lockAge = Date.now() - new Date(currentLock?.updatedAt || currentLock?.claimedAt || 0).getTime();
        if (Number.isFinite(lockAge) && lockAge > 30_000) {
          await databases.deleteDocument({ databaseId: DATABASE_ID, collectionId: APPROVAL_LOCKS_COLLECTION_ID, documentId: lockId });
          continue;
        }
      } catch (lockError) {
        if (Number(lockError?.code) !== 404) throw lockError;
      }
      if (attempt === 11) throw Object.assign(new Error('O Financeiro está processando outra aprovação. Tente novamente.'), { status: 409 });
      await wait(200 + (attempt * 50));
    }
  }

  try {
    const row = await databases.getDocument({ databaseId: DATABASE_ID, collectionId: WEFROTAS_TABLE_ID, documentId: wefrotasSnapshotDocumentId(workspaceId) });
    const snapshot = await decodeWefrotasSnapshot(databases, row?.snapshot, workspaceId);
    const finance = Array.isArray(snapshot?.finance) ? [...snapshot.finance] : [];
    const existing = finance.find((item) => (
      String(item?.centralRecordId || '') === centralRecordId || String(item?.id || '') === entryId
    ));
    if (existing) return { created: false, entryId: String(existing.id || entryId), centralRecordId };

    finance.unshift(entry);
    snapshot.finance = finance;
    await persistWefrotasSnapshot(databases, snapshot, senderId, organization);
    await writeWefrotasAudit(databases, {
      actorId: senderId,
      action: 'central.finance.append',
      targetId: centralRecordId,
      after: { entryId, entryType: String(entry.entryType || entry.kind || ''), total: Number(entry.total || 0) },
      organization
    });
    return { created: true, entryId, centralRecordId };
  } finally {
    if (locked) {
      await databases.deleteDocument({ databaseId: DATABASE_ID, collectionId: APPROVAL_LOCKS_COLLECTION_ID, documentId: lockId }).catch(() => undefined);
    }
  }
}

async function updateCentralRecordStatus(databases, senderId, payload = {}, tenant = WEFROTAS_COMPANY_ID) {
  const organization = normalizeTenant(tenant); const workspaceId = organization.workspaceId;
  const recordId = String(payload?.recordId || '').trim();
  const status = String(payload?.status || '').trim().toLowerCase();
  if (!/^[a-z0-9_]{1,36}$/i.test(recordId)) {
    throw Object.assign(new Error('Registro da Central inválido.'), { status: 400 });
  }
  if (!['pendente', 'aprovado', 'rejeitado'].includes(status)) {
    throw Object.assign(new Error('Status da Central inválido.'), { status: 400 });
  }
  const resolucao = String(payload?.resolucao || '').trim().slice(0, 1000);
  if (status === 'rejeitado' && !resolucao) {
    throw Object.assign(new Error('Informe o motivo da rejeição.'), { status: 400 });
  }
  const before = await databases.getDocument({ databaseId: DATABASE_ID, collectionId: CENTRAL_RECORDS_COLLECTION_ID, documentId: recordId });
  if (String(before.workspaceId || WEFROTAS_COMPANY_ID) !== workspaceId) throw Object.assign(new Error('Este registro pertence a outra empresa.'), { status: 403 });
  const data = {
    status,
    resolucao,
    atualizadoEm: new Date().toISOString()
  };
  if (payload.importadoEm !== undefined) data.importadoEm = payload.importadoEm || null;
  if (payload.lancamentoFinanceiroId !== undefined) data.lancamentoFinanceiroId = payload.lancamentoFinanceiroId || null;
  const updated = await databases.updateDocument({
    databaseId: DATABASE_ID,
    collectionId: CENTRAL_RECORDS_COLLECTION_ID,
    documentId: recordId,
    data,
    permissions: tenantReadPermissions(organization)
  });
  await writeWefrotasAudit(databases, {
    actorId: senderId,
    action: `central.record.${status}`,
    targetId: recordId,
    before: { status: String(before?.status || ''), resolucao: String(before?.resolucao || '') },
    after: { status, resolucao, lancamentoFinanceiroId: String(data.lancamentoFinanceiroId || '') },
    justification: resolucao,
    organization
  });
  return updated;
}

async function deleteCentralRecord(databases, senderId, payload = {}, tenant = WEFROTAS_COMPANY_ID) {
  const organization = normalizeTenant(tenant); const workspaceId = organization.workspaceId;
  const recordId = assertCentralRecordId(payload.recordId);
  const before = await getCentralRecord(databases, recordId);
  if (String(before.workspaceId || WEFROTAS_COMPANY_ID) !== workspaceId) throw Object.assign(new Error('Este registro pertence a outra empresa.'), { status: 403 });
  await databases.deleteDocument({ databaseId: DATABASE_ID, collectionId: CENTRAL_RECORDS_COLLECTION_ID, documentId: recordId });
  await writeWefrotasAudit(databases, { actorId: senderId, action: 'central.record.delete', targetId: recordId, before: { status: String(before.status || ''), protocol: String(before.protocolo || '') }, organization });
  return { deleted: true, recordId };
}

async function migrateCentralStationsToWefrotas(databases, senderId, tenant = WEFROTAS_COMPANY_ID) {
  const organization = normalizeTenant(tenant); const workspaceId = organization.workspaceId;
  const row = await databases.getDocument({
    databaseId: DATABASE_ID,
    collectionId: WEFROTAS_TABLE_ID,
    documentId: wefrotasSnapshotDocumentId(workspaceId)
  });
  const snapshot = await decodeWefrotasSnapshot(databases, row?.snapshot, workspaceId);
  const suppliers = Array.isArray(snapshot?.suppliers) ? [...snapshot.suppliers] : [];
  const indexedSuppliers = new Map();
  suppliers.forEach((supplier, index) => {
    if (String(supplier?.tipo || '') !== 'posto') return;
    const key = normalizeStationName(supplier?.nome);
    if (key && !indexedSuppliers.has(key)) indexedSuppliers.set(key, index);
  });

  let created = 0;
  let updated = 0;
  let unchanged = 0;
  CENTRAL_STATION_DIRECTORY.forEach((station) => {
    const index = indexedSuppliers.get(normalizeStationName(station.name));
    if (Number.isInteger(index)) {
      const current = suppliers[index];
      if (stationFieldsDiffer(current, station)) {
        suppliers[index] = {
          ...current,
          tipo: 'posto',
          tipoLabel: current.tipoLabel || 'Posto de combustível',
          cidade: station.city,
          endereco: station.address,
          mapaUrl: station.mapsUrl
        };
        updated += 1;
      } else {
        unchanged += 1;
      }
      return;
    }

    suppliers.push({
      id: centralStationSupplierId(station.name),
      nome: station.name,
      tipo: 'posto',
      tipoLabel: 'Posto de combustível',
      documento: '',
      telefone: '',
      cidade: station.city,
      endereco: station.address,
      mapaUrl: station.mapsUrl,
      email: '',
      observacoes: 'Importado da lista original da Central de Registros.',
      ativo: true
    });
    created += 1;
  });

  if (created || updated) {
    snapshot.suppliers = suppliers;
    await persistWefrotasSnapshot(databases, snapshot, senderId, organization);
  }
  return { total: CENTRAL_STATION_DIRECTORY.length, created, updated, unchanged };
}

async function revertImportedCentralStations(databases, senderId, tenant = WEFROTAS_COMPANY_ID) {
  const organization = normalizeTenant(tenant); const workspaceId = organization.workspaceId;
  const row = await databases.getDocument({
    databaseId: DATABASE_ID,
    collectionId: WEFROTAS_TABLE_ID,
    documentId: wefrotasSnapshotDocumentId(workspaceId)
  });
  const snapshot = await decodeWefrotasSnapshot(databases, row?.snapshot, workspaceId);
  const suppliers = Array.isArray(snapshot?.suppliers) ? snapshot.suppliers : [];
  const importedIds = new Set(CENTRAL_STATION_DIRECTORY.map((station) => centralStationSupplierId(station.name)));
  const importedMarker = 'Importado da lista original da Central de Registros.';
  const removed = suppliers.filter((supplier) =>
    importedIds.has(String(supplier?.id || '')) &&
    String(supplier?.observacoes || '').trim() === importedMarker
  );
  if (removed.length) {
    snapshot.suppliers = suppliers.filter((supplier) => !removed.includes(supplier));
    await persistWefrotasSnapshot(databases, snapshot, senderId, organization);
  }
  return {
    removed: removed.length,
    stations: removed.map((supplier) => String(supplier?.nome || '')).filter(Boolean)
  };
}

// Quando o navegador renova a inscrição Web Push (algo comum no iPhone), os
// registros antigos continuam apontando para o ID anterior. Reata-os ao
// aparelho atual sem guardar qualquer dado pessoal adicional.
async function linkDeviceSubscription(databases, deviceId, subscriptionId, log, workspaceId = WEFROTAS_COMPANY_ID) {
  if (!isValidDeviceId(deviceId) || !isValidSubscriptionId(subscriptionId)) return 0;
  try {
    const records = await listHistoryByField(databases, 'deviceId', String(deviceId).trim());
    const outdated = records.filter((record) => String(record.workspaceId || WEFROTAS_COMPANY_ID) === workspaceId && String(record.pushSubscriptionId || '').trim() !== subscriptionId);
    let linked = 0;
    for (let index = 0; index < outdated.length; index += 20) {
      const batch = outdated.slice(index, index + 20);
      const results = await Promise.allSettled(batch.map((record) => databases.updateDocument({
        databaseId: DATABASE_ID,
        collectionId: CENTRAL_RECORDS_COLLECTION_ID,
        documentId: record.$id,
        data: { pushSubscriptionId: subscriptionId }
      })));
      linked += results.filter((result) => result.status === 'fulfilled').length;
      results.forEach((result, resultIndex) => {
        if (result.status === 'rejected') {
          log('Falha ao renovar vínculo push do registro ' + batch[resultIndex].$id + ': ' + (result.reason?.message || result.reason));
        }
      });
    }
    return linked;
  } catch (caught) {
    log('Falha ao renovar vínculos push do aparelho: ' + (caught?.message || caught));
    return 0;
  }
}

async function listDeviceHistory(databases, payload, workspaceId = WEFROTAS_COMPANY_ID) {
  const deviceId = String(payload.deviceId || '').trim();
  const subscriptionId = String(payload.subscriptionId || '').trim();
  if (!isValidDeviceId(deviceId) && !isValidSubscriptionId(subscriptionId)) {
    const error = new Error('Este aparelho ainda não possui um vínculo válido para consultar os envios.');
    error.status = 400;
    throw error;
  }
  const pages = await Promise.all([
    isValidDeviceId(deviceId) ? listHistoryByField(databases, 'deviceId', deviceId) : [],
    isValidSubscriptionId(subscriptionId) ? listHistoryByField(databases, 'pushSubscriptionId', subscriptionId) : []
  ]);
  const unique = new Map();
  pages.flat().forEach((document) => unique.set(document.$id, document));
  return [...unique.values()]
    .filter((document) => String(document.workspaceId || WEFROTAS_COMPANY_ID) === workspaceId)
    .sort((a, b) => String(b.criadoEm || b.$createdAt || '').localeCompare(String(a.criadoEm || a.$createdAt || '')))
    .slice(0, 50)
    .map((document) => ({
      id: document.$id,
      protocol: String(document.protocolo || ''),
      type: String(document.tipo || ''),
      status: String(document.status || 'pendente'),
      driver: String(document.motorista || ''),
      date: String(document.data || ''),
      time: String(document.hora || ''),
      value: document.valor ?? '',
      numericValue: Number(document.valorNumero || 0),
      supplier: String(document.posto || document.fornecedor || ''),
      resolution: String(document.resolucao || ''),
      receiptUrl: String(document.comprovanteUrl || ''),
      createdAt: String(document.criadoEm || document.$createdAt || ''),
      updatedAt: String(document.$updatedAt || '')
    }));
}

async function getCentralRecord(databases, recordId) {
  return databases.getDocument({
    databaseId: DATABASE_ID,
    collectionId: CENTRAL_RECORDS_COLLECTION_ID,
    documentId: recordId
  });
}

async function claimCentralApproval(databases, senderId, payload, workspaceId = WEFROTAS_COMPANY_ID) {
  const recordId = assertCentralRecordId(payload.recordId);
  const record = await getCentralRecord(databases, recordId);
  if (String(record.workspaceId || WEFROTAS_COMPANY_ID) !== workspaceId) throw Object.assign(new Error('Este registro pertence a outra empresa.'), { status: 403 });
  const recordStatus = String(record?.status || 'pendente').toLocaleLowerCase('pt-BR');
  if (recordStatus.includes('aprov') || recordStatus.includes('import')) {
    return { claimed: false, state: 'approved', financeEntryId: String(record?.lancamentoFinanceiroId || '') };
  }
  if (recordStatus.includes('rejeit')) {
    const error = new Error('Este registro já foi rejeitado e não pode ser aprovado sem auditoria.');
    error.status = 409;
    throw error;
  }

  const lockId = approvalLockDocumentId(`${workspaceId}:${recordId}`);
  const claimedAt = new Date().toISOString();
  try {
    await databases.createDocument({
      databaseId: DATABASE_ID,
      collectionId: APPROVAL_LOCKS_COLLECTION_ID,
      documentId: lockId,
      data: {
        centralRecordId: recordId,
        status: 'em_aprovacao',
        claimedBy: senderId,
        claimedAt,
        // These two attributes are required in Appwrite. A neutral placeholder
        // keeps the claim document valid until the finance entry is completed.
        financeEntryId: '-',
        completedAt: '-',
        updatedAt: claimedAt
      }
    });
    return { claimed: true, lockId, state: 'claimed' };
  } catch (caught) {
    if (Number(caught?.code) !== 409) throw caught;
    const lock = await databases.getDocument({
      databaseId: DATABASE_ID,
      collectionId: APPROVAL_LOCKS_COLLECTION_ID,
      documentId: lockId
    });
    if (String(lock?.claimedBy || '') === senderId && String(lock?.status || '') === 'em_aprovacao') {
      return { claimed: true, lockId, state: 'claimed' };
    }
    return {
      claimed: false,
      lockId,
      state: String(lock?.status || 'em_aprovacao'),
      financeEntryId: String(lock?.financeEntryId || '')
    };
  }
}

async function completeCentralApproval(databases, senderId, payload, workspaceId = WEFROTAS_COMPANY_ID) {
  const recordId = assertCentralRecordId(payload.recordId);
  const record = await getCentralRecord(databases, recordId);
  if (String(record.workspaceId || WEFROTAS_COMPANY_ID) !== workspaceId) throw Object.assign(new Error('Este registro pertence a outra empresa.'), { status: 403 });
  const financeEntryId = String(payload.financeEntryId || '').trim().slice(0, 128);
  if (!financeEntryId) {
    const error = new Error('Identificador do lançamento financeiro é obrigatório.');
    error.status = 400;
    throw error;
  }
  const lockId = approvalLockDocumentId(`${workspaceId}:${recordId}`);
  const lock = await databases.getDocument({
    databaseId: DATABASE_ID,
    collectionId: APPROVAL_LOCKS_COLLECTION_ID,
    documentId: lockId
  });
  if (String(lock?.claimedBy || '') !== senderId) {
    const error = new Error('A aprovação deste registro está em andamento por outro gestor.');
    error.status = 409;
    throw error;
  }
  const completedAt = new Date().toISOString();
  await databases.updateDocument({
    databaseId: DATABASE_ID,
    collectionId: APPROVAL_LOCKS_COLLECTION_ID,
    documentId: lockId,
    data: { status: 'approved', financeEntryId, completedAt, updatedAt: completedAt }
  });
  return { completed: true, lockId };
}

async function releaseCentralApproval(databases, senderId, payload, workspaceId = WEFROTAS_COMPANY_ID) {
  const recordId = assertCentralRecordId(payload.recordId);
  const record = await getCentralRecord(databases, recordId);
  if (String(record.workspaceId || WEFROTAS_COMPANY_ID) !== workspaceId) throw Object.assign(new Error('Este registro pertence a outra empresa.'), { status: 403 });
  const lockId = approvalLockDocumentId(`${workspaceId}:${recordId}`);
  try {
    const lock = await databases.getDocument({
      databaseId: DATABASE_ID,
      collectionId: APPROVAL_LOCKS_COLLECTION_ID,
      documentId: lockId
    });
    if (String(lock?.claimedBy || '') === senderId && String(lock?.status || '') === 'em_aprovacao') {
      await databases.deleteDocument({ databaseId: DATABASE_ID, collectionId: APPROVAL_LOCKS_COLLECTION_ID, documentId: lockId });
    }
  } catch (caught) {
    if (Number(caught?.code) !== 404) throw caught;
  }
  return { released: true };
}

async function markInactive(databases, documentId) {
  try {
    await databases.updateDocument({
      databaseId: DATABASE_ID,
      collectionId: COLLECTION_ID,
      documentId,
      data: { active: false, updatedAt: new Date().toISOString() }
    });
  } catch (error) {
    // A falha de limpeza não deve interromper o restante do disparo.
  }
}

function getNotificationContent(payload) {
  const title = String(payload.title || '').trim().slice(0, 60);
  const body = String(payload.body || '').trim().slice(0, 160);
  const url = String(payload.url || './').trim().slice(0, 500);
  if (!title || !body) {
    const error = new Error('Título e subtítulo são obrigatórios.');
    error.status = 400;
    throw error;
  }
  return { title, body, url };
}

function getPushStatusCode(error) {
  return Number(error?.statusCode || error?.status || 0);
}

function isRetryablePushError(error) {
  const statusCode = getPushStatusCode(error);
  return statusCode === 0 || statusCode === 408 || statusCode === 429 || statusCode >= 500;
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function sendToSubscription(databases, document, payload, log, tagPrefix = 'central-comunicado') {
  const { title, body, url } = getNotificationContent(payload);
  if (document.active === false) {
    const error = new Error('As notificações estão desativadas neste aparelho.');
    error.status = 409;
    throw error;
  }
  const subscription = {
    endpoint: document.endpoint,
    keys: { p256dh: document.p256dh, auth: document.auth }
  };
  const rawNotificationId = String(payload.notificationId || crypto.randomUUID());
  const notificationId = rawNotificationId.replace(/[^a-z0-9_-]/gi, '').slice(0, 64) || crypto.randomUUID();
  const notificationPayload = JSON.stringify({
    title,
    body,
    url,
    tag: tagPrefix + '-' + notificationId,
    notificationId,
    workspaceId: String(document.workspaceId || WEFROTAS_COMPANY_ID)
  });
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await webpush.sendNotification(subscription, notificationPayload, {
        TTL: 86400,
        urgency: tagPrefix === 'central-retorno' ? 'high' : 'normal'
      });
      return { sent: 1, failed: 0, attempts: attempt, notificationId };
    } catch (caught) {
      lastError = caught;
      const statusCode = getPushStatusCode(caught);
      if (statusCode === 404 || statusCode === 410) {
        await markInactive(databases, document.$id);
        break;
      }
      if (!isRetryablePushError(caught) || attempt === 3) break;
      await wait(400 * attempt);
    }
  }
  const statusCode = getPushStatusCode(lastError);
  log('Falha de push ' + document.$id + ': ' + (lastError?.message || statusCode));
  throw lastError;
}

async function notifySubscription(databases, payload, log, workspaceId = WEFROTAS_COMPANY_ID) {
  assertPushConfigured();
  const subscriptionId = String(payload.subscriptionId || '').trim();
  const deviceId = String(payload.deviceId || '').trim();
  if (!isValidSubscriptionId(subscriptionId) && !isValidDeviceId(deviceId)) {
    const error = new Error('O registro não possui um aparelho de origem válido.');
    error.status = 400;
    throw error;
  }
  const candidateIds = new Set();
  if (isValidSubscriptionId(subscriptionId)) candidateIds.add(subscriptionId);
  if (isValidDeviceId(deviceId)) {
    const records = await listHistoryByField(databases, 'deviceId', deviceId);
    records.forEach((record) => {
      const candidateId = String(record.pushSubscriptionId || '').trim();
      if (isValidSubscriptionId(candidateId)) candidateIds.add(candidateId);
    });
  }
  let lastError;
  let attempted = 0;
  for (const candidateId of candidateIds) {
    try {
      const document = await databases.getDocument({
        databaseId: DATABASE_ID,
        collectionId: COLLECTION_ID,
        documentId: candidateId
      });
      if (String(document.workspaceId || WEFROTAS_COMPANY_ID) !== workspaceId) continue;
      attempted += 1;
      const result = await sendToSubscription(databases, document, payload, log, 'central-retorno');
      return { subscribers: candidateIds.size, attempted, ...result };
    } catch (caught) {
      lastError = caught;
      log('Falha ao tentar retorno para inscrição ' + candidateId + ': ' + (caught?.message || caught));
    }
  }
  if (lastError) throw lastError;
  const notFound = new Error('O aparelho de origem não está mais inscrito.');
  notFound.status = 404;
  throw notFound;
}

async function broadcast(databases, payload, log, workspaceId = WEFROTAS_COMPANY_ID) {
  assertPushConfigured();
  const { title, body, url } = getNotificationContent(payload);

  const subscriptions = await listSubscriptions(databases, workspaceId);
  let sent = 0;
  let failed = 0;

  for (let index = 0; index < subscriptions.length; index += 25) {
    const batch = subscriptions.slice(index, index + 25);
    const results = await Promise.allSettled(batch.map(async (document) => {
      const subscription = {
        endpoint: document.endpoint,
        keys: { p256dh: document.p256dh, auth: document.auth }
      };
      try {
        await webpush.sendNotification(
          subscription,
          JSON.stringify({
            title,
            body,
            url,
            tag: 'central-comunicado-' + Date.now(),
            workspaceId
          }),
          { TTL: 86400, urgency: 'normal' }
        );
        sent += 1;
      } catch (error) {
        failed += 1;
        const statusCode = Number(error?.statusCode || 0);
        if (statusCode === 404 || statusCode === 410) {
          await markInactive(databases, document.$id);
        }
        log('Falha de push ' + document.$id + ': ' + (error?.message || statusCode));
      }
    }));
    results.forEach(() => {});
  }

  return { subscribers: subscriptions.length, sent, failed };
}

export default async ({ req, res, log, error }) => {
  try {
    const payload = parseBody(req);
    const action = String(payload.action || '');
    if (action === 'tenant-context') {
      const organization = await resolveCentralOrganization(payload);
      return json(res, 200, { ok: true, organization: {
        slug: organization.slug, name: organization.name, workspaceId: organization.workspaceId,
        modules: organization.modules, limits: organization.limits, branding: organization.branding, institutional: organization.institutional
      } });
    }
    if (action === 'central-record-create') {
      const organization = await resolveCentralOrganization(payload);
      const record = await createCentralRecord(createDatabaseClient(req), payload, organization);
      return json(res, 200, { ok: true, record, alreadyExists: record.alreadyExists === true });
    }
    if (action === 'subscribe') {
      assertPushConfigured();
      const organization = await resolveCentralOrganization(payload);
      const databases = createDatabaseClient(req);
      if (organization.limits?.devices) {
        const activeDevices = await listSubscriptions(databases, organization.workspaceId);
        const currentId = subscriptionDocumentId(String(payload.subscription?.endpoint || '').trim(), organization.workspaceId);
        if (activeDevices.length >= organization.limits.devices && !activeDevices.some((item) => item.$id === currentId)) throw Object.assign(new Error(`O limite de ${organization.limits.devices} dispositivos deste plano foi atingido.`), { status: 409 });
      }
      const subscriptionId = await saveSubscription(databases, payload, organization.workspaceId);
      const linkedRecords = await linkDeviceSubscription(databases, payload.deviceId, subscriptionId, log, organization.workspaceId);
      return json(res, 200, { ok: true, subscriptionId, linkedRecords });
    }

    if (action === 'unsubscribe') {
      const organization = await resolveCentralOrganization(payload);
      const databases = createDatabaseClient(req);
      const subscriptionId = await disableSubscription(databases, payload, organization.workspaceId);
      return json(res, 200, { ok: true, subscriptionId });
    }

    if (action === 'presence') {
      const organization = await resolveCentralOrganization(payload);
      const databases = createDatabaseClient(req);
      const presence = await touchSubscriptionPresence(databases, payload, organization.workspaceId);
      const profileSync = presence.touched
        ? await resolveCentralDeviceProfile(databases, String(payload.subscriptionId || '').trim(), null, null, organization.workspaceId).catch(() => ({ configured: false, linked: false, updatedAt: '', appliedAt: '', profile: null }))
        : { configured: false, linked: false, updatedAt: '', appliedAt: '', profile: null };
      return json(res, 200, { ok: true, ...presence, profileSync });
    }

    if (action === 'device-profile-applied') {
      const organization = await resolveCentralOrganization(payload);
      const databases = createDatabaseClient(req);
      const profileSync = await acknowledgeCentralDeviceProfile(databases, payload.subscriptionId, payload.updatedAt, organization);
      return json(res, 200, { ok: true, profileSync });
    }

    if (action === 'device-profile-set') {
      const organization = await resolveCentralOrganization(payload);
      const databases = createDatabaseClient(req);
      const profileSync = await updateCentralDeviceProfile(databases, payload.subscriptionId, {
        driverId: payload.driverId,
        vehicleId: payload.vehicleId,
        source: 'central-app'
      }, '', organization);
      return json(res, 200, { ok: true, profileSync });
    }

    if (action === 'device-profile-admin-set') {
      const access = await assertAdmin(req); const senderId = access.userId; const workspaceId = access.organization.workspaceId;
      const databases = createDatabaseClient(req);
      const profileSync = await updateCentralDeviceProfile(databases, payload.subscriptionId, {
        driverId: payload.driverId,
        vehicleId: payload.vehicleId,
        source: 'wefrotas'
      }, senderId, access.organization);
      await writeWefrotasAudit(databases, {
        actorId: senderId,
        action: 'central.device.link',
        targetId: String(payload.subscriptionId || ''),
        after: { driverId: String(payload.driverId || ''), vehicleId: String(payload.vehicleId || '') }, workspaceId, organization: access.organization
      });
      return json(res, 200, { ok: true, profileSync });
    }

    if (action === 'device-profile-status') {
      const access = await assertAdmin(req); const workspaceId = access.organization.workspaceId;
      const databases = createDatabaseClient(req);
      const subscriptionId = String(payload.subscriptionId || '').trim();
      if (!isValidSubscriptionId(subscriptionId)) {
        throw Object.assign(new Error('Identificador do aparelho inválido.'), { status: 400 });
      }
      const profileSync = await resolveCentralDeviceProfile(databases, subscriptionId, null, null, workspaceId);
      return json(res, 200, { ok: true, profileSync });
    }

    if (action === 'onboarding-config') {
      const organization = await resolveCentralOrganization(payload);
      const databases = createDatabaseClient(req);
      const config = await getCentralOnboardingConfig(databases, organization.workspaceId);
      return json(res, 200, { ok: true, ...config });
    }

    if (action === 'stations') {
      const organization = await resolveCentralOrganization(payload);
      const databases = createDatabaseClient(req);
      const directory = await listCentralDirectory(databases, organization.workspaceId);
      return json(res, 200, { ok: true, ...directory, updatedAt: new Date().toISOString() });
    }

    if (action === 'banners') {
      const organization = await resolveCentralOrganization(payload);
      const banners = await listCentralBanners(createDatabaseClient(req), organization.workspaceId);
      return json(res, 200, { ok: true, banners });
    }

    if (action === 'migrate-central-stations') {
      const access = await assertOperationalManager(req); const senderId = access.userId; const workspaceId = access.organization.workspaceId;
      const databases = createDatabaseClient(req);
      const result = await migrateCentralStationsToWefrotas(databases, senderId, access.organization);
      log('Postos da lista original da Central migrados por ' + senderId + ': ' + JSON.stringify(result));
      return json(res, 200, { ok: true, ...result });
    }

    if (action === 'revert-imported-central-stations') {
      const access = await assertOperationalManager(req); const senderId = access.userId; const workspaceId = access.organization.workspaceId;
      const databases = createDatabaseClient(req);
      const result = await revertImportedCentralStations(databases, senderId, access.organization);
      log('Importação de postos da Central revertida por ' + senderId + ': ' + JSON.stringify(result));
      return json(res, 200, { ok: true, ...result });
    }

    if (action === 'directory') {
      const organization = await resolveCentralOrganization(payload);
      const databases = createDatabaseClient(req);
      const directory = await listDriverDirectory(databases, organization.workspaceId);
      return json(res, 200, { ok: true, directory });
    }

    if (action === 'history') {
      const organization = await resolveCentralOrganization(payload);
      const databases = createDatabaseClient(req);
      const records = await listDeviceHistory(databases, payload, organization.workspaceId);
      return json(res, 200, { ok: true, records });
    }

    if (action === 'wefrotas-snapshot-save') {
      return json(res, 200, await saveTenantOperationalSnapshot(req, payload));
    }

    if (action === 'my-access') {
      const access = await authenticateManager(req);
      return json(res, 200, {
        ok: true,
        userId: access.userId,
        role: access.role,
        organization: access.organization,
        permissions: {
          manageUsers: access.role === 'wefrotas-admin',
          manageSettings: access.role === 'wefrotas-admin' || access.role === 'wefrotas-gestor',
          manageDevices: access.role === 'wefrotas-admin',
          sendNotifications: access.role === 'wefrotas-admin',
          approveRecords: ['wefrotas-admin', 'wefrotas-gestor', 'wefrotas-aprovador'].includes(access.role),
          editOperations: access.role === 'wefrotas-admin' || access.role === 'wefrotas-gestor',
          deleteRecords: access.role === 'wefrotas-admin',
          readOnly: access.role === 'wefrotas-consulta'
        }
      });
    }

    if (action === 'central-banner-delete') {
      const result = await deleteTenantCentralBanner(req, payload);
      return json(res, 200, { ok: true, ...result });
    }

    if (action === 'wefrotas-users-list') {
      const result = await listWefrotasUsers(req, payload);
      return json(res, 200, { ok: true, ...result });
    }

    if (action === 'wefrotas-user-create') {
      const result = await createWefrotasUser(req, payload);
      await writeWefrotasAudit(createDatabaseClient(req), {
        actorId: result.createdBy,
        action: result.repaired ? 'users.repair' : 'users.create',
        targetId: result.user.id,
        after: { name: result.user.name, email: result.user.email, role: result.user.role, status: result.user.status }, workspaceId: result.workspaceId, organization: result.organization
      }).catch((error) => console.error('Conta salva, mas a auditoria do usuário falhou: ' + (error?.message || error)));
      log(`Conta WeFrotas ${result.repaired ? 'reparada' : 'criada'} por ${result.createdBy}: ${result.user.id}`);
      return json(res, 200, { ok: true, user: result.user, repaired: result.repaired === true });
    }

    if (action === 'wefrotas-user-update') {
      const result = await updateWefrotasUser(req, payload);
      await writeWefrotasAudit(createDatabaseClient(req), {
        actorId: result.managerId,
        action: result.repaired ? 'users.repair' : (payload.password ? 'users.updateWithPassword' : 'users.update'),
        targetId: result.user.id,
        before: { name: result.before.name, email: result.before.email, role: result.before.role, status: result.before.status },
        after: { name: result.user.name, email: result.user.email, role: result.user.role, status: result.user.status }, workspaceId: result.workspaceId, organization: result.organization
      }).catch((error) => console.error('Conta atualizada, mas a auditoria do usuário falhou: ' + (error?.message || error)));
      return json(res, 200, { ok: true, user: result.user, repaired: result.repaired === true });
    }

    if (action === 'harden-permissions') {
      const access = await assertAdmin(req); const senderId = access.userId; const workspaceId = access.organization.workspaceId;
      const databases = createDatabaseClient(req);
      const hardened = await hardenWefrotasPermissions(databases, access.organization);
      await writeWefrotasAudit(databases, { actorId: senderId, action: 'permissions.harden', targetId: workspaceId, after: hardened, workspaceId, organization: access.organization });
      log('Permissões de ponta a ponta reforçadas por ' + senderId + ': ' + JSON.stringify(hardened));
      return json(res, 200, { ok: true, hardened });
    }

    if (action === 'central-finance-append') {
      const access = await assertCentralApprover(req); const senderId = access.userId; const workspaceId = access.organization.workspaceId;
      const databases = createDatabaseClient(req);
      const result = await appendApprovedFinanceEntry(databases, senderId, payload, access.organization);
      return json(res, 200, { ok: true, ...result });
    }

    if (action === 'central-record-update') {
      const access = await assertCentralApprover(req); const senderId = access.userId; const workspaceId = access.organization.workspaceId;
      const databases = createDatabaseClient(req);
      const record = await updateCentralRecordStatus(databases, senderId, payload, access.organization);
      return json(res, 200, { ok: true, record });
    }

    if (action === 'central-record-delete') {
      const access = await assertAdmin(req); const senderId = access.userId;
      const result = await deleteCentralRecord(createDatabaseClient(req), senderId, payload, access.organization);
      return json(res, 200, { ok: true, ...result });
    }

    if (action === 'stats') {
      const access = await assertAdmin(req); const workspaceId = access.organization.workspaceId;
      const databases = createDatabaseClient(req);
      const subscriptions = await listSubscriptions(databases, workspaceId);
      const snapshot = await getWefrotasSnapshot(databases, workspaceId).catch(() => ({}));
      const directory = await listDriverDirectory(databases, workspaceId).catch(() => []);
      const devices = await Promise.all(subscriptions.map(async (document) => {
        const id = String(document.$id || '');
        const profileSync = await resolveCentralDeviceProfile(databases, id, snapshot, directory, workspaceId).catch(() => ({ configured: false, linked: false, updatedAt: '', appliedAt: '', profile: null }));
        return {
          id,
          userAgent: String(document.userAgent || ''),
          active: document.active !== false,
          updatedAt: String(document.updatedAt || document.$updatedAt || ''),
          presence: getSubscriptionPresence(document.updatedAt || document.$updatedAt, document.active !== false),
          driverId: String(profileSync.profile?.driverId || ''),
          vehicleId: String(profileSync.profile?.vehicleId || ''),
          linkUpdatedAt: String(profileSync.updatedAt || ''),
          linkAppliedAt: String(profileSync.appliedAt || ''),
          linkConfigured: profileSync.configured === true
        };
      }));
      return json(res, 200, { ok: true, subscribers: subscriptions.length, devices });
    }

    if (action === 'delete-subscription') {
      const access = await assertAdmin(req); const senderId = access.userId; const workspaceId = access.organization.workspaceId;
      const databases = createDatabaseClient(req);
      const subscription = await databases.getDocument({ databaseId: DATABASE_ID, collectionId: COLLECTION_ID, documentId: String(payload.subscriptionId || '') });
      if (String(subscription.workspaceId || WEFROTAS_COMPANY_ID) !== workspaceId) throw Object.assign(new Error('Este dispositivo pertence a outra empresa.'), { status: 403 });
      const subscriptionId = await deleteSubscription(databases, payload.subscriptionId);
      log('Inscrição de aparelho removida por ' + senderId + ': ' + subscriptionId);
      return json(res, 200, { ok: true, subscriptionId });
    }

    if (action === 'reset-onboarding') {
      const access = await assertAdmin(req); const senderId = access.userId; const workspaceId = access.organization.workspaceId;
      const databases = createDatabaseClient(req);
      const config = await resetCentralOnboarding(databases, senderId, access.organization);
      log('Nova configuração obrigatória da Central criada por ' + senderId + ': ' + config.version);
      return json(res, 200, { ok: true, ...config });
    }

    if (action === 'broadcast') {
      const access = await assertAdmin(req); const senderId = access.userId; const workspaceId = access.organization.workspaceId;
      const databases = createDatabaseClient(req);
      const result = await broadcast(databases, payload, log, workspaceId);
      log('Notificação geral enviada por ' + senderId + ': ' + JSON.stringify(result));
      return json(res, 200, { ok: true, ...result });
    }

    if (action === 'notify') {
      const access = await assertCentralApprover(req); const senderId = access.userId; const workspaceId = access.organization.workspaceId;
      const databases = createDatabaseClient(req);
      const result = await notifySubscription(databases, payload, log, workspaceId);
      log('Notificação individual enviada por ' + senderId + ': ' + JSON.stringify(result));
      return json(res, 200, { ok: true, ...result });
    }

    if (action === 'claim-approval') {
      const access = await assertCentralApprover(req); const senderId = access.userId; const workspaceId = access.organization.workspaceId;
      const databases = createDatabaseClient(req);
      const result = await claimCentralApproval(databases, senderId, payload, workspaceId);
      return json(res, 200, { ok: true, ...result });
    }

    if (action === 'complete-approval') {
      const access = await assertCentralApprover(req); const senderId = access.userId; const workspaceId = access.organization.workspaceId;
      const databases = createDatabaseClient(req);
      const result = await completeCentralApproval(databases, senderId, payload, workspaceId);
      return json(res, 200, { ok: true, ...result });
    }

    if (action === 'release-approval') {
      const access = await assertCentralApprover(req); const senderId = access.userId; const workspaceId = access.organization.workspaceId;
      const databases = createDatabaseClient(req);
      const result = await releaseCentralApproval(databases, senderId, payload, workspaceId);
      return json(res, 200, { ok: true, ...result });
    }

    return json(res, 400, { ok: false, error: 'Ação inválida.' });
  } catch (caught) {
    error(caught?.stack || caught?.message || String(caught));
    return json(res, Number(caught?.status || caught?.code || 500), {
      ok: false,
      error: caught?.message || 'Erro interno no serviço de notificações.'
    });
  }
};



