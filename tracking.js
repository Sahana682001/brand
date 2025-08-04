import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Example: Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,     // your_email@gmail.com
    pass: process.env.EMAIL_PASS,     // app password
  },
});

router.post('/track', async (req, res) => {
  const { url, timestamp } = req.body;

  console.log(`User visited: ${url} at ${timestamp}`);

  // Optional: Send to email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'digiworqsolutions@gmail.com',
    subject: 'User Visited URL',
    text: `User visited: ${url}\nTime: ${timestamp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "Tracked and sent!" });
  } catch (error) {
    console.error("Email error:", error.message);
    res.status(500).json({ message: "Tracking failed" });
  }
});

export default router;

