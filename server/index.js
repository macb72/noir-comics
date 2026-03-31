import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateComic } from './services/storyEngine.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, mode = 'education', depth = 'normal' } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const comic = await generateComic(prompt.trim(), mode, depth);
    res.json(comic);
  } catch (err) {
    console.error('Generation error:', err);
    res.status(500).json({ error: 'Failed to generate comic. Please try again.' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`Noir Comics server running on port ${PORT}`);
});
