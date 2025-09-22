import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Heart,
  MapPin,
  Building2,
  Briefcase,
  Clock,
  DollarSign,
  Calendar,
  Trash2,
  ExternalLink,
  BookmarkCheck,
  Filter,
  SortAsc,
  Star,
  TrendingUp,
  Users,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Zap,
  Target,
  Award,
  Timer,
  Globe,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { API_URL } from "@/config";
import { savedJobsAPI } from "../api/savedJobs";
import { useToast } from "@/hooks/use-toast";
import LoadingOverlay from "../components/LoadingOverlay";
import useDelayedTrue from "../hooks/useDelayedTrue";

export default function SavedJobsNew() {
  const { getAccessTokenSilently } = useAuth0();
  const { toast } = useToast();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterBy, setFilterBy] = useState("all");
  const [selectedJobs, setSelectedJobs] = useState(new Set());

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await savedJobsAPI.getSavedJobs(token, 1, 100);
      setSavedJobs(response.savedJobs || []);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch saved jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveJob = async (jobId) => {
    try {
      const token = await getAccessTokenSilently();
      await savedJobsAPI.removeSavedJob(token, jobId);
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
      toast({
        title: "Removed",
        description: "Job removed from saved list",
      });
    } catch (error) {
      console.error("Error removing job:", error);
      toast({
        title: "Error",
        description: "Failed to remove job",
        variant: "destructive",
      });
    }
  };

  const handleBulkRemove = async () => {
    if (selectedJobs.size === 0) return;
    
    try {
      const token = await getAccessTokenSilently();
      for (const jobId of selectedJobs) {
        await savedJobsAPI.removeSavedJob(token, jobId);
      }
      setSavedJobs(prev => prev.filter(job => !selectedJobs.has(job.id)));
      setSelectedJobs(new Set());
      toast({
        title: "Success",
        description: `Removed ${selectedJobs.size} jobs from saved list`,
      });
    } catch (error) {
      console.error("Error removing jobs:", error);
      toast({
        title: "Error",
        description: "Failed to remove selected jobs",
        variant: "destructive",
      });
    }
  };

  const toggleJobSelection = (jobId) => {
    setSelectedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const getFilteredAndSortedJobs = () => {
    let filtered = [...savedJobs];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        job =>
          job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filterBy !== "all") {
      filtered = filtered.filter(job => job.type === filterBy);
    }

    // Apply sorting
    switch (sortBy) {
      case "recent":
        filtered.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
        break;
      case "salary":
        filtered.sort((a, b) => (b.minSalary || 0) - (a.minSalary || 0));
        break;
      case "company":
        filtered.sort((a, b) => (a.company?.name || "").localeCompare(b.company?.name || ""));
        break;
      default:
        break;
    }

    return filtered;
  };

  const SavedJobCard = ({ job, index }) => {
    const isNew = new Date() - new Date(job.createdAt) < 7 * 24 * 60 * 60 * 1000;
    const isExpiringSoon = job.applicationDeadline && 
      new Date(job.applicationDeadline) - new Date() < 3 * 24 * 60 * 60 * 1000;
    const isSelected = selectedJobs.has(job.id);
    const daysSaved = Math.floor((new Date() - new Date(job.savedAt)) / (1000 * 60 * 60 * 24));

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileHover={{ y: -5 }}
      >
        <Card
          className={cn(
            "group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300",
            "bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm",
            isSelected && "ring-2 ring-blue-500"
          )}
        >
          {/* Selection checkbox */}
          <div className="absolute top-4 left-4 z-10">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleJobSelection(job.id)}
                className="w-5 h-5 rounded border-2 border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </motion.div>
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Badges */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            {isNew && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                <Badge className="bg-green-500 text-white border-0">
                  <Sparkles className="w-3 h-3 mr-1" />
                  New
                </Badge>
              </motion.div>
            )}
            {isExpiringSoon && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, delay: 0.1 }}
              >
                <Badge className="bg-red-500 text-white border-0">
                  <Timer className="w-3 h-3 mr-1" />
                  Expiring
                </Badge>
              </motion.div>
            )}
          </div>

          <CardHeader className="pb-3 pl-14">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                {/* Company Logo */}
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg"
                >
                  {job.company?.name?.[0] || "C"}
                </motion.div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {job.company?.name || "Company"}
                  </p>
                </div>
              </div>

              {/* Remove Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleRemoveJob(job.id)}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </motion.button>
            </div>
          </CardHeader>

          <CardContent className="pl-14">
            {/* Job Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <MapPin className="w-4 h-4 text-purple-500" />
                <span>{job.location || "Remote"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Briefcase className="w-4 h-4 text-blue-500" />
                <span>{job.type || "Full-time"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span>₹{(job.minSalary || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <BookmarkCheck className="w-4 h-4 text-orange-500" />
                <span>Saved {daysSaved}d ago</span>
              </div>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills?.slice(0, 4).map((skill, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs"
                >
                  {skill}
                </Badge>
              ))}
            </div>

            {/* Priority Indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i < 3 ? "text-yellow-500 fill-current" : "text-slate-300"
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-400">Priority</span>
              </div>
              {job.applicationDeadline && (
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 group"
              >
                Apply Now
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="icon">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const StatsCard = ({ icon: Icon, label, value, color }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{label}</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {value}
              </p>
            </div>
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", color)}>
              <Icon className="w-5 h-5 text-white" />
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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Saved Jobs
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Your curated collection of {savedJobs.length} job opportunities
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            icon={Heart}
            label="Total Saved"
            value={savedJobs.length}
            color="bg-gradient-to-br from-purple-500 to-pink-500"
          />
          <StatsCard
            icon={Sparkles}
            label="New This Week"
            value={savedJobs.filter(j => new Date() - new Date(j.savedAt) < 7 * 24 * 60 * 60 * 1000).length}
            color="bg-gradient-to-br from-blue-500 to-cyan-500"
          />
          <StatsCard
            icon={Timer}
            label="Apply Soon"
            value={savedJobs.filter(j => j.applicationDeadline && new Date(j.applicationDeadline) - new Date() < 7 * 24 * 60 * 60 * 1000).length}
            color="bg-gradient-to-br from-orange-500 to-red-500"
          />
          <StatsCard
            icon={Target}
            label="High Priority"
            value={Math.floor(savedJobs.length * 0.3)}
            color="bg-gradient-to-br from-green-500 to-emerald-500"
          />
        </div>

        {/* Actions Bar */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[250px] relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search saved jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SortAsc className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="salary">Highest Salary</SelectItem>
                  <SelectItem value="company">Company Name</SelectItem>
                </SelectContent>
              </Select>

              {/* Filter */}
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>

              {/* Bulk Actions */}
              {selectedJobs.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedJobs.size} selected
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkRemove}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Selected
                  </Button>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Jobs Grid */}
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getFilteredAndSortedJobs().map((job, index) => (
              <SavedJobCard key={job.id} job={job} index={index} />
            ))}
          </div>
        </AnimatePresence>

        {/* Empty State */}
        {savedJobs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="w-20 h-20 text-slate-400 mx-auto mb-6" />
            </motion.div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              No saved jobs yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Start saving jobs you're interested in to review them later
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              Browse Jobs
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
