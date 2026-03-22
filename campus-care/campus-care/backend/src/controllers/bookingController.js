const Booking = require("../models/Booking");
const User = require("../models/User");
const { sendBookingConfirmation } = require("../config/mailer");

exports.createBooking = async (req, res) => {
  try {
    const { counsellorName, counsellorSpecialty, slot, date, notes, isAnonymous } = req.body;
    const booking = await Booking.create({
      student: req.user._id,
      counsellorName, counsellorSpecialty,
      slot, date: new Date(date),
      notes, isAnonymous: isAnonymous || false,
      status: "confirmed",
    });

    // Send confirmation email
    const student = await User.findById(req.user._id);
    if (student?.email) {
      await sendBookingConfirmation({
        to: student.email,
        studentName: student.name,
        counsellorName,
        counsellorSpecialty,
        slot,
      });
    }

    res.status(201).json({ booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ student: req.user._id }).sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, student: req.user._id });
    if (!booking) return res.status(404).json({ error: "Booking not found." });
    booking.status = "cancelled";
    await booking.save();
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
