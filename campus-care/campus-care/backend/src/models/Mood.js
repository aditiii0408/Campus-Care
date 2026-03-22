const mongoose = require("mongoose");

const moodSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  mood: {
    type: String,
    required: true,
    enum: ["Happy", "Neutral", "Sad", "Anxious", "Stressed"],
  },
  note: { type: String, maxlength: 500, default: "" },
  score: { type: Number, min: 1, max: 5 }, // 5=Happy, 4=Neutral, 3=Sad, 2=Anxious, 1=Stressed
}, { timestamps: true });

// Auto-assign score based on mood
moodSchema.pre("save", function (next) {
  const scoreMap = { Happy: 5, Neutral: 4, Sad: 3, Anxious: 2, Stressed: 1 };
  this.score = scoreMap[this.mood] || 3;
  next();
});

module.exports = mongoose.model("Mood", moodSchema);
