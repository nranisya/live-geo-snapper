// ===== GLOBAL STATE =====
const AppState = {
  map: null,
  userMarker: null,
  accuracyCircle: null,
  currentCoords: null,
  currentAddress: "Address unavailable",
  _centeredOnce: false,
  geoStarted: false,
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

// Welcome overlay elements
const startAppBtn = document.getElementById("startAppBtn");
const welcomeOverlay = document.getElementById("welcomeOverlay");

// ===== UI HELPERS =====
function showToast(msg, type = "info") {
  const t = document.createElement("div");
  t.className =
    "toast fixed left-1/2 -translate-x-1/2 bottom-16 px-3 py-2 rounded-full text-[11px] " +
    "border bg-slate-900/95 text-slate-50 shadow-lg z-[11000]";
  t.style.borderColor =
    type === "error" ? "rgba(248,113,113,0.7)" : "rgba(52,211,153,0.7)";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

function setStatus(text, style) {
  statusBadge.textContent = text;
  statusBadge.className =
    "text-[11px] px-2 py-1 rounded-full flex items-center gap-1 " +
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

// ===== START GEOLOCATION AFTER WELCOME TAP =====
if (startAppBtn) {
  startAppBtn.addEventListener("click", () => {
    // Hide welcome overlay
    if (welcomeOverlay) {
      welcomeOverlay.classList.add("opacity-0", "pointer-events-none");
      setTimeout(() => {
        welcomeOverlay.style.display = "none";
      }, 300);
    }

    if (!AppState.geoStarted) {
      AppState.geoStarted = true;
      if (typeof window.startGeoTracking === "function") {
        window.startGeoTracking();
      } else {
        showToast("GPS module not loaded.", "error");
      }
    }
  });
}

// Re-center button (does NOT start GPS anymore)
if (locateBtn) {
  locateBtn.addEventListener("click", () => {
    if (!AppState.currentCoords) {
      showToast("Waiting for GPS fix…", "info");
      return;
    }
    const { latitude, longitude } = AppState.currentCoords;
    AppState.map.setView([latitude, longitude], 18, { animate: true });
  });
}

// ===== SNAPSHOT MARKER HELPER =====
window.addSnapshotMarker = function addSnapshotMarker({
  lat,
  lng,
  imgUrl,
  address,
  timeStr,
}) {
  if (!AppState.map) return;

  const popupHtml = `
    <div style="font-size:11px;">
      <img src="${imgUrl}" alt="Snapshot"
           style="width:180px;height:120px;object-fit:cover;border-radius:8px;margin-bottom:4px;" />
      <p><strong>Address:</strong> ${address}</p>
      <p><strong>Time:</strong> ${timeStr}</p>
    </div>
  `;

  const marker = L.marker([lat, lng], {
    icon: L.icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/252/252025.png",
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    }),
  }).addTo(AppState.map);

  marker.bindPopup(popupHtml).openPopup();
};

// Expose to other files
window.AppState = AppState;
window.showToast = showToast;
window.setStatus = setStatus;
window.updateInfoPanel = updateInfoPanel;
window.locateBtn = locateBtn;
window.captureBtn = captureBtn;
window.captureInput = captureInput;
