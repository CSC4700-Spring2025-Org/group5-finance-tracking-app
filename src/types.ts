// Define interfaces for type safety
export interface Transaction {
    id: number;
    date: string;
    payee: string;
    category: string;
    amount: number;
    customCategory?: string;
  }
  
  export interface BudgetItem {
    category: string;
    spent: number;
    budget: number;
    percent: number;
  }
  
  export interface Goal {
    name: string;
    saved: number;
    target: number;
    percent: number;
  }
  
  export interface ChartDataPoint {
    name: string;
    income: number;
    expenses: number;
  }
  
  export interface TransactionCategory {
    id: string;
    name: string;
  }
  
  // Define interfaces for JSON structure
  export interface ProfileData {
    balance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlySavings: number;
    monthlyChange: number;
    incomeChange: number;
    expensesChange: number;
  }
  
  export interface CategoriesData {
    budgetCategories: TransactionCategory[];
    expenseCategories: TransactionCategory[];
    incomeCategories: TransactionCategory[];
    categoryMappings: { [key: string]: string };
  }
  
  export interface ChartData {
    thisMonth: ChartDataPoint[];
    last3Months: ChartDataPoint[];
    thisYear: ChartDataPoint[];
  }
  
  export interface InsightData {
    type: string;
    title: string;
    message: string;
  }
  
  export interface FinancialData {
    profile: ProfileData;
    transactions: Transaction[];
    budgets: BudgetItem[];
    goals: Goal[];
    categories: CategoriesData;
    chartData: ChartData;
    insights: InsightData[];
  }