const tileUrl =
  `${window.location.origin}/tiles/data/vietnam/{z}/{x}/{y}.pbf`;

const map = new maplibregl.Map({
  container: "map",
  style: {
    version: 8,
    sources: {
      vietnam: {
        type: "vector",
        tiles: [tileUrl],
        minzoom: 0,
        maxzoom: 14,
      },
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": "#dce6ed",
        },
      },
      {
        id: "land",
        type: "fill",
        source: "vietnam",
        "source-layer": "land",
        paint: {
          "fill-color": "#f2efe9",
        },
      },
      {
        id: "ocean",
        type: "fill",
        source: "vietnam",
        "source-layer": "ocean",
        paint: {
          "fill-color": "#8dbddd",
        },
      },
      {
        id: "water",
        type: "fill",
        source: "vietnam",
        "source-layer": "water_polygons",
        paint: {
          "fill-color": "#8dbddd",
        },
      },
      {
        id: "streets",
        type: "line",
        source: "vietnam",
        "source-layer": "streets",
        paint: {
          "line-color": "#d79564",
          "line-width": 1.5,
        },
      },
      {
        id: "boundaries",
        type: "line",
        source: "vietnam",
        "source-layer": "boundaries",
        paint: {
          "line-color": "#667085",
          "line-width": 1,
        },
      },
    ],
  },
  center: [107.8, 16.2],
  zoom: 6,
  minZoom: 5,
  maxZoom: 14,
});

map.on("error", (event) => {
  console.error("MapLibre error:", event.error);
});

map.on("load", async () => {
  console.log("Map loaded");

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