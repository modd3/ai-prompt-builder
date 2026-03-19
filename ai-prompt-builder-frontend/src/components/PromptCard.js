import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

// Component to display a single prompt card in the trending/explore sections
const PromptCard = ({ prompt, onTryItClick, onRatePrompt, onVotePrompt }) => {
    const { isAuthenticated, user, token } = useAuth();

    const [hoverRating, setHoverRating] = useState(0);
    const [ratingLoading, setRatingLoading] = useState(false);
    const [ratingError, setRatingError] = useState(null);

    const [voteLoading, setVoteLoading] = useState(false);
    const [voteError, setVoteError] = useState(null);

    const [commentsOpen, setCommentsOpen] = useState(false);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsError, setCommentsError] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentBody, setCommentBody] = useState('');
    const [commentSubmitting, setCommentSubmitting] = useState(false);

    const { _id, targetModel, title, content, rating, ratingsCount, author, ratedBy, upvotes = 0, downvotes = 0, commentCount = 0 } = prompt;

    const isAuthor = isAuthenticated && user && author && author._id === user._id;
    const hasUserRated = isAuthenticated && user && Array.isArray(ratedBy) && ratedBy.some(ratedById => ratedById === user._id);
    const canUserRate = isAuthenticated && !isAuthor && !hasUserRated;

    const score = (upvotes || 0) - (downvotes || 0);

    const handleTryItClick = () => {
        if (onTryItClick) onTryItClick(prompt);
    };

    const handleRatingClick = async (starValue) => {
        if (!canUserRate || ratingLoading) return;

        setRatingLoading(true);
        setRatingError(null);
        try {
            if (onRatePrompt) await onRatePrompt(_id, starValue);
        } catch (error) {
            setRatingError(error.message || 'Failed to submit rating.');
        } finally {
            setRatingLoading(false);
        }
    };

    const handleVote = async (value) => {
        if (!isAuthenticated || isAuthor || voteLoading) return;
        setVoteLoading(true);
        setVoteError(null);

        try {
            if (onVotePrompt) {
                await onVotePrompt(_id, value);
            } else {
                const response = await fetch(`${BACKEND_BASE_URL}/api/prompts/${_id}/vote`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ value }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.msg || 'Failed to vote');
                }
            }
        } catch (error) {
            setVoteError(error.message || 'Failed to update vote.');
        } finally {
            setVoteLoading(false);
        }
    };

    const loadComments = async () => {
        setCommentsLoading(true);
        setCommentsError(null);
        try {
            const response = await fetch(`${BACKEND_BASE_URL}/api/prompts/${_id}/comments`);
            if (!response.ok) {
                throw new Error('Failed to load comments.');
            }
            const data = await response.json();
            setComments(Array.isArray(data?.comments) ? data.comments : []);
        } catch (error) {
            setCommentsError(error.message || 'Failed to load comments.');
        } finally {
            setCommentsLoading(false);
        }
    };

    const handleToggleComments = async () => {
        const next = !commentsOpen;
        setCommentsOpen(next);
        if (next && comments.length === 0) {
            await loadComments();
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated || !commentBody.trim()) return;

        setCommentSubmitting(true);
        setCommentsError(null);

        try {
            const response = await fetch(`${BACKEND_BASE_URL}/api/prompts/${_id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ body: commentBody.trim() }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Failed to post comment.');
            }

            const data = await response.json();
            setComments((prev) => [data.comment, ...prev]);
            setCommentBody('');
        } catch (error) {
            setCommentsError(error.message || 'Failed to post comment.');
        } finally {
            setCommentSubmitting(false);
        }
    };

    const modelColorClass =
        targetModel === 'ChatGPT' ? 'bg-blue-100 text-blue-600' :
        targetModel === 'Midjourney' ? 'bg-purple-100 text-purple-600' :
        targetModel === 'Claude' ? 'bg-red-100 text-red-600' :
        targetModel === 'Gemini' ? 'bg-green-100 text-green-600' :
        targetModel === 'HuggingFace' ? 'bg-indigo-100 text-indigo-600' :
        'bg-gray-200 text-gray-700';

    const modelIcon =
        targetModel === 'ChatGPT' ? 'smart_toy' :
        targetModel === 'Midjourney' ? 'magic_button' :
        targetModel === 'Claude' ? 'table_chart' :
        targetModel === 'Gemini' ? 'globe' :
        targetModel === 'HuggingFace' ? 'psychology' :
        'psychology';

    return (
        <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${modelColorClass}`}>
                            <span className="material-symbols-outlined text-sm">{modelIcon}</span>
                        </div>
                        <span className="font-medium">{targetModel}</span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">High Success</span>
                </div>

                <h4 className="font-bold text-lg mb-2">{title}</h4>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {prompt.description || (content ? content.substring(0, 150) + '...' : 'No description available.')}
                </p>

                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-1">
                         {canUserRate ? (
                             <div className="flex items-center gap-0.5" onMouseLeave={() => setHoverRating(0)}>
                                 {[1, 2, 3, 4, 5].map(starValue => (
                                     <span
                                         key={starValue}
                                         className={`material-symbols-outlined text-sm cursor-pointer transition-colors
                                             ${(hoverRating || rating) >= starValue ? 'text-yellow-500' : 'text-gray-400'}
                                             ${ratingLoading ? 'opacity-50 cursor-not-allowed' : 'hover:text-yellow-600'}
                                         `}
                                         onMouseEnter={() => setHoverRating(starValue)}
                                         onClick={() => handleRatingClick(starValue)}
                                     >
                                         star
                                     </span>
                                 ))}
                                 {hoverRating > 0 && <span className="text-sm text-muted-foreground ml-1">{hoverRating}</span>}
                             </div>
                         ) : (
                             <>
                                 <span className="material-symbols-outlined text-yellow-500 text-sm">star</span>
                                 <span className="text-sm">{rating ? rating.toFixed(1) : 'N/A'} ({ratingsCount || 0})</span>
                             </>
                         )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            className="text-gray-500 hover:text-primary-600 transition-colors"
                            onClick={() => handleVote(1)}
                            disabled={!isAuthenticated || isAuthor || voteLoading}
                            aria-label="Upvote prompt"
                        >
                            <span className="material-symbols-outlined">arrow_upward</span>
                        </button>
                        <span className="text-sm font-semibold min-w-8 text-center">{score}</span>
                        <button
                            className="text-gray-500 hover:text-primary-600 transition-colors"
                            onClick={() => handleVote(-1)}
                            disabled={!isAuthenticated || isAuthor || voteLoading}
                            aria-label="Downvote prompt"
                        >
                            <span className="material-symbols-outlined">arrow_downward</span>
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <button
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        onClick={handleToggleComments}
                    >
                        {commentsOpen ? 'Hide Comments' : `Comments (${commentCount || 0})`}
                    </button>

                    <div className="flex gap-2">
                        <button className="text-gray-500 hover:text-primary-600 transition-colors" aria-label="Bookmark">
                            <span className="material-symbols-outlined">bookmark_add</span>
                        </button>
                        <button className="text-gray-500 hover:text-primary-600 transition-colors" aria-label="Share">
                            <span className="material-symbols-outlined">share</span>
                        </button>
                    </div>
                </div>

                {ratingError && <div className="mt-2 text-xs text-red-600 text-center">{ratingError}</div>}
                {voteError && <div className="mt-2 text-xs text-red-600 text-center">{voteError}</div>}

                {commentsOpen && (
                    <div className="mt-4 border-t border-border pt-3 space-y-3">
                        {isAuthenticated && (
                            <form onSubmit={handleCommentSubmit} className="flex gap-2">
                                <input
                                    type="text"
                                    value={commentBody}
                                    onChange={(e) => setCommentBody(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="flex-1 rounded-md border border-border px-3 py-2 text-sm bg-background"
                                />
                                <button
                                    type="submit"
                                    disabled={commentSubmitting || !commentBody.trim()}
                                    className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-md text-sm disabled:opacity-50"
                                >
                                    {commentSubmitting ? 'Posting...' : 'Post'}
                                </button>
                            </form>
                        )}

                        {commentsLoading && <p className="text-sm text-muted-foreground">Loading comments...</p>}
                        {commentsError && <p className="text-sm text-red-600">{commentsError}</p>}
                        {!commentsLoading && comments.length === 0 && !commentsError && (
                            <p className="text-sm text-muted-foreground">No comments yet.</p>
                        )}
                        {comments.map((comment) => (
                            <div key={comment._id} className="rounded-md border border-border p-2">
                                <p className="text-xs text-muted-foreground mb-1">{comment?.author?.name || 'User'}</p>
                                <p className="text-sm">{comment.body}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-muted/40 p-3 flex justify-between border-t border-border">
                {!isAuthor && author && (
                     <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-300">
                             <img
                                 src={author.avatar || 'https://placehold.co/24x24/cccccc/000000?text=User'}
                                 alt={`${author.name || 'Unknown'} avatar`}
                                 className="w-full h-full object-cover"
                                 onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/24x24/cccccc/000000?text=User'; }}
                             />
                         </div>
                         <span className="text-sm text-muted-foreground">{author?.name || 'Unknown'}</span>
                     </div>
                )}
                {isAuthor && (
                     <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary-600 text-sm">person</span>
                          <span className="text-sm text-muted-foreground font-medium">Your Prompt</span>
                     </div>
                )}

                {!isAuthor && (
                     <button className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors" onClick={handleTryItClick}>
                         Try It
                     </button>
                )}
                {isAuthor && (
                     <button className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors">Edit</button>
                )}
            </div>
        </div>
    );
};

export default PromptCard;
