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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Plus,
  User,
  Phone,
  MapPin,
  Clock,
  Camera,
  Upload,
} from "lucide-react";
import { API_URL } from "@/config";

const JobSeekerProfileForm = ({ onSuccess, onCancel }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    location: "",
    skills: [],
    experienceYears: "",
    profilePhotoUrl: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    fetchExistingProfile();
  }, []);

  const fetchExistingProfile = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/jobseeker/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const profile = await response.json();
        setExistingProfile(profile);
        setFormData({
          fullName: profile.fullName || "",
          phone: profile.phone || "",
          location: profile.location || "",
          skills: profile.skills || [],
          experienceYears: profile.experienceYears?.toString() || "",
          profilePhotoUrl: profile.profilePhotoUrl || "",
        });
      } else if (response.status === 404) {
        // Profile doesn't exist yet, this is expected for new users
        console.log("No existing profile found, user will create a new one");
        setExistingProfile(null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await getAccessTokenSilently();
      const method = existingProfile ? "PUT" : "POST";

      const response = await fetch(`${API_URL}/jobseeker/`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          experienceYears: formData.experienceYears
            ? parseInt(formData.experienceYears)
            : null,
        }),
      });

      if (response.ok) {
        const saved = await response.json();
        setExistingProfile(saved.jobSeeker || saved);
        // Notify dashboard to refresh profile card
        window.dispatchEvent(new Event("profileUpdated"));
        // Inform parent so it can switch to view mode and refresh
        if (typeof onSuccess === 'function') {
          try {
            onSuccess(saved.jobSeeker || saved);
          } catch (e) {
            // no-op
          }
        }
      } else {
        const err = await response.json();
        alert(err.error || "Failed to save profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("An error occurred while saving your profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSkillAdd = () => {
    const skill = skillInput.trim();
    if (skill && !formData.skills.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
      setSkillInput("");
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSkillAdd();
    }
  };

  const validateFile = (file, type) => {
    if (type === "photo") {
      if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
        alert("Profile photo must be PNG or JPG format");
        return false;
      }
      if (file.size > 3 * 1024 * 1024) {
        // 3MB
        alert("Profile photo size must be less than 3MB");
        return false;
      }
    }
    return true;
  };

  const handlePhotoUpload = async (file) => {
    if (!validateFile(file, "photo")) return;

    setUploadingPhoto(true);
    try {
      const token = await getAccessTokenSilently();
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch(
        `${API_URL}/jobseeker/upload-photo`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();
        setFormData((prev) => ({
          ...prev,
          profilePhotoUrl: result.profilePhotoUrl,
        }));
        setProfilePhoto(file);
        alert("Profile photo uploaded successfully!");
        // Notify dashboard to refresh profile card
        window.dispatchEvent(new Event("profileUpdated"));
      } else {
        const error = await response.json();
        alert(error.error || "Failed to upload photo");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("An error occurred while uploading photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <Card className="bg-white dark:bg-stone-900/60 border-[#77BEE0]/30 dark:border-[#155AA4]/40 shadow-lg">
        <CardHeader className="py-4 px-5">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#155AA4] to-[#0574EE] dark:from-[#155AA4] dark:to-[#0574EE] rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span>
                  {existingProfile
                    ? "Update Your Profile"
                    : "Create Your Professional Profile"}
                </span>
              </CardTitle>
              {/* Removed tagline to reduce height */}
            </div>
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onCancel}
                className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
                aria-label="Close profile form"
                title="Close"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {/* Profile Photo Upload */}
            <div className="md:col-span-2 space-y-3">
              <label className="text-sm font-bold text-stone-900 dark:text-stone-200 flex items-center space-x-3">
                <Camera className="w-5 h-5 text-[#155AA4] dark:text-[#77BEE0]" />
                <span>Profile Photo</span>
              </label>
              <div className="flex items-center space-x-4">
                {formData.profilePhotoUrl && (
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#77BEE0] dark:border-[#155AA4]">
                    <img
                      src={formData.profilePhotoUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    id="profilePhoto"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handlePhotoUpload(file);
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="profilePhoto"
                    className="inline-flex items-center px-3 py-2 bg-[#EAF6F9] text-[#155AA4] border border-[#77BEE0] rounded-lg cursor-pointer hover:bg-[#77BEE0]/20 transition-colors duration-200"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                  </label>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                    PNG or JPG format, max 3MB
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-3">
              <label
                htmlFor="fullName"
                className="text-sm font-bold text-stone-900 dark:text-stone-200 flex items-center space-x-3"
              >
                <User className="w-5 h-5 text-[#155AA4] dark:text-[#77BEE0]" />
                <span>Full Name *</span>
              </label>
              <Input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                }
                required
                className="bg-white dark:bg-stone-900 border-[#77BEE0] dark:border-[#155AA4] text-stone-900 dark:text-stone-100 font-medium py-3 px-4 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#0574EE] focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2.5">
                  <label htmlFor="phone" className="text-sm font-bold text-stone-900 dark:text-stone-200 flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-[#155AA4] dark:text-[#77BEE0]" />
                    <span>Phone Number</span>
                  </label>
                  <Input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="bg-white dark:bg-stone-900 border-[#77BEE0] dark:border-[#155AA4] text-stone-900 dark:text-stone-100 font-medium py-2.5 px-3.5 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#0574EE] focus:border-transparent"
                  />
                </div>
                <div className="space-y-2.5">
                  <label htmlFor="location" className="text-sm font-bold text-stone-900 dark:text-stone-200 flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-[#155AA4] dark:text-[#77BEE0]" />
                    <span>Location</span>
                  </label>
                  <Input
                    type="text"
                    id="location"
                    placeholder="City, State"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    className="bg-white dark:bg-stone-900 border-[#77BEE0] dark:border-[#155AA4] text-stone-900 dark:text-stone-100 font-medium py-2.5 px-3.5 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#0574EE] focus:border-transparent"
                  />
                </div>
                <div className="space-y-2.5">
                  <label htmlFor="experienceYears" className="text-sm font-bold text-stone-900 dark:text-stone-200 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-[#155AA4] dark:text-[#77BEE0]" />
                    <span>Experience</span>
                  </label>
                  <select
                    id="experienceYears"
                    className="w-full py-2.5 px-3.5 border border-[#77BEE0] dark:border-[#155AA4] rounded-xl bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-medium focus:outline-none focus:ring-2 focus:ring-[#0574EE] focus:border-transparent transition-all duration-200"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData((prev) => ({ ...prev, experienceYears: e.target.value }))}
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
              </div>
            </div>

            <div className="md:col-span-2 space-y-3">
              <label className="text-sm font-bold text-stone-900 dark:text-stone-200">
                Skills
              </label>
              <div className="flex gap-2.5">
                <Input
                  type="text"
                  placeholder="Add a skill and press Enter"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-white dark:bg-stone-900 border-[#77BEE0] dark:border-[#155AA4] text-stone-900 dark:text-stone-100 font-medium py-2.5 px-3.5 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#0574EE] focus:border-transparent"
                />
                <Button
                  type="button"
                  onClick={handleSkillAdd}
                  className="bg-[#0574EE] hover:bg-[#155AA4] text-white font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex gap-3 flex-wrap">
                {formData.skills.map((skill, index) => (
                  <Badge
                    key={index}
                    className="bg-[#77BEE0]/20 text-[#155AA4] border-[#77BEE0]/50 dark:bg-stone-800/50 dark:text-stone-300 dark:border-[#155AA4]/50 font-semibold px-3 py-2 rounded-xl flex items-center gap-2"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleSkillRemove(skill)}
                      className="text-[#155AA4] hover:text-[#0574EE] dark:text-stone-400 dark:hover:text-stone-200 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#0574EE] hover:bg-[#155AA4] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Saving..."
                  : existingProfile
                  ? "Update Profile"
                  : "Create Profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobSeekerProfileForm;
