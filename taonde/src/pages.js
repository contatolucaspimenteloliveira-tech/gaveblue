import { banners, cityCenter } from "./data.js";
import { store } from "./state.js";
import { bindCommon, bottomNav, categoryById, categoryGrid, emptyState, eventCard, miniPlaceCard, placeCard, qs, qsa, ratingText, searchBox, sectionTitle, statusPill, topBar } from "./components.js";
import { distanceKm, formatDate, mapsUrl, moneyOrFree, openStatus, route, searchIntent, shareItem, slugify } from "./utils.js";

let userLocation = cityCenter;

export function setUserLocation(position) {
  userLocation = position;
}

const shell = (content, active, top = "") => `${top}<main class="screen">${content}</main>${bottomNav(active)}`;

export function homePage() {
  const data = store.getData();
  const places = data.establishments.filter((p) => p.active).map((p) => ({ ...p, distance: distanceKm(userLocation, p), status: openStatus(p.hours) }));
  const featured = places.filter((p) => p.featured);
  return shell(`
    <section class="hero-copy">
      <p>Olá! 👋</p>
      <h1>O que vamos descobrir hoje?</h1>
    </section>
    <div class="location-note">Localização desativada • usando Pinheiros/ES como ponto inicial.</div>
    ${searchBox()}
    ${sectionTitle("Destaques", `<button data-route="/explorar">Ver todos</button>`)}
    <div class="banner-row">
      ${banners.map((item) => `<article class="banner-card" style="background-image:url('${item.image}')"><span>${item.tag}</span><strong>${item.title}</strong><p>${item.subtitle}</p></article>`).join("")}
    </div>
    ${sectionTitle("Recomendações para você", `<button data-route="/explorar">Ver todos</button>`)}
    <div class="mini-row">${featured.map((place) => miniPlaceCard(place, data.categories)).join("")}</div>
    <aside class="cta-card"><span>📍</span><div><strong>Eventos imperdíveis</strong><p>Confira o que vai rolar em Pinheiros.</p></div><button data-route="/eventos">›</button></aside>
    ${sectionTitle("Atalhos")}
    ${categoryGrid(data.categories)}
  `, "home", topBar());
}

export function explorePage(params = {}) {
  const data = store.getData();
  const selected = params.category || "";
  const filter = params.filter || "";
  let places = data.establishments.filter((p) => p.active && (!selected || p.category === selected)).map((p) => ({ ...p, distance: distanceKm(userLocation, p), status: openStatus(p.hours) }));
  if (filter === "open") places = places.filter((p) => p.status.open);
  if (filter === "delivery") places = places.filter((p) => p.delivery);
  if (filter === "whatsapp") places = places.filter((p) => p.whatsapp);
  if (filter === "rating") places.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  else places.sort((a, b) => a.distance - b.distance);
  const filters = [["open", "Aberto agora"], ["near", "Mais próximos"], ["rating", "Melhor avaliados"], ["delivery", "Com delivery"], ["whatsapp", "Com WhatsApp"]];
  return shell(`
    <h1 class="page-title">Explorar</h1>
    <div class="location-note">Localização desativada • os resultados continuam disponíveis com Pinheiros/ES como referência.</div>
    ${searchBox()}
    ${categoryGrid(data.categories, selected)}
    <div class="chip-row">${filters.map(([id, label]) => `<button class="${filter === id ? "selected" : ""}" data-filter="${id}">${label}</button>`).join("")}</div>
    ${sectionTitle(selected ? categoryById(selected, data.categories).name : "Lugares em alta", `<button data-clear>Limpar</button>`)}
    <div class="list">${places.length ? places.map((place) => placeCard(place, data.categories)).join("") : emptyState("Nenhum resultado encontrado", "Tente remover filtros ou buscar por outra categoria.")}</div>
  `, "explorar", topBar());
}

