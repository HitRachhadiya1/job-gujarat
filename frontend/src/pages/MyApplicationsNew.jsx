import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Calendar,
  Clock,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Timer,
  TrendingUp,
  Award,
  Briefcase,
  User,
  Mail,
  Phone,
  ArrowRight,
  ExternalLink,
  Download,
  Eye,
  MessageSquare,
  Star,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_URL } from "@/config";
import { useToast } from "@/hooks/use-toast";
import LoadingOverlay from "../components/LoadingOverlay";
import useDelayedTrue from "../hooks/useDelayedTrue";

export default function MyApplicationsNew() {
  const { getAccessTokenSilently } = useAuth0();
  const { toast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/applications/my-applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || data);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500 text-white";
      case "REVIEWING":
        return "bg-blue-500 text-white";
      case "INTERVIEW":
        return "bg-purple-500 text-white";
      case "ACCEPTED":
        return "bg-green-500 text-white";
      case "REJECTED":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "REVIEWING":
        return <Eye className="w-4 h-4" />;
      case "INTERVIEW":
        return <Calendar className="w-4 h-4" />;
      case "ACCEPTED":
        return <CheckCircle className="w-4 h-4" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getFilteredApplications = () => {
    if (activeTab === "all") return applications;
    return applications.filter(app => app.status === activeTab.toUpperCase());
  };

  const ApplicationCard = ({ application, index }) => {
    const isRecent = new Date() - new Date(application.createdAt) < 3 * 24 * 60 * 60 * 1000;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileHover={{ y: -5 }}
      >
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          {/* Status indicator bar */}
          <div className={cn("absolute top-0 left-0 right-0 h-1", getStatusColor(application.status))} />
          
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                {/* Company Logo */}
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg"
                >
                  {application.jobPosting?.company?.name?.[0] || "C"}
                </motion.div>

                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {application.jobPosting?.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {application.jobPosting?.company?.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isRecent && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Recent
                    </Badge>
                  </motion.div>
                )}
                <Badge className={cn("flex items-center gap-1", getStatusColor(application.status))}>
                  {getStatusIcon(application.status)}
                  {application.status}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Job Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>{application.jobPosting?.location || "Remote"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span>Applied {new Date(application.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Briefcase className="w-4 h-4 text-green-500" />
                <span>{application.jobPosting?.type || "Full-time"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Timer className="w-4 h-4 text-orange-500" />
                <span>{application.jobPosting?.experienceLevel || "Entry"} Level</span>
              </div>
            </div>

            {/* Status Timeline */}
            {application.status === "INTERVIEW" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
              >
                <p className="text-sm font-medium text-purple-900 dark:text-purple-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Interview scheduled
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">
                  Check your email for details
                </p>
              </motion.div>
            )}

            {/* Cover Letter Preview */}
            {application.coverLetter && (
              <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Cover Letter</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                  {application.coverLetter}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 group"
                onClick={() => setSelectedApplication(application)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
              {application.status === "INTERVIEW" && (
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const StatsCard = ({ icon: Icon, label, value, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{label}</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {value}
              </p>
              {trend && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {trend}
                </p>
              )}
            </div>
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              color
            )}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const showLoader = useDelayedTrue(loading, 600);
  if (showLoader) {
    return <LoadingOverlay message="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              My Applications
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track and manage all your job applications in one place
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            icon={FileText}
            label="Total Applications"
            value={applications.length}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatsCard
            icon={Clock}
            label="Pending"
            value={applications.filter(a => a.status === "PENDING").length}
            color="bg-gradient-to-br from-yellow-500 to-orange-600"
            trend="+2 this week"
          />
          <StatsCard
            icon={Calendar}
            label="Interviews"
            value={applications.filter(a => a.status === "INTERVIEW").length}
            color="bg-gradient-to-br from-purple-500 to-pink-600"
          />
          <StatsCard
            icon={CheckCircle}
            label="Success Rate"
            value={`${Math.round((applications.filter(a => a.status === "ACCEPTED").length / applications.length) * 100) || 0}%`}
            color="bg-gradient-to-br from-green-500 to-emerald-600"
          />
        </div>

        {/* Tabs and Applications */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-6 w-full">
                <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({applications.filter(a => a.status === "PENDING").length})
                </TabsTrigger>
                <TabsTrigger value="reviewing">
                  Reviewing ({applications.filter(a => a.status === "REVIEWING").length})
                </TabsTrigger>
                <TabsTrigger value="interview">
                  Interview ({applications.filter(a => a.status === "INTERVIEW").length})
                </TabsTrigger>
                <TabsTrigger value="accepted">
                  Accepted ({applications.filter(a => a.status === "ACCEPTED").length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({applications.filter(a => a.status === "REJECTED").length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {getFilteredApplications().map((application, index) => (
                  <ApplicationCard key={application.id} application={application} index={index} />
                ))}
              </div>
            </AnimatePresence>

            {/* Empty State */}
            {getFilteredApplications().length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FileText className="w-20 h-20 text-slate-400 mx-auto mb-6" />
                </motion.div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  No applications yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Start applying to jobs to see them here
                </p>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  Browse Jobs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
