import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analyzeBrand from './analyze-brand.js';

dotenv.config();
const app = express();

// ✅ Allow frontend origin explicitly
app.use(cors({
  origin: ['http://localhost:3000', 'https://digiworq.com'],
  credentials: true,
}));

app.use(express.json());
app.use('/api', analyzeBrand);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
