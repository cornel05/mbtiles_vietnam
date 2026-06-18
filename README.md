# MBTiles Vietnam

> Tạm thời bỏ qua các bước 13–17 do chưa test sâu và repo đang thiếu file dữ liệu địa hình.

## 1. Tải DEM Việt Nam một lần

Cài `pmtiles` CLI để cắt dữ liệu DEM khu vực Việt Nam từ file `planet.pmtiles`.

### Windows

1. Tải `go-pmtiles_Windows_x86_64.zip` tại trang release của `go-pmtiles`:
   `https://github.com/protomaps/go-pmtiles/releases`

2. Giải nén và đặt `pmtiles.exe` tại root project:

```text
MBTILES_VIETNAM/
├── pmtiles.exe
├── backend/
├── data/
├── sprites/
├── docker-compose.yml
└── ...
```

3. Mở PowerShell tại root project và chạy một lần:

```powershell
.\pmtiles.exe extract --bbox=102.14,8.18,109.46,23.39 `
  https://download.mapterhorn.com/planet.pmtiles `
  data\vietnam-terrain.pmtiles
```

File đầu ra sẽ được tạo tại:

```text
data/vietnam-terrain.pmtiles
```

Không cần di chuyển file sau khi tải.

## 2. Chạy backend

Mở hai terminal riêng biệt.

### Terminal 1 — Docker

```powershell
cd backend
docker compose up --build
```

### Terminal 2 — FastAPI

```powershell
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
