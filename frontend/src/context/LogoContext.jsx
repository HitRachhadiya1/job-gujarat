import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { PUBLIC_API_URL, resolveAssetUrl } from '@/config';

const LogoContext = createContext();

export const useLogo = () => {
  const context = useContext(LogoContext);
  if (!context) {
    throw new Error('useLogo must be used within a LogoProvider');
  }
  return context;
};

export const LogoProvider = ({ children }) => {
  const { getAccessTokenSilently, user } = useAuth0();
  const [appLogo, setAppLogo] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogo = async () => {
    try {
      // Fetch logo from public endpoint (no authentication required)
      const response = await fetch(`${PUBLIC_API_URL}/app-logo`);

      if (response.ok) {
        const data = await response.json();
        const baseUrl = resolveAssetUrl(data.logoUrl || '');
        if (baseUrl) {
          const version = window.__logoCacheBust || 0;
          const withCacheBust = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}v=${version}`;
          setAppLogo(withCacheBust);
        } else {
          setAppLogo('');
        }
      }
    } catch (error) {
      console.error('Error fetching app logo:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogo();
  }, []);

  // Listen for logo updates
  useEffect(() => {
    const handleLogoUpdate = () => {
      // Increment cache bust version to avoid stale cached images
      window.__logoCacheBust = (window.__logoCacheBust || 0) + 1;
      fetchLogo();
    };

    window.addEventListener('logoUpdated', handleLogoUpdate);
    return () => window.removeEventListener('logoUpdated', handleLogoUpdate);
  }, []);

  return (
    <LogoContext.Provider value={{ appLogo, loading, refreshLogo: fetchLogo }}>
      {children}
    </LogoContext.Provider>
  );
};
