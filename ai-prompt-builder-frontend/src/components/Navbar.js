import React, { useState, useEffect, useRef } from 'react'; // Import useEffect and useRef
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

// Component for the main navigation bar at the top of the page
// Accepts handlers for navigation actions and authentication links/logout
const Navbar = ({
    onCreateClick,
    onExploreClick,
    onTestClick,
    onSearch, // Handler for search action
    onGoToLogin, // Handler to navigate to login section
    onGoToRegister, // Handler to navigate to register section
    onGoHome, // Handler for logo/Home button to scroll to top
    onGoToProfile // NEW: Handler to navigate to profile section
}) => {
    // Access authentication state and functions from context
    const { isAuthenticated, user, logout } = useAuth();

    // State for the search input value
    const [searchTerm, setSearchTerm] = useState('');
    // State to control the visibility of the mobile menu
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    // State to control the visibility of the desktop user dropdown
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false); // New state for desktop dropdown

    // Ref for the mobile menu container to detect clicks outside
    const mobileMenuRef = useRef(null);
    // Ref for the mobile menu button itself to exclude it from outside clicks
    const menuButtonRef = useRef(null);
    // Ref for the desktop user dropdown container to detect clicks outside
    const userDropdownRef = useRef(null); // New ref for desktop dropdown
    // Ref for the desktop user dropdown trigger button
    const userDropdownButtonRef = useRef(null); // New ref for desktop dropdown trigger


    // Effect to handle clicks outside the mobile menu to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close the mobile menu if it's open and the click is outside the menu and not on the menu button
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) &&
                menuButtonRef.current && !menuButtonRef.current.contains(event.target)) {
                setIsMobileMenuOpen(false);
            }

            // Close the desktop user dropdown if it's open and the click is outside the dropdown and not on the trigger button
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target) &&
                userDropdownButtonRef.current && !userDropdownButtonRef.current.contains(event.target)) {
                setIsUserDropdownOpen(false);
            }
        };

        // Add the event listener when the component mounts
        document.addEventListener('mousedown', handleClickOutside);

        // Clean up the event listener when the component unmounts
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileMenuOpen, isUserDropdownOpen]); // Re-run effect if either menu state changes


    // Handle input change for the search bar
    const handleSearchInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Handle search button click or pressing Enter in the search bar
    const handleSearchSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission if it were a form
        if (onSearch && searchTerm.trim()) {
            onSearch(searchTerm.trim()); // Call the parent's search handler with the trimmed term
        }
        // Optional: Clear the search term after submitting
        // setSearchTerm('');
    };

    // Handle key press in the search input (e.g., Enter key)
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearchSubmit(e); // Call the submit handler on Enter
        }
    };

    // Toggle the mobile menu visibility
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        // Close desktop dropdown if mobile menu opens
        if (!isMobileMenuOpen) setIsUserDropdownOpen(false);
    };

    // Toggle the desktop user dropdown visibility
    const toggleUserDropdown = () => {
        setIsUserDropdownOpen(!isUserDropdownOpen);
        // Close mobile menu if desktop dropdown opens
        if (!isUserDropdownOpen) setIsMobileMenuOpen(false);
    };

    // Close the mobile menu and call the respective handler
    const handleMobileMenuItemClick = (handler) => {
        setIsMobileMenuOpen(false); // Close the menu
        if (handler) handler(); // Call the passed handler
    };

    // Close the desktop user dropdown and call the respective handler
    const handleUserDropdownItemClick = (handler) => {
        setIsUserDropdownOpen(false); // Close the dropdown
        if (handler) handler(); // Call the passed handler
    };


    return (
        // Fixed navbar at the top, with padding and shadow
        <header className="sticky top-0 z-50 bg-white shadow-md">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo - Clicking should go to the top of the home page */}
                {/* Restored original logo styling */}
                <button
                    className="flex items-center gap-2 text-gray-800 hover:text-primary-600 transition-colors focus:outline-none"
                    onClick={onGoHome} // Use the new onGoHome handler
                    aria-label="Go to homepage"
                >
                     {/* Restored original logo icon styling */}
                    <div className="bg-primary-600 text-white p-1 rounded-md">
                        <span className="material-symbols-outlined">psychology</span>
                    </div>
                    <span className="font-bold text-xl">PromptShare</span>
                </button>

                {/* Desktop Navigation Links - Hidden on small screens, flex on medium and up */}
                <nav className="hidden md:flex items-center gap-6">
                    {/* Home Link - Clicking should go to the top of the home page */}
                    <button
                        className="text-gray-600 hover:text-primary-600 transition-colors font-medium focus:outline-none"
                        onClick={onGoHome} // Use the new onGoHome handler
                    >
                        Home
                    </button>
                    <button
                        className="text-gray-600 hover:text-primary-600 transition-colors font-medium focus:outline-none"
                        onClick={onExploreClick} // Use the explore handler
                    >
                        Explore
                    </button>
                    <button
                        className="text-gray-600 hover:text-primary-600 transition-colors font-medium focus:outline-none"
                        onClick={onTestClick} // Use the test handler
                    >
                        Test
                    </button>
                     {/* Create Prompt Button - Only visible if authenticated */}
                     {isAuthenticated && (
                         <button
                             className="text-gray-600 hover:text-primary-600 transition-colors font-medium focus:outline-none"
                             onClick={onCreateClick} // Use the create handler
                         >
                             Create
                         </button>
                     )}
                    {/* TODO: Add a "My Prompts" link here if authenticated */}
                </nav>

                {/* Search Bar and Auth Buttons/User Info */}
                <div className="flex items-center gap-4">
                    {/* Search Input */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search prompts..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-sm w-32 md:w-48" // Adjusted width
                            value={searchTerm}
                            onChange={handleSearchInputChange}
                            onKeyPress={handleKeyPress} // Handle Enter key
                        />
                        <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-base">
                            search
                        </span>
                    </div>

                    {/* Authentication Buttons or User Info (Desktop) - Hidden on small screens */}
                    {!isAuthenticated ? (
                        // Show Login/Register buttons if not authenticated (Desktop)
                        <div className="hidden md:flex gap-2">
                            <button
                                className="text-primary-600 hover:text-primary-800 font-medium transition-colors text-sm focus:outline-none"
                                onClick={onGoToLogin} // Use login handler
                            >
                                Login
                            </button>
                            <button
                                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow text-sm focus:outline-none"
                                onClick={onGoToRegister} // Use register handler
                            >
                                Sign Up
                            </button>
                        </div>
                    ) : (
                        // Show User dropdown if authenticated (Desktop)
                        <div className="hidden md:flex relative"> {/* Added relative positioning for dropdown */}
                             <button
                                ref={userDropdownButtonRef} // Attach ref to the trigger button
                                className="flex items-center gap-2 text-gray-700 hover:text-primary-600 font-medium focus:outline-none text-sm"
                                onClick={toggleUserDropdown} // Toggle dropdown visibility
                             >
                                 {/* User Avatar/Icon */}
                                  <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-300 flex-shrink-0"> {/* Added flex-shrink-0 */}
                                      <img src={user?.avatarUrl || 'https://placehold.co/24x24/cccccc/000000?text=U'} alt="User Avatar" className="w-full h-full object-cover"/> {/* Placeholder */}
                                  </div>
                                 {user?.name || 'User'} {/* Display user name */}
                                  <span className="material-symbols-outlined text-base">
                                      {isUserDropdownOpen ? 'expand_less' : 'expand_more'} {/* Change icon based on dropdown state */}
                                  </span>
                             </button>
                             {/* Desktop User Dropdown Content - Conditionally rendered */}
                             {isUserDropdownOpen && (
                                 <div
                                     ref={userDropdownRef} // Attach ref to the dropdown content
                                     className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100"
                                 >
                                     {/* Dropdown Items */}
                                     <button
                                         className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors text-sm"
                                         onClick={() => handleUserDropdownItemClick(onGoToProfile)} // Link to Profile Page
                                     >
                                         Profile
                                     </button>
                                     <button
                                         className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors text-sm"
                                         onClick={() => { /* TODO: Implement Settings page navigation */ console.log('Go to Settings'); handleUserDropdownItemClick(null); }} // Close dropdown
                                     >
                                         Settings
                                     </button>
                                     <hr className="my-1 border-gray-200" /> {/* Separator */}
                                     <button
                                         className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm"
                                         onClick={() => handleUserDropdownItemClick(logout)} // Use the logout function from context
                                     >
                                         Logout
                                     </button>
                                 </div>
                             )}
                        </div>
                    )}

                    {/* Mobile Menu Button (Hamburger) - Visible on small screens, hidden on medium and up */}
                    <button
                        ref={menuButtonRef} // Attach ref to the button
                        className="md:hidden text-gray-600 hover:text-primary-600 transition-colors focus:outline-none"
                        onClick={toggleMobileMenu} // Toggle menu visibility
                        aria-label="Toggle mobile menu"
                    >
                        <span className="material-symbols-outlined">
                            {isMobileMenuOpen ? 'close' : 'menu'} {/* Change icon based on menu state */}
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Popup - Conditionally rendered */}
            {isMobileMenuOpen && (
                // Fixed overlay covering the screen
                <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40">
                    {/* Actual menu content - positioned on the right */}
                    <div
                        ref={mobileMenuRef} // Attach ref to the menu content
                        className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg p-6 flex flex-col gap-4 transform transition-transform duration-300 ease-in-out translate-x-0"
                    >
                        {/* Menu Links */}
                        <button
                            className="text-left text-gray-800 hover:text-primary-600 transition-colors font-medium focus:outline-none"
                            onClick={() => handleMobileMenuItemClick(onGoHome)}
                        >
                            Home
                        </button>
                        <button
                            className="text-left text-gray-800 hover:text-primary-600 transition-colors font-medium focus:outline-none"
                            onClick={() => handleMobileMenuItemClick(onExploreClick)}
                        >
                            Explore
                        </button>
                        <button
                            className="text-left text-gray-800 hover:text-primary-600 transition-colors font-medium focus:outline-none"
                            onClick={() => handleMobileMenuItemClick(onTestClick)}
                        >
                            Test
                        </button>
                         {/* Create Prompt Button - Only visible if authenticated */}
                         {isAuthenticated && (
                             <button
                                 className="text-left text-gray-800 hover:text-primary-600 transition-colors font-medium focus:outline-none"
                                 onClick={() => handleMobileMenuItemClick(onCreateClick)}
                             >
                                 Create
                             </button>
                         )}
                        {/* TODO: Add a "My Prompts" link here if authenticated */}

                        {/* Authentication Links or User Info */}
                        {!isAuthenticated ? (
                            // Show Login/Register buttons if not authenticated
                            <>
                                <hr className="border-gray-200 my-2"/> {/* Separator */}
                                <button
                                    className="text-left text-primary-600 hover:text-primary-800 font-medium transition-colors focus:outline-none"
                                    onClick={() => handleMobileMenuItemClick(onGoToLogin)}
                                >
                                    Login
                                </button>
                                <button
                                    className="text-left text-primary-600 hover:text-primary-800 font-medium transition-colors focus:outline-none"
                                    onClick={() => handleMobileMenuItemClick(onGoToRegister)}
                                >
                                    Sign Up
                                </button>
                            </>
                        ) : (
                            // Show User info, Profile, Settings, and Logout if authenticated
                            <>
                                <hr className="border-gray-200 my-2"/> {/* Separator */}
                                 {/* User Avatar and Name in Mobile Menu */}
                                <div className="flex items-center gap-2 text-gray-700">
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                                        <img src={user?.avatarUrl || 'https://placehold.co/32x32/cccccc/000000?text=U'} alt="User Avatar" className="w-full h-full object-cover"/>
                                    </div>
                                    <span className="font-medium">{user?.name || 'User'}</span>
                                </div>
                                {/* Profile and Settings links */}
                                <button
                                     className="text-left text-gray-800 hover:text-primary-600 transition-colors font-medium focus:outline-none"
                                     onClick={() => handleMobileMenuItemClick(onGoToProfile)} // Link to Profile Page
                                >
                                     Profile
                                </button>
                                <button
                                     className="text-left text-gray-800 hover:text-primary-600 transition-colors font-medium focus:outline-none"
                                     onClick={() => { /* TODO: Implement Settings page navigation */ console.log('Go to Settings'); handleMobileMenuItemClick(null); }}
                                >
                                     Settings
                                </button>
                                <button
                                    className="text-left text-gray-800 hover:text-primary-600 transition-colors font-medium focus:outline-none"
                                    onClick={() => handleMobileMenuItemClick(logout)}
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