export function placePage(slug) {
  const data = store.getData();
  const place = data.establishments.find((p) => p.slug === slug);
  if (!place) return shell(emptyState("Estabelecimento não encontrado", "Este cadastro pode ter sido removido."), "explorar", topBar("Estabelecimento", true));
  const cat = categoryById(place.category, data.categories);
  const status = openStatus(place.hours);
  const favorite = store.isFavorite("place", place.id);
  const reviews = store.reviews(place.slug);
  return `
    ${topBar("Estabelecimento", true)}
    <main class="detail-screen">
      <section class="cover" style="background-image:url('${place.cover}')">
        <button class="floating share" data-share-place="${place.slug}" aria-label="Compartilhar">↗</button>
      </section>
      <section class="detail-card">
        <div class="detail-head">
          <div><h1>${place.name}</h1><p>${cat.icon} ${place.subcategory} • ${place.neighborhood}</p></div>
          <button class="save ${favorite ? "saved" : ""}" data-favorite-place="${place.id}">${favorite ? "♥" : "♡"}</button>
        </div>
        <div class="rating-line"><span>${ratingText(place)}</span><span>${(place.reviewCount || 0) + reviews.length} avaliações locais</span></div>
        ${statusPill(status)}
        ${place.sourceName ? `<a class="source-link" href="${place.sourceUrl}" target="_blank" rel="noopener">${place.verified ? "Fonte pública verificada" : "Informação a validar"}: ${place.sourceName}</a>` : ""}
        <div class="quick-actions">
          ${place.phone ? `<a href="tel:${place.phone.replace(/\D/g, "")}">📞<span>Ligar</span></a>` : ""}
          ${place.whatsapp ? `<a href="https://wa.me/${place.whatsapp}" target="_blank" rel="noopener">💬<span>WhatsApp</span></a>` : ""}
          <a href="${mapsUrl(place)}" target="_blank" rel="noopener">🧭<span>Como chegar</span></a>
          ${place.site ? `<a href="${place.site}" target="_blank" rel="noopener">🌐<span>Site</span></a>` : ""}
        </div>
        <div class="tabs"><a href="#sobre">Sobre</a><a href="#fotos">Fotos</a><a href="#info">Informações</a><a href="#avaliacoes">Avaliações</a></div>
        <section id="sobre">${sectionTitle("Sobre")}<p>${place.fullDescription || place.description}</p></section>
        <section id="fotos">${sectionTitle("Fotos")}<div class="gallery">${place.photos.map((photo) => `<img src="${photo}" alt="${place.name}" loading="lazy" />`).join("")}</div></section>
        <section id="info">${sectionTitle("Informações")}<div class="info-list">
          <p>📍 ${place.address}, ${place.neighborhood}, ${place.city}/${place.state}</p>
          ${place.phone ? `<p>📞 ${place.phone}</p>` : ""}
          ${place.instagram ? `<p>◎ ${place.instagram}</p>` : ""}
          ${place.payments?.length ? `<p>💳 ${place.payments.join(", ")}</p>` : ""}
          ${place.services?.length ? `<p>✓ ${place.services.join(", ")}</p>` : ""}
          ${place.cnpj ? `<p>▣ CNPJ ${place.cnpj}</p>` : ""}
          ${place.geocodeStatus ? `<p>⌖ Localização ${place.geocodeStatus}; ajustar coordenadas no painel quando validar.</p>` : ""}
        </div></section>
        <section id="avaliacoes">${sectionTitle("Avaliações")}
          <form class="review-form" data-review="${place.slug}">
            <select name="stars"><option value="5">5 estrelas</option><option value="4">4 estrelas</option><option value="3">3 estrelas</option><option value="2">2 estrelas</option><option value="1">1 estrela</option></select>
            <textarea name="comment" placeholder="Escreva um comentário"></textarea>
            <button type="submit">Enviar avaliação</button>
          </form>
          <div class="reviews">${reviews.length ? reviews.map((r) => `<article><strong>${"★".repeat(Number(r.stars))}</strong><p>${r.comment}</p><small>Aguardando moderação</small></article>`).join("") : emptyState("Ainda sem avaliações locais", "Seja a primeira pessoa a avaliar este exemplo.")}</div>
        </section>
      </section>
    </main>
    ${bottomNav("explorar")}
  `;
}

