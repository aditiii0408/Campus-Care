const Counsellor = require("../models/Counsellor");

exports.getAll = async (req, res) => {
  try {
    const counsellors = await Counsellor.find({ isActive: true }).sort({ createdAt: 1 });
    res.json({ counsellors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, specialty, bio, slots, email } = req.body;
    if (!name || !specialty) return res.status(400).json({ error: "Name and specialty are required." });
    const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    const counsellor = await Counsellor.create({ name, specialty, bio, slots: slots || [], email, avatarInitials: initials });
    res.status(201).json({ counsellor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const counsellor = await Counsellor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!counsellor) return res.status(404).json({ error: "Counsellor not found." });
    res.json({ counsellor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Counsellor.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: "Counsellor removed." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
