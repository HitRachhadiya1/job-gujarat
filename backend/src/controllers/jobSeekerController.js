const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create or update job seeker profile
const createOrUpdateJobSeeker = async (req, res) => {
  try {
    const { sub: userId } = req.user;
    const { fullName, phone, location, skills, experienceYears, resumeUrl } = req.body;

    // Validate required fields
    if (!fullName) {
      return res.status(400).json({ error: "Full name is required" });
    }

    // Check if user has JOB_SEEKER role from Auth0 data
    if (!req.user || req.user.role !== "JOB_SEEKER") {
      return res.status(403).json({ error: "User must have JOB_SEEKER role" });
    }

    // Check if job seeker profile exists (using Auth0 ID directly)
    const existingJobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId }
    });

    let jobSeeker;
    
    if (existingJobSeeker) {
      // Update existing job seeker profile
      jobSeeker = await prisma.jobSeeker.update({
        where: { userId },
        data: {
          fullName,
          phone: phone || null,
          location: location || null,
          skills: skills || [],
          experienceYears: experienceYears ? parseInt(experienceYears) : null,
          resumeUrl: resumeUrl || null
        }
      });
    } else {
      // Create new job seeker profile
      jobSeeker = await prisma.jobSeeker.create({
        data: {
          userId, // This is the Auth0 user ID
          fullName,
          phone: phone || null,
          location: location || null,
          skills: skills || [],
          experienceYears: experienceYears ? parseInt(experienceYears) : null,
          resumeUrl: resumeUrl || null
        }
      });
    }

    res.json({
      message: existingJobSeeker ? "Profile updated successfully" : "Profile created successfully",
      jobSeeker
    });

  } catch (error) {
    console.error("Error creating/updating job seeker:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get job seeker profile
const getMyJobSeekerProfile = async (req, res) => {
  try {
    const { sub: userId } = req.user;

    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId }
    });

    if (!jobSeeker) {
      return res.status(404).json({ error: "Job seeker profile not found" });
    }

    // Add Auth0 user data to the response
    const profileWithAuth0Data = {
      ...jobSeeker,
      email: req.user.email,
      role: req.user.role
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
    const { sub: userId } = req.user;

    // Check if user has JOB_SEEKER role from Auth0 data
    if (!req.user || req.user.role !== "JOB_SEEKER") {
      return res.status(403).json({ error: "User must have JOB_SEEKER role" });
    }

    // Check if job seeker profile exists
    const jobSeekerProfile = await prisma.jobSeeker.findUnique({
      where: { userId }
    });

    const hasProfile = !!jobSeekerProfile;
    const isComplete = hasProfile && 
                      jobSeekerProfile.fullName && 
                      jobSeekerProfile.location &&
                      jobSeekerProfile.skills && 
                      jobSeekerProfile.skills.length > 0;

    res.json({
      hasProfile,
      isComplete,
      profile: jobSeekerProfile || null
    });

  } catch (error) {
    console.error("Error fetching job seeker status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete job seeker profile
const deleteJobSeekerProfile = async (req, res) => {
  try {
    const { sub: userId } = req.user;

    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId }
    });

    if (!jobSeeker) {
      return res.status(404).json({ error: "Job seeker profile not found" });
    }

    // Check if there are any applications before deleting
    const applications = await prisma.jobApplication.count({
      where: { jobSeekerId: jobSeeker.id }
    });

    if (applications > 0) {
      return res.status(400).json({ 
        error: "Cannot delete profile with existing job applications. Please withdraw applications first." 
      });
    }

    await prisma.jobSeeker.delete({
      where: { userId }
    });

    res.json({
      message: "Job seeker profile deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting job seeker profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createOrUpdateJobSeeker,
  getMyJobSeekerProfile,
  getJobSeekerStatus,
  deleteJobSeekerProfile
};
