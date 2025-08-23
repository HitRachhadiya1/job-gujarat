import React from 'react';
import { useAuthMeta } from '../context/AuthMetaContext';
import UnknownRole from './UnknownRole';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { role, loading } = useAuthMeta();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!role || !roles.includes(role)) {
    return <UnknownRole />;
  }

  return children;
};

export default ProtectedRoute;
