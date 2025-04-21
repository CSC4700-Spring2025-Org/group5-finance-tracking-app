import { FinancialData } from './types';
import * as fileService from './fileService';

// Define interfaces for the financial statements data
export interface AssetItem {
  id: string;
  name: string;
  amount: number;
  type: 'asset';
}

export interface LiabilityItem {
  id: string;
  name: string;
  amount: number;
  type: 'liability';
}

export type BalanceSheetItem = AssetItem | LiabilityItem;

export interface BalanceSheetData {
  assets: AssetItem[];
  liabilities: LiabilityItem[];
  date: string;
}

export interface RevenueItem {
  id: string;
  name: string;
  amount: number;
  category: string;
}

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  category: string;
}

export interface IncomeStatementData {
  revenues: RevenueItem[];
  expenses: ExpenseItem[];
  startDate: string;
  endDate: string;
}

export interface CashFlowItem {
  id: string;
  name: string;
  amount: number;
  category: 'operating' | 'investing' | 'financing';
}

export interface CashFlowStatementData {
  items: CashFlowItem[];
  startDate: string;
  endDate: string;
  startingBalance: number;
  endingBalance: number;
}

// Default data for financial statements
const defaultBalanceSheet: BalanceSheetData = {
  assets: [
    { id: '1', name: 'Cash', amount: 15000, type: 'asset' },
    { id: '2', name: 'Checking Account', amount: 5800, type: 'asset' },
    { id: '3', name: 'Savings Account', amount: 12000, type: 'asset' },
    { id: '4', name: 'Investments', amount: 28500, type: 'asset' },
    { id: '5', name: 'Vehicle', amount: 18000, type: 'asset' }
  ],
  liabilities: [
    { id: '6', name: 'Credit Card', amount: 2500, type: 'liability' },
    { id: '7', name: 'Student Loan', amount: 18000, type: 'liability' },
    { id: '8', name: 'Car Loan', amount: 12000, type: 'liability' }
  ],
  date: new Date().toISOString().split('T')[0]
};

const defaultIncomeStatement: IncomeStatementData = {
  revenues: [
    { id: '1', name: 'Primary Job Salary', amount: 4500, category: 'Salary' },
    { id: '2', name: 'Freelance Work', amount: 1200, category: 'Freelance' },
    { id: '3', name: 'Dividend Income', amount: 350, category: 'Investments' },
    { id: '4', name: 'Interest', amount: 80, category: 'Investments' }
  ],
  expenses: [
    { id: '5', name: 'Rent', amount: 1800, category: 'Housing' },
    { id: '6', name: 'Groceries', amount: 650, category: 'Food' },
    { id: '7', name: 'Dining Out', amount: 350, category: 'Food' },
    { id: '8', name: 'Gas', amount: 180, category: 'Transportation' },
    { id: '9', name: 'Car Insurance', amount: 120, category: 'Insurance' },
    { id: '10', name: 'Health Insurance', amount: 250, category: 'Insurance' },
    { id: '11', name: 'Internet', amount: 80, category: 'Utilities' },
    { id: '12', name: 'Cell Phone', amount: 90, category: 'Utilities' },
    { id: '13', name: 'Gym Membership', amount: 50, category: 'Entertainment' },
    { id: '14', name: 'Streaming Services', amount: 35, category: 'Entertainment' }
  ],
  startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
};

const defaultCashFlowStatement: CashFlowStatementData = {
  items: [
    { id: '1', name: 'Salary Received', amount: 4500, category: 'operating' },
    { id: '2', name: 'Freelance Income', amount: 1200, category: 'operating' },
    { id: '3', name: 'Rent Paid', amount: -1800, category: 'operating' },
    { id: '4', name: 'Utilities Paid', amount: -320, category: 'operating' },
    { id: '5', name: 'Groceries & Food', amount: -1000, category: 'operating' },
    { id: '6', name: 'Transportation Costs', amount: -300, category: 'operating' },
    { id: '7', name: 'Purchase of Laptop', amount: -1200, category: 'investing' },
    { id: '8', name: 'Investment in Stocks', amount: -2000, category: 'investing' },
    { id: '9', name: 'Student Loan Payment', amount: -400, category: 'financing' },
    { id: '10', name: 'Credit Card Payment', amount: -500, category: 'financing' }
  ],
  startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
  startingBalance: 8000,
  endingBalance: 6180 // Starting balance plus sum of all cash flows
};

