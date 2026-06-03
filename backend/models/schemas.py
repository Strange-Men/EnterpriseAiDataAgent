"""Pydantic response models for the API."""

from pydantic import BaseModel, Field
from typing import Optional


class ColumnMeta(BaseModel):
    name: str
    dtype: str
    nullable: bool
    uniqueCount: int


class TableInfo(BaseModel):
    name: str
    rowCount: int
    columnCount: int
    columns: list[ColumnMeta] = Field(default_factory=list)


class UploadResult(BaseModel):
    tableName: str
    rowCount: int
    columnCount: int
    status: str
    error: Optional[str] = None


class FieldHealth(BaseModel):
    name: str
    dtype: str
    nullCount: int
    nullPct: float
    uniqueCount: int
    outlierCount: int
    outlierPct: float
    score: float
    warnings: list[str]


class QualityReport(BaseModel):
    overallScore: float
    completenessScore: float
    consistencyScore: float
    validityScore: float
    uniquenessScore: float
    totalRows: int
    totalColumns: int
    nullCells: int
    nullPct: float
    duplicateRows: int
    totalOutliers: int
    warnings: list[str]
    fieldHealth: list[FieldHealth]


class TablePreview(BaseModel):
    columns: list[str]
    data: list[dict]
    rowCount: int


class HealthResponse(BaseModel):
    status: str
    db_connected: bool
