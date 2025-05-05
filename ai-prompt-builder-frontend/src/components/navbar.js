import React, { useState } from "react";
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

// Navbar component
// Accepts handlers from HomePage to control section display and trigger search
// It now consumes auth state and logout handler directly from AuthContext
// and receives navigation handlers (onGoToLogin, onGoToRegister) as props.
const Navbar = ({
    onCreateClick,
    onExploreClick,
    onTestClick,
    onSearch,
    // Auth related navigation handlers received as props
    onGoToLogin, // Handler to navigate to login section in HomePage
    onGoToRegister // Handler to navigate to register section in HomePage
    // isAuthenticated, user, and onLogout are now obtained from useAuth()
}) => {
  // Consume auth state and logout handler directly from AuthContext
  const { isAuthenticated, user, logout } = useAuth();

  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // State for the search input

  // Handle search input change
  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search action (e.g., button click or Enter key)
  const handleSearch = () => {
    console.log("Searching for:", searchTerm);
    // Call the onSearch handler passed from the parent (HomePage)
    if (onSearch) {
      onSearch(searchTerm);
    }
    // Optionally close mobile menu after search
    setMobileMenuOpen(false);
  };

  // Handle key press in search input (e.g., Enter key)
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Helper function to close mobile menu when a link is clicked
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Handle logout action - uses the logout function from AuthContext
  const handleLogout = () => {
      logout(); // Call the logout handler from context
      closeMobileMenu(); // Close mobile menu after logging out
  };

  return (
    <header className="w-full bg-gradient-to-br from-white to-gray-50 font-sans border-b border-gray-200">
      <div className="px-4 md:px-6 py-4 flex justify-between items-center">

        {/* Brand */}
        <button className="flex items-center gap-2 focus:outline-none" onClick={() => { onExploreClick(); closeMobileMenu(); }} aria-label="Go to Home Page">
            <div className="bg-primary-600 text-white p-1 rounded-md">
                <span className="material-symbols-outlined">psychology</span>
            </div>
            <span className="font-bold text-xl">PromptShare</span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <button className="font-medium hover:text-primary-600 transition-colors focus:outline-none" onClick={onExploreClick}>Home</button>
          {/* Conditionally show "Create Prompt" based on authentication status from context */}
          {isAuthenticated && (
             <button className="font-medium hover:text-primary-600 transition-colors focus:outline-none" onClick={onCreateClick}>Create Prompt</button>
          )}
          <button className="font-medium hover:text-primary-600 transition-colors focus:outline-none" onClick={onTestClick}>Test Prompt</button>
          <button className="font-medium text-gray-500 cursor-not-allowed">Community</button> {/* Placeholder */}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-600 hover:text-primary-600 transition-colors focus:outline-none"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <span className="material-symbols-outlined text-3xl">
              {isMobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>

        {/* Right-side (Desktop Only) */}
        <div className="hidden md:flex items-center gap-4">
          {/* Desktop Search Input and Button */}
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-primary-500 transition-all">
               <input
                   type="text"
                   placeholder="Search prompts..."
                   className="px-3 py-1.5 text-sm outline-none"
                   value={searchTerm}
                   onChange={handleSearchInputChange}
                   onKeyDown={handleSearchKeyPress}
               />
               <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600" onClick={handleSearch} aria-label="Perform search">
                    <span className="material-symbols-outlined text-base">search</span>
               </button>
          </div>

          {/* Conditionally render Auth/User links based on authentication status from context */}
          {isAuthenticated ? (
              // If authenticated, show user profile dropdown
              <details className="relative group">
                <summary className="list-none flex items-center gap-2 cursor-pointer focus:outline-none">
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {/* Replace with user avatar if available */}
                    <span className="material-symbols-outlined text-gray-600">person</span>
                  </div>
                   {/* Display user's name or email from context */}
                   <span className="text-sm font-medium text-gray-700">{user?.name || user?.email || 'User'}</span> {/* Safely access user properties */}
                  <span className="material-symbols-outlined text-gray-500 group-hover:text-primary-600 transition-colors">
                    expand_more
                  </span>
                </summary>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg p-2 z-10">
                  {/* Replace # with actual routes/handlers */}
                  <a href="#" className="block px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">Profile</a>
                  <a href="#" className="block px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">Settings</a>
                  {/* Logout button - calls handleLogout which uses context logout */}
                  <button type="button" className="block w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 transition-colors" onClick={handleLogout}>Logout</button>
                </div>
              </details>
          ) : (
              // If not authenticated, show Login/Register links - calls props handlers
              <div className="flex items-center gap-4">
                  <button type="button" className="font-medium text-gray-600 hover:text-primary-600 transition-colors" onClick={onGoToLogin}>Login</button>
                  <button type="button" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition" onClick={onGoToRegister}>Sign Up</button>
              </div>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-3 animate-slide-down border-t border-gray-200 pt-4">
           {/* Mobile Search Input and Button */}
           <div className="flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-primary-500 transition-all">
               <input
                   type="text"
                   placeholder="Search prompts..."
                   className="px-3 py-2 text-sm outline-none w-full"
                   value={searchTerm}
                   onChange={handleSearchInputChange}
                   onKeyDown={handleSearchKeyPress}
               />
               <button type="button" className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600" onClick={handleSearch} aria-label="Perform search">
                    <span className="material-symbols-outlined text-base">search</span>
               </button>
            </div>
            {/* Mobile Nav Links */}
          <button type="button" className="font-medium text-left hover:text-primary-600 transition-colors focus:outline-none py-2" onClick={() => { onExploreClick(); closeMobileMenu(); }}>Home</button>
          {/* Conditionally show "Create Prompt" in mobile menu based on context */}
          {isAuthenticated && (
             <button type="button" className="font-medium text-left hover:text-primary-600 transition-colors focus:outline-none py-2" onClick={() => { onCreateClick(); closeMobileMenu(); }}>Create Prompt</button>
          )}
          <button type="button" className="font-medium text-left hover:text-primary-600 transition-colors focus:outline-none py-2" onClick={() => { onTestClick(); closeMobileMenu(); }}>Test Prompt</button>
          <button type="button" className="font-medium text-left text-gray-500 cursor-not-allowed py-2">Community</button> {/* Placeholder */}

          <hr className="my-2 border-gray-200" />

          {/* Conditionally render Auth/User links in mobile menu based on context */}
          {isAuthenticated ? (
              // If authenticated, show user links
              <>
                  <div className="flex items-center gap-2 py-2">
                       <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                           <span className="material-symbols-outlined text-gray-600 text-sm">person</span>
                       </div>
                        <span className="text-sm font-medium text-gray-700">{user?.name || user?.email || 'User'}</span> {/* Safely access user properties */}
                  </div>
                  {/* Replace # with actual routes/handlers */}
                  <a href="#" className="block font-medium hover:text-primary-600 transition-colors py-2">Profile</a>
                  <a href="#" className="block font-medium hover:text-primary-600 transition-colors py-2">Settings</a>
                   {/* Logout button - calls handleLogout which uses context logout */}
                  <button type="button" className="block w-full text-left font-medium hover:text-primary-600 transition-colors py-2" onClick={handleLogout}>Logout</button>
              </>
          ) : (
              // If not authenticated, show Login/Register links - calls props handlers
              <>
                  <button type="button" className="block w-full text-left font-medium hover:text-primary-600 transition-colors py-2" onClick={() => { onGoToLogin(); closeMobileMenu(); }}>Login</button>
                  <button type="button" className="block w-full text-left font-medium bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition text-sm" onClick={() => { onGoToRegister(); closeMobileMenu(); }}>Sign Up</button>
              </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
