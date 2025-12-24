// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/auth';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await authService.register(formData);
      setSuccess('Registration successful! You can now login.');
      
      // Clear form
      setFormData({ name: '', email: '', password: '', phone: '' });
      
      // Auto redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Registration failed');
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
              Create Account
            </h1>
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
                {success}
              </div>
            )}
            
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="text-slate-900 text-sm font-medium mb-2 block">
                  Full Name
                </label>
                <input 
                  name="name" 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full text-slate-900 text-sm border border-slate-300 px-4 py-3 rounded-md outline-blue-600"
                  placeholder="Enter your full name"
                  disabled={loading}
                />
              </div>
              
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
                  Phone Number
                </label>
                <input 
                  name="phone" 
                  type="tel" 
                  required 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full text-slate-900 text-sm border border-slate-300 px-4 py-3 rounded-md outline-blue-600"
                  placeholder="Enter your phone number"
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
                  placeholder="Create a strong password"
                  disabled={loading}
                />
              </div>

              <div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 px-4 text-[15px] font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
              
              <p className="text-slate-900 text-sm text-center">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Sign in here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}