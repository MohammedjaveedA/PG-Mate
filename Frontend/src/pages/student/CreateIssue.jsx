// src/pages/student/CreateIssue.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateIssue() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [pgDetails, setPgDetails] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    roomNumber: '',
    description: '',
    category: 'electrical',
    priority: 'medium',
  });

  const categories = [
    'plumbing',
    'electrical', 
    'cleaning',
    'furniture',
    'internet',
    'security',
    'other'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    // Check if student has PG
    const storedUser = localStorage.getItem('user');
    const storedPG = localStorage.getItem('student_pg_id');
    
    if (!storedUser || !storedPG) {
      // Redirect to dashboard if no PG selected
      alert('Please select a PG first!');
      navigate('/student');
      return;
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Fetch PG details
    fetchPGDetails(storedPG);
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Issue reported successfully!');
        // Reset form
        setFormData({
          title: '',
          description: '',
          category: 'electrical',
          priority: 'medium',
        });
        
        // Redirect to issues list after 2 seconds
        setTimeout(() => {
          navigate('/student/issues');
        }, 2000);
      } else {
        setError(data.message || 'Failed to report issue');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!pgDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">No PG Selected</h2>
          <p className="text-gray-600 mt-2">Please select a PG first</p>
          <button
            onClick={() => navigate('/student')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Go to Dashboard
          </button>
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
              <h1 className="text-2xl font-bold text-gray-900">Report New Issue</h1>
              <p className="text-gray-600">
                {user?.name || 'Student'} • PG: {pgDetails?.name}
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/student/issues')}
               
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-800"
              >
                View My Issues
              </button>
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* PG Info Card */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Reporting Issue For</h2>
              <p className="text-gray-600 mt-1">
                {pgDetails?.name} • {pgDetails?.address?.city}, {pgDetails?.address?.state}
              </p>
            </div>
            {/* <div className="text-right">
              <p className="text-sm text-gray-500">Room: ________</p>
              <button
                onClick={() => navigate('/student')}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Change PG
              </button>
            </div> */}
          </div>
        </div>

        {/* Issue Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Issue Details</h2>
          
          {success && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
              {success}
              <p className="text-sm mt-1">Redirecting to issues list...</p>
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., AC Not Working, Water Leakage, etc."
                required
              />
            </div>


            {/* Room Number */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Number*
              </label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Room 101, Floor 2, etc."
                required
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Describe the issue in detail. Include location, time, and any other relevant information."
                required
              />
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {priorities.map(priority => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() => setFormData({...formData, priority: priority.value})}
                      className={`px-3 py-2 rounded-lg border ${
                        formData.priority === priority.value
                          ? `${priority.color} border-transparent font-semibold`
                          : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {priority.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/student/issues')}
                className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      title: '',
                      description: '',
                      category: 'electrical',
                      priority: 'medium',
                    });
                  }}
                  className="px-6 py-3 bg-yellow-100 text-yellow-800 font-medium rounded-lg hover:bg-yellow-200"
                >
                  Clear Form
                </button>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Reporting...' : 'Report Issue'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Tips for Reporting Issues</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Be specific about the location (room number, floor, etc.)
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Mention when the issue started
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Use appropriate priority level
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Owner will respond within 24-48 hours
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}