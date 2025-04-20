import { Transaction, BudgetItem, Goal, ChartDataPoint, FinancialData, ProfileData, CategoriesData, InsightData } from './types';
import * as fileService from './fileService';

// Default data for initializing the application
const defaultData: FinancialData = {
  profile: {
    balance: 16420.65,
    monthlyIncome: 4250.00,
    monthlyExpenses: 2845.17,
    monthlySavings: 1404.83,
    monthlyChange: 2.4,
    incomeChange: 1250.00,
    expensesChange: -320.00
  },
  transactions: [
    { id: 1, date: "Apr 15", payee: "Grocery Store", category: "Food", amount: -78.52 },
    { id: 2, date: "Apr 14", payee: "Direct Deposit", category: "Income", amount: 1250.00 },
    { id: 3, date: "Apr 13", payee: "Coffee Shop", category: "Dining", amount: -4.75 },
    { id: 4, date: "Apr 12", payee: "Gas Station", category: "Transport", amount: -45.80 },
    { id: 5, date: "Apr 10", payee: "Utility Bill", category: "Bills", amount: -120.35 }
  ],
  budgets: [
    { category: "Food & Dining", spent: 450, budget: 600, percent: 75 },
    { category: "Transportation", spent: 250, budget: 300, percent: 83 },
    { category: "Entertainment", spent: 180, budget: 200, percent: 90 },
    { category: "Shopping", spent: 120, budget: 300, percent: 40 }
  ],
  goals: [
    { name: "Vacation", saved: 2500, target: 5000, percent: 50 },
    { name: "New Car", saved: 7500, target: 15000, percent: 50 }
  ],
  categories: {
    budgetCategories: [
      { id: "food", name: "Food & Dining" },
      { id: "transport", name: "Transportation" },
      { id: "entertainment", name: "Entertainment" },
      { id: "shopping", name: "Shopping" }
    ],
    expenseCategories: [
      { id: "bills", name: "Bills" },
      { id: "housing", name: "Housing" },
      { id: "health", name: "Healthcare" },
      { id: "other_expense", name: "Other" }
    ],
    incomeCategories: [
      { id: "paycheck", name: "Paycheck" },
      { id: "freelance", name: "Freelance" },
      { id: "investment", name: "Investment" },
      { id: "gift", name: "Gift" },
      { id: "refund", name: "Refund" },
      { id: "other_income", name: "Other" }
    ],
    categoryMappings: {
      "Food": "Food & Dining",
      "Dining": "Food & Dining",
      "Transport": "Transportation",
      "Entertainment": "Entertainment",
      "Shopping": "Shopping"
    }
  },
  chartData: {
    thisMonth: [
      { name: "Apr 1 - Apr 7", income: 1250, expenses: 450 },
      { name: "Apr 8 - Apr 14", income: 850, expenses: 390 },
      { name: "Apr 15 - Apr 21", income: 0, expenses: 0 },
      { name: "Apr 22 - Apr 28", income: 0, expenses: 0 }
    ],
    last3Months: [
      { name: "Feb", income: 3950, expenses: 2780 },
      { name: "Mar", income: 4100, expenses: 3200 },
      { name: "Apr", income: 2100, expenses: 840 }
    ],
    thisYear: [
      { name: "Jan", income: 3850, expenses: 2650 },
      { name: "Feb", income: 3950, expenses: 2780 },
      { name: "Mar", income: 4100, expenses: 3200 },
      { name: "Apr", income: 2100, expenses: 840 }
    ]
  },
  insights: [
    {
      type: "spending",
      title: "Spending Pattern",
      message: "Your restaurant spending has increased by 15% compared to last month."
    },
    {
      type: "saving",
      title: "Saving Opportunity",
      message: "You could save $85/month by reducing subscription services."
    },
    {
      type: "upcoming",
      title: "Upcoming Bills",
      message: "Your internet bill ($65) is due in 3 days."
    }
  ]
};

// Cache for in-memory data
let cachedData: FinancialData | null = null;
let isInitialized = false;

/**
 * Initialize the data service
 */
export const initialize = async (): Promise<void> => {
  if (isInitialized) return;
  
  try {
    // Initialize storage with default data if needed
    await fileService.initializeStorage(defaultData);
    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize data service:', error);
    throw error;
  }
};

/**
 * Loads all financial data from storage
 */
export const loadData = async (): Promise<FinancialData> => {
  try {
    // Initialize if not already done
    if (!isInitialized) {
      await initialize();
    }
    
    // Use cached data if available
    if (cachedData) {
      return cachedData;
    }
    
    try {
      // Try to load from local storage
      const data = await fileService.loadDataFromStorage();
      cachedData = data;
      return data;
    } catch (storageError) {
      console.warn('Failed to load from storage, using default data:', storageError);
      
      // If loading from storage fails, use default data
      cachedData = defaultData;
      
      // Save default data to storage for future use
      await fileService.saveDataToStorage(defaultData);
      
      return defaultData;
    }
  } catch (error) {
    console.error('Failed to load data:', error);
    throw error;
  }
};

