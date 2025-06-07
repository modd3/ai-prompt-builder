import React, { useState, useEffect } from 'react';
import TestResultsDisplay from './TestResultsDisplay';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

// Component for the "Test Your Prompts" section
// Accepts an initialPrompt object when a user clicks "Try It" on a card,
// and handlers for going back and editing the prompt.
const PromptTestForm = ({ initialPrompt = null, onBack, onEdit }) => {
    // Access authentication state and functions from context
    const { isAuthenticated, token } = useAuth(); // Get isAuthenticated and token from context

    // State for the selected saved prompt (if any) - used for the dropdown value
    const [selectedPromptId, setSelectedPromptId] = useState('');
    // State for the actual prompt content being tested (can be from saved or manually entered)
    const [currentPromptContent, setCurrentPromptContent] = useState('');
    // State for the selected LLM model for testing (primary test)
    const [testingModel, setTestingModel] = useState('ChatGPT (GPT-4)'); // Default testing model
    // State to manage input variables extracted from the prompt content
    const [variables, setVariables] = useState({}); // Format: { variableName: 'currentValue' }
    // State to hold the results received from the backend for the primary test
    const [testResults, setTestResults] = useState(null);
    // Loading state for the primary test button
    const [loading, setLoading] = useState(false);
    // State to hold the list of saved prompts for the dropdown
    const [savedPrompts, setSavedPrompts] = useState([]);

    // State to hold results for comparison tests
    // Object structure: { modelName: { response: '...', responseTime: '...', loading: false, error: null } }
    const [comparisonResults, setComparisonResults] = useState({});

    // Define the list of models available for testing/comparison
    // Ensure these match the cases handled in your backend test route
    // Use base names for the select dropdown, but base names for API calls
    const availableModels = ['ChatGPT', 'Claude', 'Gemini', 'HuggingFace']; // Base names for API calls
    const availableModelOptions = ['ChatGPT (GPT-4)', 'ChatGPT (GPT-3.5)', 'Claude', 'Gemini', 'HuggingFace']; // Display names for select


    // Effect hook to fetch saved prompts when the component mounts or initialPrompt changes
    useEffect(() => {
        const fetchSavedPrompts = async () => {
            if (!isAuthenticated || !token) { // Check if user is authenticated and token exists
                console.warn('User not authenticated. Cannot fetch private prompts.');
                setSavedPrompts([{ _id: '', title: 'Please log in to see your prompts', content: '' }]);
                return;
            }

            try {
                // Fetch the user's SAVED prompts from your backend
                const response = await fetch(process.env.REACT_APP_FRONTEND_API_URL + 'api/prompts/mine', { // Use the /api/prompts/mine endpoint
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Include the Bearer token
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.msg || `Failed to fetch user prompts: HTTP error! status: ${response.status}`);
                }

                const userPrompts = await response.json(); // Assuming the backend returns an array of prompts directly

                // Add a default "Select a prompt" option at the beginning of the array
                const promptsWithDefault = [{ _id: '', title: 'Select a prompt', content: '' }, ...userPrompts];
                setSavedPrompts(promptsWithDefault);

                // If an initial prompt object is passed (e.g., from clicking "Try It" on a card),
                // set the initial content and extract variables.
                if (initialPrompt) {
                    const foundPrompt = promptsWithDefault.find(p => p._id === initialPrompt._id);
                    setSelectedPromptId(foundPrompt ? initialPrompt._id : '');
                    setCurrentPromptContent(initialPrompt.content);
                    setVariables(extractVariablesFromPrompt(initialPrompt.content));
                } else {
                    setSelectedPromptId('');
                    setCurrentPromptContent('');
                    setVariables({});
                }

            } catch (error) {
                console.error('Error fetching saved prompts:', error);
                setSavedPrompts([{ _id: '', title: 'Error loading prompts', content: '' }]);
            }
        };

        fetchSavedPrompts(); // Call the fetch function

    }, [initialPrompt, isAuthenticated, token]); // Re-run this effect if initialPrompt, isAuthenticated, or token changes

    // Helper function to extract variable names (e.g., {{variable_name}}) from prompt content
    const extractVariablesFromPrompt = (content) => {
         const vars = {};
         if (!content || typeof content !== 'string') return vars;
         const regex = /\{\{([^}]+)\}\}/g; // Regex to find {{...}}
         let match;
         while ((match = regex.exec(content)) !== null) {
             vars[match[1].trim()] = '';
         }
         return vars;
    };

    // Handle selection change in the saved prompts dropdown
    const handlePromptSelect = (e) => {
        const promptId = e.target.value;
        setSelectedPromptId(promptId);
        const selected = savedPrompts.find(p => p._id === promptId);

        if (selected) {
            setCurrentPromptContent(selected.content);
            setVariables(extractVariablesFromPrompt(selected.content));
        } else {
            setCurrentPromptContent('');
            setVariables({});
        }
         setTestResults(null);
         setComparisonResults({});
    };

     // Handle changes in the variable input fields
    const handleVariableChange = (varName, value) => {
         setVariables(prevVars => ({
             ...prevVars,
             [varName]: value,
         }));
    };

    // Helper function to replace variable placeholders in prompt content with their values
    const injectVariables = (content, vars) => {
        let processedContent = content;
        for (const varName in vars) {
            const escapedVarName = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\{\\{${escapedVarName}\\}\\}`, 'g');
            processedContent = processedContent.replace(regex, vars[varName]);
        }
        return processedContent;
    };

    // Function to run a single test against a specific model
    const runTestForModel = async (modelName, contentToTest) => {
        const testData = {
            promptContent: contentToTest,
            targetModel: modelName,
            variables: variables,
        };

        try {
            // IMPORTANT: Replace "/test-prompt" with your actual backend endpoint for running tests
            const response = await fetch(process.env.REACT_APP_FRONTEND_API_URL + "api/test-prompt", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                     // Add authentication headers here too if needed for this endpoint
                },
                body: JSON.stringify(testData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || `Failed to run test for ${modelName}`);
            }

            const result = await response.json();
            return { model: modelName, response: result.response, responseTime: result.responseTime, loading: false, error: null };

        } catch (error) {
            console.error(`Error running test for ${modelName}:`, error);
            return { model: modelName, response: null, responseTime: null, loading: false, error: error.message };
        }
    };


    // Handle the "Run Test & Preview Results" button click (Primary Test)
    const handleRunTest = async () => {
        setLoading(true);
        setTestResults(null);
        setComparisonResults({});

        const finalPromptContent = injectVariables(currentPromptContent, variables);

        if (!finalPromptContent || !testingModel) {
             setTestResults({ error: 'Prompt content and target model must be selected.' });
             setLoading(false);
             return;
        }

        const primaryModelName = testingModel.split(' ')[0];

        const primaryResult = await runTestForModel(primaryModelName, finalPromptContent);

        setTestResults(primaryResult);
        setLoading(false);
    };

    // New handler to run a test for a single comparison model
    const handleRunSingleComparisonTest = async (modelName) => {
         const finalPromptContent = injectVariables(currentPromptContent, variables);
         if (!finalPromptContent) {
             console.warn("No prompt content to run comparison tests.");
             return;
         }

         setComparisonResults(prevResults => ({
             ...prevResults,
             [modelName]: { ...prevResults[modelName], loading: true, error: null }
         }));

         const result = await runTestForModel(modelName, finalPromptContent);

         setComparisonResults(prevResults => ({
             ...prevResults,
             [modelName]: result,
         }));
    };


    // Handle the "Regenerate" button click (calls the primary test handler)
    const handleRegenerate = () => {
        console.log("Regenerating primary test...");
        handleRunTest();
    };

    // Handle the "Edit Prompt" button click (calls the parent's onEdit handler)
    const handleEditPrompt = () => {
        console.log("Editing prompt...");
        if (onEdit) {
            onEdit({ content: currentPromptContent, initialPrompt: initialPrompt });
        }
    };


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Prompt Playground Section (Left Side) */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-600">smart_toy</span>
                    Prompt Playground
                </h4>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2 text-sm">
                        Select a saved prompt or create a new one
                    </label>
                    <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-sm"
                        value={selectedPromptId}
                        onChange={handlePromptSelect}
                    >
                        {savedPrompts.map(prompt => (
                             <option key={prompt._id} value={prompt._id}>{prompt.title}</option>
                        ))}
                    </select>
                </div>
                {/* Optional: Textarea to manually edit prompt content if no saved prompt is selected */}
                 {selectedPromptId === '' && (
                     <div className="mb-4">
                         <label className="block text-gray-700 mb-2 text-sm">
                             Prompt Content
                         </label>
                         <textarea
                             rows="6"
                             placeholder="Enter prompt content to test..."
                             className="w-full p-4 border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition text-sm"
                             value={currentPromptContent}
                             onChange={(e) => {
                                 setCurrentPromptContent(e.target.value);
                                 setVariables(extractVariablesFromPrompt(e.target.value));
                             }}
                         ></textarea>
                     </div>
                 )}

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2 text-sm">Model</label>
                    <select
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-sm"
                       value={testingModel}
                       onChange={(e) => setTestingModel(e.target.value)}
                    >
                        {availableModelOptions.map(modelOption => (
                             <option key={modelOption} value={modelOption}>{modelOption}</option>
                         ))}
                    </select>
                </div>

                {/* Variable Inputs - Dynamically generated based on extracted variables */}
                {Object.keys(variables).length > 0 && (
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2 text-sm">
                            Enter prompt variables
                        </label>
                        {Object.keys(variables).map(varName => (
                            <input
                                key={varName}
                                type="text"
                                placeholder={`${varName}: Value`}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition mb-2 text-sm"
                                value={variables[varName]}
                                onChange={(e) => handleVariableChange(varName, e.target.value)}
                            />
                        ))}
                    </div>
                )}

                {/* Run Test Button */}
                <button
                   className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition shadow hover:shadow-md flex items-center justify-center gap-2 group text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                   onClick={handleRunTest}
                   disabled={loading || !currentPromptContent}
                >
                    <span className={`material-symbols-outlined transform ${loading ? 'animate-spin' : 'group-hover:rotate-45'} transition-all duration-300`}>
                        {loading ? 'progress_activity' : 'rocket_launch'}
                    </span>
                    {loading ? 'Running Test...' : 'Run Test & Preview Results'}
                </button>

                {/* Button to go back to the home/explore section */}
                {onBack && (
                     <button
                         className="w-full mt-3 border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-50 transition text-gray-700 text-sm"
                         onClick={onBack}
                     >
                         Back to Prompts
                     </button>
                )}

            </div>

            {/* Test Results Section (Right Side) - Use the TestResultsDisplay component */}
            <TestResultsDisplay
                results={testResults}
                loading={loading}
                comparisonResults={comparisonResults}
                onRegenerate={handleRegenerate}
                onEditPrompt={handleEditPrompt}
                onRunSingleComparisonTest={handleRunSingleComparisonTest}
                availableModels={availableModels}
                primaryTestingModel={testingModel.split(' ')[0]}
            />
        </div>
    );
};

export default PromptTestForm;