import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.log('Error checking login status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      // Get users from storage
      const users = await AsyncStorage.getItem('users');
      const parsedUsers = users ? JSON.parse(users) : [];
      
      // Find user with matching credentials
      const foundUser = parsedUsers.find(
        (u) => u.email === email && u.password === password
      );
      
      if (foundUser) {
        // Store logged in user
        const userInfo = { email: foundUser.email, name: foundUser.name };
        await AsyncStorage.setItem('user', JSON.stringify(userInfo));
        setUser(userInfo);
        setIsAuthenticated(true);
        return { success: true };
      }
      
      return { 
        success: false, 
        error: 'Invalid email or password' 
      };
    } catch (error) {
      console.log('Login error:', error);
      return { 
        success: false, 
        error: 'Something went wrong' 
      };
    }
  };

  // Signup function
  const signup = async (name, email, password) => {
    try {
      // Get existing users or create empty array
      const users = await AsyncStorage.getItem('users');
      const parsedUsers = users ? JSON.parse(users) : [];
      
      // Check if email already exists
      const userExists = parsedUsers.some((user) => user.email === email);
      
      if (userExists) {
        return { 
          success: false, 
          error: 'Email already in use' 
        };
      }
      
      // Add new user
      const newUser = { name, email, password };
      const updatedUsers = [...parsedUsers, newUser];
      
      // Save updated users list
      await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Log user in after signup
      const userInfo = { email, name };
      await AsyncStorage.setItem('user', JSON.stringify(userInfo));
      setUser(userInfo);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.log('Signup error:', error);
      return { 
        success: false, 
        error: 'Something went wrong' 
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading,
      user, 
      login, 
      signup, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
