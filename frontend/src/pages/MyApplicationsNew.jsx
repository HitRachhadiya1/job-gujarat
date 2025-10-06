import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_URL } from "@/config";
import { useToast } from "@/hooks/use-toast";
import LoadingOverlay from "../components/LoadingOverlay";
import useDelayedTrue from "../hooks/useDelayedTrue";
import ApprovalProcessModal from "../components/ApprovalProcessModal";

// StrictMode-safe caches and animation guard
let __appsCache = null;
let __appsAnimatedOnce = false;

export default function MyApplicationsNew() {
  const { getAccessTokenSilently } = useAuth0();
  const { toast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalApplication, setApprovalApplication] = useState(null);
  const [approvalFees, setApprovalFees] = useState({});

  // One-time animation guard for development StrictMode double-mount
  const shouldAnimateInitial = !__appsAnimatedOnce;
  useEffect(() => {
    __appsAnimatedOnce = true;
  }, []);

  useEffect(() => {
    fetchApplications();
  }, []);

  // Prefetch approval fee for HIRED applications so the button can show dynamic amount
  useEffect(() => {
    const hiredApps = applications.filter((a) => a.status === "HIRED");
    hiredApps.forEach((app) => {
      if (approvalFees[app.id] == null) {
        fetchApprovalFeeFor(app.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applications]);

  const fetchApprovalFeeFor = async (applicationId) => {
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${API_URL}/applications/${applicationId}/approval-fee`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setApprovalFees((prev) => ({ ...prev, [applicationId]: data.approvalFee }));
      }
    } catch (e) {
      // Silently ignore; amount will be shown in modal if not prefetched
    }
  };

  const hasAadhaar = (app) => {
    try {
      if (!app?.aadhaarDocumentUrl) return false;
      const data = typeof app.aadhaarDocumentUrl === 'string'
        ? JSON.parse(app.aadhaarDocumentUrl)
        : app.aadhaarDocumentUrl;
      return !!(data?.front || data?.back);
    } catch {
      return false;
    }
  };

  const fetchApplications = async (force = false) => {
    // Serve from cache to avoid duplicate fetch in StrictMode dev
    if (!force && __appsCache !== null) {
      setApplications(Array.isArray(__appsCache) ? __appsCache : []);
      setLoading(false);
      return;
    }
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/applications/my-applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const list = data?.applications || data || [];
        __appsCache = list;
        setApplications(list);
      } else if (response.status === 403) {
        // New job seeker without profile - set empty data
        setApplications([]);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      // Set empty data on error (handles 403 for new users)
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const s = (status || "").toUpperCase() === "APPLIED" ? "PENDING" : (status || "").toUpperCase();
    switch (s) {
      case "PENDING":
        return "bg-yellow-500 text-white";
      case "ACCEPTED":
        return "bg-green-500 text-white";
      case "REJECTED":
        return "bg-red-500 text-white";
      case "HIRED":
        return "bg-blue-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusIcon = (status) => {
    const s = (status || "").toUpperCase() === "APPLIED" ? "PENDING" : (status || "").toUpperCase();
    switch (s) {
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "ACCEPTED":
        return <CheckCircle className="w-4 h-4" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4" />;
      case "HIRED":
        return <Award className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const normalizeStatus = (status) => {
    const s = (status || "").toUpperCase();
    return s === "APPLIED" ? "PENDING" : s;
  };

  const getFilteredApplications = () => {
    if (activeTab === "all") return applications;
    const target = activeTab.toUpperCase();
    return applications.filter((app) => normalizeStatus(app.status) === target);
  };

  const ApplicationCard = ({ application, index, animateOnMount }) => {
    const isRecent =
      new Date() - new Date(application.createdAt) < 3 * 24 * 60 * 60 * 1000;

    return (
      <motion.div
        layout
        initial={animateOnMount ? { opacity: 0, y: 20 } : false}
        animate={animateOnMount ? { opacity: 1, y: 0 } : undefined}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileHover={{ y: -5 }}
      >
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          {/* Status indicator bar */}
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-1",
              getStatusColor(application.status)
            )}
          />

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
              <div className="flex items-center space-x-4 min-w-0 flex-1">
                {/* Company Logo */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                  {application.jobPosting?.company?.name?.[0] ||
                    application.job?.company?.name?.[0] ||
                    application.companyName?.[0] ||
                    "C"}
                </div>

                <div className="min-w-0">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {application.jobPosting?.title ||
                      application.job?.title ||
                      application.jobTitle ||
                      "Job Title"}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 truncate">
                    <Building2 className="w-3 h-3" />
                    {application.jobPosting?.company?.name ||
                      application.job?.company?.name ||
                      application.companyName ||
                      "Company"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
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
                <Badge
                  className={cn(
                    "flex items-center gap-1",
                    getStatusColor(application.status)
                  )}
                >
                  {getStatusIcon(application.status)}
                  {normalizeStatus(application.status)}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Job Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>
                  {application.jobPosting?.location ||
                    application.job?.location ||
                    "Remote"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span>
                  Applied {new Date(application.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Briefcase className="w-4 h-4 text-green-500" />
                <span>
                  {application.jobPosting?.type ||
                    application.job?.type ||
                    "Full-time"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Timer className="w-4 h-4 text-orange-500" />
                <span>
                  {application.jobPosting?.experienceLevel ||
                    application.job?.experienceLevel ||
                    "Entry"}{" "}
                  Level
                </span>
              </div>
            </div>

            {/* Cover Letter Preview */}
            {application.coverLetter && (
              <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Cover Letter
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                  {application.coverLetter}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 group cursor-pointer"
                onClick={() => {
                  setSelectedApplication(application);
                  setIsDetailsModalOpen(true);
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
              {application.status === "HIRED" && !hasAadhaar(application) && (
                <Button
                  type="button"
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white cursor-pointer"
                  onClick={() => {
                    setApprovalApplication(application);
                    setIsApprovalModalOpen(true);
                    if (approvalFees[application.id] == null) {
                      fetchApprovalFeeFor(application.id);
                    }
                  }}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {approvalFees[application.id] != null
                    ? `Pay ₹${approvalFees[application.id]} and Upload`
                    : "Pay and Upload"}
                </Button>
              )}
              {application.status === "HIRED" && hasAadhaar(application) && (
                <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Aadhaar uploaded
                </div>
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
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                {label}
              </p>
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
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                color
              )}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return <LoadingOverlay message="Loading applications..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 relative">
        {/* Header */}
        <motion.div
          initial={shouldAnimateInitial ? { opacity: 0, y: -20 } : false}
          animate={shouldAnimateInitial ? { opacity: 1, y: 0 } : undefined}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              My Applications
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Track and manage all your job applications in one place
          </p>
        </motion.div>

        {/* Stats Grid */}
        {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatsCard
            icon={FileText}
            label="Total Applications"
            value={applications.length}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatsCard
            icon={Clock}
            label="Pending"
            value={applications.filter((a) => a.status === "PENDING").length}
            color="bg-gradient-to-br from-yellow-500 to-orange-600"
          />
          <StatsCard
            icon={CheckCircle}
            label="Accepted"
            value={applications.filter((a) => a.status === "ACCEPTED").length}
            color="bg-gradient-to-br from-green-500 to-emerald-600"
          />
          <StatsCard
            icon={XCircle}
            label="Success Rate"
            value={`${
              Math.round(
                (applications.filter((a) => a.status === "ACCEPTED").length /
                  (applications.length || 1)) *
                  100
              ) || 0
            }%`}
            color="bg-gradient-to-br from-purple-500 to-pink-600"
          />
        </div> */}

        {/* Tabs and Applications */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="all">
                  All ({applications.length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending (
                  {applications.filter((a) => normalizeStatus(a.status) === "PENDING").length})
                </TabsTrigger>
                <TabsTrigger value="accepted">
                  Accepted (
                  {applications.filter((a) => normalizeStatus(a.status) === "ACCEPTED").length})
                </TabsTrigger>
                <TabsTrigger value="hired">
                  Hired (
                  {applications.filter((a) => normalizeStatus(a.status) === "HIRED").length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected (
                  {applications.filter((a) => normalizeStatus(a.status) === "REJECTED").length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {getFilteredApplications().map((application, index) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    index={index}
                    animateOnMount={shouldAnimateInitial}
                  />
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

      {/* Job Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl sm:rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
              {selectedApplication?.jobPosting?.title ||
                selectedApplication?.job?.title ||
                "Job Details"}
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              {selectedApplication?.jobPosting?.company?.name ||
                selectedApplication?.job?.company?.name ||
                selectedApplication?.companyName ||
                "Company"}
              {(selectedApplication?.jobPosting?.location ||
                selectedApplication?.job?.location) &&
                ` • ${
                  selectedApplication?.jobPosting?.location ||
                  selectedApplication?.job?.location
                }`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Application Status */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div
                className={cn(
                  "p-2 rounded-lg",
                  getStatusColor(selectedApplication?.status)
                )}
              >
                {getStatusIcon(selectedApplication?.status)}
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Application Status: {normalizeStatus(selectedApplication?.status)}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Applied on{" "}
                  {selectedApplication?.createdAt
                    ? new Date(
                        selectedApplication.createdAt
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Job Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>
                  {selectedApplication?.jobPosting?.location ||
                    selectedApplication?.job?.location ||
                    "Remote"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="w-4 h-4 text-purple-500" />
                <span>
                  {selectedApplication?.jobPosting?.type ||
                    selectedApplication?.job?.type ||
                    "Full-time"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Timer className="w-4 h-4 text-orange-500" />
                <span>
                  {selectedApplication?.jobPosting?.experienceLevel ||
                    selectedApplication?.job?.experienceLevel ||
                    "Entry"}{" "}
                  Level
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-green-500" />
                <span>
                  {selectedApplication?.jobPosting?.company?.name ||
                    selectedApplication?.job?.company?.name ||
                    selectedApplication?.companyName ||
                    "Company"}
                </span>
              </div>
            </div>

            {/* Job Description */}
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                Job Description
              </h4>
              <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                {selectedApplication?.jobPosting?.description ||
                  selectedApplication?.job?.description ||
                  "No job description available."}
              </div>
            </div>

            {/* Cover Letter */}
            {selectedApplication?.coverLetter && (
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Your Cover Letter
                </h4>
                <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  {selectedApplication.coverLetter}
                </div>
              </div>
            )}

            {/* Skills */}
            {(selectedApplication?.jobPosting?.skills ||
              selectedApplication?.job?.skills) && (
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Required Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(
                    selectedApplication?.jobPosting?.skills ||
                    selectedApplication?.job?.skills ||
                    []
                  ).map((skill, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="bg-slate-100 dark:bg-slate-800"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Salary Information */}
            {(selectedApplication?.jobPosting?.minSalary ||
              selectedApplication?.job?.minSalary) && (
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Salary Range
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  ₹
                  {(
                    selectedApplication?.jobPosting?.minSalary ||
                    selectedApplication?.job?.minSalary ||
                    0
                  ).toLocaleString()}{" "}
                  - ₹
                  {(
                    selectedApplication?.jobPosting?.maxSalary ||
                    selectedApplication?.job?.maxSalary ||
                    0
                  ).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Approval Process Modal */}
      <ApprovalProcessModal
        isOpen={isApprovalModalOpen}
        onClose={() => {
          setIsApprovalModalOpen(false);
          setApprovalApplication(null);
          // Refresh applications to reflect potential changes after process
          fetchApplications(true);
        }}
        application={approvalApplication}
      />
    </div>
  );
}
