import React from 'react';
import HomePage from './pages/HomePage'; // Assuming HomePage is your main content component
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import ErrorBoundary from './components/ErrorBoundary'; // Import ErrorBoundary

// Main App component
function App() {
  return (
    // Wrap the entire application with ErrorBoundary for graceful error handling
    <ErrorBoundary>
      {/* Wrap the application content with AuthProvider */}
      {/* This makes the authentication context available to all components within HomePage */}
      <AuthProvider>
        <div className="App">
          {/* HomePage component contains the main layout and sections */}
          <HomePage />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
