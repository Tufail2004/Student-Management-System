const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET;
const allowedRoles = ["Admin", "Teacher", "Student"];

router.post("/register", async (req, res) => {
  if (!jwtSecret) return res.status(503).json({ message: "Authentication is not configured on this server." });
  const username = String(req.body.username || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const role = allowedRoles.find(value => value.toLowerCase() === String(req.body.role || "").toLowerCase());
  if (username.length < 3 || password.length < 6 || !role) {
    return res.status(400).json({ message: "Enter a username (at least 3 characters), password (at least 6 characters), and valid role." });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ username, password: hashedPassword, role });
    res.status(201).json({ message: "Account created. You can now log in.", user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "That username is already registered." });
    if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
    res.status(500).json({ message: "Could not register account." });
  }
});

router.post("/login", async (req, res) => {
  if (!jwtSecret) return res.status(503).json({ message: "Authentication is not configured on this server." });
  const username = String(req.body.username || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const role = allowedRoles.find(value => value.toLowerCase() === String(req.body.role || "").toLowerCase());
  if (!username || !password || !role) return res.status(400).json({ message: "Enter username, password, and role." });
  try {
    const user = await User.findOne({ username, role });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Username, password, or role is incorrect." });
    }
    const token = jwt.sign({ sub: user._id.toString(), role: user.role }, jwtSecret, { expiresIn: "8h" });
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: "Could not log in." });
  }
});

module.exports = router;
