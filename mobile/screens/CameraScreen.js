import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const CameraScreen = ({ onImageCaptured, hasPermission }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const cameraRef = useRef(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setIsCapturing(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        onImageCaptured(photo.uri);
      } catch (error) {
        Alert.alert('Error', 'Failed to capture photo: ' + error.message);
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageCaptured(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image: ' + error.message);
    }
  };

  const toggleFlash = () => {
    setFlashMode(
      flashMode === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.on
        : Camera.Constants.FlashMode.off
    );
  };

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-off" size={64} color="#FF3B30" />
        <Text style={styles.permissionText}>Camera permission required</Text>
        <Text style={styles.permissionSubtext}>
          Please enable camera access in your device settings.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={Camera.Constants.Type.back}
        flashMode={flashMode}
        ratio="4:3"
      >
        <View style={styles.overlay}>
          {/* Top controls */}
          <View style={styles.topControls}>
            <TouchableOpacity
              style={styles.flashButton}
              onPress={toggleFlash}
            >
              <Ionicons
                name={flashMode === Camera.Constants.FlashMode.on ? 'flash' : 'flash-off'}
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          {/* Center guide */}
          <View style={styles.guideContainer}>
            <View style={styles.guideFrame}>
              <Text style={styles.guideText}>Position wound in frame</Text>
            </View>
          </View>

          {/* Bottom controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity
              style={styles.galleryButton}
              onPress={pickImage}
            >
              <Ionicons name="images" size={24} color="#FFFFFF" />
              <Text style={styles.buttonText}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
              onPress={takePicture}
              disabled={isCapturing}
            >
              {isCapturing ? (
                <ActivityIndicator size="large" color="#FFFFFF" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>

            <View style={styles.placeholder} />
          </View>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 32,
  },
  permissionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF3B30',
    marginTop: 16,
  },
  permissionSubtext: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
  },
  flashButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 12,
  },
  guideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideFrame: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  guideText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  galleryButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 12,
    minWidth: 80,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#007AFF',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
  },
  placeholder: {
    width: 80,
  },
});

export default CameraScreen; 