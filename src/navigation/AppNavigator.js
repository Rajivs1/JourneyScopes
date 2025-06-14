import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';

// Import all screens
import HomeScreen from '../screens/HomeScreen';
import TripsScreen from '../screens/TripsScreen';
import ChecklistScreen from '../screens/ChecklistScreen';
import BudgetScreen from '../screens/BudgetScreen';
import VaultScreen from '../screens/VaultScreen';
import ChartsScreen from '../screens/ChartsScreen';
import PDFExportScreen from '../screens/PDFExportScreen';
import LanguageScreen from '../screens/LanguageScreen';
import SplashScreen from '../screens/SplashScreen';
import JournalScreen from '../screens/JournalScreen';
import EmergencyContactsScreen from '../screens/EmergencyContactsScreen';
import AuthScreen from '../screens/AuthScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const MoreStack = createNativeStackNavigator();

// More stack navigator
const MoreStackNavigator = () => {
  return (
    <MoreStack.Navigator screenOptions={{ headerShown: false }}>
      <MoreStack.Screen name="More Options" component={MoreScreen} />
      <MoreStack.Screen name="Vault" component={VaultScreen} />
      <MoreStack.Screen name="Charts" component={ChartsScreen} />
      <MoreStack.Screen name="PDF Export" component={PDFExportScreen} />
      <MoreStack.Screen name="Language" component={LanguageScreen} />
      <MoreStack.Screen name="Journal" component={JournalScreen} />
      <MoreStack.Screen name="Emergency Contacts" component={EmergencyContactsScreen} />
    </MoreStack.Navigator>
  );
};

// Screen that contains additional tabs
const MoreScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation();
  
  const moreItems = [
    { 
      name: 'Vault', 
      icon: require('../assets/icons/vault.png'),
    },
    { 
      name: 'Journal', 
      icon: require('../assets/icons/notebook.png'),
    },
    { 
      name: 'Charts', 
      icon: require('../assets/icons/charts.png'),
    },
    { 
      name: 'Emergency Contacts', 
      iconName: 'medical-bag',
    },
    { 
      name: 'PDF Export', 
      icon: require('../assets/icons/pdf.png'),
    },
    { 
      name: 'Language', 
      icon: require('../assets/icons/languages.png'),
    },
  ];

  return (
    <LinearGradient
      colors={isDarkMode ? 
        [theme.background, '#1a1a2e'] : 
        [theme.background, '#f5f5f7']
      }
      style={styles.moreContainer}
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
            <Text style={styles.headerTitle}>More Options</Text>
          </View>
        </LinearGradient>
      </View>
      
      <View style={styles.moreList}>
        {moreItems.map((item, index) => (
          <Animatable.View
            key={item.name}
            animation="fadeInUp"
            duration={400}
            delay={index * 100}
          >
            <TouchableOpacity
              style={[styles.moreItem, { backgroundColor: theme.cardBackground }]}
              onPress={() => navigation.navigate(item.name)}
            >
              <LinearGradient
                colors={[theme.primary + '30', theme.primary + '10']}
                style={styles.iconContainer}
              >
                {item.icon ? (
                  <Image 
                    source={item.icon}
                    style={{
                      width: 24,
                      height: 24,
                    }}
                    resizeMode="contain"
                  />
                ) : (
                  <Icon 
                    name={item.iconName} 
                    size={24} 
                    color={theme.primary}
                  />
                )}
              </LinearGradient>
              <Text style={[styles.moreItemText, { color: theme.text }]}>
                {item.name}
              </Text>
              <Icon name="chevron-right" size={20} color={theme.text + '80'} />
            </TouchableOpacity>
          </Animatable.View>
        ))}
      </View>
    </LinearGradient>
  );
};

// Custom tab bar button
const TabBarButton = ({ accessibilityState, children, onPress }) => {
  const { theme } = useTheme();
  const focused = accessibilityState?.selected || false;
  
  return (
    <TouchableOpacity
      style={styles.tabBarButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animatable.View
        animation={focused ? 'pulse' : undefined}
        iterationCount={focused ? 'infinite' : 1}
        duration={1500}
      >
        <LinearGradient
          colors={focused ? 
            [theme.primary, theme.primary + 'CC'] : 
            [theme.background, theme.background]
          }
          style={[
            styles.tabBarButtonInner,
            { borderColor: focused ? theme.primary : theme.border }
          ]}
        >
          {children}
        </LinearGradient>
      </Animatable.View>
    </TouchableOpacity>
  );
};

const MainTabs = () => {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.text + '80',
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 5,
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarButton: (props) => <TabBarButton {...props} />,
        tabBarIcon: ({ focused, color, size }) => {
          let iconSource;

          switch (route.name) {
            case 'Home':
              iconSource = require('../assets/icons/home.png');
              break;
            case 'Trips':
              iconSource = require('../assets/icons/trips.png');
              break;
            case 'Checklist':
              iconSource = require('../assets/icons/list.png');
              break;
            case 'Budget':
              iconSource = require('../assets/icons/budget.png');
              break;
            case 'More':
              iconSource = require('../assets/icons/more.png');
              break;
            default:
              // Fallback to help icon
              return (
                <Animatable.View
                  animation={focused ? 'bounceIn' : 'fadeIn'}
                  duration={500}
                >
                  <Icon name="help-circle" size={size} color={color} />
                </Animatable.View>
              );
          }

          return (
            <Animatable.View
              animation={focused ? 'bounceIn' : 'fadeIn'}
              duration={500}
            >
              <Image
                source={iconSource}
                style={{
                  width: size,
                  height: size,
                  opacity: focused ? 1 : 0.8,
                }}
                resizeMode="contain"
              />
            </Animatable.View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Trips" component={TripsScreen} />
      <Tab.Screen name="Checklist" component={ChecklistScreen} />
      <Tab.Screen name="Budget" component={BudgetScreen} />
      <Tab.Screen name="More" component={MoreStackNavigator} />
    </Tab.Navigator>
  );
};

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Show splash screen while checking auth state
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarButton: {
    flex: 1,
    alignItems: 'center',
  },
  tabBarButtonInner: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
  moreContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 20,
  },
  headerGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    marginRight: 15,
  },
  logoImage: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  moreList: {
    marginTop: 10,
  },
  moreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  moreItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AppNavigator;
