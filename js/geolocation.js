// ===== REVERSE GEOCODING WITH NOMINATIM =====
const REVERSE_GEOCODE_API = "https://nominatim.openstreetmap.org/reverse";

function reverseGeocode(lat, lng) {
  const url = `${REVERSE_GEOCODE_API}?lat=${lat}&lon=${lng}&format=json`;

  return fetch(url, {
    headers: {
      "Accept-Language": "en",
      "User-Agent": "UUM-GeoSnapper-Student",
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Reverse geocoding failed");
      return res.json();
    })
    .then((data) => {
      const addr =
        data.display_name ||
        (data.address && data.address.road) ||
        "Address unavailable";
      return addr;
    })
    .catch((err) => {
      console.error(err);
      window.showToast("Unable to fetch address.", "error");
      return "Address unavailable";
    });
}

// ===== REAL-TIME GEOLOCATION =====
function handlePosition(position) {
  const { latitude, longitude, accuracy } = position.coords;
  const latLng = [latitude, longitude];

  console.log("New position:", position.coords);

  window.AppState.currentCoords = { latitude, longitude };

  // user marker
  if (!window.AppState.userMarker) {
    window.AppState.userMarker = L.marker(latLng).addTo(window.AppState.map);
  } else {
    window.AppState.userMarker.setLatLng(latLng);
  }

  // accuracy circle
  if (!window.AppState.accuracyCircle) {
    window.AppState.accuracyCircle = L.circle(latLng, {
      radius: accuracy || 0,
      color: "#3b82f6",
      fillColor: "#3b82f6",
      fillOpacity: 0.1,
    }).addTo(window.AppState.map);
  } else {
    window.AppState.accuracyCircle.setLatLng(latLng);
    window.AppState.accuracyCircle.setRadius(accuracy || 0);
  }

  // center map first time
  if (!window.AppState._centeredOnce) {
    window.AppState._centeredOnce = true;
    window.AppState.map.setView(latLng, 18);
  }

  window.setStatus(
    "Tracking location",
    "bg-emerald-500/20 text-emerald-300"
  );

  reverseGeocode(latitude, longitude).then((addr) => {
    window.AppState.currentAddress = addr;
    window.updateInfoPanel(addr);
  });
}

function handleGeoError(err) {
  console.error("Geolocation error", err);

  // Show raw error to help debug on real devices
  alert(`Geolocation error (code ${err.code}): ${err.message}`);

  if (err.code === 3) {
    window.setStatus("Location timeout", "bg-amber-500/20 text-amber-300");
    window.showToast(
      "Cannot get GPS fix (timeout). Try going outside or nearer to a window.",
      "error"
    );
  } else if (err.code === 1) {
    window.setStatus("Location blocked", "bg-rose-500/20 text-rose-300");
    window.showToast(
      "Location is blocked in browser. Check site permissions in browser settings.",
      "error"
    );
  } else {
    window.setStatus("Location error", "bg-rose-500/20 text-rose-300");
    window.showToast("GPS not available on this device.", "error");
  }
}

// Start geolocation AFTER user tap – better for iOS & Android
function startGeoTracking() {
  if (!("geolocation" in navigator)) {
    window.setStatus("No Geolocation", "bg-rose-500/20 text-rose-300");
    window.showToast("Geolocation not supported in this browser.", "error");
    alert("This browser does not support the Geolocation API.");
    return;
  }

  window.setStatus("Requesting GPS…");

  // Fast first fix
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      handlePosition(pos); // show something immediately

      // Then start continuous tracking
      navigator.geolocation.watchPosition(
        handlePosition,
        handleGeoError,
        {
          enableHighAccuracy: true,  // better fix; adjust if needed
          maximumAge: 30000,
          timeout: 15000,
        }
      );
    },
    handleGeoError,
    {
      enableHighAccuracy: true,
      maximumAge: 30000,
      timeout: 15000, // if no fix in 15s, show error instead of waiting forever
    }
  );
}

// Expose to other files
window.startGeoTracking = startGeoTracking;

// OPTIONAL: auto-start GPS when page finishes loading
window.addEventListener("load", () => {
  if (!window.AppState.geoStarted) {
    window.AppState.geoStarted = true;
    startGeoTracking();
  }
});
