import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, getUserComplaints, getAllComplaints, updateComplaintStatus } from '../api/api';

const Dashboard = ({ isAdmin }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
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
    needsReview: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (isAdmin) {
          // Fetch all complaints for admin
          const complaintsData = await getAllComplaints();
          console.log('Admin complaints response:', complaintsData);
          
          // Handle different response formats
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
          
          console.log('Final processed complaints:', allComplaints);
          setComplaints(allComplaints);
          
          // Calculate validation statistics
          const stats = {
            highRisk: allComplaints.filter(c => c.validation?.riskLevel === 'high').length,
            mediumRisk: allComplaints.filter(c => c.validation?.riskLevel === 'medium').length,
            lowRisk: allComplaints.filter(c => c.validation?.riskLevel === 'low' || !c.validation?.riskLevel).length,
            needsReview: allComplaints.filter(c => c.validation?.needsManualReview).length
          };
          setValidationStats(stats);
        } else {
          // Fetch user profile
          const profileResponse = await getUserProfile();
          setProfile(profileResponse.data.user);

          // Fetch user complaints
          const complaintsResponse = await getUserComplaints();
          setComplaints(complaintsResponse.data.complaints || []);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  // Filter complaints based on selected status
  const filteredComplaints = filterStatus === 'all' 
    ? complaints 
    : complaints.filter(complaint => complaint.status === filterStatus);

  // Handle status update for a complaint
  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      await updateComplaintStatus(complaintId, newStatus, resolutionDetails);
      
      // Update the local state to reflect the change
      setComplaints(complaints.map(complaint => 
        complaint._id === complaintId 
          ? { ...complaint, status: newStatus, resolution_details: resolutionDetails } 
          : complaint
      ));
      
      setSelectedComplaint(null);
      setResolutionDetails('');
    } catch (error) {
      console.error('Error updating complaint status:', error);
      setError('Failed to update complaint status. Please try again.');
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
        {profile?.name || user?.name || 'Dashboard'}
      </h1>
      
      {/* User Profile Card or Admin Stats */}
      {isAdmin ? (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Validation Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">User Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-lg font-medium">{profile?.name || user?.name || 'N/A'}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-lg font-medium">{profile?.email || user?.email || 'N/A'}</p>
              </div>
            </div>
            <div>
              <div className="mb-4">
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="text-lg font-medium">{profile?.phone || 'Not provided'}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-500">Total Complaints</p>
                <p className="text-lg font-medium">{complaints.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Complaints Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {isAdmin ? 'All Complaints' : 'Your Complaints'}
          </h2>
          {!isAdmin && (
            <a href="/create-complaint" className="text-primary hover:text-primary-dark font-medium">
              + New Complaint
            </a>
          )}
        </div>
        
        {/* Admin Filters */}
        {isAdmin && (
          <div className="mb-6">
            <div className="flex space-x-2">
              <button 
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  filterStatus === 'all' 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
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
        )}
        
        {filteredComplaints.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {isAdmin 
                ? 'No complaints have been submitted yet.' 
                : 'You haven\'t submitted any complaints yet.'}
            </p>
            {!isAdmin && (
              <a 
                href="/create-complaint" 
                className="mt-4 inline-block bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Submit Your First Complaint
              </a>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Subject</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Location</th>
                  {isAdmin && (
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Risk Level</th>
                  )}
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Date</th>
                  {isAdmin && (
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{complaint.subject}</td>
                    <td className="py-3 px-4">{complaint.district}, {complaint.state}</td>
                    {isAdmin && (
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
                    )}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        complaint.status === 'resolved' 
                          ? 'bg-green-100 text-green-800' 
                          : complaint.status === 'in_progress' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}>
                        {complaint.status === 'in_progress' ? 'In Progress' : 
                         complaint.status === 'resolved' ? 'Resolved' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedComplaint(complaint)}
                          className="text-primary hover:text-primary-dark font-medium"
                        >
                          Review
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Admin Review Modal */}
      {isAdmin && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Review Complaint</h3>
              <button 
                onClick={() => setSelectedComplaint(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">Subject</p>
              <p className="font-medium">{selectedComplaint.subject}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">Description</p>
              <p>{selectedComplaint.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p>{selectedComplaint.address}</p>
                <p>{selectedComplaint.district}, {selectedComplaint.state}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Submitted By</p>
                <p>{selectedComplaint.user_id?.name || 'Unknown'}</p>
                <p className="text-sm">{selectedComplaint.user_id?.email}</p>
              </div>
            </div>
            
            {selectedComplaint.image && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Attached Image</p>
                <img 
                  src={`http://localhost:8000${selectedComplaint.image}`} 
                  alt="Complaint" 
                  className="max-h-48 rounded-lg"
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
                onClick={() => handleStatusUpdate(selectedComplaint._id, 'resolved')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                disabled={selectedComplaint.status === 'resolved' || !resolutionDetails}
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

export default Dashboard;