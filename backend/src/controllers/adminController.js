const { PrismaClient } = require("@prisma/client");
const { getManagementToken } = require("../services/auth0Service");
const { uploadFile } = require("../services/supabaseService");
const { createClient } = require("@supabase/supabase-js");
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
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Get users from Auth0
    const token = await getManagementToken();
    const response = await axios.get(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { per_page: 100 },
      }
    );

    const users = response.data.map((user) => ({
      id: user.user_id,
      email: user.email,
      name: user.name,
      role: user.app_metadata?.role || null,
      blocked: user.blocked || false,
      createdAt: user.created_at,
      lastLogin: user.last_login,
      loginCount: user.logins_count,
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
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: { Jobs: true },
        },
        user: {
          select: { email: true },
        },
      },
    });

    const companiesWithEmail = companies.map((company) => ({
      ...company,
      email: company.User?.email,
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
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const jobs = await prisma.jobPosting.findMany({
      include: {
        company: {
          select: { name: true },
        },
        _count: {
          select: { Applications: true },
        },
      },
      orderBy: { createdAt: "desc" },
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
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const payments = await prisma.paymentTransaction.findMany({
      include: {
        company: {
          select: { name: true },
        },
        jobPosting: {
          select: { title: true },
        },
      },
      orderBy: { createdAt: "desc" },
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
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { userId } = req.params;
    const { action } = req.params; // 'block' or 'unblock'

    const token = await getManagementToken();

    await axios.patch(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}`,
      { blocked: action === "block" },
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
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { jobId } = req.params;

    await prisma.jobPosting.update({
      where: { id: parseInt(jobId) },
      data: { status: "CLOSED" },
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
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { companyId } = req.params;

    await prisma.company.update({
      where: { id: parseInt(companyId) },
      data: { verified: true },
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
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const [
      totalUsers,
      totalCompanies,
      totalJobs,
      activeJobs,
      totalApplications,
      totalPayments,
      totalRevenue,
    ] = await Promise.all([
      // Get user count from Auth0
      getAuth0UserCount(),
      // Get counts from database
      prisma.company.count(),
      prisma.jobPosting.count(),
      prisma.jobPosting.count({ where: { status: "PUBLISHED" } }),
      prisma.application.count(),
      prisma.paymentTransaction.count(),
      prisma.paymentTransaction.aggregate({
        _sum: { amount: true },
        where: { status: "SUCCESS" },
      }),
    ]);

    res.json({
      totalUsers,
      totalCompanies,
      totalJobs,
      activeJobs,
      totalApplications,
      totalPayments,
      revenue: totalRevenue._sum.amount || 0,
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
        params: { per_page: 1, include_totals: true },
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
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No logo file provided" });
    }

    // Delete existing logo files in job-gujarat folder
    const { data: existingLogos } = await supabase.storage
      .from("images")
      .list("job-gujarat");

    if (existingLogos && existingLogos.length > 0) {
      const logosToDelete = existingLogos.map(
        (logo) => `job-gujarat/${logo.name}`
      );
      await supabase.storage.from("images").remove(logosToDelete);
    }

    const originalName = req.file.originalname;
    const filePath = `job-gujarat/${originalName}`;

    const uploadResult = await uploadFile(
      "images",
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
      message: "Logo uploaded successfully",
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
      .from("images")
      .list("job-gujarat");

    if (logoFiles && logoFiles.length > 0) {
      // Get the first (and should be only) logo file
      const logoFile = logoFiles[0];
      const { data } = supabase.storage
        .from("images")
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
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    // List files in job-gujarat folder
    const { data: logoFiles, error: listError } = await supabase.storage
      .from("images")
      .list("job-gujarat");

    if (listError) {
      console.error("Error listing logo files:", listError);
      return res.status(500).json({ error: "Failed to access storage" });
    }

    if (!logoFiles || logoFiles.length === 0) {
      return res.json({ success: true, message: "No logo to delete" });
    }

    const paths = logoFiles.map((f) => `job-gujarat/${f.name}`);
    const { error: removeError } = await supabase.storage
      .from("images")
      .remove(paths);

    if (removeError) {
      console.error("Error deleting logo files:", removeError);
      return res.status(500).json({ error: "Failed to delete logo" });
    }

    return res.json({ success: true, message: "Logo deleted successfully" });
  } catch (error) {
    console.error("Error deleting logo:", error);
    res.status(500).json({ error: "Failed to delete logo" });
  }
}

// Get all categories
async function getCategories(req, res) {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { jobs: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
}

// Create new category
async function createCategory(req, res) {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Category name already exists" });
    }
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
}

// Update category
async function updateCategory(req, res) {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { categoryId } = req.params;
    const { name, description, active } = req.body;

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && {
          description: description?.trim() || null,
        }),
        ...(active !== undefined && { active }),
      },
    });

    res.json(category);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Category name already exists" });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Category not found" });
    }
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
}

// Delete category
async function deleteCategory(req, res) {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { categoryId } = req.params;

    // Check if category has jobs
    const jobCount = await prisma.jobPosting.count({
      where: { categoryId },
    });

    if (jobCount > 0) {
      return res.status(400).json({
        error: `Cannot delete category with ${jobCount} associated jobs. Please reassign or delete the jobs first.`,
      });
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Category not found" });
    }
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
}

// Get all pricing plans
async function getPricingPlans(req, res) {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const plans = await prisma.pricingPlan.findMany({
      include: {
        _count: {
          select: { purchases: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(plans);
  } catch (error) {
    console.error("Error fetching pricing plans:", error);
    res.status(500).json({ error: "Failed to fetch pricing plans" });
  }
}

// Create new pricing plan
async function createPricingPlan(req, res) {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { name, price, duration, features, popular } = req.body;

    if (!name || !price || !duration) {
      return res
        .status(400)
        .json({ error: "Name, price, and duration are required" });
    }

    // Parse features from comma-separated string to array
    const featuresArray =
      typeof features === "string"
        ? features
            .split(",")
            .map((f) => f.trim())
            .filter((f) => f.length > 0)
        : features || [];

    const plan = await prisma.pricingPlan.create({
      data: {
        name: name.trim(),
        price: parseFloat(price),
        duration: parseInt(duration),
        features: featuresArray,
        popular: popular || false,
      },
    });

    res.status(201).json(plan);
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "Pricing plan name already exists" });
    }
    console.error("Error creating pricing plan:", error);
    res.status(500).json({ error: "Failed to create pricing plan" });
  }
}

// Update pricing plan
async function updatePricingPlan(req, res) {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { planId } = req.params;
    const { name, price, duration, features, active, popular } = req.body;

    // Parse features if provided
    const featuresArray =
      features && typeof features === "string"
        ? features
            .split(",")
            .map((f) => f.trim())
            .filter((f) => f.length > 0)
        : features;

    const plan = await prisma.pricingPlan.update({
      where: { id: planId },
      data: {
        ...(name && { name: name.trim() }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(duration !== undefined && { duration: parseInt(duration) }),
        ...(featuresArray && { features: featuresArray }),
        ...(active !== undefined && { active }),
        ...(popular !== undefined && { popular }),
      },
    });

    res.json(plan);
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "Pricing plan name already exists" });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Pricing plan not found" });
    }
    console.error("Error updating pricing plan:", error);
    res.status(500).json({ error: "Failed to update pricing plan" });
  }
}

// Delete pricing plan
async function deletePricingPlan(req, res) {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { planId } = req.params;

    // Check if plan has purchases
    const purchaseCount = await prisma.paymentTransaction.count({
      where: { pricingPlanId: planId },
    });

    if (purchaseCount > 0) {
      return res.status(400).json({
        error: `Cannot delete pricing plan with ${purchaseCount} associated purchases. Please deactivate instead.`,
      });
    }

    await prisma.pricingPlan.delete({
      where: { id: planId },
    });

    res.json({ success: true, message: "Pricing plan deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Pricing plan not found" });
    }
    console.error("Error deleting pricing plan:", error);
    res.status(500).json({ error: "Failed to delete pricing plan" });
  }
}

// Enhanced company actions
async function handleCompanyAction(req, res) {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { companyId, action } = req.params;

    let updateData = {};
    let message = "";

    switch (action) {
      case "approve":
      case "verify":
        updateData = { verified: true };
        message = "Company verified successfully";
        break;
      case "reject":
        updateData = { verified: false };
        message = "Company verification rejected";
        break;
      case "block":
        updateData = { status: "BLOCKED" };
        message = "Company blocked successfully";
        break;
      case "unblock":
        updateData = { status: "ACTIVE" };
        message = "Company unblocked successfully";
        break;
      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    await prisma.company.update({
      where: { id: companyId },
      data: updateData,
    });

    res.json({ success: true, message });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Company not found" });
    }
    console.error(`Error ${req.params.action}ing company:`, error);
    res.status(500).json({ error: `Failed to ${req.params.action} company` });
  }
}

// Enhanced job actions
async function handleJobAction(req, res) {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { jobId, action } = req.params;

    let updateData = {};
    let message = "";

    switch (action) {
      case "approve":
        updateData = { status: "PUBLISHED" };
        message = "Job approved and published";
        break;
      case "reject":
        updateData = { status: "REJECTED" };
        message = "Job rejected";
        break;
      case "flag":
        updateData = { status: "FLAGGED" };
        message = "Job flagged for review";
        break;
      case "close":
        updateData = { status: "CLOSED" };
        message = "Job closed";
        break;
      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    await prisma.jobPosting.update({
      where: { id: jobId },
      data: updateData,
    });

    res.json({ success: true, message });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Job not found" });
    }
    console.error(`Error ${req.params.action}ing job:`, error);
    res.status(500).json({ error: `Failed to ${req.params.action} job` });
  }
}

// Handle payment actions
async function handlePaymentAction(req, res) {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { paymentId, action } = req.params;

    if (action === "refund") {
      // In a real implementation, you would integrate with payment gateway
      await prisma.paymentTransaction.update({
        where: { id: paymentId },
        data: {
          status: "REFUNDED",
          completedAt: new Date(),
        },
      });

      res.json({ success: true, message: "Payment refunded successfully" });
    } else {
      res.status(400).json({ error: "Invalid payment action" });
    }
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Payment not found" });
    }
    console.error(`Error processing payment ${req.params.action}:`, error);
    res
      .status(500)
      .json({ error: `Failed to process payment ${req.params.action}` });
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
  deleteAppLogo,
  // Categories
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  // Pricing Plans
  getPricingPlans,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
  // Enhanced Actions
  handleCompanyAction,
  handleJobAction,
  handlePaymentAction,
};
