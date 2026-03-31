import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Newspaper, Feather, Zap, ChevronRight, RefreshCw, Palette } from 'lucide-react';
import './LandingPage.css';

const MODES = [
  { id: 'education', label: 'Explain', icon: BookOpen, desc: 'Learn anything visually' },
  { id: 'news', label: 'News', icon: Newspaper, desc: 'Today in 4 panels' },
  { id: 'story', label: 'Story', icon: Feather, desc: 'Creative fiction' },
];

const DEPTHS = [
  { id: 'kid', label: 'ELI10' },
  { id: 'normal', label: 'Normal' },
  { id: 'expert', label: 'Expert' },
  { id: 'quick', label: 'Quick (4)' },
];

const STYLES = [
  { id: 'neo-noir', label: 'Neo Noir', colors: ['#0a0a0a', '#1a1020', '#d4a853'] },
  { id: 'bw-silhouette', label: 'B&W Silhouette', colors: ['#000000', '#222222', '#ffffff'] },
  { id: 'colorful', label: 'Colorful Comic', colors: ['#1a1a2e', '#e94560', '#ffb830'] },
];

const ALL_SUGGESTIONS = [
  { text: 'The Big Bang and birth of the universe', mode: 'education' },
  { text: 'How do black holes actually work?', mode: 'education' },
  { text: 'The Cuban Missile Crisis', mode: 'education' },
  { text: 'The origin story of Apple Inc.', mode: 'education' },
  { text: 'The fall of the Roman Empire', mode: 'education' },
  { text: 'How does quantum computing work?', mode: 'education' },
  { text: 'The French Revolution', mode: 'education' },
  { text: 'How vaccines were invented', mode: 'education' },
  { text: 'The sinking of the Titanic', mode: 'education' },
  { text: 'How the internet was created', mode: 'education' },
  { text: 'The space race between US and USSR', mode: 'education' },
  { text: 'How DNA was discovered', mode: 'education' },
  { text: 'The Manhattan Project', mode: 'education' },
  { text: 'How Bitcoin and blockchain work', mode: 'education' },
  { text: 'The assassination of Julius Caesar', mode: 'education' },
  { text: 'How electricity was harnessed', mode: 'education' },
  { text: 'The Chernobyl disaster', mode: 'education' },
  { text: 'How artificial intelligence evolved', mode: 'education' },
  { text: 'A heist at the Louvre Museum', mode: 'story' },
  { text: 'What if dinosaurs never went extinct?', mode: 'story' },
  { text: 'A detective chasing a time traveler', mode: 'story' },
  { text: 'The last human on Mars', mode: 'story' },
  { text: 'What if the Library of Alexandria survived?', mode: 'story' },
  { text: 'A spy during the Cold War discovers a secret', mode: 'story' },
  { text: 'What if Rome never fell?', mode: 'story' },
  { text: 'A noir mystery in a cyberpunk city', mode: 'story' },
  { text: 'Rise of AI and its impact on society', mode: 'news' },
  { text: 'Climate change and extreme weather events', mode: 'news' },
  { text: 'The global race for quantum supremacy', mode: 'news' },
  { text: 'Space exploration milestones in 2026', mode: 'news' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function LandingPage({ onGenerate, error }) {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState('education');
  const [depth, setDepth] = useState('normal');
  const [style, setStyle] = useState('neo-noir');
  const [showOptions, setShowOptions] = useState(false);
  const [suggestions, setSuggestions] = useState(() => shuffle(ALL_SUGGESTIONS).slice(0, 6));

  const refreshSuggestions = useCallback(() => {
    setSuggestions(shuffle(ALL_SUGGESTIONS).slice(0, 6));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) onGenerate(prompt, mode, depth, style);
  };

  const handleSuggestion = (s) => {
    setPrompt(s.text);
    setMode(s.mode);
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
            immersive comic — sourced from Wikipedia, rendered as a graphic novel.
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
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
              }}
            />
            <button type="submit" className="landing__submit" disabled={!prompt.trim()}>
              <Zap size={18} />
              Generate
            </button>
          </div>

          {error && (
            <motion.div className="landing__error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              {error}
            </motion.div>
          )}

          <button
            type="button"
            className="landing__toggle-options"
            onClick={() => setShowOptions(!showOptions)}
          >
            <ChevronRight size={14} className={`landing__chevron ${showOptions ? 'landing__chevron--open' : ''}`} />
            Options &amp; Style
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
                      key={m.id} type="button"
                      className={`landing__mode ${mode === m.id ? 'landing__mode--active' : ''}`}
                      onClick={() => setMode(m.id)}
                    >
                      <m.icon size={16} /><span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="landing__option-group">
                <label className="landing__option-label">Depth</label>
                <div className="landing__depths">
                  {DEPTHS.map(d => (
                    <button
                      key={d.id} type="button"
                      className={`landing__depth ${depth === d.id ? 'landing__depth--active' : ''}`}
                      onClick={() => setDepth(d.id)}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="landing__option-group">
                <label className="landing__option-label">
                  <Palette size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />
                  Art Style
                </label>
                <div className="landing__styles">
                  {STYLES.map(s => (
                    <button
                      key={s.id} type="button"
                      className={`landing__style ${style === s.id ? 'landing__style--active' : ''}`}
                      onClick={() => setStyle(s.id)}
                    >
                      <div className="landing__style-swatch">
                        {s.colors.map((c, i) => (
                          <span key={i} style={{ background: c }} />
                        ))}
                      </div>
                      <span>{s.label}</span>
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
          <div className="landing__suggestions-header">
            <p className="landing__suggestions-label">Try these:</p>
            <button className="landing__refresh" onClick={refreshSuggestions} aria-label="Refresh suggestions">
              <RefreshCw size={13} />
            </button>
          </div>
          <div className="landing__suggestions-grid">
            {suggestions.map((s, i) => (
              <button key={`${s.text}-${i}`} className="landing__suggestion" onClick={() => handleSuggestion(s)}>
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
