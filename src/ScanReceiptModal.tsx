import React, { useState } from 'react';
import { X, Camera, Upload, Check } from 'lucide-react';

interface ScanReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

const ScanReceiptModal: React.FC<ScanReceiptModalProps> = ({ isOpen, onClose, darkMode = false }) => {
  const [scanStage, setScanStage] = useState<'initial' | 'processing' | 'success'>('initial');
  
  // Simulated scan success function
  const simulateScan = () => {
    setScanStage('processing');
    
    // Simulate processing delay
    setTimeout(() => {
      setScanStage('success');
    }, 2000);
  };
  
  const handleDone = () => {
    // Reset state and close modal
    setScanStage('initial');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg w-full max-w-md p-6`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Scan Receipt</h2>
          <button 
            onClick={onClose}
            className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {scanStage === 'initial' && (
          <div className="py-4">
            <div className="mb-6 text-center">
              <p className={`mb-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Capture a photo of your receipt to automatically create a transaction
              </p>
              
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={simulateScan}
                  className={`flex items-center justify-center gap-2 px-4 py-3 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} rounded-lg transition-colors`}
                >
                  <Camera className="h-5 w-5" />
                  <span>Take Photo</span>
                </button>
                
                <button 
                  onClick={simulateScan}
                  className={`flex items-center justify-center gap-2 px-4 py-3 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} rounded-lg transition-colors`}
                >
                  <Upload className="h-5 w-5" />
                  <span>Upload Image</span>
                </button>
              </div>
            </div>
            
            <div className={`p-3 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Receipt Scanning Tips:</h3>
              <ul className={`text-xs space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>• Make sure the receipt is flat and well-lit</li>
                <li>• Ensure all corners of the receipt are visible</li>
                <li>• Include the total amount, date, and merchant name</li>
                <li>• Hold your camera steady for a clear image</li>
              </ul>
            </div>
          </div>
        )}
        
        {scanStage === 'processing' && (
          <div className="py-8 text-center">
            <div className={`h-16 w-16 rounded-full ${darkMode ? 'bg-blue-900' : 'bg-blue-100'} mx-auto mb-4 flex items-center justify-center`}>
              <div className="h-8 w-8 border-t-2 border-r-2 border-blue-600 rounded-full animate-spin"></div>
            </div>
            <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Processing Receipt</h3>
            <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Analyzing image and extracting transaction details...</p>
          </div>
        )}
        
        {scanStage === 'success' && (
          <div className="py-4">
            <div className="text-center mb-6">
              <div className={`h-16 w-16 rounded-full ${darkMode ? 'bg-green-900' : 'bg-green-100'} mx-auto mb-4 flex items-center justify-center`}>
                <Check className={`h-8 w-8 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Receipt Processed!</h3>
              <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>We've extracted the following details:</p>
            </div>
            
            <div className={`mb-6 rounded-md p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Merchant:</span>
                  <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Grocery Store Inc.</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Date:</span>
                  <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Apr 20, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Amount:</span>
                  <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>$78.24</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Category:</span>
                  <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Groceries</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleDone}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Save Transaction
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanReceiptModal;