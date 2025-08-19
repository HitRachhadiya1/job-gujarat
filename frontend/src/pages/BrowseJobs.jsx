import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import JobApplicationModal from '../components/JobApplicationModal';

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
    return (
      <div className="page-container">
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p>Loading job opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <h1>Browse Jobs</h1>
        
        {/* Search and Filter Section */}
        <div className="card">
          <div className="search-filters">
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search jobs by title, company, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Location"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                />
              </div>
              
              <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                <select
                  className="form-control"
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
        </div>

        {/* Results Summary */}
        <div style={{ margin: '1rem 0' }}>
          <p>{filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found</p>
        </div>

        {/* Jobs List */}
        <div className="jobs-list">
          {filteredJobs.length === 0 ? (
            <div className="card text-center">
              <h3>No jobs found</h3>
              <p>Try adjusting your search criteria or check back later for new opportunities.</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div key={job.id} className="card job-card">
                <div className="job-header">
                  <h3 className="job-title">{job.title}</h3>
                  <div className="job-meta">
                    <span className="company-name">🏢 {job.company?.name || 'Company'}</span>
                    <span className="job-location">📍 {job.location || 'Location not specified'}</span>
                    <span className="job-type">💼 {job.jobType || 'Not specified'}</span>
                  </div>
                </div>
                
                <div className="job-description">
                  <p>{job.description?.substring(0, 200)}...</p>
                </div>

                <div className="job-requirements">
                  {job.requirements && job.requirements.length > 0 && (
                    <div>
                      <strong>Requirements:</strong>
                      <p>{Array.isArray(job.requirements) ? job.requirements.join(', ').substring(0, 150) : job.requirements.substring(0, 150)}...</p>
                    </div>
                  )}
                </div>

                <div className="job-footer">
                  <div className="job-salary">
                    {job.salaryRange && <span className="salary">💰 {job.salaryRange}</span>}
                  </div>
                  <div className="job-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleApplyClick(job)}
                    >
                      Apply Now
                    </button>
                    <button className="btn btn-secondary">
                      ❤️ Save
                    </button>
                  </div>
                </div>
              </div>
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

      <style jsx>{`
        .search-filters {
          margin-bottom: 0;
        }

        .job-card {
          transition: transform 0.2s, box-shadow 0.2s;
          border-left: 4px solid #007bff;
        }

        .job-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }

        .job-header {
          margin-bottom: 1rem;
        }

        .job-title {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 1.25rem;
        }

        .job-meta {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          font-size: 0.9rem;
          color: #666;
        }

        .job-description {
          margin-bottom: 1rem;
          color: #555;
          line-height: 1.5;
        }

        .job-requirements {
          margin-bottom: 1rem;
          font-size: 0.9rem;
          color: #666;
        }

        .job-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e5e5;
        }

        .job-actions {
          display: flex;
          gap: 0.5rem;
        }

        .salary {
          font-weight: 600;
          color: #28a745;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .text-center {
          text-align: center;
        }

        @media (max-width: 768px) {
          .job-meta {
            flex-direction: column;
            gap: 0.25rem;
          }

          .job-footer {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .job-actions {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default BrowseJobs;
