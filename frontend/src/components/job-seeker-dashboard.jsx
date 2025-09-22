import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { useAuthMeta } from "@/context/AuthMetaContext";
import { useLogo } from "@/context/LogoContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  Briefcase,
  FileText,
  Heart,
  Target,
  Search,
  User,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  Calendar,
  Clock,
  BarChart3,
  Edit,
  MapPin,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import Spinner from "./Spinner";
import ThemeToggle from "./ThemeToggle";
import ProfileNew from "../pages/ProfileNew";
import BrowseJobs from "../pages/BrowseJobs";
import MyApplications from "../pages/MyApplications";
import SavedJobs from "../pages/SavedJobs";
import { savedJobsAPI } from "../api/savedJobs";
import AppLogo from "./AppLogo";
import { API_URL } from "@/config";

export default function JobSeekerDashboard({ onLogout }) {
  const { isDark, toggleTheme } = useTheme();
  const { getAccessTokenSilently, user } = useAuth0();
  const { appLogo } = useLogo();
  const navigate = useNavigate();
  const location = useLocation();
  const { userStatus } = useAuthMeta();
  const [searchTerm, setSearchTerm] = useState("");
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [viewHistory, setViewHistory] = useState(["dashboard"]);
  const [refreshTick, setRefreshTick] = useState(0);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [profileFullName, setProfileFullName] = useState("");

  // Dynamic data states
  const [stats, setStats] = useState({
    appliedJobs: 0,
    savedJobs: 0,
    interviewSchedule: 0,
    profileViews: 0,
  });

  const [profileStatus, setProfileStatus] = useState({
    isComplete: false,
    completionPercentage: 0,
    message: "Loading...",
  });

  const [profileViewsData, setProfileViewsData] = useState([]);

  // Navigation items for sidebar
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "profile", label: "Profile", icon: User },
    { id: "browse-jobs", label: "Browse Jobs", icon: Search },
    { id: "applications", label: "My Applications", icon: FileText },
    { id: "saved-jobs", label: "Saved Jobs", icon: Heart },
    { id: "recommendations", label: "Recommendations", icon: Target },
  ];

  const handleLogout = () => {
    onLogout();
  };

  const handleNavigation = (viewId) => {
    setActiveView(viewId);
  };

  // Track internal view history to support Back behavior within SPA
  useEffect(() => {
    setViewHistory((hist) => {
      if (hist[hist.length - 1] === activeView) return hist;
      return [...hist, activeView];
    });
  }, [activeView]);

  // Sync active view with query parameter `view`, e.g., '/?view=profile'
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const view = params.get("view");
    const validViews = [
      "dashboard",
      "profile",
      "browse-jobs",
      "applications",
      "saved-jobs",
      "recommendations",
    ];
    if (view && validViews.includes(view)) {
      setActiveView(view);
    }
  }, [location.search]);

  // Render the active view component
  const renderActiveView = () => {
    switch (activeView) {
      case "profile":
        return <ProfileNew />;
      case "browse-jobs":
        return <BrowseJobs />;
      case "applications":
        return <MyApplications />;
      case "saved-jobs":
        return <SavedJobs />;
      case "recommendations":
        return (
          <div className="max-w-7xl mx-auto p-8 text-center">
            <Target className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Job Recommendations
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Personalized job recommendations coming soon!
            </p>
          </div>
        );
      default:
        return renderDashboardContent();
    }
  };

  // Dashboard content as a separate function
  const renderDashboardContent = () => (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Stats and Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Modern Stats Cards with Gradients */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-white">
                        {stats.appliedJobs}
                      </div>
                      <div className="text-sm text-white/80 font-medium mt-1">
                        Applied Jobs
                      </div>
                    </div>
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <Briefcase className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-white">
                        {stats.savedJobs}
                      </div>
                      <div className="text-sm text-white/80 font-medium mt-1">
                        Saved Jobs
                      </div>
                    </div>
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-white">
                        {stats.interviewSchedule}
                      </div>
                      <div className="text-sm text-white/80 font-medium mt-1">
                        Interviews
                      </div>
                    </div>
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <Calendar className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Modern Applications Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Recent Applications
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Track your job application progress
                  </p>
                </div>
                <Button
                  variant="ghost"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl font-semibold transition-all duration-200"
                  onClick={() => handleNavigation("applications")}
                >
                  View All →
                </Button>
              </CardHeader>
              <CardContent>
                {applications.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Company
                          </th>
                          <th className="text-center py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Status
                          </th>
                          <th className="text-center py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Applied Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.slice(0, 3).map((app, index) => (
                          <motion.tr
                            key={app.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200"
                          >
                            <td className="py-4">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                  <Building2 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                                    {typeof (
                                      app.job?.company ??
                                      app.jobPosting?.company
                                    ) === "object"
                                      ? app.job?.company?.name ??
                                        app.jobPosting?.company?.name ??
                                        "Company"
                                      : (app.job?.company ??
                                          app.jobPosting?.company) ||
                                        "Company"}
                                  </div>
                                  <div className="text-sm text-slate-600 dark:text-slate-400">
                                    {app.job?.title ||
                                      app.jobPosting?.title ||
                                      "Job Title"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="text-center py-4">
                              <Badge
                                className={cn(
                                  "font-medium px-3 py-1",
                                  app.status === "PENDING" &&
                                    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
                                  app.status === "ACCEPTED" &&
                                    "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
                                  app.status === "REJECTED" &&
                                    "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
                                  app.status === "REVIEWED" &&
                                    "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                )}
                              >
                                {app.status.replace("_", " ")}
                              </Badge>
                            </td>
                            <td className="text-center py-4 text-sm text-slate-600 dark:text-slate-400">
                              {app.createdAt ||
                              app.appliedAt ||
                              app.applicationDate
                                ? new Date(
                                    app.createdAt ||
                                      app.appliedAt ||
                                      app.applicationDate
                                  ).toLocaleDateString()
                                : new Date().toLocaleDateString()}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <FileText className="w-16 h-16 text-slate-400 mx-auto mb-6" />
                    </motion.div>
                    <p className="text-slate-600 dark:text-slate-400 text-lg mb-6">
                      No applications yet
                    </p>
                    <Button
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                      onClick={() => handleNavigation("browse-jobs")}
                    >
                      Browse Jobs
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          {/* Modern Recent Jobs Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Recommended Jobs
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Latest opportunities matching your profile
                  </p>
                </div>
                <Button
                  variant="ghost"
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl font-semibold transition-all duration-200"
                  onClick={() => handleNavigation("browse-jobs")}
                >
                  View All →
                </Button>
              </CardHeader>
              <CardContent>
                {jobs.length > 0 ? (
                  <div className="space-y-4">
                    {jobs.slice(0, 3).map((job, index) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="group relative overflow-hidden p-6 border border-slate-200 dark:border-slate-700 rounded-2xl hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-5">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Briefcase className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {job.title}
                              </h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {typeof job.company === "object"
                                  ? job.company?.name
                                  : job.company}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <MapPin className="w-4 h-4 text-purple-500" />
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  {job.location}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl"
                              onClick={() => handleNavigation("browse-jobs")}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <Briefcase className="w-16 h-16 text-slate-400 mx-auto mb-6" />
                    </motion.div>
                    <p className="text-slate-600 dark:text-slate-400 text-lg mb-6">
                      No jobs available
                    </p>
                    <Button
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                      onClick={() => handleNavigation("browse-jobs")}
                    >
                      Explore Jobs
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Sidebar - Modern Profile Card */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 border-0 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              <CardContent className="p-8 text-center relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img
                    src={
                      profileImageUrl ||
                      user?.picture ||
                      "https://ui-avatars.com/api/?name=" +
                        encodeURIComponent(
                          profileFullName || user?.name || "User"
                        )
                    }
                    alt="Profile"
                    className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-white/30 shadow-2xl"
                    onError={(e) => {
                      e.target.src =
                        "https://ui-avatars.com/api/?name=" +
                        encodeURIComponent(
                          profileFullName || user?.name || "User"
                        );
                    }}
                  />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {profileFullName || user?.name || "User"}
                </h3>
                <p className="text-sm text-white/80 mb-1">
                  {user?.email || "email@example.com"}
                </p>
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 mb-6">
                  Job Seeker
                </Badge>
                <div className="space-y-5 mb-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-white/90">
                        Profile Completion
                      </span>
                      <span className="font-bold text-white">
                        {profileStatus.completionPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-3 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-white to-yellow-300 h-full rounded-full shadow-md"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${profileStatus.completionPercentage}%`,
                        }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                  {!profileStatus.isComplete && (
                    <p className="text-xs text-white/70 mt-3 leading-relaxed">
                      {profileStatus.message}
                    </p>
                  )}
                </div>
                <Button
                  className="w-full bg-white text-indigo-600 hover:bg-white/90 font-semibold py-3 px-6 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={() => handleNavigation("profile")}
                >
                  {profileStatus.isComplete
                    ? "View Profile"
                    : "Complete Profile"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Links (commented out) */}
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = await getAccessTokenSilently();

        // Fetch applications
        let appliedJobsCount = 0;
        let interviewCount = 0;

        try {
          const appsResponse = await fetch(
            `${API_URL}/applications/my-applications`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (appsResponse.ok) {
            const appsData = await appsResponse.json();
            console.log("Applications data:", appsData);
            setApplications(appsData.applications || appsData);

            // Calculate stats from real data
            const applications = appsData.applications || appsData;
            appliedJobsCount = applications.length;
            interviewCount = applications.filter(
              (app) =>
                app.status === "INTERVIEW" ||
                app.status === "interview_scheduled"
            ).length;
          } else if (appsResponse.status === 403) {
            // No profile exists yet, set empty applications
            console.log(
              "No job seeker profile found, setting empty applications"
            );
            setApplications([]);
            appliedJobsCount = 0;
            interviewCount = 0;
          }
        } catch (error) {
          console.error("Error fetching applications:", error);
          setApplications([]);
          appliedJobsCount = 0;
          interviewCount = 0;
        }

        // Fetch saved jobs count
        let savedJobsCount = 0;
        try {
          const savedJobsResponse = await savedJobsAPI.getSavedJobs(
            token,
            1,
            1
          );
          savedJobsCount = savedJobsResponse.pagination?.total || 0;
        } catch (error) {
          console.error("Error fetching saved jobs count:", error);
        }

        // Fetch profile status
        try {
          const profileResponse = await fetch(`${API_URL}/jobseeker/status`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log("Profile data received:", profileData);

            // Use the backend's isComplete determination and calculate percentage accordingly
            let completionPercentage = 100; // Default to 100% if complete

            if (profileData.isComplete) {
              completionPercentage = 100;
            } else if (profileData.hasProfile && profileData.profile) {
              // Calculate completion percentage based on profile fields
              let completedFields = 0;
              const totalFields = 5; // fullName, location, skills, phone, experienceYears
              const profile = profileData.profile;

              console.log("Profile object:", profile);

              if (profile.fullName) {
                completedFields++;
                console.log("✓ fullName:", profile.fullName);
              }
              if (profile.location) {
                completedFields++;
                console.log("✓ location:", profile.location);
              }
              if (profile.skills && profile.skills.length > 0) {
                completedFields++;
                console.log("✓ skills:", profile.skills);
              }
              if (profile.phone) {
                completedFields++;
                console.log("✓ phone:", profile.phone);
              }
              if (
                profile.experienceYears !== null &&
                profile.experienceYears !== undefined
              ) {
                completedFields++;
                console.log("✓ experienceYears:", profile.experienceYears);
              }

              completionPercentage = Math.round(
                (completedFields / totalFields) * 100
              );
              console.log(
                `Completed fields: ${completedFields}/${totalFields} = ${completionPercentage}%`
              );
            } else {
              completionPercentage = 0;
            }

            setProfileStatus({
              isComplete: profileData.isComplete,
              completionPercentage: completionPercentage,
              message: profileData.isComplete
                ? "Profile Completed! 🎉"
                : profileData.hasProfile
                ? "Complete Your Profile"
                : "Create Your Profile",
            });

            // Update profile image and name for profile card
            if (profileData.profile) {
              setProfileImageUrl(profileData.profile.profilePhotoUrl || "");
              setProfileFullName(profileData.profile.fullName || "");
            }
          }
        } catch (error) {
          console.error("Error fetching profile status:", error);
          setProfileStatus({
            isComplete: false,
            completionPercentage: 0,
            message: "Complete Your Profile",
          });
        }

        // Update stats with real data
        setStats({
          appliedJobs: appliedJobsCount,
          savedJobs: savedJobsCount,
          interviewSchedule: interviewCount,
          profileViews: Math.floor(Math.random() * 1000) + 500, // Mock for now
        });

        // Fetch recent jobs
        const jobsResponse = await fetch(`${API_URL}/job-postings?limit=5`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          setJobs(jobsData);
        }

        // Generate mock profile views data
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const viewsData = months.map((month) => ({
          month,
          views: Math.floor(Math.random() * 300) + 100,
        }));
        setProfileViewsData(viewsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [getAccessTokenSilently, refreshTick]);

  // Listen for application updates to refresh dashboard
  useEffect(() => {
    const handler = () => setRefreshTick((t) => t + 1);
    window.addEventListener("applicationsUpdated", handler);
    // Also refresh when profile is updated
    window.addEventListener("profileUpdated", handler);
    return () => {
      window.removeEventListener("applicationsUpdated", handler);
      window.removeEventListener("profileUpdated", handler);
    };
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "applied":
      case "selected":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "waiting":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "hired":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "applied":
        return "Applied";
      case "selected":
        return "Selected";
      case "waiting":
        return "Waiting";
      case "rejected":
        return "Rejected";
      case "hired":
        return "Hired";
      default:
        return "Unknown";
    }
  };

  if (loading) {
    return <Spinner />;
  }

  // Blocked state notice
  if (userStatus === "SUSPENDED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-200 dark:bg-stone-950 p-6">
        <Card className="max-w-md w-full bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-700 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-red-600" />
              <CardTitle className="text-xl font-bold text-stone-900 dark:text-stone-100">
                You are blocked
              </CardTitle>
            </div>
            <CardDescription className="text-stone-700 dark:text-stone-300">
              Your account has been suspended by an administrator. You cannot
              access the dashboard at this time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-end">
              <Button
                variant="destructive"
                onClick={onLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 transition-colors duration-500">
      {/* Sidebar wrapper: use an aside (or motion.div) so JSX is balanced */}
      <aside className="fixed left-6 top-28 bottom-8 w-72 hidden md:block z-20">
        {/* Collapse Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-2 transition-all duration-300 shadow-xl z-20 hover:shadow-2xl"
          title={sidebarCollapsed ? "Expand" : "Collapse"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </motion.button>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto mt-4 md:mt-9">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full flex items-center transition-all duration-300 ease-out rounded-xl font-medium group relative overflow-hidden",
                  sidebarCollapsed
                    ? "justify-center px-2 h-12"
                    : "justify-start px-4 h-12",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
                onClick={() => handleNavigation(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 transition-opacity",
                    !isActive && "group-hover:opacity-100"
                  )}
                />
                <Icon
                  className={cn(
                    "transition-all duration-300",
                    sidebarCollapsed ? "w-5 h-5" : "w-5 h-5",
                    isActive
                      ? "text-white"
                      : "group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  )}
                />
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium ml-3 transition-all duration-300">
                    {item.label}
                  </span>
                )}
                {isActive && !sidebarCollapsed && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-white"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-700 mt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center transition-all duration-300 rounded-xl font-medium group",
              sidebarCollapsed
                ? "justify-center px-2 h-12"
                : "justify-start px-4 h-12",
              "text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
            )}
            title={sidebarCollapsed ? "Logout" : undefined}
          >
            <LogOut
              className={cn(
                "transition-all duration-300",
                sidebarCollapsed ? "w-5 h-5" : "w-5 h-5"
              )}
            />
            {!sidebarCollapsed && (
              <span className="text-sm font-medium ml-3 transition-all duration-300">
                Logout
              </span>
            )}
          </motion.button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Modern Glassmorphism Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="fixed top-0 left-0 right-0 z-40 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 shadow-xl"
        >
          <div className="h-full flex items-center justify-between px-6 md:px-8">
            {/* Brand + Welcome */}
            <div className="flex items-center gap-4 md:gap-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-50" />
                  <AppLogo
                    size="w-10 h-10"
                    rounded="rounded-lg"
                    mode="contain"
                    className="relative"
                  />
                </div>
                <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Job Gujarat
                </span>
              </motion.div>
              <span className="hidden md:inline-block text-slate-300 dark:text-slate-600">
                |
              </span>
              <h2 className="hidden md:block text-base md:text-lg font-medium text-slate-700 dark:text-slate-300">
                {`Welcome back, ${
                  user?.given_name || user?.name?.split(" ")[0] || "User"
                }`}
              </h2>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 md:gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </motion.button>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <ThemeToggle />
              </div>
              <motion.div whileHover={{ scale: 1.1 }} className="relative">
                <img
                  src={
                    user?.picture ||
                    "https://ui-avatars.com/api/?name=" +
                      encodeURIComponent(user?.name || "User")
                  }
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-gradient-to-r from-blue-600 to-purple-600 shadow-lg cursor-pointer"
                  onClick={() => handleNavigation("profile")}
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 p-8 mt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
