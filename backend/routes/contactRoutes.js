const express = require("express");
const router = express.Router();
const Contact = require("../models/contact");
const { protect, authorize } = require("../middleware/auth");
const sendMail = require("../utils/sendEmail");

// ================================
// PUBLIC → Save contact form + send email
// ================================
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const contact = new Contact({ name, email, subject, message });
    await contact.save();

    // 📩 Send mail to admin
    if (process.env.ADMIN_EMAIL) {
      await sendMail({
        to: process.env.ADMIN_EMAIL,
        subject: `📩 New Contact Us Message - ${subject}`,
        html: `
          <h3>New Contact Us Message</h3>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Subject:</b> ${subject}</p>
          <p><b>Message:</b> ${message}</p>
        `
      });
    }

    // (Optional) Confirmation email to user
    await sendMail({
      to: email,
      subject: "✅ We received your message",
      html: `
        <p>Hi ${name},</p>
        <p>Thanks for contacting us. We have received your message:</p>
        <blockquote>${message}</blockquote>
        <p>Our support team will get back to you soon.</p>
      `
    });

    res.json({ success: true, message: "Message submitted successfully", data: contact });
  } catch (err) {
    console.error("❌ Contact form error:", err);
    res.status(500).json({ success: false, message: "Server error while saving message" });
  }
});

// ================================
// ADMIN → Get all contact messages
// ================================
router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (err) {
    console.error("❌ Fetch contact messages error:", err);
    res.status(500).json({ success: false, message: "Server error while fetching messages" });
  }
});

// ================================
// ADMIN → Update message status (new → in_progress → resolved)
// ================================
router.put("/:id/status", protect, authorize("admin"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!["new", "in_progress", "resolved"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    res.json({ success: true, message: "Status updated", data: contact });
  } catch (err) {
    console.error("❌ Update contact status error:", err);
    res.status(500).json({ success: false, message: "Server error while updating status" });
  }
});

module.exports = router;
