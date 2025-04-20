import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Save, X, TrendingUp, Home, CreditCard, PieChart, Calendar, ChevronDown, FileText, DollarSign, Bell, Settings, User, Sun, Moon } from 'lucide-react';
import { Goal, FinancialData } from './types';
import * as dataService from './dataService';
import { DarkModeContext } from './App';

// Modal component for adding or editing a goal
const GoalFormModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = { name: '', saved: 0, target: 0, percent: 0 },
  isEditing = false,
  darkMode
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (goal: Goal) => void;
  initialData?: Goal;
  isEditing?: boolean;
  darkMode: boolean;
}) => {
  // Use a ref to track whether the initial setup has been done
  const initializedRef = useRef(false);
  
  const [formData, setFormData] = useState({
    name: '',
    saved: '0',
    target: '0'
  });
  
  // Only initialize the form once when opened, not on every render
  useEffect(() => {
    if (isOpen && !initializedRef.current) {
      setFormData({
        name: initialData.name,
        saved: initialData.saved.toString(),
        target: initialData.target.toString()
      });
      initializedRef.current = true;
    } else if (!isOpen) {
      // Reset the initialization flag when the modal closes
      initializedRef.current = false;
    }
  }, [isOpen, initialData]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const savedAmount = parseFloat(formData.saved);
    const targetAmount = parseFloat(formData.target);
    
    if (formData.name.trim() === '') {
      alert('Please enter a goal name.');
      return;
    }
    
    if (isNaN(savedAmount) || savedAmount < 0) {
      alert('Please enter a valid saved amount.');
      return;
    }
    
    if (isNaN(targetAmount) || targetAmount <= 0) {
      alert('Please enter a valid target amount.');
      return;
    }
    
    if (savedAmount > targetAmount) {
      alert('Saved amount cannot be greater than the target amount.');
      return;
    }
    
    const percent = Math.round((savedAmount / targetAmount) * 100);
    
    onSave({
      name: formData.name,
      saved: savedAmount,
      target: targetAmount,
      percent
    });
    
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className={`relative w-full max-w-md p-6 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-xl`}>
        <button 
          className={`absolute top-4 right-4 ${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
        
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {isEditing ? 'Edit Savings Goal' : 'Add New Savings Goal'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Goal Name
            </label>
            <input 
              type="text" 
              name="name"
              value={formData.name} 
              onChange={handleChange} 
              className={`w-full px-3 py-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:outline-none focus:ring-1 focus:ring-blue-500`} 
              placeholder="e.g., Vacation, New Car, Emergency Fund" 
            />
          </div>
          
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Current Savings ($)
            </label>
            <input 
              type="number" 
              name="saved"
              min="0" 
              step="0.01" 
              value={formData.saved} 
              onChange={handleChange} 
              className={`w-full px-3 py-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:outline-none focus:ring-1 focus:ring-blue-500`} 
              placeholder="0.00" 
            />
          </div>
          
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Target Amount ($)
            </label>
            <input 
              type="number" 
              name="target"
              min="0.01" 
              step="0.01" 
              value={formData.target} 
              onChange={handleChange} 
              className={`w-full px-3 py-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:outline-none focus:ring-1 focus:ring-blue-500`} 
              placeholder="0.00" 
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose} 
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              {isEditing ? 'Save Changes' : 'Add Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const GoalsPage = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const { darkMode, toggleDarkMode } = React.useContext(DarkModeContext);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiContainerRef = React.useRef<HTMLDivElement | null>(null);
  
  // Function to load goals data
  const loadGoals = async () => {
    try {
      setIsLoading(true);
      const goalsData = await dataService.getGoals();
      setGoals(goalsData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading goals:', error);
      setIsLoading(false);
    }
  };
  
  // Load goals on component mount
  useEffect(() => {
    loadGoals();
  }, []);
  
  // Create confetti animation
  const createConfetti = () => {
    const confettiContainer = confettiContainerRef.current;
    if (!confettiContainer) return;
    
    // Clear any existing confetti
    confettiContainer.innerHTML = '';
    
    const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];
    const particleCount = 150;
    
    for (let i = 0; i < particleCount; i++) {
      const confetti = document.createElement('div');
      
      // Set basic styles
      confetti.style.position = 'absolute';
      confetti.style.width = `${Math.random() * 10 + 5}px`;
      confetti.style.height = `${Math.random() * 10 + 5}px`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.opacity = '0.8';
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      
      // Set initial position
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.top = `${Math.random() * 30 - 20}%`;
      
      // Add to container
      confettiContainer.appendChild(confetti);
      
      // Animate with random parameters
      const duration = Math.random() * 3 + 2; // 2-5 seconds
      const xMovement = (Math.random() - 0.5) * 20; // Random left/right movement
      
      confetti.animate(
        [
          { 
            transform: `translate(0, 0) rotate(0deg)`,
            opacity: 0.8
          },
          { 
            transform: `translate(${xMovement}vw, 100vh) rotate(${Math.random() * 360}deg)`,
            opacity: 0
          }
        ],
        {
          duration: duration * 1000,
          easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)',
          fill: 'forwards'
        }
      );
      
      // Remove element after animation completes
      setTimeout(() => {
        if (confetti.parentNode === confettiContainer) {
          confettiContainer.removeChild(confetti);
        }
      }, duration * 1000);
    }
  };
  
  // Effect to trigger confetti animation when state changes
  useEffect(() => {
    if (showConfetti) {
      createConfetti();
      
      // Hide confetti state after animation
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);
  
  // Add a new goal
  const handleAddGoal = async (newGoal: Goal) => {
    try {
      // Add functionality to add a new goal through the data service
      // This needs to be implemented in dataService.ts
      const updatedData = await dataService.addGoal(newGoal);
      setGoals(updatedData.goals);
      setShowConfetti(true);
    } catch (error) {
      console.error('Error adding goal:', error);
      alert('Failed to add goal. Please try again.');
    }
  };
  
  // Update an existing goal
  const handleUpdateGoal = async (updatedGoal: Goal) => {
    try {
      // Update goal in the data service
      // This needs to be implemented in dataService.ts
      const updatedData = await dataService.updateGoal(updatedGoal);
      setGoals(updatedData.goals);
      
      // Show confetti if we've reached a milestone
      const oldGoal = goals.find(g => g.name === updatedGoal.name);
      if (oldGoal && (Math.floor(oldGoal.percent / 25) < Math.floor(updatedGoal.percent / 25))) {
        setShowConfetti(true);
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      alert('Failed to update goal. Please try again.');
    }
  };
  
  // Delete a goal
  const handleDeleteGoal = async (goalName: string) => {
    if (window.confirm(`Are you sure you want to delete the goal "${goalName}"?`)) {
      try {
        // Delete goal from the data service
        // This needs to be implemented in dataService.ts
        const updatedData = await dataService.deleteGoal(goalName);
        setGoals(updatedData.goals);
      } catch (error) {
        console.error('Error deleting goal:', error);
        alert('Failed to delete goal. Please try again.');
      }
    }
  };
  
  // Open edit modal for a goal
  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };
  
  // Toggle reports dropdown
  const toggleReportsDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReportsDropdownOpen(!reportsDropdownOpen);
  };
  
  // Toggle settings dropdown
  const toggleSettingsDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSettingsDropdownOpen(!settingsDropdownOpen);
  };
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (reportsDropdownOpen) {
        setReportsDropdownOpen(false);
      }
      if (settingsDropdownOpen) {
        setSettingsDropdownOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [reportsDropdownOpen, settingsDropdownOpen]);
  
  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <DollarSign className={`h-12 w-12 ${darkMode ? 'text-blue-400' : 'text-blue-600'} mx-auto animate-pulse`} />
          <h2 className={`mt-4 text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>Loading your savings goals...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Confetti container with ref */}
      <div 
        ref={confettiContainerRef}
        className="fixed inset-0 pointer-events-none z-50" 
        style={{ display: showConfetti ? 'block' : 'none' }}
      ></div>
      
      {/* Navigation Header - Same as in FinancialDashboard */}
      <header className={`${darkMode ? 'bg-gray-800 shadow-md' : 'bg-white shadow-sm'}`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <DollarSign className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className={`text-xl font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>FinTrack</span>
          </div>
          
          <div className="hidden md:flex space-x-6">
            <a 
              onClick={() => navigate('/')} 
              className={`flex items-center cursor-pointer ${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}
            >
              <Home className="h-5 w-5 mr-1" />
              <span>Dashboard</span>
            </a>
            <a 
              onClick={() => navigate('/transactions')} 
              className={`flex items-center cursor-pointer ${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}
            >
              <CreditCard className="h-5 w-5 mr-1" />
              <span>Transactions</span>
            </a>
            <a 
              onClick={() => navigate('/budget')} 
              className={`flex items-center cursor-pointer ${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}
            >
              <PieChart className="h-5 w-5 mr-1" />
              <span>Budget</span>
            </a>
            <a 
              className={`flex items-center ${darkMode ? 'text-blue-400 font-medium' : 'text-blue-600 font-medium'}`}
            >
              <TrendingUp className="h-5 w-5 mr-1" />
              <span>Goals</span>
            </a>
            
            {/* Reports Dropdown */}
            <div className="relative">
              <button 
                onClick={(e) => toggleReportsDropdown(e)}
                className={`flex items-center ${
                  darkMode 
                    ? 'text-gray-300 hover:text-blue-400' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Calendar className="h-5 w-5 mr-1" />
                <span>Reports</span>
                <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${reportsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {reportsDropdownOpen && (
                <div 
                  className={`absolute top-full left-0 mt-1 ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200'
                  } rounded-md shadow-lg py-2 w-64 z-10 border`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    onClick={() => navigate('/reports/income-statement')}
                    className={`flex items-center px-4 py-2 text-sm ${
                      darkMode 
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400' 
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    } w-full text-left`}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Income Statement
                  </button>
                  <button 
                    onClick={() => navigate('/accounting/balance-sheet')}
                    className={`flex items-center px-4 py-2 text-sm ${
                      darkMode 
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400' 
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    } w-full text-left`}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Balance Sheet
                  </button>
                  <button 
                    onClick={() => navigate('/reports/cash-flows')}
                    className={`flex items-center px-4 py-2 text-sm ${
                      darkMode 
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400' 
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    } w-full text-left`}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Statement of Cash Flows
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className={`p-1.5 rounded-full ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Bell className="h-5 w-5" />
            </button>
            
            {/* Settings Dropdown */}
            <div className="relative">
              <button 
                className={`p-1.5 rounded-full ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                onClick={toggleSettingsDropdown}
              >
                <Settings className="h-5 w-5" />
              </button>
              
              {settingsDropdownOpen && (
                <div 
                  className={`absolute top-full right-0 mt-1 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-md shadow-lg py-2 w-48 z-10 border`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Dark Mode Toggle */}
                  <button 
                    onClick={toggleDarkMode}
                    className={`flex items-center px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'} w-full text-left`}
                  >
                    {darkMode ? (
                      <>
                        <Sun className="h-4 w-4 mr-2" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4 mr-2" />
                        Dark Mode
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            
            <button className={`flex items-center space-x-2 p-1.5 rounded-full ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Savings Goals</h1>
          <button 
            onClick={() => {
              setEditingGoal(null);
              setIsModalOpen(true);
            }}
            className="flex items-center rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" /> Add New Goal
          </button>
        </div>
        
        {/* Goals Dashboard */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mb-6`}>
          {goals.length === 0 ? (
            <div className="text-center py-10">
              <TrendingUp className={`h-12 w-12 mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-300'}`} />
              <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>No savings goals yet</h3>
              <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Create your first savings goal to start tracking your progress
              </p>
              <button 
                onClick={() => {
                  setEditingGoal(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Goal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal, index) => (
                <div 
                  key={index} 
                  className={`p-6 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{goal.name}</h3>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openEditModal(goal)}
                        className={`p-1.5 rounded ${darkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-200'}`}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteGoal(goal.name)}
                        className={`p-1.5 rounded ${darkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-200'}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Progress</span>
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{goal.percent}%</span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <div 
                        className={`h-full rounded-full ${
                          goal.percent >= 100 
                            ? 'bg-green-500' 
                            : goal.percent >= 75 
                              ? 'bg-blue-500' 
                              : goal.percent >= 50 
                                ? 'bg-blue-400' 
                                : goal.percent >= 25 
                                  ? 'bg-blue-300' 
                                  : 'bg-blue-200'
                        }`}
                        style={{ width: `${Math.min(goal.percent, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Saved</span>
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>${goal.saved.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between mb-4">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Target</span>
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>${goal.target.toFixed(2)}</span>
                  </div>
                  
                  <div className="mt-4">
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                      Remaining: ${(goal.target - goal.saved).toFixed(2)}
                    </div>
                    
                    {goal.percent < 100 && (
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {goal.percent >= 75 ? "Almost there!" : goal.percent >= 50 ? "Halfway there!" : goal.percent >= 25 ? "Great start!" : "Just started"}
                      </div>
                    )}
                    
                    {goal.percent >= 100 && (
                      <div className="text-xs text-green-500 font-medium">
                        Goal completed! 🎉
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Tips and Suggestions */}
        {goals.length > 0 && (
                     <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tips for Reaching Your Goals</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-4 rounded-lg border ${darkMode ? 'bg-blue-900/20 border-blue-800/30' : 'bg-blue-50 border-blue-100'}`}>
                <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  Automate Your Savings
                </h3>
                <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                  Set up automatic transfers to your savings account when you receive income to make consistent progress.
                </p>
              </div>
              
              <div className={`p-4 rounded-lg border ${darkMode ? 'bg-green-900/20 border-green-800/30' : 'bg-green-50 border-green-100'}`}>
                <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-green-300' : 'text-green-800'}`}>
                  Track Your Progress
                </h3>
                <p className={`text-sm ${darkMode ? 'text-green-200' : 'text-green-700'}`}>
                  Regularly monitor your goals to stay motivated. Celebrating small milestones can boost your determination.
                </p>
              </div>
              
              <div className={`p-4 rounded-lg border ${darkMode ? 'bg-purple-900/20 border-purple-800/30' : 'bg-purple-50 border-purple-100'}`}>
                <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>
                  Reduce Expenses
                </h3>
                <p className={`text-sm ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>
                  Look for ways to cut unnecessary spending. Even small savings can add up significantly over time.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Goal Form Modal */}
        <GoalFormModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={editingGoal ? handleUpdateGoal : handleAddGoal}
          initialData={editingGoal || undefined}
          isEditing={!!editingGoal}
          darkMode={darkMode}
        />
      </main>
    </div>
  );
};

export default GoalsPage;