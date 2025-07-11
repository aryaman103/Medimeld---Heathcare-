from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class WoundSeverity(str, Enum):
    """Wound severity levels"""
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"

class WoundType(str, Enum):
    """Wound classification types"""
    ABRASION = "abrasion"
    LACERATION = "laceration"
    BURN = "burn"
    ULCER = "ulcer"

class NoteData(BaseModel):
    """Data model for a medical note"""
    wound_type: WoundType = Field(..., description="Classification of wound type")
    wound_severity: WoundSeverity = Field(..., description="Severity assessment")
    soap_note: str = Field(..., description="Generated SOAP note text")
    timestamp: datetime = Field(..., description="When the note was created")
    
    class Config:
        schema_extra = {
            "example": {
                "wound_type": "laceration",
                "wound_severity": "moderate",
                "soap_note": "Subjective: Patient presents with 3cm laceration on left forearm...",
                "timestamp": "2024-01-15T10:30:00Z"
            }
        }

class FailedNote(BaseModel):
    """Model for failed sync attempts"""
    note_id: str
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
                        "note_id": "note_123",
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