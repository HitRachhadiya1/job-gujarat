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
      APPLIED: { variant: "outline", text: 'Applied', icon: Clock, className: "bg-stone-200/80 text-stone-900 border-stone-400/50 dark:bg-stone-800/50 dark:text-stone-300 dark:border-stone-600/50" },
      INTERVIEW: { variant: "outline", text: 'Interview', icon: Users, className: "bg-stone-200/80 text-stone-900 border-stone-400/50 dark:bg-stone-800/50 dark:text-stone-300 dark:border-stone-600/50" },
      HIRED: { variant: "outline", text: 'Hired', icon: CheckCircle, className: "bg-stone-200/80 text-stone-900 border-stone-400/50 dark:bg-stone-800/50 dark:text-stone-300 dark:border-stone-600/50" },
      REJECTED: { variant: "outline", text: 'Rejected', icon: XCircle, className: "bg-stone-200/80 text-stone-900 border-stone-400/50 dark:bg-stone-800/50 dark:text-stone-300 dark:border-stone-600/50" }
    };
    
    const config = statusConfig[status] || { variant: "outline", text: status, icon: Clock, className: "" };
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className={`flex items-center gap-2 font-semibold px-3 py-1 rounded-xl ${config.className}`}>
        <IconComponent className="w-4 h-4" />
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
    <div className="min-h-screen bg-stone-200/50 dark:bg-stone-950/50 py-8">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-stone-900 dark:text-stone-100 mb-4 flex items-center space-x-4 tracking-tight">
            <div className="w-16 h-16 bg-gradient-to-br from-stone-300/90 to-stone-400/70 dark:from-stone-800 dark:to-stone-700 rounded-3xl flex items-center justify-center shadow-lg">
              <FileText className="w-8 h-8 text-stone-900 dark:text-stone-300" />
            </div>
            <span>My Applications</span>
          </h1>
          <p className="text-xl text-stone-800 dark:text-stone-400 font-medium">
            Track your job applications and their current status
          </p>
        </div>

        {/* Filter Section */}
        <Card className="mb-8 bg-stone-100/95 dark:bg-stone-900/60 backdrop-blur-sm border-stone-400/70 dark:border-stone-800/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <div className="w-10 h-10 bg-gradient-to-br from-stone-300/90 to-stone-400/70 dark:from-stone-800 dark:to-stone-700 rounded-2xl flex items-center justify-center shadow-md">
                <Filter className="w-5 h-5 text-stone-900 dark:text-stone-300" />
              </div>
              <label htmlFor="statusFilter" className="text-sm font-bold text-stone-900 dark:text-stone-200">
                Filter by Status:
              </label>
              <select 
                id="statusFilter"
                className="px-4 py-3 border border-stone-400/50 dark:border-stone-700 rounded-xl bg-stone-50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 font-medium focus:outline-none focus:ring-2 focus:ring-stone-600 focus:border-transparent transition-all duration-200"
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
        <div className="mb-8">
          <p className="text-stone-800 dark:text-stone-400 font-medium text-lg">
            {pagination.total || 0} application{(pagination.total !== 1) ? 's' : ''} found
          </p>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {applications.length === 0 ? (
            <Card className="bg-stone-100/95 dark:bg-stone-900/60 backdrop-blur-sm border-stone-400/70 dark:border-stone-800/50 shadow-lg">
              <CardContent className="p-16 text-center">
                <FileText className="w-20 h-20 text-stone-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-4">
                  No applications found
                </h3>
                <p className="text-stone-800 dark:text-stone-400 mb-8 text-lg font-medium">
                  {filter ? 
                    'Try changing your filter criteria.' : 
                    "You haven't applied to any jobs yet. Start browsing jobs to find opportunities!"
                  }
                </p>
                {!filter && (
                  <Button className="bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl">
                    Browse Jobs
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            applications.map((application) => (
              <Card key={application.id} className="bg-stone-100/95 dark:bg-stone-900/60 backdrop-blur-sm border-stone-400/70 dark:border-stone-800/50 shadow-lg hover:shadow-xl transition-all duration-200 border-l-4 border-l-stone-600">
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3 tracking-tight">
                        {application.job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-6 text-sm text-stone-700 dark:text-stone-400">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-5 h-5" />
                          <span className="font-medium">{application.job.company?.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-5 h-5" />
                          <span className="font-medium">{application.job.location}</span>
                        </div>
                        <Badge className="bg-stone-200/80 text-stone-900 border-stone-400/50 dark:bg-stone-800/50 dark:text-stone-300 dark:border-stone-600/50 font-semibold px-3 py-1 rounded-xl">
                          {application.job.jobType}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(application.status)}
                    </div>
                  </div>

                  <div className="mb-6 space-y-4">
                    <div className="flex items-center space-x-3 text-sm text-stone-700 dark:text-stone-400">
                      <Calendar className="w-5 h-5" />
                      <span className="font-medium">
                        Applied: {formatDate(application.appliedAt)}
                        {application.updatedAt !== application.appliedAt && (
                          <span> • Last Updated: {formatDate(application.updatedAt)}</span>
                        )}
                      </span>
                    </div>

                    {application.coverLetter && (
                      <div className="bg-stone-200/50 dark:bg-stone-800/30 p-4 rounded-xl">
                        <p className="text-sm font-bold text-stone-900 dark:text-stone-200 mb-2">Cover Letter:</p>
                        <p className="text-sm text-stone-800 dark:text-stone-400 font-medium line-clamp-3">
                          {application.coverLetter.substring(0, 150)}
                          {application.coverLetter.length > 150 && '...'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 pt-6 border-t border-stone-400/30 dark:border-stone-700">
                    {application.status === 'APPLIED' && (
                      <Button 
                        onClick={() => handleWithdraw(application.id, application.job.title)}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Withdraw</span>
                      </Button>
                    )}
                    
                    {application.resumeSnapshot && (
                      <Button 
                        variant="outline"
                        asChild
                        className="border-stone-400/70 dark:border-stone-600 text-stone-800 dark:text-stone-300 font-semibold py-2 px-4 rounded-xl transition-all duration-200 hover:bg-stone-200/50 dark:hover:bg-stone-800/30 flex items-center space-x-2"
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
