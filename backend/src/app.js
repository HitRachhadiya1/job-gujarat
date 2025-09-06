require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const { getManagementToken } = require("./services/auth0Service");
const jobPostingRoutes = require("./routes/jobPostingRoutes");
const companyRoutes = require("./routes/companyRoutes");
const jobApplicationRoutes = require("./routes/jobApplicationRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const jobSeekerRoutes = require("./routes/jobSeekerRoutes");
const savedJobRoutes = require("./routes/savedJobRoutes");

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use("/api/auth", authRoutes);
app.use("/api/job-postings", jobPostingRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/applications", jobApplicationRoutes);
app.use("/api/job-seeker", jobSeekerRoutes);
app.use("/api/saved-jobs", savedJobRoutes);
app.use("/api/payment", paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
