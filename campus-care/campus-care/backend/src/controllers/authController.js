const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, rollNumber, department, year } = req.body;

    // Password strength check
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        error: "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "Email already registered." });

    // Role is ALWAYS student on public registration — no exceptions
    const user = await User.create({
      name,
      email,
      password,
      role: "student",
      rollNumber,
      department,
      year,
    });

    // Don't return a token — force them to log in
    res.status(201).json({ message: "Account created successfully. Please sign in." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    if (!user.isActive) return res.status(403).json({ error: "Account deactivated. Contact admin." });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

// Admin-only — create other admins or counsellors from inside the system
exports.createAdminUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!["admin", "counsellor"].includes(role)) {
      return res.status(400).json({ error: "This endpoint is for admin/counsellor creation only." });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "Email already registered." });

    const user = await User.create({ name, email, password, role });
    res.status(201).json({ message: `${role} account created.`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};