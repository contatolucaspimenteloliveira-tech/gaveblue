import { store } from "./state.js";
import { bottomNav, categoryById, emptyState, qsa, qs, topBar } from "./components.js";
import { slugify } from "./utils.js";

const login = () => `
  ${topBar("Admin", true)}
  <main class="screen">
    <section class="admin-login">
      <h1>Painel administrativo</h1>
      <p>Área protegida para cadastrar estabelecimentos, eventos, categorias, banners, fotos, horários e moderar avaliações.</p>
      <form data-admin-login>
        <input type="password" name="password" placeholder="Senha de demonstração" required />
        <button class="primary" type="submit">Entrar</button>
      </form>
      <small>Senha demo: admin123</small>
    </section>
  </main>
  ${bottomNav("mais")}
`;

export function adminPage(params = {}) {
  if (!store.isAdmin()) return login();
  const data = store.getData();
  const tab = params.tab || "dashboard";
  return `
    ${topBar("Admin", true)}
    <main class="screen admin">
      <div class="admin-head">
        <div><h1>Painel TáOnde</h1><p>Cadastros demonstrativos preparados para dados reais.</p></div>
        <button data-admin-logout>Sair</button>
      </div>
      <div class="admin-tabs">
        ${["dashboard", "estabelecimentos", "eventos", "notificacoes", "categorias", "avaliacoes"].map((item) => `<button class="${tab === item ? "selected" : ""}" data-admin-tab="${item}">${item}</button>`).join("")}
      </div>
      ${tab === "dashboard" ? dashboard(data) : ""}
      ${tab === "estabelecimentos" ? establishmentsAdmin(data) : ""}
      ${tab === "eventos" ? eventsAdmin(data, params.edit) : ""}
      ${tab === "notificacoes" ? notificationsAdmin(data) : ""}
      ${tab === "categorias" ? categoriesAdmin(data) : ""}
      ${tab === "avaliacoes" ? reviewsAdmin(data) : ""}
    </main>
    ${bottomNav("mais")}
  `;
}

function dashboard(data) {
  const reviews = data.establishments.reduce((sum, item) => sum + item.reviewCount, 0);
  return `
    <section class="metric-grid">
      <article><strong>${data.establishments.length}</strong><span>Estabelecimentos</span></article>
      <article><strong>${data.events.length}</strong><span>Eventos</span></article>
      <article><strong>${store.notifications().length}</strong><span>Notificações</span></article>
      <article><strong>${data.categories.length}</strong><span>Categorias</span></article>
      <article><strong>${reviews}</strong><span>Avaliações</span></article>
    </section>
    <section class="state-card"><strong>Próximos passos</strong><p>Troque os dados demonstrativos por cadastros reais, adicione fotos próprias, valide horários e publique a agenda local.</p></section>
  `;
}

function establishmentsAdmin(data) {
  return `
    <section class="admin-panel">
      <h2>Novo estabelecimento</h2>
      <form class="admin-form" data-place-form>
        <input name="name" placeholder="Nome" required />
        <select name="category">${data.categories.map((cat) => `<option value="${cat.id}">${cat.name}</option>`).join("")}</select>
        <input name="subcategory" placeholder="Subcategoria" />
        <input name="address" placeholder="Endereço" />
        <input name="neighborhood" placeholder="Bairro/região" />
        <input name="phone" placeholder="Telefone" />
        <input name="whatsapp" placeholder="WhatsApp com DDI" />
        <textarea name="description" placeholder="Descrição"></textarea>
        <label><input type="checkbox" name="featured" /> Destacar empresa</label>
        <button class="primary" type="submit">Cadastrar</button>
      </form>
    </section>
    <section class="admin-panel">
      <h2>Estabelecimentos</h2>
      <div class="admin-list">${data.establishments.map((place) => `<article><span>${categoryById(place.category, data.categories).icon}</span><div><strong>${place.name}</strong><small>${place.neighborhood} • ${place.active ? "Ativo" : "Inativo"}</small></div><button data-toggle-place="${place.id}">${place.active ? "Desativar" : "Ativar"}</button><button data-delete-place="${place.id}">Excluir</button></article>`).join("")}</div>
    </section>
  `;
}

