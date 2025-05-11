import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllComplaints, updateComplaintStatus } from '../api/api';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
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
      const complaint = complaints.find(c => c._id === complaintId);
      const validationWarnings = [];
      
      // Check for validation warnings
      if (complaint.validation?.riskLevel === 'high') {
        validationWarnings.push('⚠️ High risk complaint - requires thorough review');
      }
      if (complaint.validation?.gpsValidation?.isValid === false) {
        validationWarnings.push('⚠️ GPS location does not match reported address');
      }
      if (complaint.validation?.imageValidation?.isDuplicate) {
        validationWarnings.push('⚠️ Duplicate image detected');
      }
      if (findSimilarComplaints(complaint).length > 2) {
        validationWarnings.push(`⚠️ ${findSimilarComplaints(complaint).length} similar complaints in the area`);
      }

      // Show validation warnings if any
      if (validationWarnings.length > 0) {
        const proceed = window.confirm(
          'Warning: This complaint has the following issues:\n\n' +
          validationWarnings.join('\n') +
          '\n\nDo you want to proceed with the status change?'
        );
        if (!proceed) return;
      }

      const resolutionDetails = window.prompt('Enter resolution details (optional):');
      await updateComplaintStatus(complaintId, status, resolutionDetails);
      fetchComplaints();
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update complaint status');
    }
  };

  const findSimilarComplaints = (complaint) => {
    return complaints.filter(c => 
      c._id !== complaint._id && 
      c.district === complaint.district &&
      c.status !== 'resolved' &&
      new Date(c.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
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

  const filteredComplaints = complaints.filter(c => {
    const statusMatch = filterStatus === 'all' || c.status === filterStatus;
    const riskMatch = filterRisk === 'all' || c.validation?.riskLevel === filterRisk;
    return statusMatch && riskMatch;
  });

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-4">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border-gray-300 shadow-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select 
            value={filterRisk} 
            onChange={(e) => setFilterRisk(e.target.value)}
            className="rounded-lg border-gray-300 shadow-sm"
          >
            <option value="all">All Risk Levels</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredComplaints.map((complaint) => (
          <div key={complaint._id} className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{complaint.subject}</h3>
                <p className="text-gray-600 mb-2">{complaint.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Location Details</h4>
                    <p className="text-sm text-gray-600">{complaint.address}</p>
                    <p className="text-sm text-gray-600">{complaint.district}, {complaint.state}</p>
                    {complaint.latitude && complaint.longitude && (
                      <a 
                        href={`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        View on Map
                      </a>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Validation Status</h4>
                    <div className="space-y-1">
                      {complaint.validation?.gpsValidation?.isValid ? (
                        <p className="text-sm text-green-600">✓ GPS Location Verified</p>
                      ) : (
                        <p className="text-sm text-red-600">✗ GPS Location Mismatch</p>
                      )}
                      {complaint.validation?.imageValidation?.isDuplicate ? (
                        <p className="text-sm text-red-600">✗ Duplicate Image Detected</p>
                      ) : (
                        <p className="text-sm text-green-600">✓ Unique Image</p>
                      )}
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${getRiskLevelBadge(complaint.validation?.riskLevel)}`}>
                        {complaint.validation?.riskLevel || 'unknown'} risk
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm bg-${complaint.urgency_level === 'high' ? 'red' : complaint.urgency_level === 'medium' ? 'yellow' : 'green'}-100`}>
                    {complaint.urgency_level} priority
                  </span>
                </div>

                {/* Similar Complaints Section */}
                {findSimilarComplaints(complaint).length > 0 && (
                  <div className="mt-2 p-2 bg-amber-50 rounded-lg">
                    <p className="text-sm text-amber-700">
                      ⚠️ {findSimilarComplaints(complaint).length} similar complaints found in this area
                    </p>
                  </div>
                )}

                {/* Risk Factors */}
                {complaint.validation?.riskFactors?.length > 0 && (
                  <div className="mt-2 p-2 bg-red-50 rounded-lg">
                    <h4 className="text-sm font-medium text-red-700 mb-1">Risk Factors:</h4>
                    <ul className="list-disc list-inside text-sm text-red-600">
                      {complaint.validation.riskFactors.map((factor, index) => (
                        <li key={index}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusChange(complaint._id, 'in_progress')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                disabled={complaint.status === 'in_progress'}
              >
                Mark In Progress
              </button>
              <button
                onClick={() => handleStatusChange(complaint._id, 'resolved')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                disabled={complaint.status === 'resolved'}
              >
                Mark Resolved
              </button>
              <button
                onClick={() => handleStatusChange(complaint._id, 'rejected')}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                disabled={complaint.status === 'rejected'}
              >
                Reject
              </button>
              {complaint.image && (
                <button
                  onClick={() => window.open(complaint.image, '_blank')}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                >
                  View Image
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;