import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllComplaints, updateComplaintStatus } from '../api/api';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await getAllComplaints();
      setComplaints(response.data.complaints);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (complaintId, status) => {
    try {
      const resolutionDetails = window.prompt('Enter resolution details (optional):');
      await updateComplaintStatus(complaintId, status, resolutionDetails);
      fetchComplaints(); // Refresh the list after status update
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update complaint status');
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2 rounded-xl transition-colors"
        >
          Back to User Dashboard
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {complaints.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <h3 className="text-sm font-medium text-gray-900">No complaints found</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <div key={complaint._id} className="bg-white rounded-xl shadow p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">{complaint.subject}</h3>
                  <p className="text-gray-600 mb-2">{complaint.description}</p>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      Status: {complaint.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      Created: {new Date(complaint.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleStatusChange(complaint._id, 'in_progress')}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Mark In Progress
                  </button>
                  <button
                    onClick={() => handleStatusChange(complaint._id, 'resolved')}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => handleStatusChange(complaint._id, 'rejected')}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold mb-1">Submitted By:</h4>
                    <p className="text-gray-600">{complaint.userId?.name || 'Anonymous'}</p>
                    <p className="text-sm text-gray-500">{complaint.userId?.email}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Location:</h4>
                    <p className="text-gray-600">{complaint.location}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;