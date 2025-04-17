import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bell, User, Plus, CreditCard, ArrowUpDown, Receipt, DollarSign, PieChart, Calendar, Settings, TrendingUp, Home, ChevronDown, FileText } from 'lucide-react';
import AddTransactionModal from './AddTransactionModal';

// Define interfaces for type safety
interface Transaction {
  id: number;
  date: string;
  payee: string;
  category: string;
  amount: number;
  customCategory?: string;
}

interface BudgetItem {
  category: string;
  spent: number;
  budget: number;
  percent: number;
}

interface Goal {
  name: string;
  saved: number;
  target: number;
  percent: number;
}

interface ChartDataPoint {
  name: string;
  income: number;
  expenses: number;
}

// Initial sample data
const initialTransactionData: Transaction[] = [
  { id: 1, date: 'Apr 15', payee: 'Grocery Store', category: 'Food', amount: -78.52 },
  { id: 2, date: 'Apr 14', payee: 'Direct Deposit', category: 'Income', amount: 1250.00 },
  { id: 3, date: 'Apr 13', payee: 'Coffee Shop', category: 'Dining', amount: -4.75 },
  { id: 4, date: 'Apr 12', payee: 'Gas Station', category: 'Transport', amount: -45.80 },
  { id: 5, date: 'Apr 10', payee: 'Utility Bill', category: 'Bills', amount: -120.35 },
];

const initialChartData: ChartDataPoint[] = [
  { name: 'Jan', income: 4000, expenses: 2400 },
  { name: 'Feb', income: 3000, expenses: 1398 },
  { name: 'Mar', income: 2000, expenses: 3800 },
  { name: 'Apr', income: 2780, expenses: 3908 },
  { name: 'May', income: 4890, expenses: 2800 },
  { name: 'Jun', income: 3390, expenses: 2300 },
];

const initialBudgetData: BudgetItem[] = [
  { category: 'Food & Dining', spent: 450, budget: 600, percent: 75 },
  { category: 'Transportation', spent: 250, budget: 300, percent: 83 },
  { category: 'Entertainment', spent: 180, budget: 200, percent: 90 },
  { category: 'Shopping', spent: 120, budget: 300, percent: 40 },
];

const initialGoalsData: Goal[] = [
  { name: 'Vacation', saved: 2500, target: 5000, percent: 50 },
  { name: 'New Car', saved: 7500, target: 15000, percent: 50 },
];

// Category mapping for budget updates
const categoryToBudgetMapping: { [key: string]: string } = {
  'Food': 'Food & Dining',
  'Dining': 'Food & Dining',
  'Transport': 'Transportation',
  'Entertainment': 'Entertainment',
  'Shopping': 'Shopping',
};

