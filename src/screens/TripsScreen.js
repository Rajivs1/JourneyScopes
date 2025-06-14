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
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../context/ThemeContext';
import StorageService from '../services/storageService';
import Card from '../components/Card';
import Button from '../components/Button';

const TripsScreen = () => {
  const { theme } = useTheme();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTrip, setNewTrip] = useState({
    destination: '',
    startDate: '',
    endDate: '',
  });
  const [editingTripId, setEditingTripId] = useState(null);

  // Load trips from storage
  useEffect(() => {
    const loadTrips = async () => {
      try {
        const storedTrips = await StorageService.trips.getAll();
        setTrips(storedTrips);
      } catch (error) {
        console.error('Error loading trips:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrips();
  }, []);

  // Reset form and close modal
  const closeModal = () => {
    setNewTrip({ destination: '', startDate: '', endDate: '' });
    setEditingTripId(null);
    setModalVisible(false);
  };

  // Open modal for adding a new trip
  const openAddTripModal = () => {
    setEditingTripId(null);
    setModalVisible(true);
  };

  // Open modal for editing an existing trip
  const openEditTripModal = (trip) => {
    setNewTrip({
      destination: trip.destination,
      startDate: trip.startDate || '',
      endDate: trip.endDate || '',
    });
    setEditingTripId(trip.id);
    setModalVisible(true);
  };

  // Save a new trip or update an existing one
  const saveTrip = async () => {
    if (!newTrip.destination.trim()) {
      Alert.alert('Error', 'Please enter a destination');
      return;
    }

    try {
      if (editingTripId) {
        // Update existing trip
        const updatedTrip = await StorageService.trips.updateTrip(editingTripId, newTrip);
        setTrips(trips.map(trip => (trip.id === editingTripId ? updatedTrip : trip)));
      } else {
        // Add new trip
        const addedTrip = await StorageService.trips.addTrip(newTrip);
        setTrips([...trips, addedTrip]);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving trip:', error);
      Alert.alert('Error', 'Failed to save trip');
    }
  };

  // Delete a trip
  const deleteTrip = async (tripId) => {
    try {
      Alert.alert(
        'Delete Trip',
        'Are you sure you want to delete this trip?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            onPress: async () => {
              const success = await StorageService.trips.deleteTrip(tripId);
              if (success) {
                setTrips(trips.filter(trip => trip.id !== tripId));
              }
            },
            style: 'destructive',
          },
        ]
      );
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    
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

  // Render a single trip card
  const renderTripCard = ({ item, index }) => (
    <Card
      animation="fadeInUp"
      delay={index * 100}
      style={styles.tripCard}
    >
      <View style={styles.tripHeader}>
        <Text style={[styles.destination, { color: theme.text }]}>
          {item.destination}
        </Text>
        <View style={styles.tripActions}>
          <TouchableOpacity 
            onPress={() => openEditTripModal(item)}
            style={styles.actionButton}
          >
            <Icon name="pencil" size={20} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => deleteTrip(item.id)}
            style={styles.actionButton}
          >
            <Icon name="delete" size={20} color={theme.accent} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tripDetails}>
        <View style={styles.dateContainer}>
          <Icon name="calendar-range" size={16} color={theme.secondary} style={styles.dateIcon} />
          <Text style={[styles.dateLabel, { color: theme.text + '99' }]}>
            {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </Text>
        </View>
      </View>
    </Card>
  );

  // Render trip add/edit modal
  const renderTripModal = () => (
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
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            {editingTripId ? 'Edit Trip' : 'Add New Trip'}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Destination</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.border, color: theme.text, backgroundColor: theme.background },
              ]}
              placeholder="Where are you going?"
              placeholderTextColor={theme.text + '80'}
              value={newTrip.destination}
              onChangeText={(text) => setNewTrip({ ...newTrip, destination: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Start Date</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.border, color: theme.text, backgroundColor: theme.background },
              ]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.text + '80'}
              value={newTrip.startDate}
              onChangeText={(text) => setNewTrip({ ...newTrip, startDate: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>End Date</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.border, color: theme.text, backgroundColor: theme.background },
              ]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.text + '80'}
              value={newTrip.endDate}
              onChangeText={(text) => setNewTrip({ ...newTrip, endDate: text })}
            />
          </View>

          <View style={styles.buttonGroup}>
            <Button
              title="Cancel"
              onPress={closeModal}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title={editingTripId ? 'Update' : 'Add Trip'}
              onPress={saveTrip}
              style={styles.modalButton}
            />
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );

  // Loading screen
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          style={styles.loadingContainer}
        >
          <Icon name="airplane" size={50} color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading your trips...
          </Text>
        </Animatable.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My Trips</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={openAddTripModal}
        >
          <Icon name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Trip List */}
      {trips.length > 0 ? (
        <FlatList
          data={trips}
          renderItem={renderTripCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Animatable.View animation="pulse" iterationCount={3} duration={2000}>
            <Icon name="airplane-takeoff" size={70} color={theme.text + '40'} />
          </Animatable.View>
          <Text style={[styles.emptyText, { color: theme.text }]}>
            No trips planned yet
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.text + '99' }]}>
            Tap the + button to start planning
          </Text>
          <Button
            title="Add Your First Trip"
            onPress={openAddTripModal}
            style={styles.firstTripButton}
          />
        </View>
      )}

      {renderTripModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  tripCard: {
    marginBottom: 16,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  destination: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  tripActions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginLeft: 10,
  },
  tripDetails: {
    marginTop: 5,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 5,
  },
  dateLabel: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 30,
  },
  firstTripButton: {
    paddingHorizontal: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default TripsScreen;
