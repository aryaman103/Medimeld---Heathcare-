# AI Models Setup

This directory contains the AI models used by MediMeld Edge for wound classification and SOAP note generation.

## Model Requirements

### Wound Classifier
- **Format**: TensorFlow Lite (.tflite)
- **Size**: ~50MB
- **Input**: 224x224 RGB image
- **Output**: Wound type + severity classification
- **Performance**: ~500ms inference time

### Model Setup

1. **Download the TensorFlow Lite model**:
   - Place `wound_classifier.tflite` in this directory
   - The model should be optimized for mobile inference

2. **Model Specifications**:
   - Input shape: [1, 224, 224, 3]
   - Output: 4 wound types × 3 severity levels = 12 classes
   - Quantized for mobile deployment

3. **Wound Types**:
   - Abrasion
   - Laceration
   - Burn
   - Ulcer

4. **Severity Levels**:
   - Mild
   - Moderate
   - Severe

## SOAP Note Generation

The app uses template-based SOAP note generation instead of a large language model:

- **Method**: Template-based generation
- **Size**: <1MB (templates)
- **Speed**: ~1 second
- **Quality**: Basic medical format

## Integration

The models are loaded by the mobile app at startup:

```javascript
// In mobile/utils/aiUtils.js
import { loadWoundClassifier } from './aiUtils';

// Initialize AI models
await loadWoundClassifier();
```

## Performance Notes

- Models are loaded once at app startup
- Classification runs on-device for privacy
- No internet connection required for AI processing
- Memory usage: <1GB peak during inference

## Development

For development and testing, the app uses simulated AI responses. Replace the placeholder functions in `mobile/utils/aiUtils.js` with actual model inference for production use. 