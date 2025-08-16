import uuid
import pandas as pd

from fastapi import APIRouter, HTTPException, UploadFile, Depends
from sqlalchemy.orm import Session

from app.models import UploadedCSV
from app.database import SessionLocal
from app.storage_services import LocalStorageService

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

router = APIRouter(prefix="/summary", tags=["summary"])
storage = LocalStorageService()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/{file_id}")
def get_summary(file_id: uuid.UUID, db: Session = Depends(get_db)):
    record = db.query(UploadedCSV).filter(UploadedCSV.id == file_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="File not found.")

    try:
        file_path = storage.get_file_path(str(file_id))
        df = pd.read_csv(file_path)
        
        if "time_generated" not in df.columns:
            raise HTTPException(status_code=400, detail="CSV must contain 'time_generated' column.")

        df["time_generated"] = pd.to_datetime(df["time_generated"], unit="us", errors="coerce", utc=True).dt.tz_convert('Asia/Tokyo')
        df = df.dropna(subset=["time_generated"])
        df["date"] = df["time_generated"].dt.strftime("%Y-%m-%d")
        counts_by_date = (
            df.groupby("date")
            .size()
            .reset_index(name="count")
            .sort_values("date")
        )
        summary = counts_by_date.to_dict(orient="records")
        
        return {"status": "success", "summary": summary}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")