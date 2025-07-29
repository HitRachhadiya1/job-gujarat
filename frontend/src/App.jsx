import React, { useState, useEffect } from "react";
import LoginButton from "./components/LoginButton";
import { useAuth0 } from "@auth0/auth0-react";
import Profile from "./pages/Profie";
import RoleSelection from "./pages/RoleSelection";
import axios from "axios";

const App = () => {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchRole = async () => {
      if (isAuthenticated && user) {
        // console.log("User is authenticated. Fetching role for user:", user.sub);
        try {
          const token = await getAccessTokenSilently();
          // console.log("Access token fetched successfully.");
          const res = await axios.get(
            "http://localhost:5000/api/auth/get-role",
            {
              params: { userId: user.sub },
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          // console.log("Role fetch response:", res.data);
          if (res.data.role) {
            setRole(res.data.role);
            // console.log("Role set in state:", res.data.role);
          } else {
            // console.log("No role found for user.");
          }
        } catch (error) {
          console.error("Error fetching role:", error);
        }
      } else {
        // console.log("User not authenticated or user object missing.");
      }
    };
    fetchRole();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  if (isLoading) {
    // console.log("Auth0 is loading...");
    return <div>Loading...</div>;
  }
  if (!isAuthenticated) {
    // console.log("User not authenticated. Showing login button.");
    return <LoginButton />;
  }

  if (!role) {
    // console.log("No role in state. Showing role selection.");
    return (
      <RoleSelection
        onRoleSelected={async (selectedRole) => {
          // console.log("Role selected in RoleSelection:", selectedRole);
          setRole(selectedRole);
          try {
            const token = await getAccessTokenSilently();
            // console.log("Access token fetched for role assignment.");
            const response = await axios.post(
              "http://localhost:5000/api/auth/assign-role",
              {
                userId: user.sub,
                role: selectedRole,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            // console.log("Role assignment response:", response.data);
          } catch (error) {
            console.error("Error assigning role:", error);
          }
        }}
      />
    );
  }

  // console.log("User has role. Showing profile.");
  return <Profile />;
};

export default App;