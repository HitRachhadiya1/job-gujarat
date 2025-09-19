import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, FileText, X, CheckCircle, AlertCircle, CreditCard, IndianRupee, Clock, Eye } from 'lucide-react';

const ApprovalProcessModal = ({ isOpen, onClose, application }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [step, setStep] = useState('loading'); // loading, document-selection, processing, completed
  const [feeInfo, setFeeInfo] = useState(null);
  const [existingAadhaar, setExistingAadhaar] = useState(null);
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && application) {
      fetchApprovalFeeInfo();
    }
  }, [isOpen, application]);

  const fetchApprovalFeeInfo = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      
      // Fetch only fee info - no need to check existing documents
      const feeResponse = await fetch(`http://localhost:5000/api/applications/${application.id}/approval-fee`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const feeData = await feeResponse.json();

      if (feeResponse.ok) {
        setFeeInfo(feeData);
      } else {
        setError(feeData.error || 'Failed to fetch approval fee information');
      }

      // Always start with document selection step
      setStep('document-selection');
      
    } catch (error) {
      console.error('Error fetching approval info:', error);
      setError('An error occurred while fetching information');
      setStep('document-selection');
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 3 * 1024 * 1024; // 3MB

    if (!allowedTypes.includes(file.type)) {
      return 'Only JPEG and PNG images are allowed';
    }
    if (file.size > maxSize) {
      return 'File size must be less than 3MB';
    }
    return null;
  };

  const handleFrontFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        setError(error);
        return;
      }
      setFrontFile(file);
      setError('');
    }
  };

  const handleBackFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        setError(error);
        return;
      }
      setBackFile(file);
      setError('');
    }
  };

  const handlePayAndUpload = async () => {
    // Check if we have both documents selected
    if (!frontFile || !backFile) {
      setError('Please select both front and back images of your Aadhaar card');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const token = await getAccessTokenSilently();

      // Step 1: Create Razorpay order
      const orderResponse = await fetch('http://localhost:5000/api/payments/create-approval-order', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: feeInfo.approvalFee,
          currency: 'INR',
          applicationId: application.id,
          paymentType: 'APPROVAL_FEE'
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create payment order');
      }

      // Step 2: Get publishable Razorpay key from backend and open Razorpay checkout
      const keyResponse = await fetch('http://localhost:5000/api/payments/key');
      const keyData = await keyResponse.json();
      const razorpayKey = keyData?.key;

      if (!razorpayKey) {
        throw new Error('Razorpay key not configured');
      }

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Job Gujarat',
        description: `Approval Fee - ${feeInfo.jobTitle}`,
        order_id: orderData.id,
        handler: async (response) => {
          try {
            // Step 3: Verify payment
            const verifyResponse = await fetch('http://localhost:5000/api/payments/verify-approval-payment', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                applicationId: application.id
              }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(verifyData.error || 'Payment verification failed');
            }

            // Immediately show completion state to user; continue uploading in background
            setStep('completed');

            // Step 4: Upload Aadhaar documents after successful payment
            const formData = new FormData();
            formData.append('front', frontFile);
            formData.append('back', backFile);
            formData.append('applicationId', application.id);

            const uploadResponse = await fetch('http://localhost:5000/api/applications/upload-aadhaar', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            });

            const uploadData = await uploadResponse.json();

            if (!uploadResponse.ok) {
              throw new Error(uploadData.error || 'Failed to upload Aadhaar documents');
            }
          } catch (error) {
            console.error('Error after payment:', error);
            setError(error.message || 'An error occurred after payment');
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            setError('Payment was cancelled');
          }
        },
        theme: {
          color: '#2563eb'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Error in pay and upload process:', error);
      setError(error.message || 'An error occurred during the process');
      setProcessing(false);
    }
  };

  const renderLoadingStep = () => (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-sm text-slate-600 dark:text-slate-400">Loading approval process...</p>
      </div>
    </div>
  );

  const renderDocumentSelectionStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Complete Approval Process
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Select your Aadhaar documents and pay the approval fee
        </p>
      </div>

      {/* Upload Documents */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-900 dark:text-slate-100 flex items-center">
            <Upload className="w-5 h-5 mr-2 text-blue-600" />
            Upload Aadhaar Documents
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Please upload clear images of both front and back sides of your Aadhaar card
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {/* Front Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Aadhaar Front Image
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFrontFileChange}
                className="hidden"
                id="front-upload"
              />
              <label
                htmlFor="front-upload"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20"
              >
                {frontFile ? (
                  <div className="text-center">
                    <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">{frontFile.name}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {(frontFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-sm text-blue-600 dark:text-blue-400">Click to upload front image</p>
                    <p className="text-xs text-blue-500 dark:text-blue-500">PNG, JPG up to 3MB</p>
                  </div>
                )}
              </label>
              {frontFile && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 h-6 w-6 p-0 bg-red-100 hover:bg-red-200 text-red-600"
                  onClick={() => setFrontFile(null)}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Back Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Aadhaar Back Image
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleBackFileChange}
                className="hidden"
                id="back-upload"
              />
              <label
                htmlFor="back-upload"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20"
              >
                {backFile ? (
                  <div className="text-center">
                    <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">{backFile.name}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {(backFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-sm text-blue-600 dark:text-blue-400">Click to upload back image</p>
                    <p className="text-xs text-blue-500 dark:text-blue-500">PNG, JPG up to 3MB</p>
                  </div>
                )}
              </label>
              {backFile && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 h-6 w-6 p-0 bg-red-100 hover:bg-red-200 text-red-600"
                  onClick={() => setBackFile(null)}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Information */}
      {feeInfo && (
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-900 dark:text-slate-100 flex items-center">
              <IndianRupee className="w-5 h-5 mr-2 text-green-600" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Job Position:</span>
                <span className="text-sm text-slate-900 dark:text-slate-100">{feeInfo.jobTitle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Company:</span>
                <span className="text-sm text-slate-900 dark:text-slate-100">{feeInfo.companyName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Monthly Salary:</span>
                <span className="text-sm text-slate-900 dark:text-slate-100">₹{feeInfo.monthlySalary.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-600 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-slate-900 dark:text-slate-100">Approval Fee:</span>
                  <div className="flex items-center">
                    <IndianRupee className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {feeInfo.approvalFee}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onClose}
          variant="outline"
          className="flex-1"
          disabled={processing}
        >
          Cancel
        </Button>
        <Button
          onClick={handlePayAndUpload}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          disabled={processing}
        >
          {processing ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              Pay & Upload ₹{feeInfo?.approvalFee || 0}
            </div>
          )}
        </Button>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
        <p className="text-xs text-amber-700 dark:text-amber-300 text-center">
          <AlertCircle className="w-3 h-3 inline mr-1" />
          Both front and back images are required. Payment will be processed via Razorpay.
        </p>
      </div>
    </div>
  );

  const renderCompletedStep = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          🎉 Process Complete!
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Your approval fee has been paid successfully and documents have been uploaded.
        </p>
      </div>

      <div className="space-y-3">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2 text-green-700 dark:text-green-300">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Fee Paid Successfully</span>
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2 text-green-700 dark:text-green-300">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Documents Uploaded Successfully</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          The company will contact you soon with further details about your joining process.
        </p>
      </div>

      <Button
        onClick={onClose}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        Close
      </Button>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span>Complete Hiring Process</span>
          </DialogTitle>
          <DialogDescription>
            {step === 'loading' && 'Loading your approval process information...'}
            {step === 'document-selection' && 'Select your Aadhaar documents and pay the approval fee'}
            {step === 'processing' && 'Processing your payment and uploading documents...'}
            {step === 'completed' && 'Your hiring process has been completed successfully'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {loading && renderLoadingStep()}
        {!loading && step === 'document-selection' && renderDocumentSelectionStep()}
        {!loading && step === 'completed' && renderCompletedStep()}
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalProcessModal;
