import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  Link as LinkIcon, 
  Edit,
  Briefcase,
  Award,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';

const JobSeekerProfileDisplay = ({ profile, onEdit, onBack }) => {
  const getExperienceText = (years) => {
    if (years === 0) return 'Entry Level';
    if (years === 1) return '1 year';
    if (years <= 5) return `${years} years`;
    if (years === 10) return '5-10 years';
    if (years === 15) return '10+ years';
    return `${years} years`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-2">
      {/* Header Section */}
      <div className="mb-4">
        <Card className="bg-gradient-to-r from-blue-50 to-slate-50 dark:from-blue-900/20 dark:to-slate-800/20 border border-blue-200 dark:border-blue-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-slate-700 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{profile.fullName}</h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {profile.experienceYears !== null && profile.experienceYears !== undefined 
                      ? `${getExperienceText(profile.experienceYears)} Experience` 
                      : 'Job Seeker'}
                    {profile.location && ` • ${profile.location}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {onBack && (
                  <Button onClick={onBack} variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                )}
                <Button 
                  onClick={onEdit}
                  className="bg-gradient-to-r from-blue-600 to-slate-700 hover:from-blue-700 hover:to-slate-800 text-white shadow-md"
                  size="sm"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {/* Main Content */}
        <div className="space-y-4">
          {/* Contact Information */}
          <Card className="bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {profile.phone && (
                  <div className="flex items-center space-x-2 p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700/50">
                    <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Phone</p>
                      <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">{profile.phone}</p>
                    </div>
                  </div>
                )}
                
                {profile.location && (
                  <div className="flex items-center space-x-2 p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-700/50">
                    <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">Location</p>
                      <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">{profile.location}</p>
                    </div>
                  </div>
                )}
                
                {profile.experienceYears !== null && profile.experienceYears !== undefined && (
                  <div className="flex items-center space-x-2 p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-700/50">
                    <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <div>
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Experience</p>
                      <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                        {getExperienceText(profile.experienceYears)}
                      </p>
                    </div>
                  </div>
                )}
                
                {profile.resumeUrl && (
                  <div className="flex items-center space-x-2 p-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-700/50">
                    <LinkIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <div>
                      <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">Resume</p>
                      <Button 
                        onClick={() => window.open(profile.resumeUrl, '_blank')}
                        variant="link"
                        className="p-0 h-auto text-sm font-medium text-slate-900 dark:text-slate-100 hover:text-blue-600"
                      >
                        View Resume
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills Section */}
          {profile.skills && profile.skills.length > 0 && (
            <Card className="bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Skills</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <div 
                      key={index}
                      className="bg-gradient-to-r from-blue-50 to-slate-50 dark:from-blue-900/20 dark:to-slate-800/20 border border-blue-200 dark:border-blue-700/50 rounded-md px-3 py-1 text-center"
                    >
                      <p className="font-medium text-slate-900 dark:text-slate-100 text-xs">{skill}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
};

export default JobSeekerProfileDisplay;
