import React, { useState, useEffect } from 'react';
import { fetchPrompts } from '../api/api';
import axios from 'axios';

const HomePage = () => {
  const [prompts, setPrompts] = useState([]);
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [activePrompt, setActivePrompt] = useState(null);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {};
        if (category) params.category = category;
        if (sort) params.sort = sort;

        const res = await fetchPrompts(params);
        setPrompts(res.data);
      } catch (error) {
        console.error('Error fetching prompts:', error);
      }
    };

    fetchData();
  }, [category, sort]);

  const handleTestPrompt = async (id) => {
    try {
      console.log(`Fetching details for prompt ID: ${id}`);

      // Reset state for new selection
      setActivePrompt(id);
      setResponse('');
      setError('');
      setLoading(true);

      // Fetch the specific prompt by ID
      const res = await axios.get(`http://localhost:5000/api/prompts/${id}`);
      console.log('Prompt details fetched:', res.data);
      const { template } = res.data;

      if (!template) {
        setError('Prompt template is empty or undefined.');
        setLoading(false);
        return;
      }

      // Send a POST request to /hugface with the template as the request body
      const { data } = await axios.post('http://localhost:5000/api/hugface', { prompt: template });

      setResponse(data.response || 'No response received');
    } catch (error) {
      console.error('Error occurred during prompt testing:', error);
      setError(error.response?.data?.error || 'An error occurred while fetching the response');
    } finally {
      setLoading(false);
    }
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
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Enter category"
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="sort" className="form-label">
            Sort by Title
          </label>
          <select
            id="sort"
            className="form-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
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

              {/* Conditional rendering for the active prompt */}
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
