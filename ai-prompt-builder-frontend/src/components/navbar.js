import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-gradient-to-br from-white to-gray-50 font-sans border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Brand */}
        <a href="/">
        <div className="flex items-center gap-2"> {/* Removed mb-4 */}
          <div className="bg-primary-600 p-1 rounded-md">
            <span className="material-symbols-outlined">psychology</span>
          </div>
            <span className="font-bold text-xl">PromptShare</span>
        </div> </a>
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="font-medium hover:text-primary-600 transition-colors">Home</Link>
          <Link to="/create" className="font-medium hover:text-primary-600 transition-colors">Create Prompt</Link>
          <Link to="/test" className="font-medium hover:text-primary-600 transition-colors">Test Prompt</Link>
          <Link to="/community" className="font-medium hover:text-primary-600 transition-colors">Community</Link>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-600 hover:text-primary-600 transition-colors"
          >
            <span className="material-symbols-outlined text-3xl">
              {isMobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>

        {/* Right-side (Desktop Only) */}
        <div className="hidden md:flex items-center gap-4">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <span className="material-symbols-outlined">search</span>
            <span>Search</span>
          </button>
          <details className="relative group">
            <summary className="list-none flex items-center gap-2 cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <span className="material-symbols-outlined">person</span>
              </div>
              <span className="material-symbols-outlined text-gray-500 group-hover:text-primary-600 transition-colors">
                expand_more
              </span>
            </summary>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg p-2 z-10">
              <a href="#" className="block px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">Profile</a>
              <a href="#" className="block px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">Settings</a>
              <a href="#" className="block px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">Logout</a>
            </div>
          </details>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-2 animate-slide-down">
          <Link to="/" className="font-medium hover:text-primary-600 transition-colors">Home</Link>
          <Link to="/create" className="font-medium hover:text-primary-600 transition-colors">Create Prompt</Link>
          <Link to="/test" className="font-medium hover:text-primary-600 transition-colors">Test Prompt</Link>
          <Link to="/community" className="font-medium hover:text-primary-600 transition-colors">Community</Link>
          <hr className="my-2 border-gray-200" />
          <Link to="/profile" className="font-medium hover:text-primary-600 transition-colors">Profile</Link>
          <Link to="/settings" className="font-medium hover:text-primary-600 transition-colors">Settings</Link>
          <Link to="/logout" className="font-medium hover:text-primary-600 transition-colors">Logout</Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
