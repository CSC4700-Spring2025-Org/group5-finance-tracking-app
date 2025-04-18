import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface TransactionCategory {
  id: string;
  name: string;
}

// Predefined categories
const budgetCategories: TransactionCategory[] = [
  { id: 'food', name: 'Food & Dining' },
  { id: 'transport', name: 'Transportation' },
  { id: 'entertainment', name: 'Entertainment' },
  { id: 'shopping', name: 'Shopping' }
];

const expenseCategories: TransactionCategory[] = [
  { id: 'bills', name: 'Bills' },
  { id: 'housing', name: 'Housing' },
  { id: 'health', name: 'Healthcare' },
  { id: 'other_expense', name: 'Other' }
];

const incomeCategories: TransactionCategory[] = [
  { id: 'paycheck', name: 'Paycheck' },
  { id: 'freelance', name: 'Freelance' },
  { id: 'investment', name: 'Investment' },
  { id: 'gift', name: 'Gift' },
  { id: 'refund', name: 'Refund' },
  { id: 'other_income', name: 'Other' }
];

interface Transaction {
  id: number;
  date: string;
  payee: string;
  category: string;
  amount: number;
  customCategory?: string;
}

interface BudgetItem {
  category: string;
  spent: number;
  budget: number;
  percent: number;
}

