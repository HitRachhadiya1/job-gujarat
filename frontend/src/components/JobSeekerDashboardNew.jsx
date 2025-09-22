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
  const { user, getAccessTokenSilently } = useAuth0();
  const [activeView, setActiveView] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    appliedJobs: 0,
    savedJobs: 0,
    profileViews: 0,
    interviewSchedule: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

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
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
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
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome back,{" "}
            {user?.given_name || user?.name?.split(" ")[0] || "User"}!
          </span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Here's what's happening with your job search today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Applications
                  </p>
                  <p className="text-3xl font-bold mt-1">{stats.appliedJobs}</p>
                  <p className="text-blue-100 text-xs mt-2">+12% this week</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <Briefcase className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">
                    Saved Jobs
                  </p>
                  <p className="text-3xl font-bold mt-1">{stats.savedJobs}</p>
                  <p className="text-purple-100 text-xs mt-2">Ready to apply</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <Heart className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">
                    Profile Views
                  </p>
                  <p className="text-3xl font-bold mt-1">
                    {stats.profileViews}
                  </p>
                  <p className="text-green-100 text-xs mt-2">Last 30 days</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <Eye className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">
                    Interviews
                  </p>
                  <p className="text-3xl font-bold mt-1">
                    {stats.interviewSchedule}
                  </p>
                  <p className="text-orange-100 text-xs mt-2">Scheduled</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Completion Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    Profile Strength
                  </CardTitle>
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    {profileCompletion}% Complete
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${profileCompletion}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Complete your profile to get 40% more visibility
                    </span>
                    <Button
                      size="sm"
                      onClick={() => setActiveView("profile")}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg"
                    >
                      Complete Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Applications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    Recent Applications
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveView("applications")}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.slice(0, 3).map((app, index) => (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {app.jobPosting?.title || "Position"}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {app.jobPosting?.company?.name || "Company"}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={cn(
                            "font-medium",
                            app.status === "PENDING" &&
                              "bg-yellow-100 text-yellow-800",
                            app.status === "ACCEPTED" &&
                              "bg-green-100 text-green-800",
                            app.status === "REJECTED" &&
                              "bg-red-100 text-red-800"
                          )}
                        >
                          {app.status}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 dark:text-slate-400">
                      No applications yet
                    </p>
                    <Button
                      onClick={() => setActiveView("browse-jobs")}
                      className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    >
                      Browse Jobs
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-8">
          {/* Recommended Jobs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Jobs For You
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentJobs.slice(0, 3).map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="p-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                      onClick={() => setActiveView("browse-jobs")}
                    >
                      <p className="font-medium text-white">{job.title}</p>
                      <p className="text-sm text-white/80">
                        {job.company?.name}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-white/70">
                        <MapPin className="w-3 h-3 mr-1" />
                        {job.location}
                      </div>
                    </motion.div>
                  ))}
                  <Button
                    variant="secondary"
                    className="w-full bg-white text-indigo-600 hover:bg-white/90"
                    onClick={() => setActiveView("browse-jobs")}
                  >
                    View All Jobs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setActiveView("browse-jobs")}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Find Jobs
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setActiveView("profile")}
                >
                  <User className="w-4 h-4 mr-2" />
                  Update Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setActiveView("saved-jobs")}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Saved Jobs
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );

  const showLoader = useDelayedTrue(loading, 600);
  if (showLoader) {
    return <LoadingOverlay message="Loading..." />;
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
