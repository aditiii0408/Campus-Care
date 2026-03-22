const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const authRoutes         = require("./routes/auth");
const moodRoutes         = require("./routes/mood");
const bookingRoutes      = require("./routes/booking");
const forumRoutes        = require("./routes/forum");
const chatbotRoutes      = require("./routes/chatbot");
const adminRoutes        = require("./routes/admin");
const counsellorRoutes   = require("./routes/counsellor");
const alertRoutes        = require("./routes/alerts");
const noticeRoutes       = require("./routes/notices");
const manageUsersRoutes  = require("./routes/manageUsers");

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: "10kb" }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/api", limiter);
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });
app.use("/api/auth", authLimiter);

app.use("/api/auth",         authRoutes);
app.use("/api/mood",         moodRoutes);
app.use("/api/bookings",     bookingRoutes);
app.use("/api/forum",        forumRoutes);
app.use("/api/chatbot",      chatbotRoutes);
app.use("/api/admin",        adminRoutes);
app.use("/api/counsellors",  counsellorRoutes);
app.use("/api/alerts",       alertRoutes);
app.use("/api/notices",      noticeRoutes);
app.use("/api/manage-users", manageUsersRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok", env: process.env.NODE_ENV }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });