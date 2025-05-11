import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserComplaints } from '../api/api';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchComplaints();
  }, [user, navigate]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await getUserComplaints();
      if (response.data.status === 'success') {
        setComplaints(response.data.complaints);
      } else {
        setError('Failed to fetch complaints');
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError(err.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getRiskLevelBadge = (riskLevel) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[riskLevel] || 'bg-gray-100 text-gray-800';
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading complaints...</p>
        </div>
      </div>
    );
  }

  const filteredComplaints = filterStatus === 'all' 
    ? complaints 
    : complaints.filter(complaint => complaint.status === filterStatus);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
        <div className="mt-4 flex justify-between items-center">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="mt-1 block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={() => navigate('/create-complaint')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Create New Complaint
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredComplaints.length === 0 ? (
            <li className="p-4 text-center text-gray-500">
              {complaints.length === 0 ? 
                "You haven't submitted any complaints yet. Click 'Create New Complaint' to get started." :
                "No complaints found matching the selected filter."
              }
            </li>
          ) : (
            filteredComplaints.map((complaint) => (
              <li key={complaint._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900">{complaint.subject}</h3>
                    <p className="mt-1 text-sm text-gray-500">{complaint.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(complaint.status)}`}>
                        {complaint.status.replace('_', ' ').toUpperCase()}
                      </span>
                      {complaint.validation && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelBadge(complaint.validation.riskLevel)}`}>
                          Risk: {complaint.validation.riskLevel.toUpperCase()}
                        </span>
                      )}
                    </div>
                    {complaint.validation && complaint.validation.riskFactors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">Risk Factors:</p>
                        <ul className="mt-1 list-disc list-inside">
                          {complaint.validation.riskFactors.map((factor, index) => (
                            <li key={index} className="text-sm text-gray-600">{factor}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mt-2 text-sm text-gray-500">
                      <p>Location: {complaint.address}, {complaint.district}, {complaint.state}</p>
                      {complaint.validation?.gpsValidation && (
                        <p className="mt-1">
                          GPS Validation: {complaint.validation.gpsValidation.isValid ? '✅ Valid' : '❌ Invalid'}
                          {complaint.validation.gpsValidation.distance && 
                            ` (${Math.round(complaint.validation.gpsValidation.distance)}m from reported location)`
                          }
                        </p>
                      )}
                    </div>
                  </div>
                  {complaint.image && (
                    <div className="ml-4">
                      <img 
                        src={`http://localhost:8000/uploads/${complaint.image}`} 
                        alt="Complaint" 
                        className="h-24 w-24 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default UserDashboard;