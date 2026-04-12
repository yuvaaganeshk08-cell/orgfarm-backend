require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db"); // ✅

const app = express();

// connect database
connectDB();

// middleware
app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("OrgFarm API running...");
});

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));

//Connect auth routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);