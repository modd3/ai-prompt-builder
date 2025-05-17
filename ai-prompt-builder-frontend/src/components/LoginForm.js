import React, { useState } from 'react';

// Component for the user login form
// Accepts a handler for successful login (e.g., to navigate or show a message)
const LoginForm = ({ onLoginSuccess }) => {
    // State for form inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // State for loading status and messages
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default browser form submission

        // Basic client-side validation
        if (!email || !password) {
            setMessage('Error: Please enter email and password.');
            return;
        }
         // Basic email format check (can be more robust)
        if (!/\S+@\S+\.\S+/.test(email)) {
            setMessage('Error: Please enter a valid email address.');
            return;
        }


        // Set loading state and clear previous messages
        setLoading(true);
        setMessage('');

        try {
            // Prepare data to send to the backend
            const userData = {
                email,
                password,
            };

            // Make the POST request to the backend login endpoint
            const response = await fetch(process.env.FRONTEND_API_URL + '/auth/login', { // Replace with your backend URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData), // Send user data as JSON
            });

            // Check if the request was successful
            if (!response.ok) {
                const errorData = await response.json();
                // Throw an error with the message from the backend if available
                throw new Error(errorData.msg || 'Login failed');
            }

            // Parse the successful response (should contain user data and token)
            const result = await response.json();
            setMessage('Login successful!'); // Set success message
            console.log('Logged in user:', result);

            // TODO: Store the JWT token and user data (e.g., in localStorage or context)
            // This is handled by the onLoginSuccess handler in HomePage now
            // localStorage.setItem('token', result.token);
            // localStorage.setItem('user', JSON.stringify({ _id: result._id, name: result.name, email: result.email }));
            // Call the parent handler for successful login
            if (onLoginSuccess) {
                 // Pass the full result object containing user data and token
                onLoginSuccess({ user: { _id: result._id, name: result.name, email: result.email }, token: result.token });
            }

            // Optional: Clear the form after successful login
            // setEmail('');
            // setPassword('');

        } catch (error) {
            // Handle errors during the fetch request or from the backend
            console.error('Error logging in user:', error);
            setMessage(`Error: ${error.message}`); // Set error message
        } finally {
            // Reset loading state
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 max-w-md mx-auto"> {/* Added max-w-md and mx-auto for centering */}
            <h3 className="text-2xl font-bold mb-6 text-center">Login to Your Account</h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2 font-medium text-sm">Email Address</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 mb-2 font-medium text-sm">Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-sm"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition shadow hover:shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading} // Disable button while loading
                >
                    {loading ? 'Logging In...' : 'Login'}
                </button>

                {/* Display messages */}
                {message && (
                    <div className={`mt-4 p-3 rounded-lg text-sm text-center ${message.startsWith('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {message}
                    </div>
                )}
            </form>
            {/* Link to registration page (if you have one) - this is handled in HomePage now */}
            {/* <p className="text-center text-gray-600 text-sm mt-4">
                Don't have an account? <button className="text-primary-600 hover:underline" onClick={onGoToRegister}>Register</button>
            </p> */}
        </div>
    );
};

export default LoginForm;
