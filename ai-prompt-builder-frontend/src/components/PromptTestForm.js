import React, { useState, useEffect } from 'react';
import TestResultsDisplay from './TestResultsDisplay';

// Component for the "Test Your Prompts" section
// Accepts an initialPrompt object when a user clicks "Try It" on a card,
// and handlers for going back and editing the prompt.
const PromptTestForm = ({ initialPrompt = null, onBack, onEdit }) => { // Added onEdit prop
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
            try {
                // --- START: Code to fetch saved prompts from backend ---

                // Define your backend API endpoint
                // IMPORTANT: Replace '/api/saved-prompts' with your actual backend URL
                const apiUrl = process.env.REACT_APP_FRONTEND_API_URL + '/api/saved-prompts';

                // Make the API call
                const response = await fetch(apiUrl, {
                    method: 'GET', // Or the appropriate HTTP method
                    headers: {
                        'Content-Type': 'application/json',
                        // Add any necessary authentication headers, e.g.:
                        // 'Authorization': `Bearer ${yourAuthToken}`, // You will likely need this
                    },
                });

                // Check if the request was successful
                if (!response.ok) {
                    // Handle non-200 responses
                    console.error(`Error fetching saved prompts: ${response.status} ${response.statusText}`);
                    // Depending on your error handling strategy, you might want to
                    // throw an error, set an error state, or return.
                     throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Parse the JSON response
                const fetchedPrompts = await response.json();

                // --- END: Code to fetch saved prompts from backend ---


                // --- START: Process fetched data and handle initialPrompt ---

                // Add a default "Select a prompt" option at the beginning of the fetched list
                const promptsWithDefault = [
                     { _id: '', title: 'Select a prompt', content: '' }, // Default option
                     ...fetchedPrompts, // Add the fetched prompts
                ];

                // Update the state with the fetched and combined prompts
                setSavedPrompts(promptsWithDefault);

                // Now, handle the initialPrompt after successfully fetching and setting savedPrompts
                if (initialPrompt && initialPrompt._id) {
                     // Find the initial prompt within the fetched prompts (or the combined list)
                     const foundInitial = promptsWithDefault.find(p => p._id === initialPrompt._id);

                     if (foundInitial) {
                          // If found, set the selected prompt, its content, and extract variables
                          setSelectedPromptId(foundInitial._id);
                          setCurrentPromptContent(foundInitial.content);
                          setVariables(extractVariablesFromPrompt(foundInitial.content));
                     } else {
                         // If initialPrompt._id was provided but not found in fetched saved prompts,
                         // it might be an external prompt (like from "Try It" on a card) that isn't saved yet.
                         // In this case, we set the content and variables directly from initialPrompt
                         // and keep the selectedPromptId as empty, indicating it's not a *saved* selection.
                         setSelectedPromptId(''); // Keep dropdown at "Select a prompt"
                         setCurrentPromptContent(initialPrompt.content);
                         setVariables(extractVariablesFromPrompt(initialPrompt.content));
                     }
                } else {
                    // If no initial prompt is provided, set default state
                    setSelectedPromptId('');
                    setCurrentPromptContent('');
                    setVariables({});
                }

                // --- END: Process fetched data and handle initialPrompt ---

            } catch (error) {
                console.error('Error fetching saved prompts:', error);
                // TODO: Handle error appropriately in your UI (e.g., show an error message)
                // Display an error option in the dropdown and clear other states
                 setSavedPrompts([{ _id: '', title: 'Error loading prompts', content: '' }]);
                 setSelectedPromptId('');
                 setCurrentPromptContent('');
                 setVariables({});
            }
        };

        fetchSavedPrompts(); // Call the fetch function

    }, [initialPrompt]); // Re-run this effect if the initialPrompt prop changes
    // Add other dependencies here if the fetch depends on them (e.g., user ID from context)
    // , setSavedPrompts, setSelectedPromptId, setCurrentPromptContent, setVariables, extractVariablesFromPrompt // Add these if you use useCallback or memoize these functions

    // Helper function to extract variable names (e.g., {{variable_name}}) from prompt content
    const extractVariablesFromPrompt = (content) => {
         const vars = {};
         if (!content || typeof content !== 'string') return vars; // Handle null/undefined or non-string content
         const regex = /\{\{([^}]+)\}\}/g; // Regex to find {{...}}
         let match;
         // Loop through all matches and add variable names to the vars object with empty values
         while ((match = regex.exec(content)) !== null) {
             vars[match[1].trim()] = ''; // Use the captured group [1] as the variable name
         }
         return vars;
    };

    // Handle selection change in the saved prompts dropdown
    const handlePromptSelect = (e) => {
        const promptId = e.target.value;
        setSelectedPromptId(promptId);
        // Find the selected prompt object from the savedPrompts list
        const selected = savedPrompts.find(p => p._id === promptId);

        if (selected) {
            setCurrentPromptContent(selected.content); // Set the content for testing
            setVariables(extractVariablesFromPrompt(selected.content)); // Extract variables from the selected prompt
        } else {
            // Handle the "Select a prompt" option or if prompt not found
            setCurrentPromptContent('');
            setVariables({});
        }
         setTestResults(null); // Clear previous primary test results when prompt changes
         setComparisonResults({}); // Clear previous comparison results
    };

     // Handle changes in the variable input fields
    const handleVariableChange = (varName, value) => {
         // Update the value of a specific variable in the variables state
         setVariables(prevVars => ({
             ...prevVars,
             [varName]: value,
         }));
    };

    // Helper function to replace variable placeholders in prompt content with their values
    const injectVariables = (content, vars) => {
        let processedContent = content;
        for (const varName in vars) {
            // Create a regular expression to find all occurrences of the variable placeholder
            // Escape special characters in the variable name for regex safety
            const escapedVarName = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\{\\{${escapedVarName}\\}\\}`, 'g');
            // Replace the placeholder with the variable's current value
            processedContent = processedContent.replace(regex, vars[varName]);
        }
        return processedContent;
    };

    // Function to run a single test against a specific model
    const runTestForModel = async (modelName, contentToTest) => {
        const testData = {
            promptContent: contentToTest,
            targetModel: modelName, // Use the base model name
            variables: variables, // Pass variables (even if not used by backend test route directly)
        };

        try {
            // IMPORTANT: Replace "/test-prompt" with your actual backend endpoint for running tests
            const response = await fetch(process.env.REACT_APP_FRONTEND_API_URL + "/test-prompt", {
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
        setLoading(true); // Set primary loading state
        setTestResults(null); // Clear previous primary results
        setComparisonResults({}); // Clear previous comparison results

        // Inject the current variable values into the prompt content
        const finalPromptContent = injectVariables(currentPromptContent, variables);

        // Basic validation
        if (!finalPromptContent || !testingModel) {
             setTestResults({ error: 'Prompt content and target model must be selected.' });
             setLoading(false);
             return;
        }

        // Extract the base model name from the selected testing model string (e.g., 'ChatGPT' from 'ChatGPT (GPT-4)')
        const primaryModelName = testingModel.split(' ')[0];

        // Run the primary test
        const primaryResult = await runTestForModel(primaryModelName, finalPromptContent);

        setTestResults(primaryResult); // Store the primary test result
        setLoading(false); // Reset primary loading state

        // No longer automatically trigger all comparison tests here.
        // They will be triggered individually by clicking the model buttons in TestResultsDisplay.
    };

    // New handler to run a test for a single comparison model
    const handleRunSingleComparisonTest = async (modelName) => {
         // Ensure there is content to test
         const finalPromptContent = injectVariables(currentPromptContent, variables);
         if (!finalPromptContent) {
             console.warn("No prompt content to run comparison tests.");
             return;
         }

         // Set loading state for this specific comparison model
         setComparisonResults(prevResults => ({
             ...prevResults,
             [modelName]: { ...prevResults[modelName], loading: true, error: null } // Preserve existing data, set loading
         }));

         // Run the test for the single model
         const result = await runTestForModel(modelName, finalPromptContent);

         // Update the state with the result for this specific model
         setComparisonResults(prevResults => ({
             ...prevResults,
             [modelName]: result, // Overwrite with the new result
         }));
    };


    // Handle the "Regenerate" button click (calls the primary test handler)
    const handleRegenerate = () => {
        console.log("Regenerating primary test...");
        handleRunTest(); // Simply call the primary test handler again
    };

    // Handle the "Edit Prompt" button click (calls the parent's onEdit handler)
    const handleEditPrompt = () => {
        console.log("Editing prompt...");
        // Call the onEdit handler passed from the parent (HomePage),
        // passing the current prompt content and potentially other details for editing.
        if (onEdit) {
            // Pass the current content and maybe the initialPrompt object if available
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
                        value={selectedPromptId} // Bind select value to state
                        onChange={handlePromptSelect} // Handle change
                    >
                        {/* Map over saved prompts to create options */}
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
                                 setVariables(extractVariablesFromPrompt(e.target.value)); // Update variables if content changes
                             }}
                         ></textarea>
                     </div>
                 )}

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2 text-sm">Model</label>
                    <select
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-sm"
                       value={testingModel} // Bind select value to state
                       onChange={(e) => setTestingModel(e.target.value)} // Handle change
                    >
                        {/* Options for testing models - Ensure these match backend cases */}
                         {availableModelOptions.map(modelOption => (
                             <option key={modelOption} value={modelOption}>{modelOption}</option>
                         ))}
                    </select>
                </div>

                {/* Variable Inputs - Dynamically generated based on extracted variables */}
                {Object.keys(variables).length > 0 && ( // Only show if variables were found
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2 text-sm">
                            Enter prompt variables
                        </label>
                        {Object.keys(variables).map(varName => (
                            <input
                                key={varName} // Use variable name as key
                                type="text"
                                placeholder={`${varName}: Value`} // Placeholder shows variable name
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition mb-2 text-sm"
                                value={variables[varName]} // Bind input value to state
                                onChange={(e) => handleVariableChange(varName, e.target.value)} // Handle change
                            />
                        ))}
                    </div>
                )}

                {/* Run Test Button */}
                <button
                   className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition shadow hover:shadow-md flex items-center justify-center gap-2 group text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                   onClick={handleRunTest} // Handle button click
                   disabled={loading || !currentPromptContent} // Disable if loading or no prompt content to test
                >
                    <span className={`material-symbols-outlined transform ${loading ? 'animate-spin' : 'group-hover:rotate-45'} transition-all duration-300`}>
                        {loading ? 'progress_activity' : 'rocket_launch'} {/* Change icon based on loading state */}
                    </span>
                    {loading ? 'Running Test...' : 'Run Test & Preview Results'} {/* Change text based on loading state */}
                </button>

                {/* Button to go back to the home/explore section */}
                {onBack && (
                     <button
                         className="w-full mt-3 border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-50 transition text-gray-700 text-sm"
                         onClick={onBack} // Call the handler passed from parent
                     >
                         Back to Prompts
                     </button>
                )}

            </div>

            {/* Test Results Section (Right Side) - Use the TestResultsDisplay component */}
            <TestResultsDisplay
                results={testResults} // Pass primary results
                loading={loading} // Pass primary loading state
                comparisonResults={comparisonResults} // Pass comparison results
                onRegenerate={handleRegenerate} // Pass regenerate handler
                onEditPrompt={handleEditPrompt} // Pass edit handler
                // Pass the new handler for running a single comparison test
                onRunSingleComparisonTest={handleRunSingleComparisonTest}
                // Pass the list of available models for comparison
                availableModels={availableModels}
                // Pass the primary testing model so TestResultsDisplay knows which one is primary
                primaryTestingModel={testingModel.split(' ')[0]}
            />
        </div>
    );
};

export default PromptTestForm;
