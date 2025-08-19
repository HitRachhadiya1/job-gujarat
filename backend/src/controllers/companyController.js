const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({
  errorFormat: 'pretty',
});

// Database connection helper with Supabase-specific error handling
async function ensureDatabaseConnection() {
  try {
    // Test the connection with a simple query
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Supabase database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase database connection failed:', error.message);
    console.error('Error code:', error.code);
    
    // Specific Supabase error handling
    if (error.code === 'P1001') {
      console.error('🔧 Supabase Troubleshooting:');
      console.error('1. Check if your Supabase project is active (not paused)');
      console.error('2. Verify your database credentials in Supabase dashboard');
      console.error('3. Check your network connection');
      console.error('4. Ensure your IP is whitelisted (if IP restrictions are enabled)');
    }
    
    return false;
  }
}

// Create company (for employer)
async function createCompany(req, res) {
  try {
    console.log("createCompany called with body:", req.body);
    const user = req.user; // set by JWT middleware
    console.log("User object:", user);
    
    if (!user || !user.role || user.role !== "COMPANY")
      return res
        .status(403)
        .json({ error: `Forbidden User Role is : ${user?.role || 'undefined'}` });

    console.log("Role check passed, checking database connection...");
    
    // Check database connection first
    const dbConnected = await ensureDatabaseConnection();
    if (!dbConnected) {
      return res.status(503).json({ 
        error: "Database unavailable", 
        message: "Unable to connect to database. Please try again later."
      });
    }
    
    console.log("Database connected, checking for existing company...");

    // Validate required fields
    if (!req.body.name || !req.body.industry || !req.body.description) {
      return res.status(400).json({ 
        error: "Missing required fields",
        message: "Company name, industry, and description are required"
      });
    }

    // Validate user email
    if (!user.email) {
      return res.status(400).json({ 
        error: "Invalid user data",
        message: "User email is required but not found in token"
      });
    }

    // First, ensure a User record exists
    let dbUser = await prisma.user.findFirst({
      where: { email: user.email }
    });

    if (!dbUser) {
      console.log("Creating User record...");
      dbUser = await prisma.user.create({
        data: {
          email: user.email,
          role: "COMPANY"
        }
      });
      console.log("User record created:", dbUser);
    }

    // Prevent duplicate company for user
    const existing = await prisma.company.findUnique({
      where: { userId: dbUser.id },
    });
    if (existing)
      return res
        .status(400)
        .json({ error: "Company already exists for this user" });

    console.log("No existing company found, creating new company...");

    const company = await prisma.company.create({
      data: {
        userId: dbUser.id, // Use the database User ID
        name: req.body.name,
        industry: req.body.industry,
        logoUrl: req.body.logoUrl,
        website: req.body.website,
        description: req.body.description,
        // ...add other fields as needed
      },
    });
    console.log("Company created successfully:", company);
    res.json(company);
  } catch (err) {
    console.error("Error in createCompany:", err);
    res.status(500).json({ error: "Failed to create company", details: err.message });
  }
}

// Get company details for current employer
async function getMyCompany(req, res) {
  try {
    const user = req.user;
    if (!user || !user.role || user.role !== "COMPANY")
      return res
        .status(403)
        .json({ error: `Forbidden User Role is : ${user?.role || 'undefined'}` });

    // Use cached database ID if available, otherwise look it up
    let userId = user.id;
    if (!userId) {
      const dbUser = await prisma.user.findFirst({
        where: { email: user.email }
      });
      
      if (!dbUser) {
        return res.status(404).json({ error: "User record not found" });
      }
      userId = dbUser.id;
    }

    const company = await prisma.company.findUnique({
      where: { userId: userId },
    });
    if (!company) return res.status(404).json({ error: "Company not found" });
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch company" });
  }
}

// Update company (for employer)
async function updateCompany(req, res) {
  try {
    const user = req.user;
    if (!user || !user.role || user.role !== "COMPANY")
      return res
        .status(403)
        .json({ error: `Forbidden User Role is : ${user?.role || 'undefined'}` });

    // Use cached database ID if available, otherwise look it up
    let userId = user.id;
    if (!userId) {
      const dbUser = await prisma.user.findFirst({
        where: { email: user.email }
      });
      
      if (!dbUser) {
        return res.status(404).json({ error: "User record not found" });
      }
      userId = dbUser.id;
    }

    const company = await prisma.company.findUnique({
      where: { userId: userId },
    });
    if (!company) return res.status(404).json({ error: "Company not found" });

    const updated = await prisma.company.update({
      where: { userId: userId },
      data: req.body,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update company" });
  }
}

// Delete company (for employer)
async function deleteCompany(req, res) {
  try {
    const user = req.user;
    if (!user || !user.role || user.role !== "COMPANY")
      return res
        .status(403)
        .json({ error: `Forbidden User Role is : ${user?.role || 'undefined'}` });

    // Use cached database ID if available, otherwise look it up
    let userId = user.id;
    if (!userId) {
      const dbUser = await prisma.user.findFirst({
        where: { email: user.email }
      });
      
      if (!dbUser) {
        return res.status(404).json({ error: "User record not found" });
      }
      userId = dbUser.id;
    }

    const company = await prisma.company.findUnique({
      where: { userId: userId },
    });
    if (!company) return res.status(404).json({ error: "Company not found" });

    await prisma.company.delete({ where: { userId: userId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete company" });
  }
}

// Get company status (exists and completion status)
async function getCompanyStatus(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Use cached database ID if available, otherwise look it up
    let userId = user.id;
    if (!userId) {
      const dbUser = await prisma.user.findFirst({
        where: { email: user.email }
      });
      
      if (!dbUser) {
        return res.json({
          exists: false,
          completed: false,
          company: null,
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
      return res.json({
        exists: false,
        completed: false,
        company: null,
      });
    }

    // Check if all required fields are filled
    const requiredFields = ["name", "industry", "description"];
    const isCompleted = requiredFields.every(
      (field) => company[field] && company[field].trim() !== ""
    );

    res.json({
      exists: true,
      completed: isCompleted,
      company: company,
    });
  } catch (error) {
    console.error("Error getting company status:", error);
    res.status(500).json({
      message: "Error getting company status",
      error: error.message,
    });
  }
}

module.exports = {
  createCompany,
  getMyCompany,
  updateCompany,
  deleteCompany,
  getCompanyStatus,
};
