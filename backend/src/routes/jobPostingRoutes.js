const express = require("express");
const {
  createJobPosting,
  updateJobPosting,
  deleteJobPosting,
  getJobList,
  getMyJobPostings,
} = require("../controllers/jobPostingController");
const { requireRole } = require("../middleware/roleAuth");
const { jwtWithRole } = require("../middleware/jwtAuth");

const router = express.Router();
// Get all job postings (accessible by any authenticated user)
router.get("/", jwtWithRole, getJobList);

// Get job postings for the current company
router.get("/my-jobs", jwtWithRole, requireRole("COMPANY"), getMyJobPostings);

router.post("/", jwtWithRole, requireRole("ADMIN", "COMPANY"), createJobPosting);
router.put("/:id", jwtWithRole, requireRole("ADMIN", "COMPANY"), updateJobPosting);
router.delete(
  "/:id",
  jwtWithRole,
  requireRole("ADMIN", "COMPANY"),
  deleteJobPosting
);

module.exports = router;
