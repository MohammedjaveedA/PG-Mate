// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/auth';

export default function LoginPage() {
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

 // In LoginPage.jsx, update the handleSubmit function:
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  
  try {
    const response = await authService.login(formData);
    
    // Save token and user data
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    alert(`Login successful!`);
    
    // Redirect based on role
    if (response.user.role === 'student') {
      window.location.href = '/student';
    } else if (response.user.role === 'owner') {
      window.location.href = '/owner';
    } else {
      window.location.href = '/select-role'; // ← REDIRECT TO ROLE SELECTION
    }
    
  } catch (err) {
    setError(err.message || 'Login failed. Check your credentials.');
  } finally {
    setLoading(false);
  }
};

  return (
   <div className="bg-linear-to-br from-blue-300 to-gray-100 min-h-screen">
      <div className="min-h-screen flex flex-col items-center justify-center py-6 px-4">
        <div className="max-w-120 w-full">
          <h1 className="text-5xl font-bold text-blue-600 mb-1 text-center">
            PG-Mate
          </h1>
          <p className='text-[15px] font-bold text-gray-500 mb-4 text-center'>Your digital PG companion</p>

          <div className="p-6 sm:p-8 rounded-2xl bg-blue-50 border border-gray-200 shadow-sm">
            <h1 className="text-slate-900 text-center text-3xl font-semibold">
              Sign in
            </h1>
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="text-slate-900 text-sm font-medium mb-2 block">
                  Email Address
                </label>
                <input 
                  name="email" 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full text-slate-900 text-sm border border-slate-300 px-4 py-3 rounded-md outline-blue-600"
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="text-slate-900 text-sm font-medium mb-2 block">
                  Password
                </label>
                <input 
                  name="password" 
                  type="password" 
                  required 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full text-slate-900 text-sm border border-slate-300 px-4 py-3 rounded-md outline-blue-600"
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>

              <div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 px-4 text-[15px] font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
              
              <p className="text-slate-900 text-sm text-center">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Register here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}