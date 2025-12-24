// src/pages/student/MyIssues.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function MyIssues() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [pgDetails, setPgDetails] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, in-progress, resolved

  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'resolved': 'bg-green-100 text-green-800',
    'closed': 'bg-gray-100 text-gray-800'
  };

  const priorityColors = {
    'low': 'bg-green-100 text-green-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-orange-100 text-orange-800',
    'urgent': 'bg-red-100 text-red-800'
  };

  useEffect(() => {
    // Check if student has PG
    const storedUser = localStorage.getItem('user');
    const storedPG = localStorage.getItem('student_pg_id');
    
    if (!storedUser || !storedPG) {
      navigate('/student');
      return;
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Fetch PG details
    fetchPGDetails(storedPG);
    // Fetch issues
    fetchIssues();
  }, [navigate]);

  const fetchPGDetails = async (pgId) => {
    try {
      const response = await fetch('http://localhost:5000/api/pghostel/list');
      const data = await response.json();
      
      if (data.success) {
        const pg = data.pgHostels.find(p => p._id === pgId);
        if (pg) {
          setPgDetails(pg);
        }
      }
    } catch (err) {
      console.error('Error fetching PG details:', err);
    }
  };

  const fetchIssues = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/issues/my-issues', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIssues(data || []);
      } else {
        setError('Failed to load issues');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (filter === 'all') return true;
    return issue.status === filter;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading issues...</p>
        </div>
      </div>
    );
  }

  return (
   <div className="min-h-screen bg-blue-100">
      {/* Header */}
      <header className="bg-blue-50 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Reported Issues</h1>
              <p className="text-gray-600">
                {user?.name || 'Student'} • PG: {pgDetails?.name || 'Not selected'}
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/student/issues/create"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-800"
               
              >
                + Report New Issue
              </Link>
              <button
                onClick={() => navigate('/student')}
              
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-800 transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Card */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Issues Overview</h2>
              <p className="text-gray-600 mt-1">
                Total: {issues.length} • Pending: {issues.filter(i => i.status === 'pending').length}
              </p>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('in-progress')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'in-progress' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                In Progress
              </button>
              <button
                onClick={() => setFilter('resolved')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'resolved' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Resolved
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Issues List */}
        {filteredIssues.length > 0 ? (
          <div className="space-y-6">
            {filteredIssues.map((issue) => (
              <div key={issue._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">{issue.title}</h3>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${priorityColors[issue.priority] || 'bg-gray-100'}`}>
                          {issue.priority.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="mt-2 text-gray-600">{issue.description}</p>
                      
                      <div className="mt-4 flex flex-wrap gap-3">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[issue.status] || 'bg-gray-100'}`}>
                          {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                        </span>
                        <span className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full">
                          {issue.category.charAt(0).toUpperCase() + issue.category.slice(1)}
                        </span>
                        <span className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full">
                          Reported: {formatDate(issue.createdAt)}
                        </span>
                        {issue.resolvedAt && (
                          <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                            Resolved: {formatDate(issue.resolvedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex flex-col items-end">
                      {issue.status === 'pending' && (
                        <span className="text-xs text-yellow-600 font-medium mb-2">
                          ⏳ Waiting for response
                        </span>
                      )}
                      {issue.status === 'in-progress' && (
                        <span className="text-xs text-blue-600 font-medium mb-2">
                          🔧 Being worked on
                        </span>
                      )}
                      {issue.status === 'resolved' && (
                        <span className="text-xs text-green-600 font-medium mb-2">
                          ✅ Issue resolved
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Comments Section */}
                  {issue.comments && issue.comments.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Updates & Comments</h4>
                      <div className="space-y-3">
                        {issue.comments.map((comment, index) => (
                          <div key={index} className={`p-3 rounded-lg ${comment.isOwner ? 'bg-blue-50' : 'bg-gray-50'}`}>
                            <div className="flex justify-between items-start">
                              <div className="flex items-center">
                                <span className={`text-sm font-medium ${comment.isOwner ? 'text-blue-700' : 'text-gray-700'}`}>
                                  {comment.isOwner ? 'Owner' : 'You'}
                                </span>
                                <span className="mx-2 text-gray-400">•</span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(comment.createdAt)}
                                </span>
                              </div>
                            </div>
                            <p className="mt-1 text-gray-700">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* No Issues Found */
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No issues found</h3>
            <p className="mt-2 text-gray-500">
              {filter === 'all' 
                ? "You haven't reported any issues yet."
                : `No ${filter} issues found.`}
            </p>
            <div className="mt-6">
              <Link
                to="/student/issues/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Report Your First Issue
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}