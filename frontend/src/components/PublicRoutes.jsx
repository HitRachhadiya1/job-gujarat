import React from 'react';
import { useAuth0 } from "@auth0/auth0-react";

const PublicRoutes = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="public-routes">
      <div className="welcome-container">
        <h1>Welcome to Job Gujarat</h1>
        <p>Connect with opportunities and grow your career in Gujarat</p>
        <button
          onClick={() => loginWithRedirect()}
          className="login-button"
        >
          Log In / Sign Up
        </button>
      </div>
      
      <style jsx="true">{`
        .public-routes {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }
        
        .welcome-container {
          background: white;
          padding: 3rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          text-align: center;
          max-width: 500px;
          width: 100%;
        }
        
        h1 {
          color: #333;
          font-size: 2.5rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }
        
        p {
          color: #666;
          font-size: 1.2rem;
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        
        .login-button {
          background: #007bff;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
          max-width: 300px;
        }
        
        .login-button:hover {
          background: #0056b3;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }
        
        @media (max-width: 768px) {
          .welcome-container {
            padding: 2rem;
            margin: 1rem;
          }
          
          h1 {
            font-size: 2rem;
          }
          
          p {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PublicRoutes;