/**
 * Saves all financial data to storage
 */
export const saveData = async (data: FinancialData): Promise<void> => {
  try {
    // Update cache
    cachedData = data;
    
    // Save to storage
    await fileService.saveDataToStorage(data);
  } catch (error) {
    console.error('Failed to save data:', error);
    throw error;
  }
};

/**
 * Gets all transactions
 */
export const getTransactions = async (): Promise<Transaction[]> => {
  const data = await loadData();
  return data.transactions;
};

/**
 * Adds a new transaction and updates related data
 */
export const addTransaction = async (transaction: Transaction): Promise<FinancialData> => {
  const data = await loadData();
  
  // Add transaction to list
  data.transactions = [transaction, ...data.transactions];
  
  // Update financial metrics
  updateFinancialMetrics(data, transaction);
  
  // Update budget data if it's an expense
  if (transaction.amount < 0) {
    updateBudgetData(data, transaction);
  } else {
    // Check if the transaction is for a savings goal
    updateGoalsData(data, transaction);
  }
  
  // Update chart data
  updateChartData(data, transaction);
  
  // Save updated data
  await saveData(data);
  
  return data;
};

/**
 * Gets all budget items
 */
export const getBudgets = async (): Promise<BudgetItem[]> => {
  const data = await loadData();
  return data.budgets;
};

/**
 * Gets all savings goals
 */
export const getGoals = async (): Promise<Goal[]> => {
  const data = await loadData();
  return data.goals;
};

/**
 * Gets profile data
 */
export const getProfile = async (): Promise<ProfileData> => {
  const data = await loadData();
  return data.profile;
};

/**
 * Gets chart data for a specific time period
 */
export const getChartData = async (period: 'thisMonth' | 'last3Months' | 'thisYear'): Promise<ChartDataPoint[]> => {
  const data = await loadData();
  return data.chartData[period];
};

/**
 * Gets all insights
 */
export const getInsights = async (): Promise<InsightData[]> => {
  const data = await loadData();
  return data.insights;
};

/**
 * Gets all category data
 */
export const getCategories = async (): Promise<CategoriesData> => {
  const data = await loadData();
  return data.categories;
};

// Helper function to update financial metrics
const updateFinancialMetrics = (data: FinancialData, transaction: Transaction): void => {
  // Update total balance
  data.profile.balance += transaction.amount;
  
  // Get current month from transaction date
  const currentMonth = new Date().toLocaleString('default', { month: 'short' });
  const transactionMonth = transaction.date.split(' ')[0]; // e.g., "Apr"
  
  // Only update monthly income/expenses if transaction is from the current month
  if (transactionMonth === currentMonth) {
    if (transaction.amount > 0) {
      // Update income
      data.profile.monthlyIncome += transaction.amount;
      data.profile.incomeChange += transaction.amount;
    } else {
      // Update expenses (convert negative to positive for display)
      data.profile.monthlyExpenses += Math.abs(transaction.amount);
      data.profile.expensesChange -= Math.abs(transaction.amount);
    }
    
    // Recalculate savings
    data.profile.monthlySavings = data.profile.monthlyIncome - data.profile.monthlyExpenses;
  }
  
  // Update monthly change percentage
  data.profile.monthlyChange = ((data.profile.balance - (data.profile.balance - transaction.amount)) / 
                              (data.profile.balance - transaction.amount)) * 100 + data.profile.monthlyChange;
};

// Helper function to update budget data
const updateBudgetData = (data: FinancialData, transaction: Transaction): void => {
  // Only proceed if transaction is an expense
  if (transaction.amount >= 0) return;
  
  // Map transaction category to budget category
  const budgetCategory = 
    data.categories.categoryMappings[transaction.category] || transaction.category;
  
  // Find the corresponding budget item
  const budgetIndex = data.budgets.findIndex(item => item.category === budgetCategory);
  
  if (budgetIndex !== -1) {
    const budget = data.budgets[budgetIndex];
    const newSpent = budget.spent + Math.abs(transaction.amount);
    const newPercent = Math.round((newSpent / budget.budget) * 100);
    
    data.budgets[budgetIndex] = {
      ...budget,
      spent: newSpent,
      percent: newPercent
    };
  }
};

