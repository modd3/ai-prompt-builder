import React, { useState, useEffect } from 'react'; // Import useEffect

// Component to display the results of a prompt test
// Accepts the primary test result, loading state, and optionally comparison results
// Also accepts a handler to run a single comparison test and the list of available models
const TestResultsDisplay = ({
    results,
    loading,
    comparisonResults = {},
    onRegenerate,
    onEditPrompt,
    onRunSingleComparisonTest, // New handler for running a single comparison test
    availableModels, // List of available models for comparison
    primaryTestingModel // The model used for the primary test
}) => {
    // State to track which comparison result is currently being viewed in the main display area
    const [viewingComparison, setViewingComparison] = useState(null); // Null, or the model name (e.g., 'Claude')

    // Reset viewingComparison state when the primary results change or loading starts
    useEffect(() => {
        setViewingComparison(null);
    }, [results, loading]);


    // Handle copying the response text to the clipboard
    const handleCopy = () => {
        // Copy either the primary result or the currently viewed comparison result
        // Use optional chaining for safe access
        const textToCopy = viewingComparison ? comparisonResults[viewingComparison]?.response : results?.response;
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                console.log('Response copied to clipboard!');
                // TODO: Replace console.log with a more user-friendly notification (e.g., a toast message)
            }).catch(err => {
                console.error('Failed to copy: ', err);
                // TODO: Handle copy error notification
            });
        }
    };

    // Handle downloading the response text as a file
    const handleDownload = () => {
         // Download either the primary result or the currently viewed comparison result
         // Use optional chaining for safe access
        const textToDownload = viewingComparison ? comparisonResults[viewingComparison]?.response : results?.response;
        const fileName = viewingComparison ? `${viewingComparison.toLowerCase()}_test_result.txt` : 'prompt_test_result.txt';

        if (textToDownload) {
            // Create a Blob from the response text
            const blob = new Blob([textToDownload], { type: 'text/plain' });
            // Create a temporary URL for the blob
            const url = URL.createObjectURL(blob);
            // Create a temporary anchor element
            const a = document.createElement('a');
            a.href = url;
            // Set the download file name
            a.download = fileName;
            // Append the anchor to the body (necessary for Firefox)
            document.body.appendChild(a);
            // Programmatically click the anchor to trigger the download
            a.click();
            // Clean up: remove the anchor element and revoke the blob URL
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    // Handle clicking a comparison model button (either to run test or view result)
    const handleModelButtonClick = (modelName) => {
        // Safely get the comparison result for the clicked model
        const compResult = comparisonResults[modelName];

        // Determine if the test has been run and has a result
        const hasResult = compResult?.response !== null && compResult?.response !== undefined;

        // If the test hasn't been run or had an error, run it
        if (!compResult || compResult.error || !hasResult) {
             if (onRunSingleComparisonTest) {
                 onRunSingleComparisonTest(modelName); // Call the handler to run the test for this model
                 // Do NOT set viewingComparison here, keep showing primary result
             }
        } else {
            // If the test has already been run and has a result, set to view the full result
            setViewingComparison(modelName);
        }
    };

    // Handle clicking the "Read More" link on a snippet
    const handleReadMoreClick = (modelName) => {
        setViewingComparison(modelName); // Set to view the full result for this model
    };

    // Handle clicking the "Back to Primary Result" button
    const handleBackToPrimary = () => {
        setViewingComparison(null); // Reset viewingComparison to show the primary result
    };

    // Determine the result object to display in the main preview area
    // If viewingComparison is set, display that comparison result, otherwise display the primary result
    const displayedResult = viewingComparison ? comparisonResults[viewingComparison] : results;

    // Determine the loading state for the currently displayed result
    // If viewing a comparison, check that specific comparison's loading state, otherwise check primary loading
    const displayedLoading = viewingComparison ? comparisonResults[viewingComparison]?.loading : loading;


    // Helper function to determine model icon and color
    const getModelDisplayInfo = (modelName) => {
        const icon =
            modelName === 'ChatGPT' ? 'smart_toy' :
            modelName === 'Midjourney' ? 'magic_button' :
            modelName === 'Claude' ? 'table_chart' :
            modelName === 'Gemini' ? 'globe' :
            modelName === 'HuggingFace' ? 'psychology' :
            'psychology'; // Default icon

        const colorClass =
            modelName === 'ChatGPT' ? 'bg-blue-100 text-blue-600' :
            modelName === 'Midjourney' ? 'bg-purple-100 text-purple-600' :
            modelName === 'Claude' ? 'bg-red-100 text-red-600' :
            modelName === 'Gemini' ? 'bg-green-100 text-green-600' :
            modelName === 'HuggingFace' ? 'bg-indigo-100 text-indigo-600' :
            'bg-gray-200 text-gray-700'; // Default color

        return { icon, colorClass };
    };

    // Function to get a snippet of the response
    const getResponseSnippet = (response, maxLength = 70) => {
        if (!response || response.length <= maxLength) {
            return response;
        }
        return response.substring(0, maxLength) + '...';
    };


    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 flex flex-col">
            {/* Header with title and action buttons */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h4 className="font-bold text-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-600">analytics</span>
                    Results
                </h4>
                <div className="flex items-center gap-2">
                     {/* Copy Button - Disabled when loading or no results */}
                    <button className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleCopy}
                            disabled={displayedLoading || !displayedResult?.response} // Use displayedLoading and displayedResult with optional chaining
                            aria-label="Copy Result">
                        <span className="material-symbols-outlined text-base">content_copy</span>
                    </button>
                    {/* Download Button - Disabled when loading or no results */}
                    <button className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                             onClick={handleDownload}
                             disabled={displayedLoading || !displayedResult?.response} // Use displayedLoading and displayedResult with optional chaining
                             aria-label="Download Result">
                        <span className="material-symbols-outlined text-base">download</span>
                    </button>
                     {/* TODO: Add a "Save Result" button if this is a feature */}
                </div>
            </div>
            {/* Results Display Area - Removed overflow-y-auto from this parent div */}
            {/* Height classes h-64 md:h-auto remain to give the overall results pane a size */}
            <div className="p-6 flex-grow bg-gray-50 rounded-b-xl relative h-64 md:h-auto text-sm">
                {/* Loading indicator for the currently displayed result */}
                {displayedLoading && (
                    <div className="flex items-center justify-center text-gray-600">
                         <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                         Generating response...
                    </div>
                )}

                {/* Error message display for the currently displayed result */}
                {/* Use optional chaining for safe access to error */}
                {displayedResult?.error && (
                     <div className="p-4 bg-red-100 text-red-800 rounded-lg border border-red-200 text-sm">
                          <strong>Error:</strong> {displayedResult.error}
                     </div>
                )}

                {/* Display successful results */}
                {/* Check for response using optional chaining */}
                {displayedResult?.response && (
                    <div>
                         {/* Header for the displayed result */}
                         <div className="mb-4">
                             <div className="flex justify-between items-center mb-3">
                                 <div className="flex items-center gap-2">
                                     <span className="material-symbols-outlined text-primary-600">
                                         smart_toy
                                     </span>
                                     <span className="font-medium">Model Response Preview</span>
                                 </div>
                                 {/* Display which model generated this result */}
                                 {displayedResult.model && (
                                     <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                                         {displayedResult.model}
                                     </span>
                                 )}
                             </div>
                             {/* The actual AI response - Added max-h-60 and overflow-y-auto here */}
                             <div className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all text-gray-800 whitespace-pre-wrap max-h-60 overflow-y-auto">
                                 {displayedResult.response}
                             </div>
                              {/* Response time and action buttons */}
                              <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                                 {displayedResult.responseTime && (
                                     <div className="flex items-center">
                                         <span className="material-symbols-outlined text-sm mr-1">
                                             timer
                                         </span>
                                         <span>Response time: {displayedResult.responseTime}</span>
                                     </div>
                                 )}
                                 {/* Action buttons */}
                                 <div className="flex gap-3">
                                     {/* Regenerate Button - Only show for the primary result */}
                                     {!viewingComparison && (
                                         <button className="text-xs flex items-center gap-1 text-gray-500 hover:text-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={loading} // Use primary loading state for regenerate
                                                onClick={onRegenerate}> {/* Use passed handler */}
                                             <span className="material-symbols-outlined text-sm">
                                                 refresh
                                             </span>
                                             Regenerate
                                         </button>
                                     )}
                                     {/* Edit Prompt Button - Only show for the primary result */}
                                     {!viewingComparison && (
                                          <button className="text-xs flex items-center gap-1 text-gray-500 hover:text-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={loading} // Use primary loading state for edit
                                                onClick={onEditPrompt}> {/* Use passed handler */}
                                          <span className="material-symbols-outlined text-sm">edit</span>
                                          Edit Prompt
                                      </button>
                                     )}
                                      {/* Button to go back to primary result when viewing comparison */}
                                      {viewingComparison && (
                                           <button className="text-xs flex items-center gap-1 text-gray-500 hover:text-primary-600 transition-colors"
                                                   onClick={handleBackToPrimary}>
                                               <span className="material-symbols-outlined text-sm">arrow_back</span>
                                               Back to Primary Result
                                           </button>
                                      )}
                                 </div>
                             </div>
                         </div>

                         {/* Section for comparing with other models */}
                         {/* Only show if the primary test is done AND we are not viewing a comparison result */}
                         {results && !viewingComparison && (
                             <div className="border-t border-gray-200 pt-4 mt-4">
                                  <div className="text-sm font-medium mb-2">Compare with other models:</div>
                                  <div className="grid grid-cols-2 gap-3">
                                       {/* Map over available models to create individual buttons */}
                                       {availableModels
                                            .filter(modelName => modelName !== primaryTestingModel) // Exclude the primary model
                                            .map(modelName => {
                                                // Safely access compResult, defaulting to an empty object if undefined
                                                const compResult = comparisonResults[modelName] || {};
                                                // Use optional chaining for safer access
                                                const isLoading = compResult?.loading || false;
                                                const hasResult = compResult?.response !== null && compResult?.response !== undefined; // Use optional chaining here too

                                                return (
                                                    <button
                                                         key={modelName}
                                                         className="p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-all text-left flex flex-col gap-2 disabled:opacity-50 disabled:cursor-not-allowed" // Added flex-col and gap-2
                                                         onClick={() => handleModelButtonClick(modelName)} // Use the new handler
                                                         disabled={isLoading || loading} // Disable while this comparison is loading OR primary test is loading
                                                    >
                                                        <div className="flex items-center gap-1"> {/* Adjusted flex items */}
                                                            {/* Model Icon */}
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getModelDisplayInfo(modelName).colorClass}`}> {/* Use helper function */}
                                                                <span className="material-symbols-outlined text-xs">{getModelDisplayInfo(modelName).icon}</span> {/* Use helper function */}
                                                            </div>
                                                            <span className="text-xs font-medium">{modelName}</span>
                                                             {/* Loading indicator for individual comparison */}
                                                             {isLoading && (
                                                                 <span className="material-symbols-outlined animate-spin text-xs ml-auto text-gray-500">
                                                                     progress_activity
                                                                 </span>
                                                             )}
                                                        </div>
                                                        {/* Display status or preview */}
                                                        {isLoading ? (
                                                             <p className="text-xs text-gray-500 italic">Running test...</p>
                                                        ) : compResult?.error ? ( // Use optional chaining here
                                                             <p className="text-xs text-red-600">Error: {compResult.error}</p>
                                                        ) : hasResult ? ( // Show snippet and Read More if result exists
                                                            <>
                                                                <p className="text-xs text-gray-500 italic line-clamp-2">
                                                                    {getResponseSnippet(compResult.response, 70)} {/* Show snippet */}
                                                                </p>
                                                                {/* Read More link - Triggers viewing the full result */}
                                                                {compResult.response.length > 100 && ( // Only show if response is longer than snippet length
                                                                     <button
                                                                          className="text-xs text-primary-600 hover:text-primary-800 font-medium self-start" // self-start aligns to the left
                                                                          onClick={(e) => {
                                                                               e.stopPropagation(); // Prevent the button's parent onClick from firing
                                                                               handleReadMoreClick(modelName); // Call handler to view full result
                                                                          }}
                                                                     >
                                                                          Read More
                                                                     </button>
                                                                )}
                                                            </>
                                                        ) : ( // Show click to run if no result, no loading, no error
                                                            <p className="text-xs text-gray-500 italic">
                                                                Click to run test
                                                            </p>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                  </div>
                             </div>
                         )}
                    </div>
                )}

                {/* Initial state before any test is run */}
                {!loading && !results && !viewingComparison && Object.keys(comparisonResults).length === 0 && (
                     <div className="h-full flex items-center justify-center text-gray-500 italic">
                         Run a test from the Playground to see results here.
                     </div>
                )}
            </div>
        </div>
    );
};

export default TestResultsDisplay;
