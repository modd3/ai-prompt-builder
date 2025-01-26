import React, { useState, useEffect, useRef } from 'react';
import { fetchPrompts } from '../api/api';
import axios from 'axios';
import { Pencil, Trash } from 'lucide-react'; // Icons for edit and delete

const HomePage = () => {
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [activePrompt, setActivePrompt] = useState(null);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [editData, setEditData] = useState({ title: '', template: '', category: '' });
  const [successMessage, setSuccessMessage] = useState('');

  const containerRefs = useRef({});
  const observer = useRef(null);

  // Refs for outside click detection
  const editFormRef = useRef(null);
  const aiResponseRef = useRef(null);
  const categoryDropdownRef = useRef(null); // Add a ref for the dropdown

  // Intersection Observer to handle infinite scroll
  const lastPromptRef = useRef();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/prompts/categories');
        setCategories(res.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    setPrompts([]);
    setPage(1);
    setHasMore(true);
  }, [category, sort]);

  useEffect(() => {
    const fetchData = async () => {
      if (loading || !hasMore) return;

      setLoading(true);

      try {
        const params = { page, limit: 10, category, sort };
        const res = await fetchPrompts(params);
        setPrompts((prev) => {
          const existingIds = new Set(prev.map((p) => p._id));
          return [...prev, ...res.data.prompts.filter((p) => !existingIds.has(p._id))];
        });

        if (res.data.prompts.length < 10) setHasMore(false);
      } catch (error) {
        console.error('Error fetching prompts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category, sort, page]);

  // Infinite scroll using IntersectionObserver
  useEffect(() => {
    if (!lastPromptRef.current) return;
    const currentObserver = observer.current;

    currentObserver?.observe(lastPromptRef.current);
    return () => {
      currentObserver?.disconnect();
    };
  }, [prompts]);

  const handleTestPrompt = async (id) => {
    setActivePrompt(id);
    setResponse('');
    setError('');
    setLoading(true);

    try {
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

  const handleEdit = (prompt) => {
    setActivePrompt(null); // Hide AI response
    setResponse('');       // Clear AI response content
    setEditingPrompt(prompt._id);
    setEditData({ title: prompt.title, template: prompt.template, category: prompt.category });
  };

  const handleSaveEdit = async () => {
    try {
      const res = await axios.put(`http://localhost:5000/api/prompts/${editingPrompt}`, editData);
      setPrompts((prev) =>
        prev.map((prompt) => (prompt._id === editingPrompt ? res.data : prompt))
      );
      setEditingPrompt(null);
      setSuccessMessage('Prompt updated successfully!');  // Show success message
  
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error saving prompt:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      try {
        await axios.delete(`http://localhost:5000/api/prompts/${id}`);
        setPrompts((prev) => prev.filter((prompt) => prompt._id !== id));
      } catch (error) {
        console.error('Error deleting prompt:', error);
      }
    }
  };

  // Function to detect click outside of edit form or AI response
  

  const handleClickOutside = (e) => {
    if (
      (editFormRef.current && !editFormRef.current.contains(e.target)) &&
      (aiResponseRef.current && !aiResponseRef.current.contains(e.target)) &&
      (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target))
    ) {
      setEditingPrompt(null); // Hide edit form
      setActivePrompt(null);   // Hide AI response
      setResponse('');
      setIsDropdownVisible(false); // Hide the dropdown
    }
  };
  

  // Adding the event listener for detecting click outside
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="container my-5">
      <header className="text-center mb-5">
        <h1 className="display-4">Welcome to AI Prompt Builder</h1>
        <p className="lead">Create and test your AI prompts with ease using our platform.</p>
      </header>

      <div className="row mb-4">
        <div className="col-md-6">
          <label htmlFor="category" className="form-label">
            Filter by Category
          </label>
          <div id="category-dropdown" ref={categoryDropdownRef}>
            <input
              type="text"
              id="category"
              className="form-control"
              value={category}
              onClick={() => setIsDropdownVisible(true)}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Enter or select category"
            />
            {isDropdownVisible && (
              <ul className="list-group mt-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {(category
                  ? categories.filter((cat) => cat.toLowerCase().includes(category.toLowerCase()))
                  : categories
                ).map((cat, index) => (
                  <li
                    key={index}
                    className="list-group-item"
                    onClick={() => {
                      setCategory(cat);
                      setIsDropdownVisible(false);
                    }}
                  >
                    {cat}
                  </li>
                ))}
              </ul>
            )}
          </div>
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

      {prompts.length > 0 ? (
        <ul className="list-group">
          {prompts.map((prompt, index) => (
            <li
              key={prompt._id}
              className="list-group-item position-relative"
              ref={index === prompts.length - 1 ? lastPromptRef : null}
            >
              {editingPrompt === prompt._id ? (
                <div className="bg-dark-form" ref={editFormRef}>
                  <label htmlFor="edit-title" className="form-label">Title</label>
                  <input
                    id="edit-title"
                    type="text"
                    value={editData.title}
                    className="form-control mb-2"
                    placeholder="Enter title"
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  />
                  <label htmlFor="edit-template" className="form-label">Template</label>
                  <textarea
                    id="edit-template"
                    value={editData.template}
                    className="form-control mb-2"
                    rows="3"
                    placeholder="Enter template"
                    onChange={(e) => setEditData({ ...editData, template: e.target.value })}
                  />
                  <label htmlFor="edit-category" className="form-label">Category</label>
                  <input
                    id="edit-category"
                    type="text"
                    value={editData.category}
                    className="form-control mb-2"
                    placeholder="Enter category"
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                  />
                  <button onClick={handleSaveEdit} className="btn btn-success btn-sm me-2">
                    Save
                  </button>
                  <button
                    onClick={() => setEditingPrompt(null)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>

                  {/* Display Success Message */}
                  {successMessage && (
                    <div className="alert alert-success mt-3" role="alert">
                      {successMessage}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="d-flex justify-content-between align-items-center">
                    <button
                      className="btn btn-link text-decoration-none text-success text-uppercase"
                      onClick={() => handleTestPrompt(prompt._id)}
                    >
                      {prompt.title}
                    </button>
                    <div className="action-icons d-flex">
                      <Pencil
                        className="me-2 cursor-pointer text-primary"
                        onClick={() => handleEdit(prompt)}
                        title="Edit"
                      />
                      <Trash
                        className="cursor-pointer text-danger"
                        onClick={() => handleDelete(prompt._id)}
                        title="Delete"
                      />
                    </div>
                  </div>
                  <p className="mb-1">{prompt.template}</p>
                  <small className="text-muted">Category: {prompt.category}</small>
                </div>
              )}

              {activePrompt === prompt._id && editingPrompt !== prompt._id && (
                <div className="mt-2" ref={aiResponseRef}>
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
