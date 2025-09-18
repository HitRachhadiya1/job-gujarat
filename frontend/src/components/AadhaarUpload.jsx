import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';

const AadhaarUpload = ({ application, onUploadComplete }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [existingAadhaar, setExistingAadhaar] = useState(null);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Check for existing Aadhaar documents on component mount
  React.useEffect(() => {
    checkExistingAadhaar();
  }, []);

  const checkExistingAadhaar = async () => {
    try {
      setCheckingExisting(true);
      const token = await getAccessTokenSilently();
      const response = await fetch('http://localhost:5000/api/applications/check-aadhaar', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.hasAadhaar) {
        setExistingAadhaar(data.aadhaarUrls);
        setShowUploadForm(false);
      } else {
        setExistingAadhaar(null);
        setShowUploadForm(true);
      }
    } catch (error) {
      console.error('Error checking existing Aadhaar:', error);
      setShowUploadForm(true);
    } finally {
      setCheckingExisting(false);
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

  const handleUpload = async () => {
    if (!frontFile || !backFile) {
      setError('Please select both front and back images of your Aadhaar card');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const token = await getAccessTokenSilently();
      const formData = new FormData();
      formData.append('front', frontFile);
      formData.append('back', backFile);
      formData.append('applicationId', application.id);

      const response = await fetch('http://localhost:5000/api/applications/upload-aadhaar', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFrontFile(null);
        setBackFile(null);
        setExistingAadhaar(data.aadhaarUrls);
        setShowUploadForm(false);
        if (onUploadComplete) {
          onUploadComplete(data.application);
        }
      } else {
        setError(data.error || 'Failed to upload Aadhaar documents');
      }
    } catch (error) {
      console.error('Error uploading Aadhaar:', error);
      setError('An error occurred while uploading your documents');
    } finally {
      setUploading(false);
    }
  };

  // Show loading state while checking
  if (checkingExisting) {
    return (
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                Checking Aadhaar Documents
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Please wait while we check for existing documents...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show existing Aadhaar documents
  if (existingAadhaar && !showUploadForm) {
    return (
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                Aadhaar Documents Uploaded Successfully
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your Aadhaar documents are ready and will be used for this application.
              </p>
              {existingAadhaar?.uploadedAt && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Uploaded on: {new Date(existingAadhaar.uploadedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          
          {/* Option to upload new documents */}
          <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-700">
            <Button
              onClick={() => setShowUploadForm(true)}
              variant="outline"
              className="w-full text-green-700 border-green-300 hover:bg-green-100 dark:text-green-300 dark:border-green-600 dark:hover:bg-green-900/30"
            >
              <X className="w-4 h-4 mr-2" />
              Upload New Aadhaar Documents
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <div>
            <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
              Aadhaar Card Upload Required
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              Congratulations! You've been hired for <strong>{application.job.title}</strong> at{' '}
              <strong>{application.job.company.name}</strong>. Please upload your Aadhaar card to complete the hiring process.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Front Image Upload */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Aadhaar Card - Front Side
          </label>
          {!frontFile ? (
            <>
              <input
                type="file"
                id="frontUpload"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFrontFileChange}
                className="hidden"
              />
              <label
                htmlFor="frontUpload"
                className="flex items-center justify-center w-full p-4 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-md cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-blue-50 dark:bg-blue-900/20"
              >
                <div className="text-center">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Click to upload front side (max 3MB)
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    JPEG or PNG format
                  </p>
                </div>
              </label>
            </>
          ) : (
            <div className="flex items-center justify-between p-3 bg-blue-100 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-700">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {frontFile.name}
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  ({(frontFile.size / 1024 / 1024).toFixed(1)} MB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFrontFile(null)}
                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Back Image Upload */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Aadhaar Card - Back Side
          </label>
          {!backFile ? (
            <>
              <input
                type="file"
                id="backUpload"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleBackFileChange}
                className="hidden"
              />
              <label
                htmlFor="backUpload"
                className="flex items-center justify-center w-full p-4 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-md cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-blue-50 dark:bg-blue-900/20"
              >
                <div className="text-center">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Click to upload back side (max 3MB)
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    JPEG or PNG format
                  </p>
                </div>
              </label>
            </>
          ) : (
            <div className="flex items-center justify-between p-3 bg-blue-100 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-700">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {backFile.name}
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  ({(backFile.size / 1024 / 1024).toFixed(1)} MB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setBackFile(null)}
                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="pt-4 border-t border-blue-200 dark:border-blue-700">
          <Button
            onClick={handleUpload}
            disabled={uploading || !frontFile || !backFile}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {uploading ? 'Uploading Documents...' : 'Upload Aadhaar Documents'}
          </Button>
        </div>

        <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
          <p>• Please ensure both sides of your Aadhaar card are clearly visible</p>
          <p>• Images should be in good quality and readable</p>
          <p>• Only JPEG and PNG formats are accepted</p>
          <p>• Maximum file size: 3MB per image</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AadhaarUpload;
