import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  FileText,
  Heart,
  Calendar,
  TrendingUp,
  Target,
  Award,
  Users,
  ArrowRight,
  Clock,
  MapPin,
  Building2,
  DollarSign,
  Eye,
  CheckCircle,
  Sparkles,
  BarChart3,
  Activity,
  Search,
  User,
} from "lucide-react";
import JobSeekerLayout from "./JobSeekerLayout";
import ProfileNew from "../pages/ProfileNew";
import BrowseJobsNew from "../pages/BrowseJobsNew";
import MyApplicationsNew from "../pages/MyApplicationsNew";
import SavedJobsNew from "../pages/SavedJobsNew";
import { savedJobsAPI } from "../api/savedJobs";
import { API_URL } from "@/config";
import LoadingOverlay from "./LoadingOverlay";
import useDelayedTrue from "../hooks/useDelayedTrue";

export default function JobSeekerDashboardNew({ onLogout }) {
  const { user, getAccessTokenSilently, isLoading: authLoading } = useAuth0();
  const [activeView, setActiveView] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    applications: 0,
    savedJobs: 0,
    profileCompletion: 0,
    appliedJobs: 0,
    interviewSchedule: 0,
    profileViews: 0,
  });
  const [applications, setApplications] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Fetch dashboard data only once
  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboardData();
    }
  }, [authLoading, user]);

  const fetchDashboardData = async () => {
    try {
      const token = await getAccessTokenSilently();

      // Fetch applications
      try {
        const appsResponse = await fetch(
          `${API_URL}/applications/my-applications`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (appsResponse.ok) {
          const data = await appsResponse.json();
          setApplications(data.applications || data);
          setStats((prev) => ({
            ...prev,
            appliedJobs: (data.applications || data).length,
            interviewSchedule: (data.applications || data).filter(
              (app) => app.status === "INTERVIEW"
            ).length,
          }));
        } else if (appsResponse.status === 403) {
          // New job seeker without profile - set empty data
          setApplications([]);
          setStats((prev) => ({
            ...prev,
            appliedJobs: 0,
            interviewSchedule: 0,
          }));
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
        // Set empty data on error
        setApplications([]);
        setStats((prev) => ({
          ...prev,
          appliedJobs: 0,
          interviewSchedule: 0,
        }));
      }

      // Fetch saved jobs count
      try {
        const savedResponse = await savedJobsAPI.getSavedJobs(token, 1, 1);
        setStats((prev) => ({
          ...prev,
          savedJobs: savedResponse.pagination?.total || 0,
        }));
      } catch (error) {
        console.error("Error fetching saved jobs:", error);
        // Set empty data on error (handles 403 for new users)
        setStats((prev) => ({
          ...prev,
          savedJobs: 0,
        }));
      }

      // Fetch recent jobs
      try {
        const jobsResponse = await fetch(`${API_URL}/job-postings?limit=6`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (jobsResponse.ok) {
          const data = await jobsResponse.json();
          setRecentJobs(Array.isArray(data) ? data.slice(0, 6) : []);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }

      // Simulate profile views
      setStats((prev) => ({
        ...prev,
        profileViews: Math.floor(Math.random() * 100) + 50,
      }));

      setProfileCompletion(75); // Simulate profile completion
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderView = () => {
    switch (activeView) {
      case "profile":
        return <ProfileNew />;
      case "browse-jobs":
        return <BrowseJobsNew />;
      case "applications":
        return <MyApplicationsNew />;
      case "saved-jobs":
        return <SavedJobsNew />;
      default:
        return <DashboardContent />;
    }
  };

  const DashboardContent = () => (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8 text-center max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome back,{" "}
            {user?.given_name || user?.name?.split(" ")[0] || "User"}!
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Here's what's happening with your job search today.
        </p>
      </div>

      {/* Stats Grid - Responsive layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 max-w-4xl mx-auto">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full blur-2xl" />
          <CardContent className="p-4 sm:p-6 lg:p-8 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                  Total Applications
                </p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1">{stats.appliedJobs}</p>
                <p className="text-blue-100 text-xs sm:text-sm mt-2 sm:mt-3 flex items-center">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  +12% this week
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl">
                <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full blur-2xl" />
          <CardContent className="p-4 sm:p-6 lg:p-8 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                  Saved Jobs
                </p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1">{stats.savedJobs}</p>
                <p className="text-purple-100 text-xs sm:text-sm mt-2 sm:mt-3 flex items-center">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Ready to apply
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl">
                <Heart className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <div
                className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setActiveView("browse-jobs")}
              >
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-white">
                      Browse Jobs
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      Find your next opportunity
                    </p>
                  </div>
                </div>
                <div className="text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>

              <div
                className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setActiveView("profile")}
              >
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-white">
                      Update Profile
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      Complete your profile
                    </p>
                  </div>
                </div>
                <div className="text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>

              <div
                className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setActiveView("saved-jobs")}
              >
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-white">
                      Saved Jobs
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      Review saved positions
                    </p>
                  </div>
                </div>
                <div className="text-pink-600 dark:text-pink-400 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg lg:col-span-2 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Applications</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveView("applications")}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            {applications.length > 0 ? (
              <div className="space-y-4">
                {applications.slice(0, 3).map((app, index) => (
                  <div
                    key={index}
                    className="group flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer"
                    onClick={() => setActiveView("applications")}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {app.jobTitle || "Software Developer"}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center mt-1">
                          <Building2 className="w-3 h-3 mr-1" />
                          {app.companyName || "Tech Company"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 flex items-center mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          Applied 2 days ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge 
                        className={`font-medium ${
                          (app.status || "PENDING") === "PENDING" 
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" 
                            : (app.status || "PENDING") === "ACCEPTED"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                      >
                        {app.status || "PENDING"}
                      </Badge>
                      <div className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Applications Yet</h4>
                <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                  Start your job search journey by browsing and applying to jobs that match your skills.
                </p>
                <Button
                  onClick={() => setActiveView("browse-jobs")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Browse Jobs
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const showLoader = useDelayedTrue(authLoading || loading, 300);
  if (showLoader || authLoading) {
    return <LoadingOverlay message="Loading dashboard..." />;
  }

  return (
    <JobSeekerLayout
      activeView={activeView}
      onNavigate={setActiveView}
      onLogout={onLogout}
    >
      {renderView()}
    </JobSeekerLayout>
  );
}

// ... (rest of the code remains the same)
