import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const LoginButton = ({ className, variant = "default", size = "default" }) => {
  const { loginWithRedirect } = useAuth0();

  return (
    <Button 
      onClick={() => loginWithRedirect()}
      className={className}
      variant={variant}
      size={size}
    >
      <LogIn className="w-4 h-4 mr-2" />
      Log In
    </Button>
  );
};

export default LoginButton;
