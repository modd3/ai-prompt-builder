import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import Navbar from "./components/navbar";
import HomePage  from "./pages/HomePage";



const App = () => (
  <Router>
    <div className="container"> 
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </div>
  </Router>
);

export default App;
