import React from 'react';
import './index.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import CreateComplaint from './components/CreateComplaint';
import Dashboard from './components/Dashboard';

import TrackComplaint from './components/TrackComplaint';


const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

const Home = () => {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Digital Grievance Redressal for Cleaner, Smarter India
            </h1>
            <p className="text-xl text-gray-600">
              Report issues in your area and track their resolution in real-time. Let's build a better community together.
            </p>
            {/* <button className="bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-xl transition-colors"> */}
              {/* Lodge Your Complaint Now */}
            {/* </button> */}
          </div>
        </div>
      </section>

{/*       
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Making a Difference</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { number: '5,000+', label: 'Complaints Resolved' },
            { number: '98%', label: 'Satisfaction Rate' },
            { number: '50+', label: 'Government Departments' },
            { number: '24h', label: 'Average Response Time' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-card p-6 text-center">
              <div className="text-primary text-3xl font-bold mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section> */}

      
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Recent Successes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Community Park Cleaned',
              category: 'Garbage',
              location: 'Rajaji Nagar, Bangalore',
              resolvedIn: '2 days'
            },
            {
              title: 'Streetlights Repaired',
              category: 'Infrastructure',
              location: 'Mayur Vihar, Delhi',
              resolvedIn: '3 days'
            },
            {
              title: 'Water Leakage Fixed',
              category: 'Water Supply',
              location: 'Andheri West, Mumbai',
              resolvedIn: '1 days'
            }
          ].map((story) => (
            <div key={story.title} className="bg-white rounded-xl shadow-card overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="inline-block px-3 py-1 bg-success-light text-success text-sm font-medium rounded-full">
                  RESOLVED
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{story.title}</h3>
                <div className="space-y-2 text-gray-600">
                  <p>Category: {story.category}</p>
                  <p>Location: {story.location}</p>
                  <p>Resolved in: {story.resolvedIn}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to make your voice heard?</h2>
          <p className="text-primary-light mb-8">
            Join thousands of citizens who are actively contributing to making India cleaner and smarter.
          </p>
          <div className="space-x-4">
            {/* <button className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 py-3 rounded-xl transition-colors">
              Lodge a Complaint
            </button> */}
            {/* <button className="bg-gray-800 text-white hover:bg-gray-900 font-semibold px-8 py-3 rounded-xl transition-colors">
              Track Existing Complaint
            </button> */}
          </div>
        </div>
      </section>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route 
                path="/create-complaint" 
                element={
                  <ProtectedRoute>
                    <CreateComplaint />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/track-complaint" 
                element={
                  <ProtectedRoute>
                    <TrackComplaint />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;