const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create a job posting (for company)
async function createJobPosting(req, res) {
  try {
    const user = req.user;
    console.log("Creating job posting for user:", user);

    if (!user || user.role !== "COMPANY") {
      return res.status(403).json({ error: "Only companies can create job postings" });
    }

    // Get the company for this user
    let dbUser = await prisma.user.findFirst({
      where: { email: user.email || "temp@example.com" }
    });

    if (!dbUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const company = await prisma.company.findUnique({
      where: { userId: dbUser.id }
    });

    if (!company) {
      return res.status(404).json({ error: "Company profile not found. Please complete your company profile first." });
    }

    const {
      title,
      description,
      requirements,
      location,
      jobType,
      salaryRange,
      expiresAt
    } = req.body;

    // Validate required fields
    if (!title || !description || !jobType) {
      return res.status(400).json({ error: "Title, description, and job type are required" });
    }

    const jobPosting = await prisma.jobPosting.create({
      data: {
        companyId: company.id,
        title,
        description,
        requirements: requirements || [],
        location,
        jobType,
        salaryRange,
        status: "PUBLISHED", // Default to published
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true,
          }
        }
      }
    });

    console.log("Job posting created successfully:", jobPosting);
    res.json(jobPosting);
  } catch (error) {
    console.error("Error creating job posting:", error);
    res.status(500).json({ error: "Failed to create job posting", details: error.message });
  }
}

// Update a job posting (for company)
async function updateJobPosting(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user || user.role !== "COMPANY") {
      return res.status(403).json({ error: "Only companies can update job postings" });
    }

    // Get the company for this user
    let dbUser = await prisma.user.findFirst({
      where: { email: user.email || "temp@example.com" }
    });

    if (!dbUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const company = await prisma.company.findUnique({
      where: { userId: dbUser.id }
    });

    if (!company) {
      return res.status(404).json({ error: "Company profile not found" });
    }

    // Check if job posting exists and belongs to this company
    const existingJob = await prisma.jobPosting.findUnique({
      where: { id }
    });

    if (!existingJob) {
      return res.status(404).json({ error: "Job posting not found" });
    }

    if (existingJob.companyId !== company.id) {
      return res.status(403).json({ error: "You can only update your own job postings" });
    }

    const updatedJob = await prisma.jobPosting.update({
      where: { id },
      data: {
        ...req.body,
        expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : existingJob.expiresAt,
      },
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true,
          }
        }
      }
    });

    res.json(updatedJob);
  } catch (error) {
    console.error("Error updating job posting:", error);
    res.status(500).json({ error: "Failed to update job posting", details: error.message });
  }
}

// Delete a job posting (for company)
async function deleteJobPosting(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user || user.role !== "COMPANY") {
      return res.status(403).json({ error: "Only companies can delete job postings" });
    }

    // Get the company for this user
    let dbUser = await prisma.user.findFirst({
      where: { email: user.email || "temp@example.com" }
    });

    if (!dbUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const company = await prisma.company.findUnique({
      where: { userId: dbUser.id }
    });

    if (!company) {
      return res.status(404).json({ error: "Company profile not found" });
    }

    // Check if job posting exists and belongs to this company
    const existingJob = await prisma.jobPosting.findUnique({
      where: { id }
    });

    if (!existingJob) {
      return res.status(404).json({ error: "Job posting not found" });
    }

    if (existingJob.companyId !== company.id) {
      return res.status(403).json({ error: "You can only delete your own job postings" });
    }

    // Delete related records first to avoid foreign key constraint errors
    await prisma.$transaction(async (tx) => {
      // Delete payment transactions associated with this job
      await tx.paymentTransaction.deleteMany({
        where: { jobPostingId: id }
      });

      // Delete job applications associated with this job
      await tx.jobApplication.deleteMany({
        where: { jobId: id }
      });

      // Delete saved jobs associated with this job
      await tx.savedJob.deleteMany({
        where: { jobId: id }
      });

      // Finally delete the job posting
      await tx.jobPosting.delete({
        where: { id }
      });
    });

    res.json({ success: true, message: "Job posting deleted successfully" });
  } catch (error) {
    console.error("Error deleting job posting:", error);
    res.status(500).json({ error: "Failed to delete job posting", details: error.message });
  }
}

