import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const AuthScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);

  const formRef = useRef(null);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  // Reset animation when switching between login and signup
  useEffect(() => {
    if (formRef.current) {
      formRef.current.fadeIn(800);
    }
  }, [isLogin]);

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    
    // Clear error when typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!isLogin && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        // Handle login
        const result = await login(formData.email, formData.password);
        if (!result.success) {
          Alert.alert('Login Failed', result.error);
        }
      } else {
        // Handle signup
        if (formData.password !== formData.confirmPassword) {
          Alert.alert('Error', 'Passwords do not match');
          return;
        }
        
        const result = await signup(
          formData.name,
          formData.email,
          formData.password
        );
        
        if (!result.success) {
          Alert.alert('Registration Failed', result.error);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setErrors({});
    setIsLogin(!isLogin);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <ImageBackground
        source={require('../assets/images/login.png')}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <LinearGradient
          colors={isDarkMode ? 
            ['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)'] : 
            ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
          style={styles.overlay}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.formContainer}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.headerContainer}>
                <Animatable.Text
                  animation="fadeInDown"
                  duration={1000}
                  style={[styles.headerText, { color: theme.primary }]}
                >
                  Journey Scopes
                </Animatable.Text>
                <Animatable.Text
                  animation="fadeIn"
                  delay={500}
                  duration={1000}
                  style={[styles.subheaderText, { color: theme.text }]}
                >
                  {isLogin ? 'Welcome back!' : 'Create your account'}
                </Animatable.Text>
              </View>

              <Animatable.View
                ref={formRef}
                animation="fadeInUp"
                duration={1000}
                delay={300}
                style={[styles.formCard, { backgroundColor: theme.cardBackground }]}
              >
                {!isLogin && (
                  <View style={styles.inputContainer}>
                    <Icon name="account" size={20} color={theme.primary} style={styles.inputIcon} />
                    <TextInput
                      ref={nameRef}
                      placeholder="Full Name"
                      placeholderTextColor={theme.text + '80'}
                      style={[styles.input, { color: theme.text }]}
                      value={formData.name}
                      onChangeText={(text) => handleChange('name', text)}
                      returnKeyType="next"
                      onSubmitEditing={() => emailRef.current.focus()}
                    />
                    {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <Icon name="email" size={20} color={theme.primary} style={styles.inputIcon} />
                  <TextInput
                    ref={emailRef}
                    placeholder="Email"
                    placeholderTextColor={theme.text + '80'}
                    style={[styles.input, { color: theme.text }]}
                    value={formData.email}
                    onChangeText={(text) => handleChange('email', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current.focus()}
                  />
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>

                <View style={styles.inputContainer}>
                  <Icon name="lock" size={20} color={theme.primary} style={styles.inputIcon} />
                  <TextInput
                    ref={passwordRef}
                    placeholder="Password"
                    placeholderTextColor={theme.text + '80'}
                    style={[styles.input, { color: theme.text }]}
                    value={formData.password}
                    onChangeText={(text) => handleChange('password', text)}
                    secureTextEntry={securePassword}
                    returnKeyType={isLogin ? 'done' : 'next'}
                    onSubmitEditing={() => 
                      isLogin ? handleSubmit() : confirmPasswordRef.current.focus()
                    }
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setSecurePassword(!securePassword)}
                  >
                    <Icon
                      name={securePassword ? 'eye' : 'eye-off'}
                      size={20}
                      color={theme.text + '80'}
                    />
                  </TouchableOpacity>
                  {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>

                {!isLogin && (
                  <View style={styles.inputContainer}>
                    <Icon name="lock-check" size={20} color={theme.primary} style={styles.inputIcon} />
                    <TextInput
                      ref={confirmPasswordRef}
                      placeholder="Confirm Password"
                      placeholderTextColor={theme.text + '80'}
                      style={[styles.input, { color: theme.text }]}
                      value={formData.confirmPassword}
                      onChangeText={(text) => handleChange('confirmPassword', text)}
                      secureTextEntry={secureConfirmPassword}
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setSecureConfirmPassword(!secureConfirmPassword)}
                    >
                      <Icon
                        name={secureConfirmPassword ? 'eye' : 'eye-off'}
                        size={20}
                        color={theme.text + '80'}
                      />
                    </TouchableOpacity>
                    {errors.confirmPassword && (
                      <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                    )}
                  </View>
                )}

                <TouchableOpacity
                  disabled={isLoading}
                  onPress={handleSubmit}
                  style={styles.buttonContainer}
                >
                  <LinearGradient
                    colors={[theme.primary, theme.primary + 'CC']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.button}
                  >
                    {isLoading ? (
                      <Text style={styles.buttonText}>Please wait...</Text>
                    ) : (
                      <Text style={styles.buttonText}>
                        {isLogin ? 'SIGN IN' : 'SIGN UP'}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.footer}>
                  <Text style={[styles.footerText, { color: theme.text + 'CC' }]}>
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                  </Text>
                  <TouchableOpacity onPress={toggleMode}>
                    <Text style={[styles.footerLink, { color: theme.primary }]}>
                      {isLogin ? 'Sign Up' : 'Sign In'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animatable.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  backgroundImageStyle: {
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subheaderText: {
    fontSize: 16,
    opacity: 0.8,
  },
  formCard: {
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 18,
    position: 'relative',
  },
  input: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    top: 15,
    zIndex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 1,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 10,
  },
  buttonContainer: {
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  button: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default AuthScreen; 