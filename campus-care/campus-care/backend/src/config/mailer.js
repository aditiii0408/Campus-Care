const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendBookingConfirmation = async ({ to, studentName, counsellorName, counsellorSpecialty, slot }) => {
  const mailOptions = {
    from: `"Campus Care 🌿" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Counselling Session is Confirmed — Campus Care",
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:32px;">
        <div style="background:linear-gradient(135deg,#0f766e,#1d4ed8);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
          <div style="font-size:40px;margin-bottom:8px;">🌿</div>
          <h1 style="color:#fff;margin:0;font-size:22px;">Campus Care</h1>
          <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:13px;">Mental Wellness Platform</p>
        </div>
        <div style="background:#fff;border-radius:0 0 16px 16px;padding:32px;">
          <h2 style="color:#0f172a;font-size:20px;margin:0 0 8px;">Session Booked ✓</h2>
          <p style="color:#64748b;font-size:14px;margin:0 0 24px;">Hi ${studentName}, your counselling session has been successfully booked.</p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:24px;">
            <table style="width:100%;font-size:14px;">
              <tr><td style="color:#64748b;padding:6px 0;width:40%;">Counsellor</td><td style="color:#0f172a;font-weight:600;">${counsellorName}</td></tr>
              <tr><td style="color:#64748b;padding:6px 0;">Specialty</td><td style="color:#0f172a;font-weight:600;">${counsellorSpecialty}</td></tr>
              <tr><td style="color:#64748b;padding:6px 0;">Slot</td><td style="color:#0f172a;font-weight:600;">${slot}</td></tr>
              <tr><td style="color:#64748b;padding:6px 0;">Status</td><td style="color:#166534;font-weight:700;">Confirmed</td></tr>
            </table>
          </div>
          <p style="color:#64748b;font-size:13px;margin:0 0 8px;">📍 Location: College Counselling Centre, Ground Floor</p>
          <p style="color:#64748b;font-size:13px;margin:0 0 24px;">⚠️ Please arrive 5 minutes early. Your session is confidential.</p>
          <div style="border-top:1px solid #e5e7eb;padding-top:20px;font-size:12px;color:#94a3b8;">
            This is an automated message from Campus Care. To cancel, log in to your account.
          </div>
        </div>
      </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Confirmation sent to", to);
  } catch (err) {
    console.error("Email error:", err.message);
  }
};

module.exports = { sendBookingConfirmation };