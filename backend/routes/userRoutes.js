const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const router = express.Router();

// --- NEW CODE TO ADD AT THE TOP ---
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");

// --- Multer Configuration for File Uploads ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // This path is relative to the root of the backend folder
    cb(null, "uploads/avatars/");
  },
  filename: function (req, file, cb) {
    // Create a unique filename
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, `user-${req.user.id}-${uniqueSuffix}`);
  },
});

// This is the line that was missing. It creates the 'upload' variable.
const upload = multer({ storage: storage });
// --- END OF NEW CODE ---

// --- 1. USER REGISTRATION ROUTE ---
router.post("/register", async (req, res) => {
  // ... (Your existing registration code is perfect, no changes needed here)
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }
    const [existingUser] = await db.query(
      "SELECT email FROM Users WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const sql = "INSERT INTO Users (name, email, password) VALUES (?, ?, ?)";
    await db.query(sql, [name, email, hashedPassword]);
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// --- 2. USER LOGIN ROUTE ---
router.post("/login", async (req, res) => {
  // ... (Your existing login code is perfect, no changes needed here)
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }
    const [users] = await db.query("SELECT * FROM Users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "5h" },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            profile_image_url: user.profile_image_url,
          },
        });
      }
    );
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const [users] = await db.query(
      "SELECT id, name, email, profile_image_url, created_at FROM Users WHERE id = ?",
      [userId]
    );
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(users[0]);
  } catch (err) {
    console.error("Get user data error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// --- 3. NEW AVATAR UPLOAD ROUTE ---
router.post(
  "/upload-avatar",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
      }
      const imageUrl = `uploads/avatars/${req.file.filename}`;
      await db.query("UPDATE Users SET profile_image_url = ? WHERE id = ?", [
        imageUrl,
        req.user.id,
      ]);
      res.json({
        message: "Profile picture updated successfully!",
        profile_image_url: imageUrl,
      });
    } catch (err) {
      console.error("Avatar upload error:", err);
      res.status(500).json({ message: "Server error during file upload." });
    }
  }
);

module.exports = router;
