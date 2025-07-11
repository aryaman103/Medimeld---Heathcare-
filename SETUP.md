# MediMeld Edge Setup Guide

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Navigate to project directory
cd ~/Downloads/medimeld-edge

# Setup backend
cd backend
pip install -r requirements.txt

# Setup mobile app
cd ../mobile
npm install
```

### 2. Download AI Models

**⚠️ IMPORTANT**: Download these models to the `models/` directory:

#### Wound Classifier (ViT-small)
- **Source**: https://huggingface.co/aaraki/vit-small-patch16-224-in21k-finetuned-vindr-cxr
- **Size**: ~85MB (quantized)
- **Download Command**:
```bash
cd models/
git clone https://huggingface.co/aaraki/vit-small-patch16-224-in21k-finetuned-vindr-cxr
# Convert to ONNX and quantize (see models/README.md)
```

#### Medical LLM (Choose One)

**Option A: Meditron-7B (Recommended)**
- **Source**: https://huggingface.co/TheBloke/Meditron-7B-GGUF
- **File**: `meditron-7b.Q4_K_M.gguf` (~4.2GB)
- **Download**: https://huggingface.co/TheBloke/Meditron-7B-GGUF/resolve/main/meditron-7b.Q4_K_M.gguf

**Option B: MedLlama2-7B**
- **Source**: https://huggingface.co/TheBloke/medllama2-7b-GGUF
- **File**: `medllama2-7b.Q4_K_M.gguf` (~4.2GB)
- **Download**: https://huggingface.co/TheBloke/medllama2-7b-GGUF/resolve/main/medllama2-7b.Q4_K_M.gguf

### 3. Model Setup Commands

```bash
# Create models directory
mkdir -p models

# Download Meditron-7B (recommended)
cd models/
wget https://huggingface.co/TheBloke/Meditron-7B-GGUF/resolve/main/meditron-7b.Q4_K_M.gguf -O medllm.gguf

# Or download MedLlama2-7B
wget https://huggingface.co/TheBloke/medllama2-7b-GGUF/resolve/main/medllama2-7b.Q4_K_M.gguf -O medllm.gguf

# Verify downloads
ls -lh models/
# Should show:
# medllm.gguf (~4.2GB)
# wound_classifier.onnx (~85MB) - after conversion
```

### 4. Start Backend Server

```bash
cd backend
python main.py
```

Server will start at: http://localhost:8000

### 5. Start Mobile App

```bash
cd mobile
npx expo start
```

## 📱 Mobile App Setup

### Prerequisites

- **Node.js 18+**: https://nodejs.org/
- **Expo CLI**: `npm install -g @expo/cli`
- **iOS Simulator**: Xcode (macOS only)
- **Android Emulator**: Android Studio

### Development Commands

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS Simulator
npx expo start --ios

# Run on Android Emulator
npx expo start --android

# Run on web (for testing)
npx expo start --web
```

### Testing Sync

```bash
# Test backend sync
cd backend
python sync_push.py
```

## 🔧 Backend Setup

### Prerequisites

- **Python 3.11+**: https://python.org/
- **pip**: Package manager

### Installation

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run server
python main.py

# Test sync endpoint
python sync_push.py
```

### API Endpoints

- **Health Check**: `GET http://localhost:8000/`
- **Sync Notes**: `POST http://localhost:8000/sync`
- **Get Notes**: `GET http://localhost:8000/notes`

### Database

The backend uses SQLite by default. The database file `medimeld.db` will be created automatically.

## 🤖 AI Model Integration

### Current Implementation

The mobile app currently uses **simulated AI responses** for demonstration. To integrate real models:

### 1. Wound Classifier Integration

```javascript
// In mobile/utils/aiUtils.js
import * as ort from 'expo-onnxruntime';

export const loadWoundClassifier = async () => {
  const session = await ort.InferenceSession.create('./models/wound_classifier.onnx');
  return session;
};

export const classifyWound = async (imageUri, session) => {
  // Preprocess image to 224x224
  const tensor = await preprocessImage(imageUri);
  
  // Run inference
  const results = await session.run({ input: tensor });
  
  // Post-process results
  return postprocessResults(results);
};
```

### 2. Medical LLM Integration