// Storage keys for localStorage
const BALANCE_SHEET_KEY = 'fintrack_balance_sheet';
const INCOME_STATEMENT_KEY = 'fintrack_income_statement';
const CASH_FLOW_STATEMENT_KEY = 'fintrack_cash_flow_statement';

// Balance Sheet API
export const getBalanceSheet = async (): Promise<BalanceSheetData> => {
  try {
    // Try to get from localStorage
    const data = localStorage.getItem(BALANCE_SHEET_KEY);
    if (data) {
      return JSON.parse(data);
    }
    
    // If not found, use default data and save it
    localStorage.setItem(BALANCE_SHEET_KEY, JSON.stringify(defaultBalanceSheet));
    return defaultBalanceSheet;
  } catch (error) {
    console.error('Error loading balance sheet data:', error);
    return defaultBalanceSheet;
  }
};

export const saveBalanceSheet = async (data: BalanceSheetData): Promise<void> => {
  try {
    localStorage.setItem(BALANCE_SHEET_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving balance sheet data:', error);
    throw error;
  }
};

export const updateBalanceSheetDate = async (date: string): Promise<BalanceSheetData> => {
  try {
    const balanceSheet = await getBalanceSheet();
    balanceSheet.date = date;
    await saveBalanceSheet(balanceSheet);
    return balanceSheet;
  } catch (error) {
    console.error('Error updating balance sheet date:', error);
    throw error;
  }
};

export const addBalanceSheetItem = async (item: BalanceSheetItem): Promise<BalanceSheetData> => {
  try {
    const balanceSheet = await getBalanceSheet();
    
    if (item.type === 'asset') {
      balanceSheet.assets.push(item as AssetItem);
    } else {
      balanceSheet.liabilities.push(item as LiabilityItem);
    }
    
    await saveBalanceSheet(balanceSheet);
    return balanceSheet;
  } catch (error) {
    console.error('Error adding balance sheet item:', error);
    throw error;
  }
};

export const updateBalanceSheetItem = async (
  item: BalanceSheetItem
): Promise<BalanceSheetData> => {
  try {
    const balanceSheet = await getBalanceSheet();
    
    if (item.type === 'asset') {
      const index = balanceSheet.assets.findIndex(a => a.id === item.id);
      if (index !== -1) {
        balanceSheet.assets[index] = item as AssetItem;
      }
    } else {
      const index = balanceSheet.liabilities.findIndex(l => l.id === item.id);
      if (index !== -1) {
        balanceSheet.liabilities[index] = item as LiabilityItem;
      }
    }
    
    await saveBalanceSheet(balanceSheet);
    return balanceSheet;
  } catch (error) {
    console.error('Error updating balance sheet item:', error);
    throw error;
  }
};

export const deleteBalanceSheetItem = async (id: string, type: 'asset' | 'liability'): Promise<BalanceSheetData> => {
  try {
    const balanceSheet = await getBalanceSheet();
    
    if (type === 'asset') {
      balanceSheet.assets = balanceSheet.assets.filter(item => item.id !== id);
    } else {
      balanceSheet.liabilities = balanceSheet.liabilities.filter(item => item.id !== id);
    }
    
    await saveBalanceSheet(balanceSheet);
    return balanceSheet;
  } catch (error) {
    console.error('Error deleting balance sheet item:', error);
    throw error;
  }
};

// Income Statement API
export const getIncomeStatement = async (startDate: string, endDate: string): Promise<IncomeStatementData> => {
  try {
    // Try to get from localStorage
    const data = localStorage.getItem(INCOME_STATEMENT_KEY);
    if (data) {
      const storedData = JSON.parse(data) as IncomeStatementData;
      
      // Update dates if different
      if (storedData.startDate !== startDate || storedData.endDate !== endDate) {
        storedData.startDate = startDate;
        storedData.endDate = endDate;
        localStorage.setItem(INCOME_STATEMENT_KEY, JSON.stringify(storedData));
      }
      
      return storedData;
    }
    
    // If not found, use default data and save it
    const newData = {
      ...defaultIncomeStatement,
      startDate,
      endDate
    };
    
    localStorage.setItem(INCOME_STATEMENT_KEY, JSON.stringify(newData));
    return newData;
  } catch (error) {
    console.error('Error loading income statement data:', error);
    return {
      ...defaultIncomeStatement,
      startDate,
      endDate
    };
  }
};

export const saveIncomeStatement = async (data: IncomeStatementData): Promise<void> => {
  try {
    localStorage.setItem(INCOME_STATEMENT_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving income statement data:', error);
    throw error;
  }
};

export const addIncomeStatementItem = async (
  item: RevenueItem | ExpenseItem,
  type: 'revenue' | 'expense',
  startDate: string,
  endDate: string
): Promise<IncomeStatementData> => {
  try {
    const incomeStatement = await getIncomeStatement(startDate, endDate);
    
    if (type === 'revenue') {
      incomeStatement.revenues.push(item as RevenueItem);
    } else {
      incomeStatement.expenses.push(item as ExpenseItem);
    }
    
    await saveIncomeStatement(incomeStatement);
    return incomeStatement;
  } catch (error) {
    console.error('Error adding income statement item:', error);
    throw error;
  }
};

export const updateIncomeStatementItem = async (
  item: RevenueItem | ExpenseItem,
  type: 'revenue' | 'expense',
  startDate: string,
  endDate: string
): Promise<IncomeStatementData> => {
  try {
    const incomeStatement = await getIncomeStatement(startDate, endDate);
    
    if (type === 'revenue') {
      const index = incomeStatement.revenues.findIndex(r => r.id === item.id);
      if (index !== -1) {
        incomeStatement.revenues[index] = item as RevenueItem;
      }
    } else {
      const index = incomeStatement.expenses.findIndex(e => e.id === item.id);
      if (index !== -1) {
        incomeStatement.expenses[index] = item as ExpenseItem;
      }
    }
    
    await saveIncomeStatement(incomeStatement);
    return incomeStatement;
  } catch (error) {
    console.error('Error updating income statement item:', error);
    throw error;
  }
};

export const deleteIncomeStatementItem = async (
  id: string,
  type: 'revenue' | 'expense',
  startDate: string,
  endDate: string
): Promise<IncomeStatementData> => {
  try {
    const incomeStatement = await getIncomeStatement(startDate, endDate);
    
    if (type === 'revenue') {
      incomeStatement.revenues = incomeStatement.revenues.filter(item => item.id !== id);
    } else {
      incomeStatement.expenses = incomeStatement.expenses.filter(item => item.id !== id);
    }
    
    await saveIncomeStatement(incomeStatement);
    return incomeStatement;
  } catch (error) {
    console.error('Error deleting income statement item:', error);
    throw error;
  }
};

// Cash Flow Statement API
export const getCashFlowStatement = async (startDate: string, endDate: string): Promise<CashFlowStatementData> => {
  try {
    // Try to get from localStorage
    const data = localStorage.getItem(CASH_FLOW_STATEMENT_KEY);
    if (data) {
      const storedData = JSON.parse(data) as CashFlowStatementData;
      
      // Update dates if different
      if (storedData.startDate !== startDate || storedData.endDate !== endDate) {
        storedData.startDate = startDate;
        storedData.endDate = endDate;
        localStorage.setItem(CASH_FLOW_STATEMENT_KEY, JSON.stringify(storedData));
      }
      
      return storedData;
    }
    
    // If not found, use default data and save it
    const newData = {
      ...defaultCashFlowStatement,
      startDate,
      endDate
    };
    
    localStorage.setItem(CASH_FLOW_STATEMENT_KEY, JSON.stringify(newData));
    return newData;
  } catch (error) {
    console.error('Error loading cash flow statement data:', error);
    return {
      ...defaultCashFlowStatement,
      startDate,
      endDate
    };
  }
};

export const saveCashFlowStatement = async (data: CashFlowStatementData): Promise<void> => {
  try {
    localStorage.setItem(CASH_FLOW_STATEMENT_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving cash flow statement data:', error);
    throw error;
  }
};

export const updateCashFlowStartingBalance = async (
  startingBalance: number,
  startDate: string,
  endDate: string
): Promise<CashFlowStatementData> => {
  try {
    const cashFlowStatement = await getCashFlowStatement(startDate, endDate);
    
    cashFlowStatement.startingBalance = startingBalance;
    
    // Recalculate ending balance
    const netCashFlow = cashFlowStatement.items.reduce((sum, item) => sum + item.amount, 0);
    cashFlowStatement.endingBalance = startingBalance + netCashFlow;
    
    await saveCashFlowStatement(cashFlowStatement);
    return cashFlowStatement;
  } catch (error) {
    console.error('Error updating cash flow starting balance:', error);
    throw error;
  }
};

export const addCashFlowItem = async (
  item: CashFlowItem,
  startDate: string,
  endDate: string
): Promise<CashFlowStatementData> => {
  try {
    const cashFlowStatement = await getCashFlowStatement(startDate, endDate);
    
    // Add the new item
    cashFlowStatement.items.push(item);
    
    // Recalculate ending balance
    const netCashFlow = cashFlowStatement.items.reduce((sum, item) => sum + item.amount, 0);
    cashFlowStatement.endingBalance = cashFlowStatement.startingBalance + netCashFlow;
    
    await saveCashFlowStatement(cashFlowStatement);
    return cashFlowStatement;
  } catch (error) {
    console.error('Error adding cash flow item:', error);
    throw error;
  }
};

export const updateCashFlowItem = async (
  item: CashFlowItem,
  startDate: string,
  endDate: string
): Promise<CashFlowStatementData> => {
  try {
    const cashFlowStatement = await getCashFlowStatement(startDate, endDate);
    
    // Update the item
    const index = cashFlowStatement.items.findIndex(i => i.id === item.id);
    if (index !== -1) {
      cashFlowStatement.items[index] = item;
    }
    
    // Recalculate ending balance
    const netCashFlow = cashFlowStatement.items.reduce((sum, item) => sum + item.amount, 0);
    cashFlowStatement.endingBalance = cashFlowStatement.startingBalance + netCashFlow;
    
    await saveCashFlowStatement(cashFlowStatement);
    return cashFlowStatement;
  } catch (error) {
    console.error('Error updating cash flow item:', error);
    throw error;
  }
};

export const deleteCashFlowItem = async (
  id: string,
  startDate: string,
  endDate: string
): Promise<CashFlowStatementData> => {
  try {
    const cashFlowStatement = await getCashFlowStatement(startDate, endDate);
    
    // Remove the item
    cashFlowStatement.items = cashFlowStatement.items.filter(item => item.id !== id);
    
    // Recalculate ending balance
    const netCashFlow = cashFlowStatement.items.reduce((sum, item) => sum + item.amount, 0);
    cashFlowStatement.endingBalance = cashFlowStatement.startingBalance + netCashFlow;
    
    await saveCashFlowStatement(cashFlowStatement);
    return cashFlowStatement;
  } catch (error) {
    console.error('Error deleting cash flow item:', error);
    throw error;
  }
};