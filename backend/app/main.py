import random
from shapely.geometry import Point, shape
import json

import httpx
from fastapi.responses import StreamingResponse
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="Vietnam Telecom Stations")

with open("/workspaces/mbtiles_vietnam/data/vietnam.geojson") as f:
    vietnam = shape(json.load(f)["features"][0]["geometry"])

def generate_stations(count=500):
    rng = random.Random(42)

    minx, miny, maxx, maxy = vietnam.bounds
    stations = []

    while len(stations) < count:
        lng = rng.uniform(minx, maxx)
        lat = rng.uniform(miny, maxy)

        if vietnam.contains(Point(lng, lat)):
            stations.append({
                "id": len(stations) + 1,
                "name": f"Station {len(stations) + 1}",
                "lat": round(lat, 6),
                "lng": round(lng, 6),
            })

    return stations


STATIONS = generate_stations()


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/api/stations")
def get_stations() -> list[dict]:
    return STATIONS

TILE_SERVER_INTERNAL_URL = "http://127.0.0.1:8080"

@app.get("/tiles/{path:path}")
async def proxy_tiles(path: str):
    client = httpx.AsyncClient(timeout=60.0)

    request = client.build_request(
        "GET",
        f"{TILE_SERVER_INTERNAL_URL}/{path}",
    )

    response = await client.send(request, stream=True)

    forwarded_headers = {}

    for header in (
        "content-type",
        "content-encoding",
        "content-length",
        "etag",
        "last-modified",
    ):
        value = response.headers.get(header)
        if value:
            forwarded_headers[header] = value

    forwarded_headers["cache-control"] = "public, max-age=86400"

    return StreamingResponse(
        response.aiter_raw(),
        status_code=response.status_code,
        headers=forwarded_headers,
        background=response.aclose,
    )

app.mount(
    "/",
    StaticFiles(directory="app/static", html=True),
    name="frontend",
)