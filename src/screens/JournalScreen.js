import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import StorageService from '../services/storageService';
import Card from '../components/Card';
import Button from '../components/Button';

const MOODS = [
  { emoji: '😀', label: 'Happy' },
  { emoji: '😍', label: 'Excited' },
  { emoji: '😎', label: 'Cool' },
  { emoji: '🤔', label: 'Thoughtful' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '🤩', label: 'Amazed' },
  { emoji: '😤', label: 'Frustrated' },
];

const JournalScreen = ({ route, navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [trips, setTrips] = useState([]);
  const [tripSelectVisible, setTripSelectVisible] = useState(false);
  
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    mood: '😀',
    tripId: '',
    photo: null, // Would store path or base64 data
  });
  
  const [editingEntryId, setEditingEntryId] = useState(null);

  // Load journal entries and trips from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load journal entries
        const storedEntries = await StorageService.getData('journeyscopes_journal') || [];
        setJournalEntries(storedEntries);
        
        // Load trips for selection
        const storedTrips = await StorageService.trips.getAll();
        setTrips(storedTrips);
        
        // If we have a trip from route params, set it as selected
        if (route.params?.tripId) {
          const trip = storedTrips.find(t => t.id === route.params.tripId);
          if (trip) {
            setSelectedTrip(trip);
            setNewEntry(prev => ({ ...prev, tripId: trip.id }));
          }
        }
      } catch (error) {
        console.error('Error loading journal data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [route.params]);

  // Filter entries based on selected trip
  const filteredEntries = selectedTrip 
    ? journalEntries.filter(entry => entry.tripId === selectedTrip.id)
    : journalEntries;

  // Reset form and close modal
  const closeModal = () => {
    setNewEntry({
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      mood: '😀',
      tripId: selectedTrip?.id || '',
      photo: null,
    });
    setEditingEntryId(null);
    setModalVisible(false);
  };

  // Open modal for adding a new entry
  const openAddEntryModal = () => {
    if (!selectedTrip && trips.length > 0) {
      Alert.alert(
        'Select Trip',
        'Please select a trip first to add a journal entry',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Select Trip', 
            onPress: () => setTripSelectVisible(true) 
          }
        ]
      );
      return;
    } else if (!selectedTrip) {
      Alert.alert(
        'No Trips',
        'You need to create a trip first before adding journal entries.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setEditingEntryId(null);
    setNewEntry(prev => ({ ...prev, tripId: selectedTrip.id }));
    setModalVisible(true);
  };

  // Open modal for editing an existing entry
  const openEditEntryModal = (entry) => {
    setNewEntry({
      title: entry.title,
      content: entry.content,
      date: entry.date,
      mood: entry.mood,
      tripId: entry.tripId,
      photo: entry.photo,
    });
    setEditingEntryId(entry.id);
    setModalVisible(true);
  };

  // Save entries to AsyncStorage
  const saveEntriesToStorage = async (entries) => {
    try {
      await StorageService.storeData('journeyscopes_journal', entries);
      return true;
    } catch (error) {
      console.error('Error saving journal entries:', error);
      return false;
    }
  };

  // Save a new entry or update an existing one
  const saveEntry = async () => {
    if (!newEntry.title.trim()) {
      Alert.alert('Error', 'Please enter a title for your journal entry');
      return;
    }

    if (!newEntry.tripId) {
      Alert.alert('Error', 'Please select a trip for this journal entry');
      return;
    }

    try {
      let updatedEntries;
      
      if (editingEntryId) {
        // Update existing entry
        updatedEntries = journalEntries.map(entry => 
          entry.id === editingEntryId 
            ? { ...entry, ...newEntry, updatedAt: new Date().toISOString() }
            : entry
        );
      } else {
        // Add new entry
        const newJournalEntry = {
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          ...newEntry,
        };
        updatedEntries = [...journalEntries, newJournalEntry];
      }
      
      const success = await saveEntriesToStorage(updatedEntries);
      if (success) {
        setJournalEntries(updatedEntries);
        closeModal();
      } else {
        throw new Error('Failed to save entry');
      }
    } catch (error) {
      console.error('Error saving journal entry:', error);
      Alert.alert('Error', 'Failed to save journal entry');
    }
  };

  // Delete an entry
  const deleteEntry = async (entryId) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const updatedEntries = journalEntries.filter(entry => entry.id !== entryId);
              const success = await saveEntriesToStorage(updatedEntries);
              
              if (success) {
                setJournalEntries(updatedEntries);
              } else {
                throw new Error('Failed to delete entry');
              }
            } catch (error) {
              console.error('Error deleting journal entry:', error);
              Alert.alert('Error', 'Failed to delete journal entry');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Handle trip selection
  const selectTrip = (trip) => {
    setSelectedTrip(trip);
    setNewEntry(prev => ({ ...prev, tripId: trip.id }));
    setTripSelectVisible(false);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Today';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  // Render a single journal entry card
  const renderJournalCard = ({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={400}
      delay={index * 100}
    >
      <Card style={styles.journalCard}>
        <View style={styles.journalHeader}>
          <View style={styles.titleMoodContainer}>
            <Text style={[styles.mood]}>{item.mood}</Text>
            <Text style={[styles.title, { color: theme.text }]}>
              {item.title}
            </Text>
          </View>
          <View style={styles.journalActions}>
            <TouchableOpacity 
              onPress={() => openEditEntryModal(item)}
              style={styles.actionButton}
            >
              <Icon name="pencil" size={20} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => deleteEntry(item.id)}
              style={styles.actionButton}
            >
              <Icon name="delete" size={20} color={theme.accent} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.date, { color: theme.text + '99' }]}>
          {formatDate(item.date)}
        </Text>

        <Text style={[styles.content, { color: theme.text + 'E6' }]}>
          {item.content.length > 150 
            ? item.content.substring(0, 150) + '...' 
            : item.content}
        </Text>

        {item.photo && (
          <Image 
            source={{ uri: item.photo }} 
            style={styles.journalImage}
            resizeMode="cover"
          />
        )}
      </Card>
    </Animatable.View>
  );

  // Render journal entry add/edit modal
  const renderEntryModal = () => (
    <Modal
      animationType="slide"
      transparent
      visible={modalVisible}
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <Animatable.View
          animation="fadeInUp"
          duration={300}
          style={[styles.modalContainer, { backgroundColor: theme.cardBackground }]}
        >
          <ScrollView style={styles.modalScroll}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editingEntryId ? 'Edit Journal Entry' : 'New Journal Entry'}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Title</Text>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: theme.border, color: theme.text, backgroundColor: theme.background },
                ]}
                placeholder="Enter a title"
                placeholderTextColor={theme.text + '80'}
                value={newEntry.title}
                onChangeText={(text) => setNewEntry({ ...newEntry, title: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Date</Text>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: theme.border, color: theme.text, backgroundColor: theme.background },
                ]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.text + '80'}
                value={newEntry.date}
                onChangeText={(text) => setNewEntry({ ...newEntry, date: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Mood</Text>
              <View style={styles.moodsContainer}>
                {MOODS.map(mood => (
                  <TouchableOpacity
                    key={mood.emoji}
                    style={[
                      styles.moodButton,
                      newEntry.mood === mood.emoji && {
                        backgroundColor: theme.primary + '30',
                        borderColor: theme.primary,
                      },
                    ]}
                    onPress={() => setNewEntry({ ...newEntry, mood: mood.emoji })}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text style={[styles.moodLabel, { color: theme.text + '99' }]}>
                      {mood.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Journal Entry</Text>
              <TextInput
                style={[
                  styles.textarea,
                  { borderColor: theme.border, color: theme.text, backgroundColor: theme.background },
                ]}
                placeholder="Write about your day..."
                placeholderTextColor={theme.text + '80'}
                value={newEntry.content}
                onChangeText={(text) => setNewEntry({ ...newEntry, content: text })}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.photoPlaceholder}>
              <Text style={[styles.photoText, { color: theme.text + '99' }]}>
                Photo upload would be implemented here
              </Text>
            </View>

            <View style={styles.buttonGroup}>
              <Button
                title="Cancel"
                onPress={closeModal}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title={editingEntryId ? 'Update' : 'Save Entry'}
                onPress={saveEntry}
                style={styles.modalButton}
              />
            </View>
          </ScrollView>
        </Animatable.View>
      </View>
    </Modal>
  );

  // Render trip selection modal
  const renderTripSelectModal = () => (
    <Modal
      animationType="slide"
      transparent
      visible={tripSelectVisible}
      onRequestClose={() => setTripSelectVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <Animatable.View
          animation="fadeInUp"
          duration={300}
          style={[styles.modalContainer, { backgroundColor: theme.cardBackground }]}
        >
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Select Trip
          </Text>

          <FlatList
            data={trips}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.tripSelectItem,
                  {
                    backgroundColor: theme.background,
                    borderColor: selectedTrip?.id === item.id ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => selectTrip(item)}
              >
                <Text style={[styles.tripSelectText, { color: theme.text }]}>
                  {item.destination}
                </Text>
                <Text style={[styles.tripSelectDate, { color: theme.text + '99' }]}>
                  {formatDate(item.startDate)} - {formatDate(item.endDate)}
                </Text>
              </TouchableOpacity>
            )}
            style={styles.tripSelectList}
          />

          <Button
            title="Cancel"
            onPress={() => setTripSelectVisible(false)}
            variant="outline"
            style={styles.fullButton}
          />
        </Animatable.View>
      </View>
    </Modal>
  );

  return (
    <LinearGradient
      colors={isDarkMode ? 
        [theme.background, '#1a1a2e'] : 
        [theme.background, '#f5f5f7']
      }
      style={styles.container}
    >
      <View style={styles.header}>
        <LinearGradient
          colors={[theme.primary, theme.primary + 'CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Trip Journal</Text>
            <TouchableOpacity 
              style={styles.tripSelector}
              onPress={() => setTripSelectVisible(true)}
            >
              <Text style={styles.tripSelectorText}>
                {selectedTrip ? selectedTrip.destination : 'Select Trip'}
              </Text>
              <Icon name="chevron-down" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading journal entries...
          </Text>
        </View>
      ) : filteredEntries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Animatable.View animation="fadeIn" duration={500}>
            <Icon name="notebook" size={60} color={theme.text + '40'} />
          </Animatable.View>
          <Text style={[styles.emptyText, { color: theme.text }]}>
            {selectedTrip 
              ? `No journal entries for ${selectedTrip.destination} yet` 
              : 'Select a trip to view journal entries'}
          </Text>
          {selectedTrip && (
            <Button
              title="Add First Entry"
              onPress={openAddEntryModal}
              style={styles.emptyButton}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => item.id}
          renderItem={renderJournalCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {selectedTrip && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={openAddEntryModal}
        >
          <Icon name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {renderEntryModal()}
      {renderTripSelectModal()}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 15,
  },
  headerGradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  tripSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  tripSelectorText: {
    color: '#fff',
    marginRight: 5,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  emptyButton: {
    minWidth: 150,
  },
  listContent: {
    padding: 15,
    paddingBottom: 80,
  },
  journalCard: {
    marginBottom: 15,
    padding: 15,
  },
  journalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleMoodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  mood: {
    fontSize: 20,
    marginRight: 10,
  },
  date: {
    fontSize: 14,
    marginBottom: 10,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
  },
  journalImage: {
    height: 150,
    borderRadius: 10,
    marginTop: 15,
  },
  journalActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 5,
    marginLeft: 10,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  modalScroll: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 120,
  },
  moodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  moodButton: {
    width: '23%',
    marginRight: '2%',
    marginBottom: 10,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 10,
  },
  photoPlaceholder: {
    height: 100,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  photoText: {
    fontSize: 14,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 0.48,
  },
  fullButton: {
    margin: 20,
  },
  tripSelectList: {
    marginHorizontal: 20,
    marginBottom: 15,
    maxHeight: 300,
  },
  tripSelectItem: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  tripSelectText: {
    fontSize: 16,
    fontWeight: '500',
  },
  tripSelectDate: {
    fontSize: 14,
    marginTop: 5,
  },
});

export default JournalScreen; 