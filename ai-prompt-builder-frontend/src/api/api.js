import axios from 'axios';

const API = axios.create({ baseURL: process.env.FRONTEND_API_URL });


// Fetch prompts with optional filtering and sorting
export const fetchPrompts = (params = {}) => API.get('/api/prompts', { params });

// Create a new prompt
export const createPrompt = (newPrompt) => API.post('/api/prompts', newPrompt);

export default API;
