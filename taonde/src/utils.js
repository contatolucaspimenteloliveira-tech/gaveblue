const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export const moneyOrFree = (event) => (event.free ? "Gratuito" : event.price || "Consultar");

export const formatDate = (date) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", weekday: "short" }).format(new Date(`${date}T12:00:00`));

export const distanceKm = (a, b) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const radius = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return radius * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

const minutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export function openStatus(hours, now = new Date()) {
  if (!hours) return { open: false, label: "Horário não informado" };
  const todayKey = dayKeys[now.getDay()];
  const current = now.getHours() * 60 + now.getMinutes();
  const ranges = hours[todayKey] ?? [];
  for (const [start, end] of ranges) {
    const startMin = minutes(start);
    const endMin = minutes(end);
    const overnight = endMin < startMin;
    const isOpen = overnight ? current >= startMin || current <= endMin : current >= startMin && current <= endMin;
    if (isOpen) return { open: true, label: `Aberto agora • Fecha às ${end}` };
  }

  for (let offset = 0; offset < 8; offset += 1) {
    const future = new Date(now);
    future.setDate(now.getDate() + offset);
    const key = dayKeys[future.getDay()];
    const next = (hours[key] ?? [])[0];
    if (!next) continue;
    if (offset === 0 && minutes(next[0]) <= current) continue;
    const prefix = offset === 0 ? "Abre hoje" : offset === 1 ? "Abre amanhã" : `Abre ${new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(future)}`;
    return { open: false, label: `Fechado • ${prefix} às ${next[0]}` };
  }
  return { open: false, label: "Fechado" };
}

export const slugify = (text) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const route = (path) => {
  location.hash = path;
};

export const mapsUrl = (item) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${item.lat},${item.lng}`)}`;

export const shareItem = async (title, url) => {
  const link = `${location.origin}${location.pathname}${url}`;
  if (navigator.share) {
    await navigator.share({ title, url: link });
    return;
  }
  await navigator.clipboard?.writeText(link);
  alert("Link copiado.");
};

const intentMap = [
  { words: ["pneu", "carro", "mecanico", "mecânico", "oficina", "borracharia", "furou"], categories: ["automotivo"] },
  { words: ["fome", "almoco", "almoço", "jantar", "pizza", "pizzaria", "lanche", "comer", "padaria"], categories: ["alimentacao"] },
  { words: ["remedio", "remédio", "farmacia", "farmácia", "dor", "medicamento"], categories: ["farmacias", "saude"] },
  { words: ["hotel", "pousada", "dormir", "hospedar"], categories: ["hospedagem"] },
  { words: ["gasolina", "diesel", "posto", "combustivel", "combustível"], categories: ["postos"] },
  { words: ["mercado", "supermercado", "comprar", "compras"], categories: ["compras"] },
  { words: ["cabelo", "barba", "salao", "salão", "beleza"], categories: ["saude"] },
  { words: ["taxi", "táxi", "uber", "99", "indrive", "corrida", "carona", "moto taxi", "mototaxi"], categories: ["transporte"] },
  { words: ["evento", "hoje", "fazer", "show", "agenda"], categories: ["eventos", "turismo"] }
];

export function searchIntent(term, establishments, events, userLocation) {
  const normalized = term.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const matched = intentMap.filter((item) => item.words.some((word) => normalized.includes(word.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase())));
  const categoryIds = new Set(matched.flatMap((item) => item.categories));
  const textual = establishments.filter((place) => `${place.name} ${place.subcategory} ${place.description} ${place.neighborhood}`.toLowerCase().includes(normalized));
  const byIntent = establishments.filter((place) => categoryIds.has(place.category));
  const results = [...new Map([...byIntent, ...textual].filter((p) => p.active).map((p) => [p.id, p])).values()];
  return {
    categories: [...categoryIds],
    places: results
      .map((place) => ({ ...place, distance: distanceKm(userLocation, place), status: openStatus(place.hours) }))
      .sort((a, b) => Number(b.status.open) - Number(a.status.open) || a.distance - b.distance || (b.rating || 0) - (a.rating || 0)),
    events: categoryIds.has("eventos") ? events.filter((event) => event.active) : []
  };
}
