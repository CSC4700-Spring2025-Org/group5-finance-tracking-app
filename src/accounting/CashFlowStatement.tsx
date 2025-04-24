import React, { useState, useEffect } from 'react';
import { DarkModeContext } from '../App';
import Header from '../Header';
import { Plus, X, ChevronRight, ChevronDown, Calendar } from 'lucide-react';
import * as dataService from '../dataService';

// Define interfaces for cash flow statement data
interface CashFlowItem {
  id: string;
  name: string;
  amount: number;
  category: 'operating' | 'investing' | 'financing';
}

interface CashFlowStatementData {
  items: CashFlowItem[];
  startDate: string;
  endDate: string;
  startingBalance: number;
  endingBalance: number;
}

const CashFlowStatement: React.FC = () => {
  const { darkMode } = React.useContext(DarkModeContext);
  const [isLoading, setIsLoading] = useState(true);
  const [cashFlowItems, setCashFlowItems] = useState<CashFlowItem[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [startingBalance, setStartingBalance] = useState(0);
  const [endingBalance, setEndingBalance] = useState(0);
  const [timePeriod, setTimePeriod] = useState<'month' | 'quarter' | 'year'>('month');
  
  const [expandedSections, setExpandedSections] = useState({
    operating: true,
    investing: true,
    financing: true
  });
  
  // Form state for adding new items
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [newItemCategory, setNewItemCategory] = useState<'operating' | 'investing' | 'financing'>('operating');
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');

  // Calculate totals for each category
  const operatingItems = cashFlowItems.filter(item => item.category === 'operating');
  const investingItems = cashFlowItems.filter(item => item.category === 'investing');
  const financingItems = cashFlowItems.filter(item => item.category === 'financing');
  
  const operatingTotal = operatingItems.reduce((sum, item) => sum + item.amount, 0);
  const investingTotal = investingItems.reduce((sum, item) => sum + item.amount, 0);
  const financingTotal = financingItems.reduce((sum, item) => sum + item.amount, 0);
  
  const netCashFlow = operatingTotal + investingTotal + financingTotal;

  useEffect(() => {
    const loadCashFlowData = async () => {
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
        
        // Load cash flow statement data from service
        const data = await dataService.getCashFlowStatement(startDateStr, endDateStr);
        setCashFlowItems(data.items);
        setStartingBalance(data.startingBalance);
        setEndingBalance(data.endingBalance);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading cash flow statement data:', error);
        setIsLoading(false);
      }
    };

    loadCashFlowData();
  }, [timePeriod]);

  const toggleSection = (section: 'operating' | 'investing' | 'financing') => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!newItemName.trim() || !newItemAmount || isNaN(parseFloat(newItemAmount))) {
      alert('Please enter a valid name and amount.');
      return;
    }

    try {
      // Create new item
      const newItem: CashFlowItem = {
        id: Date.now().toString(),
        name: newItemName.trim(),
        amount: parseFloat(newItemAmount),
        category: newItemCategory
      };

      // Save to service
      const updatedData = await dataService.addCashFlowItem(newItem, startDate, endDate);
      
      // Update state
      setCashFlowItems(updatedData.items);
      setStartingBalance(updatedData.startingBalance);
      setEndingBalance(updatedData.endingBalance);

      // Reset form
      setNewItemName('');
      setNewItemAmount('');
      setShowAddItemForm(false);
    } catch (error) {
      console.error('Error adding cash flow item:', error);
      alert('Failed to add item. Please try again.');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        // Delete from service
        const updatedData = await dataService.deleteCashFlowItem(id, startDate, endDate);
        
        // Update state
        setCashFlowItems(updatedData.items);
        setStartingBalance(updatedData.startingBalance);
        setEndingBalance(updatedData.endingBalance);
      } catch (error) {
        console.error('Error deleting cash flow item:', error);
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  const getCategoryTitle = (category: 'operating' | 'investing' | 'financing') => {
    switch (category) {
      case 'operating':
        return 'Operating Activities';
      case 'investing':
        return 'Investing Activities';
      case 'financing':
        return 'Financing Activities';
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Header />
        <div className="container mx-auto px-4 py-6 flex items-center justify-center h-screen">
          <div className="text-center">
            <div className={`h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 ${darkMode ? 'border-blue-400' : 'border-blue-600'} mx-auto`}></div>
            <p className={`mt-4 text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Loading cash flow statement...</p>
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
            Statement of Cash Flows
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h3 className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Starting Balance</h3>
              <p className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                ${startingBalance.toFixed(2)}
              </p>
            </div>
            <div>
              <h3 className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Net Cash Flow</h3>
              <p className={`text-xl font-bold ${
                netCashFlow >= 0 
                  ? 'text-green-500' 
                  : 'text-red-500'
              }`}>
                ${netCashFlow.toFixed(2)}
              </p>
            </div>
            <div>
              <h3 className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Ending Balance</h3>
              <p className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                ${endingBalance.toFixed(2)}
              </p>
            </div>
            <div>
              <h3 className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Period Change</h3>
              <p className={`text-xl font-bold ${
                endingBalance - startingBalance >= 0 
                  ? 'text-green-500' 
                  : 'text-red-500'
              }`}>
                ${(endingBalance - startingBalance).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Cash Flow Sections */}
        {['operating', 'investing', 'financing'].map((category) => {
          const items = cashFlowItems.filter(item => item.category === category);
          const categoryTotal = items.reduce((sum, item) => sum + item.amount, 0);
          const isExpanded = expandedSections[category as keyof typeof expandedSections];
          
          return (
            <div 
              key={category}
              className={`mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}
            >
              <div 
                className={`flex justify-between items-center p-4 cursor-pointer ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}
                onClick={() => toggleSection(category as 'operating' | 'investing' | 'financing')}
              >
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  {getCategoryTitle(category as 'operating' | 'investing' | 'financing')}
                </h2>
                <div className="flex items-center">
                  <span className={`mr-2 ${
                    categoryTotal >= 0
                      ? 'text-green-500'
                      : 'text-red-500'
                  } font-semibold`}>
                    ${categoryTotal.toFixed(2)}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  ) : (
                    <ChevronRight className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  )}
                </div>
              </div>
              
              {isExpanded && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  {items.length === 0 ? (
                    <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No {category} activities added yet. Click "Add Item" to add your first item.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <tbody>
                          {/* Table Headers */}
                          <tr className={`${darkMode ? 'bg-gray-750 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                            <td className="px-4 py-3 font-medium w-3/4 text-left">Description</td>
                            <td className="px-4 py-3 font-medium w-1/4 text-right">Amount</td>
                            <td className="px-4 py-3 font-medium w-16 text-right">Actions</td>
                          </tr>

                          {/* Cash Flow Items */}
                          {items.map((item) => (
                            <tr 
                              key={item.id}
                              className={`border-t ${
                                darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <td className={`px-4 py-3 text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {item.name}
                              </td>
                              <td className={`px-4 py-3 text-right ${
                                item.amount >= 0
                                  ? 'text-green-500'
                                  : 'text-red-500'
                              }`}>
                                ${item.amount.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
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
                            <td className={`px-4 py-3 text-left`}>
                              Net Cash from {getCategoryTitle(category as 'operating' | 'investing' | 'financing')}
                            </td>
                            <td className={`px-4 py-3 text-right ${
                              categoryTotal >= 0
                                ? 'text-green-500'
                                : 'text-red-500'
                            }`}>
                              ${categoryTotal.toFixed(2)}
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
          );
        })}
        
        {/* Net Change in Cash Summary */}
        <div className={`mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex justify-between items-center">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              Net Change in Cash
            </h3>
            <span className={`text-xl font-bold ${
              netCashFlow >= 0 
                ? 'text-green-500' 
                : 'text-red-500'
            }`}>
              ${netCashFlow.toFixed(2)}
            </span>
          </div>
          <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cash at beginning of period</span>
              <span className={`${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>${startingBalance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Net Cash from Operating Activities</span>
              <span className={`${
                operatingTotal >= 0 
                  ? 'text-green-500' 
                  : 'text-red-500'
              }`}>${operatingTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Net Cash from Investing Activities</span>
              <span className={`${
                investingTotal >= 0 
                  ? 'text-green-500' 
                  : 'text-red-500'
              }`}>${investingTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Net Cash from Financing Activities</span>
              <span className={`${
                financingTotal >= 0 
                  ? 'text-green-500' 
                  : 'text-red-500'
              }`}>${financingTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Cash at end of period</span>
              <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>${endingBalance.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Add Item Modal */}
        {showAddItemForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`max-w-md w-full p-6 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  Add Cash Flow Item
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
                    Activity Type
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as 'operating' | 'investing' | 'financing')}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                    required
                  >
                    <option value="operating">Operating Activity</option>
                    <option value="investing">Investing Activity</option>
                    <option value="financing">Financing Activity</option>
                  </select>
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
                    placeholder={
                      newItemCategory === 'operating' 
                        ? "e.g., Cash received from customers" 
                        : newItemCategory === 'investing' 
                          ? "e.g., Purchase of equipment"
                          : "e.g., Loan proceeds"
                    }
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="itemAmount" className={`block mb-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Amount ($)
                  </label>
                  <div className="flex items-center">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        id="itemAmount"
                        value={newItemAmount}
                        onChange={(e) => setNewItemAmount(e.target.value)}
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-md text-sm ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-gray-200'
                            : 'bg-white border-gray-300 text-gray-700'
                        }`}
                        placeholder="0.00"
                        required
                      />
                      <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Use positive values for cash inflows and negative values for cash outflows
                      </p>
                    </div>
                  </div>
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

export default CashFlowStatement;