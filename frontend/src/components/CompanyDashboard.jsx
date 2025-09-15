import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { useLogo } from "@/context/LogoContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Globe, 
  Settings,
  Briefcase, 
  Users, 
  BarChart3, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import Spinner from "./Spinner";

function CompanyDashboard() {
  const { isDark, toggleTheme } = useTheme();
  const { getAccessTokenSilently, user } = useAuth0();
  const { appLogo } = useLogo();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-300 dark:bg-stone-950 flex items-center justify-center transition-colors duration-500">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-400 border-t-stone-700 dark:border-stone-600 dark:border-t-stone-200"></div>
          <p className="text-stone-600 dark:text-stone-300 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-300 dark:bg-stone-950 flex items-center justify-center transition-colors duration-500">
        <Card className="max-w-md mx-auto bg-stone-100/95 dark:bg-stone-900/60 backdrop-blur-sm border-stone-400/70 dark:border-stone-800/50 shadow-lg">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2 tracking-tight">Error Loading Dashboard</h2>
            <p className="text-stone-800 dark:text-stone-400 mb-4 font-medium">{error}</p>
            <Button onClick={fetchCompanyData} className="bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-300 dark:bg-stone-950 py-8 transition-colors duration-500">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Company Header */}
        <Card className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-xl">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex items-center space-x-6">
                {company.logoUrl && (
                  <div className="flex-shrink-0">
                    <img
                      src={`http://localhost:5000${company.logoUrl}`}
                      alt={`${company.name} logo`}
                      className="rounded-xl object-contain border-2 border-slate-200 dark:border-slate-600 shadow-md bg-white"
                      style={{ maxWidth: '80px', maxHeight: '80px' }}
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2 tracking-tight">
                    {company.name}
                  </h1>
                  <div className="flex items-center space-x-3 mb-3">
                    <Badge variant="secondary" className="text-sm bg-stone-200/80 text-stone-900 border-stone-400/50 dark:bg-stone-800/50 dark:text-stone-300 dark:border-stone-600/50">
                      <Building2 className="w-4 h-4 mr-1" />
                      {company.industry}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      {company.verified ? (
                        <Badge className="bg-stone-200/80 text-stone-900 border-stone-400/50 dark:bg-stone-800/50 dark:text-stone-300 dark:border-stone-600/50">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-stone-300/80 text-stone-800 border-stone-500/50 dark:bg-stone-700/50 dark:text-stone-400 dark:border-stone-600/50">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-stone-800 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Visit Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
              <Button 
                onClick={() => navigate('/company-setup')} 
                className="bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Company Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Company Description */}
        <Card className="mb-8 bg-stone-100/95 dark:bg-stone-900/60 backdrop-blur-sm border-stone-400/70 dark:border-stone-800/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-stone-900 dark:text-stone-100 tracking-tight">
              <Building2 className="w-5 h-5 text-stone-800 dark:text-stone-300" />
              <span>About Us</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-stone-800 dark:text-stone-400 leading-relaxed font-medium">
              {company.description}
            </p>
          </CardContent>
        </Card>

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Job Postings */}
          <Card className="bg-stone-100/95 dark:bg-stone-900/60 backdrop-blur-sm border-stone-400/70 dark:border-stone-800/50 shadow-lg hover:shadow-xl transition-all duration-200 group">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-stone-900 dark:text-stone-100 tracking-tight">
                <Briefcase className="w-5 h-5 text-stone-800 dark:text-stone-300" />
                <span>Job Postings</span>
              </CardTitle>
              <CardDescription className="text-stone-700 dark:text-stone-400 font-medium">
                Manage your job postings and view applications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/jobs')}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Manage Job Postings
              </Button>
            </CardContent>
          </Card>

          {/* Applications */}
          <Card className="bg-stone-100/95 dark:bg-stone-900/60 backdrop-blur-sm border-stone-400/70 dark:border-stone-800/50 shadow-lg hover:shadow-xl transition-all duration-200 group">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-stone-900 dark:text-stone-100 tracking-tight">
                <Users className="w-5 h-5 text-stone-800 dark:text-stone-300" />
                <span>Applications</span>
              </CardTitle>
              <CardDescription className="text-stone-700 dark:text-stone-400 font-medium">
                Review and manage job applications from candidates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/company/applications')}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                View Applications
              </Button>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card className="bg-stone-100/95 dark:bg-stone-900/60 backdrop-blur-sm border-stone-400/70 dark:border-stone-800/50 shadow-lg hover:shadow-xl transition-all duration-200 group">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-stone-900 dark:text-stone-100 tracking-tight">
                <BarChart3 className="w-5 h-5 text-stone-800 dark:text-stone-300" />
                <span>Company Analytics</span>
              </CardTitle>
              <CardDescription className="text-stone-700 dark:text-stone-400 font-medium">
                View insights about your job postings and company profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-stone-700 hover:bg-stone-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg"
                disabled
              >
                View Analytics
                <Badge variant="secondary" className="ml-2 text-xs bg-stone-200/80 text-stone-700 border-stone-400/50 dark:bg-stone-800/50 dark:text-stone-400 dark:border-stone-600/50">
                  Coming Soon
                </Badge>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CompanyDashboard;
