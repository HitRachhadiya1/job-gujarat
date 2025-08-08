import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const JobManagement = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: [],
    location: "",
    jobType: "FULL_TIME",
    salaryRange: "",
    expiresAt: "",
  });
  const [newRequirement, setNewRequirement] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const response = await fetch("http://localhost:5000/api/job-postings/my-jobs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const jobsData = await response.json();
      setJobs(jobsData);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()],
      }));
      setNewRequirement("");
    }
  };

  const removeRequirement = (index) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      requirements: [],
      location: "",
      jobType: "FULL_TIME",
      salaryRange: "",
      expiresAt: "",
    });
    setNewRequirement("");
    setEditingJob(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.jobType) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const url = editingJob
        ? `http://localhost:5000/api/job-postings/${editingJob.id}`
        : "http://localhost:5000/api/job-postings";

      const method = editingJob ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save job");
      }

      await fetchJobs(); // Refresh the job list
      resetForm();
    } catch (error) {
      console.error("Error saving job:", error);
      alert(error.message);
    }
  };

  const handleEdit = (job) => {
    setFormData({
      title: job.title,
      description: job.description,
      requirements: job.requirements || [],
      location: job.location || "",
      jobType: job.jobType,
      salaryRange: job.salaryRange || "",
      expiresAt: job.expiresAt ? job.expiresAt.split('T')[0] : "",
    });
    setEditingJob(job);
    setShowAddForm(true);
  };

  const handleDelete = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job posting?")) {
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`http://localhost:5000/api/job-postings/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete job");
      }

      await fetchJobs(); // Refresh the job list
    } catch (error) {
      console.error("Error deleting job:", error);
      alert(error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No expiry";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PUBLISHED":
        return "#28a745";
      case "DRAFT":
        return "#ffc107";
      case "CLOSED":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading job postings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Jobs</h2>
        <p>{error}</p>
        <button onClick={fetchJobs} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="job-management">
      <div className="job-management-header">
        <h2>Job Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="add-job-button"
        >
          + Add New Job
        </button>
      </div>

      {showAddForm && (
        <div className="job-form-overlay">
          <div className="job-form-container">
            <div className="job-form-header">
              <h3>{editingJob ? "Edit Job Posting" : "Add New Job Posting"}</h3>
              <button onClick={resetForm} className="close-button">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="job-form">
              <div className="form-group">
                <label htmlFor="title">Job Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Senior Software Engineer"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="jobType">Job Type *</label>
                <select
                  id="jobType"
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Ahmedabad, Gujarat"
                />
              </div>

              <div className="form-group">
                <label htmlFor="salaryRange">Salary Range</label>
                <input
                  type="text"
                  id="salaryRange"
                  name="salaryRange"
                  value={formData.salaryRange}
                  onChange={handleInputChange}
                  placeholder="e.g. ₹5,00,000 - ₹8,00,000 per year"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Job Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  rows="6"
                  required
                />
              </div>

              <div className="form-group">
                <label>Requirements</label>
                <div className="requirements-input">
                  <input
                    type="text"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Add a requirement"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                  />
                  <button type="button" onClick={addRequirement} className="add-requirement-btn">
                    Add
                  </button>
                </div>
                <div className="requirements-list">
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="requirement-item">
                      <span>{req}</span>
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="remove-requirement-btn"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="expiresAt">Expires On</label>
                <input
                  type="date"
                  id="expiresAt"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  {editingJob ? "Update Job" : "Create Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="jobs-list">
        {jobs.length === 0 ? (
          <div className="no-jobs">
            <h3>No job postings yet</h3>
            <p>Create your first job posting to start attracting candidates.</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-card-header">
                  <h3>{job.title}</h3>
                  <div className="job-actions">
                    <button
                      onClick={() => handleEdit(job)}
                      className="edit-button"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="job-card-content">
                  <div className="job-meta">
                    <span className="job-type">{job.jobType.replace('_', ' ')}</span>
                    <span
                      className="job-status"
                      style={{ backgroundColor: getStatusColor(job.status) }}
                    >
                      {job.status}
                    </span>
                  </div>

                  {job.location && (
                    <p className="job-location">📍 {job.location}</p>
                  )}

                  {job.salaryRange && (
                    <p className="job-salary">💰 {job.salaryRange}</p>
                  )}

                  <p className="job-description">
                    {job.description.length > 150
                      ? `${job.description.substring(0, 150)}...`
                      : job.description}
                  </p>

                  <div className="job-stats">
                    <span>Applications: {job._count?.Applications || 0}</span>
                    <span>Expires: {formatDate(job.expiresAt)}</span>
                  </div>

                  <div className="job-dates">
                    <small>Created: {formatDate(job.createdAt)}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .job-management {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .job-management-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .job-management-header h2 {
          margin: 0;
          color: #333;
        }

        .add-job-button {
          background: #007bff;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
        }

        .add-job-button:hover {
          background: #0056b3;
        }

        .job-form-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .job-form-container {
          background: white;
          border-radius: 8px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .job-form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e1e5e9;
        }

        .job-form-header h3 {
          margin: 0;
          color: #333;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-button:hover {
          color: #333;
        }

        .job-form {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.75rem;
          border: 2px solid #e1e5e9;
          border-radius: 4px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #007bff;
        }

        .requirements-input {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .requirements-input input {
          flex: 1;
        }

        .add-requirement-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }

        .add-requirement-btn:hover {
          background: #218838;
        }

        .requirements-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .requirement-item {
          background: #f8f9fa;
          border: 1px solid #e1e5e9;
          border-radius: 20px;
          padding: 0.25rem 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .remove-requirement-btn {
          background: none;
          border: none;
          color: #dc3545;
          cursor: pointer;
          font-size: 1rem;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
        }

        .cancel-button {
          background: #6c757d;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }

        .cancel-button:hover {
          background: #5a6268;
        }

        .submit-button {
          background: #007bff;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }

        .submit-button:hover {
          background: #0056b3;
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
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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

        .no-jobs {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        .no-jobs h3 {
          margin-bottom: 1rem;
          color: #333;
        }

        .jobs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 2rem;
        }

        .job-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .job-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1.5rem 1.5rem 1rem 1.5rem;
          border-bottom: 1px solid #e1e5e9;
        }

        .job-card-header h3 {
          margin: 0;
          color: #333;
          flex: 1;
          margin-right: 1rem;
        }

        .job-actions {
          display: flex;
          gap: 0.5rem;
        }

        .edit-button {
          background: #28a745;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .edit-button:hover {
          background: #218838;
        }

        .delete-button {
          background: #dc3545;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .delete-button:hover {
          background: #c82333;
        }

        .job-card-content {
          padding: 1.5rem;
        }

        .job-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .job-type {
          background: #e9ecef;
          color: #495057;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .job-status {
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .job-location,
        .job-salary {
          margin: 0.5rem 0;
          color: #666;
          font-size: 0.875rem;
        }

        .job-description {
          color: #666;
          line-height: 1.5;
          margin: 1rem 0;
        }

        .job-stats {
          display: flex;
          justify-content: space-between;
          margin: 1rem 0;
          font-size: 0.875rem;
          color: #666;
          font-weight: 500;
        }

        .job-dates {
          border-top: 1px solid #e1e5e9;
          padding-top: 1rem;
          margin-top: 1rem;
        }

        .job-dates small {
          color: #999;
          font-size: 0.75rem;
        }

        @media (max-width: 768px) {
          .job-management {
            padding: 1rem;
          }

          .job-management-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .jobs-grid {
            grid-template-columns: 1fr;
          }

          .job-card-header {
            flex-direction: column;
            gap: 1rem;
          }

          .job-actions {
            align-self: stretch;
          }

          .edit-button,
          .delete-button {
            flex: 1;
          }

          .job-form-overlay {
            padding: 0.5rem;
          }

          .job-form-container {
            max-height: 95vh;
          }
        }
      `}</style>
    </div>
  );
};

export default JobManagement;
