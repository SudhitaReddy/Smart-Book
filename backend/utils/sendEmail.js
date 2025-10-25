const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp-relay.brevo.com", // ✅ Brevo SMTP host
  port: process.env.EMAIL_PORT || 587,
  secure: false, // Brevo uses TLS on port 587
  auth: {
    user: process.env.EMAIL_USER, // ✅ Your Brevo login (e.g., 99fd98001@smtp-brevo.com)
    pass: process.env.EMAIL_PASS, // ✅ Your Brevo SMTP key
  },
});

// ✅ Universal email sender
const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!to) {
      throw new Error("❌ No recipient email provided to sendEmail()");
    }

    const info = await transporter.sendMail({
      from: `"SmartBook" <${process.env.EMAIL_USER}>`, // Branded sender name
      to: String(to).trim(),
      subject,
      html,
    });

    console.log(`✅ Email sent to ${to}: MessageId ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
};

module.exports = sendEmail;
