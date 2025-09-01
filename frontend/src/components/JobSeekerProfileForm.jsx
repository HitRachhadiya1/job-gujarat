import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus, User, Phone, MapPin, Link as LinkIcon, Star, Briefcase, Save, Shield } from 'lucide-react';

const JobSeekerProfileForm = ({ onSuccess }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    location: '',
    skills: [],
    experienceYears: '',
    resumeUrl: ''
  });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    fetchExistingProfile();
  }, []);

  const fetchExistingProfile = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('http://localhost:5000/api/job-seeker/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const profile = await response.json();
        setExistingProfile(profile);
        setFormData({
          fullName: profile.fullName || '',
          phone: profile.phone || '',
          location: profile.location || '',
          skills: profile.skills || [],
          experienceYears: profile.experienceYears?.toString() || '',
          resumeUrl: profile.resumeUrl || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await getAccessTokenSilently();
      const method = existingProfile ? 'PUT' : 'POST';
      
      const response = await fetch('http://localhost:5000/api/job-seeker/', {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : null
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        setExistingProfile(result.jobSeeker);
        if (onSuccess) onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('An error occurred while saving your profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillAdd = () => {
    const skill = skillInput.trim();
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      setSkillInput('');
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSkillAdd();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/30 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Professional Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(241,245,249,0.4)_1px,_transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,_rgba(51,65,85,0.1)_1px,_transparent_0)] bg-[length:60px_60px]"></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-8 max-w-4xl">
        {/* Professional Header */}
        <div className="mb-12">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl blur-sm opacity-20"></div>
              <div className="relative p-4 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-light tracking-tight text-slate-900 dark:text-slate-100">
                {existingProfile ? 'Update Profile' : 'Professional Profile'}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mt-2 font-light">
                Build your professional presence and unlock career opportunities
              </p>
            </div>
          </div>
        </div>

        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-slate-400 dark:hover:border-slate-600 focus-within:ring-2 focus-within:ring-slate-400 focus-within:border-slate-400 transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <Shield className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Professional Profile
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Complete your profile to unlock personalized job recommendations
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    Full Name
                  </label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="h-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:border-slate-500 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all duration-200"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:border-slate-500 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all duration-200"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  Location
                </label>
                <Input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="h-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:border-slate-500 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all duration-200"
                  placeholder="Enter your location"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="experienceYears" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  Experience Level
                </label>
                <select
                  id="experienceYears"
                  className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:border-slate-500 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all duration-200"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData(prev => ({ ...prev, experienceYears: e.target.value }))}
                >
                  <option value="">Select experience level</option>
                  <option value="0">Entry Level (0 years)</option>
                  <option value="1">1 year</option>
                  <option value="2">2 years</option>
                  <option value="3">3 years</option>
                  <option value="4">4 years</option>
                  <option value="5">5 years</option>
                  <option value="10">5-10 years</option>
                  <option value="15">10+ years</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Star className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  Skills & Expertise
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Add a skill and press Enter"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 h-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:border-slate-500 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all duration-200"
                  />
                  <Button 
                    type="button" 
                    onClick={handleSkillAdd} 
                    className="h-10 px-3 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-md transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 px-3 py-1 rounded-md flex items-center gap-2">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleSkillRemove(skill)}
                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="resumeUrl" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  Resume URL
                </label>
                <Input
                  type="url"
                  id="resumeUrl"
                  placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
                  value={formData.resumeUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, resumeUrl: e.target.value }))}
                  className="h-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:border-slate-500 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all duration-200"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Upload your resume to a cloud service and paste the public link here
                </p>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-11 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium rounded-md transition-colors duration-200 focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving Profile...' : existingProfile ? 'Update Profile' : 'Create Profile'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobSeekerProfileForm;
