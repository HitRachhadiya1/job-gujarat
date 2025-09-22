import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "lucide-react";
import LoadingOverlay from "@/components/LoadingOverlay";
import ApprovalProcessModal from "../components/ApprovalProcessModal";
import { API_URL } from "@/config";

const MyApplications = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [pagination, setPagination] = useState({});
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const url = new URL(
        `${API_URL}/applications/my-applications`
      );
      if (filter) url.searchParams.set("status", filter);

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
        console.error("Failed to fetch applications");
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApprovalProcess = (application) => {
    setSelectedApplication(application);
    setShowApprovalModal(true);
  };

  const handleCloseApprovalModal = () => {
    setShowApprovalModal(false);
    setSelectedApplication(null);
    // Refresh applications to get updated status
    fetchApplications();
  };

  const handleWithdraw = async (applicationId, jobTitle) => {
    if (
      !confirm(
        `Are you sure you want to withdraw your application for "${jobTitle}"?`
      )
    ) {
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `${API_URL}/applications/${applicationId}/withdraw`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        fetchApplications(); // Refresh the list
      } else {
        const error = await response.json();
        alert(error.error || "Failed to withdraw application");
      }
    } catch (error) {
      console.error("Error withdrawing application:", error);
      alert("An error occurred while withdrawing your application");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      APPLIED: {
        variant: "outline",
        text: "Applied",
        icon: Clock,
        className:
          "bg-stone-200/80 text-stone-900 border-stone-400/50 dark:bg-stone-800/50 dark:text-stone-300 dark:border-stone-600/50",
      },
      INTERVIEW: {
        variant: "outline",
        text: "Interview",
        icon: Users,
        className:
          "bg-stone-200/80 text-stone-900 border-stone-400/50 dark:bg-stone-800/50 dark:text-stone-300 dark:border-stone-600/50",
      },
      HIRED: {
        variant: "outline",
        text: "Hired",
        icon: CheckCircle,
        className:
          "bg-stone-200/80 text-stone-900 border-stone-400/50 dark:bg-stone-800/50 dark:text-stone-300 dark:border-stone-600/50",
      },
      REJECTED: {
        variant: "outline",
        text: "Rejected",
        icon: XCircle,
        className:
          "bg-stone-200/80 text-stone-900 border-stone-400/50 dark:bg-stone-800/50 dark:text-stone-300 dark:border-stone-600/50",
      },
    };

    const config = statusConfig[status] || {
      variant: "outline",
      text: status,
      icon: Clock,
      className: "",
    };
    const IconComponent = config.icon;

    return (
      <Badge
        variant={config.variant}
        className={`flex items-center gap-2 font-semibold px-3 py-1 rounded-xl ${config.className}`}
      >
        <IconComponent className="w-4 h-4" />
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return <LoadingOverlay message="Loading applications..." />;
  }

  return (
    <div className="min-h-screen bg-transparent py-0">
      <div className="container mx-auto px-4 max-w-none">
        {/* Compact Header */}
        <div className="mb-2">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-[#155AA4] to-[#0574EE] flex items-center justify-center shadow-sm">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              My Applications
            </h1>
          </div>
        </div>

        {/* Compact Filter Section */}
        <div className="mb-6 bg-transparent rounded-none border-0 shadow-none p-0">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-stone-600 dark:text-stone-400" />
            <label
              htmlFor="statusFilter"
              className="text-sm font-medium text-stone-700 dark:text-stone-300"
            >
              Filter:
            </label>
            <select
              id="statusFilter"
              className="px-3 py-2 border border-[#77BEE0] dark:border-[#155AA4] rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#0574EE] text-sm shadow-sm"
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

        {/* Results Summary */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-stone-700 dark:text-stone-400 font-medium">
            {pagination.total || 0} application
            {pagination.total !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Applications Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          {applications.length === 0 ? (
            <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-xl border border-[#77BEE0]/40 dark:border-stone-800 shadow-sm p-12 text-center">
              <FileText className="w-16 h-16 text-[#155AA4] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
                No applications found
              </h3>
              <p className="text-stone-600 dark:text-stone-400 mb-6">
                {filter
                  ? "Try changing your filter criteria."
                  : "You haven't applied to any jobs yet. Start browsing jobs to find opportunities!"}
              </p>
              {!filter && (
                <Button
                  size="sm"
                  className="bg-[#0574EE] hover:bg-[#155AA4] text-white"
                >
                  Browse Jobs
                </Button>
              )}
            </div>
          ) : (
            applications.map((application) => (
              <Card
                key={application.id}
                className="bg-white dark:bg-stone-900 border border-[#77BEE0]/40 dark:border-stone-800 shadow-sm hover:shadow-md transition-all duration-200 h-full rounded-xl"
              >
                <CardContent className="p-5 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2 line-clamp-2">
                        {application.job.title}
                      </h3>
                      <div className="flex items-center text-sm text-stone-600 dark:text-stone-400 mb-2">
                        <Building2 className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="mr-3 truncate">
                          {application.job.company?.name}
                        </span>
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {application.job.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge
                          variant="secondary"
                          className="text-xs px-2 py-1"
                        >
                          {application.job.jobType}
                        </Badge>
                        {getStatusBadge(application.status)}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 space-y-3">
                    <div className="flex items-center text-xs text-stone-600 dark:text-stone-400">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Applied: {formatDate(application.appliedAt)}</span>
                    </div>

                    {application.coverLetter && (
                      <div className="bg-stone-50 dark:bg-stone-800 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Cover Letter:
                        </p>
                        <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2">
                          {application.coverLetter.substring(0, 100)}
                          {application.coverLetter.length > 100 && "..."}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Approval Process for Hired Applications */}
                  {application.status === "HIRED" && (
                    <div className="mb-4">
                      {/* Check if approval process is completed */}
                      {application.aadhaarDocumentUrl ? (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            <div>
                              <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                                ✅ Process Completed & Fees Paid
                              </h4>
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                Your approval process is complete. The company
                                will contact you soon.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                              <div>
                                <h4 className="font-semibold text-green-900 dark:text-green-100">
                                  🎉 Congratulations! You're Hired!
                                </h4>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                  Complete your approval process to finalize
                                  your hiring
                                </p>
                              </div>
                            </div>
                            <Button
                              onClick={() =>
                                handleOpenApprovalProcess(application)
                              }
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Complete Process
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-auto flex gap-2 pt-3 border-t border-stone-200 dark:border-stone-700">
                    {application.status === "APPLIED" && (
                      <Button
                        onClick={() =>
                          handleWithdraw(application.id, application.job.title)
                        }
                        size="sm"
                        variant="destructive"
                        className="h-8 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Withdraw
                      </Button>
                    )}

                    {application.resumeSnapshot && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8 text-xs flex items-center gap-1"
                      >
                        <a
                          href={application.resumeSnapshot}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Resume
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

      {/* Approval Process Modal */}
      <ApprovalProcessModal
        isOpen={showApprovalModal}
        onClose={handleCloseApprovalModal}
        application={selectedApplication}
      />
    </div>
  );
};

export default MyApplications;
