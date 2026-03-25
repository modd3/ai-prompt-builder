import React, { useState, useEffect } from 'react';
import TestResultsDisplay from './TestResultsDisplay';
import ModelCard from './ModelCard';
import { useAuth } from '../context/AuthContext';
import { getModelById, getFreeModels } from '../config/models';
import API from '../api/api';

// Component for the "Test Your Prompts" section
const PromptTestForm = ({ initialPrompt = null, onBack, onEdit }) => {
  const { isAuthenticated, token } = useAuth();

  const [selectedPromptId, setSelectedPromptId] = useState('');
  const [currentPromptContent, setCurrentPromptContent] = useState('');
  const [testingModel, setTestingModel] = useState('');
  const [variables, setVariables] = useState({});
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedPrompts, setSavedPrompts] = useState([]);
  const [comparisonResults, setComparisonResults] = useState({});
  const [customParams, setCustomParams] = useState({});
  const [selectedModels, setSelectedModels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProviders, setSelectedProviders] = useState(new Set());
  const [selectedSpeeds, setSelectedSpeeds] = useState(new Set());
  const [selectedContexts, setSelectedContexts] = useState(new Set());
  const [favorites, setFavorites] = useState(new Set());

  const freeModels = getFreeModels();
  const availableModels = freeModels.map(model => model.id);

  // Filter models based on search and filters
  const filteredModels = freeModels.filter(model => {
    const matchesSearch = !searchQuery || 
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProvider = selectedProviders.size === 0 || 
      selectedProviders.has(model.provider);
    
    const matchesSpeed = selectedSpeeds.size === 0 || 
      selectedSpeeds.has(model.speed);
    
    const matchesContext = selectedContexts.size === 0 || 
      selectedContexts.has(model.context);
    
    return matchesSearch && matchesProvider && matchesSpeed && matchesContext;
  });

  useEffect(() => {
    if (filteredModels.length > 0 && !testingModel) {
      setTestingModel(filteredModels[0].id);
      setCustomParams(filteredModels[0].defaultParams);
    }
  }, [filteredModels, testingModel]);

  useEffect(() => {
    const fetchSavedPrompts = async () => {
      if (!isAuthenticated || !token) {
        console.warn('User not authenticated. Cannot fetch private prompts.');
        setSavedPrompts([{ _id: '', title: 'Please log in to see your prompts', content: '' }]);
        return;
      }

      try {
        const response = await fetch(process.env.REACT_APP_FRONTEND_API_URL + 'api/prompts/mine', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.msg || `Failed to fetch user prompts: HTTP error! status: ${response.status}`);
        }

        const userPrompts = await response.json();
        const promptsWithDefault = [{ _id: '', title: 'Select a prompt', content: '' }, ...userPrompts];
        setSavedPrompts(promptsWithDefault);

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

    fetchSavedPrompts();
  }, [initialPrompt, isAuthenticated, token]);

  const extractVariablesFromPrompt = (content) => {
    const vars = {};
    if (!content || typeof content !== 'string') return vars;
    const regex = /\{\{([^}]+)\}\}/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      vars[match[1].trim()] = '';
    }
    return vars;
  };

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

  const handleVariableChange = (varName, value) => {
    setVariables(prevVars => ({
      ...prevVars,
      [varName]: value,
    }));
  };

  const injectVariables = (content, vars) => {
    let processedContent = content;
    for (const varName in vars) {
      const escapedVarName = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\{\\{${escapedVarName}\\}\\}`, 'g');
      processedContent = processedContent.replace(regex, vars[varName]);
    }
    return processedContent;
  };

  const handleParamChange = (paramName, value) => {
    setCustomParams(prevParams => ({
      ...prevParams,
      [paramName]: value,
    }));
  };

  const getModelConfig = (modelId) => {
    return getModelById(modelId);
  };

  const runTestForModel = async (modelId, contentToTest) => {
    const testData = {
      promptContent: contentToTest,
      modelId,
      customParams,
      variables
    };

    try {
      const response = await API.post("/test-prompts", testData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || `Failed to run test for ${modelId}`);
      }

      const result = await response.json();
      return {
        model: result.model,
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

  const handleRegenerate = () => {
    console.log("Regenerating primary test...");
    handleRunTest();
  };

  const handleEditPrompt = () => {
    console.log("Editing prompt...");
    if (onEdit) {
      onEdit({ content: currentPromptContent, initialPrompt: initialPrompt });
    }
  };

  const handleModelSelect = (modelId) => {
    setTestingModel(modelId);
  };

  const handleModelFavoriteToggle = (modelId, isFavorited) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (isFavorited) {
        newFavorites.add(modelId);
      } else {
        newFavorites.delete(modelId);
      }
      return newFavorites;
    });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleProviderFilterChange = (provider) => {
    setSelectedProviders(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(provider)) {
        newSelected.delete(provider);
      } else {
        newSelected.add(provider);
      }
      return newSelected;
    });
  };

  const handleSpeedFilterChange = (speed) => {
    setSelectedSpeeds(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(speed)) {
        newSelected.delete(speed);
      } else {
        newSelected.add(speed);
      }
      return newSelected;
    });
  };

  const handleContextFilterChange = (context) => {
    setSelectedContexts(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(context)) {
        newSelected.delete(context);
      } else {
        newSelected.add(context);
      }
      return newSelected;
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedProviders(new Set());
    setSelectedSpeeds(new Set());
    setSelectedContexts(new Set());
  };

  const getFavoriteModels = () => {
    return freeModels.filter(model => favorites.has(model.id));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Prompt Playground Section (Left Side) */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-600">smart_toy</span>
          Prompt Playground
        </h4>

        {/* Favorites Section */}
        <div className="mb-6">
          <h5 className="font-medium text-sm mb-3">Favorites</h5>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {getFavoriteModels().map((model) => (
              <ModelCard
                key={model.id}
                modelId={model.id}
                onClick={handleModelSelect}
                isSelected={testingModel === model.id}
                isFavorite={true}
                onFavoriteToggle={handleModelFavoriteToggle}
              />
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-sm"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedProviders.has('Groq')}
                onChange={() => handleProviderFilterChange('Groq')}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded"
              />
              <span className="text-xs text-gray-600">Groq</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedProviders.has('Hugging Face')}
                onChange={() => handleProviderFilterChange('Hugging Face')}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded"
              />
              <span className="text-xs text-gray-600">HF</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedProviders.has('Google')}
                onChange={() => handleProviderFilterChange('Google')}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded"
              />
              <span className="text-xs text-gray-600">Gemini</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedProviders.has('Mistral')}
                onChange={() => handleProviderFilterChange('Mistral')}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded"
              />
              <span className="text-xs text-gray-600">Mistral</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedSpeeds.has('fastest')}
                onChange={() => handleSpeedFilterChange('fastest')}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded"
              />
              <span className="text-xs text-gray-600">Fastest</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedSpeeds.has('fast')}
                onChange={() => handleSpeedFilterChange('fast')}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded"
              />
              <span className="text-xs text-gray-600">Fast</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedSpeeds.has('medium')}
                onChange={() => handleSpeedFilterChange('medium')}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded"
              />
              <span className="text-xs text-gray-600">Medium</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedContexts.has('XL')}
                onChange={() => handleContextFilterChange('XL')}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded"
              />
              <span className="text-xs text-gray-600">XL</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedContexts.has('Large')}
                onChange={() => handleContextFilterChange('Large')}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded"
              />
              <span className="text-xs text-gray-600">Large</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedContexts.has('Medium')}
                onChange={() => handleContextFilterChange('Medium')}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded"
              />
              <span className="text-xs text-gray-600">Medium</span>
            </div>
          </div>

          <button
            onClick={clearFilters}
            className="w-full text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>

        {/* Model Selection Grid */}
        <div className="mb-6">
          <h5 className="font-medium text-sm mb-3">All Models</h5>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredModels.map((model) => (
              <ModelCard
                key={model.id}
                modelId={model.id}
                onClick={handleModelSelect}
                isSelected={testingModel === model.id}
                isFavorite={favorites.has(model.id)}
                onFavoriteToggle={handleModelFavoriteToggle}
              />
            ))}
          </div>
        </div>

        {/* Prompt Selection */}
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

        {/* Manual Prompt Input */}
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

        {/* Custom Parameters */}
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

        {/* Variable Inputs */}
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

        {/* Model Info */}
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

        {/* Back Button */}
        {onBack && (
          <button
            className="w-full mt-3 border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-50 transition text-gray-700 text-sm"
            onClick={onBack}
          >
            Back to Prompts
          </button>
        )}
      </div>

      {/* Test Results Section (Right Side) */}
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