export function mapPage() {
  const data = store.getData();
  const places = data.establishments.filter((p) => p.active);
  const first = places[0];
  return shell(`
    <h1 class="page-title">Mapa</h1>
    ${searchBox("", false)}
    <div class="chip-row">${data.categories.slice(0, 7).map((cat) => `<button data-category="${cat.id}">${cat.name}</button>`).join("")}</div>
    <section class="map-canvas" aria-label="Mapa interativo de Pinheiros">
      <div class="road r1"></div><div class="road r2"></div><div class="river"></div><div class="you">●</div>
      ${places.map((place, index) => {
        const cat = categoryById(place.category, data.categories);
        const left = 16 + ((index * 23) % 68);
        const top = 18 + ((index * 31) % 58);
        return `<button class="pin" style="left:${left}%;top:${top}%" data-pin="${place.id}" aria-label="${place.name}">${cat.icon}</button>`;
      }).join("")}
    </section>
    <div class="map-sheet" data-map-sheet>${placeCard({ ...first, distance: distanceKm(userLocation, first), status: openStatus(first.hours) }, data.categories, true)}<button class="primary" data-map type="button" data-id="${first.id}">Como chegar</button></div>
  `, "mapa", topBar());
}

export function eventsPage(params = {}) {
  const data = store.getData();
  const filter = params.filter || "todos";
  const today = "2026-08-15";
  let events = data.events.filter((event) => event.active);
  if (filter === "hoje") events = events.filter((event) => event.date === today);
  if (filter === "gratis") events = events.filter((event) => event.free);
  if (filter === "fim") events = events.filter((event) => ["2026-08-15", "2026-08-16"].includes(event.date));
  events.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const upcoming = events.filter((event) => event.date >= today);
  const archive = events.filter((event) => event.real && event.date < today);
  const featured = upcoming.find((event) => event.featured) || upcoming[0] || archive[0];
  return shell(`
    <h1 class="page-title">Eventos</h1>
    <form class="search-box"><span>⌕</span><input placeholder="Buscar evento" /><button type="button">↵</button></form>
    <div class="chip-row">${[["todos", "Todos"], ["hoje", "Hoje"], ["fim", "Este fim de semana"], ["gratis", "Gratuitos"]].map(([id, label]) => `<button class="${filter === id ? "selected" : ""}" data-event-filter="${id}">${label}</button>`).join("")}</div>
    ${sectionTitle("Destaques")}
    ${featured ? eventCard(featured, true) : ""}
    ${sectionTitle("Próximos eventos")}
    <div class="list">${upcoming.length ? upcoming.map((event) => eventCard(event)).join("") : emptyState("Nenhum próximo evento encontrado", "Eventos oficiais encontrados com data passada aparecem no arquivo público abaixo.")}</div>
    ${archive.length ? `${sectionTitle("Arquivo público")}<div class="list">${archive.map((event) => eventCard(event)).join("")}</div>` : ""}
  `, "eventos", topBar());
}

