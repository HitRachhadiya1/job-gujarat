const { PrismaClient } = require("@prisma/client");
const { uploadFile, supabase } = require("../services/supabaseService");
const multer = require('multer');
const prisma = new PrismaClient();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Create or update job seeker profile
const createOrUpdateJobSeeker = async (req, res) => {
  try {
    const auth0User = req.user;
    const { fullName, phone, location, skills, experienceYears, resumeUrl, profilePhotoUrl } = req.body;

    // Validate required fields
    if (!fullName) {
      return res.status(400).json({ error: "Full name is required" });
    }

    // Check if user has JOB_SEEKER role from Auth0 data
    if (!auth0User || auth0User.role !== "JOB_SEEKER") {
      return res.status(403).json({ error: "User must have JOB_SEEKER role" });
    }

    // Validate presence of email from token (used to map to DB user)
    if (!auth0User.email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    // Ensure a User record exists in DB and get its id
    let dbUser = await prisma.user.findFirst({ where: { email: auth0User.email } });
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: auth0User.email,
          role: "JOB_SEEKER",
        },
      });
    }

    const dbUserId = dbUser.id;

    // Check if job seeker profile exists using DB user id
    const existingJobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId: dbUserId },
    });

    let jobSeeker;

    if (existingJobSeeker) {
      // Update existing job seeker profile
      jobSeeker = await prisma.jobSeeker.update({
        where: { userId: dbUserId },
        data: {
          fullName,
          phone: phone || null,
          location: location || null,
          skills: skills || [],
          experienceYears: experienceYears ? parseInt(experienceYears) : null,
          resumeUrl: resumeUrl || null,
          profilePhotoUrl: profilePhotoUrl || null,
        },
      });
    } else {
      // Create new job seeker profile
      jobSeeker = await prisma.jobSeeker.create({
        data: {
          userId: dbUserId, // Use internal DB user id per schema relation
          fullName,
          phone: phone || null,
          location: location || null,
          skills: skills || [],
          experienceYears: experienceYears ? parseInt(experienceYears) : null,
          resumeUrl: resumeUrl || null,
          profilePhotoUrl: profilePhotoUrl || null,
        },
      });
    }

    res.json({
      message: existingJobSeeker ? "Profile updated successfully" : "Profile created successfully",
      jobSeeker,
    });
  } catch (error) {
    console.error("Error creating/updating job seeker:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get job seeker profile
const getMyJobSeekerProfile = async (req, res) => {
  try {
    const auth0User = req.user;

    if (!auth0User?.email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    const dbUser = await prisma.user.findFirst({ where: { email: auth0User.email } });
    if (!dbUser) {
      return res.status(404).json({ error: "User record not found" });
    }

    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId: dbUser.id },
    });

    if (!jobSeeker) {
      return res.status(404).json({ error: "Job seeker profile not found" });
    }

    // Add Auth0 user data to the response
    const profileWithAuth0Data = {
      ...jobSeeker,
      email: auth0User.email,
      role: auth0User.role,
    };

    res.json(profileWithAuth0Data);
  } catch (error) {
    console.error("Error fetching job seeker profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get job seeker profile status
const getJobSeekerStatus = async (req, res) => {
  try {
    const auth0User = req.user;

    // Check if user has JOB_SEEKER role from Auth0 data
    if (!auth0User || auth0User.role !== "JOB_SEEKER") {
      return res.status(403).json({ error: "User must have JOB_SEEKER role" });
    }

    if (!auth0User.email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    const dbUser = await prisma.user.findFirst({ where: { email: auth0User.email } });
    if (!dbUser) {
      return res.json({ hasProfile: false, isComplete: false, profile: null });
    }

    // Check if job seeker profile exists
    const jobSeekerProfile = await prisma.jobSeeker.findUnique({
      where: { userId: dbUser.id },
    });

    const hasProfile = !!jobSeekerProfile;
    const isComplete =
      hasProfile &&
      jobSeekerProfile.fullName &&
      jobSeekerProfile.location &&
      jobSeekerProfile.skills &&
      jobSeekerProfile.skills.length > 0 &&
      jobSeekerProfile.phone &&
      jobSeekerProfile.experienceYears !== null;

    res.json({
      hasProfile,
      isComplete,
      profile: jobSeekerProfile || null,
    });
  } catch (error) {
    console.error("Error fetching job seeker status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete job seeker profile
const deleteJobSeekerProfile = async (req, res) => {
  try {
    const auth0User = req.user;

    if (!auth0User?.email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    const dbUser = await prisma.user.findFirst({ where: { email: auth0User.email } });
    if (!dbUser) {
      return res.status(404).json({ error: "User record not found" });
    }

    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId: dbUser.id },
    });

    if (!jobSeeker) {
      return res.status(404).json({ error: "Job seeker profile not found" });
    }

    // Check if there are any applications before deleting
    const applications = await prisma.jobApplication.count({
      where: { jobSeekerId: jobSeeker.id },
    });

    if (applications > 0) {
      return res.status(400).json({
        error:
          "Cannot delete profile with existing job applications. Please withdraw applications first.",
      });
    }

    await prisma.jobSeeker.delete({
      where: { userId: dbUser.id },
    });

    res.json({
      message: "Job seeker profile deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting job seeker profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Upload resume file
const uploadResume = async (req, res) => {
  try {
    const auth0User = req.user;
    
    if (!auth0User?.email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Validate file type and size
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: "Resume must be a PDF file" });
    }

    if (req.file.size > 2 * 1024 * 1024) { // 2MB
      return res.status(400).json({ error: "Resume file size must be less than 2MB" });
    }

    // Get user from database
    const dbUser = await prisma.user.findFirst({ where: { email: auth0User.email } });
    if (!dbUser) {
      return res.status(404).json({ error: "User record not found" });
    }

    // Get jobSeeker profile
    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId: dbUser.id }
    });

    if (!jobSeeker) {
      return res.status(404).json({ error: "Job seeker profile not found" });
    }

    // Delete all existing resume files for this user
    const { data: existingFiles } = await supabase.storage
      .from('resumes')
      .list(`jobseeker/${jobSeeker.id}`);
    
    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(file => `jobseeker/${jobSeeker.id}/${file.name}`);
      await supabase.storage
        .from('resumes')
        .remove(filesToDelete);
    }

    // Create file path using jobSeeker ID and preserve original filename
    const originalName = req.file.originalname;
    const filePath = `jobseeker/${jobSeeker.id}/${originalName}`;
    
    // Upload to Supabase
    const uploadResult = await uploadFile(
      'resumes',
      filePath,
      req.file.buffer,
      req.file.mimetype
    );

    if (uploadResult.error) {
      return res.status(500).json({ error: uploadResult.error });
    }

    // Update jobSeeker record with new resume URL
    const updatedJobSeeker = await prisma.jobSeeker.update({
      where: { id: jobSeeker.id },
      data: { resumeUrl: uploadResult.url }
    });

    res.json({
      message: "Resume uploaded successfully",
      resumeUrl: uploadResult.url
    });
  } catch (error) {
    console.error("Error uploading resume:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Upload profile photo
const uploadProfilePhoto = async (req, res) => {
  try {
    const auth0User = req.user;
    
    if (!auth0User?.email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Validate file type and size
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: "Profile photo must be PNG or JPG" });
    }

    if (req.file.size > 3 * 1024 * 1024) { // 3MB
      return res.status(400).json({ error: "Profile photo size must be less than 3MB" });
    }

    // Get user from database
    const dbUser = await prisma.user.findFirst({ where: { email: auth0User.email } });
    if (!dbUser) {
      return res.status(404).json({ error: "User record not found" });
    }

    // Get jobSeeker profile
    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId: dbUser.id }
    });

    if (!jobSeeker) {
      return res.status(404).json({ error: "Job seeker profile not found" });
    }

    // Delete all existing profile photos for this user
    const { data: existingPhotos } = await supabase.storage
      .from('images')
      .list(`jobseeker/${jobSeeker.id}`);
    
    if (existingPhotos && existingPhotos.length > 0) {
      const photosToDelete = existingPhotos.map(photo => `jobseeker/${jobSeeker.id}/${photo.name}`);
      await supabase.storage
        .from('images')
        .remove(photosToDelete);
    }
    
    // Create file path using jobSeeker ID and preserve original filename
    const originalName = req.file.originalname;
    const filePath = `jobseeker/${jobSeeker.id}/${originalName}`;
    
    // Upload to Supabase
    const uploadResult = await uploadFile(
      'images',
      filePath,
      req.file.buffer,
      req.file.mimetype
    );

    if (uploadResult.error) {
      return res.status(500).json({ error: uploadResult.error });
    }

    // Update jobSeeker record with new profile photo URL
    const updatedJobSeeker = await prisma.jobSeeker.update({
      where: { id: jobSeeker.id },
      data: { profilePhotoUrl: uploadResult.url }
    });

    res.json({
      message: "Profile photo uploaded successfully",
      profilePhotoUrl: uploadResult.url
    });
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createOrUpdateJobSeeker,
  getMyJobSeekerProfile,
  getJobSeekerStatus,
  deleteJobSeekerProfile,
  uploadResume,
  uploadProfilePhoto,
  upload // Export multer middleware
};
