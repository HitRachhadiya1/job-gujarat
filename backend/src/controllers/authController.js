const { assignRoleToUser, updateUserAppMetadata, getManagementToken } = require("../services/auth0Service");
const validateRole = require("../utils/validateRole");
const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const { clearUserCache } = require("../middleware/jwtAuth");
const prisma = new PrismaClient();

async function assignRole(req, res) {
  const { userId, role } = req.body;
  console.log("assignRole called with:", { userId, role });
  
  const roleId = validateRole(role);
  if (!roleId) {
    console.error("Invalid role provided:", role);
    return res.status(400).json({ error: "Invalid role" });
  }
  
  console.log("Role validated, Auth0 roleId:", roleId);

  try {
    console.log("Assigning Auth0 role to user...");
    await assignRoleToUser(userId, roleId);
    console.log("Auth0 role assigned successfully");
    
    console.log("Updating user app metadata...");
    await updateUserAppMetadata(userId, role);
    console.log("App metadata updated successfully");
    
    // Clear the user cache to force fresh data fetch
    clearUserCache(userId);
    console.log("User cache cleared for:", userId);
    
    // Small delay to allow Auth0 to propagate the changes
    console.log("Waiting for Auth0 propagation...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log("Role assignment completed successfully for user:", userId, "with role:", role);
    res.json({ success: true, role: role });
  } catch (err) {
    console.error("Error in assignRole:", {
      error: err.message,
      details: err.response?.data || err,
      userId,
      role,
      roleId
    });
    res.status(500).json({ 
      error: "Failed to assign role", 
      details: err.message,
      userId: userId
    });
  }
}

async function getUserRole(req, res) {
  try {
    const userId = req.query.userId;
    // console.log("Fetching role for userId:", userId);
    const token = await getManagementToken();
    // console.log("Management token fetched.");
    const response = await axios.get(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // console.log("Auth0 user response:", response.data);
    const role = response.data.app_metadata?.role || null;
    res.json({ role });
  } catch (err) {
    console.error("Error in getUserRole:", err.response?.data || err.message, err.response?.status);
    res.status(500).json({ error: "Failed to fetch user role", details: err.response?.data || err.message });
  }
}

// Direct role verification function for troubleshooting
async function verifyRoleInAuth0(req, res) {
  try {
    const { userId } = req.query;
    const userIdToCheck = userId || req.user?.sub;
    
    if (!userIdToCheck) {
      return res.status(400).json({ error: "No user ID provided" });
    }
    
    console.log("Verifying role in Auth0 for user:", userIdToCheck);
    const token = await getManagementToken();
    const response = await axios.get(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userIdToCheck}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log("Raw Auth0 response:", JSON.stringify(response.data, null, 2));
    
    const role = response.data.app_metadata?.role || null;
    const appMetadata = response.data.app_metadata || {};
    
    res.json({ 
      userId: userIdToCheck,
      role,
      appMetadata,
      email: response.data.email,
      lastLogin: response.data.last_login,
      updatedAt: response.data.updated_at
    });
  } catch (err) {
    console.error("Error in verifyRoleInAuth0:", err.response?.data || err.message);
    res.status(500).json({ 
      error: "Failed to verify role", 
      details: err.response?.data || err.message 
    });
  }
}

async function getCurrentUserInfo(req, res) {
  try {
    // The jwtWithRole middleware already decodes the JWT and adds role to req.user
    const role = req.user?.role || null;
    
    console.log("getCurrentUserInfo called, role from middleware:", role);
    console.log("Full req.user object:", JSON.stringify(req.user, null, 2));
    
    // Also attempt to include DB user status for blocked checks
    let userStatus = null;
    try {
      if (req.user?.email) {
        const dbUser = await prisma.user.findFirst({ where: { email: req.user.email } });
        userStatus = dbUser?.status || null;
      }
    } catch (dbErr) {
      console.warn("Could not fetch DB user status:", dbErr.message);
    }
    
    // If role is COMPANY, also get company status
    if (role === "COMPANY") {
      try {
        const user = req.user;
        if (!user) {
          return res.json({ role, companyStatus: { error: "User not authenticated" } });
        }

        // Check if database is available before making queries
        let databaseAvailable = true;
        try {
          await prisma.$connect();
        } catch (dbError) {
          console.log("Database not available:", dbError.message);
          databaseAvailable = false;
        }

        if (!databaseAvailable) {
          console.log("Database unavailable, returning basic company status");
          return res.json({ 
            role, 
            companyStatus: { 
              exists: false,
              completed: false,
              company: null,
              databaseUnavailable: true,
              message: "Database is currently unavailable. Please try again later."
            } 
          });
        }

        // Use cached database ID if available, otherwise look it up
        let userId = user.id;
        if (!userId) {
          const dbUser = await prisma.user.findFirst({
            where: { email: user.email }
          });
          
          if (!dbUser) {
            return res.json({ 
              role, 
              companyStatus: { 
                exists: false, 
                completed: false, 
                company: null,
                message: "User not found in database. Please complete your profile setup."
              } 
            });
          }
          userId = dbUser.id;
        }

        const company = await prisma.company.findUnique({
          where: { userId: userId },
          select: {
            id: true,
            name: true,
            industry: true,
            description: true,
            logoUrl: true,
            website: true,
            verified: true,
          },
        });

        if (!company) {
          const companyStatus = {
            exists: false,
            completed: false,
            company: null,
            message: "Company profile not found. Please complete your company setup."
          };
          return res.json({ role, companyStatus });
        }

        // Check if all required fields are filled
        const requiredFields = ["name", "industry", "description"];
        const isCompleted = requiredFields.every(
          (field) => company[field] && company[field].trim() !== ""
        );

        const companyStatus = {
          exists: true,
          completed: isCompleted,
          company: company,
          message: isCompleted ? "Company profile is complete" : "Company profile needs completion"
        };
        
        return res.json({ role, companyStatus, userStatus });
      } catch (companyError) {
        console.error("Error getting company status:", companyError);
        
        // Check if it's a database connection error
        if (companyError.code === 'P1001' || companyError.message.includes("Can't reach database")) {
          return res.json({ 
            role, 
            companyStatus: { 
              exists: false,
              completed: false,
              company: null,
              databaseUnavailable: true,
              message: "Database is currently unavailable. Please try again later."
            } 
          });
        }
        
        return res.json({ 
          role, 
          companyStatus: { 
            error: "Error getting company status", 
            details: companyError.message,
            message: "Unable to retrieve company information. Please try again."
          },
          userStatus
        });
      }
    }
    
    // For other roles or no role, just return the role
    res.json({ role, userStatus });
  } catch (err) {
    console.error("Error in getCurrentUserInfo:", err);
    res.status(500).json({ error: "Failed to get current user info", details: err.message });
  }
}


module.exports = { assignRole, getUserRole, getCurrentUserInfo, verifyRoleInAuth0 };
