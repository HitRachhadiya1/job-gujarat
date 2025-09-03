import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  Globe, 
  Edit3, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  ExternalLink,
  MapPin,
  Users,
  Calendar,
  Mail,
  Phone,
  FileText
} from "lucide-react";
import CompanyDetailsForm from "../components/CompanyDetailsForm";
import Spinner from "../components/Spinner";
import { useAuthMeta } from "../context/AuthMetaContext";

const CompanySettings = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { refreshAuthMeta } = useAuthMeta();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Resolve logo source to include backend host for relative '/uploads/..' paths
  const resolveLogoSrc = (value) => {
    if (!value) return "";
    if (value.startsWith("http") || value.startsWith("blob:")) return value;
    return `http://localhost:5000${value}`;
  };

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
        if (response.status === 404) {
          // No company profile exists yet
          setCompany(null);
        } else {
          throw new Error("Failed to fetch company data");
        }
      } else {
        const companyData = await response.json();
        setCompany(companyData);
      }
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
    refreshAuthMeta(); // Refresh to update company status
  };

  const handleCreateSuccess = (newCompany) => {
    setCompany(newCompany);
    setIsEditing(false);
    refreshAuthMeta(); // Refresh to update company status
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Error Loading Company Settings</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
            <Button onClick={fetchCompanyData} className="bg-blue-600 hover:bg-blue-700">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEditing || !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <CompanyDetailsForm
          existingCompany={company}
          onSuccess={company ? handleUpdateSuccess : handleCreateSuccess}
        />
        {company && (
          <div className="fixed bottom-6 right-6">
            <Button 
              onClick={() => setIsEditing(false)} 
              variant="outline"
              className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Company Settings</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your company profile and information</p>
        </div>

        {/* Company Profile Card */}
        <Card className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader className="pb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Company Profile
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Your company information as it appears to job seekers
                </CardDescription>
              </div>
              <Button 
                onClick={() => setIsEditing(true)} 
                className="bg-gradient-to-r from-blue-600 to-slate-700 hover:from-blue-700 hover:to-slate-800 text-white flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Company Details</span>
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Company Header Info */}
            <div className="flex flex-col md:flex-row items-start gap-6">
              {company.logoUrl && (
                <div className="flex-shrink-0">
                  <img
                    src={resolveLogoSrc(company.logoUrl)}
                    alt={`${company.name} logo`}
                    className="rounded-xl object-contain border-2 border-slate-200 dark:border-slate-600 shadow-md bg-white"
                    style={{ maxWidth: '80px', maxHeight: '80px' }}
                  />
                </div>
              )}
              <div className="flex-grow">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {company.name}
                  </h2>
                  <Badge variant="secondary" className="text-sm">
                    <Building2 className="w-4 h-4 mr-1" />
                    {company.industry}
                  </Badge>
                  {company.verified ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                      <Clock className="w-3 h-3 mr-1" />
                      Unverified
                    </Badge>
                  )}
                </div>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Visit Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <Separator />

            {/* Company Description */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                About Company
              </h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {company.description}
              </p>
            </div>

            <Separator />

            {/* Company Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location */}
              {company.location && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Location</h4>
                    <p className="text-slate-600 dark:text-slate-400">{company.location}</p>
                  </div>
                </div>
              )}

              {/* Company Size */}
              {company.size && (
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Company Size</h4>
                    <p className="text-slate-600 dark:text-slate-400">{company.size}</p>
                  </div>
                </div>
              )}

              {/* Founded */}
              {company.founded && (
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Founded</h4>
                    <p className="text-slate-600 dark:text-slate-400">{company.founded}</p>
                  </div>
                </div>
              )}

              {/* Email */}
              {company.email && (
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Email</h4>
                    <p className="text-slate-600 dark:text-slate-400">{company.email}</p>
                  </div>
                </div>
              )}

              {/* Phone */}
              {company.phone && (
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Phone</h4>
                    <p className="text-slate-600 dark:text-slate-400">{company.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Quick Actions
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Manage your company presence on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                onClick={() => navigate('/jobs')}
                variant="outline"
                className="justify-start space-x-2"
              >
                <Building2 className="w-4 h-4" />
                <span>Manage Job Postings</span>
              </Button>
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="justify-start space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>View Dashboard</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanySettings;
