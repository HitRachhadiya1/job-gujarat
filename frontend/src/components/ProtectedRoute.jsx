import React from 'react';
import { useAuthMeta } from '../context/AuthMetaContext';
import Spinner from './Spinner';
import UnknownRole from './UnknownRole';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { role, loading, error } = useAuthMeta();

  // Show loading spinner while auth metadata is being fetched
  if (loading) {
    return <Spinner />;
  }

  // Handle error state
  if (error) {
    return (
      <div className="protected-route-error">
        <div className="error-content">
          <h2>Authentication Error</h2>
          <p>Failed to verify your access permissions: {error}</p>
          <p>Please try refreshing the page or contact support if the problem persists.</p>
        </div>
        <style jsx>{`
          .protected-route-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            padding: 2rem;
            text-align: center;
          }
          .error-content {
            max-width: 500px;
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            border-left: 4px solid #dc3545;
          }
          .error-content h2 {
            color: #dc3545;
            margin-top: 0;
          }
          .error-content p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 1rem;
          }
          .error-content p:last-child {
            margin-bottom: 0;
          }
        `}</style>
      </div>
    );
  }

  // Check if user has no role assigned
  if (!role) {
    return (
      <div className="protected-route-error">
        <div className="error-content">
          <h2>Access Denied</h2>
          <p>No role has been assigned to your account. Please contact an administrator.</p>
        </div>
        <style jsx>{`
          .protected-route-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            padding: 2rem;
            text-align: center;
          }
          .error-content {
            max-width: 500px;
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            border-left: 4px solid #ffc107;
          }
          .error-content h2 {
            color: #856404;
            margin-top: 0;
          }
          .error-content p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 1rem;
          }
          .error-content p:last-child {
            margin-bottom: 0;
          }
        `}</style>
      </div>
    );
  }

  // Check if user's role is in the allowed roles list
  if (roles.length > 0 && !roles.includes(role)) {
    console.log('Access denied: User role', role, 'not in allowed roles:', roles);
    return (
      <div className="protected-route-error">
        <div className="error-content">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <p>Your role: <strong>{role}</strong></p>
          <p>Required roles: <strong>{roles.join(', ')}</strong></p>
          <button onClick={() => window.history.back()} className="back-button">
            Go Back
          </button>
        </div>
        <style jsx>{`
          .protected-route-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            padding: 2rem;
            text-align: center;
          }
          .error-content {
            max-width: 500px;
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            border-left: 4px solid #dc3545;
          }
          .error-content h2 {
            color: #dc3545;
            margin-top: 0;
          }
          .error-content p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 1rem;
          }
          .error-content p:last-child {
            margin-bottom: 0;
          }
          .back-button {
            background: #007bff;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
            margin-top: 1rem;
            transition: background-color 0.2s;
          }
          .back-button:hover {
            background: #0056b3;
          }
        `}</style>
      </div>
    );
  }

  // If all checks pass, render the protected content
  return children;
};

export default ProtectedRoute;
