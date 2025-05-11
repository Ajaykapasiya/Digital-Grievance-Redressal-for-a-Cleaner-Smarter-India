import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, getUserComplaints } from '../api/api';

const UserDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile
        const profileResponse = await getUserProfile();
        setProfile(profileResponse.data.user);

        // Fetch user complaints
        const complaintsResponse = await getUserComplaints();
        setComplaints(complaintsResponse.data.complaints || []);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      
      {/* User Profile Card */}
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
      
      {/* User Complaints */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Your Complaints</h2>
          <a href="/create-complaint" className="text-primary hover:text-primary-dark font-medium">
            + New Complaint
          </a>
        </div>
        
        {complaints.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">You haven't submitted any complaints yet.</p>
            <a 
              href="/create-complaint" 
              className="mt-4 inline-block bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Submit Your First Complaint
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Subject</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Location</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{complaint.subject}</td>
                    <td className="py-3 px-4">{complaint.district}, {complaint.state}</td>
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
                    <td className="py-3 px-4">
                      <a 
                        href={`/track-complaint/${complaint._id}`}
                        className="text-primary hover:text-primary-dark font-medium"
                      >
                        View Details
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {complaints.length > 5 && (
              <div className="mt-4 text-center">
                <a href="/track-complaint" className="text-primary hover:text-primary-dark font-medium">
                  View All Complaints
                </a>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        
        {complaints.length === 0 ? (
          <p className="text-gray-500">No recent activity to display.</p>
        ) : (
          <div className="space-y-4">
            {complaints
              .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
              .slice(0, 3)
              .map((complaint) => (
                <div key={complaint._id} className="border-l-4 border-primary pl-4 py-2">
                  <p className="font-medium">{complaint.subject}</p>
                  <p className="text-sm text-gray-600">
                    {complaint.updated_at !== complaint.created_at
                      ? `Status updated to ${complaint.status === 'in_progress' ? 'In Progress' : complaint.status === 'resolved' ? 'Resolved' : 'Pending'}`
                      : 'Complaint submitted'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(complaint.updated_at || complaint.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
