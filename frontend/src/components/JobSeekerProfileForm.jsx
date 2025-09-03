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
    <div className="max-w-3xl mx-auto px-4 py-4">
      <Card className="bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader className="py-4">
          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span>{existingProfile ? 'Update Your Profile' : 'Create Your Job Seeker Profile'}</span>
            </CardTitle>
          </CardHeader>

        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Full Name *</span>
                </label>
                <Input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                  className="bg-white dark:bg-slate-800"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Phone Number</span>
                </label>
                <Input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="bg-white dark:bg-slate-800"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Location</span>
                </label>
                <Input
                  type="text"
                  id="location"
                  placeholder="City, State"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="bg-white dark:bg-slate-800"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="experienceYears" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Years of Experience</span>
                </label>
                <select
                  id="experienceYears"
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Skills</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Add a skill and press Enter"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 bg-white dark:bg-slate-800"
                  />
                  <Button type="button" onClick={handleSkillAdd} variant="outline" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleSkillRemove(skill)}
                        className="ml-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
            </div>

            <div className="md:col-span-2 space-y-2">
                <label htmlFor="resumeUrl" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                  <LinkIcon className="w-4 h-4" />
                  <span>Resume URL</span>
                </label>
                <Input
                  type="url"
                  id="resumeUrl"
                  placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
                  value={formData.resumeUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, resumeUrl: e.target.value }))}
                  className="bg-white dark:bg-slate-800"
                />
            </div>

            <div className="md:col-span-2 flex justify-end pt-2">
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-slate-700 hover:from-blue-700 hover:to-slate-800 text-white font-semibold px-5"
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
