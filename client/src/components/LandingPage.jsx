import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Newspaper, Feather, Zap, ChevronRight } from 'lucide-react';
import './LandingPage.css';

const MODES = [
  { id: 'education', label: 'Explain', icon: BookOpen, desc: 'Learn anything visually' },
  { id: 'news', label: 'News', icon: Newspaper, desc: 'Today in 4 panels' },
  { id: 'story', label: 'Story', icon: Feather, desc: 'Creative noir fiction' },
];

const DEPTHS = [
  { id: 'kid', label: 'ELI10' },
  { id: 'normal', label: 'Normal' },
  { id: 'expert', label: 'Expert' },
  { id: 'quick', label: 'Quick (4)' },
];

const SUGGESTIONS = [
  { text: 'The Cuban Missile Crisis', mode: 'education' },
  { text: 'How do black holes work?', mode: 'education' },
  { text: 'What if dinosaurs never went extinct?', mode: 'story' },
  { text: 'The origin story of Apple Inc.', mode: 'education' },
  { text: 'A heist at the Louvre Museum', mode: 'story' },
  { text: 'The fall of the Roman Empire', mode: 'education' },
];

export default function LandingPage({ onGenerate, error }) {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState('education');
  const [depth, setDepth] = useState('normal');
  const [showOptions, setShowOptions] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt, mode, depth);
    }
  };

  const handleSuggestion = (suggestion) => {
    setPrompt(suggestion.text);
    setMode(suggestion.mode);
  };

  return (
    <motion.div
      className="landing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="landing__vignette" />

      <header className="landing__header">
        <motion.div
          className="landing__logo"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <span className="landing__logo-icon">&#9632;</span>
          <span className="landing__logo-text">NOIR</span>
        </motion.div>
      </header>

      <main className="landing__main">
        <motion.div
          className="landing__hero"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="landing__title">
            Understand anything<br />
            <span className="landing__title-accent">through cinematic comics.</span>
          </h1>
          <p className="landing__subtitle">
            Enter any topic, event, or idea. Watch it transform into an
            immersive noir comic — sourced from Wikipedia, rendered as a graphic novel.
          </p>
        </motion.div>

        <motion.form
          className="landing__form"
          onSubmit={handleSubmit}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="landing__input-group">
            <textarea
              className="landing__input"
              placeholder="What story shall we tell tonight?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              maxLength={500}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              className="landing__submit"
              disabled={!prompt.trim()}
            >
              <Zap size={18} />
              Generate
            </button>
          </div>

          {error && (
            <motion.div
              className="landing__error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <button
            type="button"
            className="landing__toggle-options"
            onClick={() => setShowOptions(!showOptions)}
          >
            <ChevronRight
              size={14}
              className={`landing__chevron ${showOptions ? 'landing__chevron--open' : ''}`}
            />
            Options
          </button>

          {showOptions && (
            <motion.div
              className="landing__options"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="landing__option-group">
                <label className="landing__option-label">Mode</label>
                <div className="landing__modes">
                  {MODES.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      className={`landing__mode ${mode === m.id ? 'landing__mode--active' : ''}`}
                      onClick={() => setMode(m.id)}
                    >
                      <m.icon size={16} />
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="landing__option-group">
                <label className="landing__option-label">Depth</label>
                <div className="landing__depths">
                  {DEPTHS.map(d => (
                    <button
                      key={d.id}
                      type="button"
                      className={`landing__depth ${depth === d.id ? 'landing__depth--active' : ''}`}
                      onClick={() => setDepth(d.id)}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </motion.form>

        <motion.div
          className="landing__suggestions"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <p className="landing__suggestions-label">Try these:</p>
          <div className="landing__suggestions-grid">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                className="landing__suggestion"
                onClick={() => handleSuggestion(s)}
              >
                {s.text}
              </button>
            ))}
          </div>
        </motion.div>
      </main>

      <footer className="landing__footer">
        <p>AI-powered visual storytelling sourced from Wikipedia. No data collected. No accounts needed.</p>
      </footer>
    </motion.div>
  );
}