interface Goal {
  name: string;
  saved: number;
  target: number;
  percent: number;
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Transaction) => void;
  budgetData: BudgetItem[];
  goalsData: Goal[];
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ 
  isOpen, 
  onClose, 
  onAddTransaction,
  budgetData,
  goalsData
}) => {
  // Get today's date in YYYY-MM-DD format
  const getTodayFormatted = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [date, setDate] = useState<string>(getTodayFormatted());
  const [payee, setPayee] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetItem | null>(null);
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);
  
  // Update the selected budget when category changes
  useEffect(() => {
    if (transactionType === 'expense' && category) {
      let budgetCategory = '';
      
      // Check in budget categories
      const budgetCat = budgetCategories.find(c => c.id === category);
      if (budgetCat) {
        budgetCategory = budgetCat.name;
      }
      
      // Check in expense categories
      const expenseCat = expenseCategories.find(c => c.id === category);
      if (expenseCat) {
        budgetCategory = expenseCat.name;
      }
      
      if (budgetCategory) {
        const matchedBudget = budgetData.find(item => item.category === budgetCategory);
        setSelectedBudget(matchedBudget || null);
      } else {
        setSelectedBudget(null);
      }
    } else {
      setSelectedBudget(null);
    }
  }, [category, transactionType, budgetData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: {[key: string]: string} = {};
    
    if (!date) newErrors.date = 'Date is required';
    if (!payee) newErrors.payee = 'Payee is required';
    if (!category) newErrors.category = 'Category is required';
    if (!amount || isNaN(parseFloat(amount))) newErrors.amount = 'Valid amount is required';
    if ((category === 'other_expense' || category === 'other_income') && !customCategory) {
      newErrors.customCategory = 'Please specify a category';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Check if this expense would exceed budget
    if (transactionType === 'expense' && selectedBudget) {
      const newAmount = Math.abs(parseFloat(amount));
      const newTotal = selectedBudget.spent + newAmount;
      const newPercent = (newTotal / selectedBudget.budget) * 100;
      
      if (newPercent > 100 && !showWarning) {
        setShowWarning(true);
        return;
      }
    }
    
    // Create transaction object
    let finalCategory = category;
    
    if (category === 'other_expense' || category === 'other_income') {
      finalCategory = customCategory;
    } else if (transactionType === 'expense') {
      // Check in budget categories
      const budgetCat = budgetCategories.find(c => c.id === category);
      if (budgetCat) {
        finalCategory = budgetCat.name;
      }
      
      // Check in expense categories
      const expenseCat = expenseCategories.find(c => c.id === category);
      if (expenseCat) {
        finalCategory = expenseCat.name;
      }
    } else {
      // Check if this is a savings goal
      if (category.startsWith('goal_')) {
        const goalId = category.replace('goal_', '');
        const goal = goalsData.find((g, idx) => idx.toString() === goalId);
        if (goal) {
          finalCategory = goal.name;
        } else {
          finalCategory = incomeCategories.find(c => c.id === category)?.name || category;
        }
      } else {
        finalCategory = incomeCategories.find(c => c.id === category)?.name || category;
      }
    }
    
    const transaction: Transaction = {
      id: Date.now(), // Use timestamp as temporary ID
      date: formatDate(date),
      payee,
      category: finalCategory,
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
    setDate(getTodayFormatted());
    setPayee('');
    setCategory('');
    setCustomCategory('');
    setAmount('');
    setErrors({});
    setShowWarning(false);
    setSelectedBudget(null);
  };

  // Format date to match the format in the dashboard
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };
  
  // Get color based on budget usage
  const getBudgetUsageColor = (current: number, max: number) => {
    const percent = (current / max) * 100;
    if (percent > 90) return 'bg-red-500';
    if (percent > 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  // Calculate amount remaining in budget
  const getAmountRemaining = (budget: BudgetItem) => {
    return budget.budget - budget.spent;
  };
  
  // Get percent of budget used
  const getPercentUsed = (budget: BudgetItem) => {
    return Math.round((budget.spent / budget.budget) * 100);
  };
  
  // Get current amount that would be spent
  const getCurrentAmount = () => {
    return amount ? parseFloat(amount) : 0;
  };
  
  // Get new percent used if transaction is added
  const getNewPercentUsed = (budget: BudgetItem) => {
    const currentAmount = getCurrentAmount();
    const newSpent = budget.spent + currentAmount;
    return Math.round((newSpent / budget.budget) * 100);
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

        {showWarning && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">This transaction will exceed your budget!</p>
              <p className="text-sm text-red-700 mt-1">
                Adding ${getCurrentAmount().toFixed(2)} to {selectedBudget?.category} will put you at{' '}
                {getNewPercentUsed(selectedBudget!)}% of your budget.
              </p>
              <div className="mt-2 flex space-x-2">
                <button 
                  className="text-sm bg-white border border-red-300 text-red-700 px-3 py-1 rounded hover:bg-red-50"
                  onClick={() => setShowWarning(false)}
                >
                  Edit Transaction
                </button>
                <button 
                  className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  onClick={handleSubmit}
                >
                  Proceed Anyway
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
          
          {/* Amount */}
          <div className="mb-4">
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
              
              {/* Expense Categories */}
              {transactionType === 'expense' && (
                <>
                  <optgroup label="Budget Categories">
                    {budgetCategories.map((cat) => {
                      const budget = budgetData.find(item => item.category === cat.name);
                      const remaining = budget ? getAmountRemaining(budget) : null;
                      const percentUsed = budget ? getPercentUsed(budget) : null;
                      
                      return (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                          {budget && ` ($${remaining?.toFixed(2)} left, ${percentUsed}% used)`}
                        </option>
                      );
                    })}
                  </optgroup>
                  
                  <optgroup label="Expense Categories">
                    {expenseCategories.map((cat) => {
                      const budget = budgetData.find(item => item.category === cat.name);
                      const remaining = budget ? getAmountRemaining(budget) : null;
                      const percentUsed = budget ? getPercentUsed(budget) : null;
                      
                      return (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                          {budget && ` ($${remaining?.toFixed(2)} left, ${percentUsed}% used)`}
                        </option>
                      );
                    })}
                  </optgroup>
                </>
              )}
              
              {/* Savings Goals for Income Transactions */}
              {transactionType === 'income' && goalsData.length > 0 && (
                <>
                  <optgroup label="Savings Goals">
                    {goalsData.map((goal, idx) => (
                      <option key={`goal_${idx}`} value={`goal_${idx}`}>
                        {goal.name} (${goal.saved} / ${goal.target})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Income Categories">
                    {incomeCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </optgroup>
                </>
              )}
              
              {/* Regular Income Categories (if no goals) */}
              {transactionType === 'income' && goalsData.length === 0 && (
                incomeCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))
              )}
            </select>
            {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
          </div>

          {/* Budget Progress (for expenses) */}
          {transactionType === 'expense' && selectedBudget && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-800">{selectedBudget.category} Budget</span>
                <span className="text-sm font-medium">
                  ${selectedBudget.spent} <span className="text-gray-500">/ ${selectedBudget.budget}</span>
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                <div 
                  className={`h-full rounded-full ${getBudgetUsageColor(selectedBudget.spent, selectedBudget.budget)}`}
                  style={{ width: `${selectedBudget.percent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs">
                <span className={selectedBudget.percent > 90 ? 'text-red-600 font-medium' : 'text-gray-500'}>
                  {selectedBudget.percent}% used
                </span>
                <span className="text-gray-500">
                  ${getAmountRemaining(selectedBudget).toFixed(2)} remaining
                </span>
              </div>
              
              {/* Preview of new budget status */}
              {amount && !isNaN(parseFloat(amount)) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-1">After this transaction:</p>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                    <div 
                      className={`h-full rounded-full ${getBudgetUsageColor(
                        selectedBudget.spent + parseFloat(amount), 
                        selectedBudget.budget
                      )}`}
                      style={{ width: `${Math.min(getNewPercentUsed(selectedBudget), 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={getNewPercentUsed(selectedBudget) > 90 ? 'text-red-600 font-medium' : 'text-gray-500'}>
                      {getNewPercentUsed(selectedBudget)}% used
                    </span>
                    <span className="text-gray-500">
                      ${(getAmountRemaining(selectedBudget) - parseFloat(amount)).toFixed(2)} remaining
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Goal Progress (for incomes) */}
          {transactionType === 'income' && category && category.startsWith('goal_') && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              {(() => {
                const goalId = category.replace('goal_', '');
                const goal = goalsData[parseInt(goalId)];
                
                if (!goal) return null;
                
                const newAmount = amount ? parseFloat(amount) : 0;
                const newSaved = goal.saved + newAmount;
                const newPercent = Math.round((newSaved / goal.target) * 100);
                
                return (
                  <>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-800">{goal.name} Progress</span>
                      <span className="text-sm font-medium">
                        ${goal.saved} <span className="text-gray-500">/ ${goal.target}</span>
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                      <div 
                        className="h-full rounded-full bg-green-500"
                        style={{ width: `${goal.percent}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">
                        {goal.percent}% saved
                      </span>
                      <span className="text-gray-500">
                        ${(goal.target - goal.saved).toFixed(2)} to go
                      </span>
                    </div>
                    
                    {/* Preview of new goal status */}
                    {amount && !isNaN(parseFloat(amount)) && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-700 mb-1">After this transaction:</p>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                          <div 
                            className="h-full rounded-full bg-green-500"
                            style={{ width: `${Math.min(newPercent, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">
                            {newPercent}% saved
                          </span>
                          <span className="text-gray-500">
                            ${(goal.target - newSaved).toFixed(2)} to go
                          </span>
                        </div>
                        
                        {newPercent >= 100 && (
                          <div className="mt-2 text-xs text-green-600 font-medium">
                            🎉 This will complete your savings goal!
                          </div>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {/* Custom Category (shown only when 'Other' is selected) */}
          {(category === 'other_expense' || category === 'other_income') && (
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

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6">
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