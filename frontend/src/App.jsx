import React from 'react';
import'./index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import CreateComplaint from './components/CreateComplaint';
import Dashboard from './components/Dashboard';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<h1>Welcome to Grievance Redressal</h1>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/create-complaint" element={<CreateComplaint />} />
        <Route path="/dashboard" element={<Dashboard />} /> {/* Add this route */}
      </Routes>
    </Router>
  );
};

export default App;