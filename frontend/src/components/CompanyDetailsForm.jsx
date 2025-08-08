import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const CompanyDetailsForm = ({ onSuccess, existingCompany = null, refreshAuthMeta }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    description: "",
    website: "",
    logoUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Pre-populate form if editing existing company
  useEffect(() => {
    if (existingCompany) {
      setFormData({
        name: existingCompany.name || "",
        industry: existingCompany.industry || "",
        description: existingCompany.description || "",
        website: existingCompany.website || "",
        logoUrl: existingCompany.logoUrl || "",
      });
    }
  }, [existingCompany]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Company name is required";
    }

    if (!formData.industry.trim()) {
      newErrors.industry = "Industry is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Company description is required";
    }

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = "Please enter a valid website URL";
    }

    if (formData.logoUrl && !isValidUrl(formData.logoUrl)) {
      newErrors.logoUrl = "Please enter a valid logo URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = await getAccessTokenSilently();
      const url = existingCompany
        ? "http://localhost:5000/api/company"
        : "http://localhost:5000/api/company";

      const method = existingCompany ? "PUT" : "POST";

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
        throw new Error(errorData.error || "Failed to save company details");
      }

      const company = await response.json();
      
      // Refresh auth meta to update company status
      if (refreshAuthMeta) {
        refreshAuthMeta();
      }
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(company);
      }
    } catch (error) {
      console.error("Error saving company:", error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="company-details-form" data-testid="company-setup-form">
      <h2>
        {existingCompany
          ? "Update Company Details"
          : "Complete Your Company Profile"}
      </h2>
      <p className="form-description">
        Please fill in your company information to continue using the platform.
      </p>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="name">Company Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={errors.name ? "error" : ""}
            placeholder="Enter your company name"
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="industry">Industry *</label>
          <select
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleInputChange}
            className={errors.industry ? "error" : ""}
          >
            <option value="">Select an industry</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Finance">Finance</option>
            <option value="Education">Education</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Retail">Retail</option>
            <option value="Construction">Construction</option>
            <option value="Transportation">Transportation</option>
            <option value="Hospitality">Hospitality</option>
            <option value="Media">Media</option>
            <option value="Other">Other</option>
          </select>
          {errors.industry && (
            <span className="error-message">{errors.industry}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description">Company Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={errors.description ? "error" : ""}
            placeholder="Describe your company, its mission, and what you do..."
            rows="4"
          />
          {errors.description && (
            <span className="error-message">{errors.description}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="website">Website</label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            className={errors.website ? "error" : ""}
            placeholder="https://www.yourcompany.com"
          />
          {errors.website && (
            <span className="error-message">{errors.website}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="logoUrl">Company Logo URL</label>
          <input
            type="url"
            id="logoUrl"
            name="logoUrl"
            value={formData.logoUrl}
            onChange={handleInputChange}
            className={errors.logoUrl ? "error" : ""}
            placeholder="https://www.yourcompany.com/logo.png"
          />
          {errors.logoUrl && (
            <span className="error-message">{errors.logoUrl}</span>
          )}
        </div>

        {errors.submit && (
          <div className="error-message submit-error">{errors.submit}</div>
        )}

        <button type="submit" className="submit-button" disabled={loading}>
          {loading
            ? "Saving..."
            : existingCompany
            ? "Update Company"
            : "Create Company Profile"}
        </button>
      </form>

      <style jsx="true">{`
        .company-details-form {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        h2 {
          color: #333;
          margin-bottom: 0.5rem;
          text-align: center;
        }

        .form-description {
          color: #666;
          text-align: center;
          margin-bottom: 2rem;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        label {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #333;
        }

        input,
        select,
        textarea {
          padding: 0.75rem;
          border: 2px solid #e1e5e9;
          border-radius: 4px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        input:focus,
        select:focus,
        textarea:focus {
          outline: none;
          border-color: #007bff;
        }

        input.error,
        select.error,
        textarea.error {
          border-color: #dc3545;
        }

        .error-message {
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .submit-error {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 4px;
          padding: 0.75rem;
          margin-top: 1rem;
        }

        .submit-button {
          background: #007bff;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          margin-top: 1rem;
        }

        .submit-button:hover:not(:disabled) {
          background: #0056b3;
        }

        .submit-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        textarea {
          resize: vertical;
          min-height: 100px;
        }

        @media (max-width: 768px) {
          .company-details-form {
            margin: 1rem;
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CompanyDetailsForm;
