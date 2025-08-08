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

    await prisma.jobPosting.delete({
      where: { id }
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
    const jobs = await prisma.jobPosting.findMany({
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
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching job list:", error);
    res.status(500).json({ error: "Failed to fetch job list" });
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

module.exports = {
  createJobPosting,
  updateJobPosting,
  deleteJobPosting,
  getJobList,
  getMyJobPostings,
};
