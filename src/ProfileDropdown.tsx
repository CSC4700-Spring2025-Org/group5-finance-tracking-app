import React, { useRef, useEffect } from 'react';
import { User, Settings, LogOut, CreditCard, Key, HelpCircle, UserPlus } from 'lucide-react';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ 
  isOpen, 
  onClose,
  darkMode = false 
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Mock user data
  const user = {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    role: "Premium Account"
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      ref={dropdownRef}
      className={`absolute right-0 mt-2 w-64 rounded-md shadow-lg ${
        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      } z-50`}
      style={{ top: '100%' }}
    >
      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
            darkMode ? 'bg-gray-700' : 'bg-blue-100'
          }`}>
            <User className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-blue-600'}`} />
          </div>
          <div className="ml-3">
            <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{user.name}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{user.role}</p>
          </div>
        </div>
      </div>
      
      {/* Menu Options */}
      <div className="py-1">
        <button 
          className={`flex items-center w-full px-4 py-2 text-sm ${
            darkMode 
              ? 'text-gray-300 hover:bg-gray-700' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={onClose}
        >
          <User className="h-4 w-4 mr-3" />
          My Profile
        </button>
        
        <button 
          className={`flex items-center w-full px-4 py-2 text-sm ${
            darkMode 
              ? 'text-gray-300 hover:bg-gray-700' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={onClose}
        >
          <CreditCard className="h-4 w-4 mr-3" />
          Payment Methods
        </button>
        
        <button 
          className={`flex items-center w-full px-4 py-2 text-sm ${
            darkMode 
              ? 'text-gray-300 hover:bg-gray-700' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={onClose}
        >
          <UserPlus className="h-4 w-4 mr-3" />
          Invite Friends
        </button>
        
        <button 
          className={`flex items-center w-full px-4 py-2 text-sm ${
            darkMode 
              ? 'text-gray-300 hover:bg-gray-700' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={onClose}
        >
          <Settings className="h-4 w-4 mr-3" />
          Account Settings
        </button>
        
        <button 
          className={`flex items-center w-full px-4 py-2 text-sm ${
            darkMode 
              ? 'text-gray-300 hover:bg-gray-700' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={onClose}
        >
          <Key className="h-4 w-4 mr-3" />
          Security
        </button>
        
        <button 
          className={`flex items-center w-full px-4 py-2 text-sm ${
            darkMode 
              ? 'text-gray-300 hover:bg-gray-700' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={onClose}
        >
          <HelpCircle className="h-4 w-4 mr-3" />
          Help & Support
        </button>
      </div>
      
      {/* Logout */}
      <div className={`py-1 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button 
          className={`flex items-center w-full px-4 py-2 text-sm ${
            darkMode 
              ? 'text-red-400 hover:bg-gray-700' 
              : 'text-red-600 hover:bg-gray-100'
          }`}
          onClick={onClose}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;