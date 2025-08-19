require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const { getManagementToken } = require("./services/auth0Service");
const jobPostingRoutes = require("./routes/jobPostingRoutes");
const companyRoutes = require("./routes/companyRoutes");
const jobApplicationRoutes = require("./routes/jobApplicationRoutes");
const jobSeekerRoutes = require("./routes/jobSeekerRoutes");

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/job-postings", jobPostingRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/applications", jobApplicationRoutes);
app.use("/api/job-seeker", jobSeekerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
