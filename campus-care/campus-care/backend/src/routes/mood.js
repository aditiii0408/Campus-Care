const express = require("express");
const { logMood, getMyMoods, getMoodStats } = require("../controllers/moodController");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

router.post("/", logMood);
router.get("/", getMyMoods);
router.get("/stats", getMoodStats);

module.exports = router;
