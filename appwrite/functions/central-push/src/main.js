import crypto from 'node:crypto';
import { Client, Databases, ID, Query } from 'node-appwrite';
import webpush from 'web-push';

const DATABASE_ID = process.env.DATABASE_ID || '6a68ce8c000a36a44d98';
const COLLECTION_ID = process.env.COLLECTION_ID || 'central_push_subscriptions';
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

function createDatabaseClient() {
  const endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT;
  const project = process.env.APPWRITE_FUNCTION_PROJECT_ID;
  const key = process.env.APPWRITE_FUNCTION_API_KEY;
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

function assertAdmin(req) {
  const userId = String(req.headers?.['x-appwrite-user-id'] || '').trim();
  if (!userId || !ADMIN_USER_IDS.has(userId)) {
    const error = new Error('Seu usuário não está autorizado a enviar notificações gerais.');
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

async function broadcast(databases, payload, log) {
  assertPushConfigured();
  const title = String(payload.title || '').trim().slice(0, 60);
  const body = String(payload.body || '').trim().slice(0, 160);
  const url = String(payload.url || './').trim().slice(0, 500);
  if (!title || !body) {
    const error = new Error('Título e subtítulo são obrigatórios.');
    error.status = 400;
    throw error;
  }

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
    const databases = createDatabaseClient();

    if (action === 'subscribe') {
      assertPushConfigured();
      const subscriptionId = await saveSubscription(databases, payload);
      return json(res, 200, { ok: true, subscriptionId });
    }

    if (action === 'stats') {
      assertAdmin(req);
      const subscriptions = await listSubscriptions(databases);
      return json(res, 200, { ok: true, subscribers: subscriptions.length });
    }

    if (action === 'broadcast') {
      const senderId = assertAdmin(req);
      const result = await broadcast(databases, payload, log);
      log('Notificação geral enviada por ' + senderId + ': ' + JSON.stringify(result));
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
