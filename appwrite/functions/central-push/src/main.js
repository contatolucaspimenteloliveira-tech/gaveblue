import crypto from 'node:crypto';
import { Account, Client, Databases, Query } from 'node-appwrite';
import webpush from 'web-push';

const DATABASE_ID = process.env.DATABASE_ID || '6a68ce8c000a36a44d98';
const COLLECTION_ID = process.env.COLLECTION_ID || 'central_push_subscriptions';
const CENTRAL_RECORDS_COLLECTION_ID = process.env.CENTRAL_RECORDS_COLLECTION_ID || 'central_registros_pendentes';
const DRIVER_DIRECTORY_COLLECTION_ID = process.env.DRIVER_DIRECTORY_COLLECTION_ID || 'central_driver_directory';
const APPROVAL_LOCKS_COLLECTION_ID = process.env.APPROVAL_LOCKS_COLLECTION_ID || 'central_approval_locks';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:adm01@covreecia.com.br';
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const ADMIN_USER_IDS = new Set(
  String(process.env.ADMIN_USER_IDS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
);

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

function createDatabaseClient(req) {
  const endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT;
  const project = process.env.APPWRITE_FUNCTION_PROJECT_ID;
  const key = String(req.headers?.['x-appwrite-key'] || process.env.APPWRITE_FUNCTION_API_KEY || '').trim();
  if (!endpoint || !project || !key) {
    throw new Error('As variáveis automáticas da função Appwrite não estão disponíveis.');
  }
  const client = new Client().setEndpoint(endpoint).setProject(project).setKey(key);
  return new Databases(client);
}

function assertPushConfigured() {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    throw new Error('As chaves VAPID ainda não foram configuradas na função.');
  }
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

async function assertAdmin(req) {
  const userId = String(req.headers?.['x-appwrite-user-id'] || '').trim();
  const userJwt = String(req.headers?.['x-appwrite-user-jwt'] || '').trim();
  if (!userId || !userJwt || !ADMIN_USER_IDS.has(userId)) {
    const error = new Error('Seu usuário não está autorizado a enviar notificações gerais.');
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
  } catch (caught) {
    const error = new Error('Não foi possível validar sua sessão administrativa.');
    error.status = 403;
    throw error;
  }

  return userId;
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
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title, body, url, tag: tagPrefix + '-' + Date.now() }),
      { TTL: 86400, urgency: 'normal' }
    );
    return { sent: 1, failed: 0 };
  } catch (error) {
    const statusCode = Number(error?.statusCode || 0);
    if (statusCode === 404 || statusCode === 410) {
      await markInactive(databases, document.$id);
    }
    log('Falha de push ' + document.$id + ': ' + (error?.message || statusCode));
    throw error;
  }
}

async function notifySubscription(databases, payload, log) {
  assertPushConfigured();
  const subscriptionId = String(payload.subscriptionId || '').trim();
  if (!/^[a-f0-9]{36}$/i.test(subscriptionId)) {
    const error = new Error('O registro não possui um aparelho de origem válido.');
    error.status = 400;
    throw error;
  }
  let document;
  try {
    document = await databases.getDocument({
      databaseId: DATABASE_ID,
      collectionId: COLLECTION_ID,
      documentId: subscriptionId
    });
  } catch (error) {
    if (Number(error?.code) === 404) {
      const notFound = new Error('O aparelho de origem não está mais inscrito.');
      notFound.status = 404;
      throw notFound;
    }
    throw error;
  }
  const result = await sendToSubscription(databases, document, payload, log, 'central-retorno');
  return { subscribers: 1, ...result };
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
      return json(res, 200, { ok: true, subscriptionId });
    }

    if (action === 'unsubscribe') {
      const databases = createDatabaseClient(req);
      const subscriptionId = await disableSubscription(databases, payload);
      return json(res, 200, { ok: true, subscriptionId });
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

    if (action === 'stats') {
      await assertAdmin(req);
      const databases = createDatabaseClient(req);
      const subscriptions = await listSubscriptions(databases);
      const devices = subscriptions.map((document) => ({
        id: String(document.$id || ''),
        userAgent: String(document.userAgent || ''),
        active: document.active !== false,
        updatedAt: String(document.updatedAt || document.$updatedAt || '')
      }));
      return json(res, 200, { ok: true, subscribers: subscriptions.length, devices });
    }

    if (action === 'broadcast') {
      const senderId = await assertAdmin(req);
      const databases = createDatabaseClient(req);
      const result = await broadcast(databases, payload, log);
      log('Notificação geral enviada por ' + senderId + ': ' + JSON.stringify(result));
      return json(res, 200, { ok: true, ...result });
    }

    if (action === 'notify') {
      const senderId = await assertAdmin(req);
      const databases = createDatabaseClient(req);
      const result = await notifySubscription(databases, payload, log);
      log('Notificação individual enviada por ' + senderId + ': ' + JSON.stringify(result));
      return json(res, 200, { ok: true, ...result });
    }

    if (action === 'claim-approval') {
      const senderId = await assertAdmin(req);
      const databases = createDatabaseClient(req);
      const result = await claimCentralApproval(databases, senderId, payload);
      return json(res, 200, { ok: true, ...result });
    }

    if (action === 'complete-approval') {
      const senderId = await assertAdmin(req);
      const databases = createDatabaseClient(req);
      const result = await completeCentralApproval(databases, senderId, payload);
      return json(res, 200, { ok: true, ...result });
    }

    if (action === 'release-approval') {
      const senderId = await assertAdmin(req);
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



