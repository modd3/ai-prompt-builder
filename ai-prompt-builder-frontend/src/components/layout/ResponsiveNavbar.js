import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AiOutlineHome, AiOutlineUser, AiOutlinePlus, AiOutlineExperiment, AiOutlineBulb } from 'react-icons/ai';
import { MdDarkMode, MdLightMode } from 'react-icons/md';

const ResponsiveNavbar = () => {
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
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and mobile menu toggle */}
          <div className="flex items-center">
            <span className="material-symbols-outlined text-primary-600 dark:text-primary-400 text-2xl">web</span>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 ml-2">Prompt Builder</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <NavLink 
              to="/"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-3 py-2 rounded-md text-sm font-medium"
              isActive={() => location.pathname === '/' || location.pathname.startsWith('/home')}
            >
              Home
            </NavLink>

            {isAuthenticated && (
              <NavLink 
                to="/profile"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-3 py-2 rounded-md text-sm font-medium"
              >
                Profile
              </NavLink>
            )}

            <NavLink 
              to="/create"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-3 py-2 rounded-md text-sm font-medium"
            >
              Create Prompt
            </NavLink>

            <NavLink 
              to="/test"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-3 py-2 rounded-md text-sm font-medium"
            >
              Test Prompts
            </NavLink>
          </div>

          {/* Right side: Dark mode and auth */}
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="material-symbols-outlined">
                {isDark ? <MdLightMode /> : <MdDarkMode />}
              </span>
            </button>

            {/* Authentication */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                  {user?.name || 'User'}
                </span>
                <button 
                  onClick={handleLogout}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <NavLink 
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm font-medium"
                >
                  Login
                </NavLink>
                <NavLink 
                  to="/register"
                  className="bg-primary-600 dark:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-500 dark:hover:bg-primary-600 transition-colors"
                >
                  Sign Up
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu (hidden on desktop) */}
      <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex space-x-3">
                <NavLink 
                  to="/"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                  isActive={() => location.pathname === '/' || location.pathname.startsWith('/home')}
                >
                  Home
                </NavLink>

                {isAuthenticated && (
                  <NavLink 
                    to="/profile"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Profile
                  </NavLink>
                )}

                <NavLink 
                  to="/create"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                >
                  Create
                </NavLink>

                <NavLink 
                  to="/test"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                >
                  Test
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ResponsiveNavbar;