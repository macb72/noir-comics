import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Home, ExternalLink } from 'lucide-react';
import ComicPage from './ComicPage';
import './ComicBook.css';

export default function ComicBook({ comic, onBack }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const pages = comic.pages || [];
  const total = pages.length;

  const goNext = useCallback(() => {
    if (currentPage < total - 1) {
      setDirection(1);
      setCurrentPage(p => p + 1);
    }
  }, [currentPage, total]);

  const goPrev = useCallback(() => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage(p => p - 1);
    }
  }, [currentPage]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
    else if (e.key === 'Escape') onBack();
  }, [goNext, goPrev, onBack]);

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <motion.div
      className="book"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <header className="book__header">
        <button className="book__back" onClick={onBack}>
          <Home size={16} />
          <span>New Story</span>
        </button>

        <div className="book__title-block">
          <h1 className="book__title">{comic.title}</h1>
          <div className="book__meta">
            <span className="book__badge">{comic.mode}</span>
            {comic.source === 'Wikipedia' && (
              <a
                className="book__source"
                href={comic.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={11} />
                Source: Wikipedia
              </a>
            )}
          </div>
        </div>

        <div className="book__page-info">
          Page {currentPage + 1} of {total}
        </div>
      </header>

      <main className="book__main">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPage}
            className="book__page-container"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 180, damping: 24 }}
          >
            <ComicPage
              page={pages[currentPage]}
              pageIndex={currentPage}
              totalPages={total}
            />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="book__footer">
        <div className="book__nav-row">
          <button
            className="book__nav book__nav--prev"
            onClick={goPrev}
            disabled={currentPage === 0}
          >
            <ChevronLeft size={20} />
            Prev
          </button>

          <div className="book__dots">
            {pages.map((_, i) => (
              <button
                key={i}
                className={`book__dot ${i === currentPage ? 'book__dot--active' : ''} ${i < currentPage ? 'book__dot--done' : ''}`}
                onClick={() => { setDirection(i > currentPage ? 1 : -1); setCurrentPage(i); }}
                aria-label={`Page ${i + 1}`}
              />
            ))}
          </div>

          <button
            className="book__nav book__nav--next"
            onClick={goNext}
            disabled={currentPage === total - 1}
          >
            Next
            <ChevronRight size={20} />
          </button>
        </div>
        <p className="book__hint">Arrow keys to navigate pages</p>
      </footer>
    </motion.div>
  );
}
