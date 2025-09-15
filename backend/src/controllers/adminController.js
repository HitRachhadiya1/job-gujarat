const { PrismaClient } = require("@prisma/client");
const { getManagementToken } = require("../services/auth0Service");
const { uploadFile } = require("../services/supabaseService");
const { createClient } = require('@supabase/supabase-js');
const axios = require("axios");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

// Upload app logo
async function uploadAppLogo(req, res) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: "Admin access required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No logo file provided" });
    }

    // Delete existing logo files in job-gujarat folder
    const { data: existingLogos } = await supabase.storage
      .from('images')
      .list('job-gujarat');
    
    if (existingLogos && existingLogos.length > 0) {
      const logosToDelete = existingLogos.map(logo => `job-gujarat/${logo.name}`);
      await supabase.storage
        .from('images')
        .remove(logosToDelete);
    }

    const originalName = req.file.originalname;
    const filePath = `job-gujarat/${originalName}`;
    
    const uploadResult = await uploadFile(
      'images',
      filePath,
      req.file.buffer,
      req.file.mimetype
    );

    if (uploadResult.error) {
      return res.status(500).json({ error: uploadResult.error });
    }

    // Store logo URL in a simple way (you could use a settings table)
    // For now, we'll return the URL and let frontend handle storage
    res.json({ 
      logoUrl: uploadResult.url,
      message: "Logo uploaded successfully" 
    });
  } catch (error) {
    console.error("Error uploading logo:", error);
    res.status(500).json({ error: "Failed to upload logo" });
  }
}

// Get current app logo (public endpoint)
async function getAppLogo(req, res) {
  try {
    // List files in job-gujarat folder
    const { data: logoFiles } = await supabase.storage
      .from('images')
      .list('job-gujarat');
    
    if (logoFiles && logoFiles.length > 0) {
      // Get the first (and should be only) logo file
      const logoFile = logoFiles[0];
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(`job-gujarat/${logoFile.name}`);
      
      res.json({ logoUrl: data.publicUrl });
    } else {
      res.json({ logoUrl: null });
    }
  } catch (error) {
    console.error("Error fetching logo:", error);
    res.status(500).json({ error: "Failed to fetch logo" });
  }
}

// Delete current app logo
async function deleteAppLogo(req, res) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: "Admin access required" });
    }

    // List files in job-gujarat folder
    const { data: logoFiles, error: listError } = await supabase.storage
      .from('images')
      .list('job-gujarat');

    if (listError) {
      console.error('Error listing logo files:', listError);
      return res.status(500).json({ error: 'Failed to access storage' });
    }

    if (!logoFiles || logoFiles.length === 0) {
      return res.json({ success: true, message: 'No logo to delete' });
    }

    const paths = logoFiles.map(f => `job-gujarat/${f.name}`);
    const { error: removeError } = await supabase.storage
      .from('images')
      .remove(paths);

    if (removeError) {
      console.error('Error deleting logo files:', removeError);
      return res.status(500).json({ error: 'Failed to delete logo' });
    }

    return res.json({ success: true, message: 'Logo deleted successfully' });
  } catch (error) {
    console.error('Error deleting logo:', error);
    res.status(500).json({ error: 'Failed to delete logo' });
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
  getDashboardStats,
  uploadAppLogo,
  getAppLogo,
  deleteAppLogo
};
