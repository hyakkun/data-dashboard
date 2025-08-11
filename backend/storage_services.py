from pathlib import Path
import shutil
from typing import BinaryIO

from fastapi.responses import FileResponse

class LocalStorageService:
    def __init__(self, base_path: str = "uploads"):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

    def save_file(self, file_id: str, file_obj: BinaryIO):
        file_obj.seek(0)  # Ensure the file pointer is at the start
        target_path = self.base_path / file_id
        with open(target_path, "wb") as f:
            shutil.copyfileobj(file_obj, f)
        return str(target_path)
    
    def list_files(self):
        return [str(file) for file in self.base_path.iterdir() if file.is_file()]

    def get_file_path(self, file_id: str) -> Path:
        return self.base_path / file_id
    
    def get_file_response(self, file_id: str, filename: str):
        file_path = self.get_file_path(file_id)
        if not file_path.exists():
            raise FileNotFoundError(f"File {file_id} not found.")
        return FileResponse(path=file_path, media_type="text/csv", filename=filename)

    def delete_file(self, file_id: str):
        path = self.get_file_path(file_id)
        if path.exists():
            path.unlink()