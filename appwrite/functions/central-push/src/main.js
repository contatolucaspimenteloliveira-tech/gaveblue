import crypto from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { Account, Client, Databases, Query } from 'node-appwrite';
import webpush from 'web-push';

const DATABASE_ID = process.env.DATABASE_ID || '6a68ce8c000a36a44d98';
const COLLECTION_ID = process.env.COLLECTION_ID || 'central_push_subscriptions';
const CENTRAL_RECORDS_COLLECTION_ID = process.env.CENTRAL_RECORDS_COLLECTION_ID || 'central_registros_pendentes';
const DRIVER_DIRECTORY_COLLECTION_ID = process.env.DRIVER_DIRECTORY_COLLECTION_ID || 'central_driver_directory';
const APPROVAL_LOCKS_COLLECTION_ID = process.env.APPROVAL_LOCKS_COLLECTION_ID || 'central_approval_locks';
const WEFROTAS_TABLE_ID = process.env.WEFROTAS_TABLE_ID || 'gaveblue_wefrotas';
const WEFROTAS_COMPANY_ID = process.env.WEFROTAS_COMPANY_ID || 'covre-e-cia';
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

function wefrotasSnapshotDocumentId() {
  return crypto.createHash('sha256').update(WEFROTAS_COMPANY_ID).digest('hex').slice(0, 36);
}

function wefrotasSnapshotChunkDocumentId(generation, index) {
  return crypto.createHash('sha256').update(`${WEFROTAS_COMPANY_ID}:snapshot:${generation}:${index}`).digest('hex').slice(0, 36);
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

async function listCentralStations(databases) {
  const row = await databases.getDocument({
    databaseId: DATABASE_ID,
    collectionId: WEFROTAS_TABLE_ID,
    documentId: wefrotasSnapshotDocumentId()
  });
  const snapshot = await decodeWefrotasSnapshot(databases, row?.snapshot);
  const stations = Array.isArray(snapshot?.suppliers) ? snapshot.suppliers : [];
  return stations
    .filter((supplier) => String(supplier?.tipo || '') === 'posto' && supplier?.ativo !== false)
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

    if (action === 'stations') {
      const databases = createDatabaseClient(req);
      const stations = await listCentralStations(databases);
      return json(res, 200, { ok: true, stations, updatedAt: new Date().toISOString() });
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



