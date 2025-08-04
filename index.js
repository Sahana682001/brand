import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analyzeBrand from './analyze-brand.js';
import chatbot from './chatbot.js';
import tracking from './tracking.js';

dotenv.config();
const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'https://digiworq.com'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));

app.options('*', cors());

app.use(express.json());

app.use('/api', analyzeBrand);
app.use('/api', tracking);
app.use('/api', chatbot);

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
