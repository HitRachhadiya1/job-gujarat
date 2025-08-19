import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthMeta } from '../context/AuthMetaContext';

const CompanyProfileRedirect = ({ children }) => {
  const { role, companyStatus, loading } = useAuthMeta();
  const navigate = useNavigate();

  useEffect(() => {
    // Only check for companies
    if (role === 'COMPANY' && !loading && companyStatus) {
      // If company profile is not completed, redirect to setup
      if (!companyStatus.completed) {
        console.log('Company profile incomplete, redirecting to setup...');
        navigate('/company-setup', { replace: true });
      }
    }
  }, [role, companyStatus, loading, navigate]);

  // Show loading while checking company status
  if (role === 'COMPANY' && loading) {
    return (
      <div className="page-container">
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p>Checking company profile...</p>
        </div>
        
        <style jsx>{`
          .page-container {
            padding: 2rem;
            text-align: center;
          }
          
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #007bff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // If company profile is incomplete, don't render children 
  // (they'll be redirected in the useEffect)
  if (role === 'COMPANY' && companyStatus && !companyStatus.completed) {
    return (
      <div className="page-container">
        <div className="text-center">
          <p>Redirecting to company profile setup...</p>
        </div>
      </div>
    );
  }

  // For non-companies or completed company profiles, render children
  return children;
};

export default CompanyProfileRedirect;
