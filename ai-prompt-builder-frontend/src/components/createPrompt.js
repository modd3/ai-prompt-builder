import React, { useState, useRef } from 'react';
import { createPrompt } from '../api/api';
import { useNavigate } from 'react-router-dom';

const CreatePrompt = () => {
    const [title, setTitle] = useState('');
    const [template, setTemplate] = useState('');
    const [category, setCategory] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const successMessageRef = useRef(null); // Reference for the success message
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createPrompt({ title, template, category });
            setSuccessMessage('Prompt created successfully!\n Navigating to Home...');
            
            // Scroll to the success message
            setTimeout(() => {
                successMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 300);

            // Redirect to home page after a delay
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (error) {
            console.error('Error creating prompt:', error);
        }
        setTitle('');
        setTemplate('');
        setCategory('');
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Create a New Prompt</h2>
            <form onSubmit={handleSubmit} className="needs-validation">
                <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                        Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        className="form-control"
                        placeholder="Enter prompt title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="template" className="form-label">
                        Template
                    </label>
                    <textarea
                        id="template"
                        className="form-control"
                        rows="4"
                        placeholder="Enter prompt template"
                        value={template}
                        onChange={(e) => setTemplate(e.target.value)}
                        required
                    ></textarea>
                </div>
                <div className="mb-3">
                    <label htmlFor="category" className="form-label">
                        Category
                    </label>
                    <input
                        type="text"
                        id="category"
                        className="form-control"
                        placeholder="Enter prompt category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">
                    Create Prompt
                </button>
            </form>
            {successMessage && (
                <div
                    className="alert alert-success mt-4"
                    role="alert"
                    ref={successMessageRef} // Attach reference to the success message
                >
                    {successMessage}
                </div>
            )}
        </div>
    );
};

export default CreatePrompt;
