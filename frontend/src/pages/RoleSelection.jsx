import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const roles = [
  { display: "Job Seeker", value: "JOB_SEEKER" },
  { display: "Employer", value: "COMPANY" },
];

const RoleSelection = ({ onRoleSelected }) => {
  const [selectedRole, setSelectedRole] = useState("");

  const handleRoleClick = (role) => {
    // console.log(`Role button clicked: ${role.display}`);
    setSelectedRole(role);
  };

  const handleConfirmClick = async () => {
    if (!selectedRole) {
      // console.log("Confirm clicked but no role selected.");
      return;
    }
    try {
      // console.log(`Confirm button clicked with role: ${selectedRole.value}`);
      await onRoleSelected(selectedRole.value);
      // console.log("Role selection and assignment successful.");
    } catch (error) {
      console.error("Error during role assignment:", error);
    }
  };

  // console.log("Rendering RoleSelection component.");

  return (
    <div data-testid="role-selection">
      <h2>Select Your Role</h2>
      {roles.map((role) => (
        <button
          key={role.value}
          data-testid={`role-${role.value.toLowerCase()}`}
          onClick={() => handleRoleClick(role)}
          style={{
            backgroundColor:
              selectedRole?.value === role.value ? "#007bff" : "#f8f9fa",
            color: selectedRole?.value === role.value ? "white" : "black",
            margin: "5px",
            padding: "10px 20px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {role.display}
        </button>
      ))}
      <br />
      <button
        data-testid="confirm-role"
        disabled={!selectedRole}
        onClick={handleConfirmClick}
        style={{
          backgroundColor: selectedRole ? "#28a745" : "#6c757d",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "4px",
          cursor: selectedRole ? "pointer" : "not-allowed",
          marginTop: "10px",
        }}
      >
        Confirm Role
      </button>
    </div>
  );
};

export default RoleSelection;
