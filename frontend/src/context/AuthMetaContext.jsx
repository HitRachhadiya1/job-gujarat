import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const AuthMetaContext = createContext();

export const AuthMetaProvider = ({ children }) => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [authMeta, setAuthMeta] = useState({
    role: null,
    companyStatus: null,
    loading: false,
    error: null
  });

  const fetchAuthMeta = async (retryCount = 0) => {
    if (!isAuthenticated) {
      setAuthMeta({
        role: null,
        companyStatus: null,
        loading: false,
        error: null
      });
      return;
    }

    try {
      setAuthMeta(prev => ({ ...prev, loading: true, error: null }));
      
      // Force token refresh to get latest metadata
      const token = await getAccessTokenSilently({
        cacheMode: 'off' // Force fresh token
      });
      
      console.log('Fetching auth metadata...', retryCount > 0 ? `(retry ${retryCount})` : '');
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch auth metadata: ${response.status}`);
      }

      const data = await response.json();
      console.log('Auth metadata fetched:', data);

      setAuthMeta({
        role: data.role,
        companyStatus: data.companyStatus,
        loading: false,
        error: null
      });
      
      return data; // Return the fetched data
    } catch (error) {
      console.error('Error fetching auth metadata:', error);
      setAuthMeta({
        role: null,
        companyStatus: null,
        loading: false,
        error: error.message
      });
      throw error; // Re-throw for retry logic
    }
  };

  // Fetch auth meta when authentication status changes
  useEffect(() => {
    fetchAuthMeta();
  }, [isAuthenticated]);

  // Function to refresh auth meta (useful after role assignment or company creation)
  const refreshAuthMeta = () => {
    fetchAuthMeta();
  };

  // Function to update auth meta locally (optimistic updates)
  const updateAuthMeta = (updates) => {
    setAuthMeta(prev => ({ ...prev, ...updates }));
  };

  const value = {
    role: authMeta.role,
    companyStatus: authMeta.companyStatus,
    loading: authMeta.loading,
    error: authMeta.error,
    refreshAuthMeta,
    updateAuthMeta
  };

  return (
    <AuthMetaContext.Provider value={value}>
      {children}
    </AuthMetaContext.Provider>
  );
};

export const useAuthMeta = () => {
  const context = useContext(AuthMetaContext);
  if (context === undefined) {
    throw new Error('useAuthMeta must be used within an AuthMetaProvider');
  }
  return context;
};
