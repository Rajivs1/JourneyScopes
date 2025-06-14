import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import * as Keychain from 'react-native-keychain';

// Initialize biometrics
const rnBiometrics = new ReactNativeBiometrics();

// Service for handling biometric authentication
const BiometricService = {
  // Check if device supports biometrics
  isSensorAvailable: async () => {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      return { 
        available, 
        biometryType,
        // Return friendly type name for UI
        biometryTypeString: biometryType === BiometryTypes.FaceID 
          ? 'Face ID' 
          : biometryType === BiometryTypes.TouchID 
            ? 'Touch ID' 
            : biometryType === BiometryTypes.Biometrics 
              ? 'Biometrics'
              : 'None'
      };
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return { available: false, biometryType: null, biometryTypeString: 'None' };
    }
  },

  // Authenticate using biometrics
  authenticate: async (promptMessage = 'Authenticate to continue') => {
    try {
      const { available } = await BiometricService.isSensorAvailable();
      
      if (!available) {
        return { success: false, error: 'Biometrics not available' };
      }
      
      const { success, error } = await rnBiometrics.simplePrompt({ 
        promptMessage,
        cancelButtonText: 'Cancel' 
      });
      
      return { success, error };
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return { success: false, error: error.message || 'Authentication failed' };
    }
  },
  
  // Secure data with keychain
  saveSecureValue: async (key, value) => {
    try {
      await Keychain.setInternetCredentials(
        key,
        key, // username = key for simplicity
        value,
        { accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY }
      );
      return true;
    } catch (error) {
      console.error('Error saving secure value:', error);
      return false;
    }
  },
  
  // Retrieve secured data with keychain
  getSecureValue: async (key) => {
    try {
      const credentials = await Keychain.getInternetCredentials(key);
      if (credentials) {
        return { success: true, value: credentials.password };
      }
      return { success: false, error: 'No value found' };
    } catch (error) {
      console.error('Error retrieving secure value:', error);
      return { success: false, error: error.message || 'Failed to retrieve value' };
    }
  },
  
  // Save and verify PIN code
  savePIN: async (pin) => {
    return await BiometricService.saveSecureValue('user_pin', pin);
  },
  
  verifyPIN: async (inputPin) => {
    const result = await BiometricService.getSecureValue('user_pin');
    if (result.success) {
      return result.value === inputPin;
    }
    return false;
  },
};

export default BiometricService; 