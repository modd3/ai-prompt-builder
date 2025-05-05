import React from 'react';
import HomePage from './pages/HomePage'; // Assuming HomePage is your main content component
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider

// Main App component
function App() {
  return (
    // Wrap the entire application content with AuthProvider
    // This makes the authentication context available to all components within HomePage
    <AuthProvider>
      <div className="App">
        {/* HomePage component contains the main layout and sections */}
        <HomePage />
      </div>
    </AuthProvider>
  );
}

export default App;
