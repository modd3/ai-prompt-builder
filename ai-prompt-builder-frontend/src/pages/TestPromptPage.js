import React from 'react';
import PromptTestForm from '../components/PromptTestForm';
import { useAuth } from '../context/AuthContext';

const TestPromptPage = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Test Prompts
          </h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Please log in to test prompts.
            </p>
            <div className="flex gap-3">
              <a href="/login" className="bg-primary-600 dark:bg-primary-700 text-white px-4 py-2 rounded-md hover:bg-primary-500 dark:hover:bg-primary-600 transition-colors">
                Login
              </a>
              <a href="/register" className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                Register
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Test Prompts
        </h1>
        <PromptTestForm />
      </div>
    </div>
  );
};

export default TestPromptPage;