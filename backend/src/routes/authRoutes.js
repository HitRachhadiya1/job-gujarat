const express = require("express");
const { assignRole, getUserRole, getCurrentUserInfo, verifyRoleInAuth0 } = require("../controllers/authController");
const { jwtWithRole, debugJWT } = require("../middleware/jwtAuth");
const router = express.Router();

router.post("/assign-role", jwtWithRole, assignRole);
router.get("/get-role", jwtWithRole, getUserRole);
router.get("/me", jwtWithRole, getCurrentUserInfo);
router.get("/verify-role", jwtWithRole, verifyRoleInAuth0);

module.exports = router;
