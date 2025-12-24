// src/pages/owner/Issues.jsx - FIXED VERSION
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function OwnerIssues() {
  const [user, setUser] = useState(null);
  const [issues, setIssues] = useState([]);
  const [pgs, setPgs] = useState([]);
  const [selectedPg, setSelectedPg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialPgId = queryParams.get('pg');

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      navigate('/login');
      return;
    }
    
    try {
      const userData = JSON.parse(storedUser);
      if (userData.role !== 'owner') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      setUser(userData);
      
      // Fetch owner's PGs
      fetchOwnerPGs();
    } catch (err) {
      console.error('Error parsing user data:', err);
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (pgs.length > 0) {
      // Set selected PG based on URL parameter or first PG
      if (initialPgId) {
        const pg = pgs.find(p => p._id === initialPgId);
        if (pg) {
          setSelectedPg(pg);
        } else if (pgs.length > 0) {
          setSelectedPg(pgs[0]);
          // Update URL with correct PG ID
          navigate(`/owner/issues?pg=${pgs[0]._id}`, { replace: true });
        }
      } else if (pgs.length > 0) {
        setSelectedPg(pgs[0]);
        navigate(`/owner/issues?pg=${pgs[0]._id}`, { replace: true });
      }
    }
  }, [pgs, initialPgId, navigate]);

  useEffect(() => {
    if (selectedPg && selectedPg._id) {
      fetchIssues(selectedPg._id);
    }
  }, [selectedPg, filterStatus]);

  const fetchOwnerPGs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/pghostel/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setPgs(data.pgHostels || []);
      } else {
        setError(data.message || 'Failed to fetch your PGs');
      }
    } catch (err) {
      console.error('Error fetching PGs:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchIssues = async (pgId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      let url = `http://localhost:5000/api/issues/pg/${pgId}`;
      if (filterStatus !== 'all') {
        url += `?status=${filterStatus}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setIssues(data.issues || []);
      } else {
        setError(data.message || 'Failed to fetch issues');
      }
    } catch (err) {
      console.error('Error fetching issues:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateIssueStatus = async (issueId, newStatus) => {
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/issues/${issueId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(`Issue marked as ${newStatus}`);
        
        // Update the issue in the local state
        setIssues(prevIssues => 
          prevIssues.map(issue => 
            issue._id === issueId 
              ? { ...issue, status: newStatus, updatedAt: new Date().toISOString() }
              : issue
          )
        );
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update issue status');
      }
    } catch (err) {
      console.error('Error updating issue:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addComment = async (issueId, commentText) => {
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/issues/${issueId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          text: commentText,
          isOwner: true 
        })
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Comment added successfully');
        
        // Update the issue in the local state
        setIssues(prevIssues => 
          prevIssues.map(issue => 
            issue._id === issueId 
              ? { 
                  ...issue, 
                  comments: [...(issue.comments || []), {
                    text: commentText,
                    isOwner: true,
                    createdAt: new Date().toISOString()
                  }]
                }
              : issue
          )
        );
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to add comment');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filteredIssues = issues.filter(issue => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        issue.title?.toLowerCase().includes(query) ||
        issue.description?.toLowerCase().includes(query) ||
        issue.category?.toLowerCase().includes(query) ||
        (issue.studentId?.name?.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !issues.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-100">
      <header className="bg-blue-50 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Issue Management</h1>
                <p className="text-gray-600">
                  {user?.name || 'Owner'} • Manage PG/Hostel Issues
                </p>
              </div>
            </div>
             <div className="flex space-x-4">
            <Link 
                to="/owner/dashboard" 
               className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
              >
                ← Back to Dashboard
              </Link>
            <button
              onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Logout
            </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats and Filters */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedPg ? `Issues for ${selectedPg.name}` : 'Select a PG/Hostel'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''} found
                </p>
              </div>

              {/* PG Selector */}
              {/* <div className="flex gap-4">
                {pgs.length > 0 && (
                  <select
                    value={selectedPg?._id || ''}
                    onChange={(e) => {
                      const pg = pgs.find(p => p._id === e.target.value);
                      setSelectedPg(pg);
                      navigate(`/owner/issues?pg=${pg._id}`);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {pgs.map(pg => (
                      <option key={pg._id} value={pg._id}>
                        {pg.name} - {pg.address?.city || 'Unknown'}
                      </option>
                    ))}
                  </select>
                )}

                <Link
                  to="/owner/dashboard"
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Manage PGs
                </Link>
              </div> */}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Total Issues</p>
                <p className="text-2xl font-bold text-gray-900">{issues.length}</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-600 font-medium">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {issues.filter(i => i.status === 'pending').length}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {issues.filter(i => i.status === 'in-progress').length}
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {issues.filter(i => i.status === 'resolved').length}
                </p>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search issues by title, description, or reporter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`px-4 py-2 rounded-lg ${filterStatus === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilterStatus('in-progress')}
                  className={`px-4 py-2 rounded-lg ${filterStatus === 'in-progress' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => setFilterStatus('resolved')}
                  className={`px-4 py-2 rounded-lg ${filterStatus === 'resolved' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                  Resolved
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Issues List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredIssues.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? 'No issues match your search criteria'
                  : 'No issues reported for this PG/Hostel yet'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredIssues.map((issue) => (
                <div key={issue._id} className="p-6 hover:bg-gray-50">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Issue Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {issue.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Reported by <span className="font-medium">{issue.studentId?.name || 'Unknown'}</span> • 
                            Room: <span className="font-medium">{issue.roomNumber || 'Not specified'}</span>
                            <span className="mx-2">•</span>
                            {new Date(issue.createdAt).toLocaleDateString()} at {new Date(issue.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(issue.status)}`}>
                            {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                          </span>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(issue.priority)}`}>
                            {issue.priority} Priority
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">{issue.description}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          {issue.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(issue.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Comments Section */}
                      {issue.comments && issue.comments.length > 0 && (
                        <div className="mt-4 border-t pt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Comments:</h4>
                          <div className="space-y-3">
                            {issue.comments.map((comment, idx) => (
                              <div 
                                key={idx} 
                                className={`p-3 rounded-lg ${comment.isOwner ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'}`}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <span className="text-sm font-medium">
                                    {comment.isOwner ? 'You (Owner)' : (issue.studentId?.name || 'Student')}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(comment.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{comment.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add Comment Form */}
                      <div className="mt-4">
                        <textarea
                          id={`comment-${issue._id}`}
                          placeholder="Add a comment..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          rows="2"
                        />
                        <button
                          onClick={() => {
                            const textarea = document.getElementById(`comment-${issue._id}`);
                            if (textarea.value.trim()) {
                              addComment(issue._id, textarea.value.trim());
                              textarea.value = '';
                            }
                          }}
                          disabled={isSubmitting}
                          className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isSubmitting ? 'Adding...' : 'Add Comment'}
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 lg:w-48">
                      {issue.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateIssueStatus(issue._id, 'in-progress')}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            Start Working
                          </button>
                          <button
                            onClick={() => updateIssueStatus(issue._id, 'resolved')}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                          >
                            Mark as Resolved
                          </button>
                        </>
                      )}

                      {issue.status === 'in-progress' && (
                        <button
                          onClick={() => updateIssueStatus(issue._id, 'resolved')}
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          Mark as Resolved
                        </button>
                      )}

                      {issue.status === 'resolved' && (
                        <button
                          onClick={() => updateIssueStatus(issue._id, 'in-progress')}
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          Re-open Issue
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to mark this as pending?')) {
                            updateIssueStatus(issue._id, 'pending');
                          }
                        }}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                      >
                        Mark as Pending
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}