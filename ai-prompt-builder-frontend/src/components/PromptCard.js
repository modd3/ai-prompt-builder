import React from 'react';

// Component to display a single prompt card in the trending/explore sections
// Accepts a prompt object and a handler for the "Try It" button click
const PromptCard = ({ prompt, onTryItClick }) => {
    // Destructure prompt data
    // Assuming prompt object structure from backend: _id, title, content, targetModel, tags, author, rating, ratingsCount, views, created_at
    const { _id, targetModel, title, content, rating, ratingsCount, author } = prompt; // Using content here for passing to test form

    // Function to handle the "Try It" button click
    const handleTryItClick = () => {
        console.log(`Trying prompt with ID: ${_id}`);
        // Call the handler passed from the parent (HomePage), passing the full prompt object
        if (onTryItClick) {
            onTryItClick(prompt);
        }
    };

    // Determine background/text color for model icon based on targetModel
     const modelColorClass =
        targetModel === 'ChatGPT' ? 'bg-blue-100 text-blue-600' :
        targetModel === 'Midjourney' ? 'bg-purple-100 text-purple-600' :
        targetModel === 'Claude' ? 'bg-red-100 text-red-600' :
        targetModel === 'Gemini' ? 'bg-green-100 text-green-600' : // Added Gemini color
        'bg-gray-200 text-gray-700'; // Default color

    // Determine icon based on targetModel
    const modelIcon =
        targetModel === 'ChatGPT' ? 'smart_toy' :
        targetModel === 'Midjourney' ? 'magic_button' :
        targetModel === 'Claude' ? 'table_chart' :
        targetModel === 'Gemini' ? 'globe' : // Added Gemini icon
        'psychology'; // Default icon


    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                        {/* Model Icon */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${modelColorClass}`}>
                            <span className="material-symbols-outlined text-sm">{modelIcon}</span>
                        </div>
                        <span className="font-medium">{targetModel}</span> {/* Display targetModel */}
                    </div>
                    {/* Status Tag (Assuming status is not in backend model, keep static or remove) */}
                    {/* You might add a status based on rating or views if needed */}
                    {/* <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">High Success</span> */}
                </div>
                <h4 className="font-bold text-lg mb-2">{title}</h4>
                 {/* Display prompt content preview or a description field if available */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {/* Use description if available, otherwise a snippet of content */}
                    {prompt.description || (content ? content.substring(0, 150) + '...' : 'No description available.')}
                </p>
                <div className="flex justify-between items-center">
                    {/* Rating Display */}
                    <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-yellow-500 text-sm">
                            star
                        </span>
                        <span className="text-sm">{rating ? rating.toFixed(1) : 'N/A'} ({ratingsCount || 0})</span> {/* Display rating and count */}
                    </div>
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        {/* Bookmark Button - Needs backend logic and user authentication */}
                        <button className="text-gray-500 hover:text-primary-600 transition-colors" aria-label="Bookmark">
                            <span className="material-symbols-outlined">bookmark_add</span>
                        </button>
                        {/* Share Button - Needs share functionality */}
                        <button className="text-gray-500 hover:text-primary-600 transition-colors" aria-label="Share">
                            <span className="material-symbols-outlined">share</span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 p-3 flex justify-between border-t border-gray-100">
                {/* Author Info (Assuming author might be populated from backend) */}
                <div className="flex items-center gap-2">
                    {author && ( // Check if author object exists
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-300">
                            <img
                                src={author.avatar || 'https://placehold.co/24x24/cccccc/000000?text=User'} // Use author avatar or placeholder
                                alt={`${author.name || 'Unknown'} avatar`}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/24x24/cccccc/000000?text=User' }} // Placeholder on error
                            />
                        </div>
                    )}
                    <span className="text-sm text-gray-600">{author?.name || 'Unknown'}</span> {/* Display author name */}
                </div>
                {/* Try It Button */}
                <button
                    className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors"
                    onClick={handleTryItClick} // Call the handler when clicked
                >
                    Try It
                </button>
            </div>
        </div>
    );
};

export default PromptCard;
