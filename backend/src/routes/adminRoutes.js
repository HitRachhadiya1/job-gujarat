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
  getDashboardStats
} = require("../controllers/adminController");

const router = express.Router();

// All admin routes require authentication and ADMIN role
router.use(jwtWithRole);

// Dashboard stats
router.get("/stats", getDashboardStats);

// User management
router.get("/users", getUsers);
router.post("/users/:userId/:action", toggleUserBlock); // action: block/unblock

// Company management
router.get("/companies", getCompanies);
router.post("/companies/:companyId/verify", verifyCompany);

// Job management
router.get("/jobs", getJobs);
router.post("/jobs/:jobId/close", closeJob);

// Payment management
router.get("/payments", getPayments);

module.exports = router;
