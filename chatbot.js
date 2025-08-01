import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';

dotenv.config();
const router = express.Router();

router.post('/chat', async (req, res) => {
  const messages = req.body.messages || [];

  const systemPrompt = {
    role: 'system',
    content: `You are a helpful and professional assistant trained exclusively to answer questions about Digiworq, a digital marketing and technology agency based in India.
  
  Only respond to queries that are directly related to Digiworq’s services, team, address, contact details, careers, or other official company-related topics.
  
  ✅ Here is key information you can provide:
  - **Company Name**: Digiworq
  - **Address**: 4/20, 1st B Main Road 1st N Block, Near Ganapathi Temple Extension, Rajajinagar, Bengaluru, Karnataka 560010.
  - **Official Email**: info@digiworq.com
  - **Phone**: +91-9611489001
  - **Website**: https://www.digiworq.com
  - **Services Offered** (9 total): 
    1. Creative Services
    2. Technology Solutions
    3. Video Production
    4. Digital Marketing
    5. 2D Animation
    6. 3D Animation
    7. Printing Services
    8. Photography
    9. Videography Services
  
  🎯 If a user asks about job openings or careers:
  Respond with: 
  "Please visit our careers page at https://www.digiworq.com/careers to view current openings. You can also email your resume to recruitment@digiworq.com or info@digiworq.com."
  
  🚫 If the user asks about anything not related to Digiworq (e.g., general advice, pricing, or unrelated businesses or topics), politely reply with:
  "I'm here to help only with Digiworq-related queries. For more information, you can contact us at info@digiworq.com or call +91-9611489001."
  
  📝 Do not hallucinate or guess answers beyond what is known about Digiworq.
  
  Only include the contact message **when necessary** — such as:
  - When the user asks something out of scope
  - When they need further assistance
  - Or at the end of a conversation when appropriate
  
  Keep responses helpful, brief, and on-topic.
  `
  };
  

  const payload = {
    model: "mistralai/mistral-7b-instruct",
    messages: [systemPrompt, ...messages],
  };

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://www.digiworq.com',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, something went wrong.";

    // ✅ Send conversation to email
    const conversationText = messages.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n') +
      `\n\nASSISTANT: ${reply}`;

    await sendEmail(conversationText);

    res.json({ reply });
  } catch (error) {
    console.error("Error in chatbot:", error);
    res.status(500).json({ reply: "Server error. Please try again later." });
  }
});

async function sendEmail(conversationText) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,     // e.g., your Gmail
      pass: process.env.EMAIL_PASS,     // App password or regular password (not recommended)
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: 'sahanas.digiworq@gmail.com',
    subject: 'New Chatbot Conversation - Digiworq',
    text: conversationText,
  });
}

export default router;
