import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Search,
  MapPin,
  Building2,
  Briefcase,
  Clock,
  IndianRupee,
  Calendar,
  Bookmark,
  Filter,
  X,
  TrendingUp,
  Users,
  Star,
  BookmarkPlus,
  ChevronRight,
  Sparkles,
  Target,
  Award,
  ArrowUpRight,
  Globe,
  Timer,
  Zap,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_URL } from "@/config";
import { savedJobsAPI } from "../api/savedJobs";
import JobApplicationModal from "../components/JobApplicationModal";
import { useToast } from "@/hooks/use-toast";
import LoadingOverlay from "../components/LoadingOverlay";
import useDelayedTrue from "../hooks/useDelayedTrue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function BrowseJobsNew() {
  const { getAccessTokenSilently } = useAuth0();
  const { toast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("all");
  const [experienceLevel, setExperienceLevel] = useState("all");
  const [salaryRange, setSalaryRange] = useState([0, 200000]);
  // Remove filteredJobs state, we'll use useMemo instead
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [descriptionJob, setDescriptionJob] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [savingJobs, setSavingJobs] = useState(new Set());

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    const endOfDay = new Date(expiresAt);
    endOfDay.setHours(23, 59, 59, 999);
    return new Date() > endOfDay;
  };

  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
  }, []);

  // Memoized filtered jobs to prevent unnecessary re-renders
  const filteredJobs = useMemo(() => {
    let filtered = [...jobs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Location filter
    if (location) {
      filtered = filtered.filter((job) =>
        job.location?.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Job type filter
    if (jobType !== "all") {
      filtered = filtered.filter((job) => job.type === jobType);
    }

    // Experience level filter
    if (experienceLevel !== "all") {
      filtered = filtered.filter(
        (job) => job.experienceLevel === experienceLevel
      );
    }

    // Salary range filter
    filtered = filtered.filter((job) => {
      const minSalary = job.minSalary || 0;
      const maxSalary = job.maxSalary || 999999999;
      return minSalary >= salaryRange[0] && minSalary <= salaryRange[1];
    });

    return filtered;
  }, [jobs, searchTerm, location, jobType, experienceLevel, salaryRange]);

  const fetchJobs = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/job-postings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setJobs(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await savedJobsAPI.getSavedJobs(token);
      const savedJobIds = new Set(
        response.savedJobs.map((savedJob) => savedJob.job.id)
      );
      setSavedJobs(savedJobIds);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    }
  };

  // Removed filterJobs function - now using useMemo above

  const handleSaveJob = useCallback(async (jobId) => {
    try {
      setSavingJobs((prev) => new Set([...prev, jobId]));
      const token = await getAccessTokenSilently();

      if (savedJobs.has(jobId)) {
        // Unsave the job
        await savedJobsAPI.unsaveJob(jobId, token);
        setSavedJobs((prev) => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
        toast({
          title: "Removed",
          description: "Job removed from saved list",
        });
      } else {
        // Save the job
        await savedJobsAPI.saveJob(jobId, token);
        setSavedJobs((prev) => new Set([...prev, jobId]));
        toast({
          title: "Saved",
          description: "Job saved to your collection",
        });
      }
    } catch (error) {
      console.error("Error saving/unsaving job:", error);
      toast({
        title: "Error",
        description: "Failed to save job",
        variant: "destructive",
      });
    } finally {
      setSavingJobs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  }, [savedJobs, getAccessTokenSilently, toast]);

  const handleApplicationSubmitted = (application) => {
    const jobTitle =
      application?.job?.title ||
      application?.title ||
      selectedJob?.title ||
      "this job";
    toast({
      title: "Success",
      description: `Application submitted successfully for "${jobTitle}"!`,
    });
  };

  const JobCard = memo(({ job, index }) => {
    const isNew =
      new Date() - new Date(job.createdAt) < 7 * 24 * 60 * 60 * 1000;
    const isSaved = savedJobs.has(job.id);
    const isHot = Math.random() > 0.7; // Simulate hot jobs
    const expired = isExpired(job.expiresAt);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
      >
        <Card
          className={cn(
            "group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300",
            "bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm",
            selectedJob?.id === job.id && "ring-2 ring-blue-500"
          )}
        >
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                {/* Company Logo */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {job.company?.name?.[0] || "C"}
                </div>

                {/* Job Title and Company */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {job.company?.name || "Company"}
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveJob(job.id);
                }}
                disabled={savingJobs.has(job.id)}
                className={cn(
                  "p-2 rounded-lg transition-colors cursor-pointer relative z-10",
                  savingJobs.has(job.id) && "cursor-not-allowed opacity-50",
                  isSaved
                    ? "bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                )}
              >
                <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
              </motion.button>
            </div>
            {/* Status badges */}
            <div className="mt-2 flex items-center gap-2">
              {expired && (
                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-0">
                  Closed
                </Badge>
              )}
              {job.expiresAt && !expired && (
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-0 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Ends {new Date(job.expiresAt).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {/* Job Details */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>{job.location || "Remote"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Briefcase className="w-4 h-4 text-purple-500" />
                <span>{job.type || "Full-time"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <IndianRupee className="w-4 h-4 text-green-500" />
                <span>
                  {job.minSalary && job.maxSalary
                    ? `₹${job.minSalary.toLocaleString()} - ₹${job.maxSalary.toLocaleString()}`
                    : job.minSalary
                    ? `₹${job.minSalary.toLocaleString()}+`
                    : job.maxSalary
                    ? `Up to ₹${job.maxSalary.toLocaleString()}`
                    : "Salary not specified"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>{job.experienceLevel || "Entry"} Level</span>
              </div>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills?.slice(0, 3).map((skill, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="bg-slate-100 dark:bg-slate-800 text-xs"
                >
                  {skill}
                </Badge>
              ))}
              {job.skills?.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{job.skills.length - 3} more
                </Badge>
              )}
            </div>

            {/* Apply Button */}
            {/* <Button
              className={cn("w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 group", expired && "opacity-60 cursor-not-allowed")}
              onClick={() => { if (!expired) { setSelectedJob(job); setIsApplicationModalOpen(true); } }}
              disabled={expired}
            >
              {expired ? "Applications Closed" : "Apply Now"}
              {!expired && <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
            </Button> */}
            {/* Action Buttons */}
            <div className="flex gap-2 relative z-10">
              <Button
                type="button"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 group cursor-pointer relative z-10"
                onClick={() => {
                  setSelectedJob(job);
                  setIsApplicationModalOpen(true);
                }}
              >
                Apply Now
                <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="px-3 cursor-pointer relative z-10"
                onClick={() => {
                  setDescriptionJob(job);
                  setIsDescriptionOpen(true);
                }}
              >
                <FileText className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  });

  if (loading) {
    return <LoadingOverlay message="Loading jobs..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 relative">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8 lg:mb-10"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Find Your Dream Job
            </span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400">
            Discover {filteredJobs.length} amazing opportunities waiting for you
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 sm:mb-8"
        >
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6">
              {/* Main Search Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Search job title, company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  variant={showFilters ? "default" : "outline"}
                  className="w-full"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showFilters ? "Hide Filters" : "More Filters"}
                </Button>
              </div>

              {/* Advanced Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t"
                  >
                    <div className="space-y-2">
                      <Label>Job Type</Label>
                      <Select value={jobType} onValueChange={setJobType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Experience Level</Label>
                      <Select
                        value={experienceLevel}
                        onValueChange={setExperienceLevel}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="entry">Entry Level</SelectItem>
                          <SelectItem value="mid">Mid Level</SelectItem>
                          <SelectItem value="senior">Senior Level</SelectItem>
                          <SelectItem value="lead">Lead/Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Salary Range (₹)</Label>
                      <div className="px-2">
                        <Slider
                          value={salaryRange}
                          onValueChange={setSalaryRange}
                          max={300000}
                          step={10000}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-slate-600 mt-1">
                          <span>₹{salaryRange[0].toLocaleString()}</span>
                          <span>₹{salaryRange[1].toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Bar */}
        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              icon: Briefcase,
              label: "Active Jobs",
              value: filteredJobs.length,
              color: "blue",
            },
            {
              icon: Building2,
              label: "Companies",
              value: new Set(filteredJobs.map((j) => j.company?.name)).size,
              color: "purple",
            },
            {
              icon: TrendingUp,
              label: "New Today",
              value: filteredJobs.filter(
                (j) => new Date() - new Date(j.createdAt) < 24 * 60 * 60 * 1000
              ).length,
              color: "green",
            },
            // { icon: Users, label: "Applications", value: "2.5k+", color: "orange" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        stat.color === "blue" &&
                          "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
                        stat.color === "purple" &&
                          "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
                        stat.color === "green" &&
                          "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
                        stat.color === "orange" &&
                          "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                      )}
                    >
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div> */}

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredJobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-16"
            >
              <Briefcase className="w-20 h-20 text-slate-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                No jobs found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Try adjusting your filters or search criteria
              </p>
              <Button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setLocation("");
                  setJobType("all");
                  setExperienceLevel("all");
                  setSalaryRange([0, 300000]);
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              >
                Clear Filters
              </Button>
            </motion.div>
          ) : (
            filteredJobs.map((job, index) => (
              <JobCard key={job.id} job={job} index={index} />
            ))
          )}
        </div>
      </div>

      {/* Job Application Modal */}
      {selectedJob && (
        <JobApplicationModal
          job={selectedJob}
          isOpen={isApplicationModalOpen}
          onClose={() => setIsApplicationModalOpen(false)}
          onApplicationSubmitted={handleApplicationSubmitted}
        />
      )}

      {/* Description Modal */}
      <Dialog open={isDescriptionOpen} onOpenChange={setIsDescriptionOpen}>
        <DialogContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl sm:rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
              {descriptionJob?.title || "Job Description"}
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              {descriptionJob?.company?.name || "Company"}
              {descriptionJob?.location ? ` • ${descriptionJob.location}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
            {descriptionJob?.description || "No description available."}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
