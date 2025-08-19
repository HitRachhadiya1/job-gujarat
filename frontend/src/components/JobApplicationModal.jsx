import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const JobApplicationModal = ({ job, isOpen, onClose, onApplicationSubmitted }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('http://localhost:5000/api/applications/apply', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: job.id,
          coverLetter: coverLetter.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onApplicationSubmitted(data.application);
        onClose();
        setCoverLetter('');
      } else {
        setError(data.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('An error occurred while submitting your application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Apply for {job.title}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="job-details">
          <h3>{job.company?.name}</h3>
          <p>📍 {job.location}</p>
          <p>💼 {job.jobType}</p>
          {job.salaryRange && <p>💰 {job.salaryRange}</p>}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="coverLetter">Cover Letter (Optional)</label>
            <textarea
              id="coverLetter"
              className="form-control"
              rows="6"
              placeholder="Write a brief cover letter explaining why you're interested in this position and what makes you a good fit..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
            <small className="text-muted">
              This will help your application stand out to the employer.
            </small>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
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

        .modal-content {
          background: white;
          border-radius: 8px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e5e5;
        }

        .modal-header h2 {
          margin: 0;
          color: #333;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #666;
          cursor: pointer;
          padding: 0.25rem;
          line-height: 1;
        }

        .close-button:hover {
          color: #333;
        }

        .job-details {
          padding: 1.5rem;
          background: #f8f9fa;
          border-bottom: 1px solid #e5e5e5;
        }

        .job-details h3 {
          margin: 0 0 0.5rem 0;
          color: #007bff;
        }

        .job-details p {
          margin: 0.25rem 0;
          color: #666;
          font-size: 0.9rem;
        }

        form {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
        }

        .form-control {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          resize: vertical;
          min-height: 120px;
        }

        .form-control:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .text-muted {
          font-size: 0.85rem;
          color: #6c757d;
          margin-top: 0.25rem;
        }

        .alert {
          padding: 0.75rem 1rem;
          border: 1px solid transparent;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .alert-error {
          color: #721c24;
          background-color: #f8d7da;
          border-color: #f5c6cb;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e5e5;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0056b3;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #545b62;
        }

        @media (max-width: 768px) {
          .modal-overlay {
            padding: 0.5rem;
          }

          .modal-header {
            padding: 1rem;
          }

          .job-details {
            padding: 1rem;
          }

          form {
            padding: 1rem;
          }

          .modal-actions {
            flex-direction: column;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default JobApplicationModal;
