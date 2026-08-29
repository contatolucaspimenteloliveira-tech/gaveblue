import crypto from 'node:crypto';
import { gunzipSync, gzipSync } from 'node:zlib';
import { Account, Client, Databases, ID, Permission, Query, Role, Users } from 'node-appwrite';
import webpush from 'web-push';

const DATABASE_ID = process.env.DATABASE_ID || '6a68ce8c000a36a44d98';
const COLLECTION_ID = process.env.COLLECTION_ID || 'central_push_subscriptions';
const CENTRAL_RECORDS_COLLECTION_ID = process.env.CENTRAL_RECORDS_COLLECTION_ID || 'central_registros_pendentes';
const DRIVER_DIRECTORY_COLLECTION_ID = process.env.DRIVER_DIRECTORY_COLLECTION_ID || 'central_driver_directory';
const CENTRAL_BANNERS_COLLECTION_ID = process.env.CENTRAL_BANNERS_COLLECTION_ID || 'central_home_banners';
const APPROVAL_LOCKS_COLLECTION_ID = process.env.APPROVAL_LOCKS_COLLECTION_ID || 'central_approval_locks';
const WEFROTAS_TABLE_ID = process.env.WEFROTAS_TABLE_ID || 'gaveblue_wefrotas';
const WEFROTAS_COMPANY_ID = process.env.WEFROTAS_COMPANY_ID || 'covre-e-cia';
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

function subscriptionDocumentId(endpoint) {
  return crypto.createHash('sha256').update(endpoint).digest('hex').slice(0, 36);
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
const WEFROTAS_APPWRITE_LABELS = new Set(Object.values(WEFROTAS_ROLE_LABELS));

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
    return { userId, user: authenticatedUser, role: getWefrotasRole(authenticatedUser, userId) };
  } catch (caught) {
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
  return access.userId;
}

async function assertAccessRole(req, allowedRoles, message = 'Seu perfil não possui permissão para esta ação.') {
  const access = await authenticateManager(req);
  if (!allowedRoles.includes(access.role)) {
    const error = new Error(message);
    error.status = 403;
    throw error;
  }
  return access.userId;
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

const WEFROTAS_SNAPSHOT_PERMISSIONS = buildDocumentPermissions({
  authenticatedRead: true,
  update: ROLE_PERMISSION_LABELS.admin,
  remove: ROLE_PERMISSION_LABELS.admin
});
const CENTRAL_RECORD_PERMISSIONS = buildDocumentPermissions({
  authenticatedRead: true,
  update: ROLE_PERMISSION_LABELS.admin,
  remove: ROLE_PERMISSION_LABELS.admin
});
const CENTRAL_PUBLIC_MANAGEMENT_PERMISSIONS = buildDocumentPermissions({
  publicRead: true,
  update: ROLE_PERMISSION_LABELS.admin,
  remove: ROLE_PERMISSION_LABELS.admin
});
const ADMIN_READ_PERMISSIONS = buildDocumentPermissions({ read: ROLE_PERMISSION_LABELS.admin });

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

async function listWefrotasUsers(req, payload) {
  await assertAdmin(req);
  const search = String(payload.search || '').trim().slice(0, 120);
  const queries = [Query.limit(100)];
  const result = await new Users(createServerClient(req)).list({ queries, ...(search ? { search } : {}) });
  const users = (result?.users || []).map(normalizeManagedUser).sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  return { users, total: Number(result?.total || 0) };
}

async function createWefrotasUser(req, payload) {
  const creatorId = await assertAdmin(req);
  const name = String(payload.name || '').trim().slice(0, 128);
  const email = String(payload.email || '').trim().toLowerCase().slice(0, 320);
  const password = String(payload.password || '');
  const role = assertManagedRole(payload.role);
  if (name.length < 2) throw Object.assign(new Error('Informe o nome do usuário.'), { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Object.assign(new Error('Informe um e-mail válido.'), { status: 400 });
  if (password.length < 8) throw Object.assign(new Error('A senha temporária deve ter pelo menos 8 caracteres.'), { status: 400 });
  const users = new Users(createServerClient(req));
  const created = await users.create({ userId: ID.unique(), email, password, name });
  let updated;
  try {
    updated = await users.updateLabels({ userId: created.$id, labels: normalizeAppwriteLabels([getAppwriteRoleLabel(role)]) });
  } catch (error) {
    await users.delete({ userId: created.$id }).catch(() => undefined);
    throw error;
  }
  return { user: normalizeManagedUser(updated), createdBy: creatorId };
}

async function updateWefrotasUser(req, payload) {
  const managerId = await assertAdmin(req);
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
  const before = normalizeManagedUser(await users.get({ userId }));
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
      return !WEFROTAS_ACCESS_ROLES.has(normalized) && !WEFROTAS_APPWRITE_LABELS.has(normalized) && normalized !== 'administrador';
    });
    const labels = normalizeAppwriteLabels([...preservedLabels, getAppwriteRoleLabel(payload.role)]);
    await users.updateLabels({ userId, labels });
  }
  if (payload.status !== undefined) await users.updateStatus({ userId, status: payload.status === true });
  return { user: normalizeManagedUser(await users.get({ userId })), before, managerId };
}

