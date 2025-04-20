import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, PieChart, Plus, ArrowLeft, Edit2, Trash2, 
  AlertTriangle, CheckCircle, Home, CreditCard, TrendingUp
} from 'lucide-react';
import { BudgetItem, Transaction, CategoriesData } from './types';
import * as dataService from './dataService';
import { DarkModeContext } from './App';

const BudgetPage = () => {
  const navigate = useNavigate();
  const { darkMode } = useContext(DarkModeContext);
  const [isLoading, setIsLoading] = useState(true);
  const [budgetData, setBudgetData] = useState<BudgetItem[]>([]);
  const [categories, setCategories] = useState<CategoriesData | null>(null);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [editBudgetAmount, setEditBudgetAmount] = useState(0);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryBudget, setNewCategoryBudget] = useState<number>(0);
  const [totalBudgeted, setTotalBudgeted] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  // Calculate date range for the current month
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();
  
  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load budget data and categories
        const data = await dataService.loadData();
        setBudgetData(data.budgets);
        
        // Set categories
        setCategories(data.categories);
        
        setMonthlyIncome(data.profile.monthlyIncome);
        setRecentTransactions(data.transactions.slice(0, 10));
        
        // Calculate total budgeted amount
        const total = data.budgets.reduce((sum: number, item: BudgetItem) => sum + item.budget, 0);
        setTotalBudgeted(total);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading budget data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Handle budget update
  const handleUpdateBudget = async (categoryId: string) => {
    try {
      // Find the budget item
      const budgetItem = budgetData.find(item => item.category === categoryId);
      
      if (budgetItem) {
        // Create updated budget item
        const updatedBudget = {
          ...budgetItem,
          budget: editBudgetAmount
        };
        
        // Update the budget using the data service
        const updatedData = await dataService.updateBudget(updatedBudget);
        
        // Update state with the updated budgets
        setBudgetData(updatedData.budgets);
        
        // Calculate new total budgeted amount
        const total = updatedData.budgets.reduce((sum: number, item: BudgetItem) => sum + item.budget, 0);
        setTotalBudgeted(total);
        
        // Reset editing state
        setEditingBudgetId(null);
        setEditBudgetAmount(0);
      }
    } catch (error) {
      console.error('Error updating budget:', error);
      alert('Failed to update budget. Please try again.');
    }
  };

  // Handle adding a new budget category
  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || newCategoryBudget <= 0) {
      alert('Please enter a valid category name and budget amount.');
      return;
    }
    
    try {
      // Use the dataService to add a new budget category
      const updatedData = await dataService.addBudgetCategory(newCategoryName, newCategoryBudget);
      
      // Update state with new data
      setBudgetData(updatedData.budgets);
      setCategories(updatedData.categories);
      
      // Calculate new total budgeted amount
      const total = updatedData.budgets.reduce((sum: number, item: BudgetItem) => sum + item.budget, 0);
      setTotalBudgeted(total);
      
      // Reset form
      setNewCategoryName('');
      setNewCategoryBudget(0);
      setShowAddCategory(false);
    } catch (error: any) {
      console.error('Error adding budget category:', error);
      alert(`Failed to add category: ${error.message || 'Unknown error'}`);
    }
  };

  // Function to determine budget status color
  const getBudgetStatusColor = (percent: number) => {
    if (percent > 90) return darkMode ? 'text-red-400' : 'text-red-600';
    if (percent > 75) return darkMode ? 'text-yellow-400' : 'text-yellow-600';
    return darkMode ? 'text-green-400' : 'text-green-600';
  };

  // Function to determine budget progress bar color
  const getBudgetProgressColor = (percent: number) => {
    if (percent > 90) return 'bg-red-500';
    if (percent > 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <DollarSign className={`h-12 w-12 ${darkMode ? 'text-blue-400' : 'text-blue-600'} mx-auto animate-pulse`} />
          <h2 className="mt-4 text-xl font-semibold">Loading budget data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Navigation Header */}
      <header className={`${darkMode ? 'bg-gray-800 shadow-md' : 'bg-white shadow-sm'}`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <DollarSign className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className={`text-xl font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>FinTrack</span>
          </div>
          
          <div className="hidden md:flex space-x-6">
            <a 
              onClick={() => navigate('/')} 
              className={`flex items-center cursor-pointer ${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}
            >
              <Home className="h-5 w-5 mr-1" />
              <span>Dashboard</span>
            </a>
            <a 
              onClick={() => navigate('/transactions')} 
              className={`flex items-center cursor-pointer ${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}
            >
              <CreditCard className="h-5 w-5 mr-1" />
              <span>Transactions</span>
            </a>
            <a 
              className={`flex items-center cursor-pointer ${darkMode ? 'text-blue-400 font-medium' : 'text-blue-600 font-medium'}`}
            >
              <PieChart className="h-5 w-5 mr-1" />
              <span>Budget</span>
            </a>
            <a 
              className={`flex items-center cursor-pointer ${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}
            >
              <TrendingUp className="h-5 w-5 mr-1" />
              <span>Goals</span>
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Page header with back button */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/')}
            className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} mr-2`}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold">Budget Management</h1>
        </div>

        {/* Budget Overview Card */}
        <div className={`mb-6 p-6 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-xl font-semibold mb-4">Budget Overview - {currentMonth} {currentYear}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Income</p>
              <p className="text-2xl font-bold">${monthlyIncome.toFixed(2)}</p>
            </div>
            
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Budgeted</p>
              <p className="text-2xl font-bold">${totalBudgeted.toFixed(2)}</p>
            </div>
            
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className="text-sm text-gray-500 dark:text-gray-400">Remaining to Budget</p>
              <p className={`text-2xl font-bold ${monthlyIncome - totalBudgeted > 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${(monthlyIncome - totalBudgeted).toFixed(2)}
              </p>
            </div>
          </div>
          
          {/* Budget allocation chart */}
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-4">
            {budgetData.map((budget, index) => {
              // Calculate width as percentage of total budgeted
              const width = (budget.budget / totalBudgeted) * 100;
              
              // Generate random but consistent color based on category name
              const colorHash = budget.category.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
              const hue = colorHash % 360;
              const backgroundColor = `hsl(${hue}, 70%, ${darkMode ? '45%' : '55%'})`;
              
              return (
                <div 
                  key={index}
                  className="h-full inline-block"
                  style={{ width: `${width}%`, backgroundColor }}
                  title={`${budget.category}: $${budget.budget} (${width.toFixed(1)}%)`}
                ></div>
              );
            })}
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm">
            {budgetData.map((budget, index) => {
              // Generate matching color based on category name (same formula as above)
              const colorHash = budget.category.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
              const hue = colorHash % 360;
              const dotColor = `hsl(${hue}, 70%, ${darkMode ? '45%' : '55%'})`;
              
              return (
                <div key={index} className="flex items-center">
                  <div className="h-3 w-3 rounded-full mr-1" style={{ backgroundColor: dotColor }}></div>
                  <span>{budget.category} (${budget.budget})</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Budget Categories Section */}
        <div className={`mb-6 p-6 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Budget Categories</h2>
            <button
              onClick={() => setShowAddCategory(true)}
              className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Category
            </button>
          </div>

          {/* Add Category Form */}
          {showAddCategory && (
            <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h3 className="text-lg font-medium mb-3">Add New Budget Category</h3>
              <div className="flex flex-col md:flex-row gap-3 mb-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Category Name</label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="e.g., Entertainment"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Monthly Budget</label>
                  <input
                    type="number"
                    value={newCategoryBudget || ''}
                    onChange={(e) => setNewCategoryBudget(parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddCategory(false)}
                  className={`px-3 py-1.5 border rounded-md text-sm ${
                    darkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Add Category
                </button>
              </div>
            </div>
          )}

          {/* Budget Categories List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`text-left text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <tr>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Spent</th>
                  <th className="pb-3 font-medium">Budget</th>
                  <th className="pb-3 font-medium">Progress</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {budgetData.map((budget) => (
                  <tr key={budget.category} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <td className="py-3">
                      <span className="font-medium">{budget.category}</span>
                    </td>
                    <td className="py-3">${budget.spent.toFixed(2)}</td>
                    <td className="py-3">
                      {editingBudgetId === budget.category ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editBudgetAmount || ''}
                            onChange={(e) => setEditBudgetAmount(parseFloat(e.target.value) || 0)}
                            className={`w-24 px-2 py-1 border rounded-md ${
                              darkMode 
                                ? 'bg-gray-800 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                            min="0"
                            step="0.01"
                          />
                          <button
                            onClick={() => handleUpdateBudget(budget.category)}
                            className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>${budget.budget.toFixed(2)}</>
                      )}
                    </td>
                    <td className="py-3 w-1/4">
                      <div className="flex items-center">
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-2">
                          <div 
                            className={`h-full rounded-full ${getBudgetProgressColor(budget.percent)}`}
                            style={{ width: `${Math.min(budget.percent, 100)}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-medium ${getBudgetStatusColor(budget.percent)}`}>
                          {budget.percent}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingBudgetId(budget.category);
                            setEditBudgetAmount(budget.budget);
                          }}
                          className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                            darkMode ? 'text-blue-400' : 'text-blue-600'
                          }`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Budget Status Alerts */}
        <div className={`mb-6 p-6 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-xl font-semibold mb-4">Budget Alerts</h2>
          
          <div className="space-y-3">
            {budgetData
              .filter(budget => budget.percent > 75)
              .map((budget, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-md flex items-start ${
                    budget.percent > 90
                      ? darkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
                      : darkMode ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'
                  }`}
                >
                  <AlertTriangle className={`h-5 w-5 mr-2 mt-0.5 ${
                    budget.percent > 90 
                      ? darkMode ? 'text-red-400' : 'text-red-500' 
                      : darkMode ? 'text-yellow-400' : 'text-yellow-500'
                  }`} />
                  <div>
                    <p className={`font-medium ${
                      budget.percent > 90 
                        ? darkMode ? 'text-red-400' : 'text-red-700' 
                        : darkMode ? 'text-yellow-400' : 'text-yellow-700'
                    }`}>
                      {budget.category} budget {budget.percent >= 100 ? 'exceeded' : 'at risk'}
                    </p>
                    <p className={`text-sm ${
                      budget.percent > 90 
                        ? darkMode ? 'text-red-300' : 'text-red-600' 
                        : darkMode ? 'text-yellow-300' : 'text-yellow-600'
                    }`}>
                      You've spent ${budget.spent.toFixed(2)} of your ${budget.budget.toFixed(2)} budget 
                      ({budget.percent}%)
                    </p>
                  </div>
                </div>
              ))}
              
            {budgetData.filter(budget => budget.percent > 75).length === 0 && (
              <div className={`p-3 rounded-md flex items-start ${
                darkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'
              }`}>
                <CheckCircle className={`h-5 w-5 mr-2 mt-0.5 ${
                  darkMode ? 'text-green-400' : 'text-green-500'
                }`} />
                <div>
                  <p className={`font-medium ${
                    darkMode ? 'text-green-400' : 'text-green-700'
                  }`}>
                    All budgets on track
                  </p>
                  <p className={`text-sm ${
                    darkMode ? 'text-green-300' : 'text-green-600'
                  }`}>
                    You're staying within your budget limits this month. Great job!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className={`mb-6 p-6 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
            <button 
              onClick={() => navigate('/transactions')}
              className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:underline'}`}
            >
              View All
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`text-left text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <tr>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Payee</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <td className="py-3 text-sm">{transaction.date}</td>
                    <td className="py-3">{transaction.payee}</td>
                    <td className="py-3 text-sm">{transaction.category}</td>
                    <td className={`py-3 text-right font-medium ${
                      transaction.amount > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BudgetPage;