import uuid

from sqlalchemy import Column, DateTime, String, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class UploadedCSV(Base):
    __tablename__ = 'uploaded_csvs'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    filename = Column(String, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    columns = Column(String, nullable=False)  # Comma-separated list of column names
    filesize = Column(Integer, nullable=False)
    row_count = Column(Integer, nullable=True)