import { render } from "./router.js";
import { setUserLocation } from "./pages.js";

let deferredInstallPrompt = null;

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
});

window.addEventListener("hashchange", render);
window.addEventListener("load", () => {
  document.body.classList.toggle("offline", !navigator.onLine);
  render();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
  }
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => document.body.classList.add("location-fallback"),
      { enableHighAccuracy: false, timeout: 4500, maximumAge: 300000 }
    );
  }
});

window.addEventListener("online", () => document.body.classList.remove("offline"));
window.addEventListener("offline", () => document.body.classList.add("offline"));

document.addEventListener("click", async (event) => {
  const install = event.target.closest("[data-install]");
  if (!install) return;
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
  } else {
    alert("Use o menu do navegador para instalar o TáOnde. No iPhone, toque em Compartilhar e depois em Adicionar à Tela de Início.");
  }
});
