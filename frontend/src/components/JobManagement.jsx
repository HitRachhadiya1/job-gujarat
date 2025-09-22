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
import { Loader2, Plus, Edit2, Trash2, MapPin, IndianRupee, Calendar, Users, FileText, Tag } from "lucide-react";
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
      today.setHours(0,0,0,0);
      const selected = new Date(formData.expiresAt + 'T00:00:00');
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
      expiresAt: job.expiresAt ? job.expiresAt.split('T')[0] : "",
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
            <CardTitle className="text-red-600 dark:text-red-400 tracking-tight">Error Loading Jobs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-stone-600 dark:text-stone-300 font-medium">{error}</p>
            <Button onClick={fetchJobs} className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl">
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
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                    Job Management
                  </h1>
                  <p className="text-stone-700 dark:text-stone-400 text-lg font-medium">
                    Create, manage, and track your job postings to find the perfect candidates
                  </p>
                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#EAF6F9] border border-[#77BEE0]/40 dark:bg-stone-900/40 dark:border-[#155AA4]/40 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-stone-800 dark:text-stone-300">{jobs.length}</span>
                      </div>
                      <span className="text-sm text-stone-700 dark:text-stone-400 font-medium">Active Jobs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#EAF6F9] border border-[#77BEE0]/40 dark:bg-stone-900/40 dark:border-[#155AA4]/40 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-stone-800 dark:text-stone-300">
                          {jobs.reduce((acc, job) => acc + (job._count?.Applications || 0), 0)}
                        </span>
                      </div>
                      <span className="text-sm text-stone-700 dark:text-stone-400 font-medium">Total Applications</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#0574EE] hover:bg-[#155AA4] text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl h-12">
                        <Plus className="h-5 w-5 mr-2" />
                        Create New Job
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
              <DialogHeader className="text-center space-y-4 pb-8 border-b border-stone-200/50 dark:border-stone-700/30">
                <div className="relative mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#155AA4]/20 to-[#0574EE]/20 rounded-3xl blur-xl opacity-60" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-[#155AA4] to-[#0574EE] rounded-3xl flex items-center justify-center shadow-2xl">
                    {editingJob ? (
                      <Edit2 className="h-10 w-10 text-white" />
                    ) : (
                      <Plus className="h-10 w-10 text-white" />
                    )}
                  </div>
                </div>
                <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-stone-900 via-stone-800 to-stone-700 dark:from-white dark:via-stone-100 dark:to-stone-200 bg-clip-text text-transparent leading-tight">
                  {editingJob ? "Edit Job Posting" : "Create New Job Posting"}
                </DialogTitle>
                <DialogDescription className="text-stone-600 dark:text-stone-400 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
                  {editingJob ? "Update your job posting details to attract the right candidates and grow your team" : "Fill in the details below to create an attractive job posting that stands out to top talent"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-10 pt-8">
                {/* Basic Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#155AA4] to-[#0574EE] rounded-2xl flex items-center justify-center shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Basic Information</h3>
                      <p className="text-sm text-stone-600 dark:text-stone-400 font-medium">Essential details about the position</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Label htmlFor="title" className="text-stone-700 dark:text-stone-200 font-semibold text-base flex items-center gap-2">
                        Job Title *
                        <span className="text-xs text-stone-500 dark:text-stone-400 font-normal">(Be specific and descriptive)</span>
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g. Senior React Developer"
                        className="h-14 bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-700 focus:border-[#0574EE] focus:ring-0 rounded-xl text-base font-medium shadow-sm transition-all duration-200"
                        required
                      />
                    </div>

                    <div className="space-y-4">
                      <Label htmlFor="jobType" className="text-stone-700 dark:text-stone-200 font-semibold text-base">Job Type *</Label>
                      <Select
                        value={formData.jobType}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, jobType: value }))}
                      >
                        <SelectTrigger className="h-14 bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-700 focus:border-[#0574EE] rounded-xl text-base font-medium shadow-sm">
                          <SelectValue placeholder="Select employment type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-2 border-stone-200 dark:border-stone-700 shadow-xl">
                          <SelectItem value="FULL_TIME" className="cursor-pointer py-3 px-4 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></div>
                              <span className="font-medium">Full Time</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="PART_TIME" className="cursor-pointer py-3 px-4 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                              <span className="font-medium">Part Time</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="CONTRACT" className="cursor-pointer py-3 px-4 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 bg-orange-500 rounded-full shadow-sm"></div>
                              <span className="font-medium">Contract</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="INTERNSHIP" className="cursor-pointer py-3 px-4 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 bg-purple-500 rounded-full shadow-sm"></div>
                              <span className="font-medium">Internship</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Location & Compensation Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Location & Compensation</h3>
                      <p className="text-sm text-stone-600 dark:text-stone-400 font-medium">Where and how much you'll pay</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Label htmlFor="location" className="text-stone-700 dark:text-stone-200 font-semibold text-base flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Work Location
                      </Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g. Ahmedabad, Gujarat or Remote"
                        className="h-14 bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-700 focus:border-[#0574EE] focus:ring-0 rounded-xl text-base font-medium shadow-sm transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label htmlFor="salaryRange" className="text-stone-700 dark:text-stone-200 font-semibold text-base flex items-center gap-2">
                        <IndianRupee className="h-4 w-4" />
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
                          if (val === '' || /^\d+$/.test(val)) {
                            handleInputChange(e);
                          }
                        }}
                        placeholder="e.g. 25000"
                        className="h-14 bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-700 focus:border-[#0574EE] focus:ring-0 rounded-xl text-base font-medium shadow-sm transition-all duration-200"
                      />
                      <div className="text-sm text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-800/50 p-3 rounded-lg">
                        💡 Enter monthly salary amount in INR (numbers only). Do not enter annual package.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job Description Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Job Description</h3>
                      <p className="text-sm text-stone-600 dark:text-stone-400 font-medium">Outline responsibilities, culture, and growth</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-stone-700 dark:text-stone-200 font-semibold text-base">
                      Detailed Description *
                      <span className="text-xs text-stone-500 font-normal ml-2">
                        (Include role responsibilities, team culture, growth opportunities)
                      </span>
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="h-40 bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-700 focus:border-[#0574EE] focus:ring-0 rounded-xl text-base shadow-sm resize-none"
                      required
                    />
                    <div className="text-xs text-stone-600 dark:text-stone-400 flex justify-between">
                      <span>{formData.description.length} characters</span>
                      <span>Minimum 50 characters recommended</span>
                    </div>
                  </div>
                </div>

                {/* Requirements Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Tag className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Requirements & Skills</h3>
                      <p className="text-sm text-stone-600 dark:text-stone-400 font-medium">List key qualifications and desired skills</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-slate-700 dark:text-slate-200 font-medium">
                      Add Requirements
                      <span className="text-xs text-slate-500 font-normal ml-2">
                        (Skills, experience, education, etc.)
                      </span>
                    </Label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Input
                          value={newRequirement}
                          onChange={(e) => setNewRequirement(e.target.value)}
                          placeholder="e.g. 3+ years React experience, Bachelor's degree, etc."
                          className="h-12 bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-700 focus:border-[#0574EE] focus:ring-0 pr-24 rounded-xl"
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                        />
                        <Button 
                          type="button" 
                          onClick={addRequirement} 
                          className="absolute right-1 top-1 h-10 px-4 bg-[#0574EE] hover:bg-[#155AA4] rounded-lg"
                          disabled={!newRequirement.trim()}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                    {formData.requirements.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm text-stone-700 dark:text-stone-300 font-semibold">Added Requirements:</Label>
                        <div className="flex flex-wrap gap-2 p-4 bg-white dark:bg-stone-900 rounded-xl border-2 border-stone-200 dark:border-stone-700 shadow-sm">
                          {formData.requirements.map((req, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-0 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                            >
                              <span>{req}</span>
                              <button
                                type="button"
                                onClick={() => removeRequirement(index)}
                                className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
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
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Additional Details</h3>
                      <p className="text-sm text-stone-600 dark:text-stone-400 font-medium">Optional settings to refine your posting</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="expiresAt" className="text-stone-700 dark:text-stone-200 font-semibold text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Application Deadline
                      <span className="text-xs text-stone-500 font-normal">(Optional)</span>
                    </Label>
                    <Input
                      type="date"
                      id="expiresAt"
                      name="expiresAt"
                      value={formData.expiresAt}
                      onChange={handleInputChange}
                      className="h-14 bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-700 focus:border-[#0574EE] focus:ring-0 rounded-xl text-base shadow-sm max-w-xs"
                      min={(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })()}
                    />
                    <div className="text-sm text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-800/50 p-3 rounded-lg">
                      Leave empty if you don't want to set an application deadline
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="text-red-500">*</span> Required fields
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetForm}
                      className="px-6 py-2 h-11 border-[#77BEE0] dark:border-[#155AA4] hover:bg-[#77BEE0]/20 dark:hover:bg-stone-800/60 text-[#155AA4] dark:text-stone-300"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="px-8 py-2 h-11 bg-[#0574EE] hover:bg-[#155AA4] shadow-lg hover:shadow-xl transition-all duration-200"
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
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">No job postings yet</h3>
                  <p className="text-slate-600 dark:text-slate-300 max-w-md">
                    Create your first job posting to start attracting candidates.
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
                <Card key={job.id} className="shadow-lg border border-[#77BEE0]/40 dark:border-[#155AA4]/40 bg-white dark:bg-stone-900 hover:shadow-xl transition-shadow overflow-hidden h-full flex flex-col min-h-[200px]">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="line-clamp-2 text-slate-800 dark:text-slate-100">{job.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="capitalize bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                          >
                            {job.jobType.replace('_', ' ')}
                          </Badge>
                          <Badge
                            className={`${getStatusColor(job.status)} text-white border-0`}
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
                        <span>Applications: {job._count?.Applications || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <Calendar className="h-3 w-3" />
                        <span>Expires: {formatDate(job.expiresAt)}</span>
                      </div>
                    </div>
                    
                    <Separator className="bg-slate-200 dark:bg-slate-700" />

                    <div className="mt-auto flex items-center justify-between">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Created: {formatDate(job.createdAt)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#77BEE0] dark:border-[#155AA4] hover:bg-[#77BEE0]/20 dark:hover:bg-stone-800 text-[#155AA4] dark:text-stone-300"
                        onClick={() => { setDescJob(job); setIsDescOpen(true); }}
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
