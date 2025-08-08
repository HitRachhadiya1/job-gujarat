import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const BrowseJobs = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('http://localhost:5000/api/job-postings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const jobsData = await response.json();
        setJobs(jobsData);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !filterLocation || job.location.toLowerCase().includes(filterLocation.toLowerCase());
    const matchesType = !filterType || job.type === filterType;
    
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
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="remote">Remote</option>
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
                    <span className="job-location">📍 {job.location}</span>
                    <span className="job-type">💼 {job.type}</span>
                  </div>
                </div>
                
                <div className="job-description">
                  <p>{job.description?.substring(0, 200)}...</p>
                </div>

                <div className="job-requirements">
                  {job.requirements && (
                    <div>
                      <strong>Requirements:</strong>
                      <p>{job.requirements.substring(0, 150)}...</p>
                    </div>
                  )}
                </div>

                <div className="job-footer">
                  <div className="job-salary">
                    {job.salary && <span className="salary">💰 ${job.salary}</span>}
                  </div>
                  <div className="job-actions">
                    <button className="btn btn-primary">
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
