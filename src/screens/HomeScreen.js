import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  ScrollView, 
  Image, 
  Dimensions,
  TouchableOpacity 
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

import { useTheme } from '../context/ThemeContext';
import Card from '../components/Card';
import Button from '../components/Button';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  
  // Refs for animation sequencing
  const imageRef = useRef(null);
  const titleRef = useRef(null);
  
  // Trigger animations when component mounts
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (imageRef.current) {
        imageRef.current.pulse(1500);
      }
    }, 1000);
    
    return () => clearTimeout(timeout);
  }, []);

  const features = [
    { 
      icon: 'airplane', 
      title: 'Trip Planning', 
      description: 'Record and organize your trips',
      screen: 'Trips',
      color: '#4a6da7'
    },
    { 
      icon: 'checkbox-marked-outline', 
      title: 'Checklist', 
      description: 'Manage your travel items',
      screen: 'Checklist',
      color: '#5fb49c'
    },
    { 
      icon: 'wallet-outline', 
      title: 'Budget Management', 
      description: 'Track your expenses',
      screen: 'Budget',
      color: '#9a7197'
    },
    { 
      icon: 'shield-lock-outline', 
      title: 'Secure Vault', 
      description: 'Store important documents',
      screen: 'Vault',
      color: '#f2a154'
    },
    { 
      icon: 'chart-bar', 
      title: 'Analytics', 
      description: 'Visualize your travel data',
      screen: 'Charts',
      color: '#e84a5f'
    },
    { 
      icon: 'file-pdf-box', 
      title: 'Export to PDF', 
      description: 'Download trip summaries',
      screen: 'PDF',
      color: '#355c7d'
    },
    { 
      icon: 'translate', 
      title: 'Language Helper', 
      description: 'Essential travel phrases',
      screen: 'Language',
      color: '#6c5b7b'
    },
  ];

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
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/icons/logoIcon.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>
                Welcome to
              </Text>
              <Animatable.Text 
                animation="fadeInLeft"
                duration={1200}
                style={styles.appName}
                ref={titleRef}
              >
                <Icon name="" size={22} color="#FFFFFF" style={{marginRight: 5}} />
                JourneyScopes
                <Icon name="" size={22} color="#FFFFFF" style={{marginLeft: 5}} />
              </Animatable.Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.themeToggle}>
          <View style={styles.themeIconContainer}>
            <Icon name="" size={22} color={isDarkMode ? theme.text + '80' : theme.primary} />
            <Text style={[styles.themeText, { color: isDarkMode ? theme.text + '80' : theme.primary }]}>Light</Text>
          </View>
          
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: theme.primary + '80' }}
            thumbColor={isDarkMode ? theme.primary : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            style={{ marginHorizontal: 10 }}
          />
          
          <View style={styles.themeIconContainer}>
            <Icon name="" size={22} color={isDarkMode ? theme.primary : theme.text + '80'} />
            <Text style={[styles.themeText, { color: isDarkMode ? theme.primary : theme.text + '80' }]}>Dark</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Animatable.View
          animation="fadeIn"
          duration={1000}
          delay={100}
          style={styles.heroImageContainer}
          ref={imageRef}
        >
          <Image
            source={require('../assets/images/HomeImg.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.heroOverlay}
          >
            <Animatable.Text 
              animation="fadeInUp" 
              duration={1000} 
              delay={300}
              style={styles.heroText}
            >
              Explore the world with ease
            </Animatable.Text>
          </LinearGradient>
        </Animatable.View>

        <Animatable.Text 
          animation="fadeInUp" 
          duration={1000} 
          delay={200}
          style={[styles.featuresTitle, { color: theme.text }]}
        >
          <Icon name="star" size={20} color={theme.primary} /> Features
        </Animatable.Text>

        <View style={styles.featureGrid}>
          {features.slice(0, 4).map((feature, index) => (
            <Animatable.View
              key={feature.title}
              animation="fadeInUp"
              duration={400}
              delay={300 + index * 100}
              style={styles.featureGridItem}
            >
              <TouchableOpacity
                onPress={() => navigation.navigate(feature.screen)}
                style={[styles.featureCard, { backgroundColor: theme.cardBackground }]}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[feature.color, feature.color + '90']}
                  style={styles.featureIconContainer}
                >
                  <Icon
                    name={feature.icon}
                    size={32}
                    color="#FFFFFF"
                  />
                </LinearGradient>
                <Text style={[styles.featureTitle, { color: theme.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: theme.text + 'CC' }]}>
                  {feature.description}
                </Text>
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>

        {features.slice(4).map((feature, index) => (
          <Card
            key={feature.title}
            animation="fadeInUp"
            duration={400}
            delay={700 + index * 100}
            onPress={() => navigation.navigate(feature.screen)}
          >
            <View style={styles.featureListItem}>
              <LinearGradient
                colors={[feature.color, feature.color + '80']}
                style={styles.featureIconBg}
              >
                <Icon
                  name={feature.icon}
                  size={28}
                  color="#FFFFFF"
                />
              </LinearGradient>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: theme.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: theme.text }]}>
                  {feature.description}
                </Text>
              </View>
              <Icon
                name="chevron-right"
                size={24}
                color={theme.text}
              />
            </View>
          </Card>
        ))}
        
        <Animatable.Text 
          animation="fadeInUp" 
          duration={1000} 
          delay={800}
          style={[styles.sectionTitle, { color: theme.text }]}
        >
          <Icon name="information-outline" size={20} color={theme.primary} /> About JourneyScopes
        </Animatable.Text>

        <Card 
          animation="fadeInUp"
          duration={1000}
          delay={900}
        >
          <View style={styles.infoCard}>
            <LinearGradient
              colors={['#4a6da7', '#4a6da7' + '80']}
              style={styles.infoIcon}
            >
              <Icon name="compass-outline" size={24} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: theme.text }]}>
                Your Complete Travel Companion
              </Text>
              <Text style={[styles.infoDescription, { color: theme.text + 'DD' }]}>
                JourneyScopes helps you plan, organize, and keep track of all your travel details in one place. From planning your itinerary to managing your budget, we've got you covered.
              </Text>
            </View>
          </View>
        </Card>

        <Card
          animation="fadeInUp"
          duration={1000}
          delay={1000}
        >
          <View style={styles.infoCard}>
            <LinearGradient
              colors={['#5fb49c', '#5fb49c' + '80']}
              style={styles.infoIcon}
            >
              <Icon name="shield-lock-outline" size={24} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: theme.text }]}>
                Secure & Offline Access
              </Text>
              <Text style={[styles.infoDescription, { color: theme.text + 'DD' }]}>
                Keep your travel documents secure in our vault. Access your trip information even without an internet connection, perfect for international travel.
              </Text>
            </View>
          </View>
        </Card>

        <Card
          animation="fadeInUp"
          duration={1000}
          delay={1100}
        >
          <View style={styles.infoCard}>
            <LinearGradient
              colors={['#9a7197', '#9a7197' + '80']}
              style={styles.infoIcon}
            >
              <Icon name="lightbulb-on-outline" size={24} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: theme.text }]}>
                Travel Smart with Insights
              </Text>
              <Text style={[styles.infoDescription, { color: theme.text + 'DD' }]}>
                Get visual analytics of your spending patterns, optimize your packing with smart checklists, and never miss important details with our reminder system.
              </Text>
            </View>
          </View>
        </Card>
        
        <View style={styles.footer} />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 10,
    paddingHorizontal: 20,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerGradient: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  logoContainer: {
    marginRight: 15,
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10,
    marginRight: 10,
  },
  themeIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  themeText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroImageContainer: {
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: 16,
  },
  heroText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  featureGridItem: {
    width: '48%',
    marginBottom: 16,
  },
  featureCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 150,
    justifyContent: 'center',
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureIconBg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  footer: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  infoIcon: {
    marginRight: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme => theme.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoContent: {
    flex: 1,
  },
});

export default HomeScreen;
