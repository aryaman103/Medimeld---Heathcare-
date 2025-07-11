import sqlite3
import asyncio
from typing import List, Optional
from datetime import datetime
from schemas import NoteData
import logging

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Database manager for SQLite operations with async wrapper"""
    
    def __init__(self, db_path: str = "medimeld.db"):
        self.db_path = db_path
        self._lock = asyncio.Lock()
    
    async def init_db(self):
        """Initialize database tables"""
        async with self._lock:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Create notes table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS notes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    wound_type TEXT NOT NULL,
                    wound_severity TEXT NOT NULL,
                    soap_note TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    synced_at TEXT DEFAULT NULL
                )
            """)
            
            conn.commit()
            conn.close()
            logger.info("Database initialized successfully")
    
    async def save_note(self, note: NoteData) -> bool:
        """Save a note to the database"""
        async with self._lock:
            try:
                conn = sqlite3.connect(self.db_path)
                cursor = conn.cursor()
                
                cursor.execute("""
                    INSERT INTO notes 
                    (wound_type, wound_severity, soap_note, timestamp, synced_at)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    note.wound_type,
                    note.wound_severity,
                    note.soap_note,
                    note.timestamp.isoformat(),
                    datetime.utcnow().isoformat()
                ))
                
                conn.commit()
                conn.close()
                logger.info(f"Note saved: {note.wound_type} - {note.wound_severity}")
                return True
                
            except Exception as e:
                logger.error(f"Failed to save note: {e}")
                return False
    
    async def get_notes(self, limit: int = 100, offset: int = 0) -> List[dict]:
        """Retrieve notes from database"""
        async with self._lock:
            try:
                conn = sqlite3.connect(self.db_path)
                cursor = conn.cursor()
                
                cursor.execute("""
                    SELECT id, wound_type, wound_severity, soap_note, timestamp, created_at, synced_at
                    FROM notes
                    ORDER BY created_at DESC
                    LIMIT ? OFFSET ?
                """, (limit, offset))
                
                rows = cursor.fetchall()
                conn.close()
                
                return [
                    {
                        "id": row[0],
                        "wound_type": row[1],
                        "wound_severity": row[2],
                        "soap_note": row[3],
                        "timestamp": row[4],
                        "created_at": row[5],
                        "synced_at": row[6]
                    }
                    for row in rows
                ]
                
            except Exception as e:
                logger.error(f"Failed to retrieve notes: {e}")
                return []
    
    async def get_unsynced_notes(self) -> List[dict]:
        """Get notes that haven't been synced yet"""
        async with self._lock:
            try:
                conn = sqlite3.connect(self.db_path)
                cursor = conn.cursor()
                
                cursor.execute("""
                    SELECT id, wound_type, wound_severity, soap_note, timestamp
                    FROM notes
                    WHERE synced_at IS NULL
                    ORDER BY created_at ASC
                """)
                
                rows = cursor.fetchall()
                conn.close()
                
                return [
                    {
                        "id": row[0],
                        "wound_type": row[1],
                        "wound_severity": row[2],
                        "soap_note": row[3],
                        "timestamp": row[4]
                    }
                    for row in rows
                ]
                
            except Exception as e:
                logger.error(f"Failed to retrieve unsynced notes: {e}")
                return []
    
    async def mark_synced(self, note_id: int) -> bool:
        """Mark a note as synced"""
        async with self._lock:
            try:
                conn = sqlite3.connect(self.db_path)
                cursor = conn.cursor()
                
                cursor.execute("""
                    UPDATE notes 
                    SET synced_at = ? 
                    WHERE id = ?
                """, (datetime.utcnow().isoformat(), note_id))
                
                conn.commit()
                conn.close()
                return True
                
            except Exception as e:
                logger.error(f"Failed to mark note as synced: {e}")
                return False
    
    async def close(self):
        """Close database connections"""
        # SQLite connections are closed after each operation
        pass 