function eventsAdmin(data, editId = "") {
  const editing = data.events.find((event) => event.id === editId);
  return `
    <section class="admin-panel">
      <h2>${editing ? "Editar evento" : "Novo evento"}</h2>
      <form class="admin-form" data-event-form="${editing?.id || ""}">
        <input name="name" placeholder="Nome" value="${editing?.name || ""}" required />
        <input name="date" type="date" value="${editing?.date || ""}" required />
        <input name="time" type="time" value="${editing?.time || ""}" required />
        <input name="place" placeholder="Local" value="${editing?.place || ""}" />
        <input name="address" placeholder="Endereço" value="${editing?.address || ""}" />
        <input name="price" placeholder="Preço" value="${editing?.price || ""}" />
        <input name="link" placeholder="Link do evento" value="${editing?.link || ""}" />
        <textarea name="description" placeholder="Descrição">${editing?.description || ""}</textarea>
        <label><input type="checkbox" name="free" ${editing?.free ? "checked" : ""} /> Gratuito</label>
        <label><input type="checkbox" name="featured" ${editing?.featured ? "checked" : ""} /> Destacar evento</label>
        <button class="primary" type="submit">${editing ? "Salvar alterações" : "Cadastrar"}</button>
        ${editing ? `<button type="button" data-admin-tab="eventos">Cancelar edição</button>` : ""}
      </form>
    </section>
    <section class="admin-panel"><h2>Eventos</h2><div class="admin-list">${data.events.map((event) => `<article><span>🎉</span><div><strong>${event.name}</strong><small>${event.date} • ${event.active ? "Ativo" : "Inativo"}</small></div><button data-edit-event="${event.id}">Editar</button><button data-toggle-event="${event.id}">${event.active ? "Desativar" : "Ativar"}</button><button data-delete-event="${event.id}">Excluir</button></article>`).join("")}</div></section>
  `;
}

function notificationsAdmin(data) {
  const notifications = store.notifications();
  return `
    <section class="admin-panel">
      <h2>Enviar notificação</h2>
      <form class="admin-form" data-notification-form>
        <input name="title" placeholder="Título" required />
        <textarea name="body" placeholder="Mensagem" required></textarea>
        <select name="audience">
          <option value="todos">Todos os usuários</option>
          <option value="eventos">Interessados em eventos</option>
          <option value="favoritos">Usuários com favoritos</option>
        </select>
        <select name="link">
          <option value="/eventos">Abrir Eventos</option>
          <option value="/home">Abrir Home</option>
          <option value="/explorar">Abrir Explorar</option>
          ${data.events.map((event) => `<option value="/evento/${event.slug}">${event.name}</option>`).join("")}
        </select>
        <button class="primary" type="submit">Enviar agora</button>
      </form>
    </section>
    <section class="admin-panel">
      <h2>Histórico</h2>
      <div class="admin-list">${notifications.length ? notifications.map((item) => `<article><span>🔔</span><div><strong>${item.title}</strong><small>${item.body} • ${new Date(item.sentAt).toLocaleString("pt-BR")}</small></div><button data-resend-notification="${item.id}">Reenviar</button></article>`).join("") : emptyState("Nenhuma notificação enviada", "Crie avisos de eventos, promoções e alertas locais por aqui.")}</div>
    </section>
  `;
}

function categoriesAdmin(data) {
  return `
    <section class="admin-panel">
      <h2>Nova categoria</h2>
      <form class="admin-form" data-category-form>
        <input name="name" placeholder="Nome" required />
        <input name="icon" placeholder="Ícone" value="📍" />
        <input name="description" placeholder="Descrição" />
        <button class="primary" type="submit">Cadastrar</button>
      </form>
    </section>
    <section class="admin-panel"><h2>Categorias</h2><div class="admin-list">${data.categories.map((cat) => `<article><span>${cat.icon}</span><div><strong>${cat.name}</strong><small>${cat.description}</small></div><button data-toggle-category="${cat.id}">${cat.active ? "Desativar" : "Ativar"}</button></article>`).join("")}</div></section>
  `;
}

function reviewsAdmin(data) {
  const items = data.establishments.flatMap((place) => store.reviews(place.slug).map((review) => ({ place, review })));
  return `<section class="admin-panel"><h2>Moderação de avaliações</h2><div class="admin-list">${items.length ? items.map(({ place, review }) => `<article><span>★</span><div><strong>${place.name}</strong><small>${review.stars} estrelas • ${review.comment}</small></div><button>Aprovar</button><button>Ocultar</button></article>`).join("") : emptyState("Sem avaliações locais pendentes", "As avaliações enviadas pelos usuários aparecerão aqui.")}</div></section>`;
}

