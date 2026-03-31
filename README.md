# NOIR COMICS

**Understand anything through cinematic comics.**

An AI-powered web platform that transforms any idea, concept, or real-world event into an interactive comic experience with multiple art styles, what-if alternate timelines, and Wikipedia-sourced accuracy.

## Features

- **Three Modes**: Education (explain anything), News (daily in panels), Story (creative fiction)
- **Three Art Styles**: Neo Noir, B&W Silhouette, Colorful Comic — each with distinct image prompts and CSS filters
- **What-If Scenario Engine**: After reading the comic, explore 3 alternate timelines
- **Depth Control**: ELI10, Normal, Expert, Quick
- **Dynamic Suggestions**: Randomized from 30+ curated topics with refresh
- **Multi-Panel Pages**: Comic book grid layouts with varying panel sizes (hero, wide, standard, tall)
- **Wikipedia Integration**: Real facts sourced from Wikipedia for accuracy
- **Dual LLM Support**: OpenAI or OpenRouter (free models available)
- **Dual Image Strategy**: Pollinations.ai primary + Picsum grayscale fallback
- **Animations**: Framer Motion page transitions, typewriter text, Ken Burns zoom

## Quick Start

```bash
npm install
npm run install:all

# Optional: Add an API key for AI-powered stories (free tiers available)
# Edit server/.env — set OPENROUTER_API_KEY or OPENAI_API_KEY

npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## API Keys (Optional)

The app works without API keys using a Wikipedia-based fallback engine. For best results:

- **OpenRouter** (recommended): Free key at https://openrouter.ai — uses Llama 4 Maverick free model
- **OpenAI**: Key from https://platform.openai.com — uses GPT-4o-mini

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite, Framer Motion, Lucide Icons |
| Backend | Node.js + Express |
| Story AI | OpenAI / OpenRouter (with free fallback) |
| Images | Pollinations.ai + Picsum (fallback) |
| Data | Wikipedia REST API |

## Project Structure

```
noir-comics/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── LandingPage    # Prompt, modes, styles, suggestions
│       │   ├── ComicBook      # Page navigation, what-if integration
│       │   ├── ComicPage      # CSS Grid layouts (3 templates)
│       │   ├── ComicPanel     # Image loading, speech bubbles, captions
│       │   ├── WhatIfSection  # 3 alternate scenario cards
│       │   ├── LoadingScreen  # Noir-themed loading animation
│       │   ├── TypewriterText # Character-by-character text animation
│       │   └── FilmGrain      # SVG noise overlay
│       ├── App.jsx
│       └── index.css          # Global noir theme + CSS variables
├── server/                  # Express backend
│   ├── services/
│   │   ├── storyEngine.js   # Comic generation + what-if engine
│   │   ├── llm.js           # OpenAI / OpenRouter abstraction
│   │   ├── wikipedia.js     # Wikipedia data fetching
│   │   └── styles.js        # Art style definitions
│   └── index.js             # API routes
└── package.json
```
