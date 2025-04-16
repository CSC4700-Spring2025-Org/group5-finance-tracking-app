import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import FinancialDashboard from './FinancialDashboard';

import BalanceSheet from './accounting/BalanceSheet';
import RecordList from './accounting/RecordList';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<FinancialDashboard />} />
        <Route path="/accounting/balance-sheet" element={<BalanceSheet />} />
        <Route path="/reports/income-statement" element={<div className="p-8 text-center">Income Statement (Coming Soon)</div>} />
        <Route path="/reports/cash-flows" element={<div className="p-8 text-center">Statement of Cash Flows (Coming Soon)</div>} />
      </Routes>
    </div>
  );
}

export default App;
