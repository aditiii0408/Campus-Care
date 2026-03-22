const express = require("express");
const { getAllUsers, updateRole, toggleActive } = require("../controllers/manageUsersController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();
router.use(protect, restrictTo("admin"));

router.get("/",                    getAllUsers);
router.patch("/:id/role",          updateRole);
router.patch("/:id/toggle-active", toggleActive);

module.exports = router;