import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Globe, Link as LinkIcon, Image, AlertCircle, Upload, X } from "lucide-react";

const CompanyDetailsForm = ({ onSuccess, existingCompany = null, refreshAuthMeta }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    description: "",
    website: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  function resolveLogoSrc(value) {
    if (!value) return "";
    if (value.startsWith('blob:') || value.startsWith('http')) return value;
    return `http://localhost:5000${value}`;
  }

  // Pre-populate form if editing existing company
  useEffect(() => {
    if (existingCompany) {
      setFormData({
        name: existingCompany.name || "",
        industry: existingCompany.industry || "",
        description: existingCompany.description || "",
        website: existingCompany.website || "",
      });
      if (existingCompany.logoUrl) {
        setLogoPreview(resolveLogoSrc(existingCompany.logoUrl));
      }
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

    // Require logo on create (not strictly required on update)
    if (!existingCompany && !logoFile) {
      newErrors.logo = "Company logo is required";
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

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, logo: "Logo file size must be less than 5MB" }));
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, logo: "Please select a valid image file" }));
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, logo: "" }));
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (logoPreview && logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
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

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('industry', formData.industry);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('website', formData.website);
      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span>
                {existingCompany
                  ? "Update Company Details"
                  : "Complete Your Company Profile"}
              </span>
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Please fill in your company information to continue using the platform.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                  <Building2 className="w-4 h-4" />
                  <span>Company Name *</span>
                </label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`bg-white dark:bg-slate-800 ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter your company name"
                />
                {errors.name && (
                  <div className="flex items-center space-x-1 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.name}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="industry" className="text-sm font-medium text-slate-700 dark:text-slate-300">Industry *</label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.industry ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                  }`}
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
                  <div className="flex items-center space-x-1 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.industry}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">Company Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`w-full min-h-[120px] p-3 border rounded-md resize-vertical bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                  }`}
                  placeholder="Describe your company, its mission, and what you do..."
                  rows="4"
                />
                {errors.description && (
                  <div className="flex items-center space-x-1 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.description}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="website" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>Website</span>
                </label>
                <Input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className={`bg-white dark:bg-slate-800 ${errors.website ? 'border-red-500' : ''}`}
                  placeholder="https://www.yourcompany.com"
                />
                {errors.website && (
                  <div className="flex items-center space-x-1 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.website}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                  <Image className="w-4 h-4" />
                  <span>Company Logo</span>
                </label>
                
                {logoPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={resolveLogoSrc(logoPreview)}
                      alt="Company logo preview"
                      className="w-24 h-24 object-cover rounded-lg border-2 border-slate-200 dark:border-slate-600"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Upload company logo</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
                    >
                      Choose File
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">PNG, JPG up to 5MB</p>
                  </div>
                )}
                
                {errors.logo && (
                  <div className="flex items-center space-x-1 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.logo}</span>
                  </div>
                )}
              </div>

              {errors.submit && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <p className="text-sm text-red-700 dark:text-red-400">{errors.submit}</p>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-slate-700 hover:from-blue-700 hover:to-slate-800 text-white font-semibold py-3"
                >
                  {loading
                    ? "Saving..."
                    : existingCompany
                    ? "Update Company"
                    : "Create Company Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyDetailsForm;
