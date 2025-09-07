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
// Configure CORS for both development and production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      "http://localhost:5173", // Local development
      "https://localhost:5173", // Local HTTPS
      "http://localhost:3000", // Alternative local port
      "https://your-vercel-app.vercel.app", // Replace with your actual Vercel domain
    ];
    
    // Check if origin matches allowed patterns
    const isAllowed = allowedOrigins.includes(origin) ||
                     /\.vercel\.app$/.test(origin) ||
                     /\.onrender\.com$/.test(origin);
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-client-info', 'apikey']
};

app.use(cors(corsOptions));
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
