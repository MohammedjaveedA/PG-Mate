// src/pages/RoleSelection.jsx
import { useState } from 'react';
import { authService } from '../services/auth';

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = async () => {
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      
      const response = await authService.setRole({ role: selectedRole }, token);
      
      // Update stored user data with role
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.role = selectedRole;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', response.token);
      
      alert(`Welcome as ${selectedRole}!`);
      
      // Redirect based on role
      if (selectedRole === 'student') {
        window.location.href = '/student';
      } else {
        window.location.href = '/owner';
      }
      
    } catch (err) {
      setError(err.message || 'Failed to set role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-300 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Choose Your Role
          </h1>
          <p className="text-gray-600">
            How do you want to use the platform?
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {/* Student Option */}
          <div 
            onClick={() => setSelectedRole('student')}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              selectedRole === 'student'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-white hover:border-blue-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                selectedRole === 'student' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v6l9-5M12 20l-9-5" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Student</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Report issues and track complaints in your PG/Hostel
                </p>
              </div>
              {selectedRole === 'student' && (
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Owner Option */}
          <div 
            onClick={() => setSelectedRole('owner')}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              selectedRole === 'owner'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-white hover:border-blue-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                selectedRole === 'owner' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">PG/Hostel Owner</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Manage your property and handle student complaints
                </p>
              </div>
              {selectedRole === 'owner' && (
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <button
          onClick={handleRoleSelect}
          disabled={loading || !selectedRole}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
            selectedRole && !loading
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? 'Setting up...' : `Continue as ${selectedRole || '...'}`}
        </button>

        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
          className="w-full mt-4 py-2 px-4 text-gray-600 hover:text-gray-800"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}