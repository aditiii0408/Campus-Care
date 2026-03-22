const express = require("express");
const { getAlerts, getAllAlerts, resolveAlert, getUnresolvedCount } = require("../controllers/alertController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();
router.use(protect, restrictTo("admin"));

router.get("/", getAlerts);
router.get("/all", getAllAlerts);
router.get("/count", getUnresolvedCount);
router.patch("/:id/resolve", resolveAlert);

module.exports = router;