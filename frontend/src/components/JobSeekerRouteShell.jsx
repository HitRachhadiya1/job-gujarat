import React from "react";
import { useNavigate } from "react-router-dom";
import JobSeekerLayout from "./JobSeekerLayout";

export default function JobSeekerRouteShell({ activeView, onLogout, children }) {
  const navigate = useNavigate();

  const handleNavigate = (id) => {
    switch (id) {
      case "dashboard":
        navigate("/");
        break;
      case "browse-jobs":
        navigate("/browse-jobs");
        break;
      case "applications":
        navigate("/applications");
        break;
      case "saved-jobs":
        navigate("/saved-jobs");
        break;
      case "profile":
        navigate("/profile");
        break;
      default:
        break;
    }
  };

  return (
    <JobSeekerLayout activeView={activeView} onNavigate={handleNavigate} onLogout={onLogout}>
      {children}
    </JobSeekerLayout>
  );
}
