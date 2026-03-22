const User = require("../models/User");
const Mood = require("../models/Mood");
const Booking = require("../models/Booking");
const ForumPost = require("../models/ForumPost");

exports.getStats = async (req, res) => {
  try {
    const [totalStudents, totalBookings, moodLogsToday, totalPosts] = await Promise.all([
      User.countDocuments({ role: "student" }),
      Booking.countDocuments(),
      Mood.countDocuments({ createdAt: { $gte: new Date().setHours(0, 0, 0, 0) } }),
      ForumPost.countDocuments({ isRemoved: false }),
    ]);

    const moodDist = await Mood.aggregate([
      { $group: { _id: "$mood", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const upcomingBookings = await Booking.find({ status: { $in: ["pending", "confirmed"] } })
      .sort({ date: 1 })
      .limit(20)
      .populate("student", "name email rollNumber department year");

    res.json({ totalStudents, totalBookings, moodLogsToday, totalPosts, moodDist, upcomingBookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find().sort({ createdAt: -1 }).limit(50);
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removePost = async (req, res) => {
  try {
    const post = await ForumPost.findByIdAndUpdate(req.params.id, { isRemoved: true }, { new: true });
    if (!post) return res.status(404).json({ error: "Post not found." });
    res.json({ message: "Post removed." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!booking) return res.status(404).json({ error: "Booking not found." });
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};