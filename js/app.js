// ===== GLOBAL STATE =====
const AppState = {
  map: null,
  userMarker: null,
  accuracyCircle: null,
  currentCoords: null,
  currentAddress: "Address unavailable",
  _centeredOnce: false,
  geoStarted: false, // added
};

// ===== DOM ELEMENTS =====
const statusBadge = document.getElementById("statusBadge");
const addressEl = document.getElementById("address");
const timestampEl = document.getElementById("timestamp");
const locateBtn = document.getElementById("locateBtn");

const mapPanel = document.getElementById("mapPanel");
const infoPanel = document.getElementById("infoPanel");
const infoAddressEl = document.getElementById("infoAddress");
const tabMap = document.getElementById("tabMap");
const tabInfo = document.getElementById("tabInfo");

// Capture button + input for workflow (a)
const captureBtn = document.getElementById("captureBtn");
const captureInput = document.getElementById("captureInput");

// ===== UI HELPERS =====
function showToast(msg, type = "info") {
  const t = document.createElement("div");
  t.className = "toast";
  t.style.borderColor =
    type === "error" ? "rgba(248,113,113,0.7)" : "rgba(52,211,153,0.7)";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

function setStatus(text, style) {
  statusBadge.textContent = text;
  statusBadge.className =
    "text-[11px] px-2 py-1 rounded " +
    (style || "bg-amber-500/20 text-amber-300");
}

function updateInfoPanel(address) {
  if (address) {
    addressEl.textContent = address;
    if (infoAddressEl) infoAddressEl.textContent = address;
  }
  timestampEl.textContent = "Time: " + new Date().toLocaleString();
}

// ===== TABS =====
function showMapPanel() {
  mapPanel.classList.remove("hidden");
  infoPanel.classList.add("hidden");
  tabMap.classList.add("text-emerald-400", "font-semibold");
  tabMap.classList.remove("text-slate-400");
  tabInfo.classList.remove("text-emerald-400", "font-semibold");
  tabInfo.classList.add("text-slate-400");
}

function showInfoPanel() {
  mapPanel.classList.add("hidden");
  infoPanel.classList.remove("hidden");
  tabInfo.classList.add("text-emerald-400", "font-semibold");
  tabInfo.classList.remove("text-slate-400");
  tabMap.classList.remove("text-emerald-400", "font-semibold");
  tabMap.classList.add("text-slate-400");
}

tabMap.addEventListener("click", showMapPanel);
tabInfo.addEventListener("click", showInfoPanel);
showMapPanel();

// Expose to other files
window.AppState = AppState;
window.showToast = showToast;
window.setStatus = setStatus;
window.updateInfoPanel = updateInfoPanel;
window.locateBtn = locateBtn;
window.captureBtn = captureBtn;
window.captureInput = captureInput;

// ===== START GEOLOCATION ON USER TAP =====
if (window.locateBtn) {
  window.locateBtn.addEventListener("click", () => {
    if (!window.AppState.geoStarted) {
      window.AppState.geoStarted = true;
      if (typeof window.startGeoTracking === "function") {
        window.startGeoTracking();
      } else {
        window.showToast("GPS module not loaded.", "error");
      }
    }
  });
}
