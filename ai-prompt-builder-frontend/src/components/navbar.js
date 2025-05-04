import React, { useState } from "react";
// Assuming we are controlling sections via state in HomePage,
// we might not use react-router-dom Link directly for section navigation,
// but keep it for potential future routing to separate pages.
// import { Link } from "react-router-dom";

// Navbar component
// Accepts handlers from HomePage to control section display and trigger search
const Navbar = ({ onCreateClick, onExploreClick, onTestClick, onSearch }) => {
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
  // Changed from onKeyPress to onKeyDown
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Helper function to close mobile menu when a link is clicked
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full bg-gradient-to-br from-white to-gray-50 font-sans border-b border-gray-200">
      {/* Removed max-w-screen-xl and mx-auto from this div */}
      {/* Padding (px-4 md:px-6) and flex properties remain */}
      <div className="px-4 md:px-6 py-4 flex justify-between items-center">

        {/* Brand */}
        {/* Use a button or div with onClick to navigate to home section */}
        <button className="flex items-center gap-2 focus:outline-none" onClick={() => { onExploreClick(); closeMobileMenu(); }} aria-label="Go to Home Page">
            <div className="bg-primary-600 text-white p-1 rounded-md">
                <span className="material-symbols-outlined">psychology</span>
            </div>
            <span className="font-bold text-xl">PromptShare</span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {/* Use buttons or divs with onClick to navigate sections */}
          <button className="font-medium hover:text-primary-600 transition-colors focus:outline-none" onClick={onExploreClick}>Home</button>
          <button className="font-medium hover:text-primary-600 transition-colors focus:outline-none" onClick={onCreateClick}>Create Prompt</button>
          <button className="font-medium hover:text-primary-600 transition-colors focus:outline-none" onClick={onTestClick}>Test Prompt</button>
          {/* Community link might navigate to a separate page */}
          {/* <Link to="/community" className="font-medium hover:text-primary-600 transition-colors">Community</Link> */}
          {/* For now, treat Community as a section or placeholder */}
           <button className="font-medium text-gray-500 cursor-not-allowed">Community</button> {/* Placeholder */}
        </nav>

        {/* Mobile Menu Button - This section should be visible ONLY on small screens */}
        <div className="md:hidden flex items-center gap-4"> {/* This div hides on md and larger screens */}
           {/* Mobile Search Icon (Optional - could trigger showing a search bar) */}
            {/* <button className="text-gray-600 hover:text-primary-600 transition-colors" aria-label="Search">
                 <span className="material-symbols-outlined">search</span>
            </button> */}
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
          {/* User Profile Dropdown */}
          <details className="relative group">
            <summary className="list-none flex items-center gap-2 cursor-pointer focus:outline-none">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {/* Replace with user avatar if available */}
                <span className="material-symbols-outlined text-gray-600">person</span>
              </div>
              <span className="material-symbols-outlined text-gray-500 group-hover:text-primary-600 transition-colors">
                expand_more
              </span>
            </summary>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg p-2 z-10">
              {/* Replace # with actual routes/handlers */}
              <a href="#" className="block px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">Profile</a>
              <a href="#" className="block px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">Settings</a>
              <a href="#" className="block px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">Logout</a>
            </div>
          </details>
        </div>
      </div>

      {/* Mobile Dropdown Menu - This content should be visible ONLY when the mobile menu button is clicked AND on small screens */}
      {isMobileMenuOpen && ( // This content is conditionally rendered based on state
        <div className="md:hidden px-6 pb-4 flex flex-col gap-3 animate-slide-down border-t border-gray-200 pt-4"> {/* This div also hides on md and larger screens */}
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
               <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600" onClick={handleSearch} aria-label="Perform search">
                    <span className="material-symbols-outlined text-base">search</span>
               </button>
            </div>
            {/* Mobile Nav Links */}
          <button className="font-medium text-left hover:text-primary-600 transition-colors focus:outline-none py-2" onClick={() => { onExploreClick(); closeMobileMenu(); }}>Home</button> {/* Added py-2 */}
          <button className="font-medium text-left hover:text-primary-600 transition-colors focus:outline-none py-2" onClick={() => { onCreateClick(); closeMobileMenu(); }}>Create Prompt</button> {/* Added py-2 */}
          <button className="font-medium text-left hover:text-primary-600 transition-colors focus:outline-none py-2" onClick={() => { onTestClick(); closeMobileMenu(); }}>Test Prompt</button> {/* Added py-2 */}
          {/* Community link */}
           <button className="font-medium text-left text-gray-500 cursor-not-allowed py-2">Community</button> {/* Placeholder */}
          <hr className="my-2 border-gray-200" />
          {/* User Links */}
          {/* Replace # with actual routes/handlers */}
          <a href="#" className="block font-medium hover:text-primary-600 transition-colors py-2">Profile</a> {/* Added py-2 */}
          <a href="#" className="block font-medium hover:text-primary-600 transition-colors py-2">Settings</a> {/* Added py-2 */}
          <a href="#" className="block font-medium hover:text-primary-600 transition-colors py-2">Logout</a> {/* Added py-2 */}
        </div>
      )}
    </header>
  );
};

export default Navbar;
