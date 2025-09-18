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

// Check if resume exists for a specific job application
const checkApplicationResume = async (req, res) => {
  try {
    const auth0User = req.user;
    const { jobId } = req.params;
    
    if (!auth0User?.email) {
      return res.status(400).json({ error: "User email not found in token" });
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
      return res.json({ hasResume: false, resumeUrl: null });
    }

    // Check if resume file exists for this specific job
    const fileExtension = 'pdf'; // We only accept PDFs
    const fileName = `applications/${jobSeeker.id}_${jobId}.${fileExtension}`;
    
    console.log(`Checking for resume file: ${fileName} for jobSeeker: ${jobSeeker.id}, job: ${jobId}`);
    
    try {
      // Check if file exists in Supabase storage
      const { data, error } = await supabase.storage
        .from('resumes')
        .list('applications', {
          search: `${jobSeeker.id}_${jobId}.${fileExtension}`
        });

      console.log('File search result:', { data, error });

      if (error) {
        console.error('Error checking file existence:', error);
        return res.json({ hasResume: false, resumeUrl: null });
      }

      // If file exists, get its public URL
      if (data && data.length > 0) {
        const { data: urlData } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);

        return res.json({ 
          hasResume: true, 
          resumeUrl: urlData.publicUrl,
          fileName: `resume_${jobId}.pdf`
        });
      }

      res.json({ hasResume: false, resumeUrl: null });
    } catch (storageError) {
      console.error('Storage check error:', storageError);
      res.json({ hasResume: false, resumeUrl: null });
    }
  } catch (error) {
    console.error("Error checking application resume:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Upload resume for job application
const uploadApplicationResume = async (req, res) => {
  try {
    const auth0User = req.user;
    
    if (!auth0User?.email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ error: "Job ID is required" });
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

    // Get or create jobSeeker profile
    let jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId: dbUser.id }
    });

    if (!jobSeeker) {
      // Create a basic profile if it doesn't exist
      jobSeeker = await prisma.jobSeeker.create({
        data: {
          userId: dbUser.id,
          fullName: auth0User.name || auth0User.email || "User",
          phone: null,
          location: null,
          skills: [],
          experienceYears: null,
          resumeUrl: null,
          profilePhotoUrl: null,
        },
      });
    }

    // Create application-specific file path in resumes bucket
    // Format: applications/{jobSeekerId}_{jobId}.pdf
    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `applications/${jobSeeker.id}_${jobId}.${fileExtension}`;
    
    // Delete existing file if it exists (to replace with new one)
    try {
      await supabase.storage
        .from('resumes')
        .remove([fileName]);
    } catch (deleteError) {
      // Ignore delete errors (file might not exist)
      console.log('File deletion info:', deleteError.message);
    }

    // Upload to Supabase resumes bucket with applications subfolder
    const uploadResult = await uploadFile(
      'resumes',
      fileName,
      req.file.buffer,
      req.file.mimetype
    );

    if (uploadResult.error) {
      return res.status(500).json({ error: uploadResult.error });
    }

    res.json({
      message: "Resume uploaded successfully",
      resumeUrl: uploadResult.url
    });
  } catch (error) {
    console.error("Error uploading application resume:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Apply for a job
const applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter, resumeUrl } = req.body;
    const auth0User = req.user;

    // Check if user has JOB_SEEKER role from Auth0 data
    if (!auth0User || auth0User.role !== "JOB_SEEKER") {
      return res.status(403).json({
        error: "Only job seekers can apply for jobs. Please complete your role selection first.",
      });
    }

    if (!auth0User.email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    // Resolve internal DB user by email
    let dbUser = await prisma.user.findFirst({ where: { email: auth0User.email } });
    if (!dbUser) {
      // Ensure a user record exists for this email
      dbUser = await prisma.user.create({
        data: { email: auth0User.email, role: "JOB_SEEKER" },
      });
    }

    // Check if job seeker profile exists
    const jobSeekerProfile = await prisma.jobSeeker.findUnique({
      where: { userId: dbUser.id },
    });

    if (!jobSeekerProfile) {
      return res.status(403).json({
        error: "Please complete your job seeker profile before applying for jobs.",
        requiresProfile: true,
        action: "CREATE_PROFILE"
      });
    }

    // Check if job exists and is published
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      include: { company: true }
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.status !== "PUBLISHED") {
      return res.status(400).json({ error: "This job is not available for applications" });
    }

    // Check if already applied
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        jobId,
        jobSeekerId: jobSeekerProfile.id
      }
    });

    if (existingApplication) {
      return res.status(400).json({ error: "You have already applied for this job" });
    }

    // Validate resume URL is provided
    if (!resumeUrl) {
      return res.status(400).json({ error: "Resume is required to apply for this job" });
    }

    // Create job application with application-specific resume
    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        jobSeekerId: jobSeekerProfile.id,
        coverLetter: coverLetter || null,
        resumeSnapshot: resumeUrl, // Use the application-specific resume URL
        status: "APPLIED"
      },
      include: {
        job: {
          include: {
            company: {
              select: {
                name: true,
                logoUrl: true
              }
            }
          }
        },
        jobSeeker: {
          select: {
            fullName: true,
            phone: true,
            location: true,
            skills: true,
            experienceYears: true
          }
        }
      }
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application
    });

  } catch (error) {
    console.error("Error applying for job:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get job seeker's applications
const getMyApplications = async (req, res) => {
  try {
    const auth0User = req.user;
    const { status, page = 1, limit = 10 } = req.query;

    if (!auth0User?.email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    // Get job seeker info
    const user = await prisma.user.findFirst({
      where: { email: auth0User.email },
      include: { JobSeeker: true },
    });

    // If no job seeker profile exists yet, return empty results
    if (!user || !user.JobSeeker) {
      return res.json({
        applications: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: 0
        }
      });
    }

    // Build where clause
    const where = {
      jobSeekerId: user.JobSeeker.id
    };

    if (status && ["APPLIED", "INTERVIEW", "HIRED", "REJECTED"].includes(status)) {
      where.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        include: {
          job: {
            select: {
              title: true,
              location: true,
              jobType: true,
              company: {
                select: {
                  name: true,
                  logoUrl: true,
                },
              },
            },
          },
        },
        orderBy: { appliedAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.jobApplication.count({ where }),
    ]);

    res.json({
      applications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get applications for a company's jobs
const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    const auth0User = req.user;

    if (!auth0User?.email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    // Resolve internal user and ensure company profile exists
    const user = await prisma.user.findFirst({
      where: { email: auth0User.email },
      include: { Company: true },
    });

    if (!user || !user.Company) {
      return res.status(403).json({ error: "Company profile not found" });
    }

    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId }
    });

    if (!job || job.companyId !== user.Company.id) {
      return res.status(404).json({ error: "Job not found or not authorized" });
    }

    // Build where clause
    const where = {
      jobId
    };

    if (status && ["APPLIED", "INTERVIEW", "HIRED", "REJECTED"].includes(status)) {
      where.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        include: {
          jobSeeker: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              location: true,
              skills: true,
              experienceYears: true,
              resumeUrl: true
            }
          },
          job: {
            select: {
              title: true,
              location: true
            }
          }
        },
        orderBy: { appliedAt: "desc" },
        skip,
        take: parseInt(limit)
      }),
      prisma.jobApplication.count({ where })
    ]);

    res.json({
      applications,
      job: {
        title: job.title,
        location: job.location
      },
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error("Error fetching job applications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update application status (company only)
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, notes } = req.body;
    const auth0User = req.user;

    console.log("Update application status request:", {
      applicationId,
      status,
      userEmail: auth0User?.email,
      userRole: auth0User?.role
    });

    if (!["APPLIED", "INTERVIEW", "HIRED", "REJECTED"].includes(status)) {
      console.log("Invalid status provided:", status);
      return res.status(400).json({ error: "Invalid status" });
    }

    if (!auth0User?.email) {
      console.log("No user email found in token");
      return res.status(400).json({ error: "User email not found in token" });
    }

    // Check if user is company owner
    console.log("Finding user by email:", auth0User.email);
    const user = await prisma.user.findFirst({
      where: { email: auth0User.email },
      include: { Company: true },
    });

    console.log("Found user:", user ? { id: user.id, email: user.email, hasCompany: !!user.Company } : null);

    if (!user || !user.Company) {
      console.log("Company profile not found for user");
      return res.status(403).json({ error: "Company profile not found" });
    }

    // Check if application belongs to company's job
    console.log("Finding application by ID:", applicationId);
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        jobSeeker: {
          select: {
            fullName: true,
            user: {
              select: {
                email: true
              }
            }
          }
        }
      }
    });

    console.log("Found application:", application ? {
      id: application.id,
      jobId: application.jobId,
      jobCompanyId: application.job?.companyId,
      userCompanyId: user.Company.id
    } : null);

    if (!application) {
      console.log("Application not found");
      return res.status(404).json({ error: "Application not found" });
    }

    if (application.job.companyId !== user.Company.id) {
      console.log("Application does not belong to user's company");
      return res.status(403).json({ error: "Not authorized to update this application" });
    }

    // Update application status
    console.log("Updating application status to:", status);
    const updatedApplication = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        job: {
          select: {
            title: true,
            location: true
          }
        },
        jobSeeker: {
          select: {
            fullName: true,
            phone: true,
            location: true,
            skills: true,
            experienceYears: true
          }
        }
      }
    });

    console.log("Application status updated successfully");

    res.json({
      message: "Application status updated successfully",
      application: updatedApplication
    });

  } catch (error) {
    console.error("Error updating application status:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

// Get all applications for company's jobs (dashboard overview)
const getCompanyApplications = async (req, res) => {
  try {
    const auth0User = req.user;
    const { status, page = 1, limit = 20 } = req.query;

    if (!auth0User?.email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    // Check if user is company owner
    const user = await prisma.user.findFirst({
      where: { email: auth0User.email },
      include: { Company: true },
    });

    if (!user || !user.Company) {
      return res.status(403).json({ error: "Company profile not found" });
    }

    // Build where clause
    const where = {
      job: {
        companyId: user.Company.id
      }
    };

    if (status && ["APPLIED", "INTERVIEW", "HIRED", "REJECTED"].includes(status)) {
      where.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        select: {
          id: true,
          status: true,
          appliedAt: true,
          updatedAt: true,
          coverLetter: true,
          resumeSnapshot: true,
          job: {
            select: {
              title: true,
              location: true,
              jobType: true
            }
          },
          jobSeeker: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              location: true,
              skills: true,
              experienceYears: true
            }
          }
        },
        orderBy: { appliedAt: "desc" },
        skip,
        take: parseInt(limit)
      }),
      prisma.jobApplication.count({ where })
    ]);

    // Get application statistics
    const stats = await prisma.jobApplication.groupBy({
      by: ['status'],
      where: {
        job: {
          companyId: user.Company.id
        }
      },
      _count: {
        status: true
      }
    });

    const applicationStats = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {});

    res.json({
      applications,
      stats: applicationStats,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error("Error fetching company applications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Withdraw application (job seeker only)
const withdrawApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const auth0User = req.user;

    if (!auth0User?.email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    // Check if user has a job seeker profile; role is enforced by middleware
    const user = await prisma.user.findFirst({
      where: { email: auth0User.email },
      include: { JobSeeker: true },
    });

    if (!user || !user.JobSeeker) {
      return res.status(403).json({ error: "Job seeker profile not found" });
    }

    // Check if application belongs to job seeker
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          select: {
            title: true
          }
        }
      }
    });

    if (!application || application.jobSeekerId !== user.JobSeeker.id) {
      return res.status(404).json({ error: "Application not found or not authorized" });
    }

    // Only allow withdrawal if status is APPLIED
    if (application.status !== "APPLIED") {
      return res.status(400).json({ 
        error: "Application cannot be withdrawn at this stage" 
      });
    }

    // Delete the application
    await prisma.jobApplication.delete({
      where: { id: applicationId }
    });

    res.json({
      message: `Application for "${application.job.title}" has been withdrawn successfully`
    });

  } catch (error) {
    console.error("Error withdrawing application:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  getCompanyApplications,
  withdrawApplication,
  uploadApplicationResume,
  checkApplicationResume,
  upload // Export multer middleware
};
