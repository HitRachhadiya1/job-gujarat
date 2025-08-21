import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const LogoutButton = ({ className, variant = "outline", size = "default" }) => {
  const { logout } = useAuth0();

  return (
    <Button 
      onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
      className={className}
      variant={variant}
      size={size}
    >
      <LogOut className="w-4 h-4 mr-2" />
      Log Out
    </Button>
  );
};

export default LogoutButton;
