import React from 'react';
import { useAuthMeta } from '../context/AuthMetaContext';
import UnknownRole from './UnknownRole';
import LoadingOverlay from './LoadingOverlay';
import useDelayedTrue from '../hooks/useDelayedTrue';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { role, loading } = useAuthMeta();

  console.log("ProtectedRoute - role:", role, "loading:", loading, "required roles:", roles);

  const showLoader = useDelayedTrue(loading, 600);
  if (showLoader) {
    return <LoadingOverlay message="Loading..." />;
  }

  if (!role || !roles.includes(role)) {
    console.log("ProtectedRoute - Access denied. Role:", role, "Required:", roles);
    return <UnknownRole />;
  }

  console.log("ProtectedRoute - Access granted for role:", role);
  return children;
};

export default ProtectedRoute;
