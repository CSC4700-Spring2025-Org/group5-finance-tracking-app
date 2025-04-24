import React, { useState, useEffect } from 'react';
import { DarkModeContext } from '../App';
import Header from '../Header';
import { Plus, X, ChevronRight, ChevronDown } from 'lucide-react';
import * as dataService from '../dataService';

// Define interfaces for balance sheet data
interface AssetItem {
  id: string;
  name: string;
  amount: number;
  type: 'asset';
}

interface LiabilityItem {
  id: string;
  name: string;
  amount: number;
  type: 'liability';
}

type BalanceSheetItem = AssetItem | LiabilityItem;

const BalanceSheet: React.FC = () => {
  const { darkMode } = React.useContext(DarkModeContext);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [liabilities, setLiabilities] = useState<LiabilityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    assets: true,
    liabilities: true
  });
  
  // Form state for adding new items
  const [newItemType, setNewItemType] = useState<'asset' | 'liability'>('asset');
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [showAddItemForm, setShowAddItemForm] = useState(false);

  // Calculate totals
  const totalAssets = assets.reduce((sum, asset) => sum + asset.amount, 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  useEffect(() => {
    const loadBalanceSheetData = async () => {
      try {
        setIsLoading(true);
        // Load balance sheet data from service
        const data = await dataService.getBalanceSheet();
        setAssets(data.assets);
        setLiabilities(data.liabilities);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading balance sheet data:', error);
        setIsLoading(false);
      }
    };

    loadBalanceSheetData();
  }, []);

  const toggleSection = (section: 'assets' | 'liabilities') => {
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
      const newItem: BalanceSheetItem = {
        id: Date.now().toString(),
        name: newItemName.trim(),
        amount: parseFloat(newItemAmount),
        type: newItemType
      };

      // Save to service
      const updatedData = await dataService.addBalanceSheetItem(newItem);
      
      // Update state
      if (newItemType === 'asset') {
        setAssets(updatedData.assets);
      } else {
        setLiabilities(updatedData.liabilities);
      }

      // Reset form
      setNewItemName('');
      setNewItemAmount('');
      setShowAddItemForm(false);
    } catch (error) {
      console.error('Error adding balance sheet item:', error);
      alert('Failed to add item. Please try again.');
    }
  };

  const handleDeleteItem = async (id: string, type: 'asset' | 'liability') => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        // Delete from service
        const updatedData = await dataService.deleteBalanceSheetItem(id, type);
        
        // Update state
        if (type === 'asset') {
          setAssets(updatedData.assets);
        } else {
          setLiabilities(updatedData.liabilities);
        }
      } catch (error) {
        console.error('Error deleting balance sheet item:', error);
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
            <p className={`mt-4 text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Loading balance sheet...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Balance Sheet
          </h1>
          <div className="flex items-center gap-4">
            <div>
              <label htmlFor="date" className={`block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                As of Date:
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`px-3 py-2 border rounded-md text-sm ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-200'
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              />
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
              <h3 className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Total Assets</h3>
              <p className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                ${totalAssets.toFixed(2)}
              </p>
            </div>
            <div>
              <h3 className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Total Liabilities</h3>
              <p className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                ${totalLiabilities.toFixed(2)}
              </p>
            </div>
            <div>
              <h3 className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Net Worth (Equity)</h3>
              <p className={`text-xl font-bold ${
                netWorth >= 0 
                  ? 'text-green-500' 
                  : 'text-red-500'
              }`}>
                ${netWorth.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Assets Section */}
        <div className={`mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
          <div 
            className={`flex justify-between items-center p-4 cursor-pointer ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
            }`}
            onClick={() => toggleSection('assets')}
          >
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              Assets
            </h2>
            <div className="flex items-center">
              <span className={`mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                ${totalAssets.toFixed(2)}
              </span>
              {expandedSections.assets ? (
                <ChevronDown className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              ) : (
                <ChevronRight className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              )}
            </div>
          </div>
          
          {expandedSections.assets && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              {assets.length === 0 ? (
                <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No assets added yet. Click "Add Item" to add your first asset.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody>
                      {/* Table Headers */}
                      <tr className={`${darkMode ? 'bg-gray-750 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        <td className="px-4 py-3 font-medium w-3/4 text-left">Asset Name</td>
                        <td className="px-4 py-3 font-medium w-1/4 text-right">Amount</td>
                        <td className="px-4 py-3 font-medium w-16 text-right">Actions</td>
                      </tr>

                      {/* Asset Items */}
                      {assets.map((asset) => (
                        <tr 
                          key={asset.id}
                          className={`border-t ${
                            darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <td className={`px-4 py-3 text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {asset.name}
                          </td>
                          <td className={`px-4 py-3 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            ${asset.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeleteItem(asset.id, 'asset')}
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
                        <td className="px-4 py-3 text-left">
                          Total Assets
                        </td>
                        <td className="px-4 py-3 text-right">
                          ${totalAssets.toFixed(2)}
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
        
        {/* Liabilities Section */}
        <div className={`mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
          <div 
            className={`flex justify-between items-center p-4 cursor-pointer ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
            }`}
            onClick={() => toggleSection('liabilities')}
          >
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              Liabilities
            </h2>
            <div className="flex items-center">
              <span className={`mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                ${totalLiabilities.toFixed(2)}
              </span>
              {expandedSections.liabilities ? (
                <ChevronDown className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              ) : (
                <ChevronRight className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              )}
            </div>
          </div>
          
          {expandedSections.liabilities && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              {liabilities.length === 0 ? (
                <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No liabilities added yet. Click "Add Item" to add your first liability.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody>
                      {/* Table Headers */}
                      <tr className={`${darkMode ? 'bg-gray-750 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        <td className="px-4 py-3 font-medium w-3/4 text-left">Liability Name</td>
                        <td className="px-4 py-3 font-medium w-1/4 text-right">Amount</td>
                        <td className="px-4 py-3 font-medium w-16 text-right">Actions</td>
                      </tr>

                      {/* Liability Items */}
                      {liabilities.map((liability) => (
                        <tr 
                          key={liability.id}
                          className={`border-t ${
                            darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <td className={`px-4 py-3 text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {liability.name}
                          </td>
                          <td className={`px-4 py-3 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            ${liability.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeleteItem(liability.id, 'liability')}
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
                        <td className="px-4 py-3 text-left">
                          Total Liabilities
                        </td>
                        <td className="px-4 py-3 text-right">
                          ${totalLiabilities.toFixed(2)}
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

        {/* Net Worth */}
        <div className={`mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex flex-col">
            <div className="flex justify-between items-center">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Net Worth (Equity)
              </h3>
              <span className={`text-xl font-bold ${
                netWorth >= 0 
                  ? 'text-green-500' 
                  : 'text-red-500'
              }`}>
                ${netWorth.toFixed(2)}
              </span>
            </div>
            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Assets</span>
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>${totalAssets.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Liabilities</span>
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>- ${totalLiabilities.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Net Worth</span>
                <span className={`font-medium ${
                  netWorth >= 0 
                    ? 'text-green-500' 
                    : 'text-red-500'
                }`}>${netWorth.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Add Item Modal */}
        {showAddItemForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`max-w-md w-full p-6 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  Add Balance Sheet Item
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
                        value="asset"
                        checked={newItemType === 'asset'}
                        onChange={() => setNewItemType('asset')}
                        className="mr-2"
                      />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Asset</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="liability"
                        checked={newItemType === 'liability'}
                        onChange={() => setNewItemType('liability')}
                        className="mr-2"
                      />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Liability</span>
                    </label>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="itemName" className={`block mb-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Name
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
                    placeholder={newItemType === 'asset' ? "e.g., Checking Account" : "e.g., Credit Card Debt"}
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

export default BalanceSheet;