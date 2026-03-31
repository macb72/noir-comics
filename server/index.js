import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateComic, generateWhatIfComic } from './services/storyEngine.js';
import { ART_STYLES } from './services/styles.js';
import { isLLMAvailable } from './services/llm.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, mode = 'education', depth = 'normal', style = 'neo-noir' } = req.body;
    if (!prompt?.trim()) return res.status(400).json({ error: 'Prompt is required' });

    const comic = await generateComic(prompt.trim(), mode, depth, style);
    res.json(comic);
  } catch (err) {
    console.error('Generation error:', err);
    res.status(500).json({ error: 'Failed to generate comic. Please try again.' });
  }
});

app.post('/api/generate/what-if', async (req, res) => {
  try {
    const { originalPrompt, scenario, mode = 'education', style = 'neo-noir' } = req.body;
    if (!originalPrompt?.trim() || !scenario) {
      return res.status(400).json({ error: 'Original prompt and scenario required' });
    }

    const comic = await generateWhatIfComic(originalPrompt.trim(), scenario, mode, style);
    res.json(comic);
  } catch (err) {
    console.error('What-if generation error:', err);
    res.status(500).json({ error: 'Failed to generate alternate comic.' });
  }
});

app.get('/api/styles', (req, res) => {
  const styles = Object.entries(ART_STYLES).map(([id, s]) => ({
    id,
    label: s.label,
    cssFilter: s.cssFilter,
  }));
  res.json(styles);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', llm: isLLMAvailable(), timestamp: Date.now() });
});

const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Noir Comics server on port ${PORT} | LLM: ${isLLMAvailable() ? 'connected' : 'fallback mode'}`);
});
