from fastapi import FastAPI

app = FastAPI()


@app.get("/stations")
def get_stations():
    return [
        {
            "id": 1,
            "lat": 21.0285,
            "lng": 105.8542,
        },
        {
            "id": 2,
            "lat": 10.7769,
            "lng": 106.7009,
        },
    ]