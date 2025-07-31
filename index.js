const express = require('express');
const cors = require('cors');

const app = express();

// ✅ Enable CORS for your frontend
app.use(cors({
  origin: 'https://www.digiworq.com',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Explicitly handle OPTIONS preflight requests (important!)
app.options('*', cors());

// Your routes
app.post('/api/analyze-brand', (req, res) => {
  res.json({ message: 'Brand analyzed' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
