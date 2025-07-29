import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const roles = ["Job Seeker", "Employer"];

const RoleSelection = ({ onRoleSelected }) => {
  const [selectedRole, setSelectedRole] = useState("");

  const handleRoleClick = (role) => {
    // console.log(`Role button clicked: ${role}`);
    setSelectedRole(role);
  };

  const handleConfirmClick = async () => {
    if (!selectedRole) {
      // console.log("Confirm clicked but no role selected.");
      return;
    }
    try {
      // console.log(`Confirm button clicked with role: ${selectedRole}`);
      await onRoleSelected(selectedRole);
      // console.log("Role selection and assignment successful.");
    } catch (error) {
      console.error("Error during role assignment:", error);
    }
  };

  // console.log("Rendering RoleSelection component.");

  return (
    <div>
      <h2>Select your role</h2>
      {roles.map((role) => (
        <button key={role} onClick={() => handleRoleClick(role)}>
          {role}
        </button>
      ))}
      <br />
      <button
        disabled={!selectedRole}
        onClick={handleConfirmClick}
      >
        Confirm Role
      </button>
    </div>
  );
};

export default RoleSelection;