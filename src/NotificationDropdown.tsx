import React, { useRef, useEffect } from 'react';
import { Check, X, Bell, AlertTriangle, TrendingUp, CreditCard, Calendar } from 'lucide-react';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ 
  isOpen, 
  onClose,
  darkMode = false 
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Hardcoded notifications data for prototype
  const notifications = [
    {
      id: 1,
      type: 'alert',
      title: 'Rent payment due soon',
      message: 'Your rent payment of $1,200 is due in 3 days.',
      time: '1 hour ago',
      read: false
    },
    {
      id: 2,
      type: 'success',
      title: 'Salary deposited',
      message: 'Your monthly salary of $3,500 has been deposited to your account.',
      time: '2 days ago',
      read: false
    },
    {
      id: 3,
      type: 'warning',
      title: 'Dining budget alert',
      message: "You've spent 85% of your dining budget this month.",
      time: '3 days ago',
      read: true
    },
    {
      id: 4,
      type: 'info',
      title: 'Bill payment successful',
      message: 'Your electric bill payment of $78.45 was successful.',
      time: '5 days ago',
      read: true
    },
    {
      id: 5,
      type: 'info',
      title: 'Investment update',
      message: 'Your investment portfolio has grown by 2.3% this month.',
      time: '1 week ago',
      read: true
    }
  ];
  
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
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <CreditCard className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      ref={dropdownRef}
      className={`absolute right-0 mt-2 w-80 rounded-md shadow-lg ${
        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      } z-50`}
      style={{ top: '100%' }}
    >
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Notifications</h3>
        <div className="flex space-x-2">
          <button 
            className={`p-1 rounded-full hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            title="Mark all as read"
          >
            <Check className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>
      
      <div className={`max-h-96 overflow-y-auto ${notifications.length === 0 ? 'py-6' : ''}`}>
        {notifications.length === 0 ? (
          <div className="text-center py-4">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No notifications</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} ${
                notification.read 
                  ? darkMode ? 'bg-gray-800' : 'bg-white' 
                  : darkMode ? 'bg-gray-700' : 'bg-blue-50'
              } hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors cursor-pointer`}
            >
              <div className="flex">
                <div className={`flex-shrink-0 mr-3 mt-1 ${notification.read ? 'opacity-60' : ''}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <h4 className={`text-sm font-medium ${
                      darkMode 
                        ? notification.read ? 'text-gray-400' : 'text-gray-200'
                        : notification.read ? 'text-gray-500' : 'text-gray-800'
                    }`}>
                      {notification.title}
                    </h4>
                    <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{notification.time}</span>
                  </div>
                  <p className={`text-sm mt-1 ${
                    darkMode 
                      ? notification.read ? 'text-gray-500' : 'text-gray-400'
                      : notification.read ? 'text-gray-500' : 'text-gray-600'
                  }`}>
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className={`p-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} text-center`}>
        <button 
          className={`text-sm font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
          onClick={onClose}
        >
          View all notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;