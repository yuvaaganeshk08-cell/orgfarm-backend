const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function validString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

// 🔐 REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const cleanEmail = normalizeEmail(email);

    if (!validString(username) || !validString(cleanEmail) || !validString(password)) {
      return res.status(400).json({ message: "Username, email and password are required" });
    }

    // check existing user
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // create user (password is hashed by User model pre-save hook)
    const user = new User({
      username,
      email: cleanEmail,
      password,
    });

    await user.save();

    res.json({
      message: "User registered successfully",
      user: user.toSafeObject(),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// 🔑 LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = normalizeEmail(email);

    if (!validString(cleanEmail) || !validString(password)) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // find user (include password explicitly because schema sets select:false)
    const user = await User.findOne({ email: cleanEmail }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // check password hash
    let isMatch = await user.comparePassword(password);

    // Optional legacy migration path:
    // if a very old plain-text password exists, upgrade it to bcrypt.
    if (!isMatch && user.password === password) {
      user.password = password;
      user.markModified("password");
      await user.save();
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // ✅ CREATE TOKEN (FROM .env)
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: user.toSafeObject(),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// 👤 PROTECTED PROFILE
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user ? user.toSafeObject() : null);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// 📊 UPDATE PROGRESS
router.put("/progress", authMiddleware, async (req, res) => {
  try {
    const { progress } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { progress },
      { new: true }
    );

    res.json(user ? user.toSafeObject() : null);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
