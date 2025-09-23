import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X, MapPin, Building2, IndianRupee, Clock, User, Upload, FileText } from 'lucide-react';
import { API_URL } from "@/config";

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

  // Reset resume state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setResumeFile(null);
      setExistingResume(null);
      setCheckingResume(false);
    }
  }, [isOpen]);

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

    setIsSubmitting(true);
    setError('');

    try {
      const token = await getAccessTokenSilently();

      // Create payment order for ₹9 application fee (no resume upload yet)
      const paymentResponse = await fetch(`${API_URL}/payments/create-application-fee`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: job.id,
        }),
      });

      if (!paymentResponse.ok) {
        const paymentError = await paymentResponse.json();
        
        // Handle specific case where job seeker profile doesn't exist
        if (paymentResponse.status === 403 && paymentError.error === "JobSeeker profile not found") {
          setError('Please complete your profile before applying for jobs');
          setErrorData({ requiresProfile: true });
          return;
        }
        
        throw new Error(paymentError.error || 'Failed to create payment order');
      }

      const paymentOrder = await paymentResponse.json();

      // Get Razorpay key
      const keyResponse = await fetch(`${API_URL}/payments/key`);
      const { key } = await keyResponse.json();

      // Initialize Razorpay payment
      const options = {
        key: key,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'Job Gujarat',
        description: `Application fee for ${job.title}`,
        order_id: paymentOrder.id,
        handler: async function (response) {
          try {
            let finalResumeUrl = null;

            // Upload resume AFTER successful payment only if a file was selected
            if (resumeFile) {
              setUploadingResume(true);
              const formData = new FormData();
              formData.append('resume', resumeFile);
              formData.append('jobId', job.id);

              const uploadResponse = await fetch(`${API_URL}/applications/upload-resume`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                body: formData,
              });

              if (!uploadResponse.ok) {
                const uploadError = await uploadResponse.json();
                throw new Error(uploadError.error || 'Failed to upload resume after payment');
              }

              const uploadResult = await uploadResponse.json();
              finalResumeUrl = uploadResult.resumeUrl;
              setUploadingResume(false);
            }

            // Confirm payment and create application with resume URL
            const confirmResponse = await fetch(`${API_URL}/payments/confirm-application`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                payment: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
                jobId: job.id,
                coverLetter: coverLetter.trim() || null,
                ...(finalResumeUrl ? { resumeUrl: finalResumeUrl } : {}),
              }),
            });

            const confirmData = await confirmResponse.json();

            if (confirmResponse.ok) {
              onApplicationSubmitted(confirmData.application);
              onClose();
              setCoverLetter('');
              setResumeFile(null);
              setExistingResume(null);
            } else {
              setError(confirmData.error || 'Failed to confirm payment');
            }
          } catch (error) {
            console.error('Error confirming payment:', error);
            setError('Payment confirmation failed');
          } finally {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: 'Job Seeker',
          email: '',
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: function() {
            setIsSubmitting(false);
            setError('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error submitting application:', error);
      
      // Check if it's a profile-related error
      if (error.message.includes('JobSeeker profile not found') || error.message.includes('profile')) {
        setError('Please complete your profile before applying for jobs');
        setErrorData({ requiresProfile: true });
      } else {
        setError(error.message || 'An error occurred while submitting your application');
      }
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
            disabled={isSubmitting}
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
                <IndianRupee className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600 dark:text-slate-400">{job.salaryRange}</span>
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">Resume Upload (optional)</h4>
              
              {!resumeFile ? (
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
                        You can apply without a resume. If you select one, it will upload after payment.
                      </p>
                    </div>
                  </label>
                </>
              ) : (
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {resumeFile.name}
                      </span>
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        Ready to upload after payment • {(resumeFile.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                    </div>
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
              <div className={`p-4 rounded-md border ${
                errorData?.requiresProfile 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                <p className={`text-sm font-medium ${
                  errorData?.requiresProfile 
                    ? 'text-blue-800 dark:text-blue-200' 
                    : 'text-red-700 dark:text-red-400'
                }`}>
                  {error}
                </p>
                {errorData?.requiresProfile && (
                  <div className="mt-3">
                    <Button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate('/profile');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 font-medium"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Complete Your Profile Now
                    </Button>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      You need to complete your profile to apply for jobs. This helps employers learn more about you.
                    </p>
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
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <span className="h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    {uploadingResume ? 'Uploading Resume...' : 'Processing...'}
                  </span>
                ) : (
                  'Pay ₹9 & Apply'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobApplicationModal;
