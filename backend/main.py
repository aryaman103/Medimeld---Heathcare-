from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uvicorn
from db import DatabaseManager
from schemas import NoteData, SyncResponse

app = FastAPI(
    title="MediMeld Edge API",
    description="Privacy-first offline health app backend",
    version="1.0.0"
)

# CORS middleware for mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database manager
db_manager = DatabaseManager()

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    await db_manager.init_db()

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up database connections"""
    await db_manager.close()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "MediMeld Edge API", "status": "healthy"}

@app.post("/sync", response_model=SyncResponse)
async def sync_notes(notes: List[NoteData]):
    """
    Sync offline notes from mobile app to central database
    """
    try:
        synced_count = 0
        failed_notes = []
        
        for note in notes:
            try:
                await db_manager.save_note(note)
                synced_count += 1
            except Exception as e:
                failed_notes.append({
                    "photo_hash": note.photo_hash,
                    "error": str(e)
                })
        
        return SyncResponse(
            synced_count=synced_count,
            failed_count=len(failed_notes),
            failed_notes=failed_notes,
            timestamp=datetime.utcnow()
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")

@app.get("/notes")
async def get_notes(limit: int = 100, offset: int = 0):
    """
    Retrieve synced notes (for admin/debugging)
    """
    try:
        notes = await db_manager.get_notes(limit, offset)
        return {"notes": notes, "count": len(notes)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve notes: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 