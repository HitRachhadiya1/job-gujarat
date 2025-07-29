const axios = require("axios");

async function getManagementToken() {
  const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_AUDIENCE } = process.env;
  const response = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
    client_id: AUTH0_CLIENT_ID,
    client_secret: AUTH0_CLIENT_SECRET,
    audience: AUTH0_AUDIENCE,
    grant_type: "client_credentials",
  });
  return response.data.access_token;
}

async function assignRoleToUser(userId, roleId) {
  const token = await getManagementToken();
  await axios.post(
    `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}/roles`,
    { roles: [roleId] },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

// Add this function:
async function updateUserAppMetadata(userId, role) {
  const token = await getManagementToken();
  await axios.patch(
    `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}`,
    { app_metadata: { role } },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

// And this function:
async function getAllRoles() {
  const token = await getManagementToken(); // Your function to get the management token
  const response = await axios.get(
    `https://${process.env.AUTH0_DOMAIN}/api/v2/roles`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

module.exports = {
  assignRoleToUser,
  updateUserAppMetadata,
  getManagementToken,
  getAllRoles,
};