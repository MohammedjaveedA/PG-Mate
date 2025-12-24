// src/services/auth.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const authService = {
  register: async (data) => {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    return response.data;
  },
  
  login: async (data) => {
    const response = await axios.post(`${API_URL}/auth/login`, data);
    return response.data;
  },
  
  setRole: async (data, token) => {
    const response = await axios.post(`${API_URL}/auth/set-role`, data, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  }
};