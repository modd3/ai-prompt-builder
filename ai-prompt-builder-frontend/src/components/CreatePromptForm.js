import React, { useState, useRef } from 'react'; // Import useRef

// Component for the "Create Your Prompt" form section
// Accepts handlers for successful creation and cancellation
const CreatePromptForm = ({ onPromptCreated, onCancel }) => {
    // State variables for form inputs
    const [title, setTitle] = useState('');
    const [targetModel, setTargetModel] = useState('ChatGPT'); // Default target model
    const [content, setContent] = useState('');
    const [tags, setTags] = useState(''); // Input for tags (comma-separated string)
    const [isPublic, setIsPublic] = useState(false); // State for the public checkbox
    const [loading, setLoading] = useState(false); // Loading state for the publish button
    const [message, setMessage] = useState(''); // Message for success or error feedback

    // Create a ref for the textarea element
    const textareaRef = useRef(null);

    // Function to insert text at the current cursor position in the textarea
    const insertAtCursor = (textToInsert, cursorOffset = 0) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;

        // Insert the text
        const newValue = value.substring(0, start) + textToInsert + value.substring(end);

        // Update the state
        setContent(newValue);

        // Move the cursor position
        // Use a timeout to ensure the state update has rendered before setting selection
        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length + cursorOffset;
            textarea.focus(); // Keep focus on the textarea
        }, 0);
    };

    // Handlers for formatting buttons
    const handleBoldClick = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
        if (selectedText) {
             insertAtCursor(`**${selectedText}**`, 2); // Wrap selected text in ** and place cursor after
        } else {
             insertAtCursor('**bold text**', 2); // Insert placeholder if no text is selected
        }
    };

    const handleItalicClick = () => {
         const textarea = textareaRef.current;
         if (!textarea) return;
         const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
         if (selectedText) {
              insertAtCursor(`*${selectedText}*`, 1); // Wrap selected text in * and place cursor after
         } else {
              insertAtCursor('*italic text*', 1); // Insert placeholder
         }
    };

    const handleBulletedListClick = () => {
         insertAtCursor('\n- '); // Insert a new line and bullet point
    };

    const handleNumberedListClick = () => {
         insertAtCursor('\n1. '); // Insert a new line and numbered list item
    };

    const handleFunctionClick = () => {
         insertAtCursor('`function_name()`', 1); // Insert inline code style
    };

    const handleCodeClick = () => {
         const textarea = textareaRef.current;
         if (!textarea) return;
         const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
         if (selectedText) {
              insertAtCursor(`\n\`\`\`\n${selectedText}\n\`\`\`\n`, 4); // Wrap selected text in code block
         } else {
              insertAtCursor('\n```\ncode goes here\n```\n', 4); // Insert placeholder code block
         }
    };


    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the default browser form submission

        // Basic client-side validation
        if (!title || !content || !targetModel) {
             setMessage('Error: Please fill in all required fields (Title, Content, Target Model).');
             return;
        }

        // Set loading state and clear previous messages
        setLoading(true);
        setMessage('');

        // Prepare data to send to the backend API
        const promptData = {
            title,
            content,
            targetModel,
            tags, // Send the comma-separated string; backend will split it
            isPublic,
            // TODO: Add author ID if implementing user authentication
            // author: yourAuthUserId,
        };

        try {
            // Make a POST request to your backend API endpoint for creating prompts
            const response = await fetch('http://localhost:5000/api/prompts', { // Replace with your backend URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // If authentication is required, add the Authorization header here
                    // 'Authorization': `Bearer ${yourAuthToken}`,
                },
                body: JSON.stringify(promptData), // Send data as JSON string
            });

            // Check if the request was successful (status code 2xx)
            if (!response.ok) {
                const errorData = await response.json();
                // Throw an error with a message from the backend if available
                throw new Error(errorData.msg || 'Failed to create prompt');
            }

            // Parse the JSON response from the backend
            const result = await response.json();
            setMessage('Prompt created successfully!'); // Set success message
            console.log('Prompt created:', result);

            // Optional: Clear the form after successful submission
            setTitle('');
            setContent('');
            setTags('');
            setIsPublic(false);
            setTargetModel('ChatGPT'); // Reset to default model
            setContent(''); // Clear textarea content
            // Removed the erroneous line: setVariables({}); // Clear variables if any were extracted (though not used in create form)


            // Call the parent component's handler for successful creation
            if (onPromptCreated) {
                 onPromptCreated(result); // Pass the created prompt data back
            }

        } catch (error) {
            // Handle errors during the fetch request or from the backend
            console.error('Error creating prompt:', error);
            setMessage(`Error: ${error.message}`); // Set error message
        } finally {
            // Reset loading state regardless of success or failure
            setLoading(false);
        }
    };

    // Helper function to determine button classes based on selected model
    const getModelButtonClass = (modelName) => {
        const baseClass = "px-4 py-2 rounded-lg font-medium border-2 transition text-sm";
        if (targetModel === modelName) {
            // Active class (based on template's primary colors)
             return `${baseClass} bg-primary-100 text-primary-800 border-primary-200 hover:bg-primary-200`;
        } else {
            // Inactive class
            return `${baseClass} bg-gray-100 text-gray-800 border-transparent hover:border-gray-200`;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-2xl font-bold mb-6">Create Your Prompt</h3>
            <form onSubmit={handleSubmit}> {/* Associate form with handleSubmit */}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2 font-medium">Prompt Title</label>
                    <input
                        type="text"
                        placeholder="Give your prompt a clear, descriptive title"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-sm"
                        value={title} // Bind input value to state
                        onChange={(e) => setTitle(e.target.value)} // Update state on change
                        required // Make title a required field
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2 font-medium">Target Model</label>
                    <div className="flex flex-wrap gap-3">
                        {/* Map over supported models to create buttons */}
                        {['ChatGPT', 'Claude', 'Gemini', 'Llama', 'Midjourney', 'HuggingFace'].map(model => ( // Added HuggingFace
                           <button
                                key={model}
                                type="button" // Use type="button" to prevent form submission when clicking
                                className={getModelButtonClass(model)} // Apply dynamic classes
                                onClick={() => setTargetModel(model)} // Update targetModel state
                           >
                               {model}
                           </button>
                        ))}
                        {/* Add more model buttons here as needed */}
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 mb-2 font-medium">Prompt Content</label>
                    {/* Text area for prompt content. You could integrate a rich text editor here. */}
                    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition">
                         {/* Placeholder for a rich text editor toolbar */}
                        <div className="flex bg-gray-50 border-b border-gray-300 p-2">
                             {/* Add onClick handlers to formatting buttons */}
                             <button type="button" className="p-1 hover:bg-gray-200 rounded" aria-label="Bold" onClick={handleBoldClick}><span className="material-symbols-outlined text-gray-600 text-base">format_bold</span></button>
                             <button type="button" className="p-1 hover:bg-gray-200 rounded" aria-label="Italic" onClick={handleItalicClick}><span className="material-symbols-outlined text-gray-600 text-base">format_italic</span></button>
                             <button type="button" className="p-1 hover:bg-gray-200 rounded" aria-label="Bulleted List" onClick={handleBulletedListClick}><span className="material-symbols-outlined text-gray-600 text-base">format_list_bulleted</span></button>
                             <button type="button" className="p-1 hover:bg-gray-200 rounded" aria-label="Numbered List" onClick={handleNumberedListClick}><span className="material-symbols-outlined text-gray-600 text-base">format_list_numbered</span></button>
                             <button type="button" className="p-1 hover:bg-gray-200 rounded" aria-label="Insert Function" onClick={handleFunctionClick}><span className="material-symbols-outlined text-gray-600 text-base">functions</span></button>
                             <button type="button" className="p-1 hover:bg-gray-200 rounded" aria-label="Insert Code" onClick={handleCodeClick}><span className="material-symbols-outlined text-gray-600 text-base">code</span></button>
                        </div>
                        <textarea
                            ref={textareaRef} // Attach the ref to the textarea
                            rows="6"
                            placeholder="Write your prompt here. Be specific and provide clear instructions for the AI model."
                            className="w-full p-4 outline-none resize-none text-sm"
                            value={content} // Bind textarea value to state
                            onChange={(e) => setContent(e.target.value)} // Update state on change
                            required // Make content a required field
                        ></textarea>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 mb-2 font-medium">Tags</label>
                    <input
                        type="text"
                        placeholder="Add tags separated by commas (e.g., productivity, writing, coding)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-sm"
                        value={tags} // Bind input value to state
                        onChange={(e) => setTags(e.target.value)} // Update state on change
                    />
                     <p className="text-xs text-gray-500 mt-1">Separate tags with commas (e.g., "creative, marketing, image generation")</p>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <input
                           type="checkbox"
                           id="share-publicly"
                           className="mr-2"
                           checked={isPublic} // Bind checkbox checked state to state
                           onChange={(e) => setIsPublic(e.target.checked)} // Update state on change
                        />
                        <label htmlFor="share-publicly" className="text-gray-700 text-sm cursor-pointer">Share publicly with the community</label>
                    </div>
                    <div className="flex gap-3">
                        {/* Save Draft button - needs separate backend logic */}
                        <button type="button" className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-50 transition text-gray-700 text-sm" onClick={onCancel}> {/* Added onClick for cancel */}
                            Cancel
                        </button>
                        <button
                           type="submit" // This button triggers the form submission
                           className="bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700 transition shadow hover:shadow-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                           disabled={loading} // Disable button while loading
                        >
                            {loading ? 'Publishing...' : 'Publish Prompt'} {/* Change text based on loading state */}
                        </button>
                    </div>
                </div>

                {/* Display success or error messages */}
                {message && (
                    <div className={`mt-4 p-3 rounded-lg text-sm ${message.startsWith('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
};

export default CreatePromptForm;
