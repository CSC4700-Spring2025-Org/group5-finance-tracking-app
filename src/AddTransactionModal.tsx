import React, { useState } from 'react';
import { X } from 'lucide-react';

interface TransactionCategory {
  id: string;
  name: string;
}

// Predefined categories
const expenseCategories: TransactionCategory[] = [
  { id: 'food', name: 'Food & Dining' },
  { id: 'transport', name: 'Transportation' },
  { id: 'entertainment', name: 'Entertainment' },
  { id: 'shopping', name: 'Shopping' },
  { id: 'bills', name: 'Bills' },
  { id: 'housing', name: 'Housing' },
  { id: 'health', name: 'Healthcare' },
  { id: 'other', name: 'Other' }
];

const incomeCategories: TransactionCategory[] = [
  { id: 'paycheck', name: 'Paycheck' },
  { id: 'freelance', name: 'Freelance' },
  { id: 'investment', name: 'Investment' },
  { id: 'gift', name: 'Gift' },
  { id: 'refund', name: 'Refund' },
  { id: 'other', name: 'Other' }
];

interface Transaction {
  id: number;
  date: string;
  payee: string;
  category: string;
  amount: number;
  customCategory?: string;
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Transaction) => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onAddTransaction }) => {
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [payee, setPayee] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: {[key: string]: string} = {};
    
    if (!date) newErrors.date = 'Date is required';
    if (!payee) newErrors.payee = 'Payee is required';
    if (!category) newErrors.category = 'Category is required';
    if (!amount || isNaN(parseFloat(amount))) newErrors.amount = 'Valid amount is required';
    if (category === 'other' && !customCategory) newErrors.customCategory = 'Please specify a category';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Create transaction object
    const transaction: Transaction = {
      id: Date.now(), // Use timestamp as temporary ID
      date: formatDate(date),
      payee,
      category: category === 'other' ? customCategory : 
        transactionType === 'expense' 
          ? expenseCategories.find(c => c.id === category)?.name || category
          : incomeCategories.find(c => c.id === category)?.name || category,
      amount: transactionType === 'expense' 
        ? -Math.abs(parseFloat(amount)) 
        : Math.abs(parseFloat(amount))
    };
    
    // Pass transaction to parent component
    onAddTransaction(transaction);
    
    // Reset form
    resetForm();
    
    // Close modal
    onClose();
  };

  const resetForm = () => {
    setTransactionType('expense');
    setDate(new Date().toISOString().split('T')[0]);
    setPayee('');
    setCategory('');
    setCustomCategory('');
    setAmount('');
    setErrors({});
  };

  // Format date to match the format in the dashboard
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Add Transaction</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Transaction Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="transactionType"
                  value="expense"
                  checked={transactionType === 'expense'}
                  onChange={() => {
                    setTransactionType('expense');
                    setCategory('');
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Expense</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="transactionType"
                  value="income"
                  checked={transactionType === 'income'}
                  onChange={() => {
                    setTransactionType('income');
                    setCategory('');
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Income</span>
              </label>
            </div>
          </div>

          {/* Date */}
          <div className="mb-4">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
          </div>

          {/* Payee */}
          <div className="mb-4">
            <label htmlFor="payee" className="block text-sm font-medium text-gray-700 mb-1">
              {transactionType === 'expense' ? 'Payee' : 'Source'}
            </label>
            <input
              type="text"
              id="payee"
              placeholder={transactionType === 'expense' ? 'Where did you spend?' : 'Where did the money come from?'}
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.payee ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.payee && <p className="mt-1 text-xs text-red-500">{errors.payee}</p>}
          </div>

          {/* Category */}
          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select category</option>
              {(transactionType === 'expense' ? expenseCategories : incomeCategories).map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
          </div>

          {/* Custom Category (shown only when 'Other' is selected) */}
          {category === 'other' && (
            <div className="mb-4">
              <label htmlFor="customCategory" className="block text-sm font-medium text-gray-700 mb-1">
                Specify Category
              </label>
              <input
                type="text"
                id="customCategory"
                placeholder="Enter custom category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.customCategory ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.customCategory && <p className="mt-1 text-xs text-red-500">{errors.customCategory}</p>}
            </div>
          )}

          {/* Amount */}
          <div className="mb-6">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="text"
                id="amount"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full pl-7 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;