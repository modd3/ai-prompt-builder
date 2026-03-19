import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AiOutlineHome, AiOutlineUser, AiOutlinePlus, AiOutlineExperiment, AiOutlineSetting, AiOutlineBulb } from 'react-icons/ai';
import { MdDarkMode, MdLightMode } from 'react-icons/md';

const Sidebar = ({ onCollapse, isCollapsed }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDark(darkMode);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    document.body.classList.toggle('dark', newDarkMode);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 transition-all duration-300 z-50 ${isCollapsed ? '-left-64' : ''}`}>
      <div className="h-16 bg-primary-600 dark:bg-primary-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-white text-2xl">web</span>
          <h1 className="text-white font-bold text-lg">Prompt Builder</h1>
        </div>
        <button 
          onClick={onCollapse}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <span className="material-symbols-outlined">
            {isCollapsed ? 'menu_open' : 'menu'}
          </span>
        </button>
      </div>

      <nav className="mt-6 px-4">
        <div className="space-y-2 mb-8">
          <NavLink 
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-primary-50 dark:hover:bg-primary-900/50"
            isActive={() => location.pathname === '/' || location.pathname.startsWith('/home')}
          >
            <AiOutlineHome className="text-primary-600 dark:text-primary-400" />
            <span className="text-gray-700 dark:text-gray-300">Home</span>
          </NavLink>

          {isAuthenticated && (
            <NavLink 
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-primary-50 dark:hover:bg-primary-900/50"
            >
              <AiOutlineUser className="text-primary-600 dark:text-primary-400" />
              <span className="text-gray-700 dark:text-gray-300">Profile</span>
            </NavLink>
          )}

          <NavLink 
            to="/create"
            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-primary-50 dark:hover:bg-primary-900/50"
          >
            <AiOutlinePlus className="text-primary-600 dark:text-primary-400" />
            <span className="text-gray-700 dark:text-gray-300">Create Prompt</span>
          </NavLink>

          <NavLink 
            to="/test"
            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-primary-50 dark:hover:bg-primary-900/50"
          >
            <AiOutlineExperiment className="text-primary-600 dark:text-primary-400" />
            <span className="text-gray-700 dark:text-gray-300">Test Prompts</span>
          </NavLink>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-4">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-primary-50 dark:hover:bg-primary-900/50 cursor-pointer" onClick={toggleDarkMode}>
            <span className="material-symbols-outlined">
              {isDark ? <MdLightMode /> : <MdDarkMode />}
            </span>
            <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
          </div>

          {isAuthenticated && (
            <div 
              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-primary-50 dark:hover:bg-primary-900/50 cursor-pointer"
              onClick={handleLogout}
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="text-gray-700 dark:text-gray-300">Logout</span>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;