import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

import BalanceSheet from './accounting/BalanceSheet';
import RecordList from './accounting/RecordList';

const App: React.FC = () => {
  return (
    <div className="App">
      <FinancialDashboard />
    </div>
  );
}


export default App;
