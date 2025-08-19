import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const JobSeekerProfileForm = ({ onSuccess }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    location: '',
    skills: [],
    experienceYears: '',
    resumeUrl: ''
  });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    fetchExistingProfile();
  }, []);

  const fetchExistingProfile = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('http://localhost:5000/api/job-seeker/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const profile = await response.json();
        setExistingProfile(profile);
        setFormData({
          fullName: profile.fullName || '',
          phone: profile.phone || '',
          location: profile.location || '',
          skills: profile.skills || [],
          experienceYears: profile.experienceYears?.toString() || '',
          resumeUrl: profile.resumeUrl || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await getAccessTokenSilently();
      const method = existingProfile ? 'PUT' : 'POST';
      
      const response = await fetch('http://localhost:5000/api/job-seeker/', {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : null
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        setExistingProfile(result.jobSeeker);
        if (onSuccess) onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('An error occurred while saving your profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillAdd = () => {
    const skill = skillInput.trim();
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      setSkillInput('');
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSkillAdd();
    }
  };

  return (
    <div className="profile-form-container">
      <div className="card">
        <h2>{existingProfile ? 'Update Your Profile' : 'Create Your Job Seeker Profile'}</h2>
        <p>Complete your profile to start applying for jobs.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name *</label>
            <input
              type="text"
              id="fullName"
              className="form-control"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              className="form-control"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              className="form-control"
              placeholder="City, State"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label htmlFor="experienceYears">Years of Experience</label>
            <select
              id="experienceYears"
              className="form-control"
              value={formData.experienceYears}
              onChange={(e) => setFormData(prev => ({ ...prev, experienceYears: e.target.value }))}
            >
              <option value="">Select experience level</option>
              <option value="0">Entry Level (0 years)</option>
              <option value="1">1 year</option>
              <option value="2">2 years</option>
              <option value="3">3 years</option>
              <option value="4">4 years</option>
              <option value="5">5 years</option>
              <option value="10">5-10 years</option>
              <option value="15">10+ years</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="skills">Skills</label>
            <div className="skills-input">
              <input
                type="text"
                id="skills"
                className="form-control"
                placeholder="Add a skill and press Enter"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button type="button" className="btn btn-secondary" onClick={handleSkillAdd}>
                Add
              </button>
            </div>
            <div className="skills-list">
              {formData.skills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                  <button
                    type="button"
                    className="skill-remove"
                    onClick={() => handleSkillRemove(skill)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="resumeUrl">Resume URL</label>
            <input
              type="url"
              id="resumeUrl"
              className="form-control"
              placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
              value={formData.resumeUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, resumeUrl: e.target.value }))}
            />
            <small className="form-text">Upload your resume to a cloud service and paste the public link here</small>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : existingProfile ? 'Update Profile' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .profile-form-container {
          max-width: 600px;
          margin: 0 auto;
        }

        .card {
          padding: 2rem;
        }

        .card h2 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }

        .card p {
          margin: 0 0 2rem 0;
          color: #666;
        }

        .form-group {
          margin-bottom: 1.5rem;
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
        }

        .form-control:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .skills-input {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .skills-input .form-control {
          flex: 1;
        }

        .skills-list {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .skill-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background: #e3f2fd;
          color: #1565c0;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.85rem;
        }

        .skill-remove {
          background: none;
          border: none;
          color: #1565c0;
          cursor: pointer;
          font-size: 1.1rem;
          line-height: 1;
          padding: 0;
          margin-left: 0.25rem;
        }

        .skill-remove:hover {
          color: #0d47a1;
        }

        .form-text {
          font-size: 0.85rem;
          color: #6c757d;
          margin-top: 0.25rem;
        }

        .form-actions {
          margin-top: 2rem;
          text-align: center;
        }

        .btn {
          padding: 0.75rem 2rem;
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
          padding: 0.75rem 1rem;
        }

        .btn-secondary:hover {
          background: #545b62;
        }

        @media (max-width: 768px) {
          .profile-form-container {
            max-width: none;
          }

          .card {
            padding: 1.5rem;
          }

          .skills-input {
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

export default JobSeekerProfileForm;
