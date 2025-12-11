require("dotenv").config();
const path = require("path");
const express = require("express");
const nodemailer = require("nodemailer");
const validator = require("validator");

const app = express();

// Static files (serve index.html, contact.html, style.css, immagini, ecc.)
app.use(express.static(path.join(__dirname)));

// Body parsers built-in (niente body-parser esterno)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------
// Validation
// -----------------------------
function validateForm(data) {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Name must contain at least 2 characters.");
  }
  if (!data.email || !validator.isEmail(data.email)) {
    errors.push("Please provide a valid email address.");
  }
  if (!data.phone || !validator.matches(data.phone, /^[+0-9\s\-().]{7,20}$/)) {
    errors.push("Please provide a valid phone number.");
  }
  if (!data.dateInfo || data.dateInfo.trim().length < 2) {
    errors.push("Please provide a date or period of interest.");
  }
  // Message optional

  return errors;
}

// -----------------------------
// POST /send-message
// -----------------------------
app.post("/send-message", async (req, res) => {
  const data = req.body;

  const errors = validateForm(data);
  if (errors.length) {
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"${data.name}" <${data.email}>`,
      to: process.env.EMAIL_TO, // niente fallback fittizio
      subject: `New Contact Form Submission from ${data.name}`,
      text: `
Name: ${data.name}
Partner: ${data.partner || "N/A"}
Email: ${data.email}
Phone: ${data.phone}
Event: ${data.event || "N/A"}
Date/Period: ${data.dateInfo}
Message: ${data.message || "No message provided"}
      `.trim(),
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while sending your message. Please try again later.",
    });
  }
});

// -----------------------------
// Start
// -----------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
