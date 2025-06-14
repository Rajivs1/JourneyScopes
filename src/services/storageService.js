import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  TRIPS: 'journeyscopes_trips',
  CHECKLIST: 'journeyscopes_checklist',
  BUDGET: 'journeyscopes_budget',
  SETTINGS: 'journeyscopes_settings',
};

/**
 * Service to handle local storage operations
 */
const StorageService = {
  // Store data
  storeData: async (key, value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error('Error storing data:', error);
      return false;
    }
  },

  // Retrieve data
  getData: async (key) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  },

  // Remove data
  removeData: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing data:', error);
      return false;
    }
  },

  // Clear all data
  clearAll: async () => {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  },

  // Trip-specific operations
  trips: {
    getAll: async () => {
      return await StorageService.getData(STORAGE_KEYS.TRIPS) || [];
    },
    
    save: async (trips) => {
      return await StorageService.storeData(STORAGE_KEYS.TRIPS, trips);
    },
    
    addTrip: async (trip) => {
      const trips = await StorageService.trips.getAll();
      const newTrip = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...trip,
      };
      trips.push(newTrip);
      await StorageService.trips.save(trips);
      return newTrip;
    },
    
    updateTrip: async (tripId, updatedData) => {
      const trips = await StorageService.trips.getAll();
      const index = trips.findIndex(trip => trip.id === tripId);
      
      if (index !== -1) {
        trips[index] = { ...trips[index], ...updatedData, updatedAt: new Date().toISOString() };
        await StorageService.trips.save(trips);
        return trips[index];
      }
      return null;
    },
    
    deleteTrip: async (tripId) => {
      const trips = await StorageService.trips.getAll();
      const filteredTrips = trips.filter(trip => trip.id !== tripId);
      
      if (trips.length !== filteredTrips.length) {
        await StorageService.trips.save(filteredTrips);
        return true;
      }
      return false;
    },
  },
  
  // Checklist operations
  checklist: {
    getAll: async () => {
      return await StorageService.getData(STORAGE_KEYS.CHECKLIST) || [];
    },
    
    save: async (items) => {
      return await StorageService.storeData(STORAGE_KEYS.CHECKLIST, items);
    },
    
    addItem: async (item) => {
      const items = await StorageService.checklist.getAll();
      const newItem = {
        id: Date.now().toString(),
        completed: false,
        createdAt: new Date().toISOString(),
        ...item,
      };
      items.push(newItem);
      await StorageService.checklist.save(items);
      return newItem;
    },
    
    toggleItem: async (itemId) => {
      const items = await StorageService.checklist.getAll();
      const index = items.findIndex(item => item.id === itemId);
      
      if (index !== -1) {
        items[index].completed = !items[index].completed;
        await StorageService.checklist.save(items);
        return items[index];
      }
      return null;
    },
    
    deleteItem: async (itemId) => {
      const items = await StorageService.checklist.getAll();
      const filteredItems = items.filter(item => item.id !== itemId);
      
      if (items.length !== filteredItems.length) {
        await StorageService.checklist.save(filteredItems);
        return true;
      }
      return false;
    },
  },
  
  // Budget operations
  budget: {
    getAll: async () => {
      return await StorageService.getData(STORAGE_KEYS.BUDGET) || [];
    },
    
    save: async (expenses) => {
      return await StorageService.storeData(STORAGE_KEYS.BUDGET, expenses);
    },
    
    addExpense: async (expense) => {
      const expenses = await StorageService.budget.getAll();
      const newExpense = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        ...expense,
      };
      expenses.push(newExpense);
      await StorageService.budget.save(expenses);
      return newExpense;
    },
    
    updateExpense: async (expenseId, updatedData) => {
      const expenses = await StorageService.budget.getAll();
      const index = expenses.findIndex(expense => expense.id === expenseId);
      
      if (index !== -1) {
        expenses[index] = { ...expenses[index], ...updatedData };
        await StorageService.budget.save(expenses);
        return expenses[index];
      }
      return null;
    },
    
    deleteExpense: async (expenseId) => {
      const expenses = await StorageService.budget.getAll();
      const filteredExpenses = expenses.filter(expense => expense.id !== expenseId);
      
      if (expenses.length !== filteredExpenses.length) {
        await StorageService.budget.save(filteredExpenses);
        return true;
      }
      return false;
    },
  },
  
  // Settings operations
  settings: {
    get: async () => {
      return await StorageService.getData(STORAGE_KEYS.SETTINGS) || {
        theme: 'light',
        language: 'en',
        currency: 'USD',
        hasCompletedOnboarding: false,
      };
    },
    
    save: async (settings) => {
      return await StorageService.storeData(STORAGE_KEYS.SETTINGS, settings);
    },
    
    update: async (updatedSettings) => {
      const currentSettings = await StorageService.settings.get();
      const newSettings = { ...currentSettings, ...updatedSettings };
      return await StorageService.settings.save(newSettings);
    },
  },
};

export default StorageService;
