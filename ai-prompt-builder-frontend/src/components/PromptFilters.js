import React, { useState, useEffect } from 'react';

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
                const response = await fetch(process.env.REACT_APP_FRONTEND_API_URL + '/prompts/tags'); // Replace with your backend URL
                if (!response.ok) {
                    throw new Error('Failed to fetch tags');
                }
                const data = await response.json();
                setAvailableTags(['All', ...data]); // Add 'All' option and set available tags
            } catch (error) {
                console.error('Error fetching tags:', error);
                // Handle error (e.g., display a message)
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
        } else if (value === 'Oldest') { // Added Oldest option
             newSortBy = 'created_at';
             newSortOrder = 'asc';
        }
        else if (value === 'Highest Rated') {
            newSortBy = 'rating';
            newSortOrder = 'desc';
        } else if (value === 'Most Popular') { // Assuming 'Popular' means 'views'
            newSortBy = 'views';
            newSortOrder = 'desc';
        }
         // Add logic for title sorting if needed

        setSortBy(newSortBy);
        setSortOrder(newSortOrder);
        // Call the parent component's handler with the new sort state
        if (onSortChange) {
            onSortChange(newSortBy, newSortOrder);
        }
    };

    // Handler for tags input change (if using a text input for tags)
    const handleTagsInputChange = (e) => {
         const tagsString = e.target.value;
         setSelectedTags(tagsString);
         // Call the parent component's handler with the new tags filter
         if (onFilterChange) {
             onFilterChange({ tags: tagsString });
         }
    };


    // Helper function to determine model button classes
    const getModelButtonClass = (modelName) => {
        const baseClass = "px-3 py-1.5 rounded-full text-sm font-medium transition-all";
        if (selectedModel === modelName) {
             return `${baseClass} bg-primary-600 text-white hover:bg-primary-700`;
        } else {
            return `${baseClass} bg-gray-100 text-gray-700 hover:bg-gray-200`;
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
                {/* TODO: Add a tags filter input or dropdown using 'availableTags' state */}
                 {/* Example Tags Input: */}
                 <input
                     type="text"
                     placeholder="Filter by tags (comma-separated)"
                     className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition outline-none focus:ring-2 focus:ring-primary-500"
                     value={selectedTags}
                     onChange={handleTagsInputChange}
                 /> 
            </div>
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                    value={
                         // Set the selected value based on sortBy and sortOrder
                         sortBy === 'created_at' && sortOrder === 'asc' ? 'Oldest' :
                         sortBy === 'created_at' && sortOrder === 'desc' ? 'Newest' :
                         sortBy === 'rating' ? 'Highest Rated' :
                         sortBy === 'views' ? 'Most Popular' :
                         'Newest' // Default display value
                    }
                    onChange={handleSortChange}
                >
                    <option value="Newest">Newest</option> {/* Corresponds to created_at desc */}
                    <option value="Oldest">Oldest</option> {/* Corresponds to created_at asc */}
                    <option value="Most Popular">Most Popular</option> {/* Corresponds to views desc */}
                    <option value="Highest Rated">Highest Rated</option> {/* Corresponds to rating desc */}
                    {/* Add options for title sorting if implemented */}
                    {/* <option value="title_asc">Title (A-Z)</option> */}
                    {/* <option value="title_desc">Title (Z-A)</option> */}
                </select>
            </div>
        </div>
    );
};

export default PromptFilters;
