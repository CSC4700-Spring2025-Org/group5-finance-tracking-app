import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  DollarSign, Home, CreditCard, PieChart, TrendingUp, 
  Calendar, ChevronDown, FileText, Bell, Settings, User, Sun, Moon, RefreshCw
} from 'lucide-react';
import { DarkModeContext } from './App';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from './ProfileDropdown';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

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

  // Toggle notifications dropdown
const toggleNotificationsDropdown = (e: React.MouseEvent) => {
  e.stopPropagation();
  setNotificationsDropdownOpen(!notificationsDropdownOpen);
  // Close other dropdowns
  setProfileDropdownOpen(false);
  setSettingsDropdownOpen(false);
  setReportsDropdownOpen(false);
};

// Toggle profile dropdown
const toggleProfileDropdown = (e: React.MouseEvent) => {
  e.stopPropagation();
  setProfileDropdownOpen(!profileDropdownOpen);
  // Close other dropdowns
  setNotificationsDropdownOpen(false);
  setSettingsDropdownOpen(false);
  setReportsDropdownOpen(false);
};

  // Close dropdowns when clicking outside
  // Close dropdowns when clicking outside
useEffect(() => {
  const handleClickOutside = () => {
    if (reportsDropdownOpen) {
      setReportsDropdownOpen(false);
    }
    if (settingsDropdownOpen) {
      setSettingsDropdownOpen(false);
    }
    if (notificationsDropdownOpen) {
      setNotificationsDropdownOpen(false);
    }
    if (profileDropdownOpen) {
      setProfileDropdownOpen(false);
    }
  };
  
  document.addEventListener('click', handleClickOutside);
  return () => {
    document.removeEventListener('click', handleClickOutside);
  };
}, [reportsDropdownOpen, settingsDropdownOpen, notificationsDropdownOpen, profileDropdownOpen]);

  // Helper function to check if a path is active
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className={`${darkMode ? 'bg-gray-800 shadow-md' : 'bg-white shadow-sm'}`}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <DollarSign className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <span className={`text-xl font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>FinTrack</span>
        </div>
        
        <div className="hidden md:flex space-x-6">
          <a 
            onClick={() => navigate('/')} 
            className={`flex items-center cursor-pointer ${
              isActive('/') 
                ? darkMode ? 'text-blue-400 font-medium' : 'text-blue-600 font-medium'
                : darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <Home className="h-5 w-5 mr-1" />
            <span>Dashboard</span>
          </a>
          <a 
            onClick={() => navigate('/transactions')} 
            className={`flex items-center cursor-pointer ${
              isActive('/transactions') 
                ? darkMode ? 'text-blue-400 font-medium' : 'text-blue-600 font-medium'
                : darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <CreditCard className="h-5 w-5 mr-1" />
            <span>Transactions</span>
          </a>
          <a 
            onClick={() => navigate('/budget')} 
            className={`flex items-center cursor-pointer ${
              isActive('/budget') 
                ? darkMode ? 'text-blue-400 font-medium' : 'text-blue-600 font-medium'
                : darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <PieChart className="h-5 w-5 mr-1" />
            <span>Budget</span>
          </a>
          <a 
            onClick={() => navigate('/goals')} 
            className={`flex items-center cursor-pointer ${
              isActive('/goals') 
                ? darkMode ? 'text-blue-400 font-medium' : 'text-blue-600 font-medium'
                : darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <TrendingUp className="h-5 w-5 mr-1" />
            <span>Goals</span>
          </a>
          
          {/* Reports Dropdown */}
          <div className="relative">
            <button 
              onClick={(e) => toggleReportsDropdown(e)}
              className={`flex items-center ${
                isActive('/reports') || isActive('/accounting')
                  ? darkMode ? 'text-blue-400 font-medium' : 'text-blue-600 font-medium'
                  : darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
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
                    isActive('/reports/income-statement')
                      ? darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-50 text-blue-600'
                      : darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  } w-full text-left`}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Income Statement
                </button>
                <button 
                  onClick={() => navigate('/accounting/balance-sheet')}
                  className={`flex items-center px-4 py-2 text-sm ${
                    isActive('/accounting/balance-sheet')
                      ? darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-50 text-blue-600'
                      : darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  } w-full text-left`}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Balance Sheet
                </button>
                <button 
                  onClick={() => navigate('/reports/cash-flows')}
                  className={`flex items-center px-4 py-2 text-sm ${
                    isActive('/reports/cash-flows')
                      ? darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-50 text-blue-600'
                      : darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
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
  {/* Notifications Button and Dropdown */}
  <div className="relative">
    <button 
      className={`p-1.5 rounded-full ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
      onClick={toggleNotificationsDropdown}
    >
      <Bell className="h-5 w-5" />
    </button>
    <NotificationDropdown 
      isOpen={notificationsDropdownOpen} 
      onClose={() => setNotificationsDropdownOpen(false)} 
      darkMode={darkMode}
    />
  </div>
  
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
        
        {/* Reset Data Option */}
        <button 
          onClick={() => {
            if (window.confirm('Are you sure you want to reset all data to defaults? This action cannot be undone.')) {
              import('./initializeApp').then(module => {
                module.resetAppData().then(() => {
                  alert('Data has been reset to defaults successfully.');
                  window.location.reload();
                }).catch(error => {
                  console.error('Error resetting data:', error);
                  alert('Failed to reset data. Please try again.');
                });
              });
            }
          }}
          className={`flex items-center px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'} w-full text-left`}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset Data
        </button>
      </div>
    )}
  </div>
  
  {/* User Profile Button and Dropdown */}
  <div className="relative">
    <button 
      className={`flex items-center space-x-2 p-1.5 rounded-full ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
      onClick={toggleProfileDropdown}
    >
      <User className="h-5 w-5" />
    </button>
    <ProfileDropdown 
      isOpen={profileDropdownOpen} 
      onClose={() => setProfileDropdownOpen(false)} 
      darkMode={darkMode}
    />
  </div>
</div>
      </div>
    </header>
  );
};

export default Header;