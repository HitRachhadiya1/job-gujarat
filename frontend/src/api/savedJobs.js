// API functions for saved jobs functionality
import { API_BASE_URL } from '../config/api';

export const savedJobsAPI = {
  // Save a job
  saveJob: async (jobId, token) => {
    const response = await fetch(`${API_BASE_URL}/api/saved-jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ jobId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save job');
    }

    return response.json();
  },

  // Unsave a job
  unsaveJob: async (jobId, token) => {
    const response = await fetch(`${API_BASE_URL}/api/saved-jobs/${jobId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to unsave job');
    }

    return response.json();
  },

  // Get all saved jobs
  getSavedJobs: async (token, page = 1, limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/api/saved-jobs?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch saved jobs');
    }

    return response.json();
  },

  // Check if a job is saved
  checkJobSaved: async (jobId, token) => {
    const response = await fetch(`${API_BASE_URL}/api/saved-jobs/check/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to check saved status');
    }

    return response.json();
  },
};
