from fastapi import FastAPI, UploadFile, HTTPException
import pandas as pd

from pandas.errors import ParserError
from fastapi.exceptions import RequestValidationError

from exceptions import http_exception_handler, validation_exception_handler

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

app = FastAPI()

app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/upload")
async def upload_file(file: UploadFile):
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
        # Process the DataFrame as needed
        return {
            "status": "success",
            "message": "File processed successfully",
            "data" : {
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