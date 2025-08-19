const express = require("express");
const {
  createOrUpdateJobSeeker,
  getMyJobSeekerProfile,
  getJobSeekerStatus,
  deleteJobSeekerProfile
} = require("../controllers/jobSeekerController");
const { jwtWithRole } = require("../middleware/jwtAuth");
const { requireRole } = require("../middleware/roleAuth");

const router = express.Router();

router.get("/status", jwtWithRole, getJobSeekerStatus);
router.post("/", jwtWithRole, requireRole("JOB_SEEKER"), createOrUpdateJobSeeker);
router.get("/", jwtWithRole, requireRole("JOB_SEEKER"), getMyJobSeekerProfile);
router.put("/", jwtWithRole, requireRole("JOB_SEEKER"), createOrUpdateJobSeeker);
router.delete("/", jwtWithRole, requireRole("JOB_SEEKER"), deleteJobSeekerProfile);

module.exports = router;
