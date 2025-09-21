import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { API_URL } from '@/config';

const AuthMetaContext = createContext();

export const AuthMetaProvider = ({ children }) => {
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();
  const [authMeta, setAuthMeta] = useState({
    role: null,
    companyStatus: null,
    userStatus: null,
    loading: false,
    error: null
  });
  const fetchingRef = useRef(false);
  const cacheRef = useRef({ data: null, timestamp: 0 });
  const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache

  const fetchAuthMeta = async (forceRefresh = false, retryCount = 0) => {
    if (!isAuthenticated || !user?.sub) {
      setAuthMeta({
        role: null,
        companyStatus: null,
        userStatus: null,
        loading: false,
        error: null
      });
      cacheRef.current = { data: null, timestamp: 0 };
      return;
    }

    // Check if we're already fetching to prevent multiple concurrent calls
    if (fetchingRef.current && !forceRefresh) {
      console.log('Already fetching auth metadata, skipping duplicate call');
      return;
    }

    // Check cache first (unless forcing refresh)
    const now = Date.now();
    const cachedData = cacheRef.current;
    if (!forceRefresh && cachedData.data && (now - cachedData.timestamp) < CACHE_DURATION) {
      console.log('Using cached auth metadata');
      setAuthMeta({
        role: cachedData.data.role,
        companyStatus: cachedData.data.companyStatus,
        userStatus: cachedData.data.userStatus,
        loading: false,
        error: null
      });
      return cachedData.data;
    }

    fetchingRef.current = true;

    try {
      setAuthMeta(prev => ({ ...prev, loading: true, error: null }));
      
      // Use cached token unless forcing refresh
      const token = await getAccessTokenSilently({
        cacheMode: forceRefresh ? 'off' : 'cache-only'
      });
      
      console.log('Fetching fresh auth metadata...', retryCount > 0 ? `(retry ${retryCount})` : '');
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch auth metadata: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fresh auth metadata fetched:', data);

      // Update cache
      cacheRef.current = { data, timestamp: now };

      setAuthMeta({
        role: data.role,
        companyStatus: data.companyStatus,
        userStatus: data.userStatus,
        loading: false,
        error: null
      });
      
      return data; // Return the fetched data
    } catch (error) {
      console.error('Error fetching auth metadata:', error);
      setAuthMeta({
        role: null,
        companyStatus: null,
        userStatus: null,
        loading: false,
        error: error.message
      });
      throw error; // Re-throw for retry logic
    } finally {
      fetchingRef.current = false;
    }
  };

  // Fetch auth meta when authentication status changes
  useEffect(() => {
    fetchAuthMeta();
  }, [isAuthenticated]);

  // Function to refresh auth meta (useful after role assignment or company creation)
  const refreshAuthMeta = () => {
    console.log('Forcing auth metadata refresh...');
    return fetchAuthMeta(true); // Force refresh and return the promise
  };

  // Function to clear cache and refresh
  const clearCacheAndRefresh = () => {
    console.log('Clearing cache and refreshing auth metadata...');
    cacheRef.current = { data: null, timestamp: 0 };
    fetchAuthMeta(true);
  };

  // Function to update auth meta locally (optimistic updates)
  const updateAuthMeta = (updates) => {
    setAuthMeta(prev => ({ ...prev, ...updates }));
  };

  const value = {
    role: authMeta.role,
    companyStatus: authMeta.companyStatus,
    userStatus: authMeta.userStatus,
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
