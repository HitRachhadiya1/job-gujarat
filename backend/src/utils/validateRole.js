// Replace with your actual Auth0 role IDs
const roleMap = {
  JOB_SEEKER: "rol_A94EOIlM0vNpjtm2",
  COMPANY: "rol_IOFAH4qd6hBYkL4j",
  ADMIN: "rol_TVDsCzFVid8RQBvC",
  // Legacy support for old role names
  "Job Seeker": "rol_A94EOIlM0vNpjtm2",
  Employer: "rol_IOFAH4qd6hBYkL4j",
  Admin: "rol_TVDsCzFVid8RQBvC",
};

function validateRole(role) {
  return roleMap[role] || null;
}

module.exports = validateRole;
