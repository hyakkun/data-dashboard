import uuid
import pandas as pd
from typing import Literal, Optional

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.models import UploadedCSV
from app.database import SessionLocal
from app.storage_services import LocalStorageService

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

router = APIRouter(prefix="/summary", tags=["summary"])
storage = LocalStorageService()

class SummarizeRequest(BaseModel):
    group_by: Literal["action__value", "app", "rule_matched", "dest_port", "source_ip__value", "dest_ip__value"]
    time_unit: Literal["day", "hour", "10min", "5min", "1min"]

def resample_time(df: pd.DataFrame, time_unit: str) -> pd.Series:
    if time_unit == "day":
        return df["time_generated"].dt.strftime("%Y-%m-%d")
    elif time_unit == "hour":
        return df["time_generated"].dt.strftime("%Y-%m-%d %H:00")
    elif time_unit in ["10min", "5min", "1min"]:
        return df["time_generated"].dt.floor(time_unit).dt.strftime("%Y-%m-%d %H:%M")
    else:
        raise ValueError(f"Unsupported time_unit: {time_unit}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/{file_id}")
async def summarize_data(file_id: uuid.UUID, request: SummarizeRequest, db: Session = Depends(get_db)):
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
        df[request.group_by] = df[request.group_by].fillna("unknown")

        if df.empty:
            return {"group_by": request.group_by, "time_unit": request.time_unit, "data": []}        
        
        df["time_bucket"] = resample_time(df, request.time_unit)
        grouped = (
           df.groupby(["time_bucket", request.group_by])
           .size()
           .reset_index(name="count")
           .rename(columns={request.group_by: "category"})
           )
        
        pivoted = grouped.pivot(
            index="time_bucket",
            columns="category",
            values="count"
            ).fillna(0).reset_index()
        
        data = pivoted.to_dict(orient="records")
        categories = list(pivoted.columns.drop("time_bucket"))

        return {
            "status": "success",
            "group_by": request.group_by,
            "time_unit": request.time_unit,
            "categories": categories,
            "summary": data,
            }

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@router.get("/{file_id}")
async def get_summary(file_id: uuid.UUID, db: Session = Depends(get_db)):
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