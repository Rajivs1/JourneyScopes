import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Alert, Dimensions, TouchableOpacity, Image } from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

import { useTheme } from '../context/ThemeContext';
import BiometricService from '../services/BiometricService';
import Button from '../components/Button';
import Card from '../components/Card';

const { width } = Dimensions.get('window');

const VaultScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const [authenticated, setAuthenticated] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [biometryType, setBiometryType] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Animation refs
  const headerRef = useRef(null);
  const lockRef = useRef(null);

  // Sample document types for UI demonstration
  const documentTypes = [
    { id: '1', name: 'Passport', icon: 'passport', color: '#4361EE' },
    { id: '2', name: 'ID Card', icon: 'card-account-details', color: '#3A0CA3' },
    { id: '3', name: 'Visa', icon: 'file-document-outline', color: '#7209B7' },
    { id: '4', name: 'Insurance', icon: 'shield-check', color: '#F72585' },
    { id: '5', name: 'Travel Tickets', icon: 'ticket', color: '#4CC9F0' },
    { id: '6', name: 'Hotel Reservations', icon: 'bed', color: '#4895EF' },
    { id: '7', name: 'Vaccination Records', icon: 'needle', color: '#560BAD' },
  ];

  // Check if biometrics are available
  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        const { available, biometryType: type } = await BiometricService.isSensorAvailable();
        setBiometryType(type);
        
        if (available) {
          // Try to authenticate with biometrics
          authenticateWithBiometrics();
        } else {
          // Fall back to PIN
          setShowPinModal(true);
        }
      } catch (error) {
        console.error('Error checking biometrics:', error);
        setShowPinModal(true);
      } finally {
        setLoading(false);
      }
    };

    checkBiometrics();
  }, []);

  // Trigger animations when authentication is successful
  useEffect(() => {
    if (authenticated && headerRef.current) {
      headerRef.current.slideInDown(800);
    }
  }, [authenticated]);

  // Authenticate with biometrics
  const authenticateWithBiometrics = async () => {
    try {
      const { success, error } = await BiometricService.authenticate('Authenticate to access your documents');
      
      if (success) {
        setAuthenticated(true);
      } else if (error) {
        console.log('Biometric authentication failed:', error);
        setShowPinModal(true);
      }
    } catch (error) {
      console.error('Error during biometric authentication:', error);
      setShowPinModal(true);
    }
  };

  // Authenticate with PIN
  const authenticateWithPIN = async () => {
    if (pin.length < 4) {
      Alert.alert('Invalid PIN', 'Please enter a valid PIN (at least 4 digits)');
      return;
    }
    
    // For demo purposes, hardcoded PIN. In a real app, use BiometricService.verifyPIN
    if (pin === '1234') {
      setAuthenticated(true);
      setShowPinModal(false);
    } else {
      Alert.alert('Invalid PIN', 'The PIN you entered is incorrect');
    }
  };

  // Retry biometric authentication
  const retryBiometricAuth = () => {
    setShowPinModal(false);
    authenticateWithBiometrics();
  };

  // Loading state
  if (loading) {
    return (
      <LinearGradient
        colors={isDarkMode ? 
          [theme.background, '#1a1a2e'] : 
          [theme.background, '#f5f5f7']
        }
        style={styles.container}
      >
        <Animatable.View 
          animation="pulse" 
          iterationCount="infinite" 
          duration={1500}
          ref={lockRef}
        >
          <LinearGradient
            colors={[theme.primary, theme.primary + '80']}
            style={styles.loadingIconContainer}
          >
            <Icon name="lock" size={50} color="#FFFFFF" />
          </LinearGradient>
        </Animatable.View>
        <Animatable.Text 
          animation="fadeIn" 
          duration={1000}
          style={[styles.loadingText, { color: theme.text }]}
        >
          Preparing secure vault...
        </Animatable.Text>
      </LinearGradient>
    );
  }

  // PIN input modal
  const renderPinModal = () => (
    <Modal
      visible={showPinModal}
      transparent
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <Animatable.View 
          animation="zoomIn"
          duration={400}
          style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}
        >
          <Animatable.View
            animation="pulse"
            iterationCount="infinite"
            duration={2000}
          >
            <LinearGradient
              colors={[theme.primary, theme.primary + '80']}
              style={styles.lockIconContainer}
            >
              <Icon name="lock-outline" size={40} color="#FFFFFF" />
            </LinearGradient>
          </Animatable.View>
          
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Enter PIN
          </Text>
          
          <Text style={[styles.modalSubtitle, { color: theme.text + 'CC' }]}>
            Biometric authentication is not available or failed. Please enter your PIN.
          </Text>
          
          <TextInput
            style={[styles.pinInput, { 
              borderColor: theme.border,
              backgroundColor: theme.background + '80',
              color: theme.text
            }]}
            value={pin}
            onChangeText={setPin}
            keyboardType="numeric"
            secureTextEntry
            maxLength={6}
            placeholder="Enter PIN"
            placeholderTextColor={theme.text + '80'}
          />
          
          <View style={styles.buttonContainer}>
            {biometryType && (
              <Button
                title="Use Biometrics"
                onPress={retryBiometricAuth}
                variant="outline"
                style={styles.button}
              />
            )}
            
            <Button
              title="Authenticate"
              onPress={authenticateWithPIN}
              style={styles.button}
            />
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );

  // Authenticated vault content
  const renderVaultContent = () => (
    <>
      <Animatable.View 
        ref={headerRef}
        style={styles.header}
      >
        <LinearGradient
          colors={[theme.primary, theme.primary + 'CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Image
              source={require('../assets/icons/logoIcon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>Secure Vault</Text>
            <Image
              source={require('../assets/icons/vault.png')}
              style={styles.vaultIcon}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>
      </Animatable.View>

      <Animatable.View 
        animation="fadeIn"
        duration={800}
        style={styles.contentContainer}
      >
        <View style={styles.documentsGrid}>
          {documentTypes.map((doc, index) => (
            <Animatable.View
              key={doc.id}
              animation="fadeInUp"
              delay={index * 100 + 300}
              style={styles.documentCardContainer}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => Alert.alert('Feature Coming Soon', 'Document management will be available soon!')}
              >
                <LinearGradient
                  colors={[doc.color, doc.color + '80']}
                  style={styles.documentCard}
                >
                  <View style={styles.documentContent}>
                    <Icon 
                      name={doc.icon} 
                      size={36} 
                      color="#FFFFFF"
                      style={styles.documentIcon}
                    />
                    <Text style={styles.documentName}>
                      {doc.name}
                    </Text>
                    <View style={styles.documentCountBadge}>
                      <Text style={styles.documentCount}>0</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>
      </Animatable.View>
    </>
  );

  return (
    <LinearGradient
      colors={isDarkMode ? 
        [theme.background, '#1a1a2e'] : 
        [theme.background, '#f5f5f7']
      }
      style={styles.container}
    >
      {authenticated ? renderVaultContent() : (
        <Animatable.View
          animation="fadeIn"
          duration={1000}
          style={styles.authenticateContainer}
        >
          <Animatable.View
            animation="pulse"
            iterationCount="infinite"
            duration={2000}
          >
            <LinearGradient
              colors={[theme.primary, theme.primary + '80']}
              style={styles.lockIconLarge}
            >
              <Icon name="lock-outline" size={60} color="#FFFFFF" />
            </LinearGradient>
          </Animatable.View>
          
          <Text style={[styles.authenticateTitle, { color: theme.text }]}>
            Authentication Required
          </Text>
          
          <Text style={[styles.authenticateSubtitle, { color: theme.text + 'CC' }]}>
            Please authenticate to access your secure documents
          </Text>
          
          <Button
            title={biometryType ? "Use Biometrics" : "Enter PIN"}
            onPress={biometryType ? authenticateWithBiometrics : () => setShowPinModal(true)}
            style={styles.authButton}
          />
        </Animatable.View>
      )}
      
      {renderPinModal()}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 16,
  },
  headerContent: {
    paddingTop: 5,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
  },
  loadingIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  loadingText: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: '500',
  },
  authenticateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lockIconLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  authenticateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 30,
    textAlign: 'center',
  },
  authenticateSubtitle: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  authButton: {
    minWidth: 200,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: width * 0.9,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  lockIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  pinInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 0.48,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  documentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  documentCardContainer: {
    width: '48%',
    marginBottom: 16,
  },
  documentCard: {
    borderRadius: 12,
    padding: 15,
    height: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  documentContent: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  documentIcon: {
    marginBottom: 10,
  },
  documentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  documentCountBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  logoImage: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  vaultIcon: {
    width: 30,
    height: 30,
    marginLeft: 10,
  },
});

export default VaultScreen;
