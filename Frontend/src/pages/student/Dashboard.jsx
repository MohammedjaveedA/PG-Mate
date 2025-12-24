// src/pages/student/Dashboard.jsx - FIXED VERSION
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const [pgList, setPgList] = useState([]);
  const [selectedPG, setSelectedPG] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [hasPG, setHasPG] = useState(false);
  const [currentPG, setCurrentPG] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }

    // Fetch student's current PG from backend
    fetchStudentPG();
    // Fetch PG list
    fetchPGList();
  }, []);

  // Fetch student's current PG from backend
  const fetchStudentPG = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      console.log('🔄 Fetching student PG...');
      
      const response = await fetch('http://localhost:5000/api/student/my-pg', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        // Token invalid, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      const data = await response.json();
      console.log('📊 Student PG response:', data);
      
      if (data.success && data.student && data.student.pgHostelId) {
        // Student has a PG
        setHasPG(true);
        
        // Check if pgHostelId is an object or string
        if (typeof data.student.pgHostelId === 'object') {
          setSelectedPG(data.student.pgHostelId._id);
          setCurrentPG(data.student.pgHostelId);
          
          // Also save in localStorage for quick access
          localStorage.setItem('student_pg_id', data.student.pgHostelId._id);
          localStorage.setItem('student_pg_name', data.student.pgHostelId.name);
        } else {
          setSelectedPG(data.student.pgHostelId);
          // We'll get PG details from the full list
          localStorage.setItem('student_pg_id', data.student.pgHostelId);
        }
      } else {
        // Student doesn't have a PG
        setHasPG(false);
        setSelectedPG('');
        setCurrentPG(null);
        localStorage.removeItem('student_pg_id');
        localStorage.removeItem('student_pg_name');
      }
    } catch (err) {
      console.error('❌ Error fetching student PG:', err);
      setHasPG(false);
      setCurrentPG(null);
      setError('Failed to load your PG information');
    }
  };

  const fetchPGList = async () => {
    try {
      console.log('🔄 Fetching PG list...');
      const response = await fetch('http://localhost:5000/api/pghostel/list');
      const data = await response.json();
      console.log('📊 PG list response:', data);
      
      if (data.success) {
        setPgList(data.pgHostels || []);
        
        // If student has PG but currentPG is not set, find it from the list
        if (selectedPG && !currentPG) {
          const pgDetails = data.pgHostels.find(p => p._id === selectedPG);
          if (pgDetails) {
            setCurrentPG(pgDetails);
            localStorage.setItem('student_pg_name', pgDetails.name);
          }
        }
      } else {
        setError('Failed to load PG list: ' + data.message);
      }
    } catch (err) {
      console.error('❌ Error fetching PG list:', err);
      setError('Failed to load PG list');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPG = async (e) => {
    e.preventDefault();
    if (!selectedPG) {
      setError('Please select a PG/Hostel');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      console.log('🔄 Joining PG:', selectedPG);
      
      const response = await fetch('http://localhost:5000/api/student/select-pg', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pgHostelId: selectedPG })
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      const data = await response.json();
      console.log('📊 Join PG response:', data);

      if (data.success) {
        setSuccess('Successfully joined PG! You can now report issues.');
        
        // Update local state
        setHasPG(true);
        
        // Find and set the current PG details
        const selectedPGDetails = pgList.find(p => p._id === selectedPG);
        if (selectedPGDetails) {
          setCurrentPG(selectedPGDetails);
        }
        
        // Save in localStorage
        localStorage.setItem('student_pg_id', selectedPG);
        localStorage.setItem('student_pg_name', selectedPGDetails?.name || 'Your PG');
        
        // Update user in localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          userData.pgHostelId = selectedPG;
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
        }
        
        // Refresh PG list to get updated info
        setTimeout(() => {
          fetchStudentPG();
          fetchPGList();
        }, 500);
        
      } else {
        setError(data.message || 'Failed to select PG');
      }
    } catch (err) {
      console.error('❌ Error joining PG:', err);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeavePG = async () => {
    if (window.confirm('Are you sure you want to leave this PG? You will need to select a new one.')) {
      try {
        const token = localStorage.getItem('token');
        
        console.log('🔄 Leaving PG...');
        
        const response = await fetch('http://localhost:5000/api/student/leave-pg', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
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
        console.log('📊 Leave PG response:', data);
        
        if (data.success) {
          // Update local state
          setHasPG(false);
          setSelectedPG('');
          setCurrentPG(null);
          setSuccess('You have left the PG. Please select a new one.');
          
          // Remove from localStorage
          localStorage.removeItem('student_pg_id');
          localStorage.removeItem('student_pg_name');
          
          // Update user in localStorage
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            userData.pgHostelId = null;
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
          }
          
          // Refresh PG list
          setTimeout(() => {
            fetchStudentPG();
            fetchPGList();
          }, 500);
        } else {
          setError(data.message || 'Failed to leave PG');
        }
      } catch (err) {
        console.error('❌ Error leaving PG:', err);
        setError('Network error. Please try again.');
      }
    }
  };

  const handleLogout = () => {
    // Clear everything on logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('student_pg_id');
    localStorage.removeItem('student_pg_name');
    navigate('/login');
  };

  const handleReportIssue = () => {
    if (!hasPG || !selectedPG) {
      setError('You need to select a PG first before reporting issues.');
      return;
    }
    navigate('/student/issues/create');
  };

  const handleViewIssues = () => {
    if (!hasPG || !selectedPG) {
      setError('You need to select a PG first before viewing issues.');
      return;
    }
    navigate('/student/issues');
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

  return (
   <div className="min-h-screen bg-blue-100">
      {/* Header */}
      <header className="bg-blue-50 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-gray-600">
                {user?.name || 'Student'} • {user?.email || ''}
                {hasPG && currentPG && ` • PG: ${currentPG.name}`}
              </p>
            </div>
            <div className="flex space-x-4">
              {hasPG && (
                <button
                  onClick={handleLeavePG}
                 className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                >
                  Leave PG
                </button>
              )}
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
        {/* Status Card */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Your Status</h2>
              <p className="text-gray-600 mt-1">
                {hasPG
                  ? `✅ You are connected to: ${currentPG?.name || 'Your PG'}`
                  : '❌ You need to select a PG/Hostel first'}
              </p>
              {hasPG && currentPG && (
                <p className="text-sm text-green-600 mt-2">
                  You can now report issues for this PG
                </p>
              )}
            </div>
            {hasPG && (
              <div className="flex gap-2">
                <button
                  onClick={handleReportIssue}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Report Issue
                </button>
                <button
                  onClick={handleViewIssues}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  My Issues
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}

        {/* Conditional Display: Show PG Details OR PG Selection */}
        {hasPG && currentPG ? (
          /* SHOW PG DETAILS (When already joined) */
          <>
            {/* PG Details Card */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Your PG Details</h2>
                <button
                  onClick={handleLeavePG}
                  className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                >
                  Leave PG
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700">PG Name</h4>
                  <p className="text-gray-900 text-lg font-semibold">{currentPG.name || 'Not available'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Address</h4>
                  <p className="text-gray-900">
                    {currentPG.address?.street || ''}, {currentPG.address?.city || ''},
                    {currentPG.address?.state || ''} - {currentPG.address?.pincode || ''}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Facilities</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {currentPG.facilities && currentPG.facilities.length > 0 ? (
                      currentPG.facilities.map((facility, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {facility}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No facilities listed</span>
                    )}
                  </div>
                </div>
                {currentPG.contact && (
                  <div>
                    <h4 className="font-medium text-gray-700">Contact</h4>
                    <p className="text-gray-900">Phone: {currentPG.contact.phone || 'N/A'}</p>
                    <p className="text-gray-900">Email: {currentPG.contact.email || 'N/A'}</p>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleReportIssue}
                  className="py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                  Report New Issue
                </button>
                <button
                  onClick={handleViewIssues}
                  className="py-3 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
                >
                  View My Issues
                </button>
              </div>
            </div>

            {/* Warning about changing PG */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow p-4 mb-6">
              <div className="flex">
                <div className="shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Want to change PG?</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>You must first leave your current PG before selecting a new one.</p>
                    <p className="mt-1">Click "Leave This PG" button above, then you can select a different PG.</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* SHOW PG SELECTION FORM (When not joined) */
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Select Your PG/Hostel
            </h2>

            <form onSubmit={handleJoinPG}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available PG/Hostels
                </label>
                <select
                  value={selectedPG}
                  onChange={(e) => setSelectedPG(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a PG/Hostel</option>
                  {pgList.map((pg) => (
                    <option key={pg._id} value={pg._id}>
                      {pg.name} • {pg.address?.city || 'City'} • {pg.facilities?.slice(0, 3).join(', ') || 'No facilities'}
                    </option>
                  ))}
                </select>

                {pgList.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    No PG/Hostels available. Ask owners to register their properties.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || pgList.length === 0}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? 'Joining...' : 'Join PG'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}