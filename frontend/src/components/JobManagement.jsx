import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  IndianRupee,
  Calendar,
  Users,
  FileText,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/config";
import LoadingOverlay from "@/components/LoadingOverlay";

const JobManagement = () => {
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: [],
    location: "",
    jobType: "FULL_TIME",
    salaryRange: "",
    expiresAt: "",
  });
  const [newRequirement, setNewRequirement] = useState("");
  const [isDescOpen, setIsDescOpen] = useState(false);
  const [descJob, setDescJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/job-postings/my-jobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const jobsData = await response.json();
      setJobs(jobsData);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()],
      }));
      setNewRequirement("");
    }
  };

  const removeRequirement = (index) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      requirements: [],
      location: "",
      jobType: "FULL_TIME",
      salaryRange: "",
      expiresAt: "",
    });
    setNewRequirement("");
    setEditingJob(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.jobType) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate expiry date: must be strictly greater than today
    if (formData.expiresAt) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(formData.expiresAt + "T00:00:00");
      if (selected <= today) {
        toast.error("Application deadline must be a future date (after today)");
        return;
      }
    }

    try {
      if (editingJob) {
        // Update existing job on server
        const token = await getAccessTokenSilently();
        const url = `${API_URL}/job-postings/${editingJob.id}`;
        const response = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to save job");
        }

        await fetchJobs();
        resetForm();
        toast.success("Job updated successfully!");
      } else {
        // Create flow: do NOT post job yet. Go to payment first.
        toast.message("Proceed to payment to publish your job.");
        setShowAddForm(false);
        navigate("/job-posting-payment", {
          state: {
            jobData: { ...formData },
          },
        });
      }
    } catch (error) {
      console.error("Error saving job:", error);
      toast.error(error.message);
    }
  };

  const handleEdit = (job) => {
    setFormData({
      title: job.title,
      description: job.description,
      requirements: job.requirements || [],
      location: job.location || "",
      jobType: job.jobType,
      salaryRange: job.salaryRange || "",
      expiresAt: job.expiresAt ? job.expiresAt.split("T")[0] : "",
    });
    setEditingJob(job);
    setShowAddForm(true);
  };

  const handleDelete = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job posting?")) {
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/job-postings/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete job");
      }

      await fetchJobs();
      toast.success("Job deleted successfully!");
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error(error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No expiry";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-500";
      case "DRAFT":
        return "bg-yellow-500";
      case "CLOSED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return <LoadingOverlay message="Loading Job Management" />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#EAF6F9] dark:bg-[#0B1F3B] flex items-center justify-center p-6 transition-colors duration-500">
        <Card className="w-full max-w-md bg-stone-100/95 dark:bg-stone-900/60 backdrop-blur-sm border-stone-400/70 dark:border-stone-800/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400 tracking-tight">
              Error Loading Jobs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-stone-600 dark:text-stone-300 font-medium">
              {error}
            </p>
            <Button
              onClick={fetchJobs}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAF6F9] dark:bg-[#0B1F3B] pt-8 pb-10 px-6 transition-colors duration-500">
      <div className="container mx-auto max-w-7xl space-y-8">
        {/* Enhanced Header Section */}
        <div className="relative">
          <div className="hidden"></div>
          <Card className="relative bg-white dark:bg-stone-900 shadow-lg border border-[#77BEE0]/40 dark:border-[#155AA4]/40 rounded-2xl">
            <CardContent className="p-8">
              <div className="flex flex-col items-start lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                    Job Management
                  </h1>
                  <p className="text-stone-700 dark:text-stone-400 text-lg font-medium">
                    Create, manage, and track your job postings to find the
                    perfect candidates
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#EAF6F9] border border-[#77BEE0]/40 dark:bg-stone-900/40 dark:border-[#155AA4]/40 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-stone-800 dark:text-stone-300">
                          {jobs.length}
                        </span>
                      </div>
                      <span className="text-sm text-stone-700 dark:text-stone-400 font-medium">
                        Active Jobs
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#EAF6F9] border border-[#77BEE0]/40 dark:bg-stone-900/40 dark:border-[#155AA4]/40 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-stone-800 dark:text-stone-300">
                          {jobs.reduce(
                            (acc, job) => acc + (job._count?.Applications || 0),
                            0
                          )}
                        </span>
                      </div>
                      <span className="text-sm text-stone-700 dark:text-stone-400 font-medium">
                        Total Applications
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#0574EE] hover:bg-[#155AA4] text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl h-12 w-full sm:w-auto">
                        <Plus className="h-5 w-5 mr-2" />
                        Create New Job
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[calc(100vw-2rem)] sm:w-auto max-w-4xl max-h-[95vh] overflow-y-auto bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-lg rounded-lg">
                      <DialogHeader className="space-y-3 pb-6 border-b border-stone-200 dark:border-stone-700">
                        <DialogTitle className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
                          {editingJob ? "Edit Job Posting" : "Create New Job Posting"}
                        </DialogTitle>
                        <DialogDescription className="text-stone-600 dark:text-stone-400">
                          Fill in the details below to {editingJob ? "update your" : "create a new"} job posting
                        </DialogDescription>
                      </DialogHeader>

                      <form onSubmit={handleSubmit} className="space-y-8 pt-6">
                        {/* Basic Information Section */}
                        <div className="space-y-6">
                      
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label
                                htmlFor="title"
                                className="text-sm font-medium text-stone-700 dark:text-stone-300"
                              >
                                Job Title <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g. Senior React Developer"
                                className="h-11 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md text-sm placeholder:text-stone-400 placeholder:font-normal"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="jobType"
                                className="text-sm font-medium text-stone-700 dark:text-stone-300"
                              >
                                Job Type <span className="text-red-500">*</span>
                              </Label>
                              <Select
                                value={formData.jobType}
                                onValueChange={(value) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    jobType: value,
                                  }))
                                }
                              >
                                <SelectTrigger className="h-11 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 focus:border-blue-500 rounded-md text-sm w-full">
                                  <SelectValue placeholder="Select employment type" />
                                </SelectTrigger>
                                <SelectContent className="rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900">
                                  <SelectItem value="FULL_TIME" className="cursor-pointer">
                                    Full Time
                                  </SelectItem>
                                  <SelectItem value="PART_TIME" className="cursor-pointer">
                                    Part Time
                                  </SelectItem>
                                  <SelectItem value="CONTRACT" className="cursor-pointer">
                                    Contract
                                  </SelectItem>
                                  <SelectItem value="INTERNSHIP" className="cursor-pointer">
                                    Internship
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        {/* Location & Compensation Section */}
                        <div className="space-y-6">
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label
                                htmlFor="location"
                                className="text-sm font-medium text-stone-700 dark:text-stone-300"
                              >
                                Work Location
                              </Label>
                              <Input
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                placeholder="e.g. Ahmedabad, Gujarat or Remote"
                                className="h-11 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md text-sm placeholder:text-stone-400 placeholder:font-normal"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="salaryRange"
                                className="text-sm font-medium text-stone-700 dark:text-stone-300"
                              >
                                Monthly Salary (INR)
                              </Label>
                              <Input
                                id="salaryRange"
                                name="salaryRange"
                                type="number"
                                inputMode="numeric"
                                min={0}
                                step={1}
                                value={formData.salaryRange}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  // Allow only digits (empty allowed to clear)
                                  if (val === "" || /^\d+$/.test(val)) {
                                    handleInputChange(e);
                                  }
                                }}
                                placeholder="25000"
                                className="h-11 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md text-sm placeholder:text-stone-400 placeholder:font-normal"
                              />
                              <p className="text-xs text-stone-500 dark:text-stone-400">
                                Enter monthly salary amount in INR (numbers only)
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Job Description Section */}
                        <div className="space-y-6">
                          
                          <div className="space-y-2">
                            <Label
                              htmlFor="description"
                              className="text-sm font-medium text-stone-700 dark:text-stone-300"
                            >
                              Job Description <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                              id="description"
                              name="description"
                              value={formData.description}
                              onChange={handleInputChange}
                              placeholder="Describe the role, responsibilities, team culture, and growth opportunities..."
                              className="min-h-[120px] bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md text-sm placeholder:text-stone-400 placeholder:font-normal resize-none"
                              required
                            />
                            <div className="text-xs text-stone-500 dark:text-stone-400 flex justify-between">
                              <span>
                                {formData.description.length} characters
                              </span>
                              <span>Minimum 50 characters recommended</span>
                            </div>
                          </div>
                        </div>

                        {/* Requirements Section */}
                        <div className="space-y-6">
                         
                          <div className="space-y-4">
                            <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                              Add Requirements
                            </Label>
                            <div className="flex gap-2">
                              <div className="flex-1 relative">
                                <Input
                                  value={newRequirement}
                                  onChange={(e) =>
                                    setNewRequirement(e.target.value)
                                  }
                                  placeholder="e.g. 3+ years React experience, Bachelor's degree"
                                  className="h-11 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-20 rounded-md text-sm placeholder:text-stone-400 placeholder:font-normal"
                                  onKeyPress={(e) =>
                                    e.key === "Enter" &&
                                    (e.preventDefault(), addRequirement())
                                  }
                                />
                                <Button
                                  type="button"
                                  onClick={addRequirement}
                                  className="absolute right-1 top-1 h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
                                  disabled={!newRequirement.trim()}
                                >
                                  Add
                                </Button>
                              </div>
                            </div>
                            {formData.requirements.length > 0 && (
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                  Added Requirements:
                                </Label>
                                <div className="flex flex-wrap gap-2 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-md border border-stone-200 dark:border-stone-700">
                                  {formData.requirements.map((req, index) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="flex items-center gap-2 px-2 py-1 rounded-md bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-600 text-sm"
                                    >
                                      <span>{req}</span>
                                      <button
                                        type="button"
                                        onClick={() => removeRequirement(index)}
                                        className="text-red-500 hover:text-red-700 ml-1"
                                      >
                                        ×
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Additional Details Section */}
                        <div className="space-y-6">
                          
                          <div className="space-y-2">
                            <Label
                              htmlFor="expiresAt"
                              className="text-sm font-medium text-stone-700 dark:text-stone-300"
                            >
                              Application Deadline (Optional)
                            </Label>
                            <Input
                              type="date"
                              id="expiresAt"
                              name="expiresAt"
                              value={formData.expiresAt}
                              onChange={handleInputChange}
                              className="h-11 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md text-sm max-w-xs"
                              min={(() => {
                                const d = new Date();
                                d.setDate(d.getDate() + 1);
                                return d.toISOString().split("T")[0];
                              })()}
                            />
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                              Leave empty if you don't want to set a deadline
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-stone-200 dark:border-stone-700">
                          <div className="text-sm text-stone-500 dark:text-stone-400">
                            <span className="text-red-500">*</span> Required fields
                          </div>
                          <div className="flex gap-3 w-full sm:w-auto">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={resetForm}
                              className="px-6 py-2 h-11 w-full sm:w-auto border-stone-300 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              className="px-8 py-2 h-11 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {editingJob ? (
                                <>
                                  <Edit2 className="h-4 w-4 mr-2" />
                                  Update Job Posting
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Create Job Posting
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {jobs.length === 0 ? (
            <Card className="shadow-lg border border-[#77BEE0]/40 dark:border-[#155AA4]/40 bg-white dark:bg-stone-900">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-[#EAF6F9] border border-[#77BEE0]/40 dark:bg-stone-900/40 dark:border-[#155AA4]/40 rounded-full flex items-center justify-center mx-auto">
                    <Plus className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                    No job postings yet
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 max-w-md">
                    Create your first job posting to start attracting
                    candidates.
                  </p>
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="bg-[#0574EE] hover:bg-[#155AA4]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Job
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {jobs.map((job) => (
                <Card
                  key={job.id}
                  className="shadow-lg border border-[#77BEE0]/40 dark:border-[#155AA4]/40 bg-white dark:bg-stone-900 hover:shadow-xl transition-shadow overflow-hidden h-full flex flex-col min-h-[200px]"
                >
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="line-clamp-2 text-slate-800 dark:text-slate-100">
                          {job.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="capitalize bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                          >
                            {job.jobType.replace("_", " ")}
                          </Badge>
                          <Badge
                            className={`${getStatusColor(
                              job.status
                            )} text-white border-0`}
                          >
                            {job.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(job)}
                          className="border-green-200 dark:border-green-900/40 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(job.id)}
                          className="border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 flex-1 flex flex-col">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {job.location && (
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                          <MapPin className="h-3 w-3" />
                          <span>{job.location}</span>
                        </div>
                      )}
                      {job.salaryRange && (
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                          <IndianRupee className="h-3 w-3" />
                          <span>{job.salaryRange}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <Users className="h-3 w-3" />
                        <span>
                          Applications: {job._count?.Applications || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <Calendar className="h-3 w-3" />
                        <span>Expires: {formatDate(job.expiresAt)}</span>
                      </div>
                    </div>

                    <Separator className="bg-slate-200 dark:bg-slate-700" />

                    <div className="mt-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Created: {formatDate(job.createdAt)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#77BEE0] dark:border-[#155AA4] hover:bg-[#77BEE0]/20 dark:hover:bg-stone-800 text-[#155AA4] dark:text-stone-300"
                        onClick={() => {
                          setDescJob(job);
                          setIsDescOpen(true);
                        }}
                      >
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* View Description Dialog (only description shown) */}
        <Dialog open={isDescOpen} onOpenChange={setIsDescOpen}>
          <DialogContent className="max-w-2xl bg-white dark:bg-stone-900 border border-[#77BEE0]/40 dark:border-[#155AA4]/40 shadow-2xl sm:rounded-xl">
            <div className="text-sm text-stone-800 dark:text-stone-300 whitespace-pre-wrap leading-relaxed">
              {descJob?.description}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default JobManagement;