const FinancialDashboard = () => {
  const navigate = useNavigate();
  const [chartType, setChartType] = useState('bar');
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for financial data
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactionData);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(initialChartData);
  const [budgetData, setBudgetData] = useState<BudgetItem[]>(initialBudgetData);
  const [goalsData, setGoalsData] = useState<Goal[]>(initialGoalsData);
  
  // Financial metrics state
  const [totalBalance, setTotalBalance] = useState(16420.65);
  const [monthlyIncome, setMonthlyIncome] = useState(4250.00);
  const [monthlyExpenses, setMonthlyExpenses] = useState(2845.17);
  const [monthlySavings, setMonthlySavings] = useState(1404.83);
  
  // Get current month name
  const currentMonth = new Date().toLocaleString('default', { month: 'short' });
  
  const getBudgetColor = (percent: number) => {
    if (percent > 90) return 'text-red-500';
    if (percent > 75) return 'text-yellow-500';
    return 'text-green-500';
  };

  const toggleReportsDropdown = () => {
    setReportsDropdownOpen(!reportsDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (reportsDropdownOpen) {
        setReportsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [reportsDropdownOpen]);

  // Function to handle adding a new transaction
  const handleAddTransaction = (newTransaction: Transaction) => {
    // Add the transaction to the list
    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    
    // Update financial metrics
    updateFinancialMetrics(newTransaction);
    
    // Update chart data
    updateChartData(newTransaction);
    
    // Update budget data if it's an expense
    if (newTransaction.amount < 0) {
      updateBudgetData(newTransaction);
    }
  };
  
  // Helper function to update financial metrics
  const updateFinancialMetrics = (transaction: Transaction) => {
    // Update total balance
    setTotalBalance(prevBalance => prevBalance + transaction.amount);
    
    // Get current month from transaction date
    const transactionMonth = transaction.date.split(' ')[0]; // e.g., "Apr"
    
    // Only update monthly income/expenses if transaction is from the current month
    if (transactionMonth === currentMonth) {
      if (transaction.amount > 0) {
        // Update income
        setMonthlyIncome(prevIncome => prevIncome + transaction.amount);
      } else {
        // Update expenses (convert negative to positive for display)
        setMonthlyExpenses(prevExpenses => prevExpenses + Math.abs(transaction.amount));
      }
      
      // Recalculate savings
      const newIncome = transaction.amount > 0 ? 
        monthlyIncome + transaction.amount : 
        monthlyIncome;
      
      const newExpenses = transaction.amount < 0 ? 
        monthlyExpenses + Math.abs(transaction.amount) : 
        monthlyExpenses;
        
      setMonthlySavings(newIncome - newExpenses);
    }
  };
  
  // Helper function to update chart data
  const updateChartData = (transaction: Transaction) => {
    // Get month from transaction date
    const transactionMonth = transaction.date.split(' ')[0]; // e.g., "Apr"
    
    // Find the corresponding month in chart data
    const updatedChartData = chartData.map(dataPoint => {
      if (dataPoint.name === transactionMonth) {
        // Update income or expenses based on transaction type
        if (transaction.amount > 0) {
          return {
            ...dataPoint,
            income: dataPoint.income + transaction.amount
          };
        } else {
          return {
            ...dataPoint,
            expenses: dataPoint.expenses + Math.abs(transaction.amount)
          };
        }
      }
      return dataPoint;
    });
    
    setChartData(updatedChartData);
  };
  
  // Helper function to update budget data
  const updateBudgetData = (transaction: Transaction) => {
    // Only proceed if transaction is an expense
    if (transaction.amount >= 0) return;
    
    // Map transaction category to budget category
    const budgetCategory = categoryToBudgetMapping[transaction.category] || transaction.category;
    
    // Find the corresponding budget item
    const updatedBudgetData = budgetData.map(item => {
      if (item.category === budgetCategory) {
        const newSpent = item.spent + Math.abs(transaction.amount);
        const newPercent = Math.round((newSpent / item.budget) * 100);
        
        return {
          ...item,
          spent: newSpent,
          percent: newPercent
        };
      }
      return item;
    });
    
    setBudgetData(updatedBudgetData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <DollarSign className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-semibold text-blue-600">FinTrack</span>
          </div>
          
          <div className="hidden md:flex space-x-6">
            <a href="#" className="flex items-center text-blue-600 font-medium">
              <Home className="h-5 w-5 mr-1" />
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center text-gray-600 hover:text-blue-600">
              <CreditCard className="h-5 w-5 mr-1" />
              <span>Transactions</span>
            </a>
            <a href="#" className="flex items-center text-gray-600 hover:text-blue-600">
              <PieChart className="h-5 w-5 mr-1" />
              <span>Budget</span>
            </a>
            <a href="#" className="flex items-center text-gray-600 hover:text-blue-600">
              <TrendingUp className="h-5 w-5 mr-1" />
              <span>Goals</span>
            </a>
            
            {/* Reports Dropdown */}
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleReportsDropdown();
                }}
                className="flex items-center text-gray-600 hover:text-blue-600"
              >
                <Calendar className="h-5 w-5 mr-1" />
                <span>Reports</span>
                <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${reportsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {reportsDropdownOpen && (
                <div 
                  className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg py-2 w-64 z-10 border border-gray-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    onClick={() => navigate('/reports/income-statement')}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 w-full text-left"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Income Statement
                  </button>
                  <button 
                    onClick={() => navigate('/accounting/balance-sheet')}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 w-full text-left"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Balance Sheet
                  </button>
                  <button 
                    onClick={() => navigate('/reports/cash-flows')}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 w-full text-left"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Statement of Cash Flows
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-1.5 rounded-full text-gray-600 hover:bg-gray-100">
              <Bell className="h-5 w-5" />
            </button>
            <button className="p-1.5 rounded-full text-gray-600 hover:bg-gray-100">
              <Settings className="h-5 w-5" />
            </button>
            <button className="flex items-center space-x-2 p-1.5 rounded-full text-gray-600 hover:bg-gray-100">
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col">
            <span className="text-sm text-gray-500 mb-1">Total Balance</span>
            <span className="text-3xl font-bold text-gray-800">${totalBalance.toFixed(2)}</span>
            <span className="mt-2 text-sm text-green-500 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" /> +2.4% this month
            </span>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 flex flex-col">
            <span className="text-sm text-gray-500 mb-1">Income ({currentMonth})</span>
            <span className="text-2xl font-bold text-gray-800">${monthlyIncome.toFixed(2)}</span>
            <span className="mt-2 text-sm text-gray-500">+$1,250 from last month</span>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 flex flex-col">
            <span className="text-sm text-gray-500 mb-1">Expenses ({currentMonth})</span>
            <span className="text-2xl font-bold text-gray-800">${monthlyExpenses.toFixed(2)}</span>
            <span className="mt-2 text-sm text-green-500">-$320 from last month</span>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 flex flex-col">
            <span className="text-sm text-gray-500 mb-1">Savings</span>
            <span className="text-2xl font-bold text-gray-800">${monthlySavings.toFixed(2)}</span>
            <span className="mt-2 text-sm text-green-500">{Math.round((monthlySavings / monthlyIncome) * 100)}% of income</span>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button 
            className="flex items-center rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-medium"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Transaction
          </button>
          <button className="flex items-center rounded-md bg-white border border-gray-300 text-gray-700 px-4 py-2 text-sm font-medium">
            <CreditCard className="h-4 w-4 mr-2" /> Pay Bill
          </button>
          <button className="flex items-center rounded-md bg-white border border-gray-300 text-gray-700 px-4 py-2 text-sm font-medium">
            <ArrowUpDown className="h-4 w-4 mr-2" /> Transfer Money
          </button>
          <button className="flex items-center rounded-md bg-white border border-gray-300 text-gray-700 px-4 py-2 text-sm font-medium">
            <Receipt className="h-4 w-4 mr-2" /> Scan Receipt
          </button>
        </div>
        
        {/* Chart and Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Financial History</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setChartType('bar')}
                  className={`px-3 py-1 text-sm rounded-md ${chartType === 'bar' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                >
                  Bar
                </button>
                <button 
                  onClick={() => setChartType('line')}
                  className={`px-3 py-1 text-sm rounded-md ${chartType === 'line' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                >
                  Line
                </button>
                <select className="text-sm border rounded-md px-2 py-1 bg-white text-gray-600">
                  <option>This Month</option>
                  <option>Last 3 Months</option>
                  <option>This Year</option>
                  <option>Custom</option>
                </select>
              </div>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="income" fill="#4F46E5" name="Income" />
                    <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                  </BarChart>
                ) : (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="income" stroke="#4F46E5" name="Income" />
                    <Line type="monotone" dataKey="expenses" stroke="#EF4444" name="Expenses" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
              <a href="#" className="text-sm text-blue-600 hover:underline">View All</a>
            </div>
            
            <div className="space-y-4">
              {transactions.slice(0, 5).map(transaction => (
                <div key={transaction.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-md transition-colors">
                  <div className="flex items-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${transaction.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {transaction.amount > 0 ? <TrendingUp className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-800">{transaction.payee}</p>
                      <p className="text-xs text-gray-500">{transaction.date} · {transaction.category}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Budget and Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Budget Status */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Budget Status</h2>
              <a href="#" className="text-sm text-blue-600 hover:underline">Manage Budgets</a>
            </div>
            
            <div className="space-y-4">
              {budgetData.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-800">{item.category}</span>
                    <span className="text-sm font-medium">
                      ${item.spent} <span className="text-gray-500">/ ${item.budget}</span>
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${getBudgetColor(item.percent)}`}
                      style={{ width: `${item.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Savings Goals */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Savings Goals</h2>
              <a href="#" className="text-sm text-blue-600 hover:underline">Add Goal</a>
            </div>
            
            <div className="space-y-6">
              {goalsData.map((goal, index) => (
                <div key={index} className="flex items-center">
                  <div className="relative h-16 w-16">
                    <svg className="h-16 w-16" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="3"
                        strokeDasharray="100, 100"
                      />
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#4F46E5"
                        strokeWidth="3"
                        strokeDasharray={`${goal.percent}, 100`}
                      />
                    </svg>
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                      <span className="text-sm font-medium">{goal.percent}%</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-800">{goal.name}</p>
                    <p className="text-xs text-gray-500">${goal.saved} of ${goal.target}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Financial Insights */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Financial Insights</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Spending Pattern</h3>
              <p className="text-sm text-blue-700">Your restaurant spending has increased by 15% compared to last month.</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <h3 className="text-sm font-medium text-green-800 mb-2">Saving Opportunity</h3>
              <p className="text-sm text-green-700">You could save $85/month by reducing subscription services.</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <h3 className="text-sm font-medium text-purple-800 mb-2">Upcoming Bills</h3>
              <p className="text-sm text-purple-700">Your internet bill ($65) is due in 3 days.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Add Transaction Modal */}
      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddTransaction={handleAddTransaction} 
      />
    </div>
  );
};

export default FinancialDashboard;