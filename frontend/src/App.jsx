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
  Building2,
  ArrowRight,
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

// Import components from frontend for functionality
import CompanyDetailsForm from "./components/CompanyDetailsForm";
import CompanyDashboard from "./components/CompanyDashboard";
import JobManagement from "./components/JobManagement";
import BrowseJobs from "./pages/BrowseJobs";
import MyApplications from "./pages/MyApplications";
import Profile from "./pages/Profile";
import CompanySettings from "./pages/CompanySettings";
import CompanyApplications from "./pages/CompanyApplications";
import JobPostingPayment from "./pages/JobPostingPayment";
import { useAuthMeta } from "./context/AuthMetaContext";
import Spinner from "./components/Spinner";
import UnknownRole from "./components/UnknownRole";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoutes from "./components/PublicRoutes";

// Import dashboard components with beautiful UI from job-portal(1)
import JobSeekerDashboard from "./components/job-seeker-dashboard";
import AdminDashboard from "./components/admin-dashboard";

export default function JobPortalApp() {
  const { isAuthenticated, getAccessTokenSilently, user, logout } = useAuth0();
  const { role, companyStatus, loading, refreshAuthMeta } = useAuthMeta();
  const [currentView, setCurrentView] = useState("landing");

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
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Reduced to 1 second

      // Try to refresh with retry logic
      await refreshAuthMetaWithRetry(selectedRole);
    } catch (error) {
      console.error("Error assigning role:", error);
      throw error;
    }
  }

  // Helper function to refresh auth meta with optimized retry logic
  async function refreshAuthMetaWithRetry(expectedRole, maxRetries = 3) {
    console.log(`Starting auth refresh for expected role: ${expectedRole}`);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`Refresh attempt ${attempt}/${maxRetries}`);

      try {
        // Call refresh and get the fresh data directly
        const freshData = await refreshAuthMeta();

        // Check the returned data instead of relying on stale state
        const currentRole = freshData?.role || null;
        console.log(`Fresh role from API:`, currentRole);

        if (currentRole === expectedRole) {
          console.log(`✅ Role successfully updated to: ${expectedRole}`);
          return;
        }

        // Only retry if this isn't the last attempt
        if (attempt < maxRetries) {
          const delay = 1500; // Fixed 1.5s delay instead of progressive
          console.log(
            `Role still ${
              currentRole || "null"
            }, waiting ${delay}ms before retry...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error(`Error on refresh attempt ${attempt}:`, error);
        if (attempt === maxRetries) {
          console.warn(`Max retries reached. Continuing with current state.`);
          return; // Don't throw, let the app continue
        }
        // Short delay before retry on error
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.warn(
      `⚠️ Max retries (${maxRetries}) reached. Continuing with current state.`
    );
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

  // Early returns for unauthenticated users or loading states
  if (!isAuthenticated) return (
    <LogoProvider>
      <PublicRoutes onGetStarted={handleGetStarted} />
    </LogoProvider>
  );
  if (loading) return <Spinner />;
  if (!role)
    return (
      <LogoProvider>
        <RoleSelection
          onRoleSelected={handleRoleSelected}
          onBackToLanding={handleBackToLanding}
        />
      </LogoProvider>
    );

  // Debug logging
  console.log("App rendering with role:", role);
  console.log("Company status:", companyStatus);

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
                return <JobSeekerDashboard onLogout={handleLogout} />;
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
                <MyApplications />
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
    </LogoProvider>
  );
}

// Role Selection Component (extracted from the original landing page logic)
function RoleSelection({ onRoleSelected, onBackToLanding }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-200 to-stone-300 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950 relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-stone-200/30 to-stone-300/30 dark:from-stone-800/20 dark:to-stone-700/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-stone-200/30 to-stone-300/30 dark:from-stone-800/20 dark:to-stone-900/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-sm bg-stone-100/90 dark:bg-stone-900/90 border-b border-stone-300/70 dark:border-stone-700/60 shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-colors duration-300">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-stone-900 dark:bg-stone-700 rounded-xl flex items-center justify-center shadow-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-200">
                  Job Gujarat
                </h1>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Connecting you to What's Next
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-stone-200/60 dark:bg-stone-700/40 rounded-lg p-1 border border-stone-300/60 dark:border-stone-700/60">
                <ThemeToggle />
              </div>
              <Button
                onClick={onBackToLanding}
                variant="outline"
                className="border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800 bg-transparent"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Role Selection Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-stone-800 dark:text-stone-200 mb-6">
            Choose Your Role
          </h2>
          <p className="text-xl text-stone-700 dark:text-stone-300 max-w-2xl mx-auto">
            Select your role to access the appropriate dashboard and features
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Job Seeker Card */}
          {/* Company Card */}
          <div className="group transform transition-all duration-300 hover:scale-[1.02]">
            <Card className="relative overflow-hidden bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border border-stone-200 dark:border-stone-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-stone-700 to-stone-500"></div>

              <CardHeader className="text-center pb-6 relative z-10">
                <div className="w-16 h-16 bg-stone-900 dark:bg-stone-700 rounded-xl flex items-center justify-center mx-auto shadow-lg mb-4 transform group-hover:scale-110 transition-all duration-300">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-stone-800 dark:text-stone-200 mb-3">
                  Company
                </CardTitle>
                <CardDescription className="text-stone-600 dark:text-stone-400 text-base">
                  Build exceptional teams with advanced recruitment tools
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 relative z-10">
                <div className="space-y-3">
                  {[
                    "Intelligent candidate matching",
                    "Comprehensive talent analytics",
                    "Streamlined hiring process",
                    "Employer branding tools",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-stone-700 rounded-full"></div>
                      <span className="text-stone-700 dark:text-stone-300 text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => onRoleSelected("COMPANY")}
                  className="w-full bg-gradient-to-r from-stone-700 to-stone-600 hover:from-stone-800 hover:to-stone-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
                >
                  <span className="mr-2">Find Top Talent</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
