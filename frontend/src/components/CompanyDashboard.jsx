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
  CheckCircle, 
  Clock,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import Spinner from "./Spinner";
import ThemeToggle from "./ThemeToggle";
import AppLogo from "./AppLogo";

function CompanyDashboard() {
  const { isDark, toggleTheme } = useTheme();
  const { getAccessTokenSilently, user } = useAuth0();
  const { appLogo } = useLogo();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applicationsTotal, setApplicationsTotal] = useState(0);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Resolve logo source to include backend host for relative '/uploads/..' paths
  const resolveLogoSrc = (value) => {
    if (!value) return "";
    if (value.startsWith("http") || value.startsWith("blob:")) return value;
    return `http://localhost:5000${value}`;
  };

  useEffect(() => {
    fetchCompanyData();
  }, []);

  useEffect(() => {
    fetchStats();
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

  const fetchStats = async () => {
    try {
      const token = await getAccessTokenSilently();

      // Fetch company's jobs to compute active job count and applications sum (fallback)
      const jobsRes = await fetch("http://localhost:5000/api/job-postings/my-jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData || []);
      }

      // Fetch recent applications and total count
      const url = new URL("http://localhost:5000/api/applications/company/all");
      url.searchParams.set("page", "1");
      url.searchParams.set("limit", "3");
      const appsRes = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (appsRes.ok) {
        const data = await appsRes.json();
        setApplicationsTotal(data.pagination?.total || 0);
        setRecentApplicants(Array.isArray(data.applications) ? data.applications : []);
      }
    } catch (e) {
      // Non-blocking for dashboard stats
      console.warn("CompanyDashboard: failed to load stats", e);
    } finally {
      setStatsLoading(false);
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
    <div className="min-h-screen bg-[#EAF6F9] dark:bg-stone-950 pt-24 pb-10 transition-colors duration-500">
      {/* Header - Solid Professional Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 h-20 bg-[#155AA4] dark:bg-[#155AA4] border-b border-[#77BEE0]/40 shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
        <div className="h-full flex items-center justify-between px-6 md:px-8">
          {/* Brand + Welcome */}
          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-3">
              <AppLogo size="w-10 h-10" rounded="rounded-lg" mode="contain" />
              <div className="leading-tight">
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Job Gujarat</h1>
                <p className="text-[10px] md:text-xs text-white/90">Employer Portal</p>
              </div>
            </div>
            <span className="hidden md:inline-block text-white/60">|</span>
            <h2 className="hidden md:block text-base md:text-lg font-semibold text-white/90">
              {`Welcome, ${user?.given_name || user?.name?.split(" ")[0] || "User"}`}
            </h2>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="bg-white/10 rounded-lg p-1 border border-white/20">
              <ThemeToggle />
            </div>
            <img
              src={
                user?.picture ||
                "https://via.placeholder.com/40/78716c/FFFFFF?text=U"
              }
              alt="Profile"
              className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-white/70 shadow-md"
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Company Header */}
        <Card className="mb-8 bg-stone-100/95 dark:bg-stone-900/60 backdrop-blur-sm border border-stone-400/70 dark:border-stone-800/50 shadow-xl rounded-2xl">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex items-center space-x-6">
                {company.logoUrl && (
                  <div className="flex-shrink-0">
                    <img
                      src={resolveLogoSrc(company.logoUrl)}
                      alt={`${company.name} logo`}
                      className="w-16 h-16 rounded-xl object-contain border border-stone-300 dark:border-stone-700 shadow-md bg-white"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                      {company.name}
                    </h1>
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
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="secondary" className="text-sm bg-stone-200/80 text-stone-900 border-stone-400/50 dark:bg-stone-800/50 dark:text-stone-300 dark:border-stone-600/50">
                      <Building2 className="w-4 h-4 mr-1" />
                      {company.industry}
                    </Badge>
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-stone-800 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        <span>Visit Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/company-setup')} 
                className="bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>View Profile</span>
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

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/80 dark:bg-stone-900/60 backdrop-blur-sm border border-stone-300/70 dark:border-stone-800/60 shadow-md hover:shadow-lg transition-all duration-200 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm text-stone-500 dark:text-stone-400">Active Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-stone-900 dark:text-stone-100">
                  {statsLoading ? '—' : jobs.filter(j => j.status === 'PUBLISHED').length}
                </div>
                <div className="w-10 h-10 rounded-xl bg-stone-200/80 dark:bg-stone-800/50 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-stone-700 dark:text-stone-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-stone-900/60 backdrop-blur-sm border border-stone-300/70 dark:border-stone-800/60 shadow-md hover:shadow-lg transition-all duration-200 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm text-stone-500 dark:text-stone-400">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-stone-900 dark:text-stone-100">
                  {statsLoading ? '—' : applicationsTotal}
                </div>
                <div className="w-10 h-10 rounded-xl bg-stone-200/80 dark:bg-stone-800/50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-stone-700 dark:text-stone-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applicants */}
        <Card className="mt-8 bg-stone-100/95 dark:bg-stone-900/60 backdrop-blur-sm border-stone-400/70 dark:border-stone-800/50 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-stone-900 dark:text-stone-100 tracking-tight">
              <Users className="w-5 h-5 text-stone-800 dark:text-stone-300" />
              <span>Recent Applicants</span>
            </CardTitle>
            <CardDescription className="text-stone-700 dark:text-stone-400 font-medium">
              Latest candidates who applied to your jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="text-stone-600 dark:text-stone-300">Loading...</div>
            ) : recentApplicants.length === 0 ? (
              <div className="text-stone-700 dark:text-stone-400 font-medium">No recent applications.</div>
            ) : (
              <div className="divide-y divide-stone-300/60 dark:divide-stone-800/60">
                {recentApplicants.slice(0,3).map((app) => (
                  <div key={app.id} className="py-4 flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="text-stone-900 dark:text-stone-100 font-semibold truncate">{app.jobSeeker?.fullName}</div>
                      <div className="text-sm text-stone-600 dark:text-stone-400 truncate">{app.job?.title}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="uppercase bg-stone-200/80 text-stone-900 border-stone-400/50 dark:bg-stone-800/50 dark:text-stone-300 dark:border-stone-600/50">{app.status}</Badge>
                      <div className="text-sm text-stone-600 dark:text-stone-400">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline"
                onClick={() => navigate('/company/applications')}
                className="border-stone-400 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-xl"
              >
                View All Applications
              </Button>
            </div>
          </CardContent>
        </Card>

        
      </div>
    </div>
  );
}

export default CompanyDashboard;
