// utils/constants.js
export const ISSUE_CATEGORIES = [
  'plumbing', 'electrical', 'cleaning', 
  'furniture', 'internet', 'security', 'other'
];

export const PRIORITY_LEVELS = ['low', 'medium', 'high', 'urgent'];
export const STATUS_TYPES = ['pending', 'in-progress', 'resolved', 'closed'];

// utils/helpers.js
export const formatDate = (date) => new Date(date).toLocaleDateString();
export const getStatusColor = (status) => {
  const colors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'resolved': 'bg-green-100 text-green-800',
    'closed': 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};