const express = require("express");
const { createOrder, verifyPayment, getPublicKey, confirmAndPublish } = require("../controllers/paymentController");
const { jwtWithRole } = require("../middleware/jwtAuth");

const router = express.Router();

// Get publishable key (no auth required for key)
router.get("/key", getPublicKey);

// Create order (company only)
router.post("/create-order", jwtWithRole, createOrder);

// Verify payment (auth optional; but keep same middleware for consistency)
router.post("/verify", jwtWithRole, verifyPayment);

// Verify + publish job + record payment (company only)
router.post("/confirm-and-publish", jwtWithRole, confirmAndPublish);

module.exports = router;
