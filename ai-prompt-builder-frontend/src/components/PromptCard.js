import React, { useState } from 'react'; // Import useState
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

// Component to display a single prompt card in the trending/explore sections
// Accepts a prompt object and handlers for actions like "Try It" and rating
const PromptCard = ({ prompt, onTryItClick, onRatePrompt }) => { // Added onRatePrompt handler
    // Access authentication state and user info from context
    const { isAuthenticated, user } = useAuth();

    // State to manage the hover state for stars (visual feedback before clicking)
    const [hoverRating, setHoverRating] = useState(0);
    // State to manage if a rating submission is in progress for this card
    const [ratingLoading, setRatingLoading] = useState(false);
    // State to manage potential local rating error message
    const [ratingError, setRatingError] = useState(null);


    // Destructure prompt data
    // Assuming prompt object structure from backend: _id, title, content, targetModel, tags, author, rating, ratingsCount, views, created_at, ratedBy
    // The 'author' field is expected to be populated by the backend and contain _id and name
    const { _id, targetModel, title, content, rating, ratingsCount, author, ratedBy } = prompt; // Added ratedBy

    // Check if the authenticated user is the author of this prompt
    // Ensure user and author objects exist before comparing IDs
    const isAuthor = isAuthenticated && user && author && author._id === user._id;

    // Check if the authenticated user has already rated this prompt
    // Ensure ratedBy is an array before calling .some()
    const hasUserRated = isAuthenticated && user && Array.isArray(ratedBy) && ratedBy.some(ratedById => ratedById === user._id);

    // Determine if the user CAN rate this prompt
    // User must be authenticated, not the author, and must NOT have already rated
    const canUserRate = isAuthenticated && !isAuthor && !hasUserRated;


    // Function to handle the "Try It" button click
    const handleTryItClick = () => {
        console.log(`Trying prompt with ID: ${_id}`);
        // Call the handler passed from the parent (HomePage), passing the full prompt object
        if (onTryItClick) {
            onTryItClick(prompt);
        }
    };

    // Handle click on a star to submit a rating
    const handleRatingClick = async (starValue) => {
        // Prevent rating if the user cannot rate based on the 'canUserRate' flag
        if (!canUserRate || ratingLoading) {
            console.log("Cannot rate: not allowed or loading.");
            // No need to set local error message here, as the UI should prevent clicking
            return;
        }

        setRatingLoading(true); // Set loading state
        setRatingError(null); // Clear previous errors

        try {
            // Call the onRatePrompt handler passed from the parent
            // This handler should make the API call to the backend
            if (onRatePrompt) {
                // onRatePrompt should handle the fetch request including the token
                // It should return a promise that resolves on success or rejects on error
                await onRatePrompt(_id, starValue);
                console.log(`Rating ${_id} submitted: ${starValue}`);
                // Frontend state update (like incrementing ratingsCount or changing average)
                // should ideally happen in the parent component (HomePage) after the API call succeeds,
                // or you could trigger a refetch of prompts in HomePage.
                // For simplicity here, we'll rely on the parent updating the prompt list.
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
             // Set a local error message if the onRatePrompt handler throws an error
            setRatingError(error.message || 'Failed to submit rating.'); // Use error.message from backend if available
        } finally {
            setRatingLoading(false); // Reset loading state
        }
    };


    // Determine background/text color for model icon based on targetModel
     const modelColorClass =
        targetModel === 'ChatGPT' ? 'bg-blue-100 text-blue-600' :
        targetModel === 'Midjourney' ? 'bg-purple-100 text-purple-600' :
        targetModel === 'Claude' ? 'bg-red-100 text-red-600' :
        targetModel === 'Gemini' ? 'bg-green-100 text-green-600' : // Added Gemini color
        targetModel === 'HuggingFace' ? 'bg-indigo-100 text-indigo-600' : // Added HuggingFace color
        'bg-gray-200 text-gray-700'; // Default color

    // Determine icon based on targetModel
    const modelIcon =
        targetModel === 'ChatGPT' ? 'smart_toy' :
        targetModel === 'Midjourney' ? 'magic_button' :
        targetModel === 'Claude' ? 'table_chart' :
        targetModel === 'Gemini' ? 'globe' : // Added Gemini icon
        targetModel === 'HuggingFace' ? 'psychology' : // Added HuggingFace icon
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
                    {/* Rating Display and Input */}
                    <div className="flex items-center gap-1">
                         {/* Conditional rendering for rating input vs display */}
                         {canUserRate ? (
                             // Show interactive stars for rating if user is authenticated, not author, and hasn't rated
                             <div className="flex items-center gap-0.5"
                                  onMouseLeave={() => setHoverRating(0)} // Reset hover on mouse leave
                                  disabled={ratingLoading} // Disable interaction while loading
                             >
                                 {[1, 2, 3, 4, 5].map(starValue => (
                                     <span
                                         key={starValue}
                                         className={`material-symbols-outlined text-sm cursor-pointer transition-colors
                                             ${(hoverRating || rating) >= starValue ? 'text-yellow-500' : 'text-gray-400'}
                                             ${ratingLoading ? 'opacity-50 cursor-not-allowed' : 'hover:text-yellow-600'}
                                         `}
                                         onMouseEnter={() => setHoverRating(starValue)} // Set hover state
                                         onClick={() => handleRatingClick(starValue)} // Handle rating click
                                     >
                                         star
                                     </span>
                                 ))}
                                  {/* Optional: Display selected rating value on hover */}
                                  {hoverRating > 0 && <span className="text-sm text-gray-600 ml-1">{hoverRating}</span>}
                                  {/* Display loading spinner when submitting rating */}
                                  {ratingLoading && <span className="material-symbols-outlined animate-spin text-sm ml-1 text-primary-600">progress_activity</span>}
                             </div>
                         ) : (
                             // If not rateable by the current user (is author, not authenticated, or already rated)
                             // show static rating display
                             <>
                                 <span className="material-symbols-outlined text-yellow-500 text-sm">
                                     star
                                 </span>
                                 <span className="text-sm">{rating ? rating.toFixed(1) : 'N/A'} ({ratingsCount || 0})</span> {/* Display rating and count */}
                             </>
                         )}
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
                 {/* Display local rating error message */}
                 {ratingError && (
                     <div className="mt-2 text-xs text-red-600 text-center">
                         {ratingError}
                     </div>
                 )}
            </div>
            <div className="bg-gray-50 p-3 flex justify-between border-t border-gray-100">
                {/* Author Info (Assuming author might be populated from backend) */}
                {/* Conditionally render author info ONLY if the current user is NOT the author */}
                {!isAuthor && author && (
                     <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-300">
                             <img
                                 src={author.avatar || 'https://placehold.co/24x24/cccccc/000000?text=User'} // Use author avatar or placeholder
                                 alt={`${author.name || 'Unknown'} avatar`}
                                 className="w-full h-full object-cover"
                                 onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/24x24/cccccc/000000?text=User' }} // Placeholder on error
                             />
                         </div>
                         <span className="text-sm text-gray-600">{author?.name || 'Unknown'}</span> {/* Display author name */}
                     </div>
                )}
                {/* If the user IS the author, you might show a different indicator here, or nothing */}
                {isAuthor && (
                     <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary-600 text-sm">person</span>
                          <span className="text-sm text-gray-600 font-medium">Your Prompt</span>
                     </div>
                )}

                {/* Try It Button */}
                {/* Conditionally render Try It button ONLY if the current user is NOT the author */}
                {!isAuthor && (
                     <button
                         className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors"
                         onClick={handleTryItClick} // Call the handler when clicked
                     >
                         Try It
                     </button>
                )}
                {/* If the user IS the author, you might show an "Edit" button here instead */}
                {isAuthor && (
                     <button
                         className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
                         // TODO: Add an onEdit handler prop to PromptCard and call it here
                         // onClick={() => onEditClick(prompt)}
                     >
                         Edit
                     </button>
                )}
            </div>
        </div>
    );
};

export default PromptCard;
