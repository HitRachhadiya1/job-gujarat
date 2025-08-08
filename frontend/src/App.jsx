// frontend/src/App.jsx
import { useAuth0 } from "@auth0/auth0-react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CompanyDetailsForm from "./components/CompanyDetailsForm";
import CompanyDashboard from "./components/CompanyDashboard";
import JobManagement from "./components/JobManagement";
import RoleSelection from "./pages/RoleSelection";
import Profile from "./pages/Profie"; // Note: fixing the typo in filename would be better
import BrowseJobs from "./pages/BrowseJobs";
import PublicRoutes from "./components/PublicRoutes";
import Spinner from "./components/Spinner";
import UnknownRole from "./components/UnknownRole";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import { useAuthMeta } from "./context/AuthMetaContext";

function App() {
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();
  const { role, companyStatus, loading, refreshAuthMeta } = useAuthMeta();

  // Helper function for role selection
  async function handleRoleSelected(selectedRole) {
    try {
      console.log("handleRoleSelected called with role:", selectedRole);
      const token = await getAccessTokenSilently();
      const { sub: userId } = user;
      
      const response = await fetch(
        "http://localhost:5000/api/auth/assign-role",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: selectedRole, userId }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Role assignment failed:", errorText);
        throw new Error("Failed to assign role");
      }

      console.log("Role assigned successfully");
      
      // Wait for Auth0 metadata to propagate before refreshing
      console.log("Waiting for Auth0 metadata to propagate...");
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      
      // Try to refresh with retry logic
      await refreshAuthMetaWithRetry(selectedRole);
    } catch (error) {
      console.error("Error assigning role:", error);
      throw error;
    }
  }

  // Helper function to refresh auth meta with retry logic
  async function refreshAuthMetaWithRetry(expectedRole, maxRetries = 5) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`Refresh attempt ${attempt}/${maxRetries} for expected role: ${expectedRole}`);
      
      try {
        // Call refresh and wait for it to complete
        await refreshAuthMeta();
        
        // Wait a bit for the context to update
        await new Promise(resolve => setTimeout(resolve, 300));
        
        console.log(`Current role after attempt ${attempt}:`, role);
        
        // Check if role was successfully fetched
        if (role === expectedRole) {
          console.log(`✅ Role successfully updated to: ${expectedRole}`);
          return;
        }
        
        // If this isn't the last attempt, wait before retrying
        if (attempt < maxRetries) {
          const delay = attempt * 1000; // Progressive delay: 1s, 2s, 3s, 4s
          console.log(`Role still ${role || 'null'}, waiting ${delay}ms before retry ${attempt + 1}...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error(`Error on refresh attempt ${attempt}:`, error);
        if (attempt === maxRetries) {
          throw error;
        }
      }
    }
    
    console.warn(`⚠️ Max retries (${maxRetries}) reached. Role is still: ${role || 'null'}, expected: ${expectedRole}`);
    // Don't throw error, let the user try manually or wait for eventual consistency
  }

  // Early returns for unauthenticated users or loading states
  if (!isAuthenticated) return <PublicRoutes />;
  if (loading) return <Spinner />;
  if (!role) return <RoleSelection onRoleSelected={handleRoleSelected} />;
  
  // Debug logging
  console.log('App rendering with role:', role);
  console.log('Company status:', companyStatus);

  // Main app with routing - now using ProtectedRoute for each route
  return (
    <Router>
      <Navbar />
      <div className="app-content">
        <Routes>
        {/* Home Route - Role-based redirect */}
        <Route 
          path="/" 
          element={
            (() => {
              console.log('Home route rendering with role:', role);
              if (role === "COMPANY") {
                return (
                  <ProtectedRoute roles={["COMPANY"]}>
                    {companyStatus?.completed ? (
                      <CompanyDashboard />
                    ) : (
                      <CompanyDetailsForm 
                        refreshAuthMeta={refreshAuthMeta}
                        onSuccess={() => {
                          console.log("Company details saved successfully");
                        }} 
                      />
                    )}
                  </ProtectedRoute>
                );
              } else if (role === "JOB_SEEKER") {
                console.log('Redirecting job seeker to browse-jobs');
                return <Navigate to="/browse-jobs" replace />;
              } else {
                console.log('Unknown role, showing UnknownRole component');
                return <UnknownRole />;
              }
            })()
          } 
        />
        
        {/* Company Routes */}
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute roles={["COMPANY"]}>
              <CompanyDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/jobs" 
          element={
            <ProtectedRoute roles={["COMPANY"]}>
              <JobManagement />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/company-setup" 
          element={
            <ProtectedRoute roles={["COMPANY"]}>
              <CompanyDetailsForm 
                refreshAuthMeta={refreshAuthMeta}
                onSuccess={() => {
                  console.log("Company details saved successfully");
                }} 
              />
            </ProtectedRoute>
          } 
        />
        
        {/* Job Seeker Routes */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute roles={["JOB_SEEKER"]}>
              <Profile />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/browse-jobs" 
          element={
            <ProtectedRoute roles={["JOB_SEEKER"]}>
              <BrowseJobs />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/applications" 
          element={
            <ProtectedRoute roles={["JOB_SEEKER"]}>
              <div className="page-container">My Applications - Coming Soon!</div>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/saved-jobs" 
          element={
            <ProtectedRoute roles={["JOB_SEEKER"]}>
              <div className="page-container">Saved Jobs - Coming Soon!</div>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/recommendations" 
          element={
            <ProtectedRoute roles={["JOB_SEEKER"]}>
              <div className="page-container">Job Recommendations - Coming Soon!</div>
            </ProtectedRoute>
          } 
        />
        
        {/* Default redirect based on role */}
        <Route 
          path="*" 
          element={
            role === "COMPANY" ? (
              <Navigate to="/" replace />
            ) : role === "JOB_SEEKER" ? (
              <Navigate to="/browse-jobs" replace />
            ) : (
              <UnknownRole />
            )
        }
        />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
