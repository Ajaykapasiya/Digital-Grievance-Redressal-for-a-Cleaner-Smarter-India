import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white shadow-md px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-bold">Grievance Redressal</h1>
      <ul className="flex gap-6">
        <li>
          <Link to="/" className="hover:text-gray-200 transition duration-200">Home</Link>
        </li>
        <li>
          <Link to="/login" className="hover:text-gray-200 transition duration-200">Login</Link>
        </li>
        <li>
          <Link to="/signup" className="hover:text-gray-200 transition duration-200">Signup</Link>
        </li>
        <li>
          <Link to="/dashboard" className="hover:text-gray-200 transition duration-200">Dashboard</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
