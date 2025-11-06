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
    const errorMessage = data.error || data.message || `Request failed with status ${response.status}`;
    console.error('API Error:', {
      status: response.status,
      error: errorMessage,
      details: data.details || data
    });
    throw new Error(errorMessage);
  }
  
  return data;
};

// ============================================
// AUTH API
// ============================================
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

// ============================================
// STUDENT API
// ============================================
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

  getMyApplications: async () => {
    const response = await fetch(`${API_URL}/applications/me`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// ============================================
// USERS API
// ============================================
export const usersAPI = {
  getMe: async () => {
    const response = await fetch(`${API_URL}/users/me`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// ============================================
// UPLOAD API
// ============================================
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

// ============================================
// JOBS API (for students - browse & apply)
// ============================================
export const jobAPI = {
  // Get all active jobs with filters
  getJobs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/jobs?${query}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get single job details
  getJobDetails: async (jobId) => {
    const response = await fetch(`${API_URL}/jobs/${jobId}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Apply for a job
  applyForJob: async (jobId) => {
    const response = await fetch(`${API_URL}/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Recruiter/admin fallback: get applications for a job (public recruiter endpoint)
  getJobApplicationsRecruiter: async (jobId) => {
    const response = await fetch(`${API_URL}/jobs/${jobId}/applications`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// ============================================
// ADMIN API
// ============================================
export const adminAPI = {
  // Dashboard stats
  getStats: async () => {
    const response = await fetch(`${API_URL}/admin/stats`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get all students with filters
  getStudents: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/admin/students?${query}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get specific student
  getStudent: async (id) => {
    const response = await fetch(`${API_URL}/admin/students/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Verify resume for a student (toggle)
  verifyResume: async (userId, verified) => {
    const response = await fetch(`${API_URL}/admin/students/${userId}/verify-resume`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ verified }),
    });
    return handleResponse(response);
  },

  // Verify/unverify a student (general verification)
  verifyStudent: async (userId, verified) => {
    const response = await fetch(`${API_URL}/admin/students/${userId}/verify`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ verified }),
    });
    return handleResponse(response);
  },

  // Delete a student
  deleteStudent: async (userId) => {
    if (!userId) {
      throw new Error('Student ID is required');
    }
    console.log('Calling delete student API with ID:', userId);
    const response = await fetch(`${API_URL}/admin/students/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get all jobs (admin view)
  getJobs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/admin/jobs?${query}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Create job
  createJob: async (jobData) => {
    const response = await fetch(`${API_URL}/jobs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(jobData),
    });
    return handleResponse(response);
  },

  // Update job
  updateJob: async (id, jobData) => {
    const response = await fetch(`${API_URL}/jobs/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(jobData),
    });
    return handleResponse(response);
  },

  // Delete job
  deleteJob: async (id) => {
    if (!id) {
      throw new Error('Job ID is required');
    }
    console.log('Calling delete job API with ID:', id);
    const response = await fetch(`${API_URL}/jobs/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get applications for a job
  getJobApplications: async (jobId) => {
    const response = await fetch(`${API_URL}/admin/jobs/${jobId}/applications`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};
