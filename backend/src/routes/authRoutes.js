const express = require("express");
const { assignRole, getUserRole } = require("../controllers/authController");
const jwtCheck = require("../middleware/jwtAuth");
const router = express.Router();

router.post("/assign-role", jwtCheck, assignRole);
router.get("/get-role", jwtCheck, getUserRole);

module.exports = router;