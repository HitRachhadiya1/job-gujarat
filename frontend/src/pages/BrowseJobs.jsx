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
    alert(`Application submitted successfully for "${application.job.title}"!`);
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
    <div className="min-h-screen bg-stone-200/50 dark:bg-stone-950/50 py-8">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-stone-900 dark:text-stone-100 mb-4 flex items-center space-x-4 tracking-tight">
            <div className="w-16 h-16 bg-gradient-to-br from-stone-300/90 to-stone-400/70 dark:from-stone-800 dark:to-stone-700 rounded-3xl flex items-center justify-center shadow-lg">
              <Briefcase className="w-8 h-8 text-stone-900 dark:text-stone-300" />
            </div>
            <span>Browse Jobs</span>
          </h1>
          <p className="text-xl text-stone-800 dark:text-stone-400 font-medium">
            Discover your next career opportunity
          </p>
        </div>
        
        {/* Search and Filter Section */}
        <Card className="mb-8 bg-stone-100/95 dark:bg-stone-900/60 backdrop-blur-sm border-stone-400/70 dark:border-stone-800/50 shadow-lg">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-600 dark:text-stone-400" />
                <Input
                  type="text"
                  className="pl-12 bg-stone-50 dark:bg-stone-800/50 border-stone-400/50 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-medium py-4 px-4 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-stone-600 focus:border-transparent"
                  placeholder="Search jobs by title, company, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-600 dark:text-stone-400" />
                  <Input
                    type="text"
                    className="pl-12 bg-stone-50 dark:bg-stone-800/50 border-stone-400/50 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-medium py-4 px-4 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-stone-600 focus:border-transparent"
                    placeholder="Location"
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                  />
                </div>
                
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-600 dark:text-stone-400" />
                  <select
                    className="w-full pl-12 pr-4 py-4 border border-stone-400/50 dark:border-stone-700 rounded-xl bg-stone-50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 font-medium focus:outline-none focus:ring-2 focus:ring-stone-600 focus:border-transparent transition-all duration-200"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="">All Job Types</option>
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-8">
          <p className="text-stone-800 dark:text-stone-400 font-medium text-lg">
            {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Jobs List */}
        <div className="space-y-6">
          {filteredJobs.length === 0 ? (
            <Card className="bg-stone-100/95 dark:bg-stone-900/60 backdrop-blur-sm border-stone-400/70 dark:border-stone-800/50 shadow-lg">
              <CardContent className="p-16 text-center">
                <Briefcase className="w-20 h-20 text-stone-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-4">
                  No jobs found
                </h3>
                <p className="text-stone-800 dark:text-stone-400 text-lg font-medium">
                  Try adjusting your search criteria or check back later for new opportunities.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id} className="bg-stone-100/95 dark:bg-stone-900/60 backdrop-blur-sm border-stone-400/70 dark:border-stone-800/50 shadow-lg hover:shadow-xl transition-all duration-200 border-l-4 border-l-stone-600">
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3 tracking-tight">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-6 text-sm text-stone-700 dark:text-stone-400 mb-4">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-5 h-5" />
                          <span className="font-medium">{job.company?.name || 'Company'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-5 h-5" />
                          <span className="font-medium">{job.location || 'Location not specified'}</span>
                        </div>
                        <Badge className="bg-stone-200/80 text-stone-900 border-stone-400/50 dark:bg-stone-800/50 dark:text-stone-300 dark:border-stone-600/50 font-semibold px-3 py-1 rounded-xl">
                          <Clock className="w-4 h-4 mr-2" />
                          {job.jobType || 'Not specified'}
                        </Badge>
                        {job.salaryRange && (
                          <div className="flex items-center space-x-2 text-stone-800 dark:text-stone-300 font-bold">
                            <DollarSign className="w-5 h-5" />
                            <span>{job.salaryRange}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-stone-800 dark:text-stone-300 font-medium line-clamp-3 text-base">
                      {job.description?.substring(0, 200)}...
                    </p>
                  </div>

                  {job.requirements && job.requirements.length > 0 && (
                    <div className="mb-6 p-4 bg-stone-200/50 dark:bg-stone-800/30 rounded-xl">
                      <p className="text-sm font-bold text-stone-900 dark:text-stone-200 mb-2">Requirements:</p>
                      <p className="text-sm text-stone-800 dark:text-stone-400 font-medium">
                        {Array.isArray(job.requirements) ? job.requirements.join(', ').substring(0, 150) : job.requirements.substring(0, 150)}...
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-6 border-t border-stone-400/30 dark:border-stone-700">
                    <div className="flex space-x-4">
                      <Button 
                        onClick={() => handleApplyClick(job)}
                        className="bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        Apply Now
                      </Button>
                      <Button 
                        variant="outline" 
                        className={`flex items-center space-x-2 font-semibold py-3 px-6 rounded-2xl transition-all duration-200 ${
                          savedJobs.has(job.id) 
                            ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400' 
                            : 'border-stone-400/70 dark:border-stone-600 text-stone-800 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800/30'
                        }`}
                        onClick={() => handleSaveJob(job.id)}
                        disabled={savingJobs.has(job.id)}
                      >
                        <Heart className={`w-5 h-5 ${savedJobs.has(job.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        <span>{savedJobs.has(job.id) ? 'Saved' : 'Save'}</span>
                      </Button>
                    </div>
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
