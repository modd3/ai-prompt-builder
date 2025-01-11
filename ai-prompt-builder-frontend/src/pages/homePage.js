import React, { useState, useEffect } from 'react';
import { fetchPrompts } from '../api/api';
import axios from 'axios';

const HomePage = () => {
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]); // State to hold categories
  const [category, setCategory] = useState(''); // Category input field
  const [sort, setSort] = useState('');
  const [activePrompt, setActivePrompt] = useState(null);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false); // Track if dropdown is visible

  // Fetch categories from the backend on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/prompts/categories');
        setCategories(res.data); // Set categories to state
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []); // Empty dependency array means it runs only on mount

  // Fetch prompts with filters when category or sort changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {};
        if (category) params.category = category; // Filter by category
        if (sort) params.sort = sort; // Sort prompts by title

        const res = await fetchPrompts(params);
        setPrompts(res.data); // Update prompts based on selected category and sort
      } catch (error) {
        console.error('Error fetching prompts:', error);
      }
    };

    fetchData();
  }, [category, sort]); // Dependencies: category and sort

  const handleTestPrompt = async (id) => {
    try {
      setActivePrompt(id);
      setResponse('');
      setError('');
      setLoading(true);

      const res = await axios.get(`http://localhost:5000/api/prompts/${id}`);
      const { template } = res.data;

      if (!template) {
        setError('Prompt template is empty or undefined.');
        setLoading(false);
        return;
      }

      const { data } = await axios.post('http://localhost:5000/api/hugface', { prompt: template });

      setResponse(data.response || 'No response received');
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred while fetching the response');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setIsDropdownVisible(true); // Show the dropdown when user starts typing
  };

  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory); // Set the category based on selection
    setIsDropdownVisible(false); // Hide the dropdown after selection
  };

  return (
    <div className="container my-5">
      <header className="text-center mb-5">
        <h1 className="display-4">Welcome to AI Prompt Builder</h1>
        <p className="lead">Create and test your AI prompts with ease using our platform.</p>
      </header>

      {/* Filter and Sort Controls */}
      <div className="row mb-4">
        <div className="col-md-6">
          <label htmlFor="category" className="form-label">
            Filter by Category
          </label>
          <input
            type="text"
            id="category"
            className="form-control"
            value={category}
            onClick={() => setIsDropdownVisible(true)} // Show dropdown when clicked
            onChange={handleCategoryChange} // Handle input field change
            placeholder="Enter or select category"
          />
          {isDropdownVisible && (
            <ul className="list-group mt-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {(category ? categories.filter((cat) => cat.toLowerCase().includes(category.toLowerCase())) : categories)
                .map((cat, index) => (
                  <li
                    key={index}
                    className="list-group-item"
                    onClick={() => handleCategorySelect(cat)} // Set category when clicked
                  >
                    {cat}
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="col-md-6">
          <label htmlFor="sort" className="form-label">
            Sort by Title
          </label>
          <select
            id="sort"
            className="form-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)} // Update sorting state
          >
            <option value="">None</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {/* Prompts List */}
      {prompts.length > 0 ? (
        <ul className="list-group">
          {prompts.map((prompt) => (
            <li key={prompt._id} className="list-group-item">
              <button
                className="btn btn-link text-decoration-none text-success text-uppercase"
                onClick={() => handleTestPrompt(prompt._id)}
              >
                {prompt.title}
              </button>
              <p className="mb-1">{prompt.template}</p>
              <small className="text-muted">Category: {prompt.category}</small>

              {activePrompt === prompt._id && (
                <div className="mt-2">
                  {loading && <p className="text-secondary">Loading response...</p>}
                  {!loading && response && (
                    <div>
                      <h5 className="text-secondary">AI Response:</h5>
                      <p>{response}</p>
                    </div>
                  )}
                  {!loading && error && <small className="text-danger">{error}</small>}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted text-center">No prompts found.</p>
      )}
    </div>
  );
};

export default HomePage;
