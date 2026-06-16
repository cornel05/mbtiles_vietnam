from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

PAGE_URL = "https://download.bbbike.org/osm/region/asia/vietnam/"
OUTPUT_DIR = Path("data")
LINK_TEXT = "MB vector tiles shortbread"


def find_download_url(page_url: str) -> str:
    response = requests.get(page_url, timeout=30)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    for link in soup.find_all("a", href=True):
        if LINK_TEXT.lower() in link.get_text(" ", strip=True).lower():
            return urljoin(page_url, link["href"])

    raise RuntimeError(f"Không tìm thấy link: {LINK_TEXT}")


def download_file(url: str, output_dir: Path) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)

    filename = Path(url.split("?")[0]).name or "vietnam-shortbread.mbtiles"
    output_path = output_dir / filename

    with requests.get(url, stream=True, timeout=120) as response:
        response.raise_for_status()

        total = int(response.headers.get("content-length", 0))
        downloaded = 0

        with output_path.open("wb") as file:
            for chunk in response.iter_content(chunk_size=1024 * 1024):
                if not chunk:
                    continue

                file.write(chunk)
                downloaded += len(chunk)

                if total:
                    percent = downloaded * 100 / total
                    print(f"\rĐang tải: {percent:.1f}%", end="")

    print(f"\nĐã lưu: {output_path}")
    return output_path


if __name__ == "__main__":
    download_url = find_download_url(PAGE_URL)
    print("URL:", download_url)
    download_file(download_url, OUTPUT_DIR)