from pathlib import Path
import io
import csv

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# テスト用データディレクトリ
DATA_DIR = Path(__file__).parent / "data"

def test_valid_csv():
    file_path = DATA_DIR / "valid.csv"
    with file_path.open("rb") as f:
        response = client.post("/upload", files={"file": (file_path.name, f, "text/csv")})
    assert response.status_code == 200
    assert "rows" in response.json()

def test_wrong_extension():
    file_path = DATA_DIR / "wrong_extension.txt"
    with file_path.open("rb") as f:
        response = client.post("/upload", files={"file": (file_path.name, f, "text/plain")})
    assert response.status_code == 400

def test_empty_file():
    file_path = DATA_DIR / "empty.csv"
    with file_path.open("rb") as f:
        response = client.post("/upload", files={"file": (file_path.name, f, "text/csv")})
    assert response.status_code == 400

def test_missing_header():
    file_path = DATA_DIR / "missing_header.csv"
    with file_path.open("rb") as f:
        response = client.post("/upload", files={"file": (file_path.name, f, "text/csv")})
    assert response.status_code == 400

def test_invalid_encoding():
    file_path = DATA_DIR / "invalid_encoding.csv"
    with file_path.open("rb") as f:
        response = client.post("/upload", files={"file": (file_path.name, f, "text/csv")})
    assert response.status_code == 400

def test_large_file():
    # サイズ超過用CSVをメモリ上で生成
    large_csv = io.StringIO()
    writer = csv.writer(large_csv)
    writer.writerow(["name", "age", "email"])
    for _ in range(100_000):
        writer.writerow(["John", "99", "john@example.com"])
    large_csv.seek(0)

    # バイトストリームに変換
    large_csv_bytes = io.BytesIO(large_csv.getvalue().encode('utf-8'))

    response = client.post("/upload", files={"file": ("large.csv", large_csv_bytes, "text/csv")})
    assert response.status_code in (400, 413)  # 実装に応じて
