import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, RotateCcw, Home, ChevronLeft } from 'lucide-react';
import ComicPanel from './ComicPanel';
import PanelIndicator from './PanelIndicator';
import './ComicViewer.css';

export default function ComicViewer({ comic, onBack }) {
  const [currentPanel, setCurrentPanel] = useState(0);
  const [direction, setDirection] = useState(1);
  const panels = comic.panels || [];
  const total = panels.length;

  const goNext = useCallback(() => {
    if (currentPanel < total - 1) {
      setDirection(1);
      setCurrentPanel(prev => prev + 1);
    }
  }, [currentPanel, total]);

  const goPrev = useCallback(() => {
    if (currentPanel > 0) {
      setDirection(-1);
      setCurrentPanel(prev => prev - 1);
    }
  }, [currentPanel]);

  const goToPanel = useCallback((index) => {
    setDirection(index > currentPanel ? 1 : -1);
    setCurrentPanel(index);
  }, [currentPanel]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      goNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    } else if (e.key === 'Escape') {
      onBack();
    }
  }, [goNext, goPrev, onBack]);

  const isFirst = currentPanel === 0;
  const isLast = currentPanel === total - 1;

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <motion.div
      className="viewer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="viewer__vignette" />

      <header className="viewer__header">
        <button className="viewer__back" onClick={onBack}>
          <ChevronLeft size={18} />
          <span>Back</span>
        </button>
        <div className="viewer__title-area">
          <h1 className="viewer__title">{comic.title}</h1>
          <span className="viewer__mode-badge">{comic.mode}</span>
        </div>
        <div className="viewer__panel-count">
          {currentPanel + 1} / {total}
        </div>
      </header>

      <main className="viewer__main">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPanel}
            className="viewer__panel-wrapper"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 25,
              duration: 0.5,
            }}
          >
            <ComicPanel
              panel={panels[currentPanel]}
              index={currentPanel}
              total={total}
            />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="viewer__footer">
        <PanelIndicator
          total={total}
          current={currentPanel}
          onSelect={goToPanel}
        />

        <div className="viewer__controls">
          <button
            className="viewer__nav viewer__nav--prev"
            onClick={goPrev}
            disabled={isFirst}
            aria-label="Previous panel"
          >
            <ArrowLeft size={20} />
          </button>

          <button
            className="viewer__nav viewer__nav--next"
            onClick={goNext}
            disabled={isLast}
            aria-label={isLast ? 'End' : 'Next panel'}
          >
            {isLast ? (
              <>
                <RotateCcw size={18} />
                <span>Fin</span>
              </>
            ) : (
              <>
                <span>Next</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>

        <p className="viewer__hint">
          Use arrow keys or click to navigate
        </p>
      </footer>
    </motion.div>
  );
}
