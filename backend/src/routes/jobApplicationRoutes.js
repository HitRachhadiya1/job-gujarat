const express = require("express");
const {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  getCompanyApplications,
  withdrawApplication,
  uploadApplicationResume,
  checkApplicationResume,
  upload
} = require("../controllers/jobApplicationController");
const { jwtWithRole } = require("../middleware/jwtAuth");
const { requireRole } = require("../middleware/roleAuth");

const router = express.Router();

// Job seeker routes
router.get("/check-resume/:jobId", jwtWithRole, requireRole("JOB_SEEKER"), checkApplicationResume);
router.post("/upload-resume", jwtWithRole, requireRole("JOB_SEEKER"), upload.single('resume'), uploadApplicationResume);
router.post("/apply", jwtWithRole, requireRole("JOB_SEEKER"), applyForJob);
router.get("/my-applications", jwtWithRole, requireRole("JOB_SEEKER"), getMyApplications);
router.delete("/:applicationId/withdraw", jwtWithRole, requireRole("JOB_SEEKER"), withdrawApplication);

// Company routes
router.get("/job/:jobId", jwtWithRole, requireRole("COMPANY"), getJobApplications);
router.get("/company/all", jwtWithRole, requireRole("COMPANY"), getCompanyApplications);
router.put("/:applicationId/status", jwtWithRole, requireRole("COMPANY"), updateApplicationStatus);

module.exports = router;
