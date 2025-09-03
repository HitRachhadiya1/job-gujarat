const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Apply for a job
const applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;
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

    // Create snapshot of current resume URL for this application
    const resumeSnapshot = jobSeekerProfile.resumeUrl;

    // Create job application
    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        jobSeekerId: jobSeekerProfile.id,
        coverLetter: coverLetter || null,
        resumeSnapshot,
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

    // Require that a job seeker profile exists; role is enforced by middleware
    if (!user || !user.JobSeeker) {
      return res.status(403).json({ error: "Job seeker profile not found" });
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

    if (!["APPLIED", "INTERVIEW", "HIRED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

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

    // Check if application belongs to company's job
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

    if (!application || application.job.companyId !== user.Company.id) {
      return res.status(404).json({ error: "Application not found or not authorized" });
    }

    // Update application status
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

    // TODO: Here you can add notification logic
    // Example: Send email/SMS notification to job seeker about status change

    res.json({
      message: "Application status updated successfully",
      application: updatedApplication
    });

  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ error: "Internal server error" });
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
        include: {
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
  withdrawApplication
};
