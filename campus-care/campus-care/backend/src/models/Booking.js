const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  counsellorName: { type: String, required: true },
  counsellorSpecialty: { type: String },
  slot: { type: String, required: true },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending",
  },
  notes: { type: String, maxlength: 500, default: "" },
  isAnonymous: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
