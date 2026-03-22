const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendBookingConfirmation = async ({ to, studentName, counsellorName, counsellorSpecialty, slot }) => {
  try {
    await resend.emails.send({
      from: "Campus Care <onboarding@resend.dev>",
      to,
      subject: "Your Counselling Session is Confirmed — Campus Care",
      html: `<p>Hi ${studentName}, your session with ${counsellorName} (${counsellorSpecialty}) at slot <strong>${slot}</strong> is confirmed.</p>`,
    });
  } catch (err) {
    console.error("Booking email error:", err.message);
  }
};

exports.sendPasswordResetEmail = async ({ to, name, resetURL }) => {
  try {
    await resend.emails.send({
      from: "Campus Care <onboarding@resend.dev>",
      to,
      subject: "Reset Your Password — Campus Care",
      html: `<p>Hi ${name},</p><p>Click below to reset your password. Link expires in 15 minutes.</p><p><a href="${resetURL}" style="background:#0f766e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;">Reset My Password</a></p><p style="color:#94a3b8;font-size:12px;">If you didn't request this, ignore this email.</p>`,
    });
  } catch (err) {
    console.error("Reset email error:", err.message);
    throw err;
  }
};