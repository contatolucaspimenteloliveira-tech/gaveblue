import { categories as baseCategories, cityCenter } from "./data.js";
import { distanceKm, formatDate, mapsUrl, openStatus, route } from "./utils.js";
import { store } from "./state.js";

export const qs = (selector, root = document) => root.querySelector(selector);
export const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

export const categoryById = (id, categories = baseCategories) => categories.find((category) => category.id === id) ?? { name: id, icon: "📍" };

export function logo() {
  return `<button class="brand" data-route="/home" aria-label="TáOnde"><span>Tá</span><i>Onde</i></button>`;
}

export function topBar(title = "TáOnde", back = false) {
  return `
    <div class="offline-banner">Sem conexão • Mostrando recursos salvos</div>
    <header class="topbar">
      ${back ? `<button class="icon-btn" data-back aria-label="Voltar">‹</button>` : logo()}
      ${back ? `<strong>${title}</strong>` : `<div class="top-actions"><button class="icon-btn" aria-label="Notificações">⌁</button><button class="avatar" aria-label="Perfil"></button></div>`}
    </header>
  `;
}

export function bottomNav(active) {
  const items = [
    ["home", "Home", "⌂", "/home"],
    ["explorar", "Explorar", "⌕", "/explorar"],
    ["mapa", "Mapa", "⌖", "/mapa"],
    ["eventos", "Eventos", "▣", "/eventos"],
    ["mais", "Mais", "⋯", "/mais"]
  ];
  return `
    <nav class="bottom-nav" aria-label="Menu principal">
      ${items.map(([id, label, icon, path]) => `
        <button class="${active === id ? "active" : ""}" data-route="${path}">
          <span>${icon}</span><small>${label}</small>
        </button>
      `).join("")}
    </nav>
  `;
}

export function searchBox(value = "", autofocus = false) {
  return `
    <form class="search-box" data-search-form>
      <span>⌕</span>
      <input ${autofocus ? "autofocus" : ""} name="q" value="${value}" placeholder="Preciso de..." autocomplete="off" />
      <button type="submit" aria-label="Buscar">↵</button>
    </form>
  `;
}

export function sectionTitle(title, action = "") {
  return `<div class="section-title"><h2>${title}</h2>${action}</div>`;
}

export function statusPill(status) {
  return `<span class="status ${status.open ? "open" : "closed"}">${status.open ? "●" : "●"} ${status.label}</span>`;
}

export function ratingText(item) {
  return typeof item.rating === "number" ? `★ ${item.rating.toFixed(1)} (${item.reviewCount || 0})` : "Sem avaliações";
}

export function placeCard(place, categories, compact = false) {
  const cat = categoryById(place.category, categories);
  const status = place.status ?? openStatus(place.hours);
  const distance = place.distance ?? distanceKm(cityCenter, place);
  return `
    <article class="place-card ${compact ? "compact" : ""}">
      <img src="${place.cover}" alt="${place.name}" loading="lazy" />
      <div>
        <strong>${place.name}</strong>
        <p>${cat.icon} ${place.subcategory || cat.name} • ${place.neighborhood}</p>
        <div class="meta"><span>${ratingText(place)}</span><span>${distance.toFixed(1)} km</span></div>
        ${statusPill(status)}
        ${place.sourceName ? `<small class="source-chip">${place.verified ? "Fonte pública" : "A validar"} • ${place.sourceName}</small>` : ""}
      </div>
      <button class="chevron" data-route="/local/${place.slug}" aria-label="Ver estabelecimento">›</button>
    </article>
  `;
}

export function miniPlaceCard(place, categories) {
  const cat = categoryById(place.category, categories);
  return `
    <button class="mini-card" data-route="/local/${place.slug}">
      <img src="${place.cover}" alt="${place.name}" loading="lazy" />
      <strong>${place.name}</strong>
      <span>${cat.name}</span>
      <small>${typeof place.rating === "number" ? `★ ${place.rating.toFixed(1)}` : "Fonte pública"}</small>
    </button>
  `;
}

export function categoryGrid(categories, selected = "") {
  return `<div class="category-grid">${categories.filter((c) => c.active).sort((a, b) => a.order - b.order).map((cat) => `
    <button class="category-tile ${selected === cat.id ? "selected" : ""}" data-category="${cat.id}">
      <span>${cat.icon}</span><strong>${cat.name}</strong>
    </button>
  `).join("")}</div>`;
}

export function eventCard(event, large = false) {
  return `
    <article class="event-card ${large ? "large" : ""}" data-route="/evento/${event.slug}">
      <img src="${event.image}" alt="${event.name}" loading="lazy" />
      <div>
        <time>${formatDate(event.date)} • ${event.time}</time>
        <strong>${event.name}</strong>
        <p>${event.place} • ${event.address}</p>
        <span class="price">${event.free ? "Grátis" : event.price}</span>
        ${event.sourceName ? `<small class="source-chip">Fonte pública • ${event.sourceName}</small>` : ""}
      </div>
    </article>
  `;
}

export function emptyState(title, text, action = "") {
  return `<div class="state-card"><strong>${title}</strong><p>${text}</p>${action}</div>`;
}

export function bindCommon(root = document) {
  qsa("[data-route]", root).forEach((el) => el.addEventListener("click", () => route(el.dataset.route)));
  qsa("[data-back]", root).forEach((el) => el.addEventListener("click", () => history.back()));
  qsa("[data-search-form]", root).forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    const q = new FormData(form).get("q").trim();
    if (q) {
      store.addRecentSearch(q);
      route(`/busca?q=${encodeURIComponent(q)}`);
    }
  }));
  qsa("[data-map]", root).forEach((el) => el.addEventListener("click", () => {
    const { id, type } = el.dataset;
    const data = store.getData();
    const item = type === "event" ? data.events.find((event) => event.id === id) : data.establishments.find((place) => place.id === id);
    if (item) window.open(mapsUrl(item), "_blank", "noopener");
  }));
}
