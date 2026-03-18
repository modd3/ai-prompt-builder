import React, { useState, useEffect } from 'react';
import TestResultsDisplay from './TestResultsDisplay';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import { getModelById, getFreeModels } from '../config/models'; // Import model configuration

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
    const [testingModel, setTestingModel] = useState(''); // Default testing model (will be set to first free model)
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

    // State for custom parameters (temperature, maxTokens, etc.)
    const [customParams, setCustomParams] = useState({}); // Format: { temperature: 0.7, maxTokens: 4000 }

    // Get all free models for selection
    const freeModels = getFreeModels();

    // Define the list of models available for testing/comparison
    // Use model IDs from configuration for API calls
    const availableModels = freeModels.map(model => model.id); // Model IDs for API calls
    const availableModelOptions = freeModels.map(model => ({
      id: model.id,
      name: model.name,
      description: model.description,
      provider: model.provider,
      speed: model.speed,
      context: model.context
    })); // Display names and metadata for select

    // Effect hook to set default model to first free model
    useEffect(() => {
      if (freeModels.length > 0 && !testingModel) {
        setTestingModel(freeModels[0].id); // Set default to first free model
        setCustomParams(freeModels[0].defaultParams); // Set default params
      }
    }, [freeModels, testingModel]);


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

    // Handle changes in custom parameters
    const handleParamChange = (paramName, value) => {
         setCustomParams(prevParams => ({
             ...prevParams,
             [paramName]: value,
         }));
    };

    // Get model configuration by ID
    const getModelConfig = (modelId) => {
      return getModelById(modelId);
    };

    // Function to run a single test against a specific model
    const runTestForModel = async (modelId, contentToTest) => {
        const testData = {
            promptContent: contentToTest,
            modelId, // Use modelId instead of targetModel
            customParams, // Include custom parameters
            variables
        };

        try {
            const response = await fetch(process.env.REACT_APP_FRONTEND_API_URL + "api/test-prompt", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || `Failed to run test for ${modelId}`);
            }

            const result = await response.json();
            return { 
                model: result.model, // Use actual model name from response
                response: result.response, 
                responseTime: result.responseTime, 
                loading: false, 
                error: null 
            };

        } catch (error) {
            console.error(`Error running test for ${modelId}:`, error);
            return { 
                model: getModelConfig(modelId)?.name || modelId, 
                response: null, 
                responseTime: null, 
                loading: false, 
                error: error.message 
            };
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

        const primaryResult = await runTestForModel(testingModel, finalPromptContent);

        setTestResults(primaryResult);
        setLoading(false);
    };

    // New handler to run a test for a single comparison model
    const handleRunSingleComparisonTest = async (modelId) => {
         const finalPromptContent = injectVariables(currentPromptContent, variables);
         if (!finalPromptContent) {
             console.warn("No prompt content to run comparison tests.");
             return;
         }

         setComparisonResults(prevResults => ({
             ...prevResults,
             [modelId]: { ...prevResults[modelId], loading: true, error: null }
         }));

         const result = await runTestForModel(modelId, finalPromptContent);

         setComparisonResults(prevResults => ({
             ...prevResults,
             [modelId]: result,
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
                             <option key={modelOption.id} value={modelOption.id}>
                               {modelOption.name} ({modelOption.provider})
                               {modelOption.speed && <span className="text-xs text-gray-500"> - {modelOption.speed}</span>}
                             </option>
                         ))}
                    </select>
                </div>

                {/* Custom Parameters Section */}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2 text-sm">Custom Parameters</label>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                            <label className="text-sm">Temperature:</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={customParams.temperature || 0.7}
                                onChange={(e) => handleParamChange('temperature', parseFloat(e.target.value))}
                                className="w-full"
                            />
                            <span className="text-xs text-gray-500">{customParams.temperature || 0.7}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm">Max Tokens:</label>
                            <input
                                type="number"
                                min="100"
                                max="8000"
                                value={customParams.maxTokens || 4000}
                                onChange={(e) => handleParamChange('maxTokens', parseInt(e.target.value))}
                                className="w-20 text-sm"
                            />
                        </div>
                    </div>
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

                {/* Model Info Section */}
                {testingModel && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <h5 className="font-medium text-sm mb-2">Model Info</h5>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Provider: {getModelConfig(testingModel)?.provider}</div>
                      <div>Context: {getModelConfig(testingModel)?.context || 'Medium'}</div>
                      <div>Speed: {getModelConfig(testingModel)?.speed || 'Medium'}</div>
                    </div>
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
                primaryTestingModel={testingModel}
            />
        </div>
    );
};

export default PromptTestForm;