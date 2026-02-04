import React, { useState, useEffect } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'inbox' | 'crm' | 'report' | 'trial-pending';
  onTabChange: (tab: 'inbox' | 'crm' | 'report' | 'trial-pending') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const [trialCount, setTrialCount] = useState(0);

  useEffect(() => {
    const fetchTrialCount = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/crm/trial-requests');
        const data = await response.json();
        setTrialCount(data.length);
      } catch {
        // Ignore errors
      }
    };
    fetchTrialCount();
    const interval = setInterval(fetchTrialCount, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">🚀 Sales Saver</h1>
            </div>
            <nav className="flex space-x-2">
              <button
                onClick={() => onTabChange('inbox')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'inbox'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Inbox
              </button>
              <button
                onClick={() => onTabChange('trial-pending')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                  activeTab === 'trial-pending'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Trial Pending
                {trialCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {trialCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => onTabChange('crm')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'crm'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                CRM
              </button>
              <button
                onClick={() => onTabChange('report')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'report'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Report
              </button>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};