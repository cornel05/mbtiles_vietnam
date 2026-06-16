const TILE_URL = "/tiles/styles/basic-preview/{z}/{x}/{y}.png";

const map = L.map("map", {
  center: [16.2, 107.8],
  zoom: 6,
  minZoom: 5,
  maxZoom: 14,
  zoomControl: true,
});

L.tileLayer(TILE_URL, {
  minZoom: 0,
  maxZoom: 14,
  tileSize: 256,
  attribution: "Local OpenMapTiles",
}).addTo(map);

async function loadStations() {
  const response = await fetch("/api/stations");

  if (!response.ok) {
    throw new Error(`Không tải được stations: ${response.status}`);
  }

  const stations = await response.json();

  document.getElementById("station-count").textContent =
    `${stations.length} trạm`;

  const markerGroup = L.featureGroup();

  for (const station of stations) {
    const marker = L.circleMarker([station.lat, station.lng], {
      radius: 5,
      weight: 1,
      fillOpacity: 0.85,
    });

    marker.bindTooltip(`Trạm ${station.id}`);
    marker.addTo(markerGroup);
  }

  markerGroup.addTo(map);

  if (markerGroup.getLayers().length > 0) {
    map.fitBounds(markerGroup.getBounds(), {
      padding: [30, 30],
    });
  }
}

loadStations().catch((error) => {
  console.error(error);

  document.getElementById("station-count").textContent =
    "Không tải được dữ liệu trạm";
});