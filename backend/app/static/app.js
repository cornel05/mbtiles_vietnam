initMap().catch((error) => {
  console.error("Map initialization error:", error);

  document.getElementById("station-count").textContent =
    "Không tải được bản đồ";
});

async function initMap() {
  const styleResponse = await fetch("/style.json");

  if (!styleResponse.ok) {
    throw new Error(`Không tải được style: ${styleResponse.status}`);
  }

  const style = await styleResponse.json();
  style.sprite = toAbsoluteTemplateUrl(style.sprite);
  style.glyphs = toAbsoluteTemplateUrl(style.glyphs);

  for (const source of Object.values(style.sources)) {
    if (Array.isArray(source.tiles)) {
      source.tiles = source.tiles.map(toAbsoluteTemplateUrl);
    }
  }

  const map = new maplibregl.Map({
    container: "map",
    style,
    center: [107.8, 16.2],
    zoom: 6,
    minZoom: 5,
    maxZoom: 14,
  });

  map.on("error", (event) => {
    const error = event.error;
    const details = {
      message: error?.message,
      status: error?.status,
      url: error?.url,
      sourceId: event.sourceId,
      tile: event.tile?.tileID?.key,
    };

    console.error("MapLibre error:", JSON.stringify(details));
  });

  map.once("style.load", async () => {
    console.log("Map style loaded");

    try {
      const response = await fetch("/api/stations");
      console.log("Stations response:", response.status);

      if (!response.ok) {
        throw new Error(`API lỗi: ${response.status}`);
      }

      const stations = await response.json();
      console.log("Stations:", stations.length);

      document.getElementById("station-count").textContent =
        `${stations.length} trạm`;

      const geojson = {
        type: "FeatureCollection",
        features: stations.map((station) => ({
          type: "Feature",
          properties: {
            id: station.id,
            name: station.name,
          },
          geometry: {
            type: "Point",
            coordinates: [station.lng, station.lat],
          },
        })),
      };

      map.addSource("stations", {
        type: "geojson",
        data: geojson,
        cluster: true,
        clusterRadius: 45,
        clusterMaxZoom: 12,
      });

      map.addLayer({
        id: "station-clusters",
        type: "circle",
        source: "stations",
        filter: ["has", "point_count"],
        paint: {
          "circle-radius": 12,
          "circle-color": "#2563eb",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.addLayer({
        id: "station-cluster-count",
        type: "symbol",
        source: "stations",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["noto_sans_regular"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#ffffff",
        },
      });

      map.addLayer({
        id: "stations",
        type: "circle",
        source: "stations",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-radius": 3,
          "circle-color": "#368cff",
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffffff",
        },
      });
    } catch (error) {
      console.error("Station loading error:", error);

      document.getElementById("station-count").textContent =
        "Không tải được dữ liệu trạm";
    }
  });
}

function toAbsoluteTemplateUrl(url) {
  if (url.startsWith("/")) {
    return `${window.location.origin}${url}`;
  }

  return new URL(url, window.location.href).href;
}
