import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the Authentication Context
const AuthContext = createContext();

// Auth Provider Component
// This component will wrap your application and manage the authentication state
export const AuthProvider = ({ children }) => {
    // State to hold the authenticated user object and JWT token
    // Initialize state from localStorage to persist login across sessions
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true); // Loading state to check localStorage initially

    // Effect to load user and token from localStorage when the app starts
    useEffect(() => {
        const loadAuthData = () => {
            try {
                const storedUser = localStorage.getItem('user');
                const storedToken = localStorage.getItem('token');

                if (storedUser && storedToken) {
                    setUser(JSON.parse(storedUser));
                    setToken(storedToken);
                    console.log('Auth data loaded from localStorage.');
                }
            } catch (error) {
                console.error('Failed to load auth data from localStorage:', error);
                // Clear potentially corrupted data
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            } finally {
                setLoading(false); // Loading is complete
            }
        };

        loadAuthData();
    }, []); // Empty dependency array means this effect runs only once on mount

    // Function to handle user login
    const login = (userData, authToken) => {
        // Set user and token state
        setUser(userData);
        setToken(authToken);
        // Store user data and token in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', authToken);
        console.log('User logged in and data stored.');
    };

    // Function to handle user logout
    const logout = () => {
        // Clear user and token state
        setUser(null);
        setToken(null);
        // Remove user data and token from localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        console.log('User logged out and data cleared.');
    };

    // The value provided by the context
    const authContextValue = {
        user, // The authenticated user object (or null)
        token, // The JWT token (or null)
        isAuthenticated: !!user, // Boolean indicating if a user is logged in
        loading, // Indicates if initial loading from localStorage is complete
        login, // Function to log in a user
        logout, // Function to log out a user
    };

    // Provide the context value to the children components
    return (
        <AuthContext.Provider value={authContextValue}>
             {/* Optionally render a loading spinner while checking localStorage */}
             {loading ? (
                 <div className="flex justify-center items-center h-screen">
                     <span className="material-symbols-outlined animate-spin text-4xl text-primary-600">
                         progress_activity
                     </span>
                 </div>
             ) : (
                 children // Render the rest of the application once loading is done
             )}
        </AuthContext.Provider>
    );
};

// Custom hook to easily access the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
