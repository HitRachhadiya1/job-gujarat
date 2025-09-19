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
    return (
      <div className="min-h-screen bg-stone-300 dark:bg-stone-950 flex items-center justify-center transition-colors duration-500">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-400 border-t-stone-700 dark:border-stone-600 dark:border-t-stone-200"></div>
          <p className="text-stone-600 dark:text-stone-300 font-medium">Loading company settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-300 dark:bg-stone-950 flex items-center justify-center p-4 transition-colors duration-500">
        <Card className="max-w-md mx-auto bg-stone-100/95 dark:bg-stone-900/60 backdrop-blur-sm border-stone-400/70 dark:border-stone-800/50 shadow-lg">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2 tracking-tight">Error Loading Company Settings</h2>
            <p className="text-stone-700 dark:text-stone-400 mb-4 font-medium">{error}</p>
            <Button onClick={fetchCompanyData} className="bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEditing || !company) {
    return (
      <div className="min-h-screen bg-stone-300 dark:bg-stone-950 transition-colors duration-500">
        <CompanyDetailsForm
          existingCompany={company}
          onSuccess={company ? handleUpdateSuccess : handleCreateSuccess}
          onClose={company ? () => setIsEditing(false) : undefined}
        />
        {company && (
          <div className="fixed bottom-6 right-6">
            
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-300 dark:bg-stone-950 py-8 transition-colors duration-500">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2 tracking-tight">Company Settings</h1>
          <p className="text-stone-700 dark:text-stone-400 font-medium">Manage your company profile and information</p>
        </div>

        {/* Company Profile Card */}
        <Card className="mb-8 bg-stone-100/95 dark:bg-stone-900/60 backdrop-blur-sm border border-stone-400/70 dark:border-stone-800/50 shadow-xl rounded-2xl">
          <CardHeader className="pb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2 tracking-tight">
                  Company Profile
                </CardTitle>
                <CardDescription className="text-stone-700 dark:text-stone-400 font-medium">
                  Your company information as it appears to job seekers
                </CardDescription>
              </div>
              <Button 
                onClick={() => setIsEditing(true)} 
                className="bg-stone-900 hover:bg-stone-800 text-white flex items-center space-x-2 font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
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
                    className="rounded-xl object-contain border-2 border-stone-400 dark:border-stone-600 shadow-md bg-white"
                    style={{ maxWidth: '80px', maxHeight: '80px' }}
                  />
                </div>
              )}
              <div className="flex-grow">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                    {company.name}
                  </h2>
                  <Badge variant="secondary" className="text-sm bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-200">
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
                    className="inline-flex items-center space-x-1 text-stone-800 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors font-medium"
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
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-3 flex items-center tracking-tight">
                <FileText className="w-5 h-5 mr-2 text-stone-700 dark:text-stone-400" />
                About Company
              </h3>
              <p className="text-stone-800 dark:text-stone-300 leading-relaxed font-medium">
                {company.description}
              </p>
            </div>

            <Separator />

            {/* Company Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location */}
              {company.location && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-stone-600 dark:text-stone-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-stone-900 dark:text-stone-100 tracking-tight">Location</h4>
                    <p className="text-stone-700 dark:text-stone-400 font-medium">{company.location}</p>
                  </div>
                </div>
              )}

              {/* Company Size */}
              {company.size && (
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-stone-600 dark:text-stone-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-stone-900 dark:text-stone-100 tracking-tight">Company Size</h4>
                    <p className="text-stone-700 dark:text-stone-400 font-medium">{company.size}</p>
                  </div>
                </div>
              )}

              {/* Founded */}
              {company.founded && (
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-stone-600 dark:text-stone-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-stone-900 dark:text-stone-100 tracking-tight">Founded</h4>
                    <p className="text-stone-700 dark:text-stone-400 font-medium">{company.founded}</p>
                  </div>
                </div>
              )}

              {/* Email */}
              {company.email && (
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-stone-600 dark:text-stone-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-stone-900 dark:text-stone-100 tracking-tight">Email</h4>
                    <p className="text-stone-700 dark:text-stone-400 font-medium">{company.email}</p>
                  </div>
                </div>
              )}

              {/* Phone */}
              {company.phone && (
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-stone-600 dark:text-stone-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-stone-900 dark:text-stone-100 tracking-tight">Phone</h4>
                    <p className="text-stone-700 dark:text-stone-400 font-medium">{company.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        
      </div>
    </div>
  );
};

export default CompanySettings;
