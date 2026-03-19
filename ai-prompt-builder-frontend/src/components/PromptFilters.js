import React, { useState, useEffect } from 'react';

const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

// Component for filtering and sorting prompts
// Accepts handlers to communicate changes back to the parent (HomePage)
const PromptFilters = ({ onFilterChange, onSortChange }) => {
    // State for the active model filter
    const [selectedModel, setSelectedModel] = useState('All');
    // State for the selected sort option
    const [sortBy, setSortBy] = useState('created_at'); // Corresponds to backend sort param
    // State for sort order (asc/desc) - managed internally or passed down if needed
    const [sortOrder, setSortOrder] = useState('desc'); // Default to newest first

    // State to hold unique tags fetched from the backend (for a tags filter dropdown/input)
    const [availableTags, setAvailableTags] = useState([]);
    // State for selected tags filter (e.g., an array or comma-separated string)
    const [selectedTags, setSelectedTags] = useState(''); // Using string for simplicity matching backend query

    // Effect to fetch unique tags from the backend when the component mounts
    useEffect(() => {
        const fetchTags = async () => {
            try {
                // Fetch unique tags from the backend API
                const response = await fetch(`${BACKEND_BASE_URL}/api/prompts/tags`);
                if (!response.ok) {
                    throw new Error('Failed to fetch tags');
                }
                const data = await response.json();
                const normalizedTags = Array.isArray(data) ? data : (data?.tags || []);
                setAvailableTags(['All', ...normalizedTags]); // Add 'All' option and set available tags
            } catch (error) {
                console.error('Error fetching tags:', error);
                setAvailableTags(['All']);
            }
        };
        fetchTags();
    }, []); // Empty dependency array means this runs once on mount

    // Handler for model filter button clicks
    const handleModelFilterClick = (model) => {
        setSelectedModel(model);
        // Call the parent component's handler with the new filter state
        if (onFilterChange) {
            onFilterChange({ targetModel: model });
        }
    };

    // Handler for sort dropdown change
    const handleSortChange = (e) => {
        const value = e.target.value;
        let newSortBy = value;
        let newSortOrder = 'desc'; // Default sort order

        // Determine sort field and order based on selected value
        if (value === 'Newest') {
            newSortBy = 'created_at';
            newSortOrder = 'desc';
        } else if (value === 'Oldest') {
             newSortBy = 'created_at';
             newSortOrder = 'asc';
        }
        else if (value === 'Highest Rated') {
            newSortBy = 'rating';
            newSortOrder = 'desc';
        } else if (value === 'Trending') {
            newSortBy = 'hot';
            newSortOrder = 'desc';
        } else if (value === 'Most Popular') {
            newSortBy = 'views';
            newSortOrder = 'desc';
        } else if (value === 'Most Discussed') {
            newSortBy = 'comments';
            newSortOrder = 'desc';
        }

        setSortBy(newSortBy);
        setSortOrder(newSortOrder);
        if (onSortChange) {
            onSortChange(newSortBy, newSortOrder);
        }
    };

    const handleTagsInputChange = (e) => {
         const tagsString = e.target.value;
         setSelectedTags(tagsString);
         if (onFilterChange) {
             onFilterChange({ tags: tagsString });
         }
    };


    const getModelButtonClass = (modelName) => {
        const baseClass = "px-3 py-1.5 rounded-full text-sm font-medium transition-all";
        if (selectedModel === modelName) {
             return `${baseClass} bg-primary-600 text-white hover:bg-primary-700`;
        } else {
            return `${baseClass} bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted/80`;
        }
    };

    return (
        <div className="flex items-center justify-between mb-6">
            {/* Model Filter Buttons */}
            <div className="flex flex-wrap gap-2">
                {['All', 'ChatGPT', 'Midjourney', 'HuggingFace', 'Claude', 'Gemini'].map(filter => (
                    <button
                        key={filter}
                        className={getModelButtonClass(filter)}
                        onClick={() => handleModelFilterClick(filter)}
                    >
                        {filter}
                    </button>
                ))}
                <input
                     type="text"
                     list="available-tags"
                     placeholder="Filter by tags (comma-separated)"
                     className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition outline-none focus:ring-2 focus:ring-primary-500 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted/80"
                     value={selectedTags}
                     onChange={handleTagsInputChange}
                 />
                 <datalist id="available-tags">
                    {availableTags.filter((tag) => tag !== 'All').map((tag) => (
                        <option key={tag} value={tag} />
                    ))}
                 </datalist>
            </div>
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-muted-foreground">Sort by:</span>
                <select
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition bg-white dark:bg-card dark:border-border"
                    value={
                         sortBy === 'created_at' && sortOrder === 'asc' ? 'Oldest' :
                         sortBy === 'created_at' && sortOrder === 'desc' ? 'Newest' :
                         sortBy === 'hot' ? 'Trending' :
                         sortBy === 'rating' ? 'Highest Rated' :
                         sortBy === 'comments' ? 'Most Discussed' :
                         sortBy === 'views' ? 'Most Popular' :
                         'Newest'
                    }
                    onChange={handleSortChange}
                >
                    <option value="Trending">Trending</option>
                    <option value="Newest">Newest</option>
                    <option value="Oldest">Oldest</option>
                    <option value="Most Popular">Most Popular</option>
                    <option value="Most Discussed">Most Discussed</option>
                    <option value="Highest Rated">Highest Rated</option>
                </select>
            </div>
        </div>
    );
};

export default PromptFilters;
