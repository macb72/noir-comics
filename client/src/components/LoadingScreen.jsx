import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import './LoadingScreen.css';

const MESSAGES = [
  'Summoning shadows...',
  'Developing the negatives...',
  'Inking the panels...',
  'Setting the scene...',
  'Adjusting the contrast...',
  'Lighting the cigarette...',
  'Following the trail...',
  'Typing the narration...',
];

export default function LoadingScreen({ progress }) {
  const [message, setMessage] = useState(MESSAGES[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="loading__content">
        <div className="loading__visual">
          <div className="loading__spotlight" />
          <div className="loading__silhouette">
            <svg viewBox="0 0 100 120" fill="currentColor">
              <ellipse cx="50" cy="15" rx="12" ry="14" />
              <path d="M30 35 Q50 28 70 35 L75 80 Q50 85 25 80 Z" />
              <path d="M25 80 L20 120 L35 118 L40 85" />
              <path d="M60 85 L65 118 L80 120 L75 80" />
              <path d="M30 45 L5 70 L12 73 L35 52" />
              <path d="M70 45 L95 55 L93 62 L65 52" />
              <ellipse cx="50" cy="3" rx="18" ry="4" />
              <rect x="32" y="0" width="36" height="8" rx="2" />
            </svg>
          </div>
        </div>

        <motion.p
          className="loading__message"
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {message}
        </motion.p>

        <div className="loading__bar-track">
          <motion.div
            className="loading__bar-fill"
            initial={{ width: '0%' }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
}
