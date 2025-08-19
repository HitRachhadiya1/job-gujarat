import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const MyApplications = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const url = new URL('http://localhost:5000/api/applications/my-applications');
      if (filter) url.searchParams.set('status', filter);
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
        setPagination(data.pagination);
      } else {
        console.error('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId, jobTitle) => {
    if (!confirm(`Are you sure you want to withdraw your application for "${jobTitle}"?`)) {
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`http://localhost:5000/api/applications/${applicationId}/withdraw`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        fetchApplications(); // Refresh the list
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to withdraw application');
      }
    } catch (error) {
      console.error('Error withdrawing application:', error);
      alert('An error occurred while withdrawing your application');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      APPLIED: { class: 'status-applied', text: 'Applied' },
      INTERVIEW: { class: 'status-interview', text: 'Interview' },
      HIRED: { class: 'status-hired', text: 'Hired' },
      REJECTED: { class: 'status-rejected', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || { class: 'status-default', text: status };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p>Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1>My Applications</h1>
          <p>Track your job applications and their status</p>
        </div>

        {/* Filter Section */}
        <div className="card">
          <div className="filters">
            <label htmlFor="statusFilter">Filter by Status:</label>
            <select 
              id="statusFilter"
              className="form-control"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">All Applications</option>
              <option value="APPLIED">Applied</option>
              <option value="INTERVIEW">Interview</option>
              <option value="HIRED">Hired</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="results-summary">
          <p>{pagination.total || 0} application{(pagination.total !== 1) ? 's' : ''} found</p>
        </div>

        {/* Applications List */}
        <div className="applications-list">
          {applications.length === 0 ? (
            <div className="card text-center">
              <h3>No applications found</h3>
              <p>
                {filter ? 
                  'Try changing your filter criteria.' : 
                  "You haven't applied to any jobs yet. Start browsing jobs to find opportunities!"
                }
              </p>
              {!filter && (
                <a href="/browse-jobs" className="btn btn-primary">
                  Browse Jobs
                </a>
              )}
            </div>
          ) : (
            applications.map((application) => (
              <div key={application.id} className="card application-card">
                <div className="application-header">
                  <div className="job-info">
                    <h3 className="job-title">{application.job.title}</h3>
                    <div className="company-info">
                      <span className="company-name">
                        🏢 {application.job.company?.name}
                      </span>
                      <span className="job-location">📍 {application.job.location}</span>
                      <span className="job-type">💼 {application.job.jobType}</span>
                    </div>
                  </div>
                  <div className="application-status">
                    {getStatusBadge(application.status)}
                  </div>
                </div>

                <div className="application-details">
                  <div className="application-dates">
                    <small>
                      <strong>Applied:</strong> {formatDate(application.appliedAt)}
                      {application.updatedAt !== application.appliedAt && (
                        <span> • <strong>Last Updated:</strong> {formatDate(application.updatedAt)}</span>
                      )}
                    </small>
                  </div>

                  {application.coverLetter && (
                    <div className="cover-letter-preview">
                      <strong>Cover Letter:</strong>
                      <p>{application.coverLetter.substring(0, 150)}
                        {application.coverLetter.length > 150 && '...'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="application-actions">
                  {application.status === 'APPLIED' && (
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleWithdraw(application.id, application.job.title)}
                    >
                      Withdraw Application
                    </button>
                  )}
                  
                  {application.resumeSnapshot && (
                    <a 
                      href={application.resumeSnapshot}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      View Resume Used
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .page-header {
          margin-bottom: 2rem;
        }

        .page-header h1 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }

        .page-header p {
          margin: 0;
          color: #666;
          font-size: 1.1rem;
        }

        .filters {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .filters label {
          font-weight: 600;
          color: #333;
        }

        .form-control {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          min-width: 200px;
        }

        .results-summary {
          margin: 1rem 0;
        }

        .results-summary p {
          color: #666;
          margin: 0;
        }

        .application-card {
          transition: transform 0.2s, box-shadow 0.2s;
          border-left: 4px solid #007bff;
        }

        .application-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }

        .application-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .job-title {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 1.25rem;
        }

        .company-info {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          font-size: 0.9rem;
          color: #666;
        }

        .application-status {
          flex-shrink: 0;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-applied {
          background: #cce7ff;
          color: #0056b3;
        }

        .status-interview {
          background: #fff3cd;
          color: #856404;
        }

        .status-hired {
          background: #d1e7dd;
          color: #0f5132;
        }

        .status-rejected {
          background: #f8d7da;
          color: #721c24;
        }

        .application-details {
          margin-bottom: 1rem;
        }

        .application-dates {
          margin-bottom: 0.75rem;
        }

        .application-dates small {
          color: #666;
        }

        .cover-letter-preview {
          font-size: 0.9rem;
        }

        .cover-letter-preview p {
          margin: 0.25rem 0 0 0;
          color: #555;
          line-height: 1.4;
        }

        .application-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          padding-top: 1rem;
          border-top: 1px solid #e5e5e5;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-block;
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.85rem;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #545b62;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-danger:hover {
          background: #c82333;
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
          .application-header {
            flex-direction: column;
            gap: 1rem;
          }

          .company-info {
            flex-direction: column;
            gap: 0.25rem;
          }

          .application-actions {
            flex-direction: column;
          }

          .btn {
            width: 100%;
          }

          .filters {
            flex-direction: column;
            align-items: stretch;
          }

          .form-control {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default MyApplications;
