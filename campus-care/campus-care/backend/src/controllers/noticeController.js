const Notice = require("../models/Notice");

// Students — get all active notices
exports.getNotices = async (req, res) => {
  try {
    const notices = await Notice.find({ isActive: true })
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(20);
    res.json({ notices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin — create notice
exports.createNotice = async (req, res) => {
  try {
    const { title, body, category, isPinned, eventDate } = req.body;
    if (!title || !body) return res.status(400).json({ error: "Title and body are required." });
    const notice = await Notice.create({
      title, body, category, isPinned: isPinned || false,
      eventDate: eventDate ? new Date(eventDate) : undefined,
      postedBy: req.user._id,
      postedByName: req.user.name,
    });
    res.status(201).json({ notice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin — delete notice
exports.deleteNotice = async (req, res) => {
  try {
    await Notice.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: "Notice removed." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin — toggle pin
exports.togglePin = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ error: "Not found." });
    notice.isPinned = !notice.isPinned;
    await notice.save();
    res.json({ notice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};