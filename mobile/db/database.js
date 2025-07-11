import * as SQLite from 'expo-sqlite';

// Database name
const DB_NAME = 'medimeld.db';

// Initialize database
export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    const db = SQLite.openDatabase(DB_NAME);
    
    db.transaction(tx => {
      // Create notes table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          photo_hash TEXT UNIQUE NOT NULL,
          wound_type TEXT NOT NULL,
          wound_severity TEXT NOT NULL,
          soap_note TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          image_uri TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          synced_at TEXT DEFAULT NULL
        )`,
        [],
        () => {
          console.log('Database initialized successfully');
          resolve();
        },
        (_, error) => {
          console.error('Database initialization error:', error);
          reject(error);
        }
      );
    });
  });
};

// Save note to database
export const saveNote = async (noteData) => {
  return new Promise((resolve, reject) => {
    const db = SQLite.openDatabase(DB_NAME);
    
    db.transaction(tx => {
      tx.executeSql(
        `INSERT OR REPLACE INTO notes 
         (photo_hash, wound_type, wound_severity, soap_note, timestamp, image_uri)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          noteData.photo_hash,
          noteData.wound_type,
          noteData.wound_severity,
          noteData.soap_note,
          noteData.timestamp,
          noteData.image_uri || null
        ],
        (_, result) => {
          console.log('Note saved successfully');
          resolve(result);
        },
        (_, error) => {
          console.error('Save note error:', error);
          reject(error);
        }
      );
    });
  });
};

// Get all notes
export const getNotes = async (limit = 100, offset = 0) => {
  return new Promise((resolve, reject) => {
    const db = SQLite.openDatabase(DB_NAME);
    
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM notes 
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`,
        [limit, offset],
        (_, { rows }) => {
          resolve(rows._array);
        },
        (_, error) => {
          console.error('Get notes error:', error);
          reject(error);
        }
      );
    });
  });
};

// Get unsynced notes
export const getUnsyncedNotes = async () => {
  return new Promise((resolve, reject) => {
    const db = SQLite.openDatabase(DB_NAME);
    
    db.transaction(tx => {
      tx.executeSql(
        `SELECT photo_hash, wound_type, wound_severity, soap_note, timestamp
         FROM notes 
         WHERE synced_at IS NULL
         ORDER BY created_at ASC`,
        [],
        (_, { rows }) => {
          resolve(rows._array);
        },
        (_, error) => {
          console.error('Get unsynced notes error:', error);
          reject(error);
        }
      );
    });
  });
};

// Mark note as synced
export const markNoteSynced = async (photoHash) => {
  return new Promise((resolve, reject) => {
    const db = SQLite.openDatabase(DB_NAME);
    
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE notes 
         SET synced_at = datetime('now')
         WHERE photo_hash = ?`,
        [photoHash],
        (_, result) => {
          console.log('Note marked as synced');
          resolve(result);
        },
        (_, error) => {
          console.error('Mark synced error:', error);
          reject(error);
        }
      );
    });
  });
};

// Delete note
export const deleteNote = async (photoHash) => {
  return new Promise((resolve, reject) => {
    const db = SQLite.openDatabase(DB_NAME);
    
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM notes WHERE photo_hash = ?`,
        [photoHash],
        (_, result) => {
          console.log('Note deleted successfully');
          resolve(result);
        },
        (_, error) => {
          console.error('Delete note error:', error);
          reject(error);
        }
      );
    });
  });
};

// Get note by photo hash
export const getNoteByHash = async (photoHash) => {
  return new Promise((resolve, reject) => {
    const db = SQLite.openDatabase(DB_NAME);
    
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM notes WHERE photo_hash = ?`,
        [photoHash],
        (_, { rows }) => {
          resolve(rows._array[0] || null);
        },
        (_, error) => {
          console.error('Get note by hash error:', error);
          reject(error);
        }
      );
    });
  });
};

// Get database statistics
export const getDatabaseStats = async () => {
  return new Promise((resolve, reject) => {
    const db = SQLite.openDatabase(DB_NAME);
    
    db.transaction(tx => {
      tx.executeSql(
        `SELECT 
           COUNT(*) as total_notes,
           COUNT(CASE WHEN synced_at IS NULL THEN 1 END) as unsynced_notes,
           COUNT(CASE WHEN synced_at IS NOT NULL THEN 1 END) as synced_notes
         FROM notes`,
        [],
        (_, { rows }) => {
          resolve(rows._array[0]);
        },
        (_, error) => {
          console.error('Get database stats error:', error);
          reject(error);
        }
      );
    });
  });
};

// Clear all data (for testing)
export const clearDatabase = async () => {
  return new Promise((resolve, reject) => {
    const db = SQLite.openDatabase(DB_NAME);
    
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM notes`,
        [],
        (_, result) => {
          console.log('Database cleared successfully');
          resolve(result);
        },
        (_, error) => {
          console.error('Clear database error:', error);
          reject(error);
        }
      );
    });
  });
}; 