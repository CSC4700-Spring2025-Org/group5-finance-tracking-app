import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DollarSign } from 'lucide-react';
import FinancialDashboard from './FinancialDashboard';
// Import other pages as they're developed
// import IncomeStatement from './pages/IncomeStatement';
// import BalanceSheet from './pages/BalanceSheet';
// import CashFlowStatement from './pages/CashFlowStatement';

import { initializeApp } from './initializeApp';

const Main: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  // Initialize the app when the component mounts
  useEffect(() => {
    const init = async () => {
      try {
        await initializeApp();
        setIsInitializing(false);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setInitError('Failed to initialize application. Please refresh or try again later.');
        setIsInitializing(false);
      }
    };

    init();
  }, []);

  // Show loading screen while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <DollarSign className="h-12 w-12 text-blue-600 mx-auto animate-pulse" />
          <h2 className="mt-4 text-xl font-semibold text-gray-700">Initializing FinTrack...</h2>
          <p className="mt-2 text-gray-500">Loading your financial data</p>
        </div>
      </div>
    );
  }

  // Show error if initialization failed
  if (initError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <DollarSign className="h-12 w-12 text-red-600 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-700">Initialization Error</h2>
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
    <Router>
      <Routes>
        <Route path="/" element={<FinancialDashboard />} />
        {/* Add routes for other pages as they're developed */}
        {/* <Route path="/reports/income-statement" element={<IncomeStatement />} /> */}
        {/* <Route path="/accounting/balance-sheet" element={<BalanceSheet />} /> */}
        {/* <Route path="/reports/cash-flows" element={<CashFlowStatement />} /> */}
        
        {/* Redirect any other paths to the dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default Main;