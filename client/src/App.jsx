import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';
import ComicBook from './components/ComicBook';
import LoadingScreen from './components/LoadingScreen';
import FilmGrain from './components/FilmGrain';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function App() {
  const [view, setView] = useState('landing');
  const [comic, setComic] = useState(null);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [lastPrompt, setLastPrompt] = useState('');
  const [lastMode, setLastMode] = useState('education');
  const [lastStyle, setLastStyle] = useState('neo-noir');

  const handleGenerate = async (prompt, mode, depth, style) => {
    setView('loading');
    setError(null);
    setLoadingProgress(0);
    setLastPrompt(prompt);
    setLastMode(mode);
    setLastStyle(style);

    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => prev >= 90 ? prev : prev + Math.random() * 12);
    }, 700);

    try {
      const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, mode, depth, style }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Generation failed');
      }

      const data = await response.json();
      setLoadingProgress(100);
      setTimeout(() => { setComic(data); setView('comic'); }, 400);
    } catch (err) {
      setError(err.message);
      setView('landing');
    } finally {
      clearInterval(progressInterval);
    }
  };

  const handleWhatIf = async (scenario) => {
    setView('loading');
    setLoadingProgress(0);

    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => prev >= 90 ? prev : prev + Math.random() * 14);
    }, 600);

    try {
      const response = await fetch(`${API_URL}/api/generate/what-if`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalPrompt: lastPrompt,
          scenario,
          mode: lastMode,
          style: lastStyle,
        }),
      });

      if (!response.ok) throw new Error('What-if generation failed');

      const data = await response.json();
      setLoadingProgress(100);
      setTimeout(() => { setComic(data); setView('comic'); }, 400);
    } catch (err) {
      setError(err.message);
      setView('comic');
    } finally {
      clearInterval(progressInterval);
    }
  };

  const handleBack = () => {
    setView('landing');
    setComic(null);
  };

  return (
    <>
      <FilmGrain />
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <LandingPage key="landing" onGenerate={handleGenerate} error={error} />
        )}
        {view === 'loading' && (
          <LoadingScreen key="loading" progress={loadingProgress} />
        )}
        {view === 'comic' && comic && (
          <ComicBook
            key="comic"
            comic={comic}
            onBack={handleBack}
            onWhatIf={handleWhatIf}
          />
        )}
      </AnimatePresence>
    </>
  );
}
