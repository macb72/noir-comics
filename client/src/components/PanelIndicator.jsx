import { motion } from 'framer-motion';
import './PanelIndicator.css';

export default function PanelIndicator({ total, current, onSelect }) {
  return (
    <div className="indicator">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          className={`indicator__dot ${i === current ? 'indicator__dot--active' : ''} ${i < current ? 'indicator__dot--done' : ''}`}
          onClick={() => onSelect(i)}
          aria-label={`Go to panel ${i + 1}`}
        >
          {i === current && (
            <motion.div
              className="indicator__pulse"
              layoutId="panelPulse"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
