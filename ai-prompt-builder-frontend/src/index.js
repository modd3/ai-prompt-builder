import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css"; // Optional, for global styles

// Get the root element from your HTML (usually index.html)
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container); // Create a root

// Render the App component into the root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
