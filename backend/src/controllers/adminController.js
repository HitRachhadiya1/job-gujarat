const { PrismaClient } = require("@prisma/client");
const { getManagementToken } = require("../services/auth0Service");
const axios = require("axios");

const prisma = new PrismaClient();

// Get all users with their roles and status
async function getUsers(req, res) {
  try {
    // Verify admin role
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Get users from Auth0
    const token = await getManagementToken();
    const response = await axios.get(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users`,
      { 
        headers: { Authorization: `Bearer ${token}` },
        params: { per_page: 100 }
      }
    );

    const users = response.data.map(user => ({
      id: user.user_id,
      email: user.email,
      name: user.name,
      role: user.app_metadata?.role || null,
      blocked: user.blocked || false,
      createdAt: user.created_at,
      lastLogin: user.last_login,
      loginCount: user.logins_count
    }));

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

// Get all companies with job counts
async function getCompanies(req, res) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: { JobPostings: true }
        },
        User: {
          select: { email: true }
        }
      }
    });

    const companiesWithEmail = companies.map(company => ({
      ...company,
      email: company.User?.email
    }));

    res.json(companiesWithEmail);
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ error: "Failed to fetch companies" });
  }
}

// Get all jobs with company and application counts
async function getJobs(req, res) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const jobs = await prisma.jobPosting.findMany({
      include: {
        Company: {
          select: { name: true }
        },
        _count: {
          select: { Applications: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
}

// Get all payment transactions
async function getPayments(req, res) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const payments = await prisma.paymentTransaction.findMany({
      include: {
        Company: {
          select: { name: true }
        },
        JobPosting: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
}

// Block/Unblock user
async function toggleUserBlock(req, res) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { userId } = req.params;
    const { action } = req.params; // 'block' or 'unblock'

    const token = await getManagementToken();
    
    await axios.patch(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}`,
      { blocked: action === 'block' },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json({ success: true, message: `User ${action}ed successfully` });
  } catch (error) {
    console.error(`Error ${req.params.action}ing user:`, error);
    res.status(500).json({ error: `Failed to ${req.params.action} user` });
  }
}

// Close job posting
async function closeJob(req, res) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { jobId } = req.params;

    await prisma.jobPosting.update({
      where: { id: parseInt(jobId) },
      data: { status: 'CLOSED' }
    });

    res.json({ success: true, message: "Job closed successfully" });
  } catch (error) {
    console.error("Error closing job:", error);
    res.status(500).json({ error: "Failed to close job" });
  }
}

// Verify company
async function verifyCompany(req, res) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { companyId } = req.params;

    await prisma.company.update({
      where: { id: parseInt(companyId) },
      data: { verified: true }
    });

    res.json({ success: true, message: "Company verified successfully" });
  } catch (error) {
    console.error("Error verifying company:", error);
    res.status(500).json({ error: "Failed to verify company" });
  }
}

// Get dashboard analytics
async function getDashboardStats(req, res) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const [
      totalUsers,
      totalCompanies,
      totalJobs,
      activeJobs,
      totalApplications,
      totalPayments,
      totalRevenue
    ] = await Promise.all([
      // Get user count from Auth0
      getAuth0UserCount(),
      // Get counts from database
      prisma.company.count(),
      prisma.jobPosting.count(),
      prisma.jobPosting.count({ where: { status: 'PUBLISHED' } }),
      prisma.application.count(),
      prisma.paymentTransaction.count(),
      prisma.paymentTransaction.aggregate({
        _sum: { amount: true },
        where: { status: 'SUCCESS' }
      })
    ]);

    res.json({
      totalUsers,
      totalCompanies,
      totalJobs,
      activeJobs,
      totalApplications,
      totalPayments,
      revenue: totalRevenue._sum.amount || 0
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
}

async function getAuth0UserCount() {
  try {
    const token = await getManagementToken();
    const response = await axios.get(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users`,
      { 
        headers: { Authorization: `Bearer ${token}` },
        params: { per_page: 1, include_totals: true }
      }
    );
    return response.data.total || 0;
  } catch (error) {
    console.error("Error getting Auth0 user count:", error);
    return 0;
  }
}

module.exports = {
  getUsers,
  getCompanies,
  getJobs,
  getPayments,
  toggleUserBlock,
  closeJob,
  verifyCompany,
  getDashboardStats
};
