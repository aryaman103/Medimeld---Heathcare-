import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getNotes, deleteNote, getDatabaseStats } from '../db/database';

const HistoryScreen = ({ onBack }) => {
  const [notes, setNotes] = useState([]);
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const [notesData, statsData] = await Promise.all([
        getNotes(50, 0),
        getDatabaseStats()
      ]);
      setNotes(notesData);
      setStats(statsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load notes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
  };

  const handleDeleteNote = async (noteId) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNote(noteId);
              await loadNotes();
              Alert.alert('Success', 'Note deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete note: ' + error.message);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'mild': return '#34C759';
      case 'moderate': return '#FF9500';
      case 'severe': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{stats?.total_notes || 0}</Text>
        <Text style={styles.statLabel}>Total Notes</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{stats?.synced_notes || 0}</Text>
        <Text style={styles.statLabel}>Synced</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{stats?.unsynced_notes || 0}</Text>
        <Text style={styles.statLabel}>Pending</Text>
      </View>
    </View>
  );

  const renderNote = (note, index) => (
    <View key={note.id || index} style={styles.noteContainer}>
      <View style={styles.noteHeader}>
        <View style={styles.noteInfo}>
          <Text style={styles.noteType}>
            {note.wound_type.replace('_', ' ').toUpperCase()}
          </Text>
          <Text style={[
            styles.noteSeverity,
            { color: getSeverityColor(note.wound_severity) }
          ]}>
            {note.wound_severity.toUpperCase()}
          </Text>
        </View>
        <View style={styles.noteActions}>
          {note.synced_at ? (
            <Ionicons name="cloud-done" size={16} color="#34C759" />
          ) : (
            <Ionicons name="cloud-upload-outline" size={16} color="#FF9500" />
          )}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteNote(note.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      {note.image_uri && (
        <Image source={{ uri: note.image_uri }} style={styles.noteImage} />
      )}

      <View style={styles.noteContent}>
        <Text style={styles.noteText} numberOfLines={3}>
          {note.soap_note}
        </Text>
      </View>

      <View style={styles.noteFooter}>
        <Text style={styles.noteDate}>
          {formatDate(note.created_at)}
        </Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-outline" size={64} color="#8E8E93" />
      <Text style={styles.emptyText}>No notes yet</Text>
      <Text style={styles.emptySubtext}>
        Capture a wound photo to see it here
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
        <Text style={styles.headerTitle}>History</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Stats */}
      {stats && renderStats()}

      {/* Notes List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading notes...</Text>
          </View>
        ) : notes.length > 0 ? (
          notes.map((note, index) => renderNote(note, index))
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  noteContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteInfo: {
    flex: 1,
  },
  noteType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  noteSeverity: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  noteActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  noteImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
    resizeMode: 'cover',
  },
  noteContent: {
    marginBottom: 12,
  },
  noteText: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 20,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default HistoryScreen; 