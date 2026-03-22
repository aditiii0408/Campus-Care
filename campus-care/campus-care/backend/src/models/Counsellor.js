const mongoose = require("mongoose");

const counsellorSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  specialty:      { type: String, required: true, trim: true },
  bio:            { type: String, trim: true, default: "" },
  email:          { type: String, trim: true, lowercase: true, default: "" },
  slots:          [{ type: String }],
  avatarInitials: { type: String, default: "" },
  isActive:       { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Counsellor", counsellorSchema);