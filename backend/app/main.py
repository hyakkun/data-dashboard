from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError

from app.exceptions import http_exception_handler, validation_exception_handler
from app.api import files

app = FastAPI()

app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

app.include_router(files.router)

@app.get("/health")
def health():
    return {"status": "ok"}

