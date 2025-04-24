import React, { useState, useEffect } from 'react';
import { DarkModeContext } from '../App';
import Header from '../Header';
import { Plus, X, ChevronRight, ChevronDown, Calendar } from 'lucide-react';
import * as dataService from '../dataService';

// Define interfaces for income statement data
interface RevenueItem {
  id: string;
  name: string;
  amount: number;
  category: string;
}

interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  category: string;
}

interface IncomeStatementData {
  revenues: RevenueItem[];
  expenses: ExpenseItem[];
  startDate: string;
  endDate: string;
}

const IncomeStatement: React.FC = () => {
  const { darkMode } = React.useContext(DarkModeContext);
  const [isLoading, setIsLoading] = useState(true);
  const [revenueItems, setRevenueItems] = useState<RevenueItem[]>([]);
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [timePeriod, setTimePeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [expandedSections, setExpandedSections] = useState({
    revenues: true,
    expenses: true
  });
  
  // Form state for adding new items
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [newItemType, setNewItemType] = useState<'revenue' | 'expense'>('revenue');
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');

  // Calculate totals
  const totalRevenue = revenueItems.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);
  const netIncome = totalRevenue - totalExpenses;

  useEffect(() => {
    const loadIncomeStatementData = async () => {
      try {
        setIsLoading(true);
        
        // Calculate date range based on selected period
        const now = new Date();
        let start = new Date();
        let end = new Date();
        
        if (timePeriod === 'month') {
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else if (timePeriod === 'quarter') {
          const quarter = Math.floor(now.getMonth() / 3);
          start = new Date(now.getFullYear(), quarter * 3, 1);
          end = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        } else {
          start = new Date(now.getFullYear(), 0, 1);
          end = new Date(now.getFullYear(), 11, 31);
        }
        
        const startDateStr = start.toISOString().split('T')[0];
        const endDateStr = end.toISOString().split('T')[0];
        
        setStartDate(startDateStr);
        setEndDate(endDateStr);
        
        // Load income statement data from service
        const data = await dataService.getIncomeStatement(startDateStr, endDateStr);
        setRevenueItems(data.revenues);
        setExpenseItems(data.expenses);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading income statement data:', error);
        setIsLoading(false);
      }
    };

    loadIncomeStatementData();
  }, [timePeriod]);

  const toggleSection = (section: 'revenues' | 'expenses') => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!newItemName.trim() || !newItemAmount || isNaN(parseFloat(newItemAmount)) || !newItemCategory.trim()) {
      alert('Please enter a valid name, category, and amount.');
      return;
    }

    try {
      // Create new item
      const newItem = {
        id: Date.now().toString(),
        name: newItemName.trim(),
        amount: parseFloat(newItemAmount),
        category: newItemCategory.trim()
      };

      // Save to service
      const updatedData = await dataService.addIncomeStatementItem(
        newItem,
        newItemType,
        startDate,
        endDate
      );
      
      // Update state
      if (newItemType === 'revenue') {
        setRevenueItems(updatedData.revenues);
      } else {
        setExpenseItems(updatedData.expenses);
      }

      // Reset form
      setNewItemName('');
      setNewItemAmount('');
      setNewItemCategory('');
      setShowAddItemForm(false);
    } catch (error) {
      console.error('Error adding income statement item:', error);
      alert('Failed to add item. Please try again.');
    }
  };

  const handleDeleteItem = async (id: string, type: 'revenue' | 'expense') => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        // Delete from service
        const updatedData = await dataService.deleteIncomeStatementItem(id, type, startDate, endDate);
        
        // Update state
        if (type === 'revenue') {
          setRevenueItems(updatedData.revenues);
        } else {
          setExpenseItems(updatedData.expenses);
        }
      } catch (error) {
        console.error('Error deleting income statement item:', error);
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Header />
        <div className="container mx-auto px-4 py-6 flex items-center justify-center h-screen">
          <div className="text-center">
            <div className={`h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 ${darkMode ? 'border-blue-400' : 'border-blue-600'} mx-auto`}></div>
            <p className={`mt-4 text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Loading income statement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Income Statement
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value as 'month' | 'quarter' | 'year')}
                className={`px-3 py-2 border rounded-md text-sm ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-200'
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <div className="flex items-center">
              <Calendar className={`h-4 w-4 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
              </span>
            </div>
            <button
              onClick={() => setShowAddItemForm(true)}
              className="flex items-center rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </button>
          </div>
        </div>

        {/* Summary Card */}
        <div className={`mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Total Revenue</h3>
              <p className={`text-xl font-bold text-green-500`}>
                ${totalRevenue.toFixed(2)}
              </p>
            </div>
            <div>
              <h3 className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Total Expenses</h3>
              <p className={`text-xl font-bold text-red-500`}>
                ${totalExpenses.toFixed(2)}
              </p>
            </div>
            <div>
              <h3 className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Net Income</h3>
              <p className={`text-xl font-bold ${
                netIncome >= 0 
                  ? 'text-green-500' 
                  : 'text-red-500'
              }`}>
                ${netIncome.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Revenue Section */}
        <div className={`mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
          <div 
            className={`flex justify-between items-center p-4 cursor-pointer ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
            }`}
            onClick={() => toggleSection('revenues')}
          >
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              Revenue
            </h2>
            <div className="flex items-center">
              <span className={`mr-2 text-green-500 font-semibold`}>
                ${totalRevenue.toFixed(2)}
              </span>
              {expandedSections.revenues ? (
                <ChevronDown className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              ) : (
                <ChevronRight className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              )}
            </div>
          </div>
          
          {expandedSections.revenues && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              {revenueItems.length === 0 ? (
                <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No revenue items added yet. Click "Add Item" to add your first revenue.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody>
                      {/* Table Headers */}
                      <tr className={`${darkMode ? 'bg-gray-750 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        <td className="px-4 py-3 font-medium w-1/4 text-left">Category</td>
                        <td className="px-4 py-3 font-medium w-2/4 text-left">Description</td>
                        <td className="px-4 py-3 font-medium w-1/4 text-right">Amount</td>
                        <td className="px-4 py-3 font-medium w-16 text-right">Actions</td>
                      </tr>

                      {/* Revenue Items */}
                      {revenueItems.map((item) => (
                        <tr 
                          key={item.id}
                          className={`border-t ${
                            darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <td className={`px-4 py-3 text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {item.category}
                          </td>
                          <td className={`px-4 py-3 text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {item.name}
                          </td>
                          <td className={`px-4 py-3 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            ${item.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeleteItem(item.id, 'revenue')}
                              className="text-red-500 hover:text-red-700"
                              title="Delete"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {/* Total Row */}
                      <tr className={`border-t ${
                        darkMode ? 'border-gray-700 bg-gray-750 text-gray-200' : 'border-gray-200 bg-gray-100 text-gray-800'
                      } font-semibold`}>
                        <td colSpan={2} className="px-4 py-3 text-left">
                          Total Revenue
                        </td>
                        <td className="px-4 py-3 text-right text-green-500">
                          ${totalRevenue.toFixed(2)}
                        </td>
                        <td className="px-4 py-3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Expenses Section */}
        <div className={`mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
          <div 
            className={`flex justify-between items-center p-4 cursor-pointer ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
            }`}
            onClick={() => toggleSection('expenses')}
          >
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              Expenses
            </h2>
            <div className="flex items-center">
              <span className={`mr-2 text-red-500 font-semibold`}>
                ${totalExpenses.toFixed(2)}
              </span>
              {expandedSections.expenses ? (
                <ChevronDown className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              ) : (
                <ChevronRight className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              )}
            </div>
          </div>
          
          {expandedSections.expenses && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              {expenseItems.length === 0 ? (
                <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No expense items added yet. Click "Add Item" to add your first expense.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody>
                      {/* Table Headers */}
                      <tr className={`${darkMode ? 'bg-gray-750 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        <td className="px-4 py-3 font-medium w-1/4 text-left">Category</td>
                        <td className="px-4 py-3 font-medium w-2/4 text-left">Description</td>
                        <td className="px-4 py-3 font-medium w-1/4 text-right">Amount</td>
                        <td className="px-4 py-3 font-medium w-16 text-right">Actions</td>
                      </tr>

                      {/* Expense Items */}
                      {expenseItems.map((item) => (
                        <tr 
                          key={item.id}
                          className={`border-t ${
                            darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <td className={`px-4 py-3 text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {item.category}
                          </td>
                          <td className={`px-4 py-3 text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {item.name}
                          </td>
                          <td className={`px-4 py-3 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            ${item.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeleteItem(item.id, 'expense')}
                              className="text-red-500 hover:text-red-700"
                              title="Delete"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {/* Total Row */}
                      <tr className={`border-t ${
                        darkMode ? 'border-gray-700 bg-gray-750 text-gray-200' : 'border-gray-200 bg-gray-100 text-gray-800'
                      } font-semibold`}>
                        <td colSpan={2} className="px-4 py-3 text-left">
                          Total Expenses
                        </td>
                        <td className="px-4 py-3 text-right text-red-500">
                          ${totalExpenses.toFixed(2)}
                        </td>
                        <td className="px-4 py-3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Net Income Summary */}
        <div className={`mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex justify-between items-center">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              Net Income
            </h3>
            <span className={`text-xl font-bold ${
              netIncome >= 0 
                ? 'text-green-500' 
                : 'text-red-500'
            }`}>
              ${netIncome.toFixed(2)}
            </span>
          </div>
          <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Revenue</span>
              <span className="text-green-500">${totalRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Expenses</span>
              <span className="text-red-500">- ${totalExpenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Net Income</span>
              <span className={`font-medium ${
                netIncome >= 0 
                  ? 'text-green-500' 
                  : 'text-red-500'
              }`}>${netIncome.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Add Item Modal */}
        {showAddItemForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`max-w-md w-full p-6 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  Add Income Statement Item
                </h3>
                <button
                  onClick={() => setShowAddItemForm(false)}
                  className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddItem}>
                <div className="mb-4">
                  <label className={`block mb-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="revenue"
                        checked={newItemType === 'revenue'}
                        onChange={() => setNewItemType('revenue')}
                        className="mr-2"
                      />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Revenue</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="expense"
                        checked={newItemType === 'expense'}
                        onChange={() => setNewItemType('expense')}
                        className="mr-2"
                      />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Expense</span>
                    </label>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="itemCategory" className={`block mb-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Category
                  </label>
                  <input
                    type="text"
                    id="itemCategory"
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                    placeholder={newItemType === 'revenue' ? "e.g., Sales" : "e.g., Operating Expenses"}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="itemName" className={`block mb-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <input
                    type="text"
                    id="itemName"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                    placeholder={newItemType === 'revenue' ? "e.g., Product Sales" : "e.g., Office Rent"}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="itemAmount" className={`block mb-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    id="itemAmount"
                    value={newItemAmount}
                    onChange={(e) => setNewItemAmount(e.target.value)}
                    step="0.01"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddItemForm(false)}
                    className={`px-4 py-2 border rounded-md text-sm ${
                      darkMode
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    Add Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default IncomeStatement;