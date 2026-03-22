const Mood = require("../models/Mood");

exports.logMood = async (req, res) => {
  try {
    const { mood, note } = req.body;
    const entry = await Mood.create({ user: req.user._id, mood, note });
    res.status(201).json({ entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyMoods = async (req, res) => {
  try {
    const moods = await Mood.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json({ moods });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMoodStats = async (req, res) => {
  try {
    const stats = await Mood.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: "$mood", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
