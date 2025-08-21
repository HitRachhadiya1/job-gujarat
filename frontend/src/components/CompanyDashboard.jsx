import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Globe, 
  Edit3, 
  Briefcase, 
  Users, 
  BarChart3, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import CompanyDetailsForm from "./CompanyDetailsForm";
import Spinner from "./Spinner";

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
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Error Loading Dashboard</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
            <Button onClick={fetchCompanyData} className="bg-blue-600 hover:bg-blue-700">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div>
        <CompanyDetailsForm
          existingCompany={company}
          onSuccess={handleUpdateSuccess}
        />
        <div className="fixed bottom-6 right-6">
          <Button 
            onClick={() => setIsEditing(false)} 
            variant="outline"
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Company Header */}
        <Card className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-xl">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex items-center space-x-6">
                {company.logoUrl && (
                  <div className="flex-shrink-0">
                    <img
                      src={company.logoUrl}
                      alt={`${company.name} logo`}
                      className="w-20 h-20 rounded-xl object-cover border-2 border-slate-200 dark:border-slate-600 shadow-md"
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    {company.name}
                  </h1>
                  <div className="flex items-center space-x-3 mb-3">
                    <Badge variant="secondary" className="text-sm">
                      <Building2 className="w-4 h-4 mr-1" />
                      {company.industry}
                    </Badge>
                    <div className="flex items-center space-x-1">
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
              <Button 
                onClick={() => setIsEditing(true)} 
                className="bg-gradient-to-r from-blue-600 to-slate-700 hover:from-blue-700 hover:to-slate-800 text-white flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Company Details</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Company Description */}
        <Card className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>About Us</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {company.description}
            </p>
          </CardContent>
        </Card>

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Job Postings */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span>Job Postings</span>
              </CardTitle>
              <CardDescription>
                Manage your job postings and view applications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/jobs')}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
              >
                Manage Job Postings
              </Button>
            </CardContent>
          </Card>

          {/* Applications */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Applications</span>
              </CardTitle>
              <CardDescription>
                Review and manage job applications from candidates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                disabled
              >
                View Applications
                <Badge variant="secondary" className="ml-2 text-xs">
                  Coming Soon
                </Badge>
              </Button>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Company Analytics</span>
              </CardTitle>
              <CardDescription>
                View insights about your job postings and company profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                disabled
              >
                View Analytics
                <Badge variant="secondary" className="ml-2 text-xs">
                  Coming Soon
                </Badge>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
