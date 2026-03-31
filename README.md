# NOIR COMICS

**Understand anything through cinematic comics.**

An AI-powered web platform that transforms any idea, concept, or real-world event into an interactive noir-style comic experience — panel by panel.

## Features

- **Three Modes**: Education (explain anything), News (daily in 4 panels), Story (creative noir fiction)
- **Depth Control**: ELI10, Normal, Expert, Quick (4 panels)
- **Panel-by-Panel Reading**: Navigate at your own pace with keyboard or click
- **Cinematic UI**: Film grain, Ken Burns zoom, typewriter text, slide transitions
- **AI-Powered**: Story generation via OpenRouter LLM + image generation via Pollinations.ai (free)
- **No accounts, no data collection**

## Quick Start

```bash
# Install dependencies
npm install
npm run install:all

# Add your OpenRouter API key (optional — works with fallback stories without it)
# Edit server/.env and set OPENROUTER_API_KEY

# Start both client and server
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Tech Stack

- **Frontend**: React + Vite, Framer Motion, Lucide Icons
- **Backend**: Node.js + Express
- **AI Story**: OpenRouter API (free models available)
- **AI Images**: Pollinations.ai (free, no API key needed)

## Configuration

Copy `server/.env.example` to `server/.env` and add your OpenRouter API key for full LLM-powered story generation. Without a key, the app uses a built-in fallback story engine.

## Project Structure

```
noir-comics/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/  # UI components
│       ├── App.jsx      # Main app with view routing
│       └── index.css    # Global noir theme
├── server/          # Express backend
│   ├── services/    # Story engine, AI integration
│   └── index.js     # API server
└── package.json     # Root scripts
```
