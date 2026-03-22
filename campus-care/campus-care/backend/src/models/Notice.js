const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
  title:     { type: String, required: true, trim: true, maxlength: 150 },
  body:      { type: String, required: true, maxlength: 1000 },
  category:  { type: String, enum: ["Session", "Workshop", "Announcement", "Reminder", "Holiday"], default: "Announcement" },
  postedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  postedByName: { type: String },
  isPinned:  { type: Boolean, default: false },
  isActive:  { type: Boolean, default: true },
  eventDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("Notice", noticeSchema);