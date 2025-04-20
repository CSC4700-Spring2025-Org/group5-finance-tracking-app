import * as dataService from './dataService';
import * as fileService from './fileService';

/**
 * Initializes the application, ensuring all required data and services are ready
 */
export const initializeApp = async (): Promise<void> => {
  try {
    console.log('Initializing application...');
    
    // Initialize data service
    await dataService.initialize();
    
    // Pre-load data to cache
    await dataService.loadData();
    
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    throw error;
  }
};

/**
 * Exports the application data as a JSON file
 * Returns a URL that can be used to download the file
 */
export const exportAppData = async (): Promise<string> => {
  try {
    const data = await dataService.loadData();
    return await fileService.exportDataAsJSON(data);
  } catch (error) {
    console.error('Failed to export application data:', error);
    throw error;
  }
};

/**
 * Imports application data from a JSON file
 */
export const importAppData = async (file: File): Promise<void> => {
  try {
    const data = await fileService.importDataFromJSON(file);
    await dataService.saveData(data);
  } catch (error) {
    console.error('Failed to import application data:', error);
    throw error;
  }
};

/**
 * Resets the application data to defaults
 */
export const resetAppData = async (): Promise<void> => {
  try {
    // Load data first to ensure service is initialized
    await dataService.loadData();
    
    // Use the default data directly from the data service
    const defaultData = {
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
    
    // Save default data
    await dataService.saveData(defaultData);
    
    console.log('Application data reset to defaults');
  } catch (error) {
    console.error('Failed to reset application data:', error);
    throw error;
  }
};