export function eventDetailPage(slug) {
  const data = store.getData();
  const event = data.events.find((item) => item.slug === slug);
  if (!event) return shell(emptyState("Evento não encontrado", "Este evento pode ter sido removido."), "eventos", topBar("Evento", true));
  const favorite = store.isFavorite("event", event.id);
  return `
    ${topBar("Evento", true)}
    <main class="detail-screen">
      <section class="cover" style="background-image:url('${event.image}')"><button class="floating share" data-share-event="${event.slug}">↗</button></section>
      <section class="detail-card">
        <div class="detail-head"><div><h1>${event.name}</h1><p>${formatDate(event.date)} • ${event.time}</p></div><button class="save ${favorite ? "saved" : ""}" data-favorite-event="${event.id}">${favorite ? "♥" : "♡"}</button></div>
        <span class="price">${moneyOrFree(event)}</span>
        ${event.sourceName ? `<a class="source-link" href="${event.sourceUrl}" target="_blank" rel="noopener">Fonte pública: ${event.sourceName}</a>` : ""}
        <p>${event.description}</p>
        <div class="info-list"><p>📍 ${event.place}</p><p>${event.address}</p></div>
        <div class="quick-actions"><a href="${mapsUrl(event)}" target="_blank" rel="noopener">🧭<span>Como chegar</span></a>${event.link ? `<a href="${event.link}" target="_blank" rel="noopener">🌐<span>Link</span></a>` : ""}</div>
      </section>
    </main>
    ${bottomNav("eventos")}
  `;
}

export function searchPage(query = "") {
  const data = store.getData();
  const recent = store.recentSearches();
  const popular = ["Restaurante", "Farmácia", "Hotel", "Posto de gasolina", "Padaria", "Pet Shop", "Barbearia", "Mercado", "Academia"];
  const results = query ? searchIntent(query, data.establishments, data.events, userLocation) : { places: [], events: [] };
  return shell(`
    <h1 class="page-title">Preciso de...</h1>
    ${searchBox(query, true)}
    ${query ? `<p class="hint">Interpretei sua busca e priorizei categorias relacionadas, lugares próximos e abertos.</p>` : ""}
    ${sectionTitle("Sugestões populares")}
    <div class="tag-grid">${popular.map((item) => `<button data-suggest="${item}">${item}</button>`).join("")}</div>
    ${recent.length ? `${sectionTitle("Buscas recentes", `<button data-clear-recent>Limpar</button>`)}<div class="recent-list">${recent.map((item) => `<button data-suggest="${item}">⌕ ${item}<span>×</span></button>`).join("")}</div>` : ""}
    ${query ? `${sectionTitle("Resultados")}<div class="list">${results.places.length ? results.places.map((place) => placeCard(place, data.categories)).join("") : emptyState("Nenhum resultado encontrado", "Tente descrever de outro jeito, como “quero almoçar” ou “preciso de remédio”.")}</div>` : `<aside class="tip-card"><strong>Dica TáOnde</strong><p>Use a busca para encontrar rápido o que você precisa ou explorar novas opções.</p></aside>`}
  `, "home", topBar("Preciso de...", true));
}

export function morePage() {
  const data = store.getData();
  const favs = store.favorites();
  const notifications = store.notifications();
  const unread = notifications.filter((item) => !item.read).length;
  const prefs = store.notificationPrefs();
  const favPlaces = favs.filter((f) => f.type === "place").map((f) => data.establishments.find((p) => p.id === f.id)).filter(Boolean);
  const favEvents = favs.filter((f) => f.type === "event").map((f) => data.events.find((e) => e.id === f.id)).filter(Boolean);
  return shell(`
    <h1 class="page-title">Mais</h1>
    <div class="menu-list">
      <button data-route="/admin"><span>⚙</span><strong>Painel administrativo</strong><small>Área protegida</small></button>
      <button data-enable-notifications><span>🔔</span><strong>Notificações</strong><small>${prefs.enabled ? "Ativadas neste dispositivo" : "Receba eventos, novidades e alertas locais"}</small></button>
      <button data-install><span>⬇</span><strong>Instalar aplicativo</strong><small>PWA pronto para Android e iOS</small></button>
    </div>
    ${sectionTitle(`Central de notificações${unread ? ` (${unread})` : ""}`, notifications.length ? `<button data-mark-notifications-read>Marcar como lidas</button>` : "")}
    <div class="notification-list">${notifications.length ? notifications.map((item) => `
      <article class="${item.read ? "" : "unread"}" data-route="${item.link}">
        <span>🔔</span>
        <div><strong>${item.title}</strong><p>${item.body}</p><small>${new Date(item.sentAt).toLocaleString("pt-BR")}</small></div>
      </article>
    `).join("") : emptyState("Nenhuma notificação ainda", "Quando o admin enviar avisos, eventos ou novidades, eles aparecem aqui.")}</div>
    ${sectionTitle("Meus favoritos")}
    <div class="list">${favPlaces.map((place) => placeCard({ ...place, distance: distanceKm(userLocation, place), status: openStatus(place.hours) }, data.categories)).join("")}${favEvents.map((event) => eventCard(event)).join("")}${!favs.length ? emptyState("Nada salvo ainda", "Salve estabelecimentos, eventos e pontos da cidade para encontrar depois.") : ""}</div>
  `, "mais", topBar());
}

