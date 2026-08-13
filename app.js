const STORAGE_KEY = "vclients_clients";
const SETTINGS_KEY = "vclients_settings";

let clients = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{"ownerEmail":"","theme":"dark"}');
let selectedClientId = null;

const $ = (id) => document.getElementById(id);

function formatDate(date = new Date()) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  }).format(date);
}

function renderHeader() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
  $("greeting").textContent = greeting;
  $("date").textContent = formatDate();
}

function saveClients() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

function renderClients() {
  const list = $("clientList");
  list.innerHTML = "";
  $("clientCount").textContent = clients.length;
  $("emptyState").classList.toggle("hidden", clients.length > 0);

  clients.forEach(client => {
    const row = document.createElement("div");
    row.className = "client-row";

    const main = document.createElement("div");
    main.className = "client-main";

    const name = document.createElement("div");
    name.className = "client-name";
    name.textContent = client.name;

    const email = document.createElement("div");
    email.className = "client-email";
    email.textContent = client.email;

    const open = document.createElement("button");
    open.className = "client-open";
    open.textContent = "›";
    open.setAttribute("aria-label", `Voir ${client.name}`);
    open.addEventListener("click", () => openClient(client.id));

    main.append(name, email);
    row.append(main, open);
    list.appendChild(row);
  });
}

function openModal(id) {
  $(id).classList.remove("hidden");
}

function closeModal(id) {
  $(id).classList.add("hidden");
}

function openClient(id) {
  const client = clients.find(c => c.id === id);
  if (!client) return;
  selectedClientId = id;

  $("infoAvatar").textContent = client.name.trim().charAt(0).toUpperCase();
  $("infoName").textContent = client.name;
  $("infoEmail").textContent = client.email;
  $("infoStatus").textContent = client.welcomeSent ? "Bienvenue envoyé" : "Bienvenue non envoyé";
  $("infoDate").textContent = new Date(client.createdAt).toLocaleDateString("fr-FR");
  openModal("clientInfoModal");
}

$("addClientBtn").addEventListener("click", () => {
  $("clientForm").reset();
  openModal("clientModal");
  setTimeout(() => $("clientName").focus(), 50);
});

$("clientForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const name = $("clientName").value.trim();
  const email = $("clientEmail").value.trim().toLowerCase();

  if (!name || !email) return;

  const client = {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    name,
    email,
    createdAt: new Date().toISOString(),
    welcomeSent: false
  };

  clients.unshift(client);
  saveClients();
  renderClients();
  closeModal("clientModal");

   fetch("https://hook.eu1.make.com/sxsxnji4tp5161r5sv5ljvq8sg560arp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: client.name,
      email: client.email,
      ownerEmail: settings.ownerEmail,
      createdAt: client.createdAt
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Erreur webhook Make");
    }

    client.welcomeSent = true;
    saveClients();
    renderClients();
  })
  .catch(error => {
    console.error("Erreur Make :", error);
  });
});

$("settingsBtn").addEventListener("click", () => {
  $("ownerEmail").value = settings.ownerEmail || "";
  $("themeSelect").value = settings.theme || "dark";
  openModal("settingsModal");
});

$("saveSettingsBtn").addEventListener("click", () => {
  settings.ownerEmail = $("ownerEmail").value.trim();
  settings.theme = $("themeSelect").value;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  applyTheme();
  closeModal("settingsModal");
});

$("deleteClientBtn").addEventListener("click", () => {
  if (!selectedClientId) return;
  const client = clients.find(c => c.id === selectedClientId);
  if (!client) return;

  if (confirm(`Supprimer ${client.name} ?`)) {
    clients = clients.filter(c => c.id !== selectedClientId);
    saveClients();
    renderClients();
    closeModal("clientInfoModal");
    selectedClientId = null;
  }
});

document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => closeModal(button.dataset.close));
});

document.querySelectorAll(".modal").forEach(modal => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal(modal.id);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.querySelectorAll(".modal:not(.hidden)").forEach(m => closeModal(m.id));
  }
});

function applyTheme() {
  document.body.classList.toggle("light", settings.theme === "light");
}

renderHeader();
renderClients();
applyTheme();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
