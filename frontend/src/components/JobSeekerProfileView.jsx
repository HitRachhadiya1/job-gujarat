import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Phone,
  MapPin,
  Clock,
  Award,
  Pencil,
} from "lucide-react";

const formatExperience = (years) => {
  if (years === null || years === undefined || years === "") return "Not specified";
  const y = Number(years);
  if (Number.isNaN(y)) return "Not specified";
  if (y === 0) return "Entry Level (0 years)";
  if (y < 5) return `${y} year${y === 1 ? "" : "s"}`;
  if (y < 10) return "5-10 years";
  return "10+ years";
};

export default function JobSeekerProfileView({ profile, onEdit }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <Card className="bg-stone-100/95 dark:bg-stone-900/60 border-stone-400/70 dark:border-stone-800/50 shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="p-5 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-stone-300 dark:border-stone-600 shadow-md">
                <img
                  src={
                    profile.profilePhotoUrl ||
                    "https://via.placeholder.com/96/78716c/FFFFFF?text=U"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight flex items-center gap-3">
                  {profile.fullName || "Job Seeker"}
                  {Array.isArray(profile.skills) && profile.skills.length > 0 && (
                    <Badge className="bg-stone-200/80 text-stone-900 border-stone-400/50 dark:bg-stone-800/50 dark:text-stone-300 dark:border-stone-600/50 font-semibold rounded-xl hidden md:inline-flex">
                      <Award className="w-3.5 h-3.5 mr-1" />
                      {profile.skills.length} skills
                    </Badge>
                  )}
                </CardTitle>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={onEdit}
                className="bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-stone-200/50 dark:bg-stone-800/30 border border-stone-300/50 dark:border-stone-700/50">
                  <div className="text-sm text-stone-600 dark:text-stone-400 font-medium mb-1 flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Phone
                  </div>
                  <div className="text-stone-900 dark:text-stone-100 font-semibold">
                    {profile.phone || "Not provided"}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-stone-200/50 dark:bg-stone-800/30 border border-stone-300/50 dark:border-stone-700/50">
                  <div className="text-sm text-stone-600 dark:text-stone-400 font-medium mb-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Location
                  </div>
                  <div className="text-stone-900 dark:text-stone-100 font-semibold">
                    {profile.location || "Not specified"}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-stone-200/50 dark:bg-stone-800/30 border border-stone-300/50 dark:border-stone-700/50">
                  <div className="text-sm text-stone-600 dark:text-stone-400 font-medium mb-1 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Experience
                  </div>
                  <div className="text-stone-900 dark:text-stone-100 font-semibold">
                    {formatExperience(profile.experienceYears)}
                  </div>
                </div>
              </div>
              <div className="p-5 rounded-xl bg-stone-200/50 dark:bg-stone-800/30 border border-stone-300/50 dark:border-stone-700/50">
                <div className="text-sm text-stone-600 dark:text-stone-400 font-medium mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" /> Skills
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(profile.skills) && profile.skills.length > 0 ? (
                    profile.skills.map((skill, idx) => (
                      <Badge
                        key={idx}
                        className="bg-stone-200/80 text-stone-900 border-stone-400/50 dark:bg-stone-800/50 dark:text-stone-300 dark:border-stone-600/50 font-semibold px-3 py-1.5 rounded-xl"
                      >
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-stone-700 dark:text-stone-400">No skills added</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