```javascript
// In mobile/utils/aiUtils.js
import { LlamaCpp } from 'llama-cpp-react-native';

export const loadMedicalLLM = async () => {
  const llm = new LlamaCpp({
    modelPath: './models/medllm.gguf',
    nCtx: 2048,
    nThreads: 4,
  });
  return llm;
};

export const generateSOAPNote = async (woundClassification, llm) => {
  const prompt = `Generate a SOAP note for a ${woundClassification.severity} ${woundClassification.type} wound.`;
  
  const response = await llm.complete({
    prompt,
    maxTokens: 500,
    temperature: 0.7,
  });
  
  return response.text;
};
```

## 📊 Testing the Application

### 1. Backend Testing

```bash
cd backend

# Test server health
curl http://localhost:8000/

# Test sync with sample data
python sync_push.py
```

### 2. Mobile App Testing

```bash
cd mobile

# Start app
npx expo start

# Test camera functionality
# 1. Open app
# 2. Grant camera permissions
# 3. Take a photo
# 4. View AI analysis
# 5. Save to local database
# 6. Test sync functionality
```

### 3. End-to-End Testing

```bash
# 1. Start backend
cd backend && python main.py

# 2. Start mobile app
cd ../mobile && npx expo start

# 3. Test complete flow:
# - Capture photo
# - Generate diagnosis
# - Save locally
# - Sync to backend
# - Verify in database
```

## 🔒 Privacy & Security

### Data Protection

- **No Image Upload**: Only photo hashes are synced
- **Local Processing**: All AI runs on-device
- **Encrypted Storage**: SQLite with encryption
- **Hash-based IDs**: No personal data in syncs

### Permissions Required

- **Camera**: For photo capture
- **Photo Library**: For image selection
- **Network**: For sync functionality

## 📈 Performance Benchmarks

### Expected Performance

- **App Startup**: <3 seconds
- **Photo Capture**: <1 second
- **Wound Classification**: ~200ms
- **SOAP Generation**: 2-5 seconds
- **Database Operations**: <100ms
- **Sync Speed**: ~50 notes/second

### Resource Usage

- **App Size**: ~50MB
- **AI Models**: ~4.3GB total
- **Database**: <1MB per 1000 notes
- **Memory**: <2GB peak usage

## 🚨 Troubleshooting

### Common Issues

1. **Models not loading**
   ```bash
   # Check model files exist
   ls -la models/
   
   # Verify file sizes
   du -h models/*
   ```

2. **Camera not working**
   ```bash
   # Reset permissions
   npx expo start --clear
   
   # Check device permissions
   Settings > Privacy > Camera
   ```

3. **Sync failing**
   ```bash
   # Check backend is running
   curl http://localhost:8000/
   
   # Check network connectivity
   ping localhost
   ```

4. **Database errors**
   ```bash
   # Reset database
   rm mobile/medimeld.db
   # Restart app
   ```

### Debug Mode

```bash
# Enable debug logging
EXPO_DEBUG=true npx expo start

# View logs
npx expo logs
```

## 📚 Additional Resources

### Documentation

- **Main README**: [README.md](README.md)
- **Backend Docs**: [backend/README.md](backend/README.md)
- **Mobile Docs**: [mobile/README.md](mobile/README.md)
- **Model Setup**: [models/README.md](models/README.md)
- **System Flow**: [SYSTEM_FLOW.md](SYSTEM_FLOW.md)

### Model Sources

- **ViT Classifier**: https://huggingface.co/aaraki/vit-small-patch16-224-in21k-finetuned-vindr-cxr
- **Meditron-7B**: https://huggingface.co/TheBloke/Meditron-7B-GGUF
- **MedLlama2-7B**: https://huggingface.co/TheBloke/medllama2-7b-GGUF

### Development Tools

- **Expo**: https://expo.dev/
- **React Native**: https://reactnative.dev/
- **FastAPI**: https://fastapi.tiangolo.com/
- **ONNX Runtime**: https://onnxruntime.ai/
- **llama.cpp**: https://github.com/ggerganov/llama.cpp

## 🎯 Next Steps

1. **Download AI Models**: Follow the model setup instructions above
2. **Test Backend**: Run `python main.py` and test with `sync_push.py`
3. **Test Mobile App**: Run `npx expo start` and test camera functionality
4. **Integrate Real AI**: Replace simulated AI with actual model inference
5. **Deploy**: Set up production environment and app store deployment

## 🤝 Support

- **Issues**: Create GitHub issue
- **Documentation**: Check README files
- **Model Issues**: Check model source repositories
- **Development**: Follow contributing guidelines

---

**MediMeld Edge** - Privacy-first healthcare AI for the edge. 