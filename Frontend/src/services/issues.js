// services/issues.js
import api from './api';

export const issuesService = {
  createIssue: (data) => api.post('/issues', data),
  getMyIssues: () => api.get('/issues/my-issues'),
  getOwnerIssues: () => api.get('/issues/owner/issues'),
  updateStatus: (id, status) => api.patch(`/issues/${id}/status`, { status })
};

// services/pghostel.js
export const pgService = {
  createPG: (data) => api.post('/pghostel', data),
  getPGList: () => api.get('/pghostel/list'),
  getMyPG: () => api.get('/student/my-pg')
};

// services/student.js
export const studentService = {
  selectPG: (pgHostelId) => api.patch('/student/select-pg', { pgHostelId })
};