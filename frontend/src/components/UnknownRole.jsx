import React from 'react';
import { Button } from "@/components/ui/button"
import { useAuth0 } from "@auth0/auth0-react";

const UnknownRole = () => {
  const { logout } = useAuth0();

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Unknown Role</h2>
        <p className="text-slate-600 mb-6">
          Your account doesn't have a recognized role. Please contact support.
        </p>
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>
    </div>
  );
};

export default UnknownRole;
