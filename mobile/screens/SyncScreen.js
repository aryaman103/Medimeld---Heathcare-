import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { getUnsyncedNotes, markNoteSynced, getDatabaseStats } from '../db/database';

const SyncScreen = ({ onBack }) => {
  const [isOnline, setIsOnline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [unsyncedNotes, setUnsyncedNotes] = useState([]);
  const [stats, setStats] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  useEffect(() => {
    checkNetworkStatus();
    loadUnsyncedNotes();
    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);
    return unsubscribe;
  }, []);

  const checkNetworkStatus = async () => {
    const state = await NetInfo.fetch();
    setIsOnline(state.isConnected);
  };

  const handleNetworkChange = (state) => {
    setIsOnline(state.isConnected);
  };

  const loadUnsyncedNotes = async () => {
    try {
      const [notes, statsData] = await Promise.all([
        getUnsyncedNotes(),
        getDatabaseStats()
      ]);
      setUnsyncedNotes(notes);
      setStats(statsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load unsynced notes: ' + error.message);
    }
  };

  const syncNotes = async () => {
    if (!isOnline) {
      Alert.alert('No Internet', 'Please check your internet connection and try again.');
      return;
    }

    if (unsyncedNotes.length === 0) {
      Alert.alert('No Notes', 'All notes are already synced.');
      return;
    }

    setIsSyncing(true);

    try {
      // In production, this would POST to your FastAPI server
      const serverUrl = 'http://localhost:8000'; // Change to your server URL
      
      const response = await fetch(`${serverUrl}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(unsyncedNotes),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Mark successfully synced notes
        for (const note of unsyncedNotes) {
          await markNoteSynced(note.photo_hash);
        }

        setLastSyncTime(new Date().toISOString());
        await loadUnsyncedNotes(); // Refresh the list
        
        Alert.alert(
          'Sync Successful',
          `Synced ${result.synced_count} notes. ${result.failed_count} failed.`
        );
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert('Sync Failed', 'Failed to sync notes: ' + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const renderNetworkStatus = () => (
    <View style={styles.networkContainer}>
      <View style={styles.networkStatus}>
        <Ionicons
          name={isOnline ? 'wifi' : 'wifi-outline'}
          size={20}
          color={isOnline ? '#34C759' : '#FF3B30'}
        />
        <Text style={[
          styles.networkText,
          { color: isOnline ? '#34C759' : '#FF3B30' }
        ]}>
          {isOnline ? 'Online' : 'Offline'}
        </Text>
      </View>
      <Text style={styles.lastSyncText}>
        Last sync: {formatDate(lastSyncTime)}
      </Text>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{stats?.total_notes || 0}</Text>
        <Text style={styles.statLabel}>Total</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{stats?.synced_notes || 0}</Text>
        <Text style={styles.statLabel}>Synced</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[
          styles.statNumber,
          { color: unsyncedNotes.length > 0 ? '#FF3B30' : '#34C759' }
        ]}>
          {unsyncedNotes.length}
        </Text>
        <Text style={styles.statLabel}>Pending</Text>
      </View>
    </View>
  );

  const renderUnsyncedNote = (note, index) => (
    <View key={index} style={styles.noteItem}>
      <View style={styles.noteInfo}>
        <Text style={styles.noteType}>
          {note.wound_type.replace('_', ' ').toUpperCase()}
        </Text>
        <Text style={styles.noteSeverity}>
          {note.wound_severity.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.noteHash}>
        {note.photo_hash.substring(0, 16)}...
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cloud-done" size={64} color="#34C759" />
      <Text style={styles.emptyText}>All notes synced!</Text>
      <Text style={styles.emptySubtext}>
        Your notes are up to date with the server
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sync</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Network Status */}
      {renderNetworkStatus()}

      {/* Stats */}
      {stats && renderStats()}

      {/* Sync Button */}
      <View style={styles.syncContainer}>
        <TouchableOpacity
          style={[
            styles.syncButton,
            (!isOnline || isSyncing || unsyncedNotes.length === 0) && styles.syncButtonDisabled
          ]}
          onPress={syncNotes}
          disabled={!isOnline || isSyncing || unsyncedNotes.length === 0}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
          )}
          <Text style={styles.syncButtonText}>
            {isSyncing ? 'Syncing...' : 'Sync Notes'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Unsynced Notes */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.notesHeader}>
          <Text style={styles.notesTitle}>
            Pending Notes ({unsyncedNotes.length})
          </Text>
        </View>

        {unsyncedNotes.length > 0 ? (
          unsyncedNotes.map((note, index) => renderUnsyncedNote(note, index))
        ) : (
          renderEmpty()
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
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
  networkContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  networkStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  networkText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  lastSyncText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  syncContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
  },
  syncButtonDisabled: {
    backgroundColor: '#E5E5EA',
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  notesHeader: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#34C759',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
  },
  noteItem: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noteInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  noteSeverity: {
    fontSize: 12,
    color: '#8E8E93',
  },
  noteHash: {
    fontSize: 10,
    color: '#8E8E93',
    fontFamily: 'monospace',
  },
});

export default SyncScreen; 