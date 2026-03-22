const express = require("express");
const router = express.Router();
const Counsellor = require("../models/Counsellor");
const { protect, restrictTo } = require("../middleware/auth");

router.get("/", protect, async (req, res) => {
  try {
    const counsellors = await Counsellor.find({ isActive: true }).sort({ createdAt: 1 });
    res.json({ counsellors });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", protect, restrictTo("admin"), async (req, res) => {
  try {
    const { name, specialty, bio, slots, email } = req.body;
    const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    const c = await Counsellor.create({ name, specialty, bio, slots: slots || [], email, avatarInitials: initials });
    res.status(201).json({ counsellor: c });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch("/:id", protect, restrictTo("admin"), async (req, res) => {
  try {
    const c = await Counsellor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!c) return res.status(404).json({ error: "Not found" });
    res.json({ counsellor: c });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/:id", protect, restrictTo("admin"), async (req, res) => {
  try {
    await Counsellor.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: "Counsellor deactivated." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;