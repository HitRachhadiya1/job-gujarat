const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Save a job
const saveJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const auth0User = req.user;

    // Check if user has JOB_SEEKER role from Auth0 data
    if (!auth0User || auth0User.role !== "JOB_SEEKER") {
      return res.status(403).json({
        error: "Only job seekers can save jobs. Please complete your role selection first.",
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
        error: "Please complete your job seeker profile before saving jobs.",
      });
    }

    // Check if job exists and is published
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      include: { 
        company: {
          select: {
            name: true,
            logoUrl: true
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.status !== "PUBLISHED") {
      return res.status(400).json({ error: "This job is not available for saving" });
    }

    // Check if already saved
    const existingSavedJob = await prisma.savedJob.findFirst({
      where: {
        jobId,
        jobSeekerId: jobSeekerProfile.id
      }
    });

    if (existingSavedJob) {
      return res.status(400).json({ error: "You have already saved this job" });
    }

    // Create saved job
    const savedJob = await prisma.savedJob.create({
      data: {
        jobId,
        jobSeekerId: jobSeekerProfile.id
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
        }
      }
    });

    res.status(201).json({
      message: "Job saved successfully",
      savedJob
    });

  } catch (error) {
    console.error("Error saving job:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Unsave a job
const unsaveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const auth0User = req.user;

    if (!auth0User?.email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    // Get job seeker info
    const user = await prisma.user.findFirst({
      where: { email: auth0User.email },
      include: { JobSeeker: true },
    });

    if (!user || !user.JobSeeker) {
      return res.status(403).json({ error: "Job seeker profile not found" });
    }

    // Check if job is saved
    const savedJob = await prisma.savedJob.findFirst({
      where: {
        jobId,
        jobSeekerId: user.JobSeeker.id
      },
      include: {
        job: {
          select: {
            title: true
          }
        }
      }
    });

    if (!savedJob) {
      return res.status(404).json({ error: "Saved job not found" });
    }

    // Delete the saved job
    await prisma.savedJob.delete({
      where: { id: savedJob.id }
    });

    res.json({
      message: `Job "${savedJob.job.title}" has been removed from saved jobs`
    });

  } catch (error) {
    console.error("Error unsaving job:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get saved jobs for job seeker
const getSavedJobs = async (req, res) => {
  try {
    const auth0User = req.user;
    const { page = 1, limit = 10 } = req.query;

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
        savedJobs: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: 0
        }
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [savedJobs, total] = await Promise.all([
      prisma.savedJob.findMany({
        where: {
          jobSeekerId: user.JobSeeker.id
        },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              description: true,
              location: true,
              jobType: true,
              salaryRange: true,
              createdAt: true,
              expiresAt: true,
              company: {
                select: {
                  name: true,
                  logoUrl: true,
                },
              },
            },
          },
        },
        orderBy: { savedAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.savedJob.count({ 
        where: {
          jobSeekerId: user.JobSeeker.id
        }
      }),
    ]);

    res.json({
      savedJobs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error("Error fetching saved jobs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Check if a job is saved by the current user
const checkJobSaved = async (req, res) => {
  try {
    const { jobId } = req.params;
    const auth0User = req.user;

    if (!auth0User?.email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    // Get job seeker info
    const user = await prisma.user.findFirst({
      where: { email: auth0User.email },
      include: { JobSeeker: true },
    });

    if (!user || !user.JobSeeker) {
      return res.json({ isSaved: false });
    }

    // Check if job is saved
    const savedJob = await prisma.savedJob.findFirst({
      where: {
        jobId,
        jobSeekerId: user.JobSeeker.id
      }
    });

    res.json({
      isSaved: !!savedJob,
      savedAt: savedJob?.savedAt || null
    });

  } catch (error) {
    console.error("Error checking saved job status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  saveJob,
  unsaveJob,
  getSavedJobs,
  checkJobSaved
};
