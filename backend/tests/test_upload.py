from pathlib import Path
import io
import csv

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# テスト用データディレクトリ
DATA_DIR = Path(__file__).parent / "data"

def test_valid_csv():
    file_path = DATA_DIR / "valid.csv"
    with file_path.open("rb") as f:
        response = client.post("/files", files={"file": (file_path.name, f, "text/csv")})
    assert response.status_code == 200
    assert "data" in response.json()

def test_wrong_extension():
    file_path = DATA_DIR / "wrong_extension.txt"
    with file_path.open("rb") as f:
        response = client.post("/files", files={"file": (file_path.name, f, "text/plain")})
    assert response.status_code == 400

def test_empty_file():
    file_path = DATA_DIR / "empty.csv"
    with file_path.open("rb") as f:
        response = client.post("/files", files={"file": (file_path.name, f, "text/csv")})
    assert response.status_code == 400

def test_header_only_csv():
    file_path = DATA_DIR / "header_only.csv"
    with file_path.open("rb") as f:
        response = client.post("/files", files={"file": (file_path.name, f, "text/csv")})
    assert response.status_code == 400

def test_invalid_encoding():
    file_path = DATA_DIR / "invalid_encoding.csv"
    with file_path.open("rb") as f:
        response = client.post("/files", files={"file": (file_path.name, f, "text/csv")})
    assert response.status_code == 400

def test_large_file():
    # サイズ超過用CSVをメモリ上で生成
    large_csv = io.StringIO()
    writer = csv.writer(large_csv)
    writer.writerow(["time_generated", "source_ip__value", "dest_ip__value", "dest_port", "app", "rule_matched", "action__value"])
    for _ in range(1_000_000):
        writer.writerow(["1754925304305014", "213.165.70.241", "70.128.60.208", "443", "ssh", "deny-external", "deny"])
    large_csv.seek(0)

    # バイトストリームに変換
    large_csv_bytes = io.BytesIO(large_csv.getvalue().encode('utf-8'))

    response = client.post("/files", files={"file": ("large.csv", large_csv_bytes, "text/csv")})
    assert response.status_code == 413
