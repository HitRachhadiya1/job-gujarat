const express = require("express");
const {
  createOrUpdateJobSeeker,
  getMyJobSeekerProfile,
  getJobSeekerStatus,
  deleteJobSeekerProfile,
  uploadResume,
  uploadProfilePhoto,
  upload
} = require("../controllers/jobSeekerController");
const { jwtWithRole } = require("../middleware/jwtAuth");
const { requireRole } = require("../middleware/roleAuth");

const router = express.Router();

router.get("/status", jwtWithRole, getJobSeekerStatus);
router.post("/", jwtWithRole, requireRole("JOB_SEEKER"), createOrUpdateJobSeeker);
router.get("/", jwtWithRole, requireRole("JOB_SEEKER"), getMyJobSeekerProfile);
router.put("/", jwtWithRole, requireRole("JOB_SEEKER"), createOrUpdateJobSeeker);
router.delete("/", jwtWithRole, requireRole("JOB_SEEKER"), deleteJobSeekerProfile);

// File upload routes
router.post("/upload-resume", jwtWithRole, requireRole("JOB_SEEKER"), upload.single('resume'), uploadResume);
router.post("/upload-photo", jwtWithRole, requireRole("JOB_SEEKER"), upload.single('photo'), uploadProfilePhoto);

module.exports = router;
