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

### Linux / GitHub Codespaces

Chạy script all-in-one dưới đây tại root project. Script sẽ:

- Tự xác định bản release mới nhất của `go-pmtiles` cho Linux x86_64.
- Tải và cài binary vào `data/pmtiles`.
- Cắt DEM khu vực Việt Nam.
- Lưu kết quả tại `data/vietnam-terrain.pmtiles`.

```bash
#!/usr/bin/env bash
set -euo pipefail

mkdir -p data

ASSET_URL="$(
  curl -fsSL https://api.github.com/repos/protomaps/go-pmtiles/releases/latest |
  grep '"browser_download_url"' |
  grep 'Linux_x86_64.tar.gz' |
  cut -d '"' -f 4 |
  head -n 1
)"

if [ -z "$ASSET_URL" ]; then
  echo "Không tìm thấy bản pmtiles cho Linux x86_64"
  exit 1
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

curl -fL "$ASSET_URL" -o "$TMP_DIR/go-pmtiles.tar.gz"
tar -xzf "$TMP_DIR/go-pmtiles.tar.gz" -C "$TMP_DIR"

PMTILES_BIN="$(find "$TMP_DIR" -type f -name pmtiles -print -quit)"

if [ -z "$PMTILES_BIN" ]; then
  echo "Không tìm thấy binary pmtiles trong file tải về"
  exit 1
fi

install -m 755 "$PMTILES_BIN" data/pmtiles

./data/pmtiles extract \
  --bbox=102.14,8.18,109.46,23.39 \
  https://download.mapterhorn.com/planet.pmtiles \
  data/vietnam-terrain.pmtiles
```

Có thể lưu script thành file:

```bash
nano download-vietnam-dem.sh
```

Sau đó cấp quyền thực thi và chạy:

```bash
chmod +x download-vietnam-dem.sh
./download-vietnam-dem.sh
```

Cấu trúc sau khi hoàn tất:

```text
MBTILES_VIETNAM/
├── data/
│   ├── pmtiles
│   └── vietnam-terrain.pmtiles
├── backend/
├── sprites/
├── docker-compose.yml
└── ...
```

Không nên commit binary và file DEM vào Git. Thêm vào `.gitignore`:

```gitignore
data/pmtiles
data/vietnam-terrain.pmtiles
```

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
