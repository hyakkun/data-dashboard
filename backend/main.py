from fastapi import FastAPI, UploadFile
import pandas as pd

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/upload")
async def upload_file(file: UploadFile):
    if not file.filename.endswith('.csv'):
        return {"error": "File must be a CSV"}

    try:
        df = pd.read_csv(file.file)
        # Process the DataFrame as needed
        return {"message": "File processed successfully", "rows": len(df), "columns": list(df.columns)}
    except Exception as e:
        return {"error": str(e)}