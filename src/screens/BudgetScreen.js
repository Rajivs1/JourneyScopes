import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

import { useTheme } from '../context/ThemeContext';
import StorageService from '../services/storageService';
import Card from '../components/Card';
import Button from '../components/Button';

const { width } = Dimensions.get('window');

const BudgetScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [budgetCapModalVisible, setBudgetCapModalVisible] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'Food',
  });
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [budgetCap, setBudgetCap] = useState('');
  const [tempBudgetCap, setTempBudgetCap] = useState('');
  const [showChart, setShowChart] = useState(false);

  // Animation refs
  const headerRef = useRef(null);
  const totalRef = useRef(null);
  const addButtonRef = useRef(null);
  const chartRef = useRef(null);

  // Trigger animations when component mounts
  useEffect(() => {
    if (headerRef.current) headerRef.current.slideInDown(800);
    if (totalRef.current) {
      setTimeout(() => {
        totalRef.current.fadeIn(500);
      }, 400);
    }
    if (addButtonRef.current) {
      setTimeout(() => {
        addButtonRef.current.bounce(800);
      }, 800);
    }
    if (chartRef.current && showChart) {
      chartRef.current.fadeIn(1000);
    }
  }, [showChart]);

  const categories = [
    { id: 'All', icon: 'view-list', color: '#6c5ce7' },
    { id: 'Food', icon: 'food', color: '#FF6B6B' },
    { id: 'Transport', icon: 'train-car', color: '#4ECDC4' },
    { id: 'Accommodation', icon: 'bed', color: '#FFD166' },
    { id: 'Activities', icon: 'ticket', color: '#118AB2' },
    { id: 'Shopping', icon: 'shopping', color: '#EF476F' },
    { id: 'Other', icon: 'dots-horizontal', color: '#073B4C' },
  ];

  // Load expenses and budget cap from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedExpenses = await StorageService.budget.getAll();
        setExpenses(storedExpenses);
        
        // Load budget cap
        const settings = await StorageService.getData('journeyscopes_budget_settings') || {};
        if (settings.budgetCap) {
          setBudgetCap(settings.budgetCap.toString());
        }
      } catch (error) {
        console.error('Error loading budget data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Save budget cap
  const saveBudgetCap = async () => {
    try {
      if (isNaN(parseFloat(tempBudgetCap))) {
        Alert.alert('Error', 'Budget cap must be a number');
        return;
      }

      const settings = await StorageService.getData('journeyscopes_budget_settings') || {};
      settings.budgetCap = parseFloat(tempBudgetCap);
      await StorageService.storeData('journeyscopes_budget_settings', settings);
      
      setBudgetCap(tempBudgetCap);
      setBudgetCapModalVisible(false);
    } catch (error) {
      console.error('Error saving budget cap:', error);
      Alert.alert('Error', 'Failed to save budget cap');
    }
  };

  // Filter expenses by category
  const getFilteredExpenses = () => {
    if (selectedCategory === 'All') {
      return expenses;
    }
    return expenses.filter(expense => expense.category === selectedCategory);
  };

  // Calculate total expenses
  const calculateTotal = () => {
    const filteredExpenses = getFilteredExpenses();
    return filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0).toFixed(2);
  };

  // Calculate remaining budget
  const calculateRemaining = () => {
    if (!budgetCap) return 0;
    
    const total = parseFloat(calculateTotal());
    const remaining = parseFloat(budgetCap) - total;
    return remaining > 0 ? remaining.toFixed(2) : '0.00';
  };

  // Calculate percentage of budget used
  const calculateBudgetPercentage = () => {
    if (!budgetCap || parseFloat(budgetCap) === 0) return 100;
    
    const total = parseFloat(calculateTotal());
    const percentage = (total / parseFloat(budgetCap)) * 100;
    return Math.min(percentage, 100).toFixed(0);
  };

  // Prepare data for pie chart - updated to return data for our custom chart
  const getPieChartData = () => {
    const categoryTotals = {};
    
    // Initialize totals for all categories
    categories.slice(1).forEach(cat => {
      categoryTotals[cat.id] = 0;
    });
    
    // Sum up expenses by category
    expenses.forEach(expense => {
      const category = expense.category || 'Other';
      categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(expense.amount || 0);
    });
    
    // Calculate total
    const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    
    // Create pie chart data with percentages and angles
    return Object.keys(categoryTotals)
      .filter(catId => categoryTotals[catId] > 0) // Only include categories with expenses
      .map(catId => {
        const category = getCategoryDetails(catId);
        const value = categoryTotals[catId];
        const percentage = total > 0 ? (value / total) * 100 : 0;
        
        return {
          key: catId,
          value,
          percentage,
          color: category.color,
          name: category.id
        };
      })
      .sort((a, b) => b.value - a.value); // Sort by value (highest first)
  };

  // Get category breakdown
  const getCategoryBreakdown = () => {
    const categoryTotals = {};
    let totalAmount = 0;
    
    // Sum up expenses by category
    expenses.forEach(expense => {
      const category = expense.category || 'Other';
      categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(expense.amount || 0);
      totalAmount += parseFloat(expense.amount || 0);
    });
    
    // Create breakdown data with percentages
    return Object.keys(categoryTotals)
      .map(catId => {
        const category = getCategoryDetails(catId);
        const amount = categoryTotals[catId];
        const percentage = totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(1) : 0;
        
        return {
          id: catId,
          color: category.color,
          icon: category.icon,
          amount,
          percentage
        };
      })
      .sort((a, b) => b.amount - a.amount); // Sort by amount (highest first)
  };

  // Reset form and close modal
  const closeModal = () => {
    setNewExpense({ description: '', amount: '', category: 'Food' });
    setEditingExpenseId(null);
    setModalVisible(false);
  };

  // Open modal for adding a new expense
  const openAddExpenseModal = () => {
    setEditingExpenseId(null);
    setModalVisible(true);
  };

  // Open modal for editing an existing expense
  const openEditExpenseModal = (expense) => {
    setNewExpense({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category || 'Other',
    });
    setEditingExpenseId(expense.id);
    setModalVisible(true);
  };

  // Save a new expense or update an existing one
  const saveExpense = async () => {
    if (!newExpense.description.trim() || !newExpense.amount.trim()) {
      Alert.alert('Error', 'Please enter both description and amount');
      return;
    }

    if (isNaN(parseFloat(newExpense.amount))) {
      Alert.alert('Error', 'Amount must be a number');
      return;
    }

    try {
      const expenseData = {
        ...newExpense,
        amount: parseFloat(newExpense.amount),
      };

      if (editingExpenseId) {
        // Update existing expense
        const updatedExpense = await StorageService.budget.updateExpense(
          editingExpenseId,
          expenseData
        );
        setExpenses(expenses.map(exp => (exp.id === editingExpenseId ? updatedExpense : exp)));
      } else {
        // Add new expense
        const addedExpense = await StorageService.budget.addExpense(expenseData);
        setExpenses([...expenses, addedExpense]);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving expense:', error);
      Alert.alert('Error', 'Failed to save expense');
    }
  };

  // Delete an expense
  const deleteExpense = async (expenseId) => {
    try {
      Alert.alert(
        'Delete Expense',
        'Are you sure you want to delete this expense?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            onPress: async () => {
              const success = await StorageService.budget.deleteExpense(expenseId);
              if (success) {
                setExpenses(expenses.filter(exp => exp.id !== expenseId));
              }
            },
            style: 'destructive',
          },
        ]
      );
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  // Get category details
  const getCategoryDetails = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId) || categories[6]; // Default to 'Other'
    return category;
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Render category filters
  const renderCategoryFilters = () => (
    <Animatable.View 
      animation="fadeIn" 
      duration={800} 
      delay={300}
      style={styles.categoryFiltersContainer}
    >
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryFilters}
        renderItem={({ item, index }) => (
          <Animatable.View
            animation="fadeInRight"
            delay={index * 100 + 500}
          >
            <TouchableOpacity
              style={[
                styles.categoryFilterItem,
                selectedCategory === item.id && { 
                  backgroundColor: item.color + '40',
                  borderColor: item.color,
                },
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <View style={[styles.filterIconContainer, { backgroundColor: item.color + '20' }]}>
                <Icon name={item.icon} size={18} color={item.color} />
              </View>
              <Text
                style={[
                  styles.categoryFilterText,
                  { color: selectedCategory === item.id ? item.color : theme.text },
                ]}
              >
                {item.id}
              </Text>
            </TouchableOpacity>
          </Animatable.View>
        )}
      />
    </Animatable.View>
  );

  // Render a single expense card
  const renderExpenseCard = ({ item, index }) => {
    const category = getCategoryDetails(item.category);
    
    return (
      <Card
        animation="fadeInUp"
        delay={index * 100}
        style={styles.expenseCard}
      >
        <View style={styles.expenseHeader}>
          <View style={styles.expenseInfo}>
            <LinearGradient
              colors={[category.color + '40', category.color + '20']}
              style={styles.categoryIcon}
            >
              <Icon name={category.icon} size={20} color={category.color} />
            </LinearGradient>
            <View style={styles.expenseTextContainer}>
              <Text style={[styles.expenseDescription, { color: theme.text }]}>
                {item.description}
              </Text>
              <Text style={[styles.expenseDate, { color: theme.text + '99' }]}>
                {formatDate(item.date)}
              </Text>
            </View>
          </View>
          <Animatable.Text 
            animation="bounceIn"
            duration={1000}
            delay={index * 100 + 500}
            style={[styles.expenseAmount, { color: theme.text }]}
          >
            ${parseFloat(item.amount).toFixed(2)}
          </Animatable.Text>
        </View>

        <View style={styles.expenseActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openEditExpenseModal(item)}
          >
            <Icon name="pencil" size={18} color={theme.primary} />
            <Text style={[styles.actionText, { color: theme.primary }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => deleteExpense(item.id)}
          >
            <Icon name="delete" size={18} color={theme.accent} />
            <Text style={[styles.actionText, { color: theme.accent }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  // Render expense modal
  const renderExpenseModal = () => (
    <Modal
      animationType="slide"
      transparent
      visible={modalVisible}
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <Animatable.View
          animation="fadeInUp"
          duration={300}
          style={[styles.modalContainer, { backgroundColor: theme.cardBackground }]}
        >
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            {editingExpenseId ? 'Edit Expense' : 'Add New Expense'}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Description</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.border, color: theme.text, backgroundColor: theme.background + '80' },
              ]}
              placeholder="What did you spend on?"
              placeholderTextColor={theme.text + '80'}
              value={newExpense.description}
              onChangeText={(text) => setNewExpense({ ...newExpense, description: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Amount</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.border, color: theme.text, backgroundColor: theme.background + '80' },
              ]}
              placeholder="0.00"
              placeholderTextColor={theme.text + '80'}
              keyboardType="numeric"
              value={newExpense.amount}
              onChangeText={(text) => setNewExpense({ ...newExpense, amount: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Category</Text>
            <View style={styles.categoryButtonsContainer}>
              {categories.slice(1).map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor:
                        newExpense.category === category.id
                          ? category.color + '40'
                          : theme.background + '80',
                      borderColor:
                        newExpense.category === category.id
                          ? category.color
                          : theme.border,
                    },
                  ]}
                  onPress={() => setNewExpense({ ...newExpense, category: category.id })}
                >
                  <Icon
                    name={category.icon}
                    size={20}
                    color={
                      newExpense.category === category.id
                        ? category.color
                        : theme.text + '80'
                    }
                  />
                  <Text
                    style={[
                      styles.categoryButtonText,
                      {
                        color: newExpense.category === category.id ? category.color : theme.text,
                      },
                    ]}
                  >
                    {category.id}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.buttonGroup}>
            <Button
              title="Cancel"
              onPress={closeModal}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title={editingExpenseId ? 'Update' : 'Add Expense'}
              onPress={saveExpense}
              style={styles.modalButton}
            />
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );

  // Render budget cap modal
  const renderBudgetCapModal = () => (
    <Modal
      animationType="slide"
      transparent
      visible={budgetCapModalVisible}
      onRequestClose={() => setBudgetCapModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <Animatable.View
          animation="fadeInUp"
          duration={300}
          style={[styles.modalContainer, { backgroundColor: theme.cardBackground }]}
        >
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Set Budget Cap
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Budget Amount</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.border, color: theme.text, backgroundColor: theme.background },
              ]}
              placeholder="Enter maximum budget"
              placeholderTextColor={theme.text + '80'}
              value={tempBudgetCap}
              onChangeText={setTempBudgetCap}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.buttonGroup}>
            <Button
              title="Cancel"
              onPress={() => setBudgetCapModalVisible(false)}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title="Save"
              onPress={saveBudgetCap}
              style={styles.modalButton}
            />
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );

  // Render chart section - updated to use custom chart implementation
  const renderChartSection = () => {
    const pieData = getPieChartData();
    const categoryBreakdown = getCategoryBreakdown();
    
    if (pieData.length === 0) {
      return (
        <View style={styles.emptyChartContainer}>
          <Text style={[styles.emptyText, { color: theme.text }]}>
            No expense data to visualize
          </Text>
        </View>
      );
    }
    
    // Calculate total expenses
    const totalExpenses = pieData.reduce((sum, item) => sum + item.value, 0).toFixed(2);
    
    return (
      <Animatable.View ref={chartRef} style={styles.chartContainer}>
        <View style={styles.pieChartContainer}>
          {/* Simple custom pie chart visualization */}
          <View style={styles.customPieChart}>
            {pieData.map((item, index) => (
              <View 
                key={item.key}
                style={[
                  styles.pieSegmentContainer,
                  { 
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  }
                ]}
              />
            ))}
          </View>
          <View style={styles.totalInPieChart}>
            <Text style={[styles.totalLabelInPie, { color: theme.text }]}>Total</Text>
            <Text style={[styles.totalValueInPie, { color: theme.primary }]}>
              ${totalExpenses}
            </Text>
          </View>
        </View>
        
        <View style={styles.categoryBreakdown}>
          <Text style={[styles.breakdownTitle, { color: theme.text }]}>
            Expense Breakdown
          </Text>
          {categoryBreakdown.map(cat => (
            <View key={cat.id} style={styles.breakdownItem}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                <Icon name={cat.icon} size={18} color={cat.color} style={styles.breakdownIcon} />
                <Text style={[styles.breakdownCategory, { color: theme.text }]}>
                  {cat.id}
                </Text>
              </View>
              <View style={styles.breakdownRight}>
                <Text style={[styles.breakdownAmount, { color: theme.text }]}>
                  ${cat.amount.toFixed(2)}
                </Text>
                <Text style={[styles.breakdownPercentage, { color: theme.text + '99' }]}>
                  {cat.percentage}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Animatable.View>
    );
  };

  return (
    <LinearGradient
      colors={isDarkMode ? 
        [theme.background, '#1a1a2e'] : 
        [theme.background, '#f5f5f7']
      }
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animatable.View ref={headerRef} style={styles.header}>
          <LinearGradient
            colors={[theme.primary, theme.primary + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>Budget Tracker</Text>
                <TouchableOpacity 
                  style={styles.setBudgetButton}
                  onPress={() => {
                    setTempBudgetCap(budgetCap);
                    setBudgetCapModalVisible(true);
                  }}
                >
                  <Text style={styles.setBudgetText}>Set Budget</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.budgetOverview}>
                <View style={styles.budgetDetail}>
                  <Text style={styles.budgetLabel}>Total Spent</Text>
                  <Text style={styles.budgetValue}>${calculateTotal()}</Text>
                </View>
                {budgetCap ? (
                  <>
                    <View style={styles.budgetDivider} />
                    <View style={styles.budgetDetail}>
                      <Text style={styles.budgetLabel}>Budget</Text>
                      <Text style={styles.budgetValue}>${parseFloat(budgetCap).toFixed(2)}</Text>
                    </View>
                    <View style={styles.budgetDivider} />
                    <View style={styles.budgetDetail}>
                      <Text style={styles.budgetLabel}>Remaining</Text>
                      <Text style={[
                        styles.budgetValue,
                        { color: parseFloat(calculateRemaining()) <= 0 ? '#FF6B6B' : '#4ECDC4' }
                      ]}>
                        ${calculateRemaining()}
                      </Text>
                    </View>
                  </>
                ) : null}
              </View>
              {budgetCap ? (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBackground}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          width: `${calculateBudgetPercentage()}%`,
                          backgroundColor: parseInt(calculateBudgetPercentage()) > 90 
                            ? '#FF6B6B' 
                            : parseInt(calculateBudgetPercentage()) > 70
                              ? '#FFD166'
                              : '#4ECDC4'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {calculateBudgetPercentage()}% used
                  </Text>
                </View>
              ) : null}
            </View>
          </LinearGradient>
        </Animatable.View>

        <View style={styles.toggleSection}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              { backgroundColor: !showChart ? theme.primary : theme.cardBackground }
            ]}
            onPress={() => setShowChart(false)}
          >
            <Text style={[
              styles.toggleText,
              { color: !showChart ? '#fff' : theme.text }
            ]}>
              Expenses
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              { backgroundColor: showChart ? theme.primary : theme.cardBackground }
            ]}
            onPress={() => setShowChart(true)}
          >
            <Text style={[
              styles.toggleText,
              { color: showChart ? '#fff' : theme.text }
            ]}>
              Charts
            </Text>
          </TouchableOpacity>
        </View>

        {showChart ? (
          renderChartSection()
        ) : (
          <>
            {renderCategoryFilters()}
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={[styles.loadingText, { color: theme.text }]}>
                  Loading expenses...
                </Text>
              </View>
            ) : getFilteredExpenses().length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="currency-usd-off" size={60} color={theme.text + '40'} />
                <Text style={[styles.emptyText, { color: theme.text }]}>
                  {selectedCategory === 'All'
                    ? 'No expenses added yet'
                    : `No expenses in ${selectedCategory} category`}
                </Text>
                <Button
                  title="Add Expense"
                  onPress={openAddExpenseModal}
                  style={styles.emptyButton}
                />
              </View>
            ) : (
              <FlatList
                data={getFilteredExpenses()}
                keyExtractor={(item) => item.id}
                renderItem={renderExpenseCard}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            )}
          </>
        )}
      </ScrollView>

      <Animatable.View ref={addButtonRef}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={openAddExpenseModal}
        >
          <Icon name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </Animatable.View>

      {renderExpenseModal()}
      {renderBudgetCapModal()}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  header: {
    marginBottom: 15,
  },
  headerGradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  setBudgetButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  setBudgetText: {
    color: '#fff',
    fontSize: 14,
  },
  budgetOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  budgetDetail: {
    flex: 1,
    alignItems: 'center',
  },
  budgetDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  budgetLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: 5,
  },
  budgetValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 5,
  },
  progressBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 3,
  },
  toggleSection: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  toggleText: {
    fontWeight: '500',
  },
  chartContainer: {
    padding: 15,
  },
  pieChartContainer: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  customPieChart: {
    height: 30,
    width: '100%',
    flexDirection: 'row',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  pieSegmentContainer: {
    height: '100%',
  },
  totalInPieChart: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalLabelInPie: {
    fontSize: 14,
  },
  totalValueInPie: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryBreakdown: {
    marginTop: 10,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  breakdownIcon: {
    marginRight: 8,
  },
  breakdownCategory: {
    fontSize: 14,
  },
  breakdownRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownAmount: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 10,
  },
  breakdownPercentage: {
    fontSize: 12,
    width: 40,
    textAlign: 'right',
  },
  emptyChartContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: 16,
  },
  emptyButton: {
    marginTop: 20,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  categoryFiltersContainer: {
    marginBottom: 20,
  },
  categoryFilters: {
    paddingHorizontal: 20,
  },
  categoryFilterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 20,
    marginRight: 10,
  },
  filterIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  categoryFilterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  expenseCard: {
    marginBottom: 15,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  expenseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expenseTextContainer: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '500',
  },
  expenseDate: {
    fontSize: 12,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  expenseActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 10,
    marginTop: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    fontSize: 14,
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: width * 0.9,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  categoryButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '500',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 0.48,
  },
  logoImage: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
});

export default BudgetScreen;
