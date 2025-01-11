import React, { useState } from 'react';
import axios from 'axios';

const PromptTester = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePromptSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse('');

    try {
      const { data } = await axios.post('http://localhost:5000/api/hugface', { prompt });
      setResponse(data.response || 'No response received');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while fetching the response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
    <h2>Test Your Prompt</h2>
      <form onSubmit={handlePromptSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here..."
          id="prompt"
          className="form-control"
          rows="4"
          cols="30"
        />
        <br />
        <button className="btn btn-success" type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Submit Prompt'}
        </button>
      </form>
      <div className="mt-4">
        {loading && <p>Loading response...</p>}
        {response && (
          <div>
            <h3>AI Response:</h3>
            <p>{response}</p>
          </div>
        )}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
};

export default PromptTester;
