const express = require("express");
const { jwtWithRole } = require("../middleware/jwtAuth");
const { requireRole } = require("../middleware/roleAuth");
const {
  saveJob,
  unsaveJob,
  getSavedJobs,
  checkJobSaved
} = require("../controllers/savedJobController");

const router = express.Router();

// All routes require JWT authentication and role checking
router.use(jwtWithRole);

// Save a job (job seekers only)
router.post("/", requireRole("JOB_SEEKER"), saveJob);

// Get saved jobs for current user (job seekers only)
router.get("/", requireRole("JOB_SEEKER"), getSavedJobs);

// Check if a specific job is saved (job seekers only)
router.get("/check/:jobId", requireRole("JOB_SEEKER"), checkJobSaved);

// Unsave a job (job seekers only)
router.delete("/:jobId", requireRole("JOB_SEEKER"), unsaveJob);

module.exports = router;
