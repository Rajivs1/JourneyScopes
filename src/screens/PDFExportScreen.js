import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

import { useTheme } from '../context/ThemeContext';
import StorageService from '../services/storageService';
import Card from '../components/Card';
import Button from '../components/Button';

const PDFExportScreen = () => {
  const { theme } = useTheme();
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Load data from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedTrips = await StorageService.trips.getAll();
        const storedExpenses = await StorageService.budget.getAll();
        setTrips(storedTrips);
        setExpenses(storedExpenses);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Request storage permission (Android only)
  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;
    
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'JourneyScopes needs access to your storage to save PDF files.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error('Permission request error:', err);
      return false;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  // Get trip expenses
  const getTripExpenses = (trip) => {
    if (!trip || !trip.startDate || !trip.endDate) return [];
    
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  };

  // Generate PDF for trip
  const generatePDF = async (trip) => {
    // Check permission
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Storage permission is required to save PDF files.');
      return;
    }
    
    setGenerating(true);
    
    try {
      const tripExpenses = getTripExpenses(trip);
      const totalExpenses = tripExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0).toFixed(2);
      
      // Create HTML content for PDF
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
              h1 { color: #3498db; font-size: 24px; margin-bottom: 10px; }
              h2 { color: #2c3e50; font-size: 18px; margin-top: 20px; margin-bottom: 10px; }
              .trip-info { margin-bottom: 20px; }
              .trip-info p { margin: 5px 0; }
              .expense-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              .expense-table th { background-color: #3498db; color: white; text-align: left; padding: 8px; }
              .expense-table td { border: 1px solid #ddd; padding: 8px; }
              .expense-table tr:nth-child(even) { background-color: #f2f2f2; }
              .total { font-weight: bold; margin-top: 20px; text-align: right; }
              .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #7f8c8d; }
            </style>
          </head>
          <body>
            <h1>Trip Summary: ${trip.destination}</h1>
            
            <div class="trip-info">
              <p><strong>Destination:</strong> ${trip.destination}</p>
              <p><strong>Dates:</strong> ${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}</p>
              <p><strong>Duration:</strong> ${Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24))} days</p>
            </div>
            
            <h2>Expenses</h2>
            ${tripExpenses.length > 0 ? `
              <table class="expense-table">
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
                ${tripExpenses.map(expense => `
                  <tr>
                    <td>${expense.description}</td>
                    <td>${expense.category || 'Other'}</td>
                    <td>${formatDate(expense.date)}</td>
                    <td>$${parseFloat(expense.amount).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </table>
              
              <p class="total">Total Expenses: $${totalExpenses}</p>
            ` : '<p>No expenses recorded for this trip.</p>'}
            
            <div class="footer">
              <p>Generated by JourneyScopes App</p>
              <p>Date: ${new Date().toLocaleDateString()}</p>
            </div>
          </body>
        </html>
      `;
      
      // Generate PDF file
      const options = {
        html: htmlContent,
        fileName: `Trip_${trip.destination.replace(/\s+/g, '_')}_${new Date().getTime()}`,
        directory: 'Documents',
      };
      
      const file = await RNHTMLtoPDF.convert(options);
      
      // Show success message
      Alert.alert(
        'PDF Created!',
        `File saved to: ${file.filePath}`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('PDF generation error:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
      setSelectedTrip(null);
    }
  };

  // Render a single trip card
  const renderTripCard = ({ item, index }) => (
    <Card
      animation="fadeInUp"
      delay={index * 100}
      style={styles.tripCard}
    >
      <View style={styles.tripHeader}>
        <Text style={[styles.destination, { color: theme.text }]}>
          {item.destination}
        </Text>
      </View>
      
      <View style={styles.tripDetails}>
        <View style={styles.detailRow}>
          <Icon name="calendar-range" size={16} color={theme.secondary} style={styles.detailIcon} />
          <Text style={[styles.detailText, { color: theme.text }]}>
            {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Icon name="wallet-outline" size={16} color={theme.secondary} style={styles.detailIcon} />
          <Text style={[styles.detailText, { color: theme.text }]}>
            {getTripExpenses(item).length} expenses
          </Text>
        </View>
      </View>
      
      <Button
        title="Generate PDF"
        onPress={() => generatePDF(item)}
        loading={generating && selectedTrip === item.id}
        disabled={generating}
        style={styles.generateButton}
        size="small"
      />
    </Card>
  );

  // Render loading state
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          style={styles.loadingContainer}
        >
          <Icon name="file-pdf-box" size={50} color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading your trips...
          </Text>
        </Animatable.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>PDF Export</Text>
      </View>
      
      <Text style={[styles.description, { color: theme.text }]}>
        Generate PDF reports of your trips including expenses and details.
      </Text>
      
      {/* Trip List */}
      {trips.length > 0 ? (
        <FlatList
          data={trips}
          renderItem={renderTripCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Animatable.View animation="pulse" iterationCount={3} duration={2000}>
            <Icon name="file-pdf-box" size={70} color={theme.text + '40'} />
          </Animatable.View>
          <Text style={[styles.emptyText, { color: theme.text }]}>
            No trips available
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.text + '99' }]}>
            Add trips in the Trips section to generate PDF reports
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  description: {
    paddingHorizontal: 20,
    marginBottom: 20,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  tripCard: {
    marginBottom: 16,
  },
  tripHeader: {
    marginBottom: 10,
  },
  destination: {
    fontSize: 18,
    fontWeight: '600',
  },
  tripDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailIcon: {
    marginRight: 5,
  },
  detailText: {
    fontSize: 14,
  },
  generateButton: {
    alignSelf: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default PDFExportScreen; 