// Helper function to update goals data
const updateGoalsData = (data: FinancialData, transaction: Transaction): boolean => {
  // Check if the transaction category matches any goal name
  const goalIndex = data.goals.findIndex(goal => 
    goal.name.toLowerCase() === transaction.category.toLowerCase()
  );
  
  if (goalIndex === -1) return false;
  
  // Update the goal
  const goal = data.goals[goalIndex];
  
  const newSaved = goal.saved + transaction.amount;
  const newPercent = Math.round((newSaved / goal.target) * 100);
  
  data.goals[goalIndex] = {
    ...goal,
    saved: newSaved,
    percent: newPercent
  };
  
  // Return true if goal is complete or reached a milestone
  return newPercent >= 100 || (Math.floor(goal.percent / 25) < Math.floor(newPercent / 25));
};

// Helper function to update chart data
const updateChartData = (data: FinancialData, transaction: Transaction): void => {
  // Extract date parts from transaction
  const [month, day] = transaction.date.split(' ');
  const numericDay = parseInt(day);
  
  // Get current month and year
  const date = new Date();
  const currentMonth = date.toLocaleString('default', { month: 'short' });
  
  // Update "This Month" chart data
  if (month === currentMonth) {
    // Find which week the transaction belongs to
    for (let i = 0; i < data.chartData.thisMonth.length; i++) {
      const dataPoint = data.chartData.thisMonth[i];
      
      // Parse the date range (e.g., "Apr 1 - Apr 7")
      const rangeParts = dataPoint.name.split(' - ');
      if (rangeParts.length === 2) {
        const startDateParts = rangeParts[0].split(' ');
        const endDateParts = rangeParts[1].split(' ');
        
        // Extract the day numbers
        const startDay = parseInt(startDateParts[1]);
        const endDay = parseInt(endDateParts[1]);
        
        // Check if the transaction day falls within this range
        if (numericDay >= startDay && numericDay <= endDay) {
          if (transaction.amount > 0) {
            data.chartData.thisMonth[i].income += transaction.amount;
          } else {
            data.chartData.thisMonth[i].expenses += Math.abs(transaction.amount);
          }
          break;
        }
      }
    }
  }
  
  // Update "Last 3 Months" and "This Year" chart data
  const updateMonthlyChart = (chartArray: ChartDataPoint[]): void => {
    for (let i = 0; i < chartArray.length; i++) {
      if (chartArray[i].name === month) {
        if (transaction.amount > 0) {
          chartArray[i].income += transaction.amount;
        } else {
          chartArray[i].expenses += Math.abs(transaction.amount);
        }
        break;
      }
    }
  };
  
  updateMonthlyChart(data.chartData.last3Months);
  updateMonthlyChart(data.chartData.thisYear);
};

// Generate chart data for different time periods (moved from component to service)
export const generateChartData = (period: string): ChartDataPoint[] => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();
  
  // Format a date to display in the chart
  const formatDateRange = (startDay: number, endDay: number, month: number, year: number): string => {
    const startDate = new Date(year, month, startDay);
    const endDate = new Date(year, month, endDay);
    const startFormatted = startDate.toLocaleString('default', { month: 'short', day: 'numeric' });
    const endFormatted = endDate.toLocaleString('default', { month: 'short', day: 'numeric' });
    return `${startFormatted} - ${endFormatted}`;
  };
  
  // This Month - show weekly date ranges
  if (period === 'This Month') {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const result: ChartDataPoint[] = [];
    
    // Create weekly ranges (e.g., "Apr 1 - Apr 7")
    let startDay = 1;
    while (startDay <= daysInMonth) {
      const endDay = Math.min(startDay + 6, daysInMonth);
      const dateRange = formatDateRange(startDay, endDay, currentMonth, currentYear);
      
      // Generate realistic data - higher values for weeks we've already passed
      const isPastWeek = endDay < currentDay;
      
      result.push({
        name: dateRange,
        income: isPastWeek ? Math.floor(Math.random() * 1500) + 500 : 0,
        expenses: isPastWeek ? Math.floor(Math.random() * 1200) + 300 : 0
      });
      
      startDay = endDay + 1;
    }
    return result;
  }
  
  // Last 3 Months
  else if (period === 'Last 3 Months') {
    const result: ChartDataPoint[] = [];
    for (let i = 2; i >= 0; i--) {
      const monthDate = new Date(currentYear, currentMonth - i, 1);
      const monthName = monthDate.toLocaleString('default', { month: 'short' });
      result.push({
        name: monthName,
        income: Math.floor(Math.random() * 4000) + 2000,
        expenses: Math.floor(Math.random() * 3500) + 1500
      });
    }
    return result;
  }
  
  // This Year
  else {
    const result: ChartDataPoint[] = [];
    for (let i = 0; i <= currentMonth; i++) {
      const monthDate = new Date(currentYear, i, 1);
      const monthName = monthDate.toLocaleString('default', { month: 'short' });
      result.push({
        name: monthName,
        income: Math.floor(Math.random() * 4000) + 2000,
        expenses: Math.floor(Math.random() * 3500) + 1500
      });
    }
    return result;
  }
};