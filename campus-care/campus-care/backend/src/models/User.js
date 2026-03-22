const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name:                 { type: String, required: true, trim: true, maxlength: 100 },
  email:                { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:             { type: String, required: true, minlength: 6, select: false },
  role:                 { type: String, enum: ["student", "admin", "counsellor"], default: "student" },
  rollNumber:           { type: String, trim: true },
  department:           { type: String, trim: true },
  year:                 { type: Number, min: 1, max: 5 },
  isActive:             { type: Boolean, default: true },
  lastLogin:            { type: Date },
  passwordResetToken:   { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

module.exports = mongoose.model("User", userSchema);