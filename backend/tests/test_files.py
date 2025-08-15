import pytest
from httpx import AsyncClient, ASGITransport
from pathlib import Path

from app.main import app

DATA_DIR = Path(__file__).parent / "data"

@pytest.mark.asyncio
async def test_file_upload_and_download_existing_file():
    # 既存ファイルパス
    file_path = DATA_DIR / "valid.csv"
    assert file_path.exists(), f"テスト用ファイルが見つかりません: {file_path}"

    file_name = file_path.name
    file_content = file_path.read_bytes()

    async with AsyncClient(transport=ASGITransport(app), base_url="http://test") as ac:
        # アップロード
        with file_path.open("rb") as f:
            files = {"file": (file_name, f, "text/csv")}
            upload_resp = await ac.post("/files", files=files)

        assert upload_resp.status_code == 200
        file_id = upload_resp.json().get("data", {}).get("file_id")
        assert file_id is not None

        # ダウンロード
        download_resp = await ac.get(f"/files/{file_id}/download")
        assert download_resp.status_code == 200
        assert download_resp.content == file_content
        assert "text/csv" in download_resp.headers["content-type"]