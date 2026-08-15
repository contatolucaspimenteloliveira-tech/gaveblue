import { categories, establishments, events } from "./data.js";

const keys = {
  favorites: "taonde:favorites",
  recent: "taonde:recent-searches",
  reviews: "taonde:reviews",
  admin: "taonde:admin-data",
  auth: "taonde:admin-auth"
};

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export const store = {
  getData() {
    const admin = read(keys.admin, null);
    return {
      categories: admin?.categories ?? categories,
      establishments: admin?.establishments ?? establishments,
      events: admin?.events ?? events
    };
  },
  saveAdminData(data) {
    write(keys.admin, data);
  },
  resetAdminData() {
    localStorage.removeItem(keys.admin);
  },
  isAdmin() {
    return read(keys.auth, false);
  },
  login(password) {
    const ok = password === "admin123";
    if (ok) write(keys.auth, true);
    return ok;
  },
  logout() {
    localStorage.removeItem(keys.auth);
  },
  favorites() {
    return read(keys.favorites, []);
  },
  isFavorite(type, id) {
    return this.favorites().some((item) => item.type === type && item.id === id);
  },
  toggleFavorite(type, id) {
    const list = this.favorites();
    const exists = list.some((item) => item.type === type && item.id === id);
    const next = exists ? list.filter((item) => !(item.type === type && item.id === id)) : [...list, { type, id }];
    write(keys.favorites, next);
    return !exists;
  },
  recentSearches() {
    return read(keys.recent, []);
  },
  addRecentSearch(term) {
    const clean = term.trim();
    if (!clean) return;
    write(keys.recent, [clean, ...this.recentSearches().filter((item) => item !== clean)].slice(0, 6));
  },
  clearRecentSearches() {
    write(keys.recent, []);
  },
  reviews(slug) {
    return read(keys.reviews, {})[slug] ?? [];
  },
  addReview(slug, review) {
    const all = read(keys.reviews, {});
    all[slug] = [{ ...review, date: new Date().toISOString(), status: "pendente" }, ...(all[slug] ?? [])];
    write(keys.reviews, all);
  }
};
