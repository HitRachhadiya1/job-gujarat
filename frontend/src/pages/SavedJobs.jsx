import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Building2, 
  IndianRupee, 
  Clock, 
  Bookmark, 
  Briefcase,
  Trash2,
  ExternalLink,
  FileText,
} from 'lucide-react';
import Spinner from '../components/Spinner';
import { savedJobsAPI } from '../api/savedJobs';
import JobApplicationModal from '../components/JobApplicationModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const SavedJobs = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingJobs, setRemovingJobs] = useState(new Set());
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [descriptionJob, setDescriptionJob] = useState(null);
  const [isViewJobOpen, setIsViewJobOpen] = useState(false);
  const [viewJob, setViewJob] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchSavedJobs();
  }, [pagination.page]);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const response = await savedJobsAPI.getSavedJobs(token, pagination.page, pagination.limit);
      setSavedJobs(response.savedJobs);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages
      }));
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveJob = async (jobId) => {
    try {
      setRemovingJobs(prev => new Set([...prev, jobId]));
      const token = await getAccessTokenSilently();
      await savedJobsAPI.unsaveJob(jobId, token);
      
      // Remove from local state
      setSavedJobs(prev => prev.filter(savedJob => savedJob.job.id !== jobId));
      
      // Update pagination if needed
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1
      }));
    } catch (error) {
      console.error('Error removing saved job:', error);
    } finally {
      setRemovingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setIsApplicationModalOpen(true);
  };

  const handleApplicationSubmitted = (application) => {
    const jobTitle = application?.job?.title || application?.title || selectedJob?.title || 'this job';
    // keep behavior simple and non-intrusive; no alert required
  };

  // UI-only helper to format enum-like job types for display (e.g., FULL_TIME -> Full Time)
  const formatJobType = (type) => {
    if (!type || typeof type !== 'string') return '';
    return type
      .toLowerCase()
      .split('_')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen bg-transparent py-0">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-2">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
              <Bookmark className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                Saved Jobs
              </h1>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <p className="text-stone-800 dark:text-stone-400 font-medium text-lg">
            {pagination.total} saved job{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Saved Jobs List */}
        <div className="space-y-4">
          {savedJobs.length === 0 ? (
            <Card className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
              <CardContent className="p-16 text-center">
                <Bookmark className="w-16 h-16 text-stone-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
                  No saved jobs yet
                </h3>
                <p className="text-stone-700 dark:text-stone-400 mb-6 text-sm">
                  Start saving jobs you're interested in to keep track of them here.
                </p>
                <Button 
                  onClick={() => window.location.href = '/browse-jobs'}
                  className="bg-stone-900 hover:bg-stone-800 text-white font-medium py-2.5 px-5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Browse Jobs
                </Button>
              </CardContent>
            </Card>
          ) : (
            savedJobs.map((savedJob) => (
              <Card key={savedJob.id} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-1.5 tracking-tight">
                        {savedJob.job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-stone-700 dark:text-stone-400 mb-2.5">
                        <div className="flex items-center gap-2 font-semibold text-stone-900 dark:text-white">
                          <Building2 className="w-4 h-4" />
                          <span>{savedJob.job.company?.name || 'Company'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{savedJob.job.location || 'Location not specified'}</span>
                        </div>
                        <Badge className="bg-stone-100 text-stone-900 border-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:border-stone-700 font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatJobType(savedJob.job.jobType) || 'Not specified'}
                        </Badge>
                        {savedJob.job.salaryRange && (
                          <Badge variant="outline" className="text-xs px-2 py-1 rounded-full text-green-700 bg-green-50 border-green-200 inline-flex items-center gap-1">
                            <IndianRupee className="w-3 h-3" />
                            {savedJob.job.salaryRange}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-stone-600 dark:text-stone-500 mb-3 font-medium">
                        Saved on {formatDate(savedJob.savedAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={() => { setViewJob(savedJob.job); setIsViewJobOpen(true); }}
                        className="bg-stone-900 hover:bg-stone-800 text-white font-medium py-2.5 px-5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Job
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 px-3 text-blue-700 border-blue-300 bg-blue-50 hover:bg-blue-100"
                        onClick={() => { setDescriptionJob(savedJob.job); setIsDescriptionOpen(true); }}
                        title="Job Description"
                        aria-label="Job Description"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Job Description
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={() => handleRemoveJob(savedJob.job.id)}
                        disabled={removingJobs.has(savedJob.job.id)}
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:bg-red-50"
                        aria-label="Remove saved job"
                        title="Remove saved job"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-6 mt-12">
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="border-stone-400/70 dark:border-stone-600 text-stone-800 dark:text-stone-300 font-semibold py-3 px-6 rounded-2xl transition-all duration-200 hover:bg-stone-200/50 dark:hover:bg-stone-800/30"
            >
              Previous
            </Button>
            <span className="text-stone-800 dark:text-stone-400 font-medium text-lg">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="border-stone-400/70 dark:border-stone-600 text-stone-800 dark:text-stone-300 font-semibold py-3 px-6 rounded-2xl transition-all duration-200 hover:bg-stone-200/50 dark:hover:bg-stone-800/30"
            >
              Next
            </Button>
          </div>
        )}
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
          <DialogContent className="bg-white dark:bg-stone-900">
            <DialogHeader>
              <DialogTitle>{descriptionJob?.title || 'Job Description'}</DialogTitle>
              <DialogDescription>
                {descriptionJob?.company?.name || 'Company'}
                {descriptionJob?.location ? ` • ${descriptionJob.location}` : ''}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2 text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap">
              {descriptionJob?.description || 'No description available.'}
            </div>
          </DialogContent>
        </Dialog>

        {/* View Job Modal */}
        <Dialog open={isViewJobOpen} onOpenChange={setIsViewJobOpen}>
          <DialogContent className="bg-white dark:bg-stone-900">
            <div className="p-1">
              {viewJob && (
                <Card className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm rounded-xl">
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-md border border-black bg-white flex items-center justify-center shrink-0 overflow-hidden">
                        {viewJob.company?.logoUrl ? (
                          <img
                            src={viewJob.company.logoUrl}
                            alt={`${viewJob.company?.name || 'Company'} logo`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : viewJob.company?.name ? (
                          <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                            {viewJob.company.name.charAt(0).toUpperCase()}
                          </span>
                        ) : (
                          <Building2 className="w-5 h-5 text-stone-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-1 line-clamp-2">
                          {viewJob.title}
                        </h3>
                        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm text-stone-600 dark:text-stone-400 mb-2">
                          <span className="inline-flex items-center font-bold text-stone-900 dark:text-white">
                            <Building2 className="w-4 h-4 mr-1" />
                            {viewJob.company?.name || 'Company'}
                          </span>
                          <span className="hidden sm:inline text-stone-300">•</span>
                          <span className="inline-flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {viewJob.location || 'Remote'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <Badge variant="secondary" className="text-xs px-2 py-1 rounded-full bg-stone-100 text-stone-800 border border-stone-200">
                            {formatJobType(viewJob.jobType) || 'Full Time'}
                          </Badge>
                          {viewJob.salaryRange && (
                            <Badge variant="outline" className="text-xs px-2 py-1 rounded-full text-green-700 bg-green-50 border-green-200 inline-flex items-center gap-1">
                              <IndianRupee className="w-3 h-3" />
                              {viewJob.salaryRange}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <Button
                            onClick={() => { setIsViewJobOpen(false); handleApplyClick(viewJob); }}
                            size="sm"
                            className="flex-1 bg-stone-900 hover:bg-stone-800 text-white h-9 text-sm"
                            aria-label={`Apply for ${viewJob.title || 'this job'}`}
                            title="Apply"
                          >
                            Apply Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SavedJobs;
