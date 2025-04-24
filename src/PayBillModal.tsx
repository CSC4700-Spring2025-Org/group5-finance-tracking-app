import React, { useState } from 'react';
import { X } from 'lucide-react';

interface PayBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

const PayBillModal: React.FC<PayBillModalProps> = ({ isOpen, onClose, darkMode = false }) => {
  const [selectedBiller, setSelectedBiller] = useState<string>('');
  
  // Hardcoded billers for the prototype
  const billers = [
    { id: 'electric', name: 'Electric Company', amount: 78.45, dueDate: 'Apr 25' },
    { id: 'internet', name: 'Internet Provider', amount: 59.99, dueDate: 'Apr 28' },
    { id: 'water', name: 'Water Utility', amount: 42.30, dueDate: 'May 2' },
    { id: 'phone', name: 'Mobile Phone', amount: 85.00, dueDate: 'May 5' },
    { id: 'streaming', name: 'Streaming Service', amount: 14.99, dueDate: 'May 10' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would process the payment
    // For now, just close the modal
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg w-full max-w-md p-6`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Pay Bill</h2>
          <button 
            onClick={onClose}
            className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Select Biller */}
          <div className="mb-4">
            <label htmlFor="biller" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Select Biller
            </label>
            <select
              id="biller"
              value={selectedBiller}
              onChange={(e) => setSelectedBiller(e.target.value)}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-300'}`}
            >
              <option value="">Select a biller</option>
              {billers.map(biller => (
                <option key={biller.id} value={biller.id}>
                  {biller.name} - ${biller.amount} (Due: {biller.dueDate})
                </option>
              ))}
            </select>
          </div>

          {/* Show selected biller details */}
          {selectedBiller && (
            <div className={`mb-4 p-4 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              {(() => {
                const biller = billers.find(b => b.id === selectedBiller);
                if (!biller) return null;

                return (
                  <>
                    <div className="flex justify-between mb-2">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Biller:</span>
                      <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{biller.name}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Amount Due:</span>
                      <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>${biller.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Due Date:</span>
                      <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{biller.dueDate}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Payment Method */}
          <div className="mb-4">
            <label htmlFor="payment-method" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Payment Method
            </label>
            <select
              id="payment-method"
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-300'}`}
            >
              <option>Checking Account (****4567)</option>
              <option>Savings Account (****8901)</option>
              <option>Credit Card - Visa (****1234)</option>
              <option>Credit Card - Mastercard (****5678)</option>
            </select>
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
              className={`px-4 py-2 text-sm font-medium text-white ${selectedBiller ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-400 cursor-not-allowed'} rounded-md`}
              disabled={!selectedBiller}
            >
              Pay Bill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayBillModal;