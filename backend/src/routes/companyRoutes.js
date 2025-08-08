const express = require("express");
const {
  createCompany,
  getMyCompany,
  updateCompany,
  deleteCompany,
  getCompanyStatus,
} = require("../controllers/companyController");
const { jwtWithRole, addUserRole, jwtWithErrorHandling, debugJWT } = require("../middleware/jwtAuth");
const { requireRole } = require("../middleware/roleAuth");



const router = express.Router();

router.get("/status", jwtWithRole, getCompanyStatus);
router.post("/", jwtWithRole, requireRole("COMPANY"), createCompany);
// Allow any authenticated user to get company details
router.get("/", jwtWithRole, getMyCompany);
router.put("/", jwtWithRole, requireRole("COMPANY"), updateCompany);
router.delete("/", jwtWithRole, requireRole("COMPANY"), deleteCompany);

module.exports = router;
