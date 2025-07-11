import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import CameraScreen from './screens/CameraScreen';
import DiagnosisScreen from './screens/DiagnosisScreen';
import HistoryScreen from './screens/HistoryScreen';
import SyncScreen from './screens/SyncScreen';

// Import database utilities
import { initDatabase, saveNote, getNotes, getUnsyncedNotes } from './db/database';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('camera');
  const [capturedImage, setCapturedImage] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      // Initialize database
      await initDatabase();
    })();
  }, []);

  const handleImageCapture = async (imageUri) => {
    setCapturedImage(imageUri);
    setCurrentScreen('diagnosis');
  };

  const handleDiagnosisComplete = async (diagnosisData) => {
    setDiagnosis(diagnosisData);
    
    // Save to local database
    try {
      await saveNote(diagnosisData);
      Alert.alert('Success', 'Diagnosis saved to local database');
    } catch (error) {
      Alert.alert('Error', 'Failed to save diagnosis: ' + error.message);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'camera':
        return (
          <CameraScreen
            onImageCaptured={handleImageCapture}
            hasPermission={hasPermission}
          />
        );
      case 'diagnosis':
        return (
          <DiagnosisScreen
            imageUri={capturedImage}
            onDiagnosisComplete={handleDiagnosisComplete}
            onBack={() => setCurrentScreen('camera')}
          />
        );
      case 'history':
        return (
          <HistoryScreen
            onBack={() => setCurrentScreen('camera')}
          />
        );
      case 'sync':
        return (
          <SyncScreen
            onBack={() => setCurrentScreen('camera')}
          />
        );
      default:
        return (
          <CameraScreen
            onImageCaptured={handleImageCapture}
            hasPermission={hasPermission}
          />
        );
    }
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, currentScreen === 'camera' && styles.activeTab]}
        onPress={() => setCurrentScreen('camera')}
      >
        <Ionicons 
          name="camera" 
          size={24} 
          color={currentScreen === 'camera' ? '#007AFF' : '#8E8E93'} 
        />
        <Text style={[styles.tabText, currentScreen === 'camera' && styles.activeTabText]}>
          Camera
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, currentScreen === 'history' && styles.activeTab]}
        onPress={() => setCurrentScreen('history')}
      >
        <Ionicons 
          name="list" 
          size={24} 
          color={currentScreen === 'history' ? '#007AFF' : '#8E8E93'} 
        />
        <Text style={[styles.tabText, currentScreen === 'history' && styles.activeTabText]}>
          History
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, currentScreen === 'sync' && styles.activeTab]}
        onPress={() => setCurrentScreen('sync')}
      >
        <Ionicons 
          name="cloud-upload" 
          size={24} 
          color={currentScreen === 'sync' ? '#007AFF' : '#8E8E93'} 
        />
        <Text style={[styles.tabText, currentScreen === 'sync' && styles.activeTabText]}>
          Sync
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="camera-off" size={64} color="#FF3B30" />
        <Text style={styles.errorText}>No access to camera</Text>
        <Text style={styles.errorSubtext}>
          Please enable camera permissions in your device settings.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
      
      <View style={styles.header}>
        <Text style={styles.title}>MediMeld Edge</Text>
        <Text style={styles.subtitle}>Privacy-first wound analysis</Text>
      </View>

      <View style={styles.content}>
        {renderScreen()}
      </View>

      {renderTabBar()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 32,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF3B30',
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    backgroundColor: '#F2F2F7',
  },
  tabText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default App; 