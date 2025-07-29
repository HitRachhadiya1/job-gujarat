const { assignRoleToUser, updateUserAppMetadata, getManagementToken } = require("../services/auth0Service");
const validateRole = require("../utils/validateRole");
const axios = require("axios");

async function assignRole(req, res) {
  const { userId, role } = req.body;
  const roleId = validateRole(role);
  if (!roleId) return res.status(400).json({ error: "Invalid role" });

  try {
    await assignRoleToUser(userId, roleId);
    await updateUserAppMetadata(userId, role); // <-- Add this line
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to assign role" });
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


module.exports = { assignRole, getUserRole };