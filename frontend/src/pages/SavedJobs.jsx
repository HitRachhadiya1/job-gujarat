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
    <div className="min-h-screen bg-stone-200/50 dark:bg-stone-950/50 py-8">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-stone-900 dark:text-stone-100 mb-4 flex items-center space-x-4 tracking-tight">
            <div className="w-16 h-16 bg-gradient-to-br from-stone-300/90 to-stone-400/70 dark:from-stone-800 dark:to-stone-700 rounded-3xl flex items-center justify-center shadow-lg">
              <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            </div>
            <span>Saved Jobs</span>
          </h1>
          <p className="text-xl text-stone-800 dark:text-stone-400 font-medium">
            Your bookmarked job opportunities
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <p className="text-stone-800 dark:text-stone-400 font-medium text-lg">
            {pagination.total} saved job{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Saved Jobs List */}
        <div className="space-y-6">
          {savedJobs.length === 0 ? (
            <Card className="bg-stone-100/95 dark:bg-stone-900/60 backdrop-blur-sm border-stone-400/70 dark:border-stone-800/50 shadow-lg">
              <CardContent className="p-16 text-center">
                <Heart className="w-20 h-20 text-stone-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-4">
                  No saved jobs yet
                </h3>
                <p className="text-stone-800 dark:text-stone-400 mb-8 text-lg font-medium">
                  Start saving jobs you're interested in to keep track of them here.
                </p>
                <Button 
                  onClick={() => window.location.href = '/browse-jobs'}
                  className="bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Briefcase className="w-5 h-5 mr-3" />
                  Browse Jobs
                </Button>
              </CardContent>
            </Card>
          ) : (
            savedJobs.map((savedJob) => (
              <Card key={savedJob.id} className="bg-stone-100/95 dark:bg-stone-900/60 backdrop-blur-sm border-stone-400/70 dark:border-stone-800/50 shadow-lg hover:shadow-xl transition-all duration-200 border-l-4 border-l-red-500">
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3 tracking-tight">
                        {savedJob.job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-6 text-sm text-stone-700 dark:text-stone-400 mb-4">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-5 h-5" />
                          <span className="font-medium">{savedJob.job.company?.name || 'Company'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-5 h-5" />
                          <span className="font-medium">{savedJob.job.location || 'Location not specified'}</span>
                        </div>
                        <Badge className="bg-stone-200/80 text-stone-900 border-stone-400/50 dark:bg-stone-800/50 dark:text-stone-300 dark:border-stone-600/50 font-semibold px-3 py-1 rounded-xl">
                          <Clock className="w-4 h-4 mr-2" />
                          {savedJob.job.jobType || 'Not specified'}
                        </Badge>
                        {savedJob.job.salaryRange && (
                          <div className="flex items-center space-x-2 text-stone-800 dark:text-stone-300 font-bold">
                            <DollarSign className="w-5 h-5" />
                            <span>{savedJob.job.salaryRange}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-stone-600 dark:text-stone-500 mb-4 font-medium">
                        Saved on {formatDate(savedJob.savedAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-stone-800 dark:text-stone-300 font-medium line-clamp-3 text-base">
                      {savedJob.job.description?.substring(0, 200)}...
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-stone-400/30 dark:border-stone-700">
                    <div className="flex space-x-4">
                      <Button 
                        onClick={() => window.location.href = '/browse-jobs'}
                        className="bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <ExternalLink className="w-5 h-5 mr-3" />
                        View Job
                      </Button>
                      <Button 
                        onClick={() => handleRemoveJob(savedJob.job.id)}
                        disabled={removingJobs.has(savedJob.job.id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
                      >
                        <Trash2 className="w-5 h-5" />
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
      </div>
    </div>
  );
};

export default SavedJobs;
