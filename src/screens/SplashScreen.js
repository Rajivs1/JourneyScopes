import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Dimensions, ImageBackground, StatusBar, Text } from 'react-native';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const logoRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const slideInRef = useRef(null);

  useEffect(() => {
    // Custom animations
    const customZoomIn = {
      0: {
        opacity: 0,
        scale: 0.5,
      },
      0.7: {
        opacity: 1,
        scale: 1.1,
      },
      1: {
        opacity: 1,
        scale: 1,
      },
    };
  
    // Sequence of animations
    const animateElements = async () => {
      if (logoRef.current) {
        await logoRef.current.animate(customZoomIn, 1000);
        logoRef.current.pulse(2000);
      }
      
      if (titleRef.current) {
        titleRef.current.fadeIn(800);
      }
      
      if (subtitleRef.current) {
        setTimeout(() => {
          subtitleRef.current.fadeIn(800);
        }, 500);
      }

      if (slideInRef.current) {
        setTimeout(() => {
          slideInRef.current.slideInUp(800);
        }, 1000);
      }
    };

    animateElements();

    // Navigate to main app after a delay
    const timer = setTimeout(() => {
      navigation.replace('Main');
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      
      <ImageBackground
        source={require('../assets/images/splashImage.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Animatable.View 
            ref={logoRef}
            style={styles.logoContainer}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
              style={styles.logoGradient}
            >
              <Image
                source={require('../assets/icons/logoIcon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </LinearGradient>
          </Animatable.View>
          
          <Animatable.Text
            ref={titleRef}
            style={styles.title}
            useNativeDriver
          >
            JourneyScopes
          </Animatable.Text>
          
          <Animatable.Text
            ref={subtitleRef}
            style={styles.subtitle}
            useNativeDriver
          >
            Your travel companion
          </Animatable.Text>

          <Animatable.View 
            ref={slideInRef}
            style={styles.taglineContainer}
            useNativeDriver
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.taglineGradient}
            >
              <Text style={styles.tagline}>Discover • Plan • Experience</Text>
            </LinearGradient>
          </Animatable.View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  logo: {
    width: '90%',
    height: '90%',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 22,
    color: '#FFFFFF',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 40,
  },
  taglineContainer: {
    position: 'absolute',
    bottom: 80,
    width: width * 0.8,
  },
  taglineGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
  },
  tagline: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default SplashScreen; 