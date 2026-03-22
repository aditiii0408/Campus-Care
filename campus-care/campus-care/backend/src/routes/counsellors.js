const express = require("express");
const { getAll, create, update, remove } = require("../controllers/counsellorController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, getAll);
router.post("/", protect, restrictTo("admin"), create);
router.patch("/:id", protect, restrictTo("admin"), update);
router.delete("/:id", protect, restrictTo("admin"), remove);

module.exports = router;
