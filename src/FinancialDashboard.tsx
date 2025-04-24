import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bell, Sun, Moon, User, Plus, CreditCard, ArrowUpDown, Receipt, DollarSign, PieChart, Calendar, Settings, TrendingUp, Home, ChevronDown, FileText, RefreshCw } from 'lucide-react';
import AddTransactionModal from './AddTransactionModal';
import { Transaction, BudgetItem, Goal, ChartDataPoint, FinancialData, ProfileData } from './types';
import * as dataService from './dataService';
import { resetAppData } from './initializeApp';
import { DarkModeContext } from './App';
import Header from './Header';
import PayBillModal from './PayBillModal';
import TransferMoneyModal from './TransferMoneyModal';
import ScanReceiptModal from './ScanReceiptModal';

// Custom tooltip component for charts
const CustomChartTooltip = (props: any) => {
  const { active, payload, label, darkMode } = props;
  
  if (!active || !payload || !payload.length) {
    return null;
  }
  
  return (
    <div 
      className={`custom-tooltip ${darkMode ? 'dark-mode-tooltip' : ''}`}
      style={{
        backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
        border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
        padding: '10px',
        borderRadius: '4px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
        color: darkMode ? '#F9FAFB' : '#111827'
      }}
    >
      <p className="label" style={{ 
        marginBottom: '5px',
        fontWeight: 500,
        fontSize: '14px',
        color: darkMode ? '#F9FAFB' : '#111827'
      }}>{label}</p>
      {payload.map((entry: any, index: any) => (
        <div key={index} style={{ 
          display: 'flex', 
          alignItems: 'center',
          fontSize: '12px',
          marginTop: '2px'
        }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            backgroundColor: entry.color,
            marginRight: '5px',
            borderRadius: '50%'
          }} />
          <span style={{ color: darkMode ? '#F9FAFB' : '#111827' }}>
            {entry.name}: ${entry.value.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
};

const FinancialDashboard = () => {
  const navigate = useNavigate();
  const [chartType, setChartType] = useState('bar');
  const [chartTimePeriod, setChartTimePeriod] = useState('This Month');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { darkMode, toggleDarkMode } = React.useContext(DarkModeContext);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [isPayBillModalOpen, setIsPayBillModalOpen] = useState(false);
  const [isTransferMoneyModalOpen, setIsTransferMoneyModalOpen] = useState(false);
  const [isScanReceiptModalOpen, setIsScanReceiptModalOpen] = useState(false);
  
  // State for financial data
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [budgetData, setBudgetData] = useState<BudgetItem[]>([]);
  const [goalsData, setGoalsData] = useState<Goal[]>([]);
  
  // Financial metrics state
  const [profile, setProfile] = useState<ProfileData>({
    balance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlySavings: 0,
    monthlyChange: 0,
    incomeChange: 0,
    expensesChange: 0
  });
  
  // Insights state
  const [insights, setInsights] = useState<any[]>([]);
  
  // Get current month name
  const currentMonth = new Date().toLocaleString('default', { month: 'short' });
  
  // Show confetti state
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiContainerRef = useRef<HTMLDivElement | null>(null);
  
  // Load data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setIsLoading(true);
        
        // Load all data from the service
        const data = await dataService.loadData();
        
        // Set state with loaded data
        setTransactions(data.transactions);
        setBudgetData(data.budgets);
        setGoalsData(data.goals);
        setProfile(data.profile);
        
        // Get insights with potential refresh from API
        const loadedInsights = await dataService.getInsights(false); // false means don't force refresh
        setInsights(loadedInsights);
        
        // Set chart data based on selected time period
        if (chartTimePeriod === 'This Month') {
          setChartData(data.chartData.thisMonth);
        } else if (chartTimePeriod === 'Last 3 Months') {
          setChartData(data.chartData.last3Months);
        } else {
          setChartData(data.chartData.thisYear);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };
    
    loadAllData();
  }, []);
  
  // Update chart data when time period changes
  useEffect(() => {
    const updateChartForPeriod = async () => {
      try {
        let periodKey: 'thisMonth' | 'last3Months' | 'thisYear';
        
        if (chartTimePeriod === 'This Month') {
          periodKey = 'thisMonth';
        } else if (chartTimePeriod === 'Last 3 Months') {
          periodKey = 'last3Months';
        } else {
          periodKey = 'thisYear';
        }
        
        const data = await dataService.getChartData(periodKey);
        setChartData(data);
      } catch (error) {
        console.error('Error updating chart data:', error);
      }
    };
    
    updateChartForPeriod();
  }, [chartTimePeriod]);

  // Add a function to handle refreshing insights:
  const handleRefreshInsights = async () => {
    setInsightsLoading(true);
    try {
      const updatedData = await dataService.refreshInsights();
      setInsights(updatedData.insights);
    } catch (error) {
      console.error('Error refreshing insights:', error);
    } finally {
      setInsightsLoading(false);
    }
  };
  
  // Function to create confetti animation
  const createConfetti = () => {
    const confettiContainer = confettiContainerRef.current;
    if (!confettiContainer) return;
    
    // Clear any existing confetti
    confettiContainer.innerHTML = '';
    
    const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];
    const particleCount = 150;
    
    for (let i = 0; i < particleCount; i++) {
      const confetti = document.createElement('div');
      
      // Set basic styles
      confetti.style.position = 'absolute';
      confetti.style.width = `${Math.random() * 10 + 5}px`;
      confetti.style.height = `${Math.random() * 10 + 5}px`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.opacity = '0.8';
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      
      // Set initial position
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.top = `${Math.random() * 30 - 20}%`;
      
      // Add to container
      confettiContainer.appendChild(confetti);
      
      // Animate with random parameters
      const duration = Math.random() * 3 + 2; // 2-5 seconds
      const xMovement = (Math.random() - 0.5) * 20; // Random left/right movement
      
      confetti.animate(
        [
          { 
            transform: `translate(0, 0) rotate(0deg)`,
            opacity: 0.8
          },
          { 
            transform: `translate(${xMovement}vw, 100vh) rotate(${Math.random() * 360}deg)`,
            opacity: 0
          }
        ],
        {
          duration: duration * 1000,
          easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)',
          fill: 'forwards'
        }
      );
      
      // Remove element after animation completes
      setTimeout(() => {
        if (confetti.parentNode === confettiContainer) {
          confettiContainer.removeChild(confetti);
        }
      }, duration * 1000);
    }
  };
  
  // Effect to trigger confetti animation when state changes
  useEffect(() => {
    if (showConfetti) {
      createConfetti();
      
      // Hide confetti state after animation
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);
  
  const getBudgetColor = (percent: number) => {
    if (percent > 90) return 'text-red-500';
    if (percent > 75) return 'text-yellow-500';
    return 'text-green-500';
  };

  // Handler function for resetting data
  const handleResetData = async () => {
    if (window.confirm('Are you sure you want to reset all data to defaults? This action cannot be undone.')) {
      try {
        // Show loading indicator
        setIsLoading(true);
        
        // Reset the app data
        await resetAppData();
        
        // Reload data to reflect changes
        const data = await dataService.loadData();
        
        // Update all state with the loaded data
        setTransactions(data.transactions);
        setBudgetData(data.budgets);
        setGoalsData(data.goals);
        setProfile(data.profile);
        setInsights(data.insights);
        
        // Update chart data based on selected time period
        if (chartTimePeriod === 'This Month') {
          setChartData(data.chartData.thisMonth);
        } else if (chartTimePeriod === 'Last 3 Months') {
          setChartData(data.chartData.last3Months);
        } else {
          setChartData(data.chartData.thisYear);
        }
        
        // Hide loading indicator
        setIsLoading(false);
        
        // Show success message
        alert('Data has been reset to defaults successfully.');
      } catch (error) {
        console.error('Error resetting data:', error);
        
        // Hide loading indicator
        setIsLoading(false);
        
        // Show error message
        alert('Failed to reset data. Please try again.');
      }
    }
  };

  // Function to handle adding a new transaction
  const handleAddTransaction = async (newTransaction: Transaction) => {
    try {
      // Use the data service to add the transaction and get updated data
      const updatedData = await dataService.addTransaction(newTransaction);
      
      // Update all state with the new data
      setTransactions(updatedData.transactions);
      setBudgetData(updatedData.budgets);
      setGoalsData(updatedData.goals);
      setProfile(updatedData.profile);
      
      // Update chart data based on selected time period
      if (chartTimePeriod === 'This Month') {
        setChartData(updatedData.chartData.thisMonth);
      } else if (chartTimePeriod === 'Last 3 Months') {
        setChartData(updatedData.chartData.last3Months);
      } else {
        setChartData(updatedData.chartData.thisYear);
      }
      
      // Check if transaction contributes to any savings goal
      const isGoalContribution = newTransaction.amount > 0 && 
        updatedData.goals.some(goal => goal.name === newTransaction.category);
      
      if (isGoalContribution) {
        setShowConfetti(true);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <DollarSign className="h-12 w-12 text-blue-600 mx-auto animate-pulse" />
          <h2 className="mt-4 text-xl font-semibold text-gray-700">Loading your financial data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Confetti container with ref */}
      <div 
        ref={confettiContainerRef}
        className="fixed inset-0 pointer-events-none z-50" 
        style={{ display: showConfetti ? 'block' : 'none' }}
      ></div>
      
      {/* Navigation Header */}
      <Header />
  
      <main className="container mx-auto px-4 py-6">
        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 flex flex-col`}>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Total Balance</span>
            <span className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>${profile.balance.toFixed(2)}</span>
            <span className="mt-2 text-sm text-green-500 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" /> +{profile.monthlyChange.toFixed(1)}% this month
            </span>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 flex flex-col`}>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Income ({currentMonth})</span>
            <span className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>${profile.monthlyIncome.toFixed(2)}</span>
            <span className="mt-2 text-sm text-green-500">+${profile.incomeChange.toFixed(2)} from last month</span>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 flex flex-col`}>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Expenses ({currentMonth})</span>
            <span className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>${profile.monthlyExpenses.toFixed(2)}</span>
            <span className="mt-2 text-sm text-green-500">${profile.expensesChange.toFixed(2)} from last month</span>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 flex flex-col`}>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Savings</span>
            <span className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>${profile.monthlySavings.toFixed(2)}</span>
            <span className="mt-2 text-sm text-green-500">{Math.round((profile.monthlySavings / profile.monthlyIncome) * 100)}% of income</span>
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
<button 
  className={`flex items-center rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-700'} border px-4 py-2 text-sm font-medium`}
  onClick={() => setIsPayBillModalOpen(true)}
>
  <CreditCard className="h-4 w-4 mr-2" /> Pay Bill
</button>
<button 
  className={`flex items-center rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-700'} border px-4 py-2 text-sm font-medium`}
  onClick={() => setIsTransferMoneyModalOpen(true)}
>
  <ArrowUpDown className="h-4 w-4 mr-2" /> Transfer Money
</button>
<button 
  className={`flex items-center rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-700'} border px-4 py-2 text-sm font-medium`}
  onClick={() => setIsScanReceiptModalOpen(true)}
>
  <Receipt className="h-4 w-4 mr-2" /> Scan Receipt
</button>
        </div>
        
        {/* Chart and Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Chart Section */}
          <div className={`lg:col-span-2 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Financial History</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setChartType('bar')}
                  className={`px-3 py-1 text-sm rounded-md ${chartType === 'bar' 
                    ? (darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600') 
                    : (darkMode ? 'text-gray-300' : 'text-gray-600')}`}
                >
                  Bar
                </button>
                <button 
                  onClick={() => setChartType('line')}
                  className={`px-3 py-1 text-sm rounded-md ${chartType === 'line' 
                    ? (darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600') 
                    : (darkMode ? 'text-gray-300' : 'text-gray-600')}`}
                >
                  Line
                </button>
                <select 
                  className={`text-sm border rounded-md px-2 py-1 ${darkMode 
                    ? 'bg-gray-700 text-gray-200 border-gray-600' 
                    : 'bg-white text-gray-600 border-gray-300'}`}
                  value={chartTimePeriod}
                  onChange={(e) => setChartTimePeriod(e.target.value)}
                >
                  <option>This Month</option>
                  <option>Last 3 Months</option>
                  <option>This Year</option>
                </select>
              </div>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                  <XAxis dataKey="name" tick={{ fill: darkMode ? "#9CA3AF" : "#4B5563" }} />
                  <YAxis tick={{ fill: darkMode ? "#9CA3AF" : "#4B5563" }} />
                  <Tooltip content={<CustomChartTooltip darkMode={darkMode} />} />
                  <Bar dataKey="income" fill="#4F46E5" name="Income" />
                  <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                </BarChart>
                ) : (
                  <LineChart data={chartData}>
  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
  <XAxis dataKey="name" tick={{ fill: darkMode ? "#9CA3AF" : "#4B5563" }} />
  <YAxis tick={{ fill: darkMode ? "#9CA3AF" : "#4B5563" }} />
  <Tooltip content={<CustomChartTooltip darkMode={darkMode} />} />
  <Line type="monotone" dataKey="income" stroke="#4F46E5" name="Income" />
  <Line type="monotone" dataKey="expenses" stroke="#EF4444" name="Expenses" />
</LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Recent Transactions */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Recent Transactions</h2>
              <a 
  onClick={() => navigate('/transactions')} 
  className={`text-sm cursor-pointer ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:underline'}`}
>
  View All
</a>
            </div>
            
            <div className="space-y-4">
              {transactions.slice(0, 5).map(transaction => (
                <div key={transaction.id} className={`flex justify-between items-center p-3 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} rounded-md transition-colors`}>
                  <div className="flex items-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      transaction.amount > 0 
                        ? (darkMode ? 'bg-green-900 text-green-400' : 'bg-green-100 text-green-600') 
                        : (darkMode ? 'bg-red-900 text-red-400' : 'bg-red-100 text-red-600')
                    }`}>
                      {transaction.amount > 0 ? <TrendingUp className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm ${darkMode ? 'text-gray-200' : ''}`}>{transaction.payee}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{transaction.date} · {transaction.category}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
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
          <div className={`lg:col-span-2 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Budget Status</h2>
              <a 
  onClick={() => navigate('/budget')} 
  className={`text-sm cursor-pointer ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:underline'}`}
>
  Manage Budgets
</a>
            </div>
            
            <div className="space-y-4">
              {budgetData.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{item.category}</span>
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : ''}`}>
                      ${item.spent} <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>/ ${item.budget}</span>
                    </span>
                  </div>
                  <div className={`h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                    <div 
                      className={`h-full rounded-full ${item.percent > 90 ? 'bg-red-500' : item.percent > 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${item.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Savings Goals */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Savings Goals</h2>
              <a 
    onClick={() => navigate('/goals')} 
    className={`text-sm cursor-pointer ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:underline'}`}
  >
    Add Goal
  </a>
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
                        stroke={darkMode ? "#4B5563" : "#E5E7EB"}
                        strokeWidth="3"
                        strokeDasharray="100, 100"
                      />
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={darkMode ? "#60A5FA" : "#4F46E5"}
                        strokeWidth="3"
                        strokeDasharray={`${goal.percent}, 100`}
                      />
                    </svg>
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : ''}`}>{goal.percent}%</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{goal.name}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>${goal.saved} of ${goal.target}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Financial Insights */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
  <div className="flex justify-between items-center mb-4">
    <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Financial Insights</h2>
    <button 
  onClick={handleRefreshInsights} 
  disabled={insightsLoading}
  className={`flex items-center rounded-md ${
    darkMode 
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
  } px-3 py-1 text-sm transition-colors`}
>
  <RefreshCw className={`h-3 w-3 mr-1 ${insightsLoading ? 'animate-spin' : ''}`} />
  {insightsLoading ? 'Refreshing...' : 'Refresh Insights'}
</button>
  </div>
  
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {insights.map((insight, index) => (
      <div 
        key={index} 
        className={`p-4 rounded-lg border ${
          insight.type === 'spending' 
            ? darkMode ? 'bg-blue-900 border-blue-800' : 'bg-blue-50 border-blue-100' 
            : insight.type === 'saving' 
              ? darkMode ? 'bg-green-900 border-green-800' : 'bg-green-50 border-green-100' 
              : darkMode ? 'bg-purple-900 border-purple-800' : 'bg-purple-50 border-purple-100'
        }`}
      >
        <h3 className={`text-sm font-medium mb-2 ${
          insight.type === 'spending' 
            ? darkMode ? 'text-blue-300' : 'text-blue-800' 
            : insight.type === 'saving' 
              ? darkMode ? 'text-green-300' : 'text-green-800' 
              : darkMode ? 'text-purple-300' : 'text-purple-800'
        }`}>
          {insight.title}
        </h3>
        <p className={`text-sm ${
          insight.type === 'spending' 
            ? darkMode ? 'text-blue-200' : 'text-blue-700' 
            : insight.type === 'saving' 
              ? darkMode ? 'text-green-200' : 'text-green-700' 
              : darkMode ? 'text-purple-200' : 'text-purple-700'
        }`}>
          {insightsLoading && index === 0 ? 'Analyzing your financial data...' : insight.message}
        </p>
      </div>
    ))}
  </div>
</div>

      </main>
  
      {/* Add Transaction Modal - Modified to support dark mode */}
      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddTransaction={handleAddTransaction}
        budgetData={budgetData}
        goalsData={goalsData}
        darkMode={darkMode}
      />
      {/* Pay Bill Modal */}
<PayBillModal
  isOpen={isPayBillModalOpen}
  onClose={() => setIsPayBillModalOpen(false)}
  darkMode={darkMode}
/>

{/* Transfer Money Modal */}
<TransferMoneyModal
  isOpen={isTransferMoneyModalOpen}
  onClose={() => setIsTransferMoneyModalOpen(false)}
  darkMode={darkMode}
/>

{/* Scan Receipt Modal */}
<ScanReceiptModal
  isOpen={isScanReceiptModalOpen}
  onClose={() => setIsScanReceiptModalOpen(false)}
  darkMode={darkMode}
/>
    </div>
  );

};

export default FinancialDashboard;