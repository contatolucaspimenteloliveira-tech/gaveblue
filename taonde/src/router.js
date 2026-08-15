import { adminPage, bindAdminEvents } from "./admin.js";
import { bindPageEvents, eventDetailPage, eventsPage, explorePage, homePage, mapPage, morePage, placePage, searchPage } from "./pages.js";

const parseHash = () => {
  const raw = location.hash.replace(/^#/, "") || "/home";
  const [path, queryString = ""] = raw.split("?");
  return { path, params: Object.fromEntries(new URLSearchParams(queryString)) };
};

export function render() {
  const app = document.getElementById("app");
  const { path, params } = parseHash();
  const parts = path.split("/").filter(Boolean);
  let html = "";

  if (path === "/" || path === "/home") html = homePage();
  else if (parts[0] === "explorar") html = explorePage(params);
  else if (parts[0] === "local") html = placePage(parts[1]);
  else if (parts[0] === "mapa") html = mapPage();
  else if (parts[0] === "eventos" && parts.length === 1) html = eventsPage(params);
  else if (parts[0] === "evento") html = eventDetailPage(parts[1]);
  else if (parts[0] === "busca") html = searchPage(params.q || "");
  else if (parts[0] === "mais") html = morePage();
  else if (parts[0] === "admin") html = adminPage(params);
  else html = homePage();

  app.innerHTML = html;
  bindPageEvents(app);
  bindAdminEvents(app);
  window.scrollTo({ top: 0, behavior: "instant" });
}
