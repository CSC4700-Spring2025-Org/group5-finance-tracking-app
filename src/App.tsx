import React, { useState, useEffect } from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import FinancialDashboard from './FinancialDashboard';
import BalanceSheet from './accounting/BalanceSheet';
import TransactionsPage from './TransactionsPage';
import BudgetPage from './BudgetPage';
import GoalsPage from './GoalsPage';
import { DollarSign } from 'lucide-react';
import { initializeApp } from './initializeApp';

// Create a context for dark mode that can be used throughout the app
export const DarkModeContext = React.createContext({
  darkMode: false,
  toggleDarkMode: () => {}
});

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);

  // First, load dark mode preference from localStorage - do this immediately
  useEffect(() => {
    try {
      const savedDarkMode = localStorage.getItem('darkMode');
      if (savedDarkMode !== null) {
        setDarkMode(savedDarkMode === 'true');
      }
    } catch (error) {
      console.error('Failed to load dark mode preference:', error);
    }
  }, []);

  // Second, initialize the app when the component mounts
  useEffect(() => {
    const init = async () => {
      try {
        await initializeApp();
        setIsInitializing(false);
        setIsAppReady(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setInitError('Failed to initialize application. Please refresh or try again later.');
        setIsInitializing(false);
      }
    };
  
    init();
  }, []);

  // Apply dark mode class to the document whenever darkMode changes
  useEffect(() => {
    // Only save the preference once the app is ready to avoid potential race conditions
    if (isAppReady) {
      localStorage.setItem('darkMode', darkMode.toString());
    }
    
    // Apply dark mode class to the document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode, isAppReady]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Show loading screen while initializing
  if (isInitializing) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} flex items-center justify-center`}>
        <div className="text-center">
          <DollarSign className={`h-12 w-12 ${darkMode ? 'text-blue-400' : 'text-blue-600'} mx-auto animate-pulse`} />
          <h2 className={`mt-4 text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>Initializing FinTrack...</h2>
          <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading your financial data</p>
        </div>
      </div>
    );
  }

  // Show error if initialization failed
  if (initError) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} flex items-center justify-center`}>
        <div className={`text-center max-w-md mx-auto p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
          <DollarSign className="h-12 w-12 text-red-600 mx-auto" />
          <h2 className={`mt-4 text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>Initialization Error</h2>
          <p className="mt-2 text-red-500">{initError}</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <div className={`App ${darkMode ? 'dark' : ''}`}>
        <Routes>
          <Route path="/" element={<FinancialDashboard />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/accounting/balance-sheet" element={<BalanceSheet />} />
          <Route path="/reports/income-statement" element={<div className={`p-8 text-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>Income Statement (Coming Soon)</div>} />
          <Route path="/reports/cash-flows" element={<div className={`p-8 text-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>Statement of Cash Flows (Coming Soon)</div>} />
        </Routes>
      </div>
    </DarkModeContext.Provider>
  );
}

export default App;