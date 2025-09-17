import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X, MapPin, Building2, DollarSign, Clock, User, Upload, FileText } from 'lucide-react';

const JobApplicationModal = ({ job, isOpen, onClose, onApplicationSubmitted }) => {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [errorData, setErrorData] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [existingResume, setExistingResume] = useState(null);
  const [checkingResume, setCheckingResume] = useState(true);

  // Check for existing resume when modal opens or job changes
  React.useEffect(() => {
    if (isOpen && job?.id) {
      checkExistingResume();
    }
  }, [isOpen, job?.id]);

  const checkExistingResume = async () => {
    try {
      setCheckingResume(true);
      const token = await getAccessTokenSilently();
      const response = await fetch(`http://localhost:5000/api/applications/check-resume/${job.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.hasResume) {
          setExistingResume({
            url: data.resumeUrl,
            fileName: data.fileName
          });
        } else {
          setExistingResume(null);
        }
      }
    } catch (error) {
      console.error('Error checking existing resume:', error);
    } finally {
      setCheckingResume(false);
    }
  };

  const validateResumeFile = (file) => {
    if (file.type !== 'application/pdf') {
      setError('Resume must be a PDF file');
      return false;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB
      setError('Resume file size must be less than 2MB');
      return false;
    }
    return true;
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file && validateResumeFile(file)) {
      setResumeFile(file);
      setError(''); // Clear any previous errors
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate resume is required (either new file or existing resume)
    if (!resumeFile && !existingResume) {
      setError('Please upload your resume to apply for this job');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = await getAccessTokenSilently();
      let resumeUrl = null;

      // Use existing resume or upload new one
      if (resumeFile) {
        // Upload new resume
        setUploadingResume(true);
        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('jobId', job.id);

        const uploadResponse = await fetch('http://localhost:5000/api/applications/upload-resume', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          throw new Error(uploadError.error || 'Failed to upload resume');
        }

        const uploadResult = await uploadResponse.json();
        resumeUrl = uploadResult.resumeUrl;
        setUploadingResume(false);
      } else if (existingResume) {
        // Use existing resume
        resumeUrl = existingResume.url;
      }

      // Then, submit the application with the resume URL
      const response = await fetch('http://localhost:5000/api/applications/apply', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: job.id,
          coverLetter: coverLetter.trim() || null,
          resumeUrl: resumeUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onApplicationSubmitted(data.application);
        onClose();
        setCoverLetter('');
      } else {
        setError(data.error || 'Failed to submit application');
        setErrorData(data);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('An error occurred while submitting your application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Apply for {job.title}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Submit your application to this position
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center space-x-2 mb-2">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {job.company?.name}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span className="text-slate-600 dark:text-slate-400">{job.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <Badge variant="secondary" className="text-xs">
                {job.jobType}
              </Badge>
            </div>
            {job.salaryRange && (
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600 dark:text-slate-400">{job.salaryRange}</span>
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label 
                htmlFor="coverLetter" 
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Cover Letter (Optional)
              </label>
              <textarea
                id="coverLetter"
                className="w-full min-h-[120px] p-3 border border-slate-300 dark:border-slate-600 rounded-md resize-vertical text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Write a brief cover letter explaining why you're interested in this position and what makes you a good fit..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This will help your application stand out to the employer.
              </p>
            </div>

            {/* Resume Upload Section */}
            <div className="space-y-2">
              <label 
                htmlFor="resumeUpload" 
                className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Resume (Required) *</span>
              </label>
              
              {checkingResume ? (
                <div className="flex items-center justify-center p-4 text-slate-500">
                  <span className="text-sm">Checking for existing resume...</span>
                </div>
              ) : existingResume && !resumeFile ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-900 dark:text-green-100">
                        Resume already uploaded for this job
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExistingResume(null)}
                      className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                      title="Upload different resume"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Click the X to upload a different resume for this job
                  </p>
                </div>
              ) : !resumeFile ? (
                <>
                  <input
                    type="file"
                    id="resumeUpload"
                    accept=".pdf"
                    onChange={handleResumeChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="resumeUpload"
                    className="flex items-center justify-center w-full p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-md cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="text-center">
                      <Upload className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Click to upload PDF resume (max 2MB)
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        Upload a targeted resume for this specific position
                      </p>
                    </div>
                  </label>
                </>
              ) : (
                <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-300 dark:border-slate-600">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {resumeFile.name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      ({(resumeFile.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setResumeFile(null)}
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    title="Remove resume"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                {errorData?.requiresProfile && (
                  <div className="mt-3">
                    <Button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate('/?view=profile');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Complete Your Profile
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobApplicationModal;
