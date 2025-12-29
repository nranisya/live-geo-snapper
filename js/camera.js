// Capture button opens the standard file input.
// a) Use the standard HTML input: <input type="file" capture="camera">
window.captureBtn.addEventListener("click", () => {
  if (!window.AppState.currentCoords) {
    window.showToast("Waiting for GPS lock before capturing.", "info");
    console.warn("Capture blocked: no currentCoords yet");
    return;
  }
  window.captureInput.click();
});

// b) Listen for the change event on that input.
window.captureInput.addEventListener("change", (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (!window.AppState.currentCoords) {
    window.showToast("No GPS position available.", "error");
    return;
  }

  // c) Create a temporary URL for the image file.
  const imageUrl = URL.createObjectURL(file);

  const { latitude, longitude } = window.AppState.currentCoords;
  const address = window.AppState.currentAddress || "Address unavailable";
  const timeStr = new Date().toLocaleString(); // date/time of capture

  // d) Pass this URL directly into the Leaflet Popup HTML via addSnapshotMarker.
  window.addSnapshotMarker({
    lat: latitude,
    lng: longitude,
    imgUrl: imageUrl,
    address,
    timeStr,
  });

  window.showToast("Photo pinned to your current location.", "info");

  // Clear input so the same file can be selected again if needed.
  event.target.value = "";
});
