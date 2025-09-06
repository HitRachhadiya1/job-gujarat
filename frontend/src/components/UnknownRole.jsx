import React from 'react';
import { Button } from "@/components/ui/button"
import { useAuth0 } from "@auth0/auth0-react";

const UnknownRole = () => {
  const { logout } = useAuth0();

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
  };

  return (
    <div className="min-h-screen bg-stone-300 dark:bg-stone-950 flex items-center justify-center transition-colors duration-500">
      <div className="text-center p-10 bg-stone-100/90 dark:bg-stone-900/60 backdrop-blur-sm rounded-2xl border border-stone-400/70 dark:border-stone-800/50 shadow-lg max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3 tracking-tight">Unknown Role</h2>
        <p className="text-stone-700 dark:text-stone-400 mb-6 font-medium">
          Your account doesn't have a recognized role. Please contact support.
        </p>
        <Button onClick={handleLogout} className="bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl">
          Logout
        </Button>
      </div>
    </div>
  );
};

export default UnknownRole;
