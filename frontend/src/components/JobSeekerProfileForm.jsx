import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus, User, Phone, MapPin, Clock, Link as LinkIcon } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Card className="bg-stone-100/95 dark:bg-stone-900/60 backdrop-blur-sm border-stone-400/70 dark:border-stone-800/50 shadow-lg">
        <CardHeader className="py-8 px-8">
          <CardTitle className="text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-stone-300/90 to-stone-400/70 dark:from-stone-800 dark:to-stone-700 rounded-3xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-stone-900 dark:text-stone-300" />
              </div>
              <span>{existingProfile ? 'Update Your Profile' : 'Create Your Professional Profile'}</span>
            </CardTitle>
            <CardDescription className="text-stone-800 dark:text-stone-400 font-medium text-lg mt-2">
              Build your professional presence and connect with top employers
            </CardDescription>
          </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-3">
                <label htmlFor="fullName" className="text-sm font-bold text-stone-900 dark:text-stone-200 flex items-center space-x-3">
                  <User className="w-5 h-5 text-stone-700 dark:text-stone-400" />
                  <span>Full Name *</span>
                </label>
                <Input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                  className="bg-stone-50 dark:bg-stone-800/50 border-stone-400/50 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-medium py-3 px-4 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-stone-600 focus:border-transparent"
                />
            </div>

            <div className="space-y-3">
                <label htmlFor="phone" className="text-sm font-bold text-stone-900 dark:text-stone-200 flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-stone-700 dark:text-stone-400" />
                  <span>Phone Number</span>
                </label>
                <Input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="bg-stone-50 dark:bg-stone-800/50 border-stone-400/50 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-medium py-3 px-4 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-stone-600 focus:border-transparent"
                />
            </div>

            <div className="space-y-3">
                <label htmlFor="location" className="text-sm font-bold text-stone-900 dark:text-stone-200 flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-stone-700 dark:text-stone-400" />
                  <span>Location</span>
                </label>
                <Input
                  type="text"
                  id="location"
                  placeholder="City, State"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="bg-stone-50 dark:bg-stone-800/50 border-stone-400/50 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-medium py-3 px-4 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-stone-600 focus:border-transparent"
                />
            </div>

            <div className="space-y-3">
                <label htmlFor="experienceYears" className="text-sm font-bold text-stone-900 dark:text-stone-200 flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-stone-700 dark:text-stone-400" />
                  <span>Years of Experience</span>
                </label>
                <select
                  id="experienceYears"
                  className="w-full py-3 px-4 border border-stone-400/50 dark:border-stone-700 rounded-xl bg-stone-50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 font-medium focus:outline-none focus:ring-2 focus:ring-stone-600 focus:border-transparent transition-all duration-200"
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

            <div className="md:col-span-2 space-y-3">
                <label className="text-sm font-bold text-stone-900 dark:text-stone-200">Skills</label>
                <div className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="Add a skill and press Enter"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 bg-stone-50 dark:bg-stone-800/50 border-stone-400/50 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-medium py-3 px-4 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-stone-600 focus:border-transparent"
                  />
                  <Button 
                    type="button" 
                    onClick={handleSkillAdd} 
                    className="bg-stone-900 hover:bg-stone-800 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} className="bg-stone-200/80 text-stone-900 border-stone-400/50 dark:bg-stone-800/50 dark:text-stone-300 dark:border-stone-600/50 font-semibold px-3 py-2 rounded-xl flex items-center gap-2">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleSkillRemove(skill)}
                        className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </Badge>
                  ))}
                </div>
            </div>

            <div className="md:col-span-2 space-y-3">
                <label htmlFor="resumeUrl" className="text-sm font-bold text-stone-900 dark:text-stone-200 flex items-center space-x-3">
                  <LinkIcon className="w-5 h-5 text-stone-700 dark:text-stone-400" />
                  <span>Resume URL</span>
                </label>
                <Input
                  type="url"
                  id="resumeUrl"
                  placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
                  value={formData.resumeUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, resumeUrl: e.target.value }))}
                  className="bg-stone-50 dark:bg-stone-800/50 border-stone-400/50 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-medium py-3 px-4 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-stone-600 focus:border-transparent"
                />
            </div>

            <div className="md:col-span-2 flex justify-end pt-6">
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-stone-900 hover:bg-stone-800 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : existingProfile ? 'Update Profile' : 'Create Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobSeekerProfileForm;
