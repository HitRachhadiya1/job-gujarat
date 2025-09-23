import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Users, Filter, Calendar, MapPin, Briefcase, ChevronDown, CheckCircle, Clock, UserCheck, XCircle, FileText, Eye } from 'lucide-react';
import { API_URL } from '@/config';
import LoadingOverlay from "@/components/LoadingOverlay";

const CompanyApplications = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [aadhaarModalOpen, setAadhaarModalOpen] = useState(false);
  const [aadhaarLoading, setAadhaarLoading] = useState(false);
  const [aadhaarError, setAadhaarError] = useState('');
  const [aadhaarDocs, setAadhaarDocs] = useState(null);
  const [aadhaarApp, setAadhaarApp] = useState(null);

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchApplications = async (page = 1) => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const url = new URL(`${API_URL}/applications/company/all`);
      url.searchParams.set("page", page.toString());
      url.searchParams.set("limit", "20");
      if (filter) url.searchParams.set("status", filter);

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to fetch applications");
      }

      const data = await res.json();
      setApplications(data.applications || []);
      setPagination(
        data.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 }
      );
    } catch (e) {
      console.error("Error fetching company applications:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAadhaar = async (application) => {
    try {
      setAadhaarApp(application);
      setAadhaarModalOpen(true);
      setAadhaarLoading(true);
      setAadhaarError('');
      setAadhaarDocs(null);

      const token = await getAccessTokenSilently();
      const res = await fetch(`${API_URL}/applications/${application.id}/aadhaar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch Aadhaar documents');
      }
      const docs = data.aadhaarDocuments || {};
      const front = docs.front || null;
      const back = docs.back || null;
      if (!front && !back) {
        setAadhaarError('Aadhaar documents are not uploaded yet for this candidate.');
      } else {
        setAadhaarDocs({ front, back });
      }
    } catch (e) {
      setAadhaarError(e.message || 'Failed to load Aadhaar documents');
    } finally {
      setAadhaarLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      setUpdatingStatus((prev) => ({ ...prev, [applicationId]: true }));
      const token = await getAccessTokenSilently();

      const response = await fetch(
        `${API_URL}/applications/${applicationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to update status");
      }

      // Update the local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? { ...app, status: newStatus, updatedAt: new Date().toISOString() }
            : app
        )
      );
    } catch (error) {
      console.error("Error updating application status:", error);
      alert("Failed to update application status. Please try again.");
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [applicationId]: false }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "APPLIED":
        return <Clock className="w-4 h-4" />;
      case "INTERVIEW":
        return <UserCheck className="w-4 h-4" />;
      case "HIRED":
        return <CheckCircle className="w-4 h-4" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPLIED":
        return "bg-stone-200/80 text-stone-800 dark:bg-stone-800/50 dark:text-stone-300";
      case "INTERVIEW":
        return "bg-stone-300/80 text-stone-800 dark:bg-stone-700/50 dark:text-stone-300";
      case "HIRED":
        return "bg-stone-200/80 text-stone-900 dark:bg-stone-800/50 dark:text-stone-200";
      case "REJECTED":
        return "bg-stone-300/80 text-stone-700 dark:bg-stone-700/50 dark:text-stone-400";
      default:
        return "bg-stone-200/80 text-stone-800 dark:bg-stone-800/50 dark:text-stone-300";
    }
  };

  if (loading) {
    return <LoadingOverlay message="Loading Applications..." />;
  }

  return (
    <div className="min-h-screen bg-[#EAF6F9] dark:bg-[#0B1F3B] pt-8 py-8 transition-colors duration-500">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-3 tracking-tight">
            <Users className="w-8 h-8 text-stone-800 dark:text-stone-300" />
            <span>Applications for Your Jobs</span>
          </h1>
          <p className="text-lg text-stone-700 dark:text-stone-400 font-medium">
            Review and manage candidates who applied to your postings
          </p>
        </div>

        <Card className="mb-6 bg-white dark:bg-stone-900 border border-[#77BEE0]/40 dark:border-[#155AA4]/40 shadow-lg rounded-2xl">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                <label
                  htmlFor="statusFilter"
                  className="text-sm font-medium text-stone-700 dark:text-stone-300"
                >
                  Filter by Status:
                </label>
              </div>
              <select
                id="statusFilter"
                className="px-3 py-2 border border-[#77BEE0] dark:border-[#155AA4] rounded-md bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#0574EE] w-full sm:w-60"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">All</option>
                <option value="APPLIED">Applied</option>
                <option value="INTERVIEW">Interview</option>
                <option value="HIRED">Hired</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <div className="sm:ml-auto text-stone-700 dark:text-stone-400 font-medium">
                {pagination.total || 0} total
              </div>
            </div>
          </CardContent>
        </Card>

        {applications.length === 0 ? (
          <Card className="bg-white dark:bg-stone-900 border border-[#77BEE0]/40 dark:border-[#155AA4]/40 shadow-lg rounded-2xl">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-stone-500 dark:text-stone-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2 tracking-tight">
                No applications
              </h3>
              <p className="text-stone-700 dark:text-stone-400 font-medium">
                No candidates found for the selected filter.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card
                key={app.id}
                className="bg-white dark:bg-stone-900 border border-[#77BEE0]/40 dark:border-[#155AA4]/40 hover:shadow-xl transition-all duration-200 shadow-lg rounded-2xl"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
                        {app.job?.title}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-stone-700 dark:text-stone-400 mt-1 font-medium">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{app.job?.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          <Badge variant="outline">{app.job?.jobType}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-3 w-full sm:w-auto">
                      <div
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          app.status
                        )}`}
                      >
                        {getStatusIcon(app.status)}
                        <span className="uppercase">{app.status}</span>
                      </div>

                      {/* Status Update Dropdown */}
                      <div className="relative w-full sm:w-auto">
                        <select
                          value={app.status}
                          onChange={(e) =>
                            updateApplicationStatus(app.id, e.target.value)
                          }
                          disabled={updatingStatus[app.id]}
                          className="appearance-none bg-white dark:bg-stone-900 border border-[#77BEE0] dark:border-[#155AA4] rounded-md px-3 py-1 text-sm font-medium text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#0574EE] disabled:opacity-50 disabled:cursor-not-allowed pr-8 w-full sm:w-auto"
                        >
                          <option value="APPLIED">Applied</option>
                          <option value="INTERVIEW">Interview</option>
                          <option value="HIRED">Hired</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-500 dark:text-stone-400 pointer-events-none" />
                        {updatingStatus[app.id] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-stone-900/80 rounded-md">
                            <div className="w-4 h-4 border-2 border-stone-600 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-stone-600 dark:text-stone-400 flex items-center gap-2 font-medium">
                        <Calendar className="w-4 h-4" />
                        Applied: {formatDate(app.appliedAt)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm">
                        <span className="font-medium text-stone-700 dark:text-stone-300">
                          Candidate:
                        </span>{" "}
                        {app.jobSeeker?.fullName} · {app.jobSeeker?.location}
                      </div>
                      {app.jobSeeker?.skills?.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-2">
                          {app.jobSeeker.skills.slice(0, 5).map((s, idx) => (
                            <Badge key={idx} variant="secondary">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {app.resumeSnapshot && (
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(app.resumeSnapshot, "_blank")
                            }
                            className="flex items-center gap-2 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100"
                          >
                            <FileText className="w-4 h-4" />
                            View Resume
                          </Button>
                        </div>
                      )}
                      {app.status === 'HIRED' && (
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewAadhaar(app)}
                            className="flex items-center gap-2 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100"
                          >
                            <Eye className="w-4 h-4" />
                            View Aadhaar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Simple pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-6">
            <Button
              variant="outline"
              className="border-[#77BEE0] text-[#155AA4] hover:bg-[#77BEE0]/20"
              disabled={pagination.page <= 1}
              onClick={() => fetchApplications(pagination.page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-stone-700 dark:text-white font-medium">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              className="border-[#77BEE0] text-[#155AA4] hover:bg-[#77BEE0]/20"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchApplications(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
      {/* Aadhaar Documents Modal */}
      <Dialog open={aadhaarModalOpen} onOpenChange={setAadhaarModalOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl sm:rounded-xl">
          <DialogHeader>
            <DialogTitle>Candidate Aadhaar Documents</DialogTitle>
            <DialogDescription>
              {aadhaarApp?.job?.title ? `For ${aadhaarApp.job.title}` : 'View uploaded documents'}
            </DialogDescription>
          </DialogHeader>
          {aadhaarLoading ? (
            <div className="flex items-center justify-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : aadhaarError ? (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-700 dark:text-red-300">
              {aadhaarError}
            </div>
          ) : aadhaarDocs ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {aadhaarDocs.front && (
                <div>
                  <div className="text-sm font-medium mb-2">Front</div>
                  <img src={aadhaarDocs.front} alt="Aadhaar Front" className="w-full rounded-md border" />
                </div>
              )}
              {aadhaarDocs.back && (
                <div>
                  <div className="text-sm font-medium mb-2">Back</div>
                  <img src={aadhaarDocs.back} alt="Aadhaar Back" className="w-full rounded-md border" />
                </div>
              )}
              {!aadhaarDocs.front && !aadhaarDocs.back && (
                <div className="text-sm text-stone-600 dark:text-stone-300">No Aadhaar documents available.</div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyApplications;
