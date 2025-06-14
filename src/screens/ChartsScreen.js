import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { LineChart, BarChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import StorageService from '../services/storageService';

const { width } = Dimensions.get('window');

const ChartsScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('expenses');
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Load data from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedTrips = await StorageService.trips.getAll();
        const storedExpenses = await StorageService.budget.getAll();
        
        setTrips(storedTrips);
        setExpenses(storedExpenses);
      } catch (error) {
        console.error('Error loading data for charts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Placeholder data (will be replaced with real data when available)
  const expenseData = {
    labels: ['Food', 'Transport', 'Lodging', 'Activities', 'Shopping', 'Other'],
    datasets: [
      {
        data: [300, 450, 800, 250, 400, 150],
      },
    ],
  };

  // Generate trip duration data
  const getTripDurationData = () => {
    if (trips.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [1] }],
      };
    }

    const lastSixTrips = trips.slice(-6);
    
    return {
      labels: lastSixTrips.map(trip => trip.destination.substring(0, 5) + '...'),
      datasets: [
        {
          data: lastSixTrips.map(trip => {
            const start = new Date(trip.startDate);
            const end = new Date(trip.endDate || trip.startDate);
            const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
            return duration;
          }),
        },
      ],
    };
  };

  // Generate expense category data
  const getExpenseCategoryData = () => {
    if (expenses.length === 0) {
      return [
        { name: 'No Data', amount: 1, color: theme.primary, legendFontColor: theme.text, legendFontSize: 12 },
      ];
    }

    // Group expenses by category
    const categories = {};
    expenses.forEach(expense => {
      const cat = expense.category || 'Other';
      if (!categories[cat]) {
        categories[cat] = 0;
      }
      categories[cat] += Number(expense.amount) || 0;
    });

    // Colors for different categories
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    
    // Transform to chart data format
    return Object.keys(categories).map((category, index) => ({
      name: category,
      amount: categories[category],
      color: colors[index % colors.length],
      legendFontColor: theme.text,
      legendFontSize: 12,
    }));
  };

  // Chart configurations
  const chartConfig = {
    backgroundGradientFrom: theme.cardBackground,
    backgroundGradientTo: theme.cardBackground,
    color: (opacity = 1) => `rgba(${isDarkMode ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(${isDarkMode ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 10,
    },
  };

  const gradientChartConfig = {
    ...chartConfig,
    backgroundGradientFrom: isDarkMode ? '#222436' : '#E8E9F3',
    backgroundGradientTo: isDarkMode ? '#1A1B2E' : '#FFFFFF',
    color: (opacity = 1) => isDarkMode 
      ? `rgba(114, 137, 218, ${opacity})`
      : `rgba(72, 102, 180, ${opacity})`,
    strokeWidth: 2,
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: theme.primary,
    },
  };

  // Progress chart data - Travel goals completion
  const progressData = {
    data: [0.6, 0.8, 0.4, 0.7]
  };

  const renderTabs = () => (
    <Animatable.View animation="fadeIn" duration={500} style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tab, 
          activeTab === 'expenses' && [styles.activeTab, { borderColor: theme.primary }]
        ]}
        onPress={() => setActiveTab('expenses')}
      >
        <Icon
          name="wallet-outline"
          size={22}
          color={activeTab === 'expenses' ? theme.primary : theme.text + '80'}
        />
        <Text 
          style={[
            styles.tabText, 
            { color: activeTab === 'expenses' ? theme.primary : theme.text }
          ]}
        >
          Expenses
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.tab, 
          activeTab === 'trips' && [styles.activeTab, { borderColor: theme.primary }]
        ]}
        onPress={() => setActiveTab('trips')}
      >
        <Icon
          name="airplane"
          size={22}
          color={activeTab === 'trips' ? theme.primary : theme.text + '80'}
        />
        <Text 
          style={[
            styles.tabText, 
            { color: activeTab === 'trips' ? theme.primary : theme.text }
          ]}
        >
          Trip Stats
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.tab, 
          activeTab === 'goals' && [styles.activeTab, { borderColor: theme.primary }]
        ]}
        onPress={() => setActiveTab('goals')}
      >
        <Icon
          name="flag-outline"
          size={22}
          color={activeTab === 'goals' ? theme.primary : theme.text + '80'}
        />
        <Text 
          style={[
            styles.tabText, 
            { color: activeTab === 'goals' ? theme.primary : theme.text }
          ]}
        >
          Goals
        </Text>
      </TouchableOpacity>
    </Animatable.View>
  );

  const renderExpensesTab = () => (
    <Animatable.View animation="fadeIn" duration={500}>
      <Animatable.View animation="slideInUp" duration={700} delay={100}>
        <View style={styles.chartCard}>
          <Text style={[styles.chartTitle, { color: theme.text }]}>
            Expense Distribution
          </Text>
          <Text style={[styles.chartSubtitle, { color: theme.text + '99' }]}>
            Breakdown by category
          </Text>
          
          <View style={styles.chartContainer}>
            <PieChart
              data={getExpenseCategoryData()}
              width={width - 40}
              height={200}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="10"
              center={[10, 0]}
              absolute
            />
          </View>
        </View>
      </Animatable.View>
      
      <Animatable.View animation="slideInUp" duration={700} delay={200}>
        <View style={styles.chartCard}>
          <Text style={[styles.chartTitle, { color: theme.text }]}>
            Monthly Expenses
          </Text>
          <Text style={[styles.chartSubtitle, { color: theme.text + '99' }]}>
            Last 6 months spending
          </Text>
          
          <View style={styles.chartContainer}>
            <BarChart
              data={expenseData}
              width={width - 40}
              height={220}
              yAxisLabel="$"
              chartConfig={gradientChartConfig}
              verticalLabelRotation={30}
              fromZero
              showBarTops={true}
              showValuesOnTopOfBars={true}
              style={styles.barChart}
            />
          </View>
        </View>
      </Animatable.View>
    </Animatable.View>
  );

  const renderTripsTab = () => (
    <Animatable.View animation="fadeIn" duration={500}>
      <Animatable.View animation="slideInUp" duration={700} delay={100}>
        <View style={styles.chartCard}>
          <Text style={[styles.chartTitle, { color: theme.text }]}>
            Trip Duration
          </Text>
          <Text style={[styles.chartSubtitle, { color: theme.text + '99' }]}>
            Length of stay (days)
          </Text>
          
          <View style={styles.chartContainer}>
            <BarChart
              data={getTripDurationData()}
              width={width - 40}
              height={220}
              chartConfig={gradientChartConfig}
              verticalLabelRotation={30}
              fromZero
              showValuesOnTopOfBars={true}
              style={styles.barChart}
            />
          </View>
        </View>
      </Animatable.View>
      
      <Animatable.View animation="slideInUp" duration={700} delay={200}>
        <View style={styles.chartCard}>
          <Text style={[styles.chartTitle, { color: theme.text }]}>
            Travel Timeline
          </Text>
          <Text style={[styles.chartSubtitle, { color: theme.text + '99' }]}>
            Trips frequency over time
          </Text>
          
          <View style={styles.chartContainer}>
            <LineChart
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                  {
                    data: [1, 0, 2, 1, 0, 1],
                    color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
                    strokeWidth: 2
                  }
                ]
              }}
              width={width - 40}
              height={220}
              chartConfig={gradientChartConfig}
              bezier
              style={styles.lineChart}
            />
          </View>
        </View>
      </Animatable.View>
    </Animatable.View>
  );

  const renderGoalsTab = () => (
    <Animatable.View animation="fadeIn" duration={500}>
      <Animatable.View animation="slideInUp" duration={700} delay={100}>
        <View style={styles.chartCard}>
          <Text style={[styles.chartTitle, { color: theme.text }]}>
            Travel Goals Progress
          </Text>
          <Text style={[styles.chartSubtitle, { color: theme.text + '99' }]}>
            Completion percentage
          </Text>
          
          <View style={styles.chartContainer}>
            <ProgressChart
              data={progressData}
              width={width - 40}
              height={220}
              strokeWidth={16}
              radius={32}
              chartConfig={{
                ...gradientChartConfig,
                color: (opacity = 1) => `rgba(${isDarkMode ? '114, 137, 218' : '72, 102, 180'}, ${opacity})`,
              }}
              hideLegend={false}
            />
          </View>
          
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF6384' }]} />
              <Text style={[styles.legendText, { color: theme.text }]}>Budget Savings</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#36A2EB' }]} />
              <Text style={[styles.legendText, { color: theme.text }]}>Destinations Visited</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FFCE56' }]} />
              <Text style={[styles.legendText, { color: theme.text }]}>Language Proficiency</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4BC0C0' }]} />
              <Text style={[styles.legendText, { color: theme.text }]}>Cultural Activities</Text>
            </View>
          </View>
        </View>
      </Animatable.View>
    </Animatable.View>
  );

  const renderActiveTab = () => {
    switch(activeTab) {
      case 'expenses':
        return renderExpensesTab();
      case 'trips':
        return renderTripsTab();
      case 'goals':
        return renderGoalsTab();
      default:
        return renderExpensesTab();
    }
  };

  return (
    <LinearGradient
      colors={isDarkMode ? 
        [theme.background, '#1a1a2e'] : 
        [theme.background, '#f5f5f7']
      }
      style={styles.container}
    >
      <Animatable.View
        animation="fadeIn"
        duration={800}
        style={styles.header}
      >
        <LinearGradient
          colors={[theme.primary, theme.primary + 'CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Travel Analytics</Text>
            <Text style={styles.headerSubtitle}>Insights & Statistics</Text>
          </View>
        </LinearGradient>
      </Animatable.View>

      {renderTabs()}

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.text }]}>
              Loading chart data...
            </Text>
          </View>
        ) : (
          renderActiveTab()
        )}
        
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
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: width / 3.5,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chartCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartSubtitle: {
    fontSize: 12,
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  barChart: {
    borderRadius: 12,
    marginVertical: 8,
  },
  lineChart: {
    borderRadius: 12,
    marginVertical: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },
  footer: {
    height: 20,
  },
});

export default ChartsScreen; 