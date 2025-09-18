import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MapPin, 
  Building2, 
  DollarSign, 
  Clock, 
  Heart, 
  Briefcase,
  Filter,
  Users
} from 'lucide-react';
import JobApplicationModal from '../components/JobApplicationModal';
import Spinner from '../components/Spinner';
import { savedJobsAPI } from '../api/savedJobs';

const BrowseJobs = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [savingJobs, setSavingJobs] = useState(new Set());

  useEffect(() => {
    fetchJobs();
    checkSavedJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      console.log('Fetching jobs...');
      const token = await getAccessTokenSilently();
      console.log('Token obtained, making API call...');
      
      const response = await fetch('http://localhost:5000/api/job-postings', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('API response status:', response.status);
      
      if (response.ok) {
        const jobsData = await response.json();
        console.log('Jobs fetched successfully:', jobsData.length, 'jobs');
        setJobs(jobsData);
      } else {
        console.error('Failed to fetch jobs:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error details:', errorText);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setIsApplicationModalOpen(true);
  };

  const handleApplicationSubmitted = (application) => {
    const jobTitle = application?.job?.title || application?.title || selectedJob?.title || 'this job';
    alert(`Application submitted successfully for "${jobTitle}"!`);
    // Optionally refresh jobs or update UI to show applied status
  };

  const checkSavedJobs = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await savedJobsAPI.getSavedJobs(token);
      const savedJobIds = new Set(response.savedJobs.map(savedJob => savedJob.job.id));
      setSavedJobs(savedJobIds);
    } catch (error) {
      console.error('Error checking saved jobs:', error);
    }
  };

  const handleSaveJob = async (jobId) => {
    try {
      setSavingJobs(prev => new Set([...prev, jobId]));
      const token = await getAccessTokenSilently();
      
      if (savedJobs.has(jobId)) {
        // Unsave the job
        await savedJobsAPI.unsaveJob(jobId, token);
        setSavedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
        alert('Job removed from saved jobs!');
      } else {
        // Save the job
        await savedJobsAPI.saveJob(jobId, token);
        setSavedJobs(prev => new Set([...prev, jobId]));
        alert('Job saved successfully!');
      }
    } catch (error) {
      console.error('Error saving/unsaving job:', error);
      alert(error.message || 'Failed to save job');
    } finally {
      setSavingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !filterLocation || (job.location && job.location.toLowerCase().includes(filterLocation.toLowerCase()));
    const matchesType = !filterType || job.jobType === filterType;
    
    return matchesSearch && matchesLocation && matchesType;
  });

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen bg-transparent py-6">
      <div className="container mx-auto px-4 max-w-none">
        {/* Compact Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-3">
            <Briefcase className="w-7 h-7 text-stone-700 dark:text-stone-300" />
            <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              Browse Jobs
            </h1>
          </div>
          <p className="text-lg text-stone-700 dark:text-stone-400 font-medium ml-10">
            Discover your next career opportunity
          </p>
        </div>
        
        {/* Compact Search and Filter Section */}
        <div className="mb-6 bg-transparent rounded-none border-0 shadow-none p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="relative lg:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-500" />
              <Input
                type="text"
                className="pl-10 h-10 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg shadow-sm focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-500" />
              <Input
                type="text"
                className="pl-10 h-10 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg shadow-sm focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                placeholder="Location"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-500" />
              <select
                className="w-full pl-10 pr-4 h-10 border border-stone-300 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500 shadow-sm"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-stone-700 dark:text-stone-400 font-medium">
            {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Jobs Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredJobs.length === 0 ? (
            <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm p-12 text-center">
              <Briefcase className="w-16 h-16 text-stone-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
                No jobs found
              </h3>
              <p className="text-stone-600 dark:text-stone-400">
                Try adjusting your search criteria or check back later for new opportunities.
              </p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-all duration-200 h-fit">
                <CardContent className="p-5">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2 line-clamp-2">
                      {job.title}
                    </h3>
                    <div className="flex items-center text-sm text-stone-600 dark:text-stone-400 mb-3">
                      <Building2 className="w-4 h-4 mr-1" />
                      <span className="mr-4">{job.company?.name || 'Company'}</span>
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{job.location || 'Remote'}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs px-2 py-1">
                        {job.jobType || 'Full Time'}
                      </Badge>
                      {job.salaryRange && (
                        <Badge variant="outline" className="text-xs px-2 py-1 text-green-700 border-green-300">
                          {job.salaryRange}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-stone-700 dark:text-stone-300 line-clamp-3">
                      {job.description?.substring(0, 120)}...
                    </p>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-stone-200 dark:border-stone-700">
                    <Button 
                      onClick={() => handleApplyClick(job)}
                      size="sm"
                      className="flex-1 bg-stone-900 hover:bg-stone-800 text-white h-8 text-xs"
                    >
                      Apply
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={`px-3 h-8 ${
                        savedJobs.has(job.id) 
                          ? 'text-red-600 border-red-300 hover:bg-red-50' 
                          : 'text-stone-600 border-stone-300 hover:bg-stone-50'
                      }`}
                      onClick={() => handleSaveJob(job.id)}
                      disabled={savingJobs.has(job.id)}
                    >
                      <Heart className={`w-4 h-4 ${savedJobs.has(job.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
    </div>
  );
};

export default BrowseJobs;
