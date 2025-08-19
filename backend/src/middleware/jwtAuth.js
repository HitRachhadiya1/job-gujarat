const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const { getManagementToken } = require("../services/auth0Service");
const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const jwtCheck = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ["RS256"],
});

// Add error handling to JWT middleware
const jwtWithErrorHandling = (req, res, next) => {
  console.log("JWT Validation starting...");
  jwtCheck(req, res, (err) => {
    if (err) {
      console.error("JWT Validation Error:", err.message);
      console.error("JWT Error Details:", {
        name: err.name,
        code: err.code,
        status: err.status
      });
      return res.status(401).json({ 
        error: "Invalid token", 
        details: err.message 
      });
    }
    
    // If req.user is undefined, manually extract from token
    if (!req.user && req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        req.user = {
          sub: payload.sub,
          iss: payload.iss,
          aud: payload.aud,
          iat: payload.iat,
          exp: payload.exp
        };
        console.log("Manually extracted user:", req.user);
      } catch (e) {
        console.error("Error extracting user from token:", e.message);
      }
    }
    
    console.log("JWT Validation successful, user:", req.user?.sub);
    console.log("Full req.user object:", JSON.stringify(req.user, null, 2));
    next();
  });
};

// Add debugging middleware
const debugJWT = (req, res, next) => {
  console.log("JWT Debug - Environment variables:");
  console.log("AUTH0_DOMAIN:", process.env.AUTH0_DOMAIN);
  console.log("AUTH0_AUDIENCE:", process.env.AUTH0_AUDIENCE);
  console.log("Authorization header:", req.headers.authorization ? "Present" : "Missing");
  
  if (req.headers.authorization) {
    const token = req.headers.authorization.replace('Bearer ', '');
    console.log("Token length:", token.length);
    console.log("Token starts with:", token.substring(0, 20) + "...");
    
    // Decode JWT payload (without verification) to see what's in it
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      console.log("JWT Payload:", JSON.stringify(payload, null, 2));
    } catch (e) {
      console.log("Could not decode JWT payload:", e.message);
    }
  }
  next();
};

// Cache for Auth0 user data to avoid repeated calls
const userCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Middleware to add user role to req.user
const addUserRole = async (req, res, next) => {
  try {
    console.log("addUserRole middleware called for user:", req.user?.sub);
    
    if (req.user && req.user.sub) {
      const userId = req.user.sub;
      const now = Date.now();
      
      // Check if we have cached data that's still valid
      const cachedData = userCache.get(userId);
      if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
        console.log("Using cached Auth0 user data for:", userId);
        req.user.role = cachedData.role;
        req.user.email = cachedData.email;
        req.user.name = cachedData.name;
        console.log("User role set to:", req.user.role);
        return next();
      }
      
      // Fetch fresh data from Auth0
      const token = await getManagementToken();
      console.log("Management token obtained - fetching fresh Auth0 data");
      
      const response = await axios.get(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${req.user.sub}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Fresh Auth0 user data fetched:", JSON.stringify(response.data, null, 2));
      
      // Cache the user data
      const userData = {
        role: response.data.app_metadata?.role || null,
        email: response.data.email,
        name: response.data.name,
        timestamp: now
      };
      
      userCache.set(userId, userData);
      
      // Add role and email to req.user object
      req.user.role = userData.role;
      req.user.email = userData.email;
      req.user.name = userData.name;
      console.log("User role set to:", req.user.role);
      console.log("User email set to:", req.user.email);
      
    } else {
      console.log("No user or user.sub found in req.user");
    }
    next();
  } catch (error) {
    console.error("Error fetching user role:", error);
    console.error("Error details:", error.response?.data || error.message);
    // Continue without role if there's an error
    next();
  }
};

// Function to clear user cache (useful when user data changes)
const clearUserCache = (userId) => {
  if (userId) {
    userCache.delete(userId);
    console.log("Cleared cache for user:", userId);
  } else {
    userCache.clear();
    console.log("Cleared all user cache");
  }
};

// Combined middleware that checks JWT and adds role
const jwtWithRole = [jwtWithErrorHandling, addUserRole];

module.exports = {
  jwtWithRole,
  addUserRole,
  jwtWithErrorHandling,
  debugJWT,
  clearUserCache
};
