import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Building2, 
  Globe, 
  Settings,
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  Calendar,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { API_URL, resolveAssetUrl } from "@/config";
import LoadingOverlay from "@/components/LoadingOverlay";

function CompanyDashboard() {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applicationsTotal, setApplicationsTotal] = useState(0);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [isDescOpen, setIsDescOpen] = useState(false);
  const isDescLong = !!company?.description && company.description.length > 180;
  
  // Lightweight fetch helper with retry to handle transient network issues
  const fetchJSONWithRetry = async (url, options = {}, retries = 2, backoffMs = 600) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url, options);
        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }
        return await res.json();
      } catch (err) {
        if (attempt === retries) throw err;
        await new Promise((r) => setTimeout(r, backoffMs * (attempt + 1)));
      }
    }
  };

  // Resolve logo source to include backend host for relative '/uploads/..' paths
  const resolveLogoSrc = (value) => {
    return resolveAssetUrl(value);
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
      const companyData = await fetchJSONWithRetry(`${API_URL}/company`, {
        headers: { Authorization: `Bearer ${token}` },
      }, 2, 600);
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
      const jobsData = await fetchJSONWithRetry(`${API_URL}/job-postings/my-jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      }, 1, 500);
      setJobs(jobsData || []);

      // Fetch recent applications and total count
      const url = new URL(`${API_URL}/applications/company/all`);
      url.searchParams.set("page", "1");
      url.searchParams.set("limit", "3");
      const data = await fetchJSONWithRetry(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      }, 1, 500);
      setApplicationsTotal(data.pagination?.total || 0);
      setRecentApplicants(Array.isArray(data.applications) ? data.applications : []);
    } catch (e) {
      // Non-blocking for dashboard stats
      console.warn("CompanyDashboard: failed to load stats", e);
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading) {
    return <LoadingOverlay message="Loading Dashboard" />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#EAF6F9] dark:bg-[#0B1F3B] flex items-center justify-center transition-colors duration-500">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Error Loading Dashboard</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
              <Button 
                onClick={() => { setError(null); setLoading(true); setStatsLoading(true); fetchCompanyData(); fetchStats(); }} 
                className="bg-gradient-to-r from-[#155AA4] to-[#0574EE] hover:from-[#155AA4] hover:to-[#0574EE]/90 text-white font-medium px-6 py-2 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAF6F9] dark:bg-[#0B1F3B] transition-colors duration-500">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-grid-slate-100/[0.03] bg-[size:50px_50px]" />
      </div>

      {/* Page-level header removed to rely on global Navbar */}

      <div className="container mx-auto px-6 pt-8 pb-12 max-w-7xl">
        {/* Professional Company Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 to-blue-50/40 dark:from-slate-900/50 dark:to-slate-800/30 z-0" />
            <CardContent className="relative z-10 p-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Company Identity */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    {company.logoUrl ? (
                      <div className="flex-shrink-0">
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#155AA4]/20 to-[#0574EE]/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity" />
                          <img
                            src={resolveLogoSrc(company.logoUrl)}
                            alt={`${company.name} logo`}
                            className="relative w-24 h-24 rounded-3xl object-contain border-4 border-white dark:border-slate-700 shadow-2xl bg-white"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex-shrink-0">
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#155AA4]/20 to-[#0574EE]/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity" />
                          <div className="relative w-24 h-24 rounded-3xl border-4 border-white dark:border-slate-700 shadow-2xl bg-gradient-to-br from-[#155AA4] to-[#0574EE] text-white flex items-center justify-center">
                            <span className="text-3xl font-bold leading-none translate-y-[1px]">
                              {company.name?.charAt(0) || 'C'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0 space-y-4">
                      <div>
                        <div className="flex items-center gap-4 flex-wrap mb-2">
                          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-200 bg-clip-text text-transparent leading-tight">
                            {company.name}
                          </h1>
                          {company.verified ? (
                            <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-lg px-3 py-1.5 text-sm font-semibold">
                              <CheckCircle className="w-4 h-4 mr-1.5" />
                              Verified Company
                            </Badge>
                          ) : (
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg px-3 py-1.5 text-sm font-semibold">
                              <Clock className="w-4 h-4 mr-1.5" />
                              Verification Pending
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 flex-wrap">
                          {company.industry && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100/80 dark:bg-slate-800/60 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                              <Building2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{company.industry}</span>
                            </div>
                          )}
                          {company.website && (
                            <motion.a
                              whileHover={{ scale: 1.02 }}
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-blue-50/80 dark:bg-blue-900/20 rounded-full border border-blue-200/50 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100/80 dark:hover:bg-blue-900/30 transition-colors"
                            >
                              <Globe className="w-4 h-4" />
                              <span className="text-sm font-medium">Company Website</span>
                              <ExternalLink className="w-3 h-3" />
                            </motion.a>
                          )}
                        </div>
                      </div>
                      
                      {company.description && (
                        <div className="relative bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-[#77BEE0]/40 dark:border-[#155AA4]/40 shadow-sm overflow-hidden">
                          <p
                            className="text-slate-700 dark:text-slate-300 leading-relaxed text-base break-all whitespace-pre-wrap"
                            style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, overflow: 'hidden', overflowWrap: 'anywhere' }}
                          >
                            {company.description}
                          </p>
                          {isDescLong && (
                            <>
                              <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-12 bg-gradient-to-t from-slate-50 dark:from-slate-800/50 to-transparent rounded-b-2xl" />
                              <div className="mt-4 flex justify-end">
                                <Button size="sm" variant="outline" className="border-[#77BEE0] dark:border-[#155AA4]" onClick={() => setIsDescOpen(true)}>
                                  Read more
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Action Panel */}
                <div className="relative z-10 space-y-4">
                  <div className="bg-white/80 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/30">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Management</h3>
                    <div className="space-y-3">
                      <Button 
                        onClick={() => navigate('/jobs')}
                        className="w-full bg-gradient-to-r from-[#155AA4] to-[#0574EE] hover:from-[#155AA4] hover:to-[#0574EE]/90 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                      >
                        <Briefcase className="w-4 h-4" />
                        <span>Manage Jobs</span>
                      </Button>
                      <Button 
                        onClick={() => navigate('/company/applications')}
                        variant="outline"
                        className="w-full border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <Users className="w-4 h-4" />
                        <span>View Applications</span>
                      </Button>
                      <Button 
                        onClick={() => navigate('/company-setup')}
                        variant="ghost"
                        className="w-full hover:bg-slate-100 dark:hover:bg-slate-800/50 py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>


        {/* Professional Analytics Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                Company Analytics
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
                Overview of your hiring performance and job posting metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Active Jobs */}
                <div className="group">
                  <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/60 dark:from-blue-900/20 dark:to-blue-800/10 rounded-2xl p-6 border border-blue-200/30 dark:border-blue-800/20 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#155AA4] to-[#0574EE] rounded-xl flex items-center justify-center shadow-lg">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0">
                        Active
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Job Postings</p>
                      {statsLoading ? (
                        <div className="h-8 w-20 bg-slate-200/70 dark:bg-slate-700/50 rounded animate-pulse" />
                      ) : (
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">
                          {jobs.filter(j => j.status === 'PUBLISHED').length}
                        </div>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-500">Currently accepting applications</p>
                    </div>
                  </div>
                </div>

                {/* Total Applications */}
                <div className="group">
                  <div className="bg-gradient-to-br from-emerald-50/80 to-emerald-100/60 dark:from-emerald-900/20 dark:to-emerald-800/10 rounded-2xl p-6 border border-emerald-200/30 dark:border-emerald-800/20 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-0">
                        Total
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Applications</p>
                      {statsLoading ? (
                        <div className="h-8 w-20 bg-slate-200/70 dark:bg-slate-700/50 rounded animate-pulse" />
                      ) : (
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">
                          {applicationsTotal}
                        </div>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-500">All-time applications received</p>
                    </div>
                  </div>
                </div>

                

                {/* Recent Activity */}
                <div className="group">
                  <div className="bg-gradient-to-br from-purple-50/80 to-purple-100/60 dark:from-purple-900/20 dark:to-purple-800/10 rounded-2xl p-6 border border-purple-200/30 dark:border-purple-800/20 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0">
                        Recent
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Recent Applications</p>
                      {statsLoading ? (
                        <div className="h-8 w-20 bg-slate-200/70 dark:bg-slate-700/50 rounded animate-pulse" />
                      ) : (
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">
                          {recentApplicants.length}
                        </div>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-500">Last 7 days</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>


        {/* Professional Candidate Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="pb-6">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Candidate Pipeline
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
                    Recent applications and candidate activity
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {statsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 animate-spin rounded-full border-3 border-slate-200 border-t-[#155AA4] dark:border-slate-700 dark:border-t-[#0574EE]"></div>
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Loading candidate data...</span>
                  </div>
                </div>
              ) : recentApplicants.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Users className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Applications Yet</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-base mb-6 max-w-md mx-auto">
                    Your candidate pipeline is empty. Applications will appear here once job seekers start applying to your positions.
                  </p>
                  <Button 
                    onClick={() => navigate('/jobs')}
                    className="bg-gradient-to-r from-[#155AA4] to-[#0574EE] hover:from-[#155AA4] hover:to-[#0574EE]/90 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Create Job Posting
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentApplicants.slice(0,4).map((app, index) => (
                    <motion.div 
                      key={app.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="group relative bg-white/60 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/30 hover:bg-white/80 dark:hover:bg-slate-800/60 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className="relative flex-shrink-0">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#155AA4] to-[#0574EE] rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                              {app.jobSeeker?.fullName?.charAt(0) || 'U'}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg">
                              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-3">
                              <h4 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                                {app.jobSeeker?.fullName}
                              </h4>
                              <Badge className={`text-xs font-medium px-2 py-1 ${
                                app.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                                app.status === 'HIRED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                                app.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              } border-0`}>
                                {app.status}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                              <div className="flex items-center gap-1">
                                <Briefcase className="w-4 h-4" />
                                <span className="truncate">{app.job?.title}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(app.appliedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => navigate('/company/applications')}
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {recentApplicants.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-700/30">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Showing {Math.min(recentApplicants.length, 4)} of {applicationsTotal} total applications
                    </div>
                    <Button 
                      onClick={() => navigate('/company/applications')}
                      className="bg-gradient-to-r from-[#155AA4] to-[#0574EE] hover:from-[#155AA4] hover:to-[#0574EE]/90 text-white font-medium px-6 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                    >
                      <span>View All Applications</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Full Description Modal */}
        {company?.description && (
          <Dialog open={isDescOpen} onOpenChange={setIsDescOpen}>
            <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl bg-white dark:bg-slate-900 border border-[#77BEE0]/40 dark:border-[#155AA4]/40">
              <DialogHeader>
                <DialogTitle className="text-slate-900 dark:text-white">About {company.name}</DialogTitle>
                <DialogDescription className="text-slate-600 dark:text-slate-400">Company description</DialogDescription>
              </DialogHeader>
              <div className="text-slate-800 dark:text-slate-300 whitespace-pre-wrap break-words leading-relaxed">
                {company.description}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

export default CompanyDashboard;
