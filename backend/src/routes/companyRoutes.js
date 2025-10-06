const express = require("express");
const {
  createCompany,
  getMyCompany,
  updateCompany,
  deleteCompany,
  getCompanyStatus,
  getPlanCredits,
} = require("../controllers/companyController");
const { jwtWithRole, addUserRole, jwtWithErrorHandling, debugJWT } = require("../middleware/jwtAuth");
const { requireRole } = require("../middleware/roleAuth");
const { uploadSingleLogo } = require("../middleware/upload");

const router = express.Router();

router.get("/status", jwtWithRole, getCompanyStatus);
router.post("/", jwtWithRole, requireRole("COMPANY"), uploadSingleLogo, createCompany);
// Allow any authenticated user to get company details
router.get("/", jwtWithRole, getMyCompany);
router.put("/", jwtWithRole, requireRole("COMPANY"), uploadSingleLogo, updateCompany);
router.delete("/", jwtWithRole, requireRole("COMPANY"), deleteCompany);
// Plan credits for company (no carry-forward beyond active plan)
router.get("/plan-credits", jwtWithRole, requireRole("COMPANY"), getPlanCredits);

module.exports = router;
