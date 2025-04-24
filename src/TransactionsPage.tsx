import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Download, ChevronDown, TrendingUp, CreditCard } from 'lucide-react';
import { DarkModeContext } from './App';
import * as dataService from './dataService';
import { Transaction } from './types';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

const TransactionsPage = () => {
  const navigate = useNavigate();
  const { darkMode } = React.useContext(DarkModeContext);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [dateRange, setDateRange] = useState<string>('All Time');
  const [sortBy, setSortBy] = useState<string>('Date (Newest)');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Load transactions on component mount
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setIsLoading(true);
        const data = await dataService.loadData();
        setTransactions(data.transactions);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(data.transactions.map(t => t.category))
        );
        setCategories(['All Categories', ...uniqueCategories]);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading transactions:', error);
        setIsLoading(false);
      }
    };
    
    loadTransactions();
  }, []);

  // Filter and sort transactions when dependencies change
  useEffect(() => {
    let results = [...transactions];
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(
        t => t.payee.toLowerCase().includes(searchTerm.toLowerCase()) || 
             t.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'All Categories') {
      results = results.filter(t => t.category === selectedCategory);
    }
    
    // Apply date range filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (dateRange === 'Last 7 Days') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      results = results.filter(t => new Date(t.date) >= weekAgo);
    } else if (dateRange === 'Last 30 Days') {
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      results = results.filter(t => new Date(t.date) >= monthAgo);
    } else if (dateRange === 'This Month') {
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      results = results.filter(t => new Date(t.date) >= firstDayOfMonth);
    } else if (dateRange === 'This Year') {
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
      results = results.filter(t => new Date(t.date) >= firstDayOfYear);
    }
    
    // Apply sorting
    if (sortBy === 'Date (Newest)') {
      results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === 'Date (Oldest)') {
      results.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === 'Amount (Highest)') {
      results.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === 'Amount (Lowest)') {
      results.sort((a, b) => a.amount - b.amount);
    } else if (sortBy === 'Payee (A-Z)') {
      results.sort((a, b) => a.payee.localeCompare(b.payee));
    } else if (sortBy === 'Payee (Z-A)') {
      results.sort((a, b) => b.payee.localeCompare(a.payee));
    }
    
    setFilteredTransactions(results);
  }, [transactions, searchTerm, selectedCategory, dateRange, sortBy]);

  // Get current page of transactions
  const getCurrentPageTransactions = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredTransactions.slice(startIndex, endIndex);
  };

  // Calculate total pages
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Handle page change
  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle transaction export
  const exportTransactions = () => {
    // Create CSV content
    const headers = ['Date', 'Payee', 'Category', 'Amount'];
    const csvRows = [headers];
    
    filteredTransactions.forEach(t => {
      csvRows.push([t.date, t.payee, t.category, t.amount.toString()]);
    });
    
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`h-8 w-8 border-4 ${darkMode ? 'border-blue-400 border-t-gray-700' : 'border-blue-600 border-t-gray-200'} rounded-full animate-spin mx-auto`}></div>
          <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Filters and Search */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4 mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className={`relative ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-md border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-700 placeholder-gray-500'
                } focus:outline-none focus:ring-2 ${
                  darkMode ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full px-4 py-2 rounded-md border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-700'
                } focus:outline-none focus:ring-2 ${
                  darkMode ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-blue-500 focus:border-blue-500'
                }`}
              >
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className={`w-full px-4 py-2 rounded-md border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-700'
                } focus:outline-none focus:ring-2 ${
                  darkMode ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-blue-500 focus:border-blue-500'
                }`}
              >
                <option value="All Time">All Time</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="This Month">This Month</option>
                <option value="This Year">This Year</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`w-full px-4 py-2 rounded-md border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-700'
                } focus:outline-none focus:ring-2 ${
                  darkMode ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-blue-500 focus:border-blue-500'
                }`}
              >
                <option value="Date (Newest)">Date (Newest)</option>
                <option value="Date (Oldest)">Date (Oldest)</option>
                <option value="Amount (Highest)">Amount (Highest)</option>
                <option value="Amount (Lowest)">Amount (Lowest)</option>
                <option value="Payee (A-Z)">Payee (A-Z)</option>
                <option value="Payee (Z-A)">Payee (Z-A)</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Showing {filteredTransactions.length} transactions
            </div>
            <button
              onClick={exportTransactions}
              className={`flex items-center px-4 py-2 rounded-md ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-600'}`}>
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold">Date</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold">Payee</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold">Category</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className={`${darkMode ? 'text-gray-300' : 'text-gray-800'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {getCurrentPageTransactions().map((transaction) => (
                  <tr 
                    key={transaction.id}
                    className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                          transaction.amount > 0 
                            ? (darkMode ? 'bg-green-900 text-green-400' : 'bg-green-100 text-green-600') 
                            : (darkMode ? 'bg-red-900 text-red-400' : 'bg-red-100 text-red-600')
                        }`}>
                          {transaction.amount > 0 ? <TrendingUp className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                        </div>
                        {transaction.payee}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.amount > 0
                          ? (darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800')
                          : (darkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800')
                      }`}>
                        {transaction.category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                      transaction.amount > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}

                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm italic">
                      No transactions found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredTransactions.length > 0 && (
            <div className={`px-6 py-4 flex items-center justify-between border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-1 rounded border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => changePage(1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1
                      ? (darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400')
                      : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                  }`}
                >
                  First
                </button>
                <button
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1
                      ? (darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400')
                      : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                  }`}
                >
                  Previous
                </button>
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage === totalPages
                      ? (darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400')
                      : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                  }`}
                >
                  Next
                </button>
                <button
                  onClick={() => changePage(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage === totalPages
                      ? (darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400')
                      : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                  }`}
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TransactionsPage;