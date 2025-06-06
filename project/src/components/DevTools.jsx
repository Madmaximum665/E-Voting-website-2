import { useState } from 'react';
import { debugStorage, forceResetAllData } from '../utils/storageDebugger';
import { resetAndInitializeData } from '../utils/initMockData';
import resetAllData from '../utils/resetData';

/**
 * DevTools component for debugging and fixing localStorage issues
 * Only shown in development mode
 */
const DevTools = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const isDev = import.meta.env.DEV;
  
  // Don't render in production
  if (!isDev) return null;
  
  const handleDebug = () => {
    debugStorage();
    setMessage('Check browser console for debug information');
    setTimeout(() => setMessage(''), 3000);
  };
  
  const handleReset = () => {
    if (window.confirm('This will reset all application data. Are you sure?')) {
      forceResetAllData();
      resetAndInitializeData();
      setMessage('All data has been reset and reinitialized');
      setTimeout(() => setMessage(''), 3000);
      
      // Reload the page to ensure everything is fresh
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };
  
  const handleFixElections = () => {
    if (window.confirm('This will reset all data and create a sample election with positions and candidates. Continue?')) {
      resetAllData();
      setMessage('Sample election with positions and candidates created');
      setTimeout(() => setMessage(''), 3000);
      
      // Reload the page to ensure everything is fresh
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700"
          title="Dev Tools"
        >
          🛠️
        </button>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-800">Dev Tools</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          {message && (
            <div className="mb-3 p-2 bg-blue-50 text-blue-700 text-sm rounded">
              {message}
            </div>
          )}
          
          <div className="space-y-2">
            <button
              onClick={handleDebug}
              className="w-full py-2 px-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Debug Storage
            </button>
            <button
              onClick={handleReset}
              className="w-full py-2 px-3 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reset All Data
            </button>
            <button
              onClick={handleFixElections}
              className="w-full py-2 px-3 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Fix Elections Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevTools; 