async function ensureAdminAppwriteLabel(req, userId) {
  const users = new Users(createServerClient(req));
  const user = await users.get({ userId });
  const labels = normalizeAppwriteLabels(user?.labels);
  if (labels.includes('admin')) return;
  const nextLabels = [...labels.filter((label) => !WEFROTAS_APPWRITE_LABELS.has(label)), 'admin'];
  await users.updateLabels({ userId, labels: nextLabels });
}

async function saveSubscription(databases, payload) {
  const subscription = payload.subscription || {};
  const endpoint = String(subscription.endpoint || '').trim();
  const p256dh = String(subscription.keys?.p256dh || '').trim();
  const auth = String(subscription.keys?.auth || '').trim();
  if (!endpoint.startsWith('https://') || !p256dh || !auth) {
    const error = new Error('Inscrição de push inválida.');
    error.status = 400;
    throw error;
  }

  const documentId = subscriptionDocumentId(endpoint);
  const data = {
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
  return documentId;
}

async function disableSubscription(databases, payload) {
  const endpoint = String(payload.subscription?.endpoint || '').trim();
  if (!endpoint.startsWith('https://')) {
    const error = new Error('Inscrição de push inválida.');
    error.status = 400;
    throw error;
  }
  const documentId = subscriptionDocumentId(endpoint);
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

async function listSubscriptions(databases) {
  const documents = [];
  let offset = 0;
  while (true) {
    const page = await databases.listDocuments({
      databaseId: DATABASE_ID,
      collectionId: COLLECTION_ID,
      queries: [Query.limit(100), Query.offset(offset)]
    });
    documents.push(...page.documents.filter((document) => document.active !== false));
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

async function touchSubscriptionPresence(databases, payload) {
  const documentId = String(payload.subscriptionId || '').trim();
  if (!isValidSubscriptionId(documentId)) {
    const error = new Error('Identificador do aparelho inválido.');
    error.status = 400;
    throw error;
  }
  const updatedAt = new Date().toISOString();
  const data = { active: true, updatedAt };
  const userAgent = String(payload.userAgent || '').trim();
  if (userAgent) data.userAgent = userAgent.slice(0, 1024);
  try {
    await databases.updateDocument({ databaseId: DATABASE_ID, collectionId: COLLECTION_ID, documentId, data });
    return { touched: true, updatedAt };
  } catch (error) {
    if (Number(error?.code) !== 404) throw error;
    return { touched: false, updatedAt: '' };
  }
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

async function listDriverDirectory(databases) {
  const rows = [];
  let offset = 0;
  while (true) {
    const page = await databases.listDocuments({
      databaseId: DATABASE_ID,
      collectionId: DRIVER_DIRECTORY_COLLECTION_ID,
      queries: [Query.limit(100), Query.offset(offset)]
    });
    rows.push(...page.documents.filter((document) => document.active !== false));
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

function wefrotasSnapshotDocumentId() {
  return crypto.createHash('sha256').update(WEFROTAS_COMPANY_ID).digest('hex').slice(0, 36);
}

function wefrotasSnapshotChunkDocumentId(generation, index) {
  return crypto.createHash('sha256').update(`${WEFROTAS_COMPANY_ID}:snapshot:${generation}:${index}`).digest('hex').slice(0, 36);
}

const CENTRAL_ONBOARDING_FALLBACK_VERSION = '2026-08-managed-onboarding-v3';

function centralOnboardingConfigDocumentId() {
  return crypto.createHash('sha256').update(`${WEFROTAS_COMPANY_ID}:central-onboarding-config`).digest('hex').slice(0, 36);
}

function normalizeOnboardingVersion(value) {
  return String(value || '').trim().replace(/[^a-zA-Z0-9._:-]/g, '').slice(0, 120);
}

async function getCentralOnboardingConfig(databases) {
  try {
    const row = await databases.getDocument({
      databaseId: DATABASE_ID,
      collectionId: WEFROTAS_TABLE_ID,
      documentId: centralOnboardingConfigDocumentId()
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

async function resetCentralOnboarding(databases, senderId) {
  const updatedAt = new Date().toISOString();
  const version = `central-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;
  await updateOrCreateWefrotasRow(databases, centralOnboardingConfigDocumentId(), {
    workspaceId: WEFROTAS_COMPANY_ID,
    snapshot: JSON.stringify({ version, updatedAt }),
    updatedAt,
    updatedBy: senderId
  });
  return { version, updatedAt };
}

async function decodeWefrotasSnapshot(databases, storedValue) {
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
          documentId: wefrotasSnapshotChunkDocumentId(manifest.generation, index + offset)
        })
      ));
      chunks.push(...batch.map((row) => String(row?.snapshot || '')));
    }
    return decodeWefrotasSnapshot(databases, chunks.join(''));
  }
  if (value.startsWith('gzip-base64:')) {
    return JSON.parse(gunzipSync(Buffer.from(value.slice('gzip-base64:'.length), 'base64')).toString('utf8'));
  }
  return JSON.parse(value || '{}');
}

async function listCentralDirectory(databases) {
  const row = await databases.getDocument({
    databaseId: DATABASE_ID,
    collectionId: WEFROTAS_TABLE_ID,
    documentId: wefrotasSnapshotDocumentId()
  });
  const snapshot = await decodeWefrotasSnapshot(databases, row?.snapshot);
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

async function writeWefrotasAudit(databases, { actorId, action, targetId = '', before = null, after = null, justification = '', result = 'success' }) {
  const updatedAt = new Date().toISOString();
  const documentId = crypto.createHash('sha256')
    .update(`audit:${updatedAt}:${actorId}:${action}:${targetId}:${crypto.randomUUID()}`)
    .digest('hex')
    .slice(0, 36);
  await updateOrCreateWefrotasRow(databases, documentId, {
    workspaceId: `${WEFROTAS_COMPANY_ID}:audit`,
    snapshot: JSON.stringify({ actorId, action, targetId, before, after, justification: String(justification || '').slice(0, 500), result, createdAt: updatedAt }),
    updatedAt,
    updatedBy: actorId
  }, ADMIN_READ_PERMISSIONS);
}

async function updateCollectionPermissions(databases, collectionId, permissions) {
  let cursor = '';
  let updated = 0;
  do {
    const queries = [Query.limit(100), Query.orderAsc('$id')];
    if (cursor) queries.push(Query.cursorAfter(cursor));
    const page = await databases.listDocuments({ databaseId: DATABASE_ID, collectionId, queries });
    const documents = Array.isArray(page?.documents) ? page.documents : [];
    for (const document of documents) {
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

async function hardenWefrotasPermissions(databases) {
  const results = {};
  results.snapshots = await updateCollectionPermissions(databases, WEFROTAS_TABLE_ID, (document) => (
    String(document?.workspaceId || '').endsWith(':audit') ? ADMIN_READ_PERMISSIONS : WEFROTAS_SNAPSHOT_PERMISSIONS
  ));
  results.centralRecords = await updateCollectionPermissions(databases, CENTRAL_RECORDS_COLLECTION_ID, CENTRAL_RECORD_PERMISSIONS);
  results.driverDirectory = await updateCollectionPermissions(databases, DRIVER_DIRECTORY_COLLECTION_ID, CENTRAL_PUBLIC_MANAGEMENT_PERMISSIONS);
  results.banners = await updateCollectionPermissions(databases, CENTRAL_BANNERS_COLLECTION_ID, CENTRAL_PUBLIC_MANAGEMENT_PERMISSIONS);
  results.approvalLocks = await updateCollectionPermissions(databases, APPROVAL_LOCKS_COLLECTION_ID, []);
  results.pushSubscriptions = await updateCollectionPermissions(databases, COLLECTION_ID, []);
  return results;
}

async function persistWefrotasSnapshot(databases, snapshot, senderId) {
  const serialized = JSON.stringify(snapshot);
  const compressed = `gzip-base64:${gzipSync(Buffer.from(serialized, 'utf8')).toString('base64')}`;
  const storedSnapshot = compressed.length < serialized.length ? compressed : serialized;
  const rowId = wefrotasSnapshotDocumentId();
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
        updateOrCreateWefrotasRow(databases, wefrotasSnapshotChunkDocumentId(generation, start + index), {
          workspaceId: WEFROTAS_COMPANY_ID,
          snapshot: chunk,
          updatedAt,
          updatedBy: senderId
        }, WEFROTAS_SNAPSHOT_PERMISSIONS)
      )));
    }
    primarySnapshot = `chunked-v1:${JSON.stringify({ generation, count: chunks.length, length: storedSnapshot.length })}`;
  }

  await updateOrCreateWefrotasRow(databases, rowId, {
    workspaceId: WEFROTAS_COMPANY_ID,
    snapshot: primarySnapshot,
    updatedAt,
    updatedBy: senderId
  }, WEFROTAS_SNAPSHOT_PERMISSIONS);
}

async function appendApprovedFinanceEntry(databases, senderId, payload = {}) {
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

  const lockId = approvalLockDocumentId('__finance_snapshot__');
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
    const row = await databases.getDocument({ databaseId: DATABASE_ID, collectionId: WEFROTAS_TABLE_ID, documentId: wefrotasSnapshotDocumentId() });
    const snapshot = await decodeWefrotasSnapshot(databases, row?.snapshot);
    const finance = Array.isArray(snapshot?.finance) ? [...snapshot.finance] : [];
    const existing = finance.find((item) => (
      String(item?.centralRecordId || '') === centralRecordId || String(item?.id || '') === entryId
    ));
    if (existing) return { created: false, entryId: String(existing.id || entryId), centralRecordId };

    finance.unshift(entry);
    snapshot.finance = finance;
    await persistWefrotasSnapshot(databases, snapshot, senderId);
    await writeWefrotasAudit(databases, {
      actorId: senderId,
      action: 'central.finance.append',
      targetId: centralRecordId,
      after: { entryId, entryType: String(entry.entryType || entry.kind || ''), total: Number(entry.total || 0) }
    });
    return { created: true, entryId, centralRecordId };
  } finally {
    if (locked) {
      await databases.deleteDocument({ databaseId: DATABASE_ID, collectionId: APPROVAL_LOCKS_COLLECTION_ID, documentId: lockId }).catch(() => undefined);
    }
  }
}

async function updateCentralRecordStatus(databases, senderId, payload = {}) {
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
    permissions: CENTRAL_RECORD_PERMISSIONS
  });
  await writeWefrotasAudit(databases, {
    actorId: senderId,
    action: `central.record.${status}`,
    targetId: recordId,
    before: { status: String(before?.status || ''), resolucao: String(before?.resolucao || '') },
    after: { status, resolucao, lancamentoFinanceiroId: String(data.lancamentoFinanceiroId || '') },
    justification: resolucao
  });
  return updated;
}

async function migrateCentralStationsToWefrotas(databases, senderId) {
  const row = await databases.getDocument({
    databaseId: DATABASE_ID,
    collectionId: WEFROTAS_TABLE_ID,
    documentId: wefrotasSnapshotDocumentId()
  });
  const snapshot = await decodeWefrotasSnapshot(databases, row?.snapshot);
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
    await persistWefrotasSnapshot(databases, snapshot, senderId);
  }
  return { total: CENTRAL_STATION_DIRECTORY.length, created, updated, unchanged };
}

async function revertImportedCentralStations(databases, senderId) {
  const row = await databases.getDocument({
    databaseId: DATABASE_ID,
    collectionId: WEFROTAS_TABLE_ID,
    documentId: wefrotasSnapshotDocumentId()
  });
  const snapshot = await decodeWefrotasSnapshot(databases, row?.snapshot);
  const suppliers = Array.isArray(snapshot?.suppliers) ? snapshot.suppliers : [];
  const importedIds = new Set(CENTRAL_STATION_DIRECTORY.map((station) => centralStationSupplierId(station.name)));
  const importedMarker = 'Importado da lista original da Central de Registros.';
  const removed = suppliers.filter((supplier) =>
    importedIds.has(String(supplier?.id || '')) &&
    String(supplier?.observacoes || '').trim() === importedMarker
  );
  if (removed.length) {
    snapshot.suppliers = suppliers.filter((supplier) => !removed.includes(supplier));
    await persistWefrotasSnapshot(databases, snapshot, senderId);
  }
  return {
    removed: removed.length,
    stations: removed.map((supplier) => String(supplier?.nome || '')).filter(Boolean)
  };
}

// Quando o navegador renova a inscrição Web Push (algo comum no iPhone), os
// registros antigos continuam apontando para o ID anterior. Reata-os ao
// aparelho atual sem guardar qualquer dado pessoal adicional.
async function linkDeviceSubscription(databases, deviceId, subscriptionId, log) {
  if (!isValidDeviceId(deviceId) || !isValidSubscriptionId(subscriptionId)) return 0;
  try {
    const records = await listHistoryByField(databases, 'deviceId', String(deviceId).trim());
    const outdated = records.filter((record) => String(record.pushSubscriptionId || '').trim() !== subscriptionId);
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

async function listDeviceHistory(databases, payload) {
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

async function claimCentralApproval(databases, senderId, payload) {
  const recordId = assertCentralRecordId(payload.recordId);
  const record = await getCentralRecord(databases, recordId);
  const recordStatus = String(record?.status || 'pendente').toLocaleLowerCase('pt-BR');
  if (recordStatus.includes('aprov') || recordStatus.includes('import')) {
    return { claimed: false, state: 'approved', financeEntryId: String(record?.lancamentoFinanceiroId || '') };
  }
  if (recordStatus.includes('rejeit')) {
    const error = new Error('Este registro já foi rejeitado e não pode ser aprovado sem auditoria.');
    error.status = 409;
    throw error;
  }

  const lockId = approvalLockDocumentId(recordId);
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

async function completeCentralApproval(databases, senderId, payload) {
  const recordId = assertCentralRecordId(payload.recordId);
  const financeEntryId = String(payload.financeEntryId || '').trim().slice(0, 128);
  if (!financeEntryId) {
    const error = new Error('Identificador do lançamento financeiro é obrigatório.');
    error.status = 400;
    throw error;
  }
  const lockId = approvalLockDocumentId(recordId);
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

async function releaseCentralApproval(databases, senderId, payload) {
  const recordId = assertCentralRecordId(payload.recordId);
  const lockId = approvalLockDocumentId(recordId);
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
    notificationId
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

async function notifySubscription(databases, payload, log) {
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

async function broadcast(databases, payload, log) {
  assertPushConfigured();
  const { title, body, url } = getNotificationContent(payload);

  const subscriptions = await listSubscriptions(databases);
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
            tag: 'central-comunicado-' + Date.now()
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
    if (action === 'subscribe') {
      assertPushConfigured();
      const databases = createDatabaseClient(req);
      const subscriptionId = await saveSubscription(databases, payload);
      const linkedRecords = await linkDeviceSubscription(databases, payload.deviceId, subscriptionId, log);
      return json(res, 200, { ok: true, subscriptionId, linkedRecords });
    }

    if (action === 'unsubscribe') {
      const databases = createDatabaseClient(req);
      const subscriptionId = await disableSubscription(databases, payload);
      return json(res, 200, { ok: true, subscriptionId });
    }

    if (action === 'presence') {
      const databases = createDatabaseClient(req);
      const presence = await touchSubscriptionPresence(databases, payload);
      return json(res, 200, { ok: true, ...presence });
    }

    if (action === 'onboarding-config') {
      const databases = createDatabaseClient(req);
      const config = await getCentralOnboardingConfig(databases);
      return json(res, 200, { ok: true, ...config });
    }

    if (action === 'stations') {
      const databases = createDatabaseClient(req);
      const directory = await listCentralDirectory(databases);
      return json(res, 200, { ok: true, ...directory, updatedAt: new Date().toISOString() });
    }

    if (action === 'migrate-central-stations') {
      const senderId = await assertOperationalManager(req);
      const databases = createDatabaseClient(req);
      const result = await migrateCentralStationsToWefrotas(databases, senderId);
      log('Postos da lista original da Central migrados por ' + senderId + ': ' + JSON.stringify(result));
      return json(res, 200, { ok: true, ...result });
    }

    if (action === 'revert-imported-central-stations') {
      const senderId = await assertOperationalManager(req);
      const databases = createDatabaseClient(req);
      const result = await revertImportedCentralStations(databases, senderId);
      log('Importação de postos da Central revertida por ' + senderId + ': ' + JSON.stringify(result));
      return json(res, 200, { ok: true, ...result });
    }

    if (action === 'directory') {
      const databases = createDatabaseClient(req);
      const directory = await listDriverDirectory(databases);
      return json(res, 200, { ok: true, directory });
    }

    if (action === 'history') {
      const databases = createDatabaseClient(req);
      const records = await listDeviceHistory(databases, payload);
      return json(res, 200, { ok: true, records });
    }

    if (action === 'my-access') {
      const access = await authenticateManager(req);
      return json(res, 200, {
        ok: true,
        userId: access.userId,
        role: access.role,
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

    if (action === 'wefrotas-users-list') {
      const result = await listWefrotasUsers(req, payload);
      return json(res, 200, { ok: true, ...result });
    }

    if (action === 'wefrotas-user-create') {
      const result = await createWefrotasUser(req, payload);
      await writeWefrotasAudit(createDatabaseClient(req), {
        actorId: result.createdBy,
        action: 'users.create',
        targetId: result.user.id,
        after: { name: result.user.name, email: result.user.email, role: result.user.role, status: result.user.status }
      });
      log('Conta WeFrotas criada por ' + result.createdBy + ': ' + result.user.id);
      return json(res, 200, { ok: true, user: result.user });
    }

    if (action === 'wefrotas-user-update') {
      const result = await updateWefrotasUser(req, payload);
      await writeWefrotasAudit(createDatabaseClient(req), {
        actorId: result.managerId,
        action: payload.password ? 'users.updateWithPassword' : 'users.update',
        targetId: result.user.id,
        before: { name: result.before.name, email: result.before.email, role: result.before.role, status: result.before.status },
        after: { name: result.user.name, email: result.user.email, role: result.user.role, status: result.user.status }
      });
      return json(res, 200, { ok: true, user: result.user });
    }

    if (action === 'harden-permissions') {
      const senderId = await assertAdmin(req);
      await ensureAdminAppwriteLabel(req, senderId);
      const databases = createDatabaseClient(req);
      const hardened = await hardenWefrotasPermissions(databases);
      await writeWefrotasAudit(databases, { actorId: senderId, action: 'permissions.harden', targetId: WEFROTAS_COMPANY_ID, after: hardened });
      log('Permissões de ponta a ponta reforçadas por ' + senderId + ': ' + JSON.stringify(hardened));
      return json(res, 200, { ok: true, hardened });
    }

    if (action === 'central-finance-append') {
      const senderId = await assertCentralApprover(req);
      const databases = createDatabaseClient(req);
      const result = await appendApprovedFinanceEntry(databases, senderId, payload);
      return json(res, 200, { ok: true, ...result });
    }

    if (action === 'central-record-update') {
      const senderId = await assertCentralApprover(req);
      const databases = createDatabaseClient(req);
      const record = await updateCentralRecordStatus(databases, senderId, payload);
      return json(res, 200, { ok: true, record });
    }

    if (action === 'stats') {
      await assertAdmin(req);
      const databases = createDatabaseClient(req);
      const subscriptions = await listSubscriptions(databases);
      const devices = subscriptions.map((document) => ({
        id: String(document.$id || ''),
        userAgent: String(document.userAgent || ''),
        active: document.active !== false,
        updatedAt: String(document.updatedAt || document.$updatedAt || ''),
        presence: getSubscriptionPresence(document.updatedAt || document.$updatedAt, document.active !== false)
      }));
      return json(res, 200, { ok: true, subscribers: subscriptions.length, devices });
    }

    if (action === 'delete-subscription') {
      const senderId = await assertAdmin(req);
      const databases = createDatabaseClient(req);
      const subscriptionId = await deleteSubscription(databases, payload.subscriptionId);
      log('Inscrição de aparelho removida por ' + senderId + ': ' + subscriptionId);
      return json(res, 200, { ok: true, subscriptionId });
    }

    if (action === 'reset-onboarding') {
      const senderId = await assertAdmin(req);
      const databases = createDatabaseClient(req);
      const config = await resetCentralOnboarding(databases, senderId);
      log('Nova configuração obrigatória da Central criada por ' + senderId + ': ' + config.version);
      return json(res, 200, { ok: true, ...config });
    }

    if (action === 'broadcast') {
      const senderId = await assertAdmin(req);
      const databases = createDatabaseClient(req);
      const result = await broadcast(databases, payload, log);
      log('Notificação geral enviada por ' + senderId + ': ' + JSON.stringify(result));
      return json(res, 200, { ok: true, ...result });
    }

    if (action === 'notify') {
      const senderId = await assertCentralApprover(req);
      const databases = createDatabaseClient(req);
      const result = await notifySubscription(databases, payload, log);
      log('Notificação individual enviada por ' + senderId + ': ' + JSON.stringify(result));
      return json(res, 200, { ok: true, ...result });
    }

    if (action === 'claim-approval') {
      const senderId = await assertCentralApprover(req);
      const databases = createDatabaseClient(req);
      const result = await claimCentralApproval(databases, senderId, payload);
      return json(res, 200, { ok: true, ...result });
    }

    if (action === 'complete-approval') {
      const senderId = await assertCentralApprover(req);
      const databases = createDatabaseClient(req);
      const result = await completeCentralApproval(databases, senderId, payload);
      return json(res, 200, { ok: true, ...result });
    }

    if (action === 'release-approval') {
      const senderId = await assertCentralApprover(req);
      const databases = createDatabaseClient(req);
      const result = await releaseCentralApproval(databases, senderId, payload);
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



