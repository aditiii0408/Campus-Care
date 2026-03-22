const express = require("express");
const { getNotices, createNotice, deleteNotice, togglePin } = require("../controllers/noticeController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

router.get("/",              protect, getNotices);
router.post("/",             protect, restrictTo("admin"), createNotice);
router.delete("/:id",        protect, restrictTo("admin"), deleteNotice);
router.patch("/:id/pin",     protect, restrictTo("admin"), togglePin);

module.exports = router;