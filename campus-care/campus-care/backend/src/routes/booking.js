const express = require("express");
const { createBooking, getMyBookings, cancelBooking } = require("../controllers/bookingController");
const { protect } = require("../middleware/auth");
const router = express.Router();
router.use(protect);
router.post("/", createBooking);
router.get("/", getMyBookings);
router.patch("/:id/cancel", cancelBooking);
module.exports = router;