export function bindPageEvents(root) {
  bindCommon(root);
  qsa("[data-category]", root).forEach((button) => button.addEventListener("click", () => route(`/explorar?category=${button.dataset.category}`)));
  qsa("[data-filter]", root).forEach((button) => {
    button.addEventListener("click", () => {
      const category = new URLSearchParams(location.hash.split("?")[1] || "").get("category");
      route(`/explorar?${category ? `category=${category}&` : ""}filter=${button.dataset.filter}`);
    });
  });
  qs("[data-clear]", root)?.addEventListener("click", () => route("/explorar"));
  qsa("[data-event-filter]", root).forEach((button) => button.addEventListener("click", () => route(`/eventos?filter=${button.dataset.eventFilter}`)));
  qsa("[data-suggest]", root).forEach((button) => button.addEventListener("click", () => {
    store.addRecentSearch(button.dataset.suggest);
    route(`/busca?q=${encodeURIComponent(button.dataset.suggest)}`);
  }));
  qs("[data-clear-recent]", root)?.addEventListener("click", () => {
    store.clearRecentSearches();
    route("/busca");
  });
  qs("[data-enable-notifications]", root)?.addEventListener("click", async () => {
    if (!("Notification" in window)) {
      alert("Este navegador não oferece notificações para PWA.");
      return;
    }
    const permission = await Notification.requestPermission();
    const enabled = permission === "granted";
    store.saveNotificationPrefs({ enabled, permission });
    if (enabled) new Notification("TáOnde", { body: "Notificações ativadas neste dispositivo." });
    route("/mais");
  });
  qs("[data-mark-notifications-read]", root)?.addEventListener("click", () => {
    store.markNotificationsRead();
    route("/mais");
  });
  qsa("[data-favorite-place], [data-favorite-event]", root).forEach((button) => button.addEventListener("click", () => {
    const type = button.dataset.favoritePlace ? "place" : "event";
    store.toggleFavorite(type, button.dataset.favoritePlace || button.dataset.favoriteEvent);
    route(location.hash.slice(1));
  }));
  qsa("[data-share-place], [data-share-event]", root).forEach((button) => button.addEventListener("click", () => {
    const data = store.getData();
    const item = button.dataset.sharePlace ? data.establishments.find((p) => p.slug === button.dataset.sharePlace) : data.events.find((e) => e.slug === button.dataset.shareEvent);
    shareItem(item.name, button.dataset.sharePlace ? `#/local/${item.slug}` : `#/evento/${item.slug}`);
  }));
  qsa("[data-review]", root).forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = new FormData(form);
    store.addReview(form.dataset.review, { stars: values.get("stars"), comment: values.get("comment") || "Sem comentário" });
    route(location.hash.slice(1));
  }));
  qsa("[data-pin]", root).forEach((pin) => pin.addEventListener("click", () => {
    const data = store.getData();
    const place = data.establishments.find((p) => p.id === pin.dataset.pin);
    qs("[data-map-sheet]", root).innerHTML = `${placeCard({ ...place, distance: distanceKm(userLocation, place), status: openStatus(place.hours) }, data.categories, true)}<button class="primary" data-map data-id="${place.id}">Como chegar</button>`;
    bindCommon(qs("[data-map-sheet]", root));
  }));
}

export { slugify };
