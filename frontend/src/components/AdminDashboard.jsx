import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllComplaints, updateComplaintStatus, getValidationStatistics } from '../api/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolutionDetails, setResolutionDetails] = useState('');
  const [validationStats, setValidationStats] = useState({
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
    needsReview: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    total: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all complaints for admin with direct console logging
        console.log('Fetching complaints for admin dashboard...');
        const complaintsData = await getAllComplaints();
        console.log('Raw admin complaints response:', complaintsData);
        
        // Handle the raw data directly
        let allComplaints = [];
        
        // Check if the data is already an array
        if (Array.isArray(complaintsData)) {
          console.log('Received complaints as direct array');
          allComplaints = complaintsData;
        } 
        // Check if it's in the status/complaints format
        else if (complaintsData && complaintsData.complaints && Array.isArray(complaintsData.complaints)) {
          console.log('Found complaints in complaints property');
          allComplaints = complaintsData.complaints;
        }
        // Fallback for any other format
        else if (complaintsData && typeof complaintsData === 'object') {
          console.log('Searching for array in response object');
          for (const key in complaintsData) {
            if (Array.isArray(complaintsData[key])) {
              console.log(`Found array in property: ${key}`);
              allComplaints = complaintsData[key];
              break;
            }
          }
        }
        
        // Ensure we have a valid array
        if (!Array.isArray(allComplaints)) {
          console.warn('Complaints data is not an array, using empty array');
          allComplaints = [];
        }
        
        console.log('Final processed complaints:', allComplaints);
        console.log('Number of complaints:', allComplaints.length);
        
        // Force update the state with the complaints
        setComplaints([...allComplaints]);
        
        // Calculate validation statistics
        calculateStats(allComplaints);
        
        // Try to fetch validation statistics from backend
        try {
          const statsResponse = await getValidationStatistics();
          console.log('Validation stats response:', statsResponse.data);
          
          if (statsResponse.data && statsResponse.data.data && statsResponse.data.data.stats) {
            setValidationStats(statsResponse.data.data.stats);
          } else if (statsResponse.data && statsResponse.data.stats) {
            setValidationStats(statsResponse.data.stats);
          }
        } catch (statsError) {
          console.error('Error fetching validation stats:', statsError);
          // Already calculated stats locally above
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    const calculateStats = (complaints) => {
      const stats = {
        total: complaints.length,
        highRisk: complaints.filter(c => c.validation?.riskLevel === 'high').length,
        mediumRisk: complaints.filter(c => c.validation?.riskLevel === 'medium').length,
        lowRisk: complaints.filter(c => c.validation?.riskLevel === 'low' || !c.validation?.riskLevel).length,
        needsReview: complaints.filter(c => c.validation?.needsManualReview).length,
        pending: complaints.filter(c => c.status === 'pending').length,
        inProgress: complaints.filter(c => c.status === 'in_progress').length,
        resolved: complaints.filter(c => c.status === 'resolved').length
      };
      setValidationStats(stats);
    };

    fetchData();
  }, []);

  // Filter complaints based on selected status
  const filteredComplaints = useMemo(() => {
    console.log('Filtering complaints with status:', filterStatus);
    console.log('Total complaints available:', complaints.length);
    
    if (filterStatus === 'all') {
      return complaints;
    } else {
      return complaints.filter(complaint => complaint.status === filterStatus);
    }
  }, [complaints, filterStatus]);
  
  console.log('Filtered complaints for UI:', filteredComplaints);
  console.log('Current filter status:', filterStatus);

  // Handle status update for a complaint
  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      if (!complaintId) {
        console.error('No complaint ID provided');
        alert('Error: Complaint ID is missing');
        return;
      }
      
      console.log(`Updating complaint ${complaintId} to status: ${newStatus}`);
      console.log('Resolution details:', resolutionDetails);
      
      if (newStatus === 'resolved' && !resolutionDetails) {
        alert('Please provide resolution details before marking as resolved');
        return;
      }
      
      // Make the API call to update the status
      const response = await updateComplaintStatus(complaintId, newStatus, resolutionDetails);
      console.log('Status update response:', response.data);
      
      // Update the local state to reflect the change
      const updatedComplaints = complaints.map(complaint => 
        complaint._id === complaintId 
          ? { 
              ...complaint, 
              status: newStatus, 
              resolution_details: resolutionDetails,
              resolved_at: newStatus === 'resolved' ? new Date().toISOString() : complaint.resolved_at
            } 
          : complaint
      );
      
      // Set the updated complaints array
      setComplaints(updatedComplaints);
      
      // Calculate validation statistics after update
      calculateStats(updatedComplaints);
      
      // Close the modal and reset form
      setSelectedComplaint(null);
      setResolutionDetails('');
      
      // Show success message
      alert(`Complaint status updated to ${newStatus.replace('_', ' ')}`);
      
      // Reload data to ensure we have the latest information
      fetchData();
    } catch (error) {
      console.error('Error updating complaint status:', error);
      alert(`Failed to update complaint status: ${error.message || 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Admin Dashboard
      </h1>
      
      {/* Debugging Section - Remove after fixing */}
      <div className="bg-gray-100 p-4 mb-6 rounded-lg">
        <h3 className="font-bold mb-2">Debug Info:</h3>
        <p>Total complaints in state: {complaints.length}</p>
        <p>Filtered complaints: {filteredComplaints.length}</p>
        <p>Current filter: {filterStatus}</p>
        <div className="mt-2">
          <h4 className="font-semibold">Raw Complaints Data:</h4>
          <pre className="bg-gray-200 p-2 mt-1 text-xs overflow-auto max-h-40">
            {JSON.stringify(complaints, null, 2)}
          </pre>
        </div>
      </div>
      
      {/* Admin Stats */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Validation Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">High Risk</p>
            <p className="text-2xl font-bold text-red-600">{validationStats.highRisk}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">Medium Risk</p>
            <p className="text-2xl font-bold text-yellow-600">{validationStats.mediumRisk}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">Low Risk</p>
            <p className="text-2xl font-bold text-green-600">{validationStats.lowRisk}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">Needs Review</p>
            <p className="text-2xl font-bold text-blue-600">{validationStats.needsReview}</p>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Status Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-600">{validationStats.total}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-blue-600">{validationStats.pending}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">In Progress</p>
            <p className="text-2xl font-bold text-yellow-600">{validationStats.inProgress}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">Resolved</p>
            <p className="text-2xl font-bold text-green-600">{validationStats.resolved}</p>
          </div>
        </div>
      </div>
      
      {/* Complaints Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800"></h2>
        </div>
        
        {/* Admin Filters */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <button 
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                filterStatus === 'pending' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              Pending
            </button>
            <button 
              onClick={() => setFilterStatus('in_progress')}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                filterStatus === 'in_progress' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
            >
              In Progress
            </button>
            <button 
              onClick={() => setFilterStatus('resolved')}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                filterStatus === 'resolved' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              Resolved
            </button>
          </div>
        </div>
        
        {filteredComplaints.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No complaints have been submitted yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Subject</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Location</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Priority</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Risk Level</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((complaint, index) => (
                  <tr key={complaint._id || index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{complaint.subject || 'No Subject'}</td>
                    <td className="py-3 px-4">
                      {complaint.district && complaint.state 
                        ? `${complaint.district}, ${complaint.state}`
                        : 'Location not available'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        complaint.urgency_level === 'high'
                          ? 'bg-red-100 text-red-800'
                          : complaint.urgency_level === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {complaint.urgency_level ? complaint.urgency_level.charAt(0).toUpperCase() + complaint.urgency_level.slice(1) : 'Low'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        complaint.validation?.riskLevel === 'high'
                          ? 'bg-red-100 text-red-800'
                          : complaint.validation?.riskLevel === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {complaint.validation?.riskLevel || 'Low'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        complaint.status === 'pending'
                          ? 'bg-blue-100 text-blue-800'
                          : complaint.status === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : complaint.status === 'resolved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}>
                        {complaint.status ? complaint.status.replace('_', ' ') : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {complaint.created_at 
                        ? new Date(complaint.created_at).toLocaleDateString() 
                        : 'Date not available'}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedComplaint(complaint)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Review Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                Review Complaint
              </h3>
              <button 
                onClick={() => {
                  setSelectedComplaint(null);
                  setResolutionDetails('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">Subject</p>
              <p className="font-medium">{selectedComplaint.subject || 'No Subject'}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">Description</p>
              <p>{selectedComplaint.description || 'No Description'}</p>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold">Complaint Data Debug:</h4>
              <pre className="bg-gray-200 p-2 mt-1 text-xs overflow-auto max-h-40">
                {JSON.stringify(selectedComplaint, null, 2)}
              </pre>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p>{selectedComplaint.address || 'Address not available'}</p>
                <p>{selectedComplaint.district && selectedComplaint.state 
                  ? `${selectedComplaint.district}, ${selectedComplaint.state}`
                  : 'District/State not available'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Submitted By</p>
                <p className="font-medium">
                  {selectedComplaint.user_name || 
                   (selectedComplaint.user_id && typeof selectedComplaint.user_id === 'object' && selectedComplaint.user_id.name) || 
                   'Unknown'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedComplaint.user_email || 
                   (selectedComplaint.user_id && typeof selectedComplaint.user_id === 'object' && selectedComplaint.user_id.email) || 
                   'Email not available'}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedComplaint.user_contact || 
                   (selectedComplaint.user_id && typeof selectedComplaint.user_id === 'object' && selectedComplaint.user_id.contact) || 
                   'Contact not available'}
                </p>
              </div>
            </div>
            
            {selectedComplaint.image && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Attached Image</p>
                <img 
                  src={`http://localhost:8000${selectedComplaint.image}`} 
                  alt="Complaint" 
                  className="max-h-48 rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                  }}
                />
              </div>
            )}
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">Validation Results</p>
              <div className={`mt-1 px-3 py-2 rounded-lg ${
                selectedComplaint.validation?.riskLevel === 'high'
                  ? 'bg-red-50 text-red-700'
                  : selectedComplaint.validation?.riskLevel === 'medium'
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-green-50 text-green-700'
              }`}>
                <p className="font-medium">
                  Risk Level: {selectedComplaint.validation?.riskLevel || 'Low'}
                </p>
                {selectedComplaint.validation?.riskFactors?.length > 0 && (
                  <ul className="mt-1 text-sm list-disc list-inside">
                    {selectedComplaint.validation.riskFactors.map((factor, index) => (
                      <li key={index}>{factor}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">Priority</p>
              <div className={`mt-1 px-3 py-2 rounded-lg ${
                selectedComplaint.urgency_level === 'high'
                  ? 'bg-red-50 text-red-700'
                  : selectedComplaint.urgency_level === 'medium'
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-green-50 text-green-700'
              }`}>
                <p className="font-medium">
                  Urgency Level: {selectedComplaint.urgency_level 
                    ? selectedComplaint.urgency_level.charAt(0).toUpperCase() + selectedComplaint.urgency_level.slice(1) 
                    : 'Medium'}
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resolution Details
              </label>
              <textarea
                value={resolutionDetails}
                onChange={(e) => setResolutionDetails(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows="3"
                placeholder="Enter details about how this complaint was resolved..."
              ></textarea>
            </div>
            
            <div className="flex space-x-2 justify-end">
              <button
                onClick={() => handleStatusUpdate(selectedComplaint._id, 'in_progress')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                disabled={selectedComplaint.status === 'in_progress'}
              >
                Mark In Progress
              </button>
              <button
                onClick={() => {
                  if (!resolutionDetails.trim()) {
                    alert('Please provide resolution details before marking as resolved');
                    return;
                  }
                  
                  handleStatusUpdate(selectedComplaint._id, 'resolved');
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                disabled={selectedComplaint.status === 'resolved'}
              >
                Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
