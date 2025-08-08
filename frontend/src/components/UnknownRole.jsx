import React from 'react';
import { useAuth0 } from "@auth0/auth0-react";

const UnknownRole = () => {
  const { logout, user } = useAuth0();

  return (
    <div className="unknown-role">
      <div className="error-container">
        <h2>Unknown Role</h2>
        <p>We couldn't determine your role on the platform.</p>
        <p>Please contact support or try logging in again.</p>
        
        {user && (
          <div className="user-info">
            <p><strong>User:</strong> {user.email}</p>
            <p><strong>User ID:</strong> {user.sub}</p>
          </div>
        )}
        
        <div className="actions">
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Refresh Page
          </button>
          <button
            onClick={() => logout({ returnTo: window.location.origin })}
            className="logout-button"
          >
            Log Out
          </button>
        </div>
      </div>
      
      <style jsx="true">{`
        .unknown-role {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
          padding: 2rem;
        }
        
        .error-container {
          background: white;
          padding: 3rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          text-align: center;
          max-width: 500px;
          width: 100%;
          border-left: 5px solid #ffc107;
        }
        
        h2 {
          color: #856404;
          font-size: 1.8rem;
          margin-bottom: 1rem;
        }
        
        p {
          color: #666;
          font-size: 1rem;
          margin-bottom: 1rem;
          line-height: 1.6;
        }
        
        .user-info {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 6px;
          margin: 1.5rem 0;
          border: 1px solid #e9ecef;
        }
        
        .user-info p {
          margin: 0.5rem 0;
          font-size: 0.9rem;
          text-align: left;
        }
        
        .actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
        }
        
        .retry-button {
          background: #28a745;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .retry-button:hover {
          background: #218838;
        }
        
        .logout-button {
          background: #dc3545;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .logout-button:hover {
          background: #c82333;
        }
        
        @media (max-width: 768px) {
          .error-container {
            padding: 2rem;
            margin: 1rem;
          }
          
          .actions {
            flex-direction: column;
          }
          
          .retry-button,
          .logout-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default UnknownRole;
