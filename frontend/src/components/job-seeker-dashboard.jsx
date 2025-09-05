import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthMeta } from "../context/AuthMetaContext";
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
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import Spinner from "./Spinner";
import ThemeToggle from "./ThemeToggle";
import Profile from "../pages/Profile";
import BrowseJobs from "../pages/BrowseJobs";
import MyApplications from "../pages/MyApplications";
import SavedJobs from "../pages/SavedJobs";
import { savedJobsAPI } from "../api/savedJobs";

export default function JobSeekerDashboard() {
  const { getAccessTokenSilently, user, logout } = useAuth0();
  const { role } = useAuthMeta();
  const [searchTerm, setSearchTerm] = useState("");
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [viewHistory, setViewHistory] = useState(["dashboard"]);
  const [refreshTick, setRefreshTick] = useState(0);

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
    logout({ returnTo: window.location.origin });
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

  const handleBack = () => {
    setViewHistory((hist) => {
      if (hist.length > 1) {
        const newHist = hist.slice(0, -1);
        const prev = newHist[newHist.length - 1] || "dashboard";
        setActiveView(prev);
        return newHist;
      }
      // Fallback to dashboard if no history
      setActiveView("dashboard");
      return ["dashboard"];
    });
  };

  // Render the active view component
  const renderActiveView = () => {
    switch (activeView) {
      case "profile":
        return <Profile />;
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-stone-100/95 dark:bg-stone-900/60 backdrop-blur-sm border-stone-400/70 dark:border-stone-800/50 shadow-lg hover:shadow-xl transition-all duration-200 group">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-gradient-to-br from-stone-300/90 to-stone-400/70 dark:from-stone-800 dark:to-stone-700 rounded-3xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <Briefcase className="w-6 h-6 text-stone-900 dark:text-stone-300" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                      {stats.appliedJobs}
                    </div>
                    <div className="text-sm text-stone-800 dark:text-stone-400 font-medium">
                      Applied Jobs
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-stone-100/95 dark:bg-stone-900/60 backdrop-blur-sm border-stone-400/70 dark:border-stone-800/50 shadow-lg hover:shadow-xl transition-all duration-200 group">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-gradient-to-br from-stone-300/90 to-stone-400/70 dark:from-stone-800 dark:to-stone-700 rounded-3xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <Heart className="w-6 h-6 text-stone-900 dark:text-stone-300" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                      {stats.savedJobs}
                    </div>
                    <div className="text-sm text-stone-800 dark:text-stone-400 font-medium">
                      Saved Jobs
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-stone-100/95 dark:bg-stone-900/60 backdrop-blur-sm border-stone-400/70 dark:border-stone-800/50 shadow-lg hover:shadow-xl transition-all duration-200 group">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-gradient-to-br from-stone-300/90 to-stone-400/70 dark:from-stone-800 dark:to-stone-700 rounded-3xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <Calendar className="w-6 h-6 text-stone-900 dark:text-stone-300" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                      {stats.interviewSchedule}
                    </div>
                    <div className="text-sm text-stone-800 dark:text-stone-400 font-medium">
                      Interviews
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* My Applications Table */}
          <Card className="bg-stone-100/95 dark:bg-stone-900/60 backdrop-blur-sm border-stone-400/70 dark:border-stone-800/50 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                  My Applications
                </CardTitle>
                <p className="text-sm text-stone-800 dark:text-stone-400 font-medium">
                  Track your job application progress
                </p>
              </div>
              <Button
                variant="ghost"
                className="text-stone-800 hover:text-stone-900 hover:bg-stone-200/50 rounded-xl font-semibold transition-all duration-200"
                onClick={() => handleNavigation("applications")}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {applications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-stone-400/50 dark:border-stone-700">
                        <th className="text-left py-4 text-sm font-bold text-stone-800 dark:text-stone-300">
                          Company
                        </th>
                        <th className="text-center py-4 text-sm font-bold text-stone-800 dark:text-stone-300">
                          Status
                        </th>
                        <th className="text-center py-4 text-sm font-bold text-stone-800 dark:text-stone-300">
                          Applied Date
                        </th>
                        {/* <th className="text-center py-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                          Actions
                        </th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {applications.slice(0, 3).map((app) => (
                        <tr
                          key={app.id}
                          className="border-b border-stone-300/30 dark:border-stone-800 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors duration-200"
                        >
                          <td className="py-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-stone-300/90 to-stone-400/70 dark:from-stone-800 dark:to-stone-700 rounded-2xl flex items-center justify-center shadow-md">
                                <Building2 className="w-6 h-6 text-stone-900 dark:text-stone-300" />
                              </div>
                              <div>
                                <div className="font-bold text-stone-900 dark:text-stone-100">
                                  {typeof (app.job?.company ?? app.jobPosting?.company) === 'object'
                                    ? (app.job?.company?.name ?? app.jobPosting?.company?.name ?? 'Company')
                                    : ((app.job?.company ?? app.jobPosting?.company) || 'Company')}
                                </div>
                                <div className="text-sm text-stone-700 dark:text-stone-400 font-medium">
                                  {app.job?.title || app.jobPosting?.title || "Job Title"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-4">
                            <Badge
                              variant="outline"
                              className="bg-stone-200/80 text-stone-900 border-stone-400/50 dark:bg-stone-800/50 dark:text-stone-300 dark:border-stone-600/50 font-semibold px-3 py-1 rounded-xl"
                            >
                              {app.status.replace("_", " ").toUpperCase()}
                            </Badge>
                          </td>
                          <td className="text-center py-4 text-sm text-stone-800 dark:text-stone-400 font-medium">
                            {app.createdAt || app.appliedAt || app.applicationDate
                              ? new Date(app.createdAt || app.appliedAt || app.applicationDate).toLocaleDateString()
                              : new Date().toLocaleDateString()}
                          </td>
                          {/* <td className="text-center py-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              View
                            </Button>
                          </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-stone-500 mx-auto mb-6" />
                  <p className="text-stone-800 dark:text-stone-400 text-lg font-medium mb-6">
                    No applications yet
                  </p>
                  <Button
                    className="bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    onClick={() => handleNavigation("browse-jobs")}
                  >
                    Browse Jobs
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Jobs Section */}
          <Card className="bg-stone-100/95 dark:bg-stone-900/60 backdrop-blur-sm border-stone-400/70 dark:border-stone-800/50 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                  Recent Jobs
                </CardTitle>
                <p className="text-sm text-stone-800 dark:text-stone-400 font-medium">
                  Latest job opportunities for you
                </p>
              </div>
              <Button
                variant="ghost"
                className="text-stone-800 hover:text-stone-900 hover:bg-stone-200/50 rounded-xl font-semibold transition-all duration-200"
                onClick={() => handleNavigation("browse-jobs")}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.slice(0, 3).map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-6 border border-stone-400/50 dark:border-stone-700 rounded-2xl hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center space-x-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-stone-300/90 to-stone-400/70 dark:from-stone-800 dark:to-stone-700 rounded-2xl flex items-center justify-center shadow-md">
                          <Briefcase className="w-7 h-7 text-stone-900 dark:text-stone-300" />
                        </div>
                        <div>
                          <h3 className="font-bold text-stone-900 dark:text-stone-100 text-lg">
                            {job.title}
                          </h3>
                          <p className="text-sm text-stone-700 dark:text-stone-400 font-medium">
                            {typeof job.company === "object"
                              ? job.company?.name
                              : job.company}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <MapPin className="w-4 h-4 text-stone-600 dark:text-stone-500" />
                            <span className="text-sm text-stone-600 dark:text-stone-500 font-medium">
                              {job.location}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* <Badge variant="outline" className="text-xs">
                          {job.type}
                        </Badge> */}
                        {/* <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleNavigation("browse-jobs")}
                        >
                          View
                        </Button> */}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-stone-500 mx-auto mb-6" />
                  <p className="text-stone-800 dark:text-stone-400 text-lg font-medium mb-6">
                    No jobs available
                  </p>
                  <Button
                    className="bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    onClick={() => handleNavigation("browse-jobs")}
                  >
                    Browse Jobs
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Profile Card */}
        <div className="space-y-8">
          {/* Profile Card */}
          <Card className="bg-stone-100/95 dark:bg-stone-900/60 backdrop-blur-sm border-stone-400/70 dark:border-stone-800/50 shadow-lg">
            <CardContent className="p-8 text-center">
              <img
                src={
                  user?.picture ||
                  "https://via.placeholder.com/96/78716c/FFFFFF?text=U"
                }
                alt="Profile"
                className="w-24 h-24 rounded-full mx-auto mb-6 border-4 border-stone-400/50 dark:border-stone-600 shadow-lg"
              />
              <h3 className="font-bold text-xl text-stone-900 dark:text-stone-100 tracking-tight mb-2">
                {user?.name || "User"}
              </h3>
              <p className="text-sm text-stone-700 dark:text-stone-400 font-medium mb-8">Job Seeker</p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="text-center p-4 bg-stone-200/50 dark:bg-stone-800/30 rounded-2xl">
                  <div className="text-xl font-bold text-stone-900 dark:text-stone-100">
                    {stats.appliedJobs}
                  </div>
                  <div className="text-sm text-stone-700 dark:text-stone-400 font-medium">
                    Applications
                  </div>
                </div>
                <div className="text-center p-4 bg-stone-200/50 dark:bg-stone-800/30 rounded-2xl">
                  <div className="text-xl font-bold text-stone-900 dark:text-stone-100">
                    {stats.savedJobs}
                  </div>
                  <div className="text-sm text-stone-700 dark:text-stone-400 font-medium">
                    Saved Jobs
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <Button
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={() => handleNavigation("profile")}
                >
                  <Edit className="w-5 h-5 mr-3" />
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-stone-400/70 dark:border-stone-600 text-stone-800 dark:text-stone-300 font-semibold py-3 px-6 rounded-2xl transition-all duration-200 hover:bg-stone-200/50 dark:hover:bg-stone-800/30"
                  onClick={() => handleNavigation("browse-jobs")}
                >
                  <Search className="w-5 h-5 mr-3" />
                  Find Jobs
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          {/* <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {navigationItems.slice(1).map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className="w-full justify-start text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                    onClick={() => handleNavigation(item.id)}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    <span className="text-sm">{item.label}</span>
                  </Button>
                )
              })}
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const fetchDashboardData = async () => {

      try {
        const token = await getAccessTokenSilently();

        // Fetch applications
        const appsResponse = await fetch(
          "http://localhost:5000/api/applications/my-applications",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        let appliedJobsCount = 0;
        let interviewCount = 0;

        if (appsResponse.ok) {
          const appsData = await appsResponse.json();
          console.log("Applications data:", appsData);
          setApplications(appsData.applications || appsData);

          // Calculate stats from real data
          const applications = appsData.applications || appsData;
          appliedJobsCount = applications.length;
          interviewCount = applications.filter(
            (app) =>
              app.status === "INTERVIEW" || app.status === "interview_scheduled"
          ).length;
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
          const profileResponse = await fetch(
            "http://localhost:5000/api/job-seekers/status",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

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
        const jobsResponse = await fetch(
          "http://localhost:5000/api/job-postings?limit=5",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
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
    window.addEventListener('applicationsUpdated', handler);
    return () => window.removeEventListener('applicationsUpdated', handler);
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

  return (
    <div className="h-screen bg-stone-300 dark:bg-stone-950 flex transition-colors duration-500 overflow-hidden m-0 p-0">
      {/* Sidebar */}
      <div
        className={`${
          sidebarCollapsed ? "w-16" : "w-64"
        } bg-stone-800 dark:bg-stone-900/90 border-r border-stone-700 dark:border-stone-800/60 shadow-xl transition-all duration-200 flex flex-col h-full overflow-hidden backdrop-blur-md`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-stone-700 dark:border-stone-800/60">
          <div className="flex items-center space-x-4 cursor-pointer group">
            <div className="w-12 h-12 bg-gradient-to-br from-stone-100 to-stone-50 dark:from-stone-200 dark:to-stone-100 rounded-3xl flex items-center justify-center shadow-xl border border-stone-200/20 group-hover:scale-105 transition-transform duration-200">
              <Briefcase className="w-6 h-6 text-stone-800 dark:text-stone-800" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-stone-100 dark:text-stone-100 tracking-tight">
                  Job Gujarat
                </h1>
                <p className="text-sm text-stone-300 dark:text-stone-400 font-medium tracking-wide">
                  Elite Career Solutions
                </p>
              </div>
            )}
          </div>
          
          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute top-6 right-2 text-stone-300 hover:text-stone-100 hover:bg-stone-700/50 rounded-xl p-2 transition-all duration-200"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-hidden">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={`w-full ${
                  sidebarCollapsed
                    ? "justify-center px-3"
                    : "justify-start px-4"
                } py-3 text-left transition-all duration-200 rounded-xl font-semibold ${
                  activeView === item.id
                    ? "bg-stone-100/20 text-stone-100 shadow-lg border border-stone-600/30 hover:bg-stone-100/30"
                    : "text-stone-300 hover:text-stone-100 hover:bg-stone-700/50"
                }`}
                onClick={() => handleNavigation(item.id)}
              >
                <Icon className="w-5 h-5" />
                {!sidebarCollapsed && (
                  <span className="text-sm font-semibold ml-3">{item.label}</span>
                )}
              </Button>
            );
          })}
        </nav>
        
        {/* Logout Button */}
        <div className="p-4 border-t border-stone-700 dark:border-stone-800/60">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`w-full ${
              sidebarCollapsed ? "justify-center px-3" : "justify-start px-4"
            } py-3 text-stone-300 hover:text-stone-100 hover:bg-stone-700/50 transition-all duration-200 rounded-xl font-semibold`}
          >
            <LogOut className="w-5 h-5" />
            {!sidebarCollapsed && (
              <span className="text-sm font-semibold ml-3">Logout</span>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-stone-800/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-700 dark:border-stone-800/60 shadow-lg">
          <div className="flex items-center justify-between px-8 py-5">
            <div className="flex items-center space-x-6">
              {activeView !== "dashboard" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="text-stone-300 hover:text-stone-100 hover:bg-stone-700/50 rounded-xl p-2 transition-all duration-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <h2 className="text-2xl font-bold text-stone-100 dark:text-stone-100 tracking-tight">
                {`Welcome, ${
                  user?.given_name || user?.name?.split(" ")[0] || "User"
                }`}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative text-stone-300 hover:text-stone-100 hover:bg-stone-700/50 rounded-xl p-3 transition-all duration-200"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-stone-400 rounded-full"></span>
              </Button>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="text-stone-300 hover:text-stone-100 hover:bg-stone-700/50 rounded-xl p-3 transition-all duration-200"
              >
                <Sun className="w-5 h-5" />
              </Button>

              {/* User Profile */}
              <div className="flex items-center space-x-3 pl-4 border-l border-stone-700 dark:border-stone-800/60">
                <img
                  src={
                    user?.picture ||
                    "https://via.placeholder.com/40/78716c/FFFFFF?text=U"
                  }
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-stone-600 shadow-md"
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {user?.given_name || user?.name?.split(" ")[0] || "User"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-stone-200/50 dark:bg-stone-950/50 p-8">
          {activeView !== 'dashboard' && (
            <div className="mb-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
            </div>
          )}
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
