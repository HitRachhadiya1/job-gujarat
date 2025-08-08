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

// Middleware to add user role to req.user
const addUserRole = async (req, res, next) => {
  try {
    console.log("addUserRole middleware called for user:", req.user?.sub);
    if (req.user && req.user.sub) {
      const token = await getManagementToken();
      console.log("Management token obtained");
      
      const response = await axios.get(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${req.user.sub}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Auth0 user data:", JSON.stringify(response.data, null, 2));
      
      // Add role and email to req.user object
      req.user.role = response.data.app_metadata?.role || null;
      req.user.email = response.data.email;
      console.log("User role set to:", req.user.role);
      console.log("User email set to:", req.user.email);
      
      // Optional: Store database user ID for efficiency (avoids repeated lookups)
      if (req.user.email) {
        try {
          const dbUser = await prisma.user.findFirst({
            where: { email: req.user.email }
          });
          if (dbUser) {
            req.user.id = dbUser.id; // Store numeric database ID
            console.log("Database user ID cached:", req.user.id);
          }
        } catch (dbError) {
          console.error("Error fetching database user:", dbError);
          // Continue without database ID - controllers will handle the lookup
        }
      }
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

// Combined middleware that checks JWT and adds role
const jwtWithRole = [jwtWithErrorHandling, addUserRole];

module.exports = {
  jwtWithRole,
  addUserRole,
  jwtWithErrorHandling,
  debugJWT
};
