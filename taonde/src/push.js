import { store } from "./state.js";

const api = (path) => `${location.origin}${path}`;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

async function getPublicKey() {
  const response = await fetch(api("/api/vapid-public-key"));
  if (!response.ok) throw new Error("Não foi possível buscar a chave pública de push.");
  const data = await response.json();
  if (!data.publicKey) throw new Error("VAPID_PUBLIC_KEY não configurada no servidor.");
  return data.publicKey;
}

export async function enableRealPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    throw new Error("Este navegador não suporta Web Push.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    store.saveNotificationPrefs({ enabled: false, permission });
    throw new Error("Permissão de notificação negada.");
  }

  const registration = await navigator.serviceWorker.ready;
  const publicKey = await getPublicKey();
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });
  }

  const response = await fetch(api("/api/subscribe"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subscription: subscription.toJSON(),
      city: "Pinheiros",
      state: "ES",
      audience: "todos",
      userAgent: navigator.userAgent
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) throw new Error(data.detail || data.error || "Falha ao salvar inscrição push.");

  store.saveNotificationPrefs({ enabled: true, permission, realPush: true });
  return true;
}

export async function sendRealPush({ title, body, audience, link, adminToken }) {
  const response = await fetch(api("/api/notify"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({ title, body, audience, link })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) throw new Error(data.detail || data.error || "Falha ao enviar push real.");
  return data;
}
