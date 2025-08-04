import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post('/track', async (req, res) => {
  const { url } = req.body;

  // Format timestamp in IST and 12-hour format
  const indiaTime = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  console.log(`User visited: ${url} at ${indiaTime}`);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'digiworqsolutions@gmail.com',
    subject: 'User Visited URL',
    text: `User visited: ${url}\nTime: ${indiaTime}`,
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
