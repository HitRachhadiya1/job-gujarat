const express = require("express");
const { jwtWithRole } = require("../middleware/jwtAuth");
const {
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
  getJobSeekerProfileAdmin
} = require("../controllers/adminController");
const { uploadSingleLogo } = require("../middleware/upload");

const router = express.Router();

// All admin routes require authentication and ADMIN role
router.use(jwtWithRole);

// Dashboard stats
router.get("/stats", getDashboardStats);

// User management
router.get("/users", getUsers);
router.post("/users/:userId/:action", toggleUserBlock); // action: block/unblock
router.get("/job-seeker-profile", getJobSeekerProfileAdmin); // query: email

// Company management
router.get("/companies", getCompanies);
router.post("/companies/:companyId/verify", verifyCompany);
router.post("/companies/:companyId/:action", handleCompanyAction); // approve/reject/block/unblock

// Job management
router.get("/jobs", getJobs);
router.post("/jobs/:jobId/close", closeJob);
router.post("/jobs/:jobId/:action", handleJobAction); // approve/reject/flag/close

// Payment management
router.get("/payments", getPayments);
router.post("/payments/:paymentId/:action", handlePaymentAction); // refund

// Categories management
router.get("/categories", getCategories);
router.post("/categories", createCategory);
router.put("/categories/:categoryId", updateCategory);
router.delete("/categories/:categoryId", deleteCategory);

// Pricing plans management
router.get("/pricing-plans", getPricingPlans);
router.post("/pricing-plans", createPricingPlan);
router.put("/pricing-plans/:planId", updatePricingPlan);
router.delete("/pricing-plans/:planId", deletePricingPlan);

// App logo management
router.post("/upload-logo", uploadSingleLogo, uploadAppLogo);
router.delete("/app-logo", deleteAppLogo);

module.exports = router;
