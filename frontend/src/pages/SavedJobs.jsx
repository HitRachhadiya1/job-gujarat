import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Building2, 
  DollarSign, 
  Clock, 
  Heart, 
  Briefcase,
  Trash2,
  ExternalLink
} from 'lucide-react';
import Spinner from '../components/Spinner';
import { savedJobsAPI } from '../api/savedJobs';

const SavedJobs = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingJobs, setRemovingJobs] = useState(new Set());
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
      
      alert('Job removed from saved jobs!');
    } catch (error) {
      console.error('Error removing saved job:', error);
      alert(error.message || 'Failed to remove job');
    } finally {
      setRemovingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center space-x-3">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <span>Saved Jobs</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Your bookmarked job opportunities
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <p className="text-slate-600 dark:text-slate-400">
            {pagination.total} saved job{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Saved Jobs List */}
        <div className="space-y-6">
          {savedJobs.length === 0 ? (
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
              <CardContent className="p-12 text-center">
                <Heart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No saved jobs yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Start saving jobs you're interested in to keep track of them here.
                </p>
                <Button 
                  onClick={() => window.location.href = '/browse-jobs'}
                  className="bg-gradient-to-r from-blue-600 to-slate-700 hover:from-blue-700 hover:to-slate-800 text-white"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Browse Jobs
                </Button>
              </CardContent>
            </Card>
          ) : (
            savedJobs.map((savedJob) => (
              <Card key={savedJob.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 border-l-4 border-l-red-500">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                        {savedJob.job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                        <div className="flex items-center space-x-1">
                          <Building2 className="w-4 h-4" />
                          <span>{savedJob.job.company?.name || 'Company'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{savedJob.job.location || 'Location not specified'}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {savedJob.job.jobType || 'Not specified'}
                        </Badge>
                        {savedJob.job.salaryRange && (
                          <div className="flex items-center space-x-1 text-green-600 dark:text-green-400 font-semibold">
                            <DollarSign className="w-4 h-4" />
                            <span>{savedJob.job.salaryRange}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                        Saved on {formatDate(savedJob.savedAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-slate-700 dark:text-slate-300 line-clamp-3">
                      {savedJob.job.description?.substring(0, 200)}...
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => window.location.href = '/browse-jobs'}
                        className="bg-gradient-to-r from-blue-600 to-slate-700 hover:from-blue-700 hover:to-slate-800 text-white"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Job
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex items-center space-x-1 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleRemoveJob(savedJob.job.id)}
                        disabled={removingJobs.has(savedJob.job.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove</span>
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
          <div className="flex justify-center items-center space-x-4 mt-8">
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <span className="text-slate-600 dark:text-slate-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;