// Get all job postings (for any authenticated user)
async function getJobList(req, res) {
  try {
    console.log('getJobList called for user:', req.user?.sub);
    
    // Test database connection
    try {
      await prisma.$connect();
      console.log('Database connected successfully');
    } catch (dbError) {
      console.error('Database connection failed:', dbError.message);
      return res.status(503).json({ 
        error: "Database unavailable", 
        message: "Unable to connect to database. Please try again later."
      });
    }
    
    const jobs = await prisma.jobPosting.findMany({
      where: {
        status: 'PUBLISHED' // Only show published jobs
      },
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true,
            industry: true,
          }
        },
        _count: {
          select: {
            Applications: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Found ${jobs.length} published jobs`);
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching job list:", error);
    res.status(500).json({ error: "Failed to fetch job list", details: error.message });
  }
}

// Get job postings for the current company
async function getMyJobPostings(req, res) {
  try {
    const user = req.user;

    if (!user || user.role !== "COMPANY") {
      return res.status(403).json({ error: "Only companies can view their job postings" });
    }

    // Get the company for this user
    let dbUser = await prisma.user.findFirst({
      where: { email: user.email || "temp@example.com" }
    });

    if (!dbUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const company = await prisma.company.findUnique({
      where: { userId: dbUser.id }
    });

    if (!company) {
      return res.status(404).json({ error: "Company profile not found" });
    }

    const jobs = await prisma.jobPosting.findMany({
      where: {
        companyId: company.id
      },
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true,
          }
        },
        _count: {
          select: {
            Applications: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(jobs);
  } catch (error) {
    console.error("Error fetching company job postings:", error);
    res.status(500).json({ error: "Failed to fetch job postings" });
  }
}

// Get recommended job postings for the current job seeker based on skills
async function getRecommendedJobs(req, res) {
  try {
    const user = req.user;

    // Route is protected for JOB_SEEKER, but double-check
    if (!user || user.role !== "JOB_SEEKER") {
      return res.status(403).json({ error: "Only job seekers can get recommendations" });
    }

    if (!user.email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    const limit = Math.max(1, Math.min(parseInt(req.query.limit || "10", 10), 50));

    // Get DB user and their job seeker profile
    const dbUser = await prisma.user.findFirst({ where: { email: user.email } });
    if (!dbUser) {
      return res.json([]);
    }

    const jobSeeker = await prisma.jobSeeker.findUnique({ where: { userId: dbUser.id } });
    if (!jobSeeker) {
      // No profile yet -> no personalized recommendations
      return res.json([]);
    }

    const seekerSkills = Array.isArray(jobSeeker.skills) ? jobSeeker.skills : [];
    const normalizedSkills = seekerSkills
      .map((s) => (typeof s === "string" ? s.trim().toLowerCase() : ""))
      .filter(Boolean);

    if (normalizedSkills.length === 0) {
      return res.json([]);
    }

    const now = new Date();

    // First try to narrow via array overlap (case-sensitive). If that yields no results (due to case), fallback to all published jobs.
    let jobs = await prisma.jobPosting.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: now } }
        ],
        requirements: { hasSome: seekerSkills },
      },
      include: {
        company: { select: { name: true, logoUrl: true, industry: true } },
        _count: { select: { Applications: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!jobs || jobs.length === 0) {
      // Fallback without hasSome because of case-insensitive matching needs
      jobs = await prisma.jobPosting.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: now } }
          ],
        },
        include: {
          company: { select: { name: true, logoUrl: true, industry: true } },
          _count: { select: { Applications: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    const skillSet = new Set(normalizedSkills);

    const scored = jobs
      .map((job) => {
        const reqs = Array.isArray(job.requirements) ? job.requirements : [];
        const reqsNorm = reqs
          .map((r) => (typeof r === "string" ? r.trim().toLowerCase() : ""))
          .filter(Boolean);

        const matched = reqsNorm.filter((r) => skillSet.has(r));
        const uniqueMatchedCount = new Set(matched).size;
        const totalReqs = Math.max(reqsNorm.length, 1);
        const skillScore = uniqueMatchedCount / totalReqs; // 0..1

        // Recency score: 1 for today, decays to 0 over 30 days
        const createdAt = new Date(job.createdAt);
        const daysAgo = Math.max((now - createdAt) / (1000 * 60 * 60 * 24), 0);
        const recencyScore = Math.max(0, 1 - Math.min(daysAgo, 30) / 30);

        const matchScore = skillScore + 0.2 * recencyScore;

        return {
          ...job,
          matchCount: uniqueMatchedCount,
          totalRequirements: totalReqs,
          matchScore,
        };
      })
      .filter((j) => j.matchCount > 0);

    scored.sort((a, b) => b.matchScore - a.matchScore);

    return res.json(scored.slice(0, limit));
  } catch (error) {
    console.error("Error fetching recommended jobs:", error);
    return res.status(500).json({ error: "Failed to fetch recommended jobs", details: error.message });
  }
}

module.exports = {
  createJobPosting,
  updateJobPosting,
  deleteJobPosting,
  getJobList,
  getMyJobPostings,
  getRecommendedJobs,
};
