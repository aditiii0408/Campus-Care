const express = require("express");
const { body } = require("express-validator");
const {
  register, login, getMe,
  changePassword, forgotPassword, resetPassword,
  createAdminUser
} = require("../controllers/authController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

router.post("/register", [
  body("name").notEmpty().trim().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
], register);

router.post("/login", [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password is required"),
], login);

router.get("/me", protect, getMe);

router.post("/change-password", protect, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Only existing admins can create new admin accounts
router.post("/create-admin", protect, restrictTo("admin"), createAdminUser);

module.exports = router;