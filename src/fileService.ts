/**
 * This service provides file operations for a client-side application
 * In a real production environment, this would be replaced with actual backend API calls
 * or a more robust storage solution.
 */

import { FinancialData } from './types';

// Local storage key for saving data
const STORAGE_KEY = 'financial-tracker-data';

/**
 * Initializes the local storage with default data if it doesn't exist
 */
export const initializeStorage = async (defaultData: FinancialData): Promise<void> => {
  try {
    // Check if data already exists in local storage
    const existingData = localStorage.getItem(STORAGE_KEY);
    
    if (!existingData) {
      // If no data exists, initialize with default data
      await saveDataToStorage(defaultData);
      console.log('Storage initialized with default data');
    }
  } catch (error) {
    console.error('Failed to initialize storage:', error);
    throw error;
  }
};

/**
 * Loads data from local storage
 */
export const loadDataFromStorage = async (): Promise<FinancialData> => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    
    if (!data) {
      throw new Error('No data found in storage');
    }
    
    return JSON.parse(data) as FinancialData;
  } catch (error) {
    console.error('Failed to load data from storage:', error);
    throw error;
  }
};

/**
 * Saves data to local storage
 */
export const saveDataToStorage = async (data: FinancialData): Promise<void> => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data to storage:', error);
    throw error;
  }
};

/**
 * Exports data as a JSON file that can be downloaded by the user
 */
export const exportDataAsJSON = async (data: FinancialData): Promise<string> => {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Failed to export data:', error);
    throw error;
  }
};

/**
 * Imports data from a JSON file uploaded by the user
 */
export const importDataFromJSON = async (file: File): Promise<FinancialData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target || typeof event.target.result !== 'string') {
          reject(new Error('Failed to read file'));
          return;
        }
        
        const data = JSON.parse(event.target.result) as FinancialData;
        
        // Validate imported data structure
        if (!data.profile || !data.transactions || !data.budgets || !data.goals) {
          reject(new Error('Invalid data structure in imported file'));
          return;
        }
        
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Resets all data to factory defaults
 * This would typically be replaced with a fetch to get default data from the server
 */
export const resetData = async (defaultData: FinancialData): Promise<void> => {
  try {
    await saveDataToStorage(defaultData);
  } catch (error) {
    console.error('Failed to reset data:', error);
    throw error;
  }
};