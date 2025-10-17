const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // ✅ Your Gmail
    pass: process.env.EMAIL_PASS  // ✅ Your App Password
  }
});

// ✅ Universal email sender
const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!to) {
      throw new Error("❌ No recipient email provided to sendEmail()");
    }

    const info = await transporter.sendMail({
      from: `"SmartBook" <${process.env.EMAIL_USER}>`, // Branded sender
      to: String(to).trim(), // Ensure it's a valid string
      subject,
      html
    });

    console.log(`✅ Email sent to ${to}: MessageId ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
};

module.exports = sendEmail;
