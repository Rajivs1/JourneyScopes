import React, { createContext, useState, useContext, useEffect } from 'react';
import { Appearance } from 'react-native';

// Define light and dark theme colors
export const lightTheme = {
  mode: 'light',
  background: '#FFFFFF',
  text: '#000000',
  primary: '#3498db',
  secondary: '#2ecc71',
  accent: '#e74c3c',
  cardBackground: '#F8F8F8',
  cardShadow: '#DDDDDD',
  border: '#E0E0E0',
  statusBar: 'dark-content',
  tabBar: '#FFFFFF',
  tabBarInactive: '#95a5a6',
  tabBarActive: '#3498db',
};

export const darkTheme = {
  mode: 'dark',
  background: '#121212',
  text: '#FFFFFF',
  primary: '#3498db',
  secondary: '#2ecc71',
  accent: '#e74c3c',
  cardBackground: '#1E1E1E',
  cardShadow: '#000000',
  border: '#333333',
  statusBar: 'light-content',
  tabBar: '#1E1E1E',
  tabBarInactive: '#95a5a6',
  tabBarActive: '#3498db',
};

// Create context
const ThemeContext = createContext();

// Provider component
export const ThemeProvider = ({ children }) => {
  // Get device color scheme
  const deviceColorScheme = Appearance.getColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(deviceColorScheme === 'dark');
  
  // Set the theme based on device changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDarkMode(colorScheme === 'dark');
    });
    
    return () => subscription.remove();
  }, []);
  
  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };
  
  // Current theme
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
