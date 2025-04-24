import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserComplaints } from '../api/api';

function TrackComplaint() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        // No need to manually add token - the axios interceptor handles it
        const response = await getUserComplaints();
        
        console.log('Complaints response:', response.data);
        setComplaints(response.data.complaints || []);
      } catch (err) {
        console.error('Error fetching complaints:', err);
        
        // Check if it's an unauthorized error
        if (err.response && err.response.status === 401) {
          // Clear the token and redirect to login
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        
        setError('Failed to fetch complaints');
      } finally {
        setLoading(false);
      }
    };
    
    fetchComplaints();
  }, [navigate]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Track Complaints</h1>
        <button
          onClick={() => navigate('/create-complaint')}
          className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2 rounded-xl transition-colors"
        >
          New Complaint
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {complaints.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <h3 className="text-sm font-medium text-gray-900">No complaints</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new complaint.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {complaints.map((complaint) => (
            <div
              key={complaint._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:border-primary transition-colors"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {complaint.subject}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {complaint.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-gray-900">{complaint.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Location</label>
                      <p className="mt-1 text-gray-900">{complaint.address}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">District & State</label>
                      <p className="mt-1 text-gray-900">{complaint.district}, {complaint.state}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrackComplaint;