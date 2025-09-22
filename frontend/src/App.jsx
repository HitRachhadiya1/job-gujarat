import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Navbar from "./components/Navbar";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  User,
  Building2,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  TrendingUp,
  UserCheck,
  Award,
  Globe,
  LogOut,
} from "lucide-react";
import { useTheme } from "./context/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";
import { AuthMetaProvider } from "./context/AuthMetaContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LogoProvider } from "./context/LogoContext";
import { Toaster } from "@/components/ui/toaster";

// Import components from frontend for functionality
import CompanyDetailsForm from "./components/CompanyDetailsForm";
import CompanyDashboard from "./components/CompanyDashboard";
import JobManagement from "./components/JobManagement";
import BrowseJobsNew from "./pages/BrowseJobsNew";
import MyApplications from "./pages/MyApplications";
import ProfileNew from "./pages/ProfileNew";
import CompanySettings from "./pages/CompanySettings";
import CompanyApplications from "./pages/CompanyApplications";
import JobPostingPayment from "./pages/JobPostingPayment";
import { useAuthMeta } from "./context/AuthMetaContext";
import LoadingOverlay from "./components/LoadingOverlay";
import useDelayedTrue from "./hooks/useDelayedTrue";
import UnknownRole from "./components/UnknownRole";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoutes from "./components/PublicRoutes";
import { API_URL } from "@/config";

// Import dashboard components with beautiful UI from job-portal(1)

import AdminDashboard from "./components/admin-dashboard";
import JobSeekerDashboardNew from "./components/JobSeekerDashboardNew";

export default function JobPortalApp() {
  const {
    isAuthenticated,
    isLoading: auth0Loading,
    getAccessTokenSilently,
    user,
    logout,
  } = useAuth0();
  const { role, companyStatus, loading, refreshAuthMeta } = useAuthMeta();
  const [currentView, setCurrentView] = useState("landing");

  // Helper function for role selection
  async function handleRoleSelected(selectedRole) {
    try {
      console.log("handleRoleSelected called with role:", selectedRole);
      const token = await getAccessTokenSilently();
      const { sub: userId } = user;

      const response = await fetch(`${API_URL}/auth/assign-role`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: selectedRole, userId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Role assignment failed:", errorText);
        throw new Error("Failed to assign role");
      }

      console.log("Role assigned successfully");

      // Wait for Auth0 metadata to propagate before refreshing
      console.log("Waiting for Auth0 metadata to propagate...");
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Reduced to 1 second

      // Try to refresh with retry logic
      await refreshAuthMetaWithRetry(selectedRole);
    } catch (error) {
      console.error("Error assigning role:", error);
      throw error;
    }
  }

  // Simplified refresh with single attempt - no more retry loops
  async function refreshAuthMetaWithRetry(expectedRole, maxRetries = 1) {
    console.log(`Refreshing auth for expected role: ${expectedRole}`);

    try {
      // Single refresh attempt
      const freshData = await refreshAuthMeta();
      const currentRole = freshData?.role || null;
      console.log("Fresh role from API:", currentRole);

      if (currentRole === expectedRole) {
        console.log(`✅ Role successfully updated to: ${expectedRole}`);
        return;
      } else {
        console.log(`Role is ${currentRole}, expected ${expectedRole}. Continuing anyway.`);
      }
    } catch (error) {
      console.error("Error refreshing auth metadata:", error);
      // Continue anyway - don't block the UI
    }
  }

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      // This will be handled by PublicRoutes
      return;
    }
    setCurrentView("roleSelection");
  };

  const handleRoleSelect = async (selectedRole) => {
    try {
      await handleRoleSelected(selectedRole);
      setCurrentView("dashboard");
    } catch (error) {
      console.error("Failed to select role:", error);
    }
  };

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
  };

  const handleBackToLanding = () => {
    setCurrentView("landing");
  };

  // Unified loading handling to avoid flicker
  const authLoading = auth0Loading || loading;

  // Call hooks at the top level - never conditionally
  const showInitialLoader = useDelayedTrue(auth0Loading, 300);

  // Show overlay only during initial Auth0 loading
  if (showInitialLoader) {
    return (
      <LogoProvider>
        <LoadingOverlay message="Loading..." />
      </LogoProvider>
    );
  }

  // If not authenticated, show public landing
  if (!isAuthenticated) {
    return (
      <LogoProvider>
        <PublicRoutes onGetStarted={handleGetStarted} />
      </LogoProvider>
    );
  }

  // Show loading while auth metadata is being fetched
  if (loading) {
    return (
      <LogoProvider>
        <LoadingOverlay message="Loading..." />
      </LogoProvider>
    );
  }

  // Only show role selection if user is authenticated but has no role
  if (!role && isAuthenticated) {
    return (
      <LogoProvider>
        <RoleSelection
          onRoleSelected={handleRoleSelect}
          onBackToLanding={handleBackToLanding}
        />
      </LogoProvider>
    );
  }

  // Debug logging
  console.log("App rendering with role:", role);
  console.log("Company status:", companyStatus);
  console.log("Is authenticated:", isAuthenticated);
  console.log("Loading:", loading);
  console.log("User:", user?.email);

  // Main app with routing - now using ProtectedRoute for each route
  return (
    <LogoProvider>
      <Router>
        {/* Navbar for authenticated users */}
        <Navbar />
        <div className="app-content pt-0 m-0 p-0">
          <Routes>
            {/* Home Route - Role-based redirect */}
            <Route
              path="/"
              element={(() => {
                console.log("Home route rendering with role:", role);
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
                  console.log("Redirecting job seeker to dashboard");
                  return (
                    <ProtectedRoute roles={["JOB_SEEKER"]}>
                      <JobSeekerDashboardNew onLogout={handleLogout} />
                    </ProtectedRoute>
                  );
                } else if (role === "ADMIN") {
                  return <AdminDashboard onLogout={handleLogout} />;
                } else {
                  console.log("Unknown role, showing UnknownRole component");
                  return <UnknownRole />;
                }
              })()}
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
              path="/company/applications"
              element={
                <ProtectedRoute roles={["COMPANY"]}>
                  <CompanyApplications />
                </ProtectedRoute>
              }
            />

            <Route
              path="/company-setup"
              element={
                <ProtectedRoute roles={["COMPANY"]}>
                  <CompanySettings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/job-posting-payment"
              element={
                <ProtectedRoute roles={["COMPANY"]}>
                  <JobPostingPayment />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <AdminDashboard onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />

            {/* Job Seeker Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute roles={["JOB_SEEKER"]}>
                  <ProfileNew />
                </ProtectedRoute>
              }
            />

            <Route
              path="/browse-jobs"
              element={
                <ProtectedRoute roles={["JOB_SEEKER"]}>
                  <BrowseJobsNew />
                </ProtectedRoute>
              }
            />

            <Route
              path="/applications"
              element={
                <ProtectedRoute roles={["JOB_SEEKER"]}>
                  <MyApplications />
                </ProtectedRoute>
              }
            />

            <Route
              path="/saved-jobs"
              element={
                <ProtectedRoute roles={["JOB_SEEKER"]}>
                  <div className="page-container">
                    Saved Jobs - Coming Soon!
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/recommendations"
              element={
                <ProtectedRoute roles={["JOB_SEEKER"]}>
                  <div className="page-container">
                    Job Recommendations - Coming Soon!
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <AdminDashboard onLogout={handleLogout} />
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
                  <Navigate to="/" replace />
                ) : role === "ADMIN" ? (
                  <Navigate to="/" replace />
                ) : (
                  <UnknownRole />
                )
              }
            />
          </Routes>
        </div>
      </Router>
      <Toaster />
    </LogoProvider>
  );
}

// Role Selection Component (extracted from the original landing page logic)
function RoleSelection({ onRoleSelected, onBackToLanding }) {
  const { logout } = useAuth0();
  return (
    <div className="h-screen min-h-screen bg-[#EAF6F9] dark:bg-[#0B1F3B] relative overflow-hidden">
      {/* Subtle background accents */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#77BEE0]/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#0574EE]/15 rounded-full blur-3xl"></div>
      </div>

      {/* Top bar with single back arrow */}
      <div className="relative z-10 px-6 py-4 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl text-[#155AA4] hover:text-[#0574EE] hover:bg-[#77BEE0]/20 dark:text-[#EAF6F9] dark:hover:text-white dark:hover:bg-white/10"
          onClick={() => logout({ returnTo: window.location.origin })}
          title="Back to login"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
      </div>

      {/* Content - no scrolling, vertically centered */}
      <div className="relative z-10 h-[calc(100vh-72px)] flex items-center justify-center px-6">
        <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Job Seeker */}
          <Card className="overflow-hidden bg-white/90 dark:bg-white/10 backdrop-blur-sm border border-[#77BEE0]/40 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="w-14 h-14 bg-[#155AA4] dark:bg-[#0574EE] rounded-xl flex items-center justify-center mx-auto shadow-md mb-3">
                <User className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-[#155AA4] dark:text-white">
                Job Seeker
              </CardTitle>
              <CardDescription className="text-[#155AA4]/80 dark:text-[#EAF6F9]/80 text-sm">
                Browse jobs, upload resume, and apply in minutes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => onRoleSelected("JOB_SEEKER")}
                className="w-full bg-gradient-to-r from-[#155AA4] to-[#0574EE] hover:from-[#155AA4] hover:to-[#0574EE]/90 text-white font-semibold py-3 rounded-lg shadow-md"
              >
                <span className="mr-2">Continue as Job Seeker</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Company */}
          <Card className="overflow-hidden bg-white/90 dark:bg-white/10 backdrop-blur-sm border border-[#77BEE0]/40 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="w-14 h-14 bg-[#0574EE] dark:bg-[#155AA4] rounded-xl flex items-center justify-center mx-auto shadow-md mb-3">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-[#155AA4] dark:text-white">
                Company
              </CardTitle>
              <CardDescription className="text-[#155AA4]/80 dark:text-[#EAF6F9]/80 text-sm">
                Post jobs and manage applicants with ease
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => onRoleSelected("COMPANY")}
                className="w-full bg-gradient-to-r from-[#155AA4] to-[#0574EE] hover:from-[#155AA4] hover:to-[#0574EE]/90 text-white font-semibold py-3 rounded-lg shadow-md"
              >
                <span className="mr-2">Continue as Company</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
