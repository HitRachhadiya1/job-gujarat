import React, { useState, useEffect } from "react";
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
import { Loader2, Plus, Edit2, Trash2, MapPin, DollarSign, Calendar, Users } from "lucide-react";
import { toast } from "sonner";

const JobManagement = () => {
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

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const response = await fetch("http://localhost:5000/api/job-postings/my-jobs", {
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

    try {
      const token = await getAccessTokenSilently();
      const url = editingJob
        ? `http://localhost:5000/api/job-postings/${editingJob.id}`
        : "http://localhost:5000/api/job-postings";

      const method = editingJob ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
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
      toast.success(editingJob ? "Job updated successfully!" : "Job created successfully!");
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
      const response = await fetch(`http://localhost:5000/api/job-postings/${jobId}`, {
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-gray-600">Loading job postings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Jobs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{error}</p>
            <Button onClick={fetchJobs} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="container mx-auto max-w-7xl space-y-8">
        {/* Enhanced Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl"></div>
          <Card className="relative border-0 bg-white/80 backdrop-blur-sm shadow-xl">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent">
                    Job Management
                  </h1>
                  <p className="text-slate-600 text-lg">
                    Create, manage, and track your job postings to find the perfect candidates
                  </p>
                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{jobs.length}</span>
                      </div>
                      <span className="text-sm text-slate-600">Active Jobs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-green-600">
                          {jobs.reduce((acc, job) => acc + (job._count?.Applications || 0), 0)}
                        </span>
                      </div>
                      <span className="text-sm text-slate-600">Total Applications</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 h-12 px-6">
                        <Plus className="h-5 w-5 mr-2" />
                        Create New Job
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-white to-blue-50/30">
              <DialogHeader className="text-center space-y-3 pb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  {editingJob ? (
                    <Edit2 className="h-8 w-8 text-white" />
                  ) : (
                    <Plus className="h-8 w-8 text-white" />
                  )}
                </div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  {editingJob ? "Edit Job Posting" : "Create New Job Posting"}
                </DialogTitle>
                <DialogDescription className="text-slate-600 text-base">
                  {editingJob ? "Update your job posting details to attract the right candidates" : "Fill in the details below to create an attractive job posting"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-slate-800">Basic Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="title" className="text-slate-700 font-medium flex items-center gap-2">
                        Job Title *
                        <span className="text-xs text-slate-500">(Be specific and descriptive)</span>
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g. Senior React Developer"
                        className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="jobType" className="text-slate-700 font-medium">Job Type *</Label>
                      <Select
                        value={formData.jobType}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, jobType: value }))}
                      >
                        <SelectTrigger className="h-12 border-slate-300 focus:border-blue-500 bg-white/80">
                          <SelectValue placeholder="Select employment type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FULL_TIME" className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Full Time
                            </div>
                          </SelectItem>
                          <SelectItem value="PART_TIME" className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              Part Time
                            </div>
                          </SelectItem>
                          <SelectItem value="CONTRACT" className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              Contract
                            </div>
                          </SelectItem>
                          <SelectItem value="INTERNSHIP" className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              Internship
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Location & Compensation Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-slate-800">Location & Compensation</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="location" className="text-slate-700 font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Work Location
                      </Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g. Ahmedabad, Gujarat or Remote"
                        className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="salaryRange" className="text-slate-700 font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Salary Range
                      </Label>
                      <Input
                        id="salaryRange"
                        name="salaryRange"
                        value={formData.salaryRange}
                        onChange={handleInputChange}
                        placeholder="e.g. ₹5,00,000 - ₹8,00,000 per year"
                        className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80"
                      />
                    </div>
                  </div>
                </div>

                {/* Job Description Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-slate-800">Job Description</h3>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-slate-700 font-medium">
                      Detailed Description *
                      <span className="text-xs text-slate-500 font-normal ml-2">
                        (Include role responsibilities, team culture, growth opportunities)
                      </span>
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="We are looking for a passionate developer to join our growing team...\n\nKey Responsibilities:\n• Develop and maintain web applications\n• Collaborate with cross-functional teams\n• Write clean, maintainable code\n\nWhat we offer:\n• Competitive salary and benefits\n• Flexible working hours\n• Professional development opportunities"
                      rows={8}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80 resize-none"
                      required
                    />
                    <div className="text-xs text-slate-500 flex justify-between">
                      <span>{formData.description.length} characters</span>
                      <span>Minimum 50 characters recommended</span>
                    </div>
                  </div>
                </div>

                {/* Requirements Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-slate-800">Requirements & Skills</h3>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-slate-700 font-medium">
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
                          className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80 pr-20"
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                        />
                        <Button 
                          type="button" 
                          onClick={addRequirement} 
                          className="absolute right-1 top-1 h-10 px-4 bg-blue-600 hover:bg-blue-700"
                          disabled={!newRequirement.trim()}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                    {formData.requirements.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm text-slate-600">Added Requirements:</Label>
                        <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-lg border">
                          {formData.requirements.map((req, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                            >
                              <span>{req}</span>
                              <button
                                type="button"
                                onClick={() => removeRequirement(index)}
                                className="text-red-500 hover:text-red-700 transition-colors"
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
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-6 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-slate-800">Additional Details</h3>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="expiresAt" className="text-slate-700 font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Application Deadline
                      <span className="text-xs text-slate-500 font-normal">(Optional)</span>
                    </Label>
                    <Input
                      type="date"
                      id="expiresAt"
                      name="expiresAt"
                      value={formData.expiresAt}
                      onChange={handleInputChange}
                      className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80 max-w-xs"
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <div className="text-xs text-slate-500 mt-1">
                      Leave empty for no deadline
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4">
                  <div className="text-sm text-slate-600">
                    <span className="text-red-500">*</span> Required fields
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetForm}
                      className="px-6 py-2 h-11 border-slate-300 hover:bg-slate-50"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="px-8 py-2 h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
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
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Plus className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">No job postings yet</h3>
                  <p className="text-slate-600 max-w-md">
                    Create your first job posting to start attracting candidates.
                  </p>
                  <Button 
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Job
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <Card key={job.id} className="shadow-lg border-0 bg-white/70 backdrop-blur-sm hover:shadow-xl transition-shadow overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="line-clamp-2 text-slate-800">{job.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="capitalize bg-blue-100 text-blue-800 border-blue-200"
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
                          className="border-green-200 text-green-700 hover:bg-green-50"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(job.id)}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {job.location && (
                        <div className="flex items-center gap-1 text-slate-600">
                          <MapPin className="h-3 w-3" />
                          <span>{job.location}</span>
                        </div>
                      )}
                      {job.salaryRange && (
                        <div className="flex items-center gap-1 text-slate-600">
                          <DollarSign className="h-3 w-3" />
                          <span>{job.salaryRange}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-slate-600">
                        <Users className="h-3 w-3" />
                        <span>Applications: {job._count?.Applications || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <Calendar className="h-3 w-3" />
                        <span>Expires: {formatDate(job.expiresAt)}</span>
                      </div>
                    </div>

                    <p className="text-slate-600 line-clamp-3">
                      {job.description.length > 150
                        ? `${job.description.substring(0, 150)}...`
                        : job.description}
                    </p>

                    <Separator className="bg-slate-200" />

                    <div className="text-xs text-slate-500">
                      Created: {formatDate(job.createdAt)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobManagement;
