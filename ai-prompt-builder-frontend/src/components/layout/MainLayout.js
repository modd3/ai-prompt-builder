import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { AiOutlineMenu } from 'react-icons/ai';

const MainLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar onCollapse={toggleSidebar} isCollapsed={isSidebarCollapsed} />

      {/* Main Content Area */}
      <div className="ml-64 transition-all duration-300">
        {/* Top Navigation for mobile */}
        <div className="hidden md:hidden bg-primary-600 dark:bg-primary-700 px-4 py-3">
          <button 
            onClick={toggleSidebar}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <AiOutlineMenu className="text-2xl" />
          </button>
        </div>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;