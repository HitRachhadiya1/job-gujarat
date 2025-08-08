import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import CompanyDetailsForm from "./CompanyDetailsForm";

const CompanyDashboard = () => {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch("http://localhost:5000/api/company", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch company data");
      }

      const companyData = await response.json();
      setCompany(companyData);
    } catch (error) {
      console.error("Error fetching company:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSuccess = (updatedCompany) => {
    setCompany(updatedCompany);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading company dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
        <button onClick={fetchCompanyData} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="dashboard-container">
        <CompanyDetailsForm
          existingCompany={company}
          onSuccess={handleUpdateSuccess}
        />
        <button onClick={() => setIsEditing(false)} className="cancel-button">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container" data-testid="company-dashboard">
      <div className="company-header">
        <div className="company-info">
          {company.logoUrl && (
            <img
              src={company.logoUrl}
              alt={`${company.name} logo`}
              className="company-logo"
            />
          )}
          <div className="company-details">
            <h1>{company.name}</h1>
            <p className="industry">{company.industry}</p>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="website-link"
              >
                Visit Website
              </a>
            )}
          </div>
        </div>
        <div className="company-actions">
          <button onClick={() => setIsEditing(true)} className="edit-button">
            Edit Company Details
          </button>
          <div className="verification-status">
            <span
              className={`status-badge ${
                company.verified ? "verified" : "unverified"
              }`}
            >
              {company.verified ? "Verified" : "Unverified"}
            </span>
          </div>
        </div>
      </div>

      <div className="company-description">
        <h3>About Us</h3>
        <p>{company.description}</p>
      </div>

      <div className="dashboard-sections">
        <div className="section">
          <h3>Job Postings</h3>
          <p>Manage your job postings and view applications.</p>
                  <button 
                    className="section-button"
                    onClick={() => navigate('/jobs')}
                  >
                    Manage Job Postings
                  </button>
        </div>

        <div className="section">
          <h3>Applications</h3>
          <p>Review and manage job applications from candidates.</p>
          <button className="section-button">View Applications</button>
        </div>

        <div className="section">
          <h3>Company Analytics</h3>
          <p>View insights about your job postings and company profile.</p>
          <button className="section-button">View Analytics</button>
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .loading-container,
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .company-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .company-info {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .company-logo {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #e1e5e9;
        }

        .company-details h1 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }

        .industry {
          color: #666;
          margin: 0 0 0.5rem 0;
          font-weight: 500;
        }

        .website-link {
          color: #007bff;
          text-decoration: none;
          font-weight: 500;
        }

        .website-link:hover {
          text-decoration: underline;
        }

        .company-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: flex-end;
        }

        .edit-button {
          background: #007bff;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }

        .edit-button:hover {
          background: #0056b3;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-badge.verified {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .status-badge.unverified {
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        }

        .company-description {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .company-description h3 {
          margin-top: 0;
          color: #333;
        }

        .company-description p {
          line-height: 1.6;
          color: #666;
        }

        .dashboard-sections {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .section {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .section h3 {
          margin-top: 0;
          color: #333;
        }

        .section p {
          color: #666;
          margin-bottom: 1.5rem;
        }

        .section-button {
          background: #28a745;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          width: 100%;
        }

        .section-button:hover {
          background: #218838;
        }

        .cancel-button {
          background: #6c757d;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          margin-top: 1rem;
        }

        .cancel-button:hover {
          background: #5a6268;
        }

        .retry-button {
          background: #007bff;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }

        .retry-button:hover {
          background: #0056b3;
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1rem;
          }

          .company-header {
            flex-direction: column;
            gap: 1.5rem;
          }

          .company-actions {
            align-items: stretch;
            width: 100%;
          }

          .dashboard-sections {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CompanyDashboard;
