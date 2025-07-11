# MediMeld Edge Mobile App

React Native tablet application for offline wound analysis and SOAP note generation.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator
- Xcode (for iOS development)
- Android Studio (for Android development)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npx expo start
```

### Running on Device

```bash
# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android

# Web (for testing)
npx expo start --web
```

## 📱 App Structure

```
mobile/
├── App.js                 # Main app component
├── screens/              # App screens
│   ├── CameraScreen.js   # Camera capture
│   ├── DiagnosisScreen.js # AI analysis
│   ├── HistoryScreen.js  # Note history
│   └── SyncScreen.js     # Data sync
├── db/                   # Database utilities
│   └── database.js       # SQLite operations
├── utils/                # AI utilities
│   └── aiUtils.js        # Model integration
├── components/           # Reusable components
└── assets/              # Images and icons
```

## 🎯 Features

### Camera & Capture
- **High-quality photos**: 4K resolution support
- **Flash control**: Manual flash toggle
- **Gallery import**: Select existing photos
- **Image preprocessing**: Automatic resizing and optimization

### AI Analysis
- **Wound Classification**: 8 wound types, 4 severity levels
- **SOAP Generation**: Medical-grade notes
- **Offline Processing**: No internet required
- **Confidence Scores**: AI confidence indicators

### Data Management
- **Local Storage**: SQLite database
- **Privacy First**: No cloud storage of images
- **Sync Control**: Manual sync when online
- **Data Export**: Hash-based identification

### User Interface
- **Tablet Optimized**: Large touch targets
- **Medical UI**: Clean, professional design
- **Offline Indicators**: Network status display
- **Progress Feedback**: Loading states and animations

## 🔧 Configuration

### Environment Variables

```bash
# .env
EXPO_PUBLIC_SERVER_URL=http://localhost:8000
EXPO_PUBLIC_APP_NAME=MediMeld Edge
EXPO_PUBLIC_VERSION=1.0.0
```

### App Configuration

```javascript
// app.json
{
  "expo": {
    "name": "MediMeld Edge",
    "slug": "medimeld-edge",
    "version": "1.0.0",
    "orientation": "portrait",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.medimeld.edge"
    },
    "android": {
      "package": "com.medimeld.edge"
    }
  }
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
  image_uri TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  synced_at TEXT DEFAULT NULL
);
```

### Database Operations

```javascript
// Save note
await saveNote({
  photo_hash: "sha256_hash",
  wound_type: "laceration",
  wound_severity: "moderate",
  soap_note: "Subjective: Patient presents...",
  timestamp: "2024-01-15T10:30:00Z",
  image_uri: "file://path/to/image.jpg"
});

// Get notes
const notes = await getNotes(50, 0);

// Get unsynced notes
const unsynced = await getUnsyncedNotes();
```

## 🤖 AI Integration

### Wound Classifier

```javascript
// Load ONNX model
const session = await ort.InferenceSession.create('./models/wound_classifier.onnx');

// Classify wound
const classification = await classifyWound(imageUri, session);
// Returns: { type: 'laceration', severity: 'moderate', confidence: 0.85 }
```

### Medical LLM

```javascript
// Load llama.cpp model
const llm = new LlamaCpp({
  modelPath: './models/medllm.gguf',
  nCtx: 2048,
  nThreads: 4,
});

// Generate SOAP note
const soapNote = await generateSOAPNote(classification, llm);
```

## 📊 State Management

### App State

```javascript
const [currentScreen, setCurrentScreen] = useState('camera');
const [capturedImage, setCapturedImage] = useState(null);
const [diagnosis, setDiagnosis] = useState(null);
const [isProcessing, setIsProcessing] = useState(false);
```

### Database State

```javascript
const [notes, setNotes] = useState([]);
const [stats, setStats] = useState(null);
const [refreshing, setRefreshing] = useState(false);
```

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run specific test
npm test -- --testNamePattern="CameraScreen"

# Run with coverage
npm test -- --coverage
```

### Integration Tests

```bash
# Test database operations
npm test -- --testNamePattern="database"

# Test AI utilities
npm test -- --testNamePattern="aiUtils"
```

### Manual Testing

```bash
# Test on device
npx expo start --tunnel

# Test sync functionality
# 1. Capture photo
# 2. Generate diagnosis
# 3. Save to database
# 4. Test sync with backend
```

## 🚀 Building

### Development Build

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

### Production Build

```bash
# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both
eas build --platform all
```

### App Store Deployment

```bash
# Submit to App Store
eas submit --platform ios

# Submit to Google Play
eas submit --platform android
```

## 🔒 Privacy & Security

### Data Protection

```javascript
// Hash-based identification
const photoHash = await Crypto.digestStringAsync(
  Crypto.CryptoDigestAlgorithm.SHA256,
  imageData
);

// Local storage only
await saveNote({
  photo_hash: photoHash,
  // No image data stored
});
```

### Permissions

```javascript
// Camera permission
const { status } = await Camera.requestCameraPermissionsAsync();

// Photo library permission
const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
```

## 📈 Performance

### Image Optimization

```javascript
// Compress images
const photo = await cameraRef.current.takePictureAsync({
  quality: 0.8,
  base64: false,
});

// Resize for AI processing
const resizedImage = await ImageManipulator.manipulateAsync(
  photo.uri,
  [{ resize: { width: 224, height: 224 } }],
  { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
);
```

### Memory Management

```javascript
// Unload models when not in use
useEffect(() => {
  return () => {
    if (woundClassifier) {
      woundClassifier.release();
    }
    if (medicalLLM) {
      medicalLLM.release();
    }
  };
}, []);
```

## 🔧 Troubleshooting

### Common Issues

1. **Camera not working**
   ```bash
   # Check permissions
   npx expo install expo-camera
   
   # Reset permissions
   npx expo start --clear
   ```

2. **Database errors**
   ```javascript
   // Check database initialization
   await initDatabase();
   
   // Check file permissions
   console.log(FileSystem.documentDirectory);
   ```

3. **AI models not loading**
   ```bash
   # Check model files exist
   ls -la models/
   
   # Check model sizes
   du -h models/*
   ```

### Debug Mode

```bash
# Enable debug logging
EXPO_DEBUG=true npx expo start

# View logs
npx expo logs
```

## 📚 API Integration

### Sync with Backend

```javascript
const syncNotes = async () => {
  const unsyncedNotes = await getUnsyncedNotes();
  
  const response = await fetch(`${SERVER_URL}/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(unsyncedNotes),
  });
  
  if (response.ok) {
    // Mark notes as synced
    for (const note of unsyncedNotes) {
      await markNoteSynced(note.photo_hash);
    }
  }
};
```

### Network Status

```javascript
import NetInfo from '@react-native-community/netinfo';

const [isOnline, setIsOnline] = useState(false);

useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(state => {
    setIsOnline(state.isConnected);
  });
  
  return unsubscribe;
}, []);
```

## 🎨 UI Components

### Custom Components

```javascript
// Severity Badge
const SeverityBadge = ({ severity }) => (
  <View style={[styles.badge, styles[severity]]}>
    <Text style={styles.badgeText}>{severity.toUpperCase()}</Text>
  </View>
);

// Loading Spinner
const LoadingSpinner = ({ message }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
);
```

### Styling

```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details. 