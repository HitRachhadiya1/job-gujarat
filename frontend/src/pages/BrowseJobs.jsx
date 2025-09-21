import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MapPin, 
  Building2, 
  IndianRupee, 
  Clock, 
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Filter,
  FileText,
} from 'lucide-react';
import JobApplicationModal from '../components/JobApplicationModal';
import Spinner from '../components/Spinner';
import { savedJobsAPI } from '../api/savedJobs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [descriptionJob, setDescriptionJob] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

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
        // no alert, update UI silently
      } else {
        // Save the job
        await savedJobsAPI.saveJob(jobId, token);
        setSavedJobs(prev => new Set([...prev, jobId]));
        // no alert, update UI silently
      }
    } catch (error) {
      console.error('Error saving/unsaving job:', error);
      // no alert on errors to keep UX clean
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

  // UI-only helper to format enum-like job types for display (e.g., FULL_TIME -> Full Time)
  const formatJobType = (type) => {
    if (!type || typeof type !== 'string') return '';
    return type
      .toLowerCase()
      .split('_')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ');
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen bg-transparent py-0">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Page Header */}
        <div className="mb-2">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-[#155AA4] to-[#0574EE] flex items-center justify-center shadow-sm">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                Browse Jobs
              </h1>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-5">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#155AA4]" />
                <Input
                  id="job-search"
                  type="text"
                  className="pl-10 h-10 bg-white dark:bg-stone-900 border-2 border-[#155AA4] dark:border-[#77BEE0] text-stone-900 dark:text-stone-100 rounded-lg shadow-none focus:ring-0 focus:border-[#0574EE]"
                  placeholder="Search job titles or descriptions"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 px-3 text-[#155AA4] border-[#77BEE0] bg-[#EAF6F9] hover:bg-[#77BEE0]/20"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              aria-controls="filters-panel"
            >
              <Filter className="w-4 h-4 mr-2" /> Filters
            </Button>
          </div>
          {filtersOpen && (
            <div id="filters-panel" className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <Label htmlFor="job-location" className="text-xs font-medium text-[#155AA4] dark:text-stone-300">Location</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#155AA4]" />
                  <Input
                    id="job-location"
                    type="text"
                    className="pl-10 h-8 bg-white dark:bg-stone-900 border border-[#77BEE0] dark:border-[#155AA4] text-stone-900 dark:text-stone-100 rounded-lg shadow-sm focus:ring-2 focus:ring-[#0574EE] focus:border-[#0574EE]"
                    placeholder="City, state or remote"
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="job-type" className="text-xs font-medium text-[#155AA4] dark:text-stone-300">Job type</Label>
                <div className="relative mt-1">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#155AA4]" />
                  <select
                    id="job-type"
                    className="w-full pl-10 pr-4 h-8 border border-[#77BEE0] dark:border-[#155AA4] rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#0574EE] shadow-sm"
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
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-stone-700 dark:text-stone-400 font-medium">
            {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
          </p>
          <div className="hidden md:flex flex-wrap items-center gap-2">
            {searchTerm && (
              <Badge variant="outline" className="text-xs px-2 py-1">Search: {searchTerm}</Badge>
            )}
            {filterLocation && (
              <Badge variant="outline" className="text-xs px-2 py-1">Location: {filterLocation}</Badge>
            )}
            {filterType && (
              <Badge variant="outline" className="text-xs px-2 py-1">Type: {filterType}</Badge>
            )}
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          {filteredJobs.length === 0 ? (
            <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-xl border border-[#77BEE0]/40 dark:border-stone-800 shadow-sm p-12 text-center">
              <Briefcase className="w-16 h-16 text-[#155AA4] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
                No jobs found
              </h3>
              <p className="text-stone-600 dark:text-stone-400">
                Try adjusting your search criteria or check back later for new opportunities.
              </p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <Card
                key={job.id}
                className="group bg-white dark:bg-stone-900 border border-[#77BEE0]/40 dark:border-stone-800 shadow-sm hover:shadow-md transition-all duration-200 h-full min-h-[200px] rounded-xl"
              >
                <CardContent className="p-5 h-full flex flex-col">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-md border border-[#77BEE0] bg-white flex items-center justify-center shrink-0 overflow-hidden">
                      {job.company?.logoUrl ? (
                        <img
                          src={job.company.logoUrl}
                          alt={`${job.company?.name || 'Company'} logo`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : job.company?.name ? (
                        <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                          {job.company.name.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <Building2 className="w-5 h-5 text-stone-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-1 line-clamp-2">
                        {job.title}
                      </h3>
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm text-stone-600 dark:text-stone-400 mb-2">
                        <span className="inline-flex items-center font-bold text-stone-900 dark:text-white">
                          <Building2 className="w-4 h-4 mr-1" />
                          {job.company?.name || 'Company'}
                        </span>
                        <span className="hidden sm:inline text-stone-300">•</span>
                        <span className="inline-flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location || 'Remote'}
                        </span>
                        {job.createdAt && (
                          <>
                            <span className="hidden sm:inline text-stone-300">•</span>
                            <span className="inline-flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(job.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="text-xs px-2 py-1 rounded-full bg-stone-100 text-stone-800 border border-stone-200">
                          {formatJobType(job.jobType) || 'Full Time'}
                        </Badge>
                        {job.salaryRange && (
                          <Badge variant="outline" className="text-xs px-2 py-1 rounded-full text-green-700 bg-green-50 border-green-200 inline-flex items-center gap-1">
                            <IndianRupee className="w-3 h-3" />
                            {job.salaryRange}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2 pt-6">
                        <Button
                          onClick={() => handleApplyClick(job)}
                          size="sm"
                          className="flex-1 bg-[#0574EE] hover:bg-[#155AA4] text-white h-9 text-sm"
                          aria-label={`Apply for ${job.title || 'this job'}`}
                          title="Apply"
                        >
                          Apply Now
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-9 px-3 text-[#155AA4] border-[#77BEE0] bg-[#EAF6F9] hover:bg-[#77BEE0]/20"
                          onClick={() => { setDescriptionJob(job); setIsDescriptionOpen(true); }}
                          title="Job Description"
                          aria-label="Job Description"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Job Description
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`${savedJobs.has(job.id) ? 'bg-[#0574EE] text-white hover:bg-[#155AA4]' : 'text-[#155AA4] hover:bg-[#77BEE0]/20'} h-9 w-9 p-0 rounded-full`}
                          onClick={() => handleSaveJob(job.id)}
                          disabled={savingJobs.has(job.id)}
                          aria-label={savedJobs.has(job.id) ? 'Unsave job' : 'Save job'}
                          aria-pressed={savedJobs.has(job.id)}
                          title={savedJobs.has(job.id) ? 'Remove from saved' : 'Save this job'}
                        >
                          {savedJobs.has(job.id) ? (
                            <BookmarkCheck className="w-4 h-4" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
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

      {/* Description Modal */}
      <Dialog open={isDescriptionOpen} onOpenChange={setIsDescriptionOpen}>
        <DialogContent className="bg-white dark:bg-stone-900 border border-[#77BEE0]/40 dark:border-[#155AA4]/40 shadow-2xl sm:rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-stone-900 dark:text-stone-100">
              {descriptionJob?.title || 'Job Description'}
            </DialogTitle>
            <DialogDescription className="text-stone-700 dark:text-stone-400">
              {descriptionJob?.company?.name || 'Company'}
              {descriptionJob?.location ? ` • ${descriptionJob.location}` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap">
            {descriptionJob?.description || 'No description available.'}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrowseJobs;
