import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Building2, 
  MapPin, 
  Calendar, 
  Trash2, 
  ExternalLink, 
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Star,
  Award,
  TrendingUp,
  Eye,
  Download
} from 'lucide-react';
import Spinner from '../components/Spinner';

const MyApplications = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const url = new URL('http://localhost:5000/api/applications/my-applications');
      if (filter) url.searchParams.set('status', filter);
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
        setPagination(data.pagination);
      } else {
        console.error('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId, jobTitle) => {
    if (!confirm(`Are you sure you want to withdraw your application for "${jobTitle}"?`)) {
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`http://localhost:5000/api/applications/${applicationId}/withdraw`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        fetchApplications(); // Refresh the list
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to withdraw application');
      }
    } catch (error) {
      console.error('Error withdrawing application:', error);
      alert('An error occurred while withdrawing your application');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      APPLIED: { variant: "default", text: 'Applied', icon: Clock, className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
      INTERVIEW: { variant: "secondary", text: 'Interview', icon: Users, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
      HIRED: { variant: "secondary", text: 'Hired', icon: CheckCircle, className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
      REJECTED: { variant: "secondary", text: 'Rejected', icon: XCircle, className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" }
    };
    
    const config = statusConfig[status] || { variant: "outline", text: status, icon: Clock, className: "" };
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className}`}>
        <IconComponent className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/30 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Professional Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(241,245,249,0.4)_1px,_transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,_rgba(51,65,85,0.1)_1px,_transparent_0)] bg-[length:60px_60px]"></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-8 max-w-6xl">
        {/* Professional Header */}
        <div className="mb-12">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl blur-sm opacity-20"></div>
              <div className="relative p-4 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <FileText className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-light tracking-tight text-slate-900 dark:text-slate-100">
                My Applications
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mt-2 font-light">
                Track your career journey and monitor application progress
              </p>
            </div>
          </div>
        </div>

        {/* Professional Filter Section */}
        <Card className="mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-slate-400 dark:hover:border-slate-600 focus-within:ring-2 focus-within:ring-slate-400 focus-within:border-slate-400 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <Filter className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Filter Applications</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Refine your view by application status</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label htmlFor="statusFilter" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Status:
                </label>
                <select 
                  id="statusFilter"
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 dark:focus:border-slate-400 transition-all duration-200 font-medium"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="">All Applications</option>
                    <option value="APPLIED">Applied</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="HIRED">Hired</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

        {/* Professional Results Summary */}
        <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <TrendingUp className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {pagination.total || 0} application{(pagination.total !== 1) ? 's' : ''} found
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Your complete application history
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Applications List */}
        <div className="space-y-8">
            {applications.length === 0 ? (
              <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <CardContent className="p-16 text-center">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mx-auto">
                      <FileText className="w-12 h-12 text-slate-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    {filter ? 'No Applications Match Filter' : 'Start Your Journey'}
                  </h3>
                  <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8">
                    {filter ? 
                      'Try adjusting your filter criteria to see more results.' : 
                      "Ready to take the next step? Explore amazing opportunities and start applying today!"
                    }
                  </p>
                  {!filter && (
                    <Button asChild className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200">
                      <a href="/browse-jobs">Browse Jobs</a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              applications.map((application) => (
                <Card key={application.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-slate-400 dark:hover:border-slate-600 focus-within:ring-2 focus-within:ring-slate-400 focus-within:border-slate-400 transition-all duration-300">
                  <CardContent className="p-6 relative">
                    <div className="flex flex-col space-y-6">
                      {/* Enhanced Application Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                              <Building2 className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                  {application.job.title}
                                </h3>
                                <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 px-3 py-1 rounded-md text-xs font-medium">
                                  APPLIED
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <span className="font-medium text-lg">{application.job.company?.name}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(application.status)}
                        </div>
                      </div>

                      {/* Enhanced Job Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gradient-to-r from-slate-50/50 to-blue-50/50 dark:from-slate-800/30 dark:to-blue-900/30 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                            <MapPin className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Location</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{application.job.location || 'Remote'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md">
                            <Calendar className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Applied</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatDate(application.appliedAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg shadow-md">
                            <Clock className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Type</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{application.job.jobType || 'Full-time'}</p>
                          </div>
                        </div>
                      </div>

                      {application.updatedAt !== application.appliedAt && (
                        <div className="p-4 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl border border-amber-200/50 dark:border-amber-800/30">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                              <Clock className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-sm font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">Last Updated</p>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {formatDate(application.updatedAt)}
                          </p>
                        </div>
                      )}

                      {application.coverLetter && (
                        <div className="p-6 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-2xl border border-indigo-200/50 dark:border-indigo-800/30">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                              <FileText className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-sm font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wide">Cover Letter</p>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {application.coverLetter.substring(0, 200)}
                            {application.coverLetter.length > 200 && '...'}
                          </p>
                        </div>
                      )}

                      {/* Enhanced Action Buttons */}
                      <div className="flex items-center justify-between pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                        <div className="flex items-center gap-4">
                          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 px-4 py-2 rounded-full font-bold shadow-lg">
                            {application.job.jobType || 'Full-time'}
                          </Badge>
                        </div>
                        <div className="flex gap-4">
                          {application.resumeSnapshot && (
                            <Button 
                              variant="outline"
                              asChild
                              className="border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl px-6 py-3 font-semibold transition-all duration-300 hover:scale-105"
                            >
                              <a 
                                href={application.resumeSnapshot}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                              >
                                <Download className="w-4 h-4" />
                                <span>Resume</span>
                              </a>
                            </Button>
                          )}
                          
                          {application.status === 'APPLIED' && (
                            <Button 
                              variant="destructive"
                              onClick={() => handleWithdraw(application.id, application.job.title)}
                              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Withdraw
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
        </div>
      </div>
    </div>
  );
};

export default MyApplications;
