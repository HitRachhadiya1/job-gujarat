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
  Users,
  Star,
  Award,
  Calendar,
  Target,
  Zap,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import JobApplicationModal from '../components/JobApplicationModal';
import Spinner from '../components/Spinner';

const BrowseJobs = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/30 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Professional Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(241,245,249,0.4)_1px,_transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,_rgba(51,65,85,0.1)_1px,_transparent_0)] bg-[length:60px_60px]"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 max-w-7xl py-8">
        {/* Professional Header */}
        <div className="mb-12">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl blur-sm opacity-20"></div>
              <div className="relative p-4 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-light tracking-tight text-slate-900 dark:text-slate-100">
                Browse Jobs
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mt-2 font-light">
                {jobs.length} opportunities available
              </p>
            </div>
          </div>
        </div>
        
        {/* Professional Search and Filter Section */}
        <Card className="mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-slate-400 dark:hover:border-slate-600 focus-within:ring-2 focus-within:ring-slate-400 focus-within:border-slate-400 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <Filter className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Find Your Perfect Match</h3>
            </div>
            <div className="space-y-6">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 w-5 h-5 transition-colors duration-200" />
                <Input
                  type="text"
                  className="pl-12 h-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:border-slate-500 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all duration-200"
                  placeholder="Search jobs by title, company, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 w-5 h-5 transition-colors duration-200" />
                  <Input
                    type="text"
                    className="pl-12 h-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:border-slate-500 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all duration-200"
                    placeholder="Location"
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                  />
                </div>
                
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    className="w-full pl-12 pr-4 h-10 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-500 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all duration-200"
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

        {/* Professional Results Summary */}
        <div className="mb-8">
          <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Target className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Showing the best matches for your search
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Jobs List */}
        <div className="space-y-8">
          {filteredJobs.length === 0 ? (
            <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-16 text-center">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mx-auto">
                    <Briefcase className="w-12 h-12 text-slate-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">No Opportunities Found</h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto">Refine your search criteria or explore different filters to discover your perfect match</p>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-slate-400 dark:hover:border-slate-600 focus-within:ring-2 focus-within:ring-slate-400 focus-within:border-slate-400 transition-all duration-300">
                <CardContent className="p-6 relative">
                  <div className="flex flex-col space-y-6">
                    {/* Enhanced Job Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <Building2 className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                {job.title}
                              </h3>
                              <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 px-3 py-1 rounded-md text-xs font-medium">
                                NEW
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                              <span className="font-medium text-lg">{job.company?.name || 'Company'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" className="border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md px-4 py-2 font-medium transition-colors duration-200">
                        <Heart className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                      {job.description?.substring(0, 220)}{job.description && job.description.length > 220 ? '...' : ''}
                    </p>

                    {/* Professional Job Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          <MapPin className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Location</p>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{job.location || 'Remote'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          <DollarSign className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Salary</p>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{job.salaryRange || 'Competitive'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Type</p>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{job.jobType || 'Full-time'}</p>
                        </div>
                      </div>
                    </div>

                    {job.requirements && job.requirements.length > 0 && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <Star className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          </div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wide">Requirements</p>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {Array.isArray(job.requirements) ? job.requirements.join(', ').substring(0, 150) : job.requirements?.substring(0, 150)}...
                        </p>
                      </div>
                    )}

                    {/* Enhanced Action Buttons */}
                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center gap-4">
                        <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 px-3 py-1 rounded-md font-medium">
                          {job.jobType || 'Full-time'}
                        </Badge>
                      </div>
                      <div className="flex gap-4">
                        <Button variant="outline" className="border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md px-4 py-2 font-medium transition-colors duration-200">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button 
                          onClick={() => handleApplyClick(job)}
                          className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
                        >
                          <ChevronRight className="w-4 h-4 mr-2" />
                          Apply Now
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
    </div>
  );
};

export default BrowseJobs;