function save(mutator) {
  const data = store.getData();
  mutator(data);
  store.saveAdminData(data);
  location.hash = location.hash;
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

export function bindAdminEvents(root) {
  qs("[data-admin-login]", root)?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (store.login(new FormData(event.currentTarget).get("password"))) location.hash = "#/admin";
    else alert("Senha inválida.");
  });
  qs("[data-admin-logout]", root)?.addEventListener("click", () => {
    store.logout();
    location.hash = "#/mais";
  });
  qsa("[data-admin-tab]", root).forEach((button) => button.addEventListener("click", () => {
    location.hash = `#/admin?tab=${button.dataset.adminTab}`;
  }));
  qs("[data-place-form]", root)?.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    save((data) => data.establishments.unshift({
      id: `local-${Date.now()}`,
      name: values.name,
      slug: slugify(values.name),
      description: values.description || "Cadastro criado pelo painel.",
      fullDescription: values.description || "Cadastro criado pelo painel.",
      category: values.category,
      subcategory: values.subcategory || categoryById(values.category, data.categories).name,
      address: values.address || "Endereço não informado",
      neighborhood: values.neighborhood || "Pinheiros",
      city: "Pinheiros",
      state: "ES",
      lat: -18.4149,
      lng: -40.2171,
      phone: values.phone,
      whatsapp: values.whatsapp,
      hours: { mon: [["08:00", "18:00"]], tue: [["08:00", "18:00"]], wed: [["08:00", "18:00"]], thu: [["08:00", "18:00"]], fri: [["08:00", "18:00"]], sat: [["08:00", "12:00"]], sun: [] },
      photos: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=70"],
      cover: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=70",
      payments: [],
      services: [],
      rating: 5,
      reviewCount: 0,
      featured: values.featured === "on",
      active: true
    }));
  });
  qs("[data-event-form]", root)?.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const editId = event.currentTarget.dataset.eventForm;
    save((data) => {
      const payload = {
        name: values.name,
        slug: slugify(values.name),
        description: values.description || "Evento cadastrado pelo painel.",
        date: values.date,
        time: values.time,
        place: values.place || "Pinheiros",
        address: values.address || "Pinheiros - ES",
        price: values.free === "on" ? "Gratuito" : values.price,
        free: values.free === "on",
        featured: values.featured === "on",
        link: values.link
      };
      if (editId) {
        const item = data.events.find((eventItem) => eventItem.id === editId);
        Object.assign(item, payload);
      } else {
        data.events.unshift({
          id: `evento-${Date.now()}`,
          ...payload,
          image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=900&q=70",
          lat: -18.4149,
          lng: -40.2171,
          active: true
        });
      }
    });
  });
  qs("[data-notification-form]", root)?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const item = store.addNotification(values);
    if ("Notification" in window) {
      const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
      store.saveNotificationPrefs({ enabled: permission === "granted", permission });
      if (permission === "granted") new Notification(item.title, { body: item.body, icon: "assets/icon.svg" });
    }
    alert("Notificação enviada neste PWA. Para push real para todos os aparelhos, será necessário conectar um backend Web Push.");
    location.hash = "#/admin?tab=notificacoes";
  });
  qs("[data-category-form]", root)?.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    save((data) => data.categories.push({ id: slugify(values.name), name: values.name, icon: values.icon || "📍", description: values.description || "", order: data.categories.length + 1, active: true }));
  });
  qsa("[data-toggle-place]", root).forEach((button) => button.addEventListener("click", () => save((data) => {
    const item = data.establishments.find((place) => place.id === button.dataset.togglePlace);
    item.active = !item.active;
  })));
  qsa("[data-delete-place]", root).forEach((button) => button.addEventListener("click", () => save((data) => {
    data.establishments = data.establishments.filter((place) => place.id !== button.dataset.deletePlace);
  })));
  qsa("[data-toggle-event]", root).forEach((button) => button.addEventListener("click", () => save((data) => {
    const item = data.events.find((event) => event.id === button.dataset.toggleEvent);
    item.active = !item.active;
  })));
  qsa("[data-edit-event]", root).forEach((button) => button.addEventListener("click", () => {
    location.hash = `#/admin?tab=eventos&edit=${button.dataset.editEvent}`;
  }));
  qsa("[data-delete-event]", root).forEach((button) => button.addEventListener("click", () => save((data) => {
    data.events = data.events.filter((event) => event.id !== button.dataset.deleteEvent);
  })));
  qsa("[data-resend-notification]", root).forEach((button) => button.addEventListener("click", async () => {
    const item = store.notifications().find((notification) => notification.id === button.dataset.resendNotification);
    if (!item) return;
    store.addNotification({ title: item.title, body: item.body, audience: item.audience, link: item.link });
    if ("Notification" in window && Notification.permission === "granted") new Notification(item.title, { body: item.body, icon: "assets/icon.svg" });
    location.hash = "#/admin?tab=notificacoes";
  }));
  qsa("[data-toggle-category]", root).forEach((button) => button.addEventListener("click", () => save((data) => {
    const item = data.categories.find((cat) => cat.id === button.dataset.toggleCategory);
    item.active = !item.active;
  })));
}
