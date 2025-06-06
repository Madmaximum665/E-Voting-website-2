// Storage keys used in the application
const STORAGE_KEYS = {
  USERS: 'users',
  ELECTIONS: 'elections',
  POSITIONS: 'positions',
  CANDIDATES: 'candidates',
  VOTES: 'votes',
};

/**
 * Utility to debug localStorage data
 * Helps identify inconsistencies between dev and production
 */
export const debugStorage = () => {
  console.group('🔍 LocalStorage Debug Info');
  
  // Check if localStorage is available
  if (typeof localStorage === 'undefined') {
    console.error('localStorage is not available in this environment');
    console.groupEnd();
    return;
  }
  
  // Log environment info
  console.log('Environment:', import.meta.env.MODE);
  console.log('Production:', import.meta.env.PROD);
  console.log('Development:', import.meta.env.DEV);
  
  // Log all storage keys and their values
  Object.values(STORAGE_KEYS).forEach(key => {
    try {
      const value = localStorage.getItem(key);
      const parsedValue = value ? JSON.parse(value) : null;
      console.log(`📦 ${key}:`, parsedValue);
      
      if (Array.isArray(parsedValue)) {
        console.log(`   Count: ${parsedValue.length} items`);
      }
    } catch (error) {
      console.error(`Error parsing ${key}:`, error);
    }
  });
  
  console.groupEnd();
};

/**
 * Force reset all data in localStorage
 */
export const forceResetAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log('✅ All localStorage data has been cleared');
  
  // Return true to indicate successful reset
  return true;
};

export default { debugStorage, forceResetAllData }; 