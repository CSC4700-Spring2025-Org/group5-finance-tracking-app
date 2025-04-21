import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';

interface TransferMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

const TransferMoneyModal: React.FC<TransferMoneyModalProps> = ({ isOpen, onClose, darkMode = false }) => {
  const [fromAccount, setFromAccount] = useState<string>('');
  const [toAccount, setToAccount] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  
  // Hardcoded accounts for the prototype
  const accounts = [
    { id: 'checking', name: 'Checking Account', balance: 3250.75 },
    { id: 'savings', name: 'Savings Account', balance: 12500.00 },
    { id: 'investment', name: 'Investment Account', balance: 8750.50 },
    { id: 'emergency', name: 'Emergency Fund', balance: 5000.00 }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would process the transfer
    // For now, just close the modal
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg w-full max-w-md p-6`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Transfer Money</h2>
          <button 
            onClick={onClose}
            className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* From Account */}
          <div className="mb-4">
            <label htmlFor="from-account" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              From Account
            </label>
            <select
              id="from-account"
              value={fromAccount}
              onChange={(e) => setFromAccount(e.target.value)}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-300'}`}
            >
              <option value="">Select source account</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name} - ${account.balance.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Transfer arrow */}
          <div className="flex justify-center my-4">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <ArrowRight className={`h-4 w-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
            </div>
          </div>

          {/* To Account */}
          <div className="mb-4">
            <label htmlFor="to-account" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              To Account
            </label>
            <select
              id="to-account"
              value={toAccount}
              onChange={(e) => setToAccount(e.target.value)}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-300'}`}
            >
              <option value="">Select destination account</option>
              {accounts.map(account => (
                <option 
                  key={account.id} 
                  value={account.id}
                  disabled={account.id === fromAccount}
                >
                  {account.name} - ${account.balance.toFixed(2)}
                </option>
              ))}
              <option value="external">External Account (Add New)</option>
            </select>
          </div>
          
          {/* Amount */}
          <div className="mb-4">
            <label htmlFor="amount" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} sm:text-sm`}>$</span>
              </div>
              <input
                type="text"
                id="amount"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full pl-7 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-300'}`}
              />
            </div>
          </div>

          {/* Transfer Date */}
          <div className="mb-4">
            <label htmlFor="transfer-date" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Transfer Date
            </label>
            <select
              id="transfer-date"
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-300'}`}
            >
              <option>Today (Apr 20)</option>
              <option>Tomorrow (Apr 21)</option>
              <option>Schedule for later date</option>
            </select>
          </div>

          {/* Note */}
          <div className="mb-4">
            <label htmlFor="note" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Note (Optional)
            </label>
            <input
              type="text"
              id="note"
              placeholder="Add a note for this transfer"
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-300'}`}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-sm font-medium ${darkMode ? 'text-gray-300 bg-gray-700 border border-gray-600 hover:bg-gray-600' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'} rounded-md`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-sm font-medium text-white ${fromAccount && toAccount && amount ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-400 cursor-not-allowed'} rounded-md`}
              disabled={!fromAccount || !toAccount || !amount}
            >
              Transfer Money
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferMoneyModal;