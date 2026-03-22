const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: { type: String, required: true, maxlength: 1000 },
  isAnonymous: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const forumPostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, maxlength: 150 },
  body: { type: String, required: true, maxlength: 2000 },
  tag: {
    type: String,
    enum: ["Anxiety", "Stress", "Motivation", "Gratitude", "Academic", "Relationships", "General"],
    default: "General",
  },
  isAnonymous: { type: Boolean, default: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  replies: [replySchema],
  isModerated: { type: Boolean, default: false },
  isRemoved: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("ForumPost", forumPostSchema);
