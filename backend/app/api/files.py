import json
import uuid
import pandas as pd

from fastapi import APIRouter, HTTPException, UploadFile, Depends
from pandas.errors import ParserError
from sqlalchemy.orm import Session

from app.models import UploadedCSV
from app.database import SessionLocal
from app.storage_services import LocalStorageService

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

router = APIRouter(prefix="/files", tags=["files"])
storage = LocalStorageService()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("")
async def upload_file(file: UploadFile, db: Session = Depends(get_db)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file type. Only CSV files are allowed.")

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="File is empty.")
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File is too large. File size must be less than 5MB.")

    try:
        decoded = contents.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File encoding error. Please upload a CSV file encoded in UTF-8.")

    try:
        from io import StringIO
        df = pd.read_csv(StringIO(decoded), header=0)
        if df.empty or df.columns.size == 0:
            raise HTTPException(status_code=400, detail="Missing header or no data in CSV.")
        
        record = UploadedCSV(
                    filename=file.filename,
                    filesize=len(contents),
                    row_count=len(df),
                    columns=json.dumps(df.columns.tolist())
                    )
        db.add(record)
        db.commit()
        db.refresh(record)

        file_id = str(record.id)
        storage.save_file(file_id, file.file)

        return {
            "status": "success",
            "message": "File saved successfully",
            "data" : {
                "file_id": file_id,
                "filename": record.filename,
                "filesize": record.filesize,
                "rows": len(df),
                "columns": list(df.columns),
                },
        }
    except ParserError:
        raise HTTPException(status_code=400, detail="File parsing error. Please check the CSV format.")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error : {str(e)}")
    
@router.get("")
def list_files(db: Session = Depends(get_db)):
    files = db.query(UploadedCSV).all()
    return [{"file_id": str(file.id),
             "filename": file.filename,
             "filesize": file.filesize,
             "row_count": file.row_count,
             "uploaded_at": file.uploaded_at.isoformat() if file.uploaded_at else None}
             for file in files]

@router.get("/{file_id}")
def get_file(file_id: uuid.UUID, db: Session = Depends(get_db)):
    file_record = db.query(UploadedCSV).filter(UploadedCSV.id == file_id).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="ファイルが見つかりません")
    return file_record

@router.get("/{file_id}/download")
def download_file(file_id: uuid.UUID, db: Session = Depends(get_db)):
    file_record = db.query(UploadedCSV).filter(UploadedCSV.id == file_id).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="ファイルが見つかりません")

    try:
        return storage.get_file_response(str(file_record.id), file_record.filename)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="ファイルが見つかりません")

@router.delete("/{file_id}")
def delete_file(file_id: uuid.UUID, db: Session = Depends(get_db)):
    file_record = db.query(UploadedCSV).filter(UploadedCSV.id == file_id).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="ファイルが見つかりません")

    storage.delete_file(str(file_record.id))

    db.delete(file_record)
    db.commit()
    return {"detail": "削除しました"}