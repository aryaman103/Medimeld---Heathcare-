import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';

// Import AI utilities (to be implemented)
import { classifyWound, generateSOAPNote } from '../utils/aiUtils';

const DiagnosisScreen = ({ imageUri, onDiagnosisComplete, onBack }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);

  useEffect(() => {
    if (imageUri) {
      processImage();
    }
  }, [imageUri]);

  const processImage = async () => {
    setIsProcessing(true);
    
    try {
      // Classify wound (simulated for now)
      const woundClassification = await classifyWound(imageUri);
      
      // Generate SOAP note
      const soapNote = await generateSOAPNote(woundClassification);
      
      const diagnosisData = {
        wound_type: woundClassification.type,
        wound_severity: woundClassification.severity,
        soap_note: soapNote,
        timestamp: new Date().toISOString(),
        image_uri: imageUri,
      };
      
      setDiagnosis(diagnosisData);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to process image: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    if (diagnosis) {
      onDiagnosisComplete(diagnosis);
    }
  };

  const renderProcessing = () => (
    <View style={styles.processingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.processingText}>Analyzing wound...</Text>
      <Text style={styles.processingSubtext}>
        Running AI classification and generating SOAP note
      </Text>
    </View>
  );

  const renderDiagnosis = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diagnosis Results</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} />
      </View>

      {/* Classification */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wound Classification</Text>
        <View style={styles.classificationContainer}>
          <View style={styles.classificationItem}>
            <Text style={styles.classificationLabel}>Type</Text>
            <Text style={styles.classificationValue}>
              {diagnosis.wound_type.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <View style={styles.classificationItem}>
            <Text style={styles.classificationLabel}>Severity</Text>
            <Text style={[
              styles.classificationValue,
              styles[`severity${diagnosis.wound_severity.toUpperCase()}`]
            ]}>
              {diagnosis.wound_severity.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* SOAP Note */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SOAP Note</Text>
        <View style={styles.soapContainer}>
          <Text style={styles.soapText}>{diagnosis.soap_note}</Text>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Ionicons name="save" size={20} color="#FFFFFF" />
        <Text style={styles.saveButtonText}>Save to Local Database</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {isProcessing ? renderProcessing() : renderDiagnosis()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 32,
  },
  processingText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
  },
  processingSubtext: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  placeholder: {
    width: 40,
  },
  imageContainer: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  section: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  classificationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  classificationItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  classificationLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  classificationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  severityMILD: {
    color: '#34C759',
  },
  severityMODERATE: {
    color: '#FF9500',
  },
  severitySEVERE: {
    color: '#FF3B30',
  },
  soapContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
  },
  soapText: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default DiagnosisScreen; 