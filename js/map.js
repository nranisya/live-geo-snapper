// ===== MAP INITIALIZATION =====
(function () {
  const initialLatLng = [6.2683, 100.4219]; // Jitra / Kedah approx

  const map = L.map("map").setView(initialLatLng, 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  window.AppState.map = map;

  window.locateBtn.addEventListener("click", () => {
    if (!window.AppState.currentCoords) {
      window.showToast("Waiting for GPS fix…", "info");
      return;
    }
    const { latitude, longitude } = window.AppState.currentCoords;
    window.AppState.map.setView([latitude, longitude], 18, { animate: true });
  });
})();

// ===== SNAPSHOT MARKER HELPER =====
window.addSnapshotMarker = function addSnapshotMarker({
  lat,
  lng,
  imgUrl,
  address,
  timeStr,
}) {
  if (!window.AppState.map) return;

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
  }).addTo(window.AppState.map);

  marker.bindPopup(popupHtml).openPopup();
};
