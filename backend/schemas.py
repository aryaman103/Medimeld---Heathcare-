from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class WoundSeverity(str, Enum):
    """Wound severity levels"""
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"
    CRITICAL = "critical"

class WoundType(str, Enum):
    """Wound classification types"""
    ABRASION = "abrasion"
    LACERATION = "laceration"
    PUNCTURE = "puncture"
    BURN = "burn"
    ULCER = "ulcer"
    SURGICAL = "surgical"
    PRESSURE_SORE = "pressure_sore"
    OTHER = "other"

class NoteData(BaseModel):
    """Data model for a medical note"""
    photo_hash: str = Field(..., description="SHA256 hash of the wound photo")
    wound_type: WoundType = Field(..., description="Classification of wound type")
    wound_severity: WoundSeverity = Field(..., description="Severity assessment")
    soap_note: str = Field(..., description="Generated SOAP note text")
    timestamp: datetime = Field(..., description="When the note was created")
    
    class Config:
        schema_extra = {
            "example": {
                "photo_hash": "a1b2c3d4e5f6...",
                "wound_type": "laceration",
                "wound_severity": "moderate",
                "soap_note": "Subjective: Patient presents with 3cm laceration on left forearm...",
                "timestamp": "2024-01-15T10:30:00Z"
            }
        }

class FailedNote(BaseModel):
    """Model for failed sync attempts"""
    photo_hash: str
    error: str

class SyncResponse(BaseModel):
    """Response model for sync endpoint"""
    synced_count: int = Field(..., description="Number of notes successfully synced")
    failed_count: int = Field(..., description="Number of notes that failed to sync")
    failed_notes: List[FailedNote] = Field(default_factory=list, description="Details of failed notes")
    timestamp: datetime = Field(..., description="When the sync completed")
    
    class Config:
        schema_extra = {
            "example": {
                "synced_count": 5,
                "failed_count": 1,
                "failed_notes": [
                    {
                        "photo_hash": "a1b2c3d4e5f6...",
                        "error": "Database constraint violation"
                    }
                ],
                "timestamp": "2024-01-15T10:35:00Z"
            }
        }

class HealthResponse(BaseModel):
    """Health check response"""
    message: str
    status: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class NotesResponse(BaseModel):
    """Response for notes retrieval"""
    notes: List[dict]
    count: int
    limit: int
    offset: int 