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
  Users
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center space-x-3">
            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <span>My Applications</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Track your job applications and their current status
          </p>
        </div>

        {/* Filter Section */}
        <Card className="mb-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-slate-500" />
              <label htmlFor="statusFilter" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Filter by Status:
              </label>
              <select 
                id="statusFilter"
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-slate-600 dark:text-slate-400">
            {pagination.total || 0} application{(pagination.total !== 1) ? 's' : ''} found
          </p>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {applications.length === 0 ? (
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No applications found
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {filter ? 
                    'Try changing your filter criteria.' : 
                    "You haven't applied to any jobs yet. Start browsing jobs to find opportunities!"
                  }
                </p>
                {!filter && (
                  <Button asChild className="bg-gradient-to-r from-blue-600 to-slate-700 hover:from-blue-700 hover:to-slate-800 text-white">
                    <a href="/browse-jobs">Browse Jobs</a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            applications.map((application) => (
              <Card key={application.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                        {application.job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center space-x-1">
                          <Building2 className="w-4 h-4" />
                          <span>{application.job.company?.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{application.job.location}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {application.job.jobType}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(application.status)}
                    </div>
                  </div>

                  <div className="mb-4 space-y-2">
                    <div className="flex items-center space-x-1 text-sm text-slate-500 dark:text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Applied: {formatDate(application.appliedAt)}
                        {application.updatedAt !== application.appliedAt && (
                          <span> • Last Updated: {formatDate(application.updatedAt)}</span>
                        )}
                      </span>
                    </div>

                    {application.coverLetter && (
                      <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cover Letter:</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                          {application.coverLetter.substring(0, 150)}
                          {application.coverLetter.length > 150 && '...'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    {application.status === 'APPLIED' && (
                      <Button 
                        variant="destructive"
                        size="sm"
                        onClick={() => handleWithdraw(application.id, application.job.title)}
                        className="flex items-center space-x-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Withdraw</span>
                      </Button>
                    )}
                    
                    {application.resumeSnapshot && (
                      <Button 
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex items-center space-x-1"
                      >
                        <a 
                          href={application.resumeSnapshot}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>View Resume</span>
                        </a>
                      </Button>
                    )}
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
