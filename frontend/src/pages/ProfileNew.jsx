import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Mail,
  MapPin,
  Edit3,
  Save,
  X,
  Download,
  Sparkles,
  Zap,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_URL } from "@/config";
import { useToast } from "@/hooks/use-toast";
import LoadingOverlay from "../components/LoadingOverlay";
import useDelayedTrue from "../hooks/useDelayedTrue";

export default function ProfileNew() {
  const { user, getAccessTokenSilently } = useAuth0();
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [completionScore, setCompletionScore] = useState(0);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    skills: [],
    experienceYears: "",
    resumeUrl: "",
    profilePhotoUrl: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    // Mark that initial animations have run
    setHasAnimated(true);
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/jobseeker/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          fullName: data.fullName || user?.name || "",
          email: data.email || user?.email || "",
          phone: data.phone || "",
          location: data.location || "",
          skills: Array.isArray(data.skills) ? data.skills : [],
          experienceYears: data.experienceYears ?? "",
          resumeUrl: data.resumeUrl || "",
          profilePhotoUrl: data.profilePhotoUrl || "",
        });
        calculateCompletion(data);
      } else if (response.status === 404) {
        // No profile yet: default to basic info and enable editing
        setProfile(null);
        setFormData({
          fullName: user?.name || "",
          email: user?.email || "",
          phone: "",
          location: "",
          skills: [],
          experienceYears: "",
          resumeUrl: "",
          profilePhotoUrl: "",
        });
        setEditing(true);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateResumeFile = (file) => {
    if (!file) return false;
    if (file.type !== "application/pdf") {
      toast({ title: "Invalid file", description: "Resume must be a PDF", variant: "destructive" });
      return false;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Resume must be less than 2MB", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleResumeUpload = async (file) => {
    if (!validateResumeFile(file)) return;
    setUploadingResume(true);
    try {
      const token = await getAccessTokenSilently();
      const form = new FormData();
      form.append("resume", file);
      const response = await fetch(`${API_URL}/jobseeker/upload-resume`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (response.ok) {
        const result = await response.json();
        setFormData((prev) => ({ ...prev, resumeUrl: result.resumeUrl }));
        toast({ title: "Success", description: "Resume uploaded" });
      } else {
        const err = await response.json().catch(() => ({}));
        toast({ title: "Upload failed", description: err.error || "Unable to upload resume", variant: "destructive" });
      }
    } catch (e) {
      console.error("Error uploading resume:", e);
      toast({ title: "Error", description: "An error occurred while uploading resume", variant: "destructive" });
    } finally {
      setUploadingResume(false);
    }
  };

  const validateFile = (file) => {
    if (!file) return false;
    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      toast({
        title: "Invalid file",
        description: "Profile photo must be PNG or JPG format",
        variant: "destructive",
      });
      return false;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Profile photo size must be less than 3MB",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handlePhotoUpload = async (file) => {
    if (!validateFile(file)) return;
    setUploadingPhoto(true);
    try {
      const token = await getAccessTokenSilently();
      const form = new FormData();
      form.append("photo", file);
      const response = await fetch(`${API_URL}/jobseeker/upload-photo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (response.ok) {
        const result = await response.json();
        setFormData((prev) => ({ ...prev, profilePhotoUrl: result.profilePhotoUrl }));
        toast({ title: "Success", description: "Profile photo uploaded" });
        // Optionally refresh profile card numbers elsewhere
        try { window.dispatchEvent(new Event("profileUpdated")); } catch {}
      } else {
        const err = await response.json().catch(() => ({}));
        toast({ title: "Upload failed", description: err.error || "Unable to upload photo", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({ title: "Error", description: "An error occurred while uploading photo", variant: "destructive" });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const calculateCompletion = (data) => {
    const fields = [
      "fullName",
      "email",
      "phone",
      "location",
      "skills",
      "experienceYears",
    ];
    const filled = fields.filter((field) => {
      const val = data?.[field];
      if (Array.isArray(val)) return val.length > 0;
      if (field === "experienceYears") return val !== null && val !== undefined && val !== "";
      return val !== null && val !== undefined && String(val).trim() !== "";
    }).length;
    const percent = Math.round((filled / fields.length) * 100);
    setCompletionScore(percent);
  };

  const handleSave = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/jobseeker/`, {
        method: profile ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          location: formData.location,
          skills: formData.skills,
          experienceYears: formData.experienceYears === "" ? null : parseInt(formData.experienceYears, 10),
          resumeUrl: formData.resumeUrl,
          profilePhotoUrl: formData.profilePhotoUrl,
        }),
      });

      if (response.ok) {
        await fetchProfile();
        setEditing(false);
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    }
  };

  const ProfileHeader = () => (
    <motion.div
      initial={hasAnimated || editing ? false : { opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <Card className="border-0 shadow-xl overflow-hidden">
        {/* Banner Background */}
        <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative">
          <div className="absolute inset-0 bg-black/20" />
          <motion.div
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
            }}
          />
        </div>

        <CardContent className="relative px-8 pb-8">
          {/* Profile Picture */}
          <div className="flex items-end justify-between -mt-16 mb-6">
            <div className="flex items-end space-x-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                <img
                  src={formData.profilePhotoUrl || user?.picture || `https://ui-avatars.com/api/?name=${formData.fullName || "User"}&background=6366f1&color=fff`}
                  alt="Profile"
                  className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl object-cover"
                />
                {/* Hidden file input for photo */}
                <input
                  id="profilePhoto"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoUpload(file);
                  }}
                />
                <label htmlFor="profilePhoto">
                  <motion.span
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute bottom-2 right-2 p-2 bg-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title={uploadingPhoto ? "Uploading..." : "Upload photo"}
                  >
                    <Camera className="w-4 h-4 text-slate-600" />
                  </motion.span>
                </label>
                <div className="mt-2">
                  <label htmlFor="profilePhoto" className="text-xs text-blue-600 hover:underline cursor-pointer">
                    {uploadingPhoto ? "Uploading..." : "Change Photo"}
                  </label>
                </div>
              </motion.div>

              <div className="pb-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {formData.fullName || user?.name || "Your Name"}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {formData.email || user?.email || ""}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  {formData.location && (
                    <span className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <MapPin className="w-4 h-4 mr-1" />
                      {formData.location}
                    </span>
                  )}
                  {formData.email && (
                    <span className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <Mail className="w-4 h-4 mr-1" />
                      {formData.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {!editing ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => setEditing(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </motion.div>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditing(false)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
              {/* Resume upload */}
              <input
                id="resumeUploadProfile"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleResumeUpload(file);
                }}
              />
              <label htmlFor="resumeUploadProfile">
                <Button variant="outline" size="sm" disabled={uploadingResume}>
                  {uploadingResume ? "Uploading..." : "Upload Resume"}
                </Button>
              </label>
              {formData.resumeUrl && (
                <a href={formData.resumeUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download Resume
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Profile Completion */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </motion.div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Profile Strength
                  </span>
                </div>
                <Badge className={cn(
                  "font-bold",
                  completionScore >= 80 ? "bg-green-500" : 
                  completionScore >= 60 ? "bg-yellow-500" : "bg-orange-500",
                  "text-white"
                )}>
                  {completionScore >= 80 ? "Excellent" : 
                   completionScore >= 60 ? "Good" : "Needs Work"}
                </Badge>
              </div>
              <Progress value={completionScore} className="h-3 mb-2" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your profile is {completionScore}% complete. 
                {completionScore < 100 && " Add more details to increase visibility."}
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </motion.div>
  );

  const OverviewTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Main Info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Contact & Experience */}
        <motion.div
          initial={editing || hasAnimated ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Contact & Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Full Name</Label>
                  {editing ? (
                    <Input
                      value={formData.fullName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Your full name"
                    />
                  ) : (
                    <p className="mt-1 text-slate-700 dark:text-slate-300">{formData.fullName || "Not provided"}</p>
                  )}
                </div>
                <div>
                  <Label>Phone</Label>
                  {editing ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="Your phone"
                    />
                  ) : (
                    <p className="mt-1 text-slate-700 dark:text-slate-300">{formData.phone || "Not provided"}</p>
                  )}
                </div>
                <div>
                  <Label>Location</Label>
                  {editing ? (
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="Your location"
                    />
                  ) : (
                    <p className="mt-1 text-slate-700 dark:text-slate-300">{formData.location || "Not specified"}</p>
                  )}
                </div>
                <div>
                  <Label>Experience (years)</Label>
                  {editing ? (
                    <Input
                      type="number"
                      min="0"
                      value={formData.experienceYears}
                      onChange={(e) => setFormData((prev) => ({ ...prev, experienceYears: e.target.value }))}
                      placeholder="0"
                    />
                  ) : (
                    <p className="mt-1 text-slate-700 dark:text-slate-300">{formData.experienceYears === "" ? "Not specified" : formData.experienceYears}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Skills */}

      {/* End Left Column */}
      </div>

      {/* Right Column - Skills */}
      <div className="space-y-6">
        {/* Skills Section */}
        <motion.div
          initial={editing || hasAnimated ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editing && (
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Add a skill"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const s = skillInput.trim();
                        if (s && !formData.skills.includes(s)) {
                          setFormData((prev) => ({ ...prev, skills: [...prev.skills, s] }));
                          setSkillInput("");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const s = skillInput.trim();
                      if (s && !formData.skills.includes(s)) {
                        setFormData((prev) => ({ ...prev, skills: [...prev.skills, s] }));
                        setSkillInput("");
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {(formData.skills.length > 0 ? formData.skills : []).map((skill, idx) => (
                  <motion.div
                    key={`${skill}-${idx}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center gap-2">
                      {skill}
                      {editing && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              skills: prev.skills.filter((s) => s !== skill),
                            }))
                          }
                          className="ml-1 opacity-80 hover:opacity-100"
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  </motion.div>
                ))}
                {formData.skills.length === 0 && (
                  <span className="text-slate-600 dark:text-slate-400">No skills added</span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );

  const showLoader = useDelayedTrue(loading, 600);
  if (showLoader) {
    return <LoadingOverlay message="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 relative">
        <ProfileHeader />
        
        {/* Content */}
        <motion.div
          initial={hasAnimated ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <OverviewTab />
        </motion.div>
      </div>
    </div>
  );
}
