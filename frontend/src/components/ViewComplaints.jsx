import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserComplaints, getAllComplaints, getComplaintsByDistrict, getComplaintsByState } from '../api/api';
import { useAuth } from '../context/AuthContext';

const ViewComplaints = () => {
  const { user, isAdmin } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    type: 'all',
    value: '',
  });

  useEffect(() => {
    fetchComplaints();
  }, [filter]);

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      let response;
      if (isAdmin) {
        switch (filter.type) {
          case 'district':
            response = await getComplaintsByDistrict(filter.value, headers);
            break;
          case 'state':
            response = await getComplaintsByState(filter.value, headers);
            break;
          default:
            response = await getAllComplaints(headers);
        }
      } else {
        response = await getUserComplaints(headers);
      }
      setComplaints(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {isAdmin ? 'All Complaints' : 'My Complaints'}
        </h2>
        {!isAdmin && (
          <Link
            to="/create-complaint"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            New Complaint
          </Link>
        )}
      </div>

      {isAdmin && (
        <div className="mb-6 flex gap-4">
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">All Complaints</option>
            <option value="district">Filter by District</option>
            <option value="state">Filter by State</option>
          </select>
          {filter.type !== 'all' && (
            <input
              type="text"
              value={filter.value}
              onChange={(e) => setFilter({ ...filter, value: e.target.value })}
              placeholder={`Enter ${filter.type}...`}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No complaints found</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {complaints.map((complaint) => (
              <li key={complaint._id}>
                <Link to={`/complaint/${complaint._id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {complaint.subject}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {complaint.district}, {complaint.state}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            complaint.status
                          )}`}
                        >
                          {complaint.status}
                        </span>
                        <span
                          className={`mt-1 text-xs ${getPriorityColor(
                            complaint.priority
                          )}`}
                        >
                          {complaint.priority} Priority
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500 line-clamp-2">
                      {complaint.description}
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      Created: {new Date(complaint.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ViewComplaints;