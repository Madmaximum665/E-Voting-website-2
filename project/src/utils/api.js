import axios from 'axios';

// Base URL for API requests
const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token');
    console.log('API Request to:', config.url);
    console.log('Token from localStorage:', token ? 'Token exists' : 'No token');
    if (token) {
      config.headers['x-auth-token'] = token;
      console.log('Added token to request headers');
    }
    return config;
  },
  error => {
    console.error('API Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// API endpoints for authentication
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },
  
  login: async (email, password) => {
    const response = await api.post('/users/login', { email, password });
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  }
};

// API endpoints for elections
export const electionAPI = {
  getAllElections: async () => {
    const response = await api.get('/elections');
    return response.data;
  },
  
  getActiveElections: async () => {
    const response = await api.get('/elections/active');
    return response.data;
  },
  
  getElectionById: async (id) => {
    const response = await api.get(`/elections/${id}`);
    return response.data;
  },
  
  createElection: async (electionData) => {
    const response = await api.post('/elections', electionData);
    return response.data;
  },
  
  updateElection: async (id, electionData) => {
    if (!id) {
      console.error('updateElection: Missing election ID');
      throw new Error('Election ID is required for update');
    }
    
    console.log(`Updating election with ID: ${id}`);
    const response = await api.put(`/elections/${id}`, electionData);
    return response.data;
  },
  
  deleteElection: async (id) => {
    const response = await api.delete(`/elections/${id}`);
    return response.data;
  },
  
  voteInElection: async (electionId, positionId, candidateId, voterId) => {
    console.log('[api.js] voteInElection - electionId:', electionId, 'Type:', typeof electionId);
    const response = await api.post(`/elections/${electionId}/vote`, { positionId, candidateId, voterId });
    return response.data;
  },
  
  getElectionResults: async (id) => {
    const response = await api.get(`/elections/${id}/results`);
    return response.data;
  }
};

// API endpoints for user management
export const userAPI = {
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  approveUser: async (id) => {
    const response = await api.put(`/users/${id}/approve`);
    return response.data;
  },
  
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

export default api; 