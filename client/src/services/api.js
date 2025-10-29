import { API_URL } from '../utils/constants';
import { getToken, clearAuth } from './auth';

const getHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (response) => {
  const data = await response.json();
  
  if (response.status === 401) {
    clearAuth();
    window.location.href = '/login';
    throw new Error('Session expired');
  }
  
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  
  return data;
};

export const authAPI = {
  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },
};

export const studentAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_URL}/student/profile/me`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  createProfile: async (profileData) => {
    const response = await fetch(`${API_URL}/student/profile`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  updateProfile: async (profileData) => {
    const response = await fetch(`${API_URL}/student/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },
};

export const uploadAPI = {
  uploadProfilePicture: async (file) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await fetch(`${API_URL}/upload/profile-picture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return handleResponse(response);
  },

  uploadResume: async (file) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await fetch(`${API_URL}/upload/resume`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return handleResponse(response);
  },
};
