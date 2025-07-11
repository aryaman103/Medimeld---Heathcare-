# MediMeld Edge Backend

FastAPI server for syncing offline medical notes from the mobile app.

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

The server will start at `http://localhost:8000`

### Development

```bash
# Install development dependencies
pip install -r requirements.txt
pip install pytest pytest-asyncio httpx

# Run tests
pytest tests/ -v

# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 📚 API Documentation

### Health Check

```http
GET /
```

**Response:**
```json
{
  "message": "MediMeld Edge API",
  "status": "healthy"
}
```

### Sync Notes

```http
POST /sync
Content-Type: application/json
```

**Request Body:**
```json
[
  {
    "photo_hash": "a1b2c3d4e5f6...",
    "wound_type": "laceration",
    "wound_severity": "moderate",
    "soap_note": "Subjective: Patient presents...",
    "timestamp": "2024-01-15T10:30:00Z"
  }
]
```

**Response:**
```json
{
  "synced_count": 1,
  "failed_count": 0,
  "failed_notes": [],
  "timestamp": "2024-01-15T10:35:00Z"
}
```

### Get Notes (Admin)

```http
GET /notes?limit=100&offset=0
```

**Response:**
```json
{
  "notes": [
    {
      "photo_hash": "a1b2c3d4e5f6...",
      "wound_type": "laceration",
      "wound_severity": "moderate",
      "soap_note": "Subjective: Patient presents...",
      "timestamp": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-15T10:30:00Z",
      "synced_at": "2024-01-15T10:35:00Z"
    }
  ],
  "count": 1
}
```

## 🗄️ Database Schema

### Notes Table

```sql
CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  photo_hash TEXT UNIQUE NOT NULL,
  wound_type TEXT NOT NULL,
  wound_severity TEXT NOT NULL,
  soap_note TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  synced_at TEXT DEFAULT NULL
);
```

### Indexes

```sql
CREATE INDEX idx_photo_hash ON notes(photo_hash);
CREATE INDEX idx_created_at ON notes(created_at);
CREATE INDEX idx_synced_at ON notes(synced_at);
```

## 🔧 Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=sqlite:///medimeld.db

# Server
HOST=0.0.0.0
PORT=8000

# CORS
ALLOWED_ORIGINS=["*"]

# Logging
LOG_LEVEL=INFO
```

### Database Configuration

```python
# db.py
class DatabaseManager:
    def __init__(self, db_path: str = "medimeld.db"):
        self.db_path = db_path
```

## 🧪 Testing

### Run Tests

```bash
# All tests
pytest tests/ -v

# With coverage
pytest tests/ -v --cov=. --cov-report=html

# Specific test
pytest tests/test_sync.py -v
```

### Test Sync Script

```bash
# Test sync functionality
python sync_push.py
```

### Manual Testing

```bash
# Start server
python main.py

# Test sync endpoint
curl -X POST http://localhost:8000/sync \
  -H "Content-Type: application/json" \
  -d @test_data.json
```

## 📊 Monitoring

### Health Checks

```bash
# Check server health
curl http://localhost:8000/

# Check database
curl http://localhost:8000/notes?limit=1
```

### Logging

```python
import logging

logger = logging.getLogger(__name__)
logger.info("Note synced successfully")
```

## 🔒 Security

### CORS Configuration

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Input Validation

```python
from pydantic import BaseModel, Field

class NoteData(BaseModel):
    photo_hash: str = Field(..., min_length=64, max_length=64)
    wound_type: WoundType
    wound_severity: WoundSeverity
    soap_note: str = Field(..., min_length=10)
    timestamp: datetime
```

## 🚀 Deployment

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: medimeld-edge-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: medimeld-edge-backend
  template:
    metadata:
      labels:
        app: medimeld-edge-backend
    spec:
      containers:
      - name: backend
        image: medimeld-edge-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          value: "sqlite:///medimeld.db"
```

### Environment Variables

```bash
# Production
DATABASE_URL=postgresql://user:pass@host:5432/medimeld
HOST=0.0.0.0
PORT=8000
LOG_LEVEL=WARNING
```

## 📈 Performance

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_photo_hash ON notes(photo_hash);
CREATE INDEX idx_created_at ON notes(created_at);
CREATE INDEX idx_synced_at ON notes(synced_at);

-- Partition by date (for large datasets)
CREATE TABLE notes_2024_01 PARTITION OF notes
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### Caching

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def get_note_by_hash(photo_hash: str):
    # Database query with caching
    pass
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Locked**
   ```bash
   # Check for other processes
   lsof medimeld.db
   
   # Restart server
   pkill -f main.py
   python main.py
   ```

2. **CORS Errors**
   ```python
   # Update CORS settings
   allow_origins=["http://localhost:3000", "https://yourdomain.com"]
   ```

3. **Memory Issues**
   ```bash
   # Monitor memory usage
   ps aux | grep python
   
   # Restart with more memory
   python -X maxsize=2G main.py
   ```

### Debug Mode

```bash
# Enable debug logging
LOG_LEVEL=DEBUG python main.py

# Enable SQL logging
import logging
logging.getLogger('sqlite3').setLevel(logging.DEBUG)
```

## 📚 API Examples

### Python Client

```python
import requests

# Sync notes
notes = [
    {
        "photo_hash": "a1b2c3d4e5f6...",
        "wound_type": "laceration",
        "wound_severity": "moderate",
        "soap_note": "Subjective: Patient presents...",
        "timestamp": "2024-01-15T10:30:00Z"
    }
]

response = requests.post(
    "http://localhost:8000/sync",
    json=notes
)

print(response.json())
```

### JavaScript Client

```javascript
// Sync notes
const notes = [
  {
    photo_hash: "a1b2c3d4e5f6...",
    wound_type: "laceration",
    wound_severity: "moderate",
    soap_note: "Subjective: Patient presents...",
    timestamp: "2024-01-15T10:30:00Z"
  }
];

const response = await fetch('http://localhost:8000/sync', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(notes),
});

const result = await response.json();
console.log(result);
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details. 