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
  ScrollView,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

import { useTheme } from '../context/ThemeContext';
import StorageService from '../services/storageService';
import Card from '../components/Card';
import Button from '../components/Button';

// Checklist types
const CHECKLIST_TYPES = {
  PACKING: 'packing',
  TASKS: 'tasks',
};

const ChecklistScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [trips, setTrips] = useState([]);
  const [tripSelectVisible, setTripSelectVisible] = useState(false);
  const [checklistType, setChecklistType] = useState(CHECKLIST_TYPES.PACKING);
  
  const [newItem, setNewItem] = useState({
    title: '',
    type: CHECKLIST_TYPES.PACKING,
    tripId: '',
  });

  // Load checklist and trips from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load checklist items
        const storedItems = await StorageService.checklist.getAll();
        setChecklist(storedItems);
        
        // Load trips for selection
        const storedTrips = await StorageService.trips.getAll();
        setTrips(storedTrips);
      } catch (error) {
        console.error('Error loading checklist data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter checklist based on selected trip and type
  const getFilteredChecklist = () => {
    if (!selectedTrip) {
      return checklist.filter(item => item.type === checklistType);
    }
    return checklist.filter(
      item => item.tripId === selectedTrip.id && item.type === checklistType
    );
  };

  // Reset form and close modal
  const closeModal = () => {
    setNewItem({
      title: '',
      type: checklistType,
      tripId: selectedTrip?.id || '',
    });
    setModalVisible(false);
  };

  // Open modal for adding a new item
  const openAddItemModal = () => {
    if (!selectedTrip && trips.length > 0) {
      Alert.alert(
        'Select Trip',
        'Please select a trip first to add a checklist item',
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
        'You need to create a trip first before adding checklist items.',
        [{ text: 'OK' }]
      );
      return;
    }

    setNewItem({
      title: '',
      type: checklistType,
      tripId: selectedTrip.id,
    });
    setModalVisible(true);
  };

  // Save a new item
  const saveItem = async () => {
    if (!newItem.title.trim()) {
      Alert.alert('Error', 'Please enter a title for your checklist item');
      return;
    }

    try {
      // Add new item
      const addedItem = await StorageService.checklist.addItem({
        title: newItem.title,
        type: checklistType,
        tripId: selectedTrip.id,
      });
      
      setChecklist([...checklist, addedItem]);
      closeModal();
    } catch (error) {
      console.error('Error saving checklist item:', error);
      Alert.alert('Error', 'Failed to save checklist item');
    }
  };

  // Toggle item completion
  const toggleItem = async (itemId) => {
    try {
      const updatedItem = await StorageService.checklist.toggleItem(itemId);
      if (updatedItem) {
        setChecklist(
          checklist.map(item => (item.id === itemId ? updatedItem : item))
        );
      }
    } catch (error) {
      console.error('Error toggling checklist item:', error);
    }
  };

  // Delete an item
  const deleteItem = async (itemId) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this checklist item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const success = await StorageService.checklist.deleteItem(itemId);
              
              if (success) {
                setChecklist(checklist.filter(item => item.id !== itemId));
              } else {
                throw new Error('Failed to delete item');
              }
            } catch (error) {
              console.error('Error deleting checklist item:', error);
              Alert.alert('Error', 'Failed to delete checklist item');
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
    setTripSelectVisible(false);
  };

  // Get item completion stats
  const getCompletionStats = () => {
    const filteredItems = getFilteredChecklist();
    const totalItems = filteredItems.length;
    const completedItems = filteredItems.filter(item => item.completed).length;
    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    return {
      total: totalItems,
      completed: completedItems,
      percentage,
    };
  };

  // Render a single checklist item
  const renderChecklistItem = ({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={400}
      delay={index * 50}
    >
      <Card style={[
        styles.checklistItem,
        item.completed && { borderColor: theme.primary + '60' }
      ]}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => toggleItem(item.id)}
        >
          <View style={[
            styles.checkbox,
            {
              borderColor: item.completed ? theme.primary : theme.text + '60',
              backgroundColor: item.completed ? theme.primary + '20' : 'transparent',
            }
          ]}>
            {item.completed && (
              <Icon name="check" size={16} color={theme.primary} />
            )}
          </View>
        </TouchableOpacity>
        
        <Text 
          style={[
            styles.itemTitle, 
            { 
              color: theme.text,
              textDecorationLine: item.completed ? 'line-through' : 'none',
              opacity: item.completed ? 0.7 : 1,
            }
          ]}
        >
          {item.title}
        </Text>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteItem(item.id)}
        >
          <Icon name="delete-outline" size={20} color={theme.accent} />
        </TouchableOpacity>
      </Card>
    </Animatable.View>
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
                  {item.startDate} - {item.endDate}
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

  // Render add item modal
  const renderAddItemModal = () => (
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
            Add to {checklistType === CHECKLIST_TYPES.PACKING ? 'Packing List' : 'To-Do List'}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>
              {checklistType === CHECKLIST_TYPES.PACKING ? 'Item to Pack' : 'Task to Complete'}
            </Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.border, color: theme.text, backgroundColor: theme.background },
              ]}
              placeholder={checklistType === CHECKLIST_TYPES.PACKING ? "e.g., Passport, Charger, etc." : "e.g., Book hotel, Exchange currency, etc."}
              placeholderTextColor={theme.text + '80'}
              value={newItem.title}
              onChangeText={(text) => setNewItem({ ...newItem, title: text })}
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
              title="Add Item"
              onPress={saveItem}
              style={styles.modalButton}
            />
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );

  const stats = getCompletionStats();

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
            <Text style={styles.headerTitle}>Checklist</Text>
            <TouchableOpacity 
              style={styles.tripSelector}
              onPress={() => setTripSelectVisible(true)}
            >
              <Text style={styles.tripSelectorText}>
                {selectedTrip ? selectedTrip.destination : 'All Trips'}
              </Text>
              <Icon name="chevron-down" size={16} color="#fff" />
            </TouchableOpacity>
            
            {selectedTrip && stats.total > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBackground}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${stats.percentage}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {stats.completed}/{stats.total} items completed ({stats.percentage}%)
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>

      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            checklistType === CHECKLIST_TYPES.PACKING && styles.activeTypeButton,
            { borderColor: theme.border }
          ]}
          onPress={() => setChecklistType(CHECKLIST_TYPES.PACKING)}
        >
          <Icon 
            name="bag-personal" 
            size={22} 
            color={checklistType === CHECKLIST_TYPES.PACKING ? theme.primary : theme.text + '99'} 
            style={styles.typeIcon}
          />
          <Text style={[
            styles.typeText,
            { color: theme.text },
            checklistType === CHECKLIST_TYPES.PACKING && { color: theme.primary }
          ]}>
            Packing List
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.typeButton,
            checklistType === CHECKLIST_TYPES.TASKS && styles.activeTypeButton,
            { borderColor: theme.border }
          ]}
          onPress={() => setChecklistType(CHECKLIST_TYPES.TASKS)}
        >
          <Icon 
            name="clipboard-check" 
            size={22} 
            color={checklistType === CHECKLIST_TYPES.TASKS ? theme.primary : theme.text + '99'} 
            style={styles.typeIcon}
          />
          <Text style={[
            styles.typeText,
            { color: theme.text },
            checklistType === CHECKLIST_TYPES.TASKS && { color: theme.primary }
          ]}>
            To-Do List
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading checklist...
          </Text>
        </View>
      ) : getFilteredChecklist().length === 0 ? (
        <View style={styles.emptyContainer}>
          <Animatable.View animation="fadeIn" duration={500}>
            <Icon 
              name={checklistType === CHECKLIST_TYPES.PACKING ? "bag-personal-outline" : "clipboard-outline"} 
              size={60} 
              color={theme.text + '40'} 
            />
          </Animatable.View>
          <Text style={[styles.emptyText, { color: theme.text }]}>
            {selectedTrip 
              ? `No ${checklistType === CHECKLIST_TYPES.PACKING ? 'packing items' : 'to-do tasks'} for ${selectedTrip.destination} yet` 
              : `No ${checklistType === CHECKLIST_TYPES.PACKING ? 'packing items' : 'to-do tasks'} yet`}
          </Text>
          {selectedTrip && (
            <Button
              title={`Add ${checklistType === CHECKLIST_TYPES.PACKING ? 'Packing Item' : 'To-Do Task'}`}
              onPress={openAddItemModal}
              style={styles.emptyButton}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={getFilteredChecklist()}
          keyExtractor={(item) => item.id}
          renderItem={renderChecklistItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {selectedTrip && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={openAddItemModal}
        >
          <Icon name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {renderTripSelectModal()}
      {renderAddItemModal()}
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
    marginBottom: 10,
  },
  tripSelectorText: {
    color: '#fff',
    marginRight: 5,
    fontSize: 14,
  },
  progressContainer: {
    width: '100%',
  },
  progressBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#4ECDC4',
  },
  progressText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  typeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  activeTypeButton: {
    borderColor: 'transparent',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  typeIcon: {
    marginRight: 8,
  },
  typeText: {
    fontWeight: '500',
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
  checklistItem: {
    marginBottom: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    marginRight: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 16,
    flex: 1,
  },
  deleteButton: {
    padding: 5,
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
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
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
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 0.48,
  },
  fullButton: {
    marginTop: 10,
  },
  tripSelectList: {
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

export default ChecklistScreen; 