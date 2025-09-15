const express = require("express");
const { getAppLogo } = require("../controllers/adminController");

const router = express.Router();

// Public app logo endpoint (no authentication required)
router.get("/app-logo", getAppLogo);

module.exports = router;
