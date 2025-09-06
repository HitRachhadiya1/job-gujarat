import React from 'react';
import { useAuthMeta } from '../context/AuthMetaContext';
import UnknownRole from './UnknownRole';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { role, loading } = useAuthMeta();

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-300 dark:bg-stone-950 flex items-center justify-center transition-colors duration-500">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-stone-400 border-t-stone-700 dark:border-stone-600 dark:border-t-stone-200 mb-4"></div>
          <p className="text-stone-700 dark:text-stone-300 font-medium">Loading...</p>
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
