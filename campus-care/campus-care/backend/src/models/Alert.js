const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String },
  rollNumber: { type: String },
  triggerMessage: { type: String, required: true },
  triggerWords: [{ type: String }],
  severity: { type: String, enum: ["high", "critical"], default: "high" },
  isResolved: { type: Boolean, default: false },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  resolvedAt: { type: Date },
  notes: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Alert", alertSchema);