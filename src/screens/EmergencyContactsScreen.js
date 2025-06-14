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
  Linking,
  ScrollView,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

import { useTheme } from '../context/ThemeContext';
import StorageService from '../services/storageService';
import Card from '../components/Card';
import Button from '../components/Button';

// Static emergency contacts by country
const COUNTRY_EMERGENCY_NUMBERS = [
  {
    country: 'United States',
    flag: '🇺🇸',
    numbers: [
      { service: 'Emergency (Police, Fire, Medical)', number: '911' },
      { service: 'Poison Control', number: '1-800-222-1222' },
    ]
  },
  {
    country: 'United Kingdom',
    flag: '🇬🇧',
    numbers: [
      { service: 'Emergency (Police, Fire, Medical)', number: '999' },
      { service: 'Non-Emergency Police', number: '101' },
      { service: 'NHS Direct (Medical)', number: '111' },
    ]
  },
  {
    country: 'Australia',
    flag: '🇦🇺',
    numbers: [
      { service: 'Emergency (Police, Fire, Medical)', number: '000' },
      { service: 'Police (Non-Emergency)', number: '131 444' },
    ]
  },
  {
    country: 'Japan',
    flag: '🇯🇵',
    numbers: [
      { service: 'Police', number: '110' },
      { service: 'Fire & Ambulance', number: '119' },
    ]
  },
  {
    country: 'France',
    flag: '🇫🇷',
    numbers: [
      { service: 'European Emergency', number: '112' },
      { service: 'Police', number: '17' },
      { service: 'Ambulance', number: '15' },
      { service: 'Fire', number: '18' },
    ]
  },
  {
    country: 'Germany',
    flag: '🇩🇪',
    numbers: [
      { service: 'European Emergency', number: '112' },
      { service: 'Police', number: '110' },
    ]
  },
  {
    country: 'Italy',
    flag: '🇮🇹',
    numbers: [
      { service: 'European Emergency', number: '112' },
      { service: 'Police', number: '113' },
      { service: 'Ambulance', number: '118' },
      { service: 'Fire', number: '115' },
    ]
  },
  {
    country: 'Spain',
    flag: '🇪🇸',
    numbers: [
      { service: 'European Emergency', number: '112' },
      { service: 'Police', number: '091' },
    ]
  },
  {
    country: 'China',
    flag: '🇨🇳',
    numbers: [
      { service: 'Police', number: '110' },
      { service: 'Ambulance', number: '120' },
      { service: 'Fire', number: '119' },
    ]
  },
  {
    country: 'Thailand',
    flag: '🇹🇭',
    numbers: [
      { service: 'Tourist Police', number: '1155' },
      { service: 'Emergency Medical', number: '1669' },
      { service: 'Police', number: '191' },
    ]
  },
  {
    country: 'India',
    flag: '🇮🇳',
    numbers: [
      { service: 'National Emergency', number: '112' },
      { service: 'Police', number: '100' },
      { service: 'Ambulance', number: '108' },
      { service: 'Fire', number: '101' },
    ]
  },
  {
    country: 'Brazil',
    flag: '🇧🇷',
    numbers: [
      { service: 'Police', number: '190' },
      { service: 'Ambulance', number: '192' },
      { service: 'Fire', number: '193' },
    ]
  },
];

const EmergencyContactsScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const [customContacts, setCustomContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [newContact, setNewContact] = useState({
    name: '',
    number: '',
    relationship: '',
  });
  const [editingContactId, setEditingContactId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [isCustomContactsVisible, setIsCustomContactsVisible] = useState(true);
  const [isCountryContactsVisible, setIsCountryContactsVisible] = useState(true);

  // Load custom contacts from storage
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const storedContacts = await StorageService.getData('journeyscopes_emergency_contacts') || [];
        setCustomContacts(storedContacts);
      } catch (error) {
        console.error('Error loading emergency contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, []);

  // Filter countries based on search query
  const getFilteredCountries = () => {
    if (!countryFilter) return COUNTRY_EMERGENCY_NUMBERS;
    
    return COUNTRY_EMERGENCY_NUMBERS.filter(country => 
      country.country.toLowerCase().includes(countryFilter.toLowerCase())
    );
  };

  // Filter custom contacts based on search query
  const getFilteredCustomContacts = () => {
    if (!searchQuery) return customContacts;
    
    return customContacts.filter(contact => 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.number.includes(searchQuery) ||
      contact.relationship?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Reset form and close modal
  const closeModal = () => {
    setNewContact({ name: '', number: '', relationship: '' });
    setEditingContactId(null);
    setModalVisible(false);
  };

  // Open modal for adding a new contact
  const openAddContactModal = () => {
    setEditingContactId(null);
    setModalVisible(true);
  };

  // Open modal for editing an existing contact
  const openEditContactModal = (contact) => {
    setNewContact({
      name: contact.name,
      number: contact.number,
      relationship: contact.relationship || '',
    });
    setEditingContactId(contact.id);
    setModalVisible(true);
  };

  // Save contacts to AsyncStorage
  const saveContactsToStorage = async (contacts) => {
    try {
      await StorageService.storeData('journeyscopes_emergency_contacts', contacts);
      return true;
    } catch (error) {
      console.error('Error saving emergency contacts:', error);
      return false;
    }
  };

  // Save a new contact or update an existing one
  const saveContact = async () => {
    if (!newContact.name.trim() || !newContact.number.trim()) {
      Alert.alert('Error', 'Please enter both name and phone number');
      return;
    }

    try {
      let updatedContacts;
      
      if (editingContactId) {
        // Update existing contact
        updatedContacts = customContacts.map(contact => 
          contact.id === editingContactId 
            ? { ...contact, ...newContact, updatedAt: new Date().toISOString() }
            : contact
        );
      } else {
        // Add new contact
        const newCustomContact = {
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          ...newContact,
        };
        updatedContacts = [...customContacts, newCustomContact];
      }
      
      const success = await saveContactsToStorage(updatedContacts);
      if (success) {
        setCustomContacts(updatedContacts);
        closeModal();
      } else {
        throw new Error('Failed to save contact');
      }
    } catch (error) {
      console.error('Error saving emergency contact:', error);
      Alert.alert('Error', 'Failed to save emergency contact');
    }
  };

  // Delete a contact
  const deleteContact = async (contactId) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const updatedContacts = customContacts.filter(contact => contact.id !== contactId);
              const success = await saveContactsToStorage(updatedContacts);
              
              if (success) {
                setCustomContacts(updatedContacts);
              } else {
                throw new Error('Failed to delete contact');
              }
            } catch (error) {
              console.error('Error deleting emergency contact:', error);
              Alert.alert('Error', 'Failed to delete emergency contact');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Place a phone call
  const callNumber = (number) => {
    const phoneNumber = `tel:${number.replace(/\s/g, '')}`;
    Linking.canOpenURL(phoneNumber)
      .then(supported => {
        if (supported) {
          return Linking.openURL(phoneNumber);
        } else {
          Alert.alert('Error', 'Phone calls not supported on this device');
        }
      })
      .catch(error => console.error('Error making phone call:', error));
  };

  // Render a country emergency numbers card
  const renderCountryCard = ({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={400}
      delay={index * 100}
    >
      <Card style={styles.countryCard}>
        <View style={styles.countryHeader}>
          <View style={styles.countryTitleContainer}>
            <Text style={styles.countryFlag}>{item.flag}</Text>
            <Text style={[styles.countryName, { color: theme.text }]}>
              {item.country}
            </Text>
          </View>
          {selectedCountry === item.country ? (
            <TouchableOpacity
              onPress={() => setSelectedCountry(null)}
              style={styles.collapseButton}
            >
              <Icon name="chevron-up" size={24} color={theme.text + '99'} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setSelectedCountry(item.country)}
              style={styles.expandButton}
            >
              <Icon name="chevron-down" size={24} color={theme.text + '99'} />
            </TouchableOpacity>
          )}
        </View>

        {selectedCountry === item.country && (
          <Animatable.View
            animation="fadeIn"
            duration={300}
            style={styles.emergencyNumbersContainer}
          >
            {item.numbers.map((numberItem, numberIndex) => (
              <Animatable.View
                key={numberIndex}
                animation="fadeInUp"
                duration={300}
                delay={numberIndex * 50}
                style={styles.emergencyNumberItem}
              >
                <View style={styles.emergencyNumberInfo}>
                  <Text style={[styles.emergencyService, { color: theme.text }]}>
                    {numberItem.service}
                  </Text>
                  <Text style={[styles.emergencyNumber, { color: theme.primary }]}>
                    {numberItem.number}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.callButton, { backgroundColor: theme.primary }]}
                  onPress={() => callNumber(numberItem.number)}
                >
                  <Icon name="phone" size={18} color="#fff" />
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </Animatable.View>
        )}
      </Card>
    </Animatable.View>
  );

  // Render a custom contact card
  const renderCustomContactCard = ({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={400}
      delay={index * 100}
    >
      <Card style={styles.contactCard}>
        <View style={styles.contactInfo}>
          <View style={[styles.contactAvatar, { backgroundColor: theme.primary + '20' }]}>
            <Text style={styles.contactInitial}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.contactDetails}>
            <Text style={[styles.contactName, { color: theme.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.contactNumber, { color: theme.primary }]}>
              {item.number}
            </Text>
            {item.relationship && (
              <Text style={[styles.contactRelationship, { color: theme.text + '99' }]}>
                {item.relationship}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.contactActions}>
          <TouchableOpacity 
            style={[styles.contactActionButton, { backgroundColor: theme.primary + '20' }]}
            onPress={() => callNumber(item.number)}
          >
            <Icon name="phone" size={18} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.contactActionButton, { backgroundColor: theme.border + '30' }]}
            onPress={() => openEditContactModal(item)}
          >
            <Icon name="pencil" size={18} color={theme.text + '99'} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.contactActionButton, { backgroundColor: theme.accent + '20' }]}
            onPress={() => deleteContact(item.id)}
          >
            <Icon name="delete" size={18} color={theme.accent} />
          </TouchableOpacity>
        </View>
      </Card>
    </Animatable.View>
  );

  // Render add/edit contact modal
  const renderContactModal = () => (
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
            {editingContactId ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Name</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.border, color: theme.text, backgroundColor: theme.background },
              ]}
              placeholder="Contact Name"
              placeholderTextColor={theme.text + '80'}
              value={newContact.name}
              onChangeText={(text) => setNewContact({ ...newContact, name: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Phone Number</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.border, color: theme.text, backgroundColor: theme.background },
              ]}
              placeholder="Phone Number"
              placeholderTextColor={theme.text + '80'}
              value={newContact.number}
              onChangeText={(text) => setNewContact({ ...newContact, number: text })}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Relationship (Optional)</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.border, color: theme.text, backgroundColor: theme.background },
              ]}
              placeholder="e.g., Family, Friend, Hotel, etc."
              placeholderTextColor={theme.text + '80'}
              value={newContact.relationship}
              onChangeText={(text) => setNewContact({ ...newContact, relationship: text })}
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
              title={editingContactId ? 'Update' : 'Save Contact'}
              onPress={saveContact}
              style={styles.modalButton}
            />
          </View>
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
            <Text style={styles.headerTitle}>Emergency Contacts</Text>
            <Text style={styles.headerSubtitle}>Important numbers for your safety</Text>
          </View>
        </LinearGradient>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Custom Contacts Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => setIsCustomContactsVisible(!isCustomContactsVisible)}
          >
            <View style={styles.sectionTitleContainer}>
              <Icon name="account-multiple" size={22} color={theme.primary} style={styles.sectionIcon} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                My Emergency Contacts
              </Text>
            </View>
            <Icon 
              name={isCustomContactsVisible ? "chevron-up" : "chevron-down"} 
              size={22} 
              color={theme.text + '99'} 
            />
          </TouchableOpacity>

          {isCustomContactsVisible && (
            <>
              <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: theme.cardBackground }]}>
                  <Icon name="magnify" size={20} color={theme.text + '99'} style={styles.searchIcon} />
                  <TextInput
                    style={[styles.searchInput, { color: theme.text }]}
                    placeholder="Search contacts..."
                    placeholderTextColor={theme.text + '80'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      style={styles.clearSearch}
                      onPress={() => setSearchQuery('')}
                    >
                      <Icon name="close" size={18} color={theme.text + '99'} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={[styles.loadingText, { color: theme.text }]}>
                    Loading contacts...
                  </Text>
                </View>
              ) : getFilteredCustomContacts().length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: theme.text + '99' }]}>
                    {searchQuery
                      ? 'No contacts matching your search'
                      : 'No personal emergency contacts yet'}
                  </Text>
                  {!searchQuery && (
                    <Button
                      title="Add Contact"
                      onPress={openAddContactModal}
                      style={styles.emptyButton}
                    />
                  )}
                </View>
              ) : (
                <FlatList
                  data={getFilteredCustomContacts()}
                  keyExtractor={(item) => item.id}
                  renderItem={renderCustomContactCard}
                  scrollEnabled={false}
                />
              )}

              {!searchQuery && (
                <Button
                  title="Add New Contact"
                  onPress={openAddContactModal}
                  style={styles.addButton}
                  icon="plus"
                />
              )}
            </>
          )}
        </View>

        {/* Country Emergency Numbers Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => setIsCountryContactsVisible(!isCountryContactsVisible)}
          >
            <View style={styles.sectionTitleContainer}>
              <Icon name="earth" size={22} color={theme.primary} style={styles.sectionIcon} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Country Emergency Numbers
              </Text>
            </View>
            <Icon 
              name={isCountryContactsVisible ? "chevron-up" : "chevron-down"} 
              size={22} 
              color={theme.text + '99'} 
            />
          </TouchableOpacity>

          {isCountryContactsVisible && (
            <>
              <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: theme.cardBackground }]}>
                  <Icon name="magnify" size={20} color={theme.text + '99'} style={styles.searchIcon} />
                  <TextInput
                    style={[styles.searchInput, { color: theme.text }]}
                    placeholder="Search country..."
                    placeholderTextColor={theme.text + '80'}
                    value={countryFilter}
                    onChangeText={setCountryFilter}
                  />
                  {countryFilter.length > 0 && (
                    <TouchableOpacity
                      style={styles.clearSearch}
                      onPress={() => setCountryFilter('')}
                    >
                      <Icon name="close" size={18} color={theme.text + '99'} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <FlatList
                data={getFilteredCountries()}
                keyExtractor={(item) => item.country}
                renderItem={renderCountryCard}
                scrollEnabled={false}
              />
            </>
          )}
        </View>
      </ScrollView>

      {renderContactModal()}
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  clearSearch: {
    padding: 6,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    minWidth: 150,
  },
  addButton: {
    marginTop: 10,
  },
  contactCard: {
    marginBottom: 10,
    padding: 15,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactNumber: {
    fontSize: 15,
    marginBottom: 2,
  },
  contactRelationship: {
    fontSize: 13,
  },
  contactActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  contactActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  countryCard: {
    marginBottom: 10,
    padding: 15,
  },
  countryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  expandButton: {
    padding: 5,
  },
  collapseButton: {
    padding: 5,
  },
  emergencyNumbersContainer: {
    marginTop: 15,
  },
  emergencyNumberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  emergencyNumberInfo: {
    flex: 1,
  },
  emergencyService: {
    fontSize: 14,
    marginBottom: 4,
  },
  emergencyNumber: {
    fontSize: 16,
    fontWeight: '500',
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default EmergencyContactsScreen; 