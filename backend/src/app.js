require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const { getManagementToken } = require("./services/auth0Service");

const app = express();
app.use(cors({ origin: "http://localhost:5173" })); 
app.use(express.json());

app.use("/api/auth", authRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>  console.log(`Server running on port ${PORT}`));