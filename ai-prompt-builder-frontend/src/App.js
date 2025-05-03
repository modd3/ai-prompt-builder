import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import HomePage from "./pages/homePage";
import CreatePromptPage from "./pages/createPromptPage";
import TestPromptPage from "./pages/testPromptPage";
import './styles.css';


const App = () => (
  <Router>
    <Navbar />
    <div className="container my-5"> {/* Bootstrap container for proper spacing */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePromptPage />} />
        <Route path="/test" element={<TestPromptPage />} />
      </Routes>
    </div>
  </Router>
);

export default App;
