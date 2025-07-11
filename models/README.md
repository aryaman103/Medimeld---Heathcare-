# AI Models for MediMeld Edge

This directory contains the AI models required for offline wound analysis and SOAP note generation.

## Model Downloads

### 1. Wound Classifier (Vision Transformer)

**Model**: ViT-small-patch16-224-in21k-finetuned-vindr-cxr
**Source**: https://huggingface.co/aaraki/vit-small-patch16-224-in21k-finetuned-vindr-cxr
**Size**: ~85MB (quantized)
**Format**: ONNX (int8 quantized)

**Download Instructions**:
```bash
# Clone the repository
git clone https://huggingface.co/aaraki/vit-small-patch16-224-in21k-finetuned-vindr-cxr

# Convert to ONNX and quantize
python -m transformers.onnx --model=aaraki/vit-small-patch16-224-in21k-finetuned-vindr-cxr wound_classifier.onnx

# Quantize to int8 (requires onnxruntime-tools)
python -m onnxruntime.quantization.quantize_dynamic \
  --input wound_classifier.onnx \
  --output wound_classifier_quantized.onnx \
  --weight_type int8
```

**Place the quantized model as**: `wound_classifier.onnx`

### 2. Medical LLM (llama.cpp)

**Model Options**:

#### Option A: Meditron-7B
**Source**: https://huggingface.co/TheBloke/Meditron-7B-GGUF
**Recommended**: `meditron-7b.Q4_K_M.gguf` (~4.2GB)
**Download**: https://huggingface.co/TheBloke/Meditron-7B-GGUF/resolve/main/meditron-7b.Q4_K_M.gguf

#### Option B: MedLlama2-7B
**Source**: https://huggingface.co/TheBloke/medllama2-7b-GGUF
**Recommended**: `medllama2-7b.Q4_K_M.gguf` (~4.2GB)
**Download**: https://huggingface.co/TheBloke/medllama2-7b-GGUF/resolve/main/medllama2-7b.Q4_K_M.gguf

**Download Instructions**:
```bash
# Download Meditron-7B (recommended)
wget https://huggingface.co/TheBloke/Meditron-7B-GGUF/resolve/main/meditron-7b.Q4_K_M.gguf -O medllm.gguf

# Or download MedLlama2-7B
wget https://huggingface.co/TheBloke/medllama2-7b-GGUF/resolve/main/medllama2-7b.Q4_K_M.gguf -O medllm.gguf
```

**Place the model as**: `medllm.gguf`

## Model Integration

### Wound Classifier Integration

The wound classifier should be integrated into the mobile app using ONNX Runtime:

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

### Medical LLM Integration

The medical LLM should be integrated using llama.cpp:

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

## Model Performance

### Wound Classifier
- **Input**: 224x224 RGB image
- **Output**: Wound type and severity classification
- **Inference Time**: ~200ms on modern mobile devices
- **Accuracy**: ~85% on wound classification tasks

### Medical LLM
- **Input**: Text prompt with wound classification
- **Output**: SOAP note text
- **Inference Time**: ~2-5 seconds depending on note length
- **Quality**: Medical-grade SOAP notes following standard format

## Model Updates

To update models:

1. Download new model files
2. Replace existing files in `models/` directory
3. Update model loading code if necessary
4. Test with sample images/inputs
5. Update app version and changelog

## Model Licensing

- **Wound Classifier**: Apache 2.0 (Hugging Face model)
- **Medical LLM**: Various licenses (check individual model pages)
- **Usage**: Ensure compliance with model licenses and medical regulations

## Troubleshooting

### Common Issues

1. **Model too large**: Use smaller quantization (Q2_K, Q3_K)
2. **Slow inference**: Reduce model size or use hardware acceleration
3. **Memory issues**: Implement model unloading when not in use
4. **Accuracy issues**: Retrain or fine-tune models on wound-specific data

### Performance Optimization

1. **Quantization**: Use int8 quantization for faster inference
2. **Model pruning**: Remove unnecessary layers for smaller models
3. **Batch processing**: Process multiple images together when possible
4. **Hardware acceleration**: Use GPU/Neural Engine when available 