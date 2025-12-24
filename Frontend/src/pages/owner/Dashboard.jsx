// src/pages/owner/Dashboard.jsx - FIXED VERSION
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function OwnerDashboard() {
  const [user, setUser] = useState(null);
  const [pgs, setPgs] = useState([]);
  const [selectedPg, setSelectedPg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pgToDelete, setPgToDelete] = useState(null);
  
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    contact: {
      phone: '',
      email: ''
    },
    facilities: ['WiFi', 'Water'],
    description: ''
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState({
    name: '',
    contactPhone: '',
    addressStreet: '',
    addressCity: '',
    addressState: '',
    addressPincode: ''
  });

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      navigate('/login');
      return;
    }
    
    const userData = JSON.parse(storedUser);
    
    // Verify this is an owner
    if (userData.role !== 'owner') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
      return;
    }
    
    setUser(userData);
    
    // Fetch owner's PGs
    fetchOwnerPGs();
  }, [navigate]);

const fetchOwnerPGs = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    // Get owner's PGs
    const response = await fetch('http://localhost:5000/api/pghostel/my', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Check for authentication errors
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
      return;
    }
    
    const data = await response.json();
    
    if (data.success) {
      const pgs = data.pgHostels || [];
      
      if (pgs.length > 0) {
        // For each PG, fetch issue count
        const pgsWithIssueCount = await Promise.all(
          pgs.map(async (pg) => {
            try {
              const issuesResponse = await fetch(
                `http://localhost:5000/api/issues/pg/${pg._id}`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                }
              );
              
              if (issuesResponse.status === 401) {
                return { ...pg, issuesCount: 0 };
              }
              
              const issuesData = await issuesResponse.json();
              
              // COUNT ONLY UNRESOLVED ISSUES (pending + in-progress)
              let unresolvedCount = 0;
              if (issuesData.success && issuesData.issues) {
                unresolvedCount = issuesData.issues.filter(issue => 
                  issue.status === 'pending' || issue.status === 'in-progress'
                ).length;
              }
              
              return {
                ...pg,
                issuesCount: unresolvedCount  // Only count unresolved issues
              };
            } catch (error) {
              console.error(`Error fetching issues for PG ${pg._id}:`, error);
              return { ...pg, issuesCount: 0 };
            }
          })
        );
        
        setPgs(pgsWithIssueCount);
        
        // If selectedPg was deleted, select the first PG
        // Or if no PG was selected, select the first one
        if (!selectedPg || !pgsWithIssueCount.find(pg => pg._id === selectedPg._id)) {
          setSelectedPg(pgsWithIssueCount[0]);
        } else {
          // Keep the same selected PG but update its data
          const updatedSelectedPg = pgsWithIssueCount.find(pg => pg._id === selectedPg._id);
          if (updatedSelectedPg) {
            setSelectedPg(updatedSelectedPg);
          }
        }
      } else {
        setPgs([]);
        setSelectedPg(null);
      }
    } else {
      console.error('Failed to fetch PGs:', data.message);
      setError('Failed to load your PGs: ' + data.message);
      setPgs([]);
    }
  } catch (err) {
    console.error('Network error fetching PGs:', err);
    setError('Network error. Please check your connection.');
    setPgs([]);
  } finally {
    setLoading(false);
  }
};

  // Form validation function
  const validateForm = () => {
    const errors = {
      name: '',
      contactPhone: '',
      addressStreet: '',
      addressCity: '',
      addressState: '',
      addressPincode: ''
    };
    
    let isValid = true;
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'PG/Hostel name is required';
      isValid = false;
    }
    
    // Phone validation
    if (!formData.contact.phone.trim()) {
      errors.contactPhone = 'Contact phone is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.contact.phone.trim())) {
      errors.contactPhone = 'Phone must be 10 digits';
      isValid = false;
    }
    
    // Address validations
    if (!formData.address.street.trim()) {
      errors.addressStreet = 'Street address is required';
      isValid = false;
    }
    
    if (!formData.address.city.trim()) {
      errors.addressCity = 'City is required';
      isValid = false;
    }
    
    if (!formData.address.state.trim()) {
      errors.addressState = 'State is required';
      isValid = false;
    }
    
    if (!formData.address.pincode.trim()) {
      errors.addressPincode = 'Pincode is required';
      isValid = false;
    } else if (!/^\d{6}$/.test(formData.address.pincode.trim())) {
      errors.addressPincode = 'Pincode must be 6 digits';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
      
      // Clear error when user starts typing
      if (child === 'phone') {
        setFormErrors(prev => ({ ...prev, contactPhone: '' }));
      } else if (child === 'street') {
        setFormErrors(prev => ({ ...prev, addressStreet: '' }));
      } else if (child === 'city') {
        setFormErrors(prev => ({ ...prev, addressCity: '' }));
      } else if (child === 'state') {
        setFormErrors(prev => ({ ...prev, addressState: '' }));
      } else if (child === 'pincode') {
        setFormErrors(prev => ({ ...prev, addressPincode: '' }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Clear error when user starts typing
      if (name === 'name') {
        setFormErrors(prev => ({ ...prev, name: '' }));
      }
    }
  };

  const handleFacilityChange = (facility) => {
    setFormData(prev => {
      if (prev.facilities.includes(facility)) {
        return {
          ...prev,
          facilities: prev.facilities.filter(f => f !== facility)
        };
      } else {
        return {
          ...prev,
          facilities: [...prev.facilities, facility]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      setError('Please fill all required fields correctly');
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      let response;
      
      if (isEditing && selectedPg) {
        // UPDATE existing PG
        response = await fetch(`http://localhost:5000/api/pghostel/${selectedPg._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      } else {
        // CREATE new PG
        response = await fetch('http://localhost:5000/api/pghostel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      }

      const data = await response.json();
      
      if (data.success) {
        setSuccess(isEditing ? 'PG/Hostel updated successfully!' : 'PG/Hostel created successfully!');
        
        // Refresh the PG list
        await fetchOwnerPGs();
        
        if (!isEditing && data.pgHostel) {
          // Select the newly created PG
          setSelectedPg(data.pgHostel);
        }
        
        // Reset form
        resetForm();
        setIsEditing(false);
        
      } else {
        setError(data.message || 'Failed to save PG');
      }
    } catch (err) {
      console.error('Error saving PG:', err);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: { street: '', city: '', state: '', pincode: '' },
      contact: { phone: '', email: '' },
      facilities: ['WiFi', 'Water'],
      description: ''
    });
    setFormErrors({
      name: '',
      contactPhone: '',
      addressStreet: '',
      addressCity: '',
      addressState: '',
      addressPincode: ''
    });
  };

  const handleEditPG = (pg) => {
    setSelectedPg(pg);
    setIsEditing(true);
    
    // Fill form with PG data
    setFormData({
      name: pg.name || '',
      address: pg.address || { street: '', city: '', state: '', pincode: '' },
      contact: pg.contact || { phone: '', email: '' },
      facilities: pg.facilities || ['WiFi', 'Water'],
      description: pg.description || ''
    });
    
    // Scroll to form
    document.getElementById('pg-form').scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    resetForm();
  };

  // Delete PG function - FIXED VERSION
  const handleDeletePG = async () => {
    if (!pgToDelete) return;
    
    setDeleting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/pghostel/${pgToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(`PG/Hostel "${pgToDelete.name}" deleted successfully!`);
        
        // Remove the deleted PG from local state IMMEDIATELY
        const updatedPgs = pgs.filter(pg => pg._id !== pgToDelete._id);
        setPgs(updatedPgs);
        
        // Update selected PG
        if (selectedPg && selectedPg._id === pgToDelete._id) {
          // If the deleted PG was selected, select the first available PG
          if (updatedPgs.length > 0) {
            setSelectedPg(updatedPgs[0]);
          } else {
            setSelectedPg(null);
          }
        }
        
        // Close delete confirmation
        setShowDeleteConfirm(false);
        setPgToDelete(null);
        
        // Also refresh from backend to ensure consistency
        setTimeout(() => {
          fetchOwnerPGs();
        }, 500);
        
      } else {
        setError(data.message || 'Failed to delete PG');
      }
    } catch (err) {
      console.error('Error deleting PG:', err);
      setError('Network error. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const confirmDeletePG = (pg) => {
    setPgToDelete(pg);
    setShowDeleteConfirm(true);
  };

  const cancelDeletePG = () => {
    setShowDeleteConfirm(false);
    setPgToDelete(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const commonFacilities = ['WiFi', 'AC', 'Food', 'Laundry', 'Parking', 'Hot Water', 'Security', 'Power Backup'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your PGs...</p>
        </div>
      </div>
    );
  }

  return (
<div className="min-h-screen bg-blue-100">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && pgToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold text-red-600">{pgToDelete.name}</span>? 
                This action cannot be undone and all associated data will be lost.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelDeletePG}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeletePG}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete PG'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="bg-blue-50 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
              <p className="text-gray-600">
                {user?.name || 'Owner'} • {user?.email || ''}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome {user?.name || 'Owner'}!</h2>
              <p className="text-gray-600">
                {pgs.length > 0 
                  ? `You have ${pgs.length} PG/Hostel${pgs.length > 1 ? 's' : ''} registered`
                  : 'Please register your first PG/Hostel'}
              </p>
            </div>
            
            {/* This button should always show if there's a selected PG */}
            {selectedPg && selectedPg._id && (
              <Link
                to={`/owner/Issue?pg=${selectedPg._id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View Issues for {selectedPg.name}
              </Link>
            )}
          </div>

          {/* PG Selector Dropdown */}
          {pgs.length > 1 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select PG/Hostel:
              </label>
              <select
                value={selectedPg?._id || ''}
                onChange={(e) => {
                  const pg = pgs.find(p => p._id === e.target.value);
                  setSelectedPg(pg);
                  setIsEditing(false);
                  resetForm();
                }}
                className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {pgs.map(pg => (
                  <option key={pg._id} value={pg._id}>
                    {pg.name} - {pg.address?.city || 'Unknown'}
                  </option>
                ))}
              </select>
            </div>
          )}
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

        {/* Selected PG Information Card - FIXED: Only show if selectedPg exists in pgs array */}
        {selectedPg && pgs.find(pg => pg._id === selectedPg._id) && (
          <div className="mb-8 bg-white border border-blue-200 rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Currently Selected: {selectedPg.name}
                </h3>
                <p className="text-gray-600 mt-1">
                  {selectedPg.address?.street || ''}, {selectedPg.address?.city || ''}, 
                  {selectedPg.address?.state || ''} - {selectedPg.address?.pincode || ''}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedPg.facilities?.map((facility, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  to={`/owner/Issue?pg=${selectedPg._id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  View Issues ({selectedPg.issuesCount || 0})
                </Link>
                <button
                  onClick={() => handleEditPG(selectedPg)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  {isEditing ? 'Editing...' : 'Edit PG'}
                </button>
                <button
                  onClick={() => confirmDeletePG(selectedPg)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete PG
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PG Form */}
        <div id="pg-form" className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? `Update: ${selectedPg?.name}` : 'Register New PG/Hostel'}
            </h2>
            
            {isEditing && (
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            {/* ... (form fields remain the same) ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PG/Hostel Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                  placeholder="Enter PG/Hostel name"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="contact.email"
                  value={formData.contact.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional email for contact"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  name="contact.phone"
                  value={formData.contact.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.contactPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                  placeholder="10-digit phone number"
                  pattern="\d{10}"
                  maxLength="10"
                />
                {formErrors.contactPhone && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.contactPhone}</p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    placeholder="Street Address *"
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.addressStreet ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {formErrors.addressStreet && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.addressStreet}</p>
                  )}
                </div>
                
                <div>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    placeholder="City *"
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.addressCity ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {formErrors.addressCity && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.addressCity}</p>
                  )}
                </div>
                
                <div>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    placeholder="State *"
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.addressState ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {formErrors.addressState && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.addressState}</p>
                  )}
                </div>
                
                <div>
                  <input
                    type="text"
                    name="address.pincode"
                    value={formData.address.pincode}
                    onChange={handleInputChange}
                    placeholder="Pincode * (6 digits)"
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.addressPincode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                    pattern="\d{6}"
                    maxLength="6"
                  />
                  {formErrors.addressPincode && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.addressPincode}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facilities
              </label>
              <div className="flex flex-wrap gap-3">
                {commonFacilities.map(facility => (
                  <button
                    key={facility}
                    type="button"
                    onClick={() => handleFacilityChange(facility)}
                    className={`px-4 py-2 rounded-lg border ${
                      formData.facilities.includes(facility)
                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {facility}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your PG/Hostel (optional)"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting 
                  ? 'Saving...' 
                  : isEditing 
                    ? 'Update PG' 
                    : 'Register PG'
                }
              </button>
              
              {!isEditing && pgs.length > 0 && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300"
                >
                  Clear Form
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Display All PGs - FIXED: Check if pgs array is not empty */}
        {pgs.length > 0 ? (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Your PG/Hostels ({pgs.length})</h3>
             
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pgs.map(pg => (
                <div 
                  key={pg._id} 
                  className={`border rounded-lg p-4 ${selectedPg?._id === pg._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-gray-900">{pg.name}</h4>
                    
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {pg.address?.city || 'Unknown'}, {pg.address?.state || 'Unknown'}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {pg.facilities?.slice(0, 3).map((facility, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                        {facility}
                      </span>
                    ))}
                    {pg.facilities?.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                        +{pg.facilities.length - 3} more
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedPg(pg);
                        setIsEditing(false);
                        resetForm();
                      }}
                      className="text-sm px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    >
                      Select
                    </button>
                    <button
                      onClick={() => handleEditPG(pg)}
                      className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Edit
                    </button>
                    <Link
                      to={`/owner/issues?pg=${pg._id}`}
                      className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Issues ({pg.issuesCount || 0})
                    </Link>
                    <button
                      onClick={() => confirmDeletePG(pg)}
                      className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8 bg-white rounded-lg shadow p-6 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No PG/Hostels Registered</h3>
            <p className="text-gray-600">
              You haven't registered any PG/Hostels yet. Use the form above to register your